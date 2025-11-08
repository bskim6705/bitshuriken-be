import { Module } from '@nestjs/common';
import { PrecisionService } from '../../precision/precision.service';

import { PrismaModule } from '../prisma/prisma.module';
import { OpenOrderRepository } from '../repository/open-order.repository';
import { OpenOrderService } from './open-order.service';

@Module({
  imports: [PrismaModule],
  providers: [OpenOrderRepository, OpenOrderService, PrecisionService],
  exports: [OpenOrderService],
})
export class OpenOrderModule {}
