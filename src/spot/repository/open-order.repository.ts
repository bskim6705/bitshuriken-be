import { Injectable } from '@nestjs/common';
import { Precision } from '@libs/utils/precision';

import { PrismaService } from '../prisma/prisma.service';
import {
  OpenOrder,
  OrderStatus,
  OrderSide,
  OrderType,
  Prisma,
} from '@prisma/client-spot';
import Decimal from 'decimal.js';

export interface CreateOpenOrderParams {
  orderId: string;
  userId: number;
  pairId: number;
  side: OrderSide;
  type: OrderType;
  price?: Decimal.Value; // undefined for MARKET
  qty: Decimal.Value;
  remaining: Decimal.Value;
}

@Injectable()
export class OpenOrderRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  /* ------------------------------------------------------------------ */
  /* Helper methods                                                    */
  /* ------------------------------------------------------------------ */
  private D(d: Decimal.Value): Decimal {
    return Precision.decimal(d);
  }

  /* ------------------------------------------------------------------ */
  /* Create                                                             */
  /* ------------------------------------------------------------------ */
  create(data: CreateOpenOrderParams): Promise<OpenOrder> {
    return this.prisma.openOrder.create({
      data: {
        orderId: data.orderId,
        userId: data.userId,
        pairId: data.pairId,
        side: data.side,
        type: data.type,
        price: data.price != null ? this.D(data.price) : undefined,
        qty: this.D(data.qty),
        remaining: this.D(data.remaining),
        status: OrderStatus.OPEN,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Queries                                                            */
  /* ------------------------------------------------------------------ */
  /**
   * Find current open/partial orders for a user. If symbol provided, filter by pair symbol.
   */
  findOpen(userId: number, symbol?: string): Promise<OpenOrder[]> {
    const where: Prisma.OpenOrderWhereInput = {
      userId,
      status: { in: [OrderStatus.OPEN, OrderStatus.PARTIAL] },
    };
    if (symbol) {
      where.pair = { is: { symbol } };
    }
    return this.prisma.openOrder.findMany({ where });
  }

  findById(orderId: string): Promise<OpenOrder | null> {
    return this.prisma.openOrder.findUnique({ where: { orderId } });
  }

  /* ------------------------------------------------------------------ */
  /* Updates                                                            */
  /* ------------------------------------------------------------------ */
  updateStatus(orderId: string, status: OrderStatus): Promise<OpenOrder> {
    return this.prisma.openOrder.update({
      where: { orderId },
      data: { status },
    });
  }

  /** Update remaining to an absolute value (legacy – prefer adjustRemaining) */
  updateRemaining(
    orderId: string,
    remaining: Prisma.Decimal,
  ): Promise<OpenOrder> {
    return this.prisma.openOrder.update({
      where: { orderId },
      data: { remaining: this.D(remaining) },
    });
  }

  /**
   * Increase remaining quantity by amount (must be positive).
   */
  incrementRemaining(
    orderId: string,
    amount: Decimal.Value,
  ): Promise<OpenOrder> {
    return this.prisma.openOrder.update({
      where: { orderId },
      data: { remaining: { increment: this.D(amount) } },
    });
  }

  /**
   * Decrease remaining quantity by amount (must be positive).
   */
  decrementRemaining(
    orderId: string,
    amount: Decimal.Value,
  ): Promise<OpenOrder> {
    return this.prisma.openOrder.update({
      where: { orderId },
      data: { remaining: { increment: this.D(new Decimal(amount).negated()) } },
    });
  }

  /**
   * Update remaining quantity inside an existing Prisma transaction.
   */
  updateRemainingTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    remaining: Prisma.Decimal,
  ): Promise<OpenOrder> {
    return tx.openOrder.update({
      where: { orderId },
      data: { remaining: this.D(remaining) },
    });
  }

  /**
   * Adjust remaining quantity by a delta inside an existing Prisma transaction.
   */
  /**
   * Increase remaining quantity by amount inside a transaction.
   */
  incrementRemainingTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    amount: Decimal.Value,
  ): Promise<OpenOrder> {
    return tx.openOrder.update({
      where: { orderId },
      data: { remaining: { increment: this.D(amount) } },
    });
  }

  /**
   * Decrease remaining quantity by amount inside a transaction.
   */
  decrementRemainingTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    amount: Decimal.Value,
  ): Promise<OpenOrder> {
    return tx.openOrder.update({
      where: { orderId },
      data: { remaining: { increment: this.D(new Decimal(amount).negated()) } },
    });
  }

  /**
   * Update order status inside an existing Prisma transaction.
   */
  updateStatusTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    status: OrderStatus,
  ): Promise<OpenOrder> {
    return tx.openOrder.update({
      where: { orderId },
      data: { status },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Raw single-query trade application (no transaction wrapper)         */
  /* ------------------------------------------------------------------ */
  async applyTradeRaw(params: {
    makerOrderId: string;
    takerOrderId: string;
    makerRemainingDelta: Decimal.Value; // positive amount to subtract
    takerRemainingDelta: Decimal.Value; // positive amount to subtract
    makerStatus: OrderStatus;
    takerStatus: OrderStatus;
  }): Promise<void> {
    const {
      makerOrderId,
      takerOrderId,
      makerRemainingDelta,
      takerRemainingDelta,
      makerStatus,
      takerStatus,
    } = params;

    const now = Prisma.sql`NOW(3)`;

    const query = Prisma.sql`
      UPDATE \`OpenOrder\`
      SET
        remaining = CASE
          WHEN orderId = ${makerOrderId} THEN remaining - ${this.D(makerRemainingDelta)}
          WHEN orderId = ${takerOrderId} THEN remaining - ${this.D(takerRemainingDelta)}
          ELSE remaining
        END,
        status = CASE
          WHEN orderId = ${makerOrderId} THEN ${makerStatus}
          WHEN orderId = ${takerOrderId} THEN ${takerStatus}
          ELSE status
        END,
        updatedAt = ${now}
      WHERE orderId IN (${makerOrderId}, ${takerOrderId});
    `;

    await this.prisma.$executeRaw(query);
  }
}
