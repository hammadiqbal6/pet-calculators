#!/usr/bin/env node
/**
 * JavaScript / CSS / HTML size budgets from dist/ (gzip). Run after `npm run build`.
 *
 * Budgets follow docs/SEO-PLAYBOOK.md section 2 ("plain HTML with light JS, no heavy framework")
 * and .cursor/rules/performance-budget.mdc. Override any limit with an env var, for example
 *   BUDGET_PAGE_JS_KB=40 npm run audit:budgets
 *
 * Measured per page: first-party JS = every same-origin <script src> (and the modules they
 * statically import from dist/_astro) plus inline non-JSON-LD <script> bodies.
 * Third-party tags (GA4, AdSense, CMP) are not counted but must be on the allow-list.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { DIST, Report, fileForPath, listFiles, loadPages, readSiteConfig, resolveInternal } from './lib.mjs';

const kb = (name, def) => Number(process.env[name] ?? def);
const BUDGET = {
  pageJsKb: kb('BUDGET_PAGE_JS_KB', 25), // gzip, all first-party JS a page loads
  embedJsKb: kb('BUDGET_EMBED_JS_KB', 15),
  singleJsKb: kb('BUDGET_SINGLE_JS_KB', 20), // gzip, any single emitted .js file
  totalJsKb: kb('BUDGET_TOTAL_JS_KB', 200), // gzip, all .js in dist
  pageHtmlKb: kb('BUDGET_PAGE_HTML_KB', 60), // gzip, HTML document including inlined CSS
  cssKb: kb('BUDGET_CSS_KB', 25), // gzip, CSS inlined in a page + external CSS files
  imageKb: kb('BUDGET_IMAGE_KB', 150), // raw, any single image
  inlineScriptKb: kb('BUDGET_INLINE_SCRIPT_KB', 6), // gzip, one inline script
};
const THIRD_PARTY_ALLOW = [
  /(^|\.)googletagmanager\.com$/,
  /(^|\.)google-analytics\.com$/,
  /(^|\.)googlesyndication\.com$/,
  /(^|\.)doubleclick\.net$/,
  /(^|\.)fundingchoicesmessages\.google\.com$/,
  /(^|\.)googleadservices\.com$/,
];

const report = new Report('budgets');
const site = readSiteConfig();
const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const fmt = (n) => `${(n / 1024).toFixed(1)} KB`;
const fileGz = new Map();
const gzOf = (file) => {
  if (!fileGz.has(file)) fileGz.set(file, gz(fs.readFileSync(file)));
  return fileGz.get(file);
};

function importsOf(file, seen = new Set()) {
  if (seen.has(file) || !fs.existsSync(file)) return seen;
  seen.add(file);
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/(?:import|export)[^'"`;]*?from\s*["'](\.{1,2}\/[^"']+)["']|import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)|import\s*["'](\.{1,2}\/[^"']+)["']/g)) {
    const spec = m[1] || m[2] || m[3];
    importsOf(path.resolve(path.dirname(file), spec), seen);
  }
  return seen;
}

const jsFiles = listFiles().filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
let totalJs = 0;
for (const f of jsFiles) {
  const size = gzOf(f);
  totalJs += size;
  if (size > BUDGET.singleJsKb * 1024) report.error('js-file', path.relative(DIST, f), `${fmt(size)} gzip exceeds ${BUDGET.singleJsKb} KB per-file budget`);
}
if (totalJs > BUDGET.totalJsKb * 1024) report.error('js-total', 'dist/', `all JS is ${fmt(totalJs)} gzip (budget ${BUDGET.totalJsKb} KB)`);

for (const f of listFiles().filter((x) => x.endsWith('.css'))) {
  if (gzOf(f) > BUDGET.cssKb * 1024) report.error('css-file', path.relative(DIST, f), `${fmt(gzOf(f))} gzip exceeds ${BUDGET.cssKb} KB`);
}

for (const f of listFiles().filter((x) => /\.(png|jpe?g|gif|webp|avif)$/i.test(x))) {
  const size = fs.statSync(f).size;
  if (size > BUDGET.imageKb * 1024) report.error('image', path.relative(DIST, f), `${fmt(size)} exceeds ${BUDGET.imageKb} KB; compress or convert to AVIF/WebP`);
}

const pages = loadPages();
const rows = [];
for (const page of pages) {
  const { $, route, type } = page;
  const files = new Set();
  let inline = 0;
  $('script').each((_, el) => {
    const $el = $(el);
    const stype = ($el.attr('type') || '').toLowerCase();
    if (stype === 'application/ld+json' || stype === 'application/json') return;
    const src = $el.attr('src');
    if (src) {
      const internal = resolveInternal(src, route, site.siteUrl);
      if (internal) {
        const file = fileForPath(internal.pathname);
        if (!file) return;
        for (const dep of importsOf(file)) files.add(dep);
      } else {
        let host = '';
        try {
          host = new URL(src, 'https://x.invalid').host;
        } catch {}
        if (host && !THIRD_PARTY_ALLOW.some((re) => re.test(host))) {
          report.error('third-party', route, `unapproved third-party script: ${src}`);
        }
      }
    } else {
      const body = $el.contents().text();
      const size = gz(Buffer.from(body));
      inline += size;
      if (size > BUDGET.inlineScriptKb * 1024) report.error('inline-script', route, `inline script is ${fmt(size)} gzip (budget ${BUDGET.inlineScriptKb} KB); move it to a bundled <script>`);
    }
  });
  let jsBytes = inline;
  for (const f of files) jsBytes += gzOf(f);
  const limit = (type === 'embed' ? BUDGET.embedJsKb : BUDGET.pageJsKb) * 1024;
  if (jsBytes > limit) report.error('page-js', route, `first-party JS is ${fmt(jsBytes)} gzip (budget ${limit / 1024} KB)`);

  const htmlGz = gz(Buffer.from(page.html));
  if (htmlGz > BUDGET.pageHtmlKb * 1024) report.error('page-html', route, `HTML is ${fmt(htmlGz)} gzip (budget ${BUDGET.pageHtmlKb} KB)`);

  let cssInline = 0;
  $('style').each((_, el) => {
    cssInline += gz(Buffer.from($(el).contents().text()));
  });
  if (cssInline > BUDGET.cssKb * 1024) report.error('page-css', route, `inline CSS is ${fmt(cssInline)} gzip (budget ${BUDGET.cssKb} KB)`);

  $('script[src][type="module"], script[src]:not([type])').each((_, el) => {
    if (!$(el).attr('async') && !$(el).attr('defer') && ($(el).attr('type') || '') !== 'module' && !/^https?:/.test($(el).attr('src') || '')) {
      report.warn('blocking-script', route, `render-blocking <script src="${$(el).attr('src')}">; add defer or type=module`);
    }
  });
  $('link[rel="stylesheet"][href]').each((_, el) => {
    report.warn('external-css', route, `render-blocking stylesheet ${$(el).attr('href')}; inline critical CSS (astro inlineStylesheets: "always")`);
  });
  $('img').each((_, el) => {
    if ($(el).attr('loading') === 'lazy' && $(el).closest('main').find('img').first()[0] === el) {
      report.warn('lcp-lazy', route, 'first image in <main> is loading="lazy"; do not lazy-load the LCP element');
    }
  });
  rows.push({ route, js: jsBytes, html: htmlGz });
}

rows.sort((a, b) => b.js - a.js);
report.note(`pages: ${pages.length}; total JS in dist ${fmt(totalJs)} gzip across ${jsFiles.length} files`);
for (const r of rows.slice(0, 3)) report.note(`heaviest JS: ${r.route} ${fmt(r.js)} gzip, HTML ${fmt(r.html)} gzip`);
report.exit();
