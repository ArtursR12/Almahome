import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4326';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
for (const [path, name] of [['/par-namu', 'lv'], ['/ru/par-namu', 'ru'], ['/en/par-namu', 'en']]) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2')).find(el => /Premium|премиум|Материалы|finishes/i.test(el.textContent || ''));
    h?.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(outDir, `materials-${name}.png`), fullPage: false });
  console.log('->', path);
}
await browser.close();
