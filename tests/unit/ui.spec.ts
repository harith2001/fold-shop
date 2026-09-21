import Vuex, { Store } from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import i18n from '@/i18n';
import ui, { MARKETS } from '@/store/ui';
import type { UiState } from '@/store/ui';

const localVue = createLocalVue();
localVue.use(Vuex);

interface RootState {
  ui: UiState;
}

function createStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: { ui }
  });
}

describe('ui module', () => {
  it('defaults i18n locale to en-GB at construction', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const isolatedI18n = require('@/i18n').default as { locale: string };
      expect(isolatedI18n.locale).toBe('en-GB');
    });
  });

  describe('store', () => {
    beforeEach(() => {
      i18n.locale = 'en-GB';
    });

    afterEach(() => {
      i18n.locale = 'en-GB';
    });

    it('defaults to GB, en-GB, and GBP', () => {
      const store = createStore();

      expect(store.state.ui.marketId).toBe('GB');
      expect(store.state.ui.locale).toBe('en-GB');
      expect(store.getters['ui/market']).toEqual(MARKETS[0]);
      expect(store.getters['ui/currency']).toBe('GBP');
      expect(store.getters['ui/locale']).toBe('en-GB');
    });

    it('setMarket NL updates market, locale, currency, and i18n together', async () => {
      const store = createStore();

      await store.dispatch('ui/setMarket', 'NL');

      expect(store.state.ui.marketId).toBe('NL');
      expect(store.state.ui.locale).toBe('nl-NL');
      expect(store.getters['ui/market']).toEqual(MARKETS[1]);
      expect(store.getters['ui/currency']).toBe('EUR');
      expect(store.getters['ui/locale']).toBe('nl-NL');
      expect(i18n.locale).toBe('nl-NL');
    });

    it('setMarket GB from NL restores GB, en-GB, and GBP', async () => {
      const store = createStore();
      await store.dispatch('ui/setMarket', 'NL');

      await store.dispatch('ui/setMarket', 'GB');

      expect(store.state.ui.marketId).toBe('GB');
      expect(store.state.ui.locale).toBe('en-GB');
      expect(store.getters['ui/currency']).toBe('GBP');
      expect(store.getters['ui/locale']).toBe('en-GB');
      expect(i18n.locale).toBe('en-GB');
    });

    it('unknown market id is a no-op and does not throw', async () => {
      const store = createStore();
      await store.dispatch('ui/setMarket', 'NL');

      await expect(store.dispatch('ui/setMarket', 'US')).resolves.toBeUndefined();

      expect(store.state.ui.marketId).toBe('NL');
      expect(store.state.ui.locale).toBe('nl-NL');
      expect(store.getters['ui/currency']).toBe('EUR');
      expect(i18n.locale).toBe('nl-NL');
    });

    it('setMarket does not dispatch cart actions', async () => {
      const store = createStore();
      const dispatch = jest.spyOn(store, 'dispatch');

      await store.dispatch('ui/setMarket', 'NL');

      expect(dispatch.mock.calls.filter(([type]) => String(type).startsWith('cart/'))).toEqual([]);
    });
  });
});
