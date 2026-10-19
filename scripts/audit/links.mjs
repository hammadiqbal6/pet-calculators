#!/usr/bin/env node
/**
 * Broken internal link check over dist/.
 *
 *   node scripts/audit/links.mjs              # internal links, assets and #fragments
 *   node scripts/audit/links.mjs --external   # also HEAD/GET every external http(s) link (needs network)
 *
 * Errors: internal href/src that resolves to no file in dist/ (a link to /tools/foo/ with no
 * dist/tools/foo/index.html), including images, scripts and stylesheets.
 * Warnings: missing #fragment targets, internal links without the trailing slash (the site uses
 * trailingSlash: 'always'), links to /index.html, empty or generic anchor text.
 */
import { Report, analyzeInternalLinks, loadPages, readSiteConfig } from './lib.mjs';

const report = new Report('links');
const { siteUrl } = readSiteConfig();
const pages = loadPages();
const { broken, badFragments, noSlash } = analyzeInternalLinks(pages, siteUrl);

for (const b of broken) report.error('broken-link', b.from, `broken internal ${b.kind === 'a' ? 'link' : 'asset'} -> ${b.to}`);
for (const b of badFragments) report.warn('missing-fragment', b.from, `fragment target not found -> ${b.to}`);
for (const b of noSlash) report.warn('no-trailing-slash', b.from, `internal link missing trailing slash -> ${b.to}`);

const generic = /^(click here|here|read more|learn more|this|link|more)$/i;
for (const page of pages) {
  page.$('a[href]').each((_, el) => {
    const $el = page.$(el);
    const href = $el.attr('href') || '';
    if (/\/index\.html($|[?#])/.test(href)) report.warn('index-html-link', page.route, `link to ${href}; use the clean URL`);
    const label = ($el.text() || $el.attr('aria-label') || $el.find('img').attr('alt') || '').trim();
    if (!label) report.warn('empty-anchor', page.route, `link with no accessible text -> ${href}`);
    else if (generic.test(label)) report.warn('generic-anchor', page.route, `generic anchor text "${label}" -> ${href}`);
  });
}

const external = new Map();
for (const page of pages) {
  page.$('a[href^="http"]').each((_, el) => {
    const href = page.$(el).attr('href');
    try {
      if (siteUrl && new URL(href).origin === new URL(siteUrl).origin) return;
    } catch {
      return;
    }
    if (!external.has(href)) external.set(href, []);
    external.get(href).push(page.route);
  });
}
report.note(`${pages.length} pages scanned, ${external.size} unique external links (use --external to verify)`);

if (process.argv.includes('--external')) {
  const check = async (url) => {
    for (const method of ['HEAD', 'GET']) {
      try {
        const res = await fetch(url, {
          method,
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
          headers: { 'user-agent': 'Mozilla/5.0 (compatible; PetCalcLinkCheck/1.0)' },
        });
        if (res.status < 400) return null;
        if (method === 'GET' || ![403, 405, 429].includes(res.status)) return `HTTP ${res.status}`;
      } catch (err) {
        if (method === 'GET') return String(err.cause?.code || err.message);
      }
    }
    return null;
  };
  const queue = [...external.keys()];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const url = queue.pop();
      const problem = await check(url);
      if (problem) report.warn('external-link', external.get(url)[0], `${problem} -> ${url}`);
    }
  });
  await Promise.all(workers);
}

report.exit();
