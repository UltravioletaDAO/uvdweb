// EcosystemGraph — wallpaper interactivo del escritorio 0 de /ecosystem (WP2.2).
// Canvas 2D (DPR ≤ 2) con el grafo MEDIDO por c0der: nodos = círculo de radio 6 + degree/2 con halo
// por capa (LAYER_COLORS), aristas por protocolo (PROTOCOL_COLORS) con grosor min(3, 0.6 + evidence/6)
// — la misma fórmula de render/html_view.py de c0der —, latentes punteadas [4,6].
// Layout: layoutForce (d3-force, semilla layoutLayered) en useMemo; el tiempo se expone en data-layout-ms.
// Redibuja SOLO en hover / highlight / resize / cambio de grafo: no hay rAF continuo.
// Accesibilidad: un <button class="sr-only" data-node-hit=id> por nodo (teclado y tests) y una
// <ul class="sr-only"> con todas las aristas para lectores de pantalla. Tooltip DOM role=tooltip.
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useEcosystemGraph from '../useEcosystemGraph';
import { useDesk } from '../desk/useDesk';
import { LAYER_COLORS, PROTOCOL_COLORS } from '../../../services/ecosystem/graph';
import { layoutForce } from './layoutForce';
import {
  buildAdjacency,
  clampDpr,
  edgeWidth,
  hitTestNode,
  isLatent,
  neighborsOf,
  nodeRadius,
  shortenToward,
  touches,
} from './graphMath';


// Calentamiento del layout al cargar el chunk (antes del primer render): la primera ejecución de
// d3-force paga el JIT (10–40 ms en frío en una máquina cargada); con este micro-grafo el trabajo
// real del wallpaper queda en el orden de 1–3 ms. Determinista y sin efectos secundarios.
layoutForce(
  { nodes: [{ id: 'a', layer: 'swarm', degree: 1 }, { id: 'b', layer: 'rail', degree: 1 }], edges: [{ source: 'a', target: 'b', evidence_count: 1 }] },
  { width: 200, height: 200, iterations: 30 }
);

const BG = '#0a0a1b';
const LABEL = '#e0e0e0';
const LABEL_DIM = 'rgba(224,224,224,0.45)';
const FONT = '11px ui-monospace, "JetBrains Mono", "Cascadia Code", Consolas, monospace';
const DIM_ALPHA = 0.2; // aristas que no tocan el nodo resaltado
const NODE_DIM_ALPHA = 0.35;

const protocolColor = (protocol) => PROTOCOL_COLORS[protocol] || PROTOCOL_COLORS.null || '#475569';

