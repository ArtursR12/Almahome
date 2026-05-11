// Screenshot /admin/parking + /admin/polygons (both tabs).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4329';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const user = process.env.ADMIN_USERNAME ?? 'arturs';
const pass = process.env.ADMIN_PASSWORD ?? 'eqh5ozZvC5Ve4S';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1100 },
  deviceScaleFactor: 1.5,
  httpCredentials: { username: user, password: pass },
});
const page = await ctx.newPage();

await page.goto(`${baseUrl}/admin/parking`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: resolve(outDir, 'admin-parking-list.png'), fullPage: true });
console.log('-> /admin/parking');

await page.goto(`${baseUrl}/admin/polygons`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: resolve(outDir, 'admin-polygons-apartments.png'), fullPage: false });
console.log('-> /admin/polygons (apartments tab)');

await page.click('[data-dataset="parking"]');
await page.waitForTimeout(800);
await page.screenshot({ path: resolve(outDir, 'admin-polygons-parking.png'), fullPage: false });
console.log('-> /admin/polygons (parking tab)');

await browser.close();
