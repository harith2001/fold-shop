<template>
  <header class="header">
    <router-link class="header__logo" :to="{ name: 'catalog' }">Fold Shop</router-link>
    <nav class="header__nav" aria-label="Primary">
      <router-link class="header__link" :to="{ name: 'catalog' }">Catalog</router-link>
      <router-link class="header__link" :to="{ name: 'cart' }">Cart</router-link>
    </nav>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AppHeader'
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-line);
  margin-bottom: 1.5rem;
}

.header__logo {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: none;
    color: var(--color-accent);
  }
}

.header__nav {
  display: flex;
  gap: 1rem;
}

.header__link {
  color: var(--color-ink-muted);
  text-decoration: none;
  font-weight: 500;

  &.router-link-exact-active {
    color: var(--color-ink);
  }

  &:hover,
  &:focus-visible {
    color: var(--color-accent);
  }
}
</style>
