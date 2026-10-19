# Free Tool Website Ideas That Can Rank and Earn with AdSense: Market Research

Prepared for Sidney Karanja on 19 Oct 2026 (PKT). Companion files: `ideas.csv` (ranked ideas and metrics), `seo-playbook.md` (full SEO playbook), and `raw/` (autocomplete dumps, Nuqti API output, Ahrefs blog extract).

## How to read the numbers (important)
- **Measured keyword data** comes from published **Ahrefs Keywords Explorer** figures (US) in Ahrefs' July 2026 article on free-tool SEO [S1]. Some home-improvement volumes come from a **Calcwright study** [S2]; it says only "standard keyword data", so treat those as third-party figures.
- **Ahrefs' free tools (keyword generator, KD checker, traffic checker) couldn't be queried automatically.** Their API returns `InvalidCaptcha`. **Semrush** is behind a login. **Google Trends** returned HTTP 429. **Google SERPs** redirect scripts to a bot-check page.
- **Nuqti's free public API** worked. Most of its figures are flagged `estimated:true`, which means a model guess with very wide ranges. Example: it estimated "mortgage calculator" at 5,500/mo with KD 20, while Ahrefs reports 2,220,000 with KD 81. **Nuqti estimates are shown only as weak, low-confidence signals and are labelled as such.** Only its non-estimated figures (word counter, QR code generator, image compressor) are treated as measured.
- **SERP observations** come from the WebSearch tool's index and a single DuckDuckGo snapshot, not live Google. Verify manually before building.
- **Kenya and Pakistan volumes:** no free source available. Demand there is evidenced only by autocomplete depth and the SERPs.
- I've invented no RPM or earnings figures. Monetization notes are qualitative, plus Nuqti CPC *estimates* clearly labelled.

---

## 1. Summary: top recommended tool ideas (ranked)

| # | Idea | Best evidence | Why it ranks here |
|---|---|---|---|
| 1 | **Home & garden material calculators** (concrete, mulch, gravel, fence, deck, roof pitch) | Concrete calculator 550K/mo; mulch, gravel, paint 60.5K each [S2]. Roof pitch 11K, KD 13; deck material 1.2K, KD 9 [S1] | Huge US demand, strong advertisers, and small sites visibly rank for long-tail variants |
| 2 | **Marketplace seller fee & profit calculators** (Etsy, eBay by category, Whatnot, Mercari, Poshmark, Amazon FBA, TikTok Shop) | Etsy fee calc 2,000, **KD 7**; Amazon FBA calc 4,800, KD 20 [S1] | Low KD, business audience, and fees change every year, so fresh data is a moat |
| 3 | **Pet calculators** (puppy weight, dog food, dog/cat age by breed) | SERPs dominated by small single-purpose sites. Only Nuqti estimates for volume (low confidence) | Clearly rankable for small sites. Needs breed data to stand out |
| 4 | **Pay & small-business money converters** (hourly↔salary, overtime, margin/markup, freelance rate) | Salary to hourly 42K; margin calculator 55K; wage calculator 17K [S1]. Paycheck calc KD 72 (avoid the head term) [S1] | High-CPC finance/HR vertical. Win with long-tail variants |
| 5 | **AI/LLM token & API cost calculators** | Rich autocomplete (Claude, Gemini, Sonnet, PDF, Claude Code). Small dev sites rank. Volume only a Nuqti estimate | Fast-changing niche, so constant updates beat stale competitors |
| 6 | **Kenya payroll & import tax** (PAYE, SHIF, NSSF, Housing Levy, CRSP car duty) | KRA's own PAYE calculator only lists years up to 2023 [S7]. Small local sites rank | Low competition and local expertise, but low RPM |
| 7 | **Pakistan tax & PTA mobile tax** (salary tax FY26-27, PTA tax by phone model) | Very deep autocomplete long tail (model names, IMEI, CNIC vs passport). Small .pk sites rank | Big local demand and annual budget changes, but low RPM and scaled-content risk |
| 8 | **EV & energy cost calculators** (EV charging cost by country, EV vs gas, RV solar sizing) | Gov tools lead the US results, but small sites rank. Country variants appear in autocomplete | Strong-CPC auto and energy advertisers |
| 9 | **Rental property / landlord calculators** (cap rate, cash-on-cash, rental income tax by country) | Autocomplete shows country-tax variants (UK, AU, SA, CA) | High CPC, but YMYL with established competitors |
| 10 | **Niche professional file converters** (client-side) | stl→gcode 1.1K KD 1; yaml→json 2.9K KD 1; psd→png 2.8K KD 4; dwg→pdf 1.5K KD 12; mp3→midi 5.7K KD 10 [S1] | Very low KD, but some are hard to build and CPC is moderate |
| 11 | **Niche name generators** (band, podcast, D&D) | Band name 11K KD 7; podcast name 12K KD 8 [S1] | Low KD but commodity output, low CPC, and easy to clone |

