#!/usr/bin/env node
/*
 * pin-snippets.js — congela en build los snippets de código público que muestra /ecosystem.
 *
 * Tabla fija de { id, repo, path, sha, start, end, lang }. Para cada uno descarga
 * https://raw.githubusercontent.com/<org>/<repo>/<sha>/<path>, recorta el rango de líneas,
 * calcula el sha256 del rango y escribe src/data/ecosystem/snippets.json.
 * El runtime NO toca raw.githubusercontent.com: solo enlaza al blob de GitHub.
 *
 *   node scripts/ecosystem/pin-snippets.js            # regenera el JSON
 *   node scripts/ecosystem/pin-snippets.js --verify   # exit 1 si algún sha256 cambió o un fetch no es 200
 *
 * Node 20, sin dependencias. Sha de uvdweb = `git rev-parse --short=12 origin/develop` al momento de pinear.
 */


const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ORG = 'UltravioletaDAO';
const OUT = path.resolve(__dirname, '..', '..', 'src', 'data', 'ecosystem', 'snippets.json');

const TABLE = [
  { id: 'x402-rs-main', repo: 'x402-rs', path: 'src/main.rs', sha: 'a48c6fd7a295', start: 1, end: 22, lang: 'rust' },
  { id: 'x402-rs-readme', repo: 'x402-rs', path: 'README.md', sha: 'a48c6fd7a295', start: 5, end: 9, lang: 'text' },
  { id: 'sdk-ts-index', repo: 'uvd-x402-sdk-typescript', path: 'src/index.ts', sha: 'e5805a2d864f', start: 1, end: 33, lang: 'typescript' },
  { id: 'sdk-py-client', repo: 'uvd-x402-sdk-python', path: 'src/uvd_x402_sdk/client.py', sha: '745ae51bd69d', start: 144, end: 162, lang: 'python' },
  // origin/develop del sitio al pinear (2026-08-27): 386ee63f81cc
  { id: 'uvdweb-tools', repo: 'uvdweb', path: 'src/agent/tools.js', sha: '386ee63f81cc', start: 1, end: 5, lang: 'javascript' }
];

const SECRET_RE = /0x[0-9a-fA-F]{64}/;

const rawUrl = (s) => `https://raw.githubusercontent.com/${ORG}/${s.repo}/${s.sha}/${s.path}`;
const blobUrl = (s) => `https://github.com/${ORG}/${s.repo}/blob/${s.sha}/${s.path}#L${s.start}-L${s.end}`;
const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

async function fetchRange(entry) {
  const url = rawUrl(entry);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal, headers: { Accept: 'text/plain' } });
  } finally {
    clearTimeout(timer);
  }
  if (res.status !== 200) throw new Error(`${entry.id}: HTTP ${res.status} en ${url}`);
  const body = await res.text();
  const lines = body.split(/\r?\n/);
  if (lines.length < entry.end) throw new Error(`${entry.id}: el archivo tiene ${lines.length} líneas, el rango pide hasta ${entry.end}`);
  const text = lines.slice(entry.start - 1, entry.end).join('\n');
  if (SECRET_RE.test(text)) throw new Error(`${entry.id}: el rango contiene un hash de 64 hex; no se pinea`);
  return text;
}

async function main() {
  const verify = process.argv.includes('--verify');
  const results = [];
  const failures = [];

  for (const entry of TABLE) {
    try {
      const text = await fetchRange(entry);
      results.push({ ...entry, sha256: sha256(text), text, blob_url: blobUrl(entry) });
    } catch (err) {
      failures.push(err.message);
    }
  }

  if (failures.length) {
    failures.forEach((m) => console.error('[pin-snippets] FALLO:', m));
    process.exit(1);
  }

  if (verify) {
    let previous;
    try {
      previous = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    } catch (err) {
      console.error('[pin-snippets] --verify: no se pudo leer', OUT, err.message);
      process.exit(1);
    }
    const prevById = new Map((previous.snippets || []).map((s) => [s.id, s]));
    let changed = 0;
    for (const s of results) {
      const p = prevById.get(s.id);
      if (!p) {
        console.error(`[pin-snippets] --verify: ${s.id} no existe en el JSON`);
        changed += 1;
        continue;
      }
      if (p.sha256 !== s.sha256) {
        console.error(`[pin-snippets] --verify: sha256 distinto en ${s.id} (${p.sha256.slice(0, 12)} -> ${s.sha256.slice(0, 12)})`);
        changed += 1;
      }
    }
    if (prevById.size !== results.length) {
      console.error('[pin-snippets] --verify: la tabla y el JSON tienen distinto tamaño');
      changed += 1;
    }
    if (changed) process.exit(1);
    console.log(`[pin-snippets] --verify OK: ${results.length} snippets, sha256 intactos (generated_at ${previous.generated_at})`);
    return;
  }

  const out = { generated_at: new Date().toISOString(), snippets: results };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`[pin-snippets] escrito ${path.relative(process.cwd(), OUT)} con ${results.length} snippets`);
  results.forEach((s) => console.log(`  ${s.id.padEnd(16)} ${s.repo}/${s.path}:${s.start}-${s.end} @ ${s.sha.slice(0, 7)} sha256=${s.sha256.slice(0, 12)}`));
}

main().catch((err) => {
  console.error('[pin-snippets] error inesperado:', err && err.message ? err.message : err);
  process.exit(1);
});
