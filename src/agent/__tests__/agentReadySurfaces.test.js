// Las superficies para agentes que publica ultravioletadao.xyz, tal como las mide agent-ready
// (la herramienta de c0der: https://gist.github.com/0xultravioleta/e5d94ff3f2990db75392de2ccc0ba2bd).
// El mapa de qué se publica, qué paso del deploy lo sube y qué checks quedan fuera con su motivo
// está en docs/AGENT_READY.md. Este test se pone rojo si:
//   - una ruta publicada deja de existir en public/ o su cuerpo pasa a ser el index.html de la SPA;
//   - la ruta cae en la regla SPA de Amplify (que la reescribe a index.html con 200: la trampa del
//     SPA que da 200 en todo) o el host la serviría con un content-type que el check no acepta;
//   - el borde de CloudFront la reescribiría a Markdown cuando el agente manda Accept: text/markdown;
//   - la MCP server card vuelve a esconder su endpoint, o la card y su generador divergen;
//   - un JSON de /.well-known declara un $schema que nadie bajó (el host de agentskills.io no resuelve);
//   - /openapi.json y su copia en /.well-known divergen, o cambia un operationId ya publicado.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..', '..');
const PUBLIC = path.join(ROOT, 'public');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const SITE = 'https://ultravioletadao.xyz';

// Lo que Amplify manda por extensión. Medido en producción por c0der el 2026-10-02 con agent-ready:
// /llms.txt text/plain, /index.md text/markdown, /.well-known/mcp/server-card.json application/json.
const HOST_TYPES = {
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
};

// La regla SPA de Amplify, copiada de uvd-backend environments/prod/amplify.tf (aws_amplify_app.uvdweb,
// el custom_rule con target /index.html y status 200). Toda ruta que matchee se sirve como index.html
// con 200 aunque el archivo exista: por eso /.well-known/x402 daba el index.html en producción, y por
// eso los .well-known sin extensión necesitan su copia .json y una regla propia.
const AMPLIFY_SPA_REWRITE = /^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|md|svg|woff|woff2|ttf|map|json|xml|xsl|webp|avif|mp3|wav|ogg|mp4|webmanifest)$)([^.]+$)/;

// Cada ruta, el content-type que el check de agent-ready acepta y los campos que exige.
const ROUTES = [
  { route: '/openapi.json', accepts: ['application/json', 'application/openapi+json'], fields: ['openapi', 'paths'] },
  { route: '/.well-known/openapi/uvdao-api.json', accepts: ['application/json'], fields: ['openapi', 'paths'] },
  { route: '/skill.md', accepts: ['text/markdown', 'text/plain'] },
  { route: '/.well-known/mcp/server-card.json', accepts: ['application/json'], fields: ['serverInfo.name', 'transport.endpoint'] },
  { route: '/.well-known/agent-skills/index.json', accepts: ['application/json'], fields: ['skills'] },
  { route: '/llms.txt', accepts: ['text/plain', 'text/markdown'] },
];

const field = (doc, dotted) => dotted.split('.').reduce((cur, key) => (cur && typeof cur === 'object' ? cur[key] : undefined), doc);
const fileOf = (route) => path.join(PUBLIC, ...route.split('/').filter(Boolean));
const indexHtml = read('public/index.html');

// Patrones de customHttp.yml que fijan Content-Type (`**` cruza segmentos, `*` no).
const contentTypeOverrides = () => {
  const lines = read('customHttp.yml').split('\n');
  const overrides = [];
  let pattern = null;
  lines.forEach((line, i) => {
    const p = line.match(/^\s*- pattern:\s*'(.*)'\s*$/);
    if (p) pattern = p[1];
    if (pattern && line.trim() === "- key: 'Content-Type'") {
      const value = lines[i + 1].match(/value:\s*'(.*)'\s*$/)[1];
      overrides.push({ pattern, value });
    }
  });
  return overrides;
};
const escapeRegExp = (text) => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
// `*` es un segmento y `**` cruza segmentos; `/**/` y un `/**` final también valen por cero
// segmentos, como en minimatch: `/**/*.md` aplica a `/skill.md`.
const globToRegExp = (glob) => {
  let source = '';
  let i = 0;
  while (i < glob.length) {
    if (glob.startsWith('/**/', i)) {
      source += '/(?:.*/)?';
      i += 4;
    } else if (glob.startsWith('/**', i) && i + 3 === glob.length) {
      source += '(?:/.*)?';
      i += 3;
    } else if (glob.startsWith('**', i)) {
      source += '.*';
      i += 2;
    } else if (glob[i] === '*') {
      source += '[^/]*';
      i += 1;
    } else {
      source += escapeRegExp(glob[i]);
      i += 1;
    }
  }
  return new RegExp(`^${source}$`);
};

