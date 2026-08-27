import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LAYER_COLORS, LAYER_ORDER, PROTOCOL_COLORS } from '../../services/ecosystem/graph';

/**
 * SystemMap — "cómo se comunican": un solo SVG del ecosistema, generalizado a graph.json
 * (cherry-pick de feat/agentic-landing @ fe019ae, generalizado en la ola 3 — WP2.6).
 *
 * Ya no hay NODES/EDGES/CHANNEL hardcodeadas: los nodos son `index.products` (status live con
 * URL) ordenados por capa (swarm arriba → community abajo → external) y por degree; las
 * posiciones se calculan por fila; las aristas son las del grafo medido por c0der entre esos
 * nodos, etiquetadas con el PROTOCOLO real (landing.map.protocol.*) y con grosor por
 * evidence_count. Las latentes van punteadas y marcadas como planeadas.
 *
 * Se conserva: reveal por IntersectionObserver, lista móvil (<ul>) en el layout tower y el
 * aria-label. Motion: solo opacity + transform; prefers-reduced-motion quita el stagger.
 */

const NODE_FILL = {
  swarm: '#1d1430',
  pillar: '#0f1b2e',
  rail: '#160f2e',
  community: '#131329',
  tooling: '#141a22',
  external: '#161a20',
};

const NODE_ACCENT = {
  swarm: '#fcd34d',
  pillar: '#67e8f9',
  rail: '#c4b5fd',
  community: '#a78bfa',
  tooling: '#94a3b8',
  external: '#cbd5e1',
};

// Con ~50 aristas entre 10 productos, etiquetar todas es ilegible: en el layout ancho solo llevan
// texto las aristas con protocolo declarado y evidencia >= este umbral. Todas siguen dibujadas
// (color = protocolo, grosor = evidencia) y todas aparecen en la lista móvil.
const LABEL_MIN_EVIDENCE = 6;

const LAYOUTS = {
  wide: { viewW: 1140, xMin: 95, xMax: 1045, top: 92, rowGap: 160, node: { w: 190, h: 64 }, perLine: Infinity, labels: true },
  tower: { viewW: 420, xMin: 106, xMax: 314, top: 70, rowGap: 120, node: { w: 170, h: 60 }, perLine: 2, labels: false },
};

const protocolColor = (protocol) => PROTOCOL_COLORS[protocol] || PROTOCOL_COLORS.null || '#475569';
const protocolSlug = (protocol) => String(protocol || 'none').replace(/[^a-z0-9]/gi, '').toLowerCase();
const strokeWidth = (evidence) => Math.min(3, 0.6 + (evidence || 0) / 6);

