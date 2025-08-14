import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PairRepository } from '../repository/pair.repository';
import { PairService } from './pair.service';
import { PairController } from './pair.controller';

@Module({
  imports: [PrismaModule],
  providers: [PairRepository, PairService],
  controllers: [PairController],
  exports: [PairService],
})
export class PairModule {}
