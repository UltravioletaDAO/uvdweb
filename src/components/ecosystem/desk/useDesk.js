// Estado del escritorio /ecosystem (contrato C8): un solo reducer es la fuente de verdad.
// Scroll, click, dock, teclado y tools WebMCP pasan por `actions`; nadie muta ventanas a mano.
import { createContext, useContext, useRef, useSyncExternalStore } from 'react';
import { DESKTOPS, desktopIndex } from '../desktops';

export const DeskContext = createContext(null);

export const MODES = ['desk', 'expose', 'list'];
export const MAX_GLASS = 4;
export const MOBILE_MAX = 767;
export const TABLET_MAX = 1023;
export const DEFAULT_SIZE = { w: 560, h: 360 };
const CASCADE = 36;

let seq = 0;
export const nextWindowId = (kind) => {
  seq += 1;
  return `${kind}-${seq}`;
};

const sameParams = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);

/** Ventanas visibles (no minimizadas) de un escritorio, ordenadas por z ascendente. */
export function visibleWindows(state, desktop = state.desktop) {
  return state.windows.filter((w) => w.desktop === desktop && !w.minimized).sort((a, b) => a.z - b.z);
}

/** Las ≤4 ventanas con vidrio: las de mayor z del escritorio activo. */
function computeGlass(windows, desktop) {
  const top = windows
    .filter((w) => w.desktop === desktop && !w.minimized)
    .sort((a, b) => b.z - a.z)
    .slice(0, MAX_GLASS)
    .map((w) => w.id);
  return new Set(top);
}

function topFocus(windows, desktop) {
  const vis = windows.filter((w) => w.desktop === desktop && !w.minimized);
  if (!vis.length) return null;
  return vis.reduce((a, b) => (b.z > a.z ? b : a)).id;
}

function withDerived(state, patch = {}) {
  const next = { ...state, ...patch };
  next.glassIds = computeGlass(next.windows, next.desktop);
  if (next.focusId && !next.windows.some((w) => w.id === next.focusId && !w.minimized && w.desktop === next.desktop)) {
    next.focusId = topFocus(next.windows, next.desktop);
  }
  if (!next.focusId) next.focusId = topFocus(next.windows, next.desktop);
  return next;
}

/** Área útil aproximada del escritorio (viewport − panel − header) para la disposición inicial. */
function deskArea() {
  if (typeof window === 'undefined') return { w: 1280, h: 720 };
  return { w: Math.max(640, window.innerWidth), h: Math.max(480, window.innerHeight - 44) };
}

/** Disposición inicial: dos columnas con cascada suave (las ventanas se ven, no se apilan). */
function initialPos(index, w, h) {
  const area = deskArea();
  const col = index % 2;
  const row = Math.floor(index / 2);
  const colW = Math.max(320, Math.floor(area.w / 2) - 12);
  const x = 24 + col * colW + row * CASCADE;
  const y = 24 + row * Math.max(120, Math.floor(area.h * 0.22)) + col * 40;
  return {
    x: Math.max(0, Math.min(x, area.w - w - 8)),
    y: Math.max(0, Math.min(y, Math.max(24, area.h - h - 8))),
  };
}

function makeWindow({ id, kind, params, desktop, size, index, pos }) {
  const w = size && size.w ? size.w : DEFAULT_SIZE.w;
  const h = size && size.h ? size.h : DEFAULT_SIZE.h;
  const auto = initialPos(index, w, h);
  // Un pos declarado en DESKTOPS también se recorta al área (en 1024×768 un x pensado para 1280
  // dejaría la ventana cortada por el overflow del desk).
  const area = deskArea();
  const x = pos && Number.isFinite(pos.x) ? Math.max(0, Math.min(pos.x, area.w - w - 8)) : auto.x;
  const y = pos && Number.isFinite(pos.y) ? Math.max(0, Math.min(pos.y, Math.max(24, area.h - h - 8))) : auto.y;
  return { id, kind, params: params || null, desktop, x, y, w, h, z: 0, minimized: false, maximized: false };
}

