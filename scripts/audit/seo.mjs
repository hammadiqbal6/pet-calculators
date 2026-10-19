#!/usr/bin/env node
/**
 * SEO audit over the built site (dist/). Run `npm run build` first, then `npm run audit:seo`.
 *
 * Checks: title/meta description length and uniqueness, exactly one H1, html lang + viewport,
 * self-referencing absolute canonical, Open Graph, JSON-LD parse + required types per page type,
 * img alt, word count (tool >= 600), broken internal links, sitemap.xml coverage, robots.txt,
 * orphan pages, tool-page structure (sources, FAQ, disclaimer, related links) and
 * docs/KEYWORD-MAP.md coverage / cannibalization.
 *
 * Exit code 1 on any error. Warnings never fail unless --strict / AUDIT_STRICT=1.
 * AUDIT_PROD=1 promotes launch blockers (placeholder siteUrl, ...) to errors.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  DIST,
  LIMITS,
  ROOT,
  Report,
  analyzeInternalLinks,
  fileForPath,
  isIndexable,
  loadPages,
  parseJsonLd,
  readSiteConfig,
  routeFromFile,
  trailSlash,
  typesOf,
} from './lib.mjs';

const report = new Report('seo');
const site = readSiteConfig();
const pages = loadPages();
const siteOrigin = site.siteUrl;

report.note(`${pages.length} HTML pages in dist/, siteUrl = ${siteOrigin || '(unreadable)'}`);
if (!siteOrigin || /\.example|localhost|example\.com/.test(siteOrigin)) {
  report.launch('placeholder-domain', 'src/config/site.ts', `siteUrl "${siteOrigin}" is a placeholder; canonicals and sitemap point to it`);
}

const len = (s) => [...(s || '').trim()].length;

function metaContent($, selector) {
  return ($(selector).first().attr('content') || '').trim();
}

const seenTitles = new Map();
const seenDescs = new Map();

for (const page of pages) {
  const { $, route, type } = page;
  const where = route;
  if (type === '404') {
    if (!page.robots.includes('noindex') && !$('title').text().trim()) report.error('title-missing', where, 'missing <title>');
    continue;
  }

  // lang / viewport / charset
  if (!($('html').attr('lang') || '').trim()) report.error('html-lang', where, '<html lang> missing');
  if (!$('meta[name="viewport"]').length) report.error('viewport', where, 'meta viewport missing');
  if (!$('meta[charset]').length) report.error('charset', where, '<meta charset> missing');

  // title
  const title = $('head > title').first().text().trim();
  if (!title) report.error('title-missing', where, 'missing <title>');
  else {
    if (len(title) > LIMITS.titleHardMax) report.error('title-length', where, `title is ${len(title)} chars (hard max ${LIMITS.titleHardMax}): "${title}"`);
    else if (len(title) > LIMITS.titleMax) report.warn('title-length', where, `title is ${len(title)} chars (target <= ${LIMITS.titleMax}): "${title}"`);
    else if (len(title) < LIMITS.titleMin) report.warn('title-length', where, `title is only ${len(title)} chars (target >= ${LIMITS.titleMin}): "${title}"`);
    if (type !== 'embed') {
      if (seenTitles.has(title)) report.error('title-duplicate', where, `duplicate <title> also on ${seenTitles.get(title)}: "${title}"`);
      else seenTitles.set(title, route);
    }
  }

  // meta description
  const desc = metaContent($, 'meta[name="description"]');
  if (!desc) report.error('desc-missing', where, 'missing meta description');
  else {
    if (len(desc) > LIMITS.descHardMax) report.error('desc-length', where, `meta description is ${len(desc)} chars (hard max ${LIMITS.descHardMax})`);
    else if (len(desc) > LIMITS.descMax) report.warn('desc-length', where, `meta description is ${len(desc)} chars (target <= ${LIMITS.descMax})`);
    else if (len(desc) < LIMITS.descMin) report.warn('desc-length', where, `meta description is only ${len(desc)} chars (target >= ${LIMITS.descMin})`);
    if (type !== 'embed') {
      if (seenDescs.has(desc)) report.warn('desc-duplicate', where, `meta description duplicates ${seenDescs.get(desc)}`);
      else seenDescs.set(desc, route);
    }
  }

  // H1
  const h1s = $('main h1, body h1').toArray();
  const uniqueH1 = new Set(h1s);
  if (uniqueH1.size !== 1) report.error('h1-count', where, `expected exactly one <h1>, found ${uniqueH1.size}`);
  else if (!$(h1s[0]).text().trim()) report.error('h1-empty', where, '<h1> is empty');

  // heading order (h1 -> h2 -> h3, never skipping a level downward)
  let prev = 0;
  $('h1,h2,h3,h4,h5,h6').each((_, el) => {
    const level = Number(el.tagName.slice(1));
    if (prev && level > prev + 1) report.warn('heading-skip', where, `heading level jumps h${prev} -> h${level} ("${$(el).text().trim().slice(0, 40)}")`);
    prev = level;
  });

  // canonical
  const canon = $('link[rel="canonical"]');
  if (type === 'embed') {
    if (!page.robots.includes('noindex') && canon.length === 0) {
      report.warn('embed-indexing', where, 'embed page should be noindex or canonicalize to its tool page');
    }
  } else if (canon.length !== 1) {
    report.error('canonical', where, `expected exactly one canonical link, found ${canon.length}`);
  } else {
    const href = canon.attr('href') || '';
    const expected = `${siteOrigin}${trailSlash(route.endsWith('.html') ? route : route)}`;
    if (!/^https:\/\//.test(href)) report.error('canonical', where, `canonical must be absolute https: ${href}`);
    else if (page.robots.includes('noindex')) report.warn('canonical-noindex', where, 'noindex page also declares a canonical');
    else if (href !== expected) report.error('canonical', where, `canonical ${href} is not self-referencing (expected ${expected})`);
  }

  // robots meta
  if (type !== 'embed' && type !== 'other' && page.robots.includes('noindex')) {
    report.error('noindex', where, `${type} page is noindex`);
  }

  // Open Graph + Twitter
  if (type !== 'embed') {
    for (const prop of ['og:title', 'og:description', 'og:url', 'og:type']) {
      if (!metaContent($, `meta[property="${prop}"]`)) report.error('og', where, `missing ${prop}`);
    }
    const ogUrl = metaContent($, 'meta[property="og:url"]');
    const canonHref = canon.attr('href');
    if (ogUrl && canonHref && ogUrl !== canonHref) report.error('og', where, `og:url ${ogUrl} differs from canonical ${canonHref}`);
    const ogImage = metaContent($, 'meta[property="og:image"]');
    if (!ogImage) report.warn('og-image', where, 'missing og:image (add a 1200x630 PNG/JPG for social/AI previews)');
    else if (/\.svg(\?|$)/i.test(ogImage)) report.warn('og-image-format', where, 'og:image is an SVG; Facebook, LinkedIn and X do not render SVG previews (use PNG/JPG/WebP)');
    else if (!/^https:\/\//.test(ogImage)) report.error('og-image', where, `og:image must be an absolute https URL: ${ogImage}`);
    if (!metaContent($, 'meta[name="twitter:card"]')) report.warn('twitter-card', where, 'missing twitter:card');
  }

  // images
  $('img').each((_, el) => {
    const $el = $(el);
    if ($el.attr('alt') === undefined) report.error('img-alt', where, `<img src="${$el.attr('src')}"> has no alt attribute (use alt="" only if decorative)`);
    if (!$el.attr('width') || !$el.attr('height')) report.warn('img-size', where, `<img src="${$el.attr('src')}"> lacks width/height (CLS)`);
  });

  // JSON-LD
  const blocks = parseJsonLd(page);
  const allTypes = new Set(blocks.flatMap(typesOf));
  blocks.forEach((b, i) => {
    if (b.__parseError) report.error('jsonld-parse', where, `JSON-LD block ${i + 1} is not valid JSON: ${b.__parseError}`);
    else {
      if (!b['@context']) report.error('jsonld-shape', where, `JSON-LD block ${i + 1} has no @context`);
      if (!b['@type']) report.error('jsonld-shape', where, `JSON-LD block ${i + 1} has no @type`);
    }
  });
  if (type !== 'embed') {
    if (!allTypes.has('Organization') && type === 'home') report.error('jsonld-missing', where, 'home page needs Organization JSON-LD');
    if (type !== 'home' && !allTypes.has('BreadcrumbList')) report.error('jsonld-missing', where, 'missing BreadcrumbList JSON-LD');
  }
  const bad = blocks.filter((b) => typesOf(b).includes('AggregateRating') || b.aggregateRating || b.review);
  if (bad.length) report.error('jsonld-fake-rating', where, 'aggregateRating/review markup found; only allowed with real on-site ratings (none are collected)');
  if (type === 'tool') {
    const app = blocks.find((b) => typesOf(b).some((t) => ['WebApplication', 'SoftwareApplication'].includes(t)));
    if (!app) report.error('jsonld-missing', where, 'tool page needs WebApplication (or SoftwareApplication) JSON-LD');
    else {
      if (!app.name) report.error('jsonld-shape', where, 'WebApplication.name missing');
      const offer = [].concat(app.offers || [])[0];
      if (!offer || String(offer.price) !== '0') report.error('jsonld-shape', where, 'WebApplication.offers.price must be "0"');
    }
  }
  if (type === 'guide') {
    const art = blocks.find((b) => typesOf(b).some((t) => ['Article', 'BlogPosting', 'NewsArticle'].includes(t)));
    if (!art) report.error('jsonld-missing', where, 'guide page needs Article JSON-LD');
    else {
      for (const key of ['headline', 'datePublished', 'dateModified', 'author']) {
        if (!art[key]) report.warn('jsonld-shape', where, `Article.${key} missing`);
      }
    }
  }

  // word counts
  if (type === 'tool' && page.words < LIMITS.toolMinWords) {
    report.error('thin-tool', where, `tool page has ${page.words} words of body copy (min ${LIMITS.toolMinWords})`);
  }
  if (type === 'guide') {
    if (page.words < LIMITS.guideHardMinWords) report.error('thin-guide', where, `guide has ${page.words} words (hard min ${LIMITS.guideHardMinWords})`);
    else if (page.words < LIMITS.guideMinWords) report.warn('thin-guide', where, `guide has ${page.words} words (target >= ${LIMITS.guideMinWords})`);
  }

  // tool page structure
  if (type === 'tool') {
    const headings = $('main h2, main h3').toArray().map((el) => $(el).text().toLowerCase());
    if (!$('main form').length && !$('main [data-calculator], main [data-calc]').length) {
      report.error('tool-ui', where, 'no calculator <form> found inside <main>');
    }
    if (!headings.some((h) => /source|reference/.test(h))) report.error('tool-sources', where, 'no "Sources / References" section');
    if (!headings.some((h) => /faq|frequently asked/.test(h))) report.error('tool-faq', where, 'no FAQ section');
    if (!headings.some((h) => /formula|how (it|we)|method|how to use/.test(h))) report.warn('tool-formula', where, 'no formula / how-it-works heading');
    if (!$('.disclaimer, [role="note"]').length && !/not veterinary advice/i.test(page.html)) {
      report.error('tool-disclaimer', where, 'no veterinary disclaimer (see .cursor/rules/ymyl-disclaimers.mdc)');
    }
    if (!/last updated/i.test($('main').text() + $('footer').text())) report.warn('tool-updated', where, 'no visible "Last updated" date');
    const related = $('main a[href^="/tools/"], main a[href^="/guides/"]').toArray().map((a) => $(a).attr('href'));
    const unique = new Set(related.filter((h) => trailSlash(h) !== route));
    if (unique.size < LIMITS.minRelatedLinks) {
      report.warn('tool-related', where, `only ${unique.size} contextual links to other tools/guides in <main> (min ${LIMITS.minRelatedLinks})`);
    }
  }
}

// links
const links = analyzeInternalLinks(pages, siteOrigin);
for (const b of links.broken) report.error('broken-link', b.from, `broken internal ${b.kind === 'a' ? 'link' : 'asset'} -> ${b.to}`);
for (const b of links.noSlash) report.warn('no-trailing-slash', b.from, `internal link without trailing slash -> ${b.to}`);

// orphans: indexable pages with zero inbound links from another non-embed page
for (const page of pages) {
  if (!isIndexable(page) || page.route === '/') continue;
  const from = [...(links.inbound.get(page.route) || [])].filter((r) => !r.startsWith('/embed/'));
  if (from.length === 0) report.error('orphan', page.route, 'no internal links point to this page');
  else if (from.length === 1 && (page.type === 'tool' || page.type === 'guide')) {
    report.warn('weak-inbound', page.route, `only one page links here (${from[0]}); add contextual links`);
  }
}

// sitemap
const sitemapFiles = fs.readdirSync(DIST).filter((f) => /^sitemap.*\.xml$/.test(f));
if (!sitemapFiles.length) report.error('sitemap-missing', 'dist/', 'no sitemap*.xml generated (check @astrojs/sitemap)');
else {
  const urls = new Map();
  const queue = [path.join(DIST, fs.existsSync(path.join(DIST, 'sitemap-index.xml')) ? 'sitemap-index.xml' : sitemapFiles[0])];
  const visited = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (visited.has(file) || !fs.existsSync(file)) continue;
    visited.add(file);
    const xml = fs.readFileSync(file, 'utf8');
    const isIndex = /<sitemapindex/.test(xml);
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>|<sitemap>([\s\S]*?)<\/sitemap>/g)) {
      const body = m[1] ?? m[2];
      const loc = (body.match(/<loc>\s*([^<\s]+)\s*<\/loc>/) || [])[1];
      if (!loc) continue;
      if (isIndex) queue.push(path.join(DIST, path.basename(new URL(loc).pathname)));
      else {
        urls.set(loc, (body.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1]);
        if (!/^\d{4}-\d{2}-\d{2}/.test(urls.get(loc) || '')) report.warn('sitemap-lastmod', loc, 'missing or malformed <lastmod>');
      }
    }
  }
  report.note(`sitemap lists ${urls.size} URLs`);
  const byRoute = new Map(pages.map((p) => [p.route, p]));
  for (const loc of urls.keys()) {
    const u = new URL(loc);
    if (siteOrigin && u.origin !== new URL(siteOrigin).origin) report.error('sitemap-host', loc, 'sitemap URL host differs from siteUrl');
    if (!u.pathname.endsWith('/') && !path.extname(u.pathname)) report.error('sitemap-slash', loc, 'sitemap URL lacks trailing slash');
    const file = fileForPath(u.pathname);
    if (!file) report.error('sitemap-404', loc, 'sitemap URL has no page in dist/');
    else {
      const p = byRoute.get(routeFromFile(file));
      if (p && !isIndexable(p)) report.error('sitemap-noindex', loc, `sitemap contains a ${p.type === 'embed' ? 'embed' : 'noindex/404'} page`);
    }
  }
  const listed = new Set([...urls.keys()].map((l) => trailSlash(new URL(l).pathname)));
  for (const page of pages) {
    if (isIndexable(page) && !listed.has(page.route)) report.error('sitemap-coverage', page.route, 'indexable page missing from sitemap');
  }
}

// robots.txt
const robotsFile = path.join(DIST, 'robots.txt');
if (!fs.existsSync(robotsFile)) report.error('robots-missing', 'dist/robots.txt', 'robots.txt missing (add public/robots.txt or a robots.txt.ts endpoint)');
else {
  const robots = fs.readFileSync(robotsFile, 'utf8');
  const groups = [];
  let cur = null;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const [k, ...rest] = line.split(':');
    const key = k.trim().toLowerCase();
    const val = rest.join(':').trim();
    if (key === 'user-agent') {
      if (!cur || cur.rules.length) groups.push((cur = { agents: [], rules: [] }));
      cur.agents.push(val.toLowerCase());
    } else if (cur && (key === 'allow' || key === 'disallow')) cur.rules.push([key, val]);
  }
  const blocksAll = (g) => g.rules.some(([k, v]) => k === 'disallow' && v === '/');
  const star = groups.find((g) => g.agents.includes('*'));
  if (star && blocksAll(star)) report.error('robots-block-all', 'robots.txt', 'User-agent: * is disallowed from /');
  for (const bot of ['googlebot', 'bingbot', 'oai-searchbot', 'perplexitybot', 'claude-searchbot']) {
    const g = groups.find((x) => x.agents.includes(bot));
    if (g && blocksAll(g)) report.error('robots-block-bot', 'robots.txt', `${bot} is blocked; allow search/answer-engine bots (docs/SEO-PLAYBOOK.md section 2)`);
  }
  if (groups.some((g) => g.rules.some(([k, v]) => k === 'disallow' && /_astro|\.css|\.js/.test(v)))) {
    report.error('robots-assets', 'robots.txt', 'robots.txt blocks CSS/JS assets');
  }
  const sm = [...robots.matchAll(/^sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  if (!sm.length) report.error('robots-sitemap', 'robots.txt', 'no Sitemap: line');
  else if (siteOrigin && !sm.every((s) => s.startsWith(siteOrigin))) report.error('robots-sitemap', 'robots.txt', `Sitemap line host differs from siteUrl (${sm.join(', ')})`);
}

// IndexNow key file
if (site.indexNowKey && !/replace-me/.test(site.indexNowKey)) {
  if (!fs.existsSync(path.join(DIST, `${site.indexNowKey}.txt`))) report.error('indexnow', `${site.indexNowKey}.txt`, 'IndexNow key configured but public/{key}.txt is missing');
} else {
  report.launch('indexnow-placeholder', 'src/config/site.ts', 'indexNowKey is still the placeholder; generate a key and add public/{key}.txt');
}

// docs/KEYWORD-MAP.md coverage + cannibalization
const mapFile = path.join(ROOT, 'docs', 'KEYWORD-MAP.md');
if (!fs.existsSync(mapFile)) report.error('keyword-map', 'docs/KEYWORD-MAP.md', 'file missing');
else {
  const rows = [];
  for (const line of fs.readFileSync(mapFile, 'utf8').split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    const route = (cells[0] || '').match(/^`(\/[^`]*)`$/);
    if (route && cells[2]) rows.push({ route: route[1], primary: cells[2].replace(/`/g, '').toLowerCase() });
  }
  const mapped = new Set(rows.map((r) => r.route));
  for (const page of pages) {
    if (page.type === 'embed' || page.type === '404') continue;
    if (!mapped.has(page.route)) report.error('keyword-map', page.route, 'page is not listed in docs/KEYWORD-MAP.md (assign a primary keyword before shipping)');
  }
  const owners = new Map();
  for (const r of rows) {
    if (r.primary === 'none' || r.primary.startsWith('(none')) continue;
    if (owners.has(r.primary)) report.error('cannibalization', r.route, `primary keyword "${r.primary}" is also the primary for ${owners.get(r.primary)}`);
    else owners.set(r.primary, r.route);
  }
}

report.exit();
