import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * maker/taker 공통 구조 정의
 */
class TradeUser {
  @Prop({ enum: ['SELL', 'BUY'], required: true })
  side: 'SELL' | 'BUY';

  @Prop({ required: true })
  userId: number;
}

/**
 * trade_logs와 동일한 Trade 구조 (독립적으로 정의)
 */
class TradeEmbedded {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop({ type: TradeUser, required: true })
  maker: TradeUser;

  @Prop({ type: TradeUser, required: true })
  taker: TradeUser;
}

@Schema({
  collection: 'failed_trade_logs',
  timestamps: { createdAt: true, updatedAt: false },
})
export class FailedTradeLog extends Document {
  @Prop({ type: TradeEmbedded, required: true })
  trade: TradeEmbedded;

  @Prop({ required: true })
  reason: string;

  @Prop()
  createdAt: Date;
}

export const FailedTradeLogSchema =
  SchemaFactory.createForClass(FailedTradeLog);
export type FailedTradeLogDocument = FailedTradeLog & Document;
