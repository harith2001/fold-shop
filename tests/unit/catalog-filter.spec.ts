import { filterCatalog } from '@/domain/filters';
import type { FilterCatalogOptions } from '@/domain/filters';
import type { Product } from '@/domain/types';

function product(partial: Partial<Product> & Pick<Product, 'id' | 'sku'>): Product {
  return {
    slug: partial.sku,
    nameKey: `products.${partial.sku}.name`,
    descriptionKey: `products.${partial.sku}.description`,
    category: 'bags',
    image: `/images/${partial.sku}.svg`,
    prices: { GBP: 1000, EUR: 1100, LKR: 400000 },
    stock: 1,
    weightGrams: 100,
    ...partial
  };
}

const seedCatalog: Product[] = [
  product({
    id: 1,
    sku: 'fold-bag-01',
    category: 'bags',
    stock: 12,
    prices: { GBP: 8900, EUR: 9900, LKR: 3560000 }
  }),
  product({
    id: 2,
    sku: 'fold-bag-02',
    category: 'bags',
    stock: 4,
    prices: { GBP: 12500, EUR: 13900, LKR: 5000000 }
  }),
  product({
    id: 3,
    sku: 'light-front',
    category: 'lights',
    stock: 20,
    prices: { GBP: 3500, EUR: 3900, LKR: 1400000 }
  }),
  product({
    id: 4,
    sku: 'light-rear',
    category: 'lights',
    stock: 20,
    prices: { GBP: 2900, EUR: 3200, LKR: 1160000 }
  }),
  product({
    id: 5,
    sku: 'rack-rear',
    category: 'racks',
    stock: 6,
    prices: { GBP: 7900, EUR: 8900, LKR: 3160000 }
  }),
  product({
    id: 6,
    sku: 'cover-night',
    category: 'covers',
    stock: 8,
    prices: { GBP: 4500, EUR: 4900, LKR: 1800000 }
  }),
  product({
    id: 7,
    sku: 'cover-rain',
    category: 'covers',
    stock: 0,
    prices: { GBP: 5200, EUR: 5800, LKR: 2080000 }
  }),
  product({
    id: 8,
    sku: 'light-set',
    category: 'lights',
    stock: 10,
    prices: { GBP: 5900, EUR: 6500, LKR: 2360000 }
  }),
  product({
    id: 9,
    sku: 'bag-mini',
    category: 'bags',
    stock: 15,
    prices: { GBP: 4900, EUR: 5500, LKR: 1960000 }
  }),
  product({
    id: 10,
    sku: 'rack-front',
    category: 'racks',
    stock: 3,
    prices: { GBP: 6400, EUR: 7200, LKR: 2560000 }
  })
];

function options(overrides: Partial<FilterCatalogOptions> = {}): FilterCatalogOptions {
  return {
    category: null,
    inStockOnly: false,
    sort: 'catalog',
    currency: 'GBP',
    nameOf: (item) => item.sku,
    ...overrides
  };
}

function skus(products: Product[]): string[] {
  return products.map((item) => item.sku);
}

describe('filterCatalog', () => {
  it('returns all ten seed products in catalog order, including cover-rain', () => {
    const result = filterCatalog(seedCatalog, options());

    expect(result).toHaveLength(10);
    expect(skus(result)).toEqual(skus(seedCatalog));
    expect(result.find((item) => item.sku === 'cover-rain')).toBeDefined();
    expect(result).not.toBe(seedCatalog);
  });

  it('excludes cover-rain when inStockOnly is true and keeps nine products', () => {
    const result = filterCatalog(seedCatalog, options({ inStockOnly: true }));

    expect(result).toHaveLength(9);
    expect(result.find((item) => item.sku === 'cover-rain')).toBeUndefined();
    expect(result.every((item) => item.stock > 0)).toBe(true);
  });

  it('returns only cover-night and cover-rain for category covers', () => {
    const result = filterCatalog(seedCatalog, options({ category: 'covers' }));

    expect(skus(result)).toEqual(['cover-night', 'cover-rain']);
  });

  it('keeps the covers category when composing in-stock and price-asc GBP', () => {
    const result = filterCatalog(
      seedCatalog,
      options({ category: 'covers', inStockOnly: true, sort: 'price-asc', currency: 'GBP' })
    );

    expect(skus(result)).toEqual(['cover-night']);
    expect(result.every((item) => item.category === 'covers')).toBe(true);
  });

  it('sorts bags by GBP cents ascending: bag-mini, fold-bag-01, fold-bag-02', () => {
    const result = filterCatalog(
      seedCatalog,
      options({ category: 'bags', sort: 'price-asc', currency: 'GBP' })
    );

    expect(result.map((item) => item.prices.GBP)).toEqual([4900, 8900, 12500]);
    expect(skus(result)).toEqual(['bag-mini', 'fold-bag-01', 'fold-bag-02']);
  });

  it('sorts bags by GBP cents descending: fold-bag-02, fold-bag-01, bag-mini', () => {
    const result = filterCatalog(
      seedCatalog,
      options({ category: 'bags', sort: 'price-desc', currency: 'GBP' })
    );

    expect(result.map((item) => item.prices.GBP)).toEqual([12500, 8900, 4900]);
    expect(skus(result)).toEqual(['fold-bag-02', 'fold-bag-01', 'bag-mini']);
  });

  it('sorts by nameOf after filtering, using sku lexicographic order', () => {
    const result = filterCatalog(
      seedCatalog,
      options({
        category: 'bags',
        sort: 'name',
        nameOf: (item) => item.sku
      })
    );

    expect(skus(result)).toEqual(['bag-mini', 'fold-bag-01', 'fold-bag-02']);
  });

  it('returns an empty array when cover-rain is the only row and inStockOnly is true', () => {
    const coverRain = seedCatalog.find((item) => item.sku === 'cover-rain') as Product;
    const result = filterCatalog([coverRain], options({ inStockOnly: true }));

    expect(result).toEqual([]);
  });

  it('filters to light SKUs when the query is light', () => {
    const result = filterCatalog(
      seedCatalog,
      options({
        query: 'light',
        nameOf: (item) => item.sku
      })
    );

    expect(skus(result)).toEqual(['light-front', 'light-rear', 'light-set']);
  });
});
