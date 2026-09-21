import Vue from 'vue';
import type { Module } from 'vuex';
import { addLine, reprice, setQty } from '@/domain/cart';
import { discount, payable, subtotal } from '@/domain/money';
import { extractVat } from '@/domain/tax';
import type { CartLine, CartState, CurrencyCode, Market, MarketId, Product } from '@/domain/types';
import { loadCartFromStorage, persistCartSnapshot } from './persist';
import { MARKETS } from './ui';
import i18n from '@/i18n';

type RootState = {
  cart: CartState;
  catalog?: { items: Product[] };
};

type QtyPayload = { productId: number; qty: number };
type RepricePayload = { currency: CurrencyCode; pricesByProductId: Record<number, number> };

function pricesForCurrency(items: Product[], currency: CurrencyCode): Record<number, number> {
  const pricesByProductId: Record<number, number> = {};
  items.forEach((product) => {
    const cents = product.prices[currency];
    if (cents != null) {
      pricesByProductId[product.id] = cents;
    }
  });
  return pricesByProductId;
}

const cart: Module<CartState, RootState> = {
  namespaced: true,
  state: (): CartState => ({
    version: 1,
    marketId: 'GB',
    lines: [],
    updatedAt: new Date().toISOString()
  }),
  mutations: {
    HYDRATE(state, payload: CartState) {
      state.version = payload.version;
      state.marketId = payload.marketId;
      state.lines = payload.lines;
      state.updatedAt = payload.updatedAt;
    },
    ADD_LINE(state, incoming: CartLine) {
      state.lines = addLine(state.lines, incoming);
    },
    SET_QTY(state, { productId, qty }: QtyPayload) {
      state.lines = setQty(state.lines, productId, qty);
    },
    REMOVE_LINE(state, productId: number) {
      state.lines = setQty(state.lines, productId, 0);
    },
    CLEAR(state) {
      state.lines = [];
    },
    REPRICE(state, { currency, pricesByProductId }: RepricePayload) {
      state.lines = reprice(state.lines, currency, pricesByProductId);
    },
    SET_MARKET(state, marketId: CartState['marketId']) {
      state.marketId = marketId;
    },
    APPLY_PROMO(state, productId: number) {
      const index = state.lines.findIndex((line) => line.productId === productId);
      if (index === -1) {
        return;
      }
      Vue.set(state.lines[index], 'promo', true);
    }
  },
  actions: {
    add({ commit, state, rootGetters, dispatch }, product: Product): void {
      const currency = rootGetters['ui/currency'] as CurrencyCode;
      const market = rootGetters['ui/market'] as Market | undefined;
      const unitPriceCents = product.prices[currency];
      if (!market || unitPriceCents == null) {
        return;
      }
      const existing = state.lines.find((line) => line.productId === product.id);
      if ((existing ? existing.qty : 0) + 1 > product.stock) {
        return;
      }
      commit('ADD_LINE', {
        productId: product.id,
        sku: product.sku,
        qty: 1,
        unitPriceCents,
        currency
      });
      dispatch(
        'ui/showToast',
        String(
          i18n.t('cart.added', {
            name: i18n.t(product.nameKey)
          })
        ),
        { root: true }
      );
    },
    reprice({ commit, state, dispatch, rootState, rootGetters }, marketId?: MarketId): void {
      const market = marketId
        ? MARKETS.find((item) => item.id === marketId)
        : (rootGetters['ui/market'] as Market | undefined);
      if (!market) {
        return;
      }
      const catalogItems = rootState.catalog?.items ?? [];
      if (catalogItems.length === 0) {
        commit('SET_MARKET', market.id);
        return;
      }
      const beforeCount = state.lines.length;
      commit('REPRICE', {
        currency: market.currency,
        pricesByProductId: pricesForCurrency(catalogItems, market.currency)
      });
      commit('SET_MARKET', market.id);
      dispatch('ui/setNotice', beforeCount > state.lines.length ? 'errors.LINE_DROPPED' : null, {
        root: true
      });
    },
    persist({ state }): void {
      persistCartSnapshot(state);
    },
    restore({ commit }): void {
      const snapshot = loadCartFromStorage();
      if (snapshot) {
        commit('HYDRATE', snapshot);
      }
    },
    setQty({ commit }, payload: QtyPayload): void {
      commit('SET_QTY', payload);
    },
    remove({ commit }, productId: number): void {
      commit('REMOVE_LINE', productId);
    },
    clear({ commit }): void {
      commit('CLEAR');
    },
    applyPromo({ commit }, productId: number): void {
      commit('APPLY_PROMO', productId);
    }
  },
  getters: {
    itemCount: (state) => state.lines.reduce((sum, line) => sum + line.qty, 0),
    subtotalCents: (state) => subtotal(state.lines),
    discountCents: (state) => discount(subtotal(state.lines)),
    payableCents: (state) => payable(subtotal(state.lines)),
    vatCents: (_state, getters, _rootState, rootGetters) => {
      const market = rootGetters['ui/market'] as Market | undefined;
      return extractVat(getters.payableCents, market ? market.vatBps : 0);
    },
    isEmpty: (state) => state.lines.length === 0,
    lineByProductId: (state) => (productId: number) =>
      state.lines.find((line) => line.productId === productId)
  }
};

export default cart;
