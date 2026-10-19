# SEO Playbook: Ranking a Free Tool Website (Oct 2026)

Prepared for Sidney Karanja, 19 Oct 2026 (PKT). Every claim links to its source in the **Sources** list at the end. Where a point is my recommendation and not something a source says, it is labelled **(recommendation)**.

---

## 0. TL;DR: the 10 things that matter most

1. **Choose long-tail, task-specific tool keywords** with low difficulty where page one already shows thin tool pages. Head terms such as "mortgage calculator" (KD 81) and "qr code generator" (KD 90) aren't winnable for a new site [Ahrefs free-tools]. Small businesses hold about 1% of top-3 spots for 100k+ volume calculator terms, rising to about 23% for terms under 10k [Meyerhans].
2. **The tool sits above the fold and works without signup.** Below it goes real explanatory content: the formula, a worked example, assumptions and limits, sources, and an FAQ.
3. **Avoid scaled content abuse.** Don't mass-generate near-duplicate pages, whether with AI or templates, such as one page per city or per phone model with no unique value. Google names "using generative AI tools… to generate many pages without adding value" as spam [Google spam policies].
4. **Google says GEO/AEO is still SEO.** There's no special markup. You can ignore llms.txt, "chunking", and AI-specific rewrites for Google Search [Google AI optimization guide].
5. **Allow the AI search crawlers** (OAI-SearchBot, PerplexityBot, Claude-SearchBot, and Googlebot) to stay eligible for citations. Training bots (GPTBot, ClaudeBot, Google-Extended) are a separate choice [OpenAI bots] [Perplexity bots] [Anthropic bots] [Google crawlers].
6. **Technical basics:** HTTPS, mobile-first rendering, tool output server-rendered or crawlable, Core Web Vitals good (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1) [web.dev], XML sitemap with accurate `<lastmod>` [Google sitemaps], self-referencing canonicals.
7. **Structured data:** `SoftwareApplication`/`WebApplication` (rich result needs a real rating/review plus offers), `BreadcrumbList`, and `Organization`. **FAQ rich results were removed from Google Search in May 2026, and HowTo rich results were deprecated in 2023.** The markup is valid schema.org but gives no Google SERP feature [Google updates] [Google HowTo/FAQ 2023] [Google search gallery].
8. **Links come from usefulness.** Calculator pages from real small businesses average 51.5 referring domains, against roughly zero for normal content pages (the median is 6) [Meyerhans]. Do resource-page outreach, niche communities, and embeddable versions with honest attribution. Never buy links or use keyword-rich widget links [Google spam policies].
9. **Measure with Search Console.** AI Overview and AI Mode traffic counts inside the Performance report ("Web"), and Google has a Generative AI performance report [Google AI features] [Google AI optimization guide].
10. **Keep fee and tax data fresh and show "last updated" dates with links to official sources.** Freshness is the moat in fee and tax calculator niches (recommendation, based on observed SERPs where competitors display "Last updated" stamps).

---

## 1. Keyword research workflow (free tools)

### What actually worked in this research (Oct 2026)
| Tool | Status from this box | Use |
|---|---|---|
| Google Autocomplete (`suggestqueries.google.com/complete/search?client=firefox&q=…`) | ✅ Works | Best free source for **real modifiers**: country, year, category, "for X", "by breed" |
| Ahrefs Free Keyword Generator / KD checker / Traffic checker | ⚠️ Pages load, but data is behind a captcha (`InvalidCaptcha`), so automated use is blocked | Use **manually in a browser**: 1 keyword at a time, shows volume buckets + KD for top terms |
| Ahrefs blog data (published Keywords Explorer figures) | ✅ | Real volumes/KD for many tool keywords (used in report) |
| Semrush free | ⚠️ Login wall (JS app) | Free account gives ~10 Keyword Overview lookups/day in browser (manual) |
| Google Trends | ⚠️ Returned HTTP 429 to scripts | Use manually in a browser for seasonality (e.g. mulch/concrete peak in spring) |
| Google SERP | ⚠️ Script requests get redirected to `/sorry/` (bot check). Google's spam policy also forbids automated scraping of results [Google spam policies] | Check SERPs **manually**, incognito, with country set |
| Google Keyword Planner | Needs a Google Ads account (not tested) | Free with an Ads account. Gives volume ranges and CPC bids (useful for RPM potential) |
| Google Search Console | Needs a verified site | After launch, it's the most accurate source: queries you already get impressions for |
| Nuqti public keyword API | ✅ Works, but values flagged `estimated:true` are model guesses with huge ranges (e.g. "mortgage calculator" estimated 5,500/mo, KD 20, vs. Ahrefs 2.22M, KD 81) | Use only for figures it marks as measured, not estimated |

