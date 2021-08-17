import path from "path";
import { pluginOptionsSchema } from "./options-validation";
import fs from "fs";
import { prefixPath, pageFilter, REPORTER_PREFIX } from "./internals";
import {
  generateSitemapIndexXML,
  wrapWithLoc,
  wrapWithUrl,
  wrapWithUrlset,
  wrapWithXMLHeader,
  wrapWithXMLLink,
} from "./sitemapxml";

exports.pluginOptionsSchema = pluginOptionsSchema;

exports.onPostBuild = async (
  { graphql, reporter },
  {
    output,
    query,
    excludes,
    resolveSiteUrl,
    resolvePagePath,
    resolvePages,
    filterPages,
    serialize,
    langs,
    combinedHrefs,
  }
) => {
  const { data: queryRecords, errors } = await graphql(query);

  // resolvePages and resolveSiteUrl are allowed to be sync or async. The Promise.resolve handles each possibility
  const siteUrl = await Promise.resolve(resolveSiteUrl(queryRecords)).catch(
    (err) => reporter.panic(`${REPORTER_PREFIX} Error resolving Site URL`, err)
  );

  if (errors) {
    reporter.panic(
      `Error executing the GraphQL query inside gatsby-plugin-sitemap:\n`,
      errors
    );
  }

  const allPages = await Promise.resolve(resolvePages(queryRecords)).catch(
    (err) => reporter.panic(`${REPORTER_PREFIX} Error resolving Pages`, err)
  );

  if (!Array.isArray(allPages)) {
    reporter.panic(
      `${REPORTER_PREFIX} The \`resolvePages\` function did not return an array.`
    );
  }

  reporter.verbose(
    `${REPORTER_PREFIX} Filtering ${allPages.length} pages based on ${excludes.length} excludes`
  );

  const { filteredPages, messages } = pageFilter(
    {
      allPages,
      filterPages,
      excludes,
    },
    { reporter }
  );

  messages.forEach((message) => reporter.verbose(message));

  reporter.verbose(
    `${REPORTER_PREFIX} ${filteredPages.length} pages remain after filtering`
  );

  const serializedPages = [];

  for (const page of filteredPages) {
    try {
      const { url, ...rest } = await Promise.resolve(
        serialize(page, { resolvePagePath })
      );
      serializedPages.push({
        shorturl: url, // for langs classfication
        url: prefixPath({ url, siteUrl }),
        ...rest,
      });
    } catch (err) {
      reporter.panic(`${REPORTER_PREFIX} Error serializing pages`, err);
    }
  }

  const sitemapWritePath = path.join(`public`, output);
  const sitemapPublicPath = path.posix.normalize(output);

  // add x-default
  langs = langs.includes("x-default")
    ? langs
    : langs.push("x-default") && langs;
  // map url lang to hreflang
  const urlLangToHreflangMap = new Map();
  const urlLangs = [];
  for (const langObj of langs) {
    if (typeof langObj === "string") {
      urlLangs.push(langObj);
      urlLangToHreflangMap.set(langObj, langObj);
    } else {
      urlLangs.push(langObj.urlLang);
      urlLangToHreflangMap.set(langObj.urlLang, langObj.hreflang);
    }
  }

  return resolveSitemapAndIndex({
    hostname: siteUrl,
    publicBasePath: sitemapPublicPath,
    destinationDir: sitemapWritePath,
    sourceData: serializedPages,
    langs: urlLangs,
    urlLangToHreflangMap: urlLangToHreflangMap,
    combinedHrefs,
  });
};

