// Allowlist ÚNICA de endpoints del ecosistema (contrato C3, wave3/ECOSYSTEM_PLAN.md).
// Todo lo que el sitio imprime como `curl -s <url>` sale de aquí: las ventanas, las tools
// WebMCP y el REPL (`curl` solo acepta URLs de esta lista). Cada entrada declara el estado
// de CORS verificado con fecha; `snapshot`/`snapshotDate` vienen de las sesiones grabadas por
// scripts/ecosystem/record-replays.js (src/data/ecosystem/replays/), nunca tipeadas a mano.
//
// Presupuesto de bundle: este módulo lo importan el Home y /ecosystem, así que solo trae el
// índice compacto de replays (index.json, ~2 KB gz): los cuerpos pesados (supported, mensajes,
// certificados, markdown) se cargan bajo demanda con loadSnapshot(key) en su propio chunk.
import replayIndex from '../../data/ecosystem/replays/index.json';

const SEARCH_API = process.env.REACT_APP_STREAM_SEARCH_API || null;

const CORS_VERIFIED_AT = '2026-08-27';

const selectSupported = (j) => ({
  kinds: Array.isArray(j.kinds) ? j.kinds.length : 0,
  networks: Array.isArray(j.kinds) ? new Set(j.kinds.map((k) => k.network)).size : 0,
});

// Cada entrada: { product, url|urlFor, method, cors:'live'|'prod-only', corsVerifiedAt, pollMs,
//                 select?, text?, third_party?, untrusted?, snapshotKey, snapshot, snapshotDate }
const DEFS = {
  facilitator_health: {
    product: 'facilitator',
    url: 'https://facilitator.ultravioletadao.xyz/health',
    method: 'GET',
    cors: 'live',
    pollMs: 60000,
    select: (j) => j.status,
    snapshotKey: 'facilitator_health',
  },
  facilitator_supported: {
    product: 'facilitator',
    url: 'https://facilitator.ultravioletadao.xyz/supported',
    method: 'GET',
    cors: 'live',
    pollMs: 300000,
    select: selectSupported,
    snapshotKey: 'facilitator_supported',
  },
  meshrelay_stats: {
    product: 'meshrelay',
    url: 'https://api.meshrelay.xyz/irc/stats',
    method: 'GET',
    cors: 'live',
    pollMs: 20000,
    select: (j) => j,
    snapshotKey: 'meshrelay_stats',
  },
  meshrelay_channels: {
    product: 'meshrelay',
    url: 'https://api.meshrelay.xyz/irc/channels',
    method: 'GET',
    cors: 'live',
    pollMs: 60000,
    select: (j) => (Array.isArray(j) ? j : Array.isArray(j.channels) ? j.channels : j),
    snapshotKey: 'meshrelay_channels',
  },
  meshrelay_messages: {
    product: 'meshrelay',
    urlFor: ({ channel = 'agents', limit = 30 } = {}) =>
      `https://api.meshrelay.xyz/irc/channels/${encodeURIComponent(`#${String(channel).replace(/^#/, '')}`)}/messages?limit=${Math.max(1, Math.min(100, Number(limit) || 30))}`,
    urlPrefix: 'https://api.meshrelay.xyz/irc/channels/',
    method: 'GET',
    cors: 'live',
    pollMs: 30000,
    untrusted: true,
    select: (j) => (Array.isArray(j) ? j : Array.isArray(j.messages) ? j.messages : []),
    snapshotKey: 'meshrelay_messages',
  },
  meshrelay_health: {
    product: 'meshrelay',
    url: 'https://api.meshrelay.xyz/health',
    method: 'GET',
    cors: 'live',
    pollMs: 60000,
    select: (j) => j,
    snapshotKey: 'meshrelay_health',
  },
  meshrelay_certs: {
    product: 'meshrelay',
    url: 'https://api.meshrelay.xyz/sentinel/cert-status',
    method: 'GET',
    cors: 'live',
    pollMs: 600000,
    select: (j) => j,
    snapshotKey: 'meshrelay_certs',
  },
  meshrelay_em_tasks: {
    product: 'execution-market',
    url: 'https://api.meshrelay.xyz/em/tasks/available',
    method: 'GET',
    cors: 'live',
    pollMs: 60000,
    select: (j) => j,
    snapshotKey: 'meshrelay_em_tasks',
  },
  bridge_em_queue: {
    product: 'execution-market',
    url: 'https://bridge.meshrelay.xyz/api/em/queue-stats',
    method: 'GET',
    cors: 'live',
    pollMs: 60000,
    select: (j) => j,
    snapshotKey: 'bridge_em_queue',
  },
  search_stats: {
    product: 'abracadabra',
    // Lambda de búsqueda de streams: CORS solo para el origen de producción.
    url: SEARCH_API ? `${SEARCH_API.replace(/\/$/, '')}/stats` : null,
    method: 'GET',
    cors: 'prod-only',
    pollMs: 300000,
    select: (j) => j,
    snapshotKey: 'search_stats',
  },
  milly_stats: {
    product: '402milly',
    url: 'https://api.402milly.xyz/stats',
    method: 'GET',
    cors: 'live',
    pollMs: 60000,
    select: (j) => j,
    snapshotKey: 'milly_stats',
  },
  describe_index_md: {
    product: 'describe-net',
    url: 'https://describe.net/index.md',
    method: 'GET',
    cors: 'live',
    pollMs: 0,
    text: true,
    select: (t) => t,
    snapshotKey: 'describe_index_md',
  },
  describe_llms: {
    product: 'describe-net',
    url: 'https://describe.net/llms.txt',
    method: 'GET',
    cors: 'live',
    pollMs: 0,
    text: true,
    select: (t) => t,
    snapshotKey: 'describe_llms',
  },
  kk_mcp: {
    product: 'karmakadabra',
    url: 'https://karmakadabra.ultravioletadao.xyz/mcp',
    method: 'POST',
    cors: 'live',
    pollMs: 60000,
    third_party: true,
    untrusted: true,
    select: (j) => j,
    snapshotKey: 'kk_mcp_kk_get_kpis',
  },
};

