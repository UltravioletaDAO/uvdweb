import React, { useState, useEffect } from 'react';
import { PlayCircle, ExternalLink, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const VideoGallery = ({ videos = [] }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loadedThumbnails, setLoadedThumbnails] = useState(new Set());

  // Default tutorial videos with VideoObject schema data
  const defaultVideos = [
    {
      id: 'karma-tutorial-1',
      title: 'How to Start Earning with Karma Hello - Complete Guide',
      description: 'Step-by-step tutorial on setting up Karma Hello Chat-to-Earn system',
      youtubeId: 'DEMO_VIDEO_ID_1',
      duration: 'PT5M30S',
      durationDisplay: '5:30',
      views: '15,234',
      uploadDate: '2024-09-01',
      category: 'Tutorial'
    },
    {
      id: 'abracadabra-demo-1',
      title: 'Abracadabra Semantic Search Demo - Find Any Stream Content',
      description: 'Live demonstration of Abracadabra\'s powerful semantic search capabilities',
      youtubeId: 'DEMO_VIDEO_ID_2',
      duration: 'PT8M15S',
      durationDisplay: '8:15',
      views: '8,421',
      uploadDate: '2024-08-15',
      category: 'Demo'
    },
    {
      id: 'web3-intro-1',
      title: 'Introduction to Web3 and DAOs - Latin America Edition',
      description: 'Comprehensive introduction to Web3 concepts for the LATAM community',
      youtubeId: 'DEMO_VIDEO_ID_3',
      duration: 'PT12M45S',
      durationDisplay: '12:45',
      views: '22,156',
      uploadDate: '2024-07-20',
      category: 'Education'
    }
  ];

  const videoList = videos.length > 0 ? videos : defaultVideos;

  const getYoutubeThumbnail = (youtubeId) => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  const handleThumbnailLoad = (videoId) => {
    setLoadedThumbnails(prev => new Set(prev).add(videoId));
  };

  // Generate VideoObject schema for each video
  const generateVideoSchema = (video) => {
    return {
      "@type": "VideoObject",
      "@id": `https://ultravioleta.xyz/services#video-${video.id}`,
      "name": video.title,
      "description": video.description,
      "thumbnailUrl": getYoutubeThumbnail(video.youtubeId),
      "uploadDate": video.uploadDate,
      "duration": video.duration,
      "contentUrl": `https://www.youtube.com/watch?v=${video.youtubeId}`,
      "embedUrl": `https://www.youtube.com/embed/${video.youtubeId}`,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": video.views.replace(',', '')
      },
      "publisher": {
        "@type": "Organization",
        "name": "UltraVioleta DAO",
        "logo": {
          "@type": "ImageObject",
          "url": "https://ultravioleta.xyz/logo.png"
        }
      }
    };
  };

  // Inject schema into head
  useEffect(() => {
    const schemas = videoList.map(video => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(generateVideoSchema(video));
      document.head.appendChild(script);
      return script;
    });

    return () => {
      schemas.forEach(script => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      });
    };
  }, [videoList]);

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8 text-purple-400">
        Video Tutorials & Demos
      </h2>
      <p className="text-lg text-gray-300 text-center mb-12 max-w-4xl mx-auto">
        Learn how to use our AI-powered tools with comprehensive video guides
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoList.map((video, index) => (
          <motion.article
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-400/50 transition-all group cursor-pointer"
            onClick={() => setSelectedVideo(video)}
            itemScope
            itemType="https://schema.org/VideoObject"
          >
            <meta itemProp="uploadDate" content={video.uploadDate} />
            <meta itemProp="duration" content={video.duration} />
            <meta itemProp="embedUrl" content={`https://www.youtube.com/embed/${video.youtubeId}`} />

            <div className="aspect-video relative overflow-hidden">
              {/* Lazy loading thumbnail with blur placeholder */}
              <div className={`absolute inset-0 bg-gray-800 ${loadedThumbnails.has(video.id) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                <div className="w-full h-full animate-pulse bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
              </div>

              <img
                src={getYoutubeThumbnail(video.youtubeId)}
                alt={video.title}
                itemProp="thumbnailUrl"
                loading="lazy"
                onLoad={() => handleThumbnailLoad(video.id)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{video.durationDisplay}</span>
              </div>

              {/* Category badge */}
              <div className="absolute top-2 left-2 bg-purple-600/90 px-2 py-1 rounded text-xs text-white">
                {video.category}
              </div>
            </div>

            <div className="p-4">
              <h3 itemProp="name" className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                {video.title}
              </h3>
              <p itemProp="description" className="text-gray-400 text-sm line-clamp-3 mb-3">
                {video.description}
              </p>

              {/* Video stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views} views</span>
                </div>
                <time dateTime={video.uploadDate}>
                  {new Date(video.uploadDate).toLocaleDateString()}
                </time>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full bg-gray-900 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h3>
              <p className="text-gray-400">{selectedVideo.description}</p>
              <div className="flex items-center justify-between mt-4">
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* View All CTA */}
      <div className="text-center mt-8">
        <a
          href="https://www.youtube.com/@UltravioletaDAO"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          View All Videos on YouTube
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </section>
  );
};

export default VideoGallery;