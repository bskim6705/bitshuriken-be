import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pair } from '@prisma/client-spot';
import { PairRepository } from './pair.repository';
import Redis from 'ioredis';

@Injectable()
export class PairService implements OnModuleInit, OnModuleDestroy {
  private readonly redis = new Redis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
  );

  constructor(private readonly pairRepo: PairRepository) {}

  /**
   * Preload all pairs from DB into Redis for fast runtime lookups.
   */
  async onModuleInit(): Promise<void> {
    const pairs = await this.pairRepo.listAll();
    const pipeline = this.redis.pipeline();
    for (const p of pairs) {
      pipeline.set(`pair:${p.symbol}`, JSON.stringify(p));
    }
    await pipeline.exec();
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  findBySymbol(symbol: string): Promise<Pair | null> {
    return this.getFromRedisOrDb(symbol);
  }

  listAll(): Promise<Pair[]> {
    return this.pairRepo.listAll();
  }

  private async getFromRedisOrDb(symbol: string): Promise<Pair | null> {
    const raw = await this.redis.get(`pair:${symbol}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Omit<Pair, 'createdAt'> & {
        createdAt: string | Date;
      };
      // Ensure createdAt is a Date instance to match Prisma Pair type
      const pair: Pair = {
        ...parsed,
        createdAt:
          parsed.createdAt instanceof Date
            ? parsed.createdAt
            : new Date(parsed.createdAt),
      } as Pair;
      return pair;
    }

    console.log(symbol);
    // Fallback to DB if not present in Redis, then backfill cache
    const fromDb = await this.pairRepo.findBySymbol(symbol);
    if (fromDb) {
      await this.redis.set(`pair:${fromDb.symbol}`, JSON.stringify(fromDb));
    }
    return fromDb;
  }
}
