import {
  wrapWithXMLHeader,
  wrapWithSitemapIndex,
  wrapWithSitemapAndLoc,
  wrapWithSitemapAndLocs,
  wrapWithUrlset,
  wrapWithUrl,
  wrapWithLoc,
  wrapWithXMLLink
} from '../sitemapxml'

describe(`sitemapxml`, () => {
  const str = `https://www.automizely.com/assets/v3/sitemap-0.xml`
  const strs = [
    `https://www.automizely.com/assets/v3/sitemap-0.xml`, 
    `https://www.automizely.com/assets/v3/sitemap-1.xml`,
    `https://www.automizely.com/assets/v3/sitemap-2.xml`
  ]
  it(`wrapWithSitemapAndLoc`, () => {
    const result = wrapWithSitemapAndLoc(str)
    expect(result).toMatchSnapshot()
  })
  it(`wrapWithSitemapAndLocs`, () => {
    const result = wrapWithSitemapAndLocs(strs)
    expect(result).toMatchSnapshot()
  })
  it(`wrapWithSitemapIndex`, () => {
    const result = wrapWithSitemapIndex(str)
    expect(result).toMatchSnapshot()
  })
  it(`wrapWithXMLHeader`, () => {
    const result = wrapWithXMLHeader(str)
    expect(result).toMatchSnapshot()
  })
  it(`wrapWithUrlset`, () => {
    const result = wrapWithUrlset(str)
    expect(result).toMatchSnapshot()
  })
  it(`wrapWithUrl`, () => { 
    const result = wrapWithUrl(str)
    expect(result).toMatchSnapshot()
  })
  it(`wrapWithLoc`, () => {
    const result = wrapWithLoc(str)
    expect(result).toMatchSnapshot() 
  })
  it(`wrapWithXMLLink`, () => {
    const result = wrapWithXMLLink(str)
    expect(result).toMatchSnapshot()  
  })
})