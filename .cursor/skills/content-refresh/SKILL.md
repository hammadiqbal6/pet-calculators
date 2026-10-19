---
name: content-refresh
description: Refresh dated or declining content on the pet calculators site - re-verify formulas and sources, update src/data/guides.ts lastUpdated and site.ts buildDate, fix GSC position 8-30 queries by extending the same page, and publish honest update notes. Use on the 6-month schedule, when a guideline changes, or when impressions decline.
---

# Content refresh

Governing documents: `docs/SEO-PLAYBOOK.md` section 0 item 10 ("keep data fresh and show last updated dates"), sections 3, 6 and 8 (optimize weeks 9-12); `docs/SEO-GUIDE.md` sections 7 and 10; `docs/KEYWORD-MAP.md`; rule `.cursor/rules/content-quality.mdc`.

Principle: freshness is only a signal if it is **real**. Do not bump `lastUpdated`/`lastmod` for cosmetic edits (SEO-PLAYBOOK sitemap rule: Google uses `lastmod` only if "consistently and verifiably accurate"). Do not rewrite a page that is ranking just to look fresh.

## 1. Triggers and cadence

| Trigger | Action |
|---|---|
| Every 6 months per page (quarterly for toxin, pregnancy and feeding-amount pages) | full source and number re-verification |
| A cited guideline/standard changes (AAHA, WSAVA, AAFCO, NRC, AAFP; ASPCA/hotline details) | refresh all pages that cite it (`rg -n "SRC.aahaNutrition" src/pages`) |
| GSC: impressions down >= 30% over 8 weeks, or position drop >= 3 for the primary keyword | diagnose then improve |
| GSC: queries at positions 8-30 with impressions | extend the same page (section 4) |
| A competitor's new tool outranks us | compare features; add genuine improvements |
| Reader email/correction | verify and fix within the same week |
| A broken or moved source URL (`npm run check:links -- --external`) | replace with the current primary source |

Order the work by impressions (highest first), then by YMYL risk (toxins, pregnancy, dosing-adjacent first).

## 2. Inventory

```bash
rg -n "lastUpdated" src/data/guides.ts              # per-guide dates
rg -n "buildDate" src/config/site.ts                # site-wide date used by tools and sitemap lastmod
npm run build && npm run check:links -- --external   # dead sources
```

Pull from GSC (Performance > Pages, last 3 months vs previous 3): impressions, clicks, CTR, average position for each URL and its top 10 queries. Keep a refresh log (date, URL, what changed, why, sources checked) in the PR description.

## 3. Refresh procedure (per page)

1. **Re-verify facts.** Open every `SRC` source cited on the page (`src/data/sources.ts`). Confirm the number, definition and URL still hold. Check for newer editions/guidelines. For formulas, re-check constants in `src/lib/formulas/<name>.ts` and the worked example. Use the `vet-fact-checker` subagent and the `vet-source-citation` skill.
2. **Re-run the example.** Plug the worked example into the live calculator; the printed numbers must match exactly. If the formula changed, update code, tests (`npm test`) and page copy together.
3. **Reassess intent.** Re-search the primary keyword (incognito, US). Has the SERP shifted toward a different format (tool vs guide, short answer vs depth)? Adjust only if the user need genuinely changed.
4. **Improve substance, not length.** Add one of: a clearer table, a second worked example, an "assumptions and limits" paragraph, new FAQ items from real queries, an original diagram. Remove outdated or unsourced sentences.
5. **Update metadata.** Title/description only if CTR is low and the new text is more accurate; keep the primary keyword (keyword map). Never change the slug; if unavoidable, add 301s in `public/_redirects` and `vercel.json` and fix inbound links.
6. **Dates.** Guides: set `lastUpdated` in `src/data/guides.ts` to today **only if content changed materially**. Tools: bump `buildDate` in `src/config/site.ts` in the release that changes tool content (it drives `lastmod`, the visible "Last updated" and `dateModified`). Add a one-line "Updated <date>: <what changed>" note when the change affects a number readers may have acted on.
7. **Internal links.** Add links to any new guides/tools published since the last refresh (`internal-linking` skill).
8. **Request indexing** (GSC URL Inspection) for pages with material changes and ping IndexNow (SEO-GUIDE section 3).

## 4. Query-gap refresh (positions 8-30)

1. GSC > Performance > Pages > select the URL > Queries; filter position 8-30, impressions >= the site median.
2. Classify each query: (a) a phrasing of the page's intent -> add a sentence/FAQ/H2 on the same page; (b) a sub-question -> add an FAQ item with a complete answer; (c) a distinct task -> run `keyword-research` and, if it deserves its own page, claim it in the keyword map; do **not** stuff it onto the page.
3. Never create a new URL for a phrasing already owned (KEYWORD-MAP rule 3).

## 5. Decline diagnosis

Check in order: indexing (GSC Pages), manual action/security (GSC), crawl/CDN (robots, bot rules), cannibalization (two URLs for one query), SERP change (new feature/competitor), content staleness (dates, sources), technical regression (`npm run audit`, `npm run lhci`), seasonality (manual Trends). Fix the cause; do not mass-rewrite.

## 6. Prune or merge

Pages with no impressions after 90 days and no unique intent: merge the useful parts into the owning page, 301 the old URL (`public/_redirects` and `vercel.json`), remove it from `src/data/*`, `llms.txt` and `docs/KEYWORD-MAP.md`, fix inbound links, and confirm `npm run audit` is clean. Thin pages are a liability for both ranking and AdSense.

## 7. Verify and record

```bash
npm test && npm run audit && npm run lhci
```

PR description template:

```
Refresh <date>
Page | trigger | what changed | sources re-checked (SRC keys) | numbers changed? | lastUpdated bumped? | GSC baseline (impr/clicks/pos)
Fact-check: <vet-fact-checker summary>
Follow-ups: <items>
```

Re-measure in GSC after 4 weeks and note the effect in the next refresh.
