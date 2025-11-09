import { Module } from '@nestjs/common';
import { PairRepository } from './pair.repository';
import { PairService } from './pair.service';
import { PairController } from './pair.controller';

@Module({
  imports: [],
  providers: [PairRepository, PairService],
  controllers: [PairController],
  exports: [PairService],
})
export class PairModule {}
