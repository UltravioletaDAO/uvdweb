// El api-catalog de la DAO (RFC 9727) se genera desde src/data/apiCatalog/services.json, copia de
// config/ecosystem.toml de c0der. Estos tests se ponen rojos si:
//   - el artefacto publicado deja de ser exactamente el generado (alguien lo editó a mano);
//   - el linkset pierde la forma de RFC 9264;
//   - un servicio del archivo de datos falta en el linkset, o el linkset trae uno que no está;
//   - el deploy real deja de servirlo como application/linkset+json.
const fs = require('fs');
const path = require('path');
const {
  DATA_FILE,
  OUTPUT_FILES,
  PROFILE,
  MEDIA_TYPE,
  AUTH_SCHEMES,
  PRICE_MODELS,
  buildLinkset,
  serialize,
} = require('../../../../scripts/apiCatalog/buildLinkset');

const ROOT = path.join(__dirname, '..', '..', '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');

const data = JSON.parse(read(DATA_FILE));
const published = JSON.parse(read(OUTPUT_FILES[0]));
const CATALOG_URL = 'https://ultravioletadao.xyz/.well-known/api-catalog';

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};
const sorted = (list) => [...list].sort();

describe('archivo de datos del api-catalog', () => {
  it('dice de qué archivo y de qué commit de c0der salió', () => {
    expect(data.source.file).toBe('config/ecosystem.toml');
    expect(data.source.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  it('cada nodo aparece una sola vez, dentro o fuera del catálogo, y lo de fuera dice por qué', () => {
    const nodes = [...data.services, ...data.excluded].map((entry) => entry.node);
    expect(new Set(nodes).size).toBe(nodes.length);
    data.excluded.forEach((entry) => expect(entry.reason).toBeTruthy());
  });

  it('auth y precio usan el vocabulario cerrado', () => {
    data.services.forEach((s) => {
      expect(s.auth.schemes.length).toBeGreaterThan(0);
      s.auth.schemes.forEach((scheme) => expect(AUTH_SCHEMES).toContain(scheme));
      expect(PRICE_MODELS).toContain(s.price.model);
    });
  });
});

describe('el artefacto publicado es el generado', () => {
  const generated = serialize(buildLinkset(data));

  it.each(OUTPUT_FILES)('%s coincide byte a byte con el generador', (rel) => {
    expect(read(rel)).toBe(generated);
  });
});

describe('forma de RFC 9264 (application/linkset+json)', () => {
  it('el documento tiene "linkset" como único miembro y es un array no vacío', () => {
    expect(Object.keys(published)).toEqual(['linkset']);
    expect(Array.isArray(published.linkset)).toBe(true);
    expect(published.linkset.length).toBeGreaterThan(0);
  });

  it('cada contexto tiene anchor y cada relación es un array de objetos destino con href', () => {
    published.linkset.forEach((context) => {
      expect(isHttpsUrl(context.anchor)).toBe(true);
      Object.entries(context)
        .filter(([member]) => member !== 'anchor')
        .forEach(([, targets]) => {
          expect(Array.isArray(targets)).toBe(true);
          expect(targets.length).toBeGreaterThan(0);
          targets.forEach((link) => {
            expect(isHttpsUrl(link.href)).toBe(true);
            Object.entries(link).forEach(([attribute, value]) => {
              if (['href', 'type', 'title'].includes(attribute)) {
                expect(typeof value).toBe('string');
              } else {
                // Atributos de extensión (RFC 9264 §4.2.4.3): siempre array de strings.
                expect(Array.isArray(value)).toBe(true);
                value.forEach((v) => expect(typeof v).toBe('string'));
              }
            });
          });
        });
    });
  });

  it('RFC 9727: el primer contexto es el propio catálogo y enlaza los servicios como item', () => {
    const [catalog] = published.linkset;
    expect(catalog.anchor).toBe(CATALOG_URL);
    expect(data.catalog).toBe(CATALOG_URL);
    expect(Array.isArray(catalog.item)).toBe(true);
  });
});

describe('el archivo de datos y el linkset no divergen', () => {
  const [catalog, ...contexts] = published.linkset;
  const byAnchor = new Map(contexts.map((context) => [context.anchor, context]));

  it('los anchors del archivo, los item del catálogo y los contextos son el mismo conjunto', () => {
    const anchors = data.services.map((s) => s.anchor);
    expect(sorted(catalog.item.map((link) => link.href))).toEqual(sorted(anchors));
    expect(sorted(contexts.map((context) => context.anchor))).toEqual(sorted(anchors));
    expect(byAnchor.size).toBe(contexts.length);
  });

  it.each(data.services.map((s) => [s.node, s]))('%s: cada link del archivo está en su contexto y viceversa', (_node, s) => {
    const context = byAnchor.get(s.anchor);
    expect(context).toBeDefined();

    const expected = [
      ...(s.service_desc || []).map((link) => `service-desc ${link.href}`),
      ...s.service_doc.map((link) => `service-doc ${link.href}`),
      `service-meta ${s.auth.doc.href}`,
      ...(s.price.doc ? [`service-meta ${s.price.doc.href}`] : []),
      ...(s.status || []).map((link) => `status ${link.href}`),
      ...(s.api_catalog ? [`api-catalog ${s.api_catalog.href}`] : []),
    ];
    const actual = Object.entries(context)
      .filter(([member]) => member !== 'anchor')
      .flatMap(([relation, targets]) => targets.map((link) => `${relation} ${link.href}`));
    expect(sorted(actual)).toEqual(sorted(expected));

    const authLink = context['service-meta'].find((link) => link.href === s.auth.doc.href);
    expect(authLink['auth-scheme']).toEqual(s.auth.schemes);
    expect(authLink['price-model']).toEqual([s.price.model]);
  });
});

describe('content-type del artefacto en el deploy real', () => {
  // Amplify publica build/ (CRA copia public/ tal cual) y aplica customHttp.yml; el borde de
  // CloudFront (infra/terraform/edge) no cachea y solo reescribe el content-type de Markdown.
  const publishedPath = `/${path.posix.relative('public', OUTPUT_FILES[0])}`;

  it('el artefacto se publica en /.well-known/api-catalog', () => {
    expect(publishedPath).toBe('/.well-known/api-catalog');
    expect(read('amplify.yml')).toMatch(/baseDirectory:\s*build\s*$/m);
  });

  it('customHttp.yml lo sirve como application/linkset+json con el profile de RFC 9727', () => {
    const lines = read('customHttp.yml').split('\n');
    const start = lines.findIndex((line) => line.trim() === `- pattern: '${publishedPath}'`);
    expect(start).toBeGreaterThan(-1);
    const next = lines.findIndex((line, i) => i > start && line.trim().startsWith('- pattern:'));
    const block = lines.slice(start, next === -1 ? undefined : next);
    const keyAt = block.findIndex((line) => line.trim() === "- key: 'Content-Type'");
    expect(keyAt).toBeGreaterThan(-1);
    const value = block[keyAt + 1].match(/value:\s*'(.*)'\s*$/)[1];
    expect(value).toBe(MEDIA_TYPE);
    expect(value.startsWith('application/linkset+json')).toBe(true);
    expect(value).toContain(PROFILE);
  });

  it('el borde solo toca el content-type de las respuestas Markdown', () => {
    const fn = read('infra/terraform/edge/functions/viewer-response.js.tftpl');
    const guard = fn.indexOf('if (isMarkdown)');
    expect(guard).toBeGreaterThan(-1);
    const writes = [...fn.matchAll(/headers\['content-type'\]\s*=/g)].map((m) => m.index);
    writes.forEach((index) => expect(index).toBeGreaterThan(guard));
  });
});
