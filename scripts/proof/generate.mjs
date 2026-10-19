#!/usr/bin/env node
/**
 * Regenerate docs/proof/ — run via `npm run proof`.
 * Never hand-edit generated files; update this script instead.
 */
import { execSync, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  DIST,
  ROOT,
  loadPages,
  listFiles,
  readSiteConfig,
  routeFromFile,
} from '../audit/lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROOF = path.join(ROOT, 'docs', 'proof');
const LH_DIR = path.join(PROOF, 'lighthouse');
const SD_DIR = path.join(PROOF, 'structured-data');
const MOBILE_DIR = path.join(PROOF, 'mobile');
const PORT = Number(process.env.PROOF_PORT || 4321);
const BASE = `http://127.0.0.1:${PORT}`;
const JS_BUDGET_KB = Number(process.env.PROOF_JS_BUDGET_KB || 50);
const GENERATED_AT = new Date().toISOString();

const LIGHTHOUSE_MOBILE = [
  { slug: 'home', path: '/' },
  { slug: 'tools-hub', path: '/tools/' },
  { slug: 'dogs-hub', path: '/dogs/' },
  { slug: 'cats-hub', path: '/cats/' },
  { slug: 'guides-hub', path: '/guides/' },
  { slug: 'puppy-weight', path: '/tools/puppy-weight-calculator/' },
  { slug: 'dog-food', path: '/tools/dog-food-calculator/' },
  { slug: 'cat-age', path: '/tools/cat-age-calculator/' },
  { slug: 'chocolate', path: '/tools/dog-chocolate-toxicity-calculator/' },
  { slug: 'dog-bmi', path: '/tools/dog-bmi-calculator/' },
];

const SCREENSHOTS = [
  { name: 'home', path: '/' },
  { name: 'tools-hub', path: '/tools/' },
  { name: 'puppy-weight', path: '/tools/puppy-weight-calculator/' },
  { name: 'dog-food', path: '/tools/dog-food-calculator/' },
  { name: 'cat-age', path: '/tools/cat-age-calculator/' },
];

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: opts.capture ? 'pipe' : 'inherit', ...opts });
}

function capture(cmd) {
  return run(cmd, { capture: true }).trimEnd();
}

function ensureDirs() {
  for (const d of [PROOF, LH_DIR, SD_DIR, MOBILE_DIR]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function cleanGenerated() {
  for (const sub of [LH_DIR, SD_DIR, MOBILE_DIR]) {
    if (fs.existsSync(sub)) {
      for (const f of fs.readdirSync(sub)) {
        fs.unlinkSync(path.join(sub, f));
      }
    }
  }
}

let previewProc;

async function startPreview() {
  previewProc = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: true,
  });
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Preview server did not become ready');
}

function stopPreview() {
  if (previewProc?.pid) {
    try {
      process.kill(-previewProc.pid, 'SIGTERM');
    } catch {
      try {
        previewProc.kill('SIGTERM');
      } catch {
        /* ignore */
      }
    }
  }
}

function lighthouseBin() {
  return path.join(ROOT, 'node_modules', '.bin', 'lighthouse');
}

