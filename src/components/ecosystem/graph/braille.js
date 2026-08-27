// Rasterizador braille 2×4 (U+2800–U+28FF), sin dependencias. Cada celda de texto son
// 2 columnas × 4 filas de puntos; el bit de cada punto sigue el orden Unicode estándar.
// Se usa para dibujar el grafo medido por c0der dentro de una terminal (GraphTerm).

export const BRAILLE_BASE = 0x2800;

// DOT_BITS[y][x]: bit del punto (x ∈ {0,1}, y ∈ {0..3}) dentro de la celda.
const DOT_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

/**
 * @param {number} cols columnas de texto
 * @param {number} rows filas de texto
 * @returns {{cols:number, rows:number, w:number, h:number, cells:Uint8Array, text:Map<number,string>}}
 */
export function createRaster(cols, rows) {
  return {
    cols,
    rows,
    w: cols * 2,
    h: rows * 4,
    cells: new Uint8Array(cols * rows),
    text: new Map(),
  };
}

export function setDot(r, x, y) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= r.w || py >= r.h) return;
  const col = px >> 1;
  const row = py >> 2;
  r.cells[row * r.cols + col] |= DOT_BITS[py & 3][px & 1];
}

/**
 * Línea de Bresenham en coordenadas de punto. `dashed` salta 1 de cada 3 pasos
 * (es la única forma de "punteado" en braille): se usa para aristas latentes.
 */
export function drawLine(r, x0, y0, x1, y1, { dashed = false } = {}) {
  let ax = Math.round(x0);
  let ay = Math.round(y0);
  const bx = Math.round(x1);
  const by = Math.round(y1);
  const dx = Math.abs(bx - ax);
  const dy = -Math.abs(by - ay);
  const sx = ax < bx ? 1 : -1;
  const sy = ay < by ? 1 : -1;
  let err = dx + dy;
  let step = 0;
  for (;;) {
    if (!dashed || step % 3 !== 2) setDot(r, ax, ay);
    if (ax === bx && ay === by) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      ax += sx;
    }
    if (e2 <= dx) {
      err += dx;
      ay += sy;
    }
    step += 1;
  }
}

/** Marcador de nodo: cruz de (2·size+1) puntos alrededor de (x, y). */
export function drawMarker(r, x, y, size = 1) {
  for (let i = -size; i <= size; i += 1) {
    setDot(r, x + i, y);
    setDot(r, x, y + i);
  }
}

/**
 * Texto ASCII superpuesto (etiquetas). Una celda con texto tapa sus puntos.
 * Devuelve false si no cabe o si ya había texto en alguna celda del rango.
 */
export function putText(r, col, row, str, { force = false } = {}) {
  if (row < 0 || row >= r.rows || col < 0 || col + str.length > r.cols) return false;
  if (!force) {
    for (let i = 0; i < str.length; i += 1) {
      if (r.text.has(row * r.cols + col + i)) return false;
    }
  }
  for (let i = 0; i < str.length; i += 1) {
    r.text.set(row * r.cols + col + i, str[i]);
  }
  return true;
}

/** @returns {string[]} una cadena por fila (celdas vacías = U+2800, espacio braille) */
export function render(r) {
  const out = [];
  for (let row = 0; row < r.rows; row += 1) {
    let line = '';
    for (let col = 0; col < r.cols; col += 1) {
      const idx = row * r.cols + col;
      const ch = r.text.get(idx);
      line += ch !== undefined ? ch : String.fromCharCode(BRAILLE_BASE + r.cells[idx]);
    }
    out.push(line);
  }
  return out;
}

export function isBrailleChar(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0x2800 && code <= 0x28ff;
}

/** Celdas con al menos un punto encendido (excluye el espacio braille U+2800). */
export function countBraille(lines) {
  let n = 0;
  for (const line of lines) {
    for (const ch of line) {
      if (isBrailleChar(ch) && ch.charCodeAt(0) !== BRAILLE_BASE) n += 1;
    }
  }
  return n;
}
