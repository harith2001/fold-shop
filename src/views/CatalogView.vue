<template>
  <section class="catalog">
    <h1 class="catalog__title">{{ $t('catalog.title') }}</h1>
    <p v-if="loading" class="catalog__status">{{ $t('catalog.loading') }}</p>
    <ErrorBanner v-else-if="error" :message="$t(error)" />
    <template v-else>
      <div class="catalog__toolbar">
        <SearchInput v-model="query" />
        <div class="catalog__chips">
          <button
            type="button"
            class="catalog__chip"
            :aria-pressed="category === null ? 'true' : 'false'"
            @click="category = null"
          >
            {{ $t('catalog.filterAll') }}
          </button>
          <button
            v-for="chip in categories"
            :key="chip"
            type="button"
            class="catalog__chip"
            :aria-pressed="category === chip ? 'true' : 'false'"
            @click="category = chip"
          >
            {{ $t('catalog.categories.' + chip) }}
          </button>
        </div>
        <label class="catalog__sort">
          {{ $t('catalog.sortLabel') }}
          <select v-model="sort">
            <option value="catalog">{{ $t('catalog.sortCatalog') }}</option>
            <option value="price-asc">{{ $t('catalog.sortPriceAsc') }}</option>
            <option value="price-desc">{{ $t('catalog.sortPriceDesc') }}</option>
            <option value="name">{{ $t('catalog.sortName') }}</option>
          </select>
        </label>
        <label class="catalog__stock">
          <input v-model="inStockOnly" type="checkbox" />
          {{ $t('catalog.inStockOnly') }}
        </label>
      </div>
      <p v-if="filteredProducts.length === 0" class="catalog__status">{{ $t('catalog.empty') }}</p>
      <ProductList v-else :products="filteredProducts" :lead="lookbookLead" @add="onAdd" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import ProductList from '@/components/ProductList.vue';
import SearchInput from '@/components/SearchInput.vue';
import ErrorBanner from '@/components/ErrorBanner.vue';
import { filterCatalog } from '@/domain/filters';
import type { CatalogSort } from '@/domain/filters';
import type { CurrencyCode, Product } from '@/domain/types';

const CATEGORIES: Product['category'][] = ['bags', 'lights', 'racks', 'covers'];

export default Vue.extend({
  name: 'CatalogView',
  components: {
    ProductList,
    SearchInput,
    ErrorBanner
  },
  data(): {
    category: Product['category'] | null;
    sort: CatalogSort;
    inStockOnly: boolean;
    query: string;
    search: string;
    searchTimer: number | null;
  } {
    return {
      category: null,
      sort: 'catalog',
      inStockOnly: false,
      query: '',
      search: '',
      searchTimer: null
    };
  },
  computed: {
    ...mapState('catalog', {
      items: 'items',
      loading: 'loading',
      error: 'error'
    }),
    ...mapGetters('ui', ['currency']),
    categories(): Product['category'][] {
      return CATEGORIES;
    },
    filteredProducts(): Product[] {
      return filterCatalog(this.items as Product[], {
        category: this.category,
        inStockOnly: this.inStockOnly,
        sort: this.sort,
        currency: this.$store.getters['ui/currency'] as CurrencyCode,
        nameOf: (product) => String(this.$t(product.nameKey)),
        query: this.search
      });
    },
    lookbookLead(): boolean {
      return this.category === null && !this.inStockOnly && this.search.trim() === '';
    }
  },
  watch: {
    query(next: string): void {
      if (this.searchTimer != null) {
        window.clearTimeout(this.searchTimer);
      }
      this.searchTimer = window.setTimeout(() => {
        this.search = next;
        this.searchTimer = null;
      }, 300);
    }
  },
  created() {
    this.$store.dispatch('catalog/fetchAll');
  },
  beforeDestroy() {
    if (this.searchTimer != null) {
      window.clearTimeout(this.searchTimer);
    }
  },
  methods: {
    onAdd(product: Product): void {
      this.$store.dispatch('cart/add', product);
    }
  }
});
</script>

<style lang="scss" scoped>
.catalog__title {
  margin: 0 0 1.75rem;
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.catalog__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem 1.5rem;
  margin: 0 0 2.5rem;
}

.catalog__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 1.1rem;
}

.catalog__chip {
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-ink-muted);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: inset 0 -1px 0 transparent;

  &[aria-pressed='true'] {
    color: var(--color-ink);
    box-shadow: inset 0 -1px 0 var(--color-ink);
  }
}

.catalog__sort,
.catalog__stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-ink-muted);
  font-size: 0.8125rem;
}

.catalog__sort select {
  font: inherit;
}

.catalog__status {
  margin: 0;
  color: var(--color-ink-muted);
}
</style>
