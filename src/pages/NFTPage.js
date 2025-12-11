import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SEOEnhanced from '../components/SEOEnhanced';
import OptimizedNFTCard from '../components/OptimizedNFTCard';
import { useNFTCache } from '../hooks/useNFTCache';
import { Sparkles, Crown, Ticket, ShoppingBag, ExternalLink } from 'lucide-react';

const NFTPage = () => {
  const { t } = useTranslation();
  const [echoesNFTs, setEchoesNFTs] = useState([]);
  const [selectedCollection] = useState('echoes');
  const [loading, setLoading] = useState(true);
  const { getCachedUrl, preloadImages, markAsLoaded } = useNFTCache();

  // Register service worker for offline caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/nft-cache-sw.js')
        .then(registration => {
          console.log('NFT Cache Service Worker registered:', registration);
        })
        .catch(error => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }, []);

  const collections = {
    echoes: {
      name: 'Echoes by Ultravioleta DAO',
      description: t('nft.echoes.description'),
      totalSupply: 89,
      chain: 'Avalanche',
      contract: '0x6d08557830959b3441d269145b32dab93206b3d2',
      marketplaceUrl: 'https://magiceden.us/collections/avalanche/echoes-by-ultravioleta-dao-806754961',
    }
  };

  useEffect(() => {
    const loadEchoesMetadata = async () => {
      setLoading(true);
      try {
        const metadataPromises = [];

        for (let i = 0; i <= 88; i++) {
          metadataPromises.push(
            fetch(`/echoes/metadata/${i}.json`)
              .then(res => res.json())
              .then(data => ({ id: i, collectionNumber: i + 1, ...data }))
              .catch(() => null)
          );
        }

        const results = await Promise.all(metadataPromises);
        const validNFTs = results.filter(nft => nft !== null);
        setEchoesNFTs(validNFTs);
      } catch (error) {
        console.error('Error loading NFT metadata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCollection === 'echoes') {
      loadEchoesMetadata();
    }
  }, [selectedCollection]);

  // Use a faster IPFS gateway
  const convertIPFSToGateway = (ipfsUrl) => {
    if (!ipfsUrl) return '';
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      // Use Cloudflare or Pinata for better speed/reliability
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55];

  // Preload adjacent NFTs for smoother scrolling
  useEffect(() => {
    if (echoesNFTs.length > 0 && !loading) {
      const visibleRange = 12; // Preload first 12 NFTs
      const preloadUrls = echoesNFTs
        .slice(0, visibleRange)
        .flatMap(nft => [
          convertIPFSToGateway(nft.image),
          nft.animation_url ? convertIPFSToGateway(nft.animation_url) : null
        ])
        .filter(Boolean);

      preloadImages(preloadUrls);
    }
  }, [echoesNFTs, loading, preloadImages]);

  const handleNFTLoad = useCallback((nftId) => {
    markAsLoaded(nftId);
  }, [markAsLoaded]);

  // Use memoized NFT rendering for performance
  const renderNFTCard = useCallback((nft, index) => {
    const isFibonacci = fibonacciNumbers.includes(nft.collectionNumber);
    const isReserved = nft.collectionNumber > 55;
    const isPriority = index < 8; // First 8 NFTs load immediately

    // Inject the robust IPFS gateway converter into the NFT object or handle it in the card
    // Since OptimizedNFTCard expects urls, we might need to patch it or pass the converter?
    // Looking at OptimizedNFTCard usage, it takes 'nft' prop.
    // We should probably mutate the NFT object here to have resolved URLs or ensure the component handles it.
    // Let's create a resolved version.
    const resolvedNFT = {
      ...nft,
      image: convertIPFSToGateway(nft.image),
      animation_url: convertIPFSToGateway(nft.animation_url)
    };

    return (
      <OptimizedNFTCard
        key={nft.id}
        nft={resolvedNFT}
        isFibonacci={isFibonacci}
        isReserved={isReserved}
        getCachedUrl={getCachedUrl}
        onLoad={handleNFTLoad}
        priority={isPriority}
      />
    );
  }, [getCachedUrl, handleNFTLoad, fibonacciNumbers]);

  return (
    <>
      <SEOEnhanced
        title={`NFT Collections - ${t('site.name')}`}
        description={t('nft.meta.description')}
        keywords="NFT, Echoes, Ultravioleta DAO, Avalanche, Digital Art, Web3, Collectibles"
        path="/nfts"
      />

      <div className="min-h-screen bg-background pt-28 pb-20">
        {/* Decorative Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ultraviolet/10 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
              {t('nft.title')}
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t('nft.subtitle')}
            </p>
          </motion.div>

          {selectedCollection && (
            <motion.div
              key={selectedCollection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Collection Header Card */}
              <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-ultraviolet/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{collections[selectedCollection].name}</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">{collections[selectedCollection].description}</p>
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={collections[selectedCollection].marketplaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all hover:border-ultraviolet/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-sm"
                  >
                    {t('nft.viewOnMarketplace')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </motion.a>
                </div>
              </div>

              {selectedCollection === 'echoes' && (
                <div className="grid gap-6 md:grid-cols-12">
                  {/* Superpowers Panel */}
                  <div className="md:col-span-8 glass-card p-6 border-ultraviolet/20">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="text-yellow-400 w-5 h-5" />
                      <h3 className="text-lg font-bold text-white tracking-wide uppercase">
                        {t('nft.echoes.superpowers.title')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { icon: "💰", title: "3-Month Airdrop", subtitle: "$UVD Rewards" },
                        { icon: "🎟️", title: "Priority WL", subtitle: "\"The Order\"" },
                        { icon: "🎪", title: "Free Event", subtitle: "Aug 24, 2025" },
                        { icon: "🛍️", title: "13% OFF", subtitle: "Merch" }
                      ].map((power, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-ultraviolet/30 transition-all hover:-translate-y-1">
                          <div className="text-2xl mb-2">{power.icon}</div>
                          <div className="font-bold text-white text-sm">{power.title}</div>
                          <div className="text-xs text-gray-400">{power.subtitle}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center">
                      <span className="font-bold text-yellow-200 text-sm">
                        🌟 Fibonacci NFTs (2X Rewards): #1, #2, #3, #5, #8, #13, #21, #34, #55
                      </span>
                    </div>
                  </div>

                  {/* Treasury Panel */}
                  <div className="md:col-span-4 glass-card p-6 flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/5 rounded-xl">
                        <Crown className="w-6 h-6 text-ultraviolet" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          {t('nft.echoes.treasury.title')}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {t('nft.echoes.treasury.description')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 text-xs text-center text-gray-500 font-mono bg-black/20 p-2 rounded-lg">
                      Range: #56 - #89
                    </div>
                  </div>
                </div>
              )}

              {selectedCollection === 'echoes' && (
                <>
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-ultraviolet/20 border-t-ultraviolet rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-mono text-ultraviolet">NFT</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {echoesNFTs.map((nft, index) => renderNFTCard(nft, index))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default NFTPage;