/**
 * Estado inicial: todas las ventanas declaradas en DESKTOPS; las `open:false` nacen minimizadas
 * (viven en el dock). `sizeFor(kind)` viene del registro de ventanas (meta.defaultSize).
 */
export function createInitialState({ sizeFor, env } = {}) {
  const windows = [];
  let z = 1;
  DESKTOPS.forEach((desk, di) => {
    let openIndex = 0;
    desk.windows.forEach((decl) => {
      const win = makeWindow({
        id: nextWindowId(decl.kind),
        kind: decl.kind,
        params: decl.params,
        desktop: di,
        size: sizeFor ? sizeFor(decl.kind) : null,
        index: decl.open ? openIndex : 0,
        pos: decl.pos,
      });
      if (decl.open) {
        win.z = z;
        z += 1;
        openIndex += 1;
      } else {
        win.minimized = true;
      }
      windows.push(win);
    });
  });
  const base = {
    desktop: 0,
    windows,
    focusId: null,
    zTop: z,
    mode: 'desk',
    highlightNode: null,
    focusNode: null,
    isMobile: false,
    isTablet: false,
    reducedMotion: false,
    glassIds: new Set(),
    ...(env || {}),
  };
  return withDerived(base);
}

export function deskReducer(state, action) {
  switch (action.type) {
    case 'env':
      return { ...state, ...action.env };

    case 'open': {
      const desktop = Number.isFinite(action.desktop) ? action.desktop : state.desktop;
      const existing = state.windows.find(
        (w) => w.desktop === desktop && w.kind === action.kind && sameParams(w.params, action.params)
      );
      const zTop = state.zTop + 1;
      if (existing) {
        const windows = state.windows.map((w) =>
          w.id === existing.id ? { ...w, minimized: false, z: zTop, params: action.params || w.params } : w
        );
        return withDerived(state, { windows, zTop, desktop, focusId: existing.id, openedId: existing.id });
      }
      const count = state.windows.filter((w) => w.desktop === desktop && !w.minimized).length;
      const win = makeWindow({
        id: action.id,
        kind: action.kind,
        params: action.params,
        desktop,
        size: action.size,
        index: count,
        pos: action.pos,
      });
      win.z = zTop;
      return withDerived(state, { windows: [...state.windows, win], zTop, desktop, focusId: win.id, openedId: win.id });
    }

    case 'focus': {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const zTop = state.zTop + 1;
      const windows = state.windows.map((w) => (w.id === action.id ? { ...w, z: zTop, minimized: false } : w));
      return withDerived(state, { windows, zTop, desktop: target.desktop, focusId: action.id });
    }

    case 'minimize': {
      const windows = state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true, maximized: false } : w));
      return withDerived(state, { windows, focusId: state.focusId === action.id ? null : state.focusId });
    }

    case 'maximize': {
      const zTop = state.zTop + 1;
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, maximized: action.value === undefined ? !w.maximized : Boolean(action.value), minimized: false, z: zTop } : w
      );
      return withDerived(state, { windows, zTop, focusId: action.id });
    }

    case 'restore_all': {
      const windows = state.windows.map((w) => (w.maximized ? { ...w, maximized: false } : w));
      return withDerived(state, { windows });
    }

    case 'close': {
      const windows = state.windows.filter((w) => w.id !== action.id);
      return withDerived(state, { windows, focusId: state.focusId === action.id ? null : state.focusId });
    }

    case 'move': {
      // Sin redondear: la posición viene del motion value del arrastre y debe coincidir exactamente
      // (una corrección sub-píxel al soltar generaba velocidad → skew fantasma).
      const windows = state.windows.map((w) => (w.id === action.id ? { ...w, x: action.x, y: action.y } : w));
      return { ...state, windows };
    }

    case 'resize': {
      const windows = state.windows.map((w) =>
        w.id === action.id ? { ...w, w: Math.max(240, Math.round(action.w)), h: Math.max(160, Math.round(action.h)) } : w
      );
      return { ...state, windows };
    }

    case 'desktop': {
      const idx = desktopIndex(action.desktop);
      if (idx < 0 || idx === state.desktop) return state;
      return withDerived(state, { desktop: idx, focusId: null });
    }

    case 'mode': {
      if (!MODES.includes(action.mode)) return state;
      return { ...state, mode: action.mode };
    }

    case 'highlight':
      return { ...state, highlightNode: action.nodeId || null };

    case 'focus_node':
      return { ...state, focusNode: action.nodeId || null, highlightNode: action.nodeId || null };

    default:
      return state;
  }
}

