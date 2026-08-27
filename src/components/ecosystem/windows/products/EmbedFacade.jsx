// EmbedFacade — facade click-to-load genérica para embeber sitios del ecosistema
// (implementa docs/KARMAKADABRA_EMBED_PLAN.md de uvdweb).
//   idle → loading → live | timeout   (+ nowebgl cuando se exige WebGL y no hay vista clásica)
// Reglas: el iframe NUNCA se monta sin click; < 768 px solo póster + link-out (pestaña nueva);
// 768 … minWidth-1 px → classicUrl (si existe); requireWebGL sin WebGL → classicUrl; onload que no
// llega en 8 s → póster + link. <iframe loading="lazy" allow="fullscreen" referrerpolicy="strict-origin"
// title> SIN sandbox (rompería el WebSocket del observatorio). Fullscreen y "abrir en pestaña nueva"
// siempre visibles.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../../desk/TermWindow';

export const LOAD_TIMEOUT_MS = 8000;

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

function tierFor(width, minWidth) {
  if (width < 768) return 'mobile';
  if (width < minWidth) return 'classic';
  return 'full';
}

function useTier(minWidth) {
  const read = useCallback(() => (typeof window === 'undefined' ? 'full' : tierFor(window.innerWidth, minWidth)), [minWidth]);
  const [tier, setTier] = useState(read);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const queries = [window.matchMedia('(max-width: 767px)'), window.matchMedia(`(max-width: ${minWidth - 1}px)`)];
    const onChange = () => setTier(read());
    queries.forEach((q) => (q.addEventListener ? q.addEventListener('change', onChange) : q.addListener(onChange)));
    return () => queries.forEach((q) => (q.removeEventListener ? q.removeEventListener('change', onChange) : q.removeListener(onChange)));
  }, [minWidth, read]);
  return tier;
}

const BTN =
  'inline-flex min-h-[44px] items-center gap-2 rounded-md border border-ultraviolet/50 bg-background/80 px-4 py-2 font-mono text-sm text-text-primary transition-colors hover:border-ultraviolet-light hover:bg-ultraviolet/20 focus:outline focus:outline-2 focus:outline-purple-300 disabled:opacity-60';
const ICON_BTN =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded border border-ultraviolet-darker/60 bg-background/80 px-2 font-mono text-xs text-text-primary hover:border-ultraviolet-light focus:outline focus:outline-2 focus:outline-purple-300';

