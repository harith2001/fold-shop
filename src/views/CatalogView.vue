<template>
  <section class="catalog">
    <h1 class="catalog__title">Catalog</h1>
    <p v-if="loading" class="catalog__status">Loading…</p>
    <p v-else-if="error" class="catalog__status catalog__status--error" role="alert">{{ error }}</p>
    <p v-else-if="products.length === 0" class="catalog__status">No products found.</p>
    <ProductList v-else :products="products" @add="onAdd" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import ProductList from '@/components/ProductList.vue';
import { fetchAll } from '@/api/products';
import type { Product } from '@/domain/types';

export default Vue.extend({
  name: 'CatalogView',
  components: {
    ProductList
  },
  data() {
    return {
      products: [] as Product[],
      loading: false,
      error: null as string | null
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.products = await fetchAll();
      } catch {
        this.error = 'Could not load the catalog.';
      } finally {
        this.loading = false;
      }
    },
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

.catalog__status {
  margin: 0;
  color: var(--color-ink-muted);
}

.catalog__status--error {
  color: var(--color-accent);
}
</style>
