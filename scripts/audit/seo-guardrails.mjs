#!/usr/bin/env node
/**
 * Hard SEO guardrails — fail the build if dist/ or source regresses the
 * indexing / AEO bugs documented in docs/SEO-GUARDRAILS.md and docs/CUSTOM-DOMAIN.md.
 *
 * Requires: npm run build (dist/ present).
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { DIST, LIMITS, ROOT, readSiteConfig, routeFromFile } from './lib.mjs';

const errors = [];
const PLACEHOLDER_KEY = '00000000000000000000000000000000';
const FORBIDDEN_HOST = 'example.com';

function fail(msg) {
  errors.push(msg);
}

function walkHtml(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, files);
    else if (ent.name.endsWith('.html')) files.push(p);
  }
  return files;
}

function walkFiles(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git' || ent.name === '.astro') continue;
      walkFiles(p, pred, out);
    } else if (pred(p)) out.push(p);
  }
  return out;
}

function readIfExists(rel) {
  const p = path.join(DIST, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function len(s) {
  return [...(s || '').trim()].length;
}

if (!fs.existsSync(DIST)) {
  console.error('seo-guardrails: dist/ missing — run npm run build first');
  process.exit(1);
}

const site = readSiteConfig();
const siteOrigin = (site.siteUrl || '').replace(/\/$/, '');
if (!siteOrigin) fail('siteUrl unresolved (PUBLIC_SITE_URL / FALLBACK_SITE_URL)');

// --- example.com must not appear in SEO surfaces ---
const textSurfaces = ['sitemap-index.xml', 'sitemap-0.xml', 'robots.txt', 'llms.txt', '_redirects'];
for (const rel of textSurfaces) {
  const text = readIfExists(rel);
  if (text == null) {
    if (rel.startsWith('sitemap')) fail(`missing ${rel}`);
    continue;
  }
  if (text.toLowerCase().includes(FORBIDDEN_HOST)) fail(`${rel} contains ${FORBIDDEN_HOST}`);
  if (siteOrigin && text.includes('://') && !text.includes(siteOrigin) && /sitemap|robots|llms/.test(rel)) {
    // robots/llms/sitemap should only reference the configured origin
    if (rel !== '_redirects' && new RegExp(`https?://(?!${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i').test(text.replace(/#.*/g, ''))) {
      // Allow comments; flag foreign absolute hosts in loc/Sitemap lines
      const foreign = [...text.matchAll(/https?:\/\/[^\s<"']+/gi)].filter((m) => !m[0].startsWith(siteOrigin));
      if (foreign.length) fail(`${rel}: foreign host ${foreign[0][0]} (expected ${siteOrigin})`);
    }
  }
}

const htmlFiles = walkHtml(DIST);
const titleSeen = new Map();

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  const route = routeFromFile(file);
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  const robots = ($('meta[name="robots"]').attr('content') || '').toLowerCase();
  const isEmbed = rel.startsWith('embed/') || route.startsWith('/embed/');
  const is404 = rel === '404.html' || route === '/404.html' || route === '/404/';

  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const title = $('head > title').first().text().trim();
  const desc = ($('meta[name="description"]').attr('content') || '').trim();

  if (canonical.toLowerCase().includes(FORBIDDEN_HOST)) fail(`${rel}: canonical contains ${FORBIDDEN_HOST}`);
  if (ogUrl.toLowerCase().includes(FORBIDDEN_HOST)) fail(`${rel}: og:url contains ${FORBIDDEN_HOST}`);
  if (ogImage.toLowerCase().includes(FORBIDDEN_HOST)) fail(`${rel}: og:image contains ${FORBIDDEN_HOST}`);

  if (ogImage && /\/$/.test(ogImage)) fail(`${rel}: og:image ends with trailing slash (${ogImage})`);

  if (!isEmbed && !is404 && robots.includes('noindex')) {
    fail(`${rel}: unexpected noindex on production page`);
  }

  // Host must match configured site origin on indexable pages
  if (!isEmbed && !is404 && siteOrigin) {
    for (const [label, href] of [
      ['canonical', canonical],
      ['og:url', ogUrl],
      ['og:image', ogImage],
    ]) {
      if (!href) {
        if (label === 'canonical') fail(`${rel}: missing canonical`);
        if (label === 'og:image') fail(`${rel}: missing og:image`);
        continue;
      }
      try {
        const u = new URL(href);
        if (u.origin !== new URL(siteOrigin).origin) {
          fail(`${rel}: ${label} host ${u.origin} != siteUrl ${siteOrigin}`);
        }
      } catch {
        fail(`${rel}: invalid ${label} URL ${href}`);
      }
    }
  }

  if (!isEmbed && !is404) {
    if (!title) fail(`${rel}: missing <title>`);
    else if (len(title) > LIMITS.titleMax) fail(`${rel}: title is ${len(title)} chars (max ${LIMITS.titleMax}): "${title}"`);
    if (title) {
      if (titleSeen.has(title)) fail(`${rel}: duplicate title also on ${titleSeen.get(title)}`);
      else titleSeen.set(title, route);
    }

    if (!desc) fail(`${rel}: missing meta description`);
    else if (len(desc) < LIMITS.descMin || len(desc) > LIMITS.descMax) {
      fail(`${rel}: meta description is ${len(desc)} chars (allowed ${LIMITS.descMin}-${LIMITS.descMax})`);
    }

    const h1s = $('main h1, body h1').toArray();
    if (h1s.length !== 1) fail(`${rel}: expected exactly one <h1>, found ${h1s.length}`);

    // Inline scripts must not use bare import (emitted as classic scripts)
    $('script').each((_, el) => {
      const src = $(el).attr('src');
      if (src) return;
      const type = ($(el).attr('type') || '').toLowerCase();
      if (type === 'module' || type === 'application/ld+json' || type === 'application/json') return;
      const body = $(el).html() || '';
      if (/\bimport\s+/.test(body) || /\bimport\s*\(/.test(body)) {
        fail(`${rel}: inline classic <script> uses import (bundle or use type=module / data- attrs)`);
      }
    });

    // Invalid JSON-LD
    $('script[type="application/ld+json"]').each((i, el) => {
      const raw = $(el).html() || '';
      try {
        JSON.parse(raw);
      } catch (e) {
        fail(`${rel}: JSON-LD block ${i + 1} invalid JSON: ${e.message}`);
      }
    });
  }

  // Tool pages must link at least one guide
  if (route.startsWith('/tools/') && route !== '/tools/' && !isEmbed) {
    const guideHrefs = $('main a[href^="/guides/"]').toArray().map((a) => $(a).attr('href'));
    if (!guideHrefs.length) fail(`${rel}: tool page has no /guides/ link (add Learn more / contextual guide)`);
  }
}

// --- No hard-coded workers.dev outside allowlist (source) ---
const WORKERS_RE = /[\w.-]+\.workers\.dev/gi;
const allowWorkersPaths = new Set([
  'src/config/site.ts',
  'src/config/sisterSites.ts',
  '.env.example',
  'docs/CUSTOM-DOMAIN.md',
  'docs/SEO-GUARDRAILS.md',
  'docs/DEPLOYMENT.md',
  'docs/SEO-GUIDE.md',
  'AGENTS.md',
  'README.md',
  'PROGRESS.md',
  'wrangler.jsonc',
  '.github/workflows/ci.yml',
  'scripts/audit/lib.mjs',
  'scripts/audit/seo-guardrails.mjs',
]);
const srcCandidates = walkFiles(ROOT, (p) => {
  const rel = path.relative(ROOT, p).replace(/\\/g, '/');
  if (rel.startsWith('docs/proof/')) return false;
  if (rel.startsWith('public/') && !rel.endsWith('.txt') && !rel.endsWith('.md')) return false;
  return /\.(ts|tsx|mjs|js|astro|md|mdc|yml|yaml|jsonc|json|txt|example)$/.test(rel);
});
for (const file of srcCandidates) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (allowWorkersPaths.has(rel)) continue;
  if (rel.startsWith('docs/ideas/') || rel.startsWith('docs/MARKET') || rel.startsWith('docs/SEO-PLAYBOOK')) continue;
  const text = fs.readFileSync(file, 'utf8');
  const matches = text.match(WORKERS_RE);
  if (matches?.length) {
    fail(`${rel}: hard-coded workers.dev (${matches[0]}) — use PUBLIC_SITE_URL / absoluteUrl() (see docs/CUSTOM-DOMAIN.md)`);
  }
}

