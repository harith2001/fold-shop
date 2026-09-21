import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import type { CheckoutPayload, CheckoutResult } from '@/domain/types';

export type CheckoutFailure = {
  ok: false;
  code: 'OUT_OF_STOCK' | 'PRICE_MISMATCH' | 'PAYMENT_FAILED' | 'CHECKOUT';
};
export type MappedCheckoutResult = { ok: true; orderId: string } | CheckoutFailure;

const checkoutClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

export function mapCheckoutError(error: AxiosError<{ code?: string }>): CheckoutFailure {
  const status = error.response?.status;
  const code = error.response?.data?.code;
  if (status === 409 && code === 'OUT_OF_STOCK') {
    return { ok: false, code: 'OUT_OF_STOCK' };
  }
  if (status === 409 && code === 'PRICE_MISMATCH') {
    return { ok: false, code: 'PRICE_MISMATCH' };
  }
  if (status === 402 || code === 'PAYMENT_FAILED') {
    return { ok: false, code: 'PAYMENT_FAILED' };
  }
  return { ok: false, code: 'CHECKOUT' };
}

checkoutClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ code?: string }>) => Promise.reject(mapCheckoutError(error))
);

export async function submitCheckout(
  payload: CheckoutPayload,
  idempotencyKey: string
): Promise<MappedCheckoutResult> {
  try {
    const response = await checkoutClient.post<{ orderId: string }>('/checkout', payload, {
      headers: { 'Idempotency-Key': idempotencyKey }
    });
    return { ok: true, orderId: response.data.orderId };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'ok' in error &&
      (error as CheckoutResult).ok === false
    ) {
      return error as CheckoutFailure;
    }
    return { ok: false, code: 'CHECKOUT' };
  }
}