export default function EmbedFacade({ url, classicUrl = null, poster = null, posterAlt, title, minWidth = 1024, chip = null, requireWebGL = false }) {
  const { t } = useTranslation();
  const tier = useTier(minWidth);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  // phase: idle | loading | live | timeout | nowebgl ; src: URL montada en el iframe (null = sin iframe)
  const [state, setState] = useState({ phase: 'idle', src: null });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const load = useCallback(() => {
    if (tier === 'mobile') return; // en móvil el botón es un <a target=_blank>: nunca iframe
    let src = url;
    // 768 … minWidth-1 px: vista clásica si existe (si no, el sitio normal: p.ej. meshrelay.xyz no necesita WebGL).
    if (tier === 'classic' && classicUrl) src = classicUrl;
    // Sin WebGL en un embed que lo exige: clásica o, si no hay, póster + link-out.
    if (requireWebGL && !hasWebGL()) src = classicUrl;
    if (!src) {
      setState({ phase: 'nowebgl', src: null });
      return;
    }
    clearTimeout(timerRef.current);
    setState({ phase: 'loading', src });
    timerRef.current = setTimeout(() => {
      setState((s) => (s.phase === 'loading' ? { phase: 'timeout', src: null } : s));
    }, LOAD_TIMEOUT_MS);
  }, [tier, url, classicUrl, requireWebGL]);

  const onLoad = () => {
    clearTimeout(timerRef.current);
    setState((s) => (s.src ? { phase: 'live', src: s.src } : s));
  };

  const fullscreen = () => {
    const el = wrapRef.current;
    if (el && typeof el.requestFullscreen === 'function') {
      el.requestFullscreen().catch(() => {});
    }
  };

  const { phase, src } = state;
  const showPoster = phase !== 'live';
  const isClassicSrc = Boolean(src && classicUrl && src === classicUrl);

  return (
    <div
      ref={wrapRef}
      data-facade
      data-facade-state={phase}
      data-facade-tier={tier}
      aria-busy={phase === 'loading' ? 'true' : undefined}
      className="relative w-full overflow-hidden rounded-md border border-ultraviolet-darker/40 bg-background"
      style={{ aspectRatio: '16 / 10' }}
    >
      {src ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="fullscreen"
          referrerPolicy="strict-origin"
          onLoad={onLoad}
          className="absolute inset-0 h-full w-full border-0 bg-background"
        />
      ) : null}

      {showPoster ? (
        <div className="absolute inset-0 flex flex-col">
          {poster ? (
            <img src={poster} alt={posterAlt || title} width={1280} height={800} decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center break-all px-4 font-mono text-sm text-text-secondary" aria-hidden="true">
              {url}
            </div>
          )}
          <div className="relative z-10 flex h-full flex-col justify-between bg-gradient-to-t from-background/90 via-background/30 to-background/10 p-3">
            <div className="flex flex-wrap gap-2 pr-40">
              {chip ? (
                <span className="rounded border border-amber-400/50 bg-background/80 px-2 py-1 font-mono text-xs text-amber-200" data-facade-chip>
                  {chip}
                </span>
              ) : null}
              {phase === 'loading' ? (
                <span className="rounded border border-ultraviolet/50 bg-background/80 px-2 py-1 font-mono text-xs text-text-primary" role="status">
                  {isClassicSrc ? t('ecosystem.observatory.webgl_required', 'WebGL no disponible — se carga la vista clásica') : t('ecosystem.observatory.loading', 'cargando el observatorio…')}
                </span>
              ) : null}
              {phase === 'timeout' ? (
                <span className="rounded border border-error-light/60 bg-background/80 px-2 py-1 font-mono text-xs text-error-light" role="alert">
                  {t('ecosystem.observatory.timeout', 'el observatorio no respondió a tiempo — se muestra el póster')}
                </span>
              ) : null}
              {phase === 'nowebgl' ? (
                <span className="rounded border border-error-light/60 bg-background/80 px-2 py-1 font-mono text-xs text-error-light" role="alert">
                  {t('ecosystem.observatory.webgl_required', 'WebGL no disponible — se carga la vista clásica')}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tier === 'mobile' ? (
                <>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={BTN} data-facade-open>
                    {t('ecosystem.observatory.open_new_tab', 'Abrir en pestaña nueva ↗')}
                  </a>
                  <span className="font-mono text-xs text-text-secondary">{t('ecosystem.observatory.mobile_hint', 'en móvil el observatorio se abre en pestaña nueva')}</span>
                </>
              ) : (
                <button type="button" onClick={load} disabled={phase === 'loading'} className={BTN} data-facade-load>
                  {tier === 'classic' && classicUrl ? t('ecosystem.observatory.classic', 'vista clásica 2D (sin WebGL)') : t('ecosystem.observatory.load', 'Cargar observatorio 3D')}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="absolute right-2 top-2 z-20 flex gap-1">
        <button
          type="button"
          onClick={fullscreen}
          className={ICON_BTN}
          aria-label={t('ecosystem.observatory.fullscreen', 'Pantalla completa')}
          title={t('ecosystem.observatory.fullscreen', 'Pantalla completa')}
        >
          ⛶
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className={ICON_BTN} data-facade-external>
          {t('ecosystem.observatory.open_new_tab', 'Abrir en pestaña nueva ↗')}
        </a>
      </div>
    </div>
  );
}

// Ventana `site`: facade genérica para un sitio iframeable del ecosistema (params.url).
// Minimizada por defecto (DESKTOPS decide); sin póster: muestra el host hasta el click.
export function SiteWindow({ windowId, params = {} }) {
  const { t } = useTranslation();
  const url = typeof params.url === 'string' && /^https:\/\//.test(params.url) ? params.url : null;
  let host = '';
  try {
    host = url ? new URL(url).host : '';
  } catch (e) {
    host = '';
  }
  const title = `${t('ecosystem.windows.site.title', 'sitio')}@${host || '?'}`;
  return (
    <TermWindow
      windowId={windowId}
      title={title}
      sourceChip={{ status: url ? 'live' : 'unavailable', fetchedAt: null, label: url || t('ecosystem.status.unavailable', 'sin dato') }}
    >
      {url ? <EmbedFacade url={url} title={title} /> : <p className="font-mono text-xs text-error-light">{t('ecosystem.status.unavailable', 'sin dato')}</p>}
    </TermWindow>
  );
}
