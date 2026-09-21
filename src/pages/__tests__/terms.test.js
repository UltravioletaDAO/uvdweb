// La página de términos rinde en español y en inglés, y trae la versión.
//
// Emporium no puede desplegarse sin una versión de términos publicada: si esta
// página deja de renderizar, o la versión deja de aparecer en el HTML, el que
// se rompe es el otro repo. Por eso el test renderiza de verdad (no inspecciona
// el fuente) y busca v1-2026-09 en el markup, en los dos idiomas.
import fs from 'fs';
import path from 'path';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Terms, { TERMS_VERSION, TERMS_EFFECTIVE_DATE } from '../Terms';
import { AppRoutes } from '../../AppRoutes';
import es from '../../i18n/es.json';
import en from '../../i18n/en.json';
import pt from '../../i18n/pt.json';
import fr from '../../i18n/fr.json';

const DICTS = { es, en, pt, fr };
const LANGS = ['es', 'en', 'pt', 'fr'];

const SECTIONS = [
  'operator',
  'scope',
  'acceptance',
  'asIs',
  'liability',
  'acceptableUse',
  'law',
  'contact',
  'changes'
];

// El "no custodiamos" tiene que tener el sujeto en la casa, no en Emporium:
// el sitio conecta billeteras en /safestats, /wheel, /token y el swap.
const CUSTODY_CLAIM = {
  es: /No custodiamos fondos ni llaves privadas/,
  en: /We do not custody anyone's funds or private keys/,
  pt: /Não custodiamos fundos nem chaves privadas/,
  fr: /Nous ne conservons les fonds ni les clés privées/
};

// Los mismos flags que el <Router> de App.js: montar como monta producción.
const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

function makeI18n(lng) {
  const i18n = createInstance();
  i18n.use(initReactI18next).init({
    lng,
    fallbackLng: false, // sin red de contención: una clave faltante se ve
    resources: Object.fromEntries(
      Object.entries(DICTS).map(([code, dict]) => [code, { translation: dict }])
    ),
    interpolation: { escapeValue: false }
  });
  return i18n;
}

function mount(tree) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  return { container, root };
}

function termsMarkup(lng) {
  const { container, root } = mount();

  // eslint-disable-next-line testing-library/no-unnecessary-act -- acá no hay Testing Library: es react-dom/client y act() sí hace falta.
  act(() => {
    root.render(
      <HelmetProvider context={{}}>
        <MemoryRouter initialEntries={['/terms']} future={ROUTER_FUTURE}>
          <I18nextProvider i18n={makeI18n(lng)}>
            <Terms />
          </I18nextProvider>
        </MemoryRouter>
      </HelmetProvider>
    );
  });

  const markup = container.innerHTML;
  // eslint-disable-next-line testing-library/no-unnecessary-act -- idem: react-dom/client.
  act(() => root.unmount());
  container.remove();
  return markup;
}

// Monta la tabla de rutas REAL de App.js. Es lo único que este encargo vino a
// arreglar: hasta ahora /terms caía en el catch-all y devolvía el 404.
async function routeText(pathname) {
  const { container, root } = mount();

  // eslint-disable-next-line testing-library/no-unnecessary-act -- idem: react-dom/client.
  await act(async () => {
    root.render(
      <HelmetProvider context={{}}>
        <MemoryRouter initialEntries={[pathname]} future={ROUTER_FUTURE}>
          <I18nextProvider i18n={makeI18n('es')}>
            <AppRoutes />
          </I18nextProvider>
        </MemoryRouter>
      </HelmetProvider>
    );
  });

  // Las páginas entran por lazy(): esperar a que el chunk resuelva.
  for (let i = 0; i < 40 && !container.querySelector('h1'); i += 1) {
    // eslint-disable-next-line no-await-in-loop, testing-library/no-unnecessary-act
    await act(async () => {
      await Promise.resolve();
    });
  }

  const text = container.textContent;
  const html = container.innerHTML;
  // eslint-disable-next-line testing-library/no-unnecessary-act -- idem: react-dom/client.
  await act(async () => root.unmount());
  container.remove();
  return { text, html };
}

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  // jsdom no implementa scrollTo y la página lo llama al montar, como el resto
  // de las páginas de texto del sitio.
  window.scrollTo = () => {};
});

