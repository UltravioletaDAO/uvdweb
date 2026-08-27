// Bus de eventos del escritorio /ecosystem (contrato C7, wave3/ECOSYSTEM_PLAN.md).
// Lo usan las tools WebMCP (src/agent/ecosystemTools.js), el REPL de agent@uvd y el
// propio Desktop. Todo es síncrono: el handler escribe detail.result durante el
// dispatch y emit() lo devuelve. Sin dependencias, sin estado global aparte del flag
// de montaje del escritorio.

export const EV = {
  FOCUS: 'uvd:ecosystem-focus', // detail { nodeId }                           → result { ok, desktop }
  OPEN: 'uvd:ecosystem-open', // detail { kind, desktop?, params?, connect? } → result { ok, windowId, desktop }
  MODE: 'uvd:ecosystem-mode', // detail { mode:'desk'|'expose'|'list' }      → result { ok, mode }
  PULSE: 'uvd:ecosystem-pulse', // detail { pulse } (fan-out, sin result)
  TRACE: 'uvd:agent-tool', // detail { name, args, result, at, origin:'agent'|'repl' }
  READY: 'uvd:ecosystem-ready', // Desktop montado
};

const hasWindow = () => typeof window !== 'undefined' && typeof window.dispatchEvent === 'function';

/** Dispara el evento de forma síncrona y devuelve detail.result (o null). */
export function emit(name, detail = {}) {
  if (!hasWindow()) return null;
  const payload = detail && typeof detail === 'object' ? detail : {};
  window.dispatchEvent(new CustomEvent(name, { detail: payload }));
  return payload.result === undefined ? null : payload.result;
}

/** Suscribe un handler(detail, event) y devuelve la función para desuscribir. */
export function on(name, handler) {
  if (!hasWindow() || typeof handler !== 'function') return () => {};
  const listener = (event) => handler(event.detail || {}, event);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}

let deskMounted = false;

export function setDeskMounted(value) {
  deskMounted = Boolean(value);
}

export function isDeskMounted() {
  return deskMounted;
}

/** Resuelve true cuando el Desktop está montado (o ya lo estaba); false al vencer ms. */
export function waitForDesk(ms = 5000) {
  if (deskMounted) return Promise.resolve(true);
  if (!hasWindow()) return Promise.resolve(false);
  return new Promise((resolve) => {
    let timer = null;
    const off = on(EV.READY, () => {
      clearTimeout(timer);
      off();
      resolve(true);
    });
    timer = setTimeout(() => {
      off();
      resolve(deskMounted);
    }, ms);
  });
}
