<template>
  <header class="header">
    <div class="header__inner">
      <router-link class="header__logo" :to="{ name: 'catalog' }">{{
        $t('header.logo')
      }}</router-link>
      <nav class="header__nav" :aria-label="$t('header.nav')">
        <router-link class="header__link" :to="{ name: 'catalog' }">{{
          $t('nav.catalog')
        }}</router-link>
        <router-link
          class="header__link header__cart"
          :to="{ name: 'cart' }"
          :aria-label="$tc('cart.itemsCount', itemCount)"
        >
          {{ $t('nav.cart') }}
          <span class="header__count" :class="{ 'header__count--live': itemCount > 0 }">{{
            itemCount
          }}</span>
        </router-link>
        <MarketSwitcher />
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import MarketSwitcher from '@/components/MarketSwitcher.vue';

export default Vue.extend({
  name: 'AppHeader',
  components: {
    MarketSwitcher
  },
  computed: {
    ...mapGetters('cart', ['itemCount'])
  }
});
</script>

<style lang="scss" scoped>
.header {
  border-bottom: 1px solid var(--color-line);
}

.header__inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.15rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.85rem 1.5rem;
}

@media (min-width: 1100px) {
  .header__inner {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}

.header__logo {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--color-ink);
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: none;
    color: var(--color-ink);
  }
}

.header__nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.35rem;
}

.header__cart {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
}

.header__count {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.header__count--live {
  color: var(--color-mark);
}

.header__link {
  color: var(--color-ink-muted);
  text-decoration: none;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  min-height: 44px;
  display: inline-flex;
  align-items: center;

  &.router-link-exact-active {
    color: var(--color-ink);
    box-shadow: inset 0 -1px 0 var(--color-ink);
  }

  &:hover,
  &:focus-visible {
    color: var(--color-ink);
    text-decoration: none;
  }
}
</style>
