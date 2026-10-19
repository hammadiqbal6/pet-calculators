# AGENTS.md: PetCalc Tools (pet calculators site)

Instructions for every AI agent (Cursor, Claude Code, Codex, CI bots) and human contributor working in this repository. Read this file first, then the governing documents below.

## 1. What this project is

A **static Astro 7 site of free dog and cat calculators** (puppy weight, dog/cat/puppy food, homemade/raw food, dog/cat age, dog BMI/body condition, pregnancy due date, chocolate toxicity, water intake) plus interlinked guides. It implements **idea #3 "Pet calculators"** from the market research ([docs/ideas/README.md](docs/ideas/README.md)). Business model: organic search traffic monetised with Google AdSense. The goals, in priority order:

1. **Be correct and safe.** Pet health is YMYL-adjacent. Every formula is cited, tested and framed as education, never diagnosis.
2. **Rank** by winning specific long-tail tool keywords with the best tool and the best explanation on the page, not by publishing more pages.
3. **Get and stay AdSense-approved** with real content, trust pages, a clean ad layout and consent.
4. **Be fast**: plain HTML, light vanilla TypeScript, Lighthouse mobile >= 95.

Brand/domain/IDs live in one file: `src/config/site.ts` (`siteName`, `siteUrl`, `buildDate`, GA4, Search Console/Bing verification, `adsensePublisherId`, `indexNowKey`, author/reviewer). `siteUrl`, GA4, and GSC HTML-tag verification are filled from build-time `PUBLIC_SITE_URL`, `PUBLIC_GA4_MEASUREMENT_ID`, and `PUBLIC_GSC_VERIFICATION` (see `.env.example`); never hard-code the domain or brand elsewhere — use `absoluteUrl()`. Deploy as static-assets Worker `pet-calculators` via `wrangler.jsonc`.

### Governing guidelines (binding)

These documents define the strategy and outrank any agent's own preferences. When a task conflicts with them, stop and flag it.

