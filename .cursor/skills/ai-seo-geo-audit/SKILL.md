---
name: ai-seo-geo-audit
description: Audit PetCalc for AI search visibility (crawlers, llms.txt, cite-worthy structure, IndexNow/Bing).
---

# AI SEO / GEO audit (PetCalc)

"GEO" here means **generative engine optimization**: making accurate, citable answers that AI assistants can retrieve. This site is static Astro — most work is content structure and crawl policy, not SSR hacks.

## Crawl and index baseline

1. Run `npm run audit:seo` — fix canonical, sitemap, and thin-content issues first.
2. Read `dist/robots.txt` (from `src/pages/robots.txt.ts`):
   - Allows Googlebot, Bingbot, **OAI-SearchBot**, **PerplexityBot**, **Claude-SearchBot**
   - Does not block `/_astro/`
   - Points to `Sitemap: {siteUrl}/sitemap-index.xml`
3. Confirm Cloudflare (or host WAF) is not blocking AI bots (`docs/SEO-GUIDE.md` section 1.3).

## `public/llms.txt`

- Keep a concise site map: brand, what calculators do, links to flagship tools and methodology.
- Update when adding major tools/guides.
- Do not expose admin paths or draft content.

## Cite-worthy page shape (tools + guides)

AI systems prefer pages that already look like good citations:

- **Answer-first** lede (40–60 words) stating the result/conclusion.
- **Explicit formula** section referencing `src/lib/formulas/*` behaviour.
- **Worked numeric example** with units.
- **Assumptions & limits** (not a diagnosis; YMYL disclaimers).
- **Named sources** with URLs (`SourcesList`, `src/data/sources.ts`).
- **Visible `dateModified`** via `siteConfig.buildDate`.

Run the `vet-source-citation` skill on any new clinical claims.

## Bing / IndexNow (feeds several AI pipelines)

- `indexNowKey` in `src/config/site.ts` + matching `public/<key>.txt`
- Ping changed URLs after deploy (`docs/SEO-GUIDE.md` section 3) — Google does not use IndexNow.

## Measurement

- GSC performance (including Generative AI reports where available)
- GA4 acquisition: filter referrals containing `chatgpt.com`, `perplexity`, `copilot`, `gemini`, `claude` (`docs/SEO-GUIDE.md` section 4)
- Optional: track `calculator_used` by slug only (no pet inputs)

## Deliverable checklist

- [ ] robots.txt bot list verified on production
- [ ] llms.txt current
- [ ] Top 5 tools + 3 guides meet answer/formula/example/sources pattern
- [ ] Methodology page (`src/pages/methodology.astro`) explains data sources
- [ ] No conflicting duplicate intents (`docs/KEYWORD-MAP.md`)

Pair with `seo-audit` for technical SEO and `structured-data` for JSON-LD consistency.
