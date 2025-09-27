import React, { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const OptimizedNFTCard = memo(({
  nft,
  isFibonacci,
  isReserved,
  getCachedUrl,
  onLoad,
  priority = false
}) => {
  const [videoError, setVideoError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const videoRef = useRef(null);

  const { ref, inView } = useInView({
    threshold: 0.01,
    triggerOnce: true,
    rootMargin: '200px',
  });

  const isVideo = nft.animation_url && !videoError;

  // Convert IPFS URLs to gateway URLs
  const convertIPFSToGateway = (ipfsUrl) => {
    if (!ipfsUrl) return '';
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      // Use multiple gateways for redundancy
      const gateways = [
        `https://ipfs.io/ipfs/${hash}`,
        `https://gateway.pinata.cloud/ipfs/${hash}`,
        `https://cloudflare-ipfs.com/ipfs/${hash}`
      ];
      return gateways[0]; // Primary gateway
    }
    return ipfsUrl;
  };

  // Load media URLs when in view or priority
  useEffect(() => {
    if (inView || priority) {
      const loadMedia = async () => {
        const originalMediaUrl = convertIPFSToGateway(isVideo ? nft.animation_url : nft.image);
        const originalThumbUrl = convertIPFSToGateway(nft.image);

        if (getCachedUrl) {
          const [cachedMedia, cachedThumb] = await Promise.all([
            getCachedUrl(originalMediaUrl),
            getCachedUrl(originalThumbUrl)
          ]);
          setMediaUrl(cachedMedia);
          setThumbnailUrl(cachedThumb);
        } else {
          setMediaUrl(originalMediaUrl);
          setThumbnailUrl(originalThumbUrl);
        }
      };
      loadMedia();
    }
  }, [inView, priority, nft, isVideo, getCachedUrl]);

  // Optimize video playback
  useEffect(() => {
    if (videoRef.current && inView && mediaUrl) {
      const video = videoRef.current;

      // Set up intersection observer for video
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.5 }
      );

      videoObserver.observe(video);

      return () => {
        videoObserver.disconnect();
      };
    }
  }, [inView, mediaUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onLoad) onLoad(nft.id);
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.warn(`Video failed to load for NFT #${nft.collectionNumber}`);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${
        isFibonacci ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
      }`}
      style={isFibonacci ? {
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        padding: '2px'
      } : {}}
    >
      <div className={isFibonacci ? 'bg-white dark:bg-gray-800 rounded-lg overflow-hidden' : ''}>
        <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              <div className="flex items-center justify-center h-full">
                <svg className="w-10 h-10 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
          )}

          {/* Media content */}
          {inView && mediaUrl && (
            <>
              {isVideo ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={thumbnailUrl}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoadedData={handleImageLoad}
                  onError={handleVideoError}
                  loading="lazy"
                >
                  <source src={mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={mediaUrl}
                  alt={`Echo #${nft.collectionNumber}`}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={(e) => {
                    e.target.src = thumbnailUrl || '/placeholder.png';
                  }}
                  loading={priority ? 'eager' : 'lazy'}
                />
              )}
            </>
          )}

          {/* Badges */}
          {isFibonacci && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded text-xs font-bold shadow-lg">
              ⭐ FIBONACCI #{nft.collectionNumber}
            </div>
          )}
          {isReserved && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
              🏛️ TREASURY
            </div>
          )}

          {/* Loading indicator for videos */}
          {isVideo && !imageLoaded && inView && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              Loading video...
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">Echo #{nft.collectionNumber}</h3>
          {isFibonacci && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              className="mb-2 text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 p-2 rounded"
            >
              <span className="font-bold text-yellow-900 dark:text-yellow-100">🌟 2X REWARDS</span>
            </motion.div>
          )}
          {isReserved && (
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Reserved for Community Treasury
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return prevProps.nft.id === nextProps.nft.id &&
         prevProps.priority === nextProps.priority;
});

OptimizedNFTCard.displayName = 'OptimizedNFTCard';

export default OptimizedNFTCard;