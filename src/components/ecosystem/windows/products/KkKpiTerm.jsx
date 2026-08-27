// KkKpiTerm — ventana `kk_kpi`: KPIs del enjambre de KarmaKadabra por su MCP hosteado (JSON-RPC 2.0,
// tools/call kk_get_kpis; CORS abierto, verificado 2026-08-27). Poll 60 s solo con la ventana visible y la
// pestaña activa (useLiveMetric pausa con document.hidden); cae al replay grabado (snapshot fechado) si
// el MCP no responde. La línea prompt es ejecutable tal cual contra karmakadabra.ultravioletadao.xyz/mcp
// (verificado 2026-08-27: responde 200 sin cabecera Accept).
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import useLiveMetric from '../../../../hooks/useLiveMetric';
import { ENDPOINTS } from '../../../../services/ecosystem/endpoints';
import { callKkTool } from '../../../../services/ecosystem/kkMcp';
import { replayJson, loadReplay } from './ReplayTerm';

export const KK_MCP_URL = (ENDPOINTS && ENDPOINTS.kk_mcp && ENDPOINTS.kk_mcp.url) || 'https://karmakadabra.ultravioletadao.xyz/mcp';

/** Comando real (copiable) que hace exactamente la llamada que muestra la ventana. */
export function kkCurl(name, args = {}) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
  return `curl -s -X POST ${KK_MCP_URL} -H 'Content-Type: application/json' -d '${body}'`;
}

/** JSON → líneas `out` de Terminal (pretty-print de 2 espacios). */
export function jsonLines(value, prefix = 'j') {
  return JSON.stringify(value, null, 2)
    .split('\n')
    .map((text, i) => ({ id: `${prefix}${i}`, kind: 'out', text }));
}

export const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// Constantes de módulo: identidad estable (useLiveMetric las usa como deps del efecto).
const SNAPSHOT = replayJson('kk_mcp_kk_get_kpis');
const SNAPSHOT_REPLAY = loadReplay('kk_mcp_kk_get_kpis');
const SNAPSHOT_DATE = SNAPSHOT_REPLAY ? SNAPSHOT_REPLAY.recorded_at : null;
const CMD = kkCurl('kk_get_kpis');
const fetchKpis = ({ signal }) => callKkTool('kk_get_kpis', {}, { signal });
const selectKpis = (j) => (j && typeof j === 'object' && !Array.isArray(j) ? j : null);

export default function KkKpiTerm({ windowId }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0 });
  const { value, status, fetchedAt, refetch } = useLiveMetric({
    url: KK_MCP_URL,
    cacheKey: 'kk_get_kpis',
    fetcher: fetchKpis,
    select: selectKpis,
    snapshot: SNAPSHOT,
    snapshotDate: SNAPSHOT_DATE,
    pollMs: 60000,
    enabled: inView
  });

  const lines = useMemo(() => {
    const out = [{ id: 'cmd', kind: 'prompt', text: CMD }];
    if (!value) {
      out.push({ id: 'wait', kind: status === 'loading' ? 'note' : 'err', text: status === 'loading' ? '…' : t('ecosystem.status.unavailable', 'sin dato') });
      return out;
    }
    out.push(...jsonLines(value));
    const labels = [
      [t('ecosystem.kk.volume', 'volumen (USD)'), num(value.volume_usd)],
      [t('ecosystem.kk.trades', 'trades'), num(value.trades)],
      [t('ecosystem.kk.donated', 'donado (USD)'), num(value.donated_usd)],
      [t('ecosystem.kk.agents_active', 'agentes activos'), num(value.agents_active)],
      [t('ecosystem.kk.agents_total', 'agentes en total'), num(value.agents_total)]
    ].filter(([, v]) => v !== null);
    if (labels.length) {
      out.push({ id: 'sum', kind: 'note', text: labels.map(([k, v]) => `${k}: ${v}`).join(' · ') });
    }
    return out;
  }, [value, status, t]);

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.kk_kpi.title', 'kpi@karmakadabra/mcp')}
      sourceChip={{ status, fetchedAt, label: t('ecosystem.windows.kk_kpi.source', 'MCP de KarmaKadabra · tools/call kk_get_kpis') }}
      actions={[{ icon: '⟳', label: t('ecosystem.window.refresh', 'Actualizar'), onClick: refetch }]}
    >
      <div ref={ref}>
        <Terminal lines={lines} typewriter cursor ariaLive="off" maxLines={60} />
      </div>
    </TermWindow>
  );
}
