import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import swapToken from '../assets/icons/swapToken.svg';
import liquidityPool from '../assets/icons/liquidityPool.svg';

const Token = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleReturn = () => {
    navigate('/', { replace: true });
  };

  const tokenButtons = [
    {
      name: 'Swap Token',
      url: 'https://lfj.gg/avalanche/swap?outputCurrency=AVAX&inputCurrency=0x281027C6a46142D6FC57f12665147221CE69Af33',
      icon: (
        <img src={swapToken} alt="SwapToken Icon" className="w-6 h-6" />
      ),
      customStyle: "group-hover:text-purple-400"
    },
    {
      name: 'Liquidity Pool UVT/Avax',
      url: 'https://lfj.gg/avalanche/pool/v22/0x281027c6a46142d6fc57f12665147221ce69af33/AVAX/100',
      icon: (
        <img src={liquidityPool} alt="Liquidity Pool Icon" className="w-6 h-6" />
      ),
      customStyle: "group-hover:text-blue-400"
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
      <div className="container mx-auto">
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
          className="text-4xl font-bold text-text-primary mb-8 text-center"
        >
          Ultravioleta Token
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-1xl font-bold text-text-primary mb-1 text-justify"
        >
          $UVT es el token de gobernanza y utilidad de UltraVioleta DAO, que faculta a los titulares a participar en la toma de decisiones descentralizada y la gestión de tesorería. Se utiliza para votar propuestas, asignar fondos comunitarios y apoyar iniciativas de los miembros.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-1xl font-bold text-text-primary mb-5 text-justify"
        >
          A través de $UVT, la DAO mantiene una estructura transparente y democrática, asegurando que sus recursos se dirigen en base a la gobernanza colectiva.
        </motion.p>

        {/* Dexscreener Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 flex justify-center"
        >
          <style>
            {`
            #dexscreener-embed {
              position: relative;
              width: 80%;
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
              src="https://dexscreener.com/avalanche/0xedF7A33d1Cd54960e5EaeE37BC7a9E2a46B78af7?embed=1&loadChartSettings=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=price&interval=60"
              title="Dexscreener $UVT Chart"
            ></iframe>
          </div>
        </motion.div>

        {/* Token Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          {tokenButtons.map((tokenButton, index) => (
            <motion.a
              key={tokenButton.name}
              href={tokenButton.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.1 + 0.3,
                duration: 0.3
              }}
              className={`flex items-center space-x-4 p-4 rounded-lg
                bg-background-lighter border border-ultraviolet-darker/20
                hover:border-ultraviolet-darker hover:bg-background/80
                transition-all duration-200 group ${tokenButton.customStyle || ''}`}
            >
              <div className="text-text-primary group-hover:text-ultraviolet
                transition-colors duration-200">
                {tokenButton.icon}
              </div>
              <span className="text-text-primary group-hover:text-ultraviolet
                transition-colors duration-200">
                {tokenButton.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Token;
