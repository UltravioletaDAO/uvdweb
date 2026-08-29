// Provider primario: KyberSwap Aggregator (MetaAggregationRouterV2 en Avalanche).
// Es el único que rutea cross-DEX USDC->WAVAX (Pangolin/Axima) -> UVD (Arena),
// que es exactamente lo que ningún router Uniswap-V2 solo podía hacer.
// Endpoints y códigos medidos el 2026-08-28: docs/swap-fix-2026-08-28/CONTRATO.md §6 y §9.

import { fetchJson } from './http';
import { SwapErrorCode, swapError } from './errors';
import { SWAP_CONFIG } from './tokens';

const BASE_URL = 'https://aggregator-api.kyberswap.com/avalanche/api/v1';

export const PROVIDER = 'kyber';

function headers() {
  return { 'x-client-id': SWAP_CONFIG.clientId };
}

/**
 * Traduce la respuesta de Kyber al SwapError tipado.
 * [VERIFICADO 2026-08-28] 4008 route not found · 4009 amountIn too large ·
 * 4011 token not found · 4000 bad request (con `details[].fieldViolations[].field`).
 */
function mapError(response) {
  if (response.kind === 'timeout') {
    return swapError(SwapErrorCode.TIMEOUT, response.message, { provider: PROVIDER });
  }
  if (response.kind === 'network') {
    return swapError(SwapErrorCode.PROVIDER_DOWN, response.message, { provider: PROVIDER });
  }

  const body = response.data;
  const providerCode = body?.code;
  const message = body?.message || response.message;
  const extra = { provider: PROVIDER, detail: { httpStatus: response.status, providerCode } };

  if (response.status >= 500 || response.status === 403 || response.status === 429) {
    return swapError(SwapErrorCode.PROVIDER_DOWN, message, extra);
  }

  switch (providerCode) {
    case 4008:
      return swapError(SwapErrorCode.NO_ROUTE, message, extra);
    case 4009:
      return swapError(SwapErrorCode.AMOUNT_TOO_LARGE, message, extra);
    case 4011:
      return swapError(SwapErrorCode.TOKEN_NOT_FOUND, message, extra);
    case 4000: {
      const field = body?.details?.[0]?.fieldViolations?.[0]?.field;
      if (field === 'amountIn') {
        return swapError(SwapErrorCode.AMOUNT_TOO_SMALL, message, extra);
      }
      if (field === 'tokenIn' || field === 'tokenOut') {
        return swapError(SwapErrorCode.TOKEN_NOT_FOUND, message, extra);
      }
      return swapError(SwapErrorCode.UNKNOWN, message, extra);
    }
    default:
      return swapError(SwapErrorCode.UNKNOWN, message, extra);
  }
}

/**
 * La ruta concreta cambia con la liquidez del momento: `routeLabel` es informativo,
 * NUNCA se valida contra una lista de DEXes esperados.
 */
function routeLabel(routeSummary) {
  const paths = Array.isArray(routeSummary?.route) ? routeSummary.route : [];
  const labels = paths
    .map((hops) => (Array.isArray(hops) ? hops.map((hop) => hop?.exchange).filter(Boolean).join(' → ') : ''))
    .filter(Boolean);
  if (labels.length === 0) return '';
  return labels.length === 1 ? labels[0] : `${labels[0]} (+${labels.length - 1})`;
}

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** GET /routes -> resultado crudo normalizado (el aggregator arma el Quote del contrato). */
export async function quote({ tokenInAddress, tokenOutAddress, amountIn }, options = {}) {
  const params = new URLSearchParams({
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn: String(amountIn),
  });
  const response = await fetchJson(`${BASE_URL}/routes?${params.toString()}`, {
    headers: headers(),
    signal: options.signal,
    timeoutMs: options.timeoutMs ?? SWAP_CONFIG.requestTimeoutMs,
    fetchImpl: options.fetchImpl,
  });

  if (!response.ok) return { ok: false, error: mapError(response) };

  const body = response.data;
  const summary = body?.data?.routeSummary;
  if (body?.code !== 0 || !summary?.amountOut) {
    return {
      ok: false,
      error: mapError({ ...response, ok: false, kind: 'http', data: body }),
    };
  }

  return {
    ok: true,
    result: {
      amountIn: String(summary.amountIn),
      amountOut: String(summary.amountOut),
      amountInUsd: num(summary.amountInUsd),
      amountOutUsd: num(summary.amountOutUsd),
      gasUsd: num(summary.gasUsd),
      routeLabel: routeLabel(summary),
      raw: summary,
    },
  };
}

/**
 * POST /route/build -> calldata REAL. El `minAmountOut` va embebido en el calldata
 * a partir de `slippageTolerance` (bps): el widget NO lo calcula. CONTRATO §0.
 */
export async function build({ raw, sender, recipient, slippageBps, deadlineSec }, options = {}) {
  const body = {
    routeSummary: raw,
    sender,
    recipient,
    slippageTolerance: slippageBps,
    source: SWAP_CONFIG.clientId,
  };
  if (deadlineSec) body.deadline = Math.floor(Date.now() / 1000) + deadlineSec;

  const response = await fetchJson(`${BASE_URL}/route/build`, {
    method: 'POST',
    headers: headers(),
    body,
    signal: options.signal,
    timeoutMs: options.timeoutMs ?? SWAP_CONFIG.requestTimeoutMs,
    fetchImpl: options.fetchImpl,
  });

  if (!response.ok) return { ok: false, error: mapError(response) };

  const payload = response.data?.data;
  if (response.data?.code !== 0 || !payload?.data || !payload?.routerAddress) {
    return { ok: false, error: mapError({ ...response, kind: 'http', data: response.data }) };
  }

  return {
    ok: true,
    result: {
      to: payload.routerAddress,
      // En Kyber el spender ES el router (a diferencia de ParaSwap).
      spender: payload.routerAddress,
      data: payload.data,
      // El valor nativo lo dice la API; no se calcula. CONTRATO §9.
      value: String(payload.transactionValue ?? '0'),
      gas: payload.gas ? String(payload.gas) : null,
      amountOut: String(payload.amountOut),
      amountInUsd: num(payload.amountInUsd),
      amountOutUsd: num(payload.amountOutUsd),
    },
  };
}
