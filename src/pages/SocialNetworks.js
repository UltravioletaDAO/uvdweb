import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const SocialNetworks = () => {
  const navigate = useNavigate();

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
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M19 21L12 3L5 21M19 21H5M19 21L16 15M5 21L8 15M8 15L12 9L16 15M8 15H16" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      ),
      customStyle: "group-hover:text-[#FF5CAA]"
    },
    {
      name: 'Multifirma',
      url: 'https://app.safe.global/home?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389',
      icon: (
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          <path 
            d="M15 8H9C7.89543 8 7 8.89543 7 10V14C7 15.1046 7.89543 16 9 16H15C16.1046 16 17 15.1046 17 14V10C17 8.89543 16.1046 8 15 8Z" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          <path 
            d="M12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12Z" 
            fill="currentColor"
          />
          <path 
            d="M12 14C11.4477 14 11 13.5523 11 13V12H13V13C13 13.5523 12.5523 14 12 14Z" 
            fill="currentColor"
          />
        </svg>
      ),
      customStyle: "group-hover:text-emerald-400"
    },
    {
      name: 'Liquidity Pool UVT/Avax',
      url: 'https://lfj.gg/avalanche/pool/v22/0x281027c6a46142d6fc57f12665147221ce69af33/AVAX/100',
      icon: (
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 16.5C9.24 16.5 7 14.26 7 11.5C7 8.74 9.24 6.5 12 6.5C14.76 6.5 17 8.74 17 11.5C17 14.26 14.76 16.5 12 16.5ZM12 8.5C10.34 8.5 9 9.84 9 11.5C9 13.16 10.34 14.5 12 14.5C13.66 14.5 15 13.16 15 11.5C15 9.84 13.66 8.5 12 8.5Z" 
            fill="currentColor"
          />
          <path
            d="M3 19L21 3M3 3L21 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      customStyle: "group-hover:text-blue-400"
    },
    {
      name: 'Swap Token',
      url: 'https://lfj.gg/avalanche/swap?outputCurrency=AVAX&inputCurrency=0x281027C6a46142D6FC57f12665147221CE69Af33',
      icon: (
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M7 10L3 14L7 18" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M17 14L21 10L17 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M3 14H21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      ),
      customStyle: "group-hover:text-purple-400"
    }
  ];

  return (
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
          <span>Volver al inicio</span>
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-text-primary mb-8
            text-center"
        >
          Nuestros Links
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
  );
};

export default SocialNetworks; 