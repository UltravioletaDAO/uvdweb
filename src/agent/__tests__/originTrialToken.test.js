/**
 * @jest-environment node
 */
// El token del origin trial de WebMCP que sirve public/index.html, decodificado.
// Sin un token vigente, Chrome estable deja de exponer document.modelContext en ultravioletadao.xyz y las
// tools de src/agent/ se apagan solas para todos los visitantes, sin un error en ningún lado: pasó el
// 2026-11-17, cuando venció el primer token y nadie se enteró. Este test se pone rojo si:
//   - public/index.html no trae ningún <meta http-equiv="origin-trial">, o uno trae un token que no
//     decodifica (base64 roto o el largo del payload no cuadra: un pegado cortado);
//   - ningún token es de WebMCP para https://ultravioletadao.xyz:443 con match de subdominios;
//   - el de WebMCP vence en menos de DIAS_MINIMOS días: ese es el aviso para renovarlo a tiempo en
//     https://developer.chrome.com/origintrials.
// Corre en npm test (paso Unit Tests del frontend-ci) y a propósito NO en el prebuild de Amplify: un
// chequeo con fecha dentro del build tumba el deploy por el solo paso del tiempo, sin que nadie toque el
// repo (es lo que hace scripts/ecosystem/check-snapshot.js con el snapshot de más de 60 días).
// Formato del token (Chromium, third_party/blink/common/origin_trials/trial_token.cc):
//   versión (1 byte) | firma (64 bytes) | largo del payload (4 bytes, big-endian) | payload JSON.
// La firma no se verifica acá: la verifica Chrome.
const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, '..', '..', '..', 'public', 'index.html');
const ORIGIN = 'https://ultravioletadao.xyz:443';
const FEATURE = 'WebMCP';
const DIAS_MINIMOS = 30;
const DIA_MS = 24 * 60 * 60 * 1000;
const CABECERA = 1 + 64 + 4;

// El valor de un atributo de una etiqueta, con comillas dobles, simples o sin comillas.
function atributo(tag, nombre) {
  const m = tag.match(new RegExp('\\s' + nombre + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s"\'>]+))', 'i'));
  if (!m) return null;
  return m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3];
}

// Todos los <meta> con http-equiv="origin-trial", en cualquier orden de atributos y mayúsculas.
function tokensDelHtml(html) {
  const tokens = [];
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    if ((atributo(tag, 'http-equiv') || '').trim().toLowerCase() === 'origin-trial') {
      tokens.push((atributo(tag, 'content') || '').trim());
    }
  }
  return tokens;
}

function decodificar(token) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(token)) throw new Error('el token no es base64: "' + token.slice(0, 16) + '..."');
  const bytes = Buffer.from(token, 'base64');
  if (bytes.length <= CABECERA) throw new Error('el token tiene ' + bytes.length + ' bytes: no alcanza ni la cabecera');
  const largo = bytes.readUInt32BE(65);
  const payload = bytes.subarray(CABECERA);
  if (payload.length !== largo) {
    throw new Error('el token dice que su payload tiene ' + largo + ' bytes y trae ' + payload.length + ' (¿pegado cortado?)');
  }
  return { version: bytes[0], ...JSON.parse(payload.toString('utf8')) };
}

const html = fs.readFileSync(INDEX, 'utf8');

describe('origin trial de WebMCP en public/index.html', () => {
  test('cada <meta http-equiv="origin-trial"> trae un token que decodifica', () => {
    const tokens = tokensDelHtml(html);
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      const t = decodificar(token);
      expect([2, 3]).toContain(t.version);
      expect(typeof t.feature).toBe('string');
      expect(typeof t.origin).toBe('string');
      expect(Number.isInteger(t.expiry)).toBe(true);
    }
  });

  test('uno es de WebMCP para ' + ORIGIN + ' y cubre los subdominios', () => {
    const webmcp = tokensDelHtml(html).map(decodificar).filter((t) => t.feature === FEATURE);
    expect(webmcp.map((t) => ({ origin: t.origin, isSubdomain: t.isSubdomain }))).toContainEqual({
      origin: ORIGIN,
      isSubdomain: true,
    });
  });

  test('el token de WebMCP no vence en los próximos ' + DIAS_MINIMOS + ' días', () => {
    const propios = tokensDelHtml(html)
      .map(decodificar)
      .filter((t) => t.feature === FEATURE && t.origin === ORIGIN && t.isSubdomain === true);
    expect(propios.length).toBeGreaterThan(0);
    // Si durante una renovación conviven dos, cuenta el que vence más tarde.
    const expiry = Math.max(...propios.map((t) => t.expiry));
    const dias = (expiry * 1000 - Date.now()) / DIA_MS;
    if (!(dias >= DIAS_MINIMOS)) {
      throw new Error(
        'El token de WebMCP de public/index.html vence el ' + new Date(expiry * 1000).toISOString() +
          ' (quedan ' + dias.toFixed(1) + ' días; el mínimo es ' + DIAS_MINIMOS + '). Renovarlo en ' +
          'https://developer.chrome.com/origintrials (trial WebMCP, origin https://ultravioletadao.xyz, ' +
          'match subdomains) y pegar el token nuevo en el <meta http-equiv="origin-trial">.'
      );
    }
  });
});
