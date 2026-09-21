import db from '../../mock-api/db.json';
import type { Product } from '@/domain/types';

export const bundledProducts = db.products as Product[];

export function findBundledProduct(id: number): Product | undefined {
  return bundledProducts.find((product) => product.id === id);
}

export function requireBundledProduct(id: number): Product {
  const product = findBundledProduct(id);
  if (!product) {
    throw new Error('Not Found');
  }
  return product;
}

export function useBundledCatalog(): boolean {
  return process.env.NODE_ENV === 'production';
}
