import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KlineService } from './kline.service';
import { KafkaModule } from '../kafka/kafka.module';
import { Candle, CandleSchema } from '../../../mongoose/schema/candles';
import { CandleRepository } from '../repository/candle.repository';
import { KlineController } from './kline.controller';

@Module({
  imports: [
    KafkaModule,
    MongooseModule.forFeature([{ name: Candle.name, schema: CandleSchema }]),
  ],
  controllers: [KlineController],
  providers: [KlineService, CandleRepository],
})
export class KlineModule {}
