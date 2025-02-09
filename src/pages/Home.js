import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserGroupIcon, CurrencyDollarIcon, QuestionMarkCircleIcon, UserGroupIcon as GroupIcon, SparklesIcon, LightBulbIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ApplicationForm from './ApplicationForm';

const SHOW_BUTTONS = process.env.REACT_APP_SHOW_BUTTONS === 'true';

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const features = [
    {
      title: "Comunidad Activa",
      description: "Somos una de las comunidades más activas de Web3 en Latinoamérica.",
      icon: UserGroupIcon,
      link: "https://linktr.ee/UltravioletaDAO",
      buttonText: "Conócenos"
    },
    {
      title: "$UVT: nuestro token de gobernanza",
      description: "Participa en el crecimiento y la toma de decisiones con nuestro token de gobernanza UVT.",
      icon: CurrencyDollarIcon,
      link: "https://dexscreener.com/avalanche/0x281027C6a46142D6FC57f12665147221CE69Af33",
      buttonText: "Ver Token"
    },
    {
      title: "Por definir",
      description: "Próximamente nuevas características y beneficios para nuestra comunidad.",
      icon: QuestionMarkCircleIcon,
      isComingSoon: true
    }
  ];

  const benefits = [
    {
      title: "Grupo privado de expertos",
      description: "Acceso a un grupo privado en Telegram con expertos en múltiples áreas.",
      icon: GroupIcon
    },
    {
      title: "Nuevas relaciones y oportunidades",
      description: "Conoce y colabora con líderes y desarrolladores clave del ecosistema Web3.",
      icon: SparklesIcon
    },
    {
      title: "Los mejores alphas",
      description: "Obtén acceso exclusivo a información y oportunidades estratégicas en Web3.",
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
              backgroundImage: `url('https://pbs.twimg.com/profile_banners/1801046952143900672/1738130477/1500x500')`,
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
              Bienvenido a UltraVioleta DAO
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
              La élite de Web3 en Latinoamérica, empoderando e iluminando el camino 
              de comunidades online hacia un nuevo sistema financiero inclusivo, 
              donde todos puedan participar y prosperar.
            </motion.p>
            
            {SHOW_BUTTONS && (
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
                  Aplicar Ahora
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/status"
                    className="inline-block px-8 py-4 bg-ultraviolet-darker text-text-primary rounded-lg
                      hover:bg-ultraviolet-dark transition-colors duration-200
                      font-semibold text-lg shadow-lg shadow-ultraviolet-darker/20
                      backdrop-blur-sm"
                  >
                    Verificar Estado
                  </Link>
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
            Beneficios de Unirte
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