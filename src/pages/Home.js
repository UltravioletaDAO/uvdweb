import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserGroupIcon, CurrencyDollarIcon, UserGroupIcon as GroupIcon, SparklesIcon, LightBulbIcon, GiftIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import ApplicationForm from './ApplicationForm';
import { useTranslation } from 'react-i18next';
import { getEvents } from '../services/events/Events';
import { useCombinedSnapshotData } from '../hooks/useCombinedSnapshotData';
import { useTokenMetrics } from '../hooks/useTokenMetrics';
import { useSafeAvalanche } from '../hooks/useSafeAvalanche';
// import DaoStoryteller from '../components/DaoStoryteller'; // Temporarily disabled - will be moved to backend API
import SEO from '../components/SEO';

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEventsSection, setShowEventsSection] = useState(true);
  
  const { t } = useTranslation();
  const showButtons = process.env.REACT_APP_SHOW_SIGNUP_BUTTONS === 'true';

  // Metrics hooks
  const { metrics: snapshotMetrics } = useCombinedSnapshotData();
  const tokenData = useTokenMetrics();
  const { fiatTotal: treasuryTotal, owners, threshold } = useSafeAvalanche();

  useEffect(() => {
    getEvents().then(fetchedEvents => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Filtrar los eventos con fecha futura
      const filteredEvents = fetchedEvents.filter(eventGroup => {
        const [eventDay, eventMonth] = eventGroup.date.split("/").map(Number);
        const eventDate = new Date(today.getFullYear(), eventMonth - 1, eventDay);
        return eventDate >= today; // El evento debe ser hoy o en el futuro
      });

      setEvents(filteredEvents);

      // Si no hay eventos futuros, ocultar la sección
      if (filteredEvents.length === 0) {
        setShowEventsSection(false);
      } else {
        setShowEventsSection(true);
      }
    });
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
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        {/* Imagen de fondo con overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://i.imgur.com/0SaZAmY.png')`,
            }}
          />
          {/* Overlay oscuro con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/70 to-background" />
          {/* Capa adicional para ajuste fino */}
          <div className="absolute inset-0 bg-black/25" />
          {/* Overlay ultravioleta sutil */}
          <div className="absolute inset-0 bg-ultraviolet-darker/15 mix-blend-overlay" />
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1.2,
              ease: "easeOut"
            }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: "easeOut"
              }}
              className="text-5xl md:text-6xl font-bold text-white mb-6
                [text-shadow:_2px_2px_12px_rgba(106,0,255,0.5),_0_0_4px_rgba(106,0,255,0.8)]
                relative z-10"
            >
              {t('home.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                ease: "easeOut"
              }}
              className="text-xl md:text-2xl text-text-primary mb-12 leading-relaxed
                drop-shadow-md"
            >
              {t('home.subtitle')}
            </motion.p>
            
            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.7,
                  ease: "easeOut"
                }}
                className="flex flex-col sm:flex-row justify-center gap-4 mt-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFormOpen(true)}
                  className="px-8 py-4 bg-ultraviolet-darker text-text-primary rounded-lg
                    hover:bg-ultraviolet-dark transition-colors duration-200
                    font-semibold text-lg shadow-lg shadow-ultraviolet-darker/20
                    backdrop-blur-sm"
                >
                  {t('auth.register')}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* DAO Metrics - Simple boxes right after Apply button */}
      <div style={{
        backgroundColor: '#0a0a1b',
        padding: '60px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* DAO LLC Legal Status Box - Featured Banner */}
          <div style={{
            backgroundColor: 'rgba(147, 51, 234, 0.05)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '1 1 auto' }}>
              <div style={{ fontSize: '28px' }}>⚖️</div>
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {t('home.metrics.legal.title')}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
                  DAO LLC
                </div>
              </div>
              <div style={{
                borderLeft: '1px solid rgba(147, 51, 234, 0.2)',
                paddingLeft: '24px',
                marginLeft: '8px'
              }}>
                <div style={{ fontSize: '14px', color: '#a78bfa' }}>
                  {t('home.metrics.legal.jurisdiction')}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                  {t('home.metrics.legal.registered')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/about#legal"
                style={{
                  fontSize: '13px',
                  color: '#a78bfa',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(147, 51, 234, 0.05)',
                  transition: 'all 0.2s'
                }}
                className="hover:bg-purple-600/20 hover:border-purple-500/50"
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
                style={{
                  fontSize: '13px',
                  color: '#10b981',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  transition: 'all 0.2s'
                }}
                className="hover:bg-green-600/20 hover:border-green-500/50"
              >
                Official Filing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>

            {/* Community Vault Box - First */}
            <div style={{
              backgroundColor: 'rgba(0, 255, 163, 0.05)',
              border: '1px solid rgba(0, 255, 163, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🏦 {t('home.metrics.funds.community_vault')}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                  ${treasuryTotal ? Math.floor(treasuryTotal).toLocaleString() : '-'}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  {t('home.metrics.funds.multisig')}
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#666', borderTop: '1px solid rgba(0, 255, 163, 0.1)', paddingTop: '8px', marginTop: 'auto' }}>
                {threshold || '-'} {t('home.metrics.funds.required_of')} {owners?.length || '-'} {t('home.metrics.funds.multisigners')}
              </div>
            </div>

            {/* Snapshot Governance Box - Middle */}
            <div style={{
              backgroundColor: 'rgba(106, 0, 255, 0.05)',
              border: '1px solid rgba(106, 0, 255, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🗳️ {t('home.metrics.snapshot.title')}
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Propuestas y Votos con mayor visibilidad */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                      {snapshotMetrics?.proposals || '-'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#bb86fc', fontWeight: '600' }}>
                      {t('home.metrics.snapshot.proposals')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                      {snapshotMetrics?.votes?.toLocaleString() || '-'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#bb86fc', fontWeight: '600' }}>
                      {t('home.metrics.snapshot.votes')}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {t('home.metrics.snapshot.members_participating', { count: snapshotMetrics?.followers || '-' })}
                </div>
              </div>
              
              {/* Since June 2023 en la línea divisoria */}
              <div style={{ fontSize: '13px', color: '#888', borderTop: '1px solid rgba(106, 0, 255, 0.2)', paddingTop: '8px', marginTop: 'auto' }}>
                {t('home.metrics.snapshot.since')}
              </div>
            </div>

            {/* Token UVD Box - Right */}
            <div style={{
              backgroundColor: 'rgba(255, 179, 0, 0.05)',
              border: '1px solid rgba(255, 179, 0, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              position: 'relative',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column'
            }}
            className="group"
            >
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                💰 {t('home.metrics.token.title_full')}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>
                  {tokenData.priceUsd ? Math.floor(1 / parseFloat(tokenData.priceUsd)).toLocaleString() : '-'} UVD = $1 USD
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>
                  {tokenData.priceNative ? Math.floor(1 / parseFloat(tokenData.priceNative)).toLocaleString() : '-'} UVD = 1 AVAX
                </div>
                <div style={{ fontSize: '14px', color: '#9c27b0' }}>
                  {t('home.metrics.token.total_liquidity_backing')}: ${tokenData.liquidity ? parseFloat(tokenData.liquidity).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '-'}
                  {tokenData.liquidity && tokenData.priceNative && tokenData.priceUsd && (
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '6px' }}>
                      ({Math.floor(parseFloat(tokenData.liquidity) / (parseFloat(tokenData.priceUsd) / parseFloat(tokenData.priceNative))).toLocaleString()} AVAX)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#ff4444', marginTop: '4px' }}>
                  🔥 {t('home.metrics.token.burned_total')}: {tokenData.totalBurnedTokens ? tokenData.totalBurnedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} UVD
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#666', borderTop: '1px solid rgba(255, 179, 0, 0.1)', paddingTop: '8px', marginTop: 'auto' }}>
                {tokenData.holderCount?.toLocaleString() || '-'} {t('home.metrics.token.holders')} • {tokenData.totalTransactions?.toLocaleString() || '-'} {t('home.metrics.token.transactions')}
              </div>
              
              {/* Tooltip con conversiones */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-gray-900 text-white p-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10">
                <div className="text-xs space-y-2">
                  {tokenData.priceUsd && (
                    <div className="border-b border-gray-700 pb-1">
                      <div className="font-semibold mb-1">{t('home.metrics.token.tooltip.usd')}</div>
                      <div>{Math.floor(1 / parseFloat(tokenData.priceUsd)).toLocaleString()} UVD = $1</div>
                      <div>{Math.floor(10 / parseFloat(tokenData.priceUsd)).toLocaleString()} UVD = $10</div>
                      <div>{Math.floor(100 / parseFloat(tokenData.priceUsd)).toLocaleString()} UVD = $100</div>
                    </div>
                  )}
                  {tokenData.priceNative && (
                    <div>
                      <div className="font-semibold mb-1">{t('home.metrics.token.tooltip.avax')}</div>
                      <div>{Math.floor(1 / parseFloat(tokenData.priceNative)).toLocaleString()} UVD = 1 AVAX</div>
                      <div>{Math.floor(5 / parseFloat(tokenData.priceNative)).toLocaleString()} UVD = 5 AVAX</div>
                      <div>{Math.floor(10 / parseFloat(tokenData.priceNative)).toLocaleString()} UVD = 10 AVAX</div>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-900"></div>
              </div>
            </div>

          </div>

          {/* DAO Storyteller - Historia generada por IA - Solo muestra con datos reales */}
          {/* DaoStoryteller temporarily disabled - will be moved to backend API to prevent API key exposure */}
          {/* {snapshotMetrics?.proposals &&
           snapshotMetrics?.votes &&
           tokenData.holderCount &&
           treasuryTotal &&
           owners?.length && (
            <div style={{ marginTop: '24px' }}>
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
          )} */}
        </div>

        
        {/* Link "See More" */}
        <div style={{ textAlign: 'center', paddingTop: '24px', paddingBottom: '24px' }}>
          <Link
            to="/metrics"
            className="inline-flex items-center gap-2 text-sm text-white hover:text-ultraviolet-light transition-colors duration-200"
            style={{ textDecoration: 'none' }}
          >
            <span>{t('home.metrics.see_more')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Características actualizadas */}
      <section className="py-16 bg-background-lighter">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.2,
                  ease: "easeOut"
                }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enlaces Importantes */}
      <section className="py-12 bg-background-lighter">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-text-primary text-center mb-8"
          >
            {t('links.title', 'Enlaces Importantes')}
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.a
              href="https://twitter.com/UltravioletaDAO"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-gray-700 rounded-lg hover:border-[#1DA1F2] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-white">Twitter/X</span>
            </motion.a>

            <motion.a
              href="https://arena.social/UltravioletaDAO"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-gray-700 rounded-lg hover:border-[#FF5CAA] transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" fill="none" className="w-5 h-5">
                <g fill="white" clipPath="url(#a)">
                  <path d="M31.463 15.472V42h-.678V17.454c0-8.154-6.64-14.794-14.794-14.794-8.153 0-14.776 6.623-14.776 14.794V42H.537V15.472C.537 6.919 7.455 0 16.009 0c8.552 0 15.454 6.919 15.454 15.472Z"/>
                  <path d="M28.768 16.984v22.513h-.678V18.705c0-6.675-5.423-12.099-12.099-12.099-6.675 0-12.1 5.406-12.1 12.082v20.791h-.677V16.967c0-7.058 5.72-12.777 12.777-12.777 7.058 0 12.777 5.719 12.777 12.777v.017Z"/>
                </g>
                <defs><clipPath id="a"><rect width="30.9263" height="42" fill="white" transform="translate(0.536621)"/></clipPath></defs>
              </svg>
              <span className="text-white">The Arena</span>
            </motion.a>

            <motion.a
              href="https://app.safe.global/home?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-gray-700 rounded-lg hover:border-emerald-400 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" fill="currentColor"/>
              </svg>
              <span className="text-white">{t('navigation.multisig', 'Multisig')}</span>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Beneficios actualizados */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: "easeOut"
            }}
            className="text-3xl font-bold text-text-primary text-center mb-12"
          >
            {t('benefits.title')}
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1,
                  delay: 0.2 + index * 0.2,
                  ease: "easeOut"
                }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Próximos eventos */}
      {showEventsSection && (
        <section className="py-16 bg-background-lighter">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
              className="text-3xl font-bold text-text-primary mb-5"
            >
              {t('events.title')}
            </motion.h2>

            <p className="text-text-secondary mb-10">
              {t('events.description')}
            </p>

            <div className="space-y-8">
              {events.map((eventGroup) => (
                <div key={eventGroup.date} className="mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1,
                      ease: "easeOut"
                    }}
                    className="flex items-center mb-4 text-text-primary"
                  >
                    <div className="w-4 h-4 bg-ultraviolet-darker rounded-full mr-3"></div>
                    <span className="font-bold mr-2">{eventGroup.date}</span>
                  </motion.div>

                  <div className="space-y-6">
                    {eventGroup.events.map((event, eventIndex) => (
                      <motion.div
                        key={`${eventGroup.date}-${event.title}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + eventIndex * 0.1,
                          ease: "easeOut"
                        }}
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
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/300/200";
                                  e.target.alt = t('events.image_alt_placeholder');
                                }}
                              />
                            </div>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ApplicationForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
    </>
  );
};

export default Home;