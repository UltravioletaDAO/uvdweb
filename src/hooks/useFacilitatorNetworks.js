import { useEffect, useState } from 'react';
import useLiveMetric from './useLiveMetric';
import { ENDPOINTS, loadSnapshot } from '../services/ecosystem/endpoints';
import { listFacilitatorNetworks } from '../services/facilitator/supportedNetworks';

// Las redes que sirve el facilitador, para la ficha /facilitator. De la fuente más rica a la más pobre:
//   1. GET /networks.json: el facilitador publica displayName, chainId y testnet de cada red;
//   2. GET /supported agrupado por red, solo si /networks.json no respondió;
//   3. el replay grabado de /supported, solo si tampoco respondió /supported.
// Sin ninguna devuelve networks: null, y la sección muestra el texto sin lista.
const selectSupportedNetworks = (json) => {
  const networks = listFacilitatorNetworks(json && json.kinds);
  return networks.length ? networks : null;
};

export default function useFacilitatorNetworks() {
  const doc = useLiveMetric({
    url: ENDPOINTS.facilitator_networks.url,
    cacheKey: 'facilitator_networks',
    select: ENDPOINTS.facilitator_networks.select,
  });
  const docFailed = doc.status === 'error';

  const supported = useLiveMetric({
    url: ENDPOINTS.facilitator_supported.url,
    cacheKey: 'facilitator_supported_networks',
    select: selectSupportedNetworks,
    enabled: docFailed,
  });
  const needReplay = docFailed && supported.status === 'error';

  const [replay, setReplay] = useState(null);
  useEffect(() => {
    if (!needReplay || replay) return undefined;
    let cancelled = false;
    loadSnapshot('facilitator_supported')
      .then((r) => {
        const networks = r ? selectSupportedNetworks(r.raw) : null;
        if (!cancelled && networks) setReplay(networks);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [needReplay, replay]);

  if (doc.value) return { networks: doc.value, source: 'networks.json' };
  if (docFailed && supported.value) return { networks: supported.value, source: 'supported' };
  if (needReplay && replay) return { networks: replay, source: 'replay' };
  return { networks: null, source: null };
}
