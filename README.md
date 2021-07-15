# 💎Gatsby-plugin-multi-language-sitemap 

Create a sitemap for your Gatsby site.

The plugin is a fork of [gatsby-plugin-sitemap](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sitemap) . This forked version has support multiple languages support, designed for aftership. 

### 🧸How to use it?

##### 1.create a gatsby project

```bash
gatsby new demo
cd demo
```

##### 2. install package

```bash
# npm
npm i gatsby-plugin-multi-language-sitemap
# yarn
yarn add gatsby-plugin-multi-language-sitemap
```

##### 3. config sitemap plugin at `gatsby-config.js`

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-multi-language-sitemap`,
      options: {
        output: '/',
        query: `
          query {
            allSitePage {
              nodes {
                path
              }
            }
            site {
              siteMetadata {
                siteUrl
              }
            }
          }
        `,
        langs: ['en', 'de', 'fr', 'es', 'zh-Hant', 'zh-Hans'],
      },
    }
  ]
}
```

The plugin distinguish the language by the url prefix. 

For example, if your url like below format. The sitemap plugin will take effect.

```
https://gatsbystarterdefaultsource.gatsbyjs.io/app
https://gatsbystarterdefaultsource.gatsbyjs.io/en/app
https://gatsbystarterdefaultsource.gatsbyjs.io/fr/app
https://gatsbystarterdefaultsource.gatsbyjs.io/zh-Hans/app
https://gatsbystarterdefaultsource.gatsbyjs.io/jp/app
```

and the langs param will be

```js
langs: ['en', 'fr', 'zh-Hans', 'jp']
```

##### 4. run commands below, you can see the sitemap in `/public/` folder, `sitemap-index.xml` `x-default-sitemap.xml` screenshot below.

```bash
yarn build
```

![image-20210715142625438](https://raw.githubusercontent.com/SteveYuOWO/gatsby-plugin-multi-language-sitemap/main/screenshot/1.png)

![image-20210715142851589](https://raw.githubusercontent.com/SteveYuOWO/gatsby-plugin-multi-language-sitemap/main/screenshot/2.png)  

##### 5. compat `gatsby-plugin-sitemap` , you can use more native features at below link

https://www.gatsbyjs.com/plugins/gatsby-plugin-sitemap/

