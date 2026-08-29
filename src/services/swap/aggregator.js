/* global BigInt */
// Fachada pública del swap. Es la ÚNICA superficie que consume SwapWidgetV2.
// Contrato congelado: docs/swap-fix-2026-08-28/CONTRATO.md
//
// Regla de oro (§0): el widget NUNCA calcula minAmountOut ni arma calldata.
// El agregador embebe el mínimo dentro del calldata a partir del slippage.
//
// Cascada (§8): Kyber -> ParaSwap. Un error DEL USUARIO (monto/token inválido) no
// dispara el fallback: el otro provider fallaría igual. ODOS queda fuera del camino
// crítico (HTTP 530 el 2026-08-28).

import * as kyber from './kyber';
import * as paraswap from './paraswap';
import { fetchJson } from './http';
import { SwapErrorCode, swapError, fail, isUserError, isProviderDown } from './errors';
import {
  SWAP_CONFIG,
  MAX_UINT256,
  getToken,
  isAddress,
  parseUnits,
  formatUnits,
  formatDisplay,
} from './tokens';

const PROVIDERS = { kyber, paraswap };
const FALLBACK_OF = { kyber: 'paraswap', paraswap: 'kyber' };

export { SwapErrorCode, swapError, mapWalletError } from './errors';
export { getUsdPrices, priceUsdFor, clearPriceCache } from './prices';
export { TOKENS, SWAP_TOKENS, SWAP_CONFIG, formatDisplay, formatUnits, parseUnits } from './tokens';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function providerRequest(from, to, amountIn) {
  return {
    tokenInAddress: from.address,
    tokenOutAddress: to.address,
    amountIn,
    decimalsIn: from.decimals,
    decimalsOut: to.decimals,
  };
}

/** Se prefiere el error del provider que SÍ contestó por sobre el que no respondió. */
function combineErrors(primary, secondary) {
  const primaryDown = isProviderDown(primary.code);
  const secondaryDown = isProviderDown(secondary.code);
  const detail = {
    kyber: { code: primary.code, message: primary.message },
    paraswap: { code: secondary.code, message: secondary.message },
  };

  if (!secondaryDown) return { ...secondary, detail };
  if (!primaryDown) return { ...primary, detail };

  const bothTimedOut =
    primary.code === SwapErrorCode.TIMEOUT && secondary.code === SwapErrorCode.TIMEOUT;
  return swapError(
    bothTimedOut ? SwapErrorCode.TIMEOUT : SwapErrorCode.PROVIDER_DOWN,
    'KyberSwap y ParaSwap no respondieron',
    { detail }
  );
}

function toQuote(provider, result, from, to) {
  const { amountInUsd, amountOutUsd } = result;
  const priceImpactPct =
    typeof amountInUsd === 'number' && amountInUsd > 0 && typeof amountOutUsd === 'number'
      ? ((amountOutUsd - amountInUsd) / amountInUsd) * 100
      : null;

  return {
    ok: true,
    provider,
    fromToken: from.symbol,
    toToken: to.symbol,
    amountIn: result.amountIn,
    amountInFormatted: formatUnits(result.amountIn, from.decimals),
    amountOut: result.amountOut,
    amountOutFormatted: formatDisplay(result.amountOut, to.decimals),
    amountInUsd,
    amountOutUsd,
    priceImpactPct,
    gasUsd: result.gasUsd,
    routeLabel: result.routeLabel,
    // OPACO para el widget: se guarda tal cual y se devuelve intacto a buildSwap().
    raw: result.raw,
    fetchedAt: Date.now(),
  };
}

function toBuildResult(provider, result, toTokenSymbol) {
  const to = getToken(toTokenSymbol);
  return {
    ok: true,
    provider,
    to: result.to,
    data: result.data,
    value: result.value,
    spender: result.spender,
    gas: result.gas,
    amountOut: result.amountOut,
    amountOutFormatted: formatDisplay(result.amountOut, to?.decimals ?? 18),
  };
}

// ---------------------------------------------------------------------------
// getQuote
// ---------------------------------------------------------------------------

