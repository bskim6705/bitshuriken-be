import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Trade } from '../types';

import { EachBatchPayload } from 'kafkajs';
import { FuturesKafkaService } from '../kafka/kafka.service';
import { CandleRepository } from '../repository/candle.repository';
import { Precision } from '@libs/utils/precision';

/**
 * KlineService consumes the `trades` Kafka topic in real-time and aggregates
 * trades into 1-second OHLCV candles that are flushed to MongoDB once per
 * second.
 */
@Injectable()
export class FuturesKlineService implements OnModuleInit {
  private readonly logger = new Logger(FuturesKlineService.name);
  /**
   * Buffer structure: { "SYMBOL|epochSecond" -> Trade[] }
   */
  private readonly tradeBuffer = new Map<string, Trade[]>();

  constructor(
    private readonly kafkaService: FuturesKafkaService,
    private readonly candleRepository: CandleRepository,
  ) { }

  /* ------------------------------------------------------------------ */
  /* Kafka consumer initialisation                                      */
  /* ------------------------------------------------------------------ */

  async onModuleInit(): Promise<void> {
    // Create dedicated consumer for the kline aggregation service.
    const consumer = await this.kafkaService.createConsumer(
      'kline-service',
      'matching-engine.trades',
    );

    await consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        for (const message of batch.messages) {
          if (!payload.isRunning() || payload.isStale()) break;

          const value = message.value?.toString();
          if (!value) {
            payload.resolveOffset(message.offset);
            await payload.heartbeat();
            continue;
          }

          try {
            const trade: Trade = JSON.parse(value) as Trade;
            const epochSecond = Math.floor(Date.now() / 1000);
            const key = `${trade.symbol}|${epochSecond}`;
            const list = this.tradeBuffer.get(key) ?? [];
            list.push(trade);
            this.tradeBuffer.set(key, list);
          } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? 'unknown';
            this.logger.error(`Failed to process trade message: ${msg}`);
          }

          payload.resolveOffset(message.offset);
          await payload.heartbeat();
        }
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Flush & persist candles every second                               */
  /* ------------------------------------------------------------------ */

  @Cron(CronExpression.EVERY_SECOND)
  async flushCandles(): Promise<void> {
    const nowEpoch = Math.floor(Date.now() / 1000);
    const targetEpoch = nowEpoch - 1; // flush previous second

    for (const [key, trades] of Array.from(this.tradeBuffer.entries())) {
      const [symbol, epochStr] = key.split('|');
      const epoch = Number(epochStr);

      if (epoch > targetEpoch || trades.length === 0) {
        // Skip current second that is still aggregating.
        continue;
      }

      const prices = trades.map((t) => Precision.decimal(t.price));
      const qtySum = trades.reduce(
        (sum, t) => sum.plus(Precision.decimal(t.qty)),
        Precision.decimal(0),
      );

      // Create candle document and persist.
      await this.candleRepository.create({
        symbol,
        open: Precision.quantize(trades[0].price),
        close: Precision.quantize(trades[trades.length - 1].price),
        high: Precision.quantize(
          prices.reduce((max, p) => (p.gt(max) ? p : max), prices[0]),
        ),
        low: Precision.quantize(
          prices.reduce((min, p) => (p.lt(min) ? p : min), prices[0]),
        ),
        volume: Precision.quantize(qtySum),
        startTime: new Date(epoch * 1000),
        endTime: new Date(epoch * 1000 + 999),
      });

      // Remove aggregated data from buffer.
      this.tradeBuffer.delete(key);
    }
  }
}
