import { randomUUID } from 'crypto';
import Decimal from 'decimal.js';

import { Injectable } from '@nestjs/common';
import { PrecisionService } from '../precision/precision.service';
import { Order } from '../types';

import { CreateOrderDto, OrderSide, OrderType } from './dto/create-order.dto';
import { KafkaService } from '../kafka/kafka.service';
import { BalanceService } from '../balance/balance.service';
import { PairService } from '../pair/pair.service';
import { OpenOrderService } from '../open-order/open-order.service';
import { CancelOrderDto } from './dto/cancel-order.dto';

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

export interface MakerTakerInfo {
  orderId: string;
  side: OrderSide;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly balanceService: BalanceService,
    private readonly pairService: PairService,
    private readonly precisionService: PrecisionService,
    private readonly openOrderService: OpenOrderService,
  ) {}

  async placeOrder(
    dto: CreateOrderDto,
  ): Promise<{ ack: true; orderId: string }> {
    // 1. Fetch pair info to know base/quote assets
    const pair = await this.pairService.findBySymbol(dto.symbol);
    if (!pair) {
      throw new Error('Invalid trading pair');
    }

    // 2. Determine currency to lock and amount based on BUY/SELL
    let lockCurrency: string;
    let lockAmount: Decimal;
    if (dto.side === OrderSide.BUY) {
      if (!dto.price) throw new Error('Price required for BUY lock');
      lockCurrency = pair.quoteCurrencyCode;
      lockAmount = this.precisionService.multiply(dto.price, dto.qty);
    } else {
      lockCurrency = pair.baseCurrencyCode;
      lockAmount = this.precisionService.decimal(dto.qty);
    }

    // 3. Lock funds
    await this.balanceService.lock(dto.userId, lockCurrency, lockAmount);

    const orderId = randomUUID();
    const order: OrderPayload = {
      userId: dto.userId,
      orderId,
      symbol: dto.symbol,
      side: dto.side,
      type: dto.type,
      price: dto.price,
      qty: dto.qty,
      baseCurrencyCode: pair.baseCurrencyCode,
      quoteCurrencyCode: pair.quoteCurrencyCode,
    };

    let r: Decimal;
    if (
      dto.side === OrderSide.BUY &&
      dto.type !== OrderType.MARKET &&
      dto.price
    ) {
      r = this.precisionService.multiply(dto.price, dto.qty);
    } else {
      r = this.precisionService.decimal(dto.qty);
    }

    // 4. Persist open order record
    await this.openOrderService.create({
      orderId,
      userId: dto.userId,
      pairId: pair.id,
      side: dto.side,
      type: dto.type,
      price: dto.price,
      qty: dto.qty,
      remaining: r,
    });

    // TODO: validate order
    // ex) user auth, user wallet, order validation, etc.

    await this.kafkaService.sendOrder({ ...order, userId: dto.userId });
    return { ack: true, orderId: order.orderId };
  }

  /**
   * Returns all open orders for the given user & symbol by scanning the Redis orderbook.
   */
  async getOpenOrders(userId: number, symbol: string) {
    return this.openOrderService.findOpen(userId, symbol);
  }

  /**
   * Sends a cancellation event via Kafka.
   */
  async cancelOrder(dto: CancelOrderDto): Promise<{ ack: true }> {
    const pair = await this.pairService.findBySymbol(dto.symbol);
    if (!pair) {
      throw new Error('Invalid trading pair');
    }

    await this.kafkaService.sendOrderCancellation({
      userId: dto.userId,
      symbol: dto.symbol,
      orderId: dto.orderId,
      baseCurrencyCode: pair.baseCurrencyCode,
      quoteCurrencyCode: pair.quoteCurrencyCode,
    });
    return { ack: true };
  }
}
