/**
 * Extract VAT from a VAT-inclusive payable amount.
 *
 * Inclusive: payable = net + vat.
 * net = round(payable * 10000 / (10000 + vatBps))
 * vat = payable - net
 *
 * Do not use round(payable * vatBps / (10000 + vatBps)) — that is the exclusive-add
 * inversion and is wrong for included tax.
 */
export function netFromInclusive(payableCents: number, vatBps: number): number {
  return Math.round((payableCents * 10000) / (10000 + vatBps));
}

export function extractVat(payableCents: number, vatBps: number): number {
  return payableCents - netFromInclusive(payableCents, vatBps);
}
