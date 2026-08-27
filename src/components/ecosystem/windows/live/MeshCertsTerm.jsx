// MeshCertsTerm — ventana `mesh_certs`: `curl -s https://api.meshrelay.xyz/sentinel/cert-status`
// (ACAO * verificado). Una línea por certificado: host:puerto · válido hasta · días restantes.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EndpointTerm } from './PulseTerm';
import { LIVE_META } from './index';

export const meta = LIVE_META.mesh_certs;

const selectCerts = (j) => {
  if (!j || !Array.isArray(j.certs)) return null;
  return {
    snsEnabled: j.snsEnabled === true,
    certs: j.certs
      .filter((c) => c && typeof c.host === 'string')
      .map((c) => ({
        host: c.host,
        port: c.port,
        issuer: typeof c.issuer === 'string' ? c.issuer : '',
        valid_to: typeof c.valid_to === 'string' ? c.valid_to : '',
        days: typeof c.days_until_expiry === 'number' ? c.days_until_expiry : null,
        status: typeof c.status === 'string' ? c.status : '',
      })),
  };
};

const formatCerts = (v) => {
  const width = Math.max(12, ...v.certs.map((c) => `${c.host}:${c.port}`.length));
  const lines = v.certs.map((c) =>
    `${`${c.host}:${c.port}`.padEnd(width)}  ${c.valid_to.slice(0, 10) || '—'}  ${c.days === null ? '—' : `${c.days}d`}  ${c.issuer}${c.status ? `  ${c.status}` : ''}`.trimEnd()
  );
  lines.push(`# certs=${v.certs.length} · sns=${v.snsEnabled}`);
  return lines;
};

const BLOCKS = [{ endpointKey: 'meshrelay_certs', select: selectCerts, format: formatCerts, maxLines: 20 }];

export default function MeshCertsTerm({ windowId }) {
  const { t } = useTranslation();
  return (
    <EndpointTerm
      windowId={windowId}
      title={t('ecosystem.windows.mesh_certs.title', 'meshrelay · certificados')}
      sourceLabel={t('ecosystem.windows.mesh_certs.source', 'api.meshrelay.xyz/sentinel/cert-status')}
      blocks={BLOCKS}
    />
  );
}
