import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import {
  BeakerIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LinkIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const ExperimentsPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Experiments data structure
  const experiments = [
    {
      id: 'operacion-camaleon',
      slug: 'operacion-camaleon-2023',
      year: 2023,
      category: 'research',
      status: 'completed',
      date: t('experiments.items.operacionCamaleon.date'),
      title: t('experiments.items.operacionCamaleon.title'),
      description: t('experiments.items.operacionCamaleon.description'),
      summary: t('experiments.items.operacionCamaleon.summary'),
      participants: 7,
      budget: '$3-4 USDC',
      blockchain: 'Polygon',
      results: [
        t('experiments.items.operacionCamaleon.results.item1'),
        t('experiments.items.operacionCamaleon.results.item2'),
        t('experiments.items.operacionCamaleon.results.item3'),
      ],
      links: [
        { url: 'https://polygonscan.com/tx/0xb0194542f5eff6bb8e9b7a3c9139a1faba4ff13300840f33b96c2fe383ec99fb', label: t('experiments.items.operacionCamaleon.links.transaction') },
      ],
      tags: ['crowdsourcing', 'health', 'research', 'community'],
      icon: BeakerIcon,
      color: 'from-green-500 to-emerald-600'
    },
    // Placeholder for future experiments
    {
      id: 'coming-soon-1',
      slug: 'coming-soon',
      year: 2025,
      category: 'governance',
      status: 'upcoming',
      date: t('experiments.comingSoon.date'),
      title: t('experiments.comingSoon.title'),
      description: t('experiments.comingSoon.description'),
      summary: '',
      participants: 0,
      budget: 'TBD',
      blockchain: 'Avalanche',
      results: [],
      links: [],
      tags: ['governance', 'dao'],
      icon: ChartBarIcon,
      color: 'from-purple-500 to-blue-600'
    }
  ];

  const categories = [
    { id: 'all', name: t('experiments.categories.all'), icon: BeakerIcon },
    { id: 'research', name: t('experiments.categories.research'), icon: DocumentTextIcon },
    { id: 'governance', name: t('experiments.categories.governance'), icon: ChartBarIcon },
    { id: 'community', name: t('experiments.categories.community'), icon: UsersIcon },
  ];

  const filteredExperiments = selectedCategory === 'all'
    ? experiments
    : experiments.filter(exp => exp.category === selectedCategory);

  const stats = [
    { label: t('experiments.stats.totalExperiments'), value: experiments.filter(e => e.status === 'completed').length, icon: BeakerIcon },
    { label: t('experiments.stats.participants'), value: experiments.reduce((sum, e) => sum + e.participants, 0), icon: UsersIcon },
    { label: t('experiments.stats.ongoing'), value: experiments.filter(e => e.status === 'ongoing').length, icon: ClockIcon },
    { label: t('experiments.stats.completed'), value: experiments.filter(e => e.status === 'completed').length, icon: CheckCircleIcon },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        label: t('experiments.status.completed')
      },
      ongoing: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        label: t('experiments.status.ongoing')
      },
      upcoming: {
        bg: 'bg-gray-100 dark:bg-gray-700/30',
        text: 'text-gray-700 dark:text-gray-400',
        label: t('experiments.status.upcoming')
      }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <SEO
        title={t('experiments.seoTitle', 'Community Experiments - UltraVioleta DAO')}
        description={t('experiments.seoDescription', 'Explore the innovative experiments conducted by UltraVioleta DAO community. From health research to governance experiments, discover how we test and learn together.')}
        keywords="DAO experiments, community research, Web3 experiments, decentralized research, blockchain experiments, crowdsourcing, DAO innovation"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white"
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <motion.div className="flex items-center justify-center mb-6" {...fadeInUp}>
              <BeakerIcon className="h-16 w-16 mr-4" />
            </motion.div>
            <motion.h1
              {...fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-6 text-center"
            >
              {t('experiments.hero.title')}
            </motion.h1>
            <motion.p
              {...fadeInUp}
              className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 text-center"
            >
              {t('experiments.hero.subtitle')}
            </motion.p>
          </div>
        </motion.section>

        {/* Stats Section */}
        <section className="py-12 -mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <FunnelIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Experiments Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8"
            >
              {filteredExperiments.map((experiment) => (
                <motion.div
                  key={experiment.id}
                  variants={fadeInUp}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${
                    experiment.status === 'upcoming' ? 'opacity-60 border-2 border-dashed border-gray-300 dark:border-gray-600' : ''
                  }`}
                >
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${experiment.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <experiment.icon className="h-10 w-10" />
                      {getStatusBadge(experiment.status)}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{experiment.title}</h3>
                    <div className="flex items-center text-sm opacity-90">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {experiment.date}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {experiment.description}
                    </p>

                    {experiment.status !== 'upcoming' && (
                      <>
                        {experiment.summary && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>{t('experiments.labels.summary')}:</strong> {experiment.summary}
                            </p>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                              {t('experiments.labels.participants')}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1 text-purple-600" />
                              {experiment.participants}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                              {t('experiments.labels.budget')}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {experiment.budget}
                            </p>
                          </div>
                        </div>

                        {/* Results */}
                        {experiment.results.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase">
                              {t('experiments.labels.results')}
                            </h4>
                            <ul className="space-y-2">
                              {experiment.results.map((result, idx) => (
                                <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>{result}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {experiment.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Links */}
                        {experiment.links.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="space-y-2">
                              {experiment.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                >
                                  <LinkIcon className="h-4 w-4 mr-2" />
                                  <span className="truncate">{link.label}</span>
                                  <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 flex-shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {experiment.status === 'upcoming' && (
                      <div className="text-center py-8">
                        <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          {t('experiments.comingSoon.details')}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
          >
            <BeakerIcon className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('experiments.cta.title')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('experiments.cta.description')}
            </p>
            <a
              href="/snapshot"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-purple-600 bg-white rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t('experiments.cta.button')}
            </a>
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default ExperimentsPage;
