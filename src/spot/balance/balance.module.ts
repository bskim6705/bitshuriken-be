import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BalanceRepository } from './balance.repository';
import { BalanceService } from './balance.service';
import { KafkaModule } from '../kafka/kafka.module';
import { BalanceUpdatedConsumer } from './balance.updated.consumer';

@Module({
  imports: [PrismaModule, KafkaModule],
  providers: [BalanceRepository, BalanceService, BalanceUpdatedConsumer],
  exports: [BalanceService, BalanceRepository],
})
export class BalanceModule {}
