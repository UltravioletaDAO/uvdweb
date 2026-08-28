// NodeCard — ventana `node` (params.nodeId): ficha de un producto del grafo medido por c0der.
// Nombre, capa, status, tags, "depende de" (aristas salientes) y "alimenta a" (entrantes) con
// evidence_count y protocolo, URL, repo si es público y "ir al escritorio" si algún DESKTOPS[]
// lo incluye en nodeIds. Todo sale de graph.json; nada se inventa.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import ProductIcon from '../../ProductIcon';
import { useDesk } from '../../desk/useDesk';
import useEcosystemGraph from '../../useEcosystemGraph';
import { DESKTOPS } from '../../desktops';
import { LAYER_COLORS, PROTOCOL_COLORS } from '../../../../services/ecosystem/graph';
import { isLatent } from '../../graph/graphMath';
import { LIVE_META } from './index';


export const meta = LIVE_META.node;

const protocolColor = (protocol) => PROTOCOL_COLORS[protocol] || PROTOCOL_COLORS.null || '#475569';

function EdgeList({ title, items, t }) {
  return (
    <section className="min-w-0">
      <h3 className="mb-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary">{title}</h3>
      {items.length ? (
        <ul className="space-y-0.5 font-mono text-xs">
          {items.map(({ edge, node, dir }) => (
            <li key={`${dir}-${edge.source}-${edge.target}`} className="flex flex-wrap items-baseline gap-x-2">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: protocolColor(edge.protocol) }} />
              <span className="text-text-primary">{node ? node.name : dir === 'out' ? edge.target : edge.source}</span>
              <span className="text-text-secondary">
                {t(`landing.map.protocol.${edge.protocol || 'unknown'}`, edge.protocol || 'sin protocolo declarado')}
                {` · n=${edge.evidence_count}`}
                {isLatent(edge) ? ` · ${t('ecosystem.graph.latent', 'latente')}` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-xs text-text-secondary">{t('ecosystem.graph.no_edges', 'sin aristas medidas')}</p>
      )}
    </section>
  );
}

export default function NodeCard({ windowId, params = {} }) {
  const { t } = useTranslation();
  const { graph, index, status, fetchedAt } = useEcosystemGraph();
  const { state, actions } = useDesk();
  const nodeId = params.nodeId || (state && state.focusNode) || null;
  const node = nodeId && index ? index.byId.get(nodeId) || null : null;

  const dependsOn = useMemo(() => {
    if (!node || !index) return [];
    return index
      .outEdges(node.id)
      .map((edge) => ({ edge, node: index.byId.get(edge.target), dir: 'out' }))
      .sort((a, b) => b.edge.evidence_count - a.edge.evidence_count);
  }, [node, index]);
  const feeds = useMemo(() => {
    if (!node || !index) return [];
    return index
      .inEdges(node.id)
      .map((edge) => ({ edge, node: index.byId.get(edge.source), dir: 'in' }))
      .sort((a, b) => b.edge.evidence_count - a.edge.evidence_count);
  }, [node, index]);

  const desktop = useMemo(
    () => (node ? DESKTOPS.find((d) => Array.isArray(d.nodeIds) && d.nodeIds.includes(node.id)) || null : null),
    [node]
  );

  const title = node ? `${t('ecosystem.windows.node.title', 'nodo')} · ${node.name}` : t('ecosystem.windows.node.title', 'nodo');
  const layerColor = node ? LAYER_COLORS[node.layer] || LAYER_COLORS.external : null;

  return (
    <TermWindow
      windowId={windowId}
      title={title}
      sourceChip={{ status, fetchedAt, label: t('ecosystem.windows.node.source', 'graph.json · aristas medidas por c0der') }}
    >
      {!node ? (
        <p className="font-mono text-xs text-text-secondary" data-node-card="missing">
          {graph ? `${t('ecosystem.status.unavailable', 'sin dato')} · ${nodeId || '?'}` : t('ecosystem.status.loading', 'cargando')}
        </p>
      ) : (
        <div className="space-y-3" data-node-card={node.id}>
          <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-mono text-base font-semibold text-white">
              <ProductIcon id={node.id} size={16} className="mr-1.5" />
              {node.name}
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: layerColor }}>
              {t(`ecosystem.graph.layers.${node.layer}`, node.layer)}
            </span>
            <span className="font-mono text-[11px] text-text-secondary">{t(`ecosystem.graph.status.${node.status}`, node.status)}</span>
            <span className="font-mono text-[11px] text-text-secondary">
              {t('ecosystem.graph.node_aria', {
                defaultValue: '{{name}}, capa {{layer}}, {{degree}} conexiones',
                name: node.name,
                layer: t(`ecosystem.graph.layers.${node.layer}`, node.layer),
                degree: node.degree,
              })}
            </span>
          </header>

          {node.tags.length ? (
            <ul className="flex flex-wrap gap-1" aria-label="tags">
              {node.tags.map((tag) => (
                <li key={tag} className="rounded border border-ultraviolet/30 px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <EdgeList title={t('ecosystem.graph.depends_on', 'depende de')} items={dependsOn} t={t} />
            <EdgeList title={t('ecosystem.graph.feeds', 'alimenta a')} items={feeds} t={t} />
          </div>

          <dl className="space-y-1 font-mono text-xs">
            {node.url ? (
              <div className="flex gap-2">
                <dt className="text-text-secondary">url</dt>
                <dd className="min-w-0 break-all">
                  <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-ultraviolet-light underline-offset-2 hover:underline focus:outline focus:outline-2 focus:outline-purple-300">
                    {node.url}
                  </a>
                </dd>
              </div>
            ) : null}
            {node.repo ? (
              <div className="flex gap-2">
                <dt className="text-text-secondary">repo</dt>
                <dd className="min-w-0 break-all">
                  <a href={node.repo} target="_blank" rel="noopener noreferrer" className="text-ultraviolet-light underline-offset-2 hover:underline focus:outline focus:outline-2 focus:outline-purple-300">
                    {node.repo}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          {desktop && actions && typeof actions.setDesktop === 'function' ? (
            <button
              type="button"
              data-node-goto={desktop.id}
              onClick={() => actions.setDesktop(desktop.id)}
              className="min-h-[44px] rounded border border-ultraviolet/50 bg-ultraviolet/15 px-3 font-mono text-xs text-white hover:bg-ultraviolet/30 focus:outline focus:outline-2 focus:outline-purple-300"
            >
              {t('ecosystem.window.go_to_desktop', 'Ir al escritorio')} · {t(`ecosystem.panel.desktops.${desktop.id}`, desktop.id)}
            </button>
          ) : null}

          <p className="font-mono text-[10px] text-text-secondary">{t('ecosystem.graph.provenance_footer', 'medido, no inferido — config/ecosystem.toml')}</p>
        </div>
      )}
    </TermWindow>
  );
}
