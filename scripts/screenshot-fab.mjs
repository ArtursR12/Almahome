import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4327';
const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

// Desktop
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desk.newPage();
for (const [path, name] of [['/', 'home'], ['/dzivokli', 'list'], ['/dzivokli/2', 'detail']]) {
  await dp.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await dp.waitForTimeout(400);
  await dp.screenshot({ path: resolve(outDir, `fab-desk-${name}.png`), fullPage: false });
  console.log('desk ->', path);
}
// Hover on FAB to capture tooltip
await dp.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
await dp.waitForTimeout(300);
await dp.hover('a[data-fc-key="whatsapp"]');
await dp.waitForTimeout(300);
await dp.screenshot({ path: resolve(outDir, 'fab-desk-hover.png'), fullPage: false });
console.log('desk -> hover');
await desk.close();

// Mobile
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const mp = await mob.newPage();
await mp.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(400);
await mp.screenshot({ path: resolve(outDir, 'fab-mobile-home.png'), fullPage: false });
console.log('mobile -> home');
await mob.close();

await browser.close();
