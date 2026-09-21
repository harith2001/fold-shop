import Vuex, { Store } from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import cart from '@/store/cart';
import checkout, { checkoutKeyPlugin } from '@/store/checkout';
import { submitCheckout } from '@/api/checkout';
import type { CartLine, Market } from '@/domain/types';

jest.mock('@/api/checkout', () => ({
  submitCheckout: jest.fn()
}));

const mockSubmit = submitCheckout as jest.MockedFunction<typeof submitCheckout>;

const localVue = createLocalVue();
localVue.use(Vuex);

const gbMarket: Market = {
  id: 'GB',
  locale: 'en-GB',
  currency: 'GBP',
  vatBps: 2000,
  pricesIncludeVat: true
};

function line(): CartLine {
  return {
    productId: 1,
    sku: 'fold-bag-01',
    qty: 1,
    unitPriceCents: 8900,
    currency: 'GBP'
  };
}

function createStore() {
  return new Vuex.Store({
    modules: {
      cart,
      checkout,
      ui: {
        namespaced: true,
        getters: {
          market: () => gbMarket,
          currency: () => 'GBP'
        }
      }
    },
    plugins: [checkoutKeyPlugin]
  }) as Store<{
    checkout: { idempotencyKey: string | null; submitting: boolean };
    cart: unknown;
  }>;
}

describe('checkout guard', () => {
  beforeEach(() => {
    mockSubmit.mockReset();
    mockSubmit.mockResolvedValue({ ok: true, orderId: 'ord_1' });
  });

  it('does not mint a second key while submitting', async () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line());
    store.dispatch('checkout/start');
    const firstKey = store.state.checkout.idempotencyKey;
    expect(firstKey).toBeTruthy();

    store.commit('checkout/SET_SUBMITTING', true);
    store.dispatch('checkout/start');
    expect(store.state.checkout.idempotencyKey).toBe(firstKey);

    await store.dispatch('checkout/submit', {
      name: 'Ada',
      email: 'ada@example.com',
      country: 'GB'
    });
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(store.state.checkout.idempotencyKey).toBe(firstKey);
  });

  it('reuses one key and does not start a second POST while submitting', async () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line());
    let release: (value: { ok: true; orderId: string }) => void = () => undefined;
    mockSubmit.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      })
    );

    const first = store.dispatch('checkout/submit', {
      name: 'Ada',
      email: 'ada@example.com',
      country: 'GB'
    });
    const second = store.dispatch('checkout/submit', {
      name: 'Ada',
      email: 'ada@example.com',
      country: 'GB'
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    const key = mockSubmit.mock.calls[0][1];
    release({ ok: true, orderId: 'ord_1' });
    await Promise.all([first, second]);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit.mock.calls[0][1]).toBe(key);
  });

  it('clears the key when a cart mutation runs', () => {
    const store = createStore();
    store.dispatch('checkout/start');
    expect(store.state.checkout.idempotencyKey).toBeTruthy();

    store.commit('cart/ADD_LINE', line());

    expect(store.state.checkout.idempotencyKey).toBeNull();
  });
});
