#!/usr/bin/env node
/**
 * Build-time per-page OG images (1200×630 PNG) with zero npm deps beyond Node.
 * Writes public/og/<type>-<slug>.png for every tool and guide in the registries.
 * Safe to re-run; overwrites in place. Invoked from `npm run build` before Astro.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'og');

const W = 1200;
const H = 630;
const BG = [31, 107, 74]; // brand green #1f6b4a
const FG = [255, 255, 255];
const ACCENT = [232, 245, 238];

/** Tiny 5×7 glyphs for A-Z, 0-9, and a few punctuation marks (uppercase only). */
const FONT = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0e],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0e, 0x11, 0x10, 0x0e, 0x01, 0x11, 0x0e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x0e, 0x11, 0x01, 0x06, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  '&': [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  ':': [0x00, 0x04, 0x00, 0x00, 0x00, 0x04, 0x00],
  '/': [0x01, 0x02, 0x04, 0x04, 0x08, 0x10, 0x10],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  ',': [0x00, 0x00, 0x00, 0x00, 0x0c, 0x04, 0x08],
  "'": [0x0c, 0x08, 0x10, 0x00, 0x00, 0x00, 0x00],
};

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function setPx(raw, x, y, rgb) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = y * (W * 3 + 1) + 1 + x * 3;
  raw[i] = rgb[0];
  raw[i + 1] = rgb[1];
  raw[i + 2] = rgb[2];
}

function fillRect(raw, x0, y0, w, h, rgb) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) setPx(raw, x, y, rgb);
  }
}

function drawChar(raw, ch, x, y, scale, rgb) {
  const g = FONT[ch] || FONT['?'];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (g[row] & (1 << (4 - col))) {
        fillRect(raw, x + col * scale, y + row * scale, scale, scale, rgb);
      }
    }
  }
}

function wrapWords(text, maxChars) {
  const words = text.toUpperCase().replace(/[^A-Z0-9 &\-?!:/.,']/g, ' ').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function drawText(raw, lines, startY, scale, rgb) {
  const charW = 6 * scale;
  let y = startY;
  for (const line of lines) {
    const width = line.length * charW;
    let x = Math.floor((W - width) / 2);
    for (const ch of line) {
      drawChar(raw, ch, x, y, scale, rgb);
      x += charW;
    }
    y += 8 * scale + 8;
  }
}

function encodePng(raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeImage(brand, title) {
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const i = y * (W * 3 + 1) + 1 + x * 3;
      raw[i] = BG[0];
      raw[i + 1] = BG[1];
      raw[i + 2] = BG[2];
    }
  }
  fillRect(raw, 0, 0, W, 18, ACCENT);
  fillRect(raw, 0, H - 18, W, 18, ACCENT);
  drawText(raw, [brand.toUpperCase()], 72, 5, ACCENT);
  drawText(raw, wrapWords(title, 28), 200, 6, FG);
  return encodePng(raw);
}

function parseRegistry(file, kind) {
  const src = fs.readFileSync(file, 'utf8');
  const items = [];
  const re =
    kind === 'tool'
      ? /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'/g
      : /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    items.push({ slug: m[1], title: m[2] });
  }
  return items;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const tools = parseRegistry(path.join(ROOT, 'src/data/tools.ts'), 'tool');
const guides = parseRegistry(path.join(ROOT, 'src/data/guides.ts'), 'guide');
const brand = 'PetCalc Tools';

let n = 0;
for (const t of tools) {
  const file = path.join(OUT_DIR, `tool-${t.slug}.png`);
  fs.writeFileSync(file, makeImage(brand, t.title));
  n++;
}
for (const g of guides) {
  const file = path.join(OUT_DIR, `guide-${g.slug}.png`);
  fs.writeFileSync(file, makeImage(brand, g.title));
  n++;
}

// Default fallback used by hubs/trust pages
fs.writeFileSync(path.join(OUT_DIR, 'default.png'), makeImage(brand, 'Free dog and cat calculators'));
n++;

console.log(`generate-og: wrote ${n} PNG(s) to public/og/`);
