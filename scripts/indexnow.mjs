#!/usr/bin/env node
/**
 * Ping IndexNow with every URL from the built sitemap(s) in dist/.
 *
 * Never fails the build or deploy: all errors are caught and the process
 * exits 0. Skip with INDEXNOW_DISABLE=1. Override the key with INDEXNOW_KEY.
 * Pass --dry-run to print the URL count and payload without POSTing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_KEY = '6a232080046a9576fef903fc8f5b8279';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 10_000;
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

function log(...args) {
  console.log('[indexnow]', ...args);
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const url = m[1].trim();
    if (url) locs.push(url);
  }
  return locs;
}

function readXml(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function collectUrlsFromSitemap() {
  const indexPath = path.join(DIST, 'sitemap-index.xml');
  const urls = new Set();

  if (fs.existsSync(indexPath)) {
    const indexXml = readXml(indexPath);
    const childLocs = extractLocs(indexXml);
    for (const childUrl of childLocs) {
      let childName;
      try {
        childName = path.basename(new URL(childUrl).pathname);
      } catch {
        childName = path.basename(childUrl);
      }
      const childPath = path.join(DIST, childName);
      if (!fs.existsSync(childPath)) {
        log(`warning: child sitemap missing in dist/: ${childName}`);
        continue;
      }
      for (const loc of extractLocs(readXml(childPath))) urls.add(loc);
    }
    return [...urls];
  }

  // Fallback: single sitemap.xml or sitemap-0.xml without an index
  for (const name of ['sitemap.xml', 'sitemap-0.xml']) {
    const p = path.join(DIST, name);
    if (fs.existsSync(p)) {
      for (const loc of extractLocs(readXml(p))) urls.add(loc);
    }
  }
  return [...urls];
}

function resolveSiteOrigin(urlList) {
  const fromEnv = (process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (urlList.length > 0) {
    try {
      const u = new URL(urlList[0]);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* ignore */
    }
  }
  return '';
}

async function postBatch(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const text = await res.text().catch(() => '');
  log(`HTTP ${res.status}${text ? ` — ${text.slice(0, 200)}` : ''}`);
  return res.status;
}

async function main() {
  if (process.env.INDEXNOW_DISABLE === '1') {
    log('skipped (INDEXNOW_DISABLE=1)');
    return;
  }

  const dryRun = process.argv.includes('--dry-run');
  const key = (process.env.INDEXNOW_KEY || DEFAULT_KEY).trim();
  if (!key) {
    log('no key; nothing to do');
    return;
  }

  if (!fs.existsSync(DIST)) {
    log(`dist/ not found at ${DIST}; run npm run build first`);
    return;
  }

  const urlList = collectUrlsFromSitemap();
  if (urlList.length === 0) {
    log('no <loc> URLs found in dist/ sitemaps');
    return;
  }

  const siteOrigin = resolveSiteOrigin(urlList);
  if (!siteOrigin) {
    log('could not resolve site origin (set PUBLIC_SITE_URL)');
    return;
  }

  let host;
  try {
    host = new URL(siteOrigin).host;
  } catch {
    log(`invalid site origin: ${siteOrigin}`);
    return;
  }

  const keyLocation = `${siteOrigin}/${key}.txt`;
  log(`${urlList.length} URL(s) from sitemap; host=${host}`);

  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    const batch = urlList.slice(i, i + BATCH_SIZE);
    const payload = { host, key, keyLocation, urlList: batch };
    const batchLabel = `${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(urlList.length / BATCH_SIZE)}`;

    if (dryRun) {
      log(`dry-run batch ${batchLabel}: ${batch.length} URL(s)`);
      log(JSON.stringify(payload, null, 2));
      continue;
    }

    log(`posting batch ${batchLabel}: ${batch.length} URL(s)`);
    await postBatch(payload);
  }

  if (dryRun) log('dry-run complete (nothing posted)');
}

main()
  .catch((err) => {
    log('error (ignored):', err?.message || err);
  })
  .finally(() => {
    process.exit(0);
  });
