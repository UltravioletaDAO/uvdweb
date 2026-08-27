// FacHealthTerm — ventana `fac_health`: `curl -s https://facilitator.ultravioletadao.xyz/health`
// (ACAO * verificado): la respuesta real ({"status":"healthy"}) + chip de fuente.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointTerm, jsonLines } from './PulseTerm';
import { LIVE_META } from './index';

export const meta = LIVE_META.fac_health;

const selectHealth = (j) => (j && typeof j.status === 'string' ? j : null);
const formatHealth = (v, t) => [...jsonLines(v, 8), `# ${t('ecosystem.facilitator.health', 'salud del facilitator')}: ${v.status}`];

const BLOCKS = [{ endpointKey: 'facilitator_health', select: selectHealth, format: formatHealth, maxLines: 10 }];

export default function FacHealthTerm({ windowId }) {
  const { t } = useTranslation();
  return (
    <EndpointTerm
      windowId={windowId}
      title={t('ecosystem.windows.fac_health.title', 'facilitator · health')}
      sourceLabel={t('ecosystem.windows.fac_health.source', 'facilitator.ultravioletadao.xyz/health')}
      blocks={BLOCKS}
    />
  );
}
