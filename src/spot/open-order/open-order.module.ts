import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { OpenOrderRepository } from './open-order.repository';
import { OpenOrderService } from './open-order.service';

@Module({
  imports: [PrismaModule],
  providers: [OpenOrderRepository, OpenOrderService],
  exports: [OpenOrderService],
})
export class OpenOrderModule {}
