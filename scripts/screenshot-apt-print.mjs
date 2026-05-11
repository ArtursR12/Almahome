// Verify the print button + print stylesheet on apt detail.
// Screenshot screen view + emulated print-media for an apartment in each locale.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4323';
const targets = [
  { name: 'lv-apt-2', url: '/dzivokli/2' },
  { name: 'ru-apt-2', url: '/ru/dzivokli/2' },
  { name: 'en-apt-2', url: '/en/dzivokli/2' },
];

const outDir = resolve('screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();

for (const t of targets) {
  await page.goto(`${baseUrl}${t.url}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(400);

  // Screen view: scroll to the plan area so the button is visible
  await page.evaluate(() => {
    const btn = document.querySelector('button.js-print-plan');
    btn?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: resolve(outDir, `${t.name}-screen.png`), fullPage: false });

  // Emulate print and capture
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(outDir, `${t.name}-print.png`), fullPage: true });
  await page.emulateMedia({ media: 'screen' });
  console.log(`-> ${t.name}: ok`);
}

await browser.close();
