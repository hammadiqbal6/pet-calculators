# Deployment

The site is a fully static Astro build (`npm run build` writes `dist/`). There is no server runtime and no database. Brand/AdSense/IndexNow defaults live in `src/config/site.ts`; the **canonical origin, GA4 ID, GSC HTML-tag token, and contact email are build-time env vars** (`PUBLIC_SITE_URL`, `PUBLIC_GA4_MEASUREMENT_ID`, `PUBLIC_GSC_VERIFICATION`, `PUBLIC_CONTACT_EMAIL` — see `.env.example`). **Cloudflare Workers Builds (static assets Worker `pet-calculators`) is the primary target**; Cloudflare Pages, Vercel and Netlify remain viable alternatives.

Related: [SEO-GUIDE.md](./SEO-GUIDE.md) (indexing and Search Console), [ADSENSE.md](./ADSENSE.md) (`ads.txt`, CMP), [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md) section 2 (HTTPS, canonical host, robots/AI bots).

## 1. Pre-flight (every deploy)

1. Node `>= 22.22.0` (see `engines` in `package.json`). Pin it on the host (below).
2. Set `PUBLIC_SITE_URL` to the production origin (`https://`, no trailing slash). The build bakes it into canonicals, `og:url`, JSON-LD, the sitemap, `robots.txt` and `llms.txt` via `siteConfig.siteUrl`. A wrong value ships wrong canonicals everywhere. Local fallback: `FALLBACK_SITE_URL` in `src/config/site.ts`.
3. `npm ci && AUDIT_PROD=1 npm run audit`. `AUDIT_PROD=1` turns launch blockers (placeholder domain, placeholder reviewer, IndexNow placeholder, missing `ads.txt` once the AdSense ID is set) into failures. Put this in the production deploy job; leave previews on the default (warnings only).
4. `npm run lhci` against the build for template changes.
5. After deploy: open `/robots.txt`, `/sitemap-index.xml`, `/ads.txt` (post-approval) and one tool URL on the real host; then ping IndexNow (SEO-GUIDE section 3).

Build facts that matter to hosting:

| Setting | Value | Why |
|---|---|---|
| Build command | `npm run build` | `astro build` |
| Deploy command | `npx wrangler deploy` | Workers Builds / local dry-run |
| Output directory | `dist` | static HTML + `_astro/` hashed assets (`wrangler.jsonc` `assets.directory`) |
| `trailingSlash` | `'always'` (`astro.config.mjs`) | URLs are `/tools/x/`; `html_handling: force-trailing-slash` |
| `build.inlineStylesheets` | `'always'` | no render-blocking CSS file; whole CSS is inline |
| Sitemap | `@astrojs/sitemap` -> `dist/sitemap-index.xml` + `sitemap-0.xml` | submit the index file |
| Env vars | `PUBLIC_SITE_URL` (prod), optional `PUBLIC_GA4_MEASUREMENT_ID`, `PUBLIC_GSC_VERIFICATION`, `PUBLIC_CONTACT_EMAIL` | see `.env.example`; no secrets |

## 2. Cloudflare Workers Builds (primary)

Workers Builds is already the intended production path: Worker name **`pet-calculators`**, branch `main`, root `/`, build `npm run build`, deploy `npx wrangler deploy`. Committed `wrangler.jsonc` serves `./dist` as pure static assets (`not_found_handling: 404-page`) — **no Astro Cloudflare adapter, no SESSION KV / Images bindings**.

### 2.1 Build environment variables

Set on the Worker (Production; Preview if used):

| Name | Required | Purpose |
|---|---|---|
| `PUBLIC_SITE_URL` | yes (prod) | Canonical origin, e.g. `https://pet-calculators.<account>.workers.dev` or the custom domain |
| `PUBLIC_GA4_MEASUREMENT_ID` | no | `G-…`; empty/unset emits no GA4 script |
| `PUBLIC_GSC_VERIFICATION` | no | Search Console HTML-tag `content` value; empty/unset omits the meta tag |
| `PUBLIC_CONTACT_EMAIL` | no | Public contact mailbox; empty/unset → `hammadiqbal117@gmail.com` |
| `NODE_VERSION` | recommended | `22.22.0` or newer 22.x |

Confirm after the first build: `dist` HTML canonicals, `/sitemap-0.xml` hosts, `/robots.txt` `Sitemap:` line and `/llms.txt` links all use `PUBLIC_SITE_URL`.

