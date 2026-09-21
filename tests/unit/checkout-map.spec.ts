import type { AxiosError } from 'axios';
import { mapCheckoutError } from '@/api/checkout';

function axiosError(status: number, code?: string): AxiosError<{ code?: string }> {
  return {
    isAxiosError: true,
    name: 'Error',
    message: 'fail',
    toJSON: () => ({}),
    response: {
      status,
      data: code ? { code } : {},
      statusText: '',
      headers: {},
      config: {}
    }
  } as AxiosError<{ code?: string }>;
}

describe('mapCheckoutError', () => {
  it('maps 409 OUT_OF_STOCK', () => {
    expect(mapCheckoutError(axiosError(409, 'OUT_OF_STOCK'))).toEqual({
      ok: false,
      code: 'OUT_OF_STOCK'
    });
  });

  it('maps 409 PRICE_MISMATCH', () => {
    expect(mapCheckoutError(axiosError(409, 'PRICE_MISMATCH'))).toEqual({
      ok: false,
      code: 'PRICE_MISMATCH'
    });
  });

  it('maps 402 PAYMENT_FAILED', () => {
    expect(mapCheckoutError(axiosError(402, 'PAYMENT_FAILED'))).toEqual({
      ok: false,
      code: 'PAYMENT_FAILED'
    });
  });

  it('maps 500 to CHECKOUT', () => {
    expect(mapCheckoutError(axiosError(500))).toEqual({
      ok: false,
      code: 'CHECKOUT'
    });
  });
});
