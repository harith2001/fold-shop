import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, mount } from '@vue/test-utils';
import i18n from '@/i18n';
import CheckoutView from '@/views/CheckoutView.vue';
import type { Product } from '@/domain/types';

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
  prices: { GBP: 8900, EUR: 9900, LKR: 3560000 },
  stock: 12,
  weightGrams: 420
};

function createStore() {
  return new Vuex.Store({
    modules: {
      checkout: {
        namespaced: true,
        state: () => ({
          submitting: false,
          lastError: null,
          orderId: null,
          idempotencyKey: 'key'
        }),
        mutations: {
          SET_ERROR: jest.fn()
        },
        actions: {
          start: jest.fn(),
          submit: jest.fn()
        }
      },
      catalog: {
        namespaced: true,
        state: () => ({
          items: [product],
          loading: false,
          error: null
        })
      },
      cart: {
        namespaced: true,
        getters: {
          subtotalCents: () => 8900,
          discountCents: () => 0,
          payableCents: () => 8900,
          vatCents: () => 1483
        }
      },
      ui: {
        namespaced: true,
        state: () => ({
          marketId: 'GB',
          locale: 'en-GB'
        }),
        getters: {
          locale: () => 'en-GB',
          currency: () => 'GBP',
          market: () => ({ id: 'GB', locale: 'en-GB', currency: 'GBP', vatBps: 2000 })
        }
      }
    }
  });
}

describe('CheckoutView inline errors', () => {
  afterEach(() => {
    i18n.locale = 'en-GB';
  });

  it('shows custom field errors instead of native validation on empty submit', async () => {
    const wrapper = mount(CheckoutView, {
      localVue,
      store: createStore(),
      i18n,
      stubs: { CartSummary: true, ErrorBanner: true }
    });

    await wrapper.find('form').trigger('submit');

    const alerts = wrapper.findAll('[role="alert"]');
    expect(alerts.wrappers.map((node) => node.text())).toEqual(
      expect.arrayContaining(['Enter a name.', 'Enter an email address.'])
    );
    expect(wrapper.find('#checkout-name').attributes('aria-invalid')).toBe('true');
  });

  it('shows a custom invalid-email message', async () => {
    const wrapper = mount(CheckoutView, {
      localVue,
      store: createStore(),
      i18n,
      stubs: { CartSummary: true, ErrorBanner: true }
    });

    await wrapper.find('#checkout-name').setValue('Elena Hart');
    await wrapper.find('#checkout-email').setValue('not-an-email');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.find('#checkout-email-error').text()).toBe('Enter a valid email address.');
  });
});