const entries = (replayIndex && replayIndex.entries) || {};

function safeSelect(select, json) {
  if (json === undefined || json === null) return null;
  try {
    const v = typeof select === 'function' ? select(json) : json;
    return v === undefined ? null : v;
  } catch (e) {
    return null;
  }
}

export const ENDPOINTS = Object.fromEntries(
  Object.entries(DEFS).map(([key, def]) => {
    const entry = entries[def.snapshotKey] || null;
    return [
      key,
      {
        key,
        corsVerifiedAt: CORS_VERIFIED_AT,
        ...def,
        // Valor ya "seleccionado" (misma forma que devuelve select sobre la respuesta viva).
        snapshot: entry && entry.json !== undefined ? safeSelect(def.select, entry.json) : null,
        snapshotDate: entry ? entry.recorded_at : null,
        snapshotLines: entry ? entry.lines : 0,
        snapshotCmd: entry ? entry.cmd : null,
      },
    ];
  })
);

export const ENDPOINT_KEYS = Object.keys(ENDPOINTS);

// Cuerpos completos grabados, en su propio chunk. Devuelve null si la clave no existe.
const REPLAY_LOADERS = {
  facilitator_health: () => import('../../data/ecosystem/replays/facilitator_health.json'),
  facilitator_supported: () => import('../../data/ecosystem/replays/facilitator_supported.json'),
  meshrelay_stats: () => import('../../data/ecosystem/replays/meshrelay_stats.json'),
  meshrelay_channels: () => import('../../data/ecosystem/replays/meshrelay_channels.json'),
  meshrelay_messages: () => import('../../data/ecosystem/replays/meshrelay_messages.json'),
  meshrelay_health: () => import('../../data/ecosystem/replays/meshrelay_health.json'),
  meshrelay_certs: () => import('../../data/ecosystem/replays/meshrelay_certs.json'),
  meshrelay_em_tasks: () => import('../../data/ecosystem/replays/meshrelay_em_tasks.json'),
  bridge_em_queue: () => import('../../data/ecosystem/replays/bridge_em_queue.json'),
  milly_stats: () => import('../../data/ecosystem/replays/milly_stats.json'),
  describe_index_md: () => import('../../data/ecosystem/replays/describe_index_md.json'),
  describe_llms: () => import('../../data/ecosystem/replays/describe_llms.json'),
  kk_mcp_kk_get_kpis: () => import('../../data/ecosystem/replays/kk_mcp_kk_get_kpis.json'),
  kk_mcp_kk_recent_trades: () => import('../../data/ecosystem/replays/kk_mcp_kk_recent_trades.json'),
  kk_mcp_kk_market_snapshot: () => import('../../data/ecosystem/replays/kk_mcp_kk_market_snapshot.json'),
  kk_fuel: () => import('../../data/ecosystem/replays/kk_fuel.json'),
  em_headers: () => import('../../data/ecosystem/replays/em_headers.json'),
  describe_headers: () => import('../../data/ecosystem/replays/describe_headers.json'),
  meshrelay_skill_head: () => import('../../data/ecosystem/replays/meshrelay_skill_head.json'),
};

export const REPLAY_KEYS = Object.keys(REPLAY_LOADERS);

/**
 * Carga un replay completo (chunk propio). `key` es una clave de ENDPOINTS o de replay.
 * @returns {Promise<{ key, value, raw, text, recorded_at, cmd, url, stdout }|null>}
 *   value = select(raw) para endpoints JSON, `text` para los de texto.
 */
