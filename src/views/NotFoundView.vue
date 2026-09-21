<template>
  <section class="placeholder">
    <h1>{{ $t('placeholder.notFoundTitle') }}</h1>
    <p>
      <router-link :to="{ name: 'catalog' }">{{ $t('placeholder.notFoundBack') }}</router-link>
    </p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NotFoundView'
});
</script>

<style lang="scss" scoped>
.placeholder h1 {
  margin: 0 0 0.65rem;
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.placeholder p {
  margin: 0;
}
</style>
