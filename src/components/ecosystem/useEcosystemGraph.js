// Hook del grafo del ecosistema (contrato C2). Una sola query compartida por todas las
// ventanas y secciones de /ecosystem: React Query key ['ecosystem','graph'].
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GRAPH_SNAPSHOT_URL, indexGraph, loadEcosystemGraph } from '../../services/ecosystem/graph';
// Snapshot empaquetado (sincronizado por prebuild desde public/ecosystem/graph.json):
// initialData para que el braille/lista/wallpaper pinten su altura REAL en el primer
// frame — bajo red lenta el fetch de S3 llegaba tarde y el swap movía 2.000 px (CLS 0,31
// en Lighthouse móvil). Con el dato inicial local el swap a "live" no cambia el layout.
import graphSnapshot from '../../data/ecosystem/graph.snapshot.json';

export const ECOSYSTEM_GRAPH_QUERY_KEY = ['ecosystem', 'graph'];

export default function useEcosystemGraph() {
  const query = useQuery({
    queryKey: ECOSYSTEM_GRAPH_QUERY_KEY,
    queryFn: ({ signal }) => loadEcosystemGraph({ signal }),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    initialData: {
      graph: graphSnapshot,
      status: 'snapshot',
      fetchedAt: graphSnapshot.generated_at,
      url: GRAPH_SNAPSHOT_URL,
    },
    // Epoch: el initialData nace "viejo" para que React Query busque la copia viva de S3
    // al montar y el chip pase de snapshot -> live sin tocar el layout.
    initialDataUpdatedAt: 0,
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