const chunk = (arr, size) => {
  if (!Number.isFinite(size)) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/** Posiciones por fila: una fila por capa presente (LAYER_ORDER), dentro de la fila por degree desc. */
function computePositions(nodes, L) {
  const byLayer = new Map();
  for (const n of nodes) {
    if (!byLayer.has(n.layer)) byLayer.set(n.layer, []);
    byLayer.get(n.layer).push(n);
  }
  const lines = [];
  for (const layer of LAYER_ORDER) {
    const row = byLayer.get(layer);
    if (!row || !row.length) continue;
    row.sort((a, b) => (b.degree || 0) - (a.degree || 0) || a.id.localeCompare(b.id));
    for (const line of chunk(row, L.perLine)) lines.push(line);
  }
  const pos = new Map();
  lines.forEach((line, i) => {
    const y = L.top + i * L.rowGap;
    line.forEach((n, j) => {
      const x = line.length === 1 ? (L.xMin + L.xMax) / 2 : L.xMin + ((L.xMax - L.xMin) * j) / (line.length - 1);
      pos.set(n.id, { x, y });
    });
  });
  const viewH = lines.length ? L.top + (lines.length - 1) * L.rowGap + L.node.h / 2 + 40 : 200;
  return { pos, viewH };
}

/** Une A→B y B→A en una sola arista bidireccional (evidencia sumada, protocolo declarado si alguno lo tiene). */
function mergeEdges(edges) {
  const merged = new Map();
  for (const e of edges) {
    const key = [e.source, e.target].sort().join('|');
    const latent = e.type === 'latent' || e.planned === true;
    const prev = merged.get(key);
    if (!prev) {
      merged.set(key, { from: e.source, to: e.target, protocol: e.protocol || null, evidence: e.evidence_count || 0, planned: latent, bidirectional: false });
      continue;
    }
    prev.bidirectional = prev.bidirectional || prev.from !== e.source;
    prev.evidence += e.evidence_count || 0;
    if (!prev.protocol && e.protocol) prev.protocol = e.protocol;
    prev.planned = prev.planned && latent;
  }
  return [...merged.values()].sort((a, b) => b.evidence - a.evidence);
}

/**
 * Geometry for one edge: the path, and where its label sits.
 * Labels are pushed perpendicular to the line rather than dropped on it —
 * centred labels get struck through by their own edge — and placed at 38%
 * instead of the midpoint so opposing edges don't stack their text.
 */
function edgeGeometry(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const t = 0.38;
  return {
    d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
    lx: a.x + dx * t + px * 12,
    ly: a.y + dy * t + py * 12,
  };
}

const REVEAL_CSS = `
.uvd-map .uvd-map__node, .uvd-map .uvd-map__edge { opacity: 0; transition: opacity 600ms ease, transform 600ms ease; }
.uvd-map .uvd-map__node { transform: translateY(8px); }
.uvd-map.is-revealed .uvd-map__node, .uvd-map.is-revealed .uvd-map__edge { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .uvd-map .uvd-map__node, .uvd-map .uvd-map__edge { transition: none !important; transition-delay: 0ms !important; }
}`;

function SystemMap({ graph, index, layout = 'wide', className = '' }) {
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

  const nodes = useMemo(() => (index && Array.isArray(index.products) ? index.products : []), [index]);
  const { pos, viewH } = useMemo(() => computePositions(nodes, L), [nodes, L]);
  const edges = useMemo(() => {
    if (!graph || !Array.isArray(graph.edges)) return [];
    const ids = new Set(nodes.map((n) => n.id));
    return mergeEdges(graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target)));
  }, [graph, nodes]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const nodeLabel = (n) => n.name;
  const nodeSub = (n) => t(`landing.map.nodes.${n.id}.sub`, t(`ecosystem.graph.layers.${n.layer}`, n.layer));
  const edgeLabel = (e) => t(`landing.map.protocol.${e.protocol || 'unknown'}`, e.protocol || 'sin protocolo declarado');
  const plannedLabel = t('landing.map.planned', 'planeado');

  const geos = edges
    .map((e) => {
      const a = pos.get(e.from);
      const b = pos.get(e.to);
      if (!a || !b) return null;
      return { e, geo: edgeGeometry(a, b), color: protocolColor(e.protocol), slug: protocolSlug(e.protocol) };
    })
    .filter(Boolean);

  const markerSlugs = [...new Set(geos.map((g) => g.slug))];

  return (
    <div ref={containerRef} className={className} data-system-map={layout}>
      <style>{REVEAL_CSS}</style>
      <svg
        viewBox={`0 0 ${L.viewW} ${viewH}`}
        className={`uvd-map w-full h-auto ${revealed ? 'is-revealed' : ''}`}
        role="img"
        aria-label={t(
          'landing.map.aria',
          'Mapa del sistema: la comunidad financia el facilitador de pagos x402, que habilita Execution Market, MeshRelay y Describe.net, sobre los que corre el enjambre KarmaKadabra. Aristas medidas por c0der.'
        )}
      >
        <defs>
          {markerSlugs.map((slug) => {
            const color = protocolColor(geos.find((g) => g.slug === slug).e.protocol);
            return (
              <marker
                key={slug}
                id={`uvd-arrow-${slug}-${layout}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
              </marker>
            );
          })}
        </defs>

        {/* Edge strokes first, so the opaque node boxes mask their endpoints */}
        <g className="uvd-map__edges">
          {geos.map(({ e, geo, color, slug }, i) => (
            <g key={`${e.from}-${e.to}`} style={{ transitionDelay: `${140 + i * 30}ms` }} className="uvd-map__edge">
              <path
                d={geo.d}
                fill="none"
                stroke={color}
                strokeWidth={e.planned ? 1.2 : strokeWidth(e.evidence)}
                strokeOpacity={e.planned ? 0.5 : e.protocol ? 0.85 : 0.5}
                strokeDasharray={e.planned ? '6 6' : undefined}
                markerEnd={`url(#uvd-arrow-${slug}-${layout})`}
                markerStart={e.bidirectional ? `url(#uvd-arrow-${slug}-${layout})` : undefined}
              />
            </g>
          ))}
        </g>

        <g className="uvd-map__nodes">
          {nodes.map((n, i) => {
            const p = pos.get(n.id);
            if (!p) return null;
            const { w, h } = L.node;
            const stroke = LAYER_COLORS[n.layer] || LAYER_COLORS.external;
            return (
              // Outer <g> owns the position attribute; inner <g> owns the CSS reveal transform.
              <g key={n.id} transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}>
                <g className="uvd-map__node" style={{ transitionDelay: `${i * 60}ms` }}>
                  <rect
                    data-map-node={n.id}
                    width={w}
                    height={h}
                    rx="12"
                    fill={NODE_FILL[n.layer] || NODE_FILL.community}
                    stroke={stroke}
                    strokeWidth="1.5"
                  />
                  <text x={w / 2} y={h / 2 - 4} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">
                    {nodeLabel(n)}
                  </text>
                  <text x={w / 2} y={h / 2 + 15} textAnchor="middle" fill={NODE_ACCENT[n.layer] || NODE_ACCENT.community} fontSize="10.5">
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
            {geos
              .filter(({ e }) => e.planned || (e.protocol && e.evidence >= LABEL_MIN_EVIDENCE))
              .map(({ e, geo, color }, i) => (
                <text
                  key={`lbl-${e.from}-${e.to}`}
                  x={geo.lx}
                  y={geo.ly}
                  textAnchor="middle"
                  className="uvd-map__edge uvd-map__edge-label"
                  style={{ transitionDelay: `${140 + i * 30}ms` }}
                  fill={color}
                  fontSize="11"
                >
                  {edgeLabel(e)}
                  {e.planned ? ` · ${plannedLabel}` : ` · n=${e.evidence}`}
                </text>
              ))}
          </g>
        )}
      </svg>

      {/* Mobile degradation: edge labels are illegible at this width, so the
          connections become a readable list instead of unreadable SVG text. */}
      {!L.labels && (
        <ul className="mt-6 space-y-2 text-xs" data-map-edge-list="">
          {edges.map((e) => {
            const color = protocolColor(e.protocol);
            const from = byId.get(e.from);
            const to = byId.get(e.to);
            return (
              <li key={`l-${e.from}-${e.to}`} className="flex items-start gap-2 text-text-secondary">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span>
                  <strong className="text-text-primary">{from ? nodeLabel(from) : e.from}</strong>
                  {e.bidirectional ? ' ↔ ' : ' → '}
                  <strong className="text-text-primary">{to ? nodeLabel(to) : e.to}</strong>
                  {': '}
                  {edgeLabel(e)}
                  {` (n=${e.evidence})`}
                  {e.planned ? ` (${plannedLabel})` : ''}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SystemMap;
