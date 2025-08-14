import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { Consumer } from 'kafkajs';
import { KafkaService } from '../kafka/kafka.service';

// WebSocket gateway that streams raw trade messages from Kafka to the frontend.
// The payload received from the `trades` topic is forwarded **as-is** to every
// connected WebSocket client. Clients can simply connect to the `/trades` path
// to receive a real-time feed of executed trades.
@WebSocketGateway({ path: '/trades' })
export class TradeWsGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  private readonly server!: Server;

  private consumer!: Consumer;

  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit(): Promise<void> {
    // Create a dedicated Kafka consumer for streaming trades.
    this.consumer = await this.kafkaService.createConsumer(
      'trade-ws-gateway-group',
      'matching-engine.trades',
    );

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const payload = message.value?.toString();
        if (!payload) return;

        // Broadcast the raw JSON string to every connected WebSocket client.
        for (const client of this.server.clients) {
          if (client.readyState === client.OPEN) {
            client.send(payload);
          }
        }

        // no-op await to satisfy eslint "require-await"
        await Promise.resolve();
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}
