import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
  ExternalLinkIcon
} from 'lucide-react';

const ServicesPage = () => {
  const { t } = useTranslation();

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
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
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
  );
};

export default ServicesPage;