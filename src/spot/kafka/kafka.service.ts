import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, logLevel, Producer, Consumer } from 'kafkajs';
import { OrderPayload } from '../order/order.service.js';
import { CancelPayload } from '../order/order.service.js';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private producer!: Producer;
  private readonly consumers: Consumer[] = [];

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'order-service',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      logLevel: logLevel.NOTHING,
    });
    this.producer = this.kafka.producer();
    await this.producer.connect();

    // Consumer instances will be created on-demand via createConsumer().
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    // Disconnect all dynamically created consumers
    await Promise.all(this.consumers.map((c) => c.disconnect()));
  }

  /* ------------------------------------------------------------------ */
  /* Producer helpers                                                   */
  /* ------------------------------------------------------------------ */

  async sendOrder(orderPayload: OrderPayload): Promise<void> {
    await this.producer.send({
      topic: 'matching-engine',
      messages: [
        {
          key: 'match',
          value: JSON.stringify({ action: 'order', orderPayload }),
        },
      ],
    });
  }

  /**
   * Publish order cancellation request to Kafka.
   * @param cancelPayload - JSON serialisable cancellation info (userId & orderId)
   */
  async sendOrderCancellation(cancelPayload: CancelPayload): Promise<void> {
    await this.producer.send({
      topic: 'matching-engine',
      messages: [
        {
          key: 'match',
          value: JSON.stringify({ action: 'cancel', cancelPayload }),
        },
      ],
    });
  }

  /* ------------------------------------------------------------------ */
  /* Consumer factory                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Factory to create and return a Kafka consumer.
   * If multiple Nest.js instances run (clustered or in containers) but share the same
   * `groupId`, Kafka guarantees each message is consumed exactly once across the cluster
   * via consumer-group load balancing.
   *
   * @param groupId        Unique consumer-group id (ideally per logical service)
   * @param topics         Topic or list of topics to subscribe to
   * @param fromBeginning  Whether to read from the beginning (default: false)
   */
  async createConsumer(
    groupId: string,
    topics: string | string[],
    fromBeginning = false,
  ): Promise<Consumer> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();

    const topicList = Array.isArray(topics) ? topics : [topics];
    await Promise.all(
      topicList.map((t) => consumer.subscribe({ topic: t, fromBeginning })),
    );

    this.consumers.push(consumer);
    return consumer;
  }
}
