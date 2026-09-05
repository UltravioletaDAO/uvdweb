import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { createLanguageDetector, DETECTION_OPTIONS, SUPPORTED_LNGS } from './langDetector';

import { loadI18nBundle } from './loadBundle';

import es from './es.json';
import en from './en.json';
import fr from './fr.json';
import pt from './pt.json';

i18n
  .use(createLanguageDetector())
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      pt: { translation: pt }
    },
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LNGS,
    detection: DETECTION_OPTIONS,
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false
    },
    react: {
      // Los bundles lazy (loadBundle.js) llegan después del primer render:
      // re-renderizar los consumidores cuando addResourceBundle registra recursos.
      bindI18nStore: 'added'
    }
  });

// F0-3: Sync document lang attribute with active i18n language
document.documentElement.lang = (i18n.language || 'es').slice(0, 2);
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = (lng || 'es').slice(0, 2);
});

// Presupuesto del chunk inicial (ola 3 §9.1): los namespaces ecosystem+landing,
// home.teaser y wheel viven en bundles lazy por idioma (src/i18n/bundles/).
// Mapa ruta → bundles que esa ruta necesita.
export function bundlesForPath(pathname) {
  const p = String(pathname || '/').toLowerCase();
  const bundles = [];
  if (p === '/' || p === '') bundles.push('home-teaser');
  if (p.startsWith('/ecosystem') || p.startsWith('/agents') || p.startsWith('/agent-discovery')) {
    bundles.push('ecosystem');
  }
  if (p.startsWith('/wheel') || p.startsWith('/twitch-callback')) bundles.push('wheel');
  return bundles;
}

/**
 * Garantiza que los bundles i18n de la ruta dada estén cargados (idioma activo
 * + fallback es). Idempotente. Los consumidores (Ecosystem.jsx, HomeTeaser.jsx,
 * UvdWheelPage.js) pueden además llamar loadI18nBundle('<bundle>') directo para
 * tener un `ready` propio — ver docs/audit-2026-08-26/wave3/polish-bundle.md.
 */
export function ensureBundlesForPath(pathname) {
  return Promise.all(bundlesForPath(pathname).map((name) => loadI18nBundle(name)));
}

// Carga según la ruta inicial + listener ligero de navegación SPA
// (react-router usa history.pushState/replaceState por debajo).
if (typeof window !== 'undefined') {
  ensureBundlesForPath(window.location.pathname);
  const onRouteChange = () => ensureBundlesForPath(window.location.pathname);
  window.addEventListener('popstate', onRouteChange);
  ['pushState', 'replaceState'].forEach((method) => {
    const original = window.history[method];
    if (typeof original === 'function') {
      window.history[method] = function patchedHistoryMethod(...args) {
        const result = original.apply(this, args);
        onRouteChange();
        return result;
      };
    }
  });
}

export default i18n;
