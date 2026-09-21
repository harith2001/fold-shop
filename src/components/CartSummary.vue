<template>
  <dl class="summary">
    <div class="summary__row">
      <dt>{{ $t('cart.subtotal') }}</dt>
      <dd>
        <PriceTag :cents="subtotalCents" :locale="locale" :currency="currency" />
      </dd>
    </div>
    <div v-if="discountCents > 0" class="summary__row">
      <dt>{{ $t('cart.discount') }}</dt>
      <dd>−<PriceTag :cents="discountCents" :locale="locale" :currency="currency" /></dd>
    </div>
    <div v-if="showVat" class="summary__row">
      <dt>{{ $t('cart.vat') }}</dt>
      <dd>
        <PriceTag :cents="vatCents" :locale="locale" :currency="currency" />
      </dd>
    </div>
    <div class="summary__row summary__row--payable">
      <dt>{{ $t('cart.payable') }}</dt>
      <dd>
        <PriceTag :cents="payableCents" :locale="locale" :currency="currency" />
      </dd>
    </div>
  </dl>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import PriceTag from '@/components/PriceTag.vue';

export default Vue.extend({
  name: 'CartSummary',
  components: {
    PriceTag
  },
  props: {
    subtotalCents: {
      type: Number,
      required: true
    },
    discountCents: {
      type: Number,
      required: true
    },
    payableCents: {
      type: Number,
      required: true
    },
    vatCents: {
      type: Number,
      default: 0
    },
    showVat: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('ui', ['locale', 'currency'])
  }
});
</script>

<style lang="scss" scoped>
.summary {
  margin: 2.5rem 0 0;
  padding: 0;
  max-width: 24rem;
  margin-left: auto;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 0.45rem;
  font-size: 0.875rem;
  color: var(--color-ink-muted);

  dt,
  dd {
    margin: 0;
  }
}

.summary__row--payable {
  font-weight: 500;
  font-size: 1rem;
  color: var(--color-ink);
  padding-top: 0.65rem;
  border-top: 1px solid var(--color-line);
}
</style>
