#!/usr/bin/env node
// Frescura del snapshot del mapa del ecosistema (contrato de datos, ola 3).
// Uso: node scripts/ecosystem/check-snapshot.js [ruta/al/graph.json]
// Exit 1 si el archivo falta, no parsea, schema_version !== 1 o generated_at tiene más de 60 días.
// Imprime scan_timestamp para que quede en el log del build (prebuild lo encadena).
const fs = require('fs');
const path = require('path');

const MAX_AGE_DAYS = 60;
const DEFAULT_FILE = path.join(__dirname, '..', '..', 'public', 'ecosystem', 'graph.json');

const fail = (msg) => {
  console.error(`[ecosystem] snapshot inválido: ${msg}`);
  process.exit(1);
};

const file = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_FILE;
if (!fs.existsSync(file)) fail(`no existe ${file}`);

let graph;
try {
  graph = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (err) {
  fail(`JSON inválido (${err.message})`);
}

if (graph.schema_version !== 1) fail(`schema_version=${JSON.stringify(graph.schema_version)} (se espera 1)`);

const generated = Date.parse(graph.generated_at);
if (!Number.isFinite(generated)) fail(`generated_at inválido: ${JSON.stringify(graph.generated_at)}`);

const ageDays = (Date.now() - generated) / 86400000;
if (ageDays > MAX_AGE_DAYS) fail(`generated_at ${graph.generated_at} tiene ${ageDays.toFixed(1)} días (máx ${MAX_AGE_DAYS})`);

// Copia importable para el bundle (initialData del hook): mismo contenido, cero drift
// porque este script corre en prebuild. Solo escribe si cambió (build cache friendly).
const bundleCopy = path.join(__dirname, '..', '..', 'src', 'data', 'ecosystem', 'graph.snapshot.json');
const raw = fs.readFileSync(file, 'utf8');
if (!fs.existsSync(bundleCopy) || fs.readFileSync(bundleCopy, 'utf8') !== raw) {
  fs.writeFileSync(bundleCopy, raw);
  console.log(`[ecosystem] snapshot sincronizado -> ${path.relative(process.cwd(), bundleCopy)}`);
}

const scan = graph.source && graph.source.scan_timestamp ? graph.source.scan_timestamp : graph.generated_at;
console.log(
  `[ecosystem] snapshot OK · scan_timestamp=${scan} · generated_at=${graph.generated_at} (${ageDays.toFixed(1)} días)` +
  ` · nodes=${Array.isArray(graph.nodes) ? graph.nodes.length : '?'} · edges=${Array.isArray(graph.edges) ? graph.edges.length : '?'}`
);
