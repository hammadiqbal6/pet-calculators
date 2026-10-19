# AdSense: eligibility, readiness, setup, pitfalls

Governing sources: [MARKET-RESEARCH.md](./MARKET-RESEARCH.md) section 4 (the AdSense checklist, sources S10-S16) and [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md) sections 3, 6 and 7. Official pages referenced: eligibility <https://support.google.com/adsense/answer/9724>, "account wasn't approved" <https://support.google.com/adsense/answer/81904>, page readiness <https://support.google.com/adsense/answer/7299563>, Program policies <https://support.google.com/adsense/answer/48182>, privacy content <https://support.google.com/adsense/answer/1348695>, CMP requirement <https://support.google.com/adsense/answer/13554116>. Policies change; re-read them before applying.

Automated gate: `npm run audit:adsense` (run after `npm run build`). Review skill: [`adsense-readiness-audit`](../.cursor/skills/adsense-readiness-audit/SKILL.md). Subagent: [`adsense-reviewer`](../.cursor/agents/adsense-reviewer.md).

---

## 1. Eligibility (what Google asks for)

| Requirement | How this repo satisfies it | Checked by |
|---|---|---|
| 18+, one AdSense account only | Owner action. Duplicate accounts are rejected. | manual |
| You own the site and can edit its HTML | Code in this repo; `BaseLayout.astro` loads the script when `adsensePublisherId` is set | manual |
| Original, useful content (complete sentences and paragraphs, not just a widget) | Each tool page: answer-first paragraph, how to use, formula, worked example, factor table, FAQ, sources; each guide >= 800 words | `audit:seo` `thin-tool`/`thin-guide`; `audit:adsense` `thin-page` |
| Not under construction / template-only | No "coming soon" pages, no empty hubs | `audit:adsense` `banned-copy`, `thin-page` |
| Clear navigation, no broken links, no pages behind login | Header nav, hubs, breadcrumbs, footer | `check:links`, `audit:seo` `orphan` |
| Privacy policy with ad-cookie disclosures and opt-out | `/privacy/` | `audit:adsense` `privacy` |
| Certified CMP (TCF) for EEA, UK, Switzerland personalised ads | Not yet; see section 5 | `audit:adsense` `cmp` once ads are enabled |
| About and Contact pages | `/about/`, `/contact/` (not mandatory per Google, strongly recommended) | `audit:adsense` `required-page` |
| Compliant content and traffic, Better Ads Standards | No pop-ups/interstitials; ads never above the tool; no incentivised clicks | `audit:adsense` `ads-above-tool`, manual |
| Supported language | English | manual |
| The tool really works (no deceptive "tool" that exists to show ads) | Calculators are client-side with unit tests in `src/lib/formulas/formulas.test.ts` | `npm test` |

Pet-specific note: pages about veterinary topics are YMYL-adjacent. Reviewers weigh accuracy and trust more here. Keep the veterinary disclaimer, cited sources, visible update dates, and a real reviewer (or no reviewer claim). See [`.cursor/rules/ymyl-disclaimers.mdc`](../.cursor/rules/ymyl-disclaimers.mdc).

## 2. When to apply

Apply only when **all** are true. Premature applications waste the review and "not approved" reasons are slow to clear.

