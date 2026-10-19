/**
 * Shared helpers for scripts/audit/*.mjs.
 *
 * All auditors read the built site in dist/ (run `npm run build` first). They never hit the
 * network unless a script is explicitly passed --external.
 *
 * Environment variables:
 *   AUDIT_DIST   Override the dist directory (default ./dist)
 *   AUDIT_PROD   "1" promotes launch blockers (placeholder domain, placeholder reviewer, missing
 *                ads.txt, ...) from warnings to errors. Set it in the production deploy pipeline.
 *   AUDIT_STRICT "1" (or --strict) treats every warning as an error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIST = path.resolve(process.env.AUDIT_DIST || path.join(ROOT, 'dist'));
export const PROD = process.env.AUDIT_PROD === '1';
export const STRICT = process.env.AUDIT_STRICT === '1' || process.argv.includes('--strict');

/** Thresholds shared by the auditors. Keep in sync with .cursor/rules/seo-pages.mdc. */
export const LIMITS = {
  titleMin: 30,
  titleMax: 65,
  titleHardMax: 80,
  descMin: 70,
  descMax: 160,
  descHardMax: 200,
  toolMinWords: 600,
  guideMinWords: 800,
  guideHardMinWords: 600,
  hubMinWords: 150,
  legalMinWords: 150,
  minToolPages: 8,
  minGuidePages: 3,
  minRelatedLinks: 2,
};

export const HUB_ROUTES = ['/tools/', '/dogs/', '/cats/', '/guides/'];
export const LEGAL_ROUTES = ['/about/', '/contact/', '/privacy/', '/terms/', '/methodology/'];

