# More Free Tool Site Ideas (Round 2)

Prepared for Sidney Karanja on 19 Oct 2026 (PKT). This follows `report.md`. You've picked **home & garden calculators, pet calculators, and niche file converters**, so this round adds **12 new ideas**, ranked #12 to #23 and appended to `ideas.csv`.

## Data sources and honesty notes
- **Ahrefs, as published:** keyword volume and KD for niche templates come from Ahrefs' free-tools strategy article (Keywords Explorer, US) [A1].
- **Meyerhans/Ahrefs-API calculator census (Jul 2026)** [A2]. I pulled its embedded dataset (187 ranking pages, saved at `raw/meyerhans_deepdive.json`). For each calculator keyword it gives a **volume tier** (head = 100k+/mo, body = 10k to 100k, long tail = under 10k, US). It also lists the small or medium sites in the **top 3** with their Ahrefs DR, referring domains, and estimated page traffic. This is the strongest evidence I have that small sites rank. It shows **tiers, not exact volumes.**
- **Google Autocomplete:** demand modifiers, saved at `raw/ac3.txt`.
- **SERP checks** via the web-search tool's index (not live Google). **Reddit** for demand signals.
- **Nuqti estimates were rejected this round.** Most outputs came back as identical defaults (e.g. 7,400/mo, KD 20, CPC $2.54 for unrelated terms like "lye calculator", "yarn calculator", and "bah calculator"), so they're model noise. The raw output is kept at `raw/nuqti_results2.json`, but none of it is used.
- **No measured CPC figures.** Monetization notes say which advertiser vertical is involved, and nothing more.

---

## Ranked summary

| # | Idea | Volume evidence | Small sites in top 3? | CPC vertical | Effort |
|---|---|---|---|---|---|
| 12 | **Veterans & military benefits** (VA combined rating, compensation, BAH, GI Bill BAH) | "va disability calculator" = **body tier (10k to 100k)** [A2] | A law-firm site (DR 57) gets about 68k visits/mo to its calculator page; disability.help ranks [A2][S1] | Veteran law and finance (strong) | Low to medium |
| 13 | **FIRE / financial independence** (Coast, Barista, couples, country versions) | Long tail [A2] | **theficalculator.com DR 0** in top 3 with 267 RDs; small sites own "coast fire for couples" [A2][S2] | Investing and finance (strong) | Low |
| 14 | **Auto fitment & performance** (tire size comparison, wheel offset, gear ratio, HP, compression ratio) | Long tail, several terms [A2] | DR 0 (HP), DR 29 (gear ratio), DR 47 (wheel offset) in top 3; tirulator.com and others for tire size [A2][S3] | Auto parts and tires | Low to medium |
| 15 | **Payment processor & creator fees** (Stripe, PayPal, Square, Venmo, Patreon) | "stripe fee calculator" = long tail [A2] | invoiless.com DR 27 in top 3; PayPal G&S SERP is all small tools [A2][S4] | Fintech and business | Low |
| 16 | **Event & party planning** (wedding alcohol, party food, cocktail batch, seating chart template) | **Wedding seating chart template 1,900/mo, KD 7** [A1]; alcohol calc long tail [A2] | hubtap.com DR 29 (links from DR 66 to 77 wedding sites); batchcalc.com DR 9 [A2][S5] | Wedding and events | Low |
| 17 | **Soap, candle & resin makers** (lye, fragrance load, wax, epoxy) | Long tail, many terms [A2] | candlewaxcalculator.com DR 16, americansoyorganics.com DR 13; r/soapmaking keeps asking "which calculator?" [A2][S6][R1] | Craft supplies | Medium |
| 18 | **Student exam score predictors** (AP per subject, SAT, final grade) | Final grade calc = head tier (rogerhub owns it) [A2]; AP subjects not measured | Small AP sites rank (agrader.ai, apushcalculator.net, calculatorbox.org) [S7] | Education and test prep | Medium |
| 19 | **Car audio / speaker box** (sub box volume, port, cut sheet, wiring) | Long tail [A2] | subbox.pro DR 39 (428 RDs), americanbassusa DR 28; r/CarAV and r/diyaudio requests [A2][R2] | Car audio retail | Medium |
| 20 | **Niche business document generators** (fill-in and export to PDF) | Construction estimate template **1,200 KD 2**; photography contract **1,100 KD 6**; podcast script **600 KD 1**; real estate flyer **350 KD 8**; tattoo consent **150 KD 0** [A1] | Ahrefs: near-zero KD for profession-specific templates [A1] | Business/B2B | Medium |
| 21 | **Outdoor sports sizing** (ski, snowboard, arrow spine, golf handicap, hiking time, surfboard) | Long tail, many terms [A2] | frostyrider.com DR 2, hikeclock.com DR 0, dincalculator.com DR 32 [A2] | Sporting goods (seasonal) | Low to medium |
| 22 | **Homestead & livestock** (cattle/goat gestation, coop size, firewood, propane) | Long tail [A2] | DR 14 to 19 sites in top 3; herdmath, barncalc, useturnrow [A2][S8] | Ag and farm supply | Low |
| 23 | **Fiber arts** (yarn, knitting gauge, fabric, quilt, cross-stitch) | Long tail [A2] | **DR 0 to 3 sites** in top 3 (crochify, knitterskitchen, gaugeguru, frsystems) [A2] | Craft retail (lower CPC) | Low |

