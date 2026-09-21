<template>
  <label class="search">
    {{ $t('catalog.searchLabel') }}
    <input
      class="search__input"
      type="search"
      :value="value"
      :placeholder="$t('catalog.search')"
      @input="onInput"
    />
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
  align-items: center;
  gap: 0.4rem;
  color: var(--color-ink-muted);
}

.search__input {
  font: inherit;
  min-width: 10rem;
}
</style>
