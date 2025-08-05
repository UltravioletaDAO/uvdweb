import { useState, useEffect } from "react";
import { getSafeInfo, getSafeBalances } from "../services/metrics/funds/safeService";

const SAFE_ADDRESS = "0x52110a2Cc8B6bBf846101265edAAe34E753f3389";
const REFRESH_INTERVAL = 2000;

export function useSafeAvalanche() {
  const [owners, setOwners] = useState([]);
  const [threshold, setThreshold] = useState(null);
  const [fiatTotal, setFiatTotal] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const data = await getSafeInfo(SAFE_ADDRESS);
      setOwners(data.owners || []);
      setThreshold(data.threshold);

      const fiatData = await getSafeBalances(SAFE_ADDRESS);
      setFiatTotal(Number(fiatData.fiatTotal));
      setTokens(fiatData.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();

    const interval = setInterval(() => {
      fetchInfo();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { owners, threshold, fiatTotal, tokens, loading, error };
}