### 2.2 Headers and redirects (`public/_headers`, `public/_redirects`)

Copied into `dist/` and applied by Workers static assets:

- Detach headers with `! Header-Name` (never an empty value — Cloudflare rejects empty header values).
- `_redirects` is **path-only** with numeric status codes (`301`). No host-based rules and no Netlify `301!` syntax (unsupported on Workers). Apex→www belongs in a Cloudflare Redirect Rule / Bulk Redirects when a custom domain is attached.
- Site-wide CSP allows `googletagmanager.com` / `google-analytics.com` (and AdSense hosts) so GA4 works when `PUBLIC_GA4_MEASUREMENT_ID` is set. `/embed/*` replaces CSP with `frame-ancestors *` and detaches `X-Frame-Options`.
- Version preview hosts `https://:version.:subdomain.workers.dev/*` get `X-Robots-Tag: noindex`. Do **not** noindex the production `*.workers.dev` hostname while it is the canonical `PUBLIC_SITE_URL`.

Local check: `PUBLIC_SITE_URL=… npm run build && npx wrangler deploy --dry-run`.

### 2.3 Custom domain

When attaching a real domain, set `PUBLIC_SITE_URL` to that origin, keep HTTPS Full (strict), and add a Redirect Rule for the non-canonical host. Until then the `*.workers.dev` URL is fine as the canonical.

## 3. Cloudflare Pages (alternative)

Prefer Workers Builds (section 2) for this repo. Pages remains a valid static host if you need it.

### 3.0 Create the project

1. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > select the repo.
2. Production branch: `main`. Framework preset: **Astro**. Build command `npm run build`. Build output directory `dist`. Root directory: repository root.
3. Environment variables (Settings > Variables and Secrets), for **both** Production and Preview:

| Name | Value | Purpose |
|---|---|---|
| `NODE_VERSION` | `22.22.0` (or newer 22.x) | matches `engines` |
| `PUBLIC_SITE_URL` | production origin | canonicals / sitemap / robots / llms |
| `PUBLIC_GA4_MEASUREMENT_ID` | `G-…` or empty | GA4; empty disables |
| `PUBLIC_GSC_VERIFICATION` | token or empty | GSC HTML meta; empty omits |

   Alternatively commit a `.node-version` file containing `22.22.0`.
4. Save and deploy. The first build gives a `https://<project>.pages.dev` URL. Check it, but **do not let it be indexed** if a custom domain is canonical.

### 3.0b Custom domain, HTTPS, redirects

1. Pages project > Custom domains > Set up a domain. Add the **canonical host** first. Recommendation: `www.<domain>` as canonical, with the apex redirecting to it. Using the apex as canonical is equally valid; pick one and set `PUBLIC_SITE_URL` to match.
2. If the domain's DNS is on Cloudflare, records are created automatically (a proxied CNAME to `<project>.pages.dev`). If DNS is elsewhere, add the CNAME for `www`, and for the apex use CNAME flattening/ALIAS, or move nameservers to Cloudflare (recommended; it also makes GSC DNS verification a single TXT record).
3. SSL/TLS (zone > SSL/TLS):
   - Encryption mode: **Full (strict)** (Pages certificates are valid at the origin).
   - Edge Certificates: **Always Use HTTPS** on; **Automatic HTTPS Rewrites** on; Minimum TLS **1.2**.
   - HSTS: enable only after HTTPS has been verified on every host. Start with `max-age=300`, raise to 6 months later; add `includeSubDomains`/`preload` only if every subdomain is HTTPS.
4. Apex -> `www` redirect (one 301, preserve path and query). Cloudflare Pages `_redirects` matches on **path only**, so the host-based first line of `public/_redirects` does not do this job on Pages (it does on Netlify); create a Redirect Rule instead (and confirm with the curl loop below). Rules > Redirect Rules > Create rule:
   - When: Hostname equals `<domain>` (apex)
   - Then: Dynamic redirect, expression `concat("https://www.<domain>", http.request.uri.path)` (add `, "?", http.request.uri.query` handling if you want query kept), status **301**, preserve query string on.
   - The apex needs a DNS record (proxied, for example an `A` to `192.0.2.1` placeholder, orange cloud on) so the rule can fire. Do not add the apex as a second Pages custom domain unless you want it to serve content.
   - Result: `http://<domain>/x`, `https://<domain>/x`, `http://www.<domain>/x` all end at `https://www.<domain>/x/` in at most two hops (Always Use HTTPS, then redirect).
