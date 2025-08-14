import { Injectable } from '@nestjs/common';
import { PrecisionService } from '../precision/precision.service';

import { BalanceRepository } from '../repository/balance.repository';
@Injectable()
export class WalletService {
  constructor(
    private readonly balanceRepo: BalanceRepository,
    private readonly precisionService: PrecisionService,
  ) {}

  deposit(userId: number, currencyCode: string, amount: number) {
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      this.precisionService.decimal(amount),
      this.precisionService.decimal(0),
    );
  }

  withdraw(userId: number, currencyCode: string, amount: number) {
    // Debit lowers available; implementation relies on BalanceRepository to allow negative checks later
    return this.balanceRepo.upsertBalance(
      userId,
      currencyCode,
      this.precisionService.decimal(-amount),
      this.precisionService.decimal(0),
    );
  }
}
