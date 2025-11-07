import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PairRepository } from '../repository/pair.repository';
import { PairService } from './pair.service';

@Module({
  imports: [PrismaModule],
  providers: [PairRepository, PairService],
  controllers: [],
  exports: [PairService],
})
export class PairModule {}
