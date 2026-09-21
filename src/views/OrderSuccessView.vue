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
  margin: 0 0 0.65rem;
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.outcome p,
.outcome a {
  max-width: 38rem;
}
</style>
