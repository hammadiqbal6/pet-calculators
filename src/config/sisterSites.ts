/**
 * Cross-site (sister tool site) base URLs.
 * Same env names on all five repos so custom domains can be swapped without code changes.
 * Fallbacks keep local/CI builds working when a var is unset.
 */

function readPublicEnv(name: string): string {
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

function origin(url: string): string {
  return url.replace(/\/$/, '');
}

/** Workers.dev defaults — overridden by PUBLIC_SITE_URL_* when custom domains arrive. */
export const SISTER_SITE_FALLBACKS = {
  paymentFees: 'https://payment-fee-calculators.hammadiqbal117.workers.dev',
  businessDocs: 'https://business-document-generators.hammadiqbal117.workers.dev',
  homeGarden: 'https://home-garden-calculators.hammadiqbal117.workers.dev',
  fiberArts: 'https://fiber-arts-calculators.hammadiqbal117.workers.dev',
  pet: 'https://pet-calculators.hammadiqbal117.workers.dev',
} as const;

export type SisterSiteKey = keyof typeof SISTER_SITE_FALLBACKS;

/**
 * Resolved sister-site origins (no trailing slash).
 * Env: PUBLIC_SITE_URL_PAYMENT_FEES | _BUSINESS_DOCS | _HOME_GARDEN | _FIBER_ARTS | _PET
 */
export const sisterSiteOrigins = {
  paymentFees: origin(
    readPublicEnv('PUBLIC_SITE_URL_PAYMENT_FEES') || SISTER_SITE_FALLBACKS.paymentFees,
  ),
  businessDocs: origin(
    readPublicEnv('PUBLIC_SITE_URL_BUSINESS_DOCS') || SISTER_SITE_FALLBACKS.businessDocs,
  ),
  homeGarden: origin(
    readPublicEnv('PUBLIC_SITE_URL_HOME_GARDEN') || SISTER_SITE_FALLBACKS.homeGarden,
  ),
  fiberArts: origin(
    readPublicEnv('PUBLIC_SITE_URL_FIBER_ARTS') || SISTER_SITE_FALLBACKS.fiberArts,
  ),
  pet: origin(readPublicEnv('PUBLIC_SITE_URL_PET') || SISTER_SITE_FALLBACKS.pet),
} as const;

export type SisterSiteMeta = {
  key: SisterSiteKey;
  /** Stable id used in filters (repo / workers name lineage) */
  id: string;
  name: string;
  label: string;
  path: string;
  /** Absolute origin from env (or fallback) */
  origin: string;
};

/** Display list for /about/ (and any future topical cross-links). */
export const sisterSites: SisterSiteMeta[] = [
  {
    key: 'paymentFees',
    id: 'payment-fee-calculators',
    name: 'FeeCalc',
    label: 'Payment fee calculators',
    path: '/',
    origin: sisterSiteOrigins.paymentFees,
  },
  {
    key: 'businessDocs',
    id: 'business-document-generators',
    name: 'DocuForge Tools',
    label: 'Business document generators',
    path: '/',
    origin: sisterSiteOrigins.businessDocs,
  },
  {
    key: 'homeGarden',
    id: 'home-garden-calculators',
    name: 'YardCalc',
    label: 'Home & garden calculators',
    path: '/',
    origin: sisterSiteOrigins.homeGarden,
  },
  {
    key: 'fiberArts',
    id: 'fiber-arts-calculators',
    name: 'FiberCalc',
    label: 'Fiber arts calculators',
    path: '/',
    origin: sisterSiteOrigins.fiberArts,
  },
  {
    key: 'pet',
    id: 'pet-calculators',
    name: 'PetCalc Tools',
    label: 'Pet calculators',
    path: '/',
    origin: sisterSiteOrigins.pet,
  },
];

/** Absolute URL on a sister site (path defaults to `/`). */
export function sisterSiteUrl(key: SisterSiteKey, path = '/'): string {
  const base = sisterSiteOrigins[key];
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Look up by legacy workers-style id (`payment-fee-calculators`, …). */
export function sisterSiteById(id: string): SisterSiteMeta | undefined {
  return sisterSites.find((s) => s.id === id);
}
