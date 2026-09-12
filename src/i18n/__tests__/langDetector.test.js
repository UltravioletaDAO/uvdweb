import {
  detectLangFromSearch,
  createLanguageDetector,
  DETECTION_OPTIONS,
  SUPPORTED_LNGS,
} from '../langDetector';

describe('detectLangFromSearch', () => {
  it('lee ?lang= para cada idioma soportado', () => {
    SUPPORTED_LNGS.forEach((lng) => {
      expect(detectLangFromSearch(`?lang=${lng}`)).toBe(lng);
    });
  });

  it('acepta la region y la mayúscula: en-US y EN son en', () => {
    expect(detectLangFromSearch('?lang=en-US')).toBe('en');
    expect(detectLangFromSearch('?lang=EN')).toBe('en');
  });

  it('convive con otros parámetros', () => {
    expect(detectLangFromSearch('?utm_source=x&lang=pt&ref=y')).toBe('pt');
  });

  it('un idioma no soportado devuelve undefined (deja pasar al siguiente detector)', () => {
    expect(detectLangFromSearch('?lang=zz')).toBeUndefined();
  });

  it('sin ?lang= devuelve undefined', () => {
    expect(detectLangFromSearch('?lng=en')).toBeUndefined();
    expect(detectLangFromSearch('')).toBeUndefined();
    expect(detectLangFromSearch(undefined)).toBeUndefined();
    expect(detectLangFromSearch('?lang=')).toBeUndefined();
  });
});

describe('detector cableado tal como lo usa i18n/config.js', () => {
  let detector;

  const detectWith = (search) => {
    window.history.replaceState({}, '', `/${search}`);
    return detector.detect();
  };

  beforeEach(() => {
    window.localStorage.clear();
    detector = createLanguageDetector();
    detector.init(undefined, DETECTION_OPTIONS);
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
  });

  const first = (r) => (Array.isArray(r) ? r[0] : r);

  // DISCRIMINANTE: sin 'queryLang' en el orden de detección, la librería solo
  // mira ?lng= y este caso devuelve el idioma del navegador, no 'en'.
  it('?lang=en resuelve en', () => {
    expect(first(detectWith('?lang=en'))).toBe('en');
  });

  it('?lang=pt resuelve pt', () => {
    expect(first(detectWith('?lang=pt'))).toBe('pt');
  });

  // No rompemos lo que ya andaba: ?lng= sigue atendido por el detector nativo.
  it('?lng=fr sigue funcionando', () => {
    expect(first(detectWith('?lng=fr'))).toBe('fr');
  });

  it('?lang= gana sobre ?lng= cuando vienen los dos', () => {
    expect(first(detectWith('?lang=en&lng=pt'))).toBe('en');
  });
});
