import { onPostBuild } from "../gatsby-node";
import { Joi } from "gatsby-plugin-utils";
import { pluginOptionsSchema } from "../options-validation";

jest.mock(`fs`, () => {
  return {
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn(),
    writeFileSync: jest.fn(),
  };
});

const schema = pluginOptionsSchema({ Joi });

const reporter = {
  verbose: jest.fn(),
  panic: jest.fn(),
};

beforeEach(() => {
  global.__PATH_PREFIX__ = ``;
});

describe(`gatsby-plugin-sitemap Node API`, () => {
  it(`aftership moke data`, async () => {
    const graphql = jest.fn();
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
              path: "/",
            },
            {
              path: "/editor",
            },
            {
              path: "/amp/editor",
            },
            {
              path: "/amp/apps/mazet",
            },
            {
              path: "/apps/legion-express",
            },
            {
              path: "/amp/apps/legion-express",
            },
            {
              path: "/dev-404-page/",
            },
            {
              path: "/zh-Hans/features",
            },
            {
              path: "/zh-Hans/",
            },
            {
              path: "/fr/features",
            },
            {
              path: "/fr/",
            },
          ],
        },
      },
    });
    const prefix = `/test`;
    const subdir = `/subdir`;
    const options = {
      output: subdir,
      langs: [
        {
          urlLang: "fr",
          hreflang: "frrrr",
        },
        "zh-Hans",
        {
          urlLang: "ko",
          hreflang: "ko-KR",
        },
      ],
      combinedHrefs: true,
    };
    const result = await onPostBuild(
      { graphql, pathPrefix: prefix, reporter },
      await schema.validateAsync(options)
    );
    expect(result).toMatchSnapshot();
  });
});
