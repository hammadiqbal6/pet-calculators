---
name: add-new-tool
description: Ship a new pet calculator end to end in this Astro repo - formula in src/lib/formulas, Vitest test, calculator component, src/data/tools.ts entry, ToolPageShell page under src/pages/tools/<slug>/, keyword-map row, audits. Use when adding a tool, a backlog item from docs/ideas/README.md, or an embed.
---

# Add a new tool

Governing documents: `docs/SEO-PLAYBOOK.md` (sections 3 and 6), `docs/KEYWORD-MAP.md`, `docs/ideas/README.md` (what this repo may add), `docs/MARKET-RESEARCH.md` idea #3. The tool pages are the revenue assets, so a new one must be better than the top results, not just present.

## 0. Gate: should this tool exist?

Stop and report instead of building if any answer is "no".

1. Is it in the allowed list? Only the "bonus add-ons" table in `docs/ideas/README.md` or `docs/KEYWORD-MAP.md` section 3 (backlog tools). Anything else belongs to another repo (README rule 2) or needs an explicit instruction.
2. Is it a **distinct task** with its own primary keyword? A phrasing of an existing tool ("dog calorie calculator") is a secondary keyword of `/tools/dog-food-calculator/`, not a new page. Run the `keyword-research` skill and claim the keyword in `docs/KEYWORD-MAP.md` first.
3. Do you have a citable formula or dataset (NRC, AAHA, WSAVA, AAFCO, AAFP, MSD Vet Manual, peer-reviewed)? If not, do not build it. Run `vet-source-citation`.
4. Can the tool carry >= 600 words of non-duplicated explanation, a worked example and a table? If it would be a thin widget, skip it.
5. Safety class: does the output influence medication, toxicity, or treatment decisions? If yes, require emergency copy above the result and a `vet-fact-checker` pass before merge.

## 1. Formula (pure TypeScript)

File: `src/lib/formulas/<name>.ts`. Use `src/lib/formulas/water.ts` or `energy.ts` as the template.

```ts
import { round } from '../units';

export type XResult = { value: number; low: number; high: number; notes: string };

/**
 * One-line description.
 * Source: <publisher, title, year, URL>. Formula: <exact formula>.
 */
export function estimateX(weightKg: number /* metric internally */): XResult {
  if (!Number.isFinite(weightKg) || weightKg <= 0) throw new Error('Weight must be positive');
  // ...
}
```

Rules:
- No DOM, no `window`, no `Date.now()` without an injectable `now` parameter. All maths in metric (kg, g, ml, kcal); convert at the edges with `src/lib/units.ts` (`lbToKg`, `kgToLb`, `toKg`, `fromKg`, `round`, ...).
- Throw on invalid input; the component catches and hides the results panel.
- Return ranges with notes where the science is a range. Never return false precision.
- Re-export from `src/lib/formulas/index.ts` (`export * from './<name>';`).

## 2. Unit tests

Add to `src/lib/formulas/formulas.test.ts` (or a new `<name>.test.ts`; `vitest.config.ts` includes `src/**/*.test.ts`). Required cases:
1. A **published worked example** (cite it in a comment) with `toBeCloseTo`.
2. Lower and upper boundaries of every branch (age bands, size classes, life stages).
3. Unit conversion consistency (lb vs kg inputs give the same result).
4. Invalid input throws (`0`, negative, `NaN`).
5. The exact numbers you will print in the page's "Worked example" section.

Run `npm test`.

## 3. Calculator component

File: `src/components/calculators/<Name>Calc.astro`. Copy the shape of `DogAgeCalc.astro` (simple) or `PuppyWeightCalc.astro` (breed picker, unit toggle, chart).

```astro
---
// static options only; no logic here
---

<form class="calc-form x-calc" id="x-calc" novalidate>
  <div class="calc-grid cols-2">
    <label class="field">
      Weight (kg)
      <span class="hint">Use the most recent weigh-in</span>
      <input type="number" name="weight" inputmode="decimal" min="0.5" step="0.1" value="20" required />
    </label>
  </div>
  <div class="results" id="x-results" aria-live="polite" hidden>
    <p class="big" data-result-main></p>
    <dl><dt>Range</dt><dd data-result-range></dd></dl>
  </div>
</form>

<script>
  import { estimateX } from '../../lib/formulas/x';
  import { applyQueryToForm, bindFormInputs, getFieldValue, parseNum, showResults, syncFormToQuery } from './calc-utils';

  const form = document.getElementById('x-calc') as HTMLFormElement | null;
  if (form) {
    const keys = ['weight'];
    applyQueryToForm(form, keys, { weight: '20' });
    const panel = form.querySelector('#x-results') as HTMLElement;
    function compute() {
      syncFormToQuery(form, keys);
      const w = parseNum(getFieldValue(form, 'weight'));
      if (w == null) return showResults(panel, false);
      try {
        const r = estimateX(w);
        showResults(panel, true);
        form.querySelector('[data-result-main]')!.textContent = String(r.value);
      } catch {
        showResults(panel, false);
      }
    }
    bindFormInputs(form, keys, compute);
    compute();
  }
</script>
```

Requirements:
- Every input has a visible `<label>`, units, and a hint; `inputmode="decimal"`; sensible defaults so the result shows at first paint (above the fold).
- Results panel: `aria-live="polite"`, `hidden` until valid, gets updated textually (not canvas-only). Charts must have a text equivalent.
- Weight: provide the lb/kg toggle via `wireWeightUnitToggle` / `weightKgFromForm` in `calc-utils.ts` (see `PuppyWeightCalc.astro` for the `data-weight-toggle` markup); display both units with `formatKgLb`.
- State is mirrored to the query string by `calc-utils`; never store inputs elsewhere, never `fetch`.
- No framework, no new dependency. Keep the component's bundled JS well under the 25 KB gzip page budget (`npm run audit:budgets`).
- Emergency-adjacent tools (toxins): the call-your-vet / poison-hotline sentence renders before the numbers, in markup, not only via JS.

