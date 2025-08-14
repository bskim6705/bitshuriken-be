import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  ValidateIf,
  IsDefined,
} from 'class-validator';

import { Type } from 'class-transformer';

import { OrderSide, OrderType } from '../../types';
export { OrderSide, OrderType };

export class CreateOrderDto {
  @IsString()
  symbol!: string;

  @IsEnum(OrderSide)
  side!: OrderSide;

  @IsEnum(OrderType)
  type!: OrderType;

  @ValidateIf((o: CreateOrderDto) => o.type === OrderType.LIMIT)
  @IsDefined({ message: 'price is required for LIMIT order' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'price must be a number' },
  )
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive({ message: 'price must be greater than 0' })
  price?: number;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive({ message: 'qty must be greater than 0' })
  qty!: number;

  // temporary: derive from auth later
  @IsNumber()
  @IsPositive()
  userId!: number;
}
