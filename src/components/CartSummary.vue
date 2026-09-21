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
      <dd>
        −<PriceTag :cents="discountCents" :locale="locale" :currency="currency" />
      </dd>
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
  margin: 1rem 0 0;
  padding: 0;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 0.4rem;

  dt,
  dd {
    margin: 0;
  }
}

.summary__row--payable {
  font-weight: 600;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-line);
}
</style>
