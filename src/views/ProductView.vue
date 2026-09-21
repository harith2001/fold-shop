<template>
  <section class="pdp">
    <h1 class="pdp__title">{{ title }}</h1>
    <p v-if="loading" class="pdp__status">{{ $t('product.loading') }}</p>
    <ErrorBanner v-else-if="error" :message="$t(error)" />
    <p v-else-if="!product" class="pdp__status">{{ $t('product.empty') }}</p>
    <template v-else>
      <img class="pdp__image" :src="product.image" :alt="title" />
      <p class="pdp__description">{{ $t(product.descriptionKey) }}</p>
      <p class="pdp__price">
        <PriceTag :cents="priceCents" :locale="locale" :currency="currency" />
      </p>
      <label class="pdp__qty">
        {{ $t('product.qty') }}
        <input v-model.number="qty" type="number" min="1" :max="product.stock" :disabled="outOfStock" />
      </label>
      <button type="button" class="pdp__add" :disabled="outOfStock" @click="onAdd">
        {{ outOfStock ? $t('product.outOfStock') : $t('product.addToCart') }}
      </button>
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
  data(): { requestId: number; qty: number } {
    return {
      requestId: 0,
      qty: 1
    };
  },
  computed: {
    ...mapState('catalog', ['loading', 'error', 'items']),
    ...mapGetters('catalog', ['byId', 'byCategory']),
    ...mapGetters('ui', ['locale', 'currency']),
    ...mapGetters('cart', ['lineByProductId']),
    product(): Product | undefined {
      const id = Number(this.$route.params.id);
      return (this.byId as (id: number) => Product | undefined)(id);
    },
    title(): string {
      return this.product ? String(this.$t(this.product.nameKey)) : String(this.$t('product.loading'));
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
      return (this.byCategory as (category: Product['category']) => Product[])(this.product.category)
        .filter((item) => item.id !== this.product!.id)
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
      await this.$store.dispatch('catalog/fetchOne', id);
      if (requestId !== this.requestId) {
        return;
      }
    },
    onAdd(): void {
      if (!this.product || this.outOfStock) {
        return;
      }
      const existing = (this.lineByProductId as (id: number) => { qty: number } | undefined)(
        this.product.id
      );
      const nextQty = (existing ? existing.qty : 0) + Number(this.qty);
      if (nextQty > this.product.stock) {
        return;
      }
      this.$store.dispatch('cart/add', this.product);
      this.$store.dispatch('cart/setQty', { productId: this.product.id, qty: nextQty });
    }
  }
});
</script>

<style lang="scss" scoped>
.pdp__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.pdp__image {
  width: min(100%, 28rem);
  height: auto;
  background: var(--color-line);
}

.pdp__description,
.pdp__status,
.pdp__price {
  margin: 0.75rem 0;
}

.pdp__status {
  color: var(--color-ink-muted);
}

.pdp__qty {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
}

.pdp__qty input {
  width: 4rem;
  font: inherit;
}

.pdp__add {
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.pdp__related {
  margin-top: 2rem;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
}
</style>
