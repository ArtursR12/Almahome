// Histogram all warm colours that aren't cream, find dominant rose tone.
import sharp from 'sharp';
import { resolve } from 'node:path';

const file = resolve(process.argv[2]);
const img = sharp(file);
const { width, height } = await img.metadata();
const raw = await img.raw().toBuffer();
const channels = raw.length / (width * height);

const buckets = new Map();
for (let i = 0; i < raw.length; i += channels) {
  const r = raw[i], g = raw[i + 1], b = raw[i + 2];
  // Pinks: red strongly dominant over both green and blue, channels in mid-bright range.
  if (!(r >= 200 && r <= 250 && g >= 130 && g <= 200 && b >= 130 && b <= 200)) continue;
  if (!(r - g >= 25 && r - b >= 25)) continue;
  // Bucket to 10s.
  const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
  buckets.set(key, (buckets.get(key) || 0) + 1);
}
const sorted = [...buckets].sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log('Top warm tones (rgb : count):');
for (const [k, n] of sorted) console.log(`  rgb(${k})  ×${n}`);
