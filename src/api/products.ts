import client from './client';
import { bundledProducts, requireBundledProduct, useBundledCatalog } from './fixtures';
import type { Product } from '@/domain/types';

export function fetchAll(): Promise<Product[]> {
  if (useBundledCatalog()) {
    return Promise.resolve(bundledProducts.slice());
  }
  return client.get<Product[]>('/products').then((response) => response.data);
}

export function fetchOne(id: number): Promise<Product> {
  if (useBundledCatalog()) {
    return Promise.resolve().then(() => requireBundledProduct(id));
  }
  return client.get<Product>(`/products/${id}`).then((response) => response.data);
}
