import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useWebSocketAdapter(new WsAdapter(app));
  // Enable CORS for frontend to call REST APIs
  // Note: For production, set CORS_ORIGIN to a comma-separated list of allowed origins.
  const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: origins && origins.length > 0 ? origins : true,
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
