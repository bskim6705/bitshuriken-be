import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrecisionService } from '../../precision/precision.service';

import { KafkaService } from '../kafka/kafka.service';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { BalanceService } from '../balance/balance.service';
import { PairService } from '../pair/pair.service';
import { OpenOrderService } from '../open-order/open-order.service';

interface CancelResultMessage {
  orderId: string;
  symbol: string;
  cancelled: boolean;
  removedOrder: {
    orderId: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET';
    price: string;
    qty: string;
    userId: number;
  };
}

@Injectable()
export class OrderCancellationConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(OrderCancellationConsumer.name);
  private consumer!: Consumer;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly balanceService: BalanceService,
    private readonly pairService: PairService,
    private readonly precisionService: PrecisionService,
    private readonly openOrderService: OpenOrderService,
  ) {}

  async onModuleInit() {
    // Subscribe to cancellation confirmation events emitted by matching engine
    this.consumer = await this.kafkaService.createConsumer(
      'order-service-cancel-listener',
      'matching-engine.order.cancelled',
    );

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const msg = payload.message.value?.toString();
          if (!msg) return;
          const data: CancelResultMessage = JSON.parse(
            msg,
          ) as CancelResultMessage;
          await this.handleCancellation(data);
        } catch (err) {
          this.logger.error('Failed to process cancellation message', err);
        }
      },
    });
  }

  async onModuleDestroy() {
    if (this.consumer) await this.consumer.disconnect();
  }

  private async handleCancellation(data: CancelResultMessage) {
    this.logger.log(`Handling cancellation: ${JSON.stringify(data)}`);
    const { cancelled, removedOrder } = data;

    if (!cancelled) {
      this.logger.warn(`Order not cancelled`);
      return;
    }

    const openOrder = await this.openOrderService.findById(
      removedOrder.orderId,
    );
    if (!openOrder) {
      this.logger.warn(
        `Open order not found for cancellation: ${removedOrder.orderId}`,
      );
      return;
    }

    await this.openOrderService.updateStatus(removedOrder.orderId, 'CANCELED');
  }
}
