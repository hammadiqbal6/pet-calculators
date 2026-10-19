---
name: write-seo-article
description: Write or revise a guide for this pet calculators site (src/pages/guides/<slug>/index.astro with GuidePageShell) that follows docs/SEO-PLAYBOOK.md - claimed keyword, answer-first, original worked examples, cited veterinary sources, disclaimers, internal links, guides.ts entry. Use for calendar articles in docs/SEO-GUIDE.md or rewriting an existing guide.
---

# Write an SEO article (guide)

Governing documents: `docs/SEO-PLAYBOOK.md` sections 3 (on-page), 4 (answer-first/GEO), 6 (AI-assisted content safety); `docs/SEO-GUIDE.md` section 7 (content calendar); `docs/KEYWORD-MAP.md` (ownership); `.cursor/rules/content-quality.mdc` and `ymyl-disclaimers.mdc`.

Articles exist to (a) answer the follow-up questions of tool users, (b) earn citations and links, (c) give AdSense reviewers real publisher content. They are not keyword doorways.

## Step 0: Claim and validate the keyword

1. Find the row in `docs/KEYWORD-MAP.md` section 2 (planned) or create one via the `keyword-research` skill. The primary keyword must not appear as a primary or secondary anywhere else.
2. Open the live SERP manually (incognito, US). Write down: the top 5 URLs, their angle, the gap you will fill (original table, worked example, safety framing, better sources, up-to-date numbers). If the top results are all veterinary schools or large publishers *and* you have no unique angle, drop or merge the topic.
3. Identify the **supporting tool** (the one in the "Supports" column of the calendar). The first 150 words must link to it.
4. List 5-8 real questions (People Also Ask, autocomplete `how/can/is/what`, Reddit). They become H2s/FAQ.

## Step 1: Source list before prose

Run `vet-source-citation`: collect 3-6 authoritative sources (AAHA, WSAVA, NRC, AAFCO, AAFP, ASPCA APCC, Pet Poison Helpline, MSD/Merck Vet Manual, peer-reviewed studies) and add any new ones to `src/data/sources.ts` as `SRC.<key>` objects (`title`, `url`, `publisher`, `accessed`). Every number you plan to use must map to a source line. If you cannot source it, do not write it.

## Step 2: Outline (fixed skeleton)

```
H1  = primary keyword phrased naturally (guide.title in src/data/guides.ts; the shell renders it)
lead (answer prop)   40-60 words, direct answer first, includes the primary keyword
Takeaways            3-5 bullets with concrete numbers
H2  What <topic> means / why it matters         (definition + context)
H2  The numbers: table by size / age / life stage (dated, sourced, unit-converted)
H2  Worked example(s)                            (real values, show arithmetic, matches the tool's output)
H2  Common mistakes / myths                      (specific, not generic)
H2  When to call your vet                        (concrete triggers; emergencies first for toxin topics)
H2  How to use the <supporting tool>             (contextual link + what inputs to prepare)
FAQ 5-8 real questions (answers 30-80 words, complete sentences)
Sources (SourcesList via shell), Disclaimer, AuthorMeta, Try the calculators (shell)
```

Length: **>= 800 words** of body copy (`audit:seo` warns under 1000 for guides, errors under 600). Aim for the length the topic needs, not padding.

## Step 3: Write

Rules (see `content-quality.mdc`):
- First paragraph answers the question. No throat-clearing, no "In this article we will...".
- One original contribution: a calculation worked through, a comparison table you built from cited figures, a decision checklist, or an original diagram. Do not paraphrase a competitor's article structure.
- Concrete numbers carry a unit pair (kg and lb) and a source in the same paragraph or table caption.
- Plain, short sentences; define terms (RER, MER, BCS) at first use; US spelling.
- Health claims: describe typical ranges and say individual dogs/cats vary. Never promise outcomes, prescribe doses, or discourage vet visits. Toxin/emergency articles put "Call your veterinarian, an emergency clinic, or a poison hotline now" in the first screen.
- Internal links (anchor text descriptive, never "click here"): >= 1 to the supporting tool within the first 150 words, >= 2 other contextual links to sibling tools/guides, 0 links to competitor tool pages. External links: sources only, `rel="noopener noreferrer"` (the `SourcesList` does this).
- No invented quotes, statistics, studies, reviewers, ratings, or "our testing" claims. If you did not measure it, do not say you did.
- AI assistance is allowed for drafting, never for facts: every sentence with a number or health claim is verified by `vet-fact-checker`.

## Step 4: Implement

1. `src/data/guides.ts`: add

```ts
{
  slug: 'how-to-switch-dog-food',
  title: 'How to Switch Dog Food Without Upsetting the Stomach',
  description: '<= 160 chars, unique, includes primary keyword and the payoff.',
  relatedTools: ['dog-food-calculator', 'puppy-food-calculator'],   // real tool slugs
  lastUpdated: '2026-10-19',
},
```

2. `src/pages/guides/<slug>/index.astro` (template: `src/pages/guides/dog-years-myth/index.astro`):

```astro
---
import GuidePageShell from '../../../components/GuidePageShell.astro';
import { SRC } from '../../../data/sources.ts';
const faq = [{ q: '...', a: '...' }];
const sources = [SRC.wsavaNutrition, SRC.aahaNutrition];
---
<GuidePageShell
  slug="how-to-switch-dog-food"
  title="How to Switch Dog Food: 7-10 Day Schedule"
  description="..."
  answer="Direct answer, 40-60 words."
  takeaways={['...', '...', '...']}
  faq={faq}
  sources={sources}
>
  <h2>...</h2>
  <p>... <a href="/tools/dog-food-calculator/">dog food calculator</a> ...</p>
</GuidePageShell>
```

   The shell supplies the H1, author meta, takeaways, FAQ, sources, disclaimer, reviewer box, tool cards and `Article` JSON-LD. `title` should be <= 65 characters including the brand suffix added by the layout.
3. `docs/KEYWORD-MAP.md`: move the row from section 2 to section 1c with status confirmed.
4. Add links *to* the new guide from: its supporting tool page ("Related reading"), the closest sibling guide, and the relevant hub (`/dogs/`/`/cats/` list guides automatically via `relatedTools`).
5. `public/llms.txt`: add the guide line. Bump `buildDate` in `src/config/site.ts`.

## Step 5: Verify

```bash
npm run audit            # must show 0 errors; read warnings
```

Then:
- `vet-fact-checker` subagent: verify all claims/numbers against the sources; fix or remove anything unverified.
- `seo-auditor` subagent on `/guides/<slug>/`: title/H1/description unique, canonical, JSON-LD, links.
- Read it once aloud: would a worried owner get a correct, calm, actionable answer in the first 100 words?
- Preview at 375 px: tables scroll, no layout shift, tool link above the fold.

## Publishing gate (all true)

- [ ] Keyword claimed, not duplicated; slug equals the keyword-map route.
- [ ] >= 800 words, original table/example, answer in the first paragraph.
- [ ] Every number cited via `SRC`; links to sources work (`npm run check:links -- --external` for the new URLs).
- [ ] Disclaimers present; no medical advice; emergency copy where relevant.
- [ ] >= 3 internal links out and >= 2 in; not an orphan.
- [ ] `npm run audit` clean; fact-check report attached.

## Revising an existing guide

Use `content-refresh`. Never change slug or primary keyword without updating `docs/KEYWORD-MAP.md`, `src/data/guides.ts`, every inbound link and adding a redirect in `public/_redirects` and `vercel.json`.
