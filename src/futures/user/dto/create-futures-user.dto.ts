import { IsEmail } from 'class-validator';

export class CreateFuturesUserDto {
  @IsEmail()
  email!: string;
}
