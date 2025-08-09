// SEO Helper Utilities for UltraVioleta DAO

/**
 * Generate meta tags for social media sharing
 */
export const generateMetaTags = ({
  title = 'UltraVioleta DAO',
  description = 'Building the future of Web3 in Latin America',
  image = 'https://ultravioleta.xyz/og-image.png',
  url = 'https://ultravioleta.xyz',
  type = 'website'
}) => {
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image }
    ]
  };
};

/**
 * Generate breadcrumb schema
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Generate FAQ schema
 */
export const generateFAQSchema = (faqs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Generate Event schema for courses and workshops
 */
export const generateEventSchema = ({
  name,
  description,
  startDate,
  endDate,
  location = 'Online',
  organizer = 'UltraVioleta DAO'
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    endDate,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://ultravioleta.xyz/courses'
    },
    organizer: {
      '@type': 'Organization',
      name: organizer,
      url: 'https://ultravioleta.xyz'
    }
  };
};

/**
 * Generate Article schema for blog posts
 */
export const generateArticleSchema = ({
  title,
  description,
  author = 'UltraVioleta DAO',
  datePublished,
  dateModified,
  image,
  url
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Organization',
      name: author
    },
    datePublished,
    dateModified: dateModified || datePublished,
    image,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    publisher: {
      '@type': 'Organization',
      name: 'UltraVioleta DAO',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ultravioleta.xyz/logo.png'
      }
    }
  };
};

/**
 * Clean and optimize URL for SEO
 */
export const cleanUrl = (url) => {
  return url
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

/**
 * Generate sitemap entry
 */
export const generateSitemapEntry = ({
  url,
  lastmod = new Date().toISOString(),
  changefreq = 'weekly',
  priority = 0.5
}) => {
  return {
    url,
    lastmod,
    changefreq,
    priority
  };
};

/**
 * Extract keywords from text for SEO
 */
export const extractKeywords = (text, maxKeywords = 10) => {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was',
    'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'to', 'of', 'in', 'for', 'with', 'by', 'from', 'about', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)
    .join(', ');
};

/**
 * Generate hreflang tags for multi-language support
 */
export const generateHreflangTags = (currentPath, languages = ['es', 'en', 'pt', 'fr']) => {
  const baseUrl = 'https://ultravioleta.xyz';
  return languages.map(lang => ({
    rel: 'alternate',
    hreflang: lang,
    href: `${baseUrl}${currentPath}?lang=${lang}`
  }));
};

/**
 * Validate and optimize meta description length
 */
export const optimizeMetaDescription = (description, maxLength = 160) => {
  if (description.length <= maxLength) {
    return description;
  }
  
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
};

/**
 * Generate Open Graph image URL with dynamic text
 */
export const generateOGImageUrl = ({
  title,
  subtitle,
  theme = 'ultraviolet'
}) => {
  // This could be connected to an OG image generation service
  // For now, return static image
  return 'https://ultravioleta.xyz/og-image.png';
};

export default {
  generateMetaTags,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateEventSchema,
  generateArticleSchema,
  cleanUrl,
  generateSitemapEntry,
  extractKeywords,
  generateHreflangTags,
  optimizeMetaDescription,
  generateOGImageUrl
};