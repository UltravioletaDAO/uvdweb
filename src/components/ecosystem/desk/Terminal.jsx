// Terminal (contrato C10): <pre> con líneas en bloque. Líneas { id, kind:'prompt'|'out'|'err'|'note'|'segments',
// text | segments:[{text,fg,bg,bold}], at }. Typewriter motion-safe (12 ms/char) SOLO en líneas
// prompt: la salida aparece de golpe cuando el comando terminó de teclearse (como en una shell).
// CLS 0: TODAS las líneas se maquetan desde el primer render — el prompt en curso reserva su caja
// con el texto completo invisible (overlay tecleado encima, patrón de HomeTeaser) y las líneas
// posteriores se pintan con visibility:hidden; revelarlas no mueve nada (fix 4 de
// VERIFICATION_OLA3 §9). `minLines` reserva altura mínima (filas × line-height 1.5) para salidas
// que llegan por red. Nunca HTML: todo es texto plano; los códigos mIRC ya vienen como segmentos.
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

function Caret() {
  return (
    <span className="uvd-cursor motion-safe:animate-pulse" aria-hidden="true">▌</span>
  );
}

// hidden = reservada (aún no revelada por el typewriter): ocupa su espacio exacto sin pintarse.
function Line({ line, ps1, typingRef, hidden, caret }) {
  const kind = line.kind || 'out';
  const text = typeof line.text === 'string' ? line.text : '';
  const hiddenCls = hidden ? ' uvd-line--pending' : '';
  if (kind === 'prompt') {
    if (typingRef) {
      // El texto completo (invisible) reserva la caja; el tecleado se superpone con la MISMA
      // estructura y clases => mismo wrapping, altura fija durante todo el tecleo.
      return (
        <span className="uvd-line uvd-line--prompt uvd-line--typing" data-kind="prompt">
          <span className="uvd-line__sizer" aria-hidden="true">
            <span className="uvd-ps1">{ps1} </span>
            <span className="uvd-cmd">{text}</span>
          </span>
          <span className="uvd-line__type">
            <span className="uvd-ps1" aria-hidden="true">{ps1} </span>
            <span className="uvd-cmd" ref={typingRef} data-typing="" />
            {caret}
          </span>
        </span>
      );
    }
    return (
      <span className={`uvd-line uvd-line--prompt${hiddenCls}`} data-kind="prompt">
        <span className="uvd-ps1" aria-hidden="true">{ps1} </span>
        <span className="uvd-cmd">{text}</span>
        {caret}
      </span>
    );
  }
  if (kind === 'segments') {
    return (
      <span className={`uvd-line uvd-line--segments${hiddenCls}`} data-kind="segments">
        <Segments segments={Array.isArray(line.segments) ? line.segments : []} />
        {caret}
      </span>
    );
  }
  return (
    <span className={`uvd-line uvd-line--${kind}${hiddenCls}`} data-kind={kind}>
      {text}
      {caret}
    </span>
  );
}

export default function Terminal({
  lines = [],
  typewriter = false,
  cursor = false,
  ariaLive = 'off',
  maxLines = 200,
  minLines = 0,
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
  const [, setTyping] = useState(null);

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

  // Índice del prompt en curso (las líneas posteriores quedan reservadas, no ocultas del layout).
  const typingIdx = animate ? shown.findIndex((l) => l.kind === 'prompt' && !doneRef.current.has(l.id)) : -1;

  // Auto-scroll solo cuando llegan líneas nuevas tras el primer render (una sesión grabada
  // debe abrirse mostrando el comando, no el final de la salida).
  const preRef = useRef(null);
  const stickRef = useRef(true);
  const prevLenRef = useRef(-1);
  useLayoutEffect(() => {
    const el = preRef.current;
    const prevLen = prevLenRef.current;
    prevLenRef.current = shown.length;
    if (!el || prevLen < 0 || shown.length <= prevLen) return;
    if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [shown]);
  const onScroll = () => {
    const el = preRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  // El cursor vive en la línea que "escribe": el prompt en curso, o la última línea revelada.
  const caretIdx = cursor ? (typingIdx >= 0 ? typingIdx : shown.length - 1) : -1;

  return (
    <pre
      ref={preRef}
      onScroll={onScroll}
      className={`uvd-pre ${className}`}
      style={minLines > 0 ? { minHeight: `${minLines * 1.5}em` } : undefined}
      data-terminal=""
      aria-live={ariaLive}
      aria-atomic={ariaLive === 'polite' ? 'false' : undefined}
      tabIndex={0}
    >
      {shown.map((line, i) => (
        <Line
          key={line.id || i}
          line={line}
          ps1={ps1}
          typingRef={i === typingIdx ? cmdRef : undefined}
          hidden={typingIdx >= 0 && i > typingIdx}
          caret={i === caretIdx ? <Caret /> : null}
        />
      ))}
      {cursor && shown.length === 0 ? (
        <span className="uvd-line uvd-line--prompt">
          <span className="uvd-ps1" aria-hidden="true">{ps1} </span>
          <Caret />
        </span>
      ) : null}
      {children}
    </pre>
  );
}
