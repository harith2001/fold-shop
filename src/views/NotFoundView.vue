<template>
  <section class="placeholder">
    <h1>Page not found</h1>
    <p>
      <router-link :to="{ name: 'catalog' }">Back to catalog</router-link>
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
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.placeholder p {
  margin: 0;
}
</style>
