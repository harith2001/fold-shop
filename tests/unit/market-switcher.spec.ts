import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VueI18n from 'vue-i18n';
import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import i18n from '@/i18n';
import ui from '@/store/ui';
import type { UiState } from '@/store/ui';
import MarketSwitcher from '@/components/MarketSwitcher.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);

interface RootState {
  ui: UiState;
}

function createStore(): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: { ui }
  });
}

function changeSelect(wrapper: Wrapper<Vue>, marketId: string) {
  const select = wrapper.find('select');
  (select.element as HTMLSelectElement).value = marketId;
  return select.trigger('change');
}

describe('MarketSwitcher', () => {
  afterEach(() => {
    i18n.locale = 'en-GB';
  });

  it('dispatches ui/setMarket with NL then GB when the select changes', async () => {
    const store = createStore();
    const dispatch = jest.spyOn(store, 'dispatch');
    const wrapper = mount(MarketSwitcher, {
      localVue,
      store,
      i18n
    });

    await changeSelect(wrapper, 'NL');
    expect(dispatch).toHaveBeenCalledWith('ui/setMarket', 'NL');

    await changeSelect(wrapper, 'GB');
    expect(dispatch).toHaveBeenCalledWith('ui/setMarket', 'GB');
  });
});
