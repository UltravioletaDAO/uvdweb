// Proveedor del estado del escritorio (contrato C8). Expone { state, actions } por contexto;
// detecta viewport (móvil <768, tablet 768–1023) y prefers-reduced-motion, y limpia sus listeners.
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { DESKTOPS, desktopIndex } from '../desktops';
import { sizeFor } from '../windows/registry';
import { DeskContext, MOBILE_MAX, TABLET_MAX, coarseEqual, createInitialState, deskReducer, nextWindowId } from './useDesk';

export { DeskContext };

const MQ_MOBILE = `(max-width: ${MOBILE_MAX}px)`;
const MQ_TABLET = `(min-width: ${MOBILE_MAX + 1}px) and (max-width: ${TABLET_MAX}px)`;
const MQ_MOTION = '(prefers-reduced-motion: reduce)';

function readEnv() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { isMobile: false, isTablet: false, reducedMotion: false };
  }
  return {
    isMobile: window.matchMedia(MQ_MOBILE).matches,
    isTablet: window.matchMedia(MQ_TABLET).matches,
    reducedMotion: window.matchMedia(MQ_MOTION).matches,
  };
}

export function DeskProvider({ children }) {
  const [state, dispatch] = useReducer(deskReducer, undefined, () => createInitialState({ sizeFor, env: readEnv() }));
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const lists = [MQ_MOBILE, MQ_TABLET, MQ_MOTION].map((q) => window.matchMedia(q));
    const update = () => dispatch({ type: 'env', env: readEnv() });
    lists.forEach((mq) => {
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', update);
      else if (typeof mq.addListener === 'function') mq.addListener(update);
    });
    update();
    return () => {
      lists.forEach((mq) => {
        if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', update);
        else if (typeof mq.removeListener === 'function') mq.removeListener(update);
      });
    };
  }, []);

  const open = useCallback((kind, params, opts = {}) => {
    const desktop = opts.desktop !== undefined ? desktopIndex(opts.desktop) : undefined;
    const current = stateRef.current;
    const target = desktop !== undefined && desktop >= 0 ? desktop : current.desktop;
    const existing = current.windows.find(
      (w) => w.desktop === target && w.kind === kind && JSON.stringify(w.params || null) === JSON.stringify(params || null)
    );
    const id = existing ? existing.id : nextWindowId(kind);
    dispatch({ type: 'open', id, kind, params: params || null, desktop: target, size: sizeFor(kind), pos: opts.pos });
    return id;
  }, []);

  const actions = useMemo(
    () => ({
      open,
      focus: (id) => dispatch({ type: 'focus', id }),
      minimize: (id) => dispatch({ type: 'minimize', id }),
      maximize: (id, value) => dispatch({ type: 'maximize', id, value }),
      restoreAll: () => dispatch({ type: 'restore_all' }),
      close: (id) => dispatch({ type: 'close', id }),
      move: (id, { x, y }) => dispatch({ type: 'move', id, x, y }),
      resize: (id, { w, h }) => dispatch({ type: 'resize', id, w, h }),
      setDesktop: (ref) => dispatch({ type: 'desktop', desktop: ref }),
      nextDesktop: () => dispatch({ type: 'desktop', desktop: (stateRef.current.desktop + 1) % DESKTOPS.length }),
      prevDesktop: () => dispatch({ type: 'desktop', desktop: (stateRef.current.desktop - 1 + DESKTOPS.length) % DESKTOPS.length }),
      setMode: (mode) => dispatch({ type: 'mode', mode }),
      highlightNode: (nodeId) => dispatch({ type: 'highlight', nodeId }),
      focusNode: (nodeId) => dispatch({ type: 'focus_node', nodeId }),
      /** Lectura síncrona del último estado (para handlers del bus). */
      getState: () => stateRef.current,
    }),
    [open]
  );

  // Store externo para useDeskSelector/useDeskState: notifica tras cada commit del reducer.
  const listeners = useRef(new Set());
  useLayoutEffect(() => {
    listeners.current.forEach((l) => l());
  }, [state]);
  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);
  const getState = useCallback(() => stateRef.current, []);

  // La identidad del contexto solo cambia con el estado grueso (ver COARSE_KEYS en useDesk.js).
  const coarseRef = useRef(state);
  if (!coarseEqual(coarseRef.current, state)) coarseRef.current = state;
  const coarse = coarseRef.current;
  const value = useMemo(() => ({ coarse, actions, getState, subscribe }), [coarse, actions, getState, subscribe]);
  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export default DeskProvider;
