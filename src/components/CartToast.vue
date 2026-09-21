<template>
  <p v-if="toast" class="toast" role="status">{{ toast }}</p>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'CartToast',
  computed: {
    ...mapState('ui', ['toast'])
  }
});
</script>

<style lang="scss" scoped>
.toast {
  position: fixed;
  top: 5.25rem;
  right: 1.25rem;
  z-index: 40;
  margin: 0;
  max-width: min(22rem, calc(100vw - 2.5rem));
  padding: 0.85rem 1.1rem;
  background: var(--color-paper-plate);
  border: 1px solid var(--color-line);
  color: var(--color-ink);
  font-size: 0.9375rem;
  line-height: 1.45;
}
</style>