function runLighthouse(urlPath, outSlug, preset) {
  const url = `${BASE}${urlPath}`;
  const outBase = path.join(LH_DIR, outSlug);
  const args = [
    url,
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=html',
    '--output=json',
    `--output-path=${outBase}`,
  ];
  if (preset === 'desktop') args.push('--preset=desktop');
  const r = spawnSync(lighthouseBin(), args, { cwd: ROOT, encoding: 'utf8', env: process.env });
  if (r.status !== 0) {
    console.error(r.stdout || r.stderr);
    throw new Error(`Lighthouse failed for ${urlPath} (${preset})`);
  }
  const jsonPath = `${outBase}.report.json`;
  if (!fs.existsSync(jsonPath)) throw new Error(`Missing ${jsonPath}`);
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function lhMetrics(lhr) {
  const c = lhr.categories;
  const a = lhr.audits;
  const jsAudit = a['resource-summary']?.details?.items?.find((i) => i.resourceType === 'script');
  const jsBytes = jsAudit?.transferSize ?? 0;
  return {
    perf: Math.round((c.performance?.score ?? 0) * 100),
    a11y: Math.round((c.accessibility?.score ?? 0) * 100),
    bp: Math.round((c['best-practices']?.score ?? 0) * 100),
    seo: Math.round((c.seo?.score ?? 0) * 100),
    lcp: Math.round(a['largest-contentful-paint']?.numericValue ?? 0),
    cls: a['cumulative-layout-shift']?.numericValue ?? 0,
    tbt: Math.round(a['total-blocking-time']?.numericValue ?? 0),
    jsGz: jsBytes, // transfer size (approx on static host)
  };
}

function budgetPass(m) {
  return (
    m.perf >= 95 &&
    m.a11y >= 95 &&
    m.seo >= 95 &&
    m.lcp <= 2000 &&
    m.cls <= 0.05 &&
    m.tbt <= 150 &&
    m.jsGz / 1024 <= JS_BUDGET_KB
  );
}

async function captureScreenshots() {
  const browser = await chromium.launch();
  const lines = [];
  for (const width of [360, 768]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    for (const shot of SCREENSHOTS) {
      await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollWidth > el.clientWidth + 1;
      });
      const file = `${shot.name}-${width}.png`;
      await page.screenshot({ path: path.join(MOBILE_DIR, file), fullPage: true });
      lines.push(
        `${shot.path} @ ${width}px: horizontal_scroll=${overflow ? 'FAIL' : 'OK'} (scrollWidth vs clientWidth)`,
      );
      if (overflow) {
        throw new Error(`Horizontal scroll detected: ${shot.path} at ${width}px`);
      }
    }
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(MOBILE_DIR, 'viewport-check.txt'), lines.join('\n') + '\n');
}

function extractStructuredData() {
  const pages = loadPages();
  const byType = new Map();
  for (const p of pages) {
    if (p.type === 'embed' || p.type === '404') continue;
    if (!byType.has(p.type)) byType.set(p.type, p);
  }
  const validation = [];
  let ok = true;
  for (const [type, page] of byType) {
    const blocks = [];
    page.$('script[type="application/ld+json"]').each((_, el) => {
      const raw = page.$(el).html()?.trim();
      if (!raw) return;
      try {
        blocks.push(JSON.parse(raw));
      } catch (e) {
        ok = false;
        validation.push(`FAIL ${page.route}: invalid JSON-LD: ${e.message}`);
      }
    });
    const out = path.join(SD_DIR, `${type}-${page.route.replace(/\//g, '_').replace(/_+$/, '') || 'root'}.json`);
    fs.writeFileSync(out, JSON.stringify({ route: page.route, type, blocks }, null, 2));
    for (const b of blocks) {
      if (!b['@context']) {
        ok = false;
        validation.push(`FAIL ${page.route}: missing @context`);
      }
      const t = b['@type'];
      if (t === 'WebApplication' || (Array.isArray(t) && t.includes('WebApplication'))) {
        if (!b.name) {
          ok = false;
          validation.push(`FAIL ${page.route}: WebApplication missing name`);
        }
        if (!b.offers) {
          ok = false;
          validation.push(`FAIL ${page.route}: WebApplication missing offers`);
        }
      }
      if (t === 'Organization' && !b.name) {
        ok = false;
        validation.push(`FAIL ${page.route}: Organization missing name`);
      }
      if (t === 'Article' && !b.headline) {
        ok = false;
        validation.push(`FAIL ${page.route}: Article missing headline`);
      }
    }
    validation.push(`OK ${page.route} (${type}): ${blocks.length} JSON-LD block(s)`);
  }
  validation.push('');
  validation.push(
    'Note: Re-run Google Rich Results Test on production URLs after deploy (placeholder domain in local proof).',
  );
  fs.writeFileSync(path.join(SD_DIR, 'validation.txt'), validation.join('\n') + '\n');
  if (!ok) throw new Error('JSON-LD validation failed — see structured-data/validation.txt');
}

