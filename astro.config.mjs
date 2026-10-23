// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { FALLBACK_SITE_URL, siteConfig } from './src/config/site.ts';

/** Canonical origin: PUBLIC_SITE_URL wins; otherwise siteConfig / FALLBACK_SITE_URL. */
const siteOrigin = (
  (typeof process !== 'undefined' && process.env.PUBLIC_SITE_URL) ||
  siteConfig.siteUrl ||
  FALLBACK_SITE_URL
).replace(/\/$/, '');

export default defineConfig({
  site: siteOrigin,
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/embed/'),
      serialize(item) {
        return {
          url: item.url,
          lastmod: siteConfig.buildDate,
        };
      },
    }),
  ],
});
