---
name: vet-source-citation
description: Vet and cite veterinary sources for PetCalc copy, formulas, and hotlines using src/data/sources.ts standards.
---

# Vet source & citation (PetCalc)

Pet health content is YMYL-adjacent. Every clinical number, threshold, or "call this hotline" statement needs a **primary source** listed in `<SourcesList />` and traceable in PR review.

## Source tiers (prefer top)

1. **Official guidelines**: WSAVA, AAHA, AAFP, AVMA, NRC/NAP, AAFCO
2. **Government / poison control**: ASPCA APCC, Pet Poison Helpline (for phone numbers — verify on official site the day you ship)
3. **Peer-reviewed literature** (PubMed) for contested claims (e.g. dog aging epigenetics)
4. **Avoid**: random blogs, AI summaries, unsourced Reddit, breed forums for medical doses

Shared constants: `src/data/sources.ts` (`SRC.*`) with `accessed: siteConfig.buildDate`.

## Formula modules

Each file under `src/lib/formulas/` must document provenance in the header comment (see `src/lib/formulas/energy.ts`). When changing multipliers:

1. Add citation in JSDoc
2. Update worked example on the tool page
3. Extend `formulas.test.ts` for the new edge case

## Page-level sources

Tool/guide pages pass `sources` arrays to `SourcesList.astro`. Reuse `SRC` entries when URLs match; do not duplicate conflicting URLs for the same claim.

Minimum: **3 sources** on indexable tools/guides (enforced by SEO structure checks).

## Emergency copy

For chocolate, toxins, pregnancy complications:

- Place **call vet / poison hotline** above interactive results (`dog-chocolate-toxicity-calculator` pattern).
- Phone numbers must match the official organization page linked in sources.
- Disclaimer: calculator is not a diagnosis (`Disclaimer.astro`, `.cursor/rules/ymyl-disclaimers.mdc`).

## Review workflow

1. List each factual claim in the diff (bullets).
2. Map claim → source URL → access date.
3. Reject or soften claims that lack tier-1/2 backing ("may", "consult your vet").
4. Run `.cursor/agents/vet-fact-checker.md` mindset on emergency pages.

## Updating stale links

If a guideline URL 404s:

- Find the current WSAVA/AAHA landing page (often moved, not withdrawn).
- Update `src/data/sources.ts` and every page array still using the old URL.
- Bump `buildDate` when sources materially change.

Never fabricate journal titles, author names, or study statistics.