function writeSitemapRobots() {
  const lines = [];
  const htmlPages = listFiles()
    .filter((f) => f.endsWith('.html'))
    .map((f) => routeFromFile(f));
  const indexable = htmlPages.filter((r) => !r.startsWith('/embed/') && r !== '/404.html');
  lines.push(`Generated: ${GENERATED_AT}`);
  lines.push(`HTML pages in dist/: ${htmlPages.length}`);
  lines.push(`Indexable pages (excl. embed, 404): ${indexable.length}`);
  const sitemapPath = path.join(DIST, 'sitemap-0.xml');
  let sitemapUrls = 0;
  if (fs.existsSync(sitemapPath)) {
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    sitemapUrls = (xml.match(/<loc>/g) || []).length;
    lines.push(`sitemap-0.xml URLs: ${sitemapUrls}`);
    if (sitemapUrls !== indexable.length) {
      lines.push(`WARN: sitemap URL count (${sitemapUrls}) != indexable pages (${indexable.length})`);
    } else {
      lines.push('OK: sitemap URL count matches indexable pages');
    }
  } else {
    lines.push('FAIL: sitemap-0.xml missing');
  }
  const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
  lines.push('');
  lines.push('--- robots.txt ---');
  lines.push(robots.trim());
  const bots = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot'];
  for (const bot of bots) {
    lines.push(robots.includes(bot) ? `OK: ${bot} mentioned` : `WARN: ${bot} not found in robots.txt`);
  }
  const llms = path.join(DIST, 'llms.txt');
  lines.push(fs.existsSync(llms) ? 'OK: llms.txt present in dist/' : 'FAIL: llms.txt missing');
  fs.writeFileSync(path.join(PROOF, 'sitemap-robots.txt'), lines.join('\n') + '\n');
}

function writeAdSenseReadiness() {
  const pages = loadPages();
  const byRoute = new Map(pages.map((p) => [p.route, p]));
  const privacy = byRoute.get('/privacy/');
  const pt = privacy?.$('main').text().toLowerCase() ?? '';
  const checks = [
    ['About page', fs.existsSync(path.join(DIST, 'about/index.html')), '/about/'],
    ['Contact page', fs.existsSync(path.join(DIST, 'contact/index.html')), '/contact/'],
    ['Privacy page', Boolean(privacy), '/privacy/'],
    ['Terms page', fs.existsSync(path.join(DIST, 'terms/index.html')), '/terms/'],
    ['Methodology page', fs.existsSync(path.join(DIST, 'methodology/index.html')), '/methodology/'],
    [
      'Privacy mentions AdSense/ads',
      /adsense|google ads|advertis/i.test(pt),
      'privacy body',
    ],
    ['Privacy mentions cookies', /cookie/i.test(pt), 'privacy body'],
    [
      'Privacy opt-out language',
      /ads settings|aboutads|opt[- ]out/i.test(pt),
      'privacy body',
    ],
    ['ads.txt file in dist', fs.existsSync(path.join(DIST, 'ads.txt')), 'public/ads.txt'],
    [
      'Certified CMP (TCF)',
      false,
      'Cookie banner only — add Google-certified CMP before EEA/UK/CH personalized ads (docs/ADSENSE.md)',
    ],
  ];
  const tools = pages.filter((p) => p.type === 'tool');
  const thinTools = tools.filter((t) => t.words < 600);
  const lines = [
    `# AdSense readiness evidence`,
    ``,
    `Generated: ${GENERATED_AT}`,
    ``,
    `Automated: \`npm run audit:adsense\` (see seo-audit pipeline). Manual approval still required.`,
    ``,
    `| Check | Status | Evidence |`,
    `|---|---|---|`,
  ];
  for (const [label, pass, ev] of checks) {
    lines.push(`| ${label} | ${pass ? 'PASS' : 'FAIL / pending'} | ${ev} |`);
  }
  lines.push(`| Tool pages >= 600 words | ${thinTools.length === 0 ? 'PASS' : 'FAIL'} | ${tools.length} tools; thin: ${thinTools.map((t) => t.route).join(', ') || 'none'} |`);
  lines.push(`| Guide pages >= 800 words | ${pages.filter((p) => p.type === 'guide' && p.words < 800).length === 0 ? 'PASS' : 'WARN'} | see audit:seo |`);
  lines.push('');
  lines.push('## Publisher ID');
  const site = readSiteConfig();
  lines.push(site.adsensePublisherId ? `Configured: ${site.adsensePublisherId}` : 'Not set (ads disabled until approval).');
  fs.writeFileSync(path.join(PROOF, 'adsense-readiness.md'), lines.join('\n') + '\n');
}

