import { onPostBuild } from "../gatsby-node"
import { Joi } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../options-validation"

jest.mock(`sitemap`, () => {
  return {
    SitemapIndexStream: function () {
      this.pipe = jest.fn()
      this.write = jest.fn()
      this.end = jest.fn()
    },
    SitemapItemStream: function () {
      this.pipe = jest.fn()
      this.write = jest.fn()
      this.end = jest.fn()
    }
  }
})

jest.mock(`fs`, () => {
  return {
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn()
  }
})

const schema = pluginOptionsSchema({ Joi })

const pathPrefix = ``

const reporter = {
  verbose: jest.fn(),
  panic: jest.fn(),
}

beforeEach(() => {
  global.__PATH_PREFIX__ = ``
})

describe(`gatsby-plugin-sitemap Node API`, () => {
  it(`should succeed with default options`, async () => {
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
          },
        },
        allSitePage: {
          nodes: [
            {
              path: `/page-1`,
            },
            {
              path: `/page-2`,
            },
          ],
        },
      },
    })
    const result = await onPostBuild(
      { graphql, pathPrefix, reporter },
      await schema.validateAsync({})
    )
    expect(result.size).toBe(1)
  })

  it(`should accept a custom query`, async () => {
    const graphql = jest.fn()
    const siteUrl = `http://dummy.url`
    graphql.mockResolvedValue({
      data: {
        allSitePage: {
          edges: [
            {
              node: {
                path: `/page-1`,
              },
            },
            {
              node: {
                path: `/post/exclude-page`,
              },
            },
          ],
        },
      },
    })
    const customQuery = `
      {
        allSitePage {
          edges {
            node {
              path
            }
          }
        }
    }`
    const options = {
      output: `custom-folder`,
      resolveSiteUrl: () => siteUrl,
      resolvePages: data => data.allSitePage.edges.map(edge => edge.node),
      serialize: (page, { resolvePagePath }) => {
        return {
          url: resolvePagePath(page),
          changefreq: `weekly`,
          priority: 0.8,
        }
      },
      excludes: [`/post/exclude-page`],
      query: customQuery,
    }

    const result = await onPostBuild(
      { graphql, pathPrefix, reporter },
      await schema.validateAsync(options)
    )
    expect(result.size).toBe(1)
  })

  it(`should include path prefix when creating creating index sitemap`, async () => {
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
          },
        },
        allSitePage: {
          nodes: [
            {
              path: `/page-1`,
            },
            {
              path: `/page-2`,
            },
          ],
        },
      },
    })

    const options = {
      entryLimit: 1,
    }
    const prefix = `/test`
    const result = await onPostBuild(
      { graphql, pathPrefix: prefix, reporter },
      await schema.validateAsync(options)
    )
    expect(result.size).toBe(1)
  })

  it(`should output modified paths to sitemap`, async () => {
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
          },
        },
        allSitePage: {
          nodes: [
            {
              path: `/page-1`,
            },
            {
              path: `/page-2`,
            },
          ],
        },
      },
    })
    const prefix = `/test`
    const subdir = `/subdir`
    const options = {
      output: subdir,
    }
    const result = await onPostBuild(
      { graphql, pathPrefix: prefix, reporter },
      await schema.validateAsync(options)
    )
    expect(result.size).toBe(1)
  })

  it(`aftership moke data`, async () => {
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            siteUrl: `https://www.aftership.com`,
          },
        },
        allSitePage: {
          nodes: [
            {
              "path": "/"
            },
            {
              "path": "/editor"
            },
            {
              "path": "/amp/editor"
            },
            {
              "path": "/amp/apps/mazet"
            },
            {
              "path": "/apps/legion-express"
            },
            {
              "path": "/amp/apps/legion-express"
            },
            {
              "path": "/dev-404-page/"
            },
            {
              "path": "/zh-Hans/features"
            },
            {
              "path": "/zh-Hans/"
            },
            {
              "path": "/fr/features"
            },
            {
              "path": "/fr/"
            }
          ],
        },
      },
    })
    const prefix = `/test`
    const subdir = `/subdir`
    const options = {
      output: subdir,
      entryLimit: 50000,
      langs: ['fr', 'zh-Hans']
    }
    const result = await onPostBuild(
      { graphql, pathPrefix: prefix, reporter },
      await schema.validateAsync(options)
    )
    expect(result.size).toBe(3)
  })
})
