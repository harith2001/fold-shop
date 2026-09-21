<template>
  <section class="outcome">
    <h1>{{ $t('order.successTitle') }}</h1>
    <p>{{ $t('order.successBody', { orderId }) }}</p>
    <router-link :to="{ name: 'catalog' }">{{ $t('cart.continue') }}</router-link>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'OrderSuccessView',
  props: {
    orderId: {
      type: String,
      required: true
    }
  }
});
</script>

<style lang="scss" scoped>
.outcome h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}
</style>
