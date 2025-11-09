import { Injectable } from '@nestjs/common';
import { Precision } from '@libs/utils/precision';

import { BalanceService } from '../balance/balance.service';
import { PairService } from '../pair/pair.service';
import { FeeRepository } from './fee.repository';

export interface ApplyFeeDto {
  userId: number;
  symbol: string; // BTCUSDT
  side: 'MAKER' | 'TAKER';
  price: number;
  qty: number;
}

@Injectable()
export class FeeService {
  constructor(
    private readonly balanceService: BalanceService,
    private readonly pairService: PairService,
    private readonly feeRepo: FeeRepository,
  ) {}

  async applyFee(dto: ApplyFeeDto) {
    const pair = await this.pairService.findBySymbol(dto.symbol);
    if (!pair) throw new Error('Invalid pair');

    const rates = await this.feeRepo.resolveFeeRates(dto.userId, pair.id);
    const rate = dto.side === 'MAKER' ? rates.makerRate : rates.takerRate;

    // Fee charged in base asset for maker, quote asset for taker
    const feeCurrency =
      dto.side === 'MAKER' ? pair.baseCurrencyCode : pair.quoteCurrencyCode;
    const feeAmount =
      dto.side === 'MAKER'
        ? dto.qty * Number(rate)
        : dto.price * dto.qty * Number(rate);

    await this.balanceService.debit(
      dto.userId,
      feeCurrency,
      Precision.decimal(feeAmount),
    );
    // TODO: credit exchange revenue account later
    return { feeAmount, feeCurrency, rate };
  }
}
