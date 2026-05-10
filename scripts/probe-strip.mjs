// Scan a horizontal strip through known circle positions and dump unique colours.
import sharp from 'sharp';
import { resolve } from 'node:path';

const file = resolve(process.argv[2]);
const img = sharp(file);
const { width, height } = await img.metadata();
const raw = await img.raw().toBuffer();
const channels = raw.length / (width * height);

// Strip y rows: pick a few y-bands likely covering circle centres.
const yBands = [180, 240, 320, 380, 460, 540, 620];

for (const y of yBands) {
  const rowSeen = new Map();
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    // Pinkish ring: red dominant, R-B differential ≥ 15, all > 150.
    if (r > 180 && r > g + 8 && r - b > 15 && g > 130 && b > 110) {
      const key = `${Math.round(r/5)*5},${Math.round(g/5)*5},${Math.round(b/5)*5}`;
      rowSeen.set(key, (rowSeen.get(key) || 0) + 1);
    }
  }
  const top = [...rowSeen].sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(`y=${y}:`, top.map(([k, n]) => `rgb(${k})×${n}`).join('  '));
}