**Recommended play:** build one **topical tool site** around #1 or #2 (US/UK/CA/AU traffic monetizes best). Treat #6 and #7 as a separate local site only if you want quick traction and brand-building where you have local knowledge.

---

## 2. Idea details

### #1 Home & garden material calculators
- **Target keywords:** concrete calculator for post holes, sonotube concrete calculator, concrete slab calculator, mulch calculator for tree rings, mulch calculator bags, gravel calculator, fence calculator (posts, rails, pickets), deck material calculator, roof pitch calculator, paint calculator. Autocomplete also shows "how many bags", "Australia", "Sakrete", "for steps", and "for playground".
- **Volume and KD:** concrete calculator 550,000; square footage calculator 201,000; paint, gravel, and mulch calculator 60,500 each; concrete slab and concrete pad calculator 49,500 each; stair calculator 33,100 [S2, third-party]. Roof pitch calculator 11,000, KD 13; deck material calculator 1,200, KD 9 [S1, Ahrefs]. The Calcwright study found 96% of these searches name "calculator" and only about 1% are phrased as questions [S2].
- **SERP notes:** long-tail results are full of small or new sites: landscapingcalcs.com, fastcalc.us, calcimator.com, measurethenbuild.com (mulch ring); mathgyro.com, fieldcalc.net, homeprojectcalculator.com, fencecalculator.org (fence). calculatorsoup, omnicalculator, and inchcalculator hold head terms. **Caution:** many new AI-built calculator sites have appeared in 2026, so differentiate with depth: bag sizes by brand, waste factor, cost, multi-shape, and printable shopping list.
- **Monetization:** home-improvement advertisers. CPC estimate around $2.5 (Nuqti, low confidence). Seasonal demand (spring/summer) is an assumption; check in Trends manually.
- **Effort:** low per tool (pure math). A 20 to 40 tool hub is achievable.
- **AdSense supporting content:** formula plus worked example, coverage tables, extension-service citations (the leading competitors cite Clemson and Penn State extensions), and guides such as "How much concrete per fence post" and "Mulch depth by material".

### #2 Marketplace seller fee & profit calculators
- **Target keywords:** etsy fee calculator (UK, Canada, Australia, India, digital products, 2026); ebay fee calculator for trading cards, sneakers, watches, or business sellers; whatnot fee calculator; mercari or poshmark fee calculator; amazon fba calculator; tiktok shop fee calculator.
- **Volume and KD:** etsy fee calculator 2,000, **KD 7**; amazon fba calculator 4,800, KD 20 [S1, Ahrefs]. Nuqti estimates (low confidence): ebay fee calc 4.3K, ebay for trading cards 650, whatnot 2.7K.
- **SERP notes:** Etsy now has its own earnings calculator inside the listing form [S8]. Printful ranks. Small sites rank too: waxengine.com, feeslab.com, ebayfeescalculator.com, whatnotfeecalculator.com, flipsail.io, liveseller.ai. Competitors stamp "Last updated" dates, which shows freshness matters.
- **Monetization:** e-commerce and B2B advertisers. CPC estimates $1.7 to $2.9 for eBay, Whatnot, and FBA terms (Nuqti, low confidence). Etsy's estimate was $0.20.
- **Effort:** low to medium. The real work is maintaining fee tables by country and category (e.g. Etsy US: $0.20 listing, 6.5% transaction, 3% + $0.25 processing [S8]).
- **Supporting content:** "Etsy fees explained", "How much eBay takes from a $100 sale", a fee changelog with links to official fee pages, and cross-platform comparisons (Etsy vs eBay vs Whatnot).

