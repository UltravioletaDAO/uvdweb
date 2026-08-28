// ForAgents — sección `#agentes` de /ecosystem: hereda TODO el contenido de la antigua página /agents
// (src/pages/AgentDiscovery.js, mismas claves agentDiscovery.*; el dominio de KarmaKadabra corregido a
// karmakadabra.ultravioletadao.xyz) y suma los archivos de descubrimiento, las tools WebMCP de esta
// página (nombres leídos de buildTools, sin registrar) y los MCP del ecosistema.
// Sin framer-motion (listas planas), sin JSON-LD propio (lo emite Ecosystem.jsx).
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Users, Zap, Link as LinkIcon, ExternalLink, Code, ArrowRight, FileText, Cpu, Radio } from 'lucide-react';
import { buildTools } from '../../../agent/tools';
import { KK_TOOLS } from '../../../services/ecosystem/kkMcp';

const KK_URL = 'https://karmakadabra.ultravioletadao.xyz';
const KK_MCP = `${KK_URL}/mcp`;

const DISCOVERY = [
  { key: 'llms', href: '/llms.txt', fallback: 'llms.txt — resumen del sitio para modelos' },
  { key: 'llms_full', href: '/llms-full.txt', fallback: 'llms-full.txt — versión completa' },
  { key: 'api_catalog', href: '/.well-known/api-catalog', fallback: 'api-catalog.json — catálogo de APIs' },
  { key: 'server_card', href: '/.well-known/mcp/server-card.json', fallback: 'mcp/server-card.json — tarjeta del servidor MCP' },
  { key: 'agent_skills', href: '/.well-known/agent-skills/index.json', fallback: 'agent-skills/index.json — índice de skills' },
  { key: 'ai_catalog', href: '/.well-known/ai-catalog.json', fallback: 'ai-catalog.json — catálogo AIR' },
  { key: 'openapi', href: 'https://facilitator.ultravioletadao.xyz/api-docs/openapi.json', fallback: 'openapi — especificación OpenAPI' },
  { key: 'security', href: '/.well-known/security.txt', fallback: 'security.txt — contacto de seguridad' },
  { key: 'graph_json', href: '/ecosystem/graph.json', fallback: 'ecosystem/graph.json — grafo del ecosistema medido por c0der' }
];

const PRODUCTS = [
  { id: 'em', name: 'Execution Market', color: 'yellow', icon: Zap, descKey: 'agentDiscovery.integrationPoints.executionMarket.description', descFallback: 'Marketplace bidireccional de tareas humano-IA con escrow on-chain.', featuresKey: 'agentDiscovery.integrationPoints.executionMarket.features', links: [{ label: 'execution.market', href: 'https://execution.market' }, { label: 'execution.market/skill.md', href: 'https://execution.market/skill.md' }, { label: 'execution.market/llms.txt', href: 'https://execution.market/llms.txt' }] },
  { id: 'mr', name: 'MeshRelay', color: 'purple', icon: Radio, descKey: 'ecosystem.agents.mcp_mr_desc', descFallback: 'MeshRelay: IRC para agentes; su skill.md explica como conectarse y que canales existen.', links: [{ label: 'meshrelay.xyz', href: 'https://meshrelay.xyz' }, { label: 'meshrelay.xyz/skill.md', href: 'https://meshrelay.xyz/skill.md' }, { label: 'meshrelay.xyz/llms.txt', href: 'https://meshrelay.xyz/llms.txt' }] },
  { id: 'dn', name: 'Describe.net', color: 'green', icon: Users, descKey: 'agentDiscovery.integrationPoints.describeNet.description', descFallback: 'Reputacion agregada y verificable para agentes de IA.', featuresKey: 'agentDiscovery.integrationPoints.describeNet.features', links: [{ label: 'describe.net', href: 'https://describe.net' }, { label: 'describe.net/skill.md', href: 'https://describe.net/skill.md' }, { label: 'describe.net/llms.txt', href: 'https://describe.net/llms.txt' }] },
  { id: 'kk', name: 'KarmaKadabra', color: 'blue', icon: Cpu, descKey: 'ecosystem.agents.mcp_kk_desc', descFallback: 'MCP hosteado de KarmaKadabra: KPIs, agentes, trades y snapshot del mercado por JSON-RPC - el observatorio del enjambre.', links: [{ label: 'karmakadabra.ultravioletadao.xyz', href: KK_URL }, { label: 'karmakadabra.ultravioletadao.xyz/mcp', href: KK_MCP }], tools: KK_TOOLS },
];

