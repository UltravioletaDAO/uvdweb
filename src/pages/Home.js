import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserGroupIcon, CurrencyDollarIcon, UserGroupIcon as GroupIcon, SparklesIcon, LightBulbIcon, GiftIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import ApplicationForm from './ApplicationForm';
import { useTranslation } from 'react-i18next';
import { getEvents } from '../services/events/Events';

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEventsSection, setShowEventsSection] = useState(true);
  
  const { t } = useTranslation();
  const showButtons = process.env.REACT_APP_SHOW_SIGNUP_BUTTONS === 'true';

  useEffect(() => {
    getEvents().then(fetchedEvents => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Filtrar los eventos con fecha futura
      const filteredEvents = fetchedEvents.filter(eventGroup => {
        const [eventDay, eventMonth] = eventGroup.date.split("/").map(Number);
        const eventDate = new Date(today.getFullYear(), eventMonth - 1, eventDay);
        return eventDate >= today; // El evento debe ser hoy o en el futuro
      });

      setEvents(filteredEvents);

      // Si no hay eventos futuros, ocultar la sección
      if (filteredEvents.length === 0) {
        setShowEventsSection(false);
      } else {
        setShowEventsSection(true);
      }
    });
  }, []);
  
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
      isInternal: true,
      icon: CurrencyDollarIcon,
      path: "/token",
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
                  {t('auth.register')}
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

      {/* Próximos eventos */}
      {showEventsSection && (
        <section className="py-16 bg-background-lighter">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
              className="text-3xl font-bold text-text-primary mb-5"
            >
              {t('events.title')}
            </motion.h2>

            <p className="text-text-secondary mb-10">
              {t('events.description')}
            </p>

            <div className="space-y-8">
              {events.map((eventGroup) => (
                <div key={eventGroup.date} className="mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1,
                      ease: "easeOut"
                    }}
                    className="flex items-center mb-4 text-text-primary"
                  >
                    <div className="w-4 h-4 bg-ultraviolet-darker rounded-full mr-3"></div>
                    <span className="font-bold mr-2">{eventGroup.date}</span>
                  </motion.div>

                  <div className="space-y-6">
                    {eventGroup.events.map((event, eventIndex) => (
                      <motion.div
                        key={`${eventGroup.date}-${event.title}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + eventIndex * 0.1,
                          ease: "easeOut"
                        }}
                        className="rounded-xl overflow-hidden bg-background border border-ultraviolet-darker/20
                        hover:border-ultraviolet-darker transition-all duration-300
                        hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      >
                        <a
                          href={event.register}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-grow">
                              <h3 className="text-xl font-bold text-text-primary mb-3">{event.title}</h3>
                              <div className="flex items-center mb-3 text-text-secondary">
                                <MapPinIcon className="w-5 h-5 mr-2 text-ultraviolet-light" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center mb-3 text-text-secondary">
                                <ClockIcon className="w-5 h-5 mr-2 text-ultraviolet-light" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            <div className="md:w-1/6 h-auto flex items-center justify-center">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full aspect-[16/9] object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/300/200";
                                  e.target.alt = "Event placeholder";
                                }}
                              />
                            </div>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ApplicationForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
};

export default Home;