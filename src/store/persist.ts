import type { Store } from 'vuex';
import type { CartState } from '@/domain/types';

type PersistRoot = { cart: CartState };

export const CART_STORAGE_KEY = 'fold-shop:cart:v1';

export function loadCartFromStorage(): CartState | null {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CartState;
    if (parsed.version !== 1 || !Array.isArray(parsed.lines)) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return null;
  }
}

function writeCart(cart: CartState): void {
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      marketId: cart.marketId,
      lines: cart.lines,
      updatedAt: new Date().toISOString()
    })
  );
}

export function persistCartPlugin(store: Store<PersistRoot>): void {
  store.subscribe((mutation, state) => {
    if (!mutation.type.startsWith('cart/')) {
      return;
    }
    if (mutation.type === 'cart/HYDRATE') {
      return;
    }
    writeCart(state.cart);
  });
}

export function persistCartSnapshot(cart: CartState): void {
  writeCart(cart);
}
