// Escritorio Compiz de /ecosystem: anillo de 6 escritorios, ventanas de vidrio, exposé, lista,
// dock, atajos de teclado y el bus de eventos que usan las tools WebMCP (EV.OPEN / FOCUS / MODE).
// [data-desk] mide 100svh − 44 px (el panel); [data-desktop-active] y [data-mode] reflejan el estado.
import React, { Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DESKTOPS, desktopForKind, desktopForNode, desktopIndex } from '../desktops';
import { WINDOW_KINDS, Wallpaper, WindowHost } from '../windows/registry';
import { EV, emit, on, setDeskMounted } from '../../../services/ecosystem/bus';
import { MODES, cycleFocusId, useDeskActions, useDeskLayoutState, visibleWindows } from './useDesk';
import { DeskAreaContext } from './TermWindow';
import Ring from './Ring';
import Dock from './Dock';
import MobileDesk from './MobileDesk';
import ShortcutsHelp from './ShortcutsHelp';

const PANEL_H = 44;
const EXPOSE_GAP = 16;

// Kinds válidos para EV.OPEN: los del registro + los declarados en DESKTOPS + node (tarjeta de nodo).
const KNOWN_KINDS = new Set([...WINDOW_KINDS, ...DESKTOPS.flatMap((d) => d.windows.map((w) => w.kind)), 'node']);

const isEditable = (el) => {
  if (!el || typeof el.closest !== 'function') return false;
  return Boolean(el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
};

function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', read);
      return () => window.removeEventListener('resize', read);
    }
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** Rects de exposé: grilla cuadrada con separación fija dentro del área del escritorio. */
function exposeSlots(windows, size) {
  const n = windows.length;
  if (!n || !size.w || !size.h) return null;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cellW = Math.floor((size.w - EXPOSE_GAP * (cols + 1)) / cols);
  const cellH = Math.floor((size.h - 56 - EXPOSE_GAP * (rows + 1)) / rows);
  const slots = {};
  windows.forEach((w, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    slots[w.id] = { x: EXPOSE_GAP + c * (cellW + EXPOSE_GAP), y: EXPOSE_GAP + r * (cellH + EXPOSE_GAP), w: cellW, h: cellH };
  });
  return slots;
}

