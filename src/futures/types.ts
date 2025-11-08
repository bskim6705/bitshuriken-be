export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
}

export type Order = {
  userId: number;
  orderId: string;
  symbol: string;
  baseCurrencyCode: string;
  quoteCurrencyCode: string;
  side: OrderSide;
  type: OrderType;
  price?: number;
  qty: number;
};

export type Trade = {
  symbol: string;
  price: string;
  qty: string;
  maker: {
    orderId: string;
    side: 'SELL' | 'BUY';
    userId: number;
    remainingQty: string;
  };
  taker: {
    orderId: string;
    side: 'SELL' | 'BUY';
    userId: number;
    remainingQty: string;
  };
  timestamp: number;
};

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}
