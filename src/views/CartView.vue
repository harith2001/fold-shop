<template>
  <section class="placeholder">
    <h1>{{ $t('placeholder.cartTitle') }}</h1>
    <p>{{ $t('placeholder.cartBody') }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CartView'
});
</script>

<style lang="scss" scoped>
.placeholder h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.placeholder p {
  margin: 0;
  color: var(--color-ink-muted);
}
</style>
