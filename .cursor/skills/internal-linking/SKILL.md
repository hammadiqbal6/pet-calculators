---
name: internal-linking
description: Plan and implement PetCalc internal links (hubs, related tools, guides) to fix orphans and reinforce keyword ownership.
---

# Internal linking (PetCalc)

Broken links: `npm run check:links` (`scripts/audit/links.mjs`). Orphans: `audit:seo` `orphan` codes.

Keyword ownership still wins: links **support** the map in `docs/KEYWORD-MAP.md`, never compete with another page's primary keyword in anchor text.

## Hub hierarchy

```
/  →  /tools/ | /dogs/ | /cats/ | /guides/
Hubs  →  every child tool/guide in that section
Tool  ↔  related tools + supporting guides (from KEYWORD-MAP notes)
Guide  →  embed/link owning calculator
```

Files:

- Hubs: `src/pages/tools/index.astro`, `src/pages/dogs/index.astro`, `src/pages/cats/index.astro`, `src/pages/guides/index.astro`
- Registry: `src/data/tools.ts` (`related` slugs), `src/data/guides.ts`
- Component: `src/components/RelatedTools.astro`

## Rules for new pages

1. Add to the correct hub list with descriptive anchor (not "click here").
2. Set `related` in `src/data/tools.ts` (≥2 slugs, audit enforces `minRelatedLinks`).
3. From at least one guide, link contextually if KEYWORD-MAP "Notes" says "Supports …".
4. Footer/header nav already global — hubs still need body links to every child.

## Anchor text

- Use natural phrases that match **secondary** keywords on the target page.
- Do **not** use another page's **primary** keyword as exact-match anchor from a different URL (cannibalization risk).
- Emergency pages: prefer "dog chocolate toxicity calculator" on safety guides, not generic "calculator".

## Embeds

- `/embed/*` pages are thin by design; link **from** full tool pages, not into embeds as primary navigation.

## Audit workflow

```bash
npm run build
npm run check:links
npm run audit:seo   # orphan + sitemap coverage
```

Fix pattern:

| Issue | Fix |
|-------|-----|
| Orphan tool | Add to `/tools/` and `/dogs/` or `/cats/` body + one guide |
| Orphan guide | Add to `/guides/` index + link from supporting tool |
| 404 link | Update href to trailing-slash route (`trailingSlash: 'always'`) |

## When adding KEYWORD-MAP rows

Note "Supports `/tools/...`" in the Notes column — that documents required internal links for future editors.
