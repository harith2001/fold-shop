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

function createStore(itemCount = 0): Store<RootState> {
  return new Vuex.Store<RootState>({
    modules: {
      ui,
      cart: {
        namespaced: true,
        getters: {
          isEmpty: () => itemCount === 0
        },
        actions: {
          reprice: jest.fn()
        }
      }
    }
  });
}

function optionButton(wrapper: Wrapper<Vue>, marketId: string) {
  return wrapper.findAll('button').filter((button) => button.text() === marketId);
}

describe('MarketSwitcher', () => {
  afterEach(() => {
    i18n.locale = 'en-GB';
  });

  it('dispatches ui/setMarket with NL then GB when the options are pressed', async () => {
    const store = createStore();
    const dispatch = jest.spyOn(store, 'dispatch');
    const wrapper = mount(MarketSwitcher, {
      localVue,
      store,
      i18n
    });

    await optionButton(wrapper, 'NL').at(0).trigger('click');
    expect(dispatch).toHaveBeenCalledWith('ui/setMarket', 'NL');

    await optionButton(wrapper, 'GB').at(0).trigger('click');
    expect(dispatch).toHaveBeenCalledWith('ui/setMarket', 'GB');
  });

  it('asks for a reprint instead of window.confirm when the cart is not empty', async () => {
    const confirm = jest.spyOn(window, 'confirm');
    const store = createStore(1);
    const dispatch = jest.spyOn(store, 'dispatch');
    const wrapper = mount(MarketSwitcher, {
      localVue,
      store,
      i18n
    });

    await optionButton(wrapper, 'NL').at(0).trigger('click');

    expect(confirm).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith('ui/setMarket', 'NL');
    expect(wrapper.text()).toContain('Prices will reprint in Netherlands.');

    await wrapper
      .findAll('button')
      .filter((button) => button.text() === 'Keep')
      .at(0)
      .trigger('click');
    expect(dispatch).not.toHaveBeenCalledWith('ui/setMarket', 'NL');
    expect(wrapper.text()).not.toContain('Prices will reprint in Netherlands.');

    await optionButton(wrapper, 'NL').at(0).trigger('click');
    await wrapper
      .findAll('button')
      .filter((button) => button.text() === 'Reprint')
      .at(0)
      .trigger('click');
    expect(dispatch).toHaveBeenCalledWith('ui/setMarket', 'NL');
    confirm.mockRestore();
  });
});
