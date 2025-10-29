const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ultravioleta.xyz';
const LANGUAGES = ['es', 'en', 'pt', 'fr'];

const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/facilitator', priority: 0.95, changefreq: 'weekly' }, // x402 Facilitator - high priority for SEO
  { path: '/about', priority: 0.9, changefreq: 'weekly' },
  { path: '/aplicar', priority: 0.9, changefreq: 'monthly' },
  { path: '/services', priority: 0.9, changefreq: 'weekly' }, // Services page with x402
  { path: '/metrics', priority: 0.8, changefreq: 'daily' },
  { path: '/token', priority: 0.8, changefreq: 'weekly' },
  { path: '/snapshot', priority: 0.8, changefreq: 'daily' },
  { path: '/contributors', priority: 0.7, changefreq: 'weekly' },
  { path: '/courses', priority: 0.7, changefreq: 'weekly' },
  { path: '/blog', priority: 0.7, changefreq: 'weekly' },
  { path: '/nfts', priority: 0.7, changefreq: 'weekly' },
  { path: '/events', priority: 0.7, changefreq: 'weekly' },
  { path: '/experiments', priority: 0.6, changefreq: 'weekly' },
  { path: '/links', priority: 0.6, changefreq: 'monthly' },
  { path: '/safestats', priority: 0.6, changefreq: 'daily' },
  { path: '/stream-summaries', priority: 0.6, changefreq: 'weekly' },
  { path: '/wheel', priority: 0.5, changefreq: 'weekly' },
];

function generateAlternateLinks(path) {
  return LANGUAGES.map(lang => 
    `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}${path}?lang=${lang}"/>`
  ).join('\n');
}

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  staticRoutes.forEach(route => {
    sitemap += `  
  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${generateAlternateLinks(route.path)}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${route.path}"/>
  </url>
`;
  });

  // Add dynamic blog posts if they exist
  const blogDataPath = path.join(__dirname, '../src/data/blog-posts.json');
  if (fs.existsSync(blogDataPath)) {
    try {
      const blogPosts = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));
      blogPosts.forEach(post => {
        sitemap += `  
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt || post.publishedAt || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
${generateAlternateLinks(`/blog/${post.slug}`)}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/${post.slug}"/>
  </url>
`;
      });
    } catch (error) {
      console.error('Error reading blog posts:', error);
    }
  }

  sitemap += `</urlset>`;

  // Write sitemap to public directory
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
}

// Run the generator
generateSitemap();

module.exports = generateSitemap;