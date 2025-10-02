import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  BookOpen,
  Coins,
  Megaphone,
  CheckCircle,
  Bot,
  MessageCircle,
  Sparkles,
  ShoppingCart,
  Gift,
  ExternalLink,
  PlayCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart
} from 'lucide-react';

const ServicesPage = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/db/courses.json')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error loading courses:', err));
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
      services: [
        t('services.ultraServicios.communities.education'),
        t('services.ultraServicios.communities.tokenization')
      ]
    },
    {
      title: t('services.ultraServicios.brand.title'),
      icon: Megaphone,
      services: [
        t('services.ultraServicios.brand.representation'),
        t('services.ultraServicios.brand.support')
      ]
    },
    {
      title: t('services.ultraServicios.validation.title'),
      icon: CheckCircle,
      services: [
        t('services.ultraServicios.validation.professional'),
        t('services.ultraServicios.validation.blockchains')
      ]
    },
    {
      title: t('services.ultraServicios.ai.title'),
      icon: Bot,
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

  return (
    <>
      <SEO
        title="Web3 Development Services | Smart Contracts & DeFi Solutions"
        description="Professional blockchain development services by UltraVioleta DAO. Smart contracts, DeFi protocols, tokenization, DAO consulting, and Web3 infrastructure for Latin America projects."
        keywords="Web3 development services, smart contract development, DeFi protocols, blockchain consulting, DAO setup, tokenization services, Latin America blockchain, Avalanche development, Web3 infrastructure, crypto development agency, blockchain solutions LATAM, NFT development, decentralized applications, Web3 consulting, blockchain integration"
      />
      <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            {t('services.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </motion.div>

        {/* Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
            Ultra Servicios
          </h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-4xl mx-auto">
            {t('services.ultraServicios.description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all"
              >
                <div className="flex items-center mb-4">
                  <category.icon className="w-8 h-8 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-purple-300">
                    {category.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {category.services.map((service, serviceIndex) => (
                    <div key={serviceIndex}>
                      {typeof service === 'string' ? (
                        <div className="flex items-start">
                          <span className="text-pink-400 mr-2">•</span>
                          <p className="text-gray-300">{service}</p>
                        </div>
                      ) : (
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <service.icon className="w-5 h-5 text-pink-400 mr-2" />
                            <h4 className="font-semibold text-pink-300">
                              {service.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-400 ml-7">
                            {service.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Karma Hello Expanded Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1">
            <div className="bg-black rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
                  {t('services.karmaHelloExpanded.title')}
                </h2>
                <div className="flex items-center gap-2 text-purple-400">
                  <Bot className="w-6 h-6" />
                  <span className="font-semibold">{t('services.karmaHelloExpanded.subtitle')}</span>
                </div>
              </div>

              <p className="text-gray-300 mb-4">
                {t('services.karmaHelloExpanded.description')}
              </p>

              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <MessageCircle className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">Canal</p>
                    <p className="text-white font-semibold">twitch.tv/0xultravioleta</p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <Coins className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">Blockchain</p>
                    <p className="text-white font-semibold">Avalanche (C-Chain)</p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-purple-300 mb-4">
                  {t('services.karmaHelloExpanded.features.chatToEarn.title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Chat-to-Earn */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Coins className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.chatToEarn.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.chatToEarn.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.chatToEarn.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.chatToEarn.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.chatToEarn.detail3')}</li>
                    </ul>
                  </div>

                  {/* Multi-Agent AI */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Bot className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.multiAgent.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.multiAgent.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.multiAgent.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.multiAgent.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.multiAgent.detail3')}</li>
                    </ul>
                  </div>

                  {/* Token Burning */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.tokenBurning.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.tokenBurning.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.tokenBurning.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.tokenBurning.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.tokenBurning.detail3')}</li>
                    </ul>
                  </div>

                  {/* Echoes Bonus */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Gift className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.echoesBonus.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.echoesBonus.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.echoesBonus.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.echoesBonus.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.echoesBonus.detail3')}</li>
                    </ul>
                  </div>

                  {/* Twitter Boost */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Megaphone className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.twitterBoost.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.twitterBoost.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.twitterBoost.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.twitterBoost.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.twitterBoost.detail3')}</li>
                    </ul>
                  </div>

                  {/* Cognee Intelligence */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-pink-400 mr-2" />
                      <h4 className="font-semibold text-pink-300">
                        {t('services.karmaHelloExpanded.features.cognee.title')}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {t('services.karmaHelloExpanded.features.cognee.description')}
                    </p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>• {t('services.karmaHelloExpanded.features.cognee.detail1')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.cognee.detail2')}</li>
                      <li>• {t('services.karmaHelloExpanded.features.cognee.detail3')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.agents')}
                  </p>
                  <p className="text-gray-400 text-xs">Agentes IA</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.evaluation')}
                  </p>
                  <p className="text-gray-400 text-xs">Evaluación</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.burning')}
                  </p>
                  <p className="text-gray-400 text-xs">Burning</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {t('services.karmaHelloExpanded.stats.blockchain')}
                  </p>
                  <p className="text-gray-400 text-xs">Network</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://twitch.tv/0xultravioleta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    {t('services.karmaHelloExpanded.cta.watchLive')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  <a
                    href="https://x.com/karmahelloapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all border border-purple-500/30"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    {t('services.karmaHelloExpanded.cta.learnMore')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ultra Evento 2025 Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1">
            <div className="bg-black rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
                  {t('events.ultraevento.title', 'Ultra Evento 2025')}
                </h2>
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-6 h-6" />
                  <span className="font-semibold">{t('events.ultraevento.flagship', 'Evento Insignia')}</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">{t('events.ultraevento.date.label', 'Fecha')}</p>
                    <p className="text-white font-semibold">{t('events.ultraevento.date.value', '24 de Agosto, 2025')}</p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <Clock className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">{t('events.ultraevento.time.label', 'Horario')}</p>
                    <p className="text-white font-semibold">{t('events.ultraevento.time.value', '1:00 PM - 9:00 PM')}</p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-900/50 rounded-lg p-3">
                  <MapPin className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400 text-xs">{t('events.ultraevento.location.label', 'Lugar')}</p>
                    <p className="text-white font-semibold">{t('events.ultraevento.location.value', 'Hash House, Medellín')}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                {t('events.ultraevento.description', 'El evento anual más importante de UltraVioleta DAO, reuniendo a la comunidad Web3 latinoamericana para conferencias, networking y celebración.')}
              </p>

              {/* Event Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">212</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.registered', 'Registrados')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">144</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.attendees', 'Asistentes')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">10</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.sponsors', 'Patrocinadores')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">8h</p>
                  <p className="text-gray-400 text-xs">{t('events.ultraevento.stats.duration', 'Duración')}</p>
                </div>
              </div>

              {/* Event Images Gallery */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <img
                    src="/images/ultraevento-2025-promo.jpg"
                    alt="Ultra Evento 2025 Promo"
                    className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open('/images/ultraevento-2025-promo.jpg', '_blank')}
                  />
                  <img
                    src="/images/ultraevento-2025.jpg"
                    alt="Ultra Evento 2025"
                    className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open('/images/ultraevento-2025.jpg', '_blank')}
                  />
                  <img
                    src="/images/quedada-medellin-2025.jpg"
                    alt="Ultra Quedada 2025"
                    className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open('/images/quedada-medellin-2025.jpg', '_blank')}
                  />
                </div>
              </div>

              {/* Sponsors with Links */}
              <div className="border-t border-gray-800 pt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('events.ultraevento.sponsors.title', 'Patrocinadores 2025')}
                  </h3>
                  <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { name: 'Avalanche', twitter: '@AvaxTeam1', video: 'https://x.com/UltravioletaDAO/status/1961197588389953629' },
                    { name: 'Rekt', twitter: '@RektHQ', video: 'https://x.com/UltravioletaDAO/status/1961077187227844906' },
                    { name: 'Celo Colombia', twitter: '@Celo_Col', video: 'https://x.com/UltravioletaDAO/status/1961113800574189779' },
                    { name: 'Self', twitter: '@selfprotocol', video: 'https://x.com/UltravioletaDAO/status/1961544954301616209' },
                    { name: 'Uniswap', twitter: '@Uniswap', video: 'https://x.com/UltravioletaDAO/status/1961535762828333124' },
                    { name: 'Pyth Network', twitter: '@PythNetwork', video: 'https://x.com/UltravioletaDAO/status/1961567997509738889' },
                    { name: 'Heroes Of Cipher', twitter: '@HeroesOfCipher', video: 'https://x.com/UltravioletaDAO/status/1961177432419193181' },
                    { name: 'deBridge', twitter: '@debridge', video: 'https://x.com/UltravioletaDAO/status/1961424459929092283' },
                    { name: 'Superfluid', twitter: '@Superfluid_HQ', video: 'https://x.com/UltravioletaDAO/status/1961617646970970208' },
                    { name: 'Magic Eden', twitter: '@Eden_Magico', video: 'https://x.com/UltravioletaDAO/status/1961271683995640236' }
                  ].map((sponsor, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg p-3 text-center border border-purple-500/20 hover:border-purple-500/50 transition-all">
                      <p className="text-white font-medium text-sm mb-2">{sponsor.name}</p>
                      <div className="flex justify-center gap-2">
                        <a
                          href={`https://x.com/${sponsor.twitter.substring(1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                          title={sponsor.twitter}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                        <a
                          href={sponsor.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          title="Ver video"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-gray-400 text-xs mt-4">
                  {t('events.ultraevento.sponsors.gratitude', '¡Gracias a todos nuestros patrocinadores por hacer posible este evento!')}
                </p>
              </div>

              {/* CTA Button */}
              <div className="mt-6 text-center">
                <p className="text-gray-300 mb-4">
                  {t('events.ultraevento.brandRepresentation', 'Como parte de nuestros servicios de representación de marca, organizamos eventos presenciales que conectan a proyectos Web3 con la comunidad latinoamericana.')}
                </p>
                <a
                  href="mailto:ultravioletadao@gmail.com"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {t('events.ultraevento.sponsorCTA', 'Patrocina el próximo evento')}
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
            {t('services.products.title')}
          </h2>

          {/* Book Product */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-purple-300">
                    {t('services.products.book.title')}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {t('services.products.book.author')}
                  </p>
                  <p className="text-gray-400 mb-6">
                    {t('services.products.book.description')}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Gift className="w-5 h-5 text-pink-400 mr-3" />
                      <p className="text-sm text-gray-300">
                        {t('services.products.book.benefit1')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Coins className="w-5 h-5 text-pink-400 mr-3" />
                      <p className="text-sm text-gray-300">
                        {t('services.products.book.benefit2')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://www.amazon.com/dp/B0FMQPFTVL"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {t('services.products.book.buyButton')}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Educational Videos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
            {t('services.educationalVideos.title', 'Contenido Educativo')}
          </h2>
          <p className="text-lg text-gray-300 text-center mb-12 max-w-4xl mx-auto">
            {t('services.educationalVideos.description', 'Accede a nuestros videos y cursos gratuitos sobre blockchain, Web3 y tecnologías descentralizadas')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Courses from database */}
            {courses.length > 0 ? courses.map((course, index) => (
              <a
                key={index}
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-400/50 transition-all group"
              >
                <div className="aspect-video relative">
                  {getYoutubeThumbnail(course.link) ? (
                    <img
                      src={getYoutubeThumbnail(course.link)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/50 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-purple-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3">{course.description}</p>
                </div>
              </a>
            )) : (
              <>
                {/* Default placeholder videos */}
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="aspect-video bg-black/50 rounded-lg mb-4 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Introducción a Web3</h3>
                  <p className="text-gray-400 text-sm">Conceptos básicos de blockchain y criptomonedas</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="aspect-video bg-black/50 rounded-lg mb-4 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Smart Contracts</h3>
                  <p className="text-gray-400 text-sm">Aprende sobre contratos inteligentes y DeFi</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="aspect-video bg-black/50 rounded-lg mb-4 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Gobernanza DAO</h3>
                  <p className="text-gray-400 text-sm">Cómo participar en decisiones descentralizadas</p>
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.youtube.com/@UltravioletaDAO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {t('services.educationalVideos.viewAll', 'Ver todos los videos en YouTube')}
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400">
            {t('services.contact')}
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default ServicesPage;