import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
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
    <>
      <SEO
        title="UVD Token | Avalanche Governance Token for Latin America DAO"
        description="UVD is the native governance token of UltraVioleta DAO on Avalanche blockchain. Trade, swap, and participate in DAO governance. Contract: 0x4Ffe7e01832243e03668E090706F17726c26d6B2"
        keywords="UVD token, UltraVioleta token, Avalanche token, governance token, DAO token, Latin America cryptocurrency, AVAX DEX, Arena swap, DeFi token LATAM, ERC-20 token, crypto governance, Web3 token, decentralized governance, Avalanche C-Chain, UVD price, UVD trading"
      />
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
              <img src="/logo.png" alt={t('common.logo_alt')} className="w-8 h-8 sm:w-10 sm:h-10" />
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
          
          <WrapWidget />
          <SwapWidget />
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

        {/* Tokenomics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            {t('tokenomics.title')}
          </h2>

          {/* Total Supply Overview */}
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-primary mb-4">
              {t('tokenomics.supply.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-background/80 rounded-lg p-4">
                <span className="text-text-secondary text-sm">{t('tokenomics.supply.total')}</span>
                <p className="text-2xl font-bold text-text-primary">10,000,000,000 UVD</p>
                <span className="text-xs text-text-secondary">10 Billion</span>
              </div>
              <div className="bg-background/80 rounded-lg p-4">
                <span className="text-text-secondary text-sm">{t('tokenomics.supply.launch')}</span>
                <p className="text-2xl font-bold text-text-primary">7,300,000,000 UVD</p>
                <span className="text-xs text-text-secondary">7.3 Billion (73%)</span>
              </div>
              <div className="bg-background/80 rounded-lg p-4">
                <span className="text-text-secondary text-sm">{t('tokenomics.supply.circulating')}</span>
                <p className="text-2xl font-bold text-primary">~6,070,000,000 UVD</p>
                <span className="text-xs text-text-secondary">~60.7%</span>
              </div>
            </div>

            {/* Distribution Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background/60 rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  {t('tokenomics.supply.distribution')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('tokenomics.supply.uvt_holders')}</span>
                    <span className="text-text-primary font-medium">3,017,000,000 UVD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('tokenomics.supply.multisig')}</span>
                    <span className="text-text-primary font-medium">3,930,000,000 UVD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('tokenomics.supply.liquidity')}</span>
                    <span className="text-text-primary font-medium">2,450,000,000 UVD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('tokenomics.supply.airdrop')}</span>
                    <span className="text-text-primary font-medium">333,300,000 UVD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('tokenomics.supply.champions')}</span>
                    <span className="text-text-primary font-medium">250,000,000 UVD</span>
                  </div>
                </div>
              </div>

              <div className="bg-background/60 rounded-lg p-4">
                <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-xl">🏦</span>
                  {t('tokenomics.supply.treasury_allocation')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('tokenomics.treasury_base')}</span>
                    <span className="text-text-primary font-medium">2,139,063,651 UVD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('tokenomics.supply.period')}</span>
                    <span className="text-text-primary font-medium">18 {t('tokenomics.months')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-xs">{t('tokenomics.period_dates')}</span>
         
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bounties Section */}
            <div className="bg-background-secondary rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                {t('tokenomics.bounties.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.allocation')}</span>
                  <span className="text-text-primary font-semibold">855,625,460.64 UVD (40%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.bounties.monthly')}</span>
                  <span className="text-text-primary">~47,534,748 UVD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.bounties.frequency')}</span>
                  <span className="text-text-primary">3 {t('tokenomics.bounties.per_month')}</span>
                </div>
                <div className="mt-4 p-3 bg-background/30 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">{t('tokenomics.bounties.prizes')}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>🥇 {t('tokenomics.bounties.first')}</span>
                      <span className="text-primary">50% (~7,922,458 UVD)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>🥈 {t('tokenomics.bounties.second')}</span>
                      <span className="text-primary">30% (~4,753,475 UVD)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>🥉 {t('tokenomics.bounties.third')}</span>
                      <span className="text-primary">20% (~3,168,983 UVD)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Airdrops Section */}
            <div className="bg-background-secondary rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">🪂</span>
                {t('tokenomics.airdrops.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.allocation')}</span>
                  <span className="text-text-primary font-semibold">427,812,730.32 UVD (20%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.airdrops.monthly')}</span>
                  <span className="text-text-primary">~23,767,374 UVD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.airdrops.frequency')}</span>
                  <span className="text-text-primary">1 {t('tokenomics.airdrops.per_month')}</span>
                </div>
                <div className="mt-4 p-3 bg-background/30 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">{t('tokenomics.airdrops.objectives')}</p>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• {t('tokenomics.airdrops.obj1')}</li>
                    <li>• {t('tokenomics.airdrops.obj2')}</li>
                    <li>• {t('tokenomics.airdrops.obj3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Wheel Section */}
            <div className="bg-background-secondary rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">🎰</span>
                {t('tokenomics.wheel.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.allocation')}</span>
                  <span className="text-text-primary font-semibold">92,226,939.31 UVD (4.31%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.wheel.frequency')}</span>
                  <span className="text-text-primary">4 {t('tokenomics.wheel.per_month')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.wheel.total')}</span>
                  <span className="text-text-primary">70 {t('tokenomics.wheel.wheels')}</span>
                </div>
                <div className="mt-4 p-3 bg-background/30 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">{t('tokenomics.wheel.prizes')}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>1º</span>
                      <span className="text-primary">514,229 UVD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2º</span>
                      <span className="text-primary">317,811 UVD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3º</span>
                      <span className="text-primary">196,418 UVD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4º</span>
                      <span className="text-primary">121,393 UVD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Fund Section */}
            <div className="bg-background-secondary rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                {t('tokenomics.savings.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.allocation')}</span>
                  <span className="text-text-primary font-semibold">427,812,730.32 UVD (20%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.savings.monthly')}</span>
                  <span className="text-text-primary">~23,767,374 UVD</span>
                </div>
                <div className="mt-4 p-3 bg-background/30 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">{t('tokenomics.savings.uses')}</p>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• {t('tokenomics.savings.use1')}</li>
                    <li>• {t('tokenomics.savings.use2')}</li>
                    <li>• {t('tokenomics.savings.use3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ultra Event 2025 */}
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                {t('tokenomics.event.title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-text-secondary">{t('tokenomics.event.allocation')}</span>
                    <span className="text-text-primary font-semibold">55,000,000 UVD</span>
                  </div>
                  <p className="text-sm text-text-secondary">{t('tokenomics.event.description')}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4">
                  <p className="text-sm text-text-secondary mb-2">{t('tokenomics.event.source')}</p>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• {t('tokenomics.event.july')}: ~23.76M UVD</li>
                    <li>• {t('tokenomics.event.august')}: ~23.76M UVD</li>
                    <li>• {t('tokenomics.event.complement')}: 7.46M UVD</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Remaining Reserve */}
            <div className="bg-background-secondary rounded-2xl p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                {t('tokenomics.reserve.title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.reserve.amount')}</span>
                  <span className="text-text-primary font-semibold">335,585,590.99 UVD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.reserve.percentage')}</span>
                  <span className="text-text-primary font-semibold">15.69%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">{t('tokenomics.reserve.purpose')}</span>
                  <span className="text-text-primary">{t('tokenomics.reserve.future')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Link */}
          <div className="mt-6 text-center">
            <a
              href="https://snapshot.box/#/s:ultravioletadao.eth/proposal/0xc132335dbab914d230d394b90877679568eb51e859f50b34afaeb0879ddd185e"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
            >
              {t('tokenomics.view_proposal')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default Token;
