import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FuturesKlineService } from './kline.service';
import { FuturesKafkaModule } from '../kafka/kafka.module';
import { Candle, CandleSchema } from '../../../mongoose/schema/candles';
import { CandleRepository } from '../repository/candle.repository';
import { PrecisionService } from '../../precision/precision.service';
import { FuturesKlineController } from './kline.controller';

@Module({
  imports: [
    FuturesKafkaModule,
    MongooseModule.forFeature([{ name: Candle.name, schema: CandleSchema }]),
  ],
  controllers: [FuturesKlineController],
  providers: [FuturesKlineService, CandleRepository, PrecisionService],
})
export class FuturesKlineModule {}
