import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site.ts';

/** Explicit allow groups for search + AI answer bots (siblings parity; not only *). */
const searchBots = [
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',
  'Applebot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Claude-SearchBot',
];

const trainingBots = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Bytespider'];

export const GET: APIRoute = () => {
  const lines: string[] = [
    '# Search and answer-engine crawlers are welcome. Embed pages carry a noindex meta tag,',
    '# so they are left crawlable so that the tag can be read.',
    '',
    ...searchBots.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    'User-agent: *',
    'Allow: /',
    '',
    '# AI training crawlers: uncomment a block to opt out of model training.',
    ...trainingBots.flatMap((bot) => [`# User-agent: ${bot}`, '# Disallow: /', '#']),
    '',
    `Sitemap: ${absoluteUrl('/sitemap-index.xml')}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
