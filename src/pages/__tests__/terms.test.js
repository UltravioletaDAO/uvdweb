// La página de términos rinde en español y en inglés, y trae la versión.
//
// Emporium no puede desplegarse sin una versión de términos publicada: si esta
// página deja de renderizar, o la versión deja de aparecer en el HTML, el que
// se rompe es el otro repo. Por eso el test renderiza de verdad (no inspecciona
// el fuente) y busca v1-2026-09 en el markup, en los dos idiomas.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Terms, { TERMS_VERSION, TERMS_EFFECTIVE_DATE } from '../Terms';
import es from '../../i18n/es.json';
import en from '../../i18n/en.json';
import pt from '../../i18n/pt.json';
import fr from '../../i18n/fr.json';

const DICTS = { es, en, pt, fr };

function termsMarkup(lng) {
  const i18n = createInstance();
  i18n.use(initReactI18next).init({
    lng,
    fallbackLng: false, // sin red de contención: una clave faltante se ve
    resources: Object.fromEntries(
      Object.entries(DICTS).map(([code, dict]) => [code, { translation: dict }])
    ),
    interpolation: { escapeValue: false }
  });

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  // eslint-disable-next-line testing-library/no-unnecessary-act -- acá no hay Testing Library: es react-dom/client y act() sí hace falta.
  act(() => {
    root.render(
      <HelmetProvider context={{}}>
        <MemoryRouter initialEntries={['/terms']}>
          <I18nextProvider i18n={i18n}>
            <Terms />
          </I18nextProvider>
        </MemoryRouter>
      </HelmetProvider>
    );
  });

  const markup = container.innerHTML;
  act(() => root.unmount());
  container.remove();
  return markup;
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

  it.each(['es', 'en'])('%s: no queda ninguna interpolación sin resolver', (lng) => {
    expect(termsMarkup(lng)).not.toContain('{{');
  });

  it.each(['es', 'en', 'pt', 'fr'])('%s: el diccionario trae todas las secciones', (lng) => {
    const { terms } = DICTS[lng];
    expect(typeof terms.title).toBe('string');
    ['operator', 'scope', 'asIs', 'liability', 'acceptableUse', 'law', 'contact', 'changes'].forEach(
      (section) => {
        expect(typeof terms.sections[section].title).toBe('string');
        expect(typeof terms.sections[section].body).toBe('string');
      }
    );
  });

  it.each(['es', 'en', 'pt', 'fr'])('%s: la versión no está tipeada en el diccionario', (lng) => {
    // Fuente única: la versión vive en Terms.js. Si alguien la copia a un
    // JSON de idioma, el próximo bump deja una de las dos desactualizada.
    expect(JSON.stringify(DICTS[lng].terms)).not.toContain(TERMS_VERSION);
  });
});