// El viewer-request del borde (infra/terraform/edge), con las variables que le inyecta Terraform
// (los defaults de variables.tf; markdown_routes solo trae "/").
const fillTemplate = (template, vars) => template.replace(/\$\{(\w+)\}/g, (_, name) => vars[name]);
const edgeRequest = () => {
  const code = fillTemplate(read('infra/terraform/edge/functions/viewer-request.js.tftpl'), {
    domain: 'ultravioletadao.xyz',
    routes: JSON.stringify({ '/': '/index.md' }),
    fallback: '/index.md',
  });
  const sandbox = {};
  vm.runInNewContext(`${code}\nthis.handler = handler;`, sandbox);
  return sandbox.handler;
};

it('control: la regla SPA copiada sí atrapa una ruta sin extensión (la trampa que da 200 en todo)', () => {
  expect(AMPLIFY_SPA_REWRITE.test('/.well-known/x402')).toBe(true);
  expect(AMPLIFY_SPA_REWRITE.test('/agent-ready-this-page-does-not-exist')).toBe(true);
});

describe.each(ROUTES)('$route', ({ route, accepts, fields }) => {
  const file = fileOf(route);

  it('existe en public/ y su cuerpo no es el index.html de la SPA', () => {
    expect(fs.existsSync(file)).toBe(true);
    const body = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    expect(body.trim().length).toBeGreaterThan(0);
    expect(body).not.toBe(indexHtml);
    expect(body.trimStart()).not.toMatch(/^<(!doctype|html)/i);
  });

  it('la regla SPA de Amplify no la reescribe a index.html', () => {
    expect(AMPLIFY_SPA_REWRITE.test(route)).toBe(false);
  });

  it('el host la sirve con un content-type que el check acepta', () => {
    const byExtension = HOST_TYPES[path.extname(route)];
    const override = contentTypeOverrides().find(({ pattern }) => globToRegExp(pattern).test(route));
    const served = (override ? override.value : byExtension || '').split(';')[0].trim().toLowerCase();
    expect(accepts).toContain(served);
  });

  it('el borde no la cambia por Markdown cuando el agente pide Accept: text/markdown', () => {
    const request = {
      uri: route,
      method: 'GET',
      querystring: {},
      headers: { host: { value: 'ultravioletadao.xyz' }, accept: { value: 'text/markdown, */*' } },
    };
    const out = edgeRequest()({ request });
    expect(out.uri).toBe(route);
    expect(out.headers['x-uvd-markdown']).toBeUndefined();
  });

  if (fields) {
    it(`es JSON con ${fields.join(', ')}`, () => {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
      fields.forEach((f) => expect(field(doc, f)).toBeDefined());
    });
  }
});

