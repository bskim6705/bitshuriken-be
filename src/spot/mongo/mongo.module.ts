import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoService } from './mongo.service';
import { TradeLog, TradeLogSchema } from '../../../mongoose/schema/trade_logs';
import {
  FailedTradeLog,
  FailedTradeLogSchema,
} from '../../../mongoose/schema/failed_trade_logs';

@Global()
@Module({
  imports: [
    // Use environment variable MONGO_URI for connection string
    MongooseModule.forRoot(process.env.MONGO_URI ?? '', {
      // You can customize mongoose options here
      // For example: connectionFactory: (connection) => connection,
    }),
    MongooseModule.forFeature([
      { name: TradeLog.name, schema: TradeLogSchema },
      { name: FailedTradeLog.name, schema: FailedTradeLogSchema },
    ]),
  ],
  providers: [MongoService],
  exports: [MongoService, MongooseModule],
})
export class MongoModule {}
