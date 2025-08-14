import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candle, CandleDocument } from '../../../mongoose/schema/candles';

@Injectable()
export class CandleRepository {
  constructor(
    @InjectModel(Candle.name)
    private readonly candleModel: Model<CandleDocument>,
  ) {}

  /**
   * Persist a candle document.
   * @param candle Partial candle object (required fields enforced by schema)
   */
  async create(candle: Partial<Candle>): Promise<void> {
    await this.candleModel.create(candle);
  }

  /**
   * Find candles for a symbol within a time range. Results sorted by startTime.
   */
  async findRange(params: {
    symbol: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
    sortAsc?: boolean;
  }): Promise<CandleDocument[]> {
    const { symbol, startTime, endTime, limit, sortAsc = true } = params;
    const query: Record<string, unknown> = { symbol };
    if (startTime || endTime) {
      query.startTime = {} as Record<string, unknown>;
      if (startTime) {
        (query.startTime as Record<string, unknown>).$gte = startTime;
      }
      if (endTime) {
        (query.startTime as Record<string, unknown>).$lte = endTime;
      }
    }

    return this.candleModel
      .find(query)
      .sort({ startTime: sortAsc ? 1 : -1 })
      .limit(limit ?? 0)
      .exec();
  }
}
