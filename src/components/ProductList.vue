<template>
  <ul class="list" :class="{ 'list--lead': lead }">
    <li v-for="product in products" :key="product.id" class="list__item">
      <ProductCard :product="product" @add="$emit('add', $event)" />
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import type { Product } from '@/domain/types';

export default Vue.extend({
  name: 'ProductList',
  components: {
    ProductCard
  },
  props: {
    products: {
      type: Array as PropType<Product[]>,
      required: true
    },
    lead: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style lang="scss" scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.list__item {
  margin: 0;
}

@media (min-width: 720px) {
  .list {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem 1.75rem;
  }

  .list--lead .list__item:first-child {
    grid-column: 1 / -1;
  }

  .list--lead .list__item:first-child ::v-deep .card {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 2.5rem;
    align-items: end;
  }

  .list--lead .list__item:first-child ::v-deep .card__media {
    aspect-ratio: 4 / 5;
    max-height: 32rem;
  }
}
</style>
