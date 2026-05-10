// Overlay detected circle centers on the floor plan image and save as PNG.
import sharp from 'sharp';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const file = resolve(process.argv[2]);
const out = process.argv[3] ?? 'public/images/floor-plans/_detections.png';

// Run detect-circles.mjs and parse the blob list.
const stdout = execSync(`node scripts/detect-circles.mjs ${file}`, { encoding: 'utf-8' });
const jsonStart = stdout.indexOf('[\n  {');
const blobs = JSON.parse(stdout.slice(jsonStart));
console.log(`Detected ${blobs.length} candidate circles`);

const { width, height } = await sharp(file).metadata();

// Build SVG overlay.
const svgParts = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
];
blobs.forEach((c, i) => {
  svgParts.push(
    `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r + 5}" fill="none" stroke="magenta" stroke-width="3"/>`,
    `<text x="${c.cx}" y="${c.cy + 6}" font-size="20" font-family="Arial" font-weight="bold" fill="magenta" text-anchor="middle">${i + 1}</text>`,
  );
});
svgParts.push('</svg>');

const overlay = Buffer.from(svgParts.join(''));
await sharp(file).composite([{ input: overlay, top: 0, left: 0 }]).png().toFile(out);
console.log(`Saved ${out}`);