| Document | Governs |
|---|---|
| [docs/SEO-PLAYBOOK.md](docs/SEO-PLAYBOOK.md) | Technical SEO, on-page template, AI search/GEO, link building, scaled-content safety, launch checklist. Claims there are sourced; labelled recommendations are not rules from Google. |
| [docs/MARKET-RESEARCH.md](docs/MARKET-RESEARCH.md) | Why this niche (idea #3), SERP landscape, the AdSense eligibility checklist (section 4), data gaps (no measured volumes). |
| [docs/ideas/README.md](docs/ideas/README.md) | The full idea list, what this repo is and is not (pets only; backlog niches become other repos), and the allowed extension list (bonus add-ons table). |
| [docs/KEYWORD-MAP.md](docs/KEYWORD-MAP.md) | One primary keyword per page, no cannibalization. Machine-checked by `audit:seo`. |
| [docs/SEO-GUIDE.md](docs/SEO-GUIDE.md) | Launch checklist, GSC/Bing/IndexNow/GA4, content calendar (next 20 articles), link building, GEO, 90-day plan. |
| [docs/ADSENSE.md](docs/ADSENSE.md) | Eligibility, when to apply, publisher ID, `ads.txt`, CMP, pitfalls. |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Cloudflare Pages (primary), Vercel, Netlify, domain/HTTPS/redirects, env/config. |
| [PROGRESS.md](PROGRESS.md) | Live build status; update it on milestones. |

Also in `docs/ideas/`: [ideas.csv](docs/ideas/ideas.csv) and [MORE-IDEAS.md](docs/ideas/MORE-IDEAS.md).

## 2. Architecture

```
src/
  config/site.ts            single source of truth: brand, siteUrl, analytics, AdSense, authors
  data/
    tools.ts                registry of calculators (slug, title, description, category, keywords, related)
    guides.ts               registry of guides (slug, title, description, relatedTools, lastUpdated)
    breeds.ts               ~50 breeds, size classes, adult weight ranges, growth months
    sources.ts              SRC: reusable, vetted citations (NRC, WSAVA, AAHA, AAFP, AAFCO, ASPCA, MSD...)
  lib/
    units.ts                lb/kg/g/oz/ml conversions; all internal maths is metric
    formulas/               pure TypeScript formulas (no DOM): energy, puppyWeight, dogAge, catAge, homemade,
                            bmi, pregnancy, chocolate, water + index.ts + formulas.test.ts
  components/
    ToolPageShell.astro     the template for every /tools/<slug>/ page (H1, answer-first, ad slot, takeaways,
                            FAQ, disclaimer, reviewer, author, sources, related tools, WebApplication + FAQ JSON-LD)
    GuidePageShell.astro    the template for every /guides/<slug>/ page (Article + FAQ JSON-LD, tool cards)
    EmbedFrame.astro        chrome for /embed/* pages (noindex, attribution link, no ads)
    AdSlot, Disclaimer, ReviewerBox, AuthorMeta, SourcesList, Faq, Takeaway, RelatedTools, Breadcrumbs
    calculators/*.astro     one vanilla-TS calculator component per tool (+ Embed*.astro) and calc-utils.ts
  layouts/BaseLayout.astro  <head> (title, canonical, OG/Twitter, JSON-LD), nav, footer, cookie notice, GA4/AdSense gates
  pages/
    index.astro             home                   tools/index.astro, dogs/, cats/, guides/ hubs
    tools/<slug>/index.astro, guides/<slug>/index.astro   content pages (one folder per page)
    about, authors, contact, methodology, privacy, terms, 404   trust pages
    embed/*.astro           iframe-able calculators (noindex, excluded from the sitemap)
    robots.txt.ts           generated robots.txt (search bots allowed, Sitemap line from siteUrl)
  styles/global.css         the only stylesheet (inlined at build; do not add a CSS framework)
public/                     favicon, og-default.svg, ads.txt template, _headers, _redirects, IndexNow key file (llms.txt is generated from registries)
scripts/audit/              lib.mjs + seo.mjs + adsense.mjs + links.mjs + budgets.mjs  (all read dist/)
lighthouserc.cjs            Lighthouse CI mobile budgets
.github/workflows/ci.yml    test + build + audits + Lighthouse on every PR
.cursor/                    rules/ (constraints by glob), skills/ (playbooks), agents/ (subagents)
docs/                       strategy and operations (section 1)
```

Key design facts:

- **Static output, trailing slashes everywhere** (`trailingSlash: 'always'`, `build.inlineStylesheets: 'always'`). URLs: `/tools/<slug>/`, `/guides/<slug>/`, hubs `/tools/ /dogs/ /cats/ /guides/`.
- **Formulas are pure TS** in `src/lib/formulas/` and unit-tested with Vitest (`src/**/*.test.ts`). Calculator components only read the form, call a formula, and write the result. Never put maths inside `.astro` files.
- **Calculators run in the browser with no network calls and no input storage.** State is mirrored into the query string (`calc-utils.ts`: `applyQueryToForm`, `syncFormToQuery`, `bindFormInputs`) so results are shareable. The privacy policy depends on this: do not add input logging.
- **Component script gotcha:** `wireWeightUnitToggle` / `wireLengthUnitToggle` call `onChange` on the next microtask, not synchronously. Declare every element/const your `compute()` reads before relying on it, and call `compute()` once at the end of the script. A `ReferenceError` at load leaves the calculator unbound; `npm run lhci` fails on console errors (`errors-in-console`) so it catches this.
- **Content lives in the HTML** (H1, answer-first paragraph, explanation, FAQ). JS only powers the interactive part.
- **Registries drive navigation.** The footer, home, `/tools/`, `/dogs/`, `/cats/`, related-tool cards and audit coverage come from `src/data/tools.ts` and `src/data/guides.ts`. A page without a registry entry is an orphan; a registry entry without a page is a broken link.
- **Ads are off until `adsensePublisherId` is set**, and then are rendered only by `AdSlot.astro`.

## 3. Roles (subagents) mirrored from `.cursor/agents/`

Use the matching subagent for each kind of work. Each one reads the governing documents first, produces findings with file/URL evidence, and does not edit unrelated files. "Read-only" below means it never edits source or copy (it still runs `npm run build` and the audits, which write `dist/`).

| Subagent | File | Use it to |
|---|---|---|
| **seo-auditor** | [.cursor/agents/seo-auditor.md](.cursor/agents/seo-auditor.md) | Audit built pages for titles/meta, headings, canonical, JSON-LD, links, sitemap/robots, keyword-map conformance, cannibalization. Read-only. |
| **content-writer** | [.cursor/agents/content-writer.md](.cursor/agents/content-writer.md) | Draft or revise tool copy and guides to the SEO-PLAYBOOK template (answer-first, worked example, FAQ, sources, disclaimers). The only role that writes page copy. |
| **adsense-reviewer** | [.cursor/agents/adsense-reviewer.md](.cursor/agents/adsense-reviewer.md) | Simulate the AdSense reviewer: thin/duplicate pages, trust pages, privacy/consent, ad placement, policy risk. Read-only. |
| **performance-auditor** | [.cursor/agents/performance-auditor.md](.cursor/agents/performance-auditor.md) | Run and interpret Lighthouse/budgets, find LCP/CLS/TBT regressions, propose minimal fixes. |
| **link-builder-researcher** | [.cursor/agents/link-builder-researcher.md](.cursor/agents/link-builder-researcher.md) | Find legitimate link opportunities (resource pages, communities, partners), draft honest outreach, never spam. Research only. |
| **vet-fact-checker** | [.cursor/agents/vet-fact-checker.md](.cursor/agents/vet-fact-checker.md) | Verify every formula, number, threshold and claim against authoritative veterinary sources; block unsupported claims. Read-only. |

A publish-ready page needs sign-off from `vet-fact-checker` (accuracy) and a clean `npm run audit` (technical). `content-writer` never marks its own work verified. The same roles apply when delegating to other agent tools.

## 4. Skills (`.cursor/skills/<name>/SKILL.md`)

| Skill | Use when |
|---|---|
| [add-new-tool](.cursor/skills/add-new-tool/SKILL.md) | Shipping a new calculator end to end (formula, test, component, registry, page, keyword map) |
| [write-seo-article](.cursor/skills/write-seo-article/SKILL.md) | Writing a guide from the content calendar or revising one |
| [keyword-research](.cursor/skills/keyword-research/SKILL.md) | Choosing, validating and claiming a keyword before any new page |
| [seo-audit](.cursor/skills/seo-audit/SKILL.md) | Full technical + on-page SEO audit with `audit:seo` and manual checks |
| [ai-seo-geo-audit](.cursor/skills/ai-seo-geo-audit/SKILL.md) | AI-answer/GEO readiness: bot access, answer-first structure, citation testing |
| [adsense-readiness-audit](.cursor/skills/adsense-readiness-audit/SKILL.md) | Before applying to AdSense or enabling ads |
| [performance-cwv-audit](.cursor/skills/performance-cwv-audit/SKILL.md) | Core Web Vitals, Lighthouse, JS/CSS budgets, ad-slot CLS |
| [content-refresh](.cursor/skills/content-refresh/SKILL.md) | Scheduled or triggered updates of dated content and sources |
| [internal-linking](.cursor/skills/internal-linking/SKILL.md) | Hub -> tool -> guide linking, orphan and anchor-text fixes |
| [structured-data](.cursor/skills/structured-data/SKILL.md) | JSON-LD for new page types; validating and extending schema |
| [vet-source-citation](.cursor/skills/vet-source-citation/SKILL.md) | Adding or verifying citations in `src/data/sources.ts` |

## 5. Rules (`.cursor/rules/*.mdc`)

Constraints that Cursor attaches by file glob: [seo-pages.mdc](.cursor/rules/seo-pages.mdc), [content-quality.mdc](.cursor/rules/content-quality.mdc), [ymyl-disclaimers.mdc](.cursor/rules/ymyl-disclaimers.mdc), [performance-budget.mdc](.cursor/rules/performance-budget.mdc), [accessibility.mdc](.cursor/rules/accessibility.mdc).

## 6. How to add a new tool (step by step)

Full playbook with checklists: [.cursor/skills/add-new-tool/SKILL.md](.cursor/skills/add-new-tool/SKILL.md). Summary:

0. **Is it allowed?** The tool must be an extension item in [docs/ideas/README.md](docs/ideas/README.md) (bonus add-ons table) or the backlog in [docs/KEYWORD-MAP.md](docs/KEYWORD-MAP.md) section 3, and must be a **distinct task** with its own primary keyword (keyword-research skill). Phrasing variants are not new tools.
1. **Formula**: `src/lib/formulas/<name>.ts` (pure, metric internally, JSDoc cites the source) + `export * from './<name>'` in `src/lib/formulas/index.ts` + tests in `src/lib/formulas/formulas.test.ts` (or `<name>.test.ts`) covering a published worked example, edge cases and invalid input. Template: `src/lib/formulas/water.ts`.
2. **Component**: `src/components/calculators/<Name>Calc.astro`. Copy the structure of `DogAgeCalc.astro`: `<form class="calc-form" id="..." novalidate>`, labelled inputs with hints, a `results` panel with `aria-live="polite"` and `hidden`, then a `<script>` that imports the formula and `calc-utils.ts`, applies/syncs the query string, and calls `showResults`. Weight inputs use `wireWeightUnitToggle` (see `PuppyWeightCalc.astro`).
3. **Registry**: add the entry to `src/data/tools.ts` (`slug`, `title`, `shortTitle`, `description` <= 160 chars and unique, `category`, `keywords` starting with the primary keyword, `related` with 2-3 existing slugs) and add the reciprocal slug to the `related` arrays of those tools.
4. **Page**: `src/pages/tools/<slug>/index.astro` using `ToolPageShell` with `slug`, `title` (primary keyword first), `description`, `answer` (40-60 words), `takeaways`, `faq` (5-8 real questions), `sources` (from `SRC` in `src/data/sources.ts`), the calculator inside `<Fragment slot="calculator">`, then the body: how to use, formula, worked example (numbers identical to the unit test), tables, assumptions and limits, related reading with contextual links. **>= 600 words of body copy.** Template: `src/pages/tools/puppy-weight-calculator/index.astro`.
5. **Docs/config**: add the row to `docs/KEYWORD-MAP.md` (section 1b; remove it from section 3 if reserved); `llms.txt` is generated from the tools/guides registries (no manual URL list); add the page to `urls` in `lighthouserc.cjs` only if it introduces a new template; add contextual links from at least two existing pages (a guide and a sibling tool). `/dogs/` or `/cats/` pick it up from the registry.
6. **Embed (optional)**: `src/components/calculators/Embed<Name>.astro` + `src/pages/embed/<slug>.astro` via `EmbedFrame.astro`; never include ads or `adsbygoogle` code.
7. **Verify**: `npm test && npm run audit` and `npm run lhci`; have `vet-fact-checker` review; bump `buildDate` in `src/config/site.ts` for the release.

## 7. How to add a guide

Follow [.cursor/skills/write-seo-article/SKILL.md](.cursor/skills/write-seo-article/SKILL.md): reserve the keyword in `docs/KEYWORD-MAP.md` (section 2 already lists the next 20), add the entry to `src/data/guides.ts` (`relatedTools` must reference real tool slugs), create `src/pages/guides/<slug>/index.astro` with `GuidePageShell`, >= 800 words, original examples or tables, `SRC` citations, a contextual link to its supporting tool in the first 150 words, and the disclaimers.

## 8. Content, SEO and AdSense rules

Short form; the rules files and docs above are authoritative.

**Keywords and structure** (SEO-PLAYBOOK sections 1, 3, 6; KEYWORD-MAP)
- One primary keyword per page, unique across the site. Primary keyword in `<title>` (first), H1, first paragraph, slug, meta description. Titles <= 65 chars including the brand suffix the layout adds, descriptions 70-160 chars, both unique.
- Exactly one H1. Heading levels never skip. H2s are specific ("Worked example", "Formula"), not generic.
- Answer-first: the first paragraph (`class="answer-first"`) states the answer or formula in 1-2 sentences. Then worked example with concrete numbers, tables with dated sources, assumptions and limits, FAQ (5-8 real questions), sources, related tools.
- Tool above the fold, working without signup, server-rendered text, canonical to the clean URL (query-string state never creates new canonicals).
- Never create a page per phrasing or per breed without unique data (scaled-content abuse, SEO-PLAYBOOK section 6). Use options on the one tool page.
- Every page: self-referencing absolute canonical, `BreadcrumbList`, visible "Last updated", author and reviewer boxes, >= 2 contextual tool/guide links in the body.
- JSON-LD: `Organization` + `WebSite` (layout), `WebApplication` (tools, price 0), `Article` (guides), `BreadcrumbList`. **No `aggregateRating`/`review` ever, unless real on-site ratings exist.** FAQ markup is optional and gives no Google rich result (removed May 2026).
- `robots.txt` allows search/answer bots; `llms.txt` stays a plain link list (Google ignores it).
- `og:image` must be PNG/JPG/WebP (`public/og-default.svg` is a placeholder that social networks will not render).

**YMYL and veterinary content** (rules: ymyl-disclaimers, content-quality)
- Every tool and guide includes `<Disclaimer />` and states limits. Chocolate/toxin pages put "call your vet or a poison hotline now" before any result. Never recommend dosing, medication, or home treatment beyond "contact a veterinarian".
- Every number, formula, threshold or health claim is cited to a source in `src/data/sources.ts` (AAHA, WSAVA, NRC, AAFCO, AAFP, ASPCA APCC, Pet Poison Helpline, MSD/Merck Vet Manual, peer-reviewed papers). If you cannot cite it, delete it.
- `ReviewerBox` shows "pending review" unless a real credentialed reviewer is configured in `site.ts`. **Never invent a reviewer, credential, testimonial, rating, review count, or statistic.**
- AI-assisted drafting is allowed; publishing unverified AI text is not. Fact-check titles, descriptions, alt text and structured data too.

**AdSense** (docs/ADSENSE.md, MARKET-RESEARCH section 4)
- Keep `adsensePublisherId` empty until approval. No ad code in HTML when empty.
- Ads only via `AdSlot`, never above the calculator, <= 3 per page, fixed `min-height`, never on 404/embed/legal/thin pages, never in embeds.
- Privacy policy must keep the ad-cookie, personalised-ads and opt-out language; a certified CMP is required before ads for EEA/UK/CH (the current cookie banner is not a CMP).
- No placeholder, lorem, "coming soon" or TODO text in shipped pages. No pop-ups or interstitials.

**Performance and accessibility** (rules: performance-budget, accessibility)
- No JS framework, no CSS framework, no web fonts unless self-hosted and subset, no third-party scripts except GA4/AdSense/CMP. First-party JS <= 25 KB gzip per page, <= 15 KB for embeds.
- Images need `alt` and explicit `width`/`height`; the LCP image is not lazy. WCAG 2.2 AA: labels on every input, visible focus, contrast >= 4.5:1, keyboard operable, results in an `aria-live` region.

## 9. Quality bar

A change is acceptable only if all of these hold:

1. **Correct**: formulas match cited sources; unit tests include a published/worked example; units convert both ways.
2. **Useful**: the page answers the query better than the current top results (check the live SERP manually); original worked example and table, not paraphrased competitor copy.
3. **Safe**: disclaimers present, no medical advice, emergencies handled, no invented credentials.
4. **Unique**: no page duplicates another page's intent or text (`audit:adsense` shingle check, KEYWORD-MAP).
5. **Technical**: `npm run audit` passes with zero errors; warnings are fixed or explained in the PR.
6. **Fast and accessible**: `npm run lhci` assertions pass (Performance/Accessibility/SEO >= 95, LCP <= 2.5 s, CLS <= 0.1, TBT <= 200 ms, no console errors); keyboard and screen-reader pass for new UI.
7. **Maintained**: sources and "Last updated" are current; content that cannot be kept current is removed.

## 10. Commands

Node `>= 22.22.0` is required (`engines`). If `node` is missing from `PATH`, use your Node 22 install (for example `export PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`).

| Command | What it does |
|---|---|
| `npm ci` | Install exactly from the lockfile |
| `npm run dev` | Astro dev server (`localhost:4321`) |
| `npm run build` | Static build to `dist/` (must run before any audit) |
| `npm run preview` | Serve `dist/` locally |
| `npm test` | Vitest: formula unit tests (`src/**/*.test.ts`) |
| `npm run audit:seo` | Titles/meta, H1, canonical, JSON-LD, OG, alt, word counts, sitemap/robots, orphans, keyword map |
| `npm run audit:adsense` | Required pages, privacy, ads.txt, thin/duplicate pages, ad placement, CMP |
| `npm run audit:budgets` | JS/CSS/HTML/image size budgets from `dist/` |
| `npm run check:links` | Broken internal links, assets and fragments (`-- --external` also checks outbound links) |
| `npm run audit` | `build` + `test` + all audits above |
| `npm run lhci` | Lighthouse CI (mobile): Perf >= 95, LCP <= 2.5 s, CLS <= 0.1, TBT <= 200 ms (build first; set `CHROME_PATH` if Chrome is not found) |
| `npm run proof` | Regenerate committed evidence under `docs/proof/` (audits, Lighthouse HTML/JSON, screenshots, JSON-LD extract) |
| `AUDIT_PROD=1 npm run audit` | Same as `audit` but placeholder domain/reviewer/IndexNow become errors; use for the production deploy |

Audit flags: `--strict` (or `AUDIT_STRICT=1`) turns warnings into errors; `AUDIT_DIST=/path` audits another build; budget limits can be overridden with `BUDGET_*` env vars (see `scripts/audit/budgets.mjs`). Audit output groups findings by code; each finding names the route or file.

Astro dev server in background mode (cloud agents): `astro dev --background`, then `astro dev status`, `astro dev logs`, `astro dev stop`.

Astro docs for routing, components and content: <https://docs.astro.build>.

## 11. Definition of done

- [ ] Primary keyword claimed in `docs/KEYWORD-MAP.md`; no cannibalization.
- [ ] Registry entry (`tools.ts` / `guides.ts`), reciprocal `related` links, page created via `ToolPageShell` / `GuidePageShell`.
- [ ] Formula unit-tested (published example + edge cases); `npm test` green.
- [ ] Copy meets length (tool >= 600, guide >= 800 words), has answer-first paragraph, worked example, FAQ, sources from `SRC`, disclaimer, reviewer/author boxes, "Last updated".
- [ ] `vet-fact-checker` found no unsupported claims (attach its report to the PR).
- [ ] >= 2 contextual inbound links from existing pages and >= 2 outbound links to sibling tools/guides; not an orphan.
- [ ] `npm run audit` passes (0 errors); `npm run lhci` passes for changed templates.
- [ ] No invented ratings/credentials/stats; no placeholder text; no new third-party scripts.
- [ ] `src/config/site.ts` `buildDate` and the page's `lastUpdated` updated; registry entry present so generated `llms.txt` includes the page.
- [ ] Docs updated if behaviour or policy changed (this file, SEO-GUIDE, ADSENSE, DEPLOYMENT); `PROGRESS.md` updated on milestones.

## 12. Git and PR conventions

- Small, logical commits; imperative subject ("Add dog food transition calculator").
- Run `npm run audit` before pushing; CI (`.github/workflows/ci.yml`) re-runs tests, audits, Lighthouse, and `npm run proof` (artifact upload).
- Committed proof bundle: [docs/proof/README.md](docs/proof/README.md) — regenerate with `npm run proof`, do not hand-edit.
- Do not commit `dist/`, `.astro/`, `.lighthouseci/` or `node_modules/` (all ignored).
- Do not change `docs/MARKET-RESEARCH.md`, `docs/SEO-PLAYBOOK.md` or `docs/ideas/*` without an explicit instruction; add dated notes in the operational docs instead.
