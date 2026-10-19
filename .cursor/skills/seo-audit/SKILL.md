---
name: seo-audit
description: Run a full technical and on-page SEO audit of the built pet calculators site - npm run build then scripts/audit/seo.mjs and links.mjs plus manual checks against docs/SEO-PLAYBOOK.md (titles, canonicals, JSON-LD, sitemap, robots, orphans, keyword map, internal links). Use before merging template changes, before launch, and monthly.
---

# SEO audit

Governing documents: `docs/SEO-PLAYBOOK.md` sections 2, 3, 6, 7; `docs/SEO-GUIDE.md` section 1 (launch checklist); `docs/KEYWORD-MAP.md`; rules `.cursor/rules/seo-pages.mdc`.

The audit always runs on the **built output** (`dist/`), never on source, because titles, canonicals, JSON-LD and sitemap are produced at build time.

## 1. Run the automated audit

```bash
export PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH   # if node is not on PATH
npm ci
npm run build
npm run audit:seo
npm run check:links              # add -- --external to verify outbound links (network)
AUDIT_PROD=1 npm run audit:seo   # what the production deploy will enforce
```

What `scripts/audit/seo.mjs` checks (code in parentheses appears in the output):

| Area | Checks |
|---|---|
| Head | `<title>` present, 30-65 chars (hard max 80), unique (`title-duplicate`); meta description 70-160 chars (hard max 200), unique-ish; `lang`, viewport, charset |
| Headings | exactly one `<h1>`, not empty; no skipped heading levels |
| Canonical | exactly one, absolute `https`, **self-referencing** (equals `siteUrl` + route); `noindex` pages must not declare conflicting canonicals; embeds `noindex` or canonical |
| Social | `og:title/description/url/type`; `og:url` equals canonical; `og:image` present, not SVG, absolute https; `twitter:card` |
| Images | every `<img>` has `alt` (empty only if decorative); width/height present (CLS) |
| JSON-LD | every block parses; `@context` and `@type`; Organization on home; `BreadcrumbList` on non-home; tool pages `WebApplication`/`SoftwareApplication` with `offers.price = "0"`; guides `Article` with headline/dates/author; **fails on `aggregateRating`/`review`** |
| Content | tool pages >= 600 words; guides >= 800 (warn) / >= 600 (error); tool structure: calculator form, Sources section, FAQ, formula heading, disclaimer, "Last updated", >= 2 contextual links |
| Links | broken internal links/assets (`broken-link`), missing trailing slash |
| Graph | orphan pages (no inbound link from another non-embed page), weak inbound (only 1 linker) |
| Sitemap | `sitemap-index.xml` + children parse; every URL maps to a built page, same host as `siteUrl`, trailing slash, `lastmod`; every indexable page is listed; no `noindex`/embed/404 URLs |
| robots.txt | exists, `Sitemap:` line with the right host, no global disallow, search/answer bots (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot) not blocked, CSS/JS not blocked |
| IndexNow | key file present when a real key is configured (placeholder is a launch blocker) |
| Keyword map | every built page appears in `docs/KEYWORD-MAP.md`; no duplicate primary keywords (`cannibalization`) |

Exit code is non-zero on any error. Warnings are not failures unless `--strict`. Treat warnings as a to-do list; record accepted ones in the PR.

## 2. Manual checks the script cannot do

1. **Intent match.** For each of the 5 flagship tools, search the primary keyword (incognito, US). Does our title/H1/first paragraph match what ranks? Compare with the top three: what do they have that we do not (unit toggle, breed list, worked example, sources)?
2. **Title quality.** Primary keyword first, benefit second, not truncated in a SERP preview (pixel width ~580; 55-60 chars is safe), not clickbait. Titles in `ToolPageShell` get the brand suffix from `BaseLayout.astro`: count it.
3. **Rendered HTML.** `curl -s https://<host>/tools/<slug>/ | rg "<h1|answer-first|<form"` shows the H1, answer paragraph and form in the initial HTML (no JS needed for content).
4. **Cannibalization in the wild.** `site:<domain> "<primary keyword>"` and GSC > Performance > Queries: two of our URLs getting impressions for the same query means merge or differentiate.
5. **Indexing.** GSC > Pages: expected statuses only; "Crawled - currently not indexed" on a tool page is a quality signal (improve content, do not resubmit).
6. **Structured data.** Rich Results Test on `/`, one tool, one guide. Visible text must match the markup. No FAQ rich result expected (removed May 2026); no `HowTo`.
7. **Redirects/canonical host.** Follow the `curl` loop in `docs/DEPLOYMENT.md` section 2.2.
8. **Crawlability.** `robots.txt` live (not CDN-rewritten), sitemap submitted, AI search bots not blocked at the CDN (DEPLOYMENT section 6).
9. **Duplicate content.** Spot-read two sibling tool pages; the formula/worked-example/FAQ sections must be genuinely different.
10. **Freshness.** "Last updated" and `lastmod` reflect real content changes only (SEO-PLAYBOOK sitemap rule).

## 3. Triage

| Severity | Examples | Action |
|---|---|---|
| P0 (blocks merge/launch) | any audit error, noindex on content, canonical to wrong host, broken nav link, fake rating schema, missing disclaimer | fix now |
| P1 | thin copy, duplicate title/description, orphan/weak-inbound, wrong og:image format, missing sources | fix this sprint |
| P2 | heading skips, missing image dimensions, generic anchor text, secondary-keyword gaps | batch |

## 4. Report format

```
SEO audit <date> on commit <sha>
Automated: seo.mjs <E errors / W warnings>, links.mjs <E/W>, AUDIT_PROD=1 result
P0: <issue> - <url> - <evidence> - <fix path:file>
P1: ...
P2: ...
Manual: intent match (5 flagship) / SERP gaps / rich results / indexing notes
Recommended next 3 actions (highest impact first)
```

Always cite exact URLs/files and the audit code. Do not "fix" by weakening `scripts/audit/*.mjs` or lowering thresholds; if a threshold is wrong, change it in `scripts/audit/lib.mjs` `LIMITS` with a justification that references `docs/SEO-PLAYBOOK.md`.
