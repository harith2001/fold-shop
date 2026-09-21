import { mount } from '@vue/test-utils';
import PriceTag from '@/components/PriceTag.vue';

describe('PriceTag', () => {
  it('formats GBP cents under en-GB', () => {
    const wrapper = mount(PriceTag, {
      propsData: {
        cents: 8900,
        locale: 'en-GB',
        currency: 'GBP'
      }
    });

    expect(wrapper.text()).toBe('£89.00');
  });

  it('formats EUR cents under nl-NL', () => {
    const wrapper = mount(PriceTag, {
      propsData: {
        cents: 9900,
        locale: 'nl-NL',
        currency: 'EUR'
      }
    });

    expect(wrapper.text().replace(/\s/g, ' ')).toMatch(/€\s?99,00/);
  });

  it('formats LKR under si-LK', () => {
    const wrapper = mount(PriceTag, {
      propsData: {
        cents: 3560000,
        locale: 'si-LK',
        currency: 'LKR'
      }
    });

    expect(wrapper.text().replace(/[^\d]/g, '')).toMatch(/35600/);
  });
});
