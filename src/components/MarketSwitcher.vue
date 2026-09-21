<template>
  <div class="switcher">
    <div class="switcher__options" role="group" :aria-label="$t('header.market')">
      <button
        v-for="id in marketIds"
        :key="id"
        type="button"
        class="switcher__option"
        :aria-pressed="marketId === id ? 'true' : 'false'"
        :aria-label="$t('markets.' + id)"
        @click="onSelect(id)"
      >
        {{ id }}
      </button>
    </div>
    <p v-if="pending" class="switcher__note" role="status">
      {{ $t('market.confirm', { market: $t('markets.' + pending) }) }}
      <button type="button" class="switcher__action" @click="onReprint">
        {{ $t('market.reprint') }}
      </button>
      <button type="button" class="switcher__action" @click="onKeep">
        {{ $t('market.keep') }}
      </button>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import type { MarketId } from '@/domain/types';

export default Vue.extend({
  name: 'MarketSwitcher',
  data(): { pending: MarketId | null } {
    return { pending: null };
  },
  computed: {
    ...mapState('ui', ['marketId']),
    ...mapGetters('cart', ['isEmpty']),
    marketIds(): MarketId[] {
      return ['GB', 'NL'];
    }
  },
  methods: {
    onSelect(next: MarketId): void {
      const previous = this.$store.state.ui.marketId as MarketId;
      if (next === previous) {
        this.pending = null;
        return;
      }
      if (this.$store.getters['cart/isEmpty']) {
        this.pending = null;
        this.$store.dispatch('ui/setMarket', next);
        return;
      }
      this.pending = next;
    },
    onReprint(): void {
      if (!this.pending) {
        return;
      }
      this.$store.dispatch('ui/setMarket', this.pending);
      this.pending = null;
    },
    onKeep(): void {
      this.pending = null;
    }
  }
});
</script>

<style lang="scss" scoped>
.switcher {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
}

.switcher__options {
  display: flex;
  gap: 0.75rem;
}

.switcher__option {
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-ink-muted);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: inset 0 -1px 0 transparent;

  &[aria-pressed='true'] {
    color: var(--color-ink);
    box-shadow: inset 0 -1px 0 var(--color-ink);
  }

  &:hover,
  &:focus-visible {
    color: var(--color-ink);
  }
}

.switcher__note {
  margin: 0;
  max-width: 16rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--color-ink-muted);
  text-align: right;
}

.switcher__action {
  margin-left: 0.65rem;
  padding: 0;
  min-height: 44px;
  border: 0;
  background: none;
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 0.18em;
  cursor: pointer;
}
</style>