describe('MCP server card: el endpoint se encuentra y es el mismo en todas las superficies', () => {
  const card = JSON.parse(read('public/.well-known/mcp/server-card.json'));
  const generator = read('scripts/generateMcpServerCard.js');
  const ENDPOINT = generator.match(/const ENDPOINT = '([^']+)'/)[1];

  it('transport es un objeto con endpoint (la forma que siguen los scanners), no un array', () => {
    expect(Array.isArray(card.transport)).toBe(false);
    expect(card.transport.type).toBe('streamable-http');
    expect(card.transport.endpoint).toBe(ENDPOINT);
    expect(new URL(card.transport.endpoint).protocol).toBe('https:');
  });

  it('el generador escribe esa misma forma (regenerar la card no la rompe)', () => {
    expect(generator).toMatch(/transport:\s*\{\s*type:\s*'streamable-http',\s*endpoint:\s*ENDPOINT,/);
  });

  // Toda mención del host y la ruta del endpoint, con cualquier esquema (o ninguno), mayúsculas o
  // sufijo, se lee hasta un delimitador real (espacio, paréntesis, corchetes, comillas, backtick,
  // <>); la puntuación con que termina una oración no es parte de la URL. Cada una tiene que ser
  // exactamente el endpoint: `…/MCP`, `…/mcp.json`, `…/mcp2` o `http://…/mcp` son rojo.
  const endpointMentions = (text) => {
    const target = ENDPOINT.replace(/^https?:\/\//i, '').toLowerCase();
    return (text.match(/[^\s()[\]<>"'`]+/g) || [])
      .map((token) => token.replace(/^[^a-z0-9]+/i, '').replace(/[.,;:!?*]+$/, ''))
      .filter((token) => token.toLowerCase().replace(/^[a-z][a-z0-9+.-]*:\/\//, '').startsWith(target));
  };

  it('llms.txt, auth.md, skill.md y openapi.json anuncian el mismo endpoint', () => {
    ['public/llms.txt', 'public/auth.md', 'public/skill.md'].forEach((rel) => {
      const mentions = endpointMentions(read(rel));
      expect(mentions.length).toBeGreaterThan(0);
      mentions.forEach((url) => expect(`${rel}: ${url}`).toBe(`${rel}: ${ENDPOINT}`));
    });
    const api = JSON.parse(read('public/openapi.json'));
    expect(`${api.servers[0].url}/mcp`).toBe(ENDPOINT);
    expect(api.paths['/mcp'].post).toBeDefined();
  });
});

describe('ningún JSON de /.well-known declara un $schema sin verificar', () => {
  // Un $schema entra acá solo después de bajarlo y comprobar que responde 2xx con JSON.
  const VERIFIED_SCHEMAS = [];
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });
  const wellKnown = walk(path.join(PUBLIC, '.well-known'));

  // agent-ready marca FAIL un .well-known que no parsea (un BOM alcanza); el recorrido de abajo los
  // saltaría en silencio, así que cada .json tiene que parsear acá.
  it.each(wellKnown.filter((full) => full.endsWith('.json')).map((full) => path.relative(ROOT, full)))(
    '%s parsea como JSON',
    (rel) => {
      expect(() => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'))).not.toThrow();
    }
  );

  const jsonFiles = wellKnown
    .map((full) => {
      try {
        return [path.relative(ROOT, full), JSON.parse(fs.readFileSync(full, 'utf8'))];
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  it('hay JSON que revisar (el recorrido no quedó vacío)', () => {
    expect(jsonFiles.length).toBeGreaterThan(5);
  });

  it.each(jsonFiles.map(([rel, doc]) => [rel, doc]))('%s', (_rel, doc) => {
    if (doc && typeof doc === 'object' && '$schema' in doc) {
      expect(VERIFIED_SCHEMAS).toContain(doc.$schema);
    }
  });
});

describe('OpenAPI de api.ultravioletadao.xyz', () => {
  const api = JSON.parse(read('public/openapi.json'));
  // Solo los métodos HTTP de cada path item son operaciones (OpenAPI 3.0 §4.7.9); `parameters` o
  // `summary` a nivel de ruta no lo son.
  const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
  const operations = Object.entries(api.paths).flatMap(([route, item]) =>
    Object.entries(item)
      .filter(([method]) => HTTP_METHODS.includes(method))
      .map(([method, op]) => ({ key: `${method.toUpperCase()} ${route}`, id: op.operationId })));

  // operationIds publicados: un agente escribió código contra ellos. Uno nuevo se agrega acá;
  // cambiar o borrar uno de estos rompe a ese agente y tiene que doler.
  const LOCK = {
    'GET /': 'getStatus',
    'GET /health': 'getHealth',
    'POST /apply': 'applyMembership',
    'GET /apply/status/{email}': 'getApplicationStatus',
    'POST /wallets': 'registerWallet',
    'POST /mcp': 'mcpJsonRpc',
  };

  it('/.well-known/openapi/uvdao-api.json es byte a byte /openapi.json', () => {
    expect(read('public/.well-known/openapi/uvdao-api.json')).toBe(read('public/openapi.json'));
  });

  it('es OpenAPI 3 contra el host real de la API', () => {
    expect(api.openapi).toMatch(/^3\./);
    expect(api.servers.map((s) => s.url)).toEqual(['https://api.ultravioletadao.xyz']);
  });

  it('cada operación tiene un operationId propio', () => {
    operations.forEach(({ id }) => expect(id).toMatch(/^[a-z][A-Za-z0-9]+$/));
    expect(new Set(operations.map(({ id }) => id)).size).toBe(operations.length);
  });

  it.each(Object.entries(LOCK))('%s sigue siendo %s', (key, id) => {
    expect(operations.find((op) => op.key === key)).toEqual({ key, id });
  });

  it('skill.md nombra cada operationId (el manual apunta a las operaciones)', () => {
    const manual = read('public/skill.md');
    operations.forEach(({ id }) => expect(manual).toContain(`\`${id}\``));
  });

  // Un tools/call que falla o que la ruta rechaza (apply_failed_429) vuelve con HTTP 200 y
  // `result.isError: true`, sin `error` JSON-RPC (uvd-backend mcp.js, callTool). Un agente que solo
  // mire `error` da por enviada una aplicación rechazada.
  it('skill.md y el OpenAPI dicen que el fallo de una tool llega en result.isError', () => {
    expect(read('public/skill.md')).toMatch(/`result\.isError: true`/);
    expect(read('public/skill.md')).toContain('result.content[0].text');
    expect(api.paths['/mcp'].post.responses['200'].description).toContain('isError');
    expect(field(api, 'components.schemas.JsonRpcResponse.properties.result.properties.isError.type')).toBe('boolean');
  });
});

describe('descubrimiento y lo que no se publica', () => {
  it('llms.txt enlaza el manual y el OpenAPI', () => {
    const llms = read('public/llms.txt');
    expect(llms).toContain(`${SITE}/skill.md`);
    expect(llms).toContain(`${SITE}/openapi.json`);
  });

  // No hay servidor A2A y nada del dominio cobra (docs/AGENT_READY.md): publicar estas rutas sería
  // anunciar un endpoint que no existe. Si eso cambia, se cambia la doc y este test a la vez.
  it.each(['/.well-known/agent-card.json', '/.well-known/agent.json', '/.well-known/x402', '/.well-known/x402.json'])(
    '%s no se publica',
    (route) => {
      expect(fs.existsSync(fileOf(route))).toBe(false);
    }
  );
});
