import Vuex, { Store } from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, mount } from '@vue/test-utils';
import { fetchAll } from '@/api/products';
import catalog from '@/store/catalog';
import type { CatalogState } from '@/store/catalog';
import type { CurrencyCode, Product } from '@/domain/types';
import CatalogView from '@/views/CatalogView.vue';
import enGB from '@/i18n/en-GB.json';

jest.mock('@/api/products');

const mockFetchAll = fetchAll as jest.MockedFunction<typeof fetchAll>;

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

const sampleProduct: Product = {
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

const coverRain: Product = {
  id: 7,
  sku: 'cover-rain',
  slug: 'cover-rain',
  nameKey: 'products.cover-rain.name',
  descriptionKey: 'products.cover-rain.description',
  category: 'covers',
  image: '/images/cover-rain.svg',
  prices: { GBP: 5200, EUR: 5800, LKR: 2080000 },
  stock: 0,
  weightGrams: 380
};

const bagMini: Product = {
  id: 9,
  sku: 'bag-mini',
  slug: 'bag-mini',
  nameKey: 'products.bag-mini.name',
  descriptionKey: 'products.bag-mini.description',
  category: 'bags',
  image: '/images/bag-mini.svg',
  prices: { GBP: 4900, EUR: 5500, LKR: 1960000 },
  stock: 15,
  weightGrams: 180
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
          currency: (): CurrencyCode => 'GBP'
        }
      }
    }
  });
}

function createI18n(): VueI18n {
  return new VueI18n({
    locale: 'en-GB',
    fallbackLocale: 'en-GB',
    messages: {
      'en-GB': enGB as VueI18n.LocaleMessageObject
    }
  });
}

function mountCatalog(store: Store<RootState>) {
  return mount(CatalogView, {
    localVue,
    store,
    i18n: createI18n(),
    stubs: { ProductList: true }
  });
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('CatalogView', () => {
  beforeEach(() => {
    mockFetchAll.mockReset();
  });

  it('dispatches catalog/fetchAll on create', () => {
    mockFetchAll.mockResolvedValue([]);
    const store = createStore();
    const dispatch = jest.spyOn(store, 'dispatch');

    mountCatalog(store);

    expect(dispatch).toHaveBeenCalledWith('catalog/fetchAll');
  });

  it('shows Setting the plates… while mapped loading is true', async () => {
    mockFetchAll.mockReturnValue(new Promise(() => undefined));
    const store = createStore();

    const wrapper = mountCatalog(store);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Setting the plates…');
    expect(wrapper.findComponent({ name: 'ProductList' }).exists()).toBe(false);
    expect(wrapper.find('.catalog__toolbar').exists()).toBe(false);
  });

  it('shows the mapped catalog error after fetchAll fails', async () => {
    mockFetchAll.mockRejectedValue(new Error('Request failed with status code 404'));
    const store = createStore();

    const wrapper = mountCatalog(store);
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[role="alert"]').text()).toBe('Could not load the catalog.');
    expect(wrapper.text()).not.toContain('Request failed with status code 404');
    expect(wrapper.find('.catalog__toolbar').exists()).toBe(false);
  });

  it('passes mapped items into ProductList after fetchAll resolves', async () => {
    mockFetchAll.mockResolvedValue([sampleProduct]);
    const store = createStore();

    const wrapper = mountCatalog(store);
    await flushPromises();
    await wrapper.vm.$nextTick();

    const list = wrapper.findComponent({ name: 'ProductList' });
    expect(list.exists()).toBe(true);
    expect(list.props('products')).toEqual([sampleProduct]);
    expect(wrapper.text()).not.toContain('Setting the plates…');
  });

  it('drops cover-rain from ProductList when the in-stock toggle is checked', async () => {
    mockFetchAll.mockResolvedValue([sampleProduct, coverRain]);
    const store = createStore();

    const wrapper = mountCatalog(store);
    await flushPromises();
    await wrapper.vm.$nextTick();

    const list = wrapper.findComponent({ name: 'ProductList' });
    expect(list.props('products').map((product: Product) => product.sku)).toEqual([
      'fold-bag-01',
      'cover-rain'
    ]);

    await wrapper.find('input[type="checkbox"]').setChecked();

    expect(
      wrapper
        .findComponent({ name: 'ProductList' })
        .props('products')
        .map((product: Product) => product.sku)
    ).toEqual(['fold-bag-01']);

    await wrapper.find('input[type="checkbox"]').setChecked(false);

    expect(
      wrapper
        .findComponent({ name: 'ProductList' })
        .props('products')
        .map((product: Product) => product.sku)
    ).toEqual(['fold-bag-01', 'cover-rain']);
  });

  it('shows catalog.empty and hides ProductList when the filtered list is empty', async () => {
    mockFetchAll.mockResolvedValue([coverRain]);
    const store = createStore();

    const wrapper = mountCatalog(store);
    await flushPromises();
    await wrapper.vm.$nextTick();

    await wrapper.find('input[type="checkbox"]').setChecked();

    expect(wrapper.text()).toContain('Nothing in this issue matches.');
    expect(wrapper.findComponent({ name: 'ProductList' }).exists()).toBe(false);
    expect(wrapper.find('.catalog__toolbar').exists()).toBe(true);
  });

  it('narrows ProductList to covers when that chip is pressed, then restores all', async () => {
    mockFetchAll.mockResolvedValue([sampleProduct, coverRain]);
    const store = createStore();

    const wrapper = mountCatalog(store);
    await flushPromises();
    await wrapper.vm.$nextTick();

    const covers = wrapper.findAll('.catalog__chip').filter((chip) => chip.text() === 'Covers');
    await covers.at(0).trigger('click');

    expect(
      wrapper
        .findComponent({ name: 'ProductList' })
        .props('products')
        .map((product: Product) => product.sku)
    ).toEqual(['cover-rain']);

    const all = wrapper.findAll('.catalog__chip').filter((chip) => chip.text() === 'All');
    await all.at(0).trigger('click');

    expect(
      wrapper
        .findComponent({ name: 'ProductList' })
        .props('products')
        .map((product: Product) => product.sku)
    ).toEqual(['fold-bag-01', 'cover-rain']);
  });

  it('reorders ProductList by price-asc and by translated name', async () => {
    mockFetchAll.mockResolvedValue([sampleProduct, bagMini]);
    const store = createStore();

    const wrapper = mountCatalog(store);
    await flushPromises();
    await wrapper.vm.$nextTick();

    await wrapper.find('select').setValue('price-asc');

    expect(
      wrapper
        .findComponent({ name: 'ProductList' })
        .props('products')
        .map((product: Product) => product.sku)
    ).toEqual(['bag-mini', 'fold-bag-01']);

    await wrapper.find('select').setValue('price-desc');

    expect(
      wrapper
        .findComponent({ name: 'ProductList' })
        .props('products')
        .map((product: Product) => product.sku)
    ).toEqual(['fold-bag-01', 'bag-mini']);

    await wrapper.find('select').setValue('name');

    expect(
      wrapper
        .findComponent({ name: 'ProductList' })
        .props('products')
        .map((product: Product) => product.sku)
    ).toEqual(['fold-bag-01', 'bag-mini']);
  });
});
