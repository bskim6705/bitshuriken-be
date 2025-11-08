import { Module, Global } from '@nestjs/common';
import { FuturesKafkaService } from './kafka.service';

@Global()
@Module({
  providers: [FuturesKafkaService],
  exports: [FuturesKafkaService],
})
export class FuturesKafkaModule {}
