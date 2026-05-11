// Capture apartment detail form on LV/RU/EN with the new parking select.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4330';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

for (const [path, name] of [['/dzivokli/2', 'lv'], ['/ru/dzivokli/2', 'ru'], ['/en/dzivokli/2', 'en']]) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  // Scroll to inquiry form
  await page.evaluate(() => {
    document.getElementById('pieteikuma-forma')?.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(outDir, `apt2-form-${name}.png`), fullPage: false });
  console.log('->', path);
}

// Open select on LV to see options
await page.goto(`${baseUrl}/dzivokli/2`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.evaluate(() => document.getElementById('pieteikuma-forma')?.scrollIntoView({ block: 'start' }));
await page.waitForTimeout(300);
// Pick spot 5 to show selected state
await page.selectOption('#cf-parking-spot', '5');
await page.waitForTimeout(200);
await page.screenshot({ path: resolve(outDir, 'apt2-form-lv-spot-selected.png'), fullPage: false });
console.log('-> spot selected');

await browser.close();
