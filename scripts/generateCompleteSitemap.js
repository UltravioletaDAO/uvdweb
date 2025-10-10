const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ultravioleta.xyz';
const LANGUAGES = ['es', 'en', 'pt', 'fr'];
const DEFAULT_LANG = 'en';

// Complete list of all routes including new ones
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/about', priority: 0.9, changefreq: 'weekly' },
  { path: '/aplicar', priority: 0.9, changefreq: 'weekly' },
  { path: '/metrics', priority: 0.9, changefreq: 'daily' },
  { path: '/token', priority: 0.8, changefreq: 'daily' },
  { path: '/snapshot', priority: 0.8, changefreq: 'daily' },
  { path: '/contributors', priority: 0.7, changefreq: 'weekly' },
  { path: '/courses', priority: 0.7, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'daily' },
  { path: '/links', priority: 0.6, changefreq: 'monthly' },
  { path: '/safestats', priority: 0.7, changefreq: 'daily' },
  { path: '/wheel', priority: 0.6, changefreq: 'weekly' },
  { path: '/events', priority: 0.8, changefreq: 'weekly' },
  { path: '/services', priority: 0.8, changefreq: 'monthly' },
  { path: '/stream-summaries', priority: 0.9, changefreq: 'daily' }, // NEW - High priority for fresh content
  { path: '/nfts', priority: 0.7, changefreq: 'weekly' }, // NEW
];

// Routes that should NOT be included in sitemap
const excludedRoutes = [
  '/status',
  '/twitch-callback',
  '/purge',
  '/delegations'
];

function generateAlternateLinks(path) {
  return LANGUAGES.map(lang => {
    const langPath = lang === DEFAULT_LANG ? path : `/${lang}${path}`;
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}${langPath}"/>`;
  }).join('\n');
}

function generateImageTags(path) {
  const images = [];

  if (path === '/') {
    images.push(
      '    <image:image>',
      '      <image:loc>https://ultravioleta.xyz/logo.png</image:loc>',
      '      <image:title>UltraVioleta DAO Logo</image:title>',
      '      <image:caption>Official logo of UltraVioleta DAO - Leading Web3 DAO in Latin America</image:caption>',
      '    </image:image>',
      '    <image:image>',
      '      <image:loc>https://ultravioleta.xyz/og-image.png</image:loc>',
      '      <image:title>UltraVioleta DAO</image:title>',
      '      <image:caption>UltraVioleta DAO - Building Web3 in Latin America</image:caption>',
      '    </image:image>'
    );
  } else if (path === '/token') {
    images.push(
      '    <image:image>',
      '      <image:loc>https://ultravioleta.xyz/uvd.png</image:loc>',
      '      <image:title>UVD Token</image:title>',
      '      <image:caption>UVD Governance Token on Avalanche Blockchain</image:caption>',
      '    </image:image>'
    );
  } else if (path === '/nfts') {
    images.push(
      '    <image:image>',
      '      <image:loc>https://ultravioleta.xyz/images/echoes-nft-collection.jpg</image:loc>',
      '      <image:title>Echoes NFT Collection</image:title>',
      '      <image:caption>80 unique NFTs with 2x Chat-to-Earn rewards</image:caption>',
      '    </image:image>'
    );
  } else if (path === '/services') {
    images.push(
      '    <image:image>',
      '      <image:loc>https://ultravioleta.xyz/images/karma-hello-dashboard.jpg</image:loc>',
      '      <image:title>Karma Hello Chat-to-Earn</image:title>',
      '      <image:caption>Revolutionary AI-powered chat rewards system</image:caption>',
      '    </image:image>',
      '    <image:image>',
      '      <image:loc>https://ultravioleta.xyz/images/abracadabra-dashboard.jpg</image:loc>',
      '      <image:title>Abracadabra Stream Intelligence</image:title>',
      '      <image:caption>AI-powered stream content analysis platform</image:caption>',
      '    </image:image>'
    );
  }

  return images.length > 0 ? '\n' + images.join('\n') : '';
}

function generateSitemap() {
  const today = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Generate URLs for each route and language combination
  staticRoutes.forEach(route => {
    // For each language, create a URL entry
    LANGUAGES.forEach(lang => {
      const langPath = lang === DEFAULT_LANG ? route.path : `/${lang}${route.path}`;

      sitemap += `  <url>
    <loc>${SITE_URL}${langPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${generateAlternateLinks(route.path)}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${route.path}"/>${generateImageTags(route.path)}
  </url>
`;
    });
  });

  // Add dynamic blog posts if they exist
  const blogDataPath = path.join(__dirname, '../src/data/blog-posts.json');
  if (fs.existsSync(blogDataPath)) {
    try {
      const blogPosts = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));
      blogPosts.forEach(post => {
        LANGUAGES.forEach(lang => {
          const langPath = lang === DEFAULT_LANG ? `/blog/${post.slug}` : `/${lang}/blog/${post.slug}`;

          sitemap += `  <url>
    <loc>${SITE_URL}${langPath}</loc>
    <lastmod>${post.updatedAt || post.publishedAt || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
${generateAlternateLinks(`/blog/${post.slug}`)}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/${post.slug}"/>
  </url>
`;
        });
      });
    } catch (error) {
      console.error('Error reading blog posts:', error);
    }
  }

  sitemap += `</urlset>`;

  // Write main sitemap
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✓ Main sitemap generated successfully at ${sitemapPath}`);

  // Generate sitemap index
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-images.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  const indexPath = path.join(__dirname, '../public/sitemap-index.xml');
  fs.writeFileSync(indexPath, sitemapIndex);
  console.log(`✓ Sitemap index generated at ${indexPath}`);

  // Generate image sitemap
  const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <image:image>
      <image:loc>${SITE_URL}/logo.png</image:loc>
      <image:title>UltraVioleta DAO Logo</image:title>
      <image:caption>Official logo of UltraVioleta DAO</image:caption>
    </image:image>
    <image:image>
      <image:loc>${SITE_URL}/og-image.png</image:loc>
      <image:title>UltraVioleta DAO Social</image:title>
      <image:caption>UltraVioleta DAO social media preview</image:caption>
    </image:image>
    <image:image>
      <image:loc>${SITE_URL}/uvd.png</image:loc>
      <image:title>UVD Token Logo</image:title>
      <image:caption>UVD governance token logo</image:caption>
    </image:image>
  </url>
</urlset>`;

  const imageSitemapPath = path.join(__dirname, '../public/sitemap-images.xml');
  fs.writeFileSync(imageSitemapPath, imageSitemap);
  console.log(`✓ Image sitemap generated at ${imageSitemapPath}`);

  // Report statistics
  const totalUrls = staticRoutes.length * LANGUAGES.length;
  console.log(`\n📊 Sitemap Statistics:`);
  console.log(`   - Total URLs: ${totalUrls}`);
  console.log(`   - Routes: ${staticRoutes.length}`);
  console.log(`   - Languages: ${LANGUAGES.length} (${LANGUAGES.join(', ')})`);
  console.log(`   - Excluded routes: ${excludedRoutes.join(', ')}`);
}

// Run the generator
generateSitemap();

module.exports = generateSitemap;