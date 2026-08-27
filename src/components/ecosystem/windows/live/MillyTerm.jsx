// MillyTerm — ventana `milly`: `curl -s https://api.402milly.xyz/stats` (ACAO * verificado) con la
// salida real recortada y su chip de fuente (en vivo / último dato / snapshot grabado).
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointTerm, jsonLines } from './PulseTerm';
import { LIVE_META } from './index';

export const meta = LIVE_META.milly;

const selectStats = (j) => (j && typeof j === 'object' && !Array.isArray(j) ? j : null);
const formatStats = (v) => jsonLines(v, 24);

const BLOCKS = [{ endpointKey: 'milly_stats', select: selectStats, format: formatStats, maxLines: 24 }];

export default function MillyTerm({ windowId }) {
  const { t } = useTranslation();
  return (
    <EndpointTerm
      windowId={windowId}
      title={t('ecosystem.windows.milly.title', '402milly')}
      sourceLabel={t('ecosystem.windows.milly.source', 'api.402milly.xyz/stats')}
      blocks={BLOCKS}
    />
  );
}
