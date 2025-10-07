const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://ultravioleta.xyz';
const LANGUAGES = ['es', 'en', 'pt', 'fr'];
const DEFAULT_LANG = 'en';

// Enhanced routes with more metadata
const routes = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'daily',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/logo.png', title: 'UltraVioleta DAO Logo', caption: 'Official UltraVioleta DAO logo' },
      { loc: '/og-image.png', title: 'UltraVioleta DAO', caption: 'UltraVioleta DAO - Leading Web3 DAO in Latin America' },
      { loc: '/hero-image.jpg', title: 'Hero Image', caption: 'UltraVioleta DAO community' }
    ],
    videos: [
      {
        thumbnail: '/video-thumb.jpg',
        title: 'UltraVioleta DAO Introduction',
        description: 'Learn about UltraVioleta DAO and our mission in Latin America',
        contentLoc: '/videos/intro.mp4',
        duration: 180
      }
    ]
  },
  {
    path: '/about',
    priority: 0.9,
    changefreq: 'weekly',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/team.jpg', title: 'UltraVioleta Team', caption: 'Core contributors of UltraVioleta DAO' }
    ]
  },
  {
    path: '/aplicar',
    priority: 0.9,
    changefreq: 'weekly',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/join-dao.jpg', title: 'Join UltraVioleta DAO', caption: 'Become a member of our DAO' }
    ]
  },
  {
    path: '/metrics',
    priority: 0.9,
    changefreq: 'hourly',
    lastmod: new Date().toISOString(),
    alternateMedia: {
      '@type': 'DataFeed',
      dataFeedElement: {
        '@type': 'DataFeedItem',
        dateModified: new Date().toISOString()
      }
    }
  },
  {
    path: '/token',
    priority: 0.9,
    changefreq: 'daily',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/uvd.png', title: 'UVD Token', caption: 'UVD governance token logo' },
      { loc: '/token-chart.jpg', title: 'UVD Price Chart', caption: 'UVD token price history' }
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
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: new Date().toISOString(),
    videos: [
      {
        thumbnail: '/course-thumb.jpg',
        title: 'Web3 Development Course',
        description: 'Learn blockchain development with UltraVioleta DAO',
        contentLoc: '/videos/course-intro.mp4',
        duration: 300
      }
    ]
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
    changefreq: 'hourly',
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
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/ultra-evento.jpg', title: 'Ultra Evento 2025', caption: 'Web3 Summit in Medellín' }
    ]
  },
  {
    path: '/services',
    priority: 0.9,
    changefreq: 'monthly',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/karma-hello.jpg', title: 'Karma Hello', caption: 'Chat-to-Earn Twitch Bot' },
      { loc: '/abracadabra.jpg', title: 'Abracadabra', caption: 'AI Stream Intelligence Platform' }
    ]
  },
  {
    path: '/nfts',
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: new Date().toISOString(),
    images: [
      { loc: '/echoes-collection.jpg', title: 'Echoes NFT', caption: '80 unique NFT artworks' }
    ]
  }
];

// Blog posts (dynamically loaded if available)
const getBlogPosts = () => {
  try {
    const postsPath = path.join(__dirname, '../src/posts/posts.js');
    if (fs.existsSync(postsPath)) {
      const content = fs.readFileSync(postsPath, 'utf-8');
      const postMatches = content.match(/slug:\s*["']([^"']+)["']/g);
      if (postMatches) {
        return postMatches.map(match => {
          const slug = match.match(/slug:\s*["']([^"']+)["']/)[1];
          return {
            path: `/blog/${slug}`,
            priority: 0.7,
            changefreq: 'monthly',
            lastmod: new Date().toISOString(),
            isArticle: true
          };
        });
      }
    }
  } catch (error) {
    console.error('Error reading blog posts:', error);
  }
  return [];
};

