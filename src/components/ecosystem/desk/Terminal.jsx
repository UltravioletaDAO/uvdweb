// Terminal (contrato C10): <pre> con spans. Líneas { id, kind:'prompt'|'out'|'err'|'note'|'segments',
// text | segments:[{text,fg,bg,bold}], at }. Typewriter motion-safe (12 ms/char) SOLO en líneas
// prompt: la salida aparece de golpe cuando el comando terminó de teclearse (como en una shell).
// Nunca HTML: todo es texto plano; los códigos mIRC ya vienen convertidos a segmentos.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const CHAR_MS = 12;
export const DEFAULT_PS1 = 'uvd@ecosystem:~$';

function Segments({ segments }) {
  return segments.map((seg, i) => {
    const cls = [];
    if (Number.isInteger(seg.fg)) cls.push(`irc-fg-${seg.fg}`);
    if (Number.isInteger(seg.bg)) cls.push(`irc-bg-${seg.bg}`);
    if (seg.bold) cls.push('font-semibold');
    return cls.length ? (
      <span key={i} className={cls.join(' ')}>{seg.text}</span>
    ) : (
      <React.Fragment key={i}>{seg.text}</React.Fragment>
    );
  });
}

function Line({ line, ps1, typingRef }) {
  const kind = line.kind || 'out';
  const text = typeof line.text === 'string' ? line.text : '';
  if (kind === 'prompt') {
    return (
      <span className="uvd-line uvd-line--prompt" data-kind="prompt">
        <span className="uvd-ps1" aria-hidden="true">{ps1} </span>
        {typingRef ? <span className="uvd-cmd" ref={typingRef} data-typing="" /> : <span className="uvd-cmd">{text}</span>}
      </span>
    );
  }
  if (kind === 'segments') {
    return (
      <span className="uvd-line uvd-line--segments" data-kind="segments">
        <Segments segments={Array.isArray(line.segments) ? line.segments : []} />
      </span>
    );
  }
  return (
    <span className={`uvd-line uvd-line--${kind}`} data-kind={kind}>
      {text}
    </span>
  );
}

export default function Terminal({
  lines = [],
  typewriter = false,
  cursor = false,
  ariaLive = 'off',
  maxLines = 200,
  ps1 = DEFAULT_PS1,
  className = '',
  children,
}) {
  const reduced = useReducedMotion();
  const animate = typewriter && !reduced;
  const shown = useMemo(() => (lines.length > maxLines ? lines.slice(lines.length - maxLines) : lines), [lines, maxLines]);

  // Ids de prompts ya tecleados y prompt en curso { id }. El tecleo escribe textContent en el
  // span del comando (ref) a 12 ms/char SIN re-render de React: un setState por carácter en
  // cuatro terminales a la vez costaba long tasks a 4× CPU. Solo hay un render al empezar y
  // otro al terminar cada línea.
  const doneRef = useRef(new Set());
  const cmdRef = useRef(null);
  const [typing, setTyping] = useState(null);

  useEffect(() => {
    if (!animate) return undefined;
    const pending = shown.find((l) => l.kind === 'prompt' && !doneRef.current.has(l.id));
    if (!pending) {
      setTyping((prev) => (prev ? null : prev));
      return undefined;
    }
    const text = typeof pending.text === 'string' ? pending.text : '';
    let n = 0;
    setTyping({ id: pending.id });
    const timer = setInterval(() => {
      n += 1;
      if (n >= text.length) {
        clearInterval(timer);
        doneRef.current.add(pending.id);
        setTyping(null);
      } else if (cmdRef.current) {
        cmdRef.current.textContent = text.slice(0, n);
      }
    }, CHAR_MS);
    return () => clearInterval(timer);
  }, [shown, animate]);

  // Con typewriter, las líneas posteriores al prompt en curso esperan.
  const visible = useMemo(() => {
    if (!animate) return shown;
    const typingIdx = typing ? shown.findIndex((l) => l.id === typing.id) : -1;
    const cut = typingIdx >= 0 ? typingIdx : shown.findIndex((l) => l.kind === 'prompt' && !doneRef.current.has(l.id));
    return cut < 0 ? shown : shown.slice(0, cut + 1);
  }, [shown, animate, typing]);

  // Auto-scroll solo cuando llegan líneas nuevas tras el primer render (una sesión grabada
  // debe abrirse mostrando el comando, no el final de la salida).
  const preRef = useRef(null);
  const stickRef = useRef(true);
  const prevLenRef = useRef(-1);
  useLayoutEffect(() => {
    const el = preRef.current;
    const prevLen = prevLenRef.current;
    prevLenRef.current = visible.length;
    if (!el || prevLen < 0 || visible.length <= prevLen) return;
    if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [visible]);
  const onScroll = () => {
    const el = preRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  return (
    <pre
      ref={preRef}
      onScroll={onScroll}
      className={`uvd-pre ${className}`}
      data-terminal=""
      aria-live={ariaLive}
      aria-atomic={ariaLive === 'polite' ? 'false' : undefined}
      tabIndex={0}
    >
      {visible.map((line, i) => {
        const isTyping = typing && typing.id === line.id;
        const last = i === visible.length - 1;
        return (
          <React.Fragment key={line.id || i}>
            <Line line={line} ps1={ps1} typingRef={isTyping ? cmdRef : undefined} />
            {cursor && last ? (
              <span className="uvd-cursor motion-safe:animate-pulse" aria-hidden="true">▌</span>
            ) : null}
            {'\n'}
          </React.Fragment>
        );
      })}
      {cursor && visible.length === 0 ? (
        <span className="uvd-line uvd-line--prompt">
          <span className="uvd-ps1" aria-hidden="true">{ps1} </span>
          <span className="uvd-cursor motion-safe:animate-pulse" aria-hidden="true">▌</span>
        </span>
      ) : null}
      {children}
    </pre>
  );
}