// --- IndexNow ---
const placeholderPath = path.join(DIST, `${PLACEHOLDER_KEY}.txt`);
if (fs.existsSync(placeholderPath)) fail(`placeholder IndexNow key file present: dist/${PLACEHOLDER_KEY}.txt`);
const publicPlaceholder = path.join(ROOT, 'public', `${PLACEHOLDER_KEY}.txt`);
if (fs.existsSync(publicPlaceholder)) fail(`placeholder IndexNow key still in public/: ${PLACEHOLDER_KEY}.txt`);

const keyFiles = fs
  .readdirSync(DIST)
  .filter((n) => /^[a-f0-9]{32}\.txt$/i.test(n) && n.toLowerCase() !== `${PLACEHOLDER_KEY}.txt`);
if (keyFiles.length === 0) {
  fail('no IndexNow key file in dist/ (expected public/<32-hex>.txt)');
} else {
  for (const name of keyFiles) {
    const body = fs.readFileSync(path.join(DIST, name), 'utf8').trim();
    const key = name.replace(/\.txt$/i, '');
    if (body !== key) fail(`IndexNow file ${name} content must equal the key`);
    if (key === PLACEHOLDER_KEY) fail(`IndexNow key is placeholder`);
  }
}

// --- /sitemap.xml redirect ---
const redirects = readIfExists('_redirects') || '';
if (!/\/sitemap\.xml\s+\/sitemap-index\.xml\s+30[18]\b/.test(redirects)) {
  fail('dist/_redirects missing `/sitemap.xml` → `/sitemap-index.xml` 301/308');
}

