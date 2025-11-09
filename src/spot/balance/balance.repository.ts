import { Injectable } from '@nestjs/common';
import { Precision } from '@libs/utils/precision';

import { PrismaService } from '../prisma/prisma.service';
import { Balance, Prisma } from '@prisma/client-spot';
import Decimal from 'decimal.js';

@Injectable()
export class BalanceRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  /* ------------------------------------------------------------------ */
  /* Helper methods                                                    */
  /* ------------------------------------------------------------------ */
  private D(d: Decimal.Value): Decimal {
    return Precision.decimal(d);
  }

  /* ------------------------------------------------------------------ */
  /* Read helpers                                                       */
  /* ------------------------------------------------------------------ */
  findBalance(userId: number, currencyCode: string): Promise<Balance | null> {
    return this.prisma.balance.findUnique({
      where: { userId_currencyCode: { userId, currencyCode } },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Upsert helpers (direct)                                             */
  /* ------------------------------------------------------------------ */
  upsertBalance(
    userId: number,
    currencyCode: string,
    availableDelta: Decimal,
    lockedDelta: Decimal,
  ): Promise<Balance> {
    return this.prisma.balance.upsert({
      where: { userId_currencyCode: { userId, currencyCode } },
      create: {
        userId,
        currencyCode,
        available: this.D(availableDelta),
        locked: this.D(lockedDelta),
      },
      update: {
        available: { increment: this.D(availableDelta) },
        locked: { increment: this.D(lockedDelta) },
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Upsert within EXISTING Prisma Tx                                   */
  /* ------------------------------------------------------------------ */
  upsertBalanceTx(
    tx: Prisma.TransactionClient,
    userId: number,
    currencyCode: string,
    availableDelta: Decimal,
    lockedDelta: Decimal,
  ): Promise<Balance> {
    return tx.balance.upsert({
      where: { userId_currencyCode: { userId, currencyCode } },
      create: {
        userId,
        currencyCode,
        available: this.D(availableDelta),
        locked: this.D(lockedDelta),
      },
      update: {
        available: { increment: this.D(availableDelta) },
        locked: { increment: this.D(lockedDelta) },
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Bulk upsert using single SQL statement                              */
  /* ------------------------------------------------------------------ */
  async bulkUpsertDeltas(
    rows: Array<{
      userId: number;
      currencyCode: string;
      availableDelta: Decimal;
      lockedDelta: Decimal;
    }>,
  ): Promise<void> {
    if (!rows.length) return;

    const now = Prisma.sql`NOW(3)`;
    const values = rows.map(
      (r) =>
        Prisma.sql`(${r.userId}, ${r.currencyCode}, ${this.D(
          r.availableDelta,
        )}, ${this.D(r.lockedDelta)}, ${now})`,
    );

    const query = Prisma.sql`
      INSERT INTO \`Balance\` (userId, currencyCode, available, locked, updatedAt)
      VALUES ${Prisma.join(values)}
      ON DUPLICATE KEY UPDATE
        available = available + VALUES(available),
        locked = locked + VALUES(locked),
        updatedAt = ${now};
    `;

    await this.prisma.$executeRaw(query);
  }
}
