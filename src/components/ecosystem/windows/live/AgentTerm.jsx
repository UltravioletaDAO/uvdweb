// AgentTerm — ventana `agent` (agent@uvd): las tools WebMCP de esta página y un REPL.
// Lista las tools que WebMCPProvider registra en document.modelContext (mismo buildTools, sin
// registrar nada de nuevo); si el navegador no expone modelContext lo dice y lista igual.
// REPL = runEcosystemCommand (gramática cerrada, sin eval): help · tools · run · open · graph · curl…
// Escucha EV.TRACE: cada tool que ejecuta un agente se imprime como `◆ agent → name(args)` con su
// resultado (clip 800) y un pulso de borde de 300 ms (motion-safe). aria-live="polite" solo en la
// salida del prompt; la traza va con aria-live="off".
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import i18n from '../../../../i18n/config';
import { buildTools } from '../../../../agent/tools';
import { COMMANDS_HELP, runEcosystemCommand } from '../../../../agent/ecosystemCommands';
import { EV, on } from '../../../../services/ecosystem/bus';
import { LIVE_META } from './index';

export const meta = LIVE_META.agent;

const MAX_LINES = 200;
const TRACE_MAX = 80;
const RESULT_CLIP = 800;
const PULSE_MS = 300;

const clip = (value, max = RESULT_CLIP) => {
  const str = String(value ?? '');
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
};

const format = (value) => clip(typeof value === 'string' ? value : JSON.stringify(value, null, 1));

const hasModelContext = () => {
  try {
    const mc = document.modelContext ?? navigator.modelContext;
    return typeof (mc && mc.registerTool) === 'function';
  } catch (e) {
    return false;
  }
};

const toLines = (text, kind, seq) =>
  String(text ?? '')
    .split('\n')
    .map((line) => ({ id: `l${(seq.current += 1)}`, kind, text: line }));

