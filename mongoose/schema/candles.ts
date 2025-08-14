import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Candle schema represents a single candlestick (OHLCV) for a symbol & interval.
 * Currently we only store 1-second interval ("1S"), but keeping the interval
 * allows easy extension to longer periods in the future.
 */
@Schema({
  collection: 'candles',
  timestamps: false, // we explicitly store start & end time
})
export class Candle extends Document {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  open: string;

  @Prop({ required: true })
  high: string;

  @Prop({ required: true })
  low: string;

  @Prop({ required: true })
  close: string;

  @Prop({ required: true })
  volume: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;
}

export const CandleSchema = SchemaFactory.createForClass(Candle);
export type CandleDocument = Candle & Document;
