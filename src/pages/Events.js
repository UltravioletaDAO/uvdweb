import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  GiftIcon,
  UsersIcon,
  MicrophoneIcon,
  CakeIcon,
  DocumentCheckIcon,
  WalletIcon,
  ChartBarIcon,
  MusicalNoteIcon,
  PhotoIcon,
  HeartIcon,
  PlayCircleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const Events = () => {
  const { t } = useTranslation();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const getEventTypeIcon = (type) => {
    switch(type) {
      case 'registration': return SparklesIcon;
      case 'presentation': return MicrophoneIcon;
      case 'food': return CakeIcon;
      case 'raffle': return GiftIcon;
      case 'community': return UsersIcon;
      case 'sponsors': return ChartBarIcon;
      case 'constitution': return DocumentCheckIcon;
      case 'airdrop': return WalletIcon;
      case 'voting': return DocumentCheckIcon;
      case 'activity': return SparklesIcon;
      case 'demo': return ChartBarIcon;
      case 'closing': return SparklesIcon;
      case 'party': return MusicalNoteIcon;
      default: return ClockIcon;
    }
  };

  const getEventTypeColor = (type) => {
    switch(type) {
      case 'registration': return 'bg-purple-500';
      case 'presentation': return 'bg-purple-500';
      case 'food': return 'bg-green-500';
      case 'raffle': return 'bg-pink-500';
      case 'community': return 'bg-orange-500';
      case 'sponsors': return 'bg-orange-500';
      case 'constitution': return 'bg-purple-500';
      case 'airdrop': return 'bg-blue-500';
      case 'voting': return 'bg-blue-500';
      case 'activity': return 'bg-yellow-500';
      case 'demo': return 'bg-green-500';
      case 'closing': return 'bg-purple-600';
      case 'party': return 'bg-pink-600';
      default: return 'bg-gray-500';
    }
  };

  const schedule = [
    {
      time: '1:00 – 1:45 p.m.',
      type: 'registration',
      title: t('events.ultraevento.schedule.registration.title'),
      description: t('events.ultraevento.schedule.registration.description'),
      details: [
        t('events.ultraevento.schedule.registration.detail1'),
        t('events.ultraevento.schedule.registration.detail2'),
        t('events.ultraevento.schedule.registration.detail3'),
        t('events.ultraevento.schedule.registration.detail4')
      ]
    },
    {
      time: '1:45 – 2:00 p.m.',
      type: 'presentation',
      title: t('events.ultraevento.schedule.internal.title'),
      description: t('events.ultraevento.schedule.internal.description'),
      details: [
        t('events.ultraevento.schedule.internal.detail1'),
        t('events.ultraevento.schedule.internal.detail2'),
        t('events.ultraevento.schedule.internal.detail3')
      ]
    },
    {
      time: '2:00 – 2:10 p.m.',
      type: 'food',
      title: t('events.ultraevento.schedule.snack1.title'),
      description: t('events.ultraevento.schedule.snack1.description')
    },
    {
      time: '2:10 – 2:30 p.m.',
      type: 'presentation',
      title: t('events.ultraevento.schedule.opening.title'),
      description: t('events.ultraevento.schedule.opening.description'),
      details: [
        t('events.ultraevento.schedule.opening.detail1'),
        t('events.ultraevento.schedule.opening.detail2')
      ]
    },
    {
      time: '2:30 – 2:40 p.m.',
      type: 'raffle',
      title: t('events.ultraevento.schedule.raffle1.title'),
      description: t('events.ultraevento.schedule.raffle1.description'),
      details: [t('events.ultraevento.schedule.raffle1.detail1')]
    },
    {
      time: '2:40 – 2:55 p.m.',
      type: 'food',
      title: t('events.ultraevento.schedule.snack2.title'),
      description: t('events.ultraevento.schedule.snack2.description')
    },
    {
      time: '3:00 – 3:25 p.m.',
      type: 'presentation',
      title: t('events.ultraevento.schedule.history.title'),
      description: t('events.ultraevento.schedule.history.description'),
      details: [
        t('events.ultraevento.schedule.history.detail1'),
        t('events.ultraevento.schedule.history.detail2')
      ]
    },
    {
      time: '3:25 – 4:25 p.m.',
      type: 'community',
      title: t('events.ultraevento.schedule.community.title'),
      description: t('events.ultraevento.schedule.community.description'),
      speakers: [
        'Cyberpaisa – 10 min',
        'Jangx – 10 min',
        'Juyan – 10 min',
        'Hernie P – 10 min',
        'Lualjarami – 10 min'
      ],
      note: t('events.ultraevento.schedule.community.note')
    },
    {
      time: '4:25 – 4:35 p.m.',
      type: 'raffle',
      title: t('events.ultraevento.schedule.raffle2.title'),
      description: t('events.ultraevento.schedule.raffle2.description')
    },
    {
      time: '4:35 – 6:35 p.m.',
      type: 'sponsors',
      title: t('events.ultraevento.schedule.sponsors.title'),
      description: t('events.ultraevento.schedule.sponsors.description'),
      speakers: [
        '0xUltravioleta + DatBoi – Rekt (10 min)',
        '0xUltravioleta – Superfluid (10 min)',
        '0xUltravioleta + Cyberpaisa – Avalanche T1 (10 min)',
        '0xUltravioleta – deBridge (10 min)',
        'Celo Colombia + Self.xyz (15 min)',
        'Magic Eden (10 min)',
        'ReynarETH – Pyth (10 min)',
        'Uniswap (20 min)',
        'Heroes of Cipher (15 min)'
      ],
      note: t('events.ultraevento.schedule.sponsors.note')
    },
    {
      time: '6:35 – 6:45 p.m.',
      type: 'food',
      title: t('events.ultraevento.schedule.snack3.title'),
      description: t('events.ultraevento.schedule.snack3.description')
    },
    {
      time: '6:45 – 6:55 p.m.',
      type: 'airdrop',
      title: t('events.ultraevento.schedule.walletClose.title'),
      description: t('events.ultraevento.schedule.walletClose.description'),
      details: [
        t('events.ultraevento.schedule.walletClose.detail1'),
        t('events.ultraevento.schedule.walletClose.detail2')
      ]
    },
    {
      time: '7:00 – 7:05 p.m.',
      type: 'voting',
      title: t('events.ultraevento.schedule.snapshot.title'),
      description: t('events.ultraevento.schedule.snapshot.description'),
      details: [t('events.ultraevento.schedule.snapshot.detail1')]
    },
    {
      time: '7:05 – 7:20 p.m.',
      type: 'activity',
      title: t('events.ultraevento.schedule.ultraguaca.title'),
      description: t('events.ultraevento.schedule.ultraguaca.description'),
      details: [
        t('events.ultraevento.schedule.ultraguaca.detail1'),
        t('events.ultraevento.schedule.ultraguaca.detail2'),
        t('events.ultraevento.schedule.ultraguaca.detail3')
      ]
    },
    {
      time: '7:20 – 7:40 p.m.',
      type: 'demo',
      title: t('events.ultraevento.schedule.demo.title'),
      description: t('events.ultraevento.schedule.demo.description'),
      details: [
        t('events.ultraevento.schedule.demo.detail1'),
        t('events.ultraevento.schedule.demo.detail2'),
        t('events.ultraevento.schedule.demo.detail3')
      ]
    },
    {
      time: '7:40 – 7:50 p.m.',
      type: 'raffle',
      title: t('events.ultraevento.schedule.raffle3.title'),
      description: t('events.ultraevento.schedule.raffle3.description'),
      details: [t('events.ultraevento.schedule.raffle3.detail1')]
    },
    {
      time: '7:50 – 8:00 p.m.',
      type: 'closing',
      title: t('events.ultraevento.schedule.closing.title'),
      description: t('events.ultraevento.schedule.closing.description'),
      details: [
        t('events.ultraevento.schedule.closing.detail1'),
        t('events.ultraevento.schedule.closing.detail2'),
        t('events.ultraevento.schedule.closing.detail3')
      ]
    },
    {
      time: '8:00 – 9:00 p.m.',
      type: 'party',
      title: t('events.ultraevento.schedule.party.title'),
      description: t('events.ultraevento.schedule.party.description'),
      details: [
        t('events.ultraevento.schedule.party.detail1'),
        t('events.ultraevento.schedule.party.detail2'),
        t('events.ultraevento.schedule.party.detail3'),
        t('events.ultraevento.schedule.party.detail4')
      ]
    }
  ];

  return (
    <>
      <SEO 
        title={t('events.seo.title')}
        description={t('events.seo.description')}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {t('events.title')}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-6xl mx-auto mb-16"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1">
              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <SparklesIcon className="h-12 w-12 text-purple-400 mr-4" />
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    {t('events.ultraevento.title')}
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center justify-center bg-gray-800/50 rounded-xl p-4">
                    <CalendarIcon className="h-6 w-6 text-purple-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">{t('events.ultraevento.date.label')}</p>
                      <p className="text-white font-semibold">{t('events.ultraevento.date.value')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center bg-gray-800/50 rounded-xl p-4">
                    <ClockIcon className="h-6 w-6 text-purple-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">{t('events.ultraevento.time.label')}</p>
                      <p className="text-white font-semibold">{t('events.ultraevento.time.value')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center bg-gray-800/50 rounded-xl p-4">
                    <MapPinIcon className="h-6 w-6 text-purple-400 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">{t('events.ultraevento.location.label')}</p>
                      <p className="text-white font-semibold">{t('events.ultraevento.location.value')}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <p className="text-gray-300 text-lg">
                    {t('events.ultraevento.description')}
                  </p>
                </div>

                {/* Event Images Gallery */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <PhotoIcon className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">{t('events.ultraevento.gallery')}</h3>
                  </div>
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

                {/* Event Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">212</p>
                    <p className="text-gray-400 text-sm">{t('events.ultraevento.stats.registered')}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">144</p>
                    <p className="text-gray-400 text-sm">{t('events.ultraevento.stats.attendees')}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">10</p>
                    <p className="text-gray-400 text-sm">{t('events.ultraevento.stats.sponsors')}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">8h</p>
                    <p className="text-gray-400 text-sm">{t('events.ultraevento.stats.duration')}</p>
                  </div>
                </div>

                {/* Sponsors Section - Ultra Creative Design */}
                <div className="relative mt-8 pt-8 border-t-2 border-transparent bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-900 px-6 py-2 rounded-full border-2 border-purple-500/50">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">
                          <HeartIcon className="h-5 w-5 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                          {t('events.ultraevento.sponsors.title')}
                        </h3>
                        <div className="animate-pulse animation-delay-200">
                          <HeartIcon className="h-5 w-5 text-pink-500" />
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
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.1, rotate: 5, zIndex: 10 }}
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
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                              </a>
                              <a
                                href={sponsor.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-8 h-8 bg-purple-600/30 rounded-lg hover:bg-purple-600/50 transition-all group/video"
                                title={t('events.ultraevento.sponsors.watchVideo')}
                              >
                                <PlayCircleIcon className="h-4 w-4 text-purple-400 group-hover/video:text-purple-300 group-hover/video:scale-110 transition-all" />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Thank You Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="mt-6 text-center pb-4"
                    >
                      <p className="text-sm text-gray-400">
                        <span className="inline-block animate-bounce">💜</span>
                        {' '}{t('events.ultraevento.sponsors.gratitude')}{' '}
                        <span className="inline-block animate-bounce animation-delay-200">💜</span>
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              {t('events.ultraevento.scheduleTitle')}
            </h3>
            
            <div className="space-y-4">
              {schedule.map((item, index) => {
                const Icon = getEventTypeIcon(item.type);
                const colorClass = getEventTypeColor(item.type);
                
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="relative"
                  >
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className={`${colorClass} p-3 rounded-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <h4 className="text-xl font-semibold text-white">
                              {item.title}
                            </h4>
                            <span className="text-purple-400 font-medium mt-1 sm:mt-0">
                              {item.time}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-300 mb-3">
                              {item.description}
                            </p>
                          )}
                          
                          {item.details && (
                            <ul className="space-y-1 mb-3">
                              {item.details.map((detail, idx) => (
                                <li key={idx} className="text-gray-400 text-sm flex items-start">
                                  <span className="text-purple-400 mr-2">•</span>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {item.speakers && (
                            <div className="bg-gray-900/50 rounded-lg p-3 mt-3">
                              <p className="text-purple-400 text-sm font-semibold mb-2">
                                {t('events.ultraevento.speakers')}:
                              </p>
                              <ul className="grid sm:grid-cols-2 gap-1">
                                {item.speakers.map((speaker, idx) => (
                                  <li key={idx} className="text-gray-300 text-sm">
                                    • {speaker}
                                  </li>
                                ))}
                              </ul>
                              {item.note && (
                                <p className="text-gray-500 text-xs mt-2 italic">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Events;