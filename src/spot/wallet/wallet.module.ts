import { Module } from '@nestjs/common';
import { BalanceModule } from '../balance/balance.module';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  imports: [BalanceModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
