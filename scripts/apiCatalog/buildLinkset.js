// Arma el api-catalog de la DAO (RFC 9727, formato linkset de RFC 9264) desde el archivo de
// datos src/data/apiCatalog/services.json. Función pura: la usan scripts/generateApiCatalog.js,
// que escribe el artefacto, y el test que vigila que el artefacto no diverja de los datos.
//
// Forma del linkset:
//   - el primer contexto es el propio catálogo y lista cada servicio como `item` (RFC 9727 A.2);
//   - un contexto por servicio, con el anchor en su backend y `service-desc`, `service-doc`,
//     `service-meta` y `status` (RFC 8631), más `api-catalog` hacia el catálogo propio del
//     producto (RFC 9727 §4.3);
//   - auth y precio viajan como atributos de extensión (RFC 9264 §4.2.4.3: siempre arrays de
//     strings) en el link `service-meta` que apunta a la documentación de auth del producto.

// Rutas relativas a la raíz del repo, definidas una vez para el generador y el test.
const DATA_FILE = 'src/data/apiCatalog/services.json';
const OUTPUT_FILES = ['public/.well-known/api-catalog', 'public/.well-known/api-catalog.json'];

const PROFILE = 'https://www.rfc-editor.org/info/rfc9727';
const MEDIA_TYPE = `application/linkset+json; profile="${PROFILE}"`;

// Vocabulario cerrado de los atributos de extensión. `none` excluye a los demás esquemas.
const AUTH_SCHEMES = ['none', 'erc-8128', 'oauth2', 'x402', 'api-key'];
const PRICE_MODELS = ['free', 'x402-per-call', 'x402-escrow'];

const isHttpsUrl = (value) => {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

function validate(data) {
  const problems = [];
  const links = (label, list) =>
    (list || []).forEach((link, i) => {
      if (!isHttpsUrl(link && link.href)) problems.push(`${label}[${i}].href no es una URL https`);
    });

  if (!isHttpsUrl(data.catalog)) problems.push('catalog no es una URL https');
  if (!Array.isArray(data.services) || data.services.length === 0) problems.push('services vacío');
  if (!Array.isArray(data.excluded)) problems.push('excluded no es un array');

  const nodes = new Set();
  const anchors = new Set([data.catalog]);
  const seen = (set, value, label) => {
    if (set.has(value)) problems.push(`${label} repetido: ${value}`);
    set.add(value);
  };

  (data.services || []).forEach((s) => {
    const label = `services.${s.node}`;
    seen(nodes, s.node, 'node');
    if (!s.name) problems.push(`${label}.name vacío`);
    if (!isHttpsUrl(s.anchor)) problems.push(`${label}.anchor no es una URL https`);
    seen(anchors, s.anchor, 'anchor');
    links(`${label}.service_desc`, s.service_desc);
    if (!Array.isArray(s.service_doc) || s.service_doc.length === 0) problems.push(`${label}.service_doc vacío`);
    links(`${label}.service_doc`, s.service_doc);
    links(`${label}.status`, s.status);

    const schemes = (s.auth && s.auth.schemes) || [];
    if (schemes.length === 0) problems.push(`${label}.auth.schemes vacío`);
    schemes.forEach((x) => AUTH_SCHEMES.includes(x) || problems.push(`${label}.auth.schemes: "${x}" fuera de ${AUTH_SCHEMES}`));
    if (schemes.includes('none') && schemes.length > 1) problems.push(`${label}.auth.schemes: "none" no se combina`);
    links(`${label}.auth.doc`, [s.auth && s.auth.doc]);

    if (!PRICE_MODELS.includes(s.price && s.price.model)) problems.push(`${label}.price.model fuera de ${PRICE_MODELS}`);
    if (s.price && s.price.doc) links(`${label}.price.doc`, [s.price.doc]);
    if (s.api_catalog) links(`${label}.api_catalog`, [s.api_catalog]);
  });

  (data.excluded || []).forEach((e) => {
    seen(nodes, e.node, 'node');
    if (!e.reason) problems.push(`excluded.${e.node}.reason vacío`);
  });

  if (problems.length) throw new Error(`api-catalog: datos inválidos\n- ${problems.join('\n- ')}`);
}

const target = ({ href, type, title }) => {
  const link = { href };
  if (type) link.type = type;
  if (title) link.title = title;
  return link;
};

function buildLinkset(data) {
  validate(data);

  const catalog = {
    anchor: data.catalog,
    item: data.services.map((s) => target({ href: s.anchor, title: s.name })),
  };

  const services = data.services.map((s) => {
    const context = { anchor: s.anchor };
    if (s.service_desc && s.service_desc.length) context['service-desc'] = s.service_desc.map(target);
    context['service-doc'] = s.service_doc.map(target);
    context['service-meta'] = [
      { ...target(s.auth.doc), 'auth-scheme': [...s.auth.schemes], 'price-model': [s.price.model] },
      ...(s.price.doc ? [target(s.price.doc)] : []),
    ];
    if (s.status && s.status.length) context.status = s.status.map(target);
    if (s.api_catalog) context['api-catalog'] = [target({ ...s.api_catalog, type: 'application/linkset+json' })];
    return context;
  });

  return { linkset: [catalog, ...services] };
}

const serialize = (linkset) => `${JSON.stringify(linkset, null, 2)}\n`;

module.exports = {
  DATA_FILE,
  OUTPUT_FILES,
  PROFILE,
  MEDIA_TYPE,
  AUTH_SCHEMES,
  PRICE_MODELS,
  validate,
  buildLinkset,
  serialize,
};
