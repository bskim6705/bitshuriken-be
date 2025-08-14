import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Consumer, EachBatchPayload } from 'kafkajs';
import { KafkaService } from '../kafka/kafka.service';
import { BalanceService } from './balance.service';

interface DeltaUserBalance {
  userId: number;
  currencyCode: string;
  unlockBalance?: string;
  creditBalance?: string;
  debitBalance?: string;
}
@Injectable()
export class BalanceUpdatedConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer!: Consumer;
  private readonly logger = new Logger(BalanceUpdatedConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly balanceService: BalanceService,
  ) {}

  async onModuleInit() {
    this.consumer = await this.kafkaService.createConsumer(
      'balance-updated-consumer',
      'matching-engine.balance.updated',
    );

    await this.consumer.run({
      eachBatch: async (payload: EachBatchPayload) => {
        const { batch } = payload;
        this.logger.log(
          `Kafka batch [${batch.topic}|${batch.partition}] size=${batch.messages.length}`,
        );

        const deltaMessages: DeltaUserBalance[] = [];

        for (const message of batch.messages) {
          if (!payload.isRunning() || payload.isStale()) break;

          try {
            const msg = message.value?.toString();
            if (msg) {
              const parsed: unknown = JSON.parse(msg);
              deltaMessages.push(parsed as DeltaUserBalance);
            }
          } catch (err) {
            this.logger.error(
              'Failed to parse balance update message',
              err as Error,
            );
          }

          await payload.heartbeat();
        }

        if (deltaMessages.length) {
          try {
            await this.balanceService.applyBatchDeltaMessages(deltaMessages);
          } catch (err) {
            this.logger.error(
              'Failed to apply batch balance updates',
              err as Error,
            );
          }
        }

        for (const message of batch.messages) {
          payload.resolveOffset(message.offset);
          await payload.heartbeat();
        }
      },
    });
  }

  async onModuleDestroy() {
    if (this.consumer) await this.consumer.disconnect();
  }

  // No per-message handler; batches are applied in a single query via service
}
