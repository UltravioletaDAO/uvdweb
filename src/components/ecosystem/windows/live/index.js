// Registro de ventanas "live" del escritorio /ecosystem (contrato C9, wave3/ECOSYSTEM_PLAN.md).
// eco-core lo fusiona con PRODUCT_WINDOWS en windows/registry.js. Cada Component es lazy:
// nada de esto entra en el chunk inicial ni en el de la página hasta que la ventana se monta.
// LIVE_META es la única fuente de los metadatos (cada módulo re-exporta el suyo como `meta`).
// Wallpaper = el mapa medido por c0der en Canvas 2D; eco-core lo monta detrás de las ventanas
// del escritorio 0 (ya envuelto en Suspense, así el llamador no necesita uno propio).
import React, { Suspense } from 'react';

const size = (w, h) => ({ w, h });

export const LIVE_META = {
  graph: {
    kind: 'graph',
    desktop: 'ecosystem',
    titleKey: 'ecosystem.windows.graph.title',
    sourceKey: 'ecosystem.windows.graph.source',
    defaultSize: size(640, 420),
    minSize: size(320, 200),
    defaultOpen: true,
    untrusted: false,
  },
  node: {
    kind: 'node',
    desktop: 'ecosystem',
    titleKey: 'ecosystem.windows.node.title',
    sourceKey: 'ecosystem.windows.node.source',
    defaultSize: size(440, 380),
    minSize: size(300, 220),
    defaultOpen: false,
    untrusted: false,
  },
  narrative: {
    kind: 'narrative',
    desktop: 'ecosystem',
    titleKey: 'ecosystem.windows.narrative.title',
    sourceKey: 'ecosystem.windows.narrative.source',
    defaultSize: size(760, 520),
    minSize: size(360, 260),
    defaultOpen: false,
    untrusted: false,
  },
  pulse: {
    kind: 'pulse',
    desktop: 'ecosystem',
    titleKey: 'ecosystem.windows.pulse.title',
    sourceKey: 'ecosystem.windows.pulse.source',
    defaultSize: size(560, 400),
    minSize: size(320, 200),
    defaultOpen: true,
    untrusted: false,
  },
  irc: {
    kind: 'irc',
    desktop: 'ecosystem',
    titleKey: 'ecosystem.windows.irc.title',
    sourceKey: 'ecosystem.windows.irc.source',
    defaultSize: size(600, 380),
    minSize: size(320, 200),
    defaultOpen: true,
    untrusted: true,
  },
  agent: {
    kind: 'agent',
    desktop: 'ecosystem',
    titleKey: 'ecosystem.windows.agent.title',
    sourceKey: 'ecosystem.windows.agent.source',
    defaultSize: size(560, 380),
    minSize: size(320, 200),
    defaultOpen: true,
    untrusted: false,
  },
  milly: {
    kind: 'milly',
    desktop: 'ecosystem',
    titleKey: 'ecosystem.windows.milly.title',
    sourceKey: 'ecosystem.windows.milly.source',
    defaultSize: size(480, 300),
    minSize: size(300, 180),
    defaultOpen: false,
    untrusted: false,
  },
  mesh_stats: {
    kind: 'mesh_stats',
    desktop: 'meshrelay',
    titleKey: 'ecosystem.windows.mesh_stats.title',
    sourceKey: 'ecosystem.windows.mesh_stats.source',
    defaultSize: size(520, 380),
    minSize: size(300, 200),
    defaultOpen: true,
    untrusted: false,
  },
  mesh_channels: {
    kind: 'mesh_channels',
    desktop: 'meshrelay',
    titleKey: 'ecosystem.windows.mesh_channels.title',
    sourceKey: 'ecosystem.windows.mesh_channels.source',
    defaultSize: size(520, 360),
    minSize: size(300, 200),
    defaultOpen: true,
    untrusted: false,
  },
  mesh_certs: {
    kind: 'mesh_certs',
    desktop: 'meshrelay',
    titleKey: 'ecosystem.windows.mesh_certs.title',
    sourceKey: 'ecosystem.windows.mesh_certs.source',
    defaultSize: size(560, 320),
    minSize: size(300, 180),
    defaultOpen: false,
    untrusted: false,
  },
  fac_health: {
    kind: 'fac_health',
    desktop: 'facilitator',
    titleKey: 'ecosystem.windows.fac_health.title',
    sourceKey: 'ecosystem.windows.fac_health.source',
    defaultSize: size(440, 240),
    minSize: size(300, 160),
    defaultOpen: true,
    untrusted: false,
  },
  fac_supported: {
    kind: 'fac_supported',
    desktop: 'facilitator',
    titleKey: 'ecosystem.windows.fac_supported.title',
    sourceKey: 'ecosystem.windows.fac_supported.source',
    defaultSize: size(560, 360),
    minSize: size(300, 200),
    defaultOpen: true,
    untrusted: false,
  },
};

const lazyWindow = (loader) => React.lazy(loader);

export const LIVE_WINDOWS = {
  graph: { Component: lazyWindow(() => import('./GraphTerm')), meta: LIVE_META.graph },
  node: { Component: lazyWindow(() => import('./NodeCard')), meta: LIVE_META.node },
  narrative: { Component: lazyWindow(() => import('./NarrativeMap')), meta: LIVE_META.narrative },
  pulse: { Component: lazyWindow(() => import('./PulseTerm')), meta: LIVE_META.pulse },
  irc: { Component: lazyWindow(() => import('./IrcTerm')), meta: LIVE_META.irc },
  agent: { Component: lazyWindow(() => import('./AgentTerm')), meta: LIVE_META.agent },
  milly: { Component: lazyWindow(() => import('./MillyTerm')), meta: LIVE_META.milly },
  mesh_stats: { Component: lazyWindow(() => import('./MeshStatsTerm')), meta: LIVE_META.mesh_stats },
  mesh_channels: { Component: lazyWindow(() => import('./MeshChannelsTerm')), meta: LIVE_META.mesh_channels },
  mesh_certs: { Component: lazyWindow(() => import('./MeshCertsTerm')), meta: LIVE_META.mesh_certs },
  fac_health: { Component: lazyWindow(() => import('./FacHealthTerm')), meta: LIVE_META.fac_health },
  fac_supported: { Component: lazyWindow(() => import('./FacSupportedTerm')), meta: LIVE_META.fac_supported },
};

export const LIVE_KINDS = Object.keys(LIVE_WINDOWS);

const EcosystemGraphLazy = React.lazy(() => import('../../graph/EcosystemGraph'));

/** Wallpaper del escritorio 0: el grafo medido por c0der (Canvas 2D). Sin fallback visual: el fondo del desk ya está pintado. */
export function Wallpaper(props) {
  return (
    <Suspense fallback={null}>
      <EcosystemGraphLazy {...props} />
    </Suspense>
  );
}

export default LIVE_WINDOWS;
