import type { APIRoute } from 'astro';
import { absoluteUrl, siteConfig } from '../config/site.ts';
import { tools } from '../data/tools.ts';
import { guides } from '../data/guides.ts';

/**
 * Plain link list for AI crawlers. URLs follow `PUBLIC_SITE_URL` / siteConfig.siteUrl.
 * Google Search ignores llms.txt; keep this a simple index, not instruction-shaped text.
 */
export const GET: APIRoute = () => {
  const toolLines = tools.map(
    (t) => `- [${t.title}](${absoluteUrl(`/tools/${t.slug}/`)}): ${t.description}`,
  );
  const guideLines = guides.map(
    (g) => `- [${g.title}](${absoluteUrl(`/guides/${g.slug}/`)}): ${g.description}`,
  );

  const body = [
    `# ${siteConfig.siteName}`,
    '',
    `> ${siteConfig.tagline} Educational only, not veterinary advice.`,
    '',
    '## Calculators',
    ...toolLines,
    '',
    '## Guides',
    ...guideLines,
    '',
    '## Policies',
    `- [Methodology](${absoluteUrl('/methodology/')})`,
    `- [About](${absoluteUrl('/about/')})`,
    `- [Privacy](${absoluteUrl('/privacy/')})`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