- [ ] `npm run audit` passes with `AUDIT_PROD=1` set (placeholder domain, placeholder reviewer, IndexNow placeholder all resolved).
- [ ] Live on the final domain over HTTPS for at least a few weeks; the home page, hubs and tools are indexed in Search Console (AdSense reviews all pages, not just the submitted URL).
- [ ] >= 8 tools and >= 3 guides live (the playbook's launch minimums; `audit:adsense` `inventory`). Aim for 11 tools and 8-10 guides before applying: SEO-GUIDE calendar articles 1-6.
- [ ] About names real people; Contact has a working mailbox; Privacy, Terms and Methodology are complete.
- [ ] Some organic traffic exists. Google publishes no minimum, but a site with zero traffic and zero indexing gives reviewers nothing to evaluate (recommendation).
- [ ] Core Web Vitals pass (`npm run lhci`), because an approved site with ad-driven CLS will lose rankings.
- [ ] You can edit `src/config/site.ts` and deploy within minutes, since Google will ask you to place the code.

Target timeline from the SEO-GUIDE 90-day plan: apply around week 6, once the first six calendar articles are live. If rejected, read the stated reason, fix it, wait, and reapply. Do not create a second account.

## 3. Publisher ID and code placement

1. Sign up at <https://adsense.google.com> with the site URL (the final `siteUrl`).
2. Copy your publisher ID: `ca-pub-XXXXXXXXXXXXXXXX`.
3. In `src/config/site.ts` set:

```ts
adsensePublisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
adsenseAutoAds: false, // keep manual placements until RPM data justifies auto ads
```

   `BaseLayout.astro` then emits `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=...">` in `<head>` and `AdSlot.astro` renders real `<ins class="adsbygoogle">` units. While the ID is empty, slots render as fixed-height "Advertisement" placeholders (zero ad code ships; `audit:adsense` `ads-config` enforces the consistency both ways).
4. Create the ad units in AdSense and pass their numeric IDs as `slotId` on `<AdSlot />`. Current slot names (for example `tool-below`) are placeholders and must be replaced by the real unit IDs.
5. Deploy, then click "Verify" / "Request review" in AdSense.

### Placement rules (enforced by `audit:adsense`)

- Maximum 3 ad slots per page; one below the calculator and one after the main explanation is the default pattern.
- **Never above the calculator**, never between the tool's inputs and results (`ads-above-tool`). The calculator is the product; Google's AI guide also asks that main content is distinct from ads (SEO-PLAYBOOK section 3).
- No ads on `/404`, `/embed/*`, thin pages, or the trust/legal pages (`ads-placement`, `ads-thin`).
- Every slot has an `aria-label`/visible "Advertisement" label (`AdSlot.astro` does this).
- Slots reserve space (`.ad-slot { min-height: 90px }` in `src/styles/global.css`) so ads cannot cause layout shift. If you add a taller format (for example 280 px), reserve that height at the matching breakpoint and re-run `npm run lhci`.
- Do not load the ad script on embed pages. The embed layout has no `adsbygoogle` code and must stay that way, because embedding ads in third-party iframes breaks policy.
- Auto ads (`adsenseAutoAds`) can place ads in positions that violate the rules above and shift layout. Leave it off unless you measure it with Lighthouse and the checks above.

## 4. ads.txt

`public/ads.txt` already exists as a commented template. After approval (and only then), replace its contents with one line, using the publisher ID **without** the `ca-` prefix:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

- It must be reachable at `https://<final-host>/ads.txt` (root of the same host as `siteUrl`). Redirects from apex to `www` are fine if the final URL returns 200 ([DEPLOYMENT.md](./DEPLOYMENT.md)).
- `npm run audit:adsense` fails if the publisher ID is set and `dist/ads.txt` lacks the matching (uncommented) line; it warns if `ads.txt` contains an active line while the ID is empty.
- AdSense's "Sites > ads.txt" status can take up to a day to turn green.

## 5. Consent (CMP), privacy policy, cookies

- **CMP**: for personalised ads in the EEA and UK (since 16 Jan 2024) and Switzerland (since 31 Jul 2024), Google requires a Google-certified CMP integrated with IAB TCF. Options: Google's own "Privacy & messaging" tool (Funding Choices) in the AdSense account, or another Google-certified CMP. The existing cookie banner in `BaseLayout.astro` is an informational notice, **not** a TCF CMP; it does not satisfy the requirement.
  - Install the CMP script before the AdSense and GA4 scripts. Consent Mode for GA4.
  - `audit:adsense` `cmp` fails if ads are enabled and no known CMP marker is found in the page HTML. It cannot prove the CMP works: test in a browser with an EEA exit IP before turning ads on.
- **Privacy policy** (`/privacy/`) must state, in plain language, at least:
  - Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this site or other sites.
  - Google's use of advertising cookies enables it and its partners to serve ads based on visits to this and other sites.
  - Users can opt out of personalised advertising via Google Ads Settings (<https://adssettings.google.com>) and <https://www.aboutads.info>.
  - What analytics are used (GA4, if enabled) and what is *not* collected (the calculator inputs stay in the browser, which is how the calculators are built; keep the policy true to that, and update it before ever adding input logging).
  - Contact details and data-subject rights contact.
- Keep the cookie banner copy truthful once ads are on ("essential cookies and optional analytics" is no longer sufficient: it must mention advertising cookies).

## 6. Pitfalls (and how this repo avoids them)

| Pitfall | Why it gets sites rejected | Guard |
|---|---|---|
| Tool-only pages | "Low value content": widget plus headings | 600+ words per tool, `thin-tool` |
| Template pages / near-duplicates (11 calculators with the same copy) | Scaled/auto-generated content | `duplicate-content` shingle check; unique worked example and FAQ per tool |
| Applying before launch (under construction, zero pages indexed) | Rejection reason "site isn't ready" | section 2 checklist |
| Missing or vague privacy policy | Policy violation | `privacy` check |
| No CMP for EEA/UK traffic | Ads limited or not served | section 5 |
| Placeholder text visible ("[Veterinary reviewer name]", lorem, TODO) | Looks unfinished and untrustworthy | `reviewer-placeholder`, `banned-copy` |
| Ads above or interleaved with the tool | Bad UX, accidental clicks, Better Ads | `ads-above-tool` |
| Ads on 404/embed/empty pages | Ads on pages without publisher content | `ads-placement` |
| Layout shift from late ads | Fails Core Web Vitals, hurts rankings | fixed `min-height`, `lhci` CLS <= 0.1 |
| Claiming a vet reviewed content when none did | Deceptive, YMYL trust damage | `ReviewerBox` shows a "pending review" note unless configured; rule in `ymyl-disclaimers.mdc` |
| Health claims ("cures", "no need to see a vet", "guaranteed safe") | Dangerous / misleading content policy | `banned-copy` patterns |
| Buying traffic or clicking your own ads | Account ban | never |
| Multiple accounts | Rejected / banned | one account |
| Large third-party script bundles slowing mobile | Fails CWV | `audit:budgets` third-party allow-list, `lhci` |
| AI-generated bulk articles | Scaled content abuse (SEO-PLAYBOOK section 6) | `write-seo-article` skill; human fact-check by `vet-fact-checker` |

## 7. After approval

1. Replace the template in `public/ads.txt`, deploy, verify in AdSense.
2. Turn on the CMP and test consent flows.
3. Set real `slotId`s and enable placements gradually; compare Lighthouse before and after (`npm run lhci`; CLS must stay <= 0.1).
4. Monitor AdSense Policy center weekly for the first month and Search Console CWV field data.
5. Keep running `npm run audit:adsense` in CI; set `AUDIT_PROD=1` in the production deploy job.
6. Revisit RPM by country after about 28 days (AdSense does not publish niche RPMs; MARKET-RESEARCH notes no RPM data exists for this niche).