export function readSiteConfig() {
  const file = path.join(ROOT, 'src', 'config', 'site.ts');
  const src = fs.readFileSync(file, 'utf8');
  const pick = (key) => {
    const m = src.match(new RegExp(`${key}:\\s*['"\`]([^'"\`]*)['"\`]`));
    return m ? m[1] : '';
  };
  const constStr = (name, fallback = '') => {
    const m = src.match(new RegExp(`export const ${name}\\s*=\\s*['"\`]([^'"\`]*)['"\`]`));
    return m ? m[1] : fallback;
  };
  // Mirror src/config/site.ts: PUBLIC_* / INDEXNOW_* env wins, then exported defaults.
  const envSiteUrl = (process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  const fallbackSiteUrl = constStr(
    'FALLBACK_SITE_URL',
    'https://pet-calculators.hammadiqbal117.workers.dev',
  ).replace(/\/$/, '');
  const envGa4 = (process.env.PUBLIC_GA4_MEASUREMENT_ID || '').trim();
  const envAdsense = (process.env.PUBLIC_ADSENSE_PUBLISHER_ID || '').trim();
  const envIndexNow = (process.env.INDEXNOW_KEY || '').trim();
  const defaultIndexNow = constStr('DEFAULT_INDEXNOW_KEY', '');
  const literalIndexNow = pick('indexNowKey');
  return {
    siteUrl: envSiteUrl || fallbackSiteUrl,
    adsensePublisherId: envAdsense || pick('adsensePublisherId'),
    indexNowKey: envIndexNow || defaultIndexNow || literalIndexNow,
    ga4MeasurementId: envGa4,
    buildDate: pick('buildDate'),
  };
}

export function distExists() {
  return fs.existsSync(DIST) && fs.statSync(DIST).isDirectory();
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

export function listFiles(dir = DIST) {
  return [...walk(dir)];
}

export function routeFromFile(file) {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

export function pageType(route) {
  if (route === '/') return 'home';
  if (route === '/404.html' || route === '/404/') return '404';
  if (route.startsWith('/embed/')) return 'embed';
  if (/^\/tools\/[^/]+\/$/.test(route)) return 'tool';
  if (/^\/guides\/[^/]+\/$/.test(route)) return 'guide';
  if (HUB_ROUTES.includes(route)) return 'hub';
  if (LEGAL_ROUTES.includes(route)) return 'legal';
  return 'other';
}

const wordRe = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

export function countWords(text) {
  return (text.match(wordRe) || []).length;
}

/** Visible body copy: <main> minus scripts, forms (calculator UI), nav, ad slots and breadcrumbs. */
export function mainText($) {
  const root = $('main').length ? $('main').first().clone() : $('body').clone();
  root.find('script, style, noscript, form, nav, .ad-slot, .breadcrumbs, [aria-hidden="true"]').remove();
  return root.text().replace(/\s+/g, ' ').trim();
}

export function loadPages() {
  if (!distExists()) {
    console.error(`dist/ not found at ${DIST}. Run "npm run build" first.`);
    process.exit(2);
  }
  const pages = [];
  for (const file of listFiles()) {
    if (!file.endsWith('.html')) continue;
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);
    const route = routeFromFile(file);
    const text = mainText($);
    pages.push({
      file,
      route,
      type: pageType(route),
      html,
      $,
      text,
      words: countWords(text),
      robots: ($('meta[name="robots"]').attr('content') || '').toLowerCase(),
    });
  }
  pages.sort((a, b) => a.route.localeCompare(b.route));
  return pages;
}

export function isIndexable(page) {
  return page.type !== '404' && page.type !== 'embed' && !page.robots.includes('noindex');
}

export function trailSlash(p) {
  if (!p || p === '/') return '/';
  return p.endsWith('/') ? p : `${p}/`;
}

/** Resolve an href found on `fromRoute` to a normalized internal pathname, or null if external. */
export function resolveInternal(href, fromRoute, siteUrl) {
  if (!href) return null;
  const h = href.trim();
  if (/^(mailto:|tel:|javascript:|data:|sms:)/i.test(h)) return null;
  let url;
  try {
    url = new URL(h, `https://internal.invalid${fromRoute}`);
  } catch {
    return null;
  }
  if (url.host === 'internal.invalid') {
    return { pathname: decodeURIComponent(url.pathname), hash: url.hash.slice(1), search: url.search, raw: h };
  }
  if (siteUrl && url.origin === new URL(siteUrl).origin) {
    return { pathname: decodeURIComponent(url.pathname), hash: url.hash.slice(1), search: url.search, raw: h };
  }
  return null;
}

/** Map a pathname to a file in dist/, or null if nothing would be served for it. */
export function fileForPath(pathname) {
  const clean = pathname.replace(/^\/+/, '');
  const candidates = [
    path.join(DIST, clean),
    path.join(DIST, clean, 'index.html'),
    path.join(DIST, `${clean}.html`),
  ];
  for (const c of candidates) {
    if (c.startsWith(DIST) && fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

/**
 * Internal link analysis for every page. Returns broken links, missing fragments, links that
 * lack the trailing slash required by `trailingSlash: 'always'`, and an inbound-link graph.
 */
export function analyzeInternalLinks(pages, siteUrl) {
  const broken = [];
  const badFragments = [];
  const noSlash = [];
  const seenBroken = new Set();
  const inbound = new Map(pages.map((p) => [p.route, new Set()]));
  const idsByRoute = new Map();
  const idsFor = (page) => {
    if (!idsByRoute.has(page.route)) {
      const ids = new Set();
      page.$('[id]').each((_, el) => ids.add(page.$(el).attr('id')));
      page.$('a[name]').each((_, el) => ids.add(page.$(el).attr('name')));
      idsByRoute.set(page.route, ids);
    }
    return idsByRoute.get(page.route);
  };
  const byRoute = new Map(pages.map((p) => [p.route, p]));

  for (const page of pages) {
    const refs = [];
    page.$('a[href]').each((_, el) => refs.push({ kind: 'a', url: page.$(el).attr('href'), text: page.$(el).text().trim() }));
    page.$('img[src], script[src], source[src]').each((_, el) => refs.push({ kind: 'asset', url: page.$(el).attr('src') }));
    page.$('link[href]').each((_, el) => {
      const rel = (page.$(el).attr('rel') || '').toLowerCase();
      if (rel === 'canonical' || rel === 'alternate' || rel === 'dns-prefetch' || rel === 'preconnect') return;
      refs.push({ kind: 'asset', url: page.$(el).attr('href') });
    });

    for (const ref of refs) {
      const target = resolveInternal(ref.url, page.route, siteUrl);
      if (!target) continue;
      const file = fileForPath(target.pathname);
      if (!file) {
        const key = `${page.route}\u0000${ref.url}`;
        if (!seenBroken.has(key)) {
          seenBroken.add(key);
          broken.push({ from: page.route, to: ref.url, kind: ref.kind });
        }
        continue;
      }
      if (ref.kind !== 'a') continue;
      const targetRoute = routeFromFile(file);
      if (targetRoute !== page.route) inbound.get(targetRoute)?.add(page.route);
      if (
        !path.extname(target.pathname) &&
        !target.pathname.endsWith('/') &&
        target.pathname !== ''
      ) {
        noSlash.push({ from: page.route, to: ref.url });
      }
      if (target.hash && file.endsWith('.html')) {
        const dest = byRoute.get(targetRoute);
        if (dest && !idsFor(dest).has(target.hash)) {
          badFragments.push({ from: page.route, to: ref.url });
        }
      }
    }
  }
  return { broken, badFragments, noSlash, inbound };
}

/** Collects findings and prints a grouped report. */
export class Report {
  constructor(name) {
    this.name = name;
    this.errors = [];
    this.warnings = [];
    this.notes = [];
  }
  error(code, where, message) {
    this.errors.push({ code, where, message });
  }
  warn(code, where, message) {
    (STRICT ? this.errors : this.warnings).push({ code, where, message });
  }
  /** Warning in dev, error under AUDIT_PROD=1. */
  launch(code, where, message) {
    if (PROD) this.error(code, where, message);
    else this.warn(code, where, `${message} (blocks launch; error when AUDIT_PROD=1)`);
  }
  note(message) {
    this.notes.push(message);
  }
  print() {
    const group = (items) => {
      const map = new Map();
      for (const i of items) {
        const key = `${i.code}\u0000${i.message}`;
        if (!map.has(key)) map.set(key, { ...i, wheres: [] });
        map.get(key).wheres.push(i.where);
      }
      return [...map.values()];
    };
    console.log(`\n== ${this.name} ==`);
    for (const n of this.notes) console.log(`  info  ${n}`);
    for (const [label, items] of [
      ['ERROR', this.errors],
      ['warn ', this.warnings],
    ]) {
      for (const g of group(items)) {
        const shown = g.wheres.slice(0, 6).join(', ');
        const more = g.wheres.length > 6 ? ` (+${g.wheres.length - 6} more)` : '';
        console.log(`  ${label} [${g.code}] ${g.message}${g.wheres[0] ? `\n         at ${shown}${more}` : ''}`);
      }
    }
    console.log(
      `  -> ${this.errors.length} error(s), ${this.warnings.length} warning(s)${this.errors.length ? ' - FAILED' : ' - ok'}`,
    );
  }
  exit() {
    this.print();
    process.exit(this.errors.length ? 1 : 0);
  }
}

export function parseJsonLd(page) {
  const blocks = [];
  page.$('script[type="application/ld+json"]').each((_, el) => {
    const raw = page.$(el).contents().text();
    try {
      const data = JSON.parse(raw);
      for (const item of Array.isArray(data) ? data : [data]) {
        if (item && Array.isArray(item['@graph'])) blocks.push(...item['@graph'].map((g) => ({ '@context': item['@context'], ...g })));
        else blocks.push(item);
      }
    } catch (err) {
      blocks.push({ __parseError: String(err.message || err) });
    }
  });
  return blocks;
}

export const typesOf = (block) => [].concat(block?.['@type'] ?? []);
