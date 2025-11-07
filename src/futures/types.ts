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
