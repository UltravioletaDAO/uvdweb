#!/usr/bin/env node
/*
 * record-replays.js — graba sesiones REALES contra los endpoints públicos del ecosistema y
 * las deja en src/data/ecosystem/replays/<key>.json con la forma
 *   { recorded_at, key, cmd, url, status, stdout: [líneas], json? | text? | headers?, redactions }
 * y un índice compacto src/data/ecosystem/replays/index.json
 *   { generated_at, entries: { <key>: { recorded_at, cmd, url, status, lines, json? } } }
 * (json inline solo si su serialización cabe en INLINE_MAX bytes: así endpoints.js importa el
 * índice liviano para snapshot/snapshotDate y los cuerpos pesados se cargan con import() aparte).
 *
 * Cada `cmd` es ejecutable tal cual (curl + jq/head). Node >= 20, fetch nativo, sin deps.
 *
 * Uso:  node scripts/ecosystem/record-replays.js
 * Reglas del repo: aborta si algún archivo final contiene 0x[0-9a-fA-F]{64} (los hashes de tx se
 * truncan a 10 chars ANTES del escaneo y se cuentan en `redactions.hex64`); las rutas locales
 * (letra de unidad, UNC, dao/ ai/ code/) se reemplazan por "[ruta omitida]" y se cuentan.
 * La sanitización corre sobre los VALORES ya parseados (nunca sobre el JSON crudo) para no
 * romper escapes. La clave search_stats usa $REACT_APP_STREAM_SEARCH_API (se lee de process.env
 * o de .env.local/.env sin imprimirla); si no está definida, se omite con aviso.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'ecosystem', 'replays');
const TIMEOUT_MS = 15000;
const INLINE_MAX = 1200;
const UA = 'uvdweb-record-replays/1.0 (+https://ultravioletadao.xyz/ecosystem)';

const HEX64 = /0x[0-9a-fA-F]{64}/g;
// Letra de unidad solo si NO va precedida de letra/dígito (evita romper `https://`).
const LOCAL_PATH = /(?:(?<![A-Za-z0-9])[A-Za-z]:[\\/]|\\\\|(?:^|[\s"'(])(?:dao|ai|code)\/)/g;

const KK_MCP = 'https://karmakadabra.ultravioletadao.xyz/mcp';

function readEnvVar(name) {
  if (process.env[name]) return process.env[name];
  for (const file of ['.env.local', '.env']) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
    if (line) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const SEARCH_API = readEnvVar('REACT_APP_STREAM_SEARCH_API');

// Una entrada por archivo de salida. `kind`: json | text | headers | head12 | mcp.
// Las claves de MCP llevan prefijo kk_mcp_ (así las consume ReplayTerm de eco-products).
const TARGETS = [
  { key: 'facilitator_health', kind: 'json', url: 'https://facilitator.ultravioletadao.xyz/health' },
  { key: 'facilitator_supported', kind: 'json', url: 'https://facilitator.ultravioletadao.xyz/supported' },
  { key: 'meshrelay_stats', kind: 'json', url: 'https://api.meshrelay.xyz/irc/stats' },
  { key: 'meshrelay_channels', kind: 'json', url: 'https://api.meshrelay.xyz/irc/channels' },
  { key: 'meshrelay_messages', kind: 'json', url: 'https://api.meshrelay.xyz/irc/channels/%23agents/messages?limit=30' },
  { key: 'meshrelay_health', kind: 'json', url: 'https://api.meshrelay.xyz/health' },
  { key: 'meshrelay_certs', kind: 'json', url: 'https://api.meshrelay.xyz/sentinel/cert-status' },
  { key: 'meshrelay_em_tasks', kind: 'json', url: 'https://api.meshrelay.xyz/em/tasks/available' },
  { key: 'bridge_em_queue', kind: 'json', url: 'https://bridge.meshrelay.xyz/api/em/queue-stats' },
  { key: 'milly_stats', kind: 'json', url: 'https://api.402milly.xyz/stats' },
  { key: 'describe_index_md', kind: 'text', url: 'https://describe.net/index.md' },
  { key: 'describe_llms', kind: 'text', url: 'https://describe.net/llms.txt' },
  { key: 'kk_mcp_kk_get_kpis', kind: 'mcp', url: KK_MCP, tool: 'kk_get_kpis' },
  { key: 'kk_mcp_kk_recent_trades', kind: 'mcp', url: KK_MCP, tool: 'kk_recent_trades' },
  { key: 'kk_mcp_kk_market_snapshot', kind: 'mcp', url: KK_MCP, tool: 'kk_market_snapshot' },
  { key: 'kk_fuel', kind: 'json', url: 'https://karmakadabra.ultravioletadao.xyz/live/fuel.json' },
  { key: 'em_headers', kind: 'headers', url: 'https://execution.market/' },
  { key: 'describe_headers', kind: 'headers', url: 'https://describe.net/' },
  { key: 'meshrelay_skill_head', kind: 'head12', url: 'https://meshrelay.xyz/skill.md' },
  SEARCH_API
    ? { key: 'search_stats', kind: 'json', url: `${SEARCH_API.replace(/\/$/, '')}/stats`, displayUrl: '$REACT_APP_STREAM_SEARCH_API/stats' }
    : null,
].filter(Boolean);

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

async function fetchTarget(t) {
  const { signal, done } = withTimeout(TIMEOUT_MS);
  try {
    if (t.kind === 'mcp') {
      const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: t.tool, arguments: {} } });
      const res = await fetch(t.url, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'User-Agent': UA },
        body,
      });
      const text = await res.text();
      return { status: res.status, text, headers: res.headers, body };
    }
    const res = await fetch(t.url, {
      method: t.kind === 'headers' ? 'HEAD' : 'GET',
      signal,
      redirect: 'manual',
      headers: { Accept: t.kind === 'json' ? 'application/json' : '*/*', 'User-Agent': UA },
    });
    const text = t.kind === 'headers' ? '' : await res.text();
    return { status: res.status, text, headers: res.headers };
  } finally {
    done();
  }
}

