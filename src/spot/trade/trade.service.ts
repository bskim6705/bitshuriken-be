import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrecisionService } from '../../precision/precision.service';
import { Trade } from '../types';

import { OrderStatus } from '@prisma/client-spot';
import { Consumer, EachBatchPayload } from 'kafkajs';
import { KafkaService } from '../kafka/kafka.service';
import { PairService } from '../pair/pair.service';
import { PrismaService } from '../prisma/prisma.service';
import { OpenOrderService } from '../open-order/open-order.service';
import { TradeLogRepository } from '../repository/trade-log.repository';

@Injectable()
export class TradeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TradeService.name);
  private consumer!: Consumer;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly pairService: PairService,
    private readonly prisma: PrismaService,
    private readonly openOrderService: OpenOrderService,
    private readonly tradeLogRepo: TradeLogRepository,
    private readonly precisionService: PrecisionService,
  ) {}

  async onModuleInit() {
    this.consumer = await this.kafkaService.createConsumer(
      'trade-service-group',
      'matching-engine.trades',
    );

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        this.logger.log(
          `Kafka batch [${batch.topic}|${batch.partition}] size=${batch.messages.length}`,
        );

        for (const message of batch.messages) {
          if (!payload.isRunning() || payload.isStale()) break;

          const value = message.value?.toString();
          if (!value) {
            payload.resolveOffset(message.offset);
            await payload.heartbeat();
            continue;
          }

          let trade: Trade;
          try {
            trade = JSON.parse(value) as Trade;
          } catch {
            this.logger.warn('Invalid trade JSON');
            payload.resolveOffset(message.offset);
            await payload.heartbeat();
            continue;
          }

          await this.handleTrade(trade);

          payload.resolveOffset(message.offset);
          await payload.heartbeat();
        }
      },
    });

    this.logger.log('TradeService Kafka consumer started');
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }

  private async handleTrade(trade: Trade) {
    const { symbol, price, qty, maker, taker } = trade;
    this.logger.log(`Trade: ${JSON.stringify(trade)}`);
    if (!symbol || !price || !qty || !maker || !taker) return;

    const pair = await this.pairService.findBySymbol(symbol);
    if (!pair) {
      this.logger.warn(`Pair ${symbol} not found`);
      return;
    }

    const seller = maker.side === 'SELL' ? maker : taker;
    const buyer = maker.side === 'BUY' ? maker : taker;

    const sellerUserId = seller.userId;
    const buyerUserId = buyer.userId;
    if (!sellerUserId || !buyerUserId) {
      this.logger.warn('Trade message missing userId');
      return;
    }
    const executedBase = this.precisionService.decimal(qty);
    const executedQuote = this.precisionService.multiply(price, qty);

    try {
      const makerDelta = maker.side === 'SELL' ? executedBase : executedQuote;
      const takerDelta = taker.side === 'SELL' ? executedBase : executedQuote;
      const makerStatus: OrderStatus =
        maker.remainingQty === '0' ? 'FILLED' : 'PARTIAL';
      const takerStatus: OrderStatus =
        taker.remainingQty === '0' ? 'FILLED' : 'PARTIAL';

      await this.openOrderService.applyTradeRaw({
        makerOrderId: maker.orderId,
        takerOrderId: taker.orderId,
        makerRemainingDelta: makerDelta,
        takerRemainingDelta: takerDelta,
        makerStatus,
        takerStatus,
      });

      // success log
      await this.tradeLogRepo.logSuccess(trade);
    } catch (err: any) {
      // failure log
      await this.tradeLogRepo.logFailure(trade, err.message ?? 'unknown');
      this.logger.error(`Trade settlement failed: ${err.message}`);
    }
  }
}
