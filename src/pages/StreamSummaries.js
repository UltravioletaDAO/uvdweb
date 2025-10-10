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
      <main className="min-h-screen bg-background text-text-primary py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-400 mx-auto mb-4"></div>
              <p className="text-text-secondary text-lg">
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
      <main className="min-h-screen bg-background text-text-primary py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-red-900/20 border border-red-600 rounded-lg p-8 max-w-md">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold text-red-400 mb-2">
                {t('streamSummaries.errorTitle', 'Error al cargar resúmenes')}
              </h2>
              <p className="text-text-secondary">
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
        title={t('streamSummaries.seoTitle', 'Resúmenes de Streams - Abracadabra AI')}
        description={t('streamSummaries.seoDescription', 'Explora resúmenes generados por IA de streams de programación, Web3 y tecnología. Resúmenes automáticos de 0xultravioleta, karenngo, elbitterx, herniep y más.')}
        keywords="resúmenes de streams, AI stream summaries, Abracadabra, resúmenes Twitch, Web3 streams LATAM, programación en vivo, AI summaries español"
        type="website"
      />
      <main className="min-h-screen bg-background text-text-primary py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-16">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              {t('streamSummaries.title', 'Resúmenes de Streams')}
            </h1>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              {t('streamSummaries.subtitle', 'Resúmenes generados automáticamente por IA de streams de programación, Web3 y tecnología en español')}
            </p>

            {/* Stats */}
            {summariesData && (
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                <div className="bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700">
                  <span className="text-violet-400 font-bold text-2xl">
                    {summariesData.totalSummaries}
                  </span>
                  <span className="text-text-secondary text-sm ml-2">
                    {t('streamSummaries.totalStreams', 'streams analizados')}
                  </span>
                </div>
                <div className="bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700">
                  <span className="text-violet-400 font-bold text-2xl">
                    {Object.keys(summariesData.streamers || {}).length}
                  </span>
                  <span className="text-text-secondary text-sm ml-2">
                    {t('streamSummaries.streamersCount', 'streamers')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* About Abracadabra - Introduction */}
          <div className="mt-12 mb-12 max-w-4xl mx-auto bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded-xl p-8 border border-violet-700/30">
            <h3 className="text-2xl font-bold text-violet-300 mb-4 text-center">
              {t('streamSummaries.aboutTitle', '¿Qué es Abracadabra?')}
            </h3>
            <p className="text-text-secondary text-center mb-4">
              {t('streamSummaries.aboutIntro', 'Los resúmenes que verás a continuación fueron generados automáticamente por Abracadabra, nuestro sistema de análisis de streams impulsado por inteligencia artificial. Cada resumen captura los puntos clave, decisiones técnicas, y momentos destacados de cada transmisión.')}
            </p>
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center space-x-2 text-violet-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">
                  {t('streamSummaries.poweredBy', 'Powered by Claude AI & Cognee Memory')}
                </span>
              </div>
              <Link
                to="/services#abracadabra"
                className="text-violet-400 hover:text-violet-300 underline text-sm transition-colors"
              >
                {t('streamSummaries.learnMore', 'Conoce más sobre Abracadabra →')}
              </Link>
            </div>
          </div>

          {/* Streamer Filter */}
          {summariesData?.streamers && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedStreamer('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
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
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      selectedStreamer === streamer
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/50'
                        : 'bg-zinc-800 text-text-secondary hover:bg-zinc-700'
                    }`}
                  >
                    {streamer} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summaries List - Vertical Stack */}
          {filteredSummaries.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredSummaries.map((summary) => (
                <StreamSummaryCard key={`${summary.video_id}-${summary.streamer}`} summary={summary} />
              ))}
            </div>
          ) : (
            <div className="text-center text-text-primary mt-8 mb-80">
              <svg className="w-24 h-24 mx-auto text-text-secondary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl">
                {t('streamSummaries.noSummaries', 'No se encontraron resúmenes')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {summariesData && summariesData.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={summariesData.totalPages}
                paginate={paginate}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default StreamSummaries;
