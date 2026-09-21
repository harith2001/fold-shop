import { extractVat, netFromInclusive } from '@/domain/tax';

describe('inclusive VAT extract', () => {
  it('extracts 20% VAT from a GB payable of 12000 cents', () => {
    expect(extractVat(12000, 2000)).toBe(2000);
    expect(netFromInclusive(12000, 2000)).toBe(10000);
  });

  it('extracts 21% VAT from an NL payable of 12100 cents', () => {
    expect(extractVat(12100, 2100)).toBe(2100);
    expect(netFromInclusive(12100, 2100)).toBe(10000);
  });
});
