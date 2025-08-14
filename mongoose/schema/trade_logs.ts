// trade-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class TradeUser {
  @Prop({ enum: ['SELL', 'BUY'], required: true })
  side: 'SELL' | 'BUY';

  @Prop({ required: true })
  userId: number;
}

@Schema({
  collection: 'trade_logs',
  timestamps: { createdAt: true, updatedAt: false },
})
export class TradeLog extends Document {
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

  @Prop()
  createdAt: Date;
}

export const TradeLogSchema = SchemaFactory.createForClass(TradeLog);
export type TradeLogDocument = TradeLog & Document;