**How it's ranked:** strength of the CPC vertical × evidence that small sites rank × volume tier × how easy a static, client-side build is.

---

## Idea details

### #12 Veterans & military benefits calculators
- **Keywords (autocomplete):** va disability calculator 2026/2027, accurate, actual percentage, for dependents, for back pay, for hearing loss, for mental health, for multiple disabilities, app; bah calculator 2026, army, air force, gi bill, for online students, overseas.
- **Evidence:** "va disability calculator" is **body tier (10k to 100k/mo US)**. hillandponton.com (DR 57, a veteran-law firm) ranks top 3 with about 68,123 est. visits/mo to that page [A2]. The SERP also shows va.gov, benefits.va.gov, and the Federal Register 2026 COLA table, plus disability.help, which says its calculator is "Reviewed by Michael Rupe" [S1].
- **Why it's good:** the math is fully static (38 CFR 4.25 combined ratings table, bilateral factor, annual COLA rates). Rates change every 1 December, which rewards updated sites.
- **Risks:** this is YMYL. Cite the regulation, show worked examples, add a "not affiliated with VA" note, and update every year.
- **Supporting content:** how VA rounds ratings, the bilateral factor explained, 2026 rate tables with dependents, a BAH explainer.

### #13 FIRE / financial independence calculators
- **Keywords:** coast fire calculator for couples, with pension, with inflation, by age, Australia, South Africa; financial independence calculator UK, Canada, India; barista fire; fire number.
- **Evidence:** long tail. **theficalculator.com (DR 0) is top 3 with 267 referring domains**, and networthify.com (DR 49) gets about 13,857/mo [A2]. Small sites hold the "for couples" SERP: coastfirecalculator.app, coastfirecalc.org, plantogetherfi.com [S2].
- **Angle:** country-specific tax wrappers (401k, ISA, RRSP, super), couples and staggered retirement, and a clear statement of assumptions.
- **Content:** where the 4% rule comes from, real vs nominal returns, worked household examples.

### #14 Auto fitment & performance calculators
- **Keywords:** tire size calculator comparison, for speedometer, for gear ratio, motorcycle, ATV; wheel offset and backspacing calculator, visualizer, mm to inches; gear ratio calculator for bigger tires, drag racing, bicycle; horsepower; compression ratio.
- **Evidence:** wheel offset, gear ratio, horsepower, and compression ratio are all long tail. Top-3 sites include builtbottomendperformance.com (DR 0), electricscooterparts.com (DR 29), and 1010tires.com (DR 47, about 6,204/mo) [A2]. The tire-size SERP has tirulator.com, calculatorcollection.org, and infinitycalculator.com [S3].
- **Content:** reading a tire code, the "±3% diameter" rule, a plus-sizing guide, and a visual fitment comparison.

