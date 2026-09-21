import Vuex, { Store } from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import cart from '@/store/cart';
import { CART_STORAGE_KEY, persistCartPlugin } from '@/store/persist';
import type { CartLine, CartState } from '@/domain/types';

const localVue = createLocalVue();
localVue.use(Vuex);

interface RootState {
  cart: CartState;
}

function createStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: { cart },
    plugins: [persistCartPlugin]
  });
}

function line(partial: Partial<CartLine> = {}): CartLine {
  return {
    productId: 1,
    sku: 'fold-bag-01',
    qty: 1,
    unitPriceCents: 8900,
    currency: 'GBP',
    ...partial
  };
}

function storedCart(partial: Partial<CartState> = {}): CartState {
  return {
    version: 1,
    marketId: 'GB',
    lines: [line()],
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial
  };
}

describe('cart persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes fold-shop:cart:v1 after ADD_LINE', () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line());

    const raw = localStorage.getItem(CART_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as CartState;
    expect(parsed.version).toBe(1);
    expect(parsed.lines).toEqual([line()]);
  });

  it('restore hydrates a version 1 snapshot', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedCart()));
    const store = createStore();

    await store.dispatch('cart/restore');

    expect(store.state.cart.lines).toEqual([line()]);
    expect(store.getters['cart/itemCount']).toBe(1);
  });

  it('restore discards version 2 and leaves an empty cart', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(storedCart({ version: 2 as CartState['version'] }))
    );
    const store = createStore();

    await store.dispatch('cart/restore');

    expect(store.state.cart.lines).toEqual([]);
    expect(store.getters['cart/isEmpty']).toBe(true);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  it('restore with no key leaves an empty cart', async () => {
    const store = createStore();

    await store.dispatch('cart/restore');

    expect(store.state.cart.lines).toEqual([]);
  });
});
