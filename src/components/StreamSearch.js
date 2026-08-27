import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_STREAM_SEARCH_API;

// Server snippets wrap matches in <mark>..</mark>; render them as React elements
// (never dangerouslySetInnerHTML - transcript text is third-party speech).
const renderSnippet = (snippet) => {
  const parts = snippet.split(/(<mark>.*?<\/mark>)/g);
  return parts.map((part, i) => {
    const m = part.match(/^<mark>(.*)<\/mark>$/);
    if (m) {
      return (
        <mark key={i} className="bg-violet-500/30 text-violet-200 rounded px-0.5">
          {m[1]}
        </mark>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

const StreamSearch = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // La tool WebMCP search_stream_memory (src/agent/tools.js) despacha este evento con la
  // respuesta cruda del Lambda para que el agente y el humano vean los mismos resultados.
  useEffect(() => {
    const onAgentSearch = (e) => {
      const { query: q, results: r } = e.detail || {};
      if (typeof q === 'string') setQuery(q);
      if (r && Array.isArray(r.results)) {
        setError(null);
        setResults(r);
      }
    };
    window.addEventListener('uvd:stream-search', onAgentSearch);
    return () => window.removeEventListener('uvd:stream-search', onAgentSearch);
  }, []);

  if (!API_URL) return null;

  const runSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return { error: 'invalid_query' };
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/?q=${encodeURIComponent(q)}&limit=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data);
      return {
        count: data.count,
        results: (data.results || []).slice(0, 10).map((r) => ({
          date: r.date_formatted,
          t: r.t,
          snippet: String(r.snippet || '').replace(/<\/?mark>/g, ''),
          url: r.url
        }))
      };
    } catch (err) {
      setError(t('streamSummaries.search.error'));
      setResults(null);
      return { error: 'search_failed' };
    } finally {
      setLoading(false);
    }
  };

  // WebMCP declarativo (form toolname="stream_search_form"): si el submit lo disparó un agente,
  // hay que responderle con respondWith(); si no, Chrome rechaza la llamada por el preventDefault().
  const onFormSubmit = (e) => {
    const result = runSearch(e);
    const native = e.nativeEvent;
    if (native?.agentInvoked && typeof native.respondWith === 'function') {
      native.respondWith(result);
    }
  };

  return (
    <section
      className="mb-6 bg-zinc-800/30 rounded-lg p-4 border border-violet-700/30"
      aria-labelledby="stream-search-title"
    >
      <h2 id="stream-search-title" className="text-violet-400 font-semibold text-sm mb-3">
        {t('streamSummaries.search.title')}
      </h2>
      <form
        onSubmit={onFormSubmit}
        className="flex gap-2"
        toolname="stream_search_form"
        tooldescription="Search the UltravioletaDAO stream transcripts (2024-2026) and show the matching moments on this page"
      >
        <input
          type="search"
          name="q"
          toolparamdescription="Search query (2-120 chars)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('streamSummaries.search.placeholder')}
          className="flex-1 bg-zinc-900/70 border border-zinc-700 rounded-lg px-4 py-2 text-sm
            text-text-primary placeholder-text-secondary/50 focus:outline-none
            focus:border-violet-500"
          aria-label={t('streamSummaries.search.title')}
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm
            font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? t('streamSummaries.search.searching') : t('streamSummaries.search.button')}
        </button>
      </form>

      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

      {results && !error && (
        <div className="mt-4">
          <p className="text-text-secondary text-xs mb-3">
            {results.count > 0
              ? t('streamSummaries.search.resultsCount', { count: results.count })
              : `${t('streamSummaries.search.noResults')} "${results.query}"`}
            {results.count > 0 && (
              <span className="ml-2 text-text-secondary/60">
                {t('streamSummaries.search.disclaimer')}
              </span>
            )}
          </p>
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {results.results.map((r, i) => (
              <li
                key={`${r.vod_id}-${r.start_time}-${i}`}
                className="bg-zinc-900/50 border border-zinc-700/60 rounded-lg p-3"
              >
                <p className="text-sm text-text-primary leading-relaxed">
                  "…{renderSnippet(r.snippet)}…"
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-text-secondary">{r.date_formatted}</span>
                  {r.title && (
                    <span className="text-text-secondary/70 truncate max-w-xs">{r.title}</span>
                  )}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 font-medium"
                  >
                    {t('streamSummaries.search.openVod')} ({r.t}) ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default StreamSearch;