// Generate main sitemap with enhanced features
const generateMainSitemap = () => {
  const allRoutes = [...routes, ...getBlogPosts()];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
  xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
  xml += '        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  allRoutes.forEach(route => {
    // Generate entries for all languages
    LANGUAGES.forEach(lang => {
      const url = lang === DEFAULT_LANG
        ? `${SITE_URL}${route.path}`
        : `${SITE_URL}/${lang}${route.path}`;

      xml += '  <url>\n';
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;

      // Add mobile tag for better mobile indexing
      xml += '    <mobile:mobile/>\n';

      // Add hreflang links for all languages
      LANGUAGES.forEach(altLang => {
        const altUrl = altLang === DEFAULT_LANG
          ? `${SITE_URL}${route.path}`
          : `${SITE_URL}/${altLang}${route.path}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${route.path}"/>\n`;

      // Add images if present (only for default language to avoid duplication)
      if (route.images && lang === DEFAULT_LANG) {
        route.images.forEach(image => {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${SITE_URL}${image.loc}</image:loc>\n`;
          xml += `      <image:title>${image.title}</image:title>\n`;
          if (image.caption) {
            xml += `      <image:caption>${image.caption}</image:caption>\n`;
          }
          xml += `      <image:geo_location>Latin America</image:geo_location>\n`;
          xml += `      <image:license>https://creativecommons.org/licenses/by-sa/4.0/</image:license>\n`;
          xml += '    </image:image>\n';
        });
      }

      // Add videos if present (only for default language)
      if (route.videos && lang === DEFAULT_LANG) {
        route.videos.forEach(video => {
          xml += '    <video:video>\n';
          xml += `      <video:thumbnail_loc>${SITE_URL}${video.thumbnail}</video:thumbnail_loc>\n`;
          xml += `      <video:title>${video.title}</video:title>\n`;
          xml += `      <video:description>${video.description}</video:description>\n`;
          if (video.contentLoc) {
            xml += `      <video:content_loc>${SITE_URL}${video.contentLoc}</video:content_loc>\n`;
          }
          if (video.duration) {
            xml += `      <video:duration>${video.duration}</video:duration>\n`;
          }
          xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
          xml += `      <video:live>no</video:live>\n`;
          xml += '    </video:video>\n';
        });
      }

      xml += '  </url>\n';
    });
  });

  xml += '</urlset>';

  return xml;
};

// Generate news sitemap for blog posts
const generateNewsSitemap = () => {
  const blogPosts = getBlogPosts();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

  blogPosts.forEach(post => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${post.path}</loc>\n`;
    xml += '    <news:news>\n';
    xml += '      <news:publication>\n';
    xml += '        <news:name>UltraVioleta DAO Blog</news:name>\n';
    xml += '        <news:language>en</news:language>\n';
    xml += '      </news:publication>\n';
    xml += `      <news:publication_date>${post.lastmod}</news:publication_date>\n`;
    xml += '      <news:title>Blog Post</news:title>\n';
    xml += '      <news:keywords>Web3, DAO, Blockchain, Latin America</news:keywords>\n';
    xml += '      <news:stock_tickers>UVD</news:stock_tickers>\n';
    xml += '    </news:news>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
};

// Generate video sitemap
const generateVideoSitemap = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

  routes.forEach(route => {
    if (route.videos) {
      route.videos.forEach(video => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}${route.path}</loc>\n`;
        xml += '    <video:video>\n';
        xml += `      <video:thumbnail_loc>${SITE_URL}${video.thumbnail}</video:thumbnail_loc>\n`;
        xml += `      <video:title>${video.title}</video:title>\n`;
        xml += `      <video:description>${video.description}</video:description>\n`;
        if (video.contentLoc) {
          xml += `      <video:content_loc>${SITE_URL}${video.contentLoc}</video:content_loc>\n`;
        }
        xml += `      <video:player_loc>${SITE_URL}/video-player</video:player_loc>\n`;
        xml += `      <video:duration>${video.duration || 0}</video:duration>\n`;
        xml += `      <video:publication_date>${new Date().toISOString()}</video:publication_date>\n`;
        xml += '      <video:family_friendly>yes</video:family_friendly>\n';
        xml += '      <video:requires_subscription>no</video:requires_subscription>\n';
        xml += '      <video:live>no</video:live>\n';
        xml += '      <video:tag>Web3</video:tag>\n';
        xml += '      <video:tag>DAO</video:tag>\n';
        xml += '      <video:tag>Blockchain</video:tag>\n';
        xml += '      <video:category>Technology</video:category>\n';
        xml += '      <video:uploader info="https://ultravioleta.xyz">UltraVioleta DAO</video:uploader>\n';
        xml += '    </video:video>\n';
        xml += '  </url>\n';
      });
    }
  });

  xml += '</urlset>';

  return xml;
};

