// Presupuesto del chunk inicial (ola 3 §9.1): los namespaces pesados de i18n
// (ecosystem + landing, home.teaser, wheel) viven en src/i18n/bundles/ como
// JSON por idioma y se cargan lazy con import(). Cada bundle se registra en el
// namespace 'translation' via addResourceBundle (deep merge), siempre junto al
// fallback 'es' para que las claves faltantes de un idioma no queden crudas.
import i18n from 'i18next';

const SUPPORTED = ['es', 'en', 'pt', 'fr'];
const FALLBACK = 'es';

const loaded = new Set(); // "bundle:lng" ya registrados (o en vuelo)
const requested = new Set(); // bundles pedidos, para recargarlos al cambiar de idioma

const normalizeLng = (lng) => {
  const two = String(lng || FALLBACK).slice(0, 2).toLowerCase();
  return SUPPORTED.includes(two) ? two : FALLBACK;
};

function importBundle(name, lng) {
  const key = `${name}:${lng}`;
  if (loaded.has(key)) return Promise.resolve();
  loaded.add(key);
  return import(
    /* webpackChunkName: "i18n-[request]" */
    `./bundles/${name}.${lng}.json`
  )
    .then((mod) => {
      i18n.addResourceBundle(lng, 'translation', mod.default || mod, true, true);
    })
    .catch((err) => {
      loaded.delete(key); // permite reintentar (p.ej. fallo de red transitorio)
      if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
        console.error(`[i18n] no se pudo cargar el bundle ${name}.${lng}`, err);
      }
    });
}

/**
 * Carga el bundle `name` para el idioma activo (y el fallback 'es') y lo
 * registra en i18next. Idempotente; devuelve una promesa que resuelve cuando
 * ambos idiomas quedaron registrados. Al cambiar de idioma (languageChanged)
 * los bundles ya pedidos se recargan solos para el idioma nuevo.
 */
export function loadI18nBundle(name) {
  requested.add(name);
  const lng = normalizeLng(i18n.language);
  const jobs = [importBundle(name, FALLBACK)];
  if (lng !== FALLBACK) jobs.push(importBundle(name, lng));
  return Promise.all(jobs);
}

i18n.on('languageChanged', (lng) => {
  const normalized = normalizeLng(lng);
  requested.forEach((name) => importBundle(name, normalized));
});

export default loadI18nBundle;
