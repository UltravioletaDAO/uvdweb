const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function optimizeHeroImage() {
  const inputPath = path.join(PUBLIC_DIR, 'hero-optimized.jpg');

  if (!fs.existsSync(inputPath)) {
    console.log('Hero image not found');
    return;
  }

  try {
    // Create multiple versions
    // 1. WebP version for modern browsers
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(path.join(PUBLIC_DIR, 'hero.webp'));

    // 2. Optimized JPEG
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'cover' })
      .jpeg({
        quality: 75,
        progressive: true,
        mozjpeg: true
      })
      .toFile(path.join(PUBLIC_DIR, 'hero-opt.jpg'));

    // 3. Mobile version (smaller)
    await sharp(inputPath)
      .resize(768, 432, { fit: 'cover' })
      .jpeg({
        quality: 70,
        progressive: true,
        mozjpeg: true
      })
      .toFile(path.join(PUBLIC_DIR, 'hero-mobile.jpg'));

    // 4. Placeholder (blur hash)
    await sharp(inputPath)
      .resize(20, 11, { fit: 'cover' })
      .jpeg({ quality: 20 })
      .toFile(path.join(PUBLIC_DIR, 'hero-placeholder.jpg'));

    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(path.join(PUBLIC_DIR, 'hero-opt.jpg')).size;
    const webpSize = fs.statSync(path.join(PUBLIC_DIR, 'hero.webp')).size;

    console.log(`Hero image optimization complete:
    Original: ${(originalSize / 1024).toFixed(2)}KB
    Optimized JPEG: ${(optimizedSize / 1024).toFixed(2)}KB (${((1 - optimizedSize/originalSize) * 100).toFixed(1)}% reduction)
    WebP: ${(webpSize / 1024).toFixed(2)}KB (${((1 - webpSize/originalSize) * 100).toFixed(1)}% reduction)`);

  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeHeroImage();