import { useState, useEffect } from "react";
import { getSnapshotData } from "../services/metrics/snapshot/SnapshotService";
import { SNAPSHOT_SPACES } from "../lib/snapshotSpaces";

export function useCombinedSnapshotData() {
  const [combinedMetrics, setCombinedMetrics] = useState({
    followers: 0,
    proposals: 0,
    votes: 0,
    quorum: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCombinedData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar datos de ambos espacios en paralelo
        const [ultravioletaData, cuchorapidoData] = await Promise.all([
          getSnapshotData(SNAPSHOT_SPACES.ULTRAVIOLETA.id),
          getSnapshotData(SNAPSHOT_SPACES.CUCHORAPIDO.id)
        ]);

        // Calcular métricas combinadas
        const ultravioletaMetrics = calculateMetrics(ultravioletaData);
        const cuchorapidoMetrics = calculateMetrics(cuchorapidoData);

        setCombinedMetrics({
          followers: Math.round((ultravioletaMetrics.followers + cuchorapidoMetrics.followers) / 2), // Promedio porque es la misma comunidad
          proposals: ultravioletaMetrics.proposals + cuchorapidoMetrics.proposals, // Suma porque son actividades acumulativas
          votes: ultravioletaMetrics.votes + cuchorapidoMetrics.votes, // Suma porque son actividades acumulativas
          quorum: Math.round((ultravioletaMetrics.quorum + cuchorapidoMetrics.quorum) / 2), // Promedio del quorum
        });

      } catch (err) {
        setError(err.message);
        console.error('Error loading combined snapshot data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCombinedData();
  }, []);

  // Función helper para calcular métricas de un espacio
  const calculateMetrics = (data) => {
    if (!data.space || !data.proposals?.length) {
      return {
        followers: 0,
        proposals: 0,
        votes: 0,
        quorum: 0,
      };
    }

    const totalVotes = data.proposals.reduce((sum, proposal) => sum + (proposal.votes || 0), 0);
    const averageQuorum = data.proposals.length > 0 
      ? data.proposals.reduce((sum, p) => sum + (p.quorum || 0), 0) / data.proposals.length 
      : 0;

    return {
      followers: data.space.followersCount || 0,
      proposals: data.space.proposalsCount || data.proposals.length,
      votes: totalVotes,
      quorum: Math.round(averageQuorum),
    };
  };

  return {
    metrics: combinedMetrics,
    loading,
    error
  };
}