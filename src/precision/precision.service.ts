import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

@Injectable()
export class PrecisionService {
  constructor() {
    Decimal.set({
      precision: 20,
      rounding: Decimal.ROUND_DOWN,
    });
  }

  add(a: Decimal.Value, b: Decimal.Value): Decimal {
    return new Decimal(a).plus(b).toDP(8);
  }

  sub(a: Decimal.Value, b: Decimal.Value): Decimal {
    return new Decimal(a).minus(b).toDP(8);
  }

  multiply(a: Decimal.Value, b: Decimal.Value): Decimal {
    return new Decimal(a).times(b).toDP(8);
  }

  divide(a: Decimal.Value, b: Decimal.Value): Decimal {
    return new Decimal(a).dividedBy(b).toDP(8);
  }

  decimal(a: Decimal.Value): Decimal {
    if (a instanceof Decimal) return a;
    return new Decimal(a);
  }

  quantize(a: Decimal.Value): string {
    return new Decimal(a).toFixed(8);
  }
}
