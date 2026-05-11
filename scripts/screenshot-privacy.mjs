// Snapshot the new privacy policy pages.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4325';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const [path, name] of [['/privatums', 'lv'], ['/ru/privatums', 'ru'], ['/en/privatums', 'en']]) {
  const res = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  console.log('->', path, res?.status());
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(outDir, `privacy-${name}.png`), fullPage: true });
}
await browser.close();