/** Siguiente/anterior ventana visible por z (para Ctrl+`). */
export function cycleFocusId(state, dir = 1) {
  const vis = visibleWindows(state);
  if (!vis.length) return null;
  const idx = vis.findIndex((w) => w.id === state.focusId);
  const next = idx < 0 ? vis.length - 1 : (idx + dir + vis.length) % vis.length;
  return vis[next].id;
}

// ---------- Suscripción ----------
// El contexto cambia de identidad SOLO cuando cambia el estado "grueso" (escritorio, modo, nodo
// resaltado/enfocado, viewport, reduce-motion). Las ventanas se suscriben a su propio recorte
// con useDeskSelector (useSyncExternalStore): enfocar o mover una ventana no re-renderiza a las
// demás ni a las terminales pesadas (braille, IRC) que solo leen isMobile/focusNode.

export const COARSE_KEYS = ['desktop', 'mode', 'highlightNode', 'focusNode', 'isMobile', 'isTablet', 'reducedMotion'];

export function coarseEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return COARSE_KEYS.every((k) => a[k] === b[k]);
}

export function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.is(a[k], b[k]));
}

function useCtx() {
  const ctx = useContext(DeskContext);
  if (!ctx) {
    throw new Error('useDesk() debe usarse dentro de <DeskProvider>');
  }
  return ctx;
}

/**
 * { state, actions } del escritorio (contrato C8). `state` es siempre el estado completo y actual;
 * el componente se re-renderiza cuando cambia el estado grueso (COARSE_KEYS). Quien necesite
 * reaccionar a windows/focusId/glassIds usa useDeskState() o useDeskSelector().
 */
export function useDesk() {
  const ctx = useCtx();
  return { state: ctx.getState(), actions: ctx.actions };
}

/** Solo las acciones (identidad estable: nunca re-renderiza por estado). */
export function useDeskActions() {
  return useCtx().actions;
}

/** Recorte del estado; re-renderiza solo cuando el recorte cambia (isEqual, shallow por defecto). */
export function useDeskSelector(selector, isEqual = shallowEqual) {
  const ctx = useCtx();
  const cache = useRef(undefined);
  const getSnapshot = () => {
    const next = selector(ctx.getState());
    if (cache.current !== undefined && isEqual(cache.current, next)) return cache.current;
    cache.current = next;
    return next;
  };
  return useSyncExternalStore(ctx.subscribe, getSnapshot, getSnapshot);
}

/** Estado completo con re-render en cada cambio (MobileDesk). */
export function useDeskState() {
  const ctx = useCtx();
  return useSyncExternalStore(ctx.subscribe, ctx.getState, ctx.getState);
}

/** Firma de la disposición: todo menos x/y/w/h (que solo le importan a cada ventana). */
export function layoutSignature(s) {
  const wins = s.windows.map((w) => `${w.id}:${w.desktop}:${w.z}:${w.minimized ? 1 : 0}:${w.maximized ? 1 : 0}`).join('|');
  return `${s.desktop}|${s.mode}|${s.focusId}|${s.highlightNode}|${s.focusNode}|${s.isMobile}|${s.isTablet}|${s.reducedMotion}|${wins}`;
}

/**
 * Estado completo, pero SIN re-render cuando solo cambian posiciones/tamaños de ventanas
 * (Desktop y Dock no las usan: cada TermWindow lee las suyas del store). Mover una ventana
 * re-renderiza solo esa ventana.
 */
export function useDeskLayoutState() {
  return useDeskSelector((s) => s, (a, b) => layoutSignature(a) === layoutSignature(b));
}

export default useDesk;