function writeProofReadme(lhRows, versions, auditExit) {
  const lines = [
    '# Proof index (generated)',
    '',
    `**Generated:** ${GENERATED_AT}`,
    '',
    'Regenerate everything:',
    '',
    '```bash',
    'npm run proof',
    '```',
    '',
    '## Environment',
    '',
    '| Tool | Version |',
    '|---|---|',
    ...Object.entries(versions).map(([k, v]) => `| ${k} | ${v} |`),
    '',
    '## Checks',
    '',
    '| Check | Command | Pass |',
    '|---|---|---|',
    `| Unit tests | \`npm test\` | see [tests.txt](./tests.txt) |`,
    `| SEO audit | \`npm run audit:seo\` | ${auditExit.seo ? 'PASS' : 'FAIL'} |`,
    `| AdSense audit | \`npm run audit:adsense\` | ${auditExit.adsense ? 'PASS' : 'FAIL'} |`,
    `| Bundle budgets | \`npm run audit:budgets\` | ${auditExit.budgets ? 'PASS' : 'FAIL'} |`,
    `| Links | \`npm run check:links\` | ${auditExit.links ? 'PASS' : 'FAIL'} |`,
    `| JSON-LD validation | \`scripts/proof/generate.mjs\` | see [structured-data/validation.txt](./structured-data/validation.txt) |`,
    `| Viewport (360/768) | Playwright | [mobile/viewport-check.txt](./mobile/viewport-check.txt) |`,
    '',
    '### Lighthouse budgets (mobile unless noted)',
    '',
    'Targets: Perf/A11y/SEO ≥ 95; LCP ≤ 2000 ms; CLS ≤ 0.05; TBT ≤ 150 ms; script transfer ≤ ' +
      JS_BUDGET_KB +
      ' KB.',
    '',
    '| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT | JS (B) | Pass |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---|',
  ];
  for (const row of lhRows) {
    lines.push(
      `| ${row.slug} | ${row.perf} | ${row.a11y} | ${row.bp} | ${row.seo} | ${row.lcp} | ${row.cls.toFixed(3)} | ${row.tbt} | ${row.jsGz} | ${row.pass ? 'yes' : 'no'} |`,
    );
  }
  lines.push('');
  lines.push('## Artifacts');
  lines.push('');
  lines.push('- [lighthouse/](./lighthouse/) — HTML + JSON reports');
  lines.push('- [structured-data/](./structured-data/) — extracted JSON-LD per page type');
  lines.push('- [seo-audit.txt](./seo-audit.txt)');
  lines.push('- [tests.txt](./tests.txt)');
  lines.push('- [bundle-size.txt](./bundle-size.txt)');
  lines.push('- [sitemap-robots.txt](./sitemap-robots.txt)');
  lines.push('- [adsense-readiness.md](./adsense-readiness.md)');
  lines.push('- [mobile/](./mobile/) — 360px and 768px screenshots');
  fs.writeFileSync(path.join(PROOF, 'README.md'), lines.join('\n') + '\n');
}

