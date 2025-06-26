import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import SwapWidget from '../components/SwapWidget';
import WrapWidget from '../components/WrapWidget';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "7343a278c7ff30dd04caba86259e87ea",
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("app.core.extension"),
];

const Token = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleReturn = () => {
    navigate('/', { replace: true });
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background py-16 px-4"
    >
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src="/logo.png" alt="UltravioletaDAO" className="w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          {t('token.title')}
        </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              

          
                
                <ConnectButton
      client={client}
      connectButton={{ label: t('snapshot.connect_wallet') }}
      connectModal={{ showThirdwebBranding: false, size: "compact" }}
      locale={t('common.locale')}
      theme={darkTheme({
        colors: {
          primaryButtonBg: "hsl(271, 100%, 35%)",
          primaryButtonText: "#FFFFFF",
          secondaryButtonBg: "hsl(271, 40%, 15%)",
          secondaryButtonText: "#FFFFFF",
          modalBg: "hsl(269, 100%, 6%)",
          borderColor: "hsl(273, 100%, 60%)",
          separatorLine: "hsl(273, 50%, 30%)",
          tertiaryBg: "hsl(271, 100%, 4%)",
          primaryText: "#FFFFFF",
          secondaryText: "#E5E5E5",
          accentButtonBg: "hsl(273, 100%, 45%)",
          accentButtonText: "#FFFFFF",
        },
      })}
      wallets={wallets}
    />
            
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
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
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-1xl font-bold text-text-primary mb-1 text-justify"
        >
          {t('token.description_1')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-1xl font-bold text-text-primary mb-5 text-justify"
        >
          {t('token.description_2')}
        </motion.p>
        {/* Swap and Wrap Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col lg:flex-row justify-center gap-6"
        >
          <SwapWidget />
          <WrapWidget />
        </motion.div>
        {/* Dexscreener Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <style>
            {`
            #dexscreener-embed {
              position: relative;
              width: 100%;
              padding-bottom: 125%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            @media(min-width: 1400px) {
              #dexscreener-embed {
                padding-bottom: 40%;
              }
            }
            #dexscreener-embed iframe {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              border: 0;
            }
            `}
          </style>
          <div id="dexscreener-embed">
            <iframe 
              src="https://dexscreener.com/avalanche/0xBFf3e2238e545C76f705560BD1677BD9c0E9dAB4?embed=1&loadChartSettings=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=1"
              title={t('token.chart_title')}
            ></iframe>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Token;
