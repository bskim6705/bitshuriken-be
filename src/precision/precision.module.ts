import { Global, Module } from '@nestjs/common';
import { PrecisionService } from './precision.service';

@Global()
@Module({
  providers: [PrecisionService],
  exports: [PrecisionService],
})
export class PrecisionModule {}
