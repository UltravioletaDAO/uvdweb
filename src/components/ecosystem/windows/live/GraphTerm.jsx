// GraphTerm — ventana `graph` (c0der@stack): el mapa medido por c0der dentro de una terminal.
// Cabecera REAL: el prompt `curl -s https://ultravioletadao.xyz/ecosystem/graph.json | jq .source`
// y debajo el objeto `source` del grafo que el navegador acaba de cargar (S3 en vivo o snapshot;
// el chip dice cuál). Vistas: `m` cicla braille → lista → narrativa; ↑↓ recorre los nodos por
// degree desc (sincroniza actions.highlightNode con el wallpaper); Enter lista las aristas del
// nodo con n=<evidence_count> y protocolo; `e` imprime la nota de evidencia; `l` va a la lista.
// Móvil: braille 40×20 + la lista completa de aristas (<ul>) siempre visible.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import SourceChip from '../../desk/SourceChip';
import { useDesk } from '../../desk/useDesk';
import useEcosystemGraph from '../../useEcosystemGraph';
import BrailleGraph, { BRAILLE_DESKTOP, BRAILLE_MOBILE } from '../../graph/BrailleGraph';
import SystemMap from '../../../system-map/SystemMap';
import { isLatent, sortByDegree } from '../../graph/graphMath';
import { LIVE_META } from './index';


export const meta = LIVE_META.graph;

export const GRAPH_CURL = 'curl -s https://ultravioletadao.xyz/ecosystem/graph.json | jq .source';
export const VIEWS = ['braille', 'list', 'narrative'];
const OUT_MAX = 60;

