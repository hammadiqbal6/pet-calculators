/**
 * Single source of truth for brand, domain, analytics, author/reviewer, and AdSense.
 * Canonical URL, GA4, GSC, contact, author, and reviewer come from build-time PUBLIC_*
 * (and INDEXNOW_KEY) env vars — see `.env.example`. Do not scatter domain strings across
 * pages — use `absoluteUrl()`.
 */

export const SITE_NAME = 'PetCalc Tools';
export const BRAND_NAME = 'PetCalc';

/** Used when `PUBLIC_SITE_URL` is unset (local builds / audits). */
export const FALLBACK_SITE_URL = 'https://pet-calculators.hammadiqbal117.workers.dev';

/** Public contact mailbox when `PUBLIC_CONTACT_EMAIL` is unset. */
export const DEFAULT_CONTACT_EMAIL = 'hammadiqbal117@gmail.com';

/** IndexNow key when `INDEXNOW_KEY` is unset (must match `public/{key}.txt`). */
export const DEFAULT_INDEXNOW_KEY = '6a232080046a9576fef903fc8f5b8279';

/** Bylines when `PUBLIC_AUTHOR_NAME` is unset — named maintainer, not an anonymous team. */
export const DEFAULT_AUTHOR_NAME = 'Hammad Iqbal';

/** Role label when `PUBLIC_AUTHOR_ROLE` is unset. */
export const DEFAULT_AUTHOR_ROLE = 'Site maintainer';

/**
 * Honest default bio when `PUBLIC_AUTHOR_BIO` is unset.
 * No invented credentials; maintainer is not presented as a veterinarian.
 */
export const DEFAULT_AUTHOR_BIO =
  'I build and maintain PetCalc Tools as an independent developer. Formulas are implemented from cited veterinary references (NRC, AAHA, WSAVA, AAFCO, AAFP, ASPCA, and the Merck / MSD Veterinary Manual), explained in plain language, and checked against the published numbers in those sources. I am not a veterinarian; clinical decisions always belong with a licensed professional and the individual animal.';

/**
 * Stable Person @id shared across sister tool sites so Google can tie authorship to one entity.
 * Do not invent a personal site URL — GitHub profile is the canonical cross-site id.
 */
export const CANONICAL_PERSON_ID = 'https://github.com/hammadiqbal6#person';

/** Public profiles for Person.sameAs (real profiles only). */
export const AUTHOR_SAME_AS = ['https://github.com/hammadiqbal6'] as const;

/** Brand theme color for theme-color meta and web manifest. */
export const THEME_COLOR = '#1f6b4a';

export type SiteReviewer = {
  name: string;
  credentials: string;
  note?: string;
};

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

function resolveBingSiteVerification(): string {
  return publicEnv('PUBLIC_BING_SITE_VERIFICATION');
}

function resolveContactEmail(): string {
  return publicEnv('PUBLIC_CONTACT_EMAIL') || DEFAULT_CONTACT_EMAIL;
}

function resolveAdsensePublisherId(): string {
  return publicEnv('PUBLIC_ADSENSE_PUBLISHER_ID');
}

function resolveAdsenseAutoAds(): boolean {
  const raw = publicEnv('PUBLIC_ADSENSE_AUTO_ADS').toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

function resolveIndexNowKey(): string {
  return publicEnv('INDEXNOW_KEY') || DEFAULT_INDEXNOW_KEY;
}

function resolveAuthorName(): string {
  return publicEnv('PUBLIC_AUTHOR_NAME') || DEFAULT_AUTHOR_NAME;
}

function resolveAuthorRole(): string {
  return publicEnv('PUBLIC_AUTHOR_ROLE') || DEFAULT_AUTHOR_ROLE;
}

function resolveAuthorBio(): string {
  return publicEnv('PUBLIC_AUTHOR_BIO') || DEFAULT_AUTHOR_BIO;
}

/**
 * Named reviewer only when both name and credentials are set via env.
 * Empty defaults → null (ReviewerBox shows the neutral sourced-references line).
 * Rejects bracketed placeholder strings so a fake vet never ships.
 */
function resolveReviewer(): SiteReviewer | null {
  const name = publicEnv('PUBLIC_REVIEWER_NAME');
  const credentials = publicEnv('PUBLIC_REVIEWER_CREDENTIALS');
  if (!name || !credentials) return null;
  if (/\[[^\]]*\]/.test(`${name}${credentials}`)) return null;
  const note = publicEnv('PUBLIC_REVIEWER_NOTE');
  return note ? { name, credentials, note } : { name, credentials };
}

