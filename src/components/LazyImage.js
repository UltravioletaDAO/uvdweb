import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({
  src,
  alt,
  placeholder = '/tokenPlaceholder.svg',
  className = '',
  width,
  height,
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Use Intersection Observer for truly lazy loading
  useEffect(() => {
    let observer;

    if (imgRef.current && loading === 'lazy') {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before the image enters viewport
          threshold: 0.01
        }
      );

      observer.observe(imgRef.current);
    } else {
      // If not lazy loading, load immediately
      setIsInView(true);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [loading]);

  // Load the actual image when in view
  useEffect(() => {
    if (isInView && src) {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        if (onLoad) onLoad();
      };

      img.onerror = () => {
        setImageSrc(placeholder);
        if (onError) onError();
      };

      img.src = src;
      setImageRef(img);
    }
  }, [isInView, src, placeholder, onLoad, onError]);

  return (
    <div className={`lazy-image-container ${className}`} style={{ position: 'relative' }}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding={decoding}
        className={`lazy-image ${isLoaded ? 'lazy-image-loaded' : 'lazy-image-loading'} ${className}`}
        style={{
          transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0.8,
          filter: isLoaded ? 'blur(0)' : 'blur(2px)',
        }}
        {...props}
      />
      {!isLoaded && (
        <div
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #1a1a2e 0%, #2a2a3e 50%, #1a1a2e 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      )}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LazyImage;