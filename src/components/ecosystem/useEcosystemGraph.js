// Hook del grafo del ecosistema (contrato C2). Una sola query compartida por todas las
// ventanas y secciones de /ecosystem: React Query key ['ecosystem','graph'].
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { indexGraph, loadEcosystemGraph } from '../../services/ecosystem/graph';

export const ECOSYSTEM_GRAPH_QUERY_KEY = ['ecosystem', 'graph'];

export default function useEcosystemGraph() {
  const query = useQuery({
    queryKey: ECOSYSTEM_GRAPH_QUERY_KEY,
    queryFn: ({ signal }) => loadEcosystemGraph({ signal }),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const data = query.data || null;
  const graph = data ? data.graph : null;
  const index = useMemo(() => (graph ? indexGraph(graph) : null), [graph]);

  let status = 'loading';
  if (query.isError && !data) status = 'error';
  else if (data) status = data.status;

  return {
    graph,
    index,
    status,
    fetchedAt: data ? data.fetchedAt : null,
    url: data ? data.url : null,
    isLoading: query.isLoading,
    error: query.error || null,
    refetch: query.refetch,
  };
}
