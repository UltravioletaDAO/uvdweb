// KkTradesTerm — ventana `kk_trades`: últimos trades del enjambre de KarmaKadabra por su MCP hosteado
// (tools/call kk_recent_trades). Los hashes de tx (0x + 64 hex) se truncan a 10 caracteres ANTES de
// cualquier cache (select corre antes de writeCache) y nunca se persisten en archivos del repo.
// El replay grabado (kk_mcp_kk_recent_trades) es el snapshot si existe; si no, "sin dato".
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import useLiveMetric from '../../../../hooks/useLiveMetric';
import { callKkTool } from '../../../../services/ecosystem/kkMcp';
import { replayJson, loadReplay, isoDay } from './ReplayTerm';
import { KK_MCP_URL, kkCurl, num } from './KkKpiTerm';

const HEX64 = /^0x[0-9a-fA-F]{64}$/;
const MAX_TRADES = 12;

/** Trunca un hash de 64 hex a 10 chars; deja el resto igual. */
export const shortHash = (v) => (typeof v === 'string' && HEX64.test(v) ? `${v.slice(0, 10)}…` : v);

/** Sanea recursivamente cualquier hash de 64 hex en el valor (objetos, arrays, strings). */
export function sanitizeHashes(value) {
  if (typeof value === 'string') return shortHash(value);
  if (Array.isArray(value)) return value.map(sanitizeHashes);
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach((k) => {
      out[k] = sanitizeHashes(value[k]);
    });
    return out;
  }
  return value;
}

/** Normaliza la respuesta de kk_recent_trades a un array saneado (o null). */
export const selectTrades = (j) => {
  const list = Array.isArray(j) ? j : j && Array.isArray(j.trades) ? j.trades : null;
  if (!list) return null;
  return sanitizeHashes(list.slice(0, 50));
};

/** Día (YYYY-MM-DD) del trade más reciente de la lista, o null. */
export function lastTradeDay(trades) {
  if (!Array.isArray(trades)) return null;
  let max = null;
  trades.forEach((tr) => {
    const ts = tr && typeof tr.ts === 'string' ? tr.ts : null;
    if (ts && (!max || ts > max)) max = ts;
  });
  return isoDay(max);
}

export const TRADES_SNAPSHOT = selectTrades(replayJson('kk_mcp_kk_recent_trades'));
const TRADES_REPLAY = loadReplay('kk_mcp_kk_recent_trades');
export const TRADES_SNAPSHOT_DATE = TRADES_REPLAY ? TRADES_REPLAY.recorded_at : null;
export const fetchTrades = ({ signal }) => callKkTool('kk_recent_trades', {}, { signal });
const CMD = kkCurl('kk_recent_trades');

const str = (v, max = 40) => {
  const s = typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

export default function KkTradesTerm({ windowId }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0 });
  const { value, status, fetchedAt, refetch } = useLiveMetric({
    url: KK_MCP_URL,
    cacheKey: 'kk_recent_trades',
    fetcher: fetchTrades,
    select: selectTrades,
    snapshot: TRADES_SNAPSHOT,
    snapshotDate: TRADES_SNAPSHOT_DATE,
    pollMs: 60000,
    enabled: inView
  });

  const lines = useMemo(() => {
    const out = [{ id: 'cmd', kind: 'prompt', text: CMD }];
    if (!Array.isArray(value)) {
      out.push({ id: 'wait', kind: status === 'loading' ? 'note' : 'err', text: status === 'loading' ? '…' : t('ecosystem.status.unavailable', 'sin dato') });
      return out;
    }
    if (!value.length) {
      out.push({ id: 'empty', kind: 'out', text: '[]' });
      return out;
    }
    value.slice(0, MAX_TRADES).forEach((tr, i) => {
      const amount = num(tr.amount_usd);
      const cols = [
        str(tr.ts, 20),
        str(tr.status, 10).padEnd(8),
        `${str(tr.buyer, 18)} → ${str(tr.seller || '—', 18)}`,
        amount !== null ? `$${amount}` : '',
        str(tr.network, 12),
        str(tr.product, 44)
      ].filter(Boolean);
      out.push({ id: `t${i}`, kind: 'out', text: cols.join('  ') });
      const txs = [tr.escrow_tx ? `escrow ${shortHash(tr.escrow_tx)}` : null, tr.payment_tx ? `payment ${shortHash(tr.payment_tx)}` : null].filter(Boolean);
      if (txs.length) out.push({ id: `x${i}`, kind: 'out', text: `    ${txs.join(' · ')}` });
    });
    if (value.length > MAX_TRADES) out.push({ id: 'more', kind: 'note', text: `… (+${value.length - MAX_TRADES})` });
    const last = lastTradeDay(value);
    if (last) out.push({ id: 'last', kind: 'note', text: `${t('ecosystem.kk.last_trade', 'último trade')}: ${last}` });
    return out;
  }, [value, status, t]);

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.kk_trades.title', 'trades@karmakadabra/mcp')}
      sourceChip={{ status, fetchedAt, label: t('ecosystem.windows.kk_trades.source', 'MCP de KarmaKadabra · tools/call kk_recent_trades') }}
      actions={[{ icon: '⟳', label: t('ecosystem.window.refresh', 'Actualizar'), onClick: refetch }]}
    >
      <div ref={ref}>
        <Terminal lines={lines} typewriter ariaLive="off" maxLines={60} />
      </div>
    </TermWindow>
  );
}
