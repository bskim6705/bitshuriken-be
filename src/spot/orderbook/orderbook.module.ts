import { Module } from '@nestjs/common';
import { OrderbookService } from './orderbook.service';
import { OrderbookWsGateway } from './orderbook.ws.gateway';

@Module({
  providers: [OrderbookService, OrderbookWsGateway],
  exports: [OrderbookService, OrderbookWsGateway],
})
export class OrderbookModule {}
