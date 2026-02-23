import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ApplicationForm from './ApplicationForm';
import SEO from '../components/SEO';
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
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { XIcon } from '@heroicons/react/24/solid';

const About = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
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
      icon: SparklesIcon
    },
    {
      date: t('about.timeline.crt.date'),
      title: t('about.timeline.crt.title'),
      description: t('about.timeline.crt.description'),
      icon: BeakerIcon
    },
    {
      date: t('about.timeline.partner2022.date'),
      title: t('about.timeline.partner2022.title'),
      description: t('about.timeline.partner2022.description'),
      icon: FireIcon
    },
    {
      date: t('about.timeline.september2023.date'),
      title: t('about.timeline.september2023.title'),
      description: t('about.timeline.september2023.description'),
      icon: UserGroupIcon,
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
      icon: GlobeAltIcon
    },
    {
      date: t('about.timeline.june2024.date'),
      title: t('about.timeline.june2024.title'),
      description: t('about.timeline.june2024.description'),
      icon: FireIcon
    },
    {
      date: t('about.timeline.july2024.date'),
      title: t('about.timeline.july2024.title'),
      description: t('about.timeline.july2024.description'),
      icon: BeakerIcon
    },
    {
      date: t('about.timeline.october2024.date'),
      title: t('about.timeline.october2024.title'),
      description: t('about.timeline.october2024.description'),
      icon: GlobeAltIcon,
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
      images: ['/images/quedada-medellin-2024.jpg'],
      videos: [
        { url: 'https://youtu.be/knuBAicIc5U', title: 'Quedada Medellín 2024' }
      ]
    },
    {
      date: t('about.timeline.january2025.date'),
      title: t('about.timeline.january2025.title'),
      description: t('about.timeline.january2025.description'),
      icon: ChartBarIcon
    },
    {
      date: t('about.timeline.august23_2025.date'),
      title: t('about.timeline.august23_2025.title'),
      description: t('about.timeline.august23_2025.description'),
      icon: FireIcon,
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
      images: ['/images/quedada-medellin-2025.jpg']
    },
    {
      date: t('about.timeline.duna2025.date'),
      title: t('about.timeline.duna2025.title'),
      description: t('about.timeline.duna2025.description'),
      icon: AcademicCapIcon
    },
    {
      date: t('about.timeline.october18_2024.date'),
      title: t('about.timeline.october18_2024.title'),
      description: t('about.timeline.october18_2024.description'),
      icon: ChartBarIcon,
      links: t('about.timeline.october18_2024.links', { returnObjects: true })
    },
    {
      date: t('about.timeline.october26_2024.date'),
      title: t('about.timeline.october26_2024.title'),
      description: t('about.timeline.october26_2024.description'),
      icon: BeakerIcon,
      images: ['/images/x402-facilitator.png'],
      links: t('about.timeline.october26_2024.links', { returnObjects: true })
    },
    {
      date: t('about.timeline.october28_2024.date'),
      title: t('about.timeline.october28_2024.title'),
      description: t('about.timeline.october28_2024.description'),
      icon: FireIcon,
      links: t('about.timeline.october28_2024.links', { returnObjects: true })
    },
    {
      date: t('about.timeline.devconnect2025.date'),
      title: t('about.timeline.devconnect2025.title'),
      description: t('about.timeline.devconnect2025.description'),
      icon: GlobeAltIcon,
      videos: [
        { url: 'https://www.youtube.com/watch?v=7NHG0F7_HJk', title: 'DevConnect Argentina 2025' }
      ]
    },
    {
      date: t('about.timeline.x402hackathon.date'),
      title: t('about.timeline.x402hackathon.title'),
      description: t('about.timeline.x402hackathon.description'),
      icon: AcademicCapIcon,
      links: t('about.timeline.x402hackathon.links', { returnObjects: true })
    },
    {
      date: t('about.timeline.current.date'),
      title: t('about.timeline.current.title'),
      description: t('about.timeline.current.description'),
      icon: ChartBarIcon
    }
  ];

  const values = [
    {
      icon: AcademicCapIcon,
      title: t('about.values.learning.title'),
      description: t('about.values.learning.description')
    },
    {
      icon: UserGroupIcon,
      title: t('about.values.community.title'),
      description: t('about.values.community.description')
    },
    {
      icon: GlobeAltIcon,
      title: t('about.values.transparency.title'),
      description: t('about.values.transparency.description')
    }
  ];

  return (
    <>
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        keywords="About UltraVioleta DAO, Web3 Latin America, DAO Mission, Decentralized Community, Blockchain LATAM, DAO Values, Web3 Education, Community Governance"
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white"
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.h1 
            {...fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {t('about.hero.title')}
          </motion.h1>
          <motion.p 
            {...fadeInUp}
            className="text-xl md:text-2xl max-w-3xl opacity-90"
          >
            {t('about.hero.subtitle')}
          </motion.p>
        </div>
      </motion.section>

      {/* Origin Story */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              {t('about.origin.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.origin.paragraph1')}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.origin.paragraph2')}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.origin.paragraph3')}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.origin.paragraph4')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white"
          >
            {t('about.timeline.title')}
          </motion.h2>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-purple-600 to-blue-600"></div>
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ml-12 md:ml-0">
                    <div className="flex items-center mb-3">
                      <milestone.icon className="h-6 w-6 text-purple-600 mr-3" />
                      <span className="text-sm font-semibold text-purple-600">
                        {milestone.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {milestone.description}
                    </p>

                    {/* Links Section */}
                    {milestone.links && milestone.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {milestone.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                          >
                            {link.label}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Images Gallery */}
                    {milestone.images && milestone.images.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <PhotoIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Gallery</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {milestone.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`${milestone.title} ${idx + 1}`}
                              className={`rounded-lg w-full cursor-pointer hover:opacity-90 transition-opacity ${
                                image.includes('x402-facilitator') ? 'h-auto object-contain' : 'h-32 object-cover'
                              }`}
                              onClick={() => window.open(image, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* YouTube Videos */}
                    {milestone.videos && milestone.videos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <PlayCircleIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Videos</span>
                        </div>
                        {milestone.videos.map((video, idx) => {
                          const videoId = video.url.includes('youtu.be/')
                            ? video.url.split('youtu.be/')[1].split('?')[0]
                            : video.url.split('v=')[1]?.split('&')[0];
                          return (
                            <div key={idx} className="relative">
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                              >
                                <div className="relative">
                                  <img
                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-40 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                    <PlayCircleIcon className="h-12 w-12 text-white opacity-90" />
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                    <p className="text-white text-sm font-medium">{video.title}</p>
                                  </div>
                                </div>
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Sponsors Section - Creative Design */}
                    {milestone.sponsors && milestone.sponsors.length > 0 && (
                      <div className="mt-6 pt-4 border-t-2 border-gradient-to-r from-purple-500 to-pink-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse">
                            <HeartIcon className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-wider">
                            {t('about.timeline.sponsors.poweredBy')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {milestone.sponsors.map((sponsor, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group relative bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-black/30 rounded-lg group-hover:bg-black/40 transition-colors">
                                    <span className="text-lg font-bold text-transparent bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text">
                                      {sponsor.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                      {sponsor.name}
                                    </h4>
                                    <a
                                      href={`https://x.com/${sponsor.twitter.substring(1)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                      </svg>
                                      <span>{sponsor.twitter}</span>
                                    </a>
                                  </div>
                                </div>
                                <a
                                  href={sponsor.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-8 h-8 bg-purple-600/20 rounded-full hover:bg-purple-600/30 transition-all group/video"
                                  title={t('about.timeline.sponsors.watchVideo')}
                                >
                                  <PlayCircleIcon className="h-5 w-5 text-purple-600 group-hover/video:text-purple-400 group-hover/video:scale-110 transition-all" />
                                </a>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {t('about.timeline.sponsors.gratitude')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white dark:border-gray-900"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vision, Mission & Values */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('about.vision.title')}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about.vision.description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about.mission.description')}
            </p>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white"
          >
            {t('about.values.title')}
          </motion.h3>

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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
              >
                <value.icon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {value.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Activities & Initiatives */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white"
          >
            {t('about.activities.title')}
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              'education',
              'governance',
              'economy',
              'infrastructure',
              'events',
              'ai'
            ].map((activity) => (
              <motion.div
                key={activity}
                variants={fadeInUp}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t(`about.activities.${activity}.title`)}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {t(`about.activities.${activity}.description`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Token Governance Experience */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              {t('about.governance.title')}
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('about.governance.paragraph1')}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('about.governance.paragraph2')}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {t('about.governance.paragraph3')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Current State & Projects */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              {t('about.current.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t('about.current.structure.title')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t('about.current.structure.description')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t('about.current.projects.title')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t('about.current.projects.description')}
                </p>
              </div>
            </div>

            {/* Legal Status Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                <AcademicCapIcon className="h-8 w-8 text-purple-600 mr-3" />
                {t('about.current.legal.title')}
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.current.legal.description')}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.current.legal.whatIsDuna')}{' '}
                  <a
                    href="https://a16zcrypto.com/posts/article/duna-for-daos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline font-semibold"
                  >
                    {t('about.current.legal.dunaLinkText')}
                  </a>.
                </p>
                
                <a
                  href="https://wyobiz.wyo.gov/business/FilingDetails.aspx?eFNum=231152217007187086250219198232174206067107184230"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">View Official Wyoming Filing</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('about.current.legal.details.title')}
                  </h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• <strong>{t('about.current.legal.details.entity')}:</strong> {t('about.current.legal.details.entity_value')}</li>
                    <li>• <strong>{t('about.current.legal.details.jurisdiction')}:</strong> {t('about.current.legal.details.jurisdiction_value')}</li>
                    <li>• <strong>{t('about.current.legal.details.registered')}:</strong> {t('about.current.legal.details.registered_value')}</li>
                    <li className="break-words">• <strong>{t('about.current.legal.details.treasury')}:</strong> <span className="break-all text-sm">{t('about.current.legal.details.treasury_value')}</span></li>
                  </ul>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('about.current.legal.benefits')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured On - Media Appearances */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">
              {t('about.featuredOn.title')}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 text-center mb-12 max-w-3xl mx-auto">
              {t('about.featuredOn.subtitle')}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cointelegraph Article */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <NewspaperIcon className="h-16 w-16 text-white opacity-90" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('about.featuredOn.types.article')}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Cointelegraph
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t('about.featuredOn.cointelegraph.date')}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {t('about.featuredOn.cointelegraph.description')}
                  </p>
                  <a
                    href="https://es.cointelegraph.com/news/blockchain-es-una-herramienta-de-coordinacion-y-transparencia-radical-segun-ultravioletadao"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
                  >
                    {t('about.featuredOn.readMore')}
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </motion.div>

              {/* Placeholder for more media appearances */}
              {[1, 2].map((idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-100 dark:bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-400 to-gray-500 opacity-20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MicrophoneIcon className="h-16 w-16 text-gray-600" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                    <div className="mt-4">
                      <span className="text-gray-500 dark:text-gray-400 text-sm italic">
                        {t('about.featuredOn.comingSoon')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blockchain Meaning */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('about.blockchain.title')}
            </h2>
            <p className="text-lg mb-4 opacity-95">
              {t('about.blockchain.paragraph1')}
            </p>
            <p className="text-lg opacity-95">
              {t('about.blockchain.paragraph2')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            {t('about.cta.description')}
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t('about.cta.button')}
          </button>
        </motion.div>
      </section>

      <ApplicationForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
    </>
  );
};

export default About;