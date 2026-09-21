// CJS helper used by mock-api/server.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { evaluateCheckout } = require('../../mock-api/evaluate-checkout');

const catalog = [
  {
    id: 1,
    sku: 'fold-bag-01',
    prices: { GBP: 8900, EUR: 9900 },
    stock: 2
  }
];

function payload(overrides: Record<string, unknown> = {}) {
  return {
    marketId: 'GB',
    lines: [{ productId: 1, qty: 1, unitPriceCents: 8900 }],
    customer: { email: 'ada@example.com', name: 'Ada', country: 'GB' },
    ...overrides
  };
}

describe('mock checkout precedence', () => {
  it('replays a successful idempotency key with the same orderId', () => {
    const successfulOrders = new Map([['k1', { orderId: 'ord_same' }]]);
    const first = evaluateCheckout({
      idempotencyKey: 'k1',
      payload: payload(),
      forceFail: false,
      catalog,
      successfulOrders
    });
    const second = evaluateCheckout({
      idempotencyKey: 'k1',
      payload: payload(),
      forceFail: false,
      catalog,
      successfulOrders
    });

    expect(first).toEqual({ status: 200, body: { orderId: 'ord_same' }, replay: true });
    expect(second.body).toEqual({ orderId: 'ord_same' });
  });

  it('returns 409 OUT_OF_STOCK when qty exceeds stock', () => {
    const result = evaluateCheckout({
      idempotencyKey: 'k2',
      payload: payload({ lines: [{ productId: 1, qty: 9, unitPriceCents: 8900 }] }),
      forceFail: false,
      catalog,
      successfulOrders: new Map()
    });

    expect(result).toEqual({
      status: 409,
      body: { code: 'OUT_OF_STOCK', productId: 1 }
    });
  });

  it('returns 409 PRICE_MISMATCH when unitPriceCents is tampered', () => {
    const result = evaluateCheckout({
      idempotencyKey: 'k3',
      payload: payload({ lines: [{ productId: 1, qty: 1, unitPriceCents: 1 }] }),
      forceFail: false,
      catalog,
      successfulOrders: new Map()
    });

    expect(result.status).toBe(409);
    expect(result.body).toEqual({ code: 'PRICE_MISMATCH' });
  });

  it('returns 402 PAYMENT_FAILED without decrementing', () => {
    const result = evaluateCheckout({
      idempotencyKey: 'k4',
      payload: payload({ customer: { email: 'fail@pay.test', name: 'Fail', country: 'GB' } }),
      forceFail: true,
      catalog,
      successfulOrders: new Map()
    });

    expect(result).toEqual({ status: 402, body: { code: 'PAYMENT_FAILED' } });
    expect(result.decrement).toBeUndefined();
    expect(catalog[0].stock).toBe(2);
  });
});
