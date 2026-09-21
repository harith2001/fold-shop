import type { Module } from 'vuex';
import i18n from '@/i18n';
import type { LocaleId, Market, MarketId } from '@/domain/types';

export interface UiState {
  locale: LocaleId;
  marketId: MarketId;
  notice: string | null;
  toast: string | null;
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
  },
  {
    id: 'LK',
    locale: 'si-LK',
    currency: 'LKR',
    vatBps: 1800,
    pricesIncludeVat: true
  }
];

function findMarket(id: string): Market | undefined {
  return MARKETS.find((market) => market.id === id);
}

let toastTimer = 0;

const ui: Module<UiState, RootState> = {
  namespaced: true,
  state: (): UiState => ({
    locale: 'en-GB',
    marketId: 'GB',
    notice: null,
    toast: null
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
    },
    SET_TOAST(state, toast: string | null) {
      state.toast = toast;
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
      if (typeof document !== 'undefined') {
        document.documentElement.lang = market.locale;
      }
      dispatch('cart/reprice', market.id, { root: true });
    },
    setNotice({ commit }, notice: string | null): void {
      commit('SET_NOTICE', notice);
    },
    showToast({ commit }, message: string): void {
      commit('SET_TOAST', message);
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        commit('SET_TOAST', null);
        toastTimer = 0;
      }, 3200);
    }
  },
  getters: {
    market: (state) => findMarket(state.marketId) as Market,
    currency: (state) => (findMarket(state.marketId) as Market).currency,
    locale: (state) => state.locale
  }
};

export default ui;
