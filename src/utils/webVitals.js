// Core Web Vitals Optimization Utilities
// Implements performance monitoring and optimization for UltraVioleta DAO

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },    // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },    // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 },   // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }     // Time to First Byte
};

// Performance monitoring and reporting
export const initWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS((metric) => reportMetric('CLS', metric, onPerfEntry));
    getFID((metric) => reportMetric('FID', metric, onPerfEntry));
    getFCP((metric) => reportMetric('FCP', metric, onPerfEntry));
    getLCP((metric) => reportMetric('LCP', metric, onPerfEntry));
    getTTFB((metric) => reportMetric('TTFB', metric, onPerfEntry));
  }
};

// Report metrics with categorization
const reportMetric = (name, metric, callback) => {
  const threshold = THRESHOLDS[name];
  let rating = 'good';

  if (threshold) {
    if (metric.value > threshold.needsImprovement) {
      rating = 'poor';
    } else if (metric.value > threshold.good) {
      rating = 'needs-improvement';
    }
  }

  const report = {
    ...metric,
    rating,
    threshold
  };

  // Log to console in development
  if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
    console.log(`[Web Vitals] ${name}:`, {
      value: metric.value,
      rating,
      details: metric
    });
  }

  // Send to analytics if configured
  if (window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
      rating
    });
  }

  callback(report);
};

// Lazy load images with Intersection Observer
export const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
};

// Preload critical resources
export const preloadCriticalAssets = () => {
  const criticalAssets = [
    { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
    { href: '/logo.png', as: 'image' },
    { href: 'https://ultravioleta.xyz/og-image.png', as: 'image' }
  ];

  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset.href;
    link.as = asset.as;
    if (asset.type) link.type = asset.type;
    if (asset.crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Optimize font loading
export const optimizeFontLoading = () => {
  if ('fonts' in document) {
    Promise.all([
      document.fonts.load('400 1em Inter'),
      document.fonts.load('600 1em Inter'),
      document.fonts.load('700 1em Inter')
    ]).then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
};

// Resource hints for faster navigation
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://api.ultravioletadao.xyz' },
    { rel: 'dns-prefetch', href: 'https://hub.snapshot.org' },
    { rel: 'dns-prefetch', href: 'https://safe-client.safe.global' },
    { rel: 'dns-prefetch', href: 'https://api.coingecko.com' },
    { rel: 'preconnect', href: 'https://api.ultravioletadao.xyz' },
    { rel: 'preconnect', href: 'https://hub.snapshot.org' }
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
};

// Defer non-critical CSS
export const deferNonCriticalCSS = () => {
  const nonCriticalStyles = document.querySelectorAll('link[data-defer]');

  nonCriticalStyles.forEach(link => {
    link.media = 'print';
    link.onload = function() {
      this.media = 'all';
    };
  });
};

// Optimize third-party scripts
export const optimizeThirdPartyScripts = () => {
  // Delay non-critical third-party scripts
  const scriptsToDelay = [
    'https://www.googletagmanager.com/gtag/js',
    'https://connect.facebook.net',
    'https://platform.twitter.com'
  ];

  window.addEventListener('load', () => {
    setTimeout(() => {
      scriptsToDelay.forEach(src => {
        const scripts = document.querySelectorAll(`script[src*="${src}"]`);
        scripts.forEach(script => {
          if (!script.loaded) {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.async = true;
            document.body.appendChild(newScript);
            script.loaded = true;
          }
        });
      });
    }, 3000); // Delay by 3 seconds after page load
  });
};

// Monitor long tasks
export const monitorLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            if (process.env.REACT_APP_DEBUG_ENABLED === 'true') {
              console.warn('[Long Task Detected]', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // PerformanceObserver not supported for longtask
    }
  }
};

// Implement idle callback for non-critical work
export const scheduleIdleWork = (callback) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    // Fallback to setTimeout
    setTimeout(callback, 1);
  }
};

// Initialize all optimizations
export const initPerformanceOptimizations = () => {
  // Run immediately
  addResourceHints();
  optimizeFontLoading();

  // Run after DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      lazyLoadImages();
      deferNonCriticalCSS();
    });
  } else {
    lazyLoadImages();
    deferNonCriticalCSS();
  }

  // Run after window load
  window.addEventListener('load', () => {
    preloadCriticalAssets();
    optimizeThirdPartyScripts();
    monitorLongTasks();
  });

  // Initialize Web Vitals monitoring
  initWebVitals((metric) => {
    // Custom handling of metrics
    if (metric.rating === 'poor') {
      console.warn(`Poor ${metric.name} score:`, metric.value);
    }
  });
};

// Service Worker registration for offline support and caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.error('SW registration failed:', error);
        });
    });
  }
};

// Export individual optimizers for selective use
export default {
  initWebVitals,
  initPerformanceOptimizations,
  lazyLoadImages,
  preloadCriticalAssets,
  optimizeFontLoading,
  addResourceHints,
  deferNonCriticalCSS,
  optimizeThirdPartyScripts,
  monitorLongTasks,
  scheduleIdleWork,
  registerServiceWorker,
  THRESHOLDS
};