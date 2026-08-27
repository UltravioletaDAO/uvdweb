// Escritorio para pantallas pequeñas. <768: chips de escritorios con scroll horizontal y una
// sección <details> por ventana (graph y pulse abiertas). 768–1023: grid de 2 columnas, sin
// arrastre ni anillo. Nunca iframe (los kinds `site` se omiten; el observatorio muestra póster).
// Cada ventana se monta recién cuando su sección se acerca al viewport (IntersectionObserver):
// bajo el fold no hay fetch ni chunk lazy, y la caja reservada (min-height por kind) evita el
// salto cuando el contenido llega (fix 4 de VERIFICATION_OLA3 §9).
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DESKTOPS } from '../desktops';
import { metaFor, WindowHost } from '../windows/registry';
import { useDeskActions, useDeskState } from './useDesk';

const OPEN_BY_DEFAULT = new Set(['graph', 'pulse']);
const SKIP_ON_MOBILE = new Set(['site']);

/** Altura reservada mientras la ventana no montó. El grafo en móvil mide ~3 pantallas (braille +
 * 93 aristas): 120svh es una cota honesta que además deja a pulse BAJO el fold desde el primer
 * layout (su IntersectionObserver no dispara → sin fetch hasta scrollear). Para el resto la
 * meta del kind es una buena cota inferior. */
function reservedMinHeight(kind) {
  if (kind === 'graph') return '120svh';
  const meta = metaFor(kind);
  const h = meta && meta.defaultSize ? meta.defaultSize.h : 360;
  return `${Math.min(h, 440)}px`;
}

/** Monta children cuando el contenedor se acerca al viewport (una sola vez). Sin
 * IntersectionObserver (navegador viejo / test raro) monta de inmediato. */
function MountOnVisible({ kind, children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: '25% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);
  return (
    <div
      ref={ref}
      className="uvd-mobile__mount"
      data-mount-kind={kind}
      data-mounted={show ? 'true' : 'false'}
      style={{ minHeight: reservedMinHeight(kind) }}
    >
      {show ? children : null}
    </div>
  );
}

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
                <MountOnVisible kind={w.kind}>
                  <WindowHost win={w} focused={state.focusId === w.id} />
                </MountOnVisible>
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
            {/* Solo se monta (y descarga su chunk) con la sección abierta Y cerca del viewport. */}
            <div className="uvd-mobile__section">
              {isOpen ? (
                <MountOnVisible kind={w.kind}>
                  <WindowHost win={w} focused={false} />
                </MountOnVisible>
              ) : null}
            </div>
          </details>
        );
      })}
      {desk ? null : null}
    </div>
  );
}
