import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SystemMap — the hero of the landing (docs/PLAN.md §2, §3).
 *
 * One SVG of the whole machine: 7 nodes across 4 layers, edges labelled with the
 * REAL protocol rather than an adjective. Phase 1 renders it static and reveals
 * it with IntersectionObserver; the scroll-driven camera lands in Phase 2.
 *
 * Motion budget (PLAN §5): opacity + transform only. Never layout properties.
 * prefers-reduced-motion removes the stagger entirely.
 *
 * Node budget is 7 and it is full. A new product becomes a detail inside an
 * existing node, not a new box — above 7 the mobile tower layout breaks.
 */

// value = ultraviolet, data = cyan, identity = amber (PLAN §2)
const CHANNEL = {
  value: { stroke: '#6a00ff', label: 'USDC / UVD' },
  data: { stroke: '#22d3ee', label: 'mensajes / datos' },
  identity: { stroke: '#f59e0b', label: 'identidad / reputación' },
};

const NODE_KIND = {
  community: { fill: '#131329', stroke: '#3f3f6a', accent: '#a78bfa' },
  rail: { fill: '#160f2e', stroke: '#6a00ff', accent: '#c4b5fd' },
  pillar: { fill: '#0f1b2e', stroke: '#22d3ee', accent: '#67e8f9' },
  swarm: { fill: '#1d1430', stroke: '#f59e0b', accent: '#fcd34d' },
};

const NODES = [
  { id: 'kk', kind: 'swarm', tKey: 'karmakadabra', name: 'KarmaKadabra', sub: '26 agentes · wallet propia' },
  { id: 'em', kind: 'pillar', tKey: 'executionMarket', name: 'Execution Market', sub: 'bounties · escrow on-chain' },
  { id: 'mr', kind: 'pillar', tKey: 'meshrelay', name: 'MeshRelay', sub: 'IRC para agentes' },
  { id: 'fac', kind: 'rail', tKey: 'facilitator', name: 'Facilitator x402', sub: 'EIP-3009 · sin gas' },
  { id: 'kh', kind: 'community', tKey: 'karmaHello', name: 'Karma Hello', sub: 'califica cada mensaje' },
  { id: 'ab', kind: 'community', tKey: 'abracadabra', name: 'Abracadabra', sub: 'VOD → transcripciones' },
  { id: 'chat', kind: 'community', tKey: 'chat', name: 'Chat Twitch + Kick', sub: 'personas reales' },
];

// Each edge carries the real protocol. `planned` edges are drawn dashed and
// labelled as such: documented but with no consumer code yet (PLAN §2).
const EDGES = [
  { from: 'chat', to: 'kh', type: 'data', tKey: 'chatToKh', label: 'mensajes' },
  { from: 'kh', to: 'chat', type: 'value', tKey: 'khToChat', label: 'UVD en Avalanche' },
  { from: 'chat', to: 'ab', type: 'data', tKey: 'chatToAb', label: 'VOD + audio' },
  { from: 'kh', to: 'fac', type: 'value', tKey: 'khToFac', label: 'USDC en Base' },
  { from: 'fac', to: 'em', type: 'value', tKey: 'facToEm', label: 'escrow EIP-3009' },
  { from: 'fac', to: 'mr', type: 'value', tKey: 'facToMr', label: 'x402 canales premium' },
  { from: 'em', to: 'mr', type: 'data', tKey: 'emToMr', label: 'webhooks de tareas', bidirectional: true },
  { from: 'kk', to: 'em', type: 'data', tKey: 'kkToEm', label: 'publish / apply / submit' },
  { from: 'kk', to: 'mr', type: 'data', tKey: 'kkToMr', label: 'negocian en IRC' },
  { from: 'em', to: 'kk', type: 'identity', tKey: 'emToKk', label: 'escrow_tx + ERC-8004' },
  // `bend` routes the two long diagonals around the OUTSIDE of the diagram.
  // Drawn straight they cut through the middle, where every other label lives.
  { from: 'ab', to: 'kk', type: 'data', tKey: 'abToKk', label: 'corpus de transcripciones', planned: true, bend: 170 },
  { from: 'kh', to: 'kk', type: 'data', tKey: 'khToKk', label: 'logs de chat crudos', planned: true, bend: -170 },
];

/**
 * Geometry for one edge: the path, and where its label sits.
 *
 * Labels are pushed perpendicular to the line rather than dropped on it —
 * centred labels get struck through by their own edge — and placed at 38%
 * instead of the midpoint so opposing edges don't stack their text.
 */
function edgeGeometry(a, b, e, bendScale) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len; // unit perpendicular
  const py = dx / len;

  if (e.bend) {
    const bend = e.bend * bendScale;
    const cx = (a.x + b.x) / 2 + px * bend;
    const cy = (a.y + b.y) / 2 + py * bend;
    // Point on the quadratic at t = 0.5, nudged off the stroke.
    const lx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x;
    const ly = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
    return { d: `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`, lx, ly: ly - 7 };
  }

  const t = 0.38;
  return {
    d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
    lx: a.x + dx * t + px * 12,
    ly: a.y + dy * t + py * 12,
  };
}

const LAYOUTS = {
  wide: {
    viewBox: '-70 -10 1140 700',
    node: { w: 190, h: 64 },
    labels: true,
    bendScale: 1,
    pos: {
      kk: { x: 500, y: 78 },
      em: { x: 288, y: 252 },
      mr: { x: 712, y: 252 },
      fac: { x: 500, y: 424 },
      kh: { x: 168, y: 592 },
      chat: { x: 500, y: 592 },
      ab: { x: 832, y: 592 },
    },
  },
  tower: {
    viewBox: '0 0 420 1000',
    node: { w: 170, h: 60 },
    labels: false,
    bendScale: 0.42,
    pos: {
      kk: { x: 210, y: 62 },
      em: { x: 106, y: 244 },
      mr: { x: 314, y: 244 },
      fac: { x: 210, y: 426 },
      kh: { x: 106, y: 608 },
      ab: { x: 314, y: 608 },
      chat: { x: 210, y: 790 },
    },
  },
};

