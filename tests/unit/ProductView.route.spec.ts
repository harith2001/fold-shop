import Vuex, { Store } from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import { fetchAll, fetchOne } from '@/api/products';
import catalog from '@/store/catalog';
import type { CatalogState } from '@/store/catalog';
import type { Product } from '@/domain/types';
import ProductView from '@/views/ProductView.vue';
import i18n from '@/i18n';

jest.mock('@/api/products');

const mockFetchAll = fetchAll as jest.MockedFunction<typeof fetchAll>;
const mockFetchOne = fetchOne as jest.MockedFunction<typeof fetchOne>;

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

const productOne: Product = {
  id: 1,
  sku: 'fold-bag-01',
  slug: 'fold-bag-01',
  nameKey: 'products.fold-bag-01.name',
  descriptionKey: 'products.fold-bag-01.description',
  category: 'bags',
  image: '/images/fold-bag-01.svg',
  prices: { GBP: 8900, EUR: 9900 },
  stock: 12,
  weightGrams: 420
};

const productTwo: Product = {
  ...productOne,
  id: 2,
  sku: 'fold-bag-02',
  slug: 'fold-bag-02',
  nameKey: 'products.fold-bag-02.name',
  descriptionKey: 'products.fold-bag-02.description'
};

interface RootState {
  catalog: CatalogState;
}

function createStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: {
      catalog,
      ui: {
        namespaced: true,
        getters: {
          locale: () => 'en-GB',
          currency: () => 'GBP'
        }
      },
      cart: {
        namespaced: true,
        getters: {
          lineByProductId: () => () => undefined
        },
        actions: {
          add: jest.fn(),
          setQty: jest.fn()
        }
      }
    }
  });
}

describe('ProductView route watch', () => {
  beforeEach(() => {
    mockFetchAll.mockReset();
    mockFetchOne.mockReset();
    mockFetchAll.mockResolvedValue([productOne, productTwo]);
    mockFetchOne.mockImplementation((id: number) =>
      Promise.resolve(id === 2 ? productTwo : productOne)
    );
  });

  afterEach(() => {
    i18n.locale = 'en-GB';
  });

  it('calls fetchOne with the new id when $route.params.id changes', async () => {
    const wrapper = shallowMount(ProductView, {
      localVue,
      store: createStore(),
      i18n,
      mocks: { $route: { params: { id: '1' } } },
      stubs: ['router-link']
    });

    expect(mockFetchOne).toHaveBeenCalledWith(1);

    const watch = wrapper.vm.$options.watch as Record<
      string,
      { handler: (id: string) => Promise<void> }
    >;
    await watch['$route.params.id'].handler.call(wrapper.vm, '2');

    expect(mockFetchOne).toHaveBeenCalledWith(2);
  });
});
