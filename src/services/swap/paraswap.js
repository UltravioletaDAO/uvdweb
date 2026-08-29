// Provider de fallback: ParaSwap v5. Se usa solo si Kyber no contesta o no rutea.
// [VERIFICADO 2026-08-28] mismo par USDC->UVD: Kyber 1.283.752 UVD vs ParaSwap
// 1.282.952 UVD (-0,06 %). Errores medidos: 404 "No routes found with enough
// liquidity", 400 "Invalid Amount".
//
// ⚠ En ParaSwap el `spender` NO es el `to` de la transacción: se aprueba el
// tokenTransferProxy (0x216b4b4b…), no el router (0xDEF171Fe…). CONTRATO §3.

import { fetchJson } from './http';
import { SwapErrorCode, swapError } from './errors';
import { SWAP_CONFIG, CHAIN_ID } from './tokens';

const BASE_URL = 'https://api.paraswap.io';

export const PROVIDER = 'paraswap';

function mapError(response) {
  if (response.kind === 'timeout') {
    return swapError(SwapErrorCode.TIMEOUT, response.message, { provider: PROVIDER });
  }
  if (response.kind === 'network') {
    return swapError(SwapErrorCode.PROVIDER_DOWN, response.message, { provider: PROVIDER });
  }

  const message = response.data?.error || response.message || `HTTP ${response.status}`;
  const extra = { provider: PROVIDER, detail: { httpStatus: response.status } };

  if (response.status >= 500 || response.status === 403 || response.status === 429) {
    return swapError(SwapErrorCode.PROVIDER_DOWN, message, extra);
  }
  if (/no routes? found/i.test(message)) {
    return swapError(SwapErrorCode.NO_ROUTE, message, extra);
  }
  if (/invalid amount|amount is too small/i.test(message)) {
    return swapError(SwapErrorCode.AMOUNT_TOO_SMALL, message, extra);
  }
  if (/too big|exceeds|too large/i.test(message)) {
    return swapError(SwapErrorCode.AMOUNT_TOO_LARGE, message, extra);
  }
  if (/token not found|unsupported token|invalid token/i.test(message)) {
    return swapError(SwapErrorCode.TOKEN_NOT_FOUND, message, extra);
  }
  return swapError(SwapErrorCode.UNKNOWN, message, extra);
}

function routeLabel(priceRoute) {
  const routes = Array.isArray(priceRoute?.bestRoute) ? priceRoute.bestRoute : [];
  const labels = routes
    .map((route) =>
      (route?.swaps || [])
        .map((swap) => swap?.swapExchanges?.[0]?.exchange)
        .filter(Boolean)
        .join(' → ')
    )
    .filter(Boolean);
  if (labels.length === 0) return '';
  return labels.length === 1 ? labels[0] : `${labels[0]} (+${labels.length - 1})`;
}

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function quote(
  { tokenInAddress, tokenOutAddress, amountIn, decimalsIn, decimalsOut },
  options = {}
) {
  const params = new URLSearchParams({
    srcToken: tokenInAddress,
    destToken: tokenOutAddress,
    amount: String(amountIn),
    srcDecimals: String(decimalsIn),
    destDecimals: String(decimalsOut),
    side: 'SELL',
    network: String(CHAIN_ID),
  });
  const response = await fetchJson(`${BASE_URL}/prices?${params.toString()}`, {
    signal: options.signal,
    timeoutMs: options.timeoutMs ?? SWAP_CONFIG.requestTimeoutMs,
    fetchImpl: options.fetchImpl,
  });

  if (!response.ok) return { ok: false, error: mapError(response) };

  const priceRoute = response.data?.priceRoute;
  if (!priceRoute?.destAmount) {
    return {
      ok: false,
      error: swapError(SwapErrorCode.NO_ROUTE, 'ParaSwap returned no priceRoute', {
        provider: PROVIDER,
      }),
    };
  }

  return {
    ok: true,
    result: {
      amountIn: String(priceRoute.srcAmount),
      amountOut: String(priceRoute.destAmount),
      amountInUsd: num(priceRoute.srcUSD),
      amountOutUsd: num(priceRoute.destUSD),
      gasUsd: num(priceRoute.gasCostUSD),
      routeLabel: routeLabel(priceRoute),
      raw: priceRoute,
    },
  };
}

export async function build({ raw, sender, recipient, slippageBps, deadlineSec }, options = {}) {
  const body = {
    srcToken: raw.srcToken,
    destToken: raw.destToken,
    srcAmount: raw.srcAmount,
    srcDecimals: raw.srcDecimals,
    destDecimals: raw.destDecimals,
    slippage: slippageBps,
    priceRoute: raw,
    userAddress: sender,
    partner: SWAP_CONFIG.clientId,
  };
  if (recipient && recipient.toLowerCase() !== String(sender).toLowerCase()) {
    body.receiver = recipient;
  }
  if (deadlineSec) body.deadline = Math.floor(Date.now() / 1000) + deadlineSec;

  const response = await fetchJson(`${BASE_URL}/transactions/${CHAIN_ID}?ignoreChecks=true`, {
    method: 'POST',
    body,
    signal: options.signal,
    timeoutMs: options.timeoutMs ?? SWAP_CONFIG.requestTimeoutMs,
    fetchImpl: options.fetchImpl,
  });

  if (!response.ok) return { ok: false, error: mapError(response) };

  const tx = response.data;
  if (!tx?.to || !tx?.data) {
    return {
      ok: false,
      error: swapError(SwapErrorCode.UNKNOWN, 'ParaSwap returned an empty transaction', {
        provider: PROVIDER,
      }),
    };
  }

  return {
    ok: true,
    result: {
      to: tx.to,
      // ⚠ El que gasta los tokens es el proxy, NO el router de `to`.
      spender: raw.tokenTransferProxy,
      data: tx.data,
      value: String(tx.value ?? '0'),
      gas: tx.gas ? String(tx.gas) : null,
      amountOut: String(raw.destAmount),
      amountInUsd: num(raw.srcUSD),
      amountOutUsd: num(raw.destUSD),
    },
  };
}
