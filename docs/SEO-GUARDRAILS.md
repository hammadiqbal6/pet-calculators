# SEO guardrails (pet-calculators)

Hard requirements so builds never ship the indexing and AEO bugs found in the Oct 2026 multi-site audit. Enforced by `npm run audit` (`scripts/audit/seo-guardrails.mjs` + tightened `audit:seo`).

**Canonical origin:** single setting — `PUBLIC_SITE_URL` or `FALLBACK_SITE_URL` in [`src/config/site.ts`](../src/config/site.ts). See [CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md).  
**Governing docs:** [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md), [SEO-GUIDE.md](./SEO-GUIDE.md), [KEYWORD-MAP.md](./KEYWORD-MAP.md), [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Lessons from siblings (do not regress)

| Bug | Cause | Fix |
|---|---|---|
| GSC / sitemap on `example.com` | Fallback or unset `site` baked wrong host into `@astrojs/sitemap` | Default to live workers.dev via `FALLBACK_SITE_URL`; `astro.config.mjs` uses `PUBLIC_SITE_URL \|\| siteConfig.siteUrl` |
| `og:image` → `…/file.png/` 404 | `absoluteUrl()` forced trailing slash on assets | Pass file paths without `/`; helper strips slash on file-like paths |
| `/sitemap.xml` 404 | No alias to Astro’s `sitemap-index.xml` | `public/_redirects`: `/sitemap.xml` → `/sitemap-index.xml` 301 |
| IndexNow placeholder `000…0` | Dummy key | Real 32-hex key at `public/<key>.txt` matching `DEFAULT_INDEXNOW_KEY` |
| Trailing-slash 307 | Assets `html_handling` alone | Run-first `src/worker.ts` issues **308**; `FILE_EXT` allows `{1,16}` (`.webmanifest`) |
| `npx wrangler preview` fails | Top-level wrangler `vars` without `previews` | Assets-only: **no** runtime `vars` for `PUBLIC_*`; keep `"previews": {}` |
| Hardcoded `*.workers.dev` in pages | Domain cutover becomes a find-replace nightmare | Only `site.ts` / `sisterSites.ts` defaults; everywhere else `absoluteUrl()` |

---

## Do / don’t

### Do

- [ ] Keep `FALLBACK_SITE_URL` equal to the live origin until custom-domain cutover; then set `PUBLIC_SITE_URL` (see [CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md)).
- [ ] Keep `astro.config.mjs` `site:` derived from `PUBLIC_SITE_URL` / `siteConfig.siteUrl`.
- [ ] Pass **page** paths to `absoluteUrl()` with trailing slash; **file** paths without.
- [ ] Keep `/sitemap.xml` → `/sitemap-index.xml` 301 in `public/_redirects`.
- [ ] Keep IndexNow key at site root `public/<32-hex>.txt`.
- [ ] Keep `assets.html_handling: "force-trailing-slash"`, `main: "src/worker.ts"`, `run_worker_first`, and `"previews": {}` in `wrangler.jsonc`.
- [ ] Put `PUBLIC_*` in Cloudflare Workers Builds **dashboard** env (build-time), not wrangler `vars`.
- [ ] Titles ≤ **60** characters including ` \| PetCalc Tools`; meta descriptions **50–165**.
- [ ] Exactly one H1; self-referencing absolute canonical; tool pages link ≥1 guide (“Learn more”); guides ≥800 words; FAQPage + author + dateModified on guides.
- [ ] Explicit AI/search bot `Allow` lines in `robots.txt` (not only `User-agent: *`).
- [ ] Topical Related / Learn more blocks (nav alone is not enough).
- [ ] Run `npm run build && npm run audit` before merge.

### Don’t

- [ ] Don’t hard-code `*.workers.dev` (or any production host) outside `src/config/site.ts`, `src/config/sisterSites.ts`, `.env.example`, CI env blocks, and docs that describe the current URL.
- [ ] Don’t use `https://example.com` as a site URL fallback.
- [ ] Don’t append trailing slashes to `og:image`, favicons, or IndexNow `.txt`.
- [ ] Don’t commit `00000000000000000000000000000000.txt` as the live key.
- [ ] Don’t add wrangler top-level `vars` for `PUBLIC_*` without matching `previews.vars`.
- [ ] Don’t remove `"previews": {}`.
- [ ] Don’t noindex production HTML via a host-wide `_headers` rule that matches `*.workers.dev` while that host is canonical.
- [ ] Don’t change routes / custom domain in SEO PRs unless explicitly asked.
- [ ] Don’t ship inline `<script>` that uses `import` outside a bundled module (breaks Analytics).

---

## CI / audit enforcement

| Check | Where |
|---|---|
| No `example.com` in dist SEO surfaces | `scripts/audit/seo-guardrails.mjs` |
| No hard-coded `workers.dev` outside allowlist (source) | same |
| Dist host matches `siteConfig.siteUrl` only | same |
| No `og:image` ending in `/` | same |
| Titles >60 or missing; meta desc outside 50–165; missing canonical; H1 count ≠ 1 | `seo-guardrails` + `audit:seo` |
| Tool pages without a `/guides/` link | same |
| Guides <800 words | `audit:seo` (error) |
| Indexable pages missing from sitemap; broken internal links; invalid JSON-LD | `audit:seo` / `check:links` |
| Inline scripts containing `import` | `seo-guardrails` |
| IndexNow placeholder key | `seo-guardrails` |
| Wrangler `html_handling` + `previews` + worker FILE_EXT | `seo-guardrails` |
| Lighthouse budgets use **median-run** (non-flaky) | `lighthouserc.cjs` |

```bash
npm run build && npm run audit
npm test
```

---

## Workers Builds notes

| Branch | Typical command |
|---|---|
| Production (`main`) | `npm run build` then `npx wrangler deploy && node scripts/indexnow.mjs` |
| Non-production | `npm run build` then `npx wrangler preview` — requires `"previews": {}` |
