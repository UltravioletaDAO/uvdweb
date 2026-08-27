// IrcTerm — ventana `irc` (params.channel): tail REAL de un canal público de MeshRelay
// (api.meshrelay.xyz/irc/channels/%23<canal>/messages, ACAO * verificado). Poll cada 30 s (60 s con
// saveData), pausado con document.hidden. Filtro "solo bots de la casa" ON por defecto (HOUSE_BOTS,
// sin el ruido de Sentinel) con contador de ocultos y toggle. Los códigos mIRC pasan por
// ircToSegments → <span class="irc-fg-N">; las URLs quedan como texto plano (sin <a>); nunca HTML.
// aria-live="off" + botón actualizar: el visitante decide cuándo leer. Contenido de terceros.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import SourceChip from '../../desk/SourceChip';
import { useDesk } from '../../desk/useDesk';
import { fetchMessages, ircToSegments, isHouseBot, MESSAGES_POLL_MS, NOISY_HOUSE_BOTS } from '../../../../services/ecosystem/irc';
import { LIVE_META } from './index';


export const meta = LIVE_META.irc;

const LIMIT_DESKTOP = 30;
const LIMIT_MOBILE = 10;

const saveDataOn = () => {
  try {
    return Boolean(navigator.connection && navigator.connection.saveData);
  } catch (e) {
    return false;
  }
};

const hhmm = (iso) => {
  if (!iso) return '--:--';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '--:--';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    return '--:--';
  }
};

/** Filtro por defecto: bots de la casa, sin los nicks ruidosos (Sentinel). */
export const isShownByDefault = (nick) => isHouseBot(nick) && !NOISY_HOUSE_BOTS.includes(nick);

function Segments({ raw }) {
  const segments = useMemo(() => ircToSegments(raw), [raw]);
  return segments.map((s, i) => {
    const cls = [];
    if (s.fg !== undefined) cls.push(`irc-fg-${s.fg}`);
    if (s.bg !== undefined) cls.push(`irc-bg-${s.bg}`);
    if (s.bold) cls.push('font-bold');
    return cls.length ? (
      <span key={i} className={cls.join(' ')}>
        {s.text}
      </span>
    ) : (
      <React.Fragment key={i}>{s.text}</React.Fragment>
    );
  });
}

export default function IrcTerm({ windowId, params = {} }) {
  const { t } = useTranslation();
  const { state } = useDesk();
  const isMobile = Boolean(state && state.isMobile);
  const channel = String(params.channel || 'agents').replace(/^#/, '');
  const limit = isMobile ? LIMIT_MOBILE : LIMIT_DESKTOP;

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | live | error | paused
  const [fetchedAt, setFetchedAt] = useState(null);
  const [houseOnly, setHouseOnly] = useState(true);
  const [paused, setPaused] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [tick, setTick] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Fetch + poll (pausado en segundo plano; ×2 con saveData).
  useEffect(() => {
    let cancelled = false;
    let controller = null;
    let interval = null;

    const run = async () => {
      if (cancelled || (typeof document !== 'undefined' && document.hidden)) return;
      if (controller) controller.abort();
      controller = new AbortController();
      try {
        const list = await fetchMessages(channel, limit, { signal: controller.signal });
        if (cancelled || !mounted.current) return;
        setMessages(list);
        setStatus('live');
        setFetchedAt(new Date().toISOString());
      } catch (e) {
        if (cancelled || !mounted.current || (e && e.name === 'AbortError')) return;
        setStatus((prev) => (prev === 'live' ? 'stale' : 'error'));
      }
    };

    const period = MESSAGES_POLL_MS * (saveDataOn() ? 2 : 1);
    const start = () => {
      if (!interval) interval = setInterval(run, period);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
        setPaused(true);
      } else {
        setPaused(false);
        run();
        start();
      }
    };

    run();
    if (typeof document === 'undefined' || !document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      if (controller) controller.abort();
    };
  }, [channel, limit, tick]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const shown = useMemo(() => (houseOnly ? messages.filter((m) => isShownByDefault(m.nick)) : messages), [messages, houseOnly]);
  const hidden = messages.length - shown.length;
  const chName = `#${channel}`;

  return (
    <TermWindow
      windowId={windowId}
      title={`${chName}@irc.meshrelay.xyz`}
      untrusted
      sourceChip={{ status: paused ? 'stale' : status, fetchedAt, label: t('ecosystem.windows.irc.source', 'api.meshrelay.xyz/irc/channels/…/messages · mensajes de agentes, texto plano') }}
    >
      <div className="min-w-0" data-irc={chName} data-irc-shown={shown.length} data-irc-hidden={hidden}>
        <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="text-amber-300/90">{t('ecosystem.irc.untrusted_notice', 'mensajes de agentes de terceros — texto plano, sin enlaces')}</span>
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            aria-pressed={houseOnly}
            data-irc-filter=""
            onClick={() => setHouseOnly((v) => !v)}
            className="min-h-[28px] rounded border border-ultraviolet/40 px-2 text-text-primary hover:text-white focus:outline focus:outline-2 focus:outline-purple-300"
          >
            {houseOnly ? t('ecosystem.irc.filter_house', 'solo bots de la casa') : t('ecosystem.irc.filter_all', 'todos los nicks')}
          </button>
          <span className="text-text-secondary" data-irc-hidden-count="">
            {t('ecosystem.irc.hidden_count', { defaultValue: '{{count}} ocultos', count: hidden })}
          </span>
          <button
            type="button"
            onClick={refresh}
            data-irc-refresh=""
            className="min-h-[28px] rounded border border-ultraviolet/30 px-2 text-text-secondary hover:text-white focus:outline focus:outline-2 focus:outline-purple-300"
          >
            {t('ecosystem.irc.refresh', 'Actualizar mensajes')}
          </button>
          {paused ? <span className="text-text-secondary">{t('ecosystem.irc.paused', 'pausado (pestaña en segundo plano)')}</span> : null}
          <SourceChip status={paused ? 'stale' : status} fetchedAt={fetchedAt} label={chName} />
        </div>

        {/* h-72 fija (no max-h): el log no crece cuando llegan los mensajes del poll → 0 CLS. */}
        <pre
          role="log"
          aria-live="off"
          aria-label={chName}
          className="m-0 h-72 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-primary"
          style={{ overflowWrap: 'anywhere' }}
          data-irc-log=""
        >
          {status === 'loading' && !messages.length ? (
            '…'
          ) : shown.length ? (
            shown.map((m) => (
              <div key={m.id} data-irc-msg="">
                <span className="text-text-secondary">[{hhmm(m.time)}] </span>
                <span className="text-cyan-300">{m.nick}</span>
                <span className="text-text-secondary">{': '}</span>
                <Segments raw={m.raw} />
              </div>
            ))
          ) : (
            <span className="text-text-secondary" data-irc-empty="">
              {status === 'error' ? t('ecosystem.status.unavailable', 'sin dato') : t('ecosystem.irc.empty', { defaultValue: 'sin mensajes recientes en {{channel}}', channel: chName })}
            </span>
          )}
        </pre>
      </div>
    </TermWindow>
  );
}
