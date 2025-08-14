import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoService {
  private readonly logger = new Logger(MongoService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.handleConnectionEvents();
  }

  /** Returns current mongoose connection readyState. */
  getConnectionStatus(): number {
    return this.connection.readyState as number;
  }

  private handleConnectionEvents(): void {
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected');
    });
    this.connection.on('error', (err: Error) => {
      this.logger.error(`MongoDB connection error: ${err.message}`);
    });
    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }
}
