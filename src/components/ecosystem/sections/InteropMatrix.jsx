// InteropMatrix — matriz de interoperabilidad generada del grafo medido por c0der (graph.json):
// una fila por arista (origen → destino, tipo, protocolo, evidencia, latente), ordenada por evidencia
// desc. <table> dentro de un contenedor overflow-x:auto; <caption> con generated_at. Cero cifras
// tipeadas: todo sale del JSON servido.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useEcosystemGraph from '../useEcosystemGraph';

const thCls = 'sticky top-0 bg-background px-3 py-2 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary';
const tdCls = 'px-3 py-1.5 font-mono text-xs text-text-primary';

export default function InteropMatrix() {
  const { t } = useTranslation();
  const { graph, index, status } = useEcosystemGraph();

  const rows = useMemo(() => {
    if (!graph || !index) return [];
    const name = (id) => (index.byId.get(id) ? index.byId.get(id).name : id);
    return graph.edges
      .map((e, i) => ({
        id: `${e.source}→${e.target}:${e.type}:${i}`,
        source: e.source,
        target: e.target,
        sourceName: name(e.source),
        targetName: name(e.target),
        type: e.type,
        protocol: e.protocol || '—',
        evidence: e.evidence_count,
        latent: e.type === 'latent' || e.planned
      }))
      .sort((a, b) => b.evidence - a.evidence || a.sourceName.localeCompare(b.sourceName) || a.targetName.localeCompare(b.targetName));
  }, [graph, index]);

  const generated = graph && graph.generated_at ? graph.generated_at : null;

  return (
    <section id="interop" aria-labelledby="interop-title" className="mx-auto w-full max-w-7xl px-4 py-12" data-interop>
      <h2 id="interop-title" className="mb-2 font-mono text-2xl font-bold text-text-primary">
        {t('ecosystem.interop.title', 'Matriz de interoperabilidad')}
      </h2>
      <p className="mb-4 font-mono text-xs text-text-secondary">
        {t('ecosystem.graph.provenance_footer', 'medido, no inferido — config/ecosystem.toml')}
        {index ? ` · ${index.counts.nodes} nodos · ${index.counts.edges} aristas · ${index.counts.latent} ${t('ecosystem.graph.latent', 'latente')}` : ''}
      </p>
      <div className="max-h-[70vh] overflow-auto rounded-lg border border-ultraviolet-darker/40 bg-background/80" data-interop-scroll>
        <table className="min-w-full border-collapse" data-interop-table data-interop-status={status}>
          <caption className="px-3 py-2 text-left font-mono text-[11px] text-text-secondary">
            {t('ecosystem.interop.generated', { defaultValue: 'generada de graph.json · {{time}}', time: generated || t('ecosystem.status.unavailable', 'sin dato') })}
            {status === 'loading' ? ' · …' : status === 'error' ? ` · ${t('ecosystem.status.error', 'error')}` : status ? ` · ${t(`ecosystem.status.${status}`, status)}` : ''}
          </caption>
          <thead>
            <tr>
              <th scope="col" className={thCls}>{t('ecosystem.interop.from', 'origen')}</th>
              <th scope="col" className={thCls}>{t('ecosystem.interop.to', 'destino')}</th>
              <th scope="col" className={thCls}>{t('ecosystem.interop.type', 'tipo')}</th>
              <th scope="col" className={thCls}>{t('ecosystem.interop.protocol', 'protocolo')}</th>
              <th scope="col" className={`${thCls} text-right`}>{t('ecosystem.interop.evidence', 'evidencia')}</th>
              <th scope="col" className={thCls}>{t('ecosystem.interop.planned', 'latente')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-ultraviolet-darker/30 hover:bg-ultraviolet/5" data-edge-source={r.source} data-edge-target={r.target}>
                <td className={tdCls}>
                  <span title={r.source}>{r.sourceName}</span>
                </td>
                <td className={tdCls}>
                  <span title={r.target}>{r.targetName}</span>
                </td>
                <td className={`${tdCls} text-text-secondary`}>{r.type}</td>
                <td className={`${tdCls} text-text-secondary`}>{r.protocol}</td>
                <td className={`${tdCls} text-right tabular-nums`}>{r.evidence}</td>
                <td className={`${tdCls} text-text-secondary`}>{r.latent ? t('ecosystem.graph.latent', 'latente') : '—'}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={6} className={`${tdCls} text-text-secondary`}>
                  {status === 'loading' ? '…' : t('ecosystem.graph.no_edges', 'sin aristas')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
