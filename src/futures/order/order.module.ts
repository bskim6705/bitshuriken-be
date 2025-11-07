import { Module } from '@nestjs/common';
import { OrderService } from './order.service';

@Module({
  imports: [],
  controllers: [],
  providers: [OrderService],
})
export class OrderModule {}
