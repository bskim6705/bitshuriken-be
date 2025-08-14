import { IsNumber, IsPositive, IsString } from 'class-validator';

export class DepositWithdrawDto {
  @IsNumber()
  userId!: number;

  @IsString()
  currencyCode!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;
}
