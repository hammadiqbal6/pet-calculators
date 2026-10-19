#!/usr/bin/env node
/**
 * AdSense readiness audit over dist/. Run after `npm run build`.
 *
 * Encodes docs/ADSENSE.md and the checklist in docs/MARKET-RESEARCH.md section 4:
 *  - required trust pages exist and have real copy (about, contact, privacy, terms, methodology)
 *  - privacy policy discloses AdSense / third-party ad cookies, personalised ads and opt-out
 *  - ads.txt matches the configured publisher ID (when one is set)
 *  - no thin pages, no ads on 404/embed/legal/thin pages, ads never above the calculator
 *  - minimum inventory (tools + guides), visible disclaimers, no placeholder or banned copy
 *  - a certified CMP is present once ads are enabled
 *
 * Exit code 1 on errors. AUDIT_PROD=1 promotes launch blockers to errors.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  DIST,
  HUB_ROUTES,
  LEGAL_ROUTES,
  LIMITS,
  Report,
  isIndexable,
  loadPages,
  readSiteConfig,
} from './lib.mjs';

const report = new Report('adsense');
const site = readSiteConfig();
const pages = loadPages();
const byRoute = new Map(pages.map((p) => [p.route, p]));
const adsEnabled = Boolean(site.adsensePublisherId);

report.note(adsEnabled ? `ads enabled (${site.adsensePublisherId})` : 'ads disabled (adsensePublisherId empty): checking readiness only');

// required pages
for (const route of [...LEGAL_ROUTES, ...HUB_ROUTES, '/']) {
  if (!byRoute.has(route)) report.error('required-page', route, 'required page missing from dist/');
}
if (!pages.some((p) => p.type === '404')) report.error('required-page', '/404.html', 'custom 404 page missing');

const tools = pages.filter((p) => p.type === 'tool');
const guides = pages.filter((p) => p.type === 'guide');
if (tools.length < LIMITS.minToolPages) report.error('inventory', '/tools/', `${tools.length} tool pages; need >= ${LIMITS.minToolPages} before applying (docs/ADSENSE.md)`);
if (guides.length < LIMITS.minGuidePages) report.error('inventory', '/guides/', `${guides.length} guides; need >= ${LIMITS.minGuidePages} before applying`);

// trust pages: real copy, contact method, privacy content
for (const route of LEGAL_ROUTES) {
  const page = byRoute.get(route);
  if (!page) continue;
  const min = route === '/about/' || route === '/methodology/' ? 250 : LIMITS.legalMinWords;
  if (page.words < min) report.error('thin-trust-page', route, `only ${page.words} words (min ${min})`);
}
const contact = byRoute.get('/contact/');
if (contact && !contact.$('a[href^="mailto:"]').length && !contact.$('form').length) {
  report.error('contact', '/contact/', 'contact page needs a mailto: link or a form');
}
const privacy = byRoute.get('/privacy/');
if (privacy) {
  const t = privacy.$('main').text().toLowerCase();
  const need = [
    ['adsense|google adsense|google ads?\\b|advertis', 'mention Google AdSense / advertising'],
    ['cookie', 'explain cookies'],
    ['third[- ]party vendor|third[- ]party|vendors', 'say third-party vendors (including Google) serve ads using cookies'],
    ['prior visits|previous visits|based on (your )?(prior|previous) (visits|activity)|interest[- ]based|personali[sz]ed', 'say ads can be personalised from prior visits'],
    ['ads settings|adssettings|aboutads\\.info|opt[- ]out', 'explain how to opt out (Google Ads Settings / aboutads.info)'],
    ['analytics|ga4|google analytics|no analytics', 'describe analytics use'],
  ];
  for (const [re, msg] of need) {
    if (!new RegExp(re, 'i').test(t)) report.error('privacy', '/privacy/', `privacy policy must ${msg}`);
  }
  if (!privacy.$('a[href*="aboutads.info"], a[href*="adssettings.google.com"], a[href*="policies.google.com"]').length) {
    report.warn('privacy-links', '/privacy/', 'link to Google ad technology / Ads Settings / aboutads.info');
  }
}

// ads.txt
const adsTxt = path.join(DIST, 'ads.txt');
const activeAdsTxt = () =>
  fs
    .readFileSync(adsTxt, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .join('\n');
if (adsEnabled) {
  const pub = site.adsensePublisherId.replace(/^ca-/, '');
  if (!fs.existsSync(adsTxt)) report.error('ads-txt', 'ads.txt', `public/ads.txt missing; add "google.com, ${pub}, DIRECT, f08c47fec0942fa0"`);
  else if (!new RegExp(`google\\.com,\\s*${pub},\\s*DIRECT,\\s*f08c47fec0942fa0`, 'i').test(activeAdsTxt())) {
    report.error('ads-txt', 'ads.txt', `ads.txt has no active (uncommented) line for ${pub}`);
  }
} else if (fs.existsSync(adsTxt) && activeAdsTxt().trim()) {
  report.warn('ads-txt', 'ads.txt', 'ads.txt has active lines but adsensePublisherId is empty');
} else {
  report.note('ads.txt not required yet; add public/ads.txt right after AdSense approval');
}

// placement + consistency rules
const banned = [
  /\bguaranteed? (to )?(cure|safe|results?)\b/i,
  /\b(cures?|heals?) (your |a |the )?(dog|cat|pet)/i,
  /\b100% safe\b/i,
  /\bno need (to|for)\b[^.]{0,40}\bvet/i,
  /\binstead of (seeing |visiting |calling )?(a |your )?vet/i,
  /\blorem ipsum\b/i,
  /\bcoming soon\b/i,
  /\bunder construction\b/i,
  /\bTODO\b|\bTBD\b|\bFIXME\b/,
];
const shingles = new Map();
for (const page of pages) {
  const { $, route, type } = page;
  const slots = $('.ad-slot, ins.adsbygoogle');
  const where = route;
  const hasAdScript = /pagead2\.googlesyndication\.com/.test(page.html);

  if (!adsEnabled && (hasAdScript || $('ins.adsbygoogle').length)) report.error('ads-config', where, 'AdSense code in HTML while adsensePublisherId is empty');
  if (adsEnabled && !hasAdScript) report.error('ads-config', where, 'adsensePublisherId set but adsbygoogle.js is not loaded');

  if (['404', 'embed'].includes(type) && slots.length) report.error('ads-placement', where, `${type} page must not contain ad slots`);
  if (type === 'legal' && slots.length) report.error('ads-placement', where, 'ad slots on a legal/trust page');
  if (slots.length > 3) report.warn('ads-density', where, `${slots.length} ad slots on one page (max 3 recommended)`);
  if (slots.length && page.words < 500) report.error('ads-thin', where, `ads on a page with only ${page.words} words of content`);

  const form = $('main form').first();
  if (slots.length && form.length && (type === 'tool')) {
    const order = $('*').toArray();
    const firstAd = Math.min(...slots.toArray().map((el) => order.indexOf(el)));
    if (firstAd < order.indexOf(form[0])) report.error('ads-above-tool', where, 'ad slot appears before the calculator; keep the tool above ads');
  }
  if (slots.length && !$('.ad-slot[aria-label], ins[aria-label], [data-ad-label]').length) {
    report.warn('ads-label', where, 'ad slot has no aria-label / visible "Advertisement" label');
  }
  if (adsEnabled && slots.length && !/googlefc|fundingchoicesmessages|\bcmp\b|__tcfapi|didomi|cookiebot|onetrust/i.test(page.html)) {
    report.error('cmp', where, 'ads enabled without a certified CMP (required for EEA/UK/CH traffic); see docs/ADSENSE.md');
  }

  if (type === 'embed' || type === '404') continue;

  // thin / placeholder content
  const min = { tool: LIMITS.toolMinWords, guide: LIMITS.guideHardMinWords, hub: LIMITS.hubMinWords, legal: LIMITS.legalMinWords, home: 200, other: 200 }[type];
  if (page.words < min) report.error('thin-page', where, `${page.words} words of body copy (min ${min} for ${type} pages)`);
  for (const re of banned) {
    const m = page.text.match(re);
    if (m) report.error('banned-copy', where, `banned/placeholder copy: "${m[0]}"`);
  }
  if (/\[(veterinary reviewer|dvm|reviewer)[^\]]*\]/i.test(page.text)) {
    report.launch('reviewer-placeholder', where, 'visible reviewer placeholder text; add a real credentialed reviewer or remove the claim');
  }
  if ((type === 'tool' || type === 'guide') && !/not veterinary advice|not a substitute for (professional )?veterinary/i.test(page.html)) {
    report.error('disclaimer', where, 'YMYL page lacks the veterinary disclaimer');
  }
  if ((type === 'tool' || type === 'guide') && !isIndexable(page)) report.error('noindex', where, 'content page is noindex');

  // near-duplicate detection (5-word shingles) across tool/guide bodies
  if (type === 'tool' || type === 'guide') {
    const words = page.text.toLowerCase().match(/[a-z0-9']+/g) || [];
    const set = new Set();
    for (let i = 0; i + 5 <= words.length; i += 1) set.add(words.slice(i, i + 5).join(' '));
    shingles.set(route, set);
  }
}

const routes = [...shingles.keys()];
for (let i = 0; i < routes.length; i += 1) {
  for (let j = i + 1; j < routes.length; j += 1) {
    const a = shingles.get(routes[i]);
    const b = shingles.get(routes[j]);
    let inter = 0;
    for (const s of a) if (b.has(s)) inter += 1;
    const jac = inter / (a.size + b.size - inter || 1);
    if (jac > 0.5) report.error('duplicate-content', routes[i], `${Math.round(jac * 100)}% 5-word-shingle overlap with ${routes[j]} (near-duplicate pages)`);
    else if (jac > 0.3) report.warn('duplicate-content', routes[i], `${Math.round(jac * 100)}% overlap with ${routes[j]}; differentiate the copy`);
  }
}

// trust links reachable from every page footer
const home = byRoute.get('/');
if (home) {
  for (const route of ['/privacy/', '/about/', '/contact/', '/terms/']) {
    if (!home.$(`footer a[href="${route}"]`).length) report.error('footer-link', '/', `footer does not link to ${route}`);
  }
}

// cookie banner vs CMP
if (adsEnabled) report.note('verify the CMP renders in a real browser from an EEA/UK IP (cannot be checked statically)');
else report.note(`cookie notice is not a TCF CMP; add a certified CMP before enabling ads (docs/ADSENSE.md)`);

report.exit();
