// Registro de ventanas (contrato C9): fusiona los módulos de eco-live y eco-products.
// Cada entrada es { Component: React.lazy(...), meta:{ kind, desktop, titleKey, sourceKey,
// defaultSize, minSize, defaultOpen, untrusted } }. Los índices son livianos (solo lazy() y meta):
// el código de una ventana viaja únicamente cuando se monta en la cara frontal o en exposé.
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import TermWindow from '../desk/TermWindow';
import Terminal from '../desk/Terminal';
import { LIVE_WINDOWS, Wallpaper } from './live/index';
import { PRODUCT_WINDOWS } from './products/index';

export const WINDOWS = { ...LIVE_WINDOWS, ...PRODUCT_WINDOWS };

export const WINDOW_KINDS = Object.keys(WINDOWS);

export { Wallpaper };

/** meta.defaultSize del kind o null (el reducer aplica su tamaño por defecto). */
export function sizeFor(kind) {
  const entry = WINDOWS[kind];
  return entry && entry.meta && entry.meta.defaultSize ? entry.meta.defaultSize : null;
}

export function metaFor(kind) {
  const entry = WINDOWS[kind];
  return entry && entry.meta ? entry.meta : null;
}

/** Ventana de espera / kind sin módulo: dice la verdad ("sin dato · kind") en vez de inventar. */
function FallbackWindow({ win, loading }) {
  const { t } = useTranslation();
  const title = t(`ecosystem.windows.${win.kind}.title`, win.kind);
  const lines = loading
    ? [{ id: 'l', kind: 'note', text: `${t('ecosystem.status.loading', 'cargando')} · ${win.kind}` }]
    : [{ id: 'm', kind: 'err', text: `${t('ecosystem.status.unavailable', 'sin dato')} · ${win.kind}` }];
  return (
    <TermWindow windowId={win.id} title={title} sourceChip={{ status: loading ? 'loading' : 'unavailable', fetchedAt: null, label: '' }}>
      <Terminal lines={lines} cursor={loading} ariaLive="off" maxLines={4} />
    </TermWindow>
  );
}

/** Monta el componente del kind (lazy) con Suspense; si el kind no existe, FallbackWindow.
 * Memoizado por (id, kind, params, focused): mover/enfocar otra ventana no re-renderiza el contenido
 * de esta (TermWindow sí se actualiza por contexto, pero recibe los mismos children). */
export const WindowHost = React.memo(
  function WindowHost({ win, focused = false }) {
    const entry = WINDOWS[win.kind];
    if (!entry || !entry.Component) return <FallbackWindow win={win} loading={false} />;
    const Component = entry.Component;
    return (
      <Suspense fallback={<FallbackWindow win={win} loading />}>
        <Component windowId={win.id} params={win.params || undefined} focused={focused} />
      </Suspense>
    );
  },
  (prev, next) =>
    prev.win.id === next.win.id &&
    prev.win.kind === next.win.kind &&
    prev.focused === next.focused &&
    JSON.stringify(prev.win.params || null) === JSON.stringify(next.win.params || null)
);
