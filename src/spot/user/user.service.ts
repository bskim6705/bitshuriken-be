import { Injectable } from '@nestjs/common';
import { PrecisionService } from '../precision/precision.service';

import { PrismaService } from '../prisma/prisma.service';
import { BalanceRepository } from '../repository/balance.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceRepo: BalanceRepository,
    private readonly precisionService: PrecisionService,
  ) {}

  async register(dto: CreateUserDto) {
    // TODO: hash password before saving
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
      },
    });

    // Ensure a USDT wallet exists (available & locked = 0)
    await this.balanceRepo.upsertBalance(
      user.id,
      'USDT',
      this.precisionService.decimal(0),
      this.precisionService.decimal(0),
    );

    return { id: user.id, email: user.email };
  }
}