function sanitizeString(str, redactions) {
  let out = str.replace(HEX64, (m) => {
    redactions.hex64 += 1;
    return `${m.slice(0, 10)}…`;
  });
  out = out.replace(LOCAL_PATH, (m) => {
    redactions.local_path += 1;
    return m.replace(/(?:[A-Za-z]:[\\/]|\\\\|(?:dao|ai|code)\/)/, '[ruta omitida]');
  });
  return out;
}

// Recorre el valor parseado y sanea solo las cadenas (claves incluidas).
function sanitizeDeep(value, redactions) {
  if (typeof value === 'string') return sanitizeString(value, redactions);
  if (Array.isArray(value)) return value.map((v) => sanitizeDeep(v, redactions));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[sanitizeString(k, redactions)] = sanitizeDeep(v, redactions);
    return out;
  }
  return value;
}

function parseRpc(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const line = text.split('\n').find((l) => l.startsWith('data:'));
    if (!line) throw new Error('unparseable MCP body');
    return JSON.parse(line.slice(5).trim());
  }
}

function headersToLines(status, headers) {
  const lines = [`HTTP/2 ${status}`];
  const wanted = ['content-type', 'x-frame-options', 'content-security-policy', 'access-control-allow-origin', 'server', 'cache-control', 'x-content-type-options', 'strict-transport-security', 'location'];
  for (const name of wanted) {
    const v = headers.get(name);
    if (v) lines.push(`${name}: ${v.length > 300 ? `${v.slice(0, 300)}…` : v}`);
  }
  return lines;
}

