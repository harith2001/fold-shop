import Vue from 'vue';
import Vuex from 'vuex';
import catalog from './catalog';
import type { CatalogState } from './catalog';

Vue.use(Vuex);

export interface RootState {
  catalog: CatalogState;
}

export default new Vuex.Store<RootState>({
  modules: {
    catalog
  },
  strict: process.env.NODE_ENV !== 'production'
});
