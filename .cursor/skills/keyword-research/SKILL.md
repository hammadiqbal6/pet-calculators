---
name: keyword-research
description: Find, validate and claim a target keyword for a new pet tool or guide using the free-tool workflow in docs/SEO-PLAYBOOK.md section 1 - autocomplete expansion, manual SERP judgement, no cannibalization against docs/KEYWORD-MAP.md. Use before creating any new page or renaming a primary keyword.
---

# Keyword research (free tools, manual SERP checks)

Governing documents: `docs/SEO-PLAYBOOK.md` section 1 (method and the table of what worked/blocked), `docs/MARKET-RESEARCH.md` section 6 (data gaps), `docs/KEYWORD-MAP.md` (ownership and rules), `docs/ideas/README.md` (scope: pets only).

**Constraints to respect.** Scripted Google SERP scraping is blocked and against Google's spam policies; Google Trends rate-limits scripts; Ahrefs/Semrush free tools are captcha/login-gated. Use autocomplete via a normal HTTP request, and do everything else manually in a browser. **Never fabricate volumes or KD.** If a number cannot be obtained, write "unknown" and say how you judged instead. Nuqti-type estimates flagged `estimated:true` are not data.

## Inputs

- The idea: a tool or topic, and the user need it serves.
- Current ownership: `docs/KEYWORD-MAP.md` (all tables), `src/data/tools.ts`, `src/data/guides.ts`.

## Step 1: Seed

Generate 10-20 seeds from these patterns (SEO-PLAYBOOK 1 step 1):
- `[pet thing] calculator`, `[thing] estimator`, `how much [food|water] for a [dog|cat|puppy|kitten]`
- `how many [calories|cups|ml] ...`, `[breed] weight at [age]`, `[pet] age in human years`
- `can [dog|cat]s eat [food]`, `[thing] chart`, `[thing] by weight|age|breed`

## Step 2: Expand with autocomplete

```bash
# One request per query; be polite (sleep 1) and cache results in /tmp, never in the repo
q="puppy weight calculator"
curl -s "https://suggestqueries.google.com/complete/search?client=firefox&q=$(printf %s "$q" | jq -sRr @uri)"
# also: "$q for", "$q a".."$q z", "$q 2026", "$q by breed", "$q lb"
```

Record **distinct user needs**, not phrasings. Each distinct need is either (a) a new page, (b) an option/section on an existing page, or (c) an FAQ item. Phrasings of the same intent are never new pages (SEO-PLAYBOOK section 6 fan-out trap).

## Step 3: Mine questions

People Also Ask (manually), autocomplete `how/what/why/can/is`, Reddit (r/puppy101, r/dogs, r/cats, r/DogAdvice, r/AskVet), breed-forum titles. Output: 5-8 questions per candidate for the FAQ/H2s.

## Step 4: Numbers (manual, record source and date)

Per candidate (top 20-50 only): Ahrefs free keyword generator / KD checker (one at a time, in a browser), Semrush free (10/day), Google Keyword Planner (ranges and CPC), and after launch Search Console. Put `volume (source, date)`, `KD (source, date)`, `CPC range` or "unknown". Do not write these figures into `docs/KEYWORD-MAP.md` (it is intentionally volume-free); put them in the PR description or a dated note.

## Step 5: Judge the SERP by hand (incognito, US)

A keyword is a **good target** when most are true (SEO-PLAYBOOK 1 step 5):
- [ ] >= 2 of the top 10 are small/new sites (exact-match domains, single-purpose tool sites)
- [ ] The top results are tool pages, not long articles (for a tool keyword) or thin articles (for a guide keyword)
- [ ] KD <= 30 where known, or the lowest DR in the top 10 is low
- [ ] Competitors are outdated (stale numbers, no mobile UX, no sources, no worked example)
- [ ] < 3 of the top slots held by veterinary schools, government or major publishers
- [ ] We can add something concrete: breed data, worked examples, a better table, safety framing, citations

Reject or merge when the SERP is owned by authority sites and we have no unique angle (as with the BMI/head terms in SEO-PLAYBOOK).

Pet-specific checks: is the topic one where a wrong answer can hurt a pet (toxins, medication, pregnancy)? Then the page needs emergency framing and `vet-fact-checker` sign-off, and may be a guide-only topic (no calculator).

## Step 6: Check ownership and cannibalization

1. Search `docs/KEYWORD-MAP.md` for the candidate and every secondary phrase (`rg -n -i "phrase" docs/KEYWORD-MAP.md src/data`). If any live/planned row owns the intent, the candidate is a secondary keyword of that row; stop.
2. Decide tool vs guide: question phrasing the calculator can answer ("how much to feed a dog") goes to the tool, except where an existing guide already carries it (KEYWORD-MAP rule 4). Pure "why/what/signs/can" topics are guides.
3. Choose the slug = primary keyword, hyphenated. Choose the supporting tool and 2 siblings for internal links.
4. Run the duplicate check mechanically: `npm run audit:seo` after adding the row; it fails with `cannibalization` if the primary repeats.

## Step 7: Claim it

Add the row (`Route | Page type | Primary keyword | Secondary cluster | Intent | Notes`) to the right table in `docs/KEYWORD-MAP.md` (section 1 if the page ships now, section 2 for planned guides, section 3 for backlog tools). Add it to the calendar in `docs/SEO-GUIDE.md` section 7 if it is a guide. Keep the route in backticks as the whole first cell; the audit parses it.

## Output format

Return a short report:

```
Candidate: <keyword>  -> verdict: GO | MERGE into <route> | DROP
Intent: T/I/E   Type: tool | guide   Route: /...
Evidence: volume/KD (source, date) or "unknown"; SERP notes (3 bullets with URLs); gap we fill
Secondary cluster: ...
Questions for FAQ: ...
Supporting links: tool=..., siblings=...
Risks: YMYL? competitor strength? seasonality (manual Trends check)?
KEYWORD-MAP row: <the exact markdown row>
```

## After launch

GSC > Performance > Pages > filter the page > Queries. Queries at positions 8-30 with impressions become FAQ items or sections on the *same* page. Only create a new page if the query is a distinct task not covered anywhere. Review `docs/KEYWORD-MAP.md` quarterly (SEO-GUIDE section 10).
