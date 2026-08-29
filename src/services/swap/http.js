// fetch con timeout + cancelación componible. Sin dependencias externas.
// Devuelve un resultado discriminado; solo relanza si el LLAMADOR canceló.

/**
 * Compone la señal del llamador con un timeout propio.
 * No uso AbortSignal.any(): no existe en los navegadores del browserslist de producción.
 */
function linkAbort(outerSignal, timeoutMs) {
  const controller = new AbortController();
  const state = { timedOut: false };
  const timer = setTimeout(() => {
    state.timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onOuterAbort = () => controller.abort();
  if (outerSignal) {
    if (outerSignal.aborted) controller.abort();
    else outerSignal.addEventListener('abort', onOuterAbort);
  }
  const cleanup = () => {
    clearTimeout(timer);
    if (outerSignal) outerSignal.removeEventListener('abort', onOuterAbort);
  };
  return { signal: controller.signal, state, cleanup };
}

async function readBody(response) {
  const text = await response.text().catch(() => '');
  if (!text) return { data: null, text: '' };
  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: null, text };
  }
}

/**
 * @returns {Promise<
 *   { ok:true, status:number, data:any } |
 *   { ok:false, kind:'http'|'timeout'|'network', status:number|null, data:any, message:string }
 * >}
 * @throws {DOMException} AbortError SOLO si el `signal` del llamador abortó.
 */
export async function fetchJson(url, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    signal: outerSignal,
    timeoutMs = 8000,
    fetchImpl,
  } = options;

  const doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!doFetch) {
    return { ok: false, kind: 'network', status: null, data: null, message: 'fetch unavailable' };
  }

  const { signal, state, cleanup } = linkAbort(outerSignal, timeoutMs);
  try {
    const response = await doFetch(url, {
      method,
      headers:
        body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    const { data, text } = await readBody(response);
    if (!response.ok) {
      return {
        ok: false,
        kind: 'http',
        status: response.status,
        data,
        message: data?.message || data?.error || text.slice(0, 200) || `HTTP ${response.status}`,
      };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    // El llamador canceló (quote viejo descartado): se relanza, no es un fallo del provider.
    if (outerSignal?.aborted) throw error;
    if (state.timedOut) {
      return {
        ok: false,
        kind: 'timeout',
        status: null,
        data: null,
        message: `timeout after ${timeoutMs}ms`,
      };
    }
    return {
      ok: false,
      kind: 'network',
      status: null,
      data: null,
      message: String(error?.message || error),
    };
  } finally {
    cleanup();
  }
}
