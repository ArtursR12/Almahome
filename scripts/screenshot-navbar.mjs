import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4331';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

for (const [w, h, name] of [[1440, 200, 'desktop'], [1280, 200, 'lg'], [1024, 200, 'lg-min']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}/parkings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(outDir, `navbar-${name}-${w}.png`), clip: { x: 0, y: 0, width: w, height: 100 } });
  await ctx.close();
  console.log('->', name, w);
}

// RU header
const ctxRu = await browser.newContext({ viewport: { width: 1440, height: 200 } });
const pageRu = await ctxRu.newPage();
await pageRu.goto(`${baseUrl}/ru/parkings`, { waitUntil: 'networkidle' });
await pageRu.waitForTimeout(400);
await pageRu.screenshot({ path: resolve(outDir, 'navbar-ru.png'), clip: { x: 0, y: 0, width: 1440, height: 100 } });
console.log('-> ru');

await browser.close();
