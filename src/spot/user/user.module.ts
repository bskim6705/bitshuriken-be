import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BalanceRepository } from '../balance/balance.repository';
import { BalanceModule } from '../balance/balance.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule, BalanceModule],
  providers: [UserService, BalanceRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
