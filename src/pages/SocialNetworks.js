import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import multifirma from '../assets/icons/multifirma.svg';
import swapToken from '../assets/icons/swapToken.svg';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const SocialNetworks = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleReturn = () => {
    // Animamos la salida usando framer-motion
    // La navegación será manejada por AnimatePresence en el componente padre
    navigate('/', { replace: true });
  };

  const networks = [
    {
      name: 'Twitter',
      url: 'https://twitter.com/UltravioletaDAO',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path
            fill="currentColor"
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      )
    },
    {
      name: 'Arena',
      url: 'https://arena.social/UltravioletaDAO',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" fill="none" class="h-[36px] text-brand-orange" className="w-6 h-6">
          <g fill="white" clip-path="url(#a)">
            <path d="M31.463 15.472V42h-.678V17.454c0-8.154-6.64-14.794-14.794-14.794-8.153 0-14.776 6.623-14.776 14.794V42H.537V15.472C.537 6.919 7.455 0 16.009 0c8.552 0 15.454 6.919 15.454 15.472Z"/>
            <path d="M28.768 16.984v22.513h-.678V18.705c0-6.675-5.423-12.099-12.099-12.099-6.675 0-12.1 5.406-12.1 12.082v20.791h-.677V16.967c0-7.058 5.72-12.777 12.777-12.777 7.058 0 12.777 5.719 12.777 12.777v.017Z"/>
            <path d="M26.091 18.497v18.479h-.678V19.939c0-5.197-4.224-9.422-9.422-9.422S6.57 14.742 6.57 19.94v17.037h-.678v-18.48c0-5.58 4.52-10.1 10.1-10.1s10.083 4.52 10.083 10.1h.017Z"/>
            <path d="M23.396 20.01v14.463h-.678V21.19a6.733 6.733 0 0 0-6.727-6.727c-3.703 0-6.728 3.024-6.728 6.727v13.282h-.678V20.009a7.412 7.412 0 0 1 7.406-7.405 7.412 7.412 0 0 1 7.405 7.405Z"/>
            <path d="M20.72 21.521V31.97h-.679v-9.526a4.055 4.055 0 0 0-4.05-4.05 4.043 4.043 0 0 0-4.05 4.05v9.526h-.679V21.521a4.733 4.733 0 0 1 4.729-4.728c2.608 0 4.711 2.12 4.711 4.729h.017Z"/>
            <path d="M18.025 23.034v6.415h-.678v-5.772c0-.747-.608-1.356-1.356-1.356-.747 0-1.356.609-1.356 1.356v5.772h-.678v-6.415c0-1.13.922-2.034 2.034-2.034 1.113 0 2.034.921 2.034 2.034Z"/>
          </g>
            <defs>
              <clipPath id="a"><rect width="30.9263" height="42" fill="white" transform="translate(0.536621)"/></clipPath>
            </defs>
        </svg>
      ),
      customStyle: "group-hover:text-[#FF5CAA]"
    },
    {
      name: t('navigation.multisig'),
      url: 'https://app.safe.global/home?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389',
      icon: (
        <img src={multifirma} alt={t('navigation_extra.multisig_alt')} className="w-6 h-6" />
      ),
      customStyle: "group-hover:text-emerald-400"
    },
    {
      name: t('links.swap_token'),
      url: 'https://ultravioletadao.xyz/token',
      icon: (
        <img src={swapToken} alt={t('navigation_extra.swap_token_alt')} className="w-6 h-6" />
      ),
      customStyle: "group-hover:text-purple-400"
    }
  ];

  return (
    <>
      <SEO
        title={t('socialnetworks.seoTitle', 'Social Media & Community Links')}
        description={t('socialnetworks.seoDescription', 'Connect with UltraVioleta DAO across all social platforms. Join our community on Twitter, Discord, Telegram, GitHub, and more.')}
        keywords="UltraVioleta social media, DAO community links, Web3 social networks, crypto community, blockchain social platforms"
      />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background py-16 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <motion.button
          onClick={handleReturn}
          className="inline-flex items-center space-x-2 text-text-secondary
            hover:text-text-primary transition-all duration-200 mb-8
            hover:translate-x-[-5px]"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{t('success.back_home')}</span>
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-text-primary mb-8
            text-center"
        >
          {t('links.title')}
        </motion.h1>

        <div className="space-y-4">
          {networks.map((network, index) => (
            <motion.a
              key={network.name}
              href={network.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.1 + 0.2,
                duration: 0.3
              }}
              className={`flex items-center space-x-4 p-4 rounded-lg
                bg-background-lighter border border-ultraviolet-darker/20
                hover:border-ultraviolet-darker hover:bg-background/80
                transition-all duration-200 group ${network.customStyle || ''}`}
            >
              <div className="text-text-primary group-hover:text-ultraviolet
                transition-colors duration-200">
                {network.icon}
              </div>
              <span className="text-text-primary group-hover:text-ultraviolet
                transition-colors duration-200">
                {network.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default SocialNetworks; 