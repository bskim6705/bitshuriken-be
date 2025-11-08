import { Injectable } from '@nestjs/common';
import { Pair } from '@prisma/client-futures';

import { FuturesPrismaService } from '../prisma/prisma.service';

@Injectable()
export class PairRepository {
  constructor(private readonly prisma: FuturesPrismaService) {}

  findBySymbol(symbol: string): Promise<Pair | null> {
    return this.prisma.pair.findUnique({
      where: { symbol },
    });
  }

  listAll(): Promise<Pair[]> {
    return this.prisma.pair.findMany();
  }
}
