// Loader del grafo del ecosistema (contrato C1, wave3/ECOSYSTEM_PLAN.md).
// Fuente: c0der exporta public/ecosystem/graph.json (snapshot versionado) y una copia
// viva en S3 cada 15 min. Escalera: S3 vivo (ACAO * verificado 2026-08-27) → snapshot
// del sitio → throw (solo si ambos fallan). Nunca rutas locales: el contrato del JSON
// las excluye y validateGraph no las necesita.

export const GRAPH_LIVE_URL = 'https://ultravioletadao.s3.us-east-1.amazonaws.com/ecosystem/graph.json';
export const GRAPH_SNAPSHOT_URL = '/ecosystem/graph.json';

export const LAYER_ORDER = ['swarm', 'pillar', 'rail', 'community', 'tooling', 'external'];

export const LAYER_COLORS = {
  swarm: '#f59e0b',
  pillar: '#22d3ee',
  rail: '#6a00ff',
  community: '#a78bfa',
  tooling: '#64748b',
  external: '#94a3b8',
};

export const PROTOCOL_COLORS = {
  x402: '#6a00ff',
  IRC: '#22d3ee',
  'EIP-3009': '#6a00ff',
  'ERC-8004': '#f59e0b',
  HTTP: '#94a3b8',
  null: '#475569',
};

const debug = (...args) => {
  if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
    console.warn('[ecosystem/graph]', ...args);
  }
};

const isNonEmptyString = (v) => typeof v === 'string' && v.length > 0;

/**
 * Valida el contrato de datos y devuelve una copia saneada.
 * Lanza Error si el documento no es usable; descarta (con debug) aristas huérfanas.
 */
export function validateGraph(json) {
  if (!json || typeof json !== 'object') throw new Error('graph: not an object');
  if (json.schema_version !== 1) throw new Error(`graph: schema_version ${json.schema_version} !== 1`);
  if (!Array.isArray(json.nodes) || json.nodes.length < 5) throw new Error('graph: nodes < 5');
  if (!Array.isArray(json.edges)) throw new Error('graph: edges missing');

  const ids = new Set();
  const nodes = [];
  for (const raw of json.nodes) {
    if (!raw || !isNonEmptyString(raw.id) || !isNonEmptyString(raw.name)) {
      throw new Error('graph: node without id/name');
    }
    if (ids.has(raw.id)) throw new Error(`graph: duplicate id ${raw.id}`);
    ids.add(raw.id);
    nodes.push({
      id: raw.id,
      name: raw.name,
      layer: LAYER_ORDER.includes(raw.layer) ? raw.layer : 'external',
      url: isNonEmptyString(raw.url) ? raw.url : null,
      repo: isNonEmptyString(raw.repo) ? raw.repo : null,
      status: isNonEmptyString(raw.status) ? raw.status : 'planned',
      embeddable: raw.embeddable === true,
      tags: Array.isArray(raw.tags) ? raw.tags.filter(isNonEmptyString) : [],
      degree: Number.isFinite(raw.degree) ? raw.degree : 0,
    });
  }

  const edges = [];
  let dropped = 0;
  for (const raw of json.edges) {
    if (!raw || !ids.has(raw.source) || !ids.has(raw.target)) {
      dropped += 1;
      continue;
    }
    edges.push({
      source: raw.source,
      target: raw.target,
      type: isNonEmptyString(raw.type) ? raw.type : 'api_call',
      protocol: isNonEmptyString(raw.protocol) ? raw.protocol : null,
      evidence_count: Number.isFinite(raw.evidence_count) ? raw.evidence_count : 0,
      planned: raw.planned === true,
    });
  }
  if (dropped) debug('dropped orphan edges:', dropped);

  const source = json.source && typeof json.source === 'object' ? json.source : {};
  return {
    schema_version: 1,
    generated_at: isNonEmptyString(json.generated_at) ? json.generated_at : null,
    source: {
      tool: isNonEmptyString(source.tool) ? source.tool : 'c0der',
      scan_timestamp: isNonEmptyString(source.scan_timestamp) ? source.scan_timestamp : json.generated_at || null,
      projects_scanned: Number.isFinite(source.projects_scanned) ? source.projects_scanned : nodes.length,
    },
    nodes,
    edges,
  };
}

async function fetchJson(url, { signal, timeoutMs }) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

/**
 * Carga el grafo: S3 vivo → snapshot del sitio.
 * @returns {Promise<{ graph, status:'live'|'snapshot', fetchedAt:string, url:string }>}
 */
export async function loadEcosystemGraph({ signal, timeoutMs = 6000 } = {}) {
  const attempts = [
    { url: GRAPH_LIVE_URL, status: 'live' },
    { url: GRAPH_SNAPSHOT_URL, status: 'snapshot' },
  ];
  let lastError = null;
  for (const attempt of attempts) {
    try {
      const json = await fetchJson(attempt.url, { signal, timeoutMs });
      const graph = validateGraph(json);
      return { graph, status: attempt.status, fetchedAt: new Date().toISOString(), url: attempt.url };
    } catch (e) {
      lastError = e;
      debug('graph source failed', attempt.url, e && e.message);
      if (signal && signal.aborted) throw e;
    }
  }
  throw lastError || new Error('graph: no source available');
}

/** Índices derivados del grafo (puros, sin mutación). */
export function indexGraph(graph) {
  const byId = new Map();
  const inMap = new Map();
  const outMap = new Map();
  const byLayer = new Map();
  for (const layer of LAYER_ORDER) byLayer.set(layer, []);

  for (const node of graph.nodes) {
    byId.set(node.id, node);
    inMap.set(node.id, []);
    outMap.set(node.id, []);
    if (!byLayer.has(node.layer)) byLayer.set(node.layer, []);
    byLayer.get(node.layer).push(node);
  }
  let latent = 0;
  for (const edge of graph.edges) {
    outMap.get(edge.source).push(edge);
    inMap.get(edge.target).push(edge);
    if (edge.type === 'latent' || edge.planned) latent += 1;
  }
  for (const list of byLayer.values()) list.sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id));

  const inEdges = (id) => inMap.get(id) || [];
  const outEdges = (id) => outMap.get(id) || [];
  const dependsOn = (id) => outEdges(id).map((e) => byId.get(e.target)).filter(Boolean);
  const feeds = (id) => inEdges(id).map((e) => byId.get(e.source)).filter(Boolean);
  const products = graph.nodes
    .filter((n) => n.status === 'live' && n.url)
    .sort((a, b) => LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer) || b.degree - a.degree);

  return {
    byId,
    inEdges,
    outEdges,
    dependsOn,
    feeds,
    products,
    byLayer,
    counts: { nodes: graph.nodes.length, edges: graph.edges.length, latent },
  };
}
