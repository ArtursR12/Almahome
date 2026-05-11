// One-off: load /admin/polygons with basic auth, screenshot the editor.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4322';
const user = process.env.ADMIN_USERNAME ?? 'arturs';
const pass = process.env.ADMIN_PASSWORD ?? 'eqh5ozZvC5Ve4S';

const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  deviceScaleFactor: 2,
  httpCredentials: { username: user, password: pass },
});
const page = await context.newPage();
await page.goto(`${baseUrl}/admin/polygons`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1000);

// Initial state
await page.screenshot({ path: resolve(outDir, 'admin-polygons-1-initial.png'), fullPage: false });
console.log('-> initial: ok');

// Click polygon 5 to select it
const svg = await page.$('#editor-svg');
const box = await svg.boundingBox();
// Polygon 5 centroid ≈ (650, 250) in viewBox 1212×854.
const vbW = 1212, vbH = 854;
const xRatio = box.width / vbW, yRatio = box.height / vbH;
await page.mouse.click(box.x + 650 * xRatio, box.y + 250 * yRatio);
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(outDir, 'admin-polygons-2-selected.png'), fullPage: false });
console.log('-> selected: ok');

// Switch to floor 2
await page.click('[data-floor-tab="1"]');
await page.waitForTimeout(400);
await page.screenshot({ path: resolve(outDir, 'admin-polygons-3-floor2.png'), fullPage: false });
console.log('-> floor 2: ok');

await browser.close();
