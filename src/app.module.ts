/* --------------------------- Common --------------------------- */
import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/* --------------------------- Spot --------------------------- */
import { OrderModule } from './spot/order/order.module';
import { KafkaModule } from './spot/kafka/kafka.module';
import { PrismaModule } from './spot/prisma/prisma.module';
import { MongoModule } from './spot/mongo/mongo.module';
import { BalanceModule } from './spot/balance/balance.module';
import { ConfigModule } from '@nestjs/config';
import { TradeModule } from './spot/trade/trade.module';
import { UserModule } from './spot/user/user.module';
import { WalletModule } from './spot/wallet/wallet.module';
import { FeeModule } from './spot/fee/fee.module';
import { KlineModule } from './spot/kline/kline.module';
import { FuturesUserModule } from './futures/user/futures-user.module';

@Global()
@Module({})
export class CommonModule {}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CommonModule,
    KafkaModule,
    OrderModule,
    PrismaModule,
    MongoModule,
    BalanceModule,
    WalletModule,
    TradeModule,
    UserModule,
    KlineModule,
    FeeModule,
    FuturesUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