/**
 * @param {{fromToken:string, toToken:string, amount:string, userAddress?:string}} params
 *   `amount` va en UNIDADES LEGIBLES ("1.5"), nunca en wei.
 * @param {{signal?:AbortSignal, timeoutMs?:number, fetchImpl?:Function}} [options]
 * @returns {Promise<object>} Quote con `ok:true`, o `{ ok:false, error:SwapError }`.
 *   No tira nunca, salvo AbortError si el llamador cancela.
 */
export async function getQuote(params, options = {}) {
  const { fromToken, toToken, amount } = params || {};
  const from = getToken(fromToken);
  const to = getToken(toToken);

  if (!from) return fail(SwapErrorCode.TOKEN_NOT_FOUND, `Unknown token: ${fromToken}`);
  if (!to) return fail(SwapErrorCode.TOKEN_NOT_FOUND, `Unknown token: ${toToken}`);
  if (from.symbol === to.symbol) {
    return fail(SwapErrorCode.NO_ROUTE, 'fromToken and toToken are the same');
  }

  const amountIn = parseUnits(amount, from.decimals);
  if (amountIn === null) {
    return fail(SwapErrorCode.AMOUNT_TOO_SMALL, `Invalid amount: "${amount}"`);
  }
  if (amountIn === '0') {
    return fail(SwapErrorCode.AMOUNT_TOO_SMALL, 'Amount rounds to zero for this token');
  }

  const request = providerRequest(from, to, amountIn);

  const primary = await kyber.quote(request, options);
  if (primary.ok) return toQuote('kyber', primary.result, from, to);
  if (isUserError(primary.error.code)) return { ok: false, error: primary.error };

  const secondary = await paraswap.quote(request, options);
  if (secondary.ok) return toQuote('paraswap', secondary.result, from, to);

  return { ok: false, error: combineErrors(primary.error, secondary.error) };
}

// ---------------------------------------------------------------------------
// buildSwap
// ---------------------------------------------------------------------------

/**
 * @param {{quote:object, sender:string, recipient?:string, slippageBps?:number, deadlineSec?:number}} params
 *   `slippageBps` en BASIS POINTS: 100 = 1 %. El slider del widget (en %) va ×100.
 * @returns {Promise<object>} BuildResult, o `{ ok:false, error }`.
 */
export async function buildSwap(params, options = {}) {
  const {
    quote,
    sender,
    recipient,
    slippageBps = SWAP_CONFIG.defaultSlippageBps,
    deadlineSec = SWAP_CONFIG.defaultDeadlineSec,
  } = params || {};

  if (!quote?.ok || !quote.raw || !PROVIDERS[quote.provider]) {
    return fail(SwapErrorCode.UNKNOWN, 'buildSwap requires a Quote returned by getQuote()');
  }
  if (!isAddress(sender)) {
    return fail(SwapErrorCode.UNKNOWN, `Invalid sender address: ${sender}`);
  }
  const receiver = recipient ?? sender;
  if (!isAddress(receiver)) {
    return fail(SwapErrorCode.UNKNOWN, `Invalid recipient address: ${recipient}`);
  }
  if (
    !Number.isInteger(slippageBps) ||
    slippageBps < SWAP_CONFIG.minSlippageBps ||
    slippageBps > SWAP_CONFIG.maxSlippageBps
  ) {
    return fail(
      SwapErrorCode.UNKNOWN,
      `slippageBps must be an integer in [${SWAP_CONFIG.minSlippageBps}, ${SWAP_CONFIG.maxSlippageBps}] basis points (100 = 1%), got ${slippageBps}`
    );
  }

  const buildArgs = { sender, recipient: receiver, slippageBps, deadlineSec };

  const first = await PROVIDERS[quote.provider].build({ raw: quote.raw, ...buildArgs }, options);
  if (first.ok) return toBuildResult(quote.provider, first.result, quote.toToken);
  if (isUserError(first.error.code)) return { ok: false, error: first.error };

  // El build del provider del quote falló: se re-cotiza ENTERO con el otro.
  // Un routeSummary de Kyber jamás se le pasa a ParaSwap. CONTRATO §8.
  const fallbackName = FALLBACK_OF[quote.provider];
  const fallback = PROVIDERS[fallbackName];
  const from = getToken(quote.fromToken);
  const to = getToken(quote.toToken);

  const requote = await fallback.quote(providerRequest(from, to, quote.amountIn), options);
  if (!requote.ok) return { ok: false, error: combineErrors(first.error, requote.error) };

  const second = await fallback.build({ raw: requote.result.raw, ...buildArgs }, options);
  if (!second.ok) return { ok: false, error: combineErrors(first.error, second.error) };

  return toBuildResult(fallbackName, second.result, quote.toToken);
}

