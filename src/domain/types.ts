export type CurrencyCode = 'GBP' | 'EUR';
export type MarketId = 'GB' | 'NL';
export type LocaleId = 'en-GB' | 'nl-NL';

export interface Market {
  id: MarketId;
  locale: LocaleId;
  currency: CurrencyCode;
  /** VAT rate in basis points, e.g. 2000 = 20.00% */
  vatBps: number;
  /** Display prices include VAT */
  pricesIncludeVat: true;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  nameKey: string; // i18n key, not a raw English string
  descriptionKey: string;
  category: 'bags' | 'lights' | 'racks' | 'covers';
  image: string;
  /** Integer minor units per currency. Never a float. */
  prices: Record<CurrencyCode, number>;
  stock: number; // units available in the mock warehouse
  weightGrams: number;
}

export interface CartLine {
  productId: number;
  sku: string;
  qty: number;
  /** Unit price in cents captured at add-to-cart for that market */
  unitPriceCents: number;
  currency: CurrencyCode;
}

export interface CartState {
  version: 1;
  marketId: MarketId;
  lines: CartLine[];
  /** ISO timestamp */
  updatedAt: string;
}

export interface CheckoutPayload {
  idempotencyKey: string;
  marketId: MarketId;
  currency: CurrencyCode;
  lines: Array<{ productId: number; qty: number; unitPriceCents: number }>;
  customer: {
    email: string;
    name: string;
    country: MarketId;
  };
}

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; code: 'OUT_OF_STOCK' | 'PRICE_MISMATCH' | 'PAYMENT_FAILED' | 'DUPLICATE' };