### #3 Pet calculators
- **Keywords:** puppy weight calculator, dog food calculator by weight and age, homemade or raw dog food calculator, dog age calculator by breed, cat age calculator, puppy food calculator, dog food switch calculator.
- **Volume:** no measured figure. Nuqti estimates (low confidence): puppy weight 5.3K, dog food 3.8K, dog age 3.4K, cat age 5.7K.
- **SERP:** almost all small or exact-match sites (puppyweightcalculator.co and .net, yourpetcalc.com, puppycalcs.com, pawscales.com, dogweightcalculator.com, mypuppyweightcalculator.com), plus dogster.com. That makes it rankable, but crowded with near-identical sites. Win with breed-specific growth data and vet-sourced guidance.
- **Monetization:** pet food and insurance advertisers. CPC estimate $0.7 to $2.2 (Nuqti, low confidence).
- **Effort:** low to medium (breed tables).
- **Content:** breed growth charts, feeding guides citing vet or AAFCO sources, a vet-review disclaimer, and "When do puppies stop growing?".

### #4 Pay & small-business money converters
- **Keywords:** hourly to salary, salary to hourly, overtime calculator, shift differential calculator, margin calculator, markup calculator, freelance rate calculator (UK, Canada, Germany, India in autocomplete), PTO accrual.
- **Volume and KD:** salary to hourly 42,000; margin calculator 55,000; wage calculator 17,000. Head term paycheck calculator 378,000 at KD 72 (avoid) [S1].
- **SERP:** Omni, Gusto, and Shopify hold head terms [S1]. Win with variants such as country freelance rates, overtime rules, and shift differentials.
- **Monetization:** finance, HR, and payroll advertisers, a high-CPC vertical. Hourly-to-salary CPC estimate $4.60 (Nuqti, low confidence).
- **Effort:** low.
- **Content:** worked examples, country overtime basics with official sources, and "How to price freelance work".

### #5 AI/LLM token & API cost calculators
- **Keywords:** token counter for Claude, Gemini, or ChatGPT; LLM token count calculator; token counter for PDF; AI API cost calculator; token counter for Claude Code.
- **Volume:** Nuqti estimates only (token counter 300, Claude token counter 550; low confidence). Autocomplete is deep.
- **SERP:** official docs (Anthropic, Google) plus small dev sites (howmanytokens.io, tokencalculator.net, counttokens.dev). Anthropic notes newer Claude models tokenize the same text into about 30% more tokens [S9], so stale counters are wrong. That's an opening for accurate tools.
- **Monetization:** tech advertisers. Developer audiences often use ad blockers (general observation, not measured), so this suits a niche or brand play more than an AdSense workhorse.
- **Effort:** medium (tokenizers and pricing upkeep).
- **Content:** a dated pricing table with sources, a context-window comparison, and "tokens vs words".

### #6 Kenya payroll & import tax calculators
- **Keywords:** kra paye calculator 2026, net pay calculator kenya, shif calculator, nssf calculator, housing levy calculator, kenya car import duty calculator (CRSP).
- **Volume:** no free data source. Autocomplete shows 2026, Excel, PDF, and "with pension" variants.
- **SERP:** KRA's official calculator only offers tax years up to 2023 [S7]. Competitors: calc.co.ke, kazipay.co.ke, smartlinkerp.com, igetauto.com.
- **Monetization:** low-RPM geography. You need volume. Good as a credibility and quick-win project.
- **Content:** Finance Act explainers, payslip walkthroughs, and KRA PDF citations.