### Step-by-step method (recommendation, built on Ahrefs' published free-tools method [Ahrefs free-tools])
1. **Seed patterns.** Start with patterns such as `[thing] calculator`, `[thing] cost calculator`, `how much [thing]`, `how many [thing]`, `[thing] estimator`, `[format] to [format]`, `[thing] generator`, `[platform] fee calculator` [Ahrefs free-tools].
2. **Expand with autocomplete.** Query `seed`, `seed + for`, `seed + a…z`, and `seed + 2026`. Write down modifiers that show **distinct user needs**, such as "for tree rings", "for post holes", "for trading cards", "UK", "by breed and weight". Each distinct need is a candidate page *or* a tool option. Don't make a separate page for each phrasing (see §6).
3. **Mine questions.** Look at People Also Ask (manually), "how/what/why" autocomplete, Reddit threads, and AnswerThePublic-style prefixes ("how much", "how many", "is", "can"). These become the FAQ and guide content.
4. **Get numbers.** Check the top 20 to 50 candidates in the Ahrefs free keyword generator and KD checker by hand, or in Semrush free (10 per day), or in Keyword Planner. Record the source next to every figure.
5. **Judge competition manually.** Open the live SERP. A keyword is a **good target** if most of these are true (recommendation):
   - Two or more of the top 10 results are small or new sites (exact-match domains, single-purpose tool sites, unknown brands).
   - The top results are **tool pages** rather than long articles (Ahrefs flags tool-page SERPs as winnable [Ahrefs free-tools]).
   - Ahrefs KD is ≤30 [Ahrefs free-tools] (Ahrefs suggests filtering KD ≤30 together with the lowest DR in the SERP).
   - Ranking tools are outdated (old fee rates, missing options, no mobile UX, stale year).
   - There are no government or official pages taking 3 or more of the top slots. You can't beat nih.gov's BMI page [Meyerhans].
6. **Check monetization.** Look at the CPC range in Keyword Planner, or at whether ads appear on the SERP. Finance, business, home-improvement, and energy topics usually attract more advertiser competition (recommendation, a general principle; no RPM figures are claimed here).
7. **Check seasonality** in Google Trends (manual).
8. **After launch,** go to GSC → Performance → filter by page → sort by impressions. Queries at positions 8 to 30 are the next tool options, FAQ items, or supporting guides to add.

---

## 2. Technical SEO

### XML sitemaps
- **Format:** UTF-8 encoded. Use absolute canonical URLs, and only URLs you want indexed [Google sitemaps].
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://example.com/concrete-calculator/</loc><lastmod>2026-10-19</lastmod></url>
  </urlset>
  ```
- **Limits:** 50 MB uncompressed or 50,000 URLs per file. Beyond that, split into several files plus a **sitemap index** [Google sitemaps]. Separate sitemaps (e.g. `/sitemap-tools.xml`, `/sitemap-guides.xml`) also make GSC reporting easier to read [Google sitemaps].
- **`<lastmod>`:** Google uses it only if it's "consistently and verifiably accurate". Update it only for significant changes to main content, structured data, or links, not for a copyright year change. **Google ignores `<priority>` and `<changefreq>`** [Google sitemaps].
- **Submit:** use GSC's Sitemaps report and add a `Sitemap: https://example.com/sitemap.xml` line in robots.txt [Google sitemaps]. A submitted sitemap is only a hint [Google sitemaps].

### robots.txt (example for a tool site, recommendation)
```
User-agent: *
Disallow: /api/
Disallow: /*?utm_

# AI search / answer engines (allow to be cited)
User-agent: OAI-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Claude-SearchBot
Allow: /

# AI model training (your choice; allowing is fine, disallowing doesn't affect Google Search)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://example.com/sitemap.xml
```
- Don't block CSS or JS that the tool needs to render. Google says AI features need crawling allowed "in robots.txt, and by any CDN or hosting infrastructure", so check Cloudflare bot-fight settings [Google AI features]. Perplexity documents WAF allow-rules for its bots [Perplexity bots].

### Canonicals and clean URLs
- Use a self-referencing `rel=canonical` on every page. If calculator state lives in query parameters (`?w=10&l=20`), canonicalize to the clean URL. Google advises reducing duplicate content [Google AI optimization guide].
- Use short, descriptive, hyphenated URLs (e.g. `/mulch-calculator/`, `/mulch-calculator/tree-ring/`) inside a clear hierarchy. Doorway abuse covers "substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy" [Google spam policies].

### Core Web Vitals, speed, mobile, HTTPS
- Targets at the 75th percentile: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1** [web.dev]. Measure field data in GSC's Core Web Vitals report and PageSpeed Insights. Lighthouse can't measure INP, so use TBT as the lab proxy [web.dev].
- Tool-site tips (recommendation): ship plain HTML with the tool in light JS (no heavy framework for a single calculator). **Reserve fixed-height slots for ad units** so AdSense doesn't cause CLS. Lazy-load below-the-fold ads. Use system fonts or self-hosted fonts.
- Design mobile-first. Google's AI guide asks that the site "displays well across all devices" and that the main content is easy to tell apart from other elements [Google AI optimization guide].
- Use HTTPS everywhere and 301 redirect `http` and `www` variants to one canonical host.

### JavaScript tools
- Google can process JS that isn't blocked, but JS sites are "generally more complex" [Google AI optimization guide]. Put the **explanatory text, H1, and FAQ in the initial HTML** and let JS handle only the interactive part (recommendation). Ahrefs advises putting the tool in crawlable page HTML rather than an iframe [Ahrefs free-tools, via search summary].

### Internal linking
- Use hub → tool → guide clusters. For example, `/garden/` links to every garden calculator, and each calculator links to two or three related calculators and its guide. Google's AI guidance lists "making your content easily findable through internal links" [Google AI features].
- Add breadcrumbs (visible plus `BreadcrumbList` markup).

### Structured data (current Google support)
| Type | Google rich result today? | Advice |
|---|---|---|
| `SoftwareApplication` / `WebApplication` | Yes. Software app rich result is supported, and `WebApplication` is a supported subtype [Google software-app] | Include `name` and `offers` (price 0). A rating or review is needed for the rich result. **Only use real ratings collected on-site** |
| `BreadcrumbList` | Yes [Google search gallery] | Add on every page |
| `Organization` | Yes (knowledge panel, logo) [Google search gallery] | Add on the homepage: name, logo, sameAs links (helps entity understanding) |
| `FAQPage` | **No.** Removed from Google Search in May 2026; docs removed June 2026 [Google updates] | Optional. Keep the visible FAQ for users and other engines; expect no Google rich result |
| `HowTo` | **No.** Deprecated in 2023 [Google HowTo/FAQ 2023] | Skip, or keep as harmless schema.org |
| `MathSolver` | Yes, for math problem solvers [Google search gallery] | Only for genuine math-solving tools |
- Structured data must match the visible text [Google AI features]. Validate with the Rich Results Test [Google software-app].

### Indexing
- **GSC URL Inspection → Request indexing** for key new pages. Use it to see the HTML Googlebot rendered [Google AI features].
- **IndexNow** notifies Bing, Yandex, Seznam, Naver, Yep, and Amazon. **Google isn't a listed participant** [IndexNow FAQ]. Bing's index feeds several AI assistants (an industry observation, not confirmed by the IndexNow FAQ), so it's still worth adding: a key file at root, then a POST of changed URLs, up to 10,000 per request [IndexNow FAQ]. Cloudflare offers native integration [IndexNow FAQ].
- Also verify the site in **Bing Webmaster Tools** (recommendation).

### hreflang (if multilingual)
- Only use it for genuine translations or regional versions (e.g. an Etsy UK fee calculator vs a US one), with reciprocal `hreflang` plus `x-default`. Submit each language URL separately to IndexNow [IndexNow FAQ]. Translating pages at scale without adding value is cited as scaled content abuse ("automated transformations like… translating") [Google spam policies].

---

## 3. On-page SEO for tool pages (template, recommendation)

