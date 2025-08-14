import { Body, Controller, Post } from '@nestjs/common';
import { FeeService, ApplyFeeDto } from './fee.service';

@Controller('fees')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Post('apply')
  apply(@Body() dto: ApplyFeeDto) {
    return this.feeService.applyFee(dto);
  }
}
