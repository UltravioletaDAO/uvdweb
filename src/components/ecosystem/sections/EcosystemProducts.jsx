// EcosystemProducts — sección 01 `#productos` de /ecosystem. El bloque consolidado de productos
// (antes vivía dentro de ForAgents como data-agents-products) sube aquí con heading propio:
// Facilitator destacado (el riel, glow en reposo) → pilares (EM / MeshRelay / Describe.net) →
// KarmaKadabra (el observatorio del enjambre, con chips de tools MCP).
// Cards parejas patrón MeshRelay: favicon real (ProductIcon, fallback lucide) + nombre + 1 línea
// + links. Color por capa (LAYER_COLORS) solo en el punto del chip, nunca como color de texto.
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Zap, Link as LinkIcon, ExternalLink, Cpu, Radio } from 'lucide-react';
import ProductIcon from '../ProductIcon';
import { LAYER_COLORS } from '../../../services/ecosystem/graph';
import { KK_TOOLS } from '../../../services/ecosystem/kkMcp';

const KK_URL = 'https://karmakadabra.ultravioletadao.xyz';
const KK_MCP = `${KK_URL}/mcp`;

// rail en #7c1fff (no #6a00ff): el punto debe pasar 3:1 de contraste gráfico sobre #0a0a1b.
const LAYER_DOT = { ...LAYER_COLORS, rail: '#7c1fff' };

const PRODUCTS = [
  { id: 'em', name: 'Execution Market', layer: 'pillar', icon: Zap, descKey: 'agentDiscovery.integrationPoints.executionMarket.description', descFallback: 'Marketplace bidireccional de tareas humano-IA con escrow on-chain.', links: [{ label: 'execution.market', href: 'https://execution.market' }, { label: 'execution.market/skill.md', href: 'https://execution.market/skill.md' }, { label: 'execution.market/llms.txt', href: 'https://execution.market/llms.txt' }] },
  { id: 'mr', name: 'MeshRelay', layer: 'pillar', icon: Radio, descKey: 'ecosystem.agents.mcp_mr_desc', descFallback: 'MeshRelay: IRC para agentes; su skill.md explica como conectarse y que canales existen.', links: [{ label: 'meshrelay.xyz', href: 'https://meshrelay.xyz' }, { label: 'meshrelay.xyz/skill.md', href: 'https://meshrelay.xyz/skill.md' }, { label: 'meshrelay.xyz/llms.txt', href: 'https://meshrelay.xyz/llms.txt' }] },
  { id: 'dn', name: 'Describe.net', layer: 'pillar', icon: Users, descKey: 'agentDiscovery.integrationPoints.describeNet.description', descFallback: 'Reputacion agregada y verificable para agentes de IA.', links: [{ label: 'describe.net', href: 'https://describe.net' }, { label: 'describe.net/skill.md', href: 'https://describe.net/skill.md' }, { label: 'describe.net/llms.txt', href: 'https://describe.net/llms.txt' }] },
  { id: 'kk', name: 'KarmaKadabra', layer: 'swarm', icon: Cpu, descKey: 'ecosystem.agents.mcp_kk_desc', descFallback: 'MCP hosteado de KarmaKadabra: KPIs, agentes, trades y snapshot del mercado por JSON-RPC - el observatorio del enjambre.', links: [{ label: 'karmakadabra.ultravioletadao.xyz', href: KK_URL }, { label: 'karmakadabra.ultravioletadao.xyz/mcp', href: KK_MCP }], tools: KK_TOOLS },
];

const isExternal = (href) => /^https?:\/\//.test(href);

// Receta única del sistema visual de la zona plana (PLAN_EDITORIAL §3).
const CARD = 'rounded-lg border border-ultraviolet-darker/40 bg-background/80 p-6 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(124,31,255,0.55)] hover:shadow-[0_0_24px_rgba(106,0,255,0.18)]';
const LINK = 'inline-flex min-w-0 items-center gap-1 break-all font-mono text-sm text-[#a78bfa] underline-offset-2 hover:text-[#c4b5fd] hover:underline focus:outline focus:outline-2 focus:outline-purple-300';
const ICON_BOX = 'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]';

function ExtLink({ href, children, className = LINK, ...rest }) {
  const ext = isExternal(href);
  return (
    <a href={href} className={className} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
      {ext ? <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    </a>
  );
}

// Chip de capa (arriba-derecha de cada card): punto 6px con el color de LAYER_DOT + label i18n.
function LayerChip({ layer }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LAYER_DOT[layer] }} aria-hidden="true" />
      {t(`ecosystem.graph.layers.${layer}`, layer)}
    </span>
  );
}

export default function EcosystemProducts() {
  const { t } = useTranslation();

  return (
    <section id="productos" aria-labelledby="productos-title" className="mx-auto w-full max-w-7xl scroll-mt-16 px-4 py-12" data-products>
      <h2 id="productos-title" className="mb-2 font-mono text-2xl font-bold text-text-primary">
        <span className="text-[#a78bfa]" aria-hidden="true">01 · </span>
        {t('ecosystem.products.title', 'Productos')}
      </h2>

      {/* Facilitator: el riel, card destacada con glow en reposo */}
      <div className={`${CARD} mt-6 mb-6 border-ultraviolet/40 shadow-[0_0_32px_rgba(106,0,255,0.18)]`} data-product-card="facilitator">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className={ICON_BOX}>
              <ProductIcon id="facilitator" size={28} fallback={LinkIcon} />
            </span>
            <h3 className="text-xl font-bold text-text-primary">{t('agentDiscovery.integrationPoints.facilitator.title', 'Facilitador x402')}</h3>
          </div>
          <LayerChip layer="rail" />
        </div>
        <p className="mb-3 text-sm text-text-secondary">{t('agentDiscovery.integrationPoints.facilitator.description', 'Infraestructura de pagos sin gas para agentes autónomos')}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <ExtLink href="https://facilitator.ultravioletadao.xyz">facilitator.ultravioletadao.xyz</ExtLink>
          <ExtLink href="/facilitator">/facilitator</ExtLink>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PRODUCTS.map((m) => (
          <div key={m.id} className={CARD} data-product-card={m.id}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={ICON_BOX}>
                  <ProductIcon id={m.id} size={28} fallback={m.icon} />
                </span>
                <h3 className="text-xl font-bold text-text-primary">{m.name}</h3>
              </div>
              <LayerChip layer={m.layer} />
            </div>
            <p className="mb-3 text-sm text-text-secondary">{t(m.descKey, m.descFallback)}</p>
            <ul className="mb-3 space-y-1">
              {m.links.map((l) => (
                <li key={l.href}>
                  <ExtLink href={l.href}>{l.label}</ExtLink>
                </li>
              ))}
            </ul>
            {m.tools ? (
              <ul className="flex flex-wrap gap-1">
                {m.tools.map((name) => (
                  <li key={name} className="rounded border border-ultraviolet-darker/30 px-2 py-0.5 font-mono text-[11px] text-text-primary">
                    {name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