export async function loadSnapshot(key) {
  const def = ENDPOINTS[key];
  const replayKey = def ? def.snapshotKey : key;
  const loader = REPLAY_LOADERS[replayKey];
  if (!loader) return null;
  const mod = await loader();
  const data = mod && mod.default ? mod.default : mod;
  if (!data || typeof data !== 'object') return null;
  const raw = data.json !== undefined ? data.json : data.text !== undefined ? data.text : null;
  return {
    key: replayKey,
    value: def ? safeSelect(def.select, raw) : raw,
    raw,
    text: typeof data.text === 'string' ? data.text : null,
    recorded_at: data.recorded_at || null,
    cmd: data.cmd || '',
    url: data.url || null,
    stdout: Array.isArray(data.stdout) ? data.stdout : [],
  };
}

// Documentación para el "Recibo de datos": lo que NO se puede leer desde el navegador y por qué.
// Verificado el 2026-08-27 con `curl -sD - -H "Origin: https://ultravioletadao.xyz" <url>`:
// 200 sin Access-Control-Allow-Origin (cors) o cabecera X-Frame-Options: DENY (xfo, ver replays).
export const BLOCKED = [
  { url: 'https://karmakadabra.ultravioletadao.xyz/graph.json', reasonKey: 'ecosystem.receipt.blocked_reason_cors', reason: 'sin Access-Control-Allow-Origin', replay: null },
  { url: 'https://karmakadabra.ultravioletadao.xyz/live/fuel.json', reasonKey: 'ecosystem.receipt.blocked_reason_cors', reason: 'sin Access-Control-Allow-Origin', replay: 'kk_fuel' },
  { url: 'https://execution.market/public/metrics', reasonKey: 'ecosystem.receipt.blocked_reason_cors', reason: 'sin Access-Control-Allow-Origin', replay: null },
  { url: 'https://execution.market/', reasonKey: 'ecosystem.receipt.blocked_reason_xfo', reason: 'X-Frame-Options: DENY', replay: 'em_headers' },
  { url: 'https://describe.net/', reasonKey: 'ecosystem.receipt.blocked_reason_xfo', reason: 'X-Frame-Options: DENY', replay: 'describe_headers' },
  { url: 'https://api.execution.market/skill.md', reasonKey: 'ecosystem.receipt.blocked_reason_cors', reason: 'sin Access-Control-Allow-Origin', replay: null },
  { url: 'https://meshrelay.xyz/skill.md', reasonKey: 'ecosystem.receipt.blocked_reason_cors', reason: 'sin Access-Control-Allow-Origin', replay: 'meshrelay_skill_head' },
  { url: 'https://api.describe.net/health', reasonKey: 'ecosystem.receipt.blocked_reason_cors', reason: 'sin Access-Control-Allow-Origin', replay: null },
];

// URLs del grafo (c0der → S3 / snapshot del sitio) también son "curl-eables" desde el REPL.
const GRAPH_URLS = [
  'https://ultravioletadao.s3.us-east-1.amazonaws.com/ecosystem/graph.json',
  'https://ultravioletadao.xyz/ecosystem/graph.json',
  '/ecosystem/graph.json',
];

const MESSAGES_RE = /^https:\/\/api\.meshrelay\.xyz\/irc\/channels\/%23[a-z0-9_-]+\/messages(?:\?limit=\d{1,3})?$/i;

/** true solo para URLs exactas de ENDPOINTS (o el patrón de mensajes por canal) y del grafo. */
export function isAllowedUrl(url) {
  if (typeof url !== 'string' || !url) return false;
  const clean = url.trim();
  if (GRAPH_URLS.includes(clean)) return true;
  for (const def of Object.values(ENDPOINTS)) {
    if (def.url && def.url === clean) return true;
    if (def.urlPrefix && clean.startsWith(def.urlPrefix) && MESSAGES_RE.test(clean)) return true;
  }
  return false;
}

/** Resuelve { url, method, headers } para una clave (params solo para urlFor). */
export function endpointFor(key, params) {
  const def = ENDPOINTS[key];
  if (!def) throw new Error(`endpoint desconocido: ${key}`);
  const url = typeof def.urlFor === 'function' ? def.urlFor(params || {}) : def.url;
  const headers = def.method === 'POST'
    ? { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }
    : { Accept: def.text ? 'text/plain, text/markdown, */*' : 'application/json' };
  return { url, method: def.method || 'GET', headers, text: Boolean(def.text) };
}

/** Comando equivalente, ejecutable tal cual (para las líneas `prompt`). */
export function curlFor(key, params) {
  const { url, text } = endpointFor(key, params);
  if (!url) return null;
  const quoted = /[?&]/.test(url) ? `"${url}"` : url;
  return text ? `curl -s ${quoted}` : `curl -s ${quoted} | jq .`;
}

export const REPLAY_GENERATED_AT = (replayIndex && replayIndex.generated_at) || null;
