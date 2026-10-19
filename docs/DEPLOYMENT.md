# Deployment

The site is a fully static Astro build (`npm run build` writes `dist/`). There is no server runtime, no database and **no required environment variables**: all configuration is in `src/config/site.ts` (domain, analytics IDs, AdSense ID, IndexNow key). Any static host works. **Cloudflare Pages is the primary target**; Vercel and Netlify are documented as alternatives.

Related: [SEO-GUIDE.md](./SEO-GUIDE.md) (indexing and Search Console), [ADSENSE.md](./ADSENSE.md) (`ads.txt`, CMP), [SEO-PLAYBOOK.md](./SEO-PLAYBOOK.md) section 2 (HTTPS, canonical host, robots/AI bots).

## 1. Pre-flight (every deploy)

1. Node `>= 22.22.0` (see `engines` in `package.json`). Pin it on the host (below).
2. `src/config/site.ts`: `siteUrl` is the production origin (final host, `https://`, no trailing slash). The build bakes it into canonicals, `og:url`, JSON-LD, the sitemap and `robots.txt`. A wrong value ships wrong canonicals everywhere.
3. `npm ci && AUDIT_PROD=1 npm run audit`. `AUDIT_PROD=1` turns launch blockers (placeholder domain, placeholder reviewer, IndexNow placeholder, missing `ads.txt` once the AdSense ID is set) into failures. Put this in the production deploy job; leave previews on the default (warnings only).
4. `npm run lhci` against the build for template changes.
5. After deploy: open `/robots.txt`, `/sitemap-index.xml`, `/ads.txt` (post-approval) and one tool URL on the real host; then ping IndexNow (SEO-GUIDE section 3).

Build facts that matter to hosting:

| Setting | Value | Why |
|---|---|---|
| Build command | `npm run build` | `astro build` |
| Output directory | `dist` | static HTML + `_astro/` hashed assets |
| `trailingSlash` | `'always'` (`astro.config.mjs`) | URLs are `/tools/x/`; hosts must serve `/tools/x/index.html` and redirect `/tools/x` to `/tools/x/` |
| `build.inlineStylesheets` | `'always'` | no render-blocking CSS file; whole CSS is inline |
| Sitemap | `@astrojs/sitemap` -> `dist/sitemap-index.xml` + `sitemap-0.xml` | submit the index file |
| Env vars | none required | do not add secrets to the repo; there is nothing secret in a static site |

## 2. Cloudflare Pages (primary)

### 2.1 Create the project

1. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > select the repo.
2. Production branch: `main`. Framework preset: **Astro**. Build command `npm run build`. Build output directory `dist`. Root directory: repository root.
3. Environment variables (Settings > Variables and Secrets), for **both** Production and Preview:

| Name | Value | Purpose |
|---|---|---|
| `NODE_VERSION` | `22.22.0` (or newer 22.x) | matches `engines` |
| `NPM_FLAGS` | (unset) | not needed |

   Alternatively commit a `.node-version` file containing `22.22.0`.
4. Save and deploy. The first build gives a `https://<project>.pages.dev` URL. Check it, but **do not let it be indexed** (2.3).

### 2.2 Custom domain, HTTPS, redirects

1. Pages project > Custom domains > Set up a domain. Add the **canonical host** first. Recommendation: `www.<domain>` as canonical (matches the placeholder `https://www.petcalctools.example`), with the apex redirecting to it. Using the apex as canonical is equally valid; pick one and set `siteUrl` to match.
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

### 2.3 Headers, redirects and preview indexing: `public/_headers`, `public/_redirects`

Both files already exist in `public/` and are copied into `dist/`; Cloudflare Pages (and Netlify) read them from the output root. `_redirects` holds the apex-to-www rule (edit the domain, or delete the rule if the apex is canonical) and the legacy-phrasing redirects. `vercel.json` carries the equivalent for Vercel. Review the committed `_headers` against the recommended baseline below before launch:

Review the committed `_headers` before launch:

- HSTS ships as `max-age=31536000; includeSubDomains`. Only deploy that after confirming HTTPS works on every subdomain; otherwise start at `max-age=300` and raise it later.
- `/embed/*` uses `! X-Frame-Options` (detaches the `SAMEORIGIN` value set by `/*`) plus `frame-ancestors *` so third-party sites can frame it. Do not use `X-Frame-Options: ALLOWALL`: it is not a valid value.
- The `https://:project.pages.dev/*` rule at the bottom sends `X-Robots-Tag: noindex` for the `pages.dev` alias and previews.
- Adjust any CSP if you enable GA4 or AdSense (section 7; a CSP that blocks them fails silently, with no build error).

Reference baseline (the committed file also sets cache headers for sitemaps, robots and `llms.txt`):

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/favicon.svg
  Cache-Control: public, max-age=86400

