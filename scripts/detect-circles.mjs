// Detect numbered apartment circles on a floor plan by HSL saturation.
// Numbered circles are warm rose/peach; everything else (cream, walls, wood)
// is lower saturation or wrong hue.
//
// Output: { width, height, circles: [{cx, cy, r}] } sorted top-to-bottom, left-to-right.

import sharp from 'sharp';
import { resolve } from 'node:path';

const file = resolve(process.argv[2]);
if (!file) { console.error('usage: detect-circles.mjs <png>'); process.exit(1); }

const img = sharp(file);
const { width, height } = await img.metadata();
const raw = await img.raw().toBuffer();
const channels = raw.length / (width * height);

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4;
  }
  return [h * 60, s, l];
}

// Mask: rose ring. Wide thresholds to catch antialiased edges.
const raw0 = new Uint8Array(width * height);
for (let i = 0, p = 0; i < raw.length; i += channels, p++) {
  const r = raw[i], g = raw[i + 1], b = raw[i + 2];
  const [h, s, l] = rgbToHsl(r, g, b);
  if (h >= 6 && h <= 32 && s >= 0.10 && s <= 0.50 && l >= 0.62 && l <= 0.93) raw0[p] = 1;
}

// Dilate 5x5 to merge ring fragments + fill the digit interior.
const mask = new Uint8Array(width * height);
const D = 3;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let any = 0;
    for (let dy = -D; dy <= D && !any; dy++) {
      for (let dx = -D; dx <= D && !any; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (raw0[ny * width + nx]) any = 1;
      }
    }
    mask[y * width + x] = any;
  }
}

// Connected components.
const labels = new Int32Array(width * height);
const blobs = [];
let nextLabel = 0;
const stack = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    if (!mask[idx] || labels[idx]) continue;
    nextLabel++;
    const blob = { n: 0, sx: 0, sy: 0, minX: x, maxX: x, minY: y, maxY: y };
    stack.push(idx);
    labels[idx] = nextLabel;
    while (stack.length) {
      const k = stack.pop();
      const kx = k % width, ky = (k - kx) / width;
      blob.n++; blob.sx += kx; blob.sy += ky;
      if (kx < blob.minX) blob.minX = kx;
      if (kx > blob.maxX) blob.maxX = kx;
      if (ky < blob.minY) blob.minY = ky;
      if (ky > blob.maxY) blob.maxY = ky;
      const ns = [
        kx > 0       ? k - 1     : -1,
        kx < width-1 ? k + 1     : -1,
        ky > 0       ? k - width : -1,
        ky < height-1? k + width : -1,
      ];
      for (const ni of ns) {
        if (ni >= 0 && mask[ni] && !labels[ni]) {
          labels[ni] = nextLabel;
          stack.push(ni);
        }
      }
    }
    blobs.push(blob);
  }
}

// Filter to circle-shaped blobs.
const circles = blobs
  .map((b) => {
    const cx = b.sx / b.n, cy = b.sy / b.n;
    const w = b.maxX - b.minX, h = b.maxY - b.minY;
    const aspect = Math.max(w, h) / Math.max(1, Math.min(w, h));
    return { cx: Math.round(cx), cy: Math.round(cy), r: Math.round((w + h) / 4), aspect, n: b.n };
  })
  // Numbered circles are ~50 px diameter (r ≈ 25), aspect ~1.0, area ~1500-3000.
  .filter((c) => c.n >= 1000 && c.n <= 4000 && c.aspect <= 1.35 && c.r >= 20 && c.r <= 35);

console.log(`Total blobs: ${blobs.length}`);
console.log(`Pre-filter top 20 by size:`);
[...blobs].sort((a, b) => b.n - a.n).slice(0, 20).forEach((b) => {
  const cx = Math.round(b.sx / b.n), cy = Math.round(b.sy / b.n);
  const w = b.maxX - b.minX, h = b.maxY - b.minY;
  const aspect = (Math.max(w, h) / Math.max(1, Math.min(w, h))).toFixed(2);
  console.log(`  n=${String(b.n).padStart(5)}  cx=${String(cx).padStart(4)} cy=${String(cy).padStart(3)} w=${w} h=${h} aspect=${aspect}`);
});
const top = [...circles].sort((a, b) => b.n - a.n);
console.log(`\nFiltered: ${circles.length}`);
console.log(JSON.stringify(top.slice(0, 16), null, 2));
