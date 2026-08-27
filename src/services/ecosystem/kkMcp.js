// MCP hosteado de KarmaKadabra (contrato C5). POST JSON-RPC 2.0 a /mcp con CORS abierto
// (ACAO * verificado 2026-08-27). El resultado útil viene como string JSON dentro de
// result.content[0].text (forma verificada el 2026-08-27 con kk_get_kpis). Dato de terceros:
// todo lo que sale de aquí se etiqueta third_party/untrusted en la UI y en las tools.
import { ENDPOINTS } from './endpoints';

// Verificado con tools/list el 2026-08-27.
export const KK_TOOLS = ['kk_get_kpis', 'kk_list_agents', 'kk_recent_trades', 'kk_market_snapshot', 'kk_agent', 'kk_neighbors'];

let rpcId = 0;

/** Comando equivalente, ejecutable tal cual (lo imprimen las terminales como línea prompt). */
export function kkCurlCommand(name, args = {}) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
  return `curl -s -X POST ${ENDPOINTS.kk_mcp.url} -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d '${body}'`;
}

function parseToolResult(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('kk_mcp: empty response');
  if (payload.error) throw new Error(`kk_mcp: ${payload.error.message || 'rpc error'}`);
  const result = payload.result;
  if (!result || typeof result !== 'object') throw new Error('kk_mcp: missing result');
  if (result.isError) throw new Error('kk_mcp: tool returned isError');
  const first = Array.isArray(result.content) ? result.content[0] : null;
  if (!first || typeof first.text !== 'string') throw new Error('kk_mcp: no text content');
  return JSON.parse(first.text);
}

/**
 * Llama una tool del MCP de KarmaKadabra.
 * @returns {Promise<any>} el JSON parseado de result.content[0].text
 */
export async function callKkTool(name, args = {}, { signal, timeoutMs = 8000 } = {}) {
  if (!KK_TOOLS.includes(name)) throw new Error(`kk_mcp: unknown tool ${name}`);
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  rpcId += 1;
  try {
    const res = await fetch(ENDPOINTS.kk_mcp.url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: rpcId, method: 'tools/call', params: { name, arguments: args || {} } }),
    });
    if (res.status !== 200) throw new Error(`kk_mcp: HTTP ${res.status}`);
    const text = await res.text();
    // El servidor responde JSON; si negociara SSE, el primer "data:" lleva el mismo objeto.
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      const line = text.split('\n').find((l) => l.startsWith('data:'));
      if (!line) throw new Error('kk_mcp: unparseable body');
      payload = JSON.parse(line.slice(5).trim());
    }
    return parseToolResult(payload);
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}