// resolve sitemap and index
const resolveSitemapAndIndex = ({
  hostname,
  publicBasePath = "./",
  destinationDir,
  sourceData,
  langs,
  urlLangToHreflangMap,
  combinedHrefs,
}) => {
  // mkdir if not exist
  fs.mkdirSync(destinationDir, { recursive: true });
  // normalize path
  if (!publicBasePath.endsWith("/")) {
    publicBasePath += "/";
  }
  // pipe items file
  const urlsMap = generateUrlsMap(langs, sourceData);
  const { pagesContentCombine, pagesContent } = generatefilesInfoArray(
    urlsMap,
    langs,
    urlLangToHreflangMap
  );
  langs = []; // clear langs to filter langs that had no items.
  for (const { lang, pageContent } of pagesContent) {
    fs.writeFileSync(
      path.resolve(destinationDir, lang + "-sitemap.xml"),
      pageContent
    );
    langs.push(lang);
  }
  // if combined hrefs pipe combined file
  if (combinedHrefs) {
    fs.writeFileSync(
      path.resolve(destinationDir, "sitemap.xml"),
      pagesContentCombine
    );
  }
  // pipe index file
  let sitemapIndexLocs = langs.map(
    (lang) => hostname + path.normalize(publicBasePath + lang + "-sitemap.xml")
  );
  // if combined hrefs
  // add sitemap.xml
  if (combinedHrefs)
    sitemapIndexLocs = [
      hostname + path.normalize(publicBasePath + "sitemap.xml"),
      ...sitemapIndexLocs,
    ];
  const sitemapIndexXML = generateSitemapIndexXML(sitemapIndexLocs);
  const sitemapIndexWritePath = path.resolve(
    destinationDir,
    `sitemap-index.xml`
  );
  fs.writeFileSync(sitemapIndexWritePath, sitemapIndexXML);
  return {
    sitemapIndexXML,
    pagesContent,
  };
};

// generate all files info array
// the pageContent data sturcture like this, [{lang:string, fileContent:string}, ]
// pagesContentCombine combine all pageContent
function generatefilesInfoArray(urlsMap, langs, urlLangToHreflangMap) {
  const pagesContent = [];
  const allData = [];
  let pageSumDataArray = [];
  for (const [_, source] of urlsMap) {
    const dataCombine = generateXMLBySource(source, urlLangToHreflangMap);
    allData.push(dataCombine);
  }
  for (const lang of langs) {
    const pageContentArray = []; // one page's content
    for (const [xmlArrayDataString, xmlMapData] of allData) {
      let xmlLoc;
      if (xmlMapData.get(lang)) {
        xmlLoc = wrapWithLoc(xmlMapData.get(lang));
      } else {
        continue; // not contains this lang
      }
      const urlData = wrapWithUrl(xmlLoc + xmlArrayDataString);
      pageContentArray.push(urlData);
      pageSumDataArray.push(urlData);
    }
    if (pageContentArray.length === 0) continue;
    const pageContent = wrapWithXMLHeader(
      wrapWithUrlset(pageContentArray.join(""))
    );
    pagesContent.push({ lang, pageContent });
  }
  return {
    pagesContentCombine: wrapWithXMLHeader(
      wrapWithUrlset(pageSumDataArray.join(""))
    ),
    pagesContent,
  };
}

// generate all xml array data by source data
function generateXMLBySource(source, urlLangToHreflangMap) {
  const xmlArrayData = [];
  const xmlMapData = new Map();
  for (const { lang, url } of source) {
    const hreflang = urlLangToHreflangMap.get(lang);
    const xmlData = wrapWithXMLLink(hreflang, url);
    xmlArrayData.push(xmlData);
    xmlMapData.set(lang, url);
  }
  return [xmlArrayData.join(""), xmlMapData];
}

// for classfication
// the map (k,v) represents (url, langs array). for example, ('/', [en, fr])
function generateUrlsMap(langs, sourceData) {
  // record langs in a map
  const langsMap = new Map();
  for (const lang of langs) langsMap.set(lang, true);
  const urlsMap = new Map();
  for (const data of sourceData) {
    // classify by short url
    let shorturl = data.shorturl;
    const lang = shorturl.split("/")[1];
    const hasLang = langsMap.get(lang);
    if (hasLang) {
      // remove lang prefix
      shorturl = "/" + shorturl.split("/").slice(2).join("/");
    } else {
      lang = "x-default";
    }
    if (!urlsMap.get(shorturl)) urlsMap.set(shorturl, []);
    urlsMap.get(shorturl).push({ lang, ...data });
  }
  return urlsMap;
}
