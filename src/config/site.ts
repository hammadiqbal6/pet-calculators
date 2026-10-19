/**
 * Single source of truth for brand, domain, analytics, and AdSense placeholders.
 * Canonical URL, GA4, and GSC verification come from build-time PUBLIC_* env vars
 * (see `.env.example`). Do not scatter domain strings across pages — use `absoluteUrl()`.
 */

/** Used when `PUBLIC_SITE_URL` is unset (local builds / audits). */
export const FALLBACK_SITE_URL = 'https://www.petcalctools.example';

function publicEnv(name: string): string {
  const fromMeta =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    typeof (import.meta.env as Record<string, unknown>)[name] === 'string'
      ? String((import.meta.env as Record<string, unknown>)[name]).trim()
      : '';
  if (fromMeta) return fromMeta;
  const fromProcess =
    typeof process !== 'undefined' && typeof process.env?.[name] === 'string'
      ? process.env[name]!.trim()
      : '';
  return fromProcess;
}

function resolveSiteUrl(): string {
  const fromEnv = publicEnv('PUBLIC_SITE_URL').replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return FALLBACK_SITE_URL;
}

function resolveGa4MeasurementId(): string {
  return publicEnv('PUBLIC_GA4_MEASUREMENT_ID');
}

function resolveGoogleSiteVerification(): string {
  return publicEnv('PUBLIC_GSC_VERIFICATION');
}

export const siteConfig = {
  /** Public site name shown in UI, titles, and Organization schema */
  siteName: 'PetCalc Tools',
  /** Short brand used in nav / logo text */
  brandName: 'PetCalc',
  /**
   * Canonical origin including protocol, no trailing slash.
   * Set via `PUBLIC_SITE_URL` at build time (Workers Builds / local `.env`).
   */
  siteUrl: resolveSiteUrl(),
  /** Primary contact mailbox (mailto on Contact page) */
  contactEmail: 'hello@petcalctools.example',
  /** ISO date used for lastmod / "Last updated" defaults (YYYY-MM-DD) */
  buildDate: '2026-10-19',
  /** Tagline for homepage and meta fallbacks */
  tagline: 'Free pet calculators for dogs and cats — weight, food, age, and more.',
  /**
   * GA4 measurement ID from `PUBLIC_GA4_MEASUREMENT_ID` (G-XXXXXXXX).
   * Empty string disables all analytics script tags.
   */
  ga4MeasurementId: resolveGa4MeasurementId(),
  /**
   * Google Search Console HTML-tag verification content from `PUBLIC_GSC_VERIFICATION`.
   * Empty string omits the meta tag. Prefer DNS verification when possible.
   */
  googleSiteVerification: resolveGoogleSiteVerification(),
  /** Bing Webmaster Tools verification. Leave empty to disable. */
  bingSiteVerification: '',
  /**
   * AdSense publisher ID (ca-pub-XXXXXXXXXXXXXXXX).
   * Leave empty — ads stay disabled until configured. See docs/ADSENSE.md.
   */
  adsensePublisherId: '',
  /** Enable AdSense Auto ads when publisher ID is set */
  adsenseAutoAds: false,
  /** IndexNow key (also place matching file at /public/{key}.txt). Google does not use IndexNow. */
  indexNowKey: 'petcalc-indexnow-key-replace-me',
  /** Social / entity sameAs URLs for Organization schema (real profiles only) */
  sameAs: [] as string[],
  /** Default author shown in bylines */
  defaultAuthor: {
    name: 'PetCalc Editorial',
    role: 'Content team',
  },
  /** Reviewer placeholder — replace with a real credentialed reviewer when available */
  reviewerPlaceholder: {
    name: '[Veterinary reviewer name]',
    credentials: '[DVM / credential placeholder]',
    note: 'Content pending independent veterinary review. Formulas cite published guidelines; they are not a substitute for clinical judgment.',
  },
  /** Locale */
  locale: 'en_US',
  /** Twitter / X handle without @, optional */
  twitterHandle: '',
};

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper */
export function absoluteUrl(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
