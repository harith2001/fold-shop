import Vuex, { Store } from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, mount } from '@vue/test-utils';
import { fetchAll } from '@/api/products';
import catalog from '@/store/catalog';
import type { CatalogState } from '@/store/catalog';
import type { Product } from '@/domain/types';
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
  prices: { GBP: 8900, EUR: 9900 },
  stock: 12,
  weightGrams: 420
};

interface RootState {
  catalog: CatalogState;
}

function createStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: { catalog }
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

  it('shows Loading… while mapped loading is true', async () => {
    mockFetchAll.mockReturnValue(new Promise(() => undefined));
    const store = createStore();

    const wrapper = mountCatalog(store);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Loading…');
    expect(wrapper.findComponent({ name: 'ProductList' }).exists()).toBe(false);
  });

  it('shows the mapped catalog error after fetchAll fails', async () => {
    mockFetchAll.mockRejectedValue(new Error('Request failed with status code 404'));
    const store = createStore();

    const wrapper = mountCatalog(store);
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[role="alert"]').text()).toBe('Could not load the catalog.');
    expect(wrapper.text()).not.toContain('Request failed with status code 404');
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
    expect(wrapper.text()).not.toContain('Loading…');
  });
});
