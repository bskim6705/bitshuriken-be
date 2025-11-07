import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FuturesUserService } from './futures-user.service';
import { FuturesUserController } from './futures-user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FuturesUserController],
  providers: [FuturesUserService],
  exports: [FuturesUserService],
})
export class FuturesUserModule {}
