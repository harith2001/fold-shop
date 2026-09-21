<template>
  <span class="price">{{ formatted }}</span>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { formatCents } from '@/domain/money';
import type { CurrencyCode, LocaleId } from '@/domain/types';

export default Vue.extend({
  name: 'PriceTag',
  props: {
    cents: {
      type: Number,
      required: true
    },
    locale: {
      type: String as PropType<LocaleId>,
      required: true
    },
    currency: {
      type: String as PropType<CurrencyCode>,
      required: true
    }
  },
  computed: {
    formatted(): string {
      return formatCents(this.cents, this.locale, this.currency);
    }
  }
});
</script>

<style lang="scss" scoped>
.price {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
</style>