// Generate image sitemap with enhanced metadata
const generateImageSitemap = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  const images = [
    { page: '/', loc: '/logo.png', title: 'UltraVioleta DAO Logo', caption: 'Official logo of UltraVioleta DAO' },
    { page: '/', loc: '/og-image.png', title: 'UltraVioleta DAO OG Image', caption: 'UltraVioleta DAO - Leading Web3 DAO in Latin America' },
    { page: '/token', loc: '/uvd.png', title: 'UVD Token Logo', caption: 'UVD governance token logo' },
    { page: '/', loc: '/logo_uvd.svg', title: 'UVD Vector Logo', caption: 'UVD token vector logo' },
    { page: '/services', loc: '/karma-hello-dashboard.jpg', title: 'Karma Hello Dashboard', caption: 'Karma Hello Chat-to-Earn bot dashboard' },
    { page: '/services', loc: '/abracadabra-dashboard.jpg', title: 'Abracadabra Dashboard', caption: 'Abracadabra stream intelligence dashboard' },
    { page: '/nfts', loc: '/echoes-collection.jpg', title: 'Echoes NFT Collection', caption: '80 unique NFT artworks with rewards multiplier' },
    { page: '/events', loc: '/ultra-evento.jpg', title: 'Ultra Evento 2025', caption: 'Web3 Summit in Medellín, Colombia' },
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
    { loc: '/sitemap-news.xml', lastmod: new Date().toISOString() },
    { loc: '/sitemap-video.xml', lastmod: new Date().toISOString() },
    { loc: '/sitemap-images.xml', lastmod: new Date().toISOString() },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  sitemaps.forEach(sitemap => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${SITE_URL}${sitemap.loc}</loc>\n`;
    xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n';
    xml += '  </sitemap>\n';
  });

  xml += '</sitemapindex>';

  return xml;
};

// Enhanced sitemap XSL for better visualization
const generateSitemapXSL = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>UltraVioleta DAO - XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          * { margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0033 100%);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(106, 0, 255, 0.05);
            border: 1px solid rgba(106, 0, 255, 0.3);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(106, 0, 255, 0.2);
          }
          h1 {
            color: #fff;
            margin-bottom: 10px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(106, 0, 255, 0.5);
          }
          .subtitle {
            color: #b8b8b8;
            margin-bottom: 30px;
            font-size: 1.1em;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: rgba(106, 0, 255, 0.1);
            border: 1px solid rgba(106, 0, 255, 0.3);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #6a00ff;
          }
          .stat-label {
            color: #888;
            font-size: 0.9em;
            margin-top: 5px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(106, 0, 255, 0.2);
          }
          th {
            background: rgba(106, 0, 255, 0.2);
            color: #fff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
          }
          tr:hover {
            background: rgba(106, 0, 255, 0.05);
          }
          a {
            color: #8b5cf6;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          a:hover {
            color: #a78bfa;
            text-shadow: 0 0 10px rgba(106, 0, 255, 0.5);
          }
          .priority {
            text-align: center;
            font-weight: bold;
          }
          .high {
            color: #10b981;
          }
          .medium {
            color: #f59e0b;
          }
          .low {
            color: #ef4444;
          }
          .changefreq {
            text-align: center;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            display: inline-block;
          }
          .freq-daily {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
          }
          .freq-weekly {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
          }
          .freq-monthly {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
          }
          .freq-hourly {
            background: rgba(139, 92, 246, 0.2);
            color: #8b5cf6;
          }
          .lastmod {
            color: #888;
            font-size: 0.9em;
          }
          .media-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.75em;
            margin-left: 5px;
            background: rgba(106, 0, 255, 0.2);
            color: #a78bfa;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>UltraVioleta DAO - XML Sitemap</h1>
          <p class="subtitle">Web3 DAO Building the Future in Latin America</p>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
              </div>
              <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[image:image])"/>
              </div>
              <div class="stat-label">With Images</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[video:video])"/>
              </div>
              <div class="stat-label">With Videos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">4</div>
              <div class="stat-label">Languages</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Frequency</th>
                <th>Priority</th>
                <th>Media</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:sort select="sitemap:priority" order="descending"/>
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td class="lastmod">
                    <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                  </td>
                  <td style="text-align: center;">
                    <xsl:choose>
                      <xsl:when test="sitemap:changefreq = 'hourly'">
                        <span class="changefreq freq-hourly">Hourly</span>
                      </xsl:when>
                      <xsl:when test="sitemap:changefreq = 'daily'">
                        <span class="changefreq freq-daily">Daily</span>
                      </xsl:when>
                      <xsl:when test="sitemap:changefreq = 'weekly'">
                        <span class="changefreq freq-weekly">Weekly</span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="changefreq freq-monthly">Monthly</span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
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
                  <td>
                    <xsl:if test="image:image">
                      <span class="media-badge">IMG</span>
                    </xsl:if>
                    <xsl:if test="video:video">
                      <span class="media-badge">VID</span>
                    </xsl:if>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
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

  // Generate and write news sitemap
  const newsSitemap = generateNewsSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap-news.xml'), newsSitemap);
  console.log('✅ Generated sitemap-news.xml');

  // Generate and write video sitemap
  const videoSitemap = generateVideoSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap-video.xml'), videoSitemap);
  console.log('✅ Generated sitemap-video.xml');

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

  console.log('\n🎉 All enhanced sitemaps generated successfully!');
  console.log('📊 Total URLs indexed:', routes.length * LANGUAGES.length);
  console.log('🌐 Languages supported:', LANGUAGES.join(', '));
};

// Run the generator
generateSitemaps();