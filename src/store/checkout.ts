import type { Module } from 'vuex';
import { submitCheckout } from '@/api/checkout';
import type { CheckoutFailure } from '@/api/checkout';
import type { CartState, CheckoutPayload, CurrencyCode, Market } from '@/domain/types';

export interface CheckoutState {
  submitting: boolean;
  idempotencyKey: string | null;
  lastError: CheckoutFailure | null;
  orderId: string | null;
}

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `chk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const checkout: Module<CheckoutState, Record<string, unknown>> = {
  namespaced: true,
  state: (): CheckoutState => ({
    submitting: false,
    idempotencyKey: null,
    lastError: null,
    orderId: null
  }),
  mutations: {
    SET_SUBMITTING(state, submitting: boolean) {
      state.submitting = submitting;
    },
    SET_KEY(state, idempotencyKey: string | null) {
      state.idempotencyKey = idempotencyKey;
    },
    SET_ERROR(state, lastError: CheckoutFailure | null) {
      state.lastError = lastError;
    },
    SET_ORDER(state, orderId: string | null) {
      state.orderId = orderId;
    },
    RESET(state) {
      state.submitting = false;
      state.idempotencyKey = null;
      state.lastError = null;
      state.orderId = null;
    }
  },
  actions: {
    start({ state, commit }): void {
      if (state.submitting) {
        return;
      }
      if (!state.idempotencyKey) {
        commit('SET_KEY', createIdempotencyKey());
      }
    },
    async submit(
      { state, commit, dispatch, rootState, rootGetters },
      customer: CheckoutPayload['customer']
    ): Promise<void> {
      dispatch('start');
      if (state.submitting || !state.idempotencyKey) {
        return;
      }
      commit('SET_SUBMITTING', true);
      commit('SET_ERROR', null);
      const market = rootGetters['ui/market'] as Market;
      const cartState = (rootState as { cart: CartState }).cart;
      const payload: CheckoutPayload = {
        idempotencyKey: state.idempotencyKey,
        marketId: market.id,
        currency: rootGetters['ui/currency'] as CurrencyCode,
        lines: cartState.lines.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          unitPriceCents: line.unitPriceCents
        })),
        customer
      };
      try {
        const result = await submitCheckout(payload, state.idempotencyKey);
        if (result.ok) {
          commit('SET_ORDER', result.orderId);
          commit('SET_KEY', null);
          await dispatch('cart/clear', null, { root: true });
          return;
        }
        commit('SET_ERROR', result);
      } finally {
        commit('SET_SUBMITTING', false);
      }
    }
  }
};

export function checkoutKeyPlugin(store: {
  hasModule: (path: string) => boolean;
  commit: (type: string, payload?: unknown) => void;
  subscribe: (fn: (mutation: { type: string }) => void) => void;
}): void {
  store.subscribe((mutation) => {
    if (!mutation.type.startsWith('cart/') || mutation.type === 'cart/HYDRATE') {
      return;
    }
    if (store.hasModule('checkout')) {
      store.commit('checkout/SET_KEY', null);
    }
  });
}

export default checkout;
