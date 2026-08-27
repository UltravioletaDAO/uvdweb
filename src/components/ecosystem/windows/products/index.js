// Registro de ventanas de producto (contrato C9, wave3/ECOSYSTEM_PLAN.md). eco-core lo fusiona con
// LIVE_WINDOWS en src/components/ecosystem/windows/registry.js. Cada Component es React.lazy: el
// código de una ventana solo viaja cuando su escritorio está en la cara frontal o en exposé.
// `meta` vive aquí (y no como export estático de cada módulo) para no arrastrar los módulos al chunk
// del registro: el registro necesita el meta sin cargar la ventana.
import React from 'react';

const meta = (kind, desktop, extra = {}) => ({
  kind,
  desktop,
  titleKey: `ecosystem.windows.${kind}.title`,
  sourceKey: `ecosystem.windows.${kind}.source`,
  defaultSize: { w: 600, h: 380 },
  minSize: { w: 320, h: 200 },
  defaultOpen: false,
  untrusted: false,
  ...extra
});

export const PRODUCT_WINDOWS = {
  observatory: {
    Component: React.lazy(() => import('./ObservatoryWindow')),
    meta: meta('observatory', 'karmakadabra', { defaultSize: { w: 760, h: 610 }, minSize: { w: 360, h: 260 }, defaultOpen: true })
  },
  site: {
    Component: React.lazy(() => import('./EmbedFacade').then((m) => ({ default: m.SiteWindow }))),
    meta: meta('site', null, { defaultSize: { w: 720, h: 480 }, minSize: { w: 360, h: 240 }, defaultOpen: false })
  },
  kk_kpi: {
    Component: React.lazy(() => import('./KkKpiTerm')),
    meta: meta('kk_kpi', 'karmakadabra', { defaultSize: { w: 560, h: 380 }, defaultOpen: true })
  },
  kk_trades: {
    Component: React.lazy(() => import('./KkTradesTerm')),
    meta: meta('kk_trades', 'karmakadabra', { defaultSize: { w: 640, h: 400 }, defaultOpen: false })
  },
  kk_status: {
    Component: React.lazy(() => import('./KkStatusTerm')),
    meta: meta('kk_status', 'karmakadabra', { defaultSize: { w: 520, h: 360 }, defaultOpen: true })
  },
  em_metrics: {
    Component: React.lazy(() => import('./EmMetricsTerm')),
    meta: meta('em_metrics', 'execution_market', { defaultSize: { w: 600, h: 420 }, defaultOpen: true, untrusted: true })
  },
  em_tasks: {
    Component: React.lazy(() => import('./EmTasksTerm')),
    meta: meta('em_tasks', 'execution_market', { defaultSize: { w: 600, h: 400 }, defaultOpen: true })
  },
  replay: {
    Component: React.lazy(() => import('./ReplayTerm')),
    meta: meta('replay', null, { defaultSize: { w: 600, h: 360 }, defaultOpen: true })
  },
  md: {
    Component: React.lazy(() => import('./MarkdownTerm')),
    meta: meta('md', 'describe_net', { defaultSize: { w: 680, h: 480 }, minSize: { w: 360, h: 240 }, defaultOpen: true })
  },
  code: {
    Component: React.lazy(() => import('./CodeTerm')),
    meta: meta('code', 'facilitator', { defaultSize: { w: 680, h: 440 }, minSize: { w: 360, h: 220 }, defaultOpen: true })
  }
};

export const PRODUCT_KINDS = Object.keys(PRODUCT_WINDOWS);

export default PRODUCT_WINDOWS;