const byId = (id) => NODES.find((n) => n.id === id);

function SystemMap({ layout = 'wide', className = '' }) {
  const { t } = useTranslation();
  const L = LAYOUTS[layout] || LAYOUTS.wide;
  const containerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const nodeLabel = (n) => t(`landing.map.nodes.${n.tKey}.name`, n.name);
  const nodeSub = (n) => t(`landing.map.nodes.${n.tKey}.sub`, n.sub);
  const edgeLabel = (e) => t(`landing.map.edges.${e.tKey}`, e.label);

  // Geometry computed once and shared: the strokes draw UNDER the node boxes,
  // the labels draw OVER them. Rendering labels in the edge group let an opaque
  // node box clip them ("UVD en Avalanche" came out as "D en Avalanche").
  const geos = EDGES.map((e) => {
    const a = L.pos[e.from];
    const b = L.pos[e.to];
    if (!a || !b) return null;
    return { e, geo: edgeGeometry(a, b, e, L.bendScale), ch: CHANNEL[e.type] || CHANNEL.data };
  }).filter(Boolean);

  return (
    <div ref={containerRef} className={className}>
      <svg
        viewBox={L.viewBox}
        className={`uvd-map w-full h-auto ${revealed ? 'is-revealed' : ''}`}
        role="img"
        aria-label={t(
          'landing.map.aria',
          'Mapa del sistema: la comunidad financia el facilitador de pagos, que habilita Execution Market y MeshRelay, sobre los que corre el enjambre KarmaKadabra.'
        )}
      >
        <defs>
          {Object.entries(CHANNEL).map(([key, ch]) => (
            <marker
              key={key}
              id={`uvd-arrow-${key}-${layout}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={ch.stroke} />
            </marker>
          ))}
        </defs>

        {/* Edge strokes first, so the opaque node boxes mask their endpoints */}
        <g className="uvd-map__edges">
          {geos.map(({ e, geo, ch }, i) => (
            <g key={`${e.from}-${e.to}-${i}`} style={{ transitionDelay: `${140 + i * 45}ms` }} className="uvd-map__edge">
              <path
                d={geo.d}
                fill="none"
                stroke={ch.stroke}
                strokeWidth={e.planned ? 1.4 : 2}
                strokeOpacity={e.planned ? 0.5 : 0.8}
                strokeDasharray={e.planned ? '6 6' : undefined}
                markerEnd={`url(#uvd-arrow-${e.type}-${layout})`}
                markerStart={e.bidirectional ? `url(#uvd-arrow-${e.type}-${layout})` : undefined}
              />
            </g>
          ))}
        </g>

        <g className="uvd-map__nodes">
          {NODES.map((n, i) => {
            const p = L.pos[n.id];
            if (!p) return null;
            const kind = NODE_KIND[n.kind] || NODE_KIND.community;
            const { w, h } = L.node;
            return (
              // Outer <g> owns the position attribute; inner <g> owns the CSS
              // reveal transform. Putting both on one node makes the CSS
              // transform override the attribute and misplace the box.
              <g key={n.id} transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}>
                <g className="uvd-map__node" style={{ transitionDelay: `${i * 70}ms` }}>
                <rect
                  width={w}
                  height={h}
                  rx="12"
                  fill={kind.fill}
                  stroke={kind.stroke}
                  strokeWidth="1.5"
                />
                <text x={w / 2} y={h / 2 - 4} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">
                  {nodeLabel(n)}
                </text>
                <text x={w / 2} y={h / 2 + 15} textAnchor="middle" fill={kind.accent} fontSize="10.5">
                  {nodeSub(n)}
                </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* Edge labels last: they must sit ON TOP of the node boxes, never under */}
        {L.labels && (
          <g className="uvd-map__edge-labels">
            {geos.map(({ e, geo, ch }, i) => (
              <text
                key={`lbl-${e.from}-${e.to}-${i}`}
                x={geo.lx}
                y={geo.ly}
                textAnchor="middle"
                className="uvd-map__edge uvd-map__edge-label"
                style={{ transitionDelay: `${140 + i * 45}ms` }}
                fill={ch.stroke}
                fontSize="11"
              >
                {edgeLabel(e)}
                {e.planned ? ` · ${t('landing.map.planned', 'planeado')}` : ''}
              </text>
            ))}
          </g>
        )}
      </svg>

      {/* Mobile degradation: edge labels are illegible at this width, so the
          connections become a readable list instead of unreadable SVG text. */}
      {!L.labels && (
        <ul className="mt-6 space-y-2 text-xs">
          {EDGES.map((e, i) => {
            const ch = CHANNEL[e.type] || CHANNEL.data;
            return (
              <li key={`l-${i}`} className="flex items-start gap-2 text-text-secondary">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: ch.stroke }}
                />
                <span>
                  <strong className="text-text-primary">{nodeLabel(byId(e.from))}</strong>
                  {' → '}
                  <strong className="text-text-primary">{nodeLabel(byId(e.to))}</strong>
                  {': '}
                  {edgeLabel(e)}
                  {e.planned ? ` (${t('landing.map.planned', 'planeado')})` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { NODES, EDGES, CHANNEL };
export default SystemMap;
