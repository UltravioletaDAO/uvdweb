import React from 'react';
import { useTranslation } from 'react-i18next';
import useLiveMetric from '../../hooks/useLiveMetric';

/**
 * SystemPulse — "la máquina está encendida" (docs/PLAN.md §3 sección 1).
 *
 * Only endpoints VERIFIED to send access-control-allow-origin are used here
 * (checked 2026-07-21, see PLAN §4.1). KarmaKadabra's graph.json and Execution
 * Market's /public/metrics return 200 but no CORS header, so they are NOT
 * fetched from the browser — they land in Fase 4 behind /api/pulse.
 *
 * PLAN §4.5: a tile never renders a bare 0 or a hung spinner for a system that
 * is alive. Live value -> cached stale value with its time -> snapshot -> dash.
 */

const MESHRELAY_STATS = 'https://api.meshrelay.xyz/irc/stats';
const FACILITATOR_HEALTH = 'https://facilitator.ultravioletadao.xyz/health';

// Module-level so their identity is stable across renders.
const selectIrc = (j) => (j && typeof j === 'object' && typeof j.users === 'number' ? j : null);
const selectHealth = (j) => (j && typeof j.status === 'string' ? j.status : null);

const fmt = (n) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  try {
    return n.toLocaleString('es');
  } catch (e) {
    return String(n);
  }
};

function ProvenanceChip({ status, fetchedAt }) {
  const { t } = useTranslation();
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        {t('landing.pulse.live', 'en vivo')}
      </span>
    );
  }
  if (status === 'stale') {
    let when = '';
    try {
      if (fetchedAt) when = new Date(fetchedAt).toLocaleString('es');
    } catch (e) {
      when = '';
    }
    return (
      <span className="text-[10px] uppercase tracking-wider text-amber-400/80">
        {t('landing.pulse.stale', 'último dato')} {when}
      </span>
    );
  }
  if (status === 'snapshot') {
    return (
      <span className="text-[10px] uppercase tracking-wider text-gray-500">
        {t('landing.pulse.snapshot', 'snapshot')} {fetchedAt || ''}
      </span>
    );
  }
  if (status === 'loading') {
    return <span className="text-[10px] uppercase tracking-wider text-gray-600">···</span>;
  }
  return (
    <span className="text-[10px] uppercase tracking-wider text-gray-600">
      {t('landing.pulse.unavailable', 'sin dato')}
    </span>
  );
}

function StatTile({ value, label, status, fetchedAt }) {
  // Never a bare 0 and never a hung spinner: an unavailable number is a dash.
  const shown = value === null || value === undefined ? '—' : value;
  return (
    <div className="flex flex-col justify-between rounded-xl border border-ultraviolet-darker/25 bg-background-lighter/40 p-4 min-h-[104px]">
      <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">{shown}</div>
      <div className="mt-2">
        <div className="text-xs text-text-secondary leading-snug">{label}</div>
        <div className="mt-1">
          <ProvenanceChip status={status} fetchedAt={fetchedAt} />
        </div>
      </div>
    </div>
  );
}

function SystemPulse({ className = '' }) {
  const { t } = useTranslation();

  // One request for MeshRelay; three tiles derive from it.
  const irc = useLiveMetric({
    url: MESHRELAY_STATS,
    cacheKey: 'meshrelay:irc-stats',
    select: selectIrc,
  });
  const health = useLiveMetric({
    url: FACILITATOR_HEALTH,
    cacheKey: 'facilitator:health',
    select: selectHealth,
  });

  const s = irc.value && typeof irc.value === 'object' ? irc.value : {};

  const railOk = health.value === 'healthy';
  const railLabel =
    health.status === 'loading'
      ? '—'
      : railOk
      ? t('landing.pulse.rail_ok', 'operativo')
      : health.value
      ? String(health.value)
      : '—';

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      <StatTile
        value={fmt(s.users)}
        label={t('landing.pulse.agents', 'agentes conectados a la red')}
        status={irc.status}
        fetchedAt={irc.fetchedAt}
      />
      <StatTile
        value={fmt(s.messages)}
        label={t('landing.pulse.messages', 'mensajes relevados entre agentes')}
        status={irc.status}
        fetchedAt={irc.fetchedAt}
      />
      <StatTile
        value={fmt(s.channels)}
        label={t('landing.pulse.channels', 'canales activos')}
        status={irc.status}
        fetchedAt={irc.fetchedAt}
      />
      <StatTile
        value={railLabel}
        label={t('landing.pulse.rail', 'riel de pago x402 (sin gas)')}
        status={health.status}
        fetchedAt={health.fetchedAt}
      />
    </div>
  );
}

export default SystemPulse;