// --- wrangler ---
const wranglerPath = path.join(ROOT, 'wrangler.jsonc');
if (!fs.existsSync(wranglerPath)) fail('wrangler.jsonc missing');
else {
  const wrangler = fs.readFileSync(wranglerPath, 'utf8');
  if (!/"html_handling"\s*:\s*"force-trailing-slash"/.test(wrangler)) {
    fail('wrangler.jsonc missing assets.html_handling: "force-trailing-slash"');
  }
  if (!/"previews"\s*:\s*\{/.test(wrangler)) {
    fail('wrangler.jsonc missing "previews": {} (required by npx wrangler preview)');
  }
  if (!/"main"\s*:\s*"src\/worker\.ts"/.test(wrangler) && !/"main"\s*:\s*'src\/worker\.ts'/.test(wrangler)) {
    fail('wrangler.jsonc missing main: "src/worker.ts" (308 trailing-slash worker)');
  }
  if (!/"run_worker_first"\s*:\s*true/.test(wrangler)) {
    fail('wrangler.jsonc missing assets.run_worker_first: true');
  }
  const stripped = wrangler.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutPreviews = stripped.replace(/"previews"\s*:\s*\{[\s\S]*?\}/, '');
  if (/"vars"\s*:\s*\{/.test(withoutPreviews)) {
    fail('wrangler.jsonc has top-level vars — breaks wrangler preview; use dashboard build env for PUBLIC_*');
  }
}

const workerPath = path.join(ROOT, 'src', 'worker.ts');
if (!fs.existsSync(workerPath)) fail('src/worker.ts missing');
else {
  const worker = fs.readFileSync(workerPath, 'utf8');
  if (!/FILE_EXT\s*=\s*\/.*\{1,\s*16\}/.test(worker) && !/FILE_EXT\s*=\s*\/\.\[[^\]]+\]\{1,16\}/.test(worker)) {
    // Accept {1,16} anywhere in the FILE_EXT regex
    if (!/\{1,\s*16\}/.test(worker)) fail('src/worker.ts FILE_EXT must allow extensions up to 16 chars (e.g. .webmanifest)');
  }
  if (!/\b308\b/.test(worker)) fail('src/worker.ts must redirect with 308');
}

// robots explicit AI bots
const robotsTxt = readIfExists('robots.txt') || '';
for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot']) {
  if (!new RegExp(`User-agent:\\s*${bot}`, 'i').test(robotsTxt)) {
    fail(`robots.txt missing explicit Allow group for ${bot}`);
  }
}

console.log('SEO guardrails:', { pages: htmlFiles.length, siteOrigin, errors: errors.length });
if (errors.length) {
  errors.forEach((e) => console.error('ERROR', e));
  process.exit(1);
}
console.log('SEO guardrails passed.');
