// Ventana de terminal (contrato C10) con física "Compiz": arrastre desde la barra de título,
// wobble por velocidad (skew derivado de useVelocity, spring al soltar), foco por z-order,
// maximizar con doble click, vidrio solo si el reducer la incluye en glassIds (≤ 4 a la vez).
// Con prefers-reduced-motion: arrastre plano, sin skew ni escala. En móvil/tablet: bloque estático.
import React, { createContext, startTransition, useCallback, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { animate, motion, useDragControls, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useDeskActions, useDeskSelector } from './useDesk';
import SourceChip from './SourceChip';

/** Desktop provee { deskRef, slots, size } (slots = rects de exposé por id; size = {w,h} del área). */
export const DeskAreaContext = createContext({ deskRef: null, slots: null, size: null });

const SPRING = { type: 'spring', stiffness: 420, damping: 22 };
const SNAP = { type: 'spring', stiffness: 420, damping: 32 };

function IconBtn({ label, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      className={`uvd-wbtn ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {children}
    </button>
  );
}

function StaticWindow({ windowId, kind, title, titleId, sourceChip, actions, untrusted, children, className }) {
  const { t } = useTranslation();
  return (
    <section
      className={`uvd-term uvd-term--solid uvd-term--static ${className}`}
      aria-labelledby={titleId}
      data-window={windowId}
      data-kind={kind}
      data-focused="false"
      data-glass="false"
      data-static=""
    >
      <div className="uvd-term__bar uvd-term__bar--static">
        <span id={titleId} className="uvd-term__title" data-window-title="">{title}</span>
        {untrusted ? <span className="uvd-chip uvd-chip--off">{t('ecosystem.window.untrusted', 'contenido de terceros')}</span> : null}
        {sourceChip ? <SourceChip {...sourceChip} /> : null}
        {Array.isArray(actions) && actions.length ? (
          <span className="uvd-term__actions">
            {actions.map((a, i) => (
              <IconBtn key={i} label={a.label} onClick={a.onClick}>{a.icon || a.label}</IconBtn>
            ))}
          </span>
        ) : null}
      </div>
      <div className="uvd-term__body">{children}</div>
    </section>
  );
}

export default function TermWindow({ windowId, title, sourceChip, actions, untrusted = false, children, className = '' }) {
  const { t } = useTranslation();
  const desk = useDeskActions();
  const { deskRef, slots, size } = useContext(DeskAreaContext);
  // Recorte propio: esta ventana solo se re-renderiza cuando cambia SU registro, su foco, su vidrio,
  // el modo o el viewport (no cuando otra ventana se mueve o se enfoca).
  const state = useDeskSelector((s) => ({
    win: s.windows.find((w) => w.id === windowId) || null,
    focusId: s.focusId === windowId ? windowId : null,
    glass: s.glassIds.has(windowId),
    mode: s.mode,
    reducedMotion: s.reducedMotion,
    isMobile: s.isMobile,
    isTablet: s.isTablet,
  }));
  const win = state.win;
  const kind = win ? win.kind : 'unknown';
  const titleId = `${useId()}-title`;

  if (state.isMobile || state.isTablet) {
    return (
      <StaticWindow windowId={windowId} kind={kind} title={title} titleId={titleId} sourceChip={sourceChip} actions={actions} untrusted={untrusted} className={className}>
        {children}
      </StaticWindow>
    );
  }
  return (
    <FloatingWindow
      windowId={windowId}
      win={win}
      kind={kind}
      title={title}
      titleId={titleId}
      sourceChip={sourceChip}
      actions={actions}
      untrusted={untrusted}
      className={className}
      t={t}
      state={state}
      desk={desk}
      deskRef={deskRef}
      slots={slots}
      size={size}
    >
      {children}
    </FloatingWindow>
  );
}

function FloatingWindow({ windowId, win, kind, title, titleId, sourceChip, actions, untrusted, className, t, state, desk, deskRef, slots, size, children }) {
  const reduced = state.reducedMotion;
  const focused = state.focusId === windowId;
  const glass = state.glass;
  const expose = state.mode === 'expose';
  const slot = expose && slots ? slots[windowId] : null;
  const maximized = Boolean(win && win.maximized) && !expose;

  const x = useMotionValue(win ? win.x : 0);
  const y = useMotionValue(win ? win.y : 0);
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  // wobble = 1 mientras la ventana se mueve (arrastre o animación programática) y decae a 0 al
  // soltar: el skew sale de la velocidad × wobble, así el rebote de framer contra los bordes o
  // una corrección sub-píxel no dejan un wobble fantasma después de soltar.
  const wobble = useMotionValue(0);
  const skewXRaw = useTransform([vx, wobble], ([v, f]) => Math.max(-6, Math.min(6, v / 200)) * f);
  const skewYRaw = useTransform([vy, wobble], ([v, f]) => Math.max(-4, Math.min(4, v / 300)) * f);
  const skewX = useSpring(skewXRaw, SPRING);
  const skewY = useSpring(skewYRaw, SPRING);
  const controls = useDragControls();
  // El estado de arrastre vive en un ref + clase DOM (sin re-render de React por frame).
  const draggingRef = useRef(false);
  const sectionRef = useRef(null);

  // Límites numéricos en el espacio de x/y (la ventana vive en left:0/top:0 y se posiciona por
  // transform): deterministas y sin medir el DOM. Con dragConstraints={ref}, framer medía la caja
  // ya transformada y sesgada y "devolvía" la ventana a un borde inexistente.
  const constraints = useMemo(() => {
    if (!win || !size || !size.w || !size.h) return null;
    return { left: 0, top: 0, right: Math.max(0, size.w - win.w), bottom: Math.max(0, size.h - win.h) };
  }, [win, size]);

  // Posición programática (exposé, maximizar, tools): animar hacia el destino del estado.
  useEffect(() => {
    if (!win || draggingRef.current) return undefined;
    const tx = slot ? slot.x : maximized ? 0 : win.x;
    const ty = slot ? slot.y : maximized ? 0 : win.y;
    const dx = Math.abs(x.get() - tx);
    const dy = Math.abs(y.get() - ty);
    if (dx < 0.5 && dy < 0.5) return undefined;
    if (reduced || (dx < 2 && dy < 2)) {
      // jump(): sin velocidad (set() registraría un salto instantáneo → useVelocity → skew).
      if (typeof x.jump === 'function') {
        x.jump(tx);
        y.jump(ty);
      } else {
        x.set(tx);
        y.set(ty);
      }
      return undefined;
    }
    wobble.set(1);
    const ax = animate(x, tx, SNAP);
    const ay = animate(y, ty, SNAP);
    let settle = null;
    let done = false;
    Promise.all([ax, ay]).then(() => {
      done = true;
      settle = animate(wobble, 0, { duration: 0.2 });
    });
    return () => {
      // Solo esta animación limpia su wobble; si la interrumpe un arrastre, el arrastre manda.
      ax.stop();
      ay.stop();
      if (settle) settle.stop();
      if (!done && !draggingRef.current) wobble.set(0);
    };
  }, [win, slot, maximized, reduced, x, y, wobble]);

  // Foco de teclado sigue al foco lógico (Ctrl+`), sin robarlo si ya estamos dentro.
  useEffect(() => {
    if (!focused) return;
    const el = sectionRef.current;
    if (el && typeof document !== 'undefined' && !el.contains(document.activeElement)) {
      el.focus({ preventScroll: true });
    }
  }, [focused]);

  // Enfocar (z-order) es una transición: React puede rebanar el re-render de las demás
  // ventanas en vez de bloquear el primer frame del arrastre.
  const onPointerDownAnywhere = useCallback(() => {
    if (!focused) startTransition(() => desk.focus(windowId));
  }, [focused, desk, windowId]);

  const startDrag = useCallback(
    (e) => {
      if (expose || maximized) return;
      if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea')) return;
      controls.start(e);
    },
    [controls, expose, maximized]
  );

  const onDragStart = useCallback(() => {
    draggingRef.current = true;
    wobble.set(1);
    const el = sectionRef.current;
    if (el) {
      el.classList.add('is-dragging');
      el.setAttribute('data-dragging', 'true');
    }
  }, [wobble]);

  const onDragEnd = useCallback(() => {
    draggingRef.current = false;
    const el = sectionRef.current;
    if (el) {
      el.classList.remove('is-dragging');
      el.setAttribute('data-dragging', 'false');
    }
    animate(wobble, 0, { duration: 0.25 });
    // Recortar al área del escritorio: así el rebote elástico de framer y el estado coinciden.
    let nx = x.get();
    let ny = y.get();
    if (constraints) {
      nx = Math.min(Math.max(constraints.left, nx), constraints.right);
      ny = Math.min(Math.max(constraints.top, ny), constraints.bottom);
    }
    desk.move(windowId, { x: nx, y: ny });
  }, [desk, windowId, x, y, wobble, constraints]);

  const onClickWindow = useCallback(() => {
    if (expose) {
      desk.setMode('desk');
      desk.focus(windowId);
    }
  }, [expose, desk, windowId]);

  if (!win) return null;

  const width = slot ? slot.w : maximized ? '100%' : win.w;
  const height = slot ? slot.h : maximized ? '100%' : win.h;
  const style = reduced ? { x, y, zIndex: win.z, width, height } : { x, y, skewX, skewY, zIndex: win.z, width, height };

  return (
    <motion.section
      ref={sectionRef}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
      drag={!expose && !maximized}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={constraints || deskRef || undefined}
      whileDrag={reduced ? undefined : { scale: 1.02 }}
      transition={reduced ? { duration: 0 } : SPRING}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onPointerDown={onPointerDownAnywhere}
      onClick={onClickWindow}
      style={style}
      className={[
        'uvd-term',
        glass ? 'uvd-term--glass' : 'uvd-term--solid',
        focused ? 'is-focused' : '',
        maximized ? 'is-maximized' : '',
        expose ? 'is-expose' : '',
        className,
      ].join(' ')}
      data-window={windowId}
      data-kind={kind}
      data-focused={focused ? 'true' : 'false'}
      data-glass={glass ? 'true' : 'false'}
      data-dragging="false"
    >
      <div
        className="uvd-term__bar"
        data-focused={focused ? 'true' : 'false'}
        data-window-title={title}
        onPointerDown={startDrag}
        onDoubleClick={() => desk.maximize(windowId)}
        role="presentation"
        aria-label={t('ecosystem.window.drag_handle_aria', { defaultValue: 'Mover la ventana {{title}} (arrastrar)', title })}
      >
        <span className="uvd-term__dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span id={titleId} className="uvd-term__title">{title}</span>
        {untrusted ? <span className="uvd-chip uvd-chip--off">{t('ecosystem.window.untrusted', 'contenido de terceros')}</span> : null}
        {sourceChip ? <SourceChip {...sourceChip} /> : null}
        <span className="uvd-term__actions">
          {Array.isArray(actions)
            ? actions.map((a, i) => (
                <IconBtn key={i} label={a.label} onClick={a.onClick}>{a.icon || a.label}</IconBtn>
              ))
            : null}
          <IconBtn label={t('ecosystem.window.minimize', 'Minimizar')} onClick={() => desk.minimize(windowId)}>–</IconBtn>
          <IconBtn label={maximized ? t('ecosystem.window.restore', 'Restaurar') : t('ecosystem.window.maximize', 'Maximizar')} onClick={() => desk.maximize(windowId)}>
            {maximized ? '❐' : '☐'}
          </IconBtn>
          <IconBtn label={t('ecosystem.window.close', 'Cerrar')} onClick={() => desk.close(windowId)} className="uvd-wbtn--close">×</IconBtn>
        </span>
      </div>
      <div className="uvd-term__body" data-expose={expose ? 'true' : 'false'}>{children}</div>
    </motion.section>
  );
}
