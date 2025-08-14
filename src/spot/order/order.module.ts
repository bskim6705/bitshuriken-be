import { Module } from '@nestjs/common';
import { OrderHttpController } from './order.http.controller';
import { OrderWsGateway } from './order.ws.gateway';
import { OrderCancellationConsumer } from './order-cancellation.consumer';
import { OrderService } from './order.service';
import { OrderbookModule } from '../orderbook/orderbook.module';
import { BalanceModule } from '../balance/balance.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PairModule } from '../pair/pair.module';
import { OpenOrderModule } from '../open-order/open-order.module';

@Module({
  imports: [
    OrderbookModule,
    BalanceModule,
    PrismaModule,
    PairModule,
    OpenOrderModule,
  ],
  controllers: [OrderHttpController],
  providers: [OrderWsGateway, OrderService, OrderCancellationConsumer],
})
export class OrderModule {}