function drawArrow(ctx, from, to, radius, color) {
  const tip = shortenToward(from, to, radius + 1);
  const size = 5;
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(tip.angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size / 2);
  ctx.lineTo(-size, size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function paint(canvas, { graph, positions, adjacency, width, height, hoverId, highlightId }) {
  if (!canvas || !graph || !width || !height) return;
  const dpr = clampDpr(typeof window !== 'undefined' ? window.devicePixelRatio : 1);
  const pw = Math.round(width * dpr);
  const ph = Math.round(height * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const focusId = highlightId || hoverId || null;
  const neighbors = focusId ? neighborsOf(adjacency, focusId) : null;
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  // Aristas (debajo de los nodos)
  ctx.lineCap = 'round';
  for (const e of graph.edges) {
    const a = positions.get(e.source);
    const b = positions.get(e.target);
    if (!a || !b) continue;
    const active = focusId ? touches(e, focusId) : false;
    const alpha = focusId ? (active ? 0.95 : DIM_ALPHA) : 0.55;
    const color = protocolColor(e.protocol);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = edgeWidth(e) + (active ? 0.6 : 0);
    ctx.setLineDash(isLatent(e) ? [4, 6] : []);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
    const target = byId.get(e.target);
    if (target) drawArrow(ctx, a, b, nodeRadius(target), color);
  }

  // Nodos
  ctx.font = FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (const n of graph.nodes) {
    const p = positions.get(n.id);
    if (!p) continue;
    const r = nodeRadius(n);
    const color = LAYER_COLORS[n.layer] || LAYER_COLORS.external;
    const isFocus = focusId === n.id;
    const related = !focusId || isFocus || (neighbors && neighbors.has(n.id));
    ctx.globalAlpha = related ? 1 : NODE_DIM_ALPHA;

    // Halo por capa (más fuerte en hover/highlight)
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = isFocus ? 26 : 14;
    ctx.fillStyle = BG;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = related ? 1 : NODE_DIM_ALPHA;
    ctx.lineWidth = isFocus ? 2.5 : 1.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.globalAlpha = related ? 0.28 : 0.1;
    ctx.fill();

    // Etiqueta mono debajo del nodo
    ctx.globalAlpha = 1;
    ctx.fillStyle = related ? LABEL : LABEL_DIM;
    ctx.fillText(n.name, p.x, p.y + r + 4);
  }
  ctx.globalAlpha = 1;
}

export default function EcosystemGraph({ className = '' }) {
  const { t } = useTranslation();
  const { graph, index } = useEcosystemGraph();
  const { state, actions } = useDesk();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverId, setHoverId] = useState(null);
  const highlightId = state ? state.highlightNode || null : null;

  // Tamaño del contenedor (una sola fuente: ResizeObserver; fallback a resize de window)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const read = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };
    read();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', read);
      return () => window.removeEventListener('resize', read);
    }
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Layout: síncrono y medido. Depende solo del grafo y del tamaño.
  const { positions, layoutMs } = useMemo(() => {
    if (!graph || !size.width || !size.height) return { positions: new Map(), layoutMs: 0 };
    const hasPerf = typeof performance !== 'undefined' && typeof performance.now === 'function';
    const t0 = hasPerf ? performance.now() : 0;
    // 150 ticks bastan para 18 nodos (mismo dibujo que 300, la mitad del costo en frío).
    const pos = layoutForce(graph, {
      width: size.width,
      height: size.height,
      iterations: 150,
      padding: Math.max(32, Math.round(Math.min(size.width, size.height) * 0.08)),
    });
    const ms = hasPerf ? performance.now() - t0 : 0;
    return { positions: pos, layoutMs: ms };
  }, [graph, size.width, size.height]);

  const adjacency = useMemo(() => (graph ? buildAdjacency(graph) : new Map()), [graph]);

  // Redibujo solo cuando cambia algo visible.
  useEffect(() => {
    paint(canvasRef.current, {
      graph,
      positions,
      adjacency,
      width: size.width,
      height: size.height,
      hoverId,
      highlightId,
    });
  }, [graph, positions, adjacency, size.width, size.height, hoverId, highlightId]);

  const nodeAt = useCallback(
    (clientX, clientY) => {
      const el = canvasRef.current;
      if (!el || !graph) return null;
      const rect = el.getBoundingClientRect();
      return hitTestNode(positions, graph.nodes, clientX - rect.left, clientY - rect.top);
    },
    [graph, positions]
  );

  const onPointerMove = useCallback(
    (ev) => {
      const hit = nodeAt(ev.clientX, ev.clientY);
      const id = hit ? hit.id : null;
      setHoverId((prev) => (prev === id ? prev : id));
    },
    [nodeAt]
  );

  const onPointerLeave = useCallback(() => setHoverId(null), []);

  const openNode = useCallback(
    (id) => {
      if (!id || !actions) return;
      if (typeof actions.focusNode === 'function') actions.focusNode(id);
      if (typeof actions.open === 'function') actions.open('node', { nodeId: id });
    },
    [actions]
  );

  const onClick = useCallback(
    (ev) => {
      const hit = nodeAt(ev.clientX, ev.clientY);
      if (hit) openNode(hit.id);
    },
    [nodeAt, openNode]
  );

  const hoverNode = hoverId && index ? index.byId.get(hoverId) : null;
  const hoverPos = hoverNode ? positions.get(hoverNode.id) : null;
  const layerName = (layer) => t(`ecosystem.graph.layers.${layer}`, layer);
  const nodeAria = (n) =>
    t('ecosystem.graph.node_aria', {
      defaultValue: '{{name}}, capa {{layer}}, {{degree}} conexiones',
      name: n.name,
      layer: layerName(n.layer),
      degree: n.degree,
    });

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      data-wallpaper-root=""
      aria-label={t(
        'ecosystem.graph.wallpaper_aria',
        'Mapa del ecosistema: nodos por capa y aristas medidas por c0der. La lista completa de aristas sigue a continuación.'
      )}
      role="group"
    >
      <canvas
        ref={canvasRef}
        data-wallpaper=""
        data-layout-ms={layoutMs.toFixed(2)}
        data-nodes={graph ? graph.nodes.length : 0}
        data-edges={graph ? graph.edges.length : 0}
        className="block h-full w-full select-none"
        style={{ cursor: hoverId ? 'pointer' : 'default', touchAction: 'manipulation' }}
        aria-hidden="true"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      />

      {/* Un botón por nodo, posicionado sobre el punto real: teclado, lectores y tests. */}
      {graph &&
        graph.nodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;
          return (
            <button
              key={n.id}
              type="button"
              className="sr-only"
              data-node-hit={n.id}
              data-x={Math.round(p.x)}
              data-y={Math.round(p.y)}
              style={{ position: 'absolute', left: `${p.x}px`, top: `${p.y}px` }}
              aria-label={nodeAria(n)}
              onFocus={() => setHoverId(n.id)}
              onBlur={() => setHoverId((prev) => (prev === n.id ? null : prev))}
              onClick={(ev) => {
                ev.stopPropagation();
                openNode(n.id);
              }}
            >
              {n.name}
            </button>
          );
        })}

      {hoverNode && hoverPos ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 rounded border border-ultraviolet/40 bg-background/90 px-2 py-1 font-mono text-[11px] text-text-primary shadow-lg"
          style={{
            left: `${Math.min(hoverPos.x + 14, Math.max(0, size.width - 220))}px`,
            top: `${Math.min(hoverPos.y + 14, Math.max(0, size.height - 48))}px`,
          }}
        >
          <span className="font-semibold text-white">{hoverNode.name}</span>
          <span className="text-text-secondary">
            {' · '}
            {layerName(hoverNode.layer)}
            {' · '}
            {hoverNode.degree}
            {' · '}
            {t(`ecosystem.graph.status.${hoverNode.status}`, hoverNode.status)}
          </span>
        </div>
      ) : null}

      {/* Todas las aristas medidas, para lectores de pantalla. */}
      {graph && index ? (
        <ul className="sr-only" data-wallpaper-edges="">
          {graph.edges.map((e, i) => {
            const s = index.byId.get(e.source);
            const tg = index.byId.get(e.target);
            return (
              <li key={`${e.source}-${e.target}-${i}`}>
                {(s ? s.name : e.source) + ' → ' + (tg ? tg.name : e.target)}
                {' · '}
                {t(`landing.map.protocol.${e.protocol || 'unknown'}`, e.protocol || 'sin protocolo declarado')}
                {' · n='}
                {e.evidence_count}
                {isLatent(e) ? ` · ${t('ecosystem.graph.latent', 'latente')}` : ''}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
