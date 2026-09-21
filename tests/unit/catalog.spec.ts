import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import { fetchAll, fetchOne } from '@/api/products';
import appStore from '@/store';
import catalog from '@/store/catalog';
import type { CatalogState } from '@/store/catalog';
import type { Product } from '@/domain/types';

jest.mock('@/api/products');

const mockFetchAll = fetchAll as jest.MockedFunction<typeof fetchAll>;
const mockFetchOne = fetchOne as jest.MockedFunction<typeof fetchOne>;

const localVue = createLocalVue();
localVue.use(Vuex);

function product(partial: Partial<Product> & Pick<Product, 'id' | 'sku'>): Product {
  return {
    slug: partial.sku,
    nameKey: `products.${partial.sku}.name`,
    descriptionKey: `products.${partial.sku}.description`,
    category: 'bags',
    image: `/images/${partial.sku}.svg`,
    prices: { GBP: 1000, EUR: 1100 },
    stock: 1,
    weightGrams: 100,
    ...partial
  };
}

const seedCatalog: Product[] = [
  product({
    id: 1,
    sku: 'fold-bag-01',
    category: 'bags',
    stock: 12,
    prices: { GBP: 8900, EUR: 9900 }
  }),
  product({
    id: 2,
    sku: 'fold-bag-02',
    category: 'bags',
    stock: 4,
    prices: { GBP: 12500, EUR: 13900 }
  }),
  product({
    id: 3,
    sku: 'light-front',
    category: 'lights',
    stock: 20,
    prices: { GBP: 3500, EUR: 3900 }
  }),
  product({
    id: 4,
    sku: 'light-rear',
    category: 'lights',
    stock: 20,
    prices: { GBP: 2900, EUR: 3200 }
  }),
  product({
    id: 5,
    sku: 'rack-rear',
    category: 'racks',
    stock: 6,
    prices: { GBP: 7900, EUR: 8900 }
  }),
  product({
    id: 6,
    sku: 'cover-night',
    category: 'covers',
    stock: 8,
    prices: { GBP: 4500, EUR: 4900 }
  }),
  product({
    id: 7,
    sku: 'cover-rain',
    category: 'covers',
    stock: 0,
    prices: { GBP: 5200, EUR: 5800 }
  }),
  product({
    id: 8,
    sku: 'light-set',
    category: 'lights',
    stock: 10,
    prices: { GBP: 5900, EUR: 6500 }
  }),
  product({
    id: 9,
    sku: 'bag-mini',
    category: 'bags',
    stock: 15,
    prices: { GBP: 4900, EUR: 5500 }
  }),
  product({
    id: 10,
    sku: 'rack-front',
    category: 'racks',
    stock: 3,
    prices: { GBP: 6400, EUR: 7200 }
  })
];

interface RootState {
  catalog: CatalogState;
}

function createStore(strict = true): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: { catalog },
    strict
  });
}

