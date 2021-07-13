import path from "path"
import { pluginOptionsSchema } from "./options-validation"
import fs from "fs"
import { prefixPath, pageFilter, REPORTER_PREFIX } from "./internals"
import { SitemapIndexStream, SitemapItemStream } from "sitemap";

exports.pluginOptionsSchema = pluginOptionsSchema

exports.onPostBuild = async (
  { graphql, reporter, pathPrefix },
  {
    output,
    entryLimit,
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
  // console.log({hostname, publicBasePath, destinationDir, sourceData, langs})
  // get langsMap and classfication
  const langsMap = generateEmptyLangsMap(langs, sourceData);
  // mkdir if not exist
  fs.mkdirSync(destinationDir, { recursive: true });
  // normalize path
  if (!publicBasePath.endsWith('/')) {
    publicBasePath += '/';
  }
  // pipe index file
  const sitemapIndexStream = new SitemapIndexStream({ level: 'warn' });
  sitemapIndexStream.pipe(fs.createWriteStream(path.resolve(destinationDir, 'sitemap-index.xml')));
  for (const lang of langs) {
    sitemapIndexStream.write({
      url: hostname + path.normalize(publicBasePath + lang + '-sitemap.xml') // out url
    })
  }
  sitemapIndexStream.end()
  for (const [lang, items] of langsMap) {
    resolveSitemapItem({
      items: items,
      path: path.resolve(destinationDir, lang + '-sitemap.xml')
    })
  }
  return langsMap;
}

// resolve one site map item
// write to path
function resolveSitemapItem({ items, path }) {
  const sitemapItemStream = new SitemapItemStream({ level: 'warn' })
  sitemapItemStream.pipe(fs.createWriteStream(path))
  for (const item of items) 
    sitemapItemStream.write(item)
  sitemapItemStream.end()
}

// generate a map to classfy the category of langs
function generateEmptyLangsMap(langs, sourceData) {
  const langsMap = new Map();
  // init langsMap
  for (const lang of langs) langsMap.set(lang, [])
  langsMap.set('default', [])

  for (const source of sourceData) {
    // get and delete shorturl, for push to langs map
    const shorturl = source.shorturl;
    delete source.shorturl
    // compat native api, if not contains these, will report error
    if(!source.video) source.video = []
    if(!source.links) source.links = []
    if(!source.img) source.img = []
    // normalize shorturl and get lang
    if (shorturl[0] !== '/') shorturl = '/' + shorturl; // normalize shorturl
    const urlLang = shorturl.split('/')[1];

    if (langsMap.get(urlLang)) {
      langsMap.get(urlLang).push(source);
    } else {
      langsMap.get('default').push(source);
    }
  }
  return langsMap;
}
