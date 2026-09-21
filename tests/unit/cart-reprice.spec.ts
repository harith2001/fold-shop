import Vuex, { Store } from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import cart from '@/store/cart';
import ui from '@/store/ui';
import type { CartLine, CartState, Product } from '@/domain/types';
import type { CatalogState } from '@/store/catalog';
import type { UiState } from '@/store/ui';

const localVue = createLocalVue();
localVue.use(Vuex);

const foldBag: Product = {
  id: 1,
  sku: 'fold-bag-01',
  slug: 'fold-bag-01',
  nameKey: 'products.fold-bag-01.name',
  descriptionKey: 'products.fold-bag-01.description',
  category: 'bags',
  image: '/images/fold-bag-01.svg',
  prices: { GBP: 8900, EUR: 9900, LKR: 3560000 },
  stock: 12,
  weightGrams: 420
};

interface RootState {
  cart: CartState;
  catalog: CatalogState;
  ui: UiState;
}

function createStore(items: Product[] = [foldBag]): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: {
      cart,
      ui,
      catalog: {
        namespaced: true,
        state: (): CatalogState => ({
          items,
          loading: false,
          error: null,
          activeId: null
        })
      }
    }
  });
}

function line(partial: Partial<CartLine> = {}): CartLine {
  return {
    productId: 1,
    sku: 'fold-bag-01',
    qty: 2,
    unitPriceCents: 8900,
    currency: 'GBP',
    ...partial
  };
}

describe('cart reprice on market switch', () => {
  it('looks up EUR list prices and keeps qty', async () => {
    const store = createStore();
    store.commit('cart/ADD_LINE', line());

    await store.dispatch('ui/setMarket', 'NL');

    expect(store.state.cart.lines).toEqual([line({ unitPriceCents: 9900, currency: 'EUR' })]);
    expect(store.state.cart.marketId).toBe('NL');
  });

  it('drops a line with no price in the new market and sets a notice', async () => {
    const store = createStore([
      {
        ...foldBag,
        prices: { GBP: 8900 } as Product['prices']
      }
    ]);
    store.commit('cart/ADD_LINE', line());

    await store.dispatch('ui/setMarket', 'NL');

    expect(store.state.cart.lines).toEqual([]);
    expect(store.state.ui.notice).toBe('errors.LINE_DROPPED');
  });
});