```
<title>Mulch Calculator for Tree Rings – Bags & Cubic Yards | BrandName</title>   (≈50–60 chars, keyword first)
<meta name="description" content="Work out how much mulch you need around a tree: enter ring and trunk size and depth to get cubic feet, cubic yards and 2 cu ft bags. Free, no signup.">
<h1>Tree Ring Mulch Calculator</h1>
[TOOL - above the fold, sensible defaults, instant result, units toggle, copy/share result]
<h2>How to use it</h2> (3–5 steps)
<h2>The formula</h2> (show the maths + worked example with real numbers)
<h2>Assumptions & limits</h2>
<h2>[Topic expertise section]</h2> e.g. correct mulch depth, cite extension services
<h2>FAQ</h2> (5–8 real questions from PAA/autocomplete)
<h3>Related calculators</h3>
Author/reviewer box + "Last updated: 2026-10-19" + Sources list
```
- **Explanatory content** turns a tool page from "low-value content" into an approved page. AdSense asks for "complete sentences and paragraphs, not only headlines" [AdSense not approved].
- **E-E-A-T signals:** a real About page naming who builds the tools, author or reviewer bylines (e.g. for a fee calculator, "verified against Etsy's Fees & Payments Policy on [date]"), visible sources, a methodology page, contact details, and a changelog. Google's AI guide rewards a "unique point of view" and "non-commodity" content [Google AI optimization guide].
- **Ads layout:** don't push the tool below ads. Keep a clear separation between the main content and ads [Google AI optimization guide]. Follow the Better Ads Standards [AdSense not approved].

---

## 4. AI SEO / GEO (AI Overviews, AI Mode, ChatGPT, Perplexity, Gemini, Claude)

**Google's position (May 2026 guide):** "From Google Search's perspective, optimizing for generative AI search is… still SEO." To be shown, a page must be indexed and eligible for a snippet. AI features use RAG and **query fan-out** over the normal index [Google AI optimization guide].
- **Things Google says you can ignore for Google Search:** llms.txt and other "special" markup, "chunking" content, rewriting content for AI, seeking inauthentic mentions, and over-focusing on structured data [Google AI optimization guide].
- **Things that help:** non-commodity content with a unique point of view, clear headings and sections, images and video, crawlability, page experience, and accurate structured data [Google AI optimization guide] [Google AI features].
- **Controls:** `nosnippet`, `data-nosnippet`, `max-snippet`, and `noindex` limit what appears in AI features. `Google-Extended` is a robots.txt token (not a separate crawler) that controls Gemini training and grounding outside Search; it has **no effect on Search** [Google AI features] [Google crawlers].

**llms.txt (actual adoption status):**
- Google Search ignores it, and it "will neither harm nor help" [Google AI optimization guide] [Google updates, June 2026 note].
- Ahrefs looked at 137K sites (May 2026 logs). 28% publish llms.txt, and **97% of those files received zero requests**. AI retrieval bots (OAI-SearchBot, PerplexityBot, and others) made about 1.1% of the requests to the files that were read. No AI bot requests llms.txt where it doesn't exist [Ahrefs llms.txt study].
- **Verdict:** it's optional and low-value for a tool site. If you add one, keep it plain links, version-controlled, and nothing instruction-shaped, because of the prompt-injection risk [Ahrefs llms.txt study].

**ChatGPT search:** allow `OAI-SearchBot`. Sites that opt out "will not be shown in ChatGPT search answers". GPTBot (training) is independent. Changes take about 24 hours [OpenAI bots].
**Perplexity:** allow `PerplexityBot` and whitelist its IPs in your WAF. Perplexity-User (user-initiated fetches) generally ignores robots.txt [Perplexity bots].
**Claude:** `Claude-SearchBot` controls search indexing, `ClaudeBot` controls training, and `Claude-User` covers user fetches [Anthropic bots].

