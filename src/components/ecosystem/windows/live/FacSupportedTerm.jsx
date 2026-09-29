// FacSupportedTerm — ventana `fac_supported`: `curl -s https://facilitator.ultravioletadao.xyz/supported`
// (ACAO * verificado). El conteo se hace EN EL NAVEGADOR sobre la respuesta (kinds y redes distintas) y
// se etiqueta así; luego las primeras 8 redes mainnet, con la regla de src/services/facilitator/supportedNetworks.js.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointTerm } from './PulseTerm';
import { LIVE_META } from './index';
import { listFacilitatorNetworks } from '../../../../services/facilitator/supportedNetworks';

export const meta = LIVE_META.fac_supported;

const MAINNETS_SHOWN = 8;

export const selectSupported = (j) => {
  if (!j || !Array.isArray(j.kinds)) return null;
  const networks = listFacilitatorNetworks(j.kinds);
  const mainnets = networks.filter((n) => !n.testnet).map((n) => n.name);
  const schemes = [...new Set(j.kinds.map((k) => k && k.scheme).filter(Boolean))];
  return { kinds: j.kinds.length, networks: networks.length, mainnets, schemes };
};

const formatSupported = (v, t) => [
  `${t('ecosystem.pulse.supported_count', { defaultValue: '{{kinds}} kinds · {{networks}} redes', kinds: v.kinds, networks: v.networks })} (${t(
    'ecosystem.pulse.counted_in_browser',
    'contado en el navegador'
  )})`,
  `# ${t('ecosystem.facilitator.mainnets', { defaultValue: '{{count}} redes mainnet', count: v.mainnets.length })}: ${v.mainnets.slice(0, MAINNETS_SHOWN).join(', ')}${
    v.mainnets.length > MAINNETS_SHOWN ? ', …' : ''
  }`,
  `# schemes: ${v.schemes.join(', ')}`,
];

const BLOCKS = [{ endpointKey: 'facilitator_supported', select: selectSupported, format: formatSupported, maxLines: 6 }];

export default function FacSupportedTerm({ windowId }) {
  const { t } = useTranslation();
  return (
    <EndpointTerm
      windowId={windowId}
      title={t('ecosystem.windows.fac_supported.title', 'facilitator · supported')}
      sourceLabel={t('ecosystem.windows.fac_supported.source', 'facilitator.ultravioletadao.xyz/supported · contado en el navegador')}
      blocks={BLOCKS}
    />
  );
}