5. Trailing slash: Pages serves `/tools/x/` from `tools/x/index.html` and redirects `/tools/x` to `/tools/x/` automatically. No rule needed. Verify: `curl -sI https://www.<domain>/tools/dog-food-calculator | head -3`.
6. Verify with:

```bash
for u in http://example.com/ https://example.com/ http://www.example.com/ https://www.example.com/; do
  curl -sIL -o /dev/null -w "%{url_effective}  %{http_code}  hops=%{num_redirects}\n" "$u"
done
```

   Replace `example.com` with the real domain: every line must end on the canonical host, HTTP 200.

### 3.1 Headers, redirects and preview indexing

Same `public/_headers` / `public/_redirects` as Workers (section 2.2). On Pages, add a host-based `X-Robots-Tag: noindex` for `https://:project.pages.dev/*` in the dashboard or a Pages-only overlay if the production canonical is a custom domain — the committed file targets Workers version URLs instead. Path redirects and `! Header-Name` detach syntax apply on both. Apex→www still needs a Redirect Rule (path-only `_redirects` cannot do host redirects on Pages or Workers). See section 8 for CSP + GA4.

### 3.2 Previews and branches

- Every PR branch gets a preview URL on `*.pages.dev`. Previews should build with `PUBLIC_SITE_URL` pointing at production so canonicals reference the real domain (never canonical to `pages.dev`).
- Optionally restrict previews with Cloudflare Access.
- Add a build watch path if you want to ignore doc-only changes.

### 3.3 Rollback

Pages > Deployments > pick the last good production deployment > Rollback. Re-run the redirect verification loop afterwards.

## 4. Vercel (alternative)

1. Import the repo. Framework preset **Astro**; Build `npm run build`; Output `dist`; Install `npm ci`; Node.js version 22.x (Project Settings > General).
2. `vercel.json` already exists at the repo root with `trailingSlash: true`, the apex-to-www redirect (edit the host value) and the legacy-phrasing redirects. Vercel does **not** read `public/_headers`, so add headers there:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/embed/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, follow" },
        { "key": "Content-Security-Policy", "value": "frame-ancestors *" }
      ]
    }
  ]
}
```

   (Merge into the existing `vercel.json`; do not replace the existing keys.)
3. Domains: add `www.<domain>` (production) and `<domain>`; set the apex to **Redirect to** `www.<domain>` with status 308/301 in the Domains panel. HTTPS certificates are automatic.
4. Preview deployments get `X-Robots-Tag: noindex` from Vercel by default; confirm on one preview.

## 5. Netlify (alternative)

1. New site from Git; build `npm run build`, publish `dist`. Set `NODE_VERSION=22` under Site configuration > Environment variables, or `[build.environment]` below.
2. Netlify reads `public/_headers` and `public/_redirects` natively. Path redirects in `_redirects` use plain `301` (Workers-compatible). For Netlify-only force-file overrides you would need `301!`, but host/apex redirects belong in Netlify domain settings. Only the build settings need a `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

3. Site configuration > Build & deploy > Post processing: do not enable "Bundle CSS/JS" or other asset optimization (Astro already inlines and minifies; double processing can break hashes and CSS). Confirm `/tools/x` redirects to `/tools/x/` after the first deploy.
4. Domain management: set `www.<domain>` as primary; Netlify issues Let's Encrypt certificates automatically and enforces HTTPS ("Force HTTPS"). Netlify DNS or a CNAME for `www` plus ALIAS/ANAME for the apex.

## 6. Domain and DNS checklist