export default function AgentTerm({ windowId, focused }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const seq = useRef(0);
  const inputRef = useRef(null);
  const [registered] = useState(hasModelContext);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [pulse, setPulse] = useState(false);
  const [traces, setTraces] = useState([]);

  // Mismo constructor que WebMCPProvider; aquí solo se leen nombres (no se registra nada).
  const toolNames = useMemo(() => buildTools({ navigate: (p) => navigateRef.current(p), i18n }).map((tool) => tool.name), []);

  const [lines, setLines] = useState(() => {
    const s = { current: 0 };
    const head = registered
      ? t('ecosystem.agent.registered', { defaultValue: '{{count}} tools registradas en document.modelContext', count: toolNames.length })
      : t('ecosystem.agent.no_modelcontext', 'este navegador no expone document.modelContext — se listan las tools sin registrar');
    const out = [{ id: 'head', kind: 'note', text: `# ${head}` }, ...toLines(toolNames.join('  '), 'out', s)];
    out.push({ id: 'hint', kind: 'note', text: `# ${t('ecosystem.agent.prompt_placeholder', 'help · tools · run <tool> <json> · open <kind> · curl <url>')}` });
    seq.current = s.current;
    return out;
  });

  const push = useCallback((items) => {
    setLines((prev) => {
      const next = [...prev, ...items];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  // Traza de tools ejecutadas por un agente (origin 'agent'); las del REPL ya se imprimen abajo.
  useEffect(() => {
    let timer = null;
    const off = on(EV.TRACE, (detail) => {
      if (!detail || detail.origin !== 'agent') return;
      const args = detail.args && typeof detail.args === 'object' ? JSON.stringify(detail.args) : '';
      const items = [
        { id: `t${(seq.current += 1)}`, kind: 'note', text: `◆ agent → ${detail.name}(${clip(args, 200)})` },
        ...toLines(format(detail.result), 'out', seq),
      ];
      setTraces((prev) => {
        const next = [...prev, ...items];
        return next.length > TRACE_MAX ? next.slice(next.length - TRACE_MAX) : next;
      });
      setPulse(true);
      clearTimeout(timer);
      timer = setTimeout(() => setPulse(false), PULSE_MS);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  const run = useCallback(
    async (raw) => {
      const cmd = String(raw || '').trim();
      if (!cmd) return;
      push([{ id: `p${(seq.current += 1)}`, kind: 'prompt', text: cmd }]);
      setHistory((h) => [cmd, ...h].slice(0, 50));
      setHistIdx(-1);
      setBusy(true);
      try {
        const result = await runEcosystemCommand(cmd, { navigate: (p) => navigateRef.current(p) });
        if (result && result.clear) {
          setLines([]);
        } else if (result && result.ok) {
          push(toLines(result.output || '', result.untrusted ? 'note' : 'out', seq));
        } else {
          const err = (result && result.error) || 'error';
          const items = [{ id: `e${(seq.current += 1)}`, kind: 'err', text: `${t('ecosystem.agent.unknown_command', 'comando no permitido — escribe help')} (${err})` }];
          if (result && result.output) items.push(...toLines(result.output, 'out', seq));
          const help = result && Array.isArray(result.help) ? result.help : err === 'command_not_allowed' ? COMMANDS_HELP : [];
          items.push(...toLines(help.join('\n'), 'note', seq));
          push(items);
        }
      } catch (e) {
        push([{ id: `e${(seq.current += 1)}`, kind: 'err', text: clip(e && e.message ? e.message : String(e), 200) }]);
      } finally {
        setBusy(false);
      }
    },
    [push, t]
  );

  const onSubmit = (ev) => {
    ev.preventDefault();
    const value = input;
    setInput('');
    run(value);
  };

  const onKeyDown = (ev) => {
    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      const next = Math.min(history.length - 1, histIdx + 1);
      if (next >= 0) {
        setHistIdx(next);
        setInput(history[next]);
      }
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      const next = histIdx - 1;
      setHistIdx(next);
      setInput(next >= 0 ? history[next] : '');
    }
  };

  useEffect(() => {
    if (focused && inputRef.current && document.activeElement === document.body) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [focused]);

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.agent.title', 'agent@uvd — tools WebMCP')}
      sourceChip={{ status: registered ? 'live' : 'unavailable', fetchedAt: null, label: t('ecosystem.windows.agent.source', 'document.modelContext · registro de tools de esta página') }}
    >
      <div
        data-agent-term=""
        data-agent-registered={registered ? 'true' : 'false'}
        data-agent-pulse={pulse ? 'true' : 'false'}
        className="min-w-0 rounded"
        style={{
          boxShadow: pulse ? '0 0 0 2px #a78bfa, 0 0 18px rgba(106,0,255,.6)' : 'none',
          transition: 'box-shadow 300ms ease',
        }}
        onClick={() => {
          const sel = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
          if (inputRef.current && (!sel || sel.isCollapsed)) inputRef.current.focus({ preventScroll: true });
        }}
      >
        {traces.length ? (
          <div className="mb-2 border-b border-ultraviolet/20 pb-2" data-agent-trace="">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-secondary">{t('ecosystem.agent.trace', 'traza de tools')}</p>
            <Terminal lines={traces} typewriter={false} cursor={false} ariaLive="off" maxLines={TRACE_MAX} />
          </div>
        ) : null}

        <div data-agent-output="">
          <Terminal lines={lines} typewriter={false} cursor={false} ariaLive="polite" maxLines={MAX_LINES} />
        </div>

        <form onSubmit={onSubmit} className="mt-1 flex items-center gap-2 font-mono text-xs" data-agent-form="">
          <label htmlFor={`agent-input-${windowId}`} className="text-ultraviolet-light">
            uvd@ecosystem:~$
          </label>
          <input
            id={`agent-input-${windowId}`}
            ref={inputRef}
            type="text"
            value={input}
            disabled={busy}
            onChange={(ev) => setInput(ev.target.value)}
            onKeyDown={onKeyDown}
            maxLength={200}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label={t('ecosystem.agent.prompt_aria', 'Consola de comandos del ecosistema')}
            placeholder={t('ecosystem.agent.prompt_placeholder', 'help · tools · run <tool> <json> · open <kind> · curl <url>')}
            className="min-h-[32px] min-w-0 flex-1 border-0 border-b border-ultraviolet/30 bg-transparent px-1 font-mono text-xs text-white caret-purple-300 outline-none placeholder:text-text-secondary/60 focus:border-purple-300"
            data-agent-input=""
          />
          <span aria-hidden="true" className="text-purple-300 motion-safe:animate-pulse">
            ▌
          </span>
        </form>
      </div>
    </TermWindow>
  );
}
