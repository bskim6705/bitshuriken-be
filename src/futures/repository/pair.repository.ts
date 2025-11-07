import { Injectable } from '@nestjs/common';
import { Pair } from '@prisma/client-futures';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PairRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySymbol(symbol: string): Promise<Pair | null> {
    return this.prisma.pair.findUnique({
      where: { symbol },
    });
  }

  listAll(): Promise<Pair[]> {
    return this.prisma.pair.findMany();
  }
}
