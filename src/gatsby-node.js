import path from "path"
import { pluginOptionsSchema } from "./options-validation"
import fs from "fs"
import { prefixPath, pageFilter, REPORTER_PREFIX } from "./internals"
import { generateSitemapIndexXML, wrapWithLoc, wrapWithUrl, wrapWithUrlset, wrapWithXMLHeader, wrapWithXMLLink } from "./sitemapxml"

exports.pluginOptionsSchema = pluginOptionsSchema

exports.onPostBuild = async (
  { graphql, reporter, pathPrefix },
  {
    output,
    query,
    excludes,
    resolveSiteUrl,
    resolvePagePath,
    resolvePages,
    filterPages,
    serialize,
    langs
  }
) => {
  const { data: queryRecords, errors } = await graphql(query)

  // resolvePages and resolveSiteUrl are allowed to be sync or async. The Promise.resolve handles each possibility
  const siteUrl = await Promise.resolve(
    resolveSiteUrl(queryRecords)
  ).catch(err =>
    reporter.panic(`${REPORTER_PREFIX} Error resolving Site URL`, err)
  )

  if (errors) {
    reporter.panic(
      `Error executing the GraphQL query inside gatsby-plugin-sitemap:\n`,
      errors
    )
  }

  const allPages = await Promise.resolve(
    resolvePages(queryRecords)
  ).catch(err =>
    reporter.panic(`${REPORTER_PREFIX} Error resolving Pages`, err)
  )

  if (!Array.isArray(allPages)) {
    reporter.panic(
      `${REPORTER_PREFIX} The \`resolvePages\` function did not return an array.`
    )
  }

  reporter.verbose(
    `${REPORTER_PREFIX} Filtering ${allPages.length} pages based on ${excludes.length} excludes`
  )

  const { filteredPages, messages } = pageFilter(
    {
      allPages,
      filterPages,
      excludes,
    },
    { reporter }
  )

  messages.forEach(message => reporter.verbose(message))

  reporter.verbose(
    `${REPORTER_PREFIX} ${filteredPages.length} pages remain after filtering`
  )

  const serializedPages = []

  for (const page of filteredPages) {
    try {
      const { url, ...rest } = await Promise.resolve(
        serialize(page, { resolvePagePath })
      )
      serializedPages.push({
        shorturl: url, // for langs classfication
        url: prefixPath({ url, siteUrl, pathPrefix }),
        ...rest,
      })
    } catch (err) {
      reporter.panic(`${REPORTER_PREFIX} Error serializing pages`, err)
    }
  }

  const sitemapWritePath = path.join(`public`, output)
  const sitemapPublicPath = path.posix.join(pathPrefix, output)

  return resolveSitemapAndIndex({
    hostname: siteUrl,
    publicBasePath: sitemapPublicPath,
    destinationDir: sitemapWritePath,
    sourceData: serializedPages,
    langs: langs
  })
}

// resolve sitemap and index
export const resolveSitemapAndIndex = ({ hostname, publicBasePath = './', destinationDir, sourceData, langs }) => {
  // mkdir if not exist
  fs.mkdirSync(destinationDir, { recursive: true });
  // normalize path
  if (!publicBasePath.endsWith('/')) {
    publicBasePath += '/';
  }
  langs = langs.includes('x-default') ? langs: langs.push('x-default') && langs
  // pipe index file
  const sitemapIndexLocs = langs.map(lang => hostname + path.normalize(publicBasePath + lang + '-sitemap.xml'))
  const sitemapIndexXML = generateSitemapIndexXML(sitemapIndexLocs)
  const sitemapIndexWritePath = path.resolve(destinationDir, `sitemap-index.xml`)
  fs.writeFileSync(sitemapIndexWritePath, sitemapIndexXML)
  const urlsMap = generateUrlsMap(langs, sourceData);
  const filesInfoArray= generatefilesInfoArray(urlsMap, langs);
  for(const {fileName, pageContent} of filesInfoArray) {
    fs.writeFileSync(path.resolve(destinationDir, fileName), pageContent);
  }
  return {
    sitemapIndexXML,
    filesInfoArray
  }
}

// generate all files info array 
// the data sturcture like this, [{fileName:string, fileContent:string}, ]
function generatefilesInfoArray(urlsMap, langs) {
  const pagesContent = []
  const allData = []
  for(const [_, source] of urlsMap) {
    const dataCombine = generateXMLBySource(source)
    allData.push(dataCombine)
  }
  for(const lang of langs) {
    const pageContentArray = [] // one page's content
    for(const [xmlArrayDataString, xmlMapData] of allData) {
      let xmlLoc;
      if(xmlMapData.get(lang)) {
        xmlLoc = wrapWithLoc(xmlMapData.get(lang))
      } else {
        continue; // not contains this lang
      }
      const urlData = wrapWithUrl(xmlLoc + xmlArrayDataString)
      pageContentArray.push(urlData)
    }
    if(pageContentArray.length === 0) continue;
    const pageContent = wrapWithXMLHeader(
      wrapWithUrlset(
        pageContentArray.join('')
      )
    )
    const fileName = lang + '-sitemap.xml'
    pagesContent.push({fileName, pageContent})
  }
  return pagesContent;
}

// generate all xml array data by source data
function generateXMLBySource(source) {
  const xmlArrayData = []
  const xmlMapData = new Map()
  for(const {lang, url} of source) {
    const xmlData = wrapWithXMLLink(lang, url)
    xmlArrayData.push(xmlData)
    xmlMapData.set(lang, url)
  }
  return [xmlArrayData.join(''), xmlMapData]
}

// for classfication
// the map (k,v) represents (url, langs array). for example, ('/', [en, fr])
function generateUrlsMap(langs, sourceData) {
  // record langs in a map
  const langsMap = new Map();
  for(const lang of langs) langsMap.set(lang, true);
  const urlsMap = new Map();
  for(const data of sourceData) {
    // classify by short url
    let shorturl = data.shorturl;
    const lang = shorturl.split('/')[1]
    const hasLang = langsMap.get(lang);
    if(hasLang) {
      // remove lang prefix
      shorturl = '/' + shorturl.split('/').slice(2).join('/')
    } else {
      lang = 'x-default'
    }
    if(!urlsMap.get(shorturl)) urlsMap.set(shorturl, []);
    urlsMap.get(shorturl).push({lang, ...data})
  }
  return urlsMap;
}

