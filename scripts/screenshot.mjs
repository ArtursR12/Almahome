// Snapshot a list of routes at desktop + mobile widths.
// Usage: node scripts/screenshot.mjs [baseUrl]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4321';
const routes = ['/', '/par-namu', '/par-projektu', '/atteli', '/kontakti', '/dzivokli', '/dzivokli/2', '/apdares'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
];

const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    process.stdout.write(`-> ${vp.name.padEnd(7)} ${url} ... `);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Iframes (Google/OSM map) load in their own context, networkidle on the
      // parent page returns before they paint. Sleep long enough for tiles.
      const hasIframe = /par-projektu|kontakti/.test(route);
      await page.waitForTimeout(hasIframe ? 5000 : 600);
      const safe = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
      const path = resolve(outDir, `${safe}-${vp.name}.png`);
      await page.screenshot({ path, fullPage: true });
      console.log('ok');
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
    }
  }
  await context.close();
}
await browser.close();
console.log(`\nWrote screenshots to ${outDir}`);
