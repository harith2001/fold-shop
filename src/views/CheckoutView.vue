<template>
  <section class="checkout">
    <h1 class="checkout__title">{{ $t('checkout.title') }}</h1>
    <p v-if="catalogLoading && catalogEmpty" class="checkout__status">
      {{ $t('checkout.loading') }}
    </p>
    <ErrorBanner v-else-if="catalogError && catalogEmpty" :message="$t(catalogError)" />
    <form v-else class="checkout__form" novalidate @submit.prevent="onPay">
      <ErrorBanner v-if="lastError" :message="$t('errors.' + lastError.code)" />
      <div class="checkout__field">
        <label for="checkout-name">
          {{ $t('checkout.name') }}
          <input
            id="checkout-name"
            v-model.trim="name"
            type="text"
            name="name"
            autocomplete="name"
            :aria-invalid="Boolean(fieldErrors.name) ? 'true' : 'false'"
            :aria-describedby="fieldErrors.name ? 'checkout-name-error' : undefined"
            @input="clearError('name')"
          />
        </label>
        <p v-if="fieldErrors.name" id="checkout-name-error" class="checkout__error" role="alert">
          {{ fieldErrors.name }}
        </p>
      </div>
      <div class="checkout__field">
        <label for="checkout-email">
          {{ $t('checkout.email') }}
          <input
            id="checkout-email"
            v-model.trim="email"
            type="email"
            name="email"
            autocomplete="email"
            :aria-invalid="Boolean(fieldErrors.email) ? 'true' : 'false'"
            :aria-describedby="fieldErrors.email ? 'checkout-email-error' : undefined"
            @input="clearError('email')"
          />
        </label>
        <p v-if="fieldErrors.email" id="checkout-email-error" class="checkout__error" role="alert">
          {{ fieldErrors.email }}
        </p>
      </div>
      <div class="checkout__field">
        <label for="checkout-country">
          {{ $t('checkout.country') }}
          <select
            id="checkout-country"
            v-model="country"
            :aria-invalid="Boolean(fieldErrors.country) ? 'true' : 'false'"
            :aria-describedby="fieldErrors.country ? 'checkout-country-error' : undefined"
            @change="clearError('country')"
          >
            <option v-for="market in markets" :key="market.id" :value="market.id">
              {{ $t('markets.' + market.id) }}
            </option>
          </select>
        </label>
        <p
          v-if="fieldErrors.country"
          id="checkout-country-error"
          class="checkout__error"
          role="alert"
        >
          {{ fieldErrors.country }}
        </p>
      </div>
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
import type { CurrencyCode, LocaleId, Market, MarketId } from '@/domain/types';
import { MARKETS } from '@/store/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = 'name' | 'email' | 'country';
type FieldErrors = Partial<Record<FieldName, string>>;

export default Vue.extend({
  name: 'CheckoutView',
  components: {
    CartSummary,
    ErrorBanner
  },
  data(): { name: string; email: string; country: MarketId; fieldErrors: FieldErrors } {
    return {
      name: '',
      email: '',
      country: 'GB',
      fieldErrors: {}
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
    markets(): Market[] {
      return MARKETS;
    },
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
    clearError(field: FieldName): void {
      if (!this.fieldErrors[field]) {
        return;
      }
      const next: FieldErrors = { ...this.fieldErrors };
      delete next[field];
      this.fieldErrors = next;
    },
    validate(): boolean {
      const errors: FieldErrors = {};
      if (!this.name) {
        errors.name = String(this.$t('checkout.errors.nameRequired'));
      }
      if (!this.email) {
        errors.email = String(this.$t('checkout.errors.emailRequired'));
      } else if (!EMAIL_PATTERN.test(this.email)) {
        errors.email = String(this.$t('checkout.errors.emailInvalid'));
      }
      if (!this.country) {
        errors.country = String(this.$t('checkout.errors.countryRequired'));
      }
      this.fieldErrors = errors;
      return Object.keys(errors).length === 0;
    },
    async onPay(): Promise<void> {
      if (!this.validate()) {
        return;
      }
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
  margin: 0 0 1.75rem;
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.checkout__status {
  color: var(--color-ink-muted);
}

.checkout__form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  max-width: 24rem;
}

.checkout__field label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.checkout__form input,
.checkout__form select {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-ink);
}

.checkout__error {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-mark);
  line-height: 1.4;
}

.checkout__review {
  max-width: none;
}

.checkout__review h2 {
  margin: 1.25rem 0 0;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.checkout__pay {
  min-height: 44px;
  margin-top: 0.5rem;
  padding: 0.7rem 1.4rem;
  border: 1px solid var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper-plate);
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
