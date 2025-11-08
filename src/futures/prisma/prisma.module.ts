import { Global, Module } from '@nestjs/common';
import { FuturesPrismaService } from './prisma.service';

@Global()
@Module({
  providers: [FuturesPrismaService],
  exports: [FuturesPrismaService],
})
export class FuturesPrismaModule {}
