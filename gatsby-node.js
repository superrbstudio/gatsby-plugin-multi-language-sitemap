"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.resolveSitemapAndIndex = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _optionsValidation = require("./options-validation");

var _fs = _interopRequireDefault(require("fs"));

var _internals = require("./internals");

var _sitemapxml = require("./sitemapxml");

var _excluded = ["url"];

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

exports.pluginOptionsSchema = _optionsValidation.pluginOptionsSchema;

exports.onPostBuild = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(_ref, _ref2) {
    var graphql, reporter, pathPrefix, output, query, excludes, resolveSiteUrl, resolvePagePath, resolvePages, filterPages, serialize, langs, _yield$graphql, queryRecords, errors, siteUrl, allPages, _pageFilter, filteredPages, messages, serializedPages, _iterator, _step, page, _yield$Promise$resolv, url, rest, sitemapWritePath, sitemapPublicPath;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            graphql = _ref.graphql, reporter = _ref.reporter, pathPrefix = _ref.pathPrefix;
            output = _ref2.output, query = _ref2.query, excludes = _ref2.excludes, resolveSiteUrl = _ref2.resolveSiteUrl, resolvePagePath = _ref2.resolvePagePath, resolvePages = _ref2.resolvePages, filterPages = _ref2.filterPages, serialize = _ref2.serialize, langs = _ref2.langs;
            _context.next = 4;
            return graphql(query);

          case 4:
            _yield$graphql = _context.sent;
            queryRecords = _yield$graphql.data;
            errors = _yield$graphql.errors;
            _context.next = 9;
            return Promise.resolve(resolveSiteUrl(queryRecords)).catch(function (err) {
              return reporter.panic(_internals.REPORTER_PREFIX + " Error resolving Site URL", err);
            });

          case 9:
            siteUrl = _context.sent;

            if (errors) {
              reporter.panic("Error executing the GraphQL query inside gatsby-plugin-sitemap:\n", errors);
            }

            _context.next = 13;
            return Promise.resolve(resolvePages(queryRecords)).catch(function (err) {
              return reporter.panic(_internals.REPORTER_PREFIX + " Error resolving Pages", err);
            });

          case 13:
            allPages = _context.sent;

            if (!Array.isArray(allPages)) {
              reporter.panic(_internals.REPORTER_PREFIX + " The `resolvePages` function did not return an array.");
            }

            reporter.verbose(_internals.REPORTER_PREFIX + " Filtering " + allPages.length + " pages based on " + excludes.length + " excludes");
            _pageFilter = (0, _internals.pageFilter)({
              allPages: allPages,
              filterPages: filterPages,
              excludes: excludes
            }, {
              reporter: reporter
            }), filteredPages = _pageFilter.filteredPages, messages = _pageFilter.messages;
            messages.forEach(function (message) {
              return reporter.verbose(message);
            });
            reporter.verbose(_internals.REPORTER_PREFIX + " " + filteredPages.length + " pages remain after filtering");
            serializedPages = [];
            _iterator = _createForOfIteratorHelperLoose(filteredPages);

          case 21:
            if ((_step = _iterator()).done) {
              _context.next = 37;
              break;
            }

            page = _step.value;
            _context.prev = 23;
            _context.next = 26;
            return Promise.resolve(serialize(page, {
              resolvePagePath: resolvePagePath
            }));

          case 26:
            _yield$Promise$resolv = _context.sent;
            url = _yield$Promise$resolv.url;
            rest = (0, _objectWithoutPropertiesLoose2.default)(_yield$Promise$resolv, _excluded);
            serializedPages.push((0, _extends2.default)({
              shorturl: url,
              // for langs classfication
              url: (0, _internals.prefixPath)({
                url: url,
                siteUrl: siteUrl,
                pathPrefix: pathPrefix
              })
            }, rest));
            _context.next = 35;
            break;

          case 32:
            _context.prev = 32;
            _context.t0 = _context["catch"](23);
            reporter.panic(_internals.REPORTER_PREFIX + " Error serializing pages", _context.t0);

          case 35:
            _context.next = 21;
            break;

          case 37:
            sitemapWritePath = _path.default.join("public", output);
            sitemapPublicPath = _path.default.posix.join(pathPrefix, output);
            return _context.abrupt("return", resolveSitemapAndIndex({
              hostname: siteUrl,
              publicBasePath: sitemapPublicPath,
              destinationDir: sitemapWritePath,
              sourceData: serializedPages,
              langs: langs
            }));

          case 40:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[23, 32]]);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}(); // resolve sitemap and index


