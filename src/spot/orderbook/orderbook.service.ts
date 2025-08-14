import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class OrderbookService {
  private readonly redis = new Redis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
  );

  async getBook(symbol: string): Promise<unknown> {
    if (!symbol) {
      throw new Error('Symbol parameter is required');
    }

    const raw = await this.redis.get(`orderbook:${symbol}`);
    return raw ? JSON.parse(raw) : { bids: {}, asks: {} };
  }
}
