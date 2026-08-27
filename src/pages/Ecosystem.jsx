// /ecosystem — "El escritorio está encendido": panel + escritorio Compiz (100svh − 44 px) con
// terminales reales sobre el mapa medido por c0der, y debajo las secciones planas (pulso,
// matriz de interoperabilidad, recibo de datos, #agentes, CTA). Reemplaza a /agents.
// SEO: WebPage + ItemList de SoftwareApplication (productos live con URL del grafo) + Dataset
// (graph.json, dateModified = generated_at). JetBrains Mono se carga SOLO en esta ruta.
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MotionConfig } from 'framer-motion';
import SEO from '../components/SEO';
import { DeskProvider } from '../components/ecosystem/desk/DeskContext';
import Panel from '../components/ecosystem/desk/Panel';
import Desktop from '../components/ecosystem/desk/Desktop';
import useEcosystemGraph from '../components/ecosystem/useEcosystemGraph';
import { GRAPH_SNAPSHOT_URL } from '../services/ecosystem/graph';
import SystemPulse from '../components/ecosystem/sections/SystemPulse';
import InteropMatrix from '../components/ecosystem/sections/InteropMatrix';
import Receipt from '../components/ecosystem/sections/Receipt';
import ForAgents from '../components/ecosystem/sections/ForAgents';
import EcosystemCta from '../components/ecosystem/sections/EcosystemCta';
import '../styles/ecosystem.css';

const SITE = 'https://ultravioletadao.xyz';
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap';

function useJsonLd(graph, index, title, description) {
  return useMemo(() => {
    const products = index ? index.products : [];
    const itemList = {
      '@type': 'ItemList',
      '@id': `${SITE}/ecosystem#products`,
      name: title,
      numberOfItems: products.length,
      itemListElement: products.map((n, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: n.name,
          url: n.url,
          applicationCategory: n.layer,
          ...(n.repo ? { codeRepository: n.repo } : {}),
          ...(n.tags && n.tags.length ? { keywords: n.tags.join(', ') } : {}),
        },
      })),
    };
    const dataset = {
      '@type': 'Dataset',
      '@id': `${SITE}${GRAPH_SNAPSHOT_URL}`,
      name: 'UltraVioleta DAO ecosystem graph (measured by c0der)',
      description: 'Nodes (public DAO products) and edges measured from real code by c0der. schema_version 1.',
      url: `${SITE}/ecosystem`,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: { '@type': 'Organization', name: 'UltraVioleta DAO', url: SITE },
      distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${SITE}${GRAPH_SNAPSHOT_URL}` }],
      ...(graph && graph.generated_at ? { dateModified: graph.generated_at } : {}),
    };
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${SITE}/ecosystem`,
          url: `${SITE}/ecosystem`,
          name: title,
          description,
          isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#website` },
          mainEntity: { '@id': `${SITE}/ecosystem#products` },
        },
        itemList,
        dataset,
      ],
    };
  }, [graph, index, title, description]);
}

export default function Ecosystem() {
  const { t } = useTranslation();
  const location = useLocation();
  const { graph, index } = useEcosystemGraph();
  const [help, setHelp] = useState(false);

  const title = t('ecosystem.seo.title', 'Ecosistema — mapa vivo de los productos de UltraVioleta DAO');
  const description = t(
    'ecosystem.seo.description',
    'Escritorio hacker con terminales reales: el mapa del ecosistema medido por c0der, KarmaKadabra, Execution Market, MeshRelay, Describe.net y el facilitador x402 en vivo. Cada dato con su fuente y su fecha.'
  );
  const jsonLd = useJsonLd(graph, index, title, description);

  // /agents y /agent-discovery redirigen a /ecosystem#agentes: bajar a la sección al montar.
  useEffect(() => {
    if (location.hash !== '#agentes') return undefined;
    let tries = 0;
    let timer = null;
    const go = () => {
      const el = document.getElementById('agentes');
      if (el) {
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      tries += 1;
      if (tries < 20) timer = setTimeout(go, 100);
    };
    go();
    return () => clearTimeout(timer);
  }, [location.hash]);

  return (
    // El Header ya reserva 56 px en ≥1024 px (spacer h-14); en móvil solo hay que esquivar el botón flotante.
    <div className="uvd-eco pt-12 lg:pt-0 min-h-[100svh]" data-ecosystem-page="">
      <SEO title={title} description={description} keywords="ecosystem, c0der, KarmaKadabra, Execution Market, MeshRelay, Describe.net, x402, facilitator, WebMCP, agents" customJsonLd={jsonLd} />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_CSS} />
      </Helmet>

      <MotionConfig reducedMotion="user">
        <DeskProvider>
          <Panel onHelp={() => setHelp(true)} />
          <Desktop helpOpen={help} onHelpChange={setHelp} />
        </DeskProvider>
      </MotionConfig>

      <main className="uvd-eco__sections" id="ecosystem-sections">
        <SystemPulse />
        <InteropMatrix />
        <Receipt />
        <ForAgents />
        <EcosystemCta />
      </main>
    </div>
  );
}
