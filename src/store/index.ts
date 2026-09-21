import Vue from 'vue';
import Vuex from 'vuex';
import catalog from './catalog';
import ui from './ui';
import type { CatalogState } from './catalog';
import type { UiState } from './ui';

Vue.use(Vuex);

export interface RootState {
  catalog: CatalogState;
  ui: UiState;
}

export default new Vuex.Store<RootState>({
  modules: {
    catalog,
    ui
  },
  strict: process.env.NODE_ENV !== 'production'
});