## 4. Registry entry

`src/data/tools.ts`: append an object.

```ts
{
  slug: 'dog-food-transition-calculator',            // lowercase, hyphenated, = primary keyword
  title: 'Dog Food Transition Calculator',
  shortTitle: 'Food Transition',
  description: '<= 160 chars, unique, starts with the primary keyword intent. Educational only where relevant.',
  category: 'dog',                                    // 'dog' | 'cat' | 'both'
  keywords: ['dog food transition calculator', 'dog food switch calculator'], // [0] = primary from KEYWORD-MAP
  related: ['dog-food-calculator', 'puppy-food-calculator'],                  // 2-3 existing slugs
},
```

Then add the new slug to the `related` array of those 2-3 tools (reciprocal links). The footer, home, `/tools/`, `/dogs/` or `/cats/` hub and related-tool cards update automatically.

## 5. Page

File: `src/pages/tools/<slug>/index.astro`. Template: `src/pages/tools/puppy-weight-calculator/index.astro`.

```astro
---
import ToolPageShell from '../../../components/ToolPageShell.astro';
import XCalc from '../../../components/calculators/XCalc.astro';
import { SRC } from '../../../data/sources.ts';

const faq = [ { q: '...', a: '...' } /* 5-8 real questions: PAA, autocomplete, Reddit */ ];
const sources = [SRC.nrc, SRC.wsavaNutrition /* add new ones in src/data/sources.ts via vet-source-citation */];
---

<ToolPageShell
  slug="x"
  title="Primary Keyword First | Qualifier"            <!-- <= 65 chars incl. brand suffix added by the layout -->
  description="70-160 chars with the primary keyword, what the user gets, free/no signup."
  answer="40-60 words: answer or formula first, then the limitation."
  takeaways={['4 bullets with concrete numbers']}
  faq={faq}
  sources={sources}
>
  <Fragment slot="calculator"><XCalc /></Fragment>

  <h2>How to use the ... calculator</h2>
  <h2>Formula and method</h2>
  <h2>Worked example</h2>            <!-- numbers identical to the unit test -->
  <h2>Table: factors / ranges / life stages</h2>   <!-- dated, sourced -->
  <h2>Assumptions and limits</h2>    <!-- when not to use it; see a vet if ... -->
  <h2>Related reading</h2>           <!-- >= 2 contextual links to sibling tools / guides -->
</ToolPageShell>
```

`ToolPageShell` already renders: H1 (`tool.title`), answer-first paragraph, calculator, `AdSlot`, takeaways, FAQ, `Disclaimer`, `ReviewerBox`, `AuthorMeta`, `SourcesList`, `RelatedTools`, `WebApplication` + FAQ JSON-LD and breadcrumbs. Do not duplicate those blocks. Do not add JSON-LD by hand unless the page type differs (see `structured-data`).

Copy requirements (enforced by `audit:seo`): >= 600 words of body copy (counted outside the form, ads and nav), sources section, FAQ section, disclaimer, "Last updated", >= 2 contextual links. Write the copy with the `write-seo-article` skill's structure and the `content-writer` subagent, never as paraphrase of competitor text.

## 6. Wire up the rest

1. `docs/KEYWORD-MAP.md`: add the row in section 1b (primary, secondary cluster, intent, notes); delete it from section 3 if it was reserved. Verify no secondary keyword is another row's primary.
2. Contextual links *to* the tool: add one sentence with a descriptive anchor in the closest guide and the closest sibling tool; check `/dogs/` or `/cats/` lists it.
3. `public/llms.txt`: add the page (plain link + 10-word description).
4. `lighthouserc.cjs`: add the URL **only** if the tool introduces a new template (breed table, chart, etc.).
5. Optional embed: `src/components/calculators/Embed<Name>.astro` + `src/pages/embed/<slug>.astro` using `EmbedFrame.astro` (`toolSlug`, `toolName`); the embed stays `noindex`, has no ads, canonicalises to the tool.
6. `src/config/site.ts`: bump `buildDate`.

## 7. Verify (all must pass)

```bash
npm test
npm run audit            # build + test + audit:seo + audit:adsense + audit:budgets + check:links
npm run lhci             # after build, for new templates / heavier JS
```

Manual: open the page at 375 px width (tool above the fold, no horizontal scroll), keyboard-only operation, text zoom 200%, `?weight=...` query restores state, lb/kg round trip, invalid input hides results. Then run the `vet-fact-checker` subagent on the formula, constants, copy and sources, and the `seo-auditor` subagent on the built page.

## Common failures

| Symptom | Cause / fix |
|---|---|
| `audit:seo` `thin-tool` | Copy under 600 words: add a worked example, factor table, assumptions section; do not pad |
| `orphan` / `weak-inbound` | No contextual links from other pages: add them (internal-linking skill) |
| `keyword-map` | Route not in `docs/KEYWORD-MAP.md` |
| `cannibalization` | Primary keyword already owned: change keyword or merge into the existing page |
| `duplicate-content` (adsense) | Copy reused from a sibling tool: rewrite with unique examples |
| `tool-sources` / `tool-faq` | Headings must contain "Sources"/"References" and "FAQ" (shell components do this if props are supplied) |
| Build error `Unknown tool slug` | `slug` prop not in `src/data/tools.ts` |
