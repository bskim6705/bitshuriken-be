import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuturesUserDto } from './dto/create-futures-user.dto';

@Injectable()
export class FuturesUserService {
  constructor(private readonly prisma: PrismaService) {}

  async registerFuturesUser(dto: CreateFuturesUserDto) {
    // 1. Check if user already exists in futures
    const existingFuturesUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingFuturesUser) {
      throw new ConflictException(
        'User already registered for futures trading',
      );
    }

    // 2. Create futures user with default settings
    // assetMode: defaults to SINGLE_ASSET (MULTI_ASSET not supported yet)
    // positionMode: defaults to ONE_WAY (HEDGE not supported yet)
    const futuresUser = await this.prisma.user.create({
      data: {
        email: dto.email,
      },
    });

    return {
      id: futuresUser.id,
      email: futuresUser.email,
      registeredAt: futuresUser.createdAt,
    };
  }

  async getFuturesUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        balances: true,
        positionSettings: {
          include: {
            pair: true,
          },
        },
        positions: {
          include: {
            pair: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Futures user not found');
    }

    return user;
  }
}
