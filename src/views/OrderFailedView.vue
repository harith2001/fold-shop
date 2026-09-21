<template>
  <section class="outcome">
    <h1>{{ $t('order.failedTitle') }}</h1>
    <ErrorBanner :message="$t(errorKey)" />
    <router-link :to="{ name: 'cart' }">{{ $t('order.failedRetry') }}</router-link>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import ErrorBanner from '@/components/ErrorBanner.vue';

export default Vue.extend({
  name: 'OrderFailedView',
  components: {
    ErrorBanner
  },
  computed: {
    errorKey(): string {
      const code = this.$route.query.code;
      const key = typeof code === 'string' ? `errors.${code}` : 'errors.PAYMENT_FAILED';
      return this.$te(key) ? key : 'errors.PAYMENT_FAILED';
    }
  }
});
</script>

<style lang="scss" scoped>
.outcome h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}
</style>
