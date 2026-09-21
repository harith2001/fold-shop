import Vue from 'vue';
import Vuex from 'vuex';
import catalog from './catalog';
import cart from './cart';
import checkout, { checkoutKeyPlugin } from './checkout';
import ui from './ui';
import { persistCartPlugin } from './persist';
import type { CatalogState } from './catalog';
import type { CheckoutState } from './checkout';
import type { UiState } from './ui';
import type { CartState } from '@/domain/types';

Vue.use(Vuex);

export interface RootState {
  catalog: CatalogState;
  ui: UiState;
  cart: CartState;
  checkout: CheckoutState;
}

export default new Vuex.Store<RootState>({
  modules: {
    catalog,
    ui,
    cart,
    checkout: checkout as never
  },
  plugins: [persistCartPlugin, checkoutKeyPlugin],
  strict: process.env.NODE_ENV !== 'production'
});
