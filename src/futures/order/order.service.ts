import { Injectable } from '@nestjs/common';
// import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '../types';

export interface OrderPayload extends Order {
  baseCurrencyCode: string;
  quoteCurrencyCode: string;
}

export interface CancelPayload {
  userId: number;
  symbol: string;
  orderId: string;
  baseCurrencyCode: string;
  quoteCurrencyCode: string;
}

@Injectable()
export class OrderService {
  constructor() {}

  // async placeOrder(
  //   dto: CreateOrderDto,
  // ): Promise<{ ack: true; orderId: string }> {
  //   return { ack: true, orderId: '123' };
  // }
}
