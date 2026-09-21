<template>
  <section class="cart">
    <h1 class="cart__title">{{ $t('cart.title') }}</h1>
    <p v-if="catalogLoading && isEmpty" class="cart__status">{{ $t('cart.loading') }}</p>
    <ErrorBanner v-else-if="catalogError" :message="$t(catalogError)" />
    <template v-else-if="isEmpty">
      <p class="cart__status">{{ $t('cart.empty') }}</p>
      <router-link class="cart__cta" :to="{ name: 'catalog' }">{{
        $t('cart.continue')
      }}</router-link>
    </template>
    <template v-else>
      <ErrorBanner v-if="notice" :message="$t(notice)" />
      <ul class="cart__lines">
        <li v-for="line in lines" :key="line.productId">
          <CartLineItem
            :line="line"
            :name="lineName(line)"
            :image="lineImage(line)"
            @change-qty="onChangeQty"
            @remove="onRemove"
            @apply-promo="onApplyPromo"
          />
        </li>
      </ul>
      <CartSummary
        :subtotal-cents="subtotalCents"
        :discount-cents="discountCents"
        :payable-cents="payableCents"
      />
      <router-link class="cart__checkout" :to="{ name: 'checkout' }">{{
        $t('cart.checkout')
      }}</router-link>
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import CartLineItem from '@/components/CartLine.vue';
import CartSummary from '@/components/CartSummary.vue';
import ErrorBanner from '@/components/ErrorBanner.vue';
import type { CartLine, Product } from '@/domain/types';

export default Vue.extend({
  name: 'CartView',
  components: {
    CartLineItem,
    CartSummary,
    ErrorBanner
  },
  computed: {
    ...mapState('cart', ['lines']),
    ...mapState('ui', ['notice']),
    ...mapState('catalog', {
      catalogLoading: 'loading',
      catalogError: 'error',
      catalogItems: 'items'
    }),
    ...mapGetters('cart', ['isEmpty', 'subtotalCents', 'discountCents', 'payableCents']),
    ...mapGetters('catalog', ['byId'])
  },
  created() {
    if ((this.catalogItems as Product[]).length === 0) {
      this.$store.dispatch('catalog/fetchAll');
    }
  },
  methods: {
    lineName(line: CartLine): string {
      const product = (this.byId as (id: number) => Product | undefined)(line.productId);
      return product ? String(this.$t(product.nameKey)) : line.sku;
    },
    lineImage(line: CartLine): string {
      const product = (this.byId as (id: number) => Product | undefined)(line.productId);
      return product ? product.image : '';
    },
    onChangeQty(payload: { productId: number; qty: number }): void {
      this.$store.dispatch('cart/setQty', payload);
    },
    onRemove(productId: number): void {
      this.$store.dispatch('cart/remove', productId);
    },
    onApplyPromo(productId: number): void {
      this.$store.dispatch('cart/applyPromo', productId);
    }
  }
});
</script>

<style lang="scss" scoped>
.cart__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.cart__status {
  margin: 0 0 1rem;
  color: var(--color-ink-muted);
}

.cart__lines {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cart__cta,
.cart__checkout {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
  text-decoration: none;
}

.cart__checkout:hover,
.cart__checkout:focus-visible,
.cart__cta:hover,
.cart__cta:focus-visible {
  background: var(--color-accent);
  border-color: var(--color-accent);
  text-decoration: none;
}
</style>
