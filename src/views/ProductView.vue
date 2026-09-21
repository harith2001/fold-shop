<template>
  <section class="pdp">
    <h1 v-if="!product" class="pdp__title">
      {{ loading ? $t('product.loading') : $t('product.empty') }}
    </h1>
    <ErrorBanner v-if="error && !product" :message="$t(error)" />
    <template v-if="product">
      <div class="pdp__spread">
        <div class="pdp__plate">
          <img class="pdp__image" :src="product.image" :alt="title" />
        </div>
        <div class="pdp__caption">
          <h1 class="pdp__title">{{ title }}</h1>
          <p class="pdp__sku">{{ product.sku }}</p>
          <p class="pdp__description">{{ $t(product.descriptionKey) }}</p>
          <p class="pdp__price">
            <PriceTag :cents="priceCents" :locale="locale" :currency="currency" />
          </p>
          <label class="pdp__qty">
            {{ $t('product.qty') }}
            <input
              v-model.number="qty"
              type="number"
              min="1"
              :max="product.stock"
              :disabled="outOfStock"
            />
          </label>
          <p v-if="qtyError" class="pdp__status" role="alert">
            {{ $t('cart.qtyError', { n: product.stock }) }}
          </p>
          <button type="button" class="pdp__add" :disabled="outOfStock" @click="onAdd">
            {{ outOfStock ? $t('product.outOfStock') : $t('product.addToCart') }}
          </button>
        </div>
      </div>
      <section v-if="related.length" class="pdp__related">
        <h2>{{ $t('product.related') }}</h2>
        <ul>
          <li v-for="item in related" :key="item.id">
            <router-link :to="{ name: 'product', params: { id: String(item.id) } }">
              {{ $t(item.nameKey) }}
            </router-link>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import ErrorBanner from '@/components/ErrorBanner.vue';
import PriceTag from '@/components/PriceTag.vue';
import type { CurrencyCode, Product } from '@/domain/types';

export default Vue.extend({
  name: 'ProductView',
  components: {
    ErrorBanner,
    PriceTag
  },
  data(): { requestId: number; qty: number; qtyError: boolean } {
    return {
      requestId: 0,
      qty: 1,
      qtyError: false
    };
  },
  computed: {
    ...mapState('catalog', ['loading', 'error', 'items']),
    ...mapGetters('catalog', ['byId', 'byCategory']),
    ...mapGetters('ui', ['locale', 'currency']),
    ...mapGetters('cart', ['lineByProductId']),
    product(): Product | undefined {
      const id = Number(this.$route.params.id);
      return (this.$store.getters['catalog/byId'] as (id: number) => Product | undefined)(id);
    },
    title(): string {
      return this.product
        ? String(this.$t(this.product.nameKey))
        : String(this.$t('product.loading'));
    },
    priceCents(): number {
      if (!this.product) {
        return 0;
      }
      return this.product.prices[this.$store.getters['ui/currency'] as CurrencyCode];
    },
    outOfStock(): boolean {
      return !this.product || this.product.stock < 1;
    },
    related(): Product[] {
      if (!this.product) {
        return [];
      }
      const current = this.product;
      return (
        this.$store.getters['catalog/byCategory'] as (category: Product['category']) => Product[]
      )(current.category)
        .filter((item) => item.id !== current.id)
        .slice(0, 3);
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id: string) {
        this.load(Number(id));
      }
    }
  },
  created() {
    this.$store.dispatch('catalog/fetchAll');
  },
  methods: {
    async load(id: number): Promise<void> {
      const requestId = this.requestId + 1;
      this.requestId = requestId;
      this.qty = 1;
      this.qtyError = false;
      await this.$store.dispatch('catalog/fetchOne', id);
      if (requestId !== this.requestId) {
        return;
      }
    },
    onAdd(): void {
      if (!this.product || this.outOfStock) {
        return;
      }
      const existing = (
        this.$store.getters['cart/lineByProductId'] as (id: number) => { qty: number } | undefined
      )(this.product.id);
      const nextQty = (existing ? existing.qty : 0) + Number(this.qty);
      if (nextQty > this.product.stock) {
        this.qtyError = true;
        return;
      }
      this.qtyError = false;
      this.$store.dispatch('cart/add', this.product);
      this.$store.dispatch('cart/setQty', { productId: this.product.id, qty: nextQty });
    }
  }
});
</script>

<style lang="scss" scoped>
.pdp__spread {
  display: grid;
  gap: 1.75rem;
}

@media (min-width: 720px) {
  .pdp__spread {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 3rem;
    align-items: start;
  }
}

.pdp__title {
  margin: 0 0 0.35rem;
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.15;
  max-width: 38rem;
}

.pdp__plate {
  background: var(--color-paper-plate);
  border: 1px solid var(--color-line);
}

.pdp__image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: contain;
  padding: 2rem;
}

.pdp__caption {
  max-width: 38rem;
}

.pdp__sku,
.pdp__description,
.pdp__status,
.pdp__price {
  margin: 0 0 0.85rem;
}

.pdp__sku {
  font-size: 0.8125rem;
  color: var(--color-ink-muted);
}

.pdp__description {
  line-height: 1.55;
}

.pdp__status {
  color: var(--color-ink-muted);
}

.pdp__price {
  font-size: 0.95rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.pdp__qty {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  color: var(--color-ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pdp__qty input {
  width: 3.5rem;
  font: inherit;
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-ink);
}

.pdp__add {
  min-height: 44px;
  padding: 0.7rem 1.4rem;
  border: 1px solid var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper-plate);
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.pdp__related {
  margin-top: 3.5rem;
  max-width: 38rem;

  h2 {
    margin: 0 0 0.75rem;
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  a {
    font-family: var(--font-serif);
    font-size: 1.125rem;
    text-decoration: none;

    &:hover,
    &:focus-visible {
      text-decoration: underline;
      text-underline-offset: 0.18em;
    }
  }
}
</style>
