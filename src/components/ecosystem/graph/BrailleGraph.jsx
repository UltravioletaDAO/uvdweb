// BrailleGraph — el grafo medido por c0der dibujado con puntos braille (U+2800–U+28FF) dentro
// de una terminal. 80×24 celdas en escritorio, 40×20 en móvil (lo decide GraphTerm).
// Layout: layoutLayered sobre la rejilla de puntos (cols×2 × rows×4); aristas con Bresenham
// (latentes "punteadas" saltando 1 de cada 3 puntos), nodos como cruces, etiquetas ASCII con el id.
// Sin dependencias: braille.js + layoutLayered. El render es puro y memoizado.
import React, { useMemo } from 'react';
import { createRaster, drawLine, drawMarker, putText, render } from './braille';
import { layoutLayered } from './layoutLayered';
import { isLatent, sortByDegree } from './graphMath';

export const BRAILLE_DESKTOP = { cols: 80, rows: 24 };
export const BRAILLE_MOBILE = { cols: 40, rows: 20 };

const labelFor = (node, maxLen, selected) => {
  const raw = String(node.id || '');
  const text = raw.length > maxLen ? raw.slice(0, Math.max(1, maxLen - 1)) + '~' : raw;
  return selected ? `[${text}]` : text;
};

/**
 * @param {{nodes:Array, edges:Array}} graph
 * @param {{cols?:number, rows?:number, selectedId?:string|null}} opts
 * @returns {string[]} una línea por fila
 */
export function renderBrailleGraph(graph, { cols = 80, rows = 24, selectedId = null } = {}) {
  const r = createRaster(cols, rows);
  if (!graph || !graph.nodes || !graph.nodes.length) return render(r);

  const positions = layoutLayered(graph, { width: r.w, height: r.h, padding: 4 });

  for (const e of graph.edges || []) {
    const a = positions.get(e.source);
    const b = positions.get(e.target);
    if (!a || !b) continue;
    drawLine(r, a.x, a.y, b.x, b.y, { dashed: isLatent(e) });
  }

  const maxLabel = cols >= 80 ? 14 : 7;
  // Los nodos con más grado se etiquetan primero (tienen prioridad por el espacio).
  for (const n of sortByDegree(graph.nodes)) {
    const p = positions.get(n.id);
    if (!p) continue;
    const selected = selectedId === n.id;
    drawMarker(r, p.x, p.y, selected ? 2 : 1);
    const label = labelFor(n, maxLabel, selected);
    const col = Math.floor(p.x / 2);
    const row = Math.floor(p.y / 4);
    const right = col + 2;
    const left = col - 1 - label.length;
    // derecha → izquierda → fila siguiente a la derecha; si nada cabe, el nodo queda sin etiqueta.
    if (!putText(r, right, row, label)) {
      if (!putText(r, left, row, label)) {
        putText(r, right, row + 1, label);
      }
    }
  }
  return render(r);
}

export default function BrailleGraph({ graph, cols = 80, rows = 24, selectedId = null, className = '' }) {
  const lines = useMemo(() => renderBrailleGraph(graph, { cols, rows, selectedId }), [graph, cols, rows, selectedId]);
  return (
    <pre
      data-braille=""
      data-cols={cols}
      data-rows={rows}
      aria-hidden="true"
      className={`m-0 overflow-hidden whitespace-pre font-mono text-[11px] leading-[1.05] text-ultraviolet-light/90 ${className}`}
      style={{ fontVariantLigatures: 'none' }}
    >
      {lines.join('\n')}
    </pre>
  );
}