- [ ] Registrar: auto-renew on, WHOIS privacy on, registrar lock on.
- [ ] Nameservers on Cloudflare (recommended) or correct CNAME/ALIAS records elsewhere.
- [ ] `PUBLIC_SITE_URL` (and thus `siteConfig.siteUrl`) equals the canonical host exactly (scheme, host, www or not).
- [ ] Non-canonical hosts 301 to the canonical host in one hop; `http` -> `https` enforced.
- [ ] CAA records allow the CA your host uses (Cloudflare/Google/Let's Encrypt); add only if you already use CAA.
- [ ] `contactEmail` domain has MX, SPF, DKIM and DMARC so reader mail is delivered and your outreach email is not spam-foldered.
- [ ] DNS TXT for Google Search Console (Domain property) and, if used, Bing; remove nothing once verified (it is re-checked).
- [ ] `public/<indexNowKey>.txt` deployed at the site root.
- [ ] `public/ads.txt` deployed (post-AdSense approval only).
- [ ] Do not index staging hosts: `X-Robots-Tag: noindex` on `*.pages.dev`/preview hosts and no staging URL in the sitemap.

## 7. Crawler access: CDN and bot settings

SEO-PLAYBOOK sections 0 and 2: AI search crawlers must reach the site or it will not be cited. Google also states AI features require crawling to be allowed "in robots.txt, and by any CDN or hosting infrastructure".

Cloudflare:
- Security > Bots: leave **Bot Fight Mode** off, or if on, verify OAI-SearchBot, PerplexityBot, Claude-SearchBot, Googlebot and Bingbot are not challenged (Security > Events shows blocks). Super Bot Fight Mode: allow "Verified bots".
- If the dashboard offers **Block AI bots / AI Crawl Control**, decide deliberately: blocking training bots (GPTBot, ClaudeBot, Google-Extended) is a business choice, but do not block the search bots. "Managed robots.txt" prepends Cloudflare's own rules to your file; if you turn it on, re-run `curl https://www.<domain>/robots.txt` and confirm the search bots are still allowed and the `Sitemap:` line is intact.
- WAF rate limiting: exempt `/sitemap-index.xml`, `/sitemap-0.xml`, `/robots.txt`.
- Verify the live `robots.txt` matches `dist/robots.txt` (`npm run audit:seo` checks the built file; only a `curl` proves the CDN is not rewriting it).

Quick live check:

```bash
curl -s https://www.<domain>/robots.txt
curl -sI https://www.<domain>/tools/puppy-weight-calculator/ | head -20
curl -s -A "OAI-SearchBot" -o /dev/null -w "%{http_code}\n" https://www.<domain>/tools/puppy-weight-calculator/
curl -s -A "PerplexityBot" -o /dev/null -w "%{http_code}\n" https://www.<domain>/tools/puppy-weight-calculator/
curl -s -A "Claude-SearchBot" -o /dev/null -w "%{http_code}\n" https://www.<domain>/tools/puppy-weight-calculator/
```

(A spoofed user-agent can still be challenged by verified-bot logic on the CDN; the definitive test is Security Events and the bots' own documentation for IP ranges.)

## 8. GA4 and AdSense with a Content-Security-Policy

`public/_headers` ships a site-wide CSP that already allow-lists GA4 (`googletagmanager.com`, `google-analytics.com`, `analytics.google.com`) and AdSense hosts, plus `'unsafe-inline'` for Astro’s inlined CSS and the small gtag bootstrap in `BaseLayout.astro`. `/embed/*` overrides CSP to `frame-ancestors *` only. If you tighten CSP later, keep those GA/AdSense hosts (and a CMP host if you add one) or analytics will fail silently. Re-run `npm run audit:budgets` (third-party scripts are allow-listed by hostname there).

## 9. Environment and configuration reference

Committed template: **`.env.example`**. Copy to `.env` for local builds (gitignored). Workers Builds injects the same names as build env vars.

| Name / field | Needed at | Notes |
|---|---|---|
| `PUBLIC_SITE_URL` | production build | → `siteConfig.siteUrl`; canonicals, sitemap, robots, llms.txt |
| `PUBLIC_GA4_MEASUREMENT_ID` | optional | → `siteConfig.ga4MeasurementId`; empty = no gtag |
| `PUBLIC_GSC_VERIFICATION` | optional | → `siteConfig.googleSiteVerification`; empty = no meta tag |
| `PUBLIC_CONTACT_EMAIL` | optional | → `siteConfig.contactEmail`; Contact/privacy/terms, footer, Organization JSON-LD; empty = `hammadiqbal117@gmail.com` |
| `buildDate` (`site.ts`) | each content release | `lastmod`, "Last updated", `dateModified` |
| `bingSiteVerification` (`site.ts`) | meta-tag verification only | prefer DNS; GSC uses `PUBLIC_GSC_VERIFICATION` |
| `adsensePublisherId` / `adsenseAutoAds` | after AdSense approval | [ADSENSE.md](./ADSENSE.md) |
| `indexNowKey` | deploy | plus `public/<key>.txt` |
| `sameAs` | when real profiles exist | Organization schema |
| `defaultAuthor`, `reviewerPlaceholder` | before launch | real people only |

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm test`, `npm run build`, the audits and Lighthouse CI on PRs and pushes to `main`. Require the `Build, test, audit` and `Lighthouse CI (mobile)` checks in branch protection before merging.
