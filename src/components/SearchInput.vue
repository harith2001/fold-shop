<template>
  <label class="search">
    {{ $t('catalog.searchLabel') }}
    <input class="search__input" type="search" :value="value" @input="onInput" />
  </label>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SearchInput',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput(event: Event): void {
      this.$emit('input', (event.target as HTMLInputElement).value);
    }
  }
});
</script>

<style lang="scss" scoped>
.search {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
  color: var(--color-ink-muted);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.search__input {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  min-width: 10rem;
  color: var(--color-ink);
}
</style>
