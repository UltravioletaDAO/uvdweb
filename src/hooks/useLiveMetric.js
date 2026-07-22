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

/**
 * @param {object}   opts
 * @param {string}   opts.url         endpoint to fetch (must be CORS-reachable)
 * @param {string}   opts.cacheKey    stable key for the stale ladder
 * @param {function} opts.select      (json) => value. May throw; we catch it.
 * @param {*}        opts.snapshot    build-time constant, last rung of the ladder
 * @param {string}   opts.snapshotDate ISO date the snapshot was taken
 * @param {number}   opts.timeoutMs
 * @param {boolean}  opts.enabled     set false to skip fetching entirely
 */
export function useLiveMetric({
  url,
  cacheKey,
  select,
  snapshot = null,
  snapshotDate = null,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  enabled = true,
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

  const settleToFallback = useCallback(() => {
    if (!mounted.current) return;
    setState((prev) => {
      // Already showing a real number from cache — keep it, just mark stale.
      if (prev.value !== null && prev.value !== undefined && prev.status !== 'loading') {
        return prev.status === 'live' ? prev : { ...prev, status: prev.status };
      }
      if (snapshot !== null && snapshot !== undefined) {
        return { value: snapshot, status: 'snapshot', fetchedAt: snapshotDate };
      }
      return { value: null, status: 'error', fetchedAt: null };
    });
  }, [snapshot, snapshotDate]);

  useEffect(() => {
    if (!enabled || !url) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // select() runs on untrusted upstream shape — never let it escape.
        let value;
        try {
          value = typeof select === 'function' ? select(json) : json;
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
        debug('falling back for', url, e && e.message);
        if (!cancelled) settleToFallback();
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [url, key, select, timeoutMs, enabled, settleToFallback]);

  return state;
}

export default useLiveMetric;
