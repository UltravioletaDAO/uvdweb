// MarkdownTerm — ventana `md`: documento público de Describe.net (index.md o llms.txt) leído con CORS
// (describe.net responde ACAO * y X-Frame-Options: DENY → se lee el markdown, no se embebe).
// Fetch de texto con Accept: text/markdown, cache 1 h en localStorage (escalera de useLiveMetric),
// snapshot = replay grabado. react-markdown + remark-gfm; enlaces en pestaña nueva con noopener;
// imágenes deshabilitadas; nunca HTML crudo (react-markdown no lo renderiza sin rehype-raw).
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TermWindow from '../../desk/TermWindow';
import Terminal from '../../desk/Terminal';
import useLiveMetric from '../../../../hooks/useLiveMetric';
import { ENDPOINTS } from '../../../../services/ecosystem/endpoints';
import { loadReplay, replayText, ReplayLink, REPLAY_LINKS } from './ReplayTerm';

const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_CHARS = 60000;
// Mismo prefijo que useLiveMetric (src/hooks/useLiveMetric.js): solo se lee para decidir si el dato
// stale tiene menos de 1 h y ahorrarse el fetch. Nunca se escribe desde aquí.
const METRIC_CACHE_PREFIX = 'uvd:metric:';

function cachedIsFresh(key) {
  try {
    const raw = window.localStorage.getItem(METRIC_CACHE_PREFIX + key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const at = parsed && typeof parsed.fetchedAt === 'string' ? Date.parse(parsed.fetchedAt) : NaN;
    return Number.isFinite(at) && Date.now() - at < CACHE_TTL_MS && typeof parsed.value === 'string' && parsed.value.length > 0;
  } catch (e) {
    return false;
  }
}

// Mapa cerrado de documentos (params.key). La URL sale de ENDPOINTS si existe la entrada.
const DOCS = {
  describe_index_md: { url: 'https://describe.net/index.md', titleKey: 'ecosystem.describe.index_title', titleFallback: 'describe.net/index.md' },
  describe_llms: { url: 'https://describe.net/llms.txt', titleKey: 'ecosystem.describe.llms_title', titleFallback: 'describe.net/llms.txt' }
};

async function fetchMarkdown({ url, signal }) {
  const res = await fetch(url, { signal, headers: { Accept: 'text/markdown, text/plain;q=0.9, */*;q=0.1' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const selectText = (txt) => (typeof txt === 'string' && txt.trim() ? txt.slice(0, MAX_CHARS) : null);

const cx = (base) => ({ node, ...props }) => React.createElement(base.tag, { ...props, className: base.cls });
const H = (tag, cls) => cx({ tag, cls });

const COMPONENTS = {
  h1: H('h1', 'mb-2 mt-3 text-lg font-bold text-violet-300'),
  h2: H('h2', 'mb-2 mt-3 text-base font-bold text-violet-300'),
  h3: H('h3', 'mb-1 mt-2 text-sm font-semibold text-violet-300'),
  h4: H('h4', 'mb-1 mt-2 text-sm font-semibold text-violet-400'),
  p: H('p', 'my-2 text-xs leading-relaxed text-text-secondary'),
  ul: H('ul', 'my-2 list-disc space-y-1 pl-5 text-xs text-text-secondary'),
  ol: H('ol', 'my-2 list-decimal space-y-1 pl-5 text-xs text-text-secondary'),
  li: H('li', 'leading-relaxed'),
  blockquote: H('blockquote', 'my-2 border-l-2 border-ultraviolet/60 pl-3 text-xs italic text-text-secondary'),
  code: H('code', 'rounded bg-background-lighter px-1 py-0.5 font-mono text-[11px] text-cyan-200'),
  pre: H('pre', 'my-2 overflow-x-auto rounded border border-ultraviolet-darker/40 bg-background p-2 font-mono text-[11px] text-text-primary'),
  table: ({ node, ...props }) => (
    <div className="my-2 overflow-x-auto">
      <table {...props} className="min-w-full border-collapse text-xs" />
    </div>
  ),
  th: H('th', 'border border-ultraviolet-darker/40 px-2 py-1 text-left font-semibold text-text-primary'),
  td: H('td', 'border border-ultraviolet-darker/40 px-2 py-1 text-text-secondary'),
  hr: H('hr', 'my-3 border-ultraviolet-darker/40'),
  a: ({ node, href, children, ...props }) => {
    const safe = typeof href === 'string' && /^(https?:|mailto:)/i.test(href) ? href : undefined;
    return (
      <a {...props} href={safe} target="_blank" rel="noopener noreferrer" className="text-ultraviolet-light underline-offset-2 hover:underline focus:outline focus:outline-2 focus:outline-purple-300">
        {children}
      </a>
    );
  },
  img: () => null
};

export default function MarkdownTerm({ windowId, params = {} }) {
  const { t } = useTranslation();
  const key = typeof params.key === 'string' && DOCS[params.key] ? params.key : null;
  const doc = key ? DOCS[key] : null;
  const url = key ? (ENDPOINTS && ENDPOINTS[key] && ENDPOINTS[key].url) || doc.url : null;
  const replay = key ? loadReplay(key) : null;
  const snapshot = useMemo(() => (key ? selectText(replayText(key)) : null), [key]);

  // Cache de 1 h: si al montar hay un dato stale más fresco que 1 h, no se vuelve a pedir
  // (el botón "Actualizar" lo fuerza igual). Se decide una sola vez por montaje.
  const [skipFetch, setSkipFetch] = useState(() => Boolean(key) && cachedIsFresh(key));
  const { value, status, fetchedAt, refetch: refetchMetric } = useLiveMetric({
    url,
    cacheKey: key || 'md_unknown',
    fetcher: fetchMarkdown,
    select: selectText,
    snapshot,
    snapshotDate: replay ? replay.recorded_at : null,
    pollMs: 0,
    enabled: Boolean(url) && !skipFetch,
    timeoutMs: 10000
  });
  const refetch = () => {
    setSkipFetch(false);
    refetchMetric();
  };

  const lines = useMemo(() => {
    if (!url) return [{ id: 'missing', kind: 'err', text: `${t('ecosystem.status.unavailable', 'sin dato')} · md ${params.key || '?'}` }];
    return [{ id: 'cmd', kind: 'prompt', text: `curl -s -H 'Accept: text/markdown' ${url}` }];
  }, [url, params.key, t]);

  const title = doc ? t(doc.titleKey, doc.titleFallback) : t('ecosystem.windows.md.title', 'markdown');

  return (
    <TermWindow
      windowId={windowId}
      title={title}
      sourceChip={{ status, fetchedAt, label: url || t('ecosystem.windows.md.source', 'documento público del producto, leído con CORS') }}
      actions={[{ icon: '⟳', label: t('ecosystem.window.refresh', 'Actualizar'), onClick: refetch }]}
    >
      <Terminal lines={lines} typewriter ariaLive="off" maxLines={4} />
      {value ? (
        <div className="uvd-md mt-2 max-w-none" data-md-key={key}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS} skipHtml>
            {value}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="mt-2 font-mono text-xs text-text-secondary">{status === 'loading' ? '…' : t('ecosystem.status.unavailable', 'sin dato')}</p>
      )}
      <p className="mt-3 font-mono text-[11px] text-amber-200/90">{t('ecosystem.describe.no_iframe', 'describe.net responde X-Frame-Options: DENY — se enlaza, no se embebe')}</p>
      <ReplayLink link={REPLAY_LINKS.describe_headers} t={t} />
    </TermWindow>
  );
}

export { CACHE_TTL_MS };
