import type { CartLine, CurrencyCode } from './types';

export function addLine(lines: CartLine[], incoming: CartLine): CartLine[] {
  let merged = false;
  const next = lines.map((line) => {
    if (line.productId !== incoming.productId) {
      return { ...line };
    }
    merged = true;
    return { ...line, qty: line.qty + incoming.qty };
  });
  if (!merged) {
    next.push({ ...incoming });
  }
  return next;
}

export function setQty(lines: CartLine[], productId: number, qty: number): CartLine[] {
  if (qty < 1) {
    return lines.filter((line) => line.productId !== productId).map((line) => ({ ...line }));
  }
  return lines.map((line) => (line.productId === productId ? { ...line, qty } : { ...line }));
}

export function reprice(
  lines: CartLine[],
  currency: CurrencyCode,
  pricesByProductId: Record<number, number>
): CartLine[] {
  return lines.reduce<CartLine[]>((next, line) => {
    const unitPriceCents = pricesByProductId[line.productId];
    if (unitPriceCents == null) {
      return next;
    }
    next.push({ ...line, unitPriceCents, currency });
    return next;
  }, []);
}