async function record(t) {
  const recordedAt = new Date().toISOString();
  const redactions = { hex64: 0, local_path: 0 };
  const displayUrl = t.displayUrl || t.url;
  const res = await fetchTarget(t);
  const entry = { recorded_at: recordedAt, key: t.key, cmd: '', url: displayUrl, status: res.status, stdout: [], redactions };

  if (t.kind === 'headers') {
    entry.cmd = `curl -sI ${displayUrl}`;
    const lines = headersToLines(res.status, res.headers);
    entry.headers = Object.fromEntries(lines.slice(1).map((l) => l.split(/:\s(.+)/).slice(0, 2)));
    entry.stdout = lines;
    return entry;
  }

  if (res.status !== 200) throw new Error(`${t.key}: HTTP ${res.status}`);

  if (t.kind === 'json') {
    entry.cmd = `curl -s ${displayUrl.includes('$') ? `"${displayUrl}"` : displayUrl} | jq .`;
    const json = sanitizeDeep(JSON.parse(res.text), redactions);
    entry.json = json;
    entry.stdout = JSON.stringify(json, null, 2).split('\n');
    return entry;
  }
  if (t.kind === 'text') {
    entry.cmd = `curl -s ${displayUrl}`;
    const clean = sanitizeString(res.text, redactions);
    entry.text = clean;
    entry.stdout = clean.split(/\r?\n/);
    return entry;
  }
  if (t.kind === 'head12') {
    entry.cmd = `curl -s ${displayUrl} | head -n 12`;
    const lines = sanitizeString(res.text, redactions).split(/\r?\n/).slice(0, 12);
    entry.text = lines.join('\n');
    entry.stdout = lines;
    return entry;
  }
  if (t.kind === 'mcp') {
    entry.cmd = `curl -s -X POST ${displayUrl} -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d '${res.body}' | jq -r .result.content[0].text | jq .`;
    entry.tool = t.tool;
    const rpc = parseRpc(res.text);
    if (!rpc.result || rpc.result.isError) throw new Error(`${t.key}: MCP isError`);
    const first = Array.isArray(rpc.result.content) ? rpc.result.content[0] : null;
    if (!first || typeof first.text !== 'string') throw new Error(`${t.key}: MCP sin content[0].text`);
    const json = sanitizeDeep(JSON.parse(first.text), redactions);
    entry.json = json;
    entry.stdout = JSON.stringify(json, null, 2).split('\n');
    return entry;
  }
  throw new Error(`unknown kind ${t.kind}`);
}

function scanForbidden(serialized, label) {
  HEX64.lastIndex = 0;
  if (HEX64.test(serialized)) throw new Error(`${label}: contiene 0x+64hex tras sanitizar — abortado`);
  HEX64.lastIndex = 0;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const failures = [];
  const written = [];
  const index = { generated_at: new Date().toISOString(), entries: {} };
  for (const t of TARGETS) {
    try {
      const entry = await record(t);
      const serialized = `${JSON.stringify(entry, null, 2)}\n`;
      scanForbidden(serialized, t.key);
      fs.writeFileSync(path.join(OUT_DIR, `${t.key}.json`), serialized);
      const summary = { recorded_at: entry.recorded_at, cmd: entry.cmd, url: entry.url, status: entry.status, lines: entry.stdout.length };
      if (entry.json !== undefined && JSON.stringify(entry.json).length <= INLINE_MAX) summary.json = entry.json;
      if (entry.headers) summary.headers = entry.headers;
      index.entries[t.key] = summary;
      written.push(`${t.key} (${entry.stdout.length} líneas, HTTP ${entry.status}${entry.redactions.hex64 ? `, ${entry.redactions.hex64} hashes truncados` : ''}${entry.redactions.local_path ? `, ${entry.redactions.local_path} rutas omitidas` : ''})`);
    } catch (e) {
      failures.push(`${t.key}: ${e && e.message}`);
    }
  }
  const indexSerialized = `${JSON.stringify(index, null, 2)}\n`;
  scanForbidden(indexSerialized, 'index');
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), indexSerialized);
  if (!SEARCH_API) failures.push('search_stats: REACT_APP_STREAM_SEARCH_API no definida — omitido');
  for (const w of written) process.stdout.write(`ok   ${w}\n`);
  for (const f of failures) process.stdout.write(`skip ${f}\n`);
  process.stdout.write(`\n${written.length} archivos + index.json en ${path.relative(ROOT, OUT_DIR)}\n`);
  if (written.length < 12) {
    process.stderr.write('ERROR: menos de 12 replays grabados\n');
    process.exit(1);
  }
}

main().catch((e) => {
  process.stderr.write(`ERROR: ${e && e.message}\n`);
  process.exit(1);
});
