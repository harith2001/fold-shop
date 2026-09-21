import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import './assets/styles/main.scss';

Vue.config.productionTip = false;

store.dispatch('cart/restore');
const restoredMarket = store.state.cart.marketId;
if (restoredMarket) {
  store.commit('ui/SET_MARKET', restoredMarket);
  i18n.locale = store.state.ui.locale;
}

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App)
}).$mount('#app');
