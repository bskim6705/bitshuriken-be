import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { Prisma, OpenOrder, OrderStatus } from '@prisma/client-spot';
import {
  OpenOrderRepository,
  CreateOpenOrderParams,
} from './open-order.repository';

@Injectable()
export class OpenOrderService {
  constructor(private readonly repo: OpenOrderRepository) {}

  /**
   * Create a new open order record.
   */
  create(data: CreateOpenOrderParams): Promise<OpenOrder> {
    return this.repo.create(data);
  }

  /**
   * List OPEN/PARTIAL orders for a user, optionally filtered by symbol.
   */
  findOpen(userId: number, symbol?: string): Promise<OpenOrder[]> {
    return this.repo.findOpen(userId, symbol);
  }

  findById(orderId: string): Promise<OpenOrder | null> {
    return this.repo.findById(orderId);
  }

  /**
   * Update order status.
   */
  updateStatus(orderId: string, status: OrderStatus): Promise<OpenOrder> {
    return this.repo.updateStatus(orderId, status);
  }

  /**
   * Adjust remaining quantity in the positive direction (increase).
   */
  incrementRemaining(orderId: string, amount: Decimal): Promise<OpenOrder> {
    this.assertPositive(amount);
    return this.repo.incrementRemaining(orderId, amount);
  }

  /**
   * Adjust remaining quantity in the negative direction (decrease).
   */
  decrementRemaining(orderId: string, amount: Decimal): Promise<OpenOrder> {
    this.assertPositive(amount);
    return this.repo.decrementRemaining(orderId, amount);
  }

  /**
   * Update remaining quantity within a provided Prisma transaction.
   */
  updateRemainingTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    remaining: Decimal,
  ): Promise<OpenOrder> {
    return this.repo.updateRemainingTx(tx, orderId, remaining);
  }

  /**
   * Increase remaining quantity within an existing Prisma transaction.
   */
  incrementRemainingTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    amount: Decimal,
  ): Promise<OpenOrder> {
    this.assertPositive(amount);
    return this.repo.incrementRemainingTx(tx, orderId, amount);
  }

  /**
   * Decrease remaining quantity within an existing Prisma transaction.
   */
  decrementRemainingTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    amount: Decimal,
  ): Promise<OpenOrder> {
    this.assertPositive(amount);
    return this.repo.decrementRemainingTx(tx, orderId, amount);
  }

  /**
   * Update order status within a provided Prisma transaction.
   */
  updateStatusTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    status: OrderStatus,
  ): Promise<OpenOrder> {
    return this.repo.updateStatusTx(tx, orderId, status);
  }

  /* ------------------------------------------------------------------ */
  /* Raw single-query trade application                                  */
  /* ------------------------------------------------------------------ */
  applyTradeRaw(params: {
    makerOrderId: string;
    takerOrderId: string;
    makerRemainingDelta: Decimal;
    takerRemainingDelta: Decimal;
    makerStatus: OrderStatus;
    takerStatus: OrderStatus;
  }): Promise<void> {
    this.assertPositive(params.makerRemainingDelta);
    this.assertPositive(params.takerRemainingDelta);
    return this.repo.applyTradeRaw(params);
  }

  /* ------------------------------------------------------------------ */
  private assertPositive(value: Decimal) {
    if (!(value instanceof Decimal))
      throw new Error('Amount must be a Decimal');
    if (value.lte(0)) throw new Error('Amount must be positive');
  }
}
