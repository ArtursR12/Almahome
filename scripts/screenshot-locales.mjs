// One-off: snapshot the hero of LV/RU/EN home for visual review.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = 'http://localhost:4321';
const routes = ['/', '/ru', '/en'];
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
for (const route of routes) {
  const url = `${baseUrl}${route}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  const safe = route === '/' ? 'lv' : route.replace(/^\//, '');
  await page.screenshot({ path: resolve(outDir, `hero-${safe}.png`), fullPage: false });
  console.log(`-> ${safe}: ok`);
}
await browser.close();
