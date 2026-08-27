// NarrativeMap — ventana `narrative`: el SystemMap ("cómo se comunican") como ventana del
// escritorio, alimentado por el grafo medido por c0der (useEcosystemGraph). Sin cifras propias.
import React from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import SourceChip from '../../desk/SourceChip';
import { useDesk } from '../../desk/useDesk';
import useEcosystemGraph from '../../useEcosystemGraph';
import SystemMap from '../../../system-map/SystemMap';
import { LIVE_META } from './index';


export const meta = LIVE_META.narrative;

export default function NarrativeMap({ windowId }) {
  const { t } = useTranslation();
  const { graph, index, status, fetchedAt } = useEcosystemGraph();
  const { state } = useDesk();
  const layout = state && state.isMobile ? 'tower' : 'wide';

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.narrative.title', 'narrativa — cómo se comunican')}
      sourceChip={{ status, fetchedAt, label: t('ecosystem.windows.narrative.source', 'graph.json · productos en vivo con URL') }}
    >
      <div data-narrative="" className="min-w-0">
        <p className="mb-2 font-mono text-xs text-text-secondary">
          {t(
            'landing.map.subtitle',
            'Productos por capa —enjambre, pilares, riel, comunidad— y aristas medidas por c0der sobre el código real: cada una lleva el protocolo que la hace funcionar. Las punteadas son latentes: documentadas, sin llamadas medidas todavía.'
          )}
        </p>
        {graph && index ? (
          <SystemMap graph={graph} index={index} layout={layout} />
        ) : (
          <p className="font-mono text-xs text-text-secondary">
            {status === 'error' ? t('ecosystem.status.unavailable', 'sin dato') : t('ecosystem.status.loading', 'cargando')}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-secondary">
          <SourceChip status={status} fetchedAt={fetchedAt} label="graph.json" />
          {graph ? <span>{`${index.products.length} · ${graph.edges.length}`}</span> : null}
          <span>{t('ecosystem.graph.provenance_footer', 'medido, no inferido — config/ecosystem.toml')}</span>
        </div>
      </div>
    </TermWindow>
  );
}
