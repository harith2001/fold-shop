<template>
  <section class="catalog">
    <h1 class="catalog__title">{{ $t('catalog.title') }}</h1>
    <p v-if="loading" class="catalog__status">{{ $t('catalog.loading') }}</p>
    <p v-else-if="error" class="catalog__status catalog__status--error" role="alert">
      {{ $t(error) }}
    </p>
    <p v-else-if="products.length === 0" class="catalog__status">{{ $t('catalog.empty') }}</p>
    <ProductList v-else :products="products" @add="onAdd" />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import ProductList from '@/components/ProductList.vue';

export default Vue.extend({
  name: 'CatalogView',
  components: {
    ProductList
  },
  computed: {
    ...mapState('catalog', {
      products: 'items',
      loading: 'loading',
      error: 'error'
    })
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

.catalog__status {
  margin: 0;
  color: var(--color-ink-muted);
}

.catalog__status--error {
  color: var(--color-accent);
}
</style>
