// EmMetricsTerm — ventana `em_metrics`: métricas de Execution Market vistas a través del MCP de
// KarmaKadabra (tools/call kk_market_snapshot). Execution Market no expone métricas públicas con CORS,
// así que TODO lo que se imprime aquí es DATO DE TERCEROS vía KK: la etiqueta va en la barra
// (sourceChip + untrusted) y como línea visible. Poll 60 s solo con la ventana visible.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import useLiveMetric from '../../../../hooks/useLiveMetric';
import { callKkTool } from '../../../../services/ecosystem/kkMcp';
import { replayJson, loadReplay } from './ReplayTerm';
import { KK_MCP_URL, kkCurl, jsonLines, num } from './KkKpiTerm';

const CMD = kkCurl('kk_market_snapshot');
const EM_URL = 'https://execution.market';

/** Reduce el snapshot (≈20 KB) a lo que cabe en una terminal: métricas + conteo de tareas + top 3 del leaderboard. */
export const selectSnapshot = (j) => {
  if (!j || typeof j !== 'object') return null;
  const m = j.metrics && typeof j.metrics === 'object' ? j.metrics : null;
  if (!m) return null;
  const pick = (obj) => (obj && typeof obj === 'object' ? obj : undefined);
  const workers = j.leaderboard && Array.isArray(j.leaderboard.workers) ? j.leaderboard.workers : [];
  return {
    metrics: {
      users: pick(m.users),
      tasks: pick(m.tasks),
      activity: pick(m.activity),
      payments: pick(m.payments),
      generated_at: typeof m.generated_at === 'string' ? m.generated_at : undefined
    },
    open_tasks: j.open_tasks && Number.isFinite(j.open_tasks.count) ? j.open_tasks.count : undefined,
    leaderboard_top3: workers.slice(0, 3).map((w) => ({
      display_name: typeof w.display_name === 'string' ? w.display_name : '—',
      tier: typeof w.tier === 'string' ? w.tier : undefined,
      effective_reputation_score: num(w.effective_reputation_score) ?? undefined,
      tasks_completed: num(w.tasks_completed) ?? undefined
    }))
  };
};

const SNAPSHOT = selectSnapshot(replayJson('kk_mcp_kk_market_snapshot'));
const SNAPSHOT_REPLAY = loadReplay('kk_mcp_kk_market_snapshot');
const SNAPSHOT_DATE = SNAPSHOT_REPLAY ? SNAPSHOT_REPLAY.recorded_at : null;
const fetchSnapshot = ({ signal }) => callKkTool('kk_market_snapshot', {}, { signal });

export default function EmMetricsTerm({ windowId }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0 });
  const { value, status, fetchedAt, refetch } = useLiveMetric({
    url: KK_MCP_URL,
    cacheKey: 'kk_market_snapshot',
    fetcher: fetchSnapshot,
    select: selectSnapshot,
    snapshot: SNAPSHOT,
    snapshotDate: SNAPSHOT_DATE,
    pollMs: 60000,
    enabled: inView
  });
  const thirdParty = t('ecosystem.window.third_party_mcp', 'dato de terceros vía MCP de KarmaKadabra');

  const lines = useMemo(() => {
    const out = [
      { id: 'cmd', kind: 'prompt', text: `${CMD} | jq '{metrics, open_tasks: .open_tasks.count, leaderboard_top3: .leaderboard.workers[:3]}'` },
      { id: 'tp', kind: 'note', text: `⚠ ${thirdParty}` }
    ];
    if (!value) {
      out.push({ id: 'wait', kind: status === 'loading' ? 'note' : 'err', text: status === 'loading' ? '…' : t('ecosystem.status.unavailable', 'sin dato') });
      return out;
    }
    out.push(...jsonLines(value));
    const tasks = value.metrics && value.metrics.tasks ? value.metrics.tasks : null;
    const pay = value.metrics && value.metrics.payments ? value.metrics.payments : null;
    const summary = [
      tasks && num(tasks.live) !== null ? `live: ${tasks.live}` : null,
      tasks && num(tasks.completed) !== null ? `completed: ${tasks.completed}` : null,
      pay && num(pay.total_volume_usd) !== null ? `volume: $${pay.total_volume_usd}` : null
    ].filter(Boolean);
    if (summary.length) out.push({ id: 'sum', kind: 'note', text: summary.join(' · ') });
    out.push({ id: 'meta', kind: 'note', text: t('ecosystem.em.metrics_note', 'métricas vía kk_market_snapshot del MCP de KarmaKadabra; Execution Market no expone métricas públicas con CORS') });
    return out;
  }, [value, status, t, thirdParty]);

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.em_metrics.title', 'em-metrics')}
      sourceChip={{ status, fetchedAt, label: thirdParty }}
      actions={[{ icon: '⟳', label: t('ecosystem.window.refresh', 'Actualizar'), onClick: refetch }]}
      untrusted
    >
      <div ref={ref}>
        <span className="mb-2 inline-block rounded border border-amber-400/50 bg-background/80 px-2 py-0.5 font-mono text-[11px] text-amber-200" data-third-party>
          {thirdParty}
        </span>
        <Terminal lines={lines} typewriter ariaLive="off" maxLines={120} />
        <div className="mt-2 font-mono text-xs">
          <a href={EM_URL} target="_blank" rel="noopener noreferrer" className="text-ultraviolet-light underline-offset-2 hover:underline focus:outline focus:outline-2 focus:outline-purple-300">
            {t('ecosystem.em.open', 'Abrir execution.market ↗')}
          </a>
        </div>
      </div>
    </TermWindow>
  );
}
