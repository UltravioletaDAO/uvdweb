#!/usr/bin/env node
/*
 * make-poster.js — genera el póster del observatorio de KarmaKadabra para la facade de /ecosystem.
 *
 * Entrada: captura Playwright del observatorio (1440×900, ver docs/audit-2026-08-26/wave3/design-d4-hacker-terminals.md, anexos).
 * Salida: public/ecosystem/posters/kk-observatory.webp 1280×800, calidad ≈70, ≤ 60 KB.
 * La fecha de captura NO se estampa en la imagen: va en el alt (ecosystem.observatory.poster_alt {{date}}).
 *
 *   node scripts/ecosystem/make-poster.js [ruta/al/png]
 *
 * Requiere `sharp` (devDependency). Solo se corre a mano.
 */


const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DEFAULT_INPUT = 'Z:/ultravioleta/code/web/docs/audit-2026-08-26/wave3/design-d4-kk-observatory-1440.png';
const OUT = path.resolve(__dirname, '..', '..', 'public', 'ecosystem', 'posters', 'kk-observatory.webp');
const WIDTH = 1280;
const HEIGHT = 800;
const MAX_BYTES = 60 * 1024;

async function encode(input, quality) {
  return sharp(input)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .webp({ quality, effort: 6 })
    .toBuffer();
}

async function main() {
  const input = process.argv[2] || DEFAULT_INPUT;
  if (!fs.existsSync(input)) {
    console.error('[make-poster] no existe la captura de entrada:', input);
    process.exit(1);
  }
  let quality = 70;
  let buf = await encode(input, quality);
  while (buf.length > MAX_BYTES && quality > 30) {
    quality -= 5;
    buf = await encode(input, quality);
  }
  if (buf.length > MAX_BYTES) {
    console.error(`[make-poster] no se logró bajar de ${MAX_BYTES} bytes (quedó en ${buf.length} con q=${quality})`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  const meta = await sharp(buf).metadata();
  console.log(`[make-poster] ${path.relative(process.cwd(), OUT)} ${meta.width}x${meta.height} q=${quality} ${buf.length} bytes (${(buf.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error('[make-poster] error:', err && err.message ? err.message : err);
  process.exit(1);
});
