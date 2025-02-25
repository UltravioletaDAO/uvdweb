import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserGroupIcon, CurrencyDollarIcon, UserGroupIcon as GroupIcon, SparklesIcon, LightBulbIcon, GiftIcon } from '@heroicons/react/24/outline';
import ApplicationForm from './ApplicationForm';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { t } = useTranslation();
  const showButtons = process.env.REACT_APP_SHOW_SIGNUP_BUTTONS === 'true';

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
      icon: CurrencyDollarIcon,
      link: "https://dexscreener.com/avalanche/0x281027C6a46142D6FC57f12665147221CE69Af33",
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
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
        
        <div className="container mx-auto px-4 py-20 relative z-10">
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
                  {t('auth.register')} / {t('auth.register_en')}
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* <Link
                    to="/status"
                    className="inline-block px-8 py-4 bg-ultraviolet-darker text-text-primary rounded-lg
                      hover:bg-ultraviolet-dark transition-colors duration-200
                      font-semibold text-lg shadow-lg shadow-ultraviolet-darker/20
                      backdrop-blur-sm"
                  >
                    {t('auth.login')} / {t('auth.login_en')}
                  </Link> */}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

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

      <ApplicationForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
};

export default Home; 