import { Controller, Get, Param } from '@nestjs/common';
import { PairService } from './pair.service';

@Controller('pairs')
export class PairController {
  constructor(private readonly pairService: PairService) {}

  @Get()
  async list() {
    return this.pairService.listAll();
  }

  @Get(':symbol')
  async get(@Param('symbol') symbol: string) {
    return this.pairService.findBySymbol(symbol);
  }
}