describe('/terms — la página de términos', () => {
  it.each(['es', 'en'])('%s: rinde y muestra la versión vigente', (lng) => {
    const markup = termsMarkup(lng);
    const dict = DICTS[lng];

    expect(markup).toContain(dict.terms.title);
    expect(markup).toContain(TERMS_VERSION);
    expect(markup).toContain(`data-terms-version="${TERMS_VERSION}"`);
    expect(markup).toContain(TERMS_EFFECTIVE_DATE);
  });

  it.each(['es', 'en'])('%s: nombra la entidad publicada y a Emporium', (lng) => {
    const markup = termsMarkup(lng);
    const dict = DICTS[lng];

    // La entidad y la dirección salen del pie del sitio, no se re-tipean acá.
    expect(markup).toContain(dict.footer.legal_entity);
    expect(markup).toContain(dict.footer.address);
    expect(markup).toContain(dict.footer.city_state_zip);
    expect(markup).toContain(dict.footer.contact.email);
    expect(markup).toContain('Emporium');
    expect(markup).toMatch(/Wyoming/);
  });

  it.each(LANGS)('%s: no queda ninguna interpolación sin resolver', (lng) => {
    expect(termsMarkup(lng)).not.toContain('{{');
  });

  it.each(LANGS)('%s: no sale ningún punto doble', (lng) => {
    // footer.country ya trae el punto en español ("EE.UU."), así que el cuerpo
    // de `operator` NO lleva otro después de {{country}}. Si alguien lo repone,
    // sale "EE.UU.." en la primera línea de la página.
    const text = termsMarkup(lng).replace(/<[^>]*>/g, ' ');
    expect(text).not.toMatch(/\.\./);
  });
});

describe('/terms — el texto obligatorio', () => {
  it.each(LANGS)('%s: el diccionario trae todas las secciones', (lng) => {
    const { terms } = DICTS[lng];
    expect(typeof terms.title).toBe('string');
    SECTIONS.forEach((section) => {
      expect(typeof terms.sections[section].title).toBe('string');
      expect(typeof terms.sections[section].body).toBe('string');
    });
  });

  it.each(LANGS)('%s: el "no custodiamos" habla de la casa, no solo de Emporium', (lng) => {
    expect(DICTS[lng].terms.sections.scope.body).toMatch(CUSTODY_CLAIM[lng]);
  });

  it.each(LANGS)('%s: la versión no está tipeada en el diccionario', (lng) => {
    // Fuente única: la versión vive en Terms.js. Si alguien la copia a un
    // JSON de idioma, el próximo bump deja una de las dos desactualizada.
    expect(JSON.stringify(DICTS[lng].terms)).not.toContain(TERMS_VERSION);
  });
});

describe('/terms — la ruta, no solo la página', () => {
  it('la tabla de rutas de App.js sirve /terms y no el 404', async () => {
    const { text, html } = await routeText('/terms');

    expect(html).toContain(`data-terms-version="${TERMS_VERSION}"`);
    expect(text).toContain(DICTS.es.terms.title);
    expect(text).toContain(TERMS_VERSION);
    expect(text).not.toContain('404');
  });

  it('control negativo: una ruta inventada sí cae en el 404', async () => {
    const { text, html } = await routeText('/ruta-que-no-existe-2026');

    expect(text).toContain('404');
    expect(html).not.toContain('data-terms-version');
  });
});

describe('/terms — la versión que puede leer una máquina sin JavaScript', () => {
  // El <meta> lo inyecta Helmet con JS: un curl a /terms recibe el shell de la
  // SPA. Este archivo estático es lo único que otro servicio puede leer directo.
  const staticVersion = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', '..', 'public', 'terms', 'version.json'), 'utf8')
  );

  it('public/terms/version.json coincide con las constantes de Terms.js', () => {
    expect(staticVersion.version).toBe(TERMS_VERSION);
    expect(staticVersion.effective).toBe(TERMS_EFFECTIVE_DATE);
  });

  it('apunta a la URL pública de la página', () => {
    expect(staticVersion.url).toBe('https://ultravioletadao.xyz/terms');
  });
});