### #7 Pakistan tax & PTA mobile tax calculators
- **Keywords:** pakistan salary tax calculator 2026-27, pta tax calculator (with model variants such as S24 Ultra, A56, iPhone), pta tax calculator by IMEI, pakistan custom duty calculator for cars, tax calculator for teachers.
- **Volume:** no free data source. Autocomplete depth is the strongest of all seeds tested.
- **SERP:** taxcalculation.pk, iswap.pk, primesim.pk, taxationmaeasy.com, mytaxcalculator.pk, tankhwah.com. All are small sites, and all updated for FY 2026-27 (SRO 1064(I)/2026).
- **Risks:** low RPM. Thousands of thin model pages would be **scaled content abuse** unless each has unique valuation data.
- **Content:** budget-change explainers, FBR slab tables with source PDFs, CNIC vs passport guide.

### #8 EV & energy cost calculators
- **Keywords:** EV charging cost calculator (UK, Australia, Canada, India, Ontario), EV vs gas calculator, EV charging time and cost, solar panel calculator for RV or caravan, solar battery size.
- **Volume:** Nuqti estimates only (EV charging 2.8K, solar panel 350; low confidence).
- **SERP:** DOE AFDC and Argonne lead the US results. Small sites (calc.evconomics.org, us-calculator.com, coolmaptools.com) also rank, and country-specific versions look less contested.
- **Monetization:** auto and energy advertisers. CPC estimate $3.25 (Nuqti, low confidence). **Effort:** medium (tariff data).

### #9 Rental property / landlord calculators
- **Keywords:** rental property calculator (UK, Australia, NZ, Canada, South Africa), cap rate, cash-on-cash, rental income tax calculator, rental property calculator with depreciation.
- **Volume:** Nuqti estimate 1.2K (low confidence). **SERP:** calculator.net, BiggerPockets, and banks. YMYL, so it needs strong expertise signals.
- **Monetization:** high-CPC finance and real estate (Nuqti estimate $4.00, low confidence). **Effort:** medium.

### #10 Niche professional converters
- **Keywords and data:** stl to gcode 1,100 KD 1; yaml to json 2,900 KD 1; psd to png 2,800 KD 4; dwg to pdf 1,500 KD 12; mp3 to midi 5,700 KD 10; pdf bank statement to csv 90 KD 5 [S1]. Ahrefs: "the more winnable keywords are the format pairs specific to one profession, where difficulty drops to single digits" [S1].
- **Angle:** in-browser conversion ("files never leave your device"). **Effort:** easy for yaml/json and psd/png; hard for mp3→midi and dwg.

### #11 Niche name generators
- band name generator 11K KD 7; podcast name 12K KD 8; d&d name 2.1K KD 14; clan name 2.3K KD 5 [S1]. Low CPC and commodity AI output. Only worth it with human-curated lists.

---

## 3. Ideas to avoid (or approach only through a sub-niche)

| Avoid | Data | Why |
|---|---|---|
| Word counter | 1,220,000/mo, KD 65 (Nuqti, measured) | Saturated. Hundreds of clones in the top 10 |
| QR code generator | 776,000, **KD 90** [S1]; Nuqti 823K, KD 79 | Big SaaS brands. Low CPC on the free intent |
| Image compressor / PDF to Word / file compressor | image compressor 74K, KD 77 (Nuqti); pdf to word 220K, KD 81 [S1] | Owned by FreeConvert, Adobe, iLovePDF. Server costs |
| Mortgage, paycheck, calorie, GPA calculators | 2.22M KD 81; 378K KD 72; 868K KD 86; 550K KD 54 [S1] | Big brands and governments own them. Small businesses hold about 1% of top-3 for 100k+ terms [S3] |
| BMI, pregnancy, due date, medical dosage | BMI ranked by nih.gov (8,793 referring domains) [S3] | YMYL health with authoritative incumbents |
| Currency converter, password generator, invoice generator, business name generator | 459K KD 84; 300K KD 82; 183K KD 63; 51K KD 80 [S1] | High KD |
| Mass "programmatic" pages (every city, every phone model, every phrasing) | n/a | Google's scaled content abuse and doorway policies [S5] |
| Thin AI wrappers ("AI essay writer") | n/a | Commodity output, API costs, and AdSense "low value content" risk |

