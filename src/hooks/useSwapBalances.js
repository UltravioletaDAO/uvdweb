import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getContract, getRpcClient, eth_getBalance, readContract } from 'thirdweb';
import { avalanche } from 'thirdweb/chains';
import { TOKENS, SWAP_TOKENS, formatUnits } from '../services/swap/tokens';
import { getUsdPrices } from '../services/swap/aggregator';

// Un poller de balances, separado del de quotes (CONTRATO §11).
export const BALANCE_POLL_MS = 15000;
const PRICE_POLL_MS = 60000;

const ERC20_BALANCE_OF = 'function balanceOf(address) view returns (uint256)';

// Estado por token: nunca un 0 inventado. `value === null` con `status === 'error'`
// significa "no pude leerlo", que la UI pinta como `—`, no como 0.
const idleState = () =>
  SWAP_TOKENS.reduce((acc, symbol) => {
    acc[symbol] = { status: 'idle', value: null, error: null };
    return acc;
  }, {});

/**
 * Balances de los tokens del swap, uno independiente del otro.
 *
 * - `Promise.allSettled`: una lectura que falla no tumba a las demás.
 * - Un fallo escribe `status:'error'`, jamás `'0.0'`. Pisar un balance bueno con un cero
 *   es peor que no mostrar nada (DISEÑO §4.2).
 * - Refetch al conectar, al cambiar de cuenta o de red, y cuando el llamador lo pide
 *   (después de un swap confirmado).
 *
 * @param {object}  params
 * @param {object}  params.client   cliente de thirdweb (lo inyecta el widget: un solo clientId)
 * @param {string=} params.address  wallet conectada
 * @param {boolean} params.paused   pausa el poller mientras hay una tx en vuelo
 */
export function useSwapBalances({ client, address, paused = false }) {
  const [balances, setBalances] = useState(idleState);
  const [prices, setPrices] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestId = useRef(0);

  const rpcClient = useMemo(() => getRpcClient({ client, chain: avalanche }), [client]);

  const readBalance = useCallback(
    async (symbol, owner) => {
      const token = TOKENS[symbol];
      if (!token) throw new Error(`Unknown token: ${symbol}`);

      if (token.native) {
        const wei = await eth_getBalance(rpcClient, { address: owner });
        return formatUnits(wei.toString(), token.decimals);
      }

      const contract = getContract({ client, chain: avalanche, address: token.address });
      const raw = await readContract({
        contract,
        method: ERC20_BALANCE_OF,
        params: [owner],
      });
      return formatUnits(raw.toString(), token.decimals);
    },
    [client, rpcClient]
  );

  const refresh = useCallback(async () => {
    const owner = address;

    if (!owner) {
      requestId.current += 1;
      setBalances(idleState());
      setIsRefreshing(false);
      return;
    }

    const id = ++requestId.current;
    setIsRefreshing(true);

    // Marcamos `loading` solo lo que todavía no tiene un valor bueno: un refresh no borra
    // de pantalla un balance que ya se leyó bien.
    setBalances((prev) => {
      const next = { ...prev };
      SWAP_TOKENS.forEach((symbol) => {
        const current = prev[symbol];
        next[symbol] =
          current && current.status === 'ok'
            ? current
            : { status: 'loading', value: null, error: null };
      });
      return next;
    });

    const results = await Promise.allSettled(
      SWAP_TOKENS.map((symbol) => readBalance(symbol, owner))
    );

    if (id !== requestId.current) return; // respuesta vieja: no pisa el estado

    setBalances((prev) => {
      const next = { ...prev };
      results.forEach((result, index) => {
        const symbol = SWAP_TOKENS[index];
        if (result.status === 'fulfilled') {
          next[symbol] = { status: 'ok', value: result.value, error: null };
        } else {
          const reason = result.reason;
          next[symbol] = {
            status: 'error',
            value: null,
            error: (reason && reason.message) || String(reason || 'read failed'),
          };
        }
      });
      return next;
    });
    setIsRefreshing(false);
  }, [address, readBalance]);

  // Conectar / cambiar de cuenta.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Cambiar de red o de cuenta desde la wallet.
  useEffect(() => {
    const provider = typeof window !== 'undefined' ? window.ethereum : null;
    if (!provider || typeof provider.on !== 'function') return undefined;

    const onWalletChange = () => refresh();
    provider.on('chainChanged', onWalletChange);
    provider.on('accountsChanged', onWalletChange);

    return () => {
      if (typeof provider.removeListener === 'function') {
        provider.removeListener('chainChanged', onWalletChange);
        provider.removeListener('accountsChanged', onWalletChange);
      }
    };
  }, [refresh]);

  // Poller propio, pausado mientras hay una tx en vuelo.
  useEffect(() => {
    if (!address || paused) return undefined;
    const interval = setInterval(refresh, BALANCE_POLL_MS);
    return () => clearInterval(interval);
  }, [address, paused, refresh]);

  // Precios USD: una sola llamada para todos los tokens, cache en el servicio.
  // Un fallo de precios nunca bloquea nada: se omite el estimado y listo.
  useEffect(() => {
    let alive = true;

    const loadPrices = async () => {
      try {
        const result = await getUsdPrices(SWAP_TOKENS);
        if (alive && result) setPrices(result);
      } catch {
        // sin precios se muestra el balance sin el "≈ $"
      }
    };

    loadPrices();
    const interval = setInterval(loadPrices, PRICE_POLL_MS);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  // Balance + su estimado en USD, ya combinados: `usd === null` cuando falta cualquiera de
  // los dos. Nunca `$0.00` inventado.
  const tokenBalances = useMemo(() => {
    const out = {};
    SWAP_TOKENS.forEach((symbol) => {
      const entry = balances[symbol] || { status: 'idle', value: null, error: null };
      const price = prices[symbol];
      const amount = entry.value === null ? null : parseFloat(entry.value);
      const usd =
        amount !== null && Number.isFinite(amount) && typeof price === 'number' && Number.isFinite(price)
          ? amount * price
          : null;
      out[symbol] = { ...entry, usd };
    });
    return out;
  }, [balances, prices]);

  return { balances: tokenBalances, prices, refresh, isRefreshing };
}

export default useSwapBalances;
