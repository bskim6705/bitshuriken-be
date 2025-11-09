import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { TradeService } from './trade.service';
import { BalanceModule } from '../balance/balance.module';
import { PairModule } from '../pair/pair.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MongoModule } from '../mongo/mongo.module';
import { TradeLogRepository } from './trade-log.repository';
import { OpenOrderModule } from '../open-order/open-order.module';
import { TradeWsGateway } from './trade.ws.gateway';

@Module({
  imports: [
    KafkaModule,
    BalanceModule,
    PairModule,
    PrismaModule,
    MongoModule,
    OpenOrderModule,
  ],
  providers: [TradeService, TradeLogRepository, TradeWsGateway],
})
export class TradeModule {}
