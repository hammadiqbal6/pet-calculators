# Custom domain cutover

The site’s **canonical origin** is a single build-time setting. Do not hard-code the production hostname in pages, scripts, or JSON-LD.

## Single source of truth

| Layer | Setting |
|---|---|
| Env (preferred in prod) | `PUBLIC_SITE_URL` — `https://`, **no** trailing slash |
| Code default | `FALLBACK_SITE_URL` in [`src/config/site.ts`](../src/config/site.ts) (currently the `*.workers.dev` URL) |
| Astro | `site:` in [`astro.config.mjs`](../astro.config.mjs) reads `siteConfig.siteUrl` |
| URL builder | `absoluteUrl()` / `siteConfig.siteUrl` for canonicals, sitemap, `robots.txt` Sitemap line, `llms.txt`, JSON-LD, Open Graph, IndexNow host |

Sister-site origins stay in [`src/config/sisterSites.ts`](../src/config/sisterSites.ts) (`PUBLIC_SITE_URL_*` / workers.dev fallbacks). They are not this site’s canonical.

Enforced by `npm run audit:seo-guardrails` (fails CI if `*.workers.dev` is hard-coded outside the allowlisted config/docs, or if `dist/` SEO surfaces use a host other than `siteConfig.siteUrl`).

## Cutover checklist (when the custom domain is ready)

1. **Choose the canonical host** (apex or `www` — pick one) and set DNS to Cloudflare.
2. **Workers / Pages custom domain:** attach that host to the `pet-calculators` Worker (or Pages project). Enable HTTPS (Full strict).
3. **Build env:** set `PUBLIC_SITE_URL=https://<canonical-host>` in Workers Builds (production). Rebuild/redeploy so canonicals, sitemap, robots, llms.txt, OG, and JSON-LD all bake the new origin.
4. **Redirect old host:** add a Cloudflare Redirect Rule (301) from `pet-calculators.hammadiqbal117.workers.dev/*` → `https://<canonical-host>/$1` (and apex↔www if needed). Keep a single canonical.
5. **Search Console:** add a **new** URL-prefix (or domain) property for the custom host; verify (DNS preferred); submit `https://<canonical-host>/sitemap-index.xml`. Keep the workers.dev property until coverage moves, then retire it.
6. **IndexNow:** after deploy, run `node scripts/indexnow.mjs` (or the usual `npx wrangler deploy && node scripts/indexnow.mjs`) so the key file and ping use the new host.
7. **Spot-check:** homepage canonical, one tool, one guide, `/robots.txt`, `/sitemap-index.xml`, `/llms.txt`, and `og:image` absolute URLs — all must use the custom origin; none should still point at workers.dev in `dist/`.
8. **Do not** change routes or invent a second site URL in content. Update only `PUBLIC_SITE_URL` (and sister `PUBLIC_SITE_URL_*` when those sites move).

Until cutover, leaving `PUBLIC_SITE_URL` unset (local) or set to the current workers.dev URL is correct. See also [DEPLOYMENT.md](./DEPLOYMENT.md) and [SEO-GUARDRAILS.md](./SEO-GUARDRAILS.md).
