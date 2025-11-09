import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { CandleRepository } from './kline.repository';

/**
 * Kline DTO returned to the frontend.
 * All numeric price/volume fields are strings to preserve precision.
 */
export interface KlineDto {
  /** Start time of the candle in milliseconds since epoch */
  openTime: number;
  /** Open price as string */
  open: string;
  /** High price as string */
  high: string;
  /** Low price as string */
  low: string;
  /** Close price as string */
  close: string;
  /** Volume as string (base asset volume) */
  volume: string;
  /** Close time of the candle in milliseconds since epoch */
  closeTime: number;
}

function parseIntervalToSeconds(iv: string): number | null {
  const m = iv.match(/^(\d+)(s|m|h|d|w|mo)$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  switch (unit) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 60 * 60;
    case 'd':
      return n * 60 * 60 * 24;
    case 'w':
      return n * 60 * 60 * 24 * 7;
    case 'mo':
      return n * 60 * 60 * 24 * 30;
    default:
      return null;
  }
}

@Controller('kline')
export class FuturesKlineController {
  constructor(private readonly candleRepo: CandleRepository) {}

  @Get('klines')
  async getKlines(
    @Query('symbol') symbol = 'BTCUSDT',
    @Query('interval') interval = '1m',
    @Query('limit') limitStr = '500',
    @Query('endTime') endTimeStr?: string,
  ): Promise<KlineDto[]> {
    const limit = Math.min(Math.max(Number(limitStr) || 500, 1), 2000);
    const seconds = parseIntervalToSeconds(interval);
    if (!seconds) {
      throw new BadRequestException('Invalid interval');
    }

    const endMs = endTimeStr ? Number(endTimeStr) : Date.now();
    const startMs = endMs - seconds * limit * 1000;

    const candles = await this.candleRepo.findRange({
      symbol,
      startTime: new Date(startMs),
      endTime: new Date(endMs),
      sortAsc: true,
      // We intentionally do not set .limit here because we may need up to
      // seconds*limit 1-second bars for client-side aggregation.
    });

    // Map stored candles to explicit DTO
    const rows: KlineDto[] = candles.map((c) => ({
      openTime: c.startTime.getTime(),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
      closeTime: c.endTime.getTime(),
    }));

    return rows;
  }
}
