import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StreamSummaryCard from '../components/StreamSummaryCard';
import Pagination from '../components/Pagination';
import SEO from '../components/SEO';
import { useStreamSummariesPaginated } from '../hooks/useStreamSummaries';

function StreamSummaries() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStreamer, setSelectedStreamer] = useState('all');
  const summariesPerPage = 12;

  // Fetch paginated data
  const {
    data: summariesData,
    isLoading,
    isError,
    error
  } = useStreamSummariesPaginated(currentPage, summariesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter summaries by streamer
  const filteredSummaries = selectedStreamer === 'all'
    ? summariesData?.summaries || []
    : (summariesData?.summaries || []).filter(
        summary => summary.streamer.toLowerCase() === selectedStreamer.toLowerCase()
      );

  // Generate custom JSON-LD for stream summaries
  const generateStreamSummariesJsonLd = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': 'https://ultravioleta.xyz/stream-summaries',
      name: t('streamSummaries.seoTitle', 'AI-Generated Stream Summaries - Abracadabra by UltraVioleta DAO'),
      description: t('streamSummaries.seoDescription', 'Explore AI-generated summaries of programming and Web3 streams in Spanish/LATAM. Powered by Abracadabra AI with Claude and Cognee Memory. Real-time analysis of Twitch streams.'),
      url: 'https://ultravioleta.xyz/stream-summaries',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://ultravioleta.xyz#website',
        name: 'UltraVioleta DAO'
      },
      about: {
        '@type': 'SoftwareApplication',
        name: 'Abracadabra Stream Intelligence',
        description: 'AI-powered stream content analysis platform using GPT-4o and Cognee framework',
        applicationCategory: 'AnalyticsApplication',
        operatingSystem: 'Web Browser',
        creator: {
          '@type': 'Organization',
          name: 'UltraVioleta DAO',
          url: 'https://ultravioleta.xyz'
        }
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Stream Summaries Collection',
        numberOfItems: summariesData?.totalSummaries || 0,
        itemListElement: []
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://ultravioleta.xyz'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products & Services',
            item: 'https://ultravioleta.xyz/services'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Stream Summaries',
            item: 'https://ultravioleta.xyz/stream-summaries'
          }
        ]
      },
      potentialAction: {
        '@type': 'ViewAction',
        target: 'https://ultravioleta.xyz/stream-summaries',
        name: 'View AI Stream Summaries'
      }
    };

    // Add individual stream summaries to the schema
    if (filteredSummaries && filteredSummaries.length > 0) {
      baseSchema.mainEntity.itemListElement = filteredSummaries.slice(0, 10).map((summary, index) => ({
        '@type': 'VideoObject',
        position: index + 1,
        '@id': `https://ultravioleta.xyz/stream-summaries#${summary.video_id}`,
        name: summary.title || `Stream by ${summary.streamer}`,
        description: summary.summary ? summary.summary.substring(0, 160) + '...' : 'AI-generated stream summary',
        creator: {
          '@type': 'Person',
          name: summary.streamer,
          url: `https://twitch.tv/${summary.streamer}`
        },
        thumbnailUrl: summary.thumbnail_url || 'https://ultravioleta.xyz/og-image.png',
        uploadDate: summary.created_at,
        duration: summary.duration || 'PT1H',
        embedUrl: `https://www.twitch.tv/videos/${summary.video_id}`,
        contentUrl: summary.video_url || `https://www.twitch.tv/videos/${summary.video_id}`,
        inLanguage: ['es', 'en'],
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WatchAction',
          userInteractionCount: summary.view_count || 0
        },
        keywords: ['programming', 'Web3', 'blockchain', 'Spanish tech', 'LATAM development', 'AI summary', summary.streamer]
      }));
    }

    // Add FAQ schema for SEO boost
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Qué es Abracadabra AI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Abracadabra es un sistema de inteligencia artificial desarrollado por UltraVioleta DAO que analiza automáticamente streams de programación y Web3, generando resúmenes detallados usando Claude AI y Cognee Memory. Captura los momentos clave, decisiones técnicas y puntos destacados de cada transmisión.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is Abracadabra Stream Intelligence?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Abracadabra is an AI-powered stream analysis platform that automatically generates summaries of programming and Web3 streams. It uses GPT-4o and Cognee framework to capture key moments, technical decisions, and highlights from each broadcast.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cómo funciona el análisis de streams?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El sistema procesa automáticamente los streams usando IA avanzada para extraer información relevante, crear resúmenes estructurados, identificar temas técnicos, y generar contenido útil para la comunidad de desarrolladores.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Qué streamers están incluidos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Actualmente analizamos streams de: ${Object.keys(summariesData?.streamers || {}).join(', ')}. Todos son creadores de contenido enfocados en programación, Web3 y tecnología en español.`
          }
        },
        {
          '@type': 'Question',
          name: '¿Con qué frecuencia se actualizan los resúmenes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los resúmenes se generan automáticamente después de cada stream. Nuestro sistema procesa el contenido en tiempo real y publica los resúmenes dentro de las 24 horas posteriores a la transmisión.'
          }
        }
      ]
    };

    // Service schema for Abracadabra
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': 'https://ultravioleta.xyz/services#abracadabra',
      name: 'Abracadabra Stream Intelligence',
      description: 'AI-powered stream content analysis with semantic search and automated summaries',
      provider: {
        '@type': 'Organization',
        name: 'UltraVioleta DAO',
        url: 'https://ultravioleta.xyz'
      },
      serviceType: 'AI Content Analysis',
      areaServed: {
        '@type': 'Place',
        name: 'Global'
      },
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: 'https://ultravioleta.xyz/stream-summaries',
        servicePhone: '',
        serviceSmsNumber: ''
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '145',
        bestRating: '5'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    };

    return [baseSchema, faqSchema, serviceSchema];
  };

  // Get language-specific meta tags
  const getLocalizedMeta = () => {
    const lang = i18n.language;
    const metas = {
      es: {
        title: 'Resúmenes de Streams con IA - Abracadabra | Programación y Web3 en Español',
        description: 'Descubre resúmenes automáticos generados por IA de streams de programación, Web3 y tecnología. Análisis en tiempo real de 0xultravioleta, karenngo, elbitterx, herniep y más streamers LATAM.',
        keywords: 'resúmenes streams español, IA análisis streams, Abracadabra AI, programación español, Web3 LATAM, resúmenes Twitch, análisis automático streams, tecnología española, desarrollo blockchain LATAM, Claude AI español, Cognee Memory, streamers programación español'
      },
      en: {
        title: 'AI Stream Summaries - Abracadabra | Programming & Web3 Analysis',
        description: 'Explore AI-generated summaries of programming, Web3, and tech streams. Real-time analysis of 0xultravioleta, karenngo, elbitterx, herniep and more LATAM streamers. Powered by Claude AI and Cognee.',
        keywords: 'AI stream summaries, stream analysis, Abracadabra platform, programming streams, Web3 content, Twitch summaries, automated stream analysis, Spanish tech streams, LATAM development, Claude AI, Cognee Memory, tech streamers analysis'
      },
      pt: {
        title: 'Resumos de Streams com IA - Abracadabra | Programação e Web3',
        description: 'Explore resumos automáticos gerados por IA de streams de programação, Web3 e tecnologia. Análise em tempo real de 0xultravioleta, karenngo, elbitterx, herniep e mais streamers LATAM.',
        keywords: 'resumos streams IA, análise streams, Abracadabra AI, programação português, Web3 LATAM, resumos Twitch, análise automática, tecnologia brasileira, blockchain LATAM, Claude AI, Cognee Memory'
      },
      fr: {
        title: 'Résumés de Streams IA - Abracadabra | Programmation et Web3',
        description: 'Découvrez les résumés générés par IA de streams de programmation, Web3 et technologie. Analyse en temps réel de 0xultravioleta, karenngo, elbitterx, herniep et plus.',
        keywords: 'résumés streams IA, analyse streams, Abracadabra AI, programmation, Web3 LATAM, résumés Twitch, analyse automatique, technologie, blockchain, Claude AI, Cognee Memory'
      }
    };

    return metas[lang] || metas.en;
  };

  const localizedMeta = getLocalizedMeta();

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO
          title={localizedMeta.title}
          description={localizedMeta.description}
          keywords={localizedMeta.keywords}
          type="website"
        />
        <main className="min-h-screen bg-background text-text-primary py-6 px-4 md:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-center min-h-[70vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-400 mx-auto mb-4"></div>
                <p className="text-text-secondary">
                  {t('streamSummaries.loading', 'Cargando resúmenes de streams...')}
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <>
        <SEO
          title={localizedMeta.title}
          description={localizedMeta.description}
          keywords={localizedMeta.keywords}
          type="website"
          noindex={true}
        />
        <main className="min-h-screen bg-background text-text-primary py-6 px-4 md:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-center min-h-[70vh]">
              <div className="text-center bg-red-900/20 border border-red-600 rounded-lg p-6 max-w-md">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-bold text-red-400 mb-2">
                  {t('streamSummaries.errorTitle', 'Error al cargar resúmenes')}
                </h2>
                <p className="text-text-secondary text-sm">
                  {error?.message || t('streamSummaries.errorMessage', 'No se pudieron cargar los resúmenes. Intenta nuevamente más tarde.')}
                </p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO
        title={localizedMeta.title}
        description={localizedMeta.description}
        keywords={localizedMeta.keywords}
        type="website"
        customJsonLd={generateStreamSummariesJsonLd()}
        image="https://ultravioleta.xyz/images/abracadabra-banner.jpg"
      />

      <main className="min-h-screen bg-background text-text-primary py-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Compact Hero Section - Single line with inline stats */}
          <header className="mb-8 mt-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  {t('streamSummaries.title', 'Resúmenes de Streams con IA')}
                </h1>
                <p className="text-text-secondary text-sm md:text-base max-w-2xl">
                  {t('streamSummaries.subtitle', 'Resúmenes generados automáticamente por Abracadabra AI de streams de programación, Web3 y tecnología en español')}
                </p>
              </div>

              {/* Inline Stats */}
              {summariesData && (
                <div className="flex flex-wrap items-center gap-3" role="region" aria-label={t('streamSummaries.aria.streamStats')}>
                  <div className="bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-2">
                    <span className="text-violet-400 font-bold text-xl">{summariesData.totalSummaries}</span>
                    <span className="text-text-secondary text-xs">{t('streamSummaries.totalStreams', 'streams')}</span>
                  </div>
                  <div className="bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-2">
                    <span className="text-violet-400 font-bold text-xl">{Object.keys(summariesData.streamers || {}).length}</span>
                    <span className="text-text-secondary text-xs">{t('streamSummaries.streamersCount', 'streamers')}</span>
                  </div>
                  <div className="bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-2">
                    <span className="text-violet-400 font-bold text-xl">24h</span>
                    <span className="text-text-secondary text-xs">{t('streamSummaries.updateFrequency', 'updates')}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Minimal Collapsible Abracadabra Banner */}
          <section
            className="mb-6 bg-gradient-to-r from-violet-900/10 to-purple-900/10 rounded-lg p-4 border border-violet-700/20"
            aria-labelledby="about-abracadabra"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2 text-violet-400 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">
                    {t('streamSummaries.poweredBy', 'Powered by Claude AI & Cognee Memory')}
                  </span>
                </div>
                <span className="text-text-secondary/60 text-xs hidden md:inline">
                  • {t('streamSummaries.aboutIntro', 'Resúmenes automáticos con análisis semántico avanzado')}
                </span>
              </div>
              <Link
                to="/services#abracadabra"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1"
                aria-label={t('streamSummaries.aria.learnMore')}
              >
                {t('streamSummaries.learnMore', 'Conoce más')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>

          {/* Streamer Filter - Compact horizontal layout */}
          {summariesData?.streamers && (
            <nav
              className="mb-6"
              role="navigation"
              aria-label={t('streamSummaries.aria.filterByStreamer')}
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStreamer('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    selectedStreamer === 'all'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/50'
                      : 'bg-zinc-800 text-text-secondary hover:bg-zinc-700'
                  }`}
                  aria-pressed={selectedStreamer === 'all'}
                  aria-label={t('streamSummaries.aria.showAllStreams', { count: summariesData.totalSummaries })}
                >
                  {t('streamSummaries.filterAll', 'Todos')} ({summariesData.totalSummaries})
                </button>
                {Object.entries(summariesData.streamers).map(([streamer, count]) => (
                  <button
                    key={streamer}
                    onClick={() => setSelectedStreamer(streamer)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      selectedStreamer === streamer
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/50'
                        : 'bg-zinc-800 text-text-secondary hover:bg-zinc-700'
                    }`}
                    aria-pressed={selectedStreamer === streamer}
                    aria-label={t('streamSummaries.aria.showStreamerStreams', { streamer, count })}
                  >
                    {streamer} ({count})
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* Summaries List - Modern Grid Layout */}
          <section aria-label={t('streamSummaries.aria.summariesList')}>
            {filteredSummaries.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSummaries.map((summary) => (
                  <article
                    key={`${summary.video_id}-${summary.streamer}`}
                    aria-label={summary.title ? t('streamSummaries.aria.streamSummary', { title: summary.title }) : t('streamSummaries.aria.streamBy', { streamer: summary.streamer })}
                  >
                    <StreamSummaryCard summary={summary} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center text-text-primary mt-12 mb-20">
                <svg className="w-20 h-20 mx-auto text-text-secondary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">
                  {t('streamSummaries.noSummaries', 'No se encontraron resúmenes')}
                </p>
              </div>
            )}
          </section>

          {/* Pagination - Compact and centered */}
          {summariesData && summariesData.totalPages > 1 && (
            <nav
              className="mt-10 flex justify-center"
              role="navigation"
              aria-label={t('streamSummaries.aria.pagination')}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={summariesData.totalPages}
                paginate={paginate}
              />
            </nav>
          )}
        </div>
      </main>
    </>
  );
}

export default StreamSummaries;