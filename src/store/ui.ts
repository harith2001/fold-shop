import type { Module } from 'vuex';
import i18n from '@/i18n';
import type { LocaleId, Market, MarketId } from '@/domain/types';

export interface UiState {
  locale: LocaleId;
  marketId: MarketId;
  notice: string | null;
}

type RootState = { ui: UiState };

export const MARKETS: Market[] = [
  {
    id: 'GB',
    locale: 'en-GB',
    currency: 'GBP',
    vatBps: 2000,
    pricesIncludeVat: true
  },
  {
    id: 'NL',
    locale: 'nl-NL',
    currency: 'EUR',
    vatBps: 2100,
    pricesIncludeVat: true
  }
];

function findMarket(id: string): Market | undefined {
  return MARKETS.find((market) => market.id === id);
}

const ui: Module<UiState, RootState> = {
  namespaced: true,
  state: (): UiState => ({
    locale: 'en-GB',
    marketId: 'GB',
    notice: null
  }),
  mutations: {
    SET_MARKET(state, marketId: MarketId) {
      const market = findMarket(marketId);
      if (!market) {
        return;
      }
      state.marketId = market.id;
      state.locale = market.locale;
    },
    SET_NOTICE(state, notice: string | null) {
      state.notice = notice;
    }
  },
  actions: {
    setMarket({ commit, dispatch }, marketId: string): void {
      const market = findMarket(marketId);
      if (!market) {
        return;
      }
      commit('SET_MARKET', market.id);
      i18n.locale = market.locale;
      dispatch('cart/reprice', market.id, { root: true });
    },
    setNotice({ commit }, notice: string | null): void {
      commit('SET_NOTICE', notice);
    }
  },
  getters: {
    market: (state) => findMarket(state.marketId) as Market,
    currency: (state) => (findMarket(state.marketId) as Market).currency,
    locale: (state) => state.locale
  }
};

export default ui;
