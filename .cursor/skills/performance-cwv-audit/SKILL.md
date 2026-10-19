---
name: performance-cwv-audit
description: Audit and fix Core Web Vitals and page weight for the pet calculators site - npm run build, scripts/audit/budgets.mjs, lighthouserc.cjs (mobile Perf >= 95, LCP <= 2.5s, CLS <= 0.1, TBT <= 200ms), AdSlot/ad CLS, inline CSS and vanilla-JS budgets. Use for any template, CSS, calculator script, font/image or third-party change.
---

# Performance and Core Web Vitals audit

Governing documents: `docs/SEO-PLAYBOOK.md` section 2 (CWV targets at p75: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1; TBT is the lab proxy for INP; reserve ad-slot height; ship plain HTML with light JS), `docs/DEPLOYMENT.md` (headers/caching), rule `.cursor/rules/performance-budget.mdc`.

Architecture facts that make this site fast and must be preserved:
- Static HTML; `build.inlineStylesheets: 'always'` (no render-blocking CSS file); one stylesheet `src/styles/global.css`.
- Calculators are vanilla TS in `<script>` tags bundled by Astro into `dist/_astro/*.js`; shared helpers in `src/components/calculators/calc-utils.ts`.
- No framework, no web fonts, no third-party scripts unless GA4/AdSense/CMP are configured in `src/config/site.ts`.

## 1. Run

```bash
npm run build
npm run audit:budgets       # gzip sizes from dist/
npm run lhci                # Lighthouse CI, mobile, 3 runs per URL, config in lighthouserc.cjs
```

`lhci autorun` serves `dist/` statically and runs Chrome headless (`--no-sandbox` is set in the config for CI containers). Results upload to temporary public storage (a link is printed). Run it **after** `npm run build`; a stale `dist/` gives stale numbers.

Single page, deeper dive:

```bash
npx lighthouse http://localhost:4321/tools/puppy-weight-calculator/ \
  --form-factor=mobile --only-categories=performance --view      # after `npm run preview`
```

## 2. Budgets and what they guard

`lighthouserc.cjs` (errors unless noted): Performance >= 0.95 (median), Accessibility >= 0.95, SEO >= 0.95, Best Practices >= 0.9 (warn), LCP <= 2500 ms, CLS <= 0.1 (pessimistic), TBT <= 200 ms, FCP <= 1800 ms (warn), Speed Index <= 3400 ms (warn), script bytes <= 60 KB, total bytes <= 400 KB (warn), plus crawlability, title, description, canonical, link-text, image-alt, color-contrast, viewport.

`scripts/audit/budgets.mjs` (override with `BUDGET_*` env vars):

| Budget | Default | Meaning |
|---|---|---|
| Page first-party JS | 25 KB gzip | all same-origin scripts a page loads (+ imported chunks + inline scripts) |
| Embed page JS | 15 KB gzip | embeds load inside other people's pages |
| Any single JS file | 20 KB gzip | catches an accidentally bundled library |
| Total JS in dist | 200 KB gzip | whole-site creep |
| HTML doc | 60 KB gzip | includes inlined CSS |
| Inline CSS | 25 KB gzip | per page |
| Any image | 150 KB | convert to AVIF/WebP, size correctly |
| Inline script | 6 KB gzip | larger belongs in a bundled `<script>` |
| Third-party hosts | allow-list | googletagmanager, google-analytics, googlesyndication, doubleclick, fundingchoices |

It also warns on render-blocking scripts/stylesheets and a lazy-loaded first image (LCP element).

## 3. Diagnose by metric

**LCP > 2.5 s**
- Identify the LCP element in the Lighthouse report. On this site it should be the H1 or the `.answer-first` paragraph (text). If it is an image, give it explicit `width`/`height`, `fetchpriority="high"`, no `loading="lazy"`, proper size and AVIF/WebP.
- Large inline CSS delays first render: keep `global.css` lean (no unused component styles), gzip < 25 KB.
- TTFB: static host + CDN; check Cloudflare caching of HTML is not bypassed; `_headers` sets `max-age=0, must-revalidate` for HTML (fine with ETag).
- Fonts: system font stack only. If a web font is ever added: self-host, `font-display: swap`, preload the one used above the fold, subset to Latin.

**CLS > 0.1**
- Ad slots: `.ad-slot { min-height: 90px }` (`src/styles/global.css`). When enabling ads, reserve the height of the largest format served at each breakpoint; never let a slot collapse to 0 after a no-fill (use a fixed container height or a placeholder), and keep slots below the calculator.
- The cookie banner (`.cookie-banner`) must overlay (fixed) rather than push content.
- Calculator results panels appear on interaction (`hidden` -> visible): put them where growth will not move content above the viewport, or reserve their space. Results shown at first paint with default values avoid late shifts.
- Images need `width`/`height` (`audit:seo` `img-size`). Breadcrumbs/nav must have deterministic height.
- Charts: set explicit canvas/SVG dimensions with CSS `aspect-ratio`.

**TBT > 200 ms / INP**
- The calculator scripts should be tiny; if a handler is slow, debounce `input` events (50-100 ms) and avoid layout thrash (batch DOM writes).
- Do not import large data (`src/data/breeds.ts` is ~50 rows: fine) or formulas on pages that do not need them.
- Third-party tags are the usual culprit: load GA4/AdSense with `async`, after consent; test `lhci` **with the IDs set**, not only with them empty (CI runs with them empty, so ad/analytics impact is invisible there; run a manual `lighthouse` against a build with IDs configured before enabling).
- Astro `<script>` bundles: avoid `is:inline` for anything big; inline scripts block parsing.

**Bytes / requests**
- `npm run audit:budgets` lists the heaviest pages; open `dist/_astro/` and check for duplicated helpers (import `calc-utils` rather than copy).
- Remove unused CSS selectors for deleted components; keep one stylesheet.
- Images: SVG for logos/diagrams, AVIF/WebP for photos, `srcset` for hero images; never ship full-size originals.

## 4. Field data

Lab (Lighthouse) is the PR gate; field is the truth. After launch review GSC > Core Web Vitals (CrUX, 28-day) and PageSpeed Insights for the 5 flagship URLs. If field LCP/CLS is worse than lab, suspect real-device CPUs, ads/consent, or CDN behaviour not in lab.

## 5. Making changes safely

1. Change one lever at a time; re-run `npm run build && npm run audit:budgets && npm run lhci`.
2. Keep a before/after table (metric, median of 3 runs) in the PR.
3. Do not raise a budget to make a PR pass. Raise only with evidence that users benefit and a written reason in the PR; update both `scripts/audit/budgets.mjs` and `lighthouserc.cjs` together.
4. New URL patterns/templates: add one representative URL to `urls` in `lighthouserc.cjs`.

## 6. Report format

```
Performance audit <date> @ <sha>
Budgets: <pass/fail>, heaviest pages (JS gz, HTML gz)
Lighthouse (median of 3, mobile): per URL Perf / LCP / CLS / TBT / SI; link to the LHCI report
Top issues: <metric> - <element/file> - <cause> - <fix> - <expected gain>
Ad/analytics impact (if IDs set): measured Y/N, numbers
Recommended fixes in order
```
