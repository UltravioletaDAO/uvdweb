import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  BeakerIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  FireIcon,
  ChartBarIcon,
  SparklesIcon,
  PlayCircleIcon,
  PhotoIcon,
  HeartIcon,
  VideoCameraIcon,
  NewspaperIcon,
  MicrophoneIcon,
  RocketLaunchIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';

const About = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('vision');

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const milestones = [
    {
      date: t('about.timeline.march2022.date'),
      title: t('about.timeline.march2022.title'),
      description: t('about.timeline.march2022.description'),
      icon: SparklesIcon,
      color: "text-amber-400"
    },
    {
      date: t('about.timeline.crt.date'),
      title: t('about.timeline.crt.title'),
      description: t('about.timeline.crt.description'),
      icon: BeakerIcon,
      color: "text-cyan-400"
    },
    {
      date: t('about.timeline.partner2022.date'),
      title: t('about.timeline.partner2022.title'),
      description: t('about.timeline.partner2022.description'),
      icon: FireIcon,
      color: "text-rose-500"
    },
    {
      date: t('about.timeline.september2023.date'),
      title: t('about.timeline.september2023.title'),
      description: t('about.timeline.september2023.description'),
      icon: UserGroupIcon,
      color: "text-ultraviolet-light",
      images: ['/images/quedada-bogota-2023.jpg', '/images/quedada-medellin-2023.jpg'],
      videos: [
        { url: 'https://youtu.be/yw5yLp0-_Tw', title: 'Quedada Bogotá 2023' },
        { url: 'https://youtu.be/PzIwQMhS88s', title: 'Quedada Medellín 2023' }
      ]
    },
    {
      date: t('about.timeline.january2024.date'),
      title: t('about.timeline.january2024.title'),
      description: t('about.timeline.january2024.description'),
      icon: GlobeAltIcon,
      color: "text-emerald-400"
    },
    {
      date: t('about.timeline.june2024.date'),
      title: t('about.timeline.june2024.title'),
      description: t('about.timeline.june2024.description'),
      icon: FireIcon,
      color: "text-orange-500"
    },
    {
      date: t('about.timeline.july2024.date'),
      title: t('about.timeline.july2024.title'),
      description: t('about.timeline.july2024.description'),
      icon: BeakerIcon,
      color: "text-blue-400"
    },
    {
      date: t('about.timeline.october2024.date'),
      title: t('about.timeline.october2024.title'),
      description: t('about.timeline.october2024.description'),
      icon: GlobeAltIcon,
      color: "text-indigo-400",
      images: ['/images/quedada-argentina-avalanche-summit-2024.png'],
      videos: [
        { url: 'https://youtu.be/aHSl32p5t28', title: 'Avalanche Summit Argentina 2024' }
      ]
    },
    {
      date: t('about.timeline.december2024.date'),
      title: t('about.timeline.december2024.title'),
      description: t('about.timeline.december2024.description'),
      icon: UserGroupIcon,
      color: "text-pink-500",
      images: ['/images/quedada-medellin-2024.jpg'],
      videos: [
        { url: 'https://youtu.be/knuBAicIc5U', title: 'Quedada Medellín 2024' }
      ]
    },
    {
      date: t('about.timeline.january2025.date'),
      title: t('about.timeline.january2025.title'),
      description: t('about.timeline.january2025.description'),
      icon: ChartBarIcon,
      color: "text-cyan-400"
    },
    {
      date: t('about.timeline.august23_2025.date'),
      title: t('about.timeline.august23_2025.title'),
      description: t('about.timeline.august23_2025.description'),
      icon: RocketLaunchIcon,
      color: "text-ultraviolet",
      images: ['/images/ultraevento-2025-promo.jpg', '/images/ultraevento-2025.jpg'],
      sponsors: [
        { name: 'Avalanche', twitter: '@AvaxTeam1', videoUrl: 'https://x.com/UltravioletaDAO/status/1961197588389953629' },
        { name: 'Rekt', twitter: '@RektHQ', videoUrl: 'https://x.com/UltravioletaDAO/status/1961077187227844906' },
        { name: 'Celo Colombia', twitter: '@Celo_Col', videoUrl: 'https://x.com/UltravioletaDAO/status/1961113800574189779' },
        { name: 'Self', twitter: '@selfprotocol', videoUrl: 'https://x.com/UltravioletaDAO/status/1961544954301616209' },
        { name: 'Uniswap', twitter: '@Uniswap', videoUrl: 'https://x.com/UltravioletaDAO/status/1961535762828333124' },
        { name: 'Pyth Network', twitter: '@PythNetwork', videoUrl: 'https://x.com/UltravioletaDAO/status/1961567997509738889' },
        { name: 'Heroes Of Cipher', twitter: '@HeroesOfCipher', videoUrl: 'https://x.com/UltravioletaDAO/status/1961177432419193181' },
        { name: 'deBridge', twitter: '@debridge', videoUrl: 'https://x.com/UltravioletaDAO/status/1961424459929092283' },
        { name: 'Superfluid', twitter: '@Superfluid_HQ', videoUrl: 'https://x.com/UltravioletaDAO/status/1961617646970970208' },
        { name: 'Magic Eden', twitter: '@Eden_Magico', videoUrl: 'https://x.com/UltravioletaDAO/status/1961271683995640236' }
      ]
    },
    {
      date: t('about.timeline.august24_2025.date'),
      title: t('about.timeline.august24_2025.title'),
      description: t('about.timeline.august24_2025.description'),
      icon: UserGroupIcon,
      color: "text-purple-400",
      images: ['/images/quedada-medellin-2025.jpg']
    },
    {
      date: t('about.timeline.duna2025.date'),
      title: t('about.timeline.duna2025.title'),
      description: t('about.timeline.duna2025.description'),
      icon: AcademicCapIcon,
      color: "text-blue-500"
    },
    {
      date: t('about.timeline.october18_2024.date'),
      title: t('about.timeline.october18_2024.title'),
      description: t('about.timeline.october18_2024.description'),
      icon: ChartBarIcon,
      color: "text-green-400",
      links: t('about.timeline.october18_2024.links', { returnObjects: true })
    },
    {
      date: t('about.timeline.october26_2024.date'),
      title: t('about.timeline.october26_2024.title'),
      description: t('about.timeline.october26_2024.description'),
      icon: BeakerIcon,
      color: "text-cyan-400",
      images: ['/images/x402-facilitator.png'],
      links: t('about.timeline.october26_2024.links', { returnObjects: true })
    },
    {
      date: t('about.timeline.october28_2024.date'),
      title: t('about.timeline.october28_2024.title'),
      description: t('about.timeline.october28_2024.description'),
      icon: FireIcon,
      color: "text-rose-500",
      links: t('about.timeline.october28_2024.links', { returnObjects: true })
    },
    {
      date: t('about.timeline.current.date'),
      title: t('about.timeline.current.title'),
      description: t('about.timeline.current.description'),
      icon: BoltIcon,
      color: "text-yellow-400"
    }
  ].sort((a, b) => 0); // Preserving order as defined for now

  const values = [
    {
      icon: AcademicCapIcon,
      title: t('about.values.learning.title'),
      description: t('about.values.learning.description'),
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: UserGroupIcon,
      title: t('about.values.community.title'),
      description: t('about.values.community.description'),
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: GlobeAltIcon,
      title: t('about.values.transparency.title'),
      description: t('about.values.transparency.description'),
      color: "from-green-400 to-emerald-400"
    }
  ];

  return (
    <>
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        keywords="About UltraVioleta DAO, Web3 Latin America, DAO Mission, Decentralized Community, Blockchain LATAM, DAO Values, Web3 Education, Community Governance"
      />
      <div className="min-h-screen bg-background text-text-primary pt-24 overflow-x-hidden">

        {/* Decorative Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ultraviolet/10 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10">

          {/* Header Section */}
          <section className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-block"
            >
              <span className="px-4 py-1.5 rounded-full border border-ultraviolet/30 bg-ultraviolet/10 text-ultraviolet-light text-sm font-medium tracking-wide uppercase shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                {t('navigation.about')}
              </span>
            </motion.div>

            <motion.h1
              {...fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
                {t('about.hero.title')}
              </span>
            </motion.h1>

            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              {t('about.hero.subtitle')}
            </motion.p>
          </section>

          {/* Origin Story */}
          <section className="px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto glass-panel p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-ultraviolet/20 rounded-full blur-3xl -mr-32 -mt-32"></div>

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 heading-gradient">
                    {t('about.origin.title')}
                  </h2>
                  <div className="space-y-6 text-lg text-gray-300">
                    <p>{t('about.origin.paragraph1')}</p>
                    <p>{t('about.origin.paragraph2')}</p>
                  </div>
                </div>
                <div className="space-y-6 text-lg text-gray-300">
                  <p>{t('about.origin.paragraph3')}</p>
                  <div className="glass-card p-6 border-l-4 border-ultraviolet bg-ultraviolet/5">
                    <p className="italic text-white font-medium">
                      "{t('about.origin.paragraph4')}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Vision, Mission & Values */}
          <section className="px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-7xl mx-auto">

              {/* Tabs for Vision/Mission */}
              <div className="flex justify-center mb-12">
                <div className="glass-panel p-1 rounded-full inline-flex">
                  {['vision', 'mission'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 ${activeTab === tab
                        ? 'bg-ultraviolet text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {t(`about.${tab}.title`)}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center max-w-4xl mx-auto mb-20"
                >
                  <h3 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                    {t(`about.${activeTab}.title`)}
                  </h3>
                  <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                    {t(`about.${activeTab}.description`)}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Values Cards */}
              <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center text-white">
                {t('about.values.title')}
              </h3>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-8"
              >
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-white">
                      {value.title}
                    </h4>
                    <p className="text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Timeline */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
            <div className="max-w-5xl mx-auto">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold mb-16 text-center heading-gradient"
              >
                {t('about.timeline.title')}
              </motion.h2>

              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 md:left-1/2 top-4 bottom-0 w-1 bg-gradient-to-b from-ultraviolet via-cyan-500 to-ultraviolet opacity-20 md:-ml-0.5 rounded-full"></div>

                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`relative mb-16 md:mb-24 flex flex-col md:flex-row items-start ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-4 md:left-1/2 -ml-[13px] w-7 h-7 bg-background border-4 border-ultraviolet rounded-full z-10 shadow-[0_0_15px_rgba(124,58,237,0.5)] mt-1.5 md:mt-6"></div>

                    {/* Content Card */}
                    <div className={`pl-16 md:pl-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'} w-full`}>
                      <div className="glass-card p-6 md:p-8 hover:border-ultraviolet/50 transition-colors duration-300">

                        <div className="flex items-center gap-3 mb-4">
                          <milestone.icon className={`h-6 w-6 ${milestone.color}`} />
                          <span className={`text-sm font-bold tracking-wider uppercase ${milestone.color}`}>
                            {milestone.date}
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
                          {milestone.title}
                        </h3>

                        <p className="text-gray-400 mb-6 leading-relaxed">
                          {milestone.description}
                        </p>

                        {/* Media (Images/Videos) */}
                        {(milestone.images || milestone.videos) && (
                          <div className="space-y-4 mb-4">
                            {milestone.images && (
                              <div className="grid grid-cols-2 gap-2">
                                {milestone.images.map((img, i) => (
                                  <img key={i} src={img} alt="" className="rounded-lg w-full h-24 object-cover border border-white/10 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => window.open(img, '_blank')} />
                                ))}
                              </div>
                            )}
                            {milestone.videos && (
                              <div className="space-y-2">
                                {milestone.videos.map((vid, i) => (
                                  <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                                    <PlayCircleIcon className="h-8 w-8 text-white group-hover:text-ultraviolet transition-colors" />
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white truncate">{vid.title}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sponsors */}
                        {milestone.sponsors && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{t('about.timeline.sponsors.poweredBy')}</p>
                            <div className="flex flex-wrap gap-2">
                              {milestone.sponsors.map((sponsor, i) => (
                                <a key={i} href={sponsor.videoUrl} target="_blank" rel="noreferrer" className="px-3 py-1 text-xs rounded-full bg-ultraviolet/10 text-ultraviolet-light border border-ultraviolet/20 hover:bg-ultraviolet/20 transition-colors" title={sponsor.name}>
                                  {sponsor.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        {milestone.links && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {milestone.links.map((link, i) => (
                              <a key={i} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
                                <span>{link.label}</span>
                                <RocketLaunchIcon className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Governance & Activities Grid */}
          <section className="px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">

                {/* Activities */}
                <div>
                  <h2 className="text-3xl font-bold mb-8 heading-gradient">{t('about.activities.title')}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {['education', 'governance', 'economy', 'infrastructure', 'events', 'ai'].map((activity, i) => (
                      <motion.div
                        key={activity}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-4 hover:bg-white/5 transition-colors"
                      >
                        <h3 className="font-bold text-white mb-2">{t(`about.activities.${activity}.title`)}</h3>
                        <p className="text-sm text-gray-400">{t(`about.activities.${activity}.description`)}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Governance Info */}
                <div>
                  <h2 className="text-3xl font-bold mb-8 heading-gradient px-4">{t('about.governance.title')}</h2>
                  <div className="glass-card p-8 h-full">
                    <div className="prose prose-invert max-w-none text-gray-300">
                      <p className="mb-4">{t('about.governance.paragraph1')}</p>
                      <p className="mb-4">{t('about.governance.paragraph2')}</p>
                      <p className="italic text-gray-400 border-l-2 border-cyan-500 pl-4">{t('about.governance.paragraph3')}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Legal Status (DUNA) */}
          <section className="px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto glass-panel p-8 md:p-12 border-t-4 border-cyan-500"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 bg-cyan-500/10 p-4 rounded-xl">
                  <AcademicCapIcon className="h-12 w-12 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {t('about.current.legal.title')}
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {t('about.current.legal.description')}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-background/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2 border-b border-white/10 pb-2">{t('about.current.legal.details.title')}</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li><span className="text-gray-500">Entity:</span> {t('about.current.legal.details.entity_value')}</li>
                        <li><span className="text-gray-500">Jurisdiction:</span> {t('about.current.legal.details.jurisdiction_value')}</li>
                        <li><span className="text-gray-500">Filing ID:</span> {t('about.current.legal.details.registered_value')}</li>
                      </ul>
                    </div>
                    <div className="flex items-center">
                      <a
                        href="https://wyobiz.wyo.gov/business/FilingDetails.aspx?eFNum=231152217007187086250219198232174206067107184230"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full btn-secondary text-center justify-center py-4"
                      >
                        <span className="mr-2">View Official Wyoming Filing</span>
                        <GlobeAltIcon className="h-5 w-5" />
                      </a>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    {t('about.current.legal.whatIsDuna')} <a href="https://a16zcrypto.com/posts/article/duna-for-daos/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">{t('about.current.legal.dunaLinkText')}</a>.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Featured On */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 mb-12">
            <div className="max-w-7xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12 text-white">{t('about.featuredOn.title')}</h2>
              <div className="flex flex-wrap justify-center gap-8">
                {/* Manual entry for Cointelegraph for now as per previous code structure */}
                <motion.a
                  href="https://es.cointelegraph.com/news/blockchain-es-una-herramienta-de-coordinacion-y-transparencia-radical-segun-ultravioletadao"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-8 max-w-sm text-left hover:border-ultraviolet/50 transition-colors group"
                >
                  <NewspaperIcon className="h-10 w-10 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Cointelegraph</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {t('about.featuredOn.cointelegraph.description')}
                  </p>
                  <span className="text-orange-500 text-sm font-medium flex items-center">
                    Read Article <RocketLaunchIcon className="h-3 w-3 ml-2" />
                  </span>
                </motion.a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default About;