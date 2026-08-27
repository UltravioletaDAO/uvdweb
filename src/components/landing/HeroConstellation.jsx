import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { loadEcosystemGraph, LAYER_COLORS, PROTOCOL_COLORS } from '../../services/ecosystem/graph';
import { layoutLayered } from '../ecosystem/graph/layoutLayered';

/**
 * HeroConstellation — el mapa medido por c0der, tenue, detras del H1 del Home
 * (ECOSYSTEM_PLAN §1.1 "idle" / WP4.3).
 *
 * - Se decide en requestIdleCallback (fallback setTimeout 1500): solo >=1024 px
 *   y sin navigator.connection.saveData. Bajo 1024 px NO se monta el canvas.
 * - Un solo dibujo (Canvas 2D, DPR <= 2). Sin rAF continuo: motion-safe traza
 *   las aristas progresivamente en <= 900 ms y para; reduce-motion dibuja todo
 *   de una vez. Se redibuja solo al cambiar el tamano de la ventana.
 * - absolute + pointer-events-none + aria-hidden: cero CLS, cero interaccion.
 */

const TRACE_MS = 900;
const WIDE_QUERY = '(min-width: 1024px)';

function edgeWidth(e) {
  const n = typeof e.evidence_count === 'number' ? e.evidence_count : 0;
  return Math.min(3, 0.6 + n / 6);
}

function nodeRadius(n) {
  const d = typeof n.degree === 'number' ? n.degree : 0;
  return Math.min(10, 3 + d / 3);
}

function paint(canvas, graph, progress) {
  const parent = canvas.parentElement;
  const w = parent ? parent.clientWidth : canvas.clientWidth;
  const h = parent ? parent.clientHeight : canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const pos = layoutLayered(graph, { width: w, height: h, padding: Math.round(Math.min(w, h) * 0.08) });
  const edges = graph.edges || [];
  const shown = Math.ceil(edges.length * progress);

  ctx.lineCap = 'round';
  for (let i = 0; i < shown; i += 1) {
    const e = edges[i];
    const a = pos.get(e.source);
    const b = pos.get(e.target);
    if (!a || !b) continue;
    ctx.strokeStyle = PROTOCOL_COLORS[e.protocol] || PROTOCOL_COLORS.null || '#475569';
    ctx.lineWidth = edgeWidth(e);
    ctx.setLineDash(e.planned || e.type === 'latent' ? [4, 6] : []);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Nodos: halo suave + nucleo, color por capa. Aparecen con la primera arista.
  const alpha = progress <= 0 ? 0 : Math.min(1, progress * 2);
  ctx.globalAlpha = alpha;
  for (const n of graph.nodes || []) {
    const p = pos.get(n.id);
    if (!p) continue;
    const r = nodeRadius(n);
    const color = LAYER_COLORS[n.layer] || '#94a3b8';
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.25;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export default function HeroConstellation() {
  const reduced = useReducedMotion();
  const canvasRef = useRef(null);
  const [graph, setGraph] = useState(null);
  const [active, setActive] = useState(false);

  // 1) En idle: decidir si aplica (ancho + saveData) y cargar el grafo.
  useEffect(() => {
    let cancelled = false;
    let idleId = null;
    let timer = null;
    const controller = new AbortController();
    const mql = window.matchMedia(WIDE_QUERY);
    const saveData = !!(navigator.connection && navigator.connection.saveData);

    const onChange = (e) => {
      if (!cancelled) setActive(e.matches && !saveData);
    };

    const run = () => {
      if (cancelled) return;
      if (!mql.matches || saveData) return;
      setActive(true);
      if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onChange);
      loadEcosystemGraph({ signal: controller.signal })
        .then(({ graph: g }) => {
          if (!cancelled) setGraph(g);
        })
        .catch(() => {
          /* sin grafo no hay constelacion; el hero no cambia */
        });
    };

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 4000 });
    } else {
      timer = setTimeout(run, 1500);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onChange);
      controller.abort();
    };
  }, []);

  // 2) Dibujar una vez (trazo progresivo acotado o instantaneo) y redibujar
  //    solo si cambia el tamano.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!active || !graph || !canvas) return undefined;
    let raf = null;
    let resizeTimer = null;
    let done = false;

    if (reduced) {
      paint(canvas, graph, 1);
      done = true;
    } else {
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / TRACE_MS);
        paint(canvas, graph, p);
        if (p < 1) {
          raf = requestAnimationFrame(step);
        } else {
          raf = null;
          done = true;
        }
      };
      raf = requestAnimationFrame(step);
    }

    const onResize = () => {
      if (!done) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => paint(canvas, graph, 1), 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [active, graph, reduced]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      data-constellation
      aria-hidden="true"
      className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none"
    />
  );
}
