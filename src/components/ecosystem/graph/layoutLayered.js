// Layout por capas (contrato C13): puro, determinista, sin dependencias.
// Filas = capas en LAYER_ORDER (solo las presentes; capas desconocidas al final),
// dentro de cada fila los nodos van por degree desc (desempate por id).
// Lo usan el wallpaper (como semilla del force), el braille y la constelación del Home.
import { LAYER_ORDER } from '../../../services/ecosystem/graph';

/**
 * @param {{nodes:Array<{id:string,layer:string,degree?:number}>}} graph
 * @param {{width:number,height:number,padding?:number}} opts
 * @returns {Map<string,{x:number,y:number}>}
 */
export function layoutLayered(graph, { width, height, padding = 24 }) {
  const positions = new Map();
  const nodes = graph?.nodes || [];
  if (!nodes.length || !(width > 0) || !(height > 0)) return positions;

  const known = new Set(LAYER_ORDER);
  const extra = [...new Set(nodes.map((n) => n.layer).filter((l) => !known.has(l)))].sort();
  const order = [...LAYER_ORDER, ...extra];

  const rows = order
    .map((layer) =>
      nodes
        .filter((n) => n.layer === layer)
        .sort((a, b) => (b.degree || 0) - (a.degree || 0) || a.id.localeCompare(b.id))
    )
    .filter((row) => row.length > 0);

  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);

  rows.forEach((row, i) => {
    const y = padding + ((i + 0.5) * innerH) / rows.length;
    row.forEach((n, j) => {
      const x = padding + ((j + 0.5) * innerW) / row.length;
      positions.set(n.id, { x, y });
    });
  });

  return positions;
}

export default layoutLayered;
