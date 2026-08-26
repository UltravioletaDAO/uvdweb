import { useEffect, useState } from "react";
import { getTokenData } from "../services/metrics/Token/TokenMetricsService";

const REFRESH_INTERVAL = 55000;

export function useTokenMetrics() {
  const [data, setData] = useState({
    priceUsd: "0.00",
    priceNative: "0.00",
    priceChange24h: "0.00",
    liquidity: "0",
    marketCap: "0",
    holderCount: "0",
    totalSupply: "0",
    circulatingSupply: "0",
    totalTransactions: "0",
    loading: true,
    error: null,
    burnedSupply: "0",
  });

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));
      const tokenData = await getTokenData();
      setData({
        ...tokenData,
        loading: false,
        error: null,
      });
    } catch (err) {
      setData((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Calculo de cuántos UVD se obtiene por 1 AVAX y 1 USDC
  // "N/A" cuando el precio no es un número > 0 (estado inicial "0.00" o DexScreener caído)
  const safeInv = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? (1 / n).toFixed(2) : "N/A";
  };
  const uvdPerAvax = safeInv(data.priceNative);
  const uvdPerUsdc = safeInv(data.priceUsd);

  return { ...data, uvdPerAvax, uvdPerUsdc };
}
