import { useState, useEffect, useCallback } from "react";
import { getSnapshotData } from "../services/metrics/snapshot/SnapshotService";
import { getDefaultSpace } from "../lib/snapshotSpaces";

export function useSnapshotData() {
  const [currentSpace, setCurrentSpace] = useState(getDefaultSpace());
  const [spaceData, setSpaceData] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSpaceData = useCallback(async (spaceId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getSnapshotData(spaceId);
      setSpaceData(data.space);
      setProposals(data.proposals);
      setLeaderboard(data.leaderboard);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpaceData(currentSpace);
  }, [currentSpace, loadSpaceData]);

  // Calculo de métricas
  const getMetrics = () => {
    if (!spaceData || !proposals.length) {
      return {
        followers: 0,
        proposals: 0,
        votes: 0,
        quorum: 0,
      };
    }

    const totalVotes = proposals.reduce((sum, proposal) => sum + (proposal.votes || 0), 0);
    const averageQuorum = proposals.length > 0 
      ? proposals.reduce((sum, p) => sum + (p.quorum || 0), 0) / proposals.length 
      : 0;

    return {
      followers: spaceData.followersCount || 0,
      proposals: spaceData.proposalsCount || proposals.length,
      votes: totalVotes,
      quorum: Math.round(averageQuorum),
    };
  };

  const metrics = getMetrics();
  const latestProposal = proposals[0];

  const handleSpaceChange = (spaceId) => {
    setCurrentSpace(spaceId);
  };

  return {
    currentSpace,
    spaceData,
    proposals,
    leaderboard,
    error,
    loading,
    metrics,
    latestProposal,
    handleSpaceChange,
    loadSpaceData,
  };
}