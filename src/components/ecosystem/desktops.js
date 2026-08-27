// Escritorios de /ecosystem (contrato C11, wave3/ECOSYSTEM_PLAN.md). Solo datos: lo importan
// las tools WebMCP (chunk inicial) y el escritorio, así que aquí no entra ningún componente.
// `nodeIds` enlaza el escritorio con los nodos del grafo medido por c0der (graph.json);
// `windows` es la disposición inicial (open:true = abierta al entrar; el resto va al dock).

export const DESKTOPS = [
  {
    id: 'ecosystem',
    titleKey: 'ecosystem.panel.desktops.ecosystem',
    nodeIds: null,
    windows: [
      { kind: 'graph', open: true, pos: { x: 24, y: 24 } },
      { kind: 'pulse', open: true },
      { kind: 'irc', params: { channel: 'agents' }, open: true },
      { kind: 'agent', open: true },
      { kind: 'narrative' },
      { kind: 'milly' },
    ],
  },
  {
    id: 'karmakadabra',
    titleKey: 'ecosystem.panel.desktops.karmakadabra',
    nodeIds: ['karmakadabra'],
    windows: [
      { kind: 'observatory', open: true },
      { kind: 'kk_kpi', open: true },
      { kind: 'kk_trades' },
      // Abajo a la derecha: la cascada la dejaba encima del CTA "Cargar observatorio 3D"
      // (abajo-izquierda del facade) en 1280×800. makeWindow recorta el pos al área real.
      { kind: 'kk_status', open: true, pos: { x: 744, y: 390 } },
      { kind: 'irc', params: { channel: 'karmakadabra' } },
    ],
  },
  {
    id: 'execution_market',
    titleKey: 'ecosystem.panel.desktops.execution_market',
    nodeIds: ['execution-market'],
    windows: [
      { kind: 'em_metrics', open: true },
      { kind: 'em_tasks', open: true },
      { kind: 'irc', params: { channel: 'bounties' } },
      { kind: 'replay', params: { key: 'em_headers' }, open: true },
    ],
  },
  {
    id: 'meshrelay',
    titleKey: 'ecosystem.panel.desktops.meshrelay',
    nodeIds: ['meshrelay'],
    windows: [
      { kind: 'mesh_stats', open: true },
      { kind: 'mesh_channels', open: true },
      { kind: 'irc', params: { channel: 'agents' }, open: true },
      { kind: 'mesh_certs' },
      { kind: 'site', params: { url: 'https://meshrelay.xyz' } },
    ],
  },
  {
    id: 'describe_net',
    titleKey: 'ecosystem.panel.desktops.describe_net',
    nodeIds: ['describe-net'],
    windows: [
      { kind: 'md', params: { key: 'describe_index_md' }, open: true },
      { kind: 'md', params: { key: 'describe_llms' } },
      { kind: 'replay', params: { key: 'describe_headers' }, open: true },
    ],
  },
  {
    id: 'facilitator',
    titleKey: 'ecosystem.panel.desktops.facilitator',
    nodeIds: ['facilitator', 'x402-sdk'],
    windows: [
      { kind: 'fac_health', open: true },
      { kind: 'fac_supported', open: true },
      { kind: 'code', params: { snippet: 'x402-rs-main' }, open: true },
      { kind: 'code', params: { snippet: 'sdk-ts-index' } },
      { kind: 'code', params: { snippet: 'sdk-py-client' } },
      { kind: 'code', params: { snippet: 'uvdweb-tools' } },
    ],
  },
];

export const DESKTOP_IDS = DESKTOPS.map((d) => d.id);

/** Índice del escritorio por id o índice numérico; -1 si no existe. */
export function desktopIndex(ref) {
  if (typeof ref === 'number') return ref >= 0 && ref < DESKTOPS.length ? ref : -1;
  return DESKTOPS.findIndex((d) => d.id === ref);
}

/** Escritorio cuyo nodeIds incluye el nodo (null si ninguno). */
export function desktopForNode(nodeId) {
  return DESKTOPS.find((d) => Array.isArray(d.nodeIds) && d.nodeIds.includes(nodeId)) || null;
}

/** Escritorio "natural" de un kind (el primero que lo declara), o null. */
export function desktopForKind(kind) {
  return DESKTOPS.find((d) => d.windows.some((w) => w.kind === kind)) || null;
}