describe('catalog module', () => {
  beforeEach(() => {
    mockFetchAll.mockReset();
    mockFetchOne.mockReset();
  });

  describe('fetchAll', () => {
    it('sets loading true then false, items to the product array, and error null', async () => {
      let resolveAll: (value: Product[]) => void = () => undefined;
      mockFetchAll.mockReturnValue(
        new Promise((resolve) => {
          resolveAll = resolve;
        })
      );

      const store = createStore();
      store.commit('catalog/SET_ERROR', 'network down');
      const pending = store.dispatch('catalog/fetchAll');

      expect(store.state.catalog.loading).toBe(true);
      expect(store.state.catalog.error).toBeNull();

      resolveAll(seedCatalog);
      await pending;

      expect(store.state.catalog.loading).toBe(false);
      expect(store.state.catalog.items).toEqual(seedCatalog);
      expect(store.state.catalog.error).toBeNull();
    });

    it('leaves items unchanged, clears loading, and sets error when the API rejects', async () => {
      const existing = [seedCatalog[0]];
      const store = createStore();
      store.commit('catalog/SET_ITEMS', existing);
      mockFetchAll.mockRejectedValue(new Error('network down'));

      await expect(store.dispatch('catalog/fetchAll')).resolves.toBeUndefined();

      expect(store.state.catalog.items).toEqual(existing);
      expect(store.state.catalog.loading).toBe(false);
      expect(store.state.catalog.error).toBe('Could not load the catalog.');
    });
  });

  describe('fetchOne', () => {
    it('sets activeId and upserts the product into items without clearing the list', async () => {
      const existing = seedCatalog[0];
      const fetched = seedCatalog[2];
      let resolveOne: (value: Product) => void = () => undefined;
      mockFetchOne.mockReturnValue(
        new Promise((resolve) => {
          resolveOne = resolve;
        })
      );

      const store = createStore();
      store.commit('catalog/SET_ITEMS', [existing]);
      store.commit('catalog/SET_ERROR', 'network down');

      const pending = store.dispatch('catalog/fetchOne', fetched.id);

      expect(store.state.catalog.loading).toBe(true);
      expect(store.state.catalog.error).toBeNull();

      resolveOne(fetched);
      await pending;

      expect(mockFetchOne).toHaveBeenCalledWith(fetched.id);
      expect(store.state.catalog.activeId).toBe(fetched.id);
      expect(store.state.catalog.items).toEqual([existing, fetched]);
      expect(store.state.catalog.loading).toBe(false);
      expect(store.state.catalog.error).toBeNull();
    });

    it('replaces an existing item with the same id', async () => {
      const stale = { ...seedCatalog[0], stock: 99 };
      const fresh = seedCatalog[0];
      const store = createStore();
      store.commit('catalog/SET_ITEMS', [stale]);
      mockFetchOne.mockResolvedValue(fresh);

      await store.dispatch('catalog/fetchOne', fresh.id);

      expect(store.state.catalog.items).toEqual([fresh]);
      expect(store.state.catalog.activeId).toBe(fresh.id);
    });

    it('leaves activeId unchanged, sets error, and clears loading on 404', async () => {
      const store = createStore();
      store.commit('catalog/SET_ACTIVE', 3);
      store.commit('catalog/SET_ITEMS', [seedCatalog[0]]);
      mockFetchOne.mockRejectedValue(new Error('Not Found'));

      await expect(store.dispatch('catalog/fetchOne', 99)).resolves.toBeUndefined();

      expect(store.state.catalog.activeId).toBe(3);
      expect(store.state.catalog.items).toEqual([seedCatalog[0]]);
      expect(store.state.catalog.error).toBe('Could not load the catalog.');
      expect(store.state.catalog.loading).toBe(false);
    });
  });

  describe('getters', () => {
    it('byId returns the matching product or undefined', () => {
      const store = createStore();
      store.commit('catalog/SET_ITEMS', seedCatalog);

      expect(store.getters['catalog/byId'](1)).toEqual(seedCatalog[0]);
      expect(store.getters['catalog/byId'](404)).toBeUndefined();
    });

    it('inStock returns every item with stock > 0 and excludes cover-rain', () => {
      const store = createStore();
      store.commit('catalog/SET_ITEMS', seedCatalog);

      const inStock: Product[] = store.getters['catalog/inStock'];
      expect(inStock.every((item) => item.stock > 0)).toBe(true);
      expect(inStock.find((item) => item.sku === 'cover-rain')).toBeUndefined();
      expect(inStock).toHaveLength(9);
    });

    it('byCategory returns only that category, or [] for unknown', () => {
      const store = createStore();
      store.commit('catalog/SET_ITEMS', seedCatalog);

      expect(store.getters['catalog/byCategory']('covers')).toEqual([
        seedCatalog[5],
        seedCatalog[6]
      ]);
      expect(store.getters['catalog/byCategory']('unknown')).toEqual([]);
    });
  });

  describe('strict mode', () => {
    const originalErrorHandler = Vue.config.errorHandler;

    afterEach(() => {
      Vue.config.errorHandler = originalErrorHandler;
    });

    it('throws when catalog state is mutated outside a mutation', () => {
      let caught: Error | undefined;
      Vue.config.errorHandler = (err: Error) => {
        caught = err;
      };

      appStore.state.catalog.items.push(seedCatalog[0]);

      expect(caught).toBeInstanceOf(Error);
      expect(caught && caught.message).toMatch(
        /do not mutate vuex store state outside mutation handlers/i
      );
    });
  });
});
