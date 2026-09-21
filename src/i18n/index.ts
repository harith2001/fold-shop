import Vue from 'vue';
import VueI18n from 'vue-i18n';
import enGB from './en-GB.json';
import nlNL from './nl-NL.json';
import siLK from './si-LK.json';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'en-GB',
  fallbackLocale: 'en-GB',
  messages: {
    'en-GB': enGB as VueI18n.LocaleMessageObject,
    'nl-NL': nlNL as VueI18n.LocaleMessageObject,
    'si-LK': siLK as VueI18n.LocaleMessageObject
  }
});

export default i18n;
