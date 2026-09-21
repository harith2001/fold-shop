<template>
  <div id="app" class="app">
    <h1 class="app__heading">Fold Shop</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App'
});
</script>

<style lang="scss" scoped>
.app {
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.app__heading {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
</style>
