import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const outDir = path.join(process.cwd(), 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { name: 'home-360', url: '/' },
  { name: 'tools-hub-360', url: '/tools/' },
  { name: 'puppy-weight-360', url: '/tools/puppy-weight-calculator/' },
  { name: 'dog-food-360', url: '/tools/dog-food-calculator/' },
  { name: 'cat-age-360', url: '/tools/cat-age-calculator/' },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

for (const p of pages) {
  await page.goto(`${base}${p.url}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, `${p.name}.png`), fullPage: true });
  console.log('wrote', p.name);
}

await browser.close();