**Sub-niche escape hatches:** "word counter for [platform limits]" such as a character counter for X, LinkedIn, or meta descriptions (meta description generator 1,600, KD 12 [S1]); a "QR code for [WiFi or vCard] that never expires"; "image to [profession format]".

---

## 4. AdSense eligibility checklist for a tool site
Based on the AdSense eligibility page [S10], "account wasn't approved" reasons [S11], page-readiness tips [S12], Program policies [S13], privacy requirements [S14], and CMP requirements [S15]:

- [ ] **You're 18+** and have **one AdSense account** only (duplicates get rejected) [S10][S11]
- [ ] You **own the site and can edit its HTML** to place the code [S10]
- [ ] **Original, unique, interesting content:** every tool page has complete sentences and paragraphs, not just a widget and headings. "Sites that contain mostly images, videos or Flash animations may not be approved" [S11]
- [ ] **No auto-generated or thin pages carrying ad code.** Don't sign up "while your site's still under construction or only consists of a site template" [S11]
- [ ] **Clear navigation:** menus or hubs, no broken links, no pages behind login, no excessive pop-ups, no "under construction" pages [S11]
- [ ] **Privacy policy** that discloses third-party vendors (including Google) use cookies to serve ads based on prior visits, and how users can opt out via Ads Settings or aboutads.info [S14]
- [ ] **Certified CMP integrated with IAB TCF** for personalized ads in the EEA and UK (since 16 Jan 2024) and Switzerland (since 31 Jul 2024) [S15]
- [ ] **About and Contact pages** (not named as mandatory by Google, but supports "unique content" and trust; widely recommended [S16])
- [ ] **Compliant content and traffic:** no prohibited content, no paid-to-click or incentivized traffic, follow Better Ads Standards [S11][S13]
- [ ] **A supported language** for most of the content [S11]
- [ ] **The tool really works.** A tool that "intentionally leads users to deceptive ads rather than providing the claimed services" is spam [S5]
- [ ] Add an **ads.txt** after approval (standard AdSense setup step, recommendation)

**What gets tool sites approved (synthesis):** tools plus explanatory content on each page, plus a few genuine guides, plus trust pages. Google reviews **all pages**, not just the submitted URL [S11]. AdPrepare's guide on tool-site approval says the tool interface alone usually isn't enough [S16].

---

