const wrapWithXMLHeader = (content) => `<?xml version="1.0" encoding="UTF-8"?>${content}`

/* sitemap-index.xml wraps function */
const wrapWithSitemapIndex = (content) => `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${content}</sitemapindex>`
const wrapWithSitemapAndLoc = (loc) => `<sitemap><loc>${loc}</loc></sitemap>`
const wrapWithSitemapAndLocs = (locs) => locs.reduce((prev, loc) => prev + wrapWithSitemapAndLoc(loc), ``)
const generateSitemapIndexXML = (locs) => wrapWithXMLHeader(wrapWithSitemapIndex(wrapWithSitemapAndLocs(locs)))

/* sitemap-items.xml wraps function */
const wrapWithUrlset = (content) => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${content}</urlset>`
const wrapWithUrl = (content) => `<url>${content}</url>`
const wrapWithLoc = (loc) => `<loc>${loc}</loc>`
const wrapWithXMLLink = (hreflang, href, rel = `alternate`) => `<xhtml:link rel="${rel}" hreflang="${hreflang}" href="${href}" />`

module.exports = {
  wrapWithXMLHeader,
  wrapWithSitemapIndex,
  wrapWithSitemapAndLoc,
  wrapWithSitemapAndLocs,
  generateSitemapIndexXML,
  wrapWithUrlset,
  wrapWithUrl,
  wrapWithLoc,
  wrapWithXMLLink
}
