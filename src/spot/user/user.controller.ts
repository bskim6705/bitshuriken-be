import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      return await this.userService.register(dto);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new HttpException('User already exists.', HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Registration failed.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
