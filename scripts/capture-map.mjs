// One-time capture of an OSM map view for AlmaHome.
// Run after relocating the building or changing the framing:
//   pnpm exec node scripts/capture-map.mjs
// Output: public/images/maps/almahome-map.jpg (committed; served as a static asset)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Geocoded via Nominatim — Mores iela 15, Aplokciems / Mīlgrāvis, Rīga.
const BBOX = '24.1194,57.0107,24.1634,57.0327';
const MARKER = '57.0217,24.1414';
const url = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(BBOX)}&layer=mapnik&marker=${encodeURIComponent(MARKER)}`;
const outDir = resolve('public/images/maps');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 700 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

page.on('requestfailed', (req) => {
  if (req.url().includes('tile.openstreetmap')) console.log('  tile FAILED:', req.url(), req.failure()?.errorText);
});
page.on('response', (res) => {
  if (res.url().includes('tile.openstreetmap')) console.log('  tile', res.status(), res.url());
});

console.log('-> loading', url);
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(15000);

const tileCount = await page.evaluate(() => document.querySelectorAll('.leaflet-tile-loaded').length);
console.log('-> tiles loaded:', tileCount);

// Hide leaflet zoom controls + attribution for a cleaner final image; keep marker.
await page.addStyleTag({
  content: `
    .leaflet-control-zoom { display: none !important; }
    .leaflet-control-attribution { font-size: 11px !important; opacity: 0.85; }
  `,
});

const out = resolve(outDir, 'almahome-map.jpg');
await page.screenshot({ path: out, type: 'jpeg', quality: 88, fullPage: false });
console.log('-> saved', out);
await browser.close();