**Content structure for answer extraction (recommendation, consistent with Google's "organize content… headings" advice):**
- Open each page with a one- or two-sentence direct answer or formula (e.g. "Etsy charges a $0.20 listing fee, 6.5% transaction fee and 3% + $0.25 processing in the US").
- Show worked examples with concrete numbers. AI answers often quote these, as the search engine summaries in this research did.
- Use tables for rates and fees, each with a date and source.
- Use consistent brand and entity signals: one brand name everywhere, `Organization` markup with `sameAs` (GitHub, X, LinkedIn, Product Hunt), a real About page, and genuine mentions in communities. Google says to avoid *inauthentic* mentions [Google AI optimization guide].

**Why tools suit the AI era:** Ahrefs argues tools are "unusually resilient to AI" because an AI Overview can describe a calculation but "can't hand the user the working… calculator" [Ahrefs free-tools].

---

## 5. Off-page and link building for tool sites

What works (sources plus recommendations):
- **Resource-page outreach.** Search `"[topic]" + "resources"` or `"useful links"` and pitch the tool to pages that discuss the task [Ahrefs resource pages] [Ahrefs linkable assets]. For example, the hubtap wedding-alcohol calculator earned links from DR 66 to 77 wedding publishers by solving a painful problem [Meyerhans].
- **Niche communities.** Share in subreddits and forums where people ask the exact question (e.g. r/Etsy fee questions, r/Flipping, r/puppy101). Follow each community's self-promotion rules and give a genuine answer first (recommendation).
- **Product Hunt, Hacker News "Show HN", indie directories** (e.g. AlternativeTo, There's An AI For That for AI tools). These are one-off launch spikes plus a few real links. Avoid "low-quality directory or bookmark site links" [Google spam policies].
- **Embeddable widget.** Offer an embed with a plain branded attribution link (or nofollow). Google lists "keyword-rich, hidden, or low-quality links embedded in widgets" as link spam [Google spam policies].
- **Digital PR / data stories.** Publish aggregated, anonymous data from your tool, as Calcwright did with "What America Calculates" [Calcwright].
- **HARO alternatives:** journalist-request platforms (e.g. Qwoted, Featured, Help a B2B Writer, and Connectively's successors). Answer only where you have real expertise (recommendation; platform availability not verified in this research).
- **Partnerships.** Offer a free white-label or embedded version to relevant bloggers, such as Etsy-seller coaches or garden bloggers (recommendation).

Avoid: paid links without `rel="sponsored"`, link exchanges, automated link programs, PBNs, and expired domain abuse [Google spam policies]. Raw link counts mislead. Meyerhans found about two-thirds of one calculator's 1,775 referring domains were spam [Meyerhans].

---

## 6. Staying safe with AI-assisted content (helpful content, scaled content, site reputation)

- Google's generative AI content guidance: using AI is fine, but "using generative AI tools… to generate many pages without adding value for users may violate Google's spam policy on scaled content abuse". **Fact-check everything**, including titles, meta descriptions, structured data, and alt text [Google gen-AI guidance].
- **Scaled content abuse** examples: AI-generated pages without added value, scraped or synonymized or translated content, stitched content, multiple sites hiding scale, and keyword pages that make no sense [Google spam policies].
- **Fan-out trap:** creating "separate content for every possible variation of how people might search… primarily to manipulate rankings" violates the scaled content policy [Google AI optimization guide]. **Implication for tool sites (recommendation):** make one strong page per *distinct task*, such as tree-ring mulch versus bed mulch. Phrasings like "mulch calculator yards" and "mulch calculator cubic yards" belong on the same page as a unit option, not as separate pages. For PTA tax by phone model, a model page is justified only if it carries unique data (valuation, slab, worked tax, launch price source).
- **Site reputation abuse:** don't host third-party content (e.g. paid guest posts on casinos or loans) to ride your site's rankings [Google spam policies].
- **Misleading functionality:** a tool that doesn't really work, or pushes users into ads, is spam. Google's own example is a "PDF merge" or "countdown timer" site that leads to deceptive ads [Google spam policies]. This matters for AdSense-heavy tool sites.
- **Disclose AI and automation** where it helps users, for example "Rates verified by a human against [official source] on [date]" [Google gen-AI guidance].

---

## 7. Launch checklist

**Before launch**
- [ ] Domain on HTTPS with one canonical host. Brandable name preferred (exact-match domains are a different game [Meyerhans])
- [ ] 8 to 15 working tools in one niche cluster, each with 600+ words of genuinely useful explanation (formula, example, limits, FAQ, sources). The word count is a recommendation, not a Google rule
- [ ] 3 to 5 supporting guides (non-commodity: original examples, data, photos)
- [ ] About (who you are and why you're qualified), Contact (working email or form), Privacy Policy (with Google's required ad-cookie disclosures [AdSense privacy]), Terms, Disclaimer (for finance, tax, and pet health), Methodology/Sources page
- [ ] Clear navigation: hubs, breadcrumbs, no broken links, no "coming soon" pages [AdSense not approved]
- [ ] robots.txt (allow search and AI-search bots), XML sitemap, canonicals, 404 page
- [ ] Structured data: Organization, BreadcrumbList, WebApplication (no fake ratings). Validated
- [ ] Core Web Vitals pass in PageSpeed Insights (mobile). Ad slots pre-sized
- [ ] GSC and Bing Webmaster verified. Sitemap submitted. IndexNow key added
- [ ] Analytics (GA4 or a privacy-friendly tool). Certified CMP ready for EEA/UK/CH traffic before ads [AdSense CMP]

**Launch week**
- [ ] Request indexing for the home page, hubs, and top 5 tools
- [ ] Product Hunt or Show HN post, plus 2 or 3 genuinely helpful community posts
- [ ] Apply to AdSense once the site has real content and some organic traffic (see the report checklist)

---

## 8. 90-day plan (recommendation)

| Weeks | Focus | Deliverables |
|---|---|---|
| 1–2 | Research and build | Pick one niche cluster (report rank #1 or #2). Keyword sheet with sources. Build 8 to 10 tools plus a template. Write the trust pages |
| 3–4 | Launch and index | Go live. GSC, Bing, and IndexNow. Sitemap. Launch posts. Fix CWV. Start outreach to 30 resource pages |
| 5–6 | Content depth | 4 to 6 non-commodity guides (original worked examples, tables with sources). Add 5 more tools from autocomplete gaps. Apply to AdSense |
| 7–8 | Links | Embed widget live. 50 more targeted outreach emails. One data story from tool usage (aggregate, anonymous) |
| 9–10 | Optimize | GSC: find queries at positions 8–30 and add options, FAQ items, and examples. Rewrite titles with low CTR. Check the Generative AI performance report |
| 11–12 | Expand or prune | Double down on the 3 tools with the most impressions (localized versions only where genuinely different, e.g. UK/AU fee rules). Prune or merge thin pages. Update all "last updated" data |

KPIs (recommendation): pages indexed vs submitted, impressions and clicks per tool, average position for target terms, referring domains (count real ones only), AdSense approval, then RPM by country once live.

---

## Sources
- [Google AI optimization guide] https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- [Google AI features] https://developers.google.com/search/docs/appearance/ai-features
- [Google sitemaps] https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- [Google search gallery] https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- [Google software-app] https://developers.google.com/search/docs/appearance/structured-data/software-app
- [Google updates] https://developers.google.com/search/updates (FAQ rich result removed, May 2026; llms.txt note, June 2026)
- [Google HowTo/FAQ 2023] https://developers.google.com/search/blog/2023/08/howto-faq-changes
- [Google spam policies] https://developers.google.com/search/docs/essentials/spam-policies
- [Google gen-AI guidance] https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- [Google crawlers] https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- [web.dev] https://web.dev/articles/vitals
- [IndexNow FAQ] https://www.indexnow.org/faq
- [OpenAI bots] https://platform.openai.com/docs/bots
- [Perplexity bots] https://docs.perplexity.ai/guides/bots
- [Anthropic bots] https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- [Ahrefs llms.txt study] https://ahrefs.com/blog/llmstxt-study/
- [Ahrefs free-tools] https://ahrefs.com/blog/the-free-tools-seo-strategy/
- [Ahrefs linkable assets] https://ahrefs.com/blog/linkable-assets/
- [Ahrefs resource pages] https://ahrefs.com/blog/resource-page-link-building/
- [Meyerhans] https://alejandromeyerhans.com/research/linkable-assets/ (Ahrefs-API census of 200 calculator keywords, July 2026)
- [Calcwright] https://calcwright.com/data/what-america-calculates/
- [AdSense not approved] https://support.google.com/adsense/answer/81904
- [AdSense privacy] https://support.google.com/adsense/answer/1348695
- [AdSense CMP] https://support.google.com/adsense/answer/13554116
