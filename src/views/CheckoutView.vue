<template>
  <section class="checkout">
    <h1 class="checkout__title">{{ $t('checkout.title') }}</h1>
    <p v-if="catalogLoading && catalogEmpty" class="checkout__status">
      {{ $t('checkout.loading') }}
    </p>
    <ErrorBanner v-else-if="catalogError && catalogEmpty" :message="$t(catalogError)" />
    <form v-else class="checkout__form" @submit.prevent="onPay">
      <ErrorBanner v-if="lastError" :message="$t('errors.' + lastError.code)" />
      <label>
        {{ $t('checkout.name') }}
        <input v-model.trim="name" type="text" name="name" required autocomplete="name" />
      </label>
      <label>
        {{ $t('checkout.email') }}
        <input v-model.trim="email" type="email" name="email" required autocomplete="email" />
      </label>
      <label>
        {{ $t('checkout.country') }}
        <select v-model="country">
          <option value="GB">{{ $t('markets.GB') }}</option>
          <option value="NL">{{ $t('markets.NL') }}</option>
        </select>
      </label>
      <section class="checkout__review">
        <h2>{{ $t('checkout.review') }}</h2>
        <CartSummary
          :subtotal-cents="subtotalCents"
          :discount-cents="discountCents"
          :payable-cents="payableCents"
          :vat-cents="vatCents"
          :show-vat="true"
        />
      </section>
      <button type="submit" class="checkout__pay" :disabled="submitting">
        {{ submitting ? $t('checkout.paying') : $t('checkout.pay', { amount: payAmount }) }}
      </button>
    </form>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import CartSummary from '@/components/CartSummary.vue';
import ErrorBanner from '@/components/ErrorBanner.vue';
import { formatCents } from '@/domain/money';
import type { CurrencyCode, LocaleId, MarketId } from '@/domain/types';

export default Vue.extend({
  name: 'CheckoutView',
  components: {
    CartSummary,
    ErrorBanner
  },
  data(): { name: string; email: string; country: MarketId } {
    return {
      name: '',
      email: '',
      country: 'GB'
    };
  },
  computed: {
    ...mapState('checkout', ['submitting', 'lastError', 'orderId']),
    ...mapState('catalog', {
      catalogLoading: 'loading',
      catalogError: 'error',
      catalogItems: 'items'
    }),
    ...mapGetters('cart', ['subtotalCents', 'discountCents', 'payableCents', 'vatCents']),
    ...mapGetters('ui', ['locale', 'currency', 'market']),
    catalogEmpty(): boolean {
      return this.$store.state.catalog.items.length === 0;
    },
    payAmount(): string {
      return formatCents(
        this.$store.getters['cart/payableCents'] as number,
        this.$store.getters['ui/locale'] as LocaleId,
        this.$store.getters['ui/currency'] as CurrencyCode
      );
    }
  },
  created() {
    this.country = this.$store.state.ui.marketId;
    this.$store.commit('checkout/SET_ERROR', null);
    this.$store.dispatch('checkout/start');
    if (this.$store.state.catalog.items.length === 0) {
      this.$store.dispatch('catalog/fetchAll');
    }
  },
  methods: {
    async onPay(): Promise<void> {
      await this.$store.dispatch('checkout/submit', {
        name: this.name,
        email: this.email,
        country: this.country
      });
      const orderId = this.$store.state.checkout.orderId;
      const lastError = this.$store.state.checkout.lastError;
      if (orderId) {
        this.$router.push({ name: 'success', params: { orderId } });
        return;
      }
      if (lastError) {
        this.$router.push({ name: 'failed', query: { code: lastError.code } });
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.checkout__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.checkout__status {
  color: var(--color-ink-muted);
}

.checkout__form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-width: 24rem;
}

.checkout__form label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.checkout__form input,
.checkout__form select {
  font: inherit;
  padding: 0.35rem 0.5rem;
}

.checkout__review h2 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.checkout__pay {
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
