import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PerformanceOptimizer = () => {
  const location = useLocation();

  useEffect(() => {
    // Implement lazy loading for images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          }
        });
      });

      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => imageObserver.observe(img));

      return () => {
        images.forEach(img => imageObserver.unobserve(img));
      };
    }
  }, [location]);

  useEffect(() => {
    // Preconnect to critical third-party origins
    const preconnectLinks = [
      'https://hub.snapshot.org',
      'https://api.coingecko.com',
      'https://safe-transaction-avalanche.safe.global',
      'https://api.avax.network',
      'https://cloudflare-eth.com'
    ];

    preconnectLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Implement resource hints for better performance
    const dnsPrefetchLinks = [
      'https://api.ultravioletadao.xyz',
      'https://arena.exchange',
      'https://joepegs.com'
    ];

    dnsPrefetchLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // Prefetch critical resources
    const prefetchResources = [
      '/api/metrics',
      '/api/snapshot',
      '/api/token'
    ];

    prefetchResources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    // Implement service worker for offline support and caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('SW registered:', registration);
          })
          .catch(error => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.error('LCP observer error:', e);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-input') {
              console.log('FID:', entry.processingStart - entry.startTime);
              break;
            }
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.error('FID observer error:', e);
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      let clsEntries = [];

      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = clsEntries[0];
              const lastSessionEntry = clsEntries[clsEntries.length - 1];

              if (entry.startTime - lastSessionEntry?.startTime < 1000 &&
                  entry.startTime - firstSessionEntry?.startTime < 5000) {
                clsEntries.push(entry);
                clsValue += entry.value;
              } else {
                clsEntries = [entry];
                clsValue = entry.value;
              }
            }
          }
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('CLS observer error:', e);
      }
    }
  }, []);

  // Request idle callback for non-critical tasks
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Load non-critical resources
        const nonCriticalResources = [
          { rel: 'stylesheet', href: '/styles/animations.css' },
          { rel: 'stylesheet', href: '/styles/fonts.css' }
        ];

        nonCriticalResources.forEach(resource => {
          const link = document.createElement('link');
          Object.keys(resource).forEach(key => {
            link[key] = resource[key];
          });
          document.head.appendChild(link);
        });
      });
    }
  }, []);

  return null;
};

export default PerformanceOptimizer;