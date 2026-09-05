import LanguageDetector from 'i18next-browser-languagedetector';

// Fuente única de los idiomas soportados: la consume i18n/config.js y también
// el detector de query string de acá. No volver a tipear esta lista.
export const SUPPORTED_LNGS = ['es', 'en', 'pt', 'fr'];

/**
 * Lee el idioma de `?lang=`.
 *
 * i18next-browser-languagedetector solo mira `?lng=` (su `lookupQuerystring`
 * por defecto). `?lang=` es la forma que esperan los enlaces que compartimos y
 * la que pide el material en inglés del backlog, y hasta hoy no hacía nada.
 *
 * Un valor no soportado devuelve undefined a propósito: así el detector
 * siguiente de la cadena tiene su turno en vez de forzar el fallback.
 *
 * @param {string} search - window.location.search, con o sin '?'.
 * @param {string[]} [supported]
 * @returns {string|undefined}
 */
export function detectLangFromSearch(search, supported = SUPPORTED_LNGS) {
  let raw;
  try {
    raw = new URLSearchParams(search || '').get('lang');
  } catch {
    return undefined;
  }
  if (!raw) return undefined;
  // 'en-US' y 'EN' cuentan como 'en'.
  const base = raw.trim().toLowerCase().split('-')[0];
  return supported.includes(base) ? base : undefined;
}

// Orden de detección: el nuestro primero, después el de la librería tal cual
// venía — así `?lng=` sigue funcionando para quien ya lo use.
export const DETECTION_OPTIONS = {
  order: [
    'queryLang',
    'querystring',
    'cookie',
    'localStorage',
    'sessionStorage',
    'navigator',
    'htmlTag',
    'path',
    'subdomain',
  ],
};

/** LanguageDetector con el detector de `?lang=` registrado. */
export function createLanguageDetector() {
  const detector = new LanguageDetector();
  detector.addDetector({
    name: 'queryLang',
    lookup() {
      if (typeof window === 'undefined') return undefined;
      return detectLangFromSearch(window.location.search);
    },
  });
  return detector;
}
