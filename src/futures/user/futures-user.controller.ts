import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { FuturesUserService } from './futures-user.service';
import { CreateFuturesUserDto } from './dto/create-futures-user.dto';

@Controller('futures/users')
export class FuturesUserController {
  constructor(private readonly futuresUserService: FuturesUserService) {}

  @Post('register')
  async registerFuturesUser(@Body() dto: CreateFuturesUserDto) {
    return this.futuresUserService.registerFuturesUser(dto);
  }

  @Get(':email')
  async getFuturesUser(@Param('email') email: string) {
    return this.futuresUserService.getFuturesUser(email);
  }
}
