import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import CatalogView from '@/views/CatalogView.vue';
import ProductView from '@/views/ProductView.vue';
import CartView from '@/views/CartView.vue';
import CheckoutView from '@/views/CheckoutView.vue';
import OrderSuccessView from '@/views/OrderSuccessView.vue';
import OrderFailedView from '@/views/OrderFailedView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'catalog',
    component: CatalogView
  },
  {
    path: '/product/:id',
    name: 'product',
    component: ProductView,
    props: true
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { requiresCart: true }
  },
  {
    path: '/order/:orderId',
    name: 'success',
    component: OrderSuccessView,
    props: true
  },
  {
    path: '/order-failed',
    name: 'failed',
    component: OrderFailedView
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFoundView
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
