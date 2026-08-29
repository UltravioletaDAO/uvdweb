// Precio USD por token vía DexScreener. Una sola llamada para los 4 tokens, cache 60 s.
// [VERIFICADO 2026-08-28] GET https://api.dexscreener.com/tokens/v1/avalanche/<a>,<b>,<c>,<d>
// -> HTTP 200, access-control-allow-origin: *, UVD 0.0000007786 · WAVAX 7.28 ·
// USDC 0.9975 · USDC.e 1.00050.
//
// Un fallo de precios NUNCA bloquea un quote ni un swap: se devuelve `null` y la UI
// omite el estimado. Nunca $0.00 — un cero falso es peor que no mostrar nada.

import { fetchJson } from './http';
import { SWAP_CONFIG, SWAP_TOKENS, priceAddress } from './tokens';

const BASE_URL = 'https://api.dexscreener.com/tokens/v1/avalanche';

/** Map<addressLower, { price:number, at:number }> */
const cache = new Map();
/** Dedup de llamadas en vuelo: el campo activo y el selector piden a la vez. */
const inFlight = new Map();

export function clearPriceCache() {
  cache.clear();
  inFlight.clear();
}

function fresh(address, now) {
  const hit = cache.get(address);
  if (!hit) return null;
  return now - hit.at < SWAP_CONFIG.priceCacheTtlMs ? hit : null;
}

/** El precio del token es el de su par con más liquidez donde el token es la base. */
function extractPrices(pairs, addresses) {
  const best = new Map();
  for (const pair of Array.isArray(pairs) ? pairs : []) {
    const base = pair?.baseToken?.address?.toLowerCase();
    if (!base || !addresses.includes(base)) continue;
    const price = Number(pair?.priceUsd);
    if (!Number.isFinite(price) || price <= 0) continue;
    const liquidity = Number(pair?.liquidity?.usd) || 0;
    const current = best.get(base);
    if (!current || liquidity > current.liquidity) best.set(base, { price, liquidity });
  }
  return best;
}

async function fetchPrices(addresses, options) {
  const key = addresses.join(',');
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    const response = await fetchJson(`${BASE_URL}/${key}`, {
      signal: options.signal,
      timeoutMs: options.timeoutMs ?? SWAP_CONFIG.requestTimeoutMs,
      fetchImpl: options.fetchImpl,
    });
    if (!response.ok) return;
    const now = Date.now();
    for (const [address, { price }] of extractPrices(response.data, addresses)) {
      cache.set(address, { price, at: now });
    }
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}

/**
 * @returns {Promise<Record<string, number|null>>} precio USD por símbolo; `null` el que no resolvió.
 */
export async function getUsdPrices(symbols = SWAP_TOKENS, options = {}) {
  const now = Date.now();
  const wanted = symbols
    .map((symbol) => ({ symbol, address: priceAddress(symbol)?.toLowerCase() || null }))
    .filter((entry) => entry.address);

  const stale = [...new Set(wanted.filter((e) => !fresh(e.address, now)).map((e) => e.address))];
  if (stale.length > 0) {
    try {
      await fetchPrices(stale, options);
    } catch (error) {
      if (options.signal?.aborted) throw error;
      // Red caída: se sirve lo que haya en cache (aunque esté vencido) antes que un null.
    }
  }

  const out = {};
  for (const symbol of symbols) {
    const address = priceAddress(symbol)?.toLowerCase();
    const hit = address ? cache.get(address) : null;
    out[symbol] = hit ? hit.price : null;
  }
  return out;
}

/** Precio USD de un token. `null` si no resolvió — nunca 0. */
export async function priceUsdFor(symbol, options = {}) {
  const prices = await getUsdPrices([symbol], options);
  return prices[symbol] ?? null;
}
