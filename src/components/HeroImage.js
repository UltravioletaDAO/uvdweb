import React, { useState } from 'react';

// W2-15: the hero is the LCP element. It is rendered directly (no WebP/innerWidth
// detection in an effect, not lazy-loaded) so the browser can start the request
// from the preload scanner. The picture element lets the browser pick WebP/JPEG and the
// desktop/mobile variant without any JS.
const HeroImage = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      {/* Ultra-lightweight placeholder - inline base64 for instant paint */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAA8DASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQGB//EACYQAAIBAwMEAQUAAAAAAAAAAAECAwAEEQUSITFBUWEiBhNxgZH/xAAVAQEBAAAAAAAAAAAAAAAAAAACA//EABcRAQEBAQAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEQMRAD8AJ6FJcLqVxJeW627OxDKGJ+XnnitG70qSO4Zrq9aSIEkRqgG0evNKWmt391C8sliGEYJJSYZAHfGKK01Dlkc//9k=')`,
          filter: 'blur(20px)',
          transform: 'scale(1.1)',
          opacity: imageLoaded ? 0 : 1,
          transition: 'opacity 0.3s ease-out'
        }}
      />

      {/* Actual hero image: eager, high priority (LCP) */}
      <picture>
        <source media="(min-width: 769px)" srcSet="/hero.webp" type="image/webp" />
        <source media="(min-width: 769px)" srcSet="/hero-opt.jpg" />
        <img
          src="/hero-mobile.jpg"
          width="768"
          height="432"
          fetchpriority="high"
          decoding="async"
          alt="UltraVioleta DAO Web3 Latin America blockchain community governance"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onLoad={() => setImageLoaded(true)}
        />
      </picture>
    </>
  );
};

export default HeroImage;
