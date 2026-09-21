import type { CartLine, CurrencyCode, LocaleId } from './types';

export function lineTotal(unitPriceCents: number, qty: number): number {
  return unitPriceCents * qty;
}

export function subtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line.unitPriceCents, line.qty), 0);
}

/** Demo rule: 10% off subtotal when subtotal > 10000 cents in that currency. */
export function discount(subtotalCents: number): number {
  return subtotalCents > 10000 ? Math.floor(subtotalCents / 10) : 0;
}

export function payable(subtotalCents: number): number {
  return subtotalCents - discount(subtotalCents);
}

export function formatCents(cents: number, locale: LocaleId, currency: CurrencyCode): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
