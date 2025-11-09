import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TradeLog,
  TradeLogDocument,
} from '../../../mongoose/schema/trade_logs';
import {
  FailedTradeLog,
  FailedTradeLogDocument,
} from '../../../mongoose/schema/failed_trade_logs';
import { Trade } from '../types';

@Injectable()
export class TradeLogRepository {
  constructor(
    @InjectModel(TradeLog.name)
    private readonly tradeLogModel: Model<TradeLogDocument>,
    @InjectModel(FailedTradeLog.name)
    private readonly failedTradeLogModel: Model<FailedTradeLogDocument>,
  ) {}

  async logSuccess(trade: Trade) {
    await this.tradeLogModel.create({ ...trade, createdAt: trade.timestamp });
  }

  async logFailure(trade: Trade, reason: string) {
    await this.failedTradeLogModel.create({
      trade,
      reason,
      createdAt: trade.timestamp,
    });
  }
}
