const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://ultravioleta.xyz';
const LANGUAGES = ['es', 'en', 'pt', 'fr'];
const DEFAULT_LANG = 'en';

// Define all routes with their metadata
const routes = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'daily',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/logo.png', title: 'UltraVioleta DAO Logo' },
      { loc: '/og-image.png', title: 'UltraVioleta DAO' }
    ]
  },
  {
    path: '/about',
    priority: 0.9,
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/aplicar',
    priority: 0.9,
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/metrics',
    priority: 0.9,
    changefreq: 'daily',
    lastmod: new Date().toISOString()
  },
  {
    path: '/token',
    priority: 0.8,
    changefreq: 'daily',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/uvd.png', title: 'UVD Token' }
    ]
  },
  {
    path: '/snapshot',
    priority: 0.8,
    changefreq: 'daily',
    lastmod: new Date().toISOString()
  },
  {
    path: '/contributors',
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/courses',
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/blog',
    priority: 0.8,
    changefreq: 'daily',
    lastmod: new Date().toISOString()
  },
  {
    path: '/links',
    priority: 0.6,
    changefreq: 'monthly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/safestats',
    priority: 0.7,
    changefreq: 'daily',
    lastmod: new Date().toISOString()
  },
  {
    path: '/wheel',
    priority: 0.6,
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/events',
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/services',
    priority: 0.8,
    changefreq: 'monthly',
    lastmod: new Date().toISOString()
  }
];

// Blog posts (dynamically loaded if available)
const getBlogPosts = () => {
  try {
    const postsPath = path.join(__dirname, '../src/posts/posts.js');
    if (fs.existsSync(postsPath)) {
      // Read the file content to extract blog posts
      const content = fs.readFileSync(postsPath, 'utf-8');
      const postMatches = content.match(/slug:\s*["']([^"']+)["']/g);
      if (postMatches) {
        return postMatches.map(match => {
          const slug = match.match(/slug:\s*["']([^"']+)["']/)[1];
          return {
            path: `/blog/${slug}`,
            priority: 0.7,
            changefreq: 'monthly',
            lastmod: new Date().toISOString()
          };
        });
      }
    }
  } catch (error) {
    console.error('Error reading blog posts:', error);
  }
  return [];
};