## 5. SEO playbook: key takeaways (full version in `seo-playbook.md`)
1. **Keyword method:** expand seeds with autocomplete, then pull numbers from Ahrefs free, Semrush free, or Keyword Planner by hand. Pick KD ≤30 terms whose SERPs show tool pages and small sites [S1]. Use GSC after launch.
2. **Technical:** HTTPS, mobile-first, CWV (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1). Pre-size ad slots to avoid CLS. Sitemaps up to 50k URLs or 50 MB per file; Google ignores priority and changefreq and uses lastmod only if accurate. Use self-canonicals and clean URLs.
3. **Schema:** WebApplication/SoftwareApplication (real ratings only), BreadcrumbList, Organization. **FAQ rich results were removed from Google in May 2026, and HowTo was deprecated in 2023.**
4. **Indexing:** GSC URL Inspection, plus IndexNow for Bing and others (Google doesn't participate).
5. **AI search:** Google says GEO is still SEO, with no llms.txt or special markup needed. Allow OAI-SearchBot, PerplexityBot, and Claude-SearchBot. In Ahrefs' study, 97% of llms.txt files get zero requests, so it's optional. Write direct answers, worked examples, and dated tables with sources.
6. **Links:** resource-page outreach, niche communities, Product Hunt or Show HN, embeds with honest attribution, and data stories. No paid or widget-spam links.
7. **AI content safety:** AI-assisted is fine; mass pages without value is scaled content abuse. Don't build a page per query variation. Fact-check everything.
8. **Plan:** in 90 days, go from 8 to 10 tools in one cluster, to launch and indexing, to guides and an AdSense application, to links, then optimize from GSC data.

---

## 6. Data gaps and blocked tools
- **Ahrefs Free Keyword Generator, KD Checker, Traffic Checker:** blocked for automation (Cloudflare captcha, API returned `InvalidCaptcha`). I didn't try to get around it. Use them manually in a browser.
- **Semrush free tools:** login wall (JS app). Not queried.
- **Google Trends:** HTTP 429 to scripted requests. No seasonality data.
- **Google SERP:** scripted requests redirected to `google.com/sorry` (bot check). SERP notes come from the WebSearch index and one DuckDuckGo snapshot; DuckDuckGo then rate-limited further requests.
- **Kenya and Pakistan volumes:** no free source (Nuqti supports US, UK, EG, SA, AE, CA, AU, IN, DE, FR only; KE and PK returned HTTP 400).
- **Nuqti estimates are unreliable for absolute volume.** Mulch calculator: Nuqti 5,700 vs Calcwright 60,500. Treat them only as rough relative signals.
- **No People Also Ask scraping** (needs a live Google SERP). Question ideas come from autocomplete "how" queries.
- **No RPM data.** AdSense doesn't publish niche RPMs. Check Keyword Planner CPC bids manually for revenue planning.

---

## 7. Sources
- [S1] Ahrefs, "The Free Tools SEO Strategy" (Ryan Law, 16 Jul 2026), Keywords Explorer US data: https://ahrefs.com/blog/the-free-tools-seo-strategy/
- [S2] Calcwright, "What America Calculates Before It Builds": https://calcwright.com/data/what-america-calculates/
- [S3] Alejandro Meyerhans, "Linkable Assets: The Calculated Play" (Ahrefs-API census, Jul 2026): https://alejandromeyerhans.com/research/linkable-assets/
- [S4] Nuqti public keyword API (model estimates): https://nuqti.com/api/public/v1/keyword?keyword=etsy%20fee%20calculator (pages cited per keyword at https://nuqti.com/keyword/<keyword>)
- [S5] Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- [S6] Google Autocomplete endpoint: https://suggestqueries.google.com/complete/search?client=firefox&q=
- [S7] KRA PAYE calculator: https://kra.go.ke/individual/calculate-tax/calculating-tax/paye
- [S8] Etsy Fees & Payments Policy: https://www.etsy.com/legal/fees/ ; Etsy earnings calculator: https://www.etsy.com/seller-handbook/article/1246712843661
- [S9] Anthropic token counting docs: https://platform.claude.com/docs/en/build-with-claude/token-counting
- [S10] AdSense eligibility requirements: https://support.google.com/adsense/answer/9724
- [S11] AdSense "Your account wasn't approved": https://support.google.com/adsense/answer/81904
- [S12] AdSense "Make sure your site's pages are ready": https://support.google.com/adsense/answer/7299563
- [S13] AdSense Program policies: https://support.google.com/adsense/answer/48182
- [S14] AdSense required privacy content: https://support.google.com/adsense/answer/1348695
- [S15] AdSense certified CMP requirement: https://support.google.com/adsense/answer/13554116
- [S16] AdPrepare, "Can a Tool Website Get AdSense Approval?": https://adprepare.com/blog/tool-website-adsense-approval
- SERP examples: https://landscapingcalcs.com/trees/mulch-ring/ · https://fastcalc.us/garden/tree-mulch-ring/ · https://calcimator.com/calculators/home-garden/mulch-ring · https://mathgyro.com/fence-calculator/ · https://www.printful.com/etsy-calculator · https://waxengine.com/tools/ebay-fee-calculator/ · https://feeslab.com/ebay-fee-calculator/ · https://whatnotfeecalculator.com/ · https://puppyweightcalculator.co/ · https://yourpetcalc.com/puppy-weight-predictor/ · https://howmanytokens.io/ · https://tokencalculator.net/ · https://calc.co.ke/calculate/paye-calculator/ · https://kazipay.co.ke/ · https://taxcalculation.pk/pta-tax-calculator/ · https://www.iswap.pk/pta-dirbs-tax-calculator · https://www.mytaxcalculator.pk/ · https://calc.evconomics.org/ · https://afdc.energy.gov/calc
- SEO playbook sources: see `seo-playbook.md` → Sources.
