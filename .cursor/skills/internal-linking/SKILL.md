---
name: internal-linking
description: Plan and fix internal links on the pet calculators site - hub to tool to guide clusters, reciprocal related links in src/data/tools.ts and guides.ts, contextual anchors, orphan and weak-inbound fixes flagged by scripts/audit/seo.mjs and links.mjs. Use when adding any page, after an audit shows orphan/weak-inbound/broken-link, or monthly.
---

# Internal linking

Governing documents: `docs/SEO-PLAYBOOK.md` section 2 ("Internal linking": hub -> tool -> guide clusters, breadcrumbs; Google lists "easily findable through internal links") and section 6 (hierarchy vs doorway pages); `docs/KEYWORD-MAP.md` (what each page owns); `docs/SEO-GUIDE.md` section 10.

## 1. The link model for this site

```
/  (home)  --------------------------------------------------------------+
  |-- /tools/  (all tools)       |-- /dogs/ (dog tools + dog guides)       |
  |      |-- /tools/<slug>/ x11  |-- /cats/ (cat tools + cat guides)       |
  |-- /guides/ (all guides)      |-- trust: /about/ /authors/ /methodology/ /contact/ /privacy/ /terms/ (footer)
         |-- /guides/<slug>/ x6+
```

Automatic links (do not duplicate by hand): header nav (`BaseLayout.navLinks`), footer lists every tool/guide/legal page (from `tools.ts`, `guides.ts`), home lists all tools, hubs list their children (`/dogs/`, `/cats/` filter by `category` and by guides' `relatedTools`), `RelatedTools` cards from `tool.related`, `GuidePageShell` tool cards from `guide.relatedTools`, `Breadcrumbs`.

Contextual links (the ones this skill is about) are the ones inside body copy. They carry the most topical signal and are what the audit counts (`tool-related`: >= 2 links to other tools/guides in `<main>`).

## 2. Rules

1. **Every page gets >= 2 contextual inbound links from non-hub pages** and links out to >= 2 siblings. `audit:seo` fails `orphan` (zero inbound) and warns `weak-inbound` (one inbound) for tool and guide pages.
2. **Tool -> its guide(s) and 1-2 sibling tools; guide -> its supporting tool within the first 150 words, plus 2 other relevant links.** Use the `Supports` column in the calendar (`docs/SEO-GUIDE.md` section 7).
3. **Anchor text is descriptive and varied**, 2-6 words, matching the destination's intent: "puppy food calculator", "how much to feed a puppy". Never "click here", "read more", "here" (`links.mjs` warns `generic-anchor`). Do not use the exact primary keyword on every link; vary with natural phrasing. Do not stuff keywords.
4. **Link to the owner of an intent, not a near neighbour.** Use `docs/KEYWORD-MAP.md`: "how much to feed a puppy" links to `/guides/how-much-to-feed-a-puppy/`, "puppy food calculator" to `/tools/puppy-food-calculator/`. Consistent anchors for the same destination reinforce the keyword map and avoid cannibalization.
5. **Trailing slash always** (`/tools/x/`): `trailingSlash: 'always'`. `links.mjs` warns `no-trailing-slash`. Never link to `/index.html`, query-string states, or `pages.dev`.
6. **No sitewide keyword link blocks** (footer/sidebar lists of keyword-rich anchors beyond the registry-driven ones).
7. **Reciprocity**: when tool A lists B in `related` (`src/data/tools.ts`), add A to B's `related` too, unless the relation is intentionally one-way (document why in a comment).
8. **Safety links**: toxin/emergency tools and guides link to each other and to the disclaimer/Methodology, never to affiliate or product pages.
9. **Embed pages** link out to the tool (attribution); nothing links *to* embed pages from the main nav.
10. **External links** only to authoritative sources (via `SRC`), `rel="noopener noreferrer"`; never to competitor calculators.

## 3. Procedure

### A. Audit the graph

```bash
npm run build
npm run audit:seo       # orphan, weak-inbound, tool-related, broken-link, no-trailing-slash
npm run check:links     # broken links, fragments, generic/empty anchors
```

Optional inbound-count table (what links to each page):

```bash
node --input-type=module -e "
import { loadPages, analyzeInternalLinks, readSiteConfig } from './scripts/audit/lib.mjs';
const pages = loadPages(); const { inbound } = analyzeInternalLinks(pages, readSiteConfig().siteUrl);
for (const [r, s] of [...inbound].sort((a,b)=>a[1].size-b[1].size)) console.log(String(s.size).padStart(3), r);
"
```

Anything under 3 on a tool/guide needs links (hubs and footer already count as inbound, so a real "3" means contextual links exist too).

### B. Fix, in this order

1. **Orphans / weak**: find the closest topical page (`rg -n -i "<topic words>" src/pages`) and add a sentence with a descriptive anchor where it genuinely helps the reader. Add the destination to `related`/`relatedTools` in `src/data/*.ts` as well.
2. **Broken**: fix the href; if the target was renamed, add redirects (`public/_redirects`, `vercel.json`) and update every inbound link (do not leave redirect chains).
3. **Missing coverage**: for each planned guide, make sure its supporting tool page has a "Related reading" link to it at publish time (`write-seo-article` step 4).
4. **Anchor hygiene**: replace generic anchors; ensure the same destination is not linked with different, conflicting keyword anchors from many pages.
5. **Hubs**: confirm `/dogs/` and `/cats/` list the page via registry; add intro sentences (hubs need >= 150 unique words, `adsense.mjs thin-page`).

### C. Patterns that work here

- Tool page "Related reading" section (end of the body): one sentence per link explaining *why* ("For growing dogs, switch to the puppy food calculator because puppies need 2-3 times RER").
- First-150-words link in guides to the supporting calculator ("Use the dog food calculator to turn this into cups").
- A "Next step" line in guides pointing to the next guide in the cluster (feeding cluster: puppy-food calculator -> how-much-to-feed-a-puppy -> dog-food calculator -> how-to-switch-dog-food; age cluster: dog-age calculator <-> dog-years-myth <-> cat-age calculator; safety cluster: chocolate calculator <-> chocolate guide <-> foods-toxic-to-dogs).
- Breadcrumbs already provide Home > Tools > Tool; keep names equal to the H1/short title.

## 4. Verify

`npm run audit:seo && npm run check:links` must show 0 errors; weak-inbound/generic-anchor warnings should be gone for pages you touched. Spot-check three links by clicking them in `npm run preview`.

## 5. Report format

```
Internal linking <date>
Graph: pages N, lowest inbound: <route> (n) ...
Fixes: <page> -> <destination> (anchor "…") ; <data file> related updated
Cluster gaps still open: ...
```
