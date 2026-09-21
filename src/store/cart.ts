import type { Module } from 'vuex';
import { addLine, reprice, setQty } from '@/domain/cart';
import { discount, payable, subtotal } from '@/domain/money';
import { extractVat } from '@/domain/tax';
import type { CartLine, CartState, CurrencyCode, Market, Product } from '@/domain/types';

type RootState = { cart: CartState };

type QtyPayload = { productId: number; qty: number };
type RepricePayload = { currency: CurrencyCode; pricesByProductId: Record<number, number> };

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
    }
  },
  actions: {
    add({ commit, rootGetters }, product: Product): void {
      const currency = rootGetters['ui/currency'] as CurrencyCode;
      const market = rootGetters['ui/market'] as Market | undefined;
      const unitPriceCents = product.prices[currency];
      if (!market || unitPriceCents == null) {
        return;
      }
      commit('ADD_LINE', {
        productId: product.id,
        sku: product.sku,
        qty: 1,
        unitPriceCents,
        currency
      });
    },
    reprice({ commit }, payload: RepricePayload): void {
      commit('REPRICE', payload);
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
