---
name: structured-data
description: Add, change and validate JSON-LD on the pet calculators site - Organization/WebSite in BaseLayout.astro, WebApplication in ToolPageShell, Article in GuidePageShell, BreadcrumbList - respecting current Google support (FAQ rich results removed May 2026, HowTo deprecated, no fake ratings). Use when adding a page type, editing shells, or debugging schema warnings from scripts/audit/seo.mjs.
---

# Structured data (JSON-LD)

Governing documents: `docs/SEO-PLAYBOOK.md` section 2 "Structured data" table and top-10 item 7; `.cursor/rules/seo-pages.mdc`. Structured data must match visible text and never claim things the page does not show (Google AI features guidance, cited in the playbook).

## 1. What exists today and where it comes from

| Type | Pages | Source | Google rich result? |
|---|---|---|---|
| `Organization` (name, url, logo, email, `sameAs` if set) | all | `src/layouts/BaseLayout.astro` `defaultJsonLd` | Yes (knowledge panel/logo) |
| `WebSite` | all | `BaseLayout.astro` | No SERP feature; entity signal |
| `BreadcrumbList` | pages that pass `breadcrumbs` | `BaseLayout.astro` `breadcrumbJsonLd` | Yes |
| `WebApplication` (+ `offers` price `0`, `applicationCategory: HealthApplication`) | `/tools/<slug>/` | `src/components/ToolPageShell.astro` | Software app rich result needs real rating/review; without it, no feature |
| `FAQPage` | tools and guides with FAQ | shells | **No** (removed from Google Search May 2026). Valid schema.org; keep only if it mirrors the visible FAQ exactly |
| `Article` (headline, dates, author, publisher) | `/guides/<slug>/` | `src/components/GuidePageShell.astro` | Article markup helps understanding; no special feature required |
| `ProfilePage` | `/authors/` | page file | no |

Not used and not to be added without evidence: `HowTo` (deprecated 2023), `Review`/`AggregateRating` (no ratings are collected; `audit:seo` fails `jsonld-fake-rating`), `MathSolver` (not a math-solver), `Product`, `LocalBusiness`, `MedicalWebPage` claims implying clinical review that does not exist.

## 2. Rules

1. **Truthfulness first.** Every property must be visible on the page or derivable from it. No rating/review values unless real ratings are collected on-site with a visible UI; never invent `reviewCount`, `author` credentials, `reviewedBy`, `medicalAudience` claims.
2. **Absolute URLs** built with `absoluteUrl()` from `src/config/site.ts`; canonical-equal `url`. Never hard-code the domain.
3. **Dates**: `dateModified` = real last material change (`siteConfig.buildDate` for tools, `guide.lastUpdated` for guides); `datePublished` must not be after `dateModified`.
4. **One graph per concept.** Do not add a second `Organization`/`WebSite` in pages (layout does it). Extra blocks go through the `jsonLd` prop of `BaseLayout`/shell.
5. **Author/publisher** consistent with `siteConfig.defaultAuthor` and `/authors/`. If a real reviewer is configured, add `reviewedBy` (Person) only then, and only on pages that reviewer actually reviewed.
6. **WebApplication**: `name` = tool title, `applicationCategory`, `operatingSystem: 'Any'`, `offers: { price: '0', priceCurrency: 'USD' }`, `isAccessibleForFree: true`, `description` = meta description. Do not add `aggregateRating`.
7. **Language and size**: `inLanguage: 'en-US'`; keep JSON small (it is inlined in HTML and counts toward the 60 KB gzip HTML budget).
8. **Escape**: use `JSON.stringify` through `set:html` (the layout does) so `</script>` cannot break out.

## 3. Add a new page type

Example: a "comparison" or "glossary" page type.

1. Choose the schema.org type that matches visible content (`Article`, `CollectionPage`, `DefinedTermSet`). If there is no Google feature for it, ask whether the markup is worth maintaining.
2. Add the block in the shell/page via the `jsonLd` prop:

```astro
const jsonLd = [{
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: guide.title,
  description,
  url: absoluteUrl(path),
  mainEntityOfPage: absoluteUrl(path),
  inLanguage: 'en-US',
  datePublished: guide.lastUpdated,
  dateModified: guide.lastUpdated,
  author: { '@type': 'Organization', name: siteConfig.defaultAuthor.name, url: absoluteUrl('/authors/') },
  publisher: { '@type': 'Organization', name: siteConfig.siteName, url: absoluteUrl('/'),
               logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon.svg') } },
}];
```

3. Pass `breadcrumbs` to `BaseLayout` (names equal the visible breadcrumb trail).
4. Teach the audit about the type if it is mandatory for a page class: add to `scripts/audit/seo.mjs` (look at the `type === 'tool'`/`'guide'` blocks) and mention it in `.cursor/rules/seo-pages.mdc`.

## 4. Validate

Automated (post-build): `npm run build && npm run audit:seo` checks parseability, `@context`/`@type`, Organization on home, `BreadcrumbList` on non-home pages, `WebApplication` with price `0` on tools, `Article` on guides, absence of rating/review markup.

Manual before launch and after template changes:
1. Google Rich Results Test (<https://search.google.com/test/rich-results>) on `/`, one tool, one guide using the deployed URL or pasted HTML from `dist/`.
2. Schema Markup Validator (<https://validator.schema.org>) for the full graph.
3. Compare each property to the rendered page (title, dates, author, breadcrumb names).
4. Search Console > Enhancements: check for Breadcrumbs and any Software app warnings after indexing.

Extract blocks locally:

```bash
node --input-type=module -e "
import * as cheerio from 'cheerio'; import fs from 'node:fs';
const \$ = cheerio.load(fs.readFileSync('dist/tools/dog-food-calculator/index.html','utf8'));
\$('script[type=\"application/ld+json\"]').each((_,e)=>console.log(JSON.stringify(JSON.parse(\$(e).text()),null,1)));
"
```

## 5. Common mistakes

| Mistake | Effect | Fix |
|---|---|---|
| Adding `aggregateRating` "to get stars" | Spam/misleading markup, manual action risk | remove; only real, collected, visible ratings |
| FAQ items in JSON-LD that differ from visible text | mismatch | generate both from the same `faq` array (the shells do) |
| `dateModified` bumped sitewide for cosmetic changes | Distrust of freshness signals | bump only on material change |
| Relative URLs or wrong host | invalid entity URLs | use `absoluteUrl()` |
| Breadcrumb names differ from visible trail | confusing | same array for both (shell does) |
| Two Organization blocks | noise | only the layout emits it |
| `HowTo` markup on "How to use" sections | no feature, extra bytes | skip |
