// ForAgents — sección 03 `#agentes` de /ecosystem: archivos de descubrimiento + tools WebMCP
// de esta página (nombres leídos de buildTools, sin registrar). El bloque de productos que vivía
// aquí (data-agents-products) subió a la sección 01 (EcosystemProducts.jsx); el id `#agentes` se
// queda: es el target de los redirects /agents y /agent-discovery (efecto location.hash en
// Ecosystem.jsx). Sin framer-motion (listas planas), sin JSON-LD propio (lo emite Ecosystem.jsx).
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Code, FileText } from 'lucide-react';
import { buildTools } from '../../../agent/tools';

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

const isExternal = (href) => /^https?:\/\//.test(href);

// Receta única del sistema visual de la zona plana (PLAN_EDITORIAL §3).
const CARD = 'rounded-lg border border-ultraviolet-darker/40 bg-background/80 p-6 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(124,31,255,0.55)] hover:shadow-[0_0_24px_rgba(106,0,255,0.18)]';
const H2 = 'mb-4 flex items-center gap-3 text-2xl font-bold text-text-primary';
const LINK = 'inline-flex min-w-0 items-center gap-1 break-all font-mono text-sm text-[#a78bfa] underline-offset-2 hover:text-[#c4b5fd] hover:underline focus:outline focus:outline-2 focus:outline-purple-300';

function ExtLink({ href, children, className = LINK, ...rest }) {
  const ext = isExternal(href);
  return (
    <a href={href} className={className} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
      {ext ? <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> : null}
    </a>
  );
}

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

  return (
    <section id="agentes" aria-labelledby="agentes-title" className="mx-auto w-full max-w-7xl scroll-mt-16 px-4 py-12" data-for-agents>
      <header className="mb-10">
        <h2 id="agentes-title" className="mb-2 font-mono text-2xl font-bold text-text-primary">
          <span className="text-[#a78bfa]" aria-hidden="true">03 · </span>
          {t('ecosystem.agents.title', 'Para agentes')}
        </h2>
        <p className="max-w-3xl text-base text-text-secondary">{t('ecosystem.agents.subtitle', 'Todo lo que un agente necesita para descubrir e integrarse con el DAO.')}</p>
      </header>

      {/* Archivos de descubrimiento */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={CARD} data-agents-discovery>
          <h3 className={H2}>
            <FileText className="h-7 w-7 text-[#a78bfa]" aria-hidden="true" />
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
            <Code className="h-7 w-7 text-[#a78bfa]" aria-hidden="true" />
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
    </section>
  );
}
