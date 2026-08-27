import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useLiveMetric — single source of truth for every number shown on the landing.
 *
 * The previous P0 on this site came from rendering upstream data without guards,
 * so this hook is built to NEVER throw and NEVER hand a component something it
 * cannot render. It implements the fallback ladder from docs/PLAN.md §4.5:
 *
 *   live  → value fetched from the endpoint just now
 *   stale → last known good value (persisted), shown with its timestamp
 *   snapshot → build-time constant, shown with its date
 *
 * A dead upstream degrades a tile. It must never blank the page.
 *
 * Ecosystem extension (2026-08-27, contract C4 of wave3/ECOSYSTEM_PLAN.md):
 *   pollMs  → 0 = fetch once; >0 = setInterval, paused while document.hidden,
 *             multiplied ×3 when navigator.connection.saveData is on.
 *   fetcher → async ({ signal, url }) => json. Default = fetch GET Accept: application/json.
 *   refetch → manual trigger (used by the "refresh" button of the terminals).
 */

const DEFAULT_TIMEOUT_MS = 8000;
const CACHE_PREFIX = 'uvd:metric:';

const debug = (...args) => {
  if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
    console.warn('[useLiveMetric]', ...args);
  }
};

function readCache(key) {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.value === undefined || parsed.value === null) return null;
    return parsed;
  } catch (e) {
    // Private mode / disabled storage / corrupt entry — all non-fatal.
    return null;
  }
}

function writeCache(key, value, fetchedAt) {
  try {
    window.localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ value, fetchedAt })
    );
  } catch (e) {
    // Quota or private mode. Losing the cache is acceptable; crashing is not.
  }
}

const saveDataOn = () => {
  try {
    return Boolean(navigator.connection && navigator.connection.saveData);
  } catch (e) {
    return false;
  }
};

async function defaultFetcher({ url, signal }) {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * @param {object}   opts
 * @param {string}   opts.url         endpoint to fetch (must be CORS-reachable)
 * @param {string}   opts.cacheKey    stable key for the stale ladder
 * @param {function} opts.select      (json) => value. May throw; we catch it.
 * @param {*}        opts.snapshot    build-time constant, last rung of the ladder
 * @param {string}   opts.snapshotDate ISO date the snapshot was taken
 * @param {number}   opts.timeoutMs
 * @param {boolean}  opts.enabled     set false to skip fetching entirely
 * @param {number}   opts.pollMs      0 = once; >0 = interval (paused when hidden, ×3 with saveData)
 * @param {function} opts.fetcher     async ({ signal, url }) => json (default: fetch GET)
 */
export function useLiveMetric({
  url,
  cacheKey,
  select,
  snapshot = null,
  snapshotDate = null,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  enabled = true,
  pollMs = 0,
  fetcher,
}) {
  const key = cacheKey || url || 'anon';

  // Seed synchronously from the ladder so the first paint is never empty.
  const [state, setState] = useState(() => {
    const cached = readCache(key);
    if (cached) {
      return { value: cached.value, status: 'stale', fetchedAt: cached.fetchedAt };
    }
    if (snapshot !== null && snapshot !== undefined) {
      return { value: snapshot, status: 'snapshot', fetchedAt: snapshotDate };
    }
    return { value: null, status: 'loading', fetchedAt: null };
  });

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // select()/fetcher are held in refs and deliberately kept OUT of the fetch
  // effect's dependencies. Callers naturally pass inline arrows, whose identity
  // changes every render — as dependencies they would re-run the effect forever
  // and hammer the upstream API.
  const selectRef = useRef(select);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    selectRef.current = select;
    fetcherRef.current = fetcher;
  }, [select, fetcher]);

  const settleToFallback = useCallback(() => {
    if (!mounted.current) return;
    setState((prev) => {
      // Already showing a real number — keep it. A value that was live and
      // failed to refresh is, by definition, stale now (shown with its time).
      if (prev.value !== null && prev.value !== undefined && prev.status !== 'loading') {
        return prev.status === 'live' ? { ...prev, status: 'stale' } : prev;
      }
      if (snapshot !== null && snapshot !== undefined) {
        return { value: snapshot, status: 'snapshot', fetchedAt: snapshotDate };
      }
      return { value: null, status: 'error', fetchedAt: null };
    });
  }, [snapshot, snapshotDate]);

  // A fetcher-only metric (e.g. an MCP tools/call) has no url; it is enabled
  // as long as a fetcher was supplied.
  const active = enabled && Boolean(url || fetcher);

  // Manual trigger: bumping the tick re-runs the fetch effect below.
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    let controller = null;
    let timer = null;
    let interval = null;

    const runOnce = async () => {
      if (cancelled) return;
      if (controller) controller.abort();
      controller = new AbortController();
      const signal = controller.signal;
      clearTimeout(timer);
      timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const fn = fetcherRef.current || defaultFetcher;
        const json = await fn({ url, signal });

        // select() runs on untrusted upstream shape — never let it escape.
        let value;
        try {
          const sel = selectRef.current;
          value = typeof sel === 'function' ? sel(json) : json;
        } catch (e) {
          debug('select() threw for', url, e);
          throw new Error('select failed');
        }

        if (value === undefined || value === null || Number.isNaN(value)) {
          throw new Error('empty value');
        }

        const fetchedAt = new Date().toISOString();
        writeCache(key, value, fetchedAt);
        if (!cancelled && mounted.current) {
          setState({ value, status: 'live', fetchedAt });
        }
      } catch (e) {
        debug('falling back for', url || key, e && e.message);
        if (!cancelled) settleToFallback();
      } finally {
        clearTimeout(timer);
      }
    };

    const effectivePoll = pollMs > 0 ? pollMs * (saveDataOn() ? 3 : 1) : 0;

    const startPolling = () => {
      if (!effectivePoll || interval) return;
      interval = setInterval(runOnce, effectivePoll);
    };
    const stopPolling = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const onVisibility = () => {
      if (typeof document === 'undefined') return;
      if (document.hidden) {
        stopPolling();
      } else {
        runOnce();
        startPolling();
      }
    };

    runOnce();
    if (effectivePoll) {
      if (typeof document === 'undefined' || !document.hidden) startPolling();
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopPolling();
      if (effectivePoll) document.removeEventListener('visibilitychange', onVisibility);
      if (controller) controller.abort();
    };
  }, [url, key, timeoutMs, active, pollMs, tick, settleToFallback]);

  return { ...state, refetch };
}

export default useLiveMetric;
