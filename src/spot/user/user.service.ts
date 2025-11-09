import { Injectable } from '@nestjs/common';
import { Precision } from '@libs/utils/precision';

import { PrismaService } from '../prisma/prisma.service';
import { BalanceRepository } from '../repository/balance.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceRepo: BalanceRepository,
  ) { }

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
      Precision.decimal(0),
      Precision.decimal(0),
    );

    return { id: user.id, email: user.email };
  }
}
