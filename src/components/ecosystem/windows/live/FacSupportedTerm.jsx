// FacSupportedTerm — ventana `fac_supported`: `curl -s https://facilitator.ultravioletadao.xyz/supported`
// (ACAO * verificado). El conteo se hace EN EL NAVEGADOR sobre la respuesta (kinds y redes únicas) y
// se etiqueta así; luego las primeras 8 redes mainnet con la misma regla isTestnet de src/agent/tools.js.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointTerm } from './PulseTerm';
import { LIVE_META } from './index';

export const meta = LIVE_META.fac_supported;

// Misma regla que tools.js:67 (hostnames de testnet en /supported: sepolia, fuji, amoy, devnet, testnet).
export const isTestnet = (network) => /sepolia|testnet|devnet|fuji|amoy/i.test(network);

const MAINNETS_SHOWN = 8;

const selectSupported = (j) => {
  if (!j || !Array.isArray(j.kinds)) return null;
  const networks = [];
  const seen = new Set();
  j.kinds.forEach((k) => {
    const n = k && typeof k.network === 'string' ? k.network : null;
    if (n && !seen.has(n)) {
      seen.add(n);
      networks.push(n);
    }
  });
  const mainnets = networks.filter((n) => !isTestnet(n));
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
