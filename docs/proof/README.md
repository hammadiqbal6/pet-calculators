# Proof index (generated)

**Generated:** 2026-10-19T06:46:45.439Z

Regenerate everything:

```bash
npm run proof
```

## Environment

| Tool | Version |
|---|---|
| node | v22.23.3 |
| npm | 10.9.9 |
| astro | ^7.4.0 |
| lighthouse | 13.5.0 |
| vitest | ^5.0.5 |
| playwright | ^1.49.1 |

## Checks

| Check | Command | Pass |
|---|---|---|
| Unit tests | `npm test` | see [tests.txt](./tests.txt) |
| SEO audit | `npm run audit:seo` | PASS |
| AdSense audit | `npm run audit:adsense` | PASS |
| Bundle budgets | `npm run audit:budgets` | PASS |
| Links | `npm run check:links` | PASS |
| JSON-LD validation | `scripts/proof/generate.mjs` | see [structured-data/validation.txt](./structured-data/validation.txt) |
| Viewport (360/768) | Playwright | [mobile/viewport-check.txt](./mobile/viewport-check.txt) |

### Lighthouse budgets (mobile unless noted)

Targets: Perf/A11y/SEO ≥ 95; LCP ≤ 2000 ms; CLS ≤ 0.05; TBT ≤ 150 ms; script transfer ≤ 50 KB.

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT | JS (B) | Pass |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| home (mobile) | 100 | 100 | 100 | 100 | 754 | 0.000 | 0 | 0 | yes |
| tools-hub (mobile) | 100 | 100 | 100 | 100 | 754 | 0.000 | 0 | 0 | yes |
| dogs-hub (mobile) | 100 | 100 | 100 | 100 | 753 | 0.000 | 0 | 0 | yes |
| cats-hub (mobile) | 100 | 100 | 100 | 100 | 752 | 0.000 | 0 | 0 | yes |
| guides-hub (mobile) | 100 | 100 | 100 | 100 | 753 | 0.000 | 0 | 0 | yes |
| puppy-weight (mobile) | 100 | 100 | 100 | 100 | 1053 | 0.000 | 0 | 5244 | yes |
| dog-food (mobile) | 100 | 100 | 100 | 100 | 1054 | 0.000 | 0 | 3518 | yes |
| cat-age (mobile) | 100 | 100 | 100 | 100 | 902 | 0.000 | 0 | 2562 | yes |
| chocolate (mobile) | 100 | 100 | 100 | 100 | 902 | 0.000 | 0 | 3131 | yes |
| dog-bmi (mobile) | 100 | 100 | 100 | 100 | 960 | 0.000 | 0 | 2965 | yes |
| home (desktop) | 100 | 100 | 100 | 100 | 203 | 0.000 | 0 | 0 | yes |

## Artifacts

- [lighthouse/](./lighthouse/) — HTML + JSON reports
- [structured-data/](./structured-data/) — extracted JSON-LD per page type
- [seo-audit.txt](./seo-audit.txt)
- [tests.txt](./tests.txt)
- [bundle-size.txt](./bundle-size.txt)
- [sitemap-robots.txt](./sitemap-robots.txt)
- [adsense-readiness.md](./adsense-readiness.md)
- [mobile/](./mobile/) — 360px and 768px screenshots
