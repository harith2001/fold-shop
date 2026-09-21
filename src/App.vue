<template>
  <div id="app" class="app">
    <AppHeader />
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
import ErrorBanner from '@/components/ErrorBanner.vue';

export default Vue.extend({
  name: 'App',
  components: {
    AppHeader,
    ErrorBanner
  },
  computed: {
    ...mapState('ui', ['notice'])
  }
});
</script>

<style lang="scss" scoped>
.app {
  max-width: 60rem;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.app__main {
  min-height: 50vh;
}
</style>
