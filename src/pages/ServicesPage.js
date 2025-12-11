import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  BookOpenIcon as BookOpen,
  CurrencyDollarIcon as Coins,
  MegaphoneIcon as Megaphone,
  CheckCircleIcon as CheckCircle,
  CpuChipIcon as Bot,
  ChatBubbleOvalLeftEllipsisIcon as MessageCircle,
  SparklesIcon as Sparkles,
  GiftIcon as Gift,
  ArrowTopRightOnSquareIcon as ExternalLink,
  PlayCircleIcon as PlayCircle,
  ChartBarIcon as BarChart3,
  ArrowTrendingUpIcon as TrendingUp,
  TrophyIcon as Award,
  FireIcon as Flame,
  UserGroupIcon as Users,
  CalendarIcon as Calendar,
  ClockIcon as Clock,
  MapPinIcon as MapPin,
  HeartIcon as Heart
} from '@heroicons/react/24/outline';

// Force HMR update
const ServicesPage = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);

  // Fetch courses
  useEffect(() => {
    fetch('/db/courses.json')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error loading courses:', err));
  }, []);

  // Scroll logic
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const getYoutubeThumbnail = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  const serviceCategories = [
    {
      title: t('services.ultraServicios.communities.title'),
      icon: BookOpen,
      gradient: "from-purple-500 to-indigo-500",
      services: [
        t('services.ultraServicios.communities.education'),
        t('services.ultraServicios.communities.tokenization')
      ]
    },
    {
      title: t('services.ultraServicios.brand.title'),
      icon: Megaphone,
      gradient: "from-pink-500 to-rose-500",
      services: [
        t('services.ultraServicios.brand.representation'),
        t('services.ultraServicios.brand.support')
      ]
    },
    {
      title: t('services.ultraServicios.validation.title'),
      icon: CheckCircle,
      gradient: "from-cyan-500 to-blue-500",
      services: [
        t('services.ultraServicios.validation.professional'),
        t('services.ultraServicios.validation.blockchains')
      ]
    },
    {
      title: t('services.ultraServicios.ai.title'),
      icon: Bot,
      gradient: "from-emerald-500 to-teal-500",
      services: [
        {
          name: 'Karma-Hello',
          description: t('services.ultraServicios.ai.karmaHello'),
          icon: MessageCircle
        },
        {
          name: 'Abracadabra',
          description: t('services.ultraServicios.ai.abracadabra'),
          icon: Sparkles
        }
      ]
    }
  ];

  const abracadabraFeatures = [
    "70+ Streams Processed",
    "Time Machine Search",
    "Semantic Search",
    "Predictive Analytics",
    "Knowledge Graphs",
    "Automated Content"
  ];

  const ultraEventoStats = [
    { label: "Attendees", value: "212" },
    { label: "Sponsors", value: "10" },
    { label: "Duration", value: "8h" },
    { label: "Community", value: "Active" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <SEO
        title="AI Services & Web3 Solutions | UltraVioleta DAO Services"
        description="Revolutionary Web3 infrastructure: Karma Hello Chat-to-Earn bot, Abracadabra stream intelligence, Ultra Evento 2025, and educational courses."
        keywords="x402 facilitator, Karma Hello, Abracadabra AI, Ultra Evento 2025, crypto education, DAO services"
      />
      <div className="min-h-screen bg-background pt-24 pb-20 overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ultraviolet/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-glow/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI Services & <span className="text-gradient-uv">Web3 Solutions</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Powering the next generation of content creators and communities in Latin America.
            </p>

            {/* Quick Nav Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {['Ultra Servicios', 'Karma Hello', 'Abracadabra', 'Ultra Evento', 'Educacion'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 hover:text-white transition-all hover:border-ultraviolet/50"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Ultra Servicios Grid */}
          <motion.section
            id="ultra-servicios"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Ultra Servicios</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">{t('services.ultraServicios.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {serviceCategories.map((category, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} p-3 mb-6 shadow-lg shadow-purple-900/20`}>
                    <category.icon className="w-full h-full text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                    {category.title}
                  </h3>

                  <div className="space-y-4">
                    {category.services.map((service, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                        {typeof service === 'string' ? (
                          <div className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-ultraviolet mt-2 mr-3" />
                            <p className="text-gray-300">{service}</p>
                          </div>
                        ) : (
                          <div className="flex items-start">
                            <service.icon className="w-5 h-5 text-cyan-400 mt-1 mr-3 shrink-0" />
                            <div>
                              <p className="font-semibold text-white mb-1">{service.name}</p>
                              <p className="text-sm text-gray-400">{service.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Karma Hello Feature Section */}
          <motion.section
            id="karma-hello"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-32 glass-panel p-8 md:p-12 border-ultraviolet/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-ultraviolet/10 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-4xl font-bold mb-2">Karma Hello</h2>
                  <p className="text-xl text-ultraviolet-light font-medium">{t('services.karmaHelloExpanded.subtitle')}</p>
                </div>
                <div className="flex gap-4">
                  <a href="https://twitch.tv/0xultravioleta" target="_blank" rel="noreferrer" className="btn-primary flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" /> Watch Live
                  </a>
                  <a href="https://x.com/karmahelloapp" target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Learn More
                  </a>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: Coins,
                    title: t('services.karmaHelloExpanded.features.chatToEarn.title'),
                    desc: t('services.karmaHelloExpanded.features.chatToEarn.description'),
                    details: ['Fibonacci Rewards', 'UVD Tokens', 'Real-time Drop']
                  },
                  {
                    icon: Bot,
                    title: t('services.karmaHelloExpanded.features.multiAgent.title'),
                    desc: t('services.karmaHelloExpanded.features.multiAgent.description'),
                    details: ['OpenAI GPT-4', 'Claude 3.5', 'Llama 3']
                  },
                  {
                    icon: Sparkles,
                    title: t('services.karmaHelloExpanded.features.tokenBurning.title'),
                    desc: t('services.karmaHelloExpanded.features.tokenBurning.description'),
                    details: ['Deflationary', 'Value Accrual', 'Sustainable']
                  },
                  {
                    icon: Gift,
                    title: t('services.karmaHelloExpanded.features.echoesBonus.title'),
                    desc: t('services.karmaHelloExpanded.features.echoesBonus.description'),
                    details: ['NFT Multiplier', 'Exclusive Access', 'Airdrops']
                  },
                  {
                    icon: Megaphone,
                    title: t('services.karmaHelloExpanded.features.twitterBoost.title'),
                    desc: t('services.karmaHelloExpanded.features.twitterBoost.description'),
                    details: ['Social Mining', 'Community Growth', 'Engagement']
                  },
                  {
                    icon: CheckCircle,
                    title: t('services.karmaHelloExpanded.features.cognee.title'),
                    desc: t('services.karmaHelloExpanded.features.cognee.description'),
                    details: ['Identity Verification', 'Sybil Resistance', 'Fair Play']
                  }
                ].map((feature, i) => (
                  <div key={i} className="bg-black/40 rounded-xl p-6 border border-white/5 hover:border-ultraviolet/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <feature.icon className="w-6 h-6 text-ultraviolet-light" />
                      <h3 className="font-bold text-lg">{feature.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{feature.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.details.map((d, di) => (
                        <span key={di} className="text-xs bg-ultraviolet/10 text-ultraviolet-light px-2 py-1 rounded">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                {[
                  { label: "AI Agents", value: "18+", icon: Bot },
                  { label: "Evaluation", value: "Real-time", icon: CheckCircle },
                  { label: "Burning", value: "Active", icon: Flame },
                  { label: "Network", value: "Avalanche", icon: Users }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* FAQs for Karma Hello */}
              {(() => {
                const faqs = t('services.karmaHelloExpanded.faqs', { returnObjects: true });
                if (!faqs || typeof faqs !== 'object') return null;
                const { title, ...questions } = faqs;
                return (
                  <div className="mt-16">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-ultraviolet-light" />
                      {title}
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(questions).map(([key, item], index) => (
                        <details key={index} className="group bg-black/40 rounded-xl border border-white/5 open:border-ultraviolet/30 transition-all duration-300">
                          <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                            <h4 className="font-bold text-lg text-gray-200 group-hover:text-ultraviolet-light transition-colors">{item.question}</h4>
                            <span className="transition-transform group-open:rotate-180">
                              <svg className="w-6 h-6 text-ultraviolet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </summary>
                          <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                            {item.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.section>

          {/* Karma Reports Section */}
          <motion.section
            id="karma-reports"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="flex items-center gap-4 mb-10">
              <BarChart3 className="w-10 h-10 text-ultraviolet" />
              <div>
                <h2 className="text-3xl font-bold">{t('services.karmaReports.title')}</h2>
                <p className="text-gray-400">{t('services.karmaReports.period')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { val: "17,684 UVD", label: t('services.karmaReports.metrics.totalBurned'), icon: Flame, color: "text-orange-400" },
                { val: "48.5M UVD", label: t('services.karmaReports.metrics.totalDistributed'), icon: Coins, color: "text-yellow-400" },
                { val: "81", label: t('services.karmaReports.metrics.uniqueRecipients'), icon: Users, color: "text-blue-400" },
                { val: "90,328", label: t('services.karmaReports.metrics.totalTransactions'), icon: MessageCircle, color: "text-cyan-400" },
                { val: "599K UVD", label: t('services.karmaReports.metrics.averagePerUser'), icon: Award, color: "text-pink-400" },
                { val: "105 Days", label: t('services.karmaReports.metrics.operationPeriod'), icon: Sparkles, color: "text-purple-400" },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-white mb-1">{stat.val}</h4>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Abracadabra Section */}
          <motion.section
            id="abracadabra"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-32 glass-panel p-8 md:p-12 border-cyan-400/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-4xl font-bold mb-2">Abracadabra</h2>
                  <p className="text-xl text-cyan-400 font-medium">{t('services.abracadabraExpanded.subtitle')}</p>
                </div>
                <a href="https://abracadabra.ultravioleta.xyz" target="_blank" rel="noreferrer" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Launch App
                </a>
              </div>

              <p className="text-lg text-gray-300 mb-8 max-w-3xl">
                {t('services.abracadabraExpanded.description')}
              </p>

              {/* Abracadabra Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/40 rounded-2xl p-6 border border-cyan-500/20 mb-12">
                {[
                  { label: t('services.abracadabraExpanded.stats.streamsLabel'), value: "70+", icon: PlayCircle },
                  { label: t('services.abracadabraExpanded.stats.topicsLabel'), value: "640+", icon: BookOpen },
                  { label: t('services.abracadabraExpanded.stats.endpointsLabel'), value: "56+", icon: Bot },
                  { label: t('services.abracadabraExpanded.stats.phasesLabel'), value: "5", icon: CheckCircle }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                {abracadabraFeatures.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                    <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span className="text-white font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              {/* FAQs for Abracadabra */}
              {(() => {
                const faqs = t('services.abracadabraExpanded.faqs', { returnObjects: true });
                if (!faqs || typeof faqs !== 'object') return null;
                const { title, ...questions } = faqs;
                return (
                  <div className="mt-16">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-cyan-400" />
                      {title}
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(questions).map(([key, item], index) => (
                        <details key={index} className="group bg-black/40 rounded-xl border border-white/5 open:border-cyan-500/30 transition-all duration-300">
                          <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                            <h4 className="font-bold text-lg text-gray-200 group-hover:text-cyan-400 transition-colors">{item.question}</h4>
                            <span className="transition-transform group-open:rotate-180">
                              <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </summary>
                          <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                            {item.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.section>

          {/* Ultra Evento 2025 Section */}
          <motion.section
            id="ultra-evento"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-32"
          >
            <div className="text-center mb-12">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold tracking-wider uppercase mb-4 inline-block">
                Featured Event
              </span>
              <h2 className="text-4xl font-bold mb-4">{t('events.ultraevento.title')}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">{t('events.ultraevento.description')}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1 mb-12">
              <div className="bg-gray-900 rounded-2xl p-8">
                {/* Event Details Pills */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center justify-center bg-gray-800/50 rounded-xl p-4">
                    <Calendar className="h-6 w-6 text-purple-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">{t('events.ultraevento.date.label')}</p>
                      <p className="text-white font-semibold">{t('events.ultraevento.date.value')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center bg-gray-800/50 rounded-xl p-4">
                    <Clock className="h-6 w-6 text-purple-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">{t('events.ultraevento.time.label')}</p>
                      <p className="text-white font-semibold">{t('events.ultraevento.time.value')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center bg-gray-800/50 rounded-xl p-4">
                    <MapPin className="h-6 w-6 text-purple-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">{t('events.ultraevento.location.label')}</p>
                      <p className="text-white font-semibold">{t('events.ultraevento.location.value')}</p>
                    </div>
                  </div>
                </div>

                {/* Event Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {ultraEventoStats.map((stat, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-purple-400">{stat.value}</p>
                      <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Event Images Gallery */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-purple-400">
                      {/* Assuming PhotoIcon was mapped but not imported as such, checking imports... it's not imported.
                           Will use existing icon or just omit the icon for now to be safe, or check imports again.
                           Imports has PlayCircle. Let's use that for now or just text.
                           Wait, user screenshot shows text "Evento Insignia" with a star. 
                           The gallery needs actual images. I will use the image paths from Events.js.
                        */}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{t('events.ultraevento.gallery')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <img
                      src="/images/ultraevento-2025-promo.jpg"
                      alt={t('common.ultraevento_promo_alt')}
                      className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open('/images/ultraevento-2025-promo.jpg', '_blank')}
                    />
                    <img
                      src="/images/ultraevento-2025.jpg"
                      alt={t('common.ultraevento_main_alt')}
                      className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open('/images/ultraevento-2025.jpg', '_blank')}
                    />
                    <img
                      src="/images/quedada-medellin-2025.jpg"
                      alt={t('common.ultraquedada_alt')}
                      className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open('/images/quedada-medellin-2025.jpg', '_blank')}
                    />
                  </div>
                </div>

                {/* Sponsors Section - Restored from Events.js */}
                <div className="relative mt-8 pt-8 border-t-2 border-transparent bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-900 px-6 py-2 rounded-full border-2 border-purple-500/50">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">
                          <Heart className="h-5 w-5 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                          {t('events.ultraevento.sponsors.title')}
                        </h3>
                        <div className="animate-pulse animation-delay-200">
                          <Heart className="h-5 w-5 text-pink-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    {/* Main Sponsors Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4">
                      {[
                        { name: 'Avalanche', twitter: 'AvaxTeam1', video: 'https://x.com/UltravioletaDAO/status/1961197588389953629', color: 'from-red-500 to-red-600' },
                        { name: 'Rekt', twitter: 'RektHQ', video: 'https://x.com/UltravioletaDAO/status/1961077187227844906', color: 'from-gray-600 to-black' },
                        { name: 'Celo Colombia', twitter: 'Celo_Col', video: 'https://x.com/UltravioletaDAO/status/1961113800574189779', color: 'from-green-500 to-yellow-500' },
                        { name: 'Self', twitter: 'selfprotocol', video: 'https://x.com/UltravioletaDAO/status/1961544954301616209', color: 'from-blue-500 to-purple-500' },
                        { name: 'Uniswap', twitter: 'Uniswap', video: 'https://x.com/UltravioletaDAO/status/1961535762828333124', color: 'from-pink-500 to-pink-600' },
                        { name: 'Pyth Network', twitter: 'PythNetwork', video: 'https://x.com/UltravioletaDAO/status/1961567997509738889', color: 'from-purple-600 to-indigo-600' },
                        { name: 'Heroes Of Cipher', twitter: 'HeroesOfCipher', video: 'https://x.com/UltravioletaDAO/status/1961177432419193181', color: 'from-yellow-500 to-orange-500' },
                        { name: 'deBridge', twitter: 'debridge', video: 'https://x.com/UltravioletaDAO/status/1961424459929092283', color: 'from-cyan-500 to-blue-500' },
                        { name: 'Superfluid', twitter: 'Superfluid_HQ', video: 'https://x.com/UltravioletaDAO/status/1961617646970970208', color: 'from-green-400 to-cyan-500' },
                        { name: 'Magic Eden', twitter: 'Eden_Magico', video: 'https://x.com/UltravioletaDAO/status/1961271683995640236', color: 'from-purple-500 to-pink-500' }
                      ].map((sponsor, idx) => (
                        <div
                          key={idx}
                          className="relative group"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${sponsor.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-2xl`}></div>
                          <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 hover:border-purple-500/50 transition-all duration-300 h-full">
                            {/* Logo/Avatar */}
                            <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${sponsor.color} p-0.5`}>
                              <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
                                <span className="text-2xl font-black text-white">
                                  {sponsor.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Name */}
                            <h4 className="font-bold text-white text-center mb-2 text-sm">
                              {sponsor.name}
                            </h4>

                            {/* Social Links */}
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={`https://x.com/${sponsor.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-8 h-8 bg-black/50 rounded-lg hover:bg-black/70 transition-all group/x"
                                title={`@${sponsor.twitter}`}
                              >
                                <svg className="w-4 h-4 text-gray-400 group-hover/x:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              </a>
                              <a
                                href={sponsor.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-8 h-8 bg-purple-600/30 rounded-lg hover:bg-purple-600/50 transition-all group/video"
                                title={t('events.ultraevento.sponsors.watchVideo')}
                              >
                                <PlayCircle className="h-4 w-4 text-purple-400 group-hover/video:text-purple-300 group-hover/video:scale-110 transition-all" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Thank You Message */}
                    <div className="mt-6 text-center pb-4">
                      <p className="text-sm text-gray-400">
                        <span className="inline-block animate-bounce">💜</span>
                        {' '}{t('events.ultraevento.sponsors.gratitude')}{' '}
                        <span className="inline-block animate-bounce animation-delay-200">💜</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Educational Content Section - Courses */}
          <motion.section
            id="educacion"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-ultraviolet" />
                Contenido Educativo
              </h2>
              <Link to="/courses" className="text-sm font-bold text-ultraviolet-light hover:text-white transition-colors">
                View All Courses →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course, index) => (
                <a
                  key={index}
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-0 overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    {getYoutubeThumbnail(course.link) && (
                      <img
                        src={getYoutubeThumbnail(course.link)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-grow">{course.description}</p>
                    <span className="text-xs font-bold text-ultraviolet-light uppercase tracking-wider">Watch Video</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.section>

        </div >
      </div >
    </>
  );
};

export default ServicesPage;