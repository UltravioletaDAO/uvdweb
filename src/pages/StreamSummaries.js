import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StreamSummaryCard from '../components/StreamSummaryCard';
import Pagination from '../components/Pagination';
import SEO from '../components/SEO';
import { useStreamSummariesPaginated } from '../hooks/useStreamSummaries';

function StreamSummaries() {
  const { t } = useTranslation();
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

  // Loading state
  if (isLoading) {
    return (
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
    );
  }

  // Error state
  if (isError) {
    return (
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
    );
  }

  return (
    <>
      <SEO
        title={t('streamSummaries.seoTitle', 'Resúmenes de Streams AI - Abracadabra | Programación & Web3 en Español')}
        description={t('streamSummaries.seoDescription', 'Descubre resúmenes automáticos generados por IA (Claude AI + GPT-4) de streams de programación, Web3 y tecnología en español. Analiza contenido de 0xultravioleta, karenngo, elbitterx y más streamers tech LATAM. Búsqueda semántica y análisis inteligente de contenido.')}
        keywords="resúmenes de streams AI, stream summaries español, Abracadabra IA, resúmenes Twitch automáticos, análisis streams Web3, programación en vivo español, Claude AI stream analysis, GPT-4 content summaries, semantic search streams, resúmenes programación LATAM, tech streams español, análisis de contenido streaming, 0xultravioleta streams, karenngo programación, elbitterx Web3, AI-powered transcription español, knowledge graphs streams, temporal search video content, automated stream intelligence, Cognee framework, stream content analysis, tech streamers latinoamérica"
        type="website"
        image="https://ultravioleta.xyz/images/abracadabra-dashboard.jpg"
        customJsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t('streamSummaries.title', 'Resúmenes de Streams'),
          description: t('streamSummaries.subtitle', 'Resúmenes generados automáticamente por IA de streams de programación, Web3 y tecnología en español'),
          url: 'https://ultravioleta.xyz/stream-summaries',
          isPartOf: {
            '@type': 'WebSite',
            name: 'UltraVioleta DAO',
            url: 'https://ultravioleta.xyz'
          },
          about: {
            '@type': 'Thing',
            name: 'AI Stream Analysis',
            description: 'Automated stream content analysis using Claude AI and GPT-4'
          },
          provider: {
            '@type': 'SoftwareApplication',
            name: 'Abracadabra',
            applicationCategory: 'AnalyticsApplication',
            description: 'AI-powered stream intelligence platform',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            }
          },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: summariesData?.totalSummaries || 0,
            itemListElement: (summariesData?.summaries || []).slice(0, 10).map((summary, index) => ({
              '@type': 'VideoObject',
              position: index + 1,
              name: summary.titulo_stream,
              description: `Resumen automático del stream de ${summary.streamer}`,
              uploadDate: summary.fecha_stream,
              thumbnailUrl: `https://static-cdn.jtvnw.net/cf_vods/${summary.video_id}/thumb/thumb0-640x360.jpg`,
              contentUrl: summary.twitch_url,
              embedUrl: summary.twitch_url,
              creator: {
                '@type': 'Person',
                name: summary.streamer
              },
              keywords: 'programación, Web3, tecnología, streaming, español, LATAM',
              inLanguage: 'es',
              transcript: {
                '@type': 'CreativeWork',
                text: 'AI-generated summary available',
                encodingFormat: 'text/markdown'
              }
            }))
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://ultravioleta.xyz/stream-summaries?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          }
        }}
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
                <div className="flex flex-wrap items-center gap-3">
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
          <section className="mb-6 bg-gradient-to-r from-violet-900/10 to-purple-900/10 rounded-lg p-4 border border-violet-700/20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2 text-violet-400 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
            <nav className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStreamer('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    selectedStreamer === 'all'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/50'
                      : 'bg-zinc-800 text-text-secondary hover:bg-zinc-700'
                  }`}
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
                  >
                    {streamer} ({count})
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* Summaries List - Vertical Accordion Layout */}
          {filteredSummaries.length > 0 ? (
            <div className="max-w-5xl mx-auto space-y-3">
              {filteredSummaries.map((summary) => (
                <article key={`${summary.video_id}-${summary.streamer}`}>
                  <StreamSummaryCard summary={summary} />
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center text-text-primary mt-12 mb-20">
              <svg className="w-20 h-20 mx-auto text-text-secondary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">
                {t('streamSummaries.noSummaries', 'No se encontraron resúmenes')}
              </p>
            </div>
          )}

          {/* Pagination - Compact and centered */}
          {summariesData && summariesData.totalPages > 1 && (
            <nav className="mt-10 flex justify-center">
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
