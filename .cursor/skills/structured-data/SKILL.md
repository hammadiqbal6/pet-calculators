---
name: structured-data
description: Implement and validate PetCalc JSON-LD (Organization, WebApplication, Article, breadcrumbs) in BaseLayout and pages.
---

# Structured data (PetCalc)

Validation: `npm run audit:seo` parses all `application/ld+json` blocks in `dist/`. Manual check: Google Rich Results Test (optional; FAQ rich results deprecated for Google — see `docs/SEO-GUIDE.md`).

## Global (all pages)

Injected via `src/layouts/BaseLayout.astro`:

- `Organization` (name, url, logo, `contactEmail`)
- `WebSite` (+ `sameAs` from `src/config/site.ts`)

Use `absoluteUrl()` from `src/config/site.ts` — never hard-code domains.

## Per page type

| Type | Route pattern | Schema |
|------|---------------|--------|
| Tool | `src/pages/tools/*/index.astro` | `WebApplication` + `BreadcrumbList` |
| Guide | `src/pages/guides/*/index.astro` | `Article` + `BreadcrumbList` |
| Hub/home | hubs, `/` | `BreadcrumbList` where applicable |
| Legal | about, privacy, … | Breadcrumbs only; no fake Article |

`ToolPageShell.astro` and `GuidePageShell.astro` build standard blocks — prefer them for consistency.

## WebApplication fields (tools)

Include at minimum:

- `name`, `url`, `description`, `applicationCategory: HealthApplication`
- `operatingSystem: Any`
- `offers` with `price: 0`
- `dateModified: siteConfig.buildDate`

Do not add `aggregateRating` or `review` unless the site collects real on-site ratings.

## Article fields (guides)

- `headline`, `description`, `dateModified`, `author` aligned with `AuthorMeta`
- Link to canonical URL via `mainEntityOfPage` or url field matching `canonicalPath`

## Breadcrumbs

Pass `breadcrumbs` prop to `BaseLayout`:

```ts
[{ name: 'Tools', path: '/tools/' }, { name: 'Dog Food', path: '/tools/dog-food-calculator/' }]
```

Routes must use trailing slashes.

## FAQ markup

`<Faq.astro>` renders visible FAQ HTML. JSON-LD FAQPage is **optional** and does not earn Google FAQ rich results (2026 playbook). Prioritize visible content over extra schema.

## Change checklist

1. Edit page-level `jsonLd` array or shell component.
2. `npm run build && npm run audit:seo` — fix `jsonld-*` errors.
3. If `siteUrl` changed, rebuild (canonical + schema URLs derive from config).

Pair with `seo-audit` for full metadata review.
