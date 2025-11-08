import { Module } from '@nestjs/common';
import { FuturesPrismaModule } from '../prisma/prisma.module';
import { FuturesBalanceRepository } from '../repository/balance.repository';
import { BalanceService } from './balance.service';
import { FuturesKafkaModule } from '../kafka/kafka.module';
import { BalanceUpdatedConsumer } from './balance.updated.consumer';

@Module({
  imports: [FuturesPrismaModule, FuturesKafkaModule],
  providers: [FuturesBalanceRepository, BalanceService, BalanceUpdatedConsumer],
  exports: [BalanceService, FuturesBalanceRepository],
})
export class BalanceModule {}
