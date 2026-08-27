// PulseTerm — ventana `pulse` (pulse@uvd): cuatro comandos REALES contra la allowlist de ENDPOINTS
// (facilitator /health y /supported, api.meshrelay.xyz/irc/stats, búsqueda /stats) con la escalera
// de useLiveMetric (en vivo → último dato → snapshot grabado → sin dato). Cada bloque = prompt
// `curl -s <url>` + salida + SourceChip. Un resumen de una línea lleva aria-live="polite".
// Escucha EV.PULSE (la tool get_ecosystem_pulse) para refrescar sin un segundo fetch.
//
// También exporta las primitivas que comparten las demás ventanas "curl + salida" de este paquete
// (MillyTerm, MeshStatsTerm, MeshChannelsTerm, MeshCertsTerm, FacHealthTerm, FacSupportedTerm):
// useEndpointMetric, EndpointView, EndpointBlock, EndpointTerm, jsonLines, curlLine.
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import SourceChip from '../../desk/SourceChip';
import useLiveMetric from '../../../../hooks/useLiveMetric';
import { ENDPOINTS, loadSnapshot } from '../../../../services/ecosystem/endpoints';
import replayIndex from '../../../../data/ecosystem/replays/index.json';
import { EV, on } from '../../../../services/ecosystem/bus';
import { LIVE_META } from './index';

export const meta = LIVE_META.pulse;

// ---------------------------------------------------------------------------------------------
// Primitivas compartidas
// ---------------------------------------------------------------------------------------------

export const curlLine = (url, jq = false) => (jq ? `curl -s ${url} | jq .` : `curl -s ${url}`);

const isHttpUrl = (url) => typeof url === 'string' && /^https?:\/\//.test(url);

/** JSON indentado como líneas de terminal, recortado a `max` líneas (con nota de cuántas faltan). */
export function jsonLines(value, max = 40) {
  let text;
  try {
    text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  } catch (e) {
    text = String(value);
  }
  if (typeof text !== 'string') text = String(text);
  const lines = text.split('\n');
  if (lines.length <= max) return lines;
  return [...lines.slice(0, max), `… (+${lines.length - max})`];
}

// Snapshots: el índice compacto de replays (src/data/ecosystem/replays/index.json, ya en el chunk
// de la página vía endpoints.js) trae el cuerpo JSON de las respuestas pequeñas; los cuerpos
// pesados (p.ej. /supported) se cargan bajo demanda con loadSnapshot(key) SOLO si el fetch en vivo
// falló. Así cada ventana aplica su propio select al mismo replay grabado por curl.
const replayEntries = (replayIndex && replayIndex.entries) || {};

const safeSelect = (select, json) => {
  if (json === undefined || json === null) return null;
  if (typeof select !== 'function') return json;
  try {
    const v = select(json);
    return v === undefined || v === null || Number.isNaN(v) ? null : v;
  } catch (e) {
    return null;
  }
};

/**
 * useLiveMetric sobre una clave de ENDPOINTS. `select` DEBE ser una constante de módulo (identidad
 * estable): el snapshot se memoiza por [key, select] para no re-disparar el efecto del hook.
 * @returns {{ value, status, fetchedAt, refetch, url:string|null, available:boolean }}
 */