/** True when a real named reviewer (not a bracket placeholder) is configured. */
export function hasConfiguredReviewer(reviewer: SiteReviewer | null | undefined): reviewer is SiteReviewer {
  if (!reviewer) return false;
  const name = reviewer.name?.trim() ?? '';
  const credentials = reviewer.credentials?.trim() ?? '';
  if (!name || !credentials) return false;
  if (/\[[^\]]*\]/.test(`${name}${credentials}`)) return false;
  return true;
}

const resolvedReviewer = resolveReviewer();

export const siteConfig = {
  /** Public site name shown in UI, titles, and Organization schema */
  siteName: SITE_NAME,
  /** Short brand used in nav / logo text */
  brandName: BRAND_NAME,
  /**
   * Canonical origin including protocol, no trailing slash.
   * Set via `PUBLIC_SITE_URL` at build time (Workers Builds / local `.env`).
   */
  siteUrl: resolveSiteUrl(),
  /**
   * Primary contact mailbox (Contact page, footer, privacy/terms, Organization JSON-LD).
   * Override with `PUBLIC_CONTACT_EMAIL` at build time; defaults to `DEFAULT_CONTACT_EMAIL`.
   */
  contactEmail: resolveContactEmail(),
  /** ISO date used for lastmod / "Last updated" defaults (YYYY-MM-DD) */
  buildDate: '2026-10-23',
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
  /**
   * Bing Webmaster Tools HTML-tag verification from `PUBLIC_BING_SITE_VERIFICATION`.
   * Empty string omits the meta tag.
   */
  bingSiteVerification: resolveBingSiteVerification(),
  /**
   * AdSense publisher ID from `PUBLIC_ADSENSE_PUBLISHER_ID` (ca-pub-…).
   * Leave empty — ads stay disabled until configured. See docs/ADSENSE.md.
   */
  adsensePublisherId: resolveAdsensePublisherId(),
  /** Enable AdSense Auto ads when publisher ID is set (`PUBLIC_ADSENSE_AUTO_ADS`). */
  adsenseAutoAds: resolveAdsenseAutoAds(),
  /**
   * IndexNow key from `INDEXNOW_KEY` (also place matching file at /public/{key}.txt).
   * Google does not use IndexNow.
   */
  indexNowKey: resolveIndexNowKey(),
  /** Theme color for browsers / PWA chrome */
  themeColor: THEME_COLOR,
  /** Stable Person @id for JSON-LD across sister sites */
  personId: CANONICAL_PERSON_ID,
  /** Social / entity sameAs URLs for Organization schema (real profiles only) */
  sameAs: [] as string[],
  /** Author public profiles */
  authorSameAs: [...AUTHOR_SAME_AS],
  /**
   * Default author shown in bylines and on /about/#maintainer.
   * Override with PUBLIC_AUTHOR_NAME / PUBLIC_AUTHOR_ROLE / PUBLIC_AUTHOR_BIO.
   */
  defaultAuthor: {
    name: resolveAuthorName(),
    role: resolveAuthorRole(),
    bio: resolveAuthorBio(),
  },
  /**
   * Named veterinary reviewer from PUBLIC_REVIEWER_NAME + PUBLIC_REVIEWER_CREDENTIALS.
   * Null when unset — never invent a vet. ReviewerBox then shows the neutral methodology line.
   */
  reviewer: resolvedReviewer,
  /**
   * @deprecated Alias of `reviewer` for older call sites; prefer `siteConfig.reviewer`.
   */
  reviewerPlaceholder: resolvedReviewer,
  /** Locale */
  locale: 'en_US',
  /** Twitter / X handle without @, optional */
  twitterHandle: '',
};

export type SiteConfig = typeof siteConfig;

/**
 * Absolute URL helper. Canonical origin is always `siteConfig.siteUrl`
 * (`PUBLIC_SITE_URL` or `FALLBACK_SITE_URL`) — never hard-code a host.
 *
 * Pass page paths with a trailing slash; pass file assets (og:image, icons,
 * IndexNow `.txt`) **without** a trailing slash. This helper never appends `/`
 * to paths that look like files (see docs/SEO-GUARDRAILS.md).
 */
export function absoluteUrl(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/$/, '');
  let p = path.startsWith('/') ? path : `/${path}`;
  // Never force a trailing slash onto file-like paths (og:image must not end in /)
  if (/\.[a-zA-Z0-9]{1,16}$/.test(p)) {
    p = p.replace(/\/+$/, '');
  }
  return `${base}${p}`;
}

export {
  sisterSites,
  sisterSites as SISTER_SITES,
  sisterSiteOrigins,
  sisterSiteUrl,
  sisterSiteById,
  SISTER_SITE_FALLBACKS,
  type SisterSiteKey,
  type SisterSiteMeta,
} from './sisterSites.ts';
