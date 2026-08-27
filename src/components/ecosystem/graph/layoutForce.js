// Layout dirigido por fuerzas (contrato C13) con d3-force. Semilla = layoutLayered para que el
// resultado sea reproducible y las capas queden ordenadas de arriba (swarm) hacia abajo.
// Corre síncrono (simulation.stop() + tick()) dentro de un useMemo; el llamador mide el tiempo.
import { forceSimulation, forceLink, forceCenter, forceY } from 'd3-force';
import { layoutLayered } from './layoutLayered';

// Repulsión n-cuerpos EXACTA (misma fórmula que forceManyBody con theta=0, distanceMin=1):
// con 18 nodos son 153 pares por tick, así que el quadtree de Barnes-Hut no aporta nada y su
// código extra es lo que dominaba el costo en frío (JIT) de la primera llamada (>10 ms).
function forceRepulse(strength = -120) {
  let nodes = [];
  const force = (alpha) => {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let l = dx * dx + dy * dy;
        if (l < 1) l = Math.sqrt(l);
        if (l === 0) continue;
        const w = (strength * alpha) / l;
        a.vx += dx * w;
        a.vy += dy * w;
        b.vx -= dx * w;
        b.vy -= dy * w;
      }
    }
  };
  force.initialize = (n) => {
    nodes = n;
  };
  return force;
}

// Separación mínima entre centros (las etiquetas mono de ~80 px no deben pisarse): empuja los pares
// más cercanos que `minDist`. Equivale a un forceCollide de radio minDist/2 sin quadtree.
function forceSpacing(minDist = 76) {
  let nodes = [];
  const min2 = minDist * minDist;
  const force = (alpha) => {
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = b.x - a.x || 0.5;
        const dy = b.y - a.y || 0.5;
        const l2 = dx * dx + dy * dy;
        if (l2 >= min2) continue;
        const l = Math.sqrt(l2);
        const push = ((minDist - l) / l) * 0.5 * alpha;
        a.vx -= dx * push;
        a.vy -= dy * push;
        b.vx += dx * push;
        b.vy += dy * push;
      }
    }
  };
  force.initialize = (n) => {
    nodes = n;
  };
  return force;
}

// LCG determinista: d3-force solo usa el random para separar nodos coincidentes, pero con
// una fuente fija dos renders del mismo grafo dan exactamente el mismo dibujo.
function seededRandom(seed = 0x2545f491) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * @param {{nodes:Array, edges:Array}} graph
 * @param {{width:number,height:number,iterations?:number,padding?:number}} opts
 * @returns {Map<string,{x:number,y:number}>}
 */
export function layoutForce(graph, { width, height, iterations = 300, padding = 24 }) {
  const seed = layoutLayered(graph, { width, height, padding });
  const linked = new Set();
  for (const e of graph?.edges || []) {
    if (e.source !== e.target) {
      linked.add(e.source);
      linked.add(e.target);
    }
  }
  const nodes = (graph?.nodes || []).map((n) => {
    const p = seed.get(n.id) || { x: width / 2, y: height / 2 };
    const node = { id: n.id, x: p.x, y: p.y, seedY: p.y };
    // Un nodo sin aristas (p.ej. c0der, que mide pero no llama) no tiene con quién negociar posición:
    // la repulsión lo expulsaría a una esquina. Se fija en su fila de capa (posición determinista).
    if (!linked.has(n.id)) {
      node.fx = p.x;
      node.fy = p.y;
    }
    return node;
  });
  if (!nodes.length) return new Map();

  const ids = new Set(nodes.map((n) => n.id));
  const links = (graph?.edges || [])
    .filter((e) => ids.has(e.source) && ids.has(e.target) && e.source !== e.target)
    .map((e) => ({ source: e.source, target: e.target, evidence_count: e.evidence_count || 0 }));

  const steps = Math.max(1, Math.floor(iterations));
  const sim = forceSimulation(nodes)
    .randomSource(seededRandom())
    .force(
      'link',
      forceLink(links)
        .id((d) => d.id)
        // distancia ∝ 1/evidence_count: pares con más evidencia quedan más cerca
        .distance((l) => 48 + 160 / Math.max(1, l.evidence_count))
    )
    .force('charge', forceRepulse(-120))
    .force('spacing', forceSpacing(76))
    .force('center', forceCenter(width / 2, height / 2))
    // tirón suave hacia la fila de su capa: conserva la lectura swarm → … → external
    .force('layer', forceY((d) => d.seedY).strength(0.12))
    // enfriar por completo en `steps` ticks (el default de d3 asume 300)
    .alphaDecay(1 - Math.pow(0.001, 1 / steps))
    .stop();

  for (let i = 0; i < steps; i += 1) sim.tick();

  // Ajuste a los límites: la simulación converge en un cúmulo compacto alrededor del centro; se
  // reescala (x e y por separado) para ocupar el área útil, sin cambiar la forma ni el orden.
  const minX = padding;
  const maxX = Math.max(padding, width - padding);
  const minY = padding;
  const maxY = Math.max(padding, height - padding);
  let bx0 = Infinity;
  let bx1 = -Infinity;
  let by0 = Infinity;
  let by1 = -Infinity;
  // Los nodos fijados (aislados) no entran en el cálculo de límites: ya están en su fila de capa.
  for (const n of nodes) {
    if (n.fx !== undefined) continue;
    bx0 = Math.min(bx0, n.x);
    bx1 = Math.max(bx1, n.x);
    by0 = Math.min(by0, n.y);
    by1 = Math.max(by1, n.y);
  }
  const spanX = bx1 - bx0;
  const spanY = by1 - by0;
  const sx = spanX > 1 ? (maxX - minX) / spanX : 1;
  const sy = spanY > 1 ? (maxY - minY) / spanY : 1;
  const out = new Map();
  for (const n of nodes) {
    let x = n.x;
    let y = n.y;
    if (n.fx === undefined) {
      x = spanX > 1 ? minX + (n.x - bx0) * sx : width / 2;
      y = spanY > 1 ? minY + (n.y - by0) * sy : height / 2;
    }
    out.set(n.id, {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    });
  }
  return out;
}

export default layoutForce;
