import Vuex, { Store } from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, mount } from '@vue/test-utils';
import i18n from '@/i18n';
import ui from '@/store/ui';
import type { UiState } from '@/store/ui';
import type { Product } from '@/domain/types';
import ProductCard from '@/components/ProductCard.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

const foldBag01: Product = {
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
  ui: UiState;
}

function createStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: {
      ui,
      cart: {
        namespaced: true,
        actions: {
          reprice: jest.fn()
        }
      }
    }
  });
}

function mountCard(store: Store<RootState>) {
  return mount(ProductCard, {
    localVue,
    store,
    i18n,
    propsData: { product: foldBag01 },
    stubs: { RouterLink: true }
  });
}

describe('ProductCard', () => {
  afterEach(() => {
    i18n.locale = 'en-GB';
  });

  it('passes GBP cents, locale, and currency to PriceTag on the default market', () => {
    const wrapper = mountCard(createStore());

    const tag = wrapper.findComponent({ name: 'PriceTag' });
    expect(tag.props('cents')).toBe(8900);
    expect(tag.props('currency')).toBe('GBP');
    expect(tag.props('locale')).toBe('en-GB');
  });

  it('passes EUR cents, locale, and currency to PriceTag on the NL market', async () => {
    const store = createStore();
    await store.dispatch('ui/setMarket', 'NL');

    const wrapper = mountCard(store);

    const tag = wrapper.findComponent({ name: 'PriceTag' });
    expect(tag.props('cents')).toBe(9900);
    expect(tag.props('currency')).toBe('EUR');
    expect(tag.props('locale')).toBe('nl-NL');
    expect(wrapper.find('.card__title').text()).toBe('Stadsfietstas');
    expect(wrapper.find('.card__title').text()).not.toContain('fold-bag-01');
    expect(wrapper.find('.card__add').text()).toBe('In winkelwagen');
  });
});
