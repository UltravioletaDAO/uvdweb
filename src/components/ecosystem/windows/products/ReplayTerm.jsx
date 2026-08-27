// ReplayTerm — ventana `replay`: reproduce una sesión REAL grabada por scripts/ecosystem/record-replays.js
// ({ recorded_at, key, cmd, url, status, stdout[], json? | text? | headers? }). Nunca inventa salida:
// si el replay no existe, lo dice ("sin dato").
// También exporta los helpers de lectura de replays que usan las demás ventanas de producto.
// Los archivos los produce eco-core en src/data/ecosystem/replays/; aquí se leen por un mapa
// CERRADO de claves vía require.context (si un archivo aún no existe, simplemente no está en keys()
// y la UI cae a "sin dato" sin romper el build).
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';

// Mapa cerrado: solo estas claves se pueden pedir desde params.key o desde otras ventanas.
export const REPLAY_KEYS = [
  'kk_fuel',
  'em_headers',
  'describe_headers',
  'meshrelay_skill_head',
  'kk_mcp_kk_get_kpis',
  'kk_mcp_kk_recent_trades',
  'kk_mcp_kk_market_snapshot',
  'meshrelay_em_tasks',
  'bridge_em_queue',
  'describe_index_md',
  'describe_llms'
];

// El regex del contexto es estático (webpack lo resuelve en build): solo entran los archivos de
// REPLAY_KEYS que existan en ese momento.
const context = require.context(
  '../../../../data/ecosystem/replays',
  false,
  /^\.\/(kk_fuel|em_headers|describe_headers|meshrelay_skill_head|kk_mcp_kk_get_kpis|kk_mcp_kk_recent_trades|kk_mcp_kk_market_snapshot|meshrelay_em_tasks|bridge_em_queue|describe_index_md|describe_llms)\.json$/
);

// Enlace de salida honesto por replay (los que muestran X-Frame-Options: DENY no se embeben).
export const REPLAY_LINKS = {
  em_headers: { href: 'https://execution.market', noteKey: 'ecosystem.em.no_iframe', openKey: 'ecosystem.em.open' },
  describe_headers: { href: 'https://describe.net', noteKey: 'ecosystem.describe.no_iframe', openKey: 'ecosystem.describe.open' },
  meshrelay_skill_head: { href: 'https://meshrelay.xyz/skill.md', noteKey: null, openKey: 'ecosystem.window.open_external' },
  kk_fuel: { href: 'https://karmakadabra.ultravioletadao.xyz', noteKey: null, openKey: 'ecosystem.window.open_external' }
};

const cache = new Map();

function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw.default && typeof raw.default === 'object' ? raw.default : raw;
  let stdout = data.stdout;
  if (typeof stdout === 'string') stdout = stdout.split(/\r?\n/);
  if (!Array.isArray(stdout)) stdout = [];
  return {
    recorded_at: typeof data.recorded_at === 'string' ? data.recorded_at : null,
    key: typeof data.key === 'string' ? data.key : null,
    cmd: typeof data.cmd === 'string' ? data.cmd : '',
    url: typeof data.url === 'string' ? data.url : null,
    status: Number.isFinite(data.status) ? data.status : null,
    stdout: stdout.map((l) => String(l)),
    json: data.json !== undefined ? data.json : null,
    text: typeof data.text === 'string' ? data.text : null,
    headers: data.headers && typeof data.headers === 'object' ? data.headers : null
  };
}

/** Lee un replay grabado. Devuelve { recorded_at, cmd, url, stdout[], json, text, headers } o null si no existe. */
export function loadReplay(key) {
  if (!REPLAY_KEYS.includes(key)) return null;
  if (cache.has(key)) return cache.get(key);
  let value = null;
  const id = `./${key}.json`;
  try {
    if (context.keys().includes(id)) value = normalize(context(id));
  } catch (e) {
    value = null;
  }
  cache.set(key, value);
  return value;
}

/** Cuerpo JSON del replay (campo `json` grabado, o stdout parseado), o null. */
export function replayJson(key) {
  const r = loadReplay(key);
  if (!r) return null;
  if (r.json !== null && r.json !== undefined) return r.json;
  try {
    return JSON.parse(r.stdout.join('\n'));
  } catch (e) {
    return null;
  }
}

/** Texto plano del replay (campo `text`, o stdout unido), o null. */
export function replayText(key) {
  const r = loadReplay(key);
  if (!r) return null;
  return r.text !== null ? r.text : r.stdout.join('\n');
}

/** YYYY-MM-DD de un ISO, o null. */
export function isoDay(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

/** Fecha (día) en que se grabó el replay, o null. */
export function replayDate(key) {
  const r = loadReplay(key);
  return r ? isoDay(r.recorded_at) : null;
}

const MAX_OUT = 200;

/**
 * Líneas de Terminal para un replay: prompt (cmd) + stdout. `notes` se imprimen como `note`
 * justo después del prompt (resúmenes derivados del propio replay, nunca inventados).
 */
export function replayLines(replay, { notes = [], maxOut = MAX_OUT } = {}) {
  if (!replay) return [];
  const out = [{ id: 'cmd', kind: 'prompt', text: replay.cmd }];
  notes.filter(Boolean).forEach((text, i) => out.push({ id: `n${i}`, kind: 'note', text }));
  replay.stdout.slice(0, maxOut).forEach((text, i) => out.push({ id: `o${i}`, kind: 'out', text }));
  if (replay.stdout.length > maxOut) {
    out.push({ id: 'more', kind: 'note', text: `… (+${replay.stdout.length - maxOut})` });
  }
  return out;
}

/** Título estándar de replay: `replay · grabado <fecha>` (clave ecosystem.window.recorded_at). */
export function replayTitle(t, replay) {
  const date = replay ? isoDay(replay.recorded_at) : null;
  return t('ecosystem.window.recorded_at', { defaultValue: 'replay · grabado {{date}}', date: date || t('ecosystem.status.unavailable', 'sin dato') });
}

export function ReplayLink({ link, t }) {
  if (!link) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs">
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ultraviolet-light underline-offset-2 hover:underline focus:outline focus:outline-2 focus:outline-purple-300"
      >
        {t(link.openKey, 'Abrir en pestaña nueva ↗')}
      </a>
    </div>
  );
}

export default function ReplayTerm({ windowId, params = {} }) {
  const { t } = useTranslation();
  const key = typeof params.key === 'string' ? params.key : null;
  const replay = key ? loadReplay(key) : null;
  const link = key ? REPLAY_LINKS[key] : null;
  const title = replayTitle(t, replay);

  const lines = useMemo(() => {
    if (!replay) {
      return [{ id: 'missing', kind: 'err', text: `${t('ecosystem.status.unavailable', 'sin dato')} · replay ${key || '?'}` }];
    }
    const out = replayLines(replay);
    if (link && link.noteKey) {
      out.push({ id: 'note', kind: 'note', text: t(link.noteKey, 'X-Frame-Options: DENY → se enlaza, no se embebe') });
    }
    return out;
  }, [replay, key, link, t]);

  return (
    <TermWindow
      windowId={windowId}
      title={title}
      sourceChip={{
        status: replay ? 'snapshot' : 'unavailable',
        fetchedAt: replay ? replay.recorded_at : null,
        label: replay && replay.url ? replay.url : t('ecosystem.windows.replay.source', 'sesión real grabada con curl · comandos y salida verdaderos')
      }}
    >
      <Terminal lines={lines} typewriter ariaLive="off" maxLines={MAX_OUT + 8} />
      <ReplayLink link={link} t={t} />
    </TermWindow>
  );
}
