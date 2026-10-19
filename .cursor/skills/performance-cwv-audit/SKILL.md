---
name: performance-cwv-audit
description: Measure and fix PetCalc Core Web Vitals, JS/CSS budgets, and Lighthouse CI regressions.
---

# Performance & CWV audit (PetCalc)

Lab gate: `npm run lhci` (mobile, static `dist/`). Size gate: `scripts/audit/budgets.mjs`. Rules: `.cursor/rules/performance-budget.mdc`.

## Run sequence

```bash
npm run build
npm run audit:budgets
npm run lhci
```

Override budgets locally, e.g. `BUDGET_PAGE_JS_KB=30 npm run audit:budgets` — do not raise defaults without justification in PR.

## Lighthouse CI (`lighthouserc.cjs`)

Asserted (median / pessimistic):

- Performance ≥ 95
- Accessibility ≥ 95
- SEO ≥ 95
- LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms (lab proxy for INP)

Sample URLs cover templates — add a URL only for **new templates**, not every tool:

- `/`, `/tools/`, flagship dog/cat tools, one guide, `/privacy/`

## JS/CSS budgets (`audit:budgets`)

Default gzip limits (see `scripts/audit/budgets.mjs`):

- Page first-party JS ≤ 25 KB (embeds ≤ 15 KB)
- Single emitted chunk ≤ 20 KB
- Page HTML ≤ 60 KB; CSS ≤ 25 KB
- Single image ≤ 150 KB raw

Keep calculator logic in small formula modules; avoid new dependencies. Third-party scripts (GA4, AdSense, CMP) are allow-listed but still affect real-user CWV — re-run `lhci` after enabling `ga4MeasurementId` or ads.

## Astro-specific wins

- Prefer static HTML from `.astro` components; hydrate only what needs JS.
- Share utilities via `src/lib/` — tree-shaking friendly imports.
- Inline critical CSS via `src/styles/global.css`; no heavy UI frameworks.
- Lazy-load non-critical images; specify width/height to limit CLS.
- Embeds (`src/pages/embed/`) must stay lighter than full tool pages.

## Field vs lab

- Pre-merge: trust `lhci` + `audit:budgets`.
- Post-traffic: Search Console **Core Web Vitals** (CrUX) is authoritative (~28 days).

## Regression workflow

1. Identify failing URL from LHCI HTML report or CLI output.
2. Compare `dist/_astro/*.js` sizes before/after.
3. Fix root cause (duplicate imports, large inline script, layout shift from ads/fonts).
4. Re-run full `npm run audit`.

Escalate to `.cursor/agents/performance-auditor.md` for multi-page failures.
