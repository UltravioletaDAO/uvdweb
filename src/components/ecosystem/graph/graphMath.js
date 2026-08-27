// Helpers puros sobre el grafo medido (contrato C1: nodes[{id,layer,degree,…}],
// edges[{source,target,type,protocol,evidence_count,planned}]). Las fórmulas de radio/grosor
// replican render/html_view.py de c0der para que el sitio dibuje lo mismo que su vista estática.

/** Radio de un nodo en px: 6 + degree/2 (degree = aristas reales que lo tocan). */
export function nodeRadius(node) {
  const degree = Number.isFinite(node?.degree) ? node.degree : 0;
  return 6 + degree / 2;
}

/** Grosor de una arista: min(3, 0.6 + evidence_count/6) — misma fórmula que c0der (html_view.py). */
export function edgeWidth(edge) {
  const n = Number.isFinite(edge?.evidence_count) ? edge.evidence_count : 0;
  return Math.min(3, 0.6 + n / 6);
}

/** Latente = declarada pero sin código consumidor medido; se dibuja punteada. */
export function isLatent(edge) {
  return Boolean(edge && (edge.type === 'latent' || edge.planned));
}

/** Nodos por degree desc, desempate por id (estable y determinista). */
export function sortByDegree(nodes) {
  return [...(nodes || [])].sort(
    (a, b) => (b.degree || 0) - (a.degree || 0) || a.id.localeCompare(b.id)
  );
}

/** @returns {Map<string,{in:object[],out:object[]}>} adyacencia por id; aristas huérfanas se ignoran. */
export function buildAdjacency(graph) {
  const adj = new Map();
  for (const n of graph?.nodes || []) adj.set(n.id, { in: [], out: [] });
  for (const e of graph?.edges || []) {
    const s = adj.get(e.source);
    const t = adj.get(e.target);
    if (!s || !t) continue;
    s.out.push(e);
    t.in.push(e);
  }
  return adj;
}

/** Ids adyacentes (entrantes + salientes) a `id`. */
export function neighborsOf(adj, id) {
  const set = new Set();
  const a = adj.get(id);
  if (!a) return set;
  for (const e of a.out) set.add(e.target);
  for (const e of a.in) set.add(e.source);
  return set;
}

export function touches(edge, id) {
  return Boolean(id) && (edge.source === id || edge.target === id);
}

/**
 * Hit-test: el nodo más cercano a (x, y) dentro de su radio + `slack` px.
 * @param {Map<string,{x:number,y:number}>} positions
 */
export function hitTestNode(positions, nodes, x, y, slack = 4) {
  let best = null;
  let bestD = Infinity;
  for (const n of nodes || []) {
    const p = positions.get(n.id);
    if (!p) continue;
    const d = Math.hypot(p.x - x, p.y - y);
    const r = nodeRadius(n) + slack;
    if (d <= r && d < bestD) {
      best = n;
      bestD = d;
    }
  }
  return best;
}

/** Punto sobre el segmento a→b a `offset` px antes de b (la flecha no entra al círculo). */
export function shortenToward(a, b, offset) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: b.x - (dx / len) * offset,
    y: b.y - (dy / len) * offset,
    angle: Math.atan2(dy, dx),
  };
}

export function clampDpr(dpr) {
  const v = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return Math.min(2, v);
}
