import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, mount } from '@vue/test-utils';
import i18n from '@/i18n';
import CartLine from '@/components/CartLine.vue';
import type { CartLine as CartLineModel, Product } from '@/domain/types';
import type { CatalogState } from '@/store/catalog';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

const product: Product = {
  id: 1,
  sku: 'fold-bag-01',
  slug: 'fold-bag-01',
  nameKey: 'products.fold-bag-01.name',
  descriptionKey: 'products.fold-bag-01.description',
  category: 'bags',
  image: '/images/fold-bag-01.svg',
  prices: { GBP: 8900, EUR: 9900 },
  stock: 2,
  weightGrams: 420
};

const line: CartLineModel = {
  productId: 1,
  sku: 'fold-bag-01',
  qty: 1,
  unitPriceCents: 8900,
  currency: 'GBP'
};

function createStore() {
  return new Vuex.Store({
    modules: {
      ui: {
        namespaced: true,
        getters: {
          locale: () => 'en-GB'
        }
      },
      catalog: {
        namespaced: true,
        state: (): CatalogState => ({
          items: [product],
          loading: false,
          error: null,
          activeId: null
        }),
        getters: {
          byId: (state: CatalogState) => (id: number) => state.items.find((item) => item.id === id)
        }
      }
    }
  });
}

describe('CartLine', () => {
  afterEach(() => {
    i18n.locale = 'en-GB';
  });

  it('does not emit change-qty when the qty exceeds stock', async () => {
    const wrapper = mount(CartLine, {
      localVue,
      store: createStore(),
      i18n,
      propsData: {
        line,
        name: 'City pannier',
        image: product.image
      }
    });

    const input = wrapper.find('input');
    (input.element as HTMLInputElement).value = '3';
    await input.trigger('change');

    expect(wrapper.emitted('change-qty')).toBeUndefined();
    expect(wrapper.find('[role="alert"]').text()).toContain('2');
  });

  it('emits change-qty when the qty is within stock', async () => {
    const wrapper = mount(CartLine, {
      localVue,
      store: createStore(),
      i18n,
      propsData: {
        line,
        name: 'City pannier',
        image: product.image
      }
    });

    const input = wrapper.find('input');
    (input.element as HTMLInputElement).value = '2';
    await input.trigger('change');

    expect(wrapper.emitted('change-qty')).toEqual([[{ productId: 1, qty: 2 }]]);
  });
});
