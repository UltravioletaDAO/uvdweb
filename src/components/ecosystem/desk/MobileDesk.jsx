// Escritorio para pantallas pequeñas. <768: chips de escritorios con scroll horizontal y una
// sección <details> por ventana (graph y pulse abiertas). 768–1023: grid de 2 columnas, sin
// arrastre ni anillo. Nunca iframe (los kinds `site` se omiten; el observatorio muestra póster).
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DESKTOPS } from '../desktops';
import { WindowHost } from '../windows/registry';
import { useDeskActions, useDeskState } from './useDesk';

const OPEN_BY_DEFAULT = new Set(['graph', 'pulse']);
const SKIP_ON_MOBILE = new Set(['site']);

function hint(params) {
  if (!params) return '';
  if (params.channel) return ` #${params.channel}`;
  if (params.key) return ` · ${params.key}`;
  if (params.snippet) return ` · ${params.snippet}`;
  if (params.nodeId) return ` · ${params.nodeId}`;
  return '';
}

export default function MobileDesk() {
  const { t } = useTranslation();
  const state = useDeskState();
  const actions = useDeskActions();
  // Secciones abiertas/tocadas por el usuario (graph y pulse abren por defecto).
  const [opened, setOpened] = useState(() => new Set());
  const [touched, setTouched] = useState(() => new Set());
  const toggle = (id, isOpen) => {
    setTouched((prev) => new Set(prev).add(id));
    setOpened((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const desk = DESKTOPS[state.desktop];
  // Orden declarado en DESKTOPS (el array conserva el orden de inserción), no por z.
  const windows = state.windows.filter((w) => w.desktop === state.desktop && !SKIP_ON_MOBILE.has(w.kind));

  const chips = (
    <nav className="uvd-mobile__desktops" aria-label={t('ecosystem.mobile.desktops_aria', 'Escritorios (desliza horizontalmente)')} data-mobile-desktops="">
      {DESKTOPS.map((d, i) => (
        <button
          key={d.id}
          type="button"
          className={`uvd-panel__desk ${i === state.desktop ? 'is-active' : ''}`}
          aria-current={i === state.desktop ? 'true' : undefined}
          data-desktop-btn={d.id}
          onClick={() => actions.setDesktop(i)}
        >
          {t(d.titleKey, d.id)}
        </button>
      ))}
    </nav>
  );

  if (state.isTablet) {
    return (
      <div className="uvd-mobile uvd-mobile--tablet" data-mobile-desk="tablet">
        {chips}
        <div className="uvd-mobile__grid">
          {windows
            .filter((w) => !w.minimized)
            .map((w) => (
              <div key={w.id} className="uvd-mobile__cell" data-mobile-window={w.kind}>
                <WindowHost win={w} focused={state.focusId === w.id} />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="uvd-mobile" data-mobile-desk="phone">
      {chips}
      <p className="uvd-mobile__hint">{t('ecosystem.mobile.hint', 'En móvil las ventanas son secciones desplegables; el escritorio completo está en pantallas de 1024 px o más.')}</p>
      {windows.map((w) => {
        const isOpen = opened.has(w.id) || (!touched.has(w.id) && OPEN_BY_DEFAULT.has(w.kind));
        return (
          <details
            key={w.id}
            className="uvd-mobile__details"
            data-mobile-window={w.kind}
            open={isOpen || undefined}
            onToggle={(e) => toggle(w.id, e.currentTarget.open)}
          >
            <summary className="uvd-mobile__summary">
              <span aria-hidden="true">▸</span> {t(`ecosystem.windows.${w.kind}.title`, w.kind)}{hint(w.params)}
              <span className="sr-only"> — {t('ecosystem.mobile.open_section', 'Abrir sección')}</span>
            </summary>
            {/* Solo se monta (y descarga su chunk) cuando la sección está abierta. */}
            <div className="uvd-mobile__section">{isOpen ? <WindowHost win={w} focused={false} /> : null}</div>
          </details>
        );
      })}
      {desk ? null : null}
    </div>
  );
}
