#!/usr/bin/env node
/**
 * i18n-audit — auditoría de claves de traducción del sitio (ECOSYSTEM_PLAN §4/WP6, contrato C15).
 *
 *   node scripts/ecosystem/i18n-audit.js
 *
 * Sin dependencias (Node 20). Exit 0 = OK, exit 1 = hay errores.
 *
 *  (a) Paridad de claves hoja entre src/i18n/{es,en,pt,fr}.json: falla si difieren y lista las
 *      faltantes por idioma.
 *  (b) Recorre src/ buscando claves literales de los namespaces nuevos —
 *      t('ecosystem.…') / t("ecosystem.…") (también multilínea), 'landing.…', 'home.teaser.…' y
 *      propiedades *Key: 'ecosystem.…' (titleKey/sourceKey/noteKey/openKey de las ventanas) —
 *      y falla si alguna no existe en es.json (una clave plural vale si existen _one/_other).
 *      Un literal de esos namespaces fuera de t()/…Key se reporta como aviso (no falla).
 *  (c) Imprime el conteo de hojas por idioma.
 *
 *  Extras (fallan también): placeholders {{var}} distintos entre idiomas para la misma clave, y
 *  texto prohibido en los namespaces nuevos ('26 agentes', 'lorem', 'TODO').
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const I18N_DIR = path.join(ROOT, 'src', 'i18n');
const SRC_DIR = path.join(ROOT, 'src');
const LANGS = ['es', 'en', 'pt', 'fr'];
const SCOPED = /^(ecosystem|landing|home\.teaser)\./;
const KEY = '(?:ecosystem|landing|home\\.teaser)\\.[A-Za-z0-9_][A-Za-z0-9_.-]*';
const RE_T_CALL = new RegExp(`\\bt\\(\\s*['"](${KEY})['"]`, 'g');
const RE_KEY_PROP = new RegExp(`\\b[A-Za-z]*[kK]ey\\s*:\\s*['"](${KEY})['"]`, 'g');
const RE_LITERAL = new RegExp(`['"\`](${KEY})['"\`]`, 'g');
const RE_PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
const FORBIDDEN = [/26 agentes/i, /lorem/i, /\bTODO\b/];

const errors = [];
const warnings = [];

function leaves(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) leaves(v, key, out);
    else out.push(key);
  }
  return out;
}

function get(obj, dotted) {
  return dotted.split('.').reduce((acc, k) => (acc && typeof acc === 'object' ? acc[k] : undefined), obj);
}

function keyResolves(es, key) {
  // Prefijo dinámico — t('ecosystem.x.' + id): vale si el prefijo es un objeto con hijos.
  if (key.endsWith('.')) {
    const o = get(es, key.slice(0, -1));
    return Boolean(o && typeof o === 'object' && Object.keys(o).length);
  }
  const v = get(es, key);
  if (typeof v === 'string' || (v && typeof v === 'object')) return true;
  return typeof get(es, `${key}_one`) === 'string' && typeof get(es, `${key}_other`) === 'string';
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || full === I18N_DIR) continue;
      walk(full, out);
    } else if (/\.(jsx?|tsx?|mjs|cjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function placeholders(value) {
  const set = new Set();
  if (typeof value !== 'string') return set;
  for (const m of value.matchAll(RE_PLACEHOLDER)) set.add(m[1]);
  return set;
}

// --- carga ---------------------------------------------------------------
const data = {};
for (const lang of LANGS) {
  const file = path.join(I18N_DIR, `${lang}.json`);
  try {
    data[lang] = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    errors.push(`${lang}.json no es JSON válido: ${err.message}`);
  }
}
if (errors.length) {
  errors.forEach((e) => console.error(`ERROR ${e}`));
  process.exit(1);
}

// --- (a) paridad ---------------------------------------------------------
const leafSets = {};
for (const lang of LANGS) leafSets[lang] = new Set(leaves(data[lang]));
const union = new Set(LANGS.flatMap((l) => [...leafSets[l]]));
for (const lang of LANGS) {
  const missing = [...union].filter((k) => !leafSets[lang].has(k)).sort();
  if (missing.length) {
    errors.push(`${lang}.json: faltan ${missing.length} claves presentes en otro idioma:\n    ${missing.join('\n    ')}`);
  }
}

// --- extras: placeholders y texto prohibido en los namespaces nuevos ------
for (const key of [...union].filter((k) => SCOPED.test(k)).sort()) {
  const ref = placeholders(get(data.es, key));
  for (const lang of LANGS) {
    const val = get(data[lang], key);
    if (typeof val !== 'string') continue;
    const ph = placeholders(val);
    const diff = [...ref].filter((p) => !ph.has(p)).concat([...ph].filter((p) => !ref.has(p)));
    if (diff.length) errors.push(`${lang}.json ${key}: placeholders distintos de es ({{${diff.join('}}, {{')}}})`);
    for (const re of FORBIDDEN) {
      if (re.test(val)) errors.push(`${lang}.json ${key}: texto prohibido (${re}) → ${JSON.stringify(val)}`);
    }
  }
}

// --- (b) claves usadas en src/ -------------------------------------------
const files = walk(SRC_DIR);
const used = new Map(); // key -> [file:line]
const bare = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const lineOf = (idx) => text.slice(0, idx).split('\n').length;
  const strong = new Set();
  for (const re of [RE_T_CALL, RE_KEY_PROP]) {
    for (const m of text.matchAll(re)) {
      strong.add(m[1]);
      if (!used.has(m[1])) used.set(m[1], []);
      used.get(m[1]).push(`${rel}:${lineOf(m.index)}`);
    }
  }
  for (const m of text.matchAll(RE_LITERAL)) {
    if (strong.has(m[1])) continue;
    if (!bare.has(m[1])) bare.set(m[1], []);
    bare.get(m[1]).push(`${rel}:${lineOf(m.index)}`);
  }
}
for (const [key, where] of [...used.entries()].sort()) {
  if (!keyResolves(data.es, key)) errors.push(`clave usada en código y ausente en es.json: ${key}  (${where.join(', ')})`);
}
for (const [key, where] of [...bare.entries()].sort()) {
  if (!keyResolves(data.es, key)) warnings.push(`literal fuera de t()/…Key sin clave en es.json: ${key}  (${where.join(', ')})`);
}

// --- salida --------------------------------------------------------------
console.log('i18n-audit');
for (const lang of LANGS) {
  const scoped = [...leafSets[lang]].filter((k) => SCOPED.test(k)).length;
  console.log(`  ${lang}.json: ${leafSets[lang].size} hojas (${scoped} en ecosystem/landing/home.teaser)`);
}
console.log(`  src/: ${files.length} archivos, ${used.size} claves de los namespaces nuevos usadas vía t()/…Key`);
warnings.forEach((w) => console.warn(`WARN  ${w}`));
errors.forEach((e) => console.error(`ERROR ${e}`));
if (errors.length) {
  console.error(`\n${errors.length} error(es).`);
  process.exit(1);
}
console.log('OK');
