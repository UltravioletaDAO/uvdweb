// EmTasksTerm — ventana `em_tasks`: tareas disponibles de Execution Market y cola del bridge, por los
// dos endpoints públicos con CORS abierto (api.meshrelay.xyz/em/tasks/available y
// bridge.meshrelay.xyz/api/em/queue-stats; verificado 2026-08-27). Dos `curl` reales, dos escaleras
// live → stale → snapshot (replays grabados). Poll 60 s solo con la ventana visible.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import useLiveMetric from '../../../../hooks/useLiveMetric';
import { ENDPOINTS } from '../../../../services/ecosystem/endpoints';
import { replayJson, loadReplay } from './ReplayTerm';
import { jsonLines, num } from './KkKpiTerm';

const url = (key, fallback) => (ENDPOINTS && ENDPOINTS[key] && ENDPOINTS[key].url) || fallback;
export const TASKS_URL = url('meshrelay_em_tasks', 'https://api.meshrelay.xyz/em/tasks/available');
export const QUEUE_URL = url('bridge_em_queue', 'https://bridge.meshrelay.xyz/api/em/queue-stats');

const MAX_TASKS = 6;
const str = (v, max = 60) => {
  const s = typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

/** Reduce la lista de tareas a campos de presentación (sin wallets ni hashes). */
export const selectTasks = (j) => {
  if (!j || typeof j !== 'object' || !Array.isArray(j.tasks)) return null;
  return {
    count: num(j.count) !== null ? j.count : j.tasks.length,
    tasks: j.tasks.slice(0, MAX_TASKS).map((tk) => ({
      title: str(tk.title || tk.name || tk.description, 60) || '—',
      status: str(tk.status, 16) || undefined,
      reward: tk.reward_usd !== undefined ? num(tk.reward_usd) ?? undefined : tk.reward !== undefined ? str(tk.reward, 16) : undefined,
      deadline: str(tk.deadline || tk.expires_at, 25) || undefined
    })),
    filters_applied: j.filters_applied && typeof j.filters_applied === 'object' ? j.filters_applied : undefined
  };
};

export const selectQueue = (j) => (j && typeof j === 'object' && !Array.isArray(j) ? j : null);

const TASKS_SNAPSHOT = selectTasks(replayJson('meshrelay_em_tasks'));
const TASKS_REPLAY = loadReplay('meshrelay_em_tasks');
const QUEUE_SNAPSHOT = selectQueue(replayJson('bridge_em_queue'));
const QUEUE_REPLAY = loadReplay('bridge_em_queue');

const waitLine = (id, status, t) => ({ id, kind: status === 'loading' ? 'note' : 'err', text: status === 'loading' ? '…' : t('ecosystem.status.unavailable', 'sin dato') });

export default function EmTasksTerm({ windowId }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0 });
  const tasks = useLiveMetric({
    url: TASKS_URL,
    cacheKey: 'meshrelay_em_tasks',
    select: selectTasks,
    snapshot: TASKS_SNAPSHOT,
    snapshotDate: TASKS_REPLAY ? TASKS_REPLAY.recorded_at : null,
    pollMs: 60000,
    enabled: inView
  });
  const queue = useLiveMetric({
    url: QUEUE_URL,
    cacheKey: 'bridge_em_queue',
    select: selectQueue,
    snapshot: QUEUE_SNAPSHOT,
    snapshotDate: QUEUE_REPLAY ? QUEUE_REPLAY.recorded_at : null,
    pollMs: 60000,
    enabled: inView
  });

  const lines = useMemo(() => {
    const out = [{ id: 'cmd1', kind: 'prompt', text: `curl -s ${TASKS_URL} | jq '{count, tasks: .tasks[:${MAX_TASKS}]}'` }];
    if (!tasks.value) out.push(waitLine('w1', tasks.status, t));
    else {
      out.push(...jsonLines(tasks.value, 'a'));
      out.push({ id: 'n1', kind: 'note', text: t('ecosystem.em.tasks_available', { defaultValue: '{{count}} tareas disponibles', count: tasks.value.count }) });
    }
    out.push({ id: 'cmd2', kind: 'prompt', text: `curl -s ${QUEUE_URL} | jq .` });
    if (!queue.value) out.push(waitLine('w2', queue.status, t));
    else {
      out.push(...jsonLines(queue.value, 'b'));
      const delivered = num(queue.value.delivered_today);
      const at = typeof queue.value.last_event_received === 'string' ? queue.value.last_event_received : null;
      if (delivered !== null && at) {
        out.push({ id: 'n2', kind: 'note', text: t('ecosystem.em.queue', { defaultValue: '{{delivered}} entregadas · {{at}}', delivered, at }) });
      }
    }
    return out;
  }, [tasks.value, tasks.status, queue.value, queue.status, t]);

  // Chip de la barra: el peor de los dos estados (live solo si ambos lo están).
  const rank = { live: 0, stale: 1, snapshot: 2, loading: 3, error: 4 };
  const worst = [tasks.status, queue.status].sort((a, b) => (rank[b] ?? 5) - (rank[a] ?? 5))[0];
  const fetchedAt = worst === tasks.status ? tasks.fetchedAt : queue.fetchedAt;
  const refresh = () => {
    tasks.refetch();
    queue.refetch();
  };

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.em_tasks.title', 'em-tasks')}
      sourceChip={{ status: worst, fetchedAt, label: t('ecosystem.windows.em_tasks.source', 'api.meshrelay.xyz/em/tasks/available · bridge.meshrelay.xyz/api/em/queue-stats') }}
      actions={[{ icon: '⟳', label: t('ecosystem.window.refresh', 'Actualizar'), onClick: refresh }]}
    >
      <div ref={ref}>
        <Terminal lines={lines} typewriter ariaLive="off" maxLines={100} />
      </div>
    </TermWindow>
  );
}
