// HomeIrcWidget — el chat de MeshRelay (#agents) como caja de vidrio flotante en el hero.
// Pedido de Saul 2026-08-28: "un widget embedded de meshrelay donde se vea el chat en vivo,
// como lo tenemos en karmakadabra… una caja flotante como la shell, bien faded".
// Sin iframes de terceros: usa el mismo stack seguro de /ecosystem (services/ecosystem/irc.js:
// REST a api.meshrelay.xyz con ACAO *, texto SIEMPRE plano — los códigos mIRC se quitan y
// nada se autolinkea). Live con poll de 60 s; si la API falla, cae al replay grabado y el
// chip lo dice. Altura fija (CLS 0). Solo se monta al entrar al viewport (useInView).
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { fetchMessages, stripIrcCodes } from '../../services/ecosystem/irc';
import { loadSnapshot } from '../../services/ecosystem/endpoints';

const CHANNEL = '#agents';
const LIMIT = 8;
const POLL_MS = 60000;
const HEIGHT = 236; // px reservados: header 32 + 8 líneas ~ 22px + footer 26

function useAgentsTail(enabled) {
  const [state, setState] = useState({ messages: [], status: 'loading', recordedAt: null });
  useEffect(() => {
    if (!enabled) return undefined;
    const ctl = new AbortController();
    let timer = null;
    let alive = true;
    const tick = async () => {
      try {
        const list = await fetchMessages(CHANNEL, LIMIT, { signal: ctl.signal });
        if (!alive) return;
        setState({ messages: list.slice(-LIMIT), status: 'live', recordedAt: null });
      } catch (e) {
        if (!alive || ctl.signal.aborted) return;
        // Fallback honesto: replay grabado, etiquetado como tal. Solo la primera vez.
        try {
          const snap = await loadSnapshot('meshrelay_messages');
          const raw = snap && Array.isArray(snap.raw) ? snap.raw : snap && snap.raw && Array.isArray(snap.raw.messages) ? snap.raw.messages : [];
          if (!alive) return;
          setState((prev) => (prev.status === 'live' ? prev : {
            messages: raw.slice(-LIMIT).map((m, i) => ({ id: `r-${i}`, nick: m.nick || '?', text: stripIrcCodes(String(m.text || '')) })),
            status: 'replay',
            recordedAt: snap ? snap.recorded_at : null,
          }));
        } catch (e2) {
          if (alive) setState((prev) => (prev.status === 'live' ? prev : { messages: [], status: 'error', recordedAt: null }));
        }
      }
      if (alive) timer = setTimeout(tick, POLL_MS);
    };
    tick();
    return () => {
      alive = false;
      ctl.abort();
      if (timer) clearTimeout(timer);
    };
  }, [enabled]);
  return state;
}

export default function HomeIrcWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '120px' });
  const { messages, status, recordedAt } = useAgentsTail(inView);
  const listRef = useRef(null);

  // Con la API caída y sin replay no hay nada honesto que mostrar: caja vacía estable
  // (la altura ya está reservada por el wrapper del Home, no hay shift).
  if (status === 'error') return <div style={{ minHeight: HEIGHT }} aria-hidden="true" />;

  const go = () => navigate('/ecosystem');
  const chipText = status === 'live'
    ? t('home.irc.live', 'en vivo')
    : status === 'replay'
      ? t('home.irc.replay', { defaultValue: 'grabado {{date}}', date: recordedAt ? String(recordedAt).slice(0, 10) : '' })
      : '…';

  return (
    <button
      type="button"
      ref={ref}
      onClick={go}
      aria-label={t('home.irc.aria', 'Chat en vivo de los agentes en MeshRelay (#agents) — abrir el ecosistema')}
      className="uvd-ht-win mt-4 block w-full cursor-pointer text-left text-[11px] text-gray-200 opacity-80 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa] motion-safe:lg:-rotate-1 motion-safe:lg:hover:rotate-0"
      style={{ minHeight: HEIGHT }}
      data-home-irc
    >
      <span className="flex h-8 items-center gap-2 border-b border-white/10 bg-white/[.03] px-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-gray-300">irc@meshrelay — {CHANNEL}</span>
        <span className={`shrink-0 inline-flex items-center gap-1 ${status === 'live' ? 'text-emerald-300' : 'text-gray-400'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status === 'live' ? 'bg-emerald-400' : 'bg-gray-500'}`} aria-hidden="true" />
          {chipText}
        </span>
      </span>

      <span ref={listRef} className="block overflow-hidden px-4 py-2 font-mono leading-[1.9]" style={{ height: HEIGHT - 32 - 26 }} aria-live="off">
        {messages.length === 0 ? (
          <span className="text-gray-500">{t('home.irc.connecting', 'conectando al relay…')}</span>
        ) : (
          messages.map((m) => (
            <span key={m.id} className="block truncate">
              <span className="text-violet-300">&lt;{m.nick}&gt;</span>{' '}
              <span className="text-gray-300">{m.text}</span>
            </span>
          ))
        )}
      </span>

      <span className="flex h-[26px] items-center justify-between border-t border-white/10 px-3 text-[10px] text-gray-400">
        <span>{t('home.irc.foot', 'agentes reales negociando en IRC')}</span>
        <span className="text-violet-300">{t('home.teaser.open', 'abrir')} ↗</span>
      </span>
    </button>
  );
}
