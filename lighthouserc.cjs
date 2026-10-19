/**
 * Lighthouse CI (mobile). Run with: npm run build && npm run lhci
 *
 * Lighthouse defaults to the mobile emulation preset (Moto G Power class device, simulated slow 4G
 * and 4x CPU slowdown), which is the profile we budget against. Lab TBT stands in for INP
 * (docs/SEO-PLAYBOOK.md section 2). Core Web Vitals targets: LCP <= 2.5 s, CLS <= 0.1, INP <= 200 ms.
 *
 * Pages are served from ./dist by LHCI's static server, so no dev server is needed. The sample covers
 * every template: home, hubs, a dog tool, a cat tool, a guide, and the privacy page.
 * Add one URL per new template (not per new tool).
 */
const urls = [
  '/',
  '/tools/',
  '/tools/puppy-weight-calculator/',
  '/tools/dog-food-calculator/',
  '/tools/cat-age-calculator/',
  '/tools/dog-chocolate-toxicity-calculator/',
  '/guides/when-do-puppies-stop-growing/',
  '/privacy/',
];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: urls.map((u) => `http://localhost${u}`),
      numberOfRuns: 3,
      settings: {
        formFactor: 'mobile',
        chromeFlags: '--no-sandbox --headless=new',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'pessimistic' }],
        'categories:best-practices': ['warn', { minScore: 0.9, aggregationMethod: 'median-run' }],
        'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'pessimistic' }],

        'largest-contentful-paint': ['error', { maxNumericValue: 2000, aggregationMethod: 'median-run' }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05, aggregationMethod: 'pessimistic' }],
        'total-blocking-time': ['error', { maxNumericValue: 150, aggregationMethod: 'median-run' }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800, aggregationMethod: 'median-run' }],
        'speed-index': ['warn', { maxNumericValue: 3400, aggregationMethod: 'median-run' }],
        interactive: ['warn', { maxNumericValue: 3800, aggregationMethod: 'median-run' }],
        'server-response-time': ['warn', { maxNumericValue: 600 }],

        'resource-summary:script:size': ['error', { maxNumericValue: 60000 }],
        'resource-summary:total:size': ['warn', { maxNumericValue: 400000 }],
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 6 }],
        'dom-size': ['warn', { maxNumericValue: 1500 }],

        'is-crawlable': 'error',
        'document-title': 'error',
        'meta-description': 'error',
        canonical: 'error',
        'link-text': 'error',
        'image-alt': 'error',
        'color-contrast': 'error',
        viewport: 'error',
        'uses-text-compression': 'warn',
        'uses-responsive-images': 'warn',
        'unsized-images': 'warn',
        'font-display': 'warn',
        'render-blocking-resources': 'warn',
        'unused-javascript': 'warn',
        'errors-in-console': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
