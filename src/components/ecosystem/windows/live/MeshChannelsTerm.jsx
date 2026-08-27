// MeshChannelsTerm — ventana `mesh_channels`: `curl -s https://api.meshrelay.xyz/irc/channels`
// (ACAO * verificado). Tabla nombre · usuarios · topic, tal cual la devuelve la API.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointTerm } from './PulseTerm';
import { LIVE_META } from './index';

export const meta = LIVE_META.mesh_channels;

const selectChannels = (j) => {
  const list = Array.isArray(j) ? j : Array.isArray(j && j.channels) ? j.channels : null;
  if (!list) return null;
  return list
    .filter((c) => c && typeof c.name === 'string')
    .map((c) => ({ name: c.name, users: typeof c.users === 'number' ? c.users : null, topic: typeof c.topic === 'string' ? c.topic : '' }));
};

const formatChannels = (list) => {
  const width = Math.max(8, ...list.map((c) => c.name.length));
  const lines = list.map((c) => `${c.name.padEnd(width)}  ${String(c.users ?? '—').padStart(3)}  ${c.topic}`.trimEnd());
  lines.push(`# ${list.length} · ${list.reduce((n, c) => n + (c.users || 0), 0)}`);
  return lines;
};

const BLOCKS = [{ endpointKey: 'meshrelay_channels', select: selectChannels, format: formatChannels, maxLines: 40 }];

export default function MeshChannelsTerm({ windowId }) {
  const { t } = useTranslation();
  return (
    <EndpointTerm
      windowId={windowId}
      title={t('ecosystem.windows.mesh_channels.title', 'meshrelay · canales')}
      sourceLabel={t('ecosystem.windows.mesh_channels.source', 'api.meshrelay.xyz/irc/channels')}
      blocks={BLOCKS}
    />
  );
}
