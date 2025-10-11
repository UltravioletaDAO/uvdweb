import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, CurrencyDollarIcon, UserGroupIcon as GroupIcon, SparklesIcon, LightBulbIcon, GiftIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getEvents } from '../services/events/Events';
import { useCombinedSnapshotData } from '../hooks/useCombinedSnapshotData';
import { useTokenMetrics } from '../hooks/useTokenMetrics';
import { useSafeAvalanche } from '../hooks/useSafeAvalanche';
import SEO from '../components/SEO';

// Lazy load heavy components
const ApplicationForm = lazy(() => import('./ApplicationForm'));
const DaoStoryteller = lazy(() => import('../components/DaoStoryteller'));

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEventsSection, setShowEventsSection] = useState(false);

  const { t } = useTranslation();
  const showButtons = process.env.REACT_APP_SHOW_SIGNUP_BUTTONS === 'true';

  // Metrics hooks
  const { metrics: snapshotMetrics } = useCombinedSnapshotData();
  const tokenData = useTokenMetrics();
  const { fiatTotal: treasuryTotal, owners, threshold } = useSafeAvalanche();

  useEffect(() => {
    // Defer events loading
    const timer = setTimeout(() => {
      getEvents().then(fetchedEvents => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filteredEvents = fetchedEvents.filter(eventGroup => {
          const [eventDay, eventMonth] = eventGroup.date.split("/").map(Number);
          const eventDate = new Date(today.getFullYear(), eventMonth - 1, eventDay);
          return eventDate >= today;
        });
        setEvents(filteredEvents);
        setShowEventsSection(filteredEvents.length > 0);
      });
    }, 1000); // Load events after 1 second

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: t('features.community.title'),
      description: t('features.community.description'),
      icon: UserGroupIcon,
      link: "https://linktr.ee/UltravioletaDAO",
      buttonText: t('features.community.button')
    },
    {
      title: t('features.token.title'),
      description: t('features.token.description'),
      isInternal: true,
      icon: CurrencyDollarIcon,
      path: "/token",
      buttonText: t('features.token.button')
    },
    {
      title: t('features.raffles.title'),
      description: t('features.raffles.description'),
      icon: GiftIcon,
      isComingSoon: true
    }
  ];

  const benefits = [
    {
      title: t('benefits.experts.title'),
      description: t('benefits.experts.description'),
      icon: GroupIcon
    },
    {
      title: t('benefits.networking.title'),
      description: t('benefits.networking.description'),
      icon: SparklesIcon
    },
    {
      title: t('benefits.alphas.title'),
      description: t('benefits.alphas.description'),
      icon: LightBulbIcon
    }
  ];

  return (
    <>
      <SEO
        title={t('home.seoTitle', 'Home')}
        description={t('home.seoDescription', 'Join UltraVioleta DAO - Building the future of Web3 in Latin America through decentralized governance, community innovation, and collaborative treasury management.')}
        keywords="UltraVioleta DAO, Web3 LATAM, Latin America Blockchain, DAO Community, Decentralized Governance, Avalanche, Snapshot Voting, Web3 Development, DeFi Latin America"
      />
      <div className="min-h-screen bg-background">
      {/* Hero Section - Simplified without animations */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/hero-optimized.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/70 to-background" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-ultraviolet-darker/15 mix-blend-overlay" />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6
              [text-shadow:_2px_2px_12px_rgba(106,0,255,0.5),_0_0_4px_rgba(106,0,255,0.8)]
              relative z-10">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-text-primary mb-12 leading-relaxed drop-shadow-md">
              {t('home.subtitle')}
            </p>

            {showButtons && (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-8 py-4 bg-ultraviolet-darker text-text-primary rounded-lg
                    hover:bg-ultraviolet-dark transition-colors duration-200
                    font-semibold text-lg shadow-lg shadow-ultraviolet-darker/20
                    backdrop-blur-sm transform hover:scale-105 active:scale-95"
                >
                  {t('auth.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DAO Metrics - Static rendering for performance */}
      <div className="bg-[#0a0a1b] py-[60px] px-[20px] border-t border-white/10">
        <div className="max-w-[1200px] mx-auto">

          {/* DAO LLC Legal Status Box */}
          <div className="bg-purple-600/5 border border-purple-600/20 rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-3xl">⚖️</div>
              <div>
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  {t('home.metrics.legal.title')}
                </div>
                <div className="text-xl font-bold text-white">
                  DAO LLC
                </div>
              </div>
              <div className="border-l border-purple-600/20 pl-6 ml-2">
                <div className="text-sm text-purple-400">
                  {t('home.metrics.legal.jurisdiction')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t('home.metrics.legal.registered')}
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                to="/about#legal"
                className="text-sm text-purple-400 inline-flex items-center gap-2 px-4 py-2 border border-purple-600/30 rounded-lg bg-purple-600/5 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all"
              >
                {t('home.metrics.legal.learn_more')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <a
                href="https://wyobiz.wyo.gov/business/FilingDetails.aspx?eFNum=231152217007187086250219198232174206067107184230"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-500 inline-flex items-center gap-2 px-4 py-2 border border-green-600/30 rounded-lg bg-green-600/5 hover:bg-green-600/20 hover:border-green-500/50 transition-all"
              >
                Official Filing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Community Vault Box */}
            <div className="bg-emerald-600/5 border border-emerald-600/20 rounded-xl p-6 text-center min-h-[180px] flex flex-col">
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                🏦 {t('home.metrics.funds.community_vault')}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-bold text-white mb-2">
                  ${treasuryTotal ? Math.floor(treasuryTotal).toLocaleString() : '-'}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {t('home.metrics.funds.multisig')}
                </div>
              </div>
              <div className="text-sm text-gray-600 border-t border-emerald-600/10 pt-2 mt-auto">
                {threshold || '-'} {t('home.metrics.funds.required_of')} {owners?.length || '-'} {t('home.metrics.funds.multisigners')}
              </div>
            </div>

            {/* Snapshot Governance Box */}
            <div className="bg-violet-600/5 border border-violet-600/20 rounded-xl p-6 text-center min-h-[180px] flex flex-col">
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                🗳️ {t('home.metrics.snapshot.title')}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-around mb-2">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {snapshotMetrics?.proposals || '-'}
                    </div>
                    <div className="text-xs text-purple-400 font-semibold">
                      {t('home.metrics.snapshot.proposals')}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {snapshotMetrics?.votes?.toLocaleString() || '-'}
                    </div>
                    <div className="text-xs text-purple-400 font-semibold">
                      {t('home.metrics.snapshot.votes')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {t('home.metrics.snapshot.members_participating', { count: snapshotMetrics?.followers || '-' })}
                </div>
              </div>
              <div className="text-sm text-gray-500 border-t border-violet-600/20 pt-2 mt-auto">
                {t('home.metrics.snapshot.since')}
              </div>
            </div>

            {/* Token UVD Box */}
            <div className="bg-amber-600/5 border border-amber-600/20 rounded-xl p-6 text-center relative min-h-[180px] flex flex-col group">
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                💰 {t('home.metrics.token.title_full')}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {tokenData.priceUsd ? Math.floor(1 / parseFloat(tokenData.priceUsd)).toLocaleString() : '-'} UVD = $1
                </div>
                <div className="text-xl font-semibold text-white mb-2">
                  {tokenData.priceNative ? Math.floor(1 / parseFloat(tokenData.priceNative)).toLocaleString() : '-'} UVD = 1 AVAX
                </div>
                <div className="text-sm text-purple-500">
                  {t('home.metrics.token.total_liquidity_backing')}: ${tokenData.liquidity ? parseFloat(tokenData.liquidity).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '-'}
                </div>
                <div className="text-sm text-red-500 mt-1">
                  🔥 {t('home.metrics.token.burned_total')}: {tokenData.totalBurnedTokens ? tokenData.totalBurnedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} UVD
                </div>
              </div>
              <div className="text-sm text-gray-600 border-t border-amber-600/10 pt-2 mt-auto">
                {tokenData.holderCount?.toLocaleString() || '-'} {t('home.metrics.token.holders')} • {tokenData.totalTransactions?.toLocaleString() || '-'} {t('home.metrics.token.transactions')}
              </div>
            </div>
          </div>

          {/* Lazy load DAO Storyteller */}
          <Suspense fallback={<div className="mt-6 h-32 bg-gray-800/20 rounded-xl animate-pulse" />}>
            {snapshotMetrics?.proposals && tokenData.holderCount && treasuryTotal && owners?.length && (
              <div className="mt-6">
                <DaoStoryteller
                  metrics={{
                    proposals: snapshotMetrics.proposals,
                    votes: snapshotMetrics.votes,
                    followers: snapshotMetrics.followers || 0,
                    uvdPrice: tokenData.priceUsd ? Math.floor(1 / parseFloat(tokenData.priceUsd)) : 0,
                    holders: parseInt(tokenData.holderCount),
                    transactions: parseInt(tokenData.totalTransactions) || 0,
                    treasury: Math.floor(treasuryTotal),
                    multisigners: owners.length,
                    threshold: threshold || 0,
                    liquidity: tokenData.liquidity ? parseFloat(tokenData.liquidity) : 0
                  }}
                />
              </div>
            )}
          </Suspense>
        </div>

        <div className="text-center pt-6 pb-6">
          <Link
            to="/metrics"
            className="inline-flex items-center gap-2 text-sm text-white hover:text-ultraviolet-light transition-colors duration-200"
          >
            <span>{t('home.metrics.see_more')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Features Section - Without heavy animations */}
      <section className="py-16 bg-background-lighter">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-background border border-ultraviolet-darker/20
                  hover:border-ultraviolet-darker transition-all duration-300
                  hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                  hover:bg-background/80 group flex flex-col h-full"
              >
                <div className="flex-grow">
                  <feature.icon className="w-12 h-12 text-white mb-4
                    drop-shadow-[0_0_8px_rgba(106,0,255,0.5)]
                    transition-all duration-300
                    group-hover:drop-shadow-[0_0_12px_rgba(106,0,255,0.8)]" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {feature.description}
                  </p>
                </div>
                {!feature.isComingSoon && (
                  <div className="mt-auto pt-4">
                    {feature.isInternal ? (
                      <Link
                        to={feature.path}
                        className="inline-block px-4 py-2 bg-ultraviolet-darker text-text-primary rounded-lg
                          hover:bg-ultraviolet-dark transition-colors duration-200 w-full text-center"
                      >
                        {feature.buttonText}
                      </Link>
                    ) : (
                      <a
                        href={feature.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-ultraviolet-darker text-text-primary rounded-lg
                          hover:bg-ultraviolet-dark transition-colors duration-200 w-full text-center"
                      >
                        {feature.buttonText}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Links */}
      <section className="py-12 bg-background-lighter">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
            {t('links.title', 'Enlaces Importantes')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://twitter.com/UltravioletaDAO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-gray-700 rounded-lg hover:border-[#1DA1F2] hover:scale-105 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-white">Twitter/X</span>
            </a>

            <a
              href="https://arena.social/UltravioletaDAO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-gray-700 rounded-lg hover:border-[#FF5CAA] hover:scale-105 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" fill="none" className="w-5 h-5">
                <g fill="white" clipPath="url(#a)">
                  <path d="M31.463 15.472V42h-.678V17.454c0-8.154-6.64-14.794-14.794-14.794-8.153 0-14.776 6.623-14.776 14.794V42H.537V15.472C.537 6.919 7.455 0 16.009 0c8.552 0 15.454 6.919 15.454 15.472Z"/>
                  <path d="M28.768 16.984v22.513h-.678V18.705c0-6.675-5.423-12.099-12.099-12.099-6.675 0-12.1 5.406-12.1 12.082v20.791h-.677V16.967c0-7.058 5.72-12.777 12.777-12.777 7.058 0 12.777 5.719 12.777 12.777v.017Z"/>
                </g>
                <defs><clipPath id="a"><rect width="30.9263" height="42" fill="white" transform="translate(0.536621)"/></clipPath></defs>
              </svg>
              <span className="text-white">The Arena</span>
            </a>

            <a
              href="https://app.safe.global/home?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-gray-700 rounded-lg hover:border-emerald-400 hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" fill="currentColor"/>
              </svg>
              <span className="text-white">{t('navigation.multisig', 'Multisig')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            {t('benefits.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 rounded-xl bg-background-lighter border border-ultraviolet-darker/20
                  hover:border-ultraviolet-darker transition-all duration-300
                  hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                  hover:bg-background-lighter/90 group"
              >
                <benefit.icon className="w-12 h-12 text-white mb-4
                  drop-shadow-[0_0_8px_rgba(106,0,255,0.5)]
                  transition-all duration-300
                  group-hover:drop-shadow-[0_0_12px_rgba(106,0,255,0.8)]" />
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {benefit.title}
                </h3>
                <p className="text-text-secondary">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section - Lazy loaded */}
      {showEventsSection && (
        <section className="py-16 bg-background-lighter">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-text-primary mb-5">
              {t('events.title')}
            </h2>
            <p className="text-text-secondary mb-10">
              {t('events.description')}
            </p>
            <div className="space-y-8">
              {events.map((eventGroup) => (
                <div key={eventGroup.date} className="mb-8">
                  <div className="flex items-center mb-4 text-text-primary">
                    <div className="w-4 h-4 bg-ultraviolet-darker rounded-full mr-3"></div>
                    <span className="font-bold mr-2">{eventGroup.date}</span>
                  </div>
                  <div className="space-y-6">
                    {eventGroup.events.map((event) => (
                      <div
                        key={`${eventGroup.date}-${event.title}`}
                        className="rounded-xl overflow-hidden bg-background border border-ultraviolet-darker/20
                        hover:border-ultraviolet-darker transition-all duration-300
                        hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      >
                        <a
                          href={event.register}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-grow">
                              <h3 className="text-xl font-bold text-text-primary mb-3">{event.title}</h3>
                              <div className="flex items-center mb-3 text-text-secondary">
                                <MapPinIcon className="w-5 h-5 mr-2 text-ultraviolet-light" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center mb-3 text-text-secondary">
                                <ClockIcon className="w-5 h-5 mr-2 text-ultraviolet-light" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            <div className="md:w-1/6 h-auto flex items-center justify-center">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full aspect-[16/9] object-cover rounded-lg"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/300/200";
                                  e.target.alt = t('events.image_alt_placeholder');
                                }}
                              />
                            </div>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Suspense fallback={null}>
        <ApplicationForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      </Suspense>
    </div>
    </>
  );
};

export default Home;