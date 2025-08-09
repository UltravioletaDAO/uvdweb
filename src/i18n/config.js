import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './es.json';
import en from './en.json';
import fr from './fr.json';
import pt from './pt.json';

// Get saved language preference or use browser detection
const savedLanguage = localStorage.getItem('preferredLanguage');

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
    lng: savedLanguage || undefined, // Use saved preference if available
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'fr', 'pt'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage'
    },
    react: {
      useSuspense: false // Prevent suspense issues
    }
  });

// Keep <html lang="..."> in sync for accessibility and SEO
if (typeof document !== 'undefined' && document.documentElement) {
  const initialLang = savedLanguage || (navigator.language || 'es').slice(0, 2);
  document.documentElement.lang = initialLang;
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = (lng || 'es').slice(0, 2);
  });
}

export default i18n; 