// Forma única del error del swap. CONTRATO §6.
// El botón NUNCA queda mudo: todo código tiene su i18nKey y su texto.

export const SwapErrorCode = {
  NO_ROUTE: 'NO_ROUTE',
  AMOUNT_TOO_SMALL: 'AMOUNT_TOO_SMALL',
  AMOUNT_TOO_LARGE: 'AMOUNT_TOO_LARGE',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  PROVIDER_DOWN: 'PROVIDER_DOWN',
  TIMEOUT: 'TIMEOUT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  NEEDS_APPROVAL: 'NEEDS_APPROVAL',
  USER_REJECTED: 'USER_REJECTED',
  UNKNOWN: 'UNKNOWN',
};

const RETRYABLE = new Set([
  SwapErrorCode.PROVIDER_DOWN,
  SwapErrorCode.TIMEOUT,
  SwapErrorCode.USER_REJECTED,
  SwapErrorCode.UNKNOWN,
]);

// Errores del usuario / de la entrada: el otro provider va a fallar igual,
// así que NO disparan el fallback de la cascada. CONTRATO §8.
const USER_ERRORS = new Set([
  SwapErrorCode.AMOUNT_TOO_SMALL,
  SwapErrorCode.AMOUNT_TOO_LARGE,
  SwapErrorCode.TOKEN_NOT_FOUND,
  SwapErrorCode.INSUFFICIENT_BALANCE,
  SwapErrorCode.NEEDS_APPROVAL,
  SwapErrorCode.USER_REJECTED,
]);

export function isUserError(code) {
  return USER_ERRORS.has(code);
}

/** Errores que significan "el proveedor no contestó" (no que la respuesta sea mala). */
export function isProviderDown(code) {
  return code === SwapErrorCode.PROVIDER_DOWN || code === SwapErrorCode.TIMEOUT;
}

/** Construye un SwapError. Nunca se tira: se devuelve en `{ ok:false, error }`. */
export function swapError(code, message, extra = {}) {
  const finalCode = SwapErrorCode[code] ? code : SwapErrorCode.UNKNOWN;
  return {
    code: finalCode,
    message: message || finalCode,
    i18nKey: `swap.err.${finalCode.toLowerCase()}`,
    retryable: RETRYABLE.has(finalCode),
    ...extra,
  };
}

export function fail(code, message, extra) {
  return { ok: false, error: swapError(code, message, extra) };
}

/** Traduce el error que tira una wallet (rechazo del usuario) al código tipado. */
export function mapWalletError(error) {
  const code = error?.code;
  const message = String(error?.message || error || '');
  if (code === 4001 || code === 'ACTION_REJECTED' || /user (rejected|denied)/i.test(message)) {
    return swapError(SwapErrorCode.USER_REJECTED, 'User rejected the transaction', {
      detail: message,
    });
  }
  return swapError(SwapErrorCode.UNKNOWN, message || 'Unknown wallet error', { detail: code });
}
