import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, mount } from '@vue/test-utils';
import i18n from '@/i18n';
import CartSummary from '@/components/CartSummary.vue';
import { extractVat } from '@/domain/tax';
import ui from '@/store/ui';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

function createStore() {
  return new Vuex.Store({
    modules: {
      ui,
      cart: {
        namespaced: true,
        actions: { reprice: jest.fn() }
      }
    }
  });
}

describe('CartSummary VAT', () => {
  afterEach(() => {
    i18n.locale = 'en-GB';
  });

  it('shows included VAT of £20.00 for a GB payable of 12000', () => {
    const wrapper = mount(CartSummary, {
      localVue,
      store: createStore(),
      i18n,
      propsData: {
        subtotalCents: 12000,
        discountCents: 0,
        payableCents: 12000,
        vatCents: extractVat(12000, 2000),
        showVat: true
      }
    });

    expect(wrapper.text()).toContain('VAT (included)');
    expect(wrapper.text()).toContain('£20.00');
  });

  it('shows included VAT of €21.00 after switching to NL with payable 12100', async () => {
    const store = createStore();
    await store.dispatch('ui/setMarket', 'NL');
    const wrapper = mount(CartSummary, {
      localVue,
      store,
      i18n,
      propsData: {
        subtotalCents: 12100,
        discountCents: 0,
        payableCents: 12100,
        vatCents: extractVat(12100, 2100),
        showVat: true
      }
    });

    expect(wrapper.text()).toContain('Btw (inbegrepen)');
    expect(wrapper.text().replace(/\s/g, ' ')).toMatch(/€\s?21,00/);
  });
});
