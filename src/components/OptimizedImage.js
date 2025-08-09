import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  placeholderSrc,
  effect = 'blur',
  threshold = 100,
  ...props 
}) => {
  // Ensure alt text is always provided for SEO and accessibility
  const altText = alt || 'UltraVioleta DAO image';
  
  // Generate placeholder if not provided
  const placeholder = placeholderSrc || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 400} ${height || 300}'%3E%3Crect fill='%236A00FF' opacity='0.1' width='100%25' height='100%25'/%3E%3C/svg%3E`;

  return (
    <LazyLoadImage
      src={src}
      alt={altText}
      className={className}
      width={width}
      height={height}
      effect={effect}
      placeholderSrc={placeholder}
      threshold={threshold}
      loading="lazy"
      {...props}
    />
  );
};

export default OptimizedImage;