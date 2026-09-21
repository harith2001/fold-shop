import client from './client';
import type { Product } from '@/domain/types';

export function fetchAll(): Promise<Product[]> {
  return client.get<Product[]>('/products').then((response) => response.data);
}

export function fetchOne(id: number): Promise<Product> {
  return client.get<Product>(`/products/${id}`).then((response) => response.data);
}
