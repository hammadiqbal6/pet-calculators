---
name: content-refresh
description: Refresh existing PetCalc tools and guides using GSC data, buildDate, and audit thresholds without keyword cannibalization.
---

# Content refresh (PetCalc)

Use when improving **existing** URLs — not creating new slugs unless `keyword-research` confirms a gap.

## Triggers

- GSC: page has impressions but avg position 8–30 (`docs/SEO-GUIDE.md` section 5.7)
- GSC: "Crawled — currently not indexed" on a tool/guide (quality signal)
- User reports outdated guidance (AAFCO/WSAVA page moved)
- Quarterly review of flagship tools in `docs/KEYWORD-MAP.md` notes column

## Safe edit order

1. **Do not change primary keyword** without updating `docs/KEYWORD-MAP.md` first.
2. Bump `buildDate` in `src/config/site.ts` only when content materially changes (affects `lastmod`, JSON-LD `dateModified`, source `accessed` dates).
3. Edit page: `src/pages/tools/<slug>/index.astro` or `src/pages/guides/<slug>/index.astro`.
4. Sync metadata arrays in `src/data/tools.ts` or `src/data/guides.ts` if description/keywords change.
5. Update formulas in `src/lib/formulas/*` + tests if maths changed; cite source in JSDoc.
6. Refresh FAQ from new PAA/query strings (secondary keywords only).
7. Run `internal-linking` pass for new anchor opportunities.

## What to add (high ROI)

| Element | Why |
|---------|-----|
| New worked example | Snippets + AI citations |
| Comparison table (life stages, breeds) | Original data display |
| "When to call a vet" box | YMYL trust |
| Extra FAQ from GSC queries | Long-tail without new URLs |
| Stronger sources | Run `vet-source-citation` |

## What to avoid

- Splitting one intent into multiple thin pages (fan-out trap)
- Copy-pasting paragraphs between tools
- Inflating word count without new facts
- Adding `aggregateRating` JSON-LD without real on-site reviews

## Verification

```bash
npm run test          # if formulas touched
npm run build
npm run audit:seo
npm run audit:adsense
npm run check:links
```

## Indexing after refresh

- Request re-indexing in GSC for major rewrites only.
- IndexNow ping for changed URLs (`docs/SEO-GUIDE.md` section 3).

Document in PR: what queries or user feedback drove the refresh, and what changed.
