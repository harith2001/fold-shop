<template>
  <div id="app" class="app">
    <AppHeader />
    <main class="app__main">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppHeader from '@/components/AppHeader.vue';

export default Vue.extend({
  name: 'App',
  components: {
    AppHeader
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
