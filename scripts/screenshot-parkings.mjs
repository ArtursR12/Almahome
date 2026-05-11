import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4328';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const [path, name] of [['/parkings', 'lv'], ['/ru/parkings', 'ru'], ['/en/parkings', 'en']]) {
  const res = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  console.log('->', path, res?.status());
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(outDir, `parkings-${name}.png`), fullPage: true });
}
// Also screenshot /dzivokli teaser link
await page.goto(`${baseUrl}/dzivokli`, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  const h = Array.from(document.querySelectorAll('h2')).find((el) => /Autostāv|Парк|Parking/i.test(el.textContent ?? ''));
  h?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(outDir, 'dzivokli-parking-teaser.png'), fullPage: false });
console.log('-> /dzivokli teaser');

await browser.close();
