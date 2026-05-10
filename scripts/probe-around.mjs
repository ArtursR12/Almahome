// Probe a 50x50 region around a guessed circle center: find dominant color.
import sharp from 'sharp';
import { resolve } from 'node:path';

const file = resolve(process.argv[2]);
const cx = parseInt(process.argv[3]);
const cy = parseInt(process.argv[4]);
const img = sharp(file);
const { width, height } = await img.metadata();
const raw = await img.raw().toBuffer();
const channels = raw.length / (width * height);

const buckets = new Map();
for (let dy = -25; dy <= 25; dy++) {
  for (let dx = -25; dx <= 25; dx++) {
    const x = cx + dx, y = cy + dy;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const i = (y * width + x) * channels;
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    const key = `${Math.round(r/5)*5},${Math.round(g/5)*5},${Math.round(b/5)*5}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
}
const sorted = [...buckets].sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log(`50x50 around (${cx},${cy}):`);
for (const [k, n] of sorted) console.log(`  rgb(${k})  ×${n}`);
