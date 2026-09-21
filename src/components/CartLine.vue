<template>
  <article class="line">
    <img class="line__image" :src="image" :alt="name" />
    <div class="line__body">
      <h2 class="line__name">{{ name }}</h2>
      <p class="line__price">
        <PriceTag :cents="line.unitPriceCents" :locale="locale" :currency="line.currency" />
      </p>
      <p v-if="line.promo" class="line__promo">{{ $t('product.promo') }}</p>
      <label class="line__qty">
        {{ $t('cart.qty') }}
        <input
          type="number"
          :value="line.qty"
          min="1"
          :max="stock"
          @change="onQtyChange"
        />
      </label>
      <p v-if="qtyError" class="line__error" role="alert">
        {{ $t('cart.qtyError', { n: stock }) }}
      </p>
      <button class="line__remove" type="button" @click="$emit('remove', line.productId)">
        {{ $t('cart.remove') }}
      </button>
      <button
        class="line__promo-btn"
        type="button"
        :disabled="Boolean(line.promo)"
        @click="$emit('apply-promo', line.productId)"
      >
        {{ $t('cart.applyPromo') }}
      </button>
    </div>
  </article>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';
import PriceTag from '@/components/PriceTag.vue';
import type { CartLine, Product } from '@/domain/types';

export default Vue.extend({
  name: 'CartLine',
  components: {
    PriceTag
  },
  props: {
    line: {
      type: Object as PropType<CartLine>,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  data(): { qtyError: boolean } {
    return { qtyError: false };
  },
  computed: {
    ...mapGetters('ui', ['locale']),
    ...mapGetters('catalog', ['byId']),
    stock(): number {
      const product = (this.byId as (id: number) => Product | undefined)(this.line.productId);
      return product ? product.stock : this.line.qty;
    }
  },
  methods: {
    onQtyChange(event: Event): void {
      const value = Number((event.target as HTMLInputElement).value);
      (event.target as HTMLInputElement).value = String(this.line.qty);
      if (!Number.isInteger(value) || value < 1) {
        return;
      }
      if (value > this.stock) {
        this.qtyError = true;
        return;
      }
      this.qtyError = false;
      this.$emit('change-qty', { productId: this.line.productId, qty: value });
    }
  }
});
</script>

<style lang="scss" scoped>
.line {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-line);
}

.line__image {
  width: 5.5rem;
  height: 5.5rem;
  object-fit: cover;
  background: var(--color-line);
}

.line__body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.line__name {
  margin: 0;
  font-size: 1rem;
}

.line__price,
.line__promo {
  margin: 0;
  color: var(--color-ink-muted);
}

.line__qty {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.line__qty input {
  width: 4rem;
  font: inherit;
}

.line__error {
  margin: 0;
  color: var(--color-accent);
}

.line__remove {
  align-self: flex-start;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
}
</style>
