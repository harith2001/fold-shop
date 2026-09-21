<template>
  <div id="app" class="app">
    <AppHeader />
    <CartToast />
    <main class="app__main">
      <ErrorBanner v-if="notice" :message="$t(notice)" />
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import AppHeader from '@/components/AppHeader.vue';
import CartToast from '@/components/CartToast.vue';
import ErrorBanner from '@/components/ErrorBanner.vue';

export default Vue.extend({
  name: 'App',
  components: {
    AppHeader,
    CartToast,
    ErrorBanner
  },
  computed: {
    ...mapState('ui', ['notice'])
  }
});
</script>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
}

.app__main {
  max-width: 72rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4.5rem;
}

@media (min-width: 1100px) {
  .app__main {
    padding-left: 3rem;
    padding-right: 3rem;
  }
}
</style>
