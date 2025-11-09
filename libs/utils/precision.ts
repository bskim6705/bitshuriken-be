import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_DOWN });

export class Precision {
    static decimal(a: Decimal.Value): Decimal {
        return a instanceof Decimal ? a : new Decimal(a);
    }

    static add(a: Decimal.Value, b: Decimal.Value): Decimal {
        return new Decimal(a).plus(b).toDP(8);
    }

    static sub(a: Decimal.Value, b: Decimal.Value): Decimal {
        return new Decimal(a).minus(b).toDP(8);
    }

    static multiply(a: Decimal.Value, b: Decimal.Value): Decimal {
        return new Decimal(a).times(b).toDP(8);
    }

    static divide(a: Decimal.Value, b: Decimal.Value): Decimal {
        return new Decimal(a).dividedBy(b).toDP(8);
    }

    static quantize(a: Decimal.Value): string {
        return new Decimal(a).toFixed(8);
    }
}
