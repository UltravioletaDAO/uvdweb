// Panel superior (44 px, estilo Xfce/Compiz): marca, switcher de 6 escritorios, chip de
// procedencia de c0der (barrido, proyectos, aristas, en vivo/snapshot), reloj UTC, exposé,
// lista, atajos e idioma. Todas las cifras salen de graph.json (nunca hardcodeadas).
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../LanguageSwitcher';
import ProductIcon from '../ProductIcon';
import { DESKTOPS } from '../desktops';
import useEcosystemGraph from '../useEcosystemGraph';
import { useDesk } from './useDesk';

function useUtcClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer = null;
    const start = () => {
      if (timer) return;
      setNow(new Date());
      timer = setInterval(() => setNow(new Date()), 1000);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVis = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}Z`;
}

/** 2026-08-27T12:49:06+00:00 → 12:49Z (solo si parsea; si no, el ISO tal cual). */
function shortUtc(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}Z`;
}

export default function Panel({ onHelp }) {
  const { t } = useTranslation();
  const { state, actions } = useDesk();
  const { graph, index, status } = useEcosystemGraph();
  const clock = useUtcClock();

  const scan = graph && graph.source ? graph.source.scan_timestamp : null;
  const projects = graph && graph.source ? graph.source.projects_scanned : null;
  const edges = index ? index.counts.edges : null;
  const statusText = status === 'live' ? t('ecosystem.panel.scan_live', 'en vivo (S3)') : status === 'snapshot' ? t('ecosystem.panel.scan_snapshot', 'snapshot') : t(`ecosystem.status.${status}`, status);

  return (
    <header className="uvd-panel" role="banner" data-panel="">
      <span className="uvd-panel__brand" aria-label="UltraVioleta DAO">
        <span aria-hidden="true">◈</span> {t('ecosystem.panel.brand', 'uvd')}
      </span>

      <nav className="uvd-panel__desktops" aria-label={t('ecosystem.panel.desktops_aria', 'Escritorios')}>
        <button type="button" className="uvd-panel__arrow" aria-label={t('ecosystem.panel.prev_desktop', 'Escritorio anterior')} onClick={actions.prevDesktop}>‹</button>
        {DESKTOPS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            className={`uvd-panel__desk ${i === state.desktop ? 'is-active' : ''}`}
            aria-current={i === state.desktop ? 'true' : undefined}
            data-desktop-btn={d.id}
            onClick={() => actions.setDesktop(i)}
          >
            <span className="uvd-panel__desk-n" aria-hidden="true">{i}</span>{' '}
            <ProductIcon id={d.id} size={14} className="mr-0.5" /> {t(d.titleKey, d.id)}
          </button>
        ))}
        <button type="button" className="uvd-panel__arrow" aria-label={t('ecosystem.panel.next_desktop', 'Escritorio siguiente')} onClick={actions.nextDesktop}>›</button>
      </nav>

      <span
        className={`uvd-chip uvd-panel__scan ${status === 'live' ? 'uvd-chip--live' : 'uvd-chip--snapshot'}`}
        data-scan-chip=""
        data-graph-status={status}
        data-scan-timestamp={scan || ''}
        title={graph ? `${graph.source.tool} · ${scan}` : undefined}
      >
        <span aria-hidden="true">▪</span>{' '}
        {graph ? (
          <>
            {/* Visible: hora corta (HH:MMZ). Para lectores/verificación: el scan_timestamp completo. */}
            <span aria-hidden="true">{t('ecosystem.panel.scan_chip', { defaultValue: 'c0der · barrido {{time}} · {{projects}} proyectos · {{edges}} aristas', time: shortUtc(scan), projects, edges })}</span>
            <span className="sr-only">{t('ecosystem.panel.scan_chip', { defaultValue: 'c0der · barrido {{time}} · {{projects}} proyectos · {{edges}} aristas', time: scan, projects, edges })}</span>
            {` · ${statusText}`}
          </>
        ) : (
          `c0der · ${statusText}`
        )}
      </span>

      <time className="uvd-panel__clock" dateTime={new Date().toISOString()} aria-label={t('ecosystem.panel.clock_aria', 'Reloj UTC')} data-clock="">
        {clock}
      </time>

      <span className="uvd-panel__tools">
        <button
          type="button"
          className={`uvd-panel__tool ${state.mode === 'expose' ? 'is-active' : ''}`}
          aria-pressed={state.mode === 'expose'}
          title="F3"
          onClick={() => actions.setMode(state.mode === 'expose' ? 'desk' : 'expose')}
        >
          {t('ecosystem.panel.expose', 'Exposé')}
        </button>
        <button
          type="button"
          className={`uvd-panel__tool ${state.mode === 'list' ? 'is-active' : ''}`}
          aria-pressed={state.mode === 'list'}
          onClick={() => actions.setMode(state.mode === 'list' ? 'desk' : 'list')}
        >
          {t('ecosystem.panel.list_mode', 'Lista')}
        </button>
        <button type="button" className="uvd-panel__tool" aria-label={t('ecosystem.panel.help', 'Atajos de teclado')} title="?" onClick={onHelp}>
          ?
        </button>
        <LanguageSwitcher />
      </span>
    </header>
  );
}
