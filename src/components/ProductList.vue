<template>
  <ul class="list">
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
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1.5rem;
}

.list__item {
  margin: 0;
}
</style>
