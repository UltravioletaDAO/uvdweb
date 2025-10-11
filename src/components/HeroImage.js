import React, { useState, useEffect } from 'react';

const HeroImage = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    // Check if browser supports WebP
    const checkWebPSupport = () => {
      return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = function () {
          resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    };

    // Load appropriate image based on screen size and WebP support
    const loadImage = async () => {
      const isDesktop = window.innerWidth > 768;
      const supportsWebP = await checkWebPSupport();

      let src;
      if (isDesktop && supportsWebP) {
        src = '/hero.webp';
      } else if (isDesktop) {
        src = '/hero-opt.jpg';
      } else {
        src = '/hero-mobile.jpg';
      }

      // Preload the image
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        // Small delay to ensure smooth transition
        requestAnimationFrame(() => {
          setImageLoaded(true);
        });
      };
      img.src = src;
    };

    // Start loading after React hydrates
    requestAnimationFrame(() => {
      loadImage();
    });
  }, []);

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

      {/* Actual hero image with fade-in */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt="UltraVioleta DAO Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </>
  );
};

export default HeroImage;