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
  MusicalNoteIcon
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

                <div className="text-center">
                  <p className="text-gray-300 text-lg">
                    {t('events.ultraevento.description')}
                  </p>
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