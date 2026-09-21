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
  margin: 0 0 1.25rem;
  padding: 0;
  color: var(--color-mark);
  border: 0;
  background: none;
}
</style>