/embed/*
  ! X-Frame-Options
  Content-Security-Policy: frame-ancestors *
  X-Robots-Tag: noindex

# keep *.pages.dev (production alias and previews) out of search results
https://:project.pages.dev/*
  X-Robots-Tag: noindex
```

Notes:
- `/embed/*` must be frameable by third-party sites, hence `! X-Frame-Options` (detaches the value set by `/*`) plus `frame-ancestors *`. Everything else keeps `SAMEORIGIN`.
- HTML must not be cached for long: Pages' default (`max-age=0, must-revalidate` with ETag) is right. Do not add long cache headers to `/*`.
- Cloudflare's "Managed `robots.txt`" / "Block AI bots" features can **prepend or override** the repo's `robots.txt`. Check section 6 before launch.

### 2.4 Previews and branches

- Every PR branch gets a preview URL on `*.pages.dev`; the `_headers` rule above keeps it `noindex`. Previews build with `siteUrl` pointing at production, so canonicals still reference the real domain: that is intended (never canonical to `pages.dev`).
- Optionally restrict previews with Cloudflare Access (Settings > General > Access policy) so unreleased pages are not public.
- Add a build watch path if you want to ignore doc-only changes (Settings > Builds > Build watch paths: include `src/*`, `public/*`, `astro.config.mjs`, `package*.json`).

### 2.5 Rollback

Pages > Deployments > pick the last good production deployment > Rollback. Re-run the redirect verification loop afterwards.

## 3. Vercel (alternative)

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

## 4. Netlify (alternative)

1. New site from Git; build `npm run build`, publish `dist`. Set `NODE_VERSION=22` under Site configuration > Environment variables, or `[build.environment]` below.
2. Netlify reads `public/_headers` and `public/_redirects` natively, so the committed files already cover headers, the apex-to-www rule (`301!` forces it even when a file exists) and the legacy redirects. Only the build settings need a `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

3. Site configuration > Build & deploy > Post processing: do not enable "Bundle CSS/JS" or other asset optimization (Astro already inlines and minifies; double processing can break hashes and CSS). Confirm `/tools/x` redirects to `/tools/x/` after the first deploy.
4. Domain management: set `www.<domain>` as primary; Netlify issues Let's Encrypt certificates automatically and enforces HTTPS ("Force HTTPS"). Netlify DNS or a CNAME for `www` plus ALIAS/ANAME for the apex.

## 5. Domain and DNS checklist

- [ ] Registrar: auto-renew on, WHOIS privacy on, registrar lock on.
- [ ] Nameservers on Cloudflare (recommended) or correct CNAME/ALIAS records elsewhere.
- [ ] `siteUrl` in `src/config/site.ts` equals the canonical host exactly (scheme, host, www or not).
- [ ] Non-canonical hosts 301 to the canonical host in one hop; `http` -> `https` enforced.
- [ ] CAA records allow the CA your host uses (Cloudflare/Google/Let's Encrypt); add only if you already use CAA.
- [ ] `contactEmail` domain has MX, SPF, DKIM and DMARC so reader mail is delivered and your outreach email is not spam-foldered.
- [ ] DNS TXT for Google Search Console (Domain property) and, if used, Bing; remove nothing once verified (it is re-checked).
- [ ] `public/<indexNowKey>.txt` deployed at the site root.
- [ ] `public/ads.txt` deployed (post-AdSense approval only).
- [ ] Do not index staging hosts: `X-Robots-Tag: noindex` on `*.pages.dev`/preview hosts and no staging URL in the sitemap.

## 6. Crawler access: CDN and bot settings

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

## 7. GA4 and AdSense with a Content-Security-Policy

The repo does not ship a CSP (inline scripts in `BaseLayout.astro` would need hashes or a nonce). If you add one later, include at least:

- `script-src`: `'self'` + hashes of the inline scripts + `https://www.googletagmanager.com` + `https://pagead2.googlesyndication.com` + `https://*.google.com` / `https://fundingchoicesmessages.google.com` (CMP)
- `connect-src`: `'self'` + `https://*.google-analytics.com` + `https://*.analytics.google.com` + `https://pagead2.googlesyndication.com`
- `frame-src`: `https://googleads.g.doubleclick.net` + `https://tpc.googlesyndication.com`
- `img-src`: `'self' data: https://*.google-analytics.com https://pagead2.googlesyndication.com`

Test with ads and the CMP on in a browser with the console open; CSP failures show only there. Re-run `npm run audit:budgets` (third-party scripts are allow-listed by hostname there).

## 8. Environment and configuration reference

There is no `.env` file for this project (`.gitignore` excludes `.env` and `.env.production` in case you add one for tooling). Everything is in `src/config/site.ts`:

| Field | Needed at | Notes |
|---|---|---|
| `siteUrl` | deploy | final origin; canonicals, sitemap, robots |
| `contactEmail` | deploy | Contact page, Organization JSON-LD |
| `buildDate` | each content release | `lastmod`, "Last updated", `dateModified` |
| `ga4MeasurementId` | after CMP/consent plan | empty disables GA4 |
| `googleSiteVerification` / `bingSiteVerification` | only for meta-tag verification | prefer DNS |
| `adsensePublisherId` / `adsenseAutoAds` | after AdSense approval | [ADSENSE.md](./ADSENSE.md) |
| `indexNowKey` | deploy | plus `public/<key>.txt` |
| `sameAs` | when real profiles exist | Organization schema |
| `defaultAuthor`, `reviewerPlaceholder` | before launch | real people only |

CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm test`, `npm run build`, the audits and Lighthouse CI on PRs and pushes to `main`. Require the `Build, test, audit` and `Lighthouse CI (mobile)` checks in branch protection before merging.
