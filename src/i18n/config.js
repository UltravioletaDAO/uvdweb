import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './es.json';
import en from './en.json';
import fr from './fr.json';
import pt from './pt.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      pt: { translation: pt }
    },
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

// F0-3: Sync document lang attribute with active i18n language
document.documentElement.lang = (i18n.language || 'es').slice(0, 2);
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = (lng || 'es').slice(0, 2);
});

export default i18n;