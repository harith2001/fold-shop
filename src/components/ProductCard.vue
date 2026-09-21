<template>
  <article class="card">
    <router-link class="card__media" :to="{ name: 'product', params: { id: String(product.id) } }">
      <img class="card__image" :src="product.image" :alt="$t(product.nameKey)" />
    </router-link>
    <div class="card__body">
      <h2 class="card__title">
        <router-link :to="{ name: 'product', params: { id: String(product.id) } }">
          {{ $t(product.nameKey) }}
        </router-link>
      </h2>
      <p class="card__sku">{{ product.sku }}</p>
      <p class="card__price">
        <PriceTag :cents="priceCents" :locale="locale" :currency="currency" />
      </p>
      <button
        class="card__add"
        type="button"
        :disabled="product.stock < 1"
        @click="$emit('add', product)"
      >
        {{ product.stock < 1 ? $t('product.outOfStock') : $t('product.addToCart') }}
      </button>
    </div>
  </article>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';
import PriceTag from '@/components/PriceTag.vue';
import type { CurrencyCode, Product } from '@/domain/types';

export default Vue.extend({
  name: 'ProductCard',
  components: {
    PriceTag
  },
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true
    }
  },
  computed: {
    ...mapGetters('ui', ['locale', 'currency']),
    priceCents(): number {
      return this.product.prices[this.$store.getters['ui/currency'] as CurrencyCode];
    }
  }
});
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.card__media {
  display: block;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--color-paper-plate);
  border: 1px solid var(--color-line);
  text-decoration: none;
}

.card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1.5rem;
  display: block;
}

.card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}

.card__title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.375rem;
  font-weight: 400;
  line-height: 1.25;

  a {
    color: var(--color-ink);
    text-decoration: none;

    &:hover,
    &:focus-visible {
      text-decoration: underline;
      text-underline-offset: 0.18em;
    }
  }
}

.card__sku {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-ink-muted);
}

.card__price {
  margin: 0.15rem 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.card__add {
  margin-top: 0.35rem;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-ink);
  font-size: 0.875rem;
  text-decoration: underline;
  text-underline-offset: 0.18em;
  cursor: pointer;

  &:disabled {
    color: var(--color-ink-muted);
    text-decoration: none;
    cursor: not-allowed;
  }
}
</style>
