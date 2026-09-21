import Vuex, { Store } from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import cart from '@/store/cart';
import { extractVat } from '@/domain/tax';
import type { CartLine, CartState, Market } from '@/domain/types';

const localVue = createLocalVue();
localVue.use(Vuex);

const gbMarket: Market = {
  id: 'GB',
  locale: 'en-GB',
  currency: 'GBP',
  vatBps: 2000,
  pricesIncludeVat: true
};

interface RootState {
  cart: CartState;
}

function createStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: {
      cart,
      ui: {
        namespaced: true,
        getters: {
          currency: () => 'GBP',
          market: () => gbMarket
        }
      }
    }
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

describe('cart getters', () => {
  it('empty cart is empty with zero itemCount and discount', () => {
    const store = createStore();

    expect(store.getters['cart/isEmpty']).toBe(true);
    expect(store.getters['cart/itemCount']).toBe(0);
    expect(store.getters['cart/discountCents']).toBe(0);
  });

  it('itemCount is the sum of qty, not the number of lines', () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line({ productId: 1, sku: 'fold-bag-01', qty: 1 }));
    store.commit(
      'cart/ADD_LINE',
      line({ productId: 3, sku: 'light-front', qty: 2, unitPriceCents: 3500 })
    );

    expect(store.getters['cart/itemCount']).toBe(3);
    expect(store.state.cart.lines).toHaveLength(2);
  });

  it('applies the 10% discount for fold-bag-02 at qty 1 GBP 12500', () => {
    const store = createStore();
    store.commit(
      'cart/ADD_LINE',
      line({
        productId: 2,
        sku: 'fold-bag-02',
        qty: 1,
        unitPriceCents: 12500,
        currency: 'GBP'
      })
    );

    expect(store.getters['cart/subtotalCents']).toBe(12500);
    expect(store.getters['cart/discountCents']).toBe(1250);
    expect(store.getters['cart/payableCents']).toBe(11250);
    expect(store.getters['cart/vatCents']).toBe(extractVat(11250, 2000));
  });
});
