import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrderService } from './order.service';
import { Server } from 'ws';

@WebSocketGateway() // default port & namespace
export class OrderWsGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly orderService: OrderService) {}

  @SubscribeMessage('placeOrder')
  async handlePlaceOrder(
    @MessageBody() dto: CreateOrderDto,
  ): Promise<{ ack: true; orderId: string }> {
    return this.orderService.placeOrder(dto);
  }

  @SubscribeMessage('cancelOrder')
  async handleCancelOrder(
    @MessageBody() dto: CancelOrderDto,
  ): Promise<{ ack: true }> {
    return this.orderService.cancelOrder(dto);
  }
}
