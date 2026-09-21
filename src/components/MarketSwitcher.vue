<template>
  <select class="switcher" :value="marketId" :aria-label="$t('header.market')" @change="onChange">
    <option value="GB">{{ $t('markets.GB') }}</option>
    <option value="NL">{{ $t('markets.NL') }}</option>
  </select>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'MarketSwitcher',
  computed: {
    ...mapState('ui', ['marketId'])
  },
  methods: {
    onChange(event: Event): void {
      const select = event.target as HTMLSelectElement;
      this.$store.dispatch('ui/setMarket', select.value);
    }
  }
});
</script>

<style lang="scss" scoped>
.switcher {
  font: inherit;
  color: var(--color-ink-muted);
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  padding: 0.2rem 0.4rem;
}
</style>
