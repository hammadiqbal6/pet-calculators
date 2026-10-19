// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/config/site.ts';

export default defineConfig({
  site: siteConfig.siteUrl,
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
