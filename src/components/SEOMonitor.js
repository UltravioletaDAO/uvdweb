// SEO Monitor Component - Real-time SEO score tracking and optimization
// For UltraVioleta DAO - Web3/AI/Streaming SEO Excellence

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const SEOMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const [seoScore, setSeoScore] = useState(0);
  const [issues, setIssues] = useState([]);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const analyzePage = () => {
      const newIssues = [];
      let score = 100;

      // Check title tag
      const title = document.querySelector('title');
      if (!title || !title.innerText) {
        newIssues.push({ type: 'critical', message: 'Missing title tag' });
        score -= 20;
      } else if (title.innerText.length > 60) {
        newIssues.push({ type: 'warning', message: `Title too long: ${title.innerText.length} chars (max 60)` });
        score -= 5;
      } else if (title.innerText.length < 30) {
        newIssues.push({ type: 'warning', message: `Title too short: ${title.innerText.length} chars (min 30)` });
        score -= 5;
      }

      // Check meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc || !metaDesc.content) {
        newIssues.push({ type: 'critical', message: 'Missing meta description' });
        score -= 15;
      } else if (metaDesc.content.length > 160) {
        newIssues.push({ type: 'warning', message: `Description too long: ${metaDesc.content.length} chars (max 160)` });
        score -= 5;
      } else if (metaDesc.content.length < 120) {
        newIssues.push({ type: 'warning', message: `Description too short: ${metaDesc.content.length} chars (min 120)` });
        score -= 5;
      }

      // Check H1 tags
      const h1Tags = document.querySelectorAll('h1');
      if (h1Tags.length === 0) {
        newIssues.push({ type: 'critical', message: 'Missing H1 tag' });
        score -= 15;
      } else if (h1Tags.length > 1) {
        newIssues.push({ type: 'warning', message: `Multiple H1 tags found: ${h1Tags.length}` });
        score -= 10;
      }

      // Check heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let prevLevel = 0;
      let hierarchyBroken = false;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (level - prevLevel > 1 && prevLevel !== 0) {
          hierarchyBroken = true;
        }
        prevLevel = level;
      });
      if (hierarchyBroken) {
        newIssues.push({ type: 'warning', message: 'Broken heading hierarchy detected' });
        score -= 5;
      }

      // Check images for alt text
      const images = document.querySelectorAll('img');
      let missingAlt = 0;
      images.forEach(img => {
        if (!img.alt || img.alt.trim() === '') {
          missingAlt++;
        }
      });
      if (missingAlt > 0) {
        newIssues.push({ type: 'high', message: `${missingAlt} images missing alt text` });
        score -= (missingAlt * 2);
      }

      // Check for Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');

      if (!ogTitle) {
        newIssues.push({ type: 'medium', message: 'Missing Open Graph title' });
        score -= 5;
      }
      if (!ogDesc) {
        newIssues.push({ type: 'medium', message: 'Missing Open Graph description' });
        score -= 5;
      }
      if (!ogImage) {
        newIssues.push({ type: 'medium', message: 'Missing Open Graph image' });
        score -= 5;
      }

      // Check for Twitter Card tags
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        newIssues.push({ type: 'low', message: 'Missing Twitter Card tags' });
        score -= 3;
      }

      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        newIssues.push({ type: 'medium', message: 'Missing canonical URL' });
        score -= 5;
      }

      // Check for schema.org structured data
      const schemas = document.querySelectorAll('script[type="application/ld+json"]');
      if (schemas.length === 0) {
        newIssues.push({ type: 'high', message: 'Missing structured data (Schema.org)' });
        score -= 10;
      }

      // Check meta keywords (optional but good for Web3/crypto)
      const keywords = document.querySelector('meta[name="keywords"]');
      if (!keywords || !keywords.content) {
        newIssues.push({ type: 'low', message: 'Missing meta keywords' });
        score -= 2;
      }

      // Check viewport meta
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        newIssues.push({ type: 'critical', message: 'Missing viewport meta tag' });
        score -= 10;
      }

      // Check for lang attribute
      if (!document.documentElement.lang) {
        newIssues.push({ type: 'high', message: 'Missing lang attribute on html element' });
        score -= 5;
      }

      // Check for ARIA landmarks
      const main = document.querySelector('main, [role="main"]');
      const nav = document.querySelector('nav, [role="navigation"]');
      if (!main) {
        newIssues.push({ type: 'medium', message: 'Missing main landmark' });
        score -= 3;
      }
      if (!nav) {
        newIssues.push({ type: 'low', message: 'Missing navigation landmark' });
        score -= 2;
      }

      // Check for broken links (simplified check)
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        const target = link.getAttribute('href');
        if (target && target !== '#' && !document.querySelector(target)) {
          newIssues.push({ type: 'low', message: `Broken anchor link: ${target}` });
          score -= 1;
        }
      });

      // Ensure score doesn't go below 0
      score = Math.max(0, score);

      setSeoScore(score);
      setIssues(newIssues);
    };

    // Initial analysis
    analyzePage();
    setMonitoring(true);

    // Set up MutationObserver to detect DOM changes
    const observer = new MutationObserver(() => {
      analyzePage();
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      setMonitoring(false);
    };
  }, [enabled]);

  if (!enabled || !monitoring) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // Green
    if (score >= 70) return '#f59e0b'; // Yellow
    if (score >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'warning': return '⚡';
      case 'low': return '💡';
      default: return '📝';
    }
  };

  return (
    <>
      <Helmet>
        <meta name="seo-score" content={seoScore.toString()} />
      </Helmet>

      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(10, 10, 27, 0.95)',
        border: '1px solid rgba(106, 0, 255, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        width: '320px',
        maxHeight: '400px',
        overflow: 'auto',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(106, 0, 255, 0.2)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(106, 0, 255, 0.2)',
          paddingBottom: '12px'
        }}>
          <h3 style={{
            margin: 0,
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            SEO Monitor
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              color: '#888',
              fontSize: '12px'
            }}>Score:</span>
            <span style={{
              color: getScoreColor(seoScore),
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {seoScore}/100
            </span>
          </div>
        </div>

        {issues.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              color: '#888',
              fontSize: '12px',
              marginBottom: '4px'
            }}>
              Issues Found: {issues.length}
            </div>
            {issues.slice(0, 10).map((issue, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span>{getIssueIcon(issue.type)}</span>
                <span style={{
                  color: '#ccc',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {issue.message}
                </span>
              </div>
            ))}
            {issues.length > 10 && (
              <div style={{
                color: '#888',
                fontSize: '11px',
                textAlign: 'center',
                marginTop: '4px'
              }}>
                +{issues.length - 10} more issues
              </div>
            )}
          </div>
        ) : (
          <div style={{
            color: '#10b981',
            textAlign: 'center',
            padding: '20px'
          }}>
            ✅ Perfect SEO! No issues found.
          </div>
        )}

        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(106, 0, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            color: '#666',
            fontSize: '10px'
          }}>
            Real-time monitoring
          </span>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'pulse 2s infinite'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default SEOMonitor;