### #15 Payment processor & creator fee calculators
- **Keywords:** stripe fee calculator 2026, UK, Canada, Australia, euro, international; paypal fee calculator for goods and services, friends and family, international, for India, AUD; plus Square, Venmo, Cash App, Patreon, and Ko-fi.
- **Evidence:** long tail. invoiless.com (DR 27) is top 3 with about 2,080/mo [A2]. The PayPal G&S SERP is all small tools: merchantfeecalc.com, ordio.com, sellingfeescalculator.com, feecalc.fragranceswap.net [S4].
- **Note:** this sits next to the earlier marketplace-fee idea (#2). The two could share one site.

### #16 Event & party planning calculators
- **Keywords:** wedding alcohol calculator for 100 guests, beer and wine, Canada, Australia, spreadsheet; party food calculator (graduation, kids, finger food, cost); cocktail batch; balloon arch; **wedding seating chart template (1,900/mo, KD 7)** [A1].
- **Evidence:** hubtap.com (DR 29, about 1,768/mo) earns links from DR 66 to 77 wedding publishers [A2]. batchcalc.com is DR 9. The alcohol SERP has vowmath.com, weddingmath.com, pbcocktails.com, stocktheevent.com [S5].
- **Content:** drinks-per-hour assumptions, printable shopping lists, budget guides.

### #17 Soap, candle & resin maker calculators
- **Keywords:** lye calculator for cold process, hot process, goat milk, liquid soap; candle fragrance load / wax / cost calculator; epoxy resin calculator in ml, grams, oz, for a round table.
- **Evidence:** many long-tail terms. Small top-3 sites: candlewaxcalculator.com (DR 16, 345 RDs), americansoyorganics.com (DR 13), the-sage.com (DR 32) [A2]. Other ranking tools: waxhippo.com, candlejar.co, makercalculators.com, makerestimate.com [S6]. r/soapmaking has repeat "what's your go-to soap calculator" threads [R1].
- **Risk:** lye amounts are safety-critical. Use a sourced SAP value database and test against SoapCalc.

### #18 Student exam score predictors
- **Keywords:** ap score calculator 2026; apush, ap bio, ap chem, calc ab/bc, ap lang, ap lit, apes, ap world; sat score calculator; final grade calculator.
- **Evidence:** "final grade calculator" and "grade calculator" are head tier, owned by rogerhub.com (DR 57) [A2], so avoid them. AP subject terms show small sites ranking (agrader.ai, calculatorbox.org, apushcalculator.net) next to College Board scoring PDFs [S7].
- **Risk:** extreme seasonality, and formats change every year.

### #19 Car audio & DIY speaker box calculators
- **Evidence:** long tail. subbox.pro (DR 39, about 6,183/mo, 428 RDs) and americanbassusa.com (DR 28) are top 3 [A2]. Reddit threads ask "what's your favorite subwoofer box calculator?" [R2]. Autocomplete wants a cut sheet, a PDF, and airspace.
- **Content:** sealed vs ported, box volume by sub size, wiring and impedance diagrams.

### #20 Niche business document generators
- **Data (Ahrefs) [A1]:** construction estimate template 1,200/KD 2; photography contract template 1,100/KD 6; podcast script template 600/KD 1; real estate flyer template 350/KD 8; tattoo consent form template 150/KD 0. Head terms are contested: invoice template KD 43, resume template KD 68.
- **Build:** in-browser form → PDF (e.g. jsPDF). Nothing is stored server-side.
- **Risk:** contracts are legal-adjacent, so add a "not legal advice" notice and make the clause explanations original.

### #21 Outdoor sports sizing & performance calculators
- **Evidence:** ski size, snowboard size, arrow spine, golf handicap, hiking time, surfboard volume, and marathon time are all long tail. Top-3 sites include frostyrider.com (DR 2), hikeclock.com (DR 0, 90 RDs), and dincalculator.com (DR 32) [A2]. 18birdies' golf calculator gets about 17,112/mo, but Meyerhans flags about two-thirds of its RDs as spam [A2].
- **Autocomplete:** ski length for women, kids, height and weight, UK; arrow spine for compound, recurve, longbow, Easton, Gold Tip; golf handicap for 9 holes, 3 rounds, league.

### #22 Homestead & livestock calculators
- **Evidence:** long tail. selectsiresbeef.com (DR 51, about 3,677/mo, cattle gestation), chimneyworksonline.com (DR 19, firewood), and gsgasinc.com (DR 14, propane) are top 3 [A2]. The gestation SERP has herdmath.com, barncalc.com, useturnrow.com, and UW Extension [S8]. Autocomplete shows Angus, Australia, NZ, and Ireland variants.
- **Overlap:** firewood and propane also fit your home & garden site.

### #23 Fiber arts calculators
- **Evidence:** the weakest-authority SERPs in the dataset: crochify-patterns.com (DR 2), knitterskitchen.com (DR 3), gaugeguru.app (DR 0, 255 RDs), frsystems.ca (DR 0, about 1,172/mo for fabric) [A2]. Autocomplete covers crochet blanket, sweater, amigurumi, weaving, quilt backing, curtains, upholstery, and cross-stitch aida.
- **Caveat:** craft retail CPC is likely lower than finance or auto (qualitative).

---

## Bonus: add-ons for the niches you already picked (from the same census [A2])
- **Home & garden:** stair stringer (mycarpentry DR 37, about 19,758/mo), paver (DR 25), sod (DR 11), topsoil (DR 21), grass seed (DR 15), BTU (DR 14), metal roof, retaining wall block, grout, insulation, asphalt, pool volume and pool salt, pond volume. Calcwright counts the pool category at 62,500 searches/mo [report S2].
- **Pets:** raw feeding calculator (feedreal DR 40, perfectlyrawsome DR 55), aquarium volume (bulkreefsupply DR 68, aquacadabra DR 39), cat age (calculatestuff DR 62).
- **File converters:** 3D printing cost calculator (printpal.io DR 29, 3dfils.com DR 14 in top 3). It pairs naturally with the stl→gcode converter.

## Honourable mentions (not ranked)
- **Food & drink ratios** (sourdough hydration and starter, pizza dough, brine and curing salt, coffee ratio, priming sugar/IBU): very small sites rank, e.g. sourdoughcalculator.info DR 1 with 316 RDs, doughguy DR 11, saltyourmeat DR 8, diggingdogfarms DR 0 [A2]. Food CPC is likely low, so these work better as link magnets than AdSense earners.
- **Video and photo calculators** (bitrate and file size for OBS/YouTube/CCTV, depth of field): the bitrate SERP is crowded with new small tools (obs-versions.com, patchify.app, castr.com) [S9]. dofmaster.com owns DOF with 1,304 RDs [A2].
- **Travel carry-on size checker by airline:** demand is clear (autocomplete lists dozens of airlines), but the SERP is already crowded with new dedicated tools (carryonchecker.net, carryon.fit, carryonchecker.com, travelmagma.com) [S10].
- **Avoid:** fantasy trade calculators (need live player-value data; keeptradecut dominates), peptide calculators (health/compliance risk), rising-sign/astrology (low CPC).

## Data gaps
- **No exact volumes** for most new ideas. The Meyerhans census gives Ahrefs volume **tiers** and page traffic estimates. The only exact volume/KD figures are Ahrefs' published numbers for the template keywords.
- **No measured CPC.** Nuqti outputs were rejected as defaults. Check Keyword Planner by hand before committing.
- Ahrefs free tools still sit behind a captcha, Semrush behind a login, and Google Trends returns 429. Seasonality for AP scores, skiing, and weddings is inferred, not measured.
- SERP checks come from a web-search index, not live Google. Verify top-10 results manually in the target country.
- The Meyerhans "traffic" figure is Ahrefs' estimated monthly organic traffic to the ranking page, not keyword volume.

## Sources
- [A1] Ahrefs, "The Free Tools SEO Strategy" (16 Jul 2026), templates and calculators sections: https://ahrefs.com/blog/the-free-tools-seo-strategy/
- [A2] Alejandro Meyerhans, "Linkable Assets: The Calculated Play" (Ahrefs-API census, US, Jul 2026), embedded dataset: https://alejandromeyerhans.com/research/linkable-assets/
- [S1] VA ratings: https://www.va.gov/disability/about-disability-ratings/ · 2026 COLA: https://www.federalregister.gov/documents/2026/02/17/2026-02997/cost-of-living-adjustments-for-service-connected-benefits · https://disability.help/tools/va-combined-rating-calculator/
- [S2] https://coastfirecalculator.app/for-couples · https://www.coastfirecalc.org/coast-fire-calculator-for-couples · https://www.plantogetherfi.com/fi-tools
- [S3] https://tirulator.com/ · https://www.calculatorcollection.org/en/calculators/automotive/tire-size-comparison/ · https://tiresize.com/calculator/ · https://infinitycalculator.com/automotive/tire-comparison-calculator
- [S4] https://www.paypal.com/us/business/paypal-business-fees · https://merchantfeecalc.com/goods-and-services · https://www.ordio.com/en/tools/paypal-fee-calculator · https://sellingfeescalculator.com/paypal-fee-calculator/
- [S5] https://vowmath.com/wedding-alcohol-calculator · https://www.weddingmath.com/guides/how-much-alcohol-for-wedding · https://www.hubtap.com/alcohol-calculator · https://www.stocktheevent.com/
- [S6] https://waxhippo.com/tools/fragrance-calculator · https://candlejar.co/toolbox/candle-fragrance-load-calculator · https://makercalculators.com/calculators/candle-fragrance-load-calculator
- [S7] https://agrader.ai/score-calculator/apush · https://apushcalculator.net/ · https://apcentral.collegeboard.org/courses/ap-united-states-history/exam
- [S8] https://herdmath.com/cattle-gestation-calculator/ · https://barncalc.com/cattle-gestation-calculator/ · https://livestock.extension.wisc.edu/articles/beef-dairy-cattle-gestation-and-calving-date-calculator/
- [S9] https://obs-versions.com/tools/recording-size-calculator · https://castr.com/bitrate-calculator/
- [S10] https://carryonchecker.net/ · https://carryon.fit/ · https://travelmagma.com/tools/carry-on-size-checker/
- [R1] https://www.reddit.com/r/soapmaking/comments/1sjft8y/what_is_your_go_to_soap_calculator/
- [R2] https://www.reddit.com/r/CarAV/comments/rgb7y/whats_your_favorite_subwoofer_box_calculator/ · https://www.reddit.com/r/diyaudio/comments/1h68258/subwoofer_box_calculator/
- Google Autocomplete raw output: `raw/ac3.txt`
