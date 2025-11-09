import { Injectable } from '@nestjs/common';
import { Precision } from '@libs/utils/precision';

import { BalanceRepository } from '../repository/balance.repository';
@Injectable()
export class WalletService {
  constructor(
    private readonly balanceRepo: BalanceRepository,
  ) { }

  deposit(userId: number, currencyCode: string, amount: number) {
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      Precision.decimal(amount),
      Precision.decimal(0),
    );
  }

  withdraw(userId: number, currencyCode: string, amount: number) {
    // Debit lowers available; implementation relies on BalanceRepository to allow negative checks later
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      Precision.decimal(-amount),
      Precision.decimal(0),
    );
  }
}
