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
  gap: 0.75rem;
}

.card__media {
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-line);
}

.card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;

  a {
    color: var(--color-ink);
    text-decoration: none;

    &:hover,
    &:focus-visible {
      color: var(--color-accent);
    }
  }
}

.card__price {
  margin: 0;
  color: var(--color-ink-muted);
}

.card__add {
  align-self: flex-start;
  margin-top: 0.25rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    background: var(--color-accent);
    border-color: var(--color-accent);
  }
}
</style>
