import { useState, useEffect } from "react";
import { fetchPriceHistory } from "../services/metrics/Token/PriceEvolutionService";

export function usePriceHistory() {
  const [history, setHistory] = useState([]);
  const [priceChange30d, setPriceChange30d] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchPriceHistory().then((data) => {
      if (!isMounted) return;
      
      const safeData = Array.isArray(data) ? data : [];
      setHistory(safeData);
      
      if (safeData.length > 1) {
        const firstPrice = safeData[0].price;
        const lastPrice = safeData[safeData.length - 1].price;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPriceChange30d(change);
      } else {
        setPriceChange30d(0);
      }
    }).catch(() => {
      if (isMounted) {
        setHistory([]);
        setPriceChange30d(0);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return { history, priceChange30d };
}