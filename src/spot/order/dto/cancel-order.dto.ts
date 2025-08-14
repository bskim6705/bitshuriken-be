import { IsNumber, IsString } from 'class-validator';

export class CancelOrderDto {
  @IsNumber()
  userId!: number;

  @IsString()
  symbol!: string;

  @IsString()
  orderId!: string;
}
