import { Body, Controller, Post } from '@nestjs/common';
import { DepositWithdrawDto } from './dto/deposit-withdraw.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  deposit(@Body() dto: DepositWithdrawDto) {
    return this.walletService.deposit(dto.userId, dto.currencyCode, dto.amount);
  }

  @Post('withdraw')
  withdraw(@Body() dto: DepositWithdrawDto) {
    return this.walletService.withdraw(
      dto.userId,
      dto.currencyCode,
      dto.amount,
    );
  }
}
