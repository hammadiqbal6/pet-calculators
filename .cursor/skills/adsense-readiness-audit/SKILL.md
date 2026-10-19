---
name: adsense-readiness-audit
description: Decide whether the pet calculators site is ready to apply for or enable Google AdSense - run scripts/audit/adsense.mjs and walk docs/ADSENSE.md and the MARKET-RESEARCH section 4 checklist (thin/duplicate pages, trust pages, privacy and ad-cookie disclosures, ads.txt, CMP, ad placement, YMYL trust). Use before applying, before setting adsensePublisherId, and quarterly.
---

# AdSense readiness audit

Governing documents: `docs/ADSENSE.md` (full process), `docs/MARKET-RESEARCH.md` section 4 (checklist built from Google's eligibility, "not approved", page-readiness, program-policy, privacy and CMP pages), `docs/SEO-PLAYBOOK.md` sections 3 and 6.

You are simulating the reviewer. Google reviews **all pages**, not just the submitted URL. Assume the worst-case reading of "low value content", "site under construction", and "misleading functionality".

## 1. Automated gate

```bash
npm run build
npm run audit:adsense
AUDIT_PROD=1 npm run audit:adsense    # placeholders become errors; run before applying
AUDIT_PROD=1 npm run audit            # whole gate incl. SEO, budgets, links
```

`scripts/audit/adsense.mjs` verifies:

| Code | Check |
|---|---|
| `required-page`, `footer-link` | `/about/ /contact/ /privacy/ /terms/ /methodology/`, hubs, home, custom 404 exist; footer links to privacy/about/contact/terms |
| `inventory` | >= 8 tool pages and >= 3 guides |
| `thin-page`, `thin-trust-page` | tool >= 600, guide >= 600 (hard), hub >= 150, legal >= 150 (about/methodology >= 250), home >= 200 words of body copy |
| `privacy` | mentions advertising/AdSense, cookies, third-party vendors, personalised ads from prior visits, opt-out (Ads Settings / aboutads.info), analytics |
| `contact` | `mailto:` link or a form |
| `ads-txt` | when `adsensePublisherId` is set: `public/ads.txt` has the active `google.com, pub-..., DIRECT, f08c47fec0942fa0` line; warns on active lines while the ID is empty |
| `ads-config` | AdSense code present iff `adsensePublisherId` is set |
| `ads-placement`, `ads-thin`, `ads-density`, `ads-above-tool`, `ads-label` | no ads on 404/embed/legal/thin pages; <= 3 slots; never before the calculator; labelled |
| `cmp` | ads enabled without a known certified-CMP marker |
| `banned-copy` | lorem ipsum, coming soon, under construction, TODO/TBD, miracle/guarantee claims, "instead of a vet" |
| `reviewer-placeholder` | visible `[Veterinary reviewer name]`-style text |
| `disclaimer` | tool/guide without the veterinary disclaimer |
| `duplicate-content` | >30% (warn) / >50% (error) 5-word-shingle overlap between tool/guide bodies |

## 2. Manual review checklist (what scripts cannot judge)

### Content value
- [ ] Open 5 random tool pages: is there original explanation (formula, worked example with different numbers than siblings, a table, limits)? Or the same paragraph with swapped nouns?
- [ ] Each page answers a distinct intent (compare to `docs/KEYWORD-MAP.md`). No doorway-style duplicates.
- [ ] The calculators actually work and match the stated formula (spot-check three with a calculator; `npm test` green).
- [ ] Guides have an original angle and are not paraphrased competitor articles; sources are real and linked.
- [ ] No auto-generated or scraped text. AI-assisted pages were human-fact-checked (`vet-fact-checker` reports exist).

### Trust and YMYL (pet health is sensitive)
- [ ] About names real people/entities and the mission; Contact has a monitored address; `/authors/` credits are true. No fake vet, no invented credentials, no fabricated testimonials/reviews/ratings.
- [ ] Reviewer box says "pending" unless a real credentialed reviewer is configured in `src/config/site.ts`.
- [ ] Veterinary disclaimer on every tool/guide; toxin/emergency pages put "call your vet/poison hotline" first.
- [ ] No claims to diagnose, treat, cure, or replace a veterinarian.
- [ ] Methodology page lists each formula and its source.

### Navigation and UX
- [ ] Header/footer nav reaches every hub and trust page; no broken links (`npm run check:links`), no pages behind login, no pop-ups or interstitials, no "under construction".
- [ ] Mobile: tool above the fold, readable text, no horizontal scroll, tap targets >= 24 px.
- [ ] Cookie notice does not block content.

### Policy and consent
- [ ] `/privacy/` reads correctly to a human: third-party vendors including Google use cookies to serve ads based on prior visits; users can opt out via Google Ads Settings and aboutads.info; states what analytics are used; says calculator inputs are not collected (and that is true: no `fetch`/analytics event carries inputs).
- [ ] Certified CMP (TCF) integrated and tested from an EEA/UK IP before ads are enabled (the current cookie banner is not a CMP).
- [ ] Terms includes the disclaimer; no prohibited content; no incentivised traffic.

### Site health
- [ ] Final domain, HTTPS, canonical host; indexed in GSC for several weeks (docs/ADSENSE.md section 2); some organic traffic.
- [ ] Core Web Vitals pass (`npm run lhci`); ad slots reserve height (`.ad-slot { min-height }`) so ads cannot shift layout.
- [ ] One AdSense account only; owner is 18+.

## 3. Risk table to apply

| Finding | Risk | Verdict |
|---|---|---|
| Thin or near-duplicate tool pages | "Low value content" rejection | Block |
| Placeholder reviewer/credentials visible | Looks unfinished/deceptive, YMYL | Block |
| Privacy missing ad-cookie/opt-out language | Policy violation | Block |
| No CMP while enabling ads for EEA/UK/CH | Ads limited/not served | Block enabling ads |
| Ad above the calculator, ads on 404/embed | Placement policy, Better Ads | Block enabling ads |
| `lhci` fails CLS/LCP | Lower rankings and approval risk | Fix before apply |
| 8-10 tools but only 3 guides | Marginal | Prefer 6+ guides (calendar articles 1-6) |
| Zero indexing/traffic | Nothing to review | Wait |

## 4. Output

```
AdSense readiness <date> @ <sha>
Automated: adsense.mjs <E/W>; AUDIT_PROD=1 <E/W>; full audit <pass/fail>
Verdict: READY TO APPLY | NOT READY | READY TO ENABLE ADS (post-approval)
Blockers (must fix): <item> - <url/file> - <evidence> - <fix>
Risks (should fix): ...
Passed: <count> of <count> manual items
Next steps in order: ...
```

Never weaken checks to make the audit pass, never create fake pages to hit inventory counts, and never set `adsensePublisherId` yourself: that is an owner action after approval (docs/ADSENSE.md section 3).
