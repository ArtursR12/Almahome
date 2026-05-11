import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4332';
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

// Apartment editor — open one that's reserved/sold so buyer fields appear.
await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
// Click "Rediģēt" on apt 5 (which currently is available with price 141000).
// Use evaluate to find the row by apt number text and trigger its button.
await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li'));
  const target = items.find((li) => li.textContent?.match(/№\s*5\b/) || li.querySelector('div.font-serif.text-2xl')?.textContent?.trim() === '5');
  const btn = target?.querySelector('button');
  btn?.click();
});
await page.waitForTimeout(400);
// Switch to "reserved" in the modal to reveal buyer fields
await page.evaluate(() => {
  const radios = document.querySelectorAll('input[type="radio"][value="reserved"]');
  radios[0]?.click();
});
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(outDir, 'admin-apt-buyer.png'), fullPage: false });
console.log('-> apartment modal w/ buyer fields');

// Close + go to parking
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
await page.goto(`${baseUrl}/admin/parking`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('li'));
  const target = items.find((li) => li.querySelector('div.font-serif.text-2xl')?.textContent?.trim() === '1');
  const btn = target?.querySelector('button');
  btn?.click();
});
await page.waitForTimeout(400);
await page.evaluate(() => {
  const radios = document.querySelectorAll('input[type="radio"][value="sold"]');
  radios[0]?.click();
});
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(outDir, 'admin-parking-buyer.png'), fullPage: false });
console.log('-> parking modal w/ buyer + linked apt');

await browser.close();
