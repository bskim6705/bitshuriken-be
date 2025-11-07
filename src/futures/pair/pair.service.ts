import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pair } from '@prisma/client-futures';
import { PairRepository } from '../repository/pair.repository';
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

  async getFromRedisOrDb(symbol: string): Promise<Pair | null> {
    const raw = await this.redis.get(`futures:pair:${symbol}`);
    if (raw) {
      return JSON.parse(raw) as Pair;
    }
    const fromDb = await this.pairRepo.findBySymbol(symbol);
    if (fromDb) {
      await this.redis.set(
        `futures:pair:${fromDb.symbol}`,
        JSON.stringify(fromDb),
      );
    }
    return fromDb;
  }
}
