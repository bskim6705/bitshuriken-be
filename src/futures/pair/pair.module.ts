import { Module } from '@nestjs/common';
import { FuturesPrismaModule } from '../prisma/prisma.module';
import { PairRepository } from '../repository/pair.repository';
import { PairService } from './pair.service';

@Module({
  imports: [FuturesPrismaModule],
  providers: [PairRepository, PairService],
  controllers: [],
  exports: [PairService],
})
export class PairModule {}
