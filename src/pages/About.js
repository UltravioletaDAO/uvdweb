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
  SparklesIcon
} from '@heroicons/react/24/outline';

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
      date: t('about.timeline.june2024.date'),
      title: t('about.timeline.june2024.title'),
      description: t('about.timeline.june2024.description'),
      icon: FireIcon
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
        title={t('about.seoTitle', 'About Us - Learn About UltraVioleta DAO')}
        description={t('about.seoDescription', 'Discover UltraVioleta DAO - A decentralized community building Web3 infrastructure in Latin America. Learn about our mission, vision, values, and journey since 2022.')}
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
                    <p className="text-gray-700 dark:text-gray-300">
                      {milestone.description}
                    </p>
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
            <div className="grid md:grid-cols-2 gap-8">
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
          </motion.div>
        </div>
      </section>

      {/* Blockchain Meaning */}
      <section className="py-16 lg:py-24">
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
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
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