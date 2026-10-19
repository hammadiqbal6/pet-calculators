---
name: vet-source-citation
description: Find, verify and register authoritative veterinary sources for the pet calculators site - add typed entries to src/data/sources.ts (SRC), cite them on tool and guide pages via SourcesList, check URLs and claims against the primary document, and reject weak sources. Use whenever a page makes a numeric or health claim, a formula is added or changed, or a source link breaks.
---

# Veterinary source citation and verification

Governing documents: `docs/SEO-PLAYBOOK.md` section 3 (E-E-A-T: visible sources, methodology) and section 6 (fact-check everything, AI content safety); `docs/MARKET-RESEARCH.md` idea #3 ("vet-sourced guidance" is the differentiator); `.cursor/rules/ymyl-disclaimers.mdc`, `content-quality.mdc`.

Pet health is YMYL-adjacent. The citation is the product's trust layer and a differentiator against the near-identical competitor sites. A wrong or fabricated citation is worse than none.

## 1. Where citations live

- Registry: `src/data/sources.ts` exports `SRC`, a map of `SourceItem` objects (`title`, `url`, `publisher`, `accessed` = `siteConfig.buildDate`). Current keys include `nrc`, `wsavaNutrition`, `wsavaBcs`, `aafco`, `aahaCanineLife`, `aahaNutrition`, `aahaFeline`, `aafp`, `aspcaPoison`, `aspcaPeopleFoods`, `aspcaDogCare`, `aspcaCatCare`, `petPoisonChocolate`, `msdChocolate`, `msdDogReproduction`, `msdCatNutrition`, `msdDogHome`, `wangDogAging`.
- Use: `import { SRC } from '../../../data/sources.ts'; const sources = [SRC.nrc, SRC.wsavaNutrition];` then pass `sources={sources}` to `ToolPageShell` / `GuidePageShell`; `SourcesList.astro` renders "Sources & references" with `rel="noopener noreferrer"`.
- Formula files cite the same source in the JSDoc of each function (`src/lib/formulas/*.ts`); the page's "Formula" section states it in prose.
- `/methodology/` lists every formula with its source; keep it in sync when adding/changing one.

## 2. Source hierarchy (use the highest tier available)

1. **Primary standards and guidelines**: NRC *Nutrient Requirements of Dogs and Cats* (2006), AAFCO nutrient profiles/labeling, AAHA guidelines (nutrition and weight management, canine/feline life stage, senior care), WSAVA Global Nutrition Guidelines and BCS charts, AAFP guidelines, AVMA policies.
2. **Veterinary references**: MSD/Merck Veterinary Manual, Cornell Feline Health Center, veterinary school client-education pages (UC Davis, Cornell, Tufts, Penn Vet, etc.).
3. **Poison/emergency authorities**: ASPCA Animal Poison Control Center, Pet Poison Helpline (verify phone numbers on the official page the day you publish).
4. **Peer-reviewed studies** (PubMed/DOI): use the DOI URL, authors, year, journal. Cite as a study, not as consensus.
5. **Regulators**: FDA CVM (raw food pathogens, recalls), CDC (zoonoses).

Reject as sources: competitor calculators, content farms, Wikipedia as final authority (use it to find primary refs), anonymous forum posts, pet-food brand blogs for general claims (a manufacturer page is acceptable only for that product's label kcal/cup, cited as such), AI-generated summaries, anything you cannot open.

## 3. Verification procedure (every new citation)

1. **Open the document** (not a search snippet). Confirm publisher, title, year/edition, and that the URL resolves with HTTP 200 and is stable (prefer canonical document URLs over search/result pages).
2. **Find the exact claim.** Quote the page/section/table (in your notes) that supports the number or statement. If the source only supports a weaker claim, weaken ours. Ranges stay ranges.
3. **Check scope.** Dog vs cat, puppy vs adult, intact vs neutered, breed size; units (kcal vs kJ; lb vs kg; mg/kg).
4. **Check currency.** Newer edition? Guideline superseded? Note the access date.
5. **Cross-check** critical numbers (toxic doses, gestation, RER/MER factors, life-stage ages) with a second independent authority; if two authorities disagree, present the range and cite both.
6. **Reproduce the arithmetic** for any formula with a calculator and the unit test (`src/lib/formulas/formulas.test.ts`): sample inputs match the source's example or a hand calculation.
7. **Record** the verification in the PR: source key, claim, location in source, date checked.

## 4. Add to the registry

```ts
// src/data/sources.ts
export const SRC = {
  // ...
  aahaSenior: {
    title: 'AAHA Senior Care Guidelines for Dogs and Cats',
    url: '<paste the verified document URL here>',   // opened, HTTP 200, same document you read
    publisher: 'American Animal Hospital Association (AAHA)',
    accessed,
  },
} satisfies Record<string, SourceItem>;
```

Rules:
- Key = camelCase publisher + topic. Title = the document's real title, not a paraphrase. `publisher` = the organization's full name.
- Never fabricate URLs, DOIs, titles, authors, years, or page numbers. If a URL cannot be opened, do not add it; say so and ask for the owner to supply it or choose a different source.
- If a page needs a one-off source with a page-specific note, pass an inline `{ title, url, publisher, accessed }` object instead of polluting `SRC`.
- Keep entries alphabetical by publisher within the object for diff clarity.

## 5. Cite on the page

- Add the source list via the shell prop; also mention the source **in the prose or table caption** next to the claim ("The NRC resting energy requirement is 70 x kg^0.75").
- A page's sources list must contain every source whose claim appears on the page, and no decorative extras. Typically 3-6 per tool, 4-8 per guide.
- Emergency pages: the first screen links to the poison hotline pages (ASPCA APCC, Pet Poison Helpline) in addition to the sources list.
- Label dated tables ("Source: AAHA 2019, accessed 2026-10-19").
- Never imply endorsement ("approved by AAHA"). Say "based on" or "follows".

## 6. Keep sources alive

```bash
npm run build && npm run check:links -- --external     # reports 4xx/5xx/timeouts as warnings
```

For each failing URL: find the new official location or an archived official copy; update `src/data/sources.ts` once and every page benefits. Re-verify the claim if the document changed. Schedule: every 6 months (`content-refresh`). Replace unreachable sources within a week; do not leave dead citations.

## 7. Output (when asked to vet sources for a page)

```
Page: <route>   Claims reviewed: N
| # | Claim (exact text) | Source key | Location in source | Verdict: SUPPORTED / WEAKEN / UNSUPPORTED / WRONG | Fix |
Sources checked (url, http status, edition/date): ...
New SRC entries proposed: <ts snippet>  (only with opened, verified URLs)
Blocking issues: ...
```

Hand UNSUPPORTED/WRONG items to the page author; they are removed or corrected before merge. The `vet-fact-checker` subagent performs this procedure end to end.