export function useEndpointMetric(key, { select, pollMs, enabled = true } = {}) {
  const def = ENDPOINTS[key] || {};
  const url = isHttpUrl(def.url) ? def.url : null;
  const available = Boolean(url);
  const entry = replayEntries[def.snapshotKey || key] || null;
  const entryJson = entry ? entry.json : undefined;
  const snapshotDate = entry ? entry.recorded_at : def.snapshotDate || null;

  // Cuerpo pequeño: viene en el índice → snapshot síncrono (primer render nunca vacío).
  const snapshot = useMemo(() => (entryJson !== undefined ? safeSelect(select, entryJson) : null), [select, entryJson]);

  const metric = useLiveMetric({
    url: url || undefined,
    cacheKey: `eco:${key}`,
    select,
    snapshot,
    snapshotDate,
    pollMs: pollMs !== undefined ? pollMs : def.pollMs || 0,
    enabled: enabled && available,
  });

  // Cuerpo pesado: solo si hace falta (sin vivo, sin caché) se carga el replay en su propio chunk.
  const needsAsync = entry && entryJson === undefined && (metric.status === 'error' || !available);
  const [asyncSnapshot, setAsyncSnapshot] = useState(null);
  useEffect(() => {
    if (!needsAsync || asyncSnapshot) return undefined;
    let cancelled = false;
    loadSnapshot(key)
      .then((r) => {
        if (cancelled || !r) return;
        const v = safeSelect(select, r.raw);
        if (v !== null) setAsyncSnapshot({ value: v, fetchedAt: r.recorded_at || snapshotDate });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [needsAsync, asyncSnapshot, key, select, snapshotDate]);

  if ((metric.value === null || metric.value === undefined) && asyncSnapshot) {
    return { ...metric, value: asyncSnapshot.value, status: 'snapshot', fetchedAt: asyncSnapshot.fetchedAt, url, available };
  }
  if (!available && metric.status === 'loading') {
    return { ...metric, status: 'unavailable', url, available };
  }
  return { ...metric, url, available };
}

const defaultFormat = (value) => jsonLines(value, 40);

/** Aplica un override (EV.PULSE) si es más nuevo que lo que tiene el hook. */
export function withOverride(metric, override) {
  const use = Boolean(
    override &&
      override.value !== null &&
      override.value !== undefined &&
      (!metric.fetchedAt || !override.fetchedAt || override.fetchedAt >= metric.fetchedAt)
  );
  if (!use) return metric;
  return { ...metric, value: override.value, status: 'live', fetchedAt: override.fetchedAt };
}

/**
 * Presentacional: prompt `curl -s <url>` + salida formateada + chip de fuente + botón actualizar.
 * format(value, t) → string[].
 */
export function EndpointView({ endpointKey, metric, format = defaultFormat, maxLines = 40, typewriter = true, note = null, jq = true }) {
  const { t } = useTranslation();
  const { value, status, fetchedAt, url, available, refetch } = metric;

  const lines = useMemo(() => {
    const out = [];
    if (url) out.push({ id: 'cmd', kind: 'prompt', text: curlLine(url, jq) });
    if (note) out.push({ id: 'note', kind: 'note', text: note });
    if (value === null || value === undefined) {
      out.push({
        id: 'wait',
        kind: status === 'loading' ? 'note' : 'err',
        text: status === 'loading' ? '…' : t('ecosystem.status.unavailable', 'sin dato'),
      });
      return out;
    }
    let body;
    try {
      body = format(value, t);
    } catch (e) {
      body = jsonLines(value, maxLines);
    }
    (Array.isArray(body) ? body : [String(body)]).slice(0, maxLines + 1).forEach((text, i) => out.push({ id: `o${i}`, kind: 'out', text }));
    return out;
  }, [url, jq, note, value, status, format, maxLines, t]);

  return (
    <div className="min-w-0" data-endpoint={endpointKey} data-status={status}>
      <Terminal lines={lines} typewriter={typewriter} cursor={false} ariaLive="off" maxLines={maxLines + 4} />
      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px]">
        <SourceChip status={status} fetchedAt={fetchedAt} label={url || endpointKey} />
        {available ? (
          <button
            type="button"
            onClick={() => refetch && refetch()}
            className="min-h-[24px] rounded border border-ultraviolet/30 px-1.5 text-text-secondary hover:text-white focus:outline focus:outline-2 focus:outline-purple-300"
          >
            {t('ecosystem.window.refresh', 'Actualizar')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Hook + vista para una clave de ENDPOINTS (lo usan las ventanas simples). */
export function EndpointBlock({ endpointKey, select, pollMs, enabled = true, ...view }) {
  const metric = useEndpointMetric(endpointKey, { select, pollMs, enabled });
  return <EndpointView endpointKey={endpointKey} metric={metric} {...view} />;
}

/** Ventana genérica: varios bloques de endpoint bajo un mismo TermWindow. */
export function EndpointTerm({ windowId, title, sourceLabel, blocks, status, fetchedAt }) {
  return (
    <TermWindow windowId={windowId} title={title} sourceChip={{ status: status || 'live', fetchedAt: fetchedAt || null, label: sourceLabel }}>
      <div className="space-y-3">
        {blocks.map((b) => (
          <EndpointBlock key={b.endpointKey} {...b} />
        ))}
      </div>
    </TermWindow>
  );
}

// ---------------------------------------------------------------------------------------------
// pulse@uvd
// ---------------------------------------------------------------------------------------------

// Selects a nivel de módulo: identidad estable (ver useEndpointMetric).
const selectHealth = (j) => (j && typeof j.status === 'string' ? { status: j.status } : null);
const selectSupported = (j) => {
  if (!j || !Array.isArray(j.kinds)) return null;
  const networks = new Set(j.kinds.map((k) => k && k.network).filter(Boolean));
  return { kinds: j.kinds.length, networks: networks.size };
};
const selectMesh = (j) => (j && typeof j === 'object' && typeof j.users === 'number' ? j : null);
const selectSearch = (j) => (j && typeof j === 'object' && !Array.isArray(j) ? j : null);

const formatHealth = (v) => [JSON.stringify(v)];
const formatSupported = (v, t) => [
  `${t('ecosystem.pulse.supported_count', { defaultValue: '{{kinds}} kinds · {{networks}} redes', kinds: v.kinds, networks: v.networks })} (${t(
    'ecosystem.pulse.counted_in_browser',
    'contado en el navegador'
  )})`,
];
const formatMesh = (v, t) => [
  JSON.stringify(v),
  `# ${t('ecosystem.pulse.meshrelay', { defaultValue: '{{users}} usuarios · {{channels}} canales · {{messages}} mensajes', users: v.users, channels: v.channels, messages: v.messages })}`,
];
const formatSearch = (v, t) => {
  const lines = jsonLines(v, 12);
  const streams = v.streams ?? v.total_streams ?? v.stream_count;
  const segments = v.segments ?? v.total_segments ?? v.segment_count;
  if (typeof streams === 'number' && typeof segments === 'number') {
    lines.push(`# ${t('ecosystem.pulse.search', { defaultValue: '{{streams}} streams · {{segments}} segmentos indexados', streams, segments })}`);
  }
  return lines;
};

// De la salida de get_ecosystem_pulse ({ facilitator:{value:{health,supported}}, meshrelay:{value}, search:{value} })
const PICK = {
  facilitator_health: (p) => (p.facilitator && typeof p.facilitator.value?.health === 'string' ? { status: p.facilitator.value.health } : null),
  facilitator_supported: (p) => (p.facilitator && typeof p.facilitator.value?.supported?.kinds === 'number' ? p.facilitator.value.supported : null),
  meshrelay_stats: (p) => (p.meshrelay && typeof p.meshrelay.value?.users === 'number' ? p.meshrelay.value : null),
  search_stats: (p) => (p.search && p.search.value && typeof p.search.value === 'object' ? p.search.value : null),
};
const PULSE_BLOCK_OF = { facilitator_health: 'facilitator', facilitator_supported: 'facilitator', meshrelay_stats: 'meshrelay', search_stats: 'search' };

const summaryValue = (key, value) => {
  if (value === null || value === undefined) return '—';
  if (key === 'facilitator_health') return value.status;
  if (key === 'facilitator_supported') return `${value.kinds}/${value.networks}`;
  if (key === 'meshrelay_stats') return `${value.users}/${value.channels}/${value.messages}`;
  return typeof value === 'object' ? Object.keys(value).length : String(value);
};

export default function PulseTerm({ windowId }) {
  const { t } = useTranslation();
  const [overrides, setOverrides] = useState({});

  useEffect(
    () =>
      on(EV.PULSE, (detail) => {
        const pulse = detail && detail.pulse && typeof detail.pulse === 'object' ? detail.pulse : null;
        if (!pulse) return;
        const next = {};
        Object.keys(PICK).forEach((key) => {
          const block = pulse[PULSE_BLOCK_OF[key]];
          if (!block || block.status !== 'live') return;
          const value = PICK[key](pulse);
          if (value !== null && value !== undefined) next[key] = { value, fetchedAt: block.fetchedAt || new Date().toISOString() };
        });
        if (Object.keys(next).length) setOverrides((prev) => ({ ...prev, ...next }));
      }),
    []
  );

  const health = withOverride(useEndpointMetric('facilitator_health', { select: selectHealth }), overrides.facilitator_health);
  const supported = withOverride(useEndpointMetric('facilitator_supported', { select: selectSupported }), overrides.facilitator_supported);
  const mesh = withOverride(useEndpointMetric('meshrelay_stats', { select: selectMesh }), overrides.meshrelay_stats);
  const search = withOverride(useEndpointMetric('search_stats', { select: selectSearch }), overrides.search_stats);

  const searchNote = search.url
    ? null
    : `# $REACT_APP_STREAM_SEARCH_API/stats — ${t('ecosystem.receipt.dev_note', 'Estás en un entorno que no es ultravioletadao.xyz: algunos endpoints solo permiten CORS desde producción.')}`;

  const summary = [
    ['facilitator_health', health, 'facilitator /health'],
    ['facilitator_supported', supported, 'facilitator /supported'],
    ['meshrelay_stats', mesh, 'meshrelay /irc/stats'],
    ['search_stats', search, 'search /stats'],
  ]
    .map(([key, m, label]) =>
      t('ecosystem.pulse.summary', {
        defaultValue: '{{label}}: {{value}} ({{status}})',
        label,
        value: summaryValue(key, m.value),
        status: t(`ecosystem.status.${m.status}`, m.status),
      })
    )
    .join(' · ');

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.pulse.title', 'pulse@uvd')}
      sourceChip={{ status: health.status, fetchedAt: health.fetchedAt, label: t('ecosystem.windows.pulse.source', 'facilitator /health y /supported · api.meshrelay.xyz/irc/stats · búsqueda /stats') }}
    >
      <div className="space-y-3" data-pulse="">
        <EndpointView endpointKey="facilitator_health" metric={health} format={formatHealth} maxLines={4} jq={false} />
        <EndpointView endpointKey="facilitator_supported" metric={supported} format={formatSupported} maxLines={4} jq={false} />
        <EndpointView endpointKey="meshrelay_stats" metric={mesh} format={formatMesh} maxLines={4} jq={false} />
        <EndpointView endpointKey="search_stats" metric={search} format={formatSearch} maxLines={14} note={searchNote} />
        <p className="sr-only" aria-live="polite" data-pulse-summary="">
          {summary}
        </p>
      </div>
    </TermWindow>
  );
}
