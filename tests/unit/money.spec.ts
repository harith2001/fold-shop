import { discount, formatCents, lineTotal, payable, subtotal } from '@/domain/money';
import type { CartLine } from '@/domain/types';

function line(partial: Partial<CartLine> & Pick<CartLine, 'unitPriceCents' | 'qty'>): CartLine {
  return {
    productId: 1,
    sku: 'fold-bag-01',
    currency: 'GBP',
    ...partial
  };
}

describe('lineTotal', () => {
  it('multiplies integer cents by quantity', () => {
    expect(lineTotal(3500, 3)).toBe(10500);
    expect(lineTotal(8900, 1)).toBe(8900);
    expect(lineTotal(2900, 0)).toBe(0);
  });
});

describe('subtotal', () => {
  it('sums line totals without converting currencies', () => {
    const lines = [line({ unitPriceCents: 3500, qty: 2 }), line({ unitPriceCents: 2900, qty: 1 })];
    expect(subtotal(lines)).toBe(9900);
  });

  it('is 0 for an empty cart', () => {
    expect(subtotal([])).toBe(0);
  });
});

describe('discount', () => {
  it('is exclusive of the 10000-cent threshold', () => {
    expect(discount(10000)).toBe(0);
    expect(discount(10001)).toBe(1000);
  });

  it('takes 10 percent of subtotals above the threshold, floored', () => {
    expect(discount(12500)).toBe(1250);
    expect(discount(0)).toBe(0);
  });
});

describe('payable', () => {
  it('subtracts discount from subtotal', () => {
    expect(payable(10000)).toBe(10000);
    expect(payable(10001)).toBe(9001);
    expect(payable(12500)).toBe(11250);
  });
});

describe('formatCents', () => {
  it('formats GBP under en-GB', () => {
    expect(formatCents(8900, 'en-GB', 'GBP')).toBe('£89.00');
  });

  it('formats LKR under si-LK', () => {
    const formatted = formatCents(3560000, 'si-LK', 'LKR');
    expect(formatted.replace(/\s/g, ' ')).toMatch(/Rs|රු|LKR/);
    expect(formatted.replace(/[^\d]/g, '')).toMatch(/35600/);
  });
});
