#!/usr/bin/env node
/**
 * Fail if built HTML glues a word directly to an <a> (missing space before/after links).
 * Catches Astro newline-whitespace collapse: "use the" + "\n" + "<a" → "use thedog".
 *
 * Usage: node scripts/audit/link-spaces.mjs   (expects dist/ from npm run build)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = process.env.AUDIT_DIST
  ? path.resolve(process.env.AUDIT_DIST)
  : path.join(ROOT, 'dist');

const BEFORE = /[A-Za-z0-9,.]<a\s/g;
const AFTER = /<\/a>[A-Za-z0-9]/g;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(DIST);
if (!files.length) {
  console.error(`link-spaces: no HTML under ${DIST} — run npm run build first`);
  process.exit(1);
}

let errors = 0;
const findings = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  // Ignore script/style blocks for the AFTER pattern noise
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const route = '/' + path.relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');

  for (const m of body.matchAll(BEFORE)) {
    errors += 1;
    const start = Math.max(0, m.index - 40);
    const snippet = body.slice(start, m.index + 60).replace(/\s+/g, ' ');
    findings.push({ route, kind: 'before', snippet });
  }
  for (const m of body.matchAll(AFTER)) {
    errors += 1;
    const start = Math.max(0, m.index - 40);
    const snippet = body.slice(start, m.index + 60).replace(/\s+/g, ' ');
    findings.push({ route, kind: 'after', snippet });
  }
}

if (errors) {
  console.error(`link-spaces: ${errors} glued link(s) in ${DIST}`);
  for (const f of findings.slice(0, 40)) {
    console.error(`  [${f.kind}] ${f.route}: …${f.snippet}…`);
  }
  if (findings.length > 40) console.error(`  …and ${findings.length - 40} more`);
  process.exit(1);
}

console.log(`link-spaces: ok (${files.length} HTML files, 0 glued links)`);