export default function Desktop({ helpOpen = false, onHelpChange }) {
  const { t } = useTranslation();
  const state = useDeskLayoutState();
  const actions = useDeskActions();
  const deskRef = useRef(null);
  const size = useSize(deskRef);
  const [rotating, setRotating] = useState(false);
  const small = state.isMobile || state.isTablet;
  const active = DESKTOPS[state.desktop] || DESKTOPS[0];

  const setHelp = useCallback((v) => { if (typeof onHelpChange === 'function') onHelpChange(v); }, [onHelpChange]);

  // Montaje: el bus sabe que el escritorio existe (tools WebMCP esperan READY).
  useEffect(() => {
    setDeskMounted(true);
    emit(EV.READY, { at: new Date().toISOString() });
    return () => setDeskMounted(false);
  }, []);

  // Bus de eventos (síncrono): detail.result se escribe durante el dispatch.
  useEffect(() => {
    const offOpen = on(EV.OPEN, (detail) => {
      const kind = detail.kind;
      if (!KNOWN_KINDS.has(kind)) {
        detail.result = { ok: false, error: 'unknown_window', allowed: Array.from(KNOWN_KINDS) };
        return;
      }
      const st = actions.getState();
      let idx = st.desktop;
      if (detail.desktop !== undefined && detail.desktop !== null) {
        const di = desktopIndex(detail.desktop);
        if (di >= 0) idx = di;
      } else if (!DESKTOPS[idx].windows.some((w) => w.kind === kind)) {
        const d = desktopForKind(kind);
        if (d) idx = desktopIndex(d.id);
      }
      if (idx !== st.desktop) actions.setDesktop(idx);
      if (st.mode !== 'desk') actions.setMode('desk');
      const id = actions.open(kind, detail.params || null, { desktop: idx });
      detail.result = { ok: true, windowId: id, desktop: DESKTOPS[idx].id };
    });
    const offFocus = on(EV.FOCUS, (detail) => {
      const nodeId = detail.nodeId;
      if (!nodeId) {
        detail.result = { ok: false, error: 'missing_node' };
        return;
      }
      const d = desktopForNode(nodeId);
      const idx = d ? desktopIndex(d.id) : 0;
      const st = actions.getState();
      if (idx !== st.desktop) actions.setDesktop(idx);
      if (st.mode !== 'desk') actions.setMode('desk');
      actions.focusNode(nodeId);
      actions.highlightNode(nodeId);
      const id = actions.open('node', { nodeId }, { desktop: idx });
      detail.result = { ok: true, desktop: DESKTOPS[idx].id, windowId: id };
    });
    const offMode = on(EV.MODE, (detail) => {
      const mode = detail.mode;
      if (!MODES.includes(mode)) {
        detail.result = { ok: false, error: 'unknown_mode', allowed: MODES };
        return;
      }
      actions.setMode(mode);
      detail.result = { ok: true, mode };
    });
    return () => {
      offOpen();
      offFocus();
      offMode();
    };
  }, [actions]);

  // Atajos de teclado (binding real de Compiz para el anillo: Ctrl+Alt+←/→).
  useEffect(() => {
    if (small) return undefined;
    const onKey = (e) => {
      if (isEditable(e.target)) return;
      const st = actions.getState();
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault();
        const next = cycleFocusId(st, e.shiftKey ? -1 : 1);
        if (next) actions.focus(next);
        return;
      }
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.ctrlKey && e.altKey) {
        e.preventDefault();
        if (e.key === 'ArrowRight') actions.nextDesktop();
        else actions.prevDesktop();
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        actions.setMode(st.mode === 'expose' ? 'desk' : 'expose');
        return;
      }
      if (e.key === 'Escape') {
        if (helpOpen) return; // lo cierra el diálogo
        if (st.mode !== 'desk') {
          actions.setMode('desk');
          return;
        }
        if (st.windows.some((w) => w.maximized)) actions.restoreAll();
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setHelp(!helpOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions, small, helpOpen, setHelp]);

  const visible = useMemo(() => visibleWindows(state), [state]);
  const slots = useMemo(() => (state.mode === 'expose' ? exposeSlots(visible, size) : null), [state.mode, visible, size]);
  const area = useMemo(() => ({ deskRef, slots, size }), [slots, size]);

  const faces = useMemo(
    () =>
      DESKTOPS.map((d, i) => ({
        id: d.id,
        title: t(d.titleKey, d.id),
        summary: state.windows
          .filter((w) => w.desktop === i && !w.minimized)
          .map((w) => t(`ecosystem.windows.${w.kind}.title`, w.kind))
          .join(' · '),
      })),
    [state.windows, t]
  );

  // El giro del anillo es urgente; montar las ventanas de la cara nueva es diferido (React las
  // renderiza por rebanadas en vez de una sola tarea larga): mientras tanto la cara muestra su
  // placeholder, igual que las caras laterales.
  const deferredDesktop = useDeferredValue(state.desktop);

  // Cascada: las ventanas de la cara activa se montan de una en una (80 ms; 16 ms con
  // reduce-motion = sin cascada visible) → commits pequeños en vez de uno solo largo.
  const [revealed, setRevealed] = useState(0);
  const revealedFor = useRef(deferredDesktop);
  if (revealedFor.current !== deferredDesktop) {
    revealedFor.current = deferredDesktop;
    setRevealed(0);
  }
  const activeCount = useMemo(() => visibleWindows(state, deferredDesktop).length, [state, deferredDesktop]);
  useEffect(() => {
    if (revealed >= activeCount) return undefined;
    const timer = setTimeout(() => setRevealed((n) => n + 1), state.reducedMotion ? 16 : 80);
    return () => clearTimeout(timer);
  }, [revealed, activeCount, state.reducedMotion]);

  const renderFace = useCallback(
    (i) => {
      const desk = DESKTOPS[i];
      const label = t('ecosystem.a11y.desktop_region', { defaultValue: 'Escritorio {{name}}', name: t(desk.titleKey, desk.id) });
      if (i !== deferredDesktop) {
        const face = faces[i];
        return (
          <div className="uvd-face uvd-face--pending" data-desktop-face={desk.id} role="group" aria-label={label} aria-busy="true">
            <div className="uvd-ring__placeholder">
              <p className="uvd-ring__placeholder-title">{face.title}</p>
              <p className="uvd-ring__placeholder-list">{face.summary}</p>
            </div>
          </div>
        );
      }
      // Las ventanas ya reveladas se mantienen montadas; las nuevas (open por tool/dock) entran
      // cuando la cascada las alcanza (siempre por orden de z ascendente).
      const wins = visibleWindows(state, i).slice(0, Math.max(revealed, 0));
      return (
        <div className="uvd-face" data-desktop-face={desk.id} role="group" aria-label={label}>
          {i === 0 && Wallpaper ? (
            <Suspense fallback={null}>
              <Wallpaper />
            </Suspense>
          ) : null}
          {wins.map((w) => (
            <WindowHost key={w.id} win={w} focused={state.focusId === w.id} />
          ))}
        </div>
      );
    },
    [state, t, deferredDesktop, faces, revealed]
  );

  const listMode = state.mode === 'list' && !small;

  return (
    <DeskAreaContext.Provider value={area}>
      <div
        ref={deskRef}
        className={`uvd-desk ${small ? 'uvd-desk--small' : ''} ${listMode ? 'uvd-desk--list' : ''}`}
        data-desk=""
        data-desktop-active={active.id}
        data-mode={state.mode}
        data-rotating={rotating ? 'true' : 'false'}
        data-reduced-motion={state.reducedMotion ? 'true' : 'false'}
        style={small ? undefined : { height: `calc(100svh - ${PANEL_H}px)` }}
      >
        {small ? (
          <MobileDesk />
        ) : listMode ? (
          <div className="uvd-list" data-list-mode="">
            <h2 className="uvd-list__title">{t(active.titleKey, active.id)} · {t('ecosystem.mode.list', 'lista')}</h2>
            <ul className="uvd-list__items">
              {state.windows
                .filter((w) => w.desktop === state.desktop)
                .map((w) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      className="uvd-list__btn"
                      onClick={() => {
                        actions.setMode('desk');
                        actions.focus(w.id);
                      }}
                    >
                      <span aria-hidden="true">{w.minimized ? '○' : '●'}</span> {t(`ecosystem.windows.${w.kind}.title`, w.kind)}
                      {w.params && w.params.channel ? ` #${w.params.channel}` : ''}
                      {w.params && w.params.key ? ` · ${w.params.key}` : ''}
                      {w.params && w.params.snippet ? ` · ${w.params.snippet}` : ''}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <Ring
            active={state.desktop}
            faces={faces}
            renderFace={renderFace}
            reducedMotion={state.reducedMotion}
            onRotateStart={() => setRotating(true)}
            onRotateEnd={() => setRotating(false)}
          />
        )}
        {!small ? <Dock /> : null}
        {helpOpen ? <ShortcutsHelp onClose={() => setHelp(false)} /> : null}
      </div>
    </DeskAreaContext.Provider>
  );
}