// ---------------------------------------------------------------------------
// Allowance
// ---------------------------------------------------------------------------

const padArg = (hex) => hex.replace(/^0x/, '').toLowerCase().padStart(64, '0');
const uintArg = (value) => padArg(BigInt(value).toString(16));

async function ethCall(to, data, options = {}) {
  return fetchJson(SWAP_CONFIG.rpcUrl, {
    method: 'POST',
    body: { jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] },
    signal: options.signal,
    timeoutMs: options.timeoutMs ?? SWAP_CONFIG.requestTimeoutMs,
    fetchImpl: options.fetchImpl,
  });
}

/**
 * Allowance contra el `spender` del build VIGENTE (en ParaSwap NO es el `to` de la tx).
 * @param {{tokenSymbol:string, owner:string, spender:string, amount?:string}} params
 *   `amount` en unidades legibles; si se omite, `sufficient` y `needed` vienen en `null`.
 */
export async function checkAllowance(params, options = {}) {
  const { tokenSymbol, owner, spender, amount } = params || {};
  const token = getToken(tokenSymbol);
  if (!token) return fail(SwapErrorCode.TOKEN_NOT_FOUND, `Unknown token: ${tokenSymbol}`);

  let needed = null;
  if (amount !== undefined && amount !== null) {
    needed = parseUnits(amount, token.decimals);
    if (needed === null) {
      return fail(SwapErrorCode.AMOUNT_TOO_SMALL, `Invalid amount: "${amount}"`);
    }
  }

  // El gas token nativo no tiene allowance: siempre alcanza.
  if (token.native) {
    return { ok: true, allowance: MAX_UINT256, sufficient: true, needed, native: true };
  }
  if (!isAddress(owner)) return fail(SwapErrorCode.UNKNOWN, `Invalid owner address: ${owner}`);
  if (!isAddress(spender)) {
    return fail(SwapErrorCode.UNKNOWN, `Invalid spender address: ${spender}`);
  }

  // allowance(address,address)
  const data = `0xdd62ed3e${padArg(owner)}${padArg(spender)}`;
  const response = await ethCall(token.address, data, options);

  if (!response.ok) {
    const code = response.kind === 'timeout' ? SwapErrorCode.TIMEOUT : SwapErrorCode.PROVIDER_DOWN;
    return fail(code, `RPC allowance failed: ${response.message}`, { detail: response.status });
  }
  const result = response.data?.result;
  if (response.data?.error || !/^0x[0-9a-fA-F]+$/.test(String(result))) {
    return fail(
      SwapErrorCode.PROVIDER_DOWN,
      `RPC allowance returned no value: ${response.data?.error?.message || result}`
    );
  }

  const allowance = BigInt(result).toString();
  return {
    ok: true,
    allowance,
    needed,
    sufficient: needed === null ? null : BigInt(allowance) >= BigInt(needed),
    native: false,
  };
}

/**
 * Calldata de `approve(spender, amount)`. Síncrono: no toca la red.
 * @param {{tokenSymbol:string, spender:string, amount?:string|'max'}} params
 */
export function buildApproval(params) {
  const { tokenSymbol, spender, amount = 'max' } = params || {};
  const token = getToken(tokenSymbol);
  if (!token) return fail(SwapErrorCode.TOKEN_NOT_FOUND, `Unknown token: ${tokenSymbol}`);
  if (token.native) {
    return fail(SwapErrorCode.UNKNOWN, 'Native AVAX does not need an approval');
  }
  if (!isAddress(spender)) {
    return fail(SwapErrorCode.UNKNOWN, `Invalid spender address: ${spender}`);
  }

  const value = amount === 'max' ? MAX_UINT256 : parseUnits(amount, token.decimals);
  if (value === null) return fail(SwapErrorCode.AMOUNT_TOO_SMALL, `Invalid amount: "${amount}"`);

  // approve(address,uint256)
  return {
    ok: true,
    to: token.address,
    data: `0x095ea7b3${padArg(spender)}${uintArg(value)}`,
    value: '0',
  };
}
