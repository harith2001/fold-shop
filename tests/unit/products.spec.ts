import { bundledProducts, findBundledProduct, requireBundledProduct } from '@/api/fixtures';

describe('bundled catalog fixtures', () => {
  it('includes the ten seed SKUs and keeps cover-rain at stock 0', () => {
    expect(bundledProducts).toHaveLength(10);
    expect(findBundledProduct(7)?.sku).toBe('cover-rain');
    expect(findBundledProduct(7)?.stock).toBe(0);
  });

  it('returns undefined for a missing id', () => {
    expect(findBundledProduct(999)).toBeUndefined();
  });

  it('throws Not Found when requireBundledProduct misses', () => {
    expect(() => requireBundledProduct(999)).toThrow('Not Found');
  });
});
