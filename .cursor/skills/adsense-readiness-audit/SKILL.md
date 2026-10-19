---
name: adsense-readiness-audit
description: Verify PetCalc meets AdSense readiness using audit:adsense, ADSENSE.md, and YMYL trust rules.
---

# AdSense readiness audit (PetCalc)

Reference: `docs/ADSENSE.md`. Script: `scripts/audit/adsense.mjs` (`npm run audit:adsense` after build).

Subagent depth: `.cursor/agents/adsense-reviewer.md`.

## When to run

- Before applying to AdSense
- After adding tools/guides or changing ad placement
- With `AUDIT_PROD=1` in CI for launch

```bash
npm run build
npm run audit:adsense
AUDIT_PROD=1 npm run audit:adsense
```

## Inventory gates (`LIMITS` in `scripts/audit/lib.mjs`)

- ≥8 tool pages, ≥3 guides
- Hubs `/`, `/tools/`, `/dogs/`, `/cats/`, `/guides/` live
- Legal: `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/methodology/`
- Custom `/404/` (`src/pages/404.astro`), no ads, noindex

## Content quality signals

| Check | Repo expectation |
|-------|------------------|
| `thin-page` | Tools ≥600 words; guides ≥800 (`audit:seo` enforces) |
| `banned-copy` | No "coming soon", lorem, placeholder reviewer names |
| Disclaimers | `<Disclaimer />` on tools/guides (`.cursor/rules/ymyl-disclaimers.mdc`) |
| About/Contact | Real people and monitored `contactEmail` in `src/config/site.ts` |
| Privacy | Ad cookie / third-party disclosures (`/privacy/`) |

## Ad placement rules

- `adsensePublisherId` empty until approval (`src/config/site.ts`)
- Manual slots via `AdSlot.astro`; **never above** the calculator (`audit:adsense` `ads-above-tool`)
- No ads on embeds, 404, or thin/legal-only pages
- When enabled: `public/ads.txt` matches publisher ID; CMP for EEA/UK (`docs/ADSENSE.md` section 5)

## Trust (YMYL-adjacent pet health)

- Cited sources on every tool/guide
- `ReviewerBox` only with a real named reviewer — remove placeholder text
- Methodology page linked in footer

## Pre-apply manual checklist (from ADSENSE.md §2)

- `npm run audit` passes with `AUDIT_PROD=1`
- Live HTTPS on final domain; pages indexed in Search Console
- Organic traffic exists (qualitative)
- `npm run lhci` passes (ads worsen CLS if site is slow)

Report: pass/fail per audit code, file path, and the smallest fix. Re-run `npm run audit` before telling the user they are ready to apply.
