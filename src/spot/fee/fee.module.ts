import { Module } from '@nestjs/common';
import { BalanceModule } from '../balance/balance.module';
import { PairModule } from '../pair/pair.module';
import { FeeRepository } from './fee.repository';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';

@Module({
  imports: [BalanceModule, PairModule],
  providers: [FeeRepository, FeeService],
  controllers: [FeeController],
  exports: [FeeService],
})
export class FeeModule {}
