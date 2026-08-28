// ProductIcon — favicon/logo REAL de cada producto (directiva de Saul 2026-08-28: cero
// iconos genéricos donde se referencia una app). Assets locales en public/ecosystem/brand/
// (descargados de cada dominio y verificados visualmente; 0 requests externos). La decisión
// de render es síncrona: sin asset ni fallback devuelve null y si el <img> falla ocupa un
// box del MISMO tamaño — cero CLS. Lucide queda solo como fallback (prop `fallback`).
import React, { useState } from 'react';

// Solo productos con asset verificado. describe.net publica su favicon como SVG data-URI
// (no expone .ico), así que su asset se conserva .svg igual que el de KarmaKadabra.
const BRAND = {
  'execution-market': '/ecosystem/brand/execution-market.png',
  meshrelay: '/ecosystem/brand/meshrelay.png',
  'describe-net': '/ecosystem/brand/describe-net.svg',
  karmakadabra: '/ecosystem/brand/karmakadabra.svg',
  facilitator: '/ecosystem/brand/facilitator.png',
  '402milly': '/ecosystem/brand/402milly.png',
};

// Ids cortos de cards (em/mr/dn/kk), ids de escritorio (Panel) e ids de ventana → basename.
const ALIAS = {
  em: 'execution-market',
  execution_market: 'execution-market',
  mr: 'meshrelay',
  dn: 'describe-net',
  describe_net: 'describe-net',
  kk: 'karmakadabra',
  milly: '402milly',
};

/** Ruta del asset local del producto, o null si no hay marca verificada para ese id. */
export function productAsset(id) {
  if (!id) return null;
  return BRAND[ALIAS[id] || id] || null;
}

// kind de ventana del escritorio → producto dueño (ver DESKTOPS en desktops.js).
const KIND_PRODUCT = {
  kk_kpi: 'karmakadabra',
  kk_trades: 'karmakadabra',
  kk_status: 'karmakadabra',
  observatory: 'karmakadabra',
  em_metrics: 'execution-market',
  em_tasks: 'execution-market',
  fac_health: 'facilitator',
  fac_supported: 'facilitator',
  mesh_stats: 'meshrelay',
  mesh_channels: 'meshrelay',
  mesh_certs: 'meshrelay',
  milly: '402milly',
};

/** Producto de una ventana del desk: por kind, o inferido de params (md/replay/site); null si no hay. */
export function productForWindow(kind, params) {
  if (KIND_PRODUCT[kind]) return KIND_PRODUCT[kind];
  const hint = params ? `${params.key || ''} ${params.url || ''} ${params.snippet || ''}` : '';
  if (/describe/i.test(hint)) return 'describe-net';
  if (/meshrelay/i.test(hint)) return 'meshrelay';
  return null;
}

const renderFallback = (fallback, size) => {
  if (React.isValidElement(fallback)) return fallback;
  const Fallback = fallback;
  return <Fallback size={size} aria-hidden="true" />;
};

export default function ProductIcon({ id, size = 28, className = '', fallback = null }) {
  const [failed, setFailed] = useState(false);
  const src = productAsset(id);

  if (!src && !fallback) return null; // decisión síncrona: nada que mostrar, cero box
  if (!src || failed) {
    // Asset excluido o roto: box reservado del MISMO tamaño (sin salto), lucide dentro si hay.
    return (
      <span
        className={`inline-flex items-center justify-center align-middle ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {fallback ? renderFallback(fallback, size) : null}
      </span>
    );
  }
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`inline-block align-middle ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
