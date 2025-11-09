import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client-spot';
import { BalanceRepository } from './balance.repository';
import { Precision } from '@libs/utils/precision';
import Decimal from 'decimal.js';

/**
 * Service responsible for wallet balance operations.
 */
@Injectable()
export class BalanceService {
  constructor(
    private readonly balanceRepo: BalanceRepository,
  ) { }

  /* --------------------------- Query helpers ------------------------ */
  getBalance(userId: number, currencyCode: string) {
    return this.balanceRepo.findBalance(userId, currencyCode);
  }

  /* --------------------------- Standalone ops ----------------------- */
  credit(userId: number, currencyCode: string, amount: Decimal) {
    this.assertPositive(amount);
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      amount,
      Precision.decimal(0),
    );
  }

  debit(userId: number, currencyCode: string, amount: Decimal) {
    this.assertPositive(amount);
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      amount.negated(),
      Precision.decimal(0),
    );
  }

  lock(userId: number, currencyCode: string, amount: Decimal) {
    this.assertPositive(amount);
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      amount.negated(),
      amount,
    );
  }

  unlock(userId: number, currencyCode: string, amount: Decimal) {
    this.assertPositive(amount);
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      amount,
      amount.negated(),
    );
  }

  adjustLocked(userId: number, currencyCode: string, lockedDelta: Decimal) {
    if (Number(lockedDelta) === 0) return;
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      Precision.decimal(0),
      lockedDelta,
    );
  }

  /* --------------------------- Tx wrappers -------------------------- */
  creditTx(
    tx: Prisma.TransactionClient,
    userId: number,
    currencyCode: string,
    amount: Decimal,
  ) {
    this.assertPositive(amount);
    return this.balanceRepo.upsertBalanceTx(
      tx,
      userId,
      currencyCode,
      amount,
      Precision.decimal(0),
    );
  }

  adjustLockedTx(
    tx: Prisma.TransactionClient,
    userId: number,
    currencyCode: string,
    lockedDelta: Decimal,
  ) {
    if (lockedDelta.eq(0)) return Promise.resolve();
    return this.balanceRepo.upsertBalanceTx(
      tx,
      userId,
      currencyCode,
      Precision.decimal(0),
      lockedDelta,
    );
  }

  /* ------------------------------------------------------------------ */
  /* Batch helpers                                                       */
  /* ------------------------------------------------------------------ */
  /**
   * Applies an array of delta messages in a single SQL upsert using the repository.
   * unlockBalance -> available += x, locked -= x
   * creditBalance -> available += x
   * debitBalance  -> available -= x
   */
  async applyBatchDeltaMessages(
    messages: Array<{
      userId: number;
      currencyCode: string;
      unlockBalance?: string;
      creditBalance?: string;
      debitBalance?: string;
    }>,
  ): Promise<void> {
    if (!messages.length) return;

    type Key = string;
    const aggregate: Map<
      Key,
      {
        userId: number;
        currencyCode: string;
        availableDelta: Decimal;
        lockedDelta: Decimal;
      }
    > = new Map();

    for (const msg of messages) {
      const key = `${msg.userId}:${msg.currencyCode}`;
      let entry = aggregate.get(key);
      if (!entry) {
        entry = {
          userId: msg.userId,
          currencyCode: msg.currencyCode,
          availableDelta: Precision.decimal(0),
          lockedDelta: Precision.decimal(0),
        };
        aggregate.set(key, entry);
      }

      if (msg.unlockBalance) {
        const v = Precision.decimal(msg.unlockBalance);
        entry.availableDelta = entry.availableDelta.add(v);
        entry.lockedDelta = entry.lockedDelta.sub(v);
      }
      if (msg.creditBalance) {
        const v = Precision.decimal(msg.creditBalance);
        entry.availableDelta = entry.availableDelta.add(v);
      }
      if (msg.debitBalance) {
        const v = Precision.decimal(msg.debitBalance);
        entry.availableDelta = entry.availableDelta.sub(v);
      }
    }

    const rows = Array.from(aggregate.values()).filter(
      (r) => !r.availableDelta.eq(0) || !r.lockedDelta.eq(0),
    );

    await this.balanceRepo.bulkUpsertDeltas(rows);
  }
  private assertPositive(value: Decimal) {
    if (!(value instanceof Decimal))
      throw new Error('Amount must be a Decimal');
    if (value.lte(0)) throw new Error('Amount must be positive');
  }
}