const asArray = (v) => (Array.isArray(v) ? v : []);
const isExternal = (href) => /^https?:\/\//.test(href);

const CARD = 'rounded-xl border border-ultraviolet-darker/30 bg-gradient-to-br from-background-lighter to-background p-6';
const H2 = 'mb-4 flex items-center gap-3 text-2xl font-bold text-text-primary';
const LINK = 'inline-flex min-w-0 items-center gap-1 break-all font-mono text-sm text-ultraviolet-light underline-offset-2 hover:underline focus:outline focus:outline-2 focus:outline-purple-300';

function ExtLink({ href, children, className = LINK, ...rest }) {
  const ext = isExternal(href);
  return (
    <a href={href} className={className} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
      {ext ? <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    </a>
  );
}

const COLOR = {
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', dot: 'bg-yellow-500' },
  green: { bg: 'bg-green-500/20', text: 'text-green-500', dot: 'bg-green-500' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-500', dot: 'bg-purple-500' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-500', dot: 'bg-blue-500' }
};

export default function ForAgents() {
  const { t, i18n } = useTranslation();

  // Nombres reales de las tools WebMCP de esta página (misma fábrica que WebMCPProvider; no se registran aquí).
  const tools = useMemo(() => {
    try {
      return buildTools({ navigate: () => {}, i18n }).map((tool) => ({ name: tool.name, description: tool.description || '', readOnly: Boolean(tool.annotations && tool.annotations.readOnlyHint) }));
    } catch (e) {
      return [];
    }
  }, [i18n]);

  const steps = asArray(t('agentDiscovery.getStarted.steps', { returnObjects: true }));

  return (
    <section id="agentes" aria-labelledby="agentes-title" className="mx-auto w-full max-w-7xl scroll-mt-16 px-4 py-12" data-for-agents>
      <header className="mb-10 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="rounded-2xl bg-gradient-to-r from-ultraviolet/20 to-purple-500/20 p-3">
            <Bot className="h-8 w-8 text-ultraviolet" aria-hidden="true" />
          </span>
        </div>
        <h2 id="agentes-title" className="mb-2 bg-gradient-to-r from-ultraviolet to-purple-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          {t('ecosystem.agents.title', 'Para agentes')}
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-text-secondary">{t('ecosystem.agents.subtitle', 'Todo lo que un agente necesita para descubrir e integrarse con el DAO: archivos de descubrimiento, tools WebMCP de esta página y los MCP de cada producto.')}</p>
      </header>

      {/* Archivos de descubrimiento */}
      <div className="mb-12 grid gap-6 lg:grid-cols-2">
        <div className={CARD} data-agents-discovery>
          <h3 className={H2}>
            <FileText className="h-7 w-7 text-ultraviolet" aria-hidden="true" />
            {t('ecosystem.agents.discovery_title', 'Archivos de descubrimiento')}
          </h3>
          <ul className="space-y-2">
            {DISCOVERY.map((d) => (
              <li key={d.key} className="flex flex-col gap-0.5">
                <ExtLink href={d.href}>{d.href.replace(/^https:\/\//, '')}</ExtLink>
                <span className="text-xs text-text-secondary">{t(`ecosystem.agents.discovery.${d.key}`, d.fallback)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tools WebMCP en esta página */}
        <div className={CARD} data-agents-webmcp>
          <h3 className={H2}>
            <Code className="h-7 w-7 text-ultraviolet" aria-hidden="true" />
            {t('ecosystem.agents.webmcp_title', 'Tools WebMCP en esta página')}
          </h3>
          <p className="mb-4 text-sm text-text-secondary">{t('ecosystem.agents.webmcp_desc', 'Registradas en document.modelContext al cargar; un agente con WebMCP las ve sin scraping. Los nombres salen del registro real.')}</p>
          <ul className="grid gap-1 sm:grid-cols-2" data-agents-tools>
            {tools.map((tool) => (
              <li key={tool.name} className="rounded border border-ultraviolet-darker/30 px-2 py-1 font-mono text-xs text-text-primary" title={tool.description}>
                {tool.name}
                {tool.readOnly ? <span className="ml-1 text-slate-500">ro</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Productos: una sola seccion consolidada (antes: "MCP del ecosistema" +
          "Who We Are" + "Our AI Agents" + "Integration Points", que repetian productos).
          Orden: Facilitator (el riel, lo principal) -> pilares -> KarmaKadabra (el observatorio). */}
      <div className="mb-12" data-agents-products>
        <h3 className={H2}>
          <Code className="h-7 w-7 text-ultraviolet" aria-hidden="true" />
          {t('ecosystem.agents.products_title', 'Como integrarse con cada producto')}
        </h3>
        <p className="mb-6 text-lg text-text-secondary">{t('agentDiscovery.integrationPoints.description')}</p>

        {/* Facilitator: lo principal, card destacada */}
        <div className={`${CARD} mb-6 border-ultraviolet/40`} data-product-card="facilitator">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-blue-500/20 p-2"><LinkIcon className="h-6 w-6 text-blue-500" aria-hidden="true" /></span>
            <h4 className="text-xl font-bold text-text-primary">{t('agentDiscovery.integrationPoints.facilitator.title')}</h4>
          </div>
          <p className="mb-3 text-text-secondary">{t('agentDiscovery.integrationPoints.facilitator.description')}</p>
          <ul className="mb-4 grid gap-2 sm:grid-cols-3">
            {asArray(t('agentDiscovery.integrationPoints.facilitator.features', { returnObjects: true })).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <ExtLink href="https://facilitator.ultravioletadao.xyz">facilitator.ultravioletadao.xyz</ExtLink>
            <ExtLink href="/facilitator">/facilitator</ExtLink>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PRODUCTS.map((m) => (
            <div key={m.id} className={CARD} data-product-card={m.id}>
              <div className="mb-3 flex items-center gap-3">
                <span className={`rounded-lg p-2 ${COLOR[m.color].bg}`}><m.icon className={`h-6 w-6 ${COLOR[m.color].text}`} aria-hidden="true" /></span>
                <h4 className="text-xl font-bold text-text-primary">{m.name}</h4>
              </div>
              <p className="mb-3 text-sm text-text-secondary">{t(m.descKey, m.descFallback)}</p>
              {m.featuresKey ? (
                <ul className="mb-4 space-y-1">
                  {asArray(t(m.featuresKey, { returnObjects: true })).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                      <span className={`h-1.5 w-1.5 rounded-full ${COLOR[m.color].dot}`} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : null}
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
      </div>

      {/* Empezar */}
      <div className="rounded-2xl border border-ultraviolet-darker/20 bg-gradient-to-br from-ultraviolet/10 to-purple-500/10 p-8">
        <div className="mb-8 text-center">
          <h3 className="mb-3 text-2xl font-bold text-text-primary">{t('agentDiscovery.getStarted.title')}</h3>
          <p className="text-lg text-text-secondary">{t('agentDiscovery.getStarted.description')}</p>
        </div>
        <ol className="mb-8 grid gap-4 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4 rounded-lg border border-ultraviolet-darker/20 bg-background-lighter p-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ultraviolet/20 text-lg font-bold text-ultraviolet" aria-hidden="true">
                {i + 1}
              </span>
              <span className="font-semibold text-text-primary">{s}</span>
            </li>
          ))}
        </ol>
        <div className="text-center">
          <a
            href="https://execution.market"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-xl bg-ultraviolet px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-ultraviolet-light focus:outline focus:outline-2 focus:outline-purple-300"
          >
            {t('agentDiscovery.getStarted.button')}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
