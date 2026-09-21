<template>
  <p v-if="message" class="banner" role="alert">{{ message }}</p>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ErrorBanner',
  props: {
    message: {
      type: String,
      default: ''
    }
  }
});
</script>

<style lang="scss" scoped>
.banner {
  margin: 0 0 1rem;
  padding: 0.6rem 0.75rem;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  background: var(--color-paper);
}
</style>
