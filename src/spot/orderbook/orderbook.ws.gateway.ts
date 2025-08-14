import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import Redis from 'ioredis';

@WebSocketGateway({ path: '/orderbook' })
export class OrderbookWsGateway
  implements OnModuleInit, OnModuleDestroy, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly clientSymbols = new Map<WebSocket, string>();

  private readonly redisSub = new Redis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
  );

  async onModuleInit() {
    try {
      // Subscribe to all orderbook update channels.
      await this.redisSub.psubscribe('orderbook:update:*');
    } catch (err) {
      console.error('Failed to psubscribe redis:', err);
    }

    this.redisSub.on('pmessage', (_pattern, channel, payload) => {
      try {
        const symbol = channel.split(':')[2]; // orderbook:update:<SYMBOL>
        // Broadcast only to clients interested in this symbol
        for (const client of this.server.clients) {
          const subscribedSymbol = this.clientSymbols.get(client);
          if (
            client.readyState === WebSocket.OPEN &&
            subscribedSymbol === symbol
          ) {
            client.send(payload);
          }
        }
      } catch (e) {
        console.error('Failed to handle redis message', e);
      }
    });
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url ?? '', 'http://localhost');
    const symbol = url.searchParams.get('symbol');
    if (!symbol) {
      client.close(1008, 'symbol query param required');
      return;
    }
    // Store mapping for quick lookup during broadcast
    this.clientSymbols.set(client, symbol);
  }

  handleDisconnect(client: WebSocket) {
    this.clientSymbols.delete(client);
  }

  onModuleDestroy() {
    this.redisSub.disconnect();

    // Clean up mapping
    this.clientSymbols.clear();
  }
}
