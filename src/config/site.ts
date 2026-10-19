/**
 * Single source of truth for brand, domain, analytics, and AdSense placeholders.
 * Fill these values before deploy — do not scatter domain strings across pages.
 */
export const siteConfig = {
  /** Public site name shown in UI, titles, and Organization schema */
  siteName: 'PetCalc Tools',
  /** Short brand used in nav / logo text */
  brandName: 'PetCalc',
  /**
   * Canonical origin including protocol, no trailing slash.
   * Example: https://www.petcalctools.com
   */
  siteUrl: 'https://www.petcalctools.example',
  /** Primary contact mailbox (mailto on Contact page) */
  contactEmail: 'hello@petcalctools.example',
  /** ISO date used for lastmod / "Last updated" defaults (YYYY-MM-DD) */
  buildDate: '2026-10-19',
  /** Tagline for homepage and meta fallbacks */
  tagline: 'Free pet calculators for dogs and cats — weight, food, age, and more.',
  /** Optional GA4 measurement ID (G-XXXXXXXX). Leave empty to disable. */
  ga4MeasurementId: '',
  /** Optional Google Search Console HTML tag content. Leave empty to disable. */
  googleSiteVerification: '',
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
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper */
export function absoluteUrl(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