// Generate main sitemap
const generateMainSitemap = () => {
  const allRoutes = [...routes, ...getBlogPosts()];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
  xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  allRoutes.forEach(route => {
    // For each route, generate entries for all languages
    LANGUAGES.forEach(lang => {
      const url = lang === DEFAULT_LANG
        ? `${SITE_URL}${route.path}`
        : `${SITE_URL}/${lang}${route.path}`;

      xml += '  <url>\n';
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;

      // Add hreflang links
      LANGUAGES.forEach(altLang => {
        const altUrl = altLang === DEFAULT_LANG
          ? `${SITE_URL}${route.path}`
          : `${SITE_URL}/${altLang}${route.path}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${route.path}"/>\n`;

      // Add images if present
      if (route.images && lang === DEFAULT_LANG) {
        route.images.forEach(image => {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${SITE_URL}${image.loc}</image:loc>\n`;
          xml += `      <image:title>${image.title}</image:title>\n`;
          xml += '    </image:image>\n';
        });
      }

      xml += '  </url>\n';
    });
  });

  xml += '</urlset>';

  return xml;
};

// Generate blog-specific sitemap
const generateBlogSitemap = () => {
  const blogPosts = getBlogPosts();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

  blogPosts.forEach(post => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${post.path}</loc>\n`;
    xml += `    <lastmod>${post.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${post.changefreq}</changefreq>\n`;
    xml += `    <priority>${post.priority}</priority>\n`;
    xml += '    <news:news>\n';
    xml += '      <news:publication>\n';
    xml += '        <news:name>UltraVioleta DAO Blog</news:name>\n';
    xml += '        <news:language>en</news:language>\n';
    xml += '      </news:publication>\n';
    xml += `      <news:publication_date>${post.lastmod}</news:publication_date>\n`;
    xml += '      <news:title>Blog Post</news:title>\n';
    xml += '    </news:news>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
};

// Generate image sitemap
const generateImageSitemap = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  const images = [
    { page: '/', loc: '/logo.png', title: 'UltraVioleta DAO Logo', caption: 'Official logo of UltraVioleta DAO' },
    { page: '/', loc: '/og-image.png', title: 'UltraVioleta DAO', caption: 'UltraVioleta DAO - Leading Web3 DAO in Latin America' },
    { page: '/token', loc: '/uvd.png', title: 'UVD Token', caption: 'UVD governance token logo' },
    { page: '/', loc: '/logo_uvd.svg', title: 'UVD Logo', caption: 'UVD token vector logo' },
  ];

  const groupedImages = images.reduce((acc, img) => {
    if (!acc[img.page]) acc[img.page] = [];
    acc[img.page].push(img);
    return acc;
  }, {});

  Object.entries(groupedImages).forEach(([page, imgs]) => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${page}</loc>\n`;

    imgs.forEach(img => {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${SITE_URL}${img.loc}</image:loc>\n`;
      xml += `      <image:title>${img.title}</image:title>\n`;
      xml += `      <image:caption>${img.caption}</image:caption>\n`;
      xml += '      <image:geo_location>Latin America</image:geo_location>\n';
      xml += '      <image:license>https://creativecommons.org/licenses/by-sa/4.0/</image:license>\n';
      xml += '    </image:image>\n';
    });

    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
};

// Generate sitemap index
const generateSitemapIndex = () => {
  const sitemaps = [
    { loc: '/sitemap.xml', lastmod: new Date().toISOString() },
    { loc: '/sitemap-blog.xml', lastmod: new Date().toISOString() },
    { loc: '/sitemap-images.xml', lastmod: new Date().toISOString() },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  sitemaps.forEach(sitemap => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${SITE_URL}${sitemap.loc}</loc>\n`;
    xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });

  xml += '</sitemapindex>';

  return xml;
};

// Generate sitemap XSL for better visualization
const generateSitemapXSL = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>UltraVioleta DAO - XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #6A00FF; color: white; }
          tr:hover { background-color: #f5f5f5; }
          .priority { text-align: center; }
          .high { color: #00aa00; font-weight: bold; }
          .medium { color: #ffaa00; }
          .low { color: #aa0000; }
        </style>
      </head>
      <body>
        <h1>UltraVioleta DAO - XML Sitemap</h1>
        <p>This sitemap contains <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.</p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                <td><xsl:value-of select="sitemap:lastmod"/></td>
                <td><xsl:value-of select="sitemap:changefreq"/></td>
                <td class="priority">
                  <xsl:choose>
                    <xsl:when test="sitemap:priority &gt;= 0.8">
                      <span class="high"><xsl:value-of select="sitemap:priority"/></span>
                    </xsl:when>
                    <xsl:when test="sitemap:priority &gt;= 0.5">
                      <span class="medium"><xsl:value-of select="sitemap:priority"/></span>
                    </xsl:when>
                    <xsl:otherwise>
                      <span class="low"><xsl:value-of select="sitemap:priority"/></span>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
};

// Write all sitemaps
const generateSitemaps = () => {
  const publicDir = path.join(__dirname, '../public');

  // Generate and write main sitemap
  const mainSitemap = generateMainSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), mainSitemap);
  console.log('✅ Generated sitemap.xml');

  // Generate and write blog sitemap
  const blogSitemap = generateBlogSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'), blogSitemap);
  console.log('✅ Generated sitemap-blog.xml');

  // Generate and write image sitemap
  const imageSitemap = generateImageSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap-images.xml'), imageSitemap);
  console.log('✅ Generated sitemap-images.xml');

  // Generate and write sitemap index
  const sitemapIndex = generateSitemapIndex();
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex);
  console.log('✅ Generated sitemap-index.xml');

  // Generate and write sitemap XSL
  const sitemapXSL = generateSitemapXSL();
  fs.writeFileSync(path.join(publicDir, 'sitemap.xsl'), sitemapXSL);
  console.log('✅ Generated sitemap.xsl');

  console.log('\n🎉 All sitemaps generated successfully!');
};

// Run the generator
generateSitemaps();