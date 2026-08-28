// SystemPulse — sección 02 `#pulso` de /ecosystem: "la máquina está encendida".
// Solo endpoints verificados como accesibles desde el browser (chequeo 2026-07-21, PLAN §4.1);
// los que no lo son llegan vía snapshot por useLiveMetric (nunca un 0 pelado ni spinner colgado:
// vivo -> último dato con hora -> snapshot -> raya). Procedencia con SourceChip (contrato C10,
// mismo chip que el escritorio). La línea de grafo bajo la grilla absorbe el conteo honesto de la
// antigua matriz: nodos/aristas salen de index.counts (cero cifras tipeadas), min-h reserva la
// línea para que el dato async no mueva el layout (CLS ~0).
import React from 'react';
import { useTranslation } from 'react-i18next';
import useLiveMetric from '../../../hooks/useLiveMetric';
import useEcosystemGraph from '../useEcosystemGraph';
import SourceChip, { formatDay } from '../desk/SourceChip';

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

function StatTile({ value, label, status, fetchedAt }) {
  // Never a bare 0 and never a hung spinner: an unavailable number is a dash.
  const shown = value === null || value === undefined ? '—' : value;
  return (
    <div className="flex flex-col justify-between rounded-lg border border-ultraviolet-darker/40 bg-background/80 p-4 min-h-[104px]">
      <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">{shown}</div>
      <div className="mt-2">
        <div className="text-xs text-text-secondary leading-snug">{label}</div>
        <div className="mt-1">
          <SourceChip status={status} fetchedAt={fetchedAt} />
        </div>
      </div>
    </div>
  );
}

function SystemPulse() {
  const { t } = useTranslation();
  const { graph, index } = useEcosystemGraph();

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
    <section id="pulso" aria-labelledby="pulse-title" className="mx-auto w-full max-w-7xl scroll-mt-16 px-4 py-12" data-system-pulse>
      <h2 id="pulse-title" className="mb-2 font-mono text-2xl font-bold text-text-primary">
        <span className="text-[#a78bfa]" aria-hidden="true">02 · </span>
        {t('ecosystem.pulse.title', 'Señales en vivo')}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
      <p className="mt-3 min-h-5 font-mono text-xs text-text-secondary" data-pulse-graphline>
        {index ? (
          <>
            {t('ecosystem.pulse.graph_line', {
              defaultValue: '{{nodes}} nodos · {{edges}} aristas medidas · {{latent}} latentes',
              nodes: index.counts.nodes,
              edges: index.counts.edges,
              latent: index.counts.latent,
            })}
            {' · '}
            <a href="/ecosystem/graph.json" className="text-[#a78bfa] underline-offset-2 hover:underline hover:text-[#c4b5fd]">graph.json</a>
            {graph && graph.generated_at ? ` · ${formatDay(graph.generated_at)}` : ''}
          </>
        ) : null}
      </p>
    </section>
  );
}

export default SystemPulse;
