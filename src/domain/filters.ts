import type { CurrencyCode, Product } from './types';

export type CatalogSort = 'catalog' | 'price-asc' | 'price-desc' | 'name';

export interface FilterCatalogOptions {
  category: Product['category'] | null;
  inStockOnly: boolean;
  sort: CatalogSort;
  currency: CurrencyCode;
  nameOf: (product: Product) => string;
  query?: string;
}

export function filterCatalog(products: Product[], options: FilterCatalogOptions): Product[] {
  const needle = (options.query ?? '').trim().toLowerCase();
  const filtered = products.filter((product) => {
    if (options.category !== null && product.category !== options.category) {
      return false;
    }
    if (options.inStockOnly && product.stock <= 0) {
      return false;
    }
    if (needle && !options.nameOf(product).toLowerCase().includes(needle)) {
      return false;
    }
    return true;
  });

  if (options.sort === 'catalog') {
    return filtered;
  }

  const sorted = filtered.slice();
  if (options.sort === 'price-asc') {
    sorted.sort((a, b) => a.prices[options.currency] - b.prices[options.currency]);
  } else if (options.sort === 'price-desc') {
    sorted.sort((a, b) => b.prices[options.currency] - a.prices[options.currency]);
  } else {
    sorted.sort((a, b) => options.nameOf(a).localeCompare(options.nameOf(b)));
  }
  return sorted;
}
