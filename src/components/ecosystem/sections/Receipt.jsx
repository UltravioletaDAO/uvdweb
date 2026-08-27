// Receipt — "Recibo de datos": tres columnas generadas (no tipeadas) de las mismas fuentes que usa la
// página. EN VIVO = ENDPOINTS con cors:'live' (allowlist de eco-core); SNAPSHOT CON FECHA = replays
// grabados con curl (recorded_at); NO ES PÚBLICO = BLOCKED (razón) + los sitios que respondieron
// X-Frame-Options: DENY en los replays de cabeceras. Nota de entorno si no estamos en producción.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ENDPOINTS, BLOCKED } from '../../../services/ecosystem/endpoints';
// Índice compacto de replays (lo escribe record-replays.js; endpoints.js ya lo importa → 0 bytes extra).
// Solo metadata en pantalla: clave, comando, URL, fecha y cabeceras.
import replayIndex from '../../../data/ecosystem/replays/index.json';

const PROD_HOST = 'ultravioletadao.xyz';

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch (e) {
    return String(url || '');
  }
}

function endpointLabel(key, ep) {
  if (typeof ep.url === 'string') return ep.url.replace(/^https:\/\//, '');
  if (typeof ep.urlFor === 'function') {
    try {
      return String(ep.urlFor({ channel: '<canal>', limit: 30 })).replace(/^https:\/\//, '').replace(/%3C/g, '<').replace(/%3E/g, '>');
    } catch (e) {
      return key;
    }
  }
  return key;
}

function isoDay(iso) {
  const m = typeof iso === 'string' ? iso.match(/^(\d{4}-\d{2}-\d{2})/) : null;
  return m ? m[1] : null;
}

export function listReplays() {
  const entries = replayIndex && replayIndex.entries && typeof replayIndex.entries === 'object' ? replayIndex.entries : {};
  return Object.entries(entries)
    .map(([key, r]) => (r && typeof r === 'object' ? { key, url: r.url || null, cmd: r.cmd || '', recorded_at: r.recorded_at || null, headers: r.headers || null } : null))
    .filter(Boolean)
    .sort((a, b) => a.key.localeCompare(b.key));
}

export default function Receipt() {
  const { t } = useTranslation();
  const isDev = typeof window !== 'undefined' && window.location && window.location.hostname !== PROD_HOST;

  const live = useMemo(
    () =>
      Object.entries(ENDPOINTS || {})
        .filter(([, ep]) => ep && ep.cors === 'live')
        .map(([key, ep]) => ({ key, label: endpointLabel(key, ep), product: ep.product || null, method: ep.method || 'GET', pollMs: ep.pollMs || 0, thirdParty: ep.third_party === true, verifiedAt: ep.corsVerifiedAt || null }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );
  const prodOnly = useMemo(() => Object.entries(ENDPOINTS || {}).filter(([, ep]) => ep && ep.cors === 'prod-only').map(([key]) => key), []);
  const replays = useMemo(() => listReplays(), []);

  const blocked = useMemo(() => {
    const rows = (Array.isArray(BLOCKED) ? BLOCKED : []).map((b) => {
      const raw = b.reason || '';
      const translated = b.reasonKey ? t(b.reasonKey, raw || 'no expuesto públicamente') : raw || t('ecosystem.receipt.blocked_reason_private', 'no expuesto públicamente');
      const reason = raw && !translated.includes(raw) ? `${raw} · ${translated}` : translated;
      return { url: b.url, reason, replay: b.replay || null };
    });
    const seen = new Set(rows.map((r) => hostOf(r.url) + new URL(r.url, 'https://x').pathname));
    replays.forEach((r) => {
      const xfo = r.headers && typeof r.headers['x-frame-options'] === 'string' ? r.headers['x-frame-options'] : null;
      if (xfo && r.url) {
        const id = hostOf(r.url) + new URL(r.url).pathname;
        const reason = `X-Frame-Options: ${xfo} · ${t('ecosystem.receipt.blocked_reason_xfo', 'X-Frame-Options: DENY (no se puede embeber)')}`;
        if (!seen.has(id)) {
          seen.add(id);
          rows.push({ url: r.url, reason, replay: r.key, xfo });
        } else {
          const row = rows.find((x) => hostOf(x.url) + new URL(x.url, 'https://x').pathname === id);
          if (row && !/X-Frame-Options/i.test(row.reason)) row.reason = `${row.reason} · X-Frame-Options: ${xfo}`;
        }
      }
    });
    return rows;
  }, [replays, t]);

  const colCls = 'rounded-lg border border-ultraviolet-darker/40 bg-background/80 p-4';
  const hCls = 'mb-3 font-mono text-xs font-semibold tracking-wider';
  const liCls = 'flex flex-col gap-0.5 border-t border-ultraviolet-darker/30 py-2 font-mono text-[11px] leading-snug first:border-t-0';

  return (
    <section id="recibo" aria-labelledby="receipt-title" className="mx-auto w-full max-w-7xl px-4 py-12" data-receipt>
      <h2 id="receipt-title" className="mb-2 font-mono text-2xl font-bold text-text-primary">
        {t('ecosystem.receipt.title', 'Recibo de datos')}
      </h2>
      <p className="mb-6 max-w-3xl text-sm text-text-secondary">{t('ecosystem.receipt.intro', 'Cada número de esta página tiene fuente y fecha. Lo que se consulta en vivo sale de tu navegador contra el endpoint; lo que no, es un replay grabado con curl; lo que no es público, se dice.')}</p>
      {isDev ? (
        <p className="mb-6 rounded border border-amber-400/40 bg-amber-400/5 px-3 py-2 font-mono text-xs text-amber-200" role="note" data-receipt-dev-note>
          {t('ecosystem.receipt.dev_note', 'Estás en un entorno que no es ultravioletadao.xyz: algunos endpoints solo permiten CORS desde producción.')}
          {prodOnly.length ? ` (${prodOnly.join(', ')})` : ''}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <div className={colCls} data-receipt-col="live">
          <h3 className={`${hCls} text-emerald-300`}>● {t('ecosystem.receipt.live_h', 'EN VIVO EN TU NAVEGADOR')}</h3>
          <ul className="m-0 list-none p-0">
            {live.map((e) => (
              <li key={e.key} className={liCls}>
                <span className="break-all text-text-primary">
                  {e.method !== 'GET' ? `${e.method} ` : ''}
                  {e.label}
                </span>
                <span className="text-text-secondary">
                  {e.product ? `${e.product} · ` : ''}
                  {e.pollMs ? `poll ${Math.round(e.pollMs / 1000)} s` : 'una vez'}
                  {e.verifiedAt ? ` · CORS ${e.verifiedAt}` : ''}
                  {e.thirdParty ? ` · ${t('ecosystem.window.third_party_mcp', 'dato de terceros vía MCP de KarmaKadabra')}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={colCls} data-receipt-col="snapshot">
          <h3 className={`${hCls} text-amber-200`}>▪ {t('ecosystem.receipt.snapshot_h', 'SNAPSHOT, CON FECHA')}</h3>
          <ul className="m-0 list-none p-0">
            {replays.map((r) => (
              <li key={r.key} className={liCls}>
                <span className="break-all text-text-primary">{r.cmd || r.key}</span>
                <span className="text-text-secondary">
                  {r.key} · {t('ecosystem.window.recorded_at', { defaultValue: 'replay · grabado {{date}}', date: isoDay(r.recorded_at) || t('ecosystem.status.unavailable', 'sin dato') })}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={colCls} data-receipt-col="private">
          <h3 className={`${hCls} text-error-light`}>✕ {t('ecosystem.receipt.private_h', 'NO ES PÚBLICO, Y LO DECIMOS')}</h3>
          <ul className="m-0 list-none p-0">
            {blocked.map((b) => (
              <li key={b.url} className={liCls}>
                <span className="break-all text-text-primary">{String(b.url).replace(/^https:\/\//, '')}</span>
                <span className="text-text-secondary">
                  {b.reason}
                  {b.replay ? ` · replay ${b.replay}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
