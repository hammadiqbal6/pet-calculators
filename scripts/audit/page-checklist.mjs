#!/usr/bin/env node
/**
 * Fast per-page checklist audit over dist/ (run `npm run build` first).
 *
 * Fails when a page breaks the shared SEO/AEO checklist:
 * - missing/duplicate title or meta description
 * - not exactly one H1
 * - missing self-referencing absolute canonical
 * - invalid / unparseable JSON-LD
 * - indexable page missing from sitemap
 * - raw link paths shown as visible text (e.g. "/tools/foo/" as content)
 * - placeholder / ad-stub / internal-note leaks
 * - missing viewport
 * - answer block not first after H1 (tools/guides/hubs)
 *
 * Exit 1 on any error. Warnings never fail unless --strict / AUDIT_STRICT=1.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  DIST,
  Report,
  loadPages,
  parseJsonLd,
  readSiteConfig,
  trailSlash,
} from './lib.mjs';

const report = new Report('page-checklist');
const site = readSiteConfig();
const pages = loadPages();
const siteOrigin = (site.siteUrl || '').replace(/\/$/, '');

const PLACEHOLDER_RE =
  /\b(lorem ipsum|coming soon|under construction|TODO|TBD|\[insert|placeholder|ad space reserved|ahrefs kd|\(kd \d+\))\b/i;
const LEAK_RE = /—\s*not a calculator(?:\s+page)?|\(not a calculator\)|pair well with chocolate/i;
const RAW_PATH_AS_TEXT_RE = /(?:^|[\s>(])(\/(?:tools|guides|dogs|cats|embed)\/[a-z0-9-/]*\/)(?:[\s<).,]|$)/i;

function sitemapLocs() {
  const file = path.join(DIST, 'sitemap-0.xml');
  const alt = path.join(DIST, 'sitemap.xml');
  const target = fs.existsSync(file) ? file : fs.existsSync(alt) ? alt : null;
  if (!target) return null;
  const xml = fs.readFileSync(target, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return new Set(locs.map((u) => {
    try {
      const p = new URL(u).pathname;
      return trailSlash(p === '' ? '/' : p);
    } catch {
      return u;
    }
  }));
}

const sitemap = sitemapLocs();
if (!sitemap) {
  report.error('sitemap-missing', 'dist/', 'sitemap.xml / sitemap-0.xml missing after build');
}

const seenTitles = new Map();
const seenDescs = new Map();

for (const page of pages) {
  const { $, route, type, robots } = page;
  const where = route;
  if (type === '404' || type === 'embed') continue;

  if (!$('meta[name="viewport"]').length) {
    report.error('viewport', where, 'meta viewport missing');
  }

  const title = $('head > title').first().text().trim();
  if (!title) report.error('title-missing', where, 'missing <title>');
  else if (seenTitles.has(title)) {
    report.error('title-duplicate', where, `duplicate <title> also on ${seenTitles.get(title)}`);
  } else seenTitles.set(title, route);

  const desc = ($('meta[name="description"]').first().attr('content') || '').trim();
  if (!desc) report.error('desc-missing', where, 'missing meta description');
  else if (seenDescs.has(desc)) {
    report.error('desc-duplicate', where, `duplicate meta description also on ${seenDescs.get(desc)}`);
  } else seenDescs.set(desc, route);

  const h1Count = $('main h1, h1').length;
  if (h1Count !== 1) {
    report.error('h1-count', where, `expected exactly 1 H1, found ${h1Count}`);
  }

  const canonical = ($('link[rel="canonical"]').first().attr('href') || '').trim();
  if (!canonical) {
    report.error('canonical-missing', where, 'missing canonical');
  } else {
    let ok = false;
    try {
      const u = new URL(canonical);
      ok = u.protocol === 'https:' && trailSlash(u.pathname) === trailSlash(route);
      if (siteOrigin && u.origin !== siteOrigin) {
        report.error('canonical-origin', where, `canonical origin ${u.origin} != siteUrl ${siteOrigin}`);
      }
    } catch {
      ok = false;
    }
    if (!ok) report.error('canonical-self', where, `canonical not absolute self-ref https: "${canonical}"`);
  }

  const jsonBlocks = parseJsonLd(page);
  if (!jsonBlocks.length && type !== 'other') {
    report.error('jsonld-missing', where, 'no JSON-LD blocks');
  }
  for (const block of jsonBlocks) {
    if (block.__parseError) {
      report.error('jsonld-invalid', where, `JSON-LD parse error: ${block.__parseError}`);
    }
  }

  const noindex = /noindex/i.test(robots || '');
  if (sitemap && !noindex && isIndexableRoute(type) && !sitemap.has(trailSlash(route))) {
    report.error('sitemap-coverage', where, 'indexable page missing from sitemap');
  }

  const main = $('main').length ? $('main').first() : $('body');
  const mainText = main.text().replace(/\s+/g, ' ').trim();
  if (PLACEHOLDER_RE.test(mainText)) {
    report.error('placeholder-text', where, 'placeholder / stub / internal SEO note text found in page body');
  }
  if (LEAK_RE.test(mainText)) {
    report.error('internal-leak', where, 'internal note leak (e.g. "not a calculator page") in visible copy');
  }

  // Visible text that looks like a bare internal path (not inside an href attribute).
  main.find('*').contents().each((_, node) => {
    if (node.type !== 'text') return;
    const t = (node.data || '').trim();
    if (!t) return;
    if (RAW_PATH_AS_TEXT_RE.test(t) && !/^https?:\/\//i.test(t)) {
      report.error('raw-path-text', where, `raw internal path shown as text: "${t.slice(0, 80)}"`);
    }
  });

  if (['tool', 'guide', 'hub', 'home'].includes(type)) {
    const h1 = main.find('h1').first();
    if (h1.length) {
      let el = h1[0].nextSibling;
      let firstBlock = null;
      while (el) {
        if (el.type === 'tag') {
          const name = el.name;
          if (name === 'script' || name === 'style') {
            el = el.nextSibling;
            continue;
          }
          firstBlock = el;
          break;
        }
        el = el.nextSibling;
      }
      // Also check parent's next elements if h1 is wrapped
      if (!firstBlock) {
        const parent = h1.parent();
        const kids = parent.children().toArray();
        const idx = kids.findIndex((k) => k === h1[0] || (k.children && k.children.includes?.(h1[0])));
        // Prefer scanning siblings after h1 within main
        const after = h1.nextAll().filter((_, n) => {
          const tag = n.tagName;
          return tag && tag !== 'script' && tag !== 'style';
        }).first();
        if (after.length) firstBlock = after[0];
      }
      const $first = firstBlock ? $(firstBlock) : null;
      const cls = ($first?.attr('class') || '');
      const tag = firstBlock?.name || '';
      const isAnswer =
        /answer-first|lead|emergency-lead|takeaway/.test(cls) ||
        (tag === 'p' && ($first?.text() || '').trim().length > 20) ||
        (tag === 'div' && /answer|hero|tool-shell/.test(cls));
      // Tool pages: calculator may follow answer; hub/home need answer then cards soon
      if (!isAnswer && type !== 'tool') {
        // Allow hero section wrapping lead
        const heroLead = main.find('.lead, .answer-first, .emergency-lead').first();
        if (!heroLead.length) {
          report.error('answer-first', where, 'no answer-first / lead block after H1');
        }
      }
      if (type === 'tool') {
        const answer = main.find('.answer-first, .emergency-lead').first();
        const form = main.find('form.calc-form, form').first();
        if (!answer.length) {
          report.error('answer-first', where, 'tool page missing .answer-first or .emergency-lead');
        }
        if (!form.length) {
          report.error('tool-form', where, 'tool page missing calculator form');
        } else if (answer.length && form.length) {
          const all = main.find('*').toArray();
          const answerIdx = all.indexOf(answer[0]);
          const formIdx = all.indexOf(form[0]);
          // Emergency pages may put hotlines before the form; otherwise answer precedes the form.
          if (
            answerIdx >= 0 &&
            formIdx >= 0 &&
            formIdx < answerIdx &&
            !main.find('.emergency-lead').length
          ) {
            report.error('answer-before-tool', where, 'calculator form appears before answer-first block');
          }
        }
      }
      if (type === 'home' || type === 'hub') {
        const card = main.find('a.tool-card').first();
        if (!card.length) {
          report.error('hub-cards', where, 'hub/home missing tool-card links');
        }
      }
    }
  }
}

function isIndexableRoute(type) {
  return ['home', 'hub', 'tool', 'guide', 'legal', 'other'].includes(type);
}

report.exit();
