import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

export interface FeeRate {
  makerRate: Decimal;
  takerRate: Decimal;
}

@Injectable()
export class FeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve fee rates with the precedence:
   * (userId,pairId) override -> (userId, null) -> (null,pairId) -> default per pair
   */
  async resolveFeeRates(userId: number, pairId: number): Promise<FeeRate> {
    // user+pair
    const override = await this.prisma.tradeFee.findUnique({
      where: { userId_pairId: { userId, pairId } },
    });
    if (override)
      return { makerRate: override.makerRate, takerRate: override.takerRate };

    // pair default
    const pairDef = await this.prisma.tradeFeeDefault.findUnique({
      where: { pairId },
    });
    if (pairDef)
      return { makerRate: pairDef.makerRate, takerRate: pairDef.takerRate };

    // fallback platform default
    return { makerRate: new Decimal(0.001), takerRate: new Decimal(0.001) };
  }
}
