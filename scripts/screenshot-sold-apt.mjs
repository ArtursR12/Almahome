// Verify sold apt detail shows "—" instead of "Pēc pieprasījuma".
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4324';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Sold apts: 3, 10, 18, 19, 24
for (const path of ['/dzivokli/3', '/ru/dzivokli/10', '/en/dzivokli/24', '/dzivokli', '/ru/dzivokli']) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const name = 'sold' + path.replace(/\//g, '_');
  await page.screenshot({ path: resolve(outDir, `${name}.png`), fullPage: false });
  console.log('->', path, 'ok');
}
await browser.close();
