import Vuex, { Store } from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import cart from '@/store/cart';
import type { CartLine, CartState, CurrencyCode, Market, Product } from '@/domain/types';

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

function stubUi(currency: CurrencyCode = 'GBP', market: Market = gbMarket) {
  return {
    namespaced: true,
    getters: {
      currency: () => currency,
      market: () => market
    },
    actions: {
      showToast: jest.fn()
    }
  };
}

function createStore(currency: CurrencyCode = 'GBP'): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: {
      cart,
      ui: stubUi(currency)
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

function product(partial: Partial<Product> = {}): Product {
  return {
    id: 1,
    sku: 'fold-bag-01',
    slug: 'fold-bag-01',
    nameKey: 'products.fold-bag-01.name',
    descriptionKey: 'products.fold-bag-01.description',
    category: 'bags',
    image: '/images/fold-bag-01.svg',
    prices: { GBP: 8900, EUR: 9900, LKR: 3560000 },
    stock: 12,
    weightGrams: 480,
    ...partial
  };
}

describe('cart mutations', () => {
  it('ADD_LINE merges the same productId into one line and does not mutate the incoming line', () => {
    const store = createStore();
    const incoming = Object.freeze(line({ qty: 1 }));
    const snapshot = { ...incoming };

    store.commit('cart/ADD_LINE', incoming);
    store.commit('cart/ADD_LINE', incoming);

    expect(store.state.cart.lines).toEqual([line({ qty: 2 })]);
    expect(incoming).toEqual(snapshot);
  });

  it('SET_QTY 0 removes the line', () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line({ qty: 1 }));

    store.commit('cart/SET_QTY', { productId: 1, qty: 0 });

    expect(store.state.cart.lines).toEqual([]);
  });

  it('SET_QTY 3 updates qty on the same line', () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line({ qty: 1 }));

    store.commit('cart/SET_QTY', { productId: 1, qty: 3 });

    expect(store.state.cart.lines).toEqual([line({ qty: 3 })]);
  });

  it('REPRICE updates cents and currency, keeps qty, and drops lines missing from the lookup', () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line({ qty: 2 }));
    store.commit(
      'cart/ADD_LINE',
      line({ productId: 7, sku: 'cover-rain', qty: 1, unitPriceCents: 5200 })
    );

    store.commit('cart/REPRICE', {
      currency: 'EUR',
      pricesByProductId: { 1: 9900 }
    });

    expect(store.state.cart.lines).toEqual([
      line({ qty: 2, unitPriceCents: 9900, currency: 'EUR' })
    ]);
  });

  it('add copies product.prices[currency], sets marketId from GB, and does not mutate the product', async () => {
    const store = createStore();
    const item = product();
    const frozenPrices = Object.freeze({ ...item.prices });
    const frozen = Object.freeze({ ...item, prices: frozenPrices });

    await store.dispatch('cart/add', frozen);
    await store.dispatch('cart/add', frozen);

    expect(store.state.cart.lines).toEqual([
      line({ qty: 2, unitPriceCents: 8900, currency: 'GBP' })
    ]);
    expect(store.state.cart.marketId).toBe('GB');
    expect(frozen.prices).toEqual({ GBP: 8900, EUR: 9900, LKR: 3560000 });
    expect(frozen).toEqual({ ...item, prices: frozenPrices });
  });

  it('add copies product.prices.EUR when the ui currency is EUR', async () => {
    const store = createStore('EUR');

    await store.dispatch('cart/add', product());

    expect(store.state.cart.lines).toEqual([line({ unitPriceCents: 9900, currency: 'EUR' })]);
  });

  it('add does not create a line when the current currency has no price', async () => {
    const store = createStore();
    const item = product({
      prices: { EUR: 9900 } as Product['prices']
    });

    await store.dispatch('cart/add', item);

    expect(store.state.cart.lines).toEqual([]);
  });
});
