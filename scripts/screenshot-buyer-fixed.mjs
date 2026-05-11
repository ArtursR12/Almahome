import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4333';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const user = process.env.ADMIN_USERNAME ?? 'arturs';
const pass = process.env.ADMIN_PASSWORD ?? 'eqh5ozZvC5Ve4S';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 1100 },
  httpCredentials: { username: user, password: pass },
});
const page = await ctx.newPage();

// Apartment editor opened on a still-available apt — buyer fields should now show.
await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li'));
  const target = items.find((li) => li.querySelector('div.font-serif.text-2xl')?.textContent?.trim() === '1');
  const btn = target?.querySelector('button');
  btn?.click();
});
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(outDir, 'admin-apt-available-buyer.png'), fullPage: false });
console.log('-> apt available (buyer fields visible)');

await browser.close();