const scanTime = (iso) => {
  if (!iso || typeof iso !== 'string') return '—';
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}Z` : iso;
};

const isEditable = (el) =>
  Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable));

export default function GraphTerm({ windowId, params = {} }) {
  const { t } = useTranslation();
  const { graph, index, status, fetchedAt, url } = useEcosystemGraph();
  const { state, actions } = useDesk();
  const isMobile = Boolean(state && state.isMobile);

  const [view, setView] = useState(() => (VIEWS.includes(params.view) ? params.view : 'braille'));
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [out, setOut] = useState([]);
  const rootRef = useRef(null);
  const touchedRef = useRef(false);
  const outSeq = useRef(0);

  const nodesByDegree = useMemo(() => (graph ? sortByDegree(graph.nodes) : []), [graph]);
  const selected = nodesByDegree[Math.min(selectedIdx, Math.max(0, nodesByDegree.length - 1))] || null;

  // Sincroniza el resaltado del wallpaper solo después de que el visitante navegó con el teclado.
  useEffect(() => {
    if (!touchedRef.current || !actions || typeof actions.highlightNode !== 'function') return undefined;
    actions.highlightNode(selected ? selected.id : null);
    return undefined;
  }, [selected, actions]);
  useEffect(
    () => () => {
      if (touchedRef.current && actions && typeof actions.highlightNode === 'function') actions.highlightNode(null);
    },
    [actions]
  );

  const push = useCallback((lines) => {
    setOut((prev) => {
      const next = [...prev, ...lines.map((text) => ({ id: `o${(outSeq.current += 1)}`, text }))];
      return next.length > OUT_MAX ? next.slice(next.length - OUT_MAX) : next;
    });
  }, []);

  const protocolLabel = useCallback(
    (e) => t(`landing.map.protocol.${e.protocol || 'unknown'}`, e.protocol || 'sin protocolo declarado'),
    [t]
  );
  const latentTag = useCallback((e) => (isLatent(e) ? ` · ${t('ecosystem.graph.latent', 'latente')}` : ''), [t]);

  const printEdges = useCallback(() => {
    if (!selected || !index) return;
    const outs = index.outEdges(selected.id);
    const ins = index.inEdges(selected.id);
    const lines = [
      `${selected.name} · ${t(`ecosystem.graph.layers.${selected.layer}`, selected.layer)} · ${t(
        `ecosystem.graph.status.${selected.status}`,
        selected.status
      )} · degree=${selected.degree}`,
    ];
    lines.push(`${t('ecosystem.graph.depends_on', 'depende de')} (${outs.length})`);
    outs.forEach((e) => {
      const n = index.byId.get(e.target);
      lines.push(`  → ${n ? n.name : e.target}  n=${e.evidence_count}  ${protocolLabel(e)}${latentTag(e)}`);
    });
    lines.push(`${t('ecosystem.graph.feeds', 'alimenta a')} (${ins.length})`);
    ins.forEach((e) => {
      const n = index.byId.get(e.source);
      lines.push(`  ← ${n ? n.name : e.source}  n=${e.evidence_count}  ${protocolLabel(e)}${latentTag(e)}`);
    });
    if (!outs.length && !ins.length) lines.push(`  ${t('ecosystem.graph.no_edges', 'sin aristas medidas')}`);
    push(lines);
  }, [selected, index, t, protocolLabel, latentTag, push]);

  const onKeyDown = useCallback(
    (ev) => {
      if (isEditable(ev.target) || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      switch (ev.key) {
        case 'm':
        case 'M':
          ev.preventDefault();
          setView((v) => VIEWS[(VIEWS.indexOf(v) + 1) % VIEWS.length]);
          break;
        case 'l':
        case 'L':
          ev.preventDefault();
          setView('list');
          break;
        case 'e':
        case 'E':
          ev.preventDefault();
          push([`# ${t('ecosystem.graph.evidence_note', 'evidencia = archivos con llamadas medidas por c0der; las rutas no se publican')}`]);
          break;
        case 'ArrowDown':
          ev.preventDefault();
          touchedRef.current = true;
          setSelectedIdx((i) => Math.min(nodesByDegree.length - 1, i + 1));
          break;
        case 'ArrowUp':
          ev.preventDefault();
          touchedRef.current = true;
          setSelectedIdx((i) => Math.max(0, i - 1));
          break;
        case 'Enter':
          ev.preventDefault();
          printEdges();
          break;
        default:
      }
    },
    [nodesByDegree.length, printEdges, push, t]
  );

  const headerLines = useMemo(() => {
    const lines = [{ id: 'cmd', kind: 'prompt', text: GRAPH_CURL }];
    if (!graph) {
      lines.push({ id: 'wait', kind: status === 'error' ? 'err' : 'note', text: status === 'error' ? t('ecosystem.status.unavailable', 'sin dato') : '…' });
      return lines;
    }
    JSON.stringify(graph.source, null, 2)
      .split('\n')
      .forEach((text, i) => lines.push({ id: `s${i}`, kind: 'out', text }));
    lines.push({
      id: 'hdr',
      kind: 'note',
      text: t('ecosystem.graph.header', {
        defaultValue: 'c0der · barrido {{time}} · {{projects}} proyectos escaneados · {{edges}} aristas',
        time: scanTime(graph.source.scan_timestamp),
        projects: graph.source.projects_scanned,
        edges: graph.edges.length,
      }),
    });
    return lines;
  }, [graph, status, t]);

  const braille = isMobile ? BRAILLE_MOBILE : BRAILLE_DESKTOP;
  const showEdgeList = isMobile || view === 'list';
  const viewLabel = t(`ecosystem.graph.view_${view}`, view);

  return (
    <TermWindow
      windowId={windowId}
      title={t('ecosystem.windows.graph.title', 'c0der@stack — mapa del ecosistema')}
      sourceChip={{ status, fetchedAt, label: t('ecosystem.windows.graph.source', 'graph.json · medido por c0der (S3 en vivo o snapshot versionado)') }}
    >
      <div
        ref={rootRef}
        tabIndex={0}
        role="group"
        aria-label={`${t('ecosystem.windows.graph.title', 'c0der@stack — mapa del ecosistema')} · ${t('ecosystem.graph.keys', 'm vista · ↑↓ nodo · Enter aristas · e evidencia · l lista')}`}
        aria-keyshortcuts="m ArrowUp ArrowDown Enter e l"
        onKeyDown={onKeyDown}
        onClick={() => {
          if (rootRef.current && !isEditable(document.activeElement)) rootRef.current.focus({ preventScroll: true });
        }}
        className="min-w-0 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300"
        data-graph-term=""
      >
        {/* minLines reserva las filas del `source` + la nota antes de que llegue el JSON (CLS 0);
            la línea del url siempre ocupa su fila por lo mismo. */}
        <Terminal lines={headerLines} typewriter cursor={false} ariaLive="off" maxLines={20} minLines={11} />
        <p className="mt-1 min-h-[15px] font-mono text-[10px] text-text-secondary">{url ? `# ${url}` : ' '}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span className="rounded border border-ultraviolet/40 px-1.5 py-0.5 text-white">{viewLabel}</span>
          {selected ? (
            <span>
              ▸ {selected.name} · degree={selected.degree}
            </span>
          ) : null}
          <span className="hidden sm:inline">{t('ecosystem.graph.keys', 'm vista · ↑↓ nodo · Enter aristas · e evidencia · l lista')}</span>
        </div>

        {/* min-height = caja del braille (rows × 11px × 1.05) mientras el grafo carga: lo que
            está debajo (aristas, footer) no se mueve cuando el dibujo aparece. */}
        <div
          className="mt-2 min-w-0 overflow-x-auto"
          style={{ minHeight: `${Math.round(braille.rows * 11 * 1.05)}px` }}
          data-graph-view={view}
          data-graph-selected={selected ? selected.id : ''}
        >
          {graph && index ? (
            <>
              {view === 'braille' ? <BrailleGraph graph={graph} cols={braille.cols} rows={braille.rows} selectedId={selected ? selected.id : null} /> : null}
              {view === 'narrative' ? <SystemMap graph={graph} index={index} layout={isMobile ? 'tower' : 'wide'} /> : null}
              {view === 'list' ? (
                <ol className="mb-3 space-y-0.5 font-mono text-xs" data-graph-nodes="">
                  {nodesByDegree.map((n) => (
                    <li key={n.id} aria-current={selected && selected.id === n.id ? 'true' : undefined} className={selected && selected.id === n.id ? 'text-white' : 'text-text-secondary'}>
                      {selected && selected.id === n.id ? '▸ ' : '  '}
                      {n.name}
                      {` · ${t(`ecosystem.graph.layers.${n.layer}`, n.layer)} · degree=${n.degree} · ${t(`ecosystem.graph.status.${n.status}`, n.status)}`}
                    </li>
                  ))}
                </ol>
              ) : null}
              {showEdgeList ? (
                <ul className="space-y-0.5 font-mono text-[11px] text-text-secondary" data-graph-edges="">
                  {graph.edges.map((e, i) => {
                    const s = index.byId.get(e.source);
                    const tg = index.byId.get(e.target);
                    const hot = selected && (e.source === selected.id || e.target === selected.id);
                    return (
                      <li key={`${e.source}-${e.target}-${i}`} className={hot ? 'text-white' : undefined}>
                        {(s ? s.name : e.source) + ' → ' + (tg ? tg.name : e.target)}
                        {`  n=${e.evidence_count}  ${protocolLabel(e)}${latentTag(e)}`}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="font-mono text-xs text-text-secondary">{status === 'error' ? t('ecosystem.status.unavailable', 'sin dato') : t('ecosystem.status.loading', 'cargando')}</p>
          )}
        </div>

        {out.length ? (
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-text-primary" style={{ overflowWrap: 'anywhere' }} data-graph-out="" aria-live="polite">
            {out.map((l) => l.text).join('\n')}
          </pre>
        ) : null}

        <footer className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-secondary">
          <SourceChip status={status} fetchedAt={fetchedAt} label="graph.json" />
          <span>{t('ecosystem.graph.provenance_footer', 'medido, no inferido — config/ecosystem.toml')}</span>
        </footer>
      </div>
    </TermWindow>
  );
}