async function main() {
  ensureDirs();
  cleanGenerated();

  console.log('== proof: build ==');
  run('npm run build');

  console.log('== proof: tests ==');
  const testsOut = capture('npm test');
  fs.writeFileSync(path.join(PROOF, 'tests.txt'), testsOut + '\n');

  const auditExit = { seo: true, adsense: true, budgets: true, links: true };
  try {
    fs.writeFileSync(path.join(PROOF, 'seo-audit.txt'), capture('npm run audit:seo') + '\n');
  } catch {
    auditExit.seo = false;
    fs.writeFileSync(path.join(PROOF, 'seo-audit.txt'), 'FAILED\n');
  }
  try {
    const ads = capture('npm run audit:adsense');
    fs.appendFileSync(path.join(PROOF, 'seo-audit.txt'), '\n--- audit:adsense ---\n' + ads + '\n');
    if (ads.includes('FAILED')) auditExit.adsense = false;
  } catch {
    auditExit.adsense = false;
  }
  try {
    const bud = capture('npm run audit:budgets');
    fs.writeFileSync(path.join(PROOF, 'bundle-size.txt'), bud + '\n');
    fs.appendFileSync(
      path.join(PROOF, 'bundle-size.txt'),
      `\n--- proof JS budget (transfer size) ---\nPer-page script transfer budget: ${JS_BUDGET_KB} KB (see lighthouse table in README.md)\n`,
    );
    if (bud.includes('FAILED')) auditExit.budgets = false;
  } catch {
    auditExit.budgets = false;
  }
  try {
    const links = capture('npm run check:links');
    fs.appendFileSync(path.join(PROOF, 'seo-audit.txt'), '\n--- check:links ---\n' + links + '\n');
    if (links.includes('FAILED')) auditExit.links = false;
  } catch {
    auditExit.links = false;
  }

  writeSitemapRobots();
  extractStructuredData();
  writeAdSenseReadiness();

  console.log('== proof: preview server ==');
  await startPreview();

  const lhRows = [];
  try {
    console.log('== proof: lighthouse (mobile) ==');
    for (const { slug, path: p } of LIGHTHOUSE_MOBILE) {
      const lhr = runLighthouse(p, `${slug}-mobile`, 'mobile');
      const m = lhMetrics(lhr);
      lhRows.push({ slug: `${slug} (mobile)`, ...m, pass: budgetPass(m) });
    }
    console.log('== proof: lighthouse (desktop home) ==');
    const desk = runLighthouse('/', 'home-desktop', 'desktop');
    const dm = lhMetrics(desk);
    lhRows.push({ slug: 'home (desktop)', ...dm, pass: budgetPass(dm) });

    console.log('== proof: screenshots ==');
    await captureScreenshots();
  } finally {
    stopPreview();
  }

  const failedLh = lhRows.filter((r) => !r.pass);
  if (failedLh.length) {
    console.error('Lighthouse budget failures:', failedLh.map((r) => r.slug).join(', '));
    process.exitCode = 1;
  }

  if (!auditExit.seo || !auditExit.budgets || !auditExit.links) process.exitCode = 1;

  const versions = {
    node: capture('node -v'),
    npm: capture('npm -v'),
    astro: JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).dependencies.astro,
    lighthouse: capture(`${lighthouseBin()} --version`),
    vitest: JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).devDependencies.vitest,
    playwright: JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).devDependencies.playwright,
  };

  writeProofReadme(lhRows, versions, auditExit);
  console.log('== proof: done ==', PROOF);
  if (process.exitCode) process.exit(process.exitCode);
}

main().catch((err) => {
  stopPreview();
  console.error(err);
  process.exit(1);
});
