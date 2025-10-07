<?xml version="1.0" encoding="UTF-8"?>
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
</xsl:stylesheet>