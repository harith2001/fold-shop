<template>
  <section class="catalog">
    <h1 class="catalog__title">{{ $t('catalog.title') }}</h1>
    <p v-if="loading" class="catalog__status">{{ $t('catalog.loading') }}</p>
    <p v-else-if="error" class="catalog__status catalog__status--error" role="alert">
      {{ $t(error) }}
    </p>
    <template v-else>
      <div class="catalog__toolbar">
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
      <ProductList v-else :products="filteredProducts" @add="onAdd" />
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import ProductList from '@/components/ProductList.vue';
import { filterCatalog } from '@/domain/filters';
import type { CatalogSort } from '@/domain/filters';
import type { CurrencyCode, Product } from '@/domain/types';

const CATEGORIES: Product['category'][] = ['bags', 'lights', 'racks', 'covers'];

export default Vue.extend({
  name: 'CatalogView',
  components: {
    ProductList
  },
  data(): {
    category: Product['category'] | null;
    sort: CatalogSort;
    inStockOnly: boolean;
  } {
    return {
      category: null,
      sort: 'catalog',
      inStockOnly: false
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
        nameOf: (product) => String(this.$t(product.nameKey))
      });
    }
  },
  created() {
    this.$store.dispatch('catalog/fetchAll');
  },
  methods: {
    onAdd(): void {
      // Cart wiring lands in S08 / S10. Emit path exists so ProductCard stays honest.
    }
  }
});
</script>

<style lang="scss" scoped>
.catalog__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.catalog__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  margin: 0 0 1.25rem;
}

.catalog__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.catalog__chip {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;

  &[aria-pressed='true'] {
    border-color: var(--color-ink);
    background: var(--color-ink);
    color: var(--color-paper);
  }
}

.catalog__sort,
.catalog__stock {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-ink-muted);
}

.catalog__sort select {
  font: inherit;
}

.catalog__status {
  margin: 0;
  color: var(--color-ink-muted);
}

.catalog__status--error {
  color: var(--color-accent);
}
</style>
