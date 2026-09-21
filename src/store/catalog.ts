import type { Module } from 'vuex';
import { fetchAll as fetchAllProducts, fetchOne as fetchOneProduct } from '@/api/products';
import type { Product } from '@/domain/types';

export interface CatalogState {
  items: Product[];
  loading: boolean;
  error: string | null;
  activeId: number | null;
}

type RootState = { catalog: CatalogState };

function upsertProduct(items: Product[], product: Product): Product[] {
  const index = items.findIndex((item) => item.id === product.id);
  if (index === -1) {
    return items.concat(product);
  }
  const next = items.slice();
  next.splice(index, 1, product);
  return next;
}

const catalog: Module<CatalogState, RootState> = {
  namespaced: true,
  state: (): CatalogState => ({
    items: [],
    loading: false,
    error: null,
    activeId: null
  }),
  mutations: {
    SET_ITEMS(state, items: Product[]) {
      state.items = items;
    },
    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },
    SET_ERROR(state, error: string | null) {
      state.error = error;
    },
    SET_ACTIVE(state, activeId: number | null) {
      state.activeId = activeId;
    }
  },
  actions: {
    async fetchAll({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const items = await fetchAllProducts();
        commit('SET_ITEMS', items);
      } catch {
        commit('SET_ERROR', 'Could not load the catalog.');
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async fetchOne({ commit, state }, id: number) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const product = await fetchOneProduct(id);
        commit('SET_ITEMS', upsertProduct(state.items, product));
        commit('SET_ACTIVE', id);
      } catch {
        commit('SET_ERROR', 'Could not load the catalog.');
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    byId: (state) => (id: number) => state.items.find((item) => item.id === id),
    inStock: (state) => state.items.filter((item) => item.stock > 0),
    byCategory: (state) => (category: string) =>
      state.items.filter((item) => item.category === category)
  }
};

export default catalog;