var resolveSitemapAndIndex = function resolveSitemapAndIndex(_ref4) {
  var hostname = _ref4.hostname,
      _ref4$publicBasePath = _ref4.publicBasePath,
      publicBasePath = _ref4$publicBasePath === void 0 ? './' : _ref4$publicBasePath,
      destinationDir = _ref4.destinationDir,
      sourceData = _ref4.sourceData,
      langs = _ref4.langs;

  // mkdir if not exist
  _fs.default.mkdirSync(destinationDir, {
    recursive: true
  }); // normalize path


  if (!publicBasePath.endsWith('/')) {
    publicBasePath += '/';
  }

  langs = langs.includes('x-default') ? langs : langs.push('x-default') && langs; // pipe items file

  var urlsMap = generateUrlsMap(langs, sourceData);
  var filesInfoArray = generatefilesInfoArray(urlsMap, langs);
  langs = []; // clear langs to filter langs that had no items.

  for (var _iterator2 = _createForOfIteratorHelperLoose(filesInfoArray), _step2; !(_step2 = _iterator2()).done;) {
    var _step2$value = _step2.value,
        lang = _step2$value.lang,
        pageContent = _step2$value.pageContent;

    _fs.default.writeFileSync(_path.default.resolve(destinationDir, lang + '-sitemap.xml'), pageContent);

    langs.push(lang);
  } // pipe index file


  var sitemapIndexLocs = langs.map(function (lang) {
    return hostname + _path.default.normalize(publicBasePath + lang + '-sitemap.xml');
  });
  var sitemapIndexXML = (0, _sitemapxml.generateSitemapIndexXML)(sitemapIndexLocs);

  var sitemapIndexWritePath = _path.default.resolve(destinationDir, "sitemap-index.xml");

  _fs.default.writeFileSync(sitemapIndexWritePath, sitemapIndexXML);

  return {
    sitemapIndexXML: sitemapIndexXML,
    filesInfoArray: filesInfoArray
  };
}; // generate all files info array 
// the data sturcture like this, [{lang:string, fileContent:string}, ]


exports.resolveSitemapAndIndex = resolveSitemapAndIndex;

function generatefilesInfoArray(urlsMap, langs) {
  var pagesContent = [];
  var allData = [];

  for (var _iterator3 = _createForOfIteratorHelperLoose(urlsMap), _step3; !(_step3 = _iterator3()).done;) {
    var _step3$value = _step3.value,
        _ = _step3$value[0],
        source = _step3$value[1];
    var dataCombine = generateXMLBySource(source);
    allData.push(dataCombine);
  }

  for (var _iterator4 = _createForOfIteratorHelperLoose(langs), _step4; !(_step4 = _iterator4()).done;) {
    var lang = _step4.value;
    var pageContentArray = []; // one page's content

    for (var _iterator5 = _createForOfIteratorHelperLoose(allData), _step5; !(_step5 = _iterator5()).done;) {
      var _step5$value = _step5.value,
          xmlArrayDataString = _step5$value[0],
          xmlMapData = _step5$value[1];
      var xmlLoc = void 0;

      if (xmlMapData.get(lang)) {
        xmlLoc = (0, _sitemapxml.wrapWithLoc)(xmlMapData.get(lang));
      } else {
        continue; // not contains this lang
      }

      var urlData = (0, _sitemapxml.wrapWithUrl)(xmlLoc + xmlArrayDataString);
      pageContentArray.push(urlData);
    }

    if (pageContentArray.length === 0) continue;
    var pageContent = (0, _sitemapxml.wrapWithXMLHeader)((0, _sitemapxml.wrapWithUrlset)(pageContentArray.join('')));
    pagesContent.push({
      lang: lang,
      pageContent: pageContent
    });
  }

  return pagesContent;
} // generate all xml array data by source data


function generateXMLBySource(source) {
  var xmlArrayData = [];
  var xmlMapData = new Map();

  for (var _iterator6 = _createForOfIteratorHelperLoose(source), _step6; !(_step6 = _iterator6()).done;) {
    var _step6$value = _step6.value,
        lang = _step6$value.lang,
        url = _step6$value.url;
    var xmlData = (0, _sitemapxml.wrapWithXMLLink)(lang, url);
    xmlArrayData.push(xmlData);
    xmlMapData.set(lang, url);
  }

  return [xmlArrayData.join(''), xmlMapData];
} // for classfication
// the map (k,v) represents (url, langs array). for example, ('/', [en, fr])


function generateUrlsMap(langs, sourceData) {
  // record langs in a map
  var langsMap = new Map();

  for (var _iterator7 = _createForOfIteratorHelperLoose(langs), _step7; !(_step7 = _iterator7()).done;) {
    var lang = _step7.value;
    langsMap.set(lang, true);
  }

  var urlsMap = new Map();

  for (var _iterator8 = _createForOfIteratorHelperLoose(sourceData), _step8; !(_step8 = _iterator8()).done;) {
    var data = _step8.value;
    // classify by short url
    var shorturl = data.shorturl;
    var _lang = shorturl.split('/')[1];
    var hasLang = langsMap.get(_lang);

    if (hasLang) {
      // remove lang prefix
      shorturl = '/' + shorturl.split('/').slice(2).join('/');
    } else {
      _lang = 'x-default';
    }

    if (!urlsMap.get(shorturl)) urlsMap.set(shorturl, []);
    urlsMap.get(shorturl).push((0, _extends2.default)({
      lang: _lang
    }, data));
  }

  return urlsMap;
}