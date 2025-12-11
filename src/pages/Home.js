import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RocketLaunchIcon, FireIcon, TrophyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getEvents } from '../services/events/Events';
import { useCombinedSnapshotData } from '../hooks/useCombinedSnapshotData';
import { useTokenMetrics } from '../hooks/useTokenMetrics';
import { useSafeAvalanche } from '../hooks/useSafeAvalanche';
import SEO from '../components/SEO';

// Lazy load heavy components
const ApplicationForm = lazy(() => import('./ApplicationForm'));
const DaoStoryteller = lazy(() => import('../components/DaoStoryteller'));

const HeroSection = ({ t, onOpenForm }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-ultraviolet/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow animation-delay-200" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ y }}
          className="max-w-5xl mx-auto space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-300 tracking-wide uppercase">Active Governance</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-6 leading-tight">
            <span className="block">Building the</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-ultraviolet-light via-white to-cyan-glow">
              Future of Web3
            </span>
            <span className="block text-4xl md:text-5xl mt-2 font-bold text-gray-400">in Latin America</span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-light">
            Pioneers of <span className="text-white font-medium">x402 Facilitator</span> & gasless payments.
            Empowering communities through decentralized governance and autonomous agents.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <button
              onClick={onOpenForm}
              className="group relative px-8 py-4 bg-white text-black text-lg font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              <div className="relative z-10 flex items-center">
                {t('auth.register')}
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <Link
              to="/about"
              className="px-8 py-4 bg-white/5 text-white text-lg font-semibold rounded-full border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              {t('navigation.about')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const MetricCard = ({ title, value, subtext, icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: delay * 0.1, duration: 0.5 }}
    className={`glass-card p-8 border-t-4 ${colorClass} group`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
        <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
      </div>
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
    </div>
    <p className="text-sm text-text-muted">{subtext}</p>
  </motion.div>
);

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEventsSection, setShowEventsSection] = useState(false);

  const { t } = useTranslation();
  const showButtons = process.env.REACT_APP_SHOW_SIGNUP_BUTTONS === 'true';

  // Metrics hooks
  const { metrics: snapshotMetrics } = useCombinedSnapshotData();
  const tokenData = useTokenMetrics();
  const { fiatTotal: treasuryTotal } = useSafeAvalanche();

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
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEO
        title={t('home.seoTitle', 'Home - x402 Facilitator & Web3 DAO')}
        description={t('home.seoDescription')}
        keywords="x402 facilitator, gasless payments, WEB3, DAO"
      />

      <div className="min-h-screen bg-background text-white selection:bg-ultraviolet selection:text-white">
        <HeroSection t={t} onOpenForm={() => setIsFormOpen(true)} />

        {/* Metrics Section */}
        <section className="py-20 relative z-20 -mt-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title={t('home.metrics.funds.community_vault')}
                value={`$${treasuryTotal ? Math.floor(treasuryTotal).toLocaleString() : '-'}`}
                subtext="Total Treasury Assets"
                colorClass="border-emerald-500"
                icon={<span className="text-2xl">🏦</span>}
                delay={1}
              />
              <MetricCard
                title={t('home.metrics.snapshot.votes')}
                value={snapshotMetrics?.votes?.toLocaleString() || '-'}
                subtext={`${snapshotMetrics?.proposals || '-'} Active Proposals`}
                colorClass="border-ultraviolet-light"
                icon={<span className="text-2xl">🗳️</span>}
                delay={2}
              />
              <MetricCard
                title="Token Price"
                value={`$${tokenData.priceUsd ? parseFloat(tokenData.priceUsd).toFixed(4) : '-'}`}
                subtext="UVD Token Value"
                colorClass="border-amber-500"
                icon={<span className="text-2xl">🪙</span>}
                delay={3}
              />
              <MetricCard
                title="Community"
                value={snapshotMetrics?.followers || '-'}
                subtext="Active Members"
                colorClass="border-pink-500"
                icon={<span className="text-2xl">👥</span>}
                delay={4}
              />
            </div>
          </div>
        </section>

        {/* DAO Storyteller */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <Suspense fallback={<div className="h-64 glass-panel animate-pulse" />}>
              <DaoStoryteller
                metrics={{
                  proposals: snapshotMetrics?.proposals,
                  votes: snapshotMetrics?.votes,
                  followers: snapshotMetrics?.followers || 0,
                  uvdPrice: tokenData.priceUsd ? Math.floor(1 / parseFloat(tokenData.priceUsd)) : 0,
                  holders: tokenData.holderCount ? parseInt(tokenData.holderCount) : 0,
                  transactions: tokenData.totalTransactions ? parseInt(tokenData.totalTransactions) : 0,
                  treasury: treasuryTotal ? Math.floor(treasuryTotal) : 0,
                  multisigners: 0,
                  threshold: 0,
                  liquidity: tokenData.liquidity ? parseFloat(tokenData.liquidity) : 0
                }}
              />
            </Suspense>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-background-lighter/50 skew-y-3 transform origin-top-left scale-110 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                <span className="heading-gradient">{t('home.achievements.title')}</span>
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                {t('home.achievements.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: RocketLaunchIcon,
                  title: t('home.achievements.validator.title'),
                  date: t('home.achievements.validator.date'),
                  desc: t('home.achievements.validator.description'),
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                  link: "https://nearblocks.io/address/ultravioletadao.pool.near"
                },
                {
                  icon: FireIcon,
                  title: t('home.achievements.facilitator.title'),
                  date: t('home.achievements.facilitator.date'),
                  desc: t('home.achievements.facilitator.description'),
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  link: "https://facilitator.ultravioletadao.xyz/"
                },
                {
                  icon: TrophyIcon,
                  title: t('home.achievements.competition.title'),
                  date: t('home.achievements.competition.date'),
                  desc: t('home.achievements.competition.description'),
                  color: "text-amber-400",
                  bg: "bg-amber-400/10",
                  link: "https://x.com/soymaikoldev/status/1983244934963433521"
                }
              ].map((item, index) => (
                <motion.a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="glass-card p-8 group hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-ultraviolet-light transition-colors">{item.title}</h3>
                  <div className={`text-xs font-mono mb-4 ${item.color}`}>{item.date}</div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                  <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors">
                    View Details <ArrowRightIcon className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        {showEventsSection && (
          <section className="py-24 bg-background-lighter">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10">
                <span className="heading-gradient">{t('events.title')}</span>
              </h2>
              <div className="grid gap-6">
                {events.map((eventGroup) => (
                  eventGroup.events.map((event, idx) => (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      key={idx}
                      className="glass-panel p-1 hover:bg-white/5 transition-colors"
                    >
                      <a href={event.register} target="_blank" rel="noopener noreferrer" className="flex flex-col md:flex-row gap-6 p-4">
                        <div className="md:w-64 h-40 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={event.image || "/api/placeholder/400/320"}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                            onError={(e) => { e.target.src = "https://placehold.co/600x400/1e1e1e/FFF?text=Event"; }}
                          />
                        </div>
                        <div className="flex-1 py-2">
                          <div className="flex items-center gap-3 text-sm text-ultraviolet-light mb-2 font-mono">
                            <span>{eventGroup.date}</span>
                            <span>•</span>
                            <span>{event.time}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-text-secondary mb-4 line-clamp-2">{event.location}</p>
                          <span className="inline-flex items-center text-sm font-semibold text-white/80 border-b border-transparent hover:border-ultraviolet-light transition-all">
                            Register Now <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </span>
                        </div>
                      </a>
                    </motion.div>
                  ))
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