// MeshStatsTerm — ventana `mesh_stats`: `curl -s https://api.meshrelay.xyz/irc/stats` y
// `curl -s https://api.meshrelay.xyz/health` (ACAO * verificados), salida real recortada + chips.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointTerm, jsonLines } from './PulseTerm';
import { LIVE_META } from './index';

export const meta = LIVE_META.mesh_stats;

const selectStats = (j) => (j && typeof j === 'object' && typeof j.users === 'number' ? j : null);
const selectHealth = (j) => (j && typeof j === 'object' && typeof j.status === 'string' ? j : null);

const formatStats = (v) => jsonLines(v, 12);
const formatHealth = (v) => {
  const lines = jsonLines(v, 28);
  const services = v.services && typeof v.services === 'object' ? Object.entries(v.services) : [];
  if (services.length) {
    lines.push(`# ${services.map(([name, s]) => `${name}=${s && s.status ? s.status : '?'}`).join(' · ')}`);
  }
  return lines;
};

const BLOCKS = [
  { endpointKey: 'meshrelay_stats', select: selectStats, format: formatStats, maxLines: 12 },
  { endpointKey: 'meshrelay_health', select: selectHealth, format: formatHealth, maxLines: 30 },
];

export default function MeshStatsTerm({ windowId }) {
  const { t } = useTranslation();
  return (
    <EndpointTerm
      windowId={windowId}
      title={t('ecosystem.windows.mesh_stats.title', 'meshrelay · stats')}
      sourceLabel={t('ecosystem.windows.mesh_stats.source', 'api.meshrelay.xyz/irc/stats')}
      blocks={BLOCKS}
    />
  );
}
