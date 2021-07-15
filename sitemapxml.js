"use strict";

var wrapWithXMLHeader = function wrapWithXMLHeader(content) {
  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + content;
};
/* sitemap-index.xml wraps function */


var wrapWithSitemapIndex = function wrapWithSitemapIndex(content) {
  return "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + content + "</sitemapindex>";
};

var wrapWithSitemapAndLoc = function wrapWithSitemapAndLoc(loc) {
  return "<sitemap><loc>" + loc + "</loc></sitemap>";
};

var wrapWithSitemapAndLocs = function wrapWithSitemapAndLocs(locs) {
  return locs.reduce(function (prev, loc) {
    return prev + wrapWithSitemapAndLoc(loc);
  }, "");
};

var generateSitemapIndexXML = function generateSitemapIndexXML(locs) {
  return wrapWithXMLHeader(wrapWithSitemapIndex(wrapWithSitemapAndLocs(locs)));
};
/* sitemap-items.xml wraps function */


var wrapWithUrlset = function wrapWithUrlset(content) {
  return "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">" + content + "</urlset>";
};

var wrapWithUrl = function wrapWithUrl(content) {
  return "<url>" + content + "</url>";
};

var wrapWithLoc = function wrapWithLoc(loc) {
  return "<loc>" + loc + "</loc>";
};

var wrapWithXMLLink = function wrapWithXMLLink(hreflang, href, rel) {
  if (rel === void 0) {
    rel = "alternate";
  }

  return "<xhtml:link rel=\"" + rel + "\" hreflang=\"" + hreflang + "\" href=\"" + href + "\" />";
};

module.exports = {
  wrapWithXMLHeader: wrapWithXMLHeader,
  wrapWithSitemapIndex: wrapWithSitemapIndex,
  wrapWithSitemapAndLoc: wrapWithSitemapAndLoc,
  wrapWithSitemapAndLocs: wrapWithSitemapAndLocs,
  generateSitemapIndexXML: generateSitemapIndexXML,
  wrapWithUrlset: wrapWithUrlset,
  wrapWithUrl: wrapWithUrl,
  wrapWithLoc: wrapWithLoc,
  wrapWithXMLLink: wrapWithXMLLink
};