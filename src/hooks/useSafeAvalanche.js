import { useState, useEffect, useRef } from "react";
import { getSafeInfo, getSafeBalances } from "../services/metrics/funds/safeService";

const SAFE_ADDRESS = "0x52110a2Cc8B6bBf846101265edAAe34E753f3389";
const REFRESH_INTERVAL = 30000;

export function useSafeAvalanche() {
  const [owners, setOwners] = useState([]);
  const [threshold, setThreshold] = useState(null);
  const [fiatTotal, setFiatTotal] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFirstFetch = useRef(true);

  const fetchInfo = async () => {
    // Only show the full loading spinner on the first fetch; subsequent
    // interval-based refreshes update data silently to avoid flicker.
    if (isFirstFetch.current) {
      setLoading(true);
    }
    try {
      const data = await getSafeInfo(SAFE_ADDRESS);
      setOwners(data.owners || []);
      setThreshold(data.threshold);

      const fiatData = await getSafeBalances(SAFE_ADDRESS);
      setFiatTotal(Math.floor(Number(fiatData.fiatTotal))); // Sin decimales para evitar movimiento visual
      setTokens(fiatData.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (isFirstFetch.current) {
        setLoading(false);
        isFirstFetch.current = false;
      }
    }
  };

  useEffect(() => {
    fetchInfo();

    const interval = setInterval(() => {
      fetchInfo();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { owners, threshold, fiatTotal, tokens, loading, error };
}