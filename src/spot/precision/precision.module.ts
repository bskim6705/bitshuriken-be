import { Module } from '@nestjs/common';
import { PrecisionService } from './precision.service';

@Module({
  providers: [PrecisionService],
  exports: [PrecisionService],
})
export class PrecisionModule {}
