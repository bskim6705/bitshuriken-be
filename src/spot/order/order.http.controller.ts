import { Body, Controller, Post, Get, Query, Delete } from '@nestjs/common';
import { CancelOrderDto } from './dto/cancel-order.dto.js';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderHttpController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<{ ack: true; orderId: string }> {
    return this.orderService.placeOrder(dto);
  }

  /**
   * Retrieve open orders for a user & symbol.
   * Example: GET /orders/open?userId=1&symbol=BTCUSDT
   */
  @Get('open')
  async open(@Query('userId') userId: string, @Query('symbol') symbol: string) {
    return this.orderService.getOpenOrders(Number(userId), symbol);
  }

  /**
   * Cancel an existing order.
   * Example payload: { "userId": 1, "orderId": "..." }
   */
  @Delete()
  async cancel(@Body() dto: CancelOrderDto): Promise<{ ack: true }> {
    return this.orderService.cancelOrder(dto);
  }
}
