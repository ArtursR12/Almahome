// Sample known-circle pixels from a plan to find the right color band.
import sharp from 'sharp';
import { resolve } from 'node:path';

const file = resolve(process.argv[2]);
const img = sharp(file);
const { width, height } = await img.metadata();
const raw = await img.raw().toBuffer();
const channels = raw.length / (width * height);

// Spot-check the rough centers of each numbered circle on floor-2 (estimated
// by eye from the 1212x854 image). These should land inside the rose ring.
const probes = [
  ['12', 400, 330],
  ['13', 610, 260],
  ['14', 870, 330],
  ['11', 210, 390],
  ['10', 180, 590],
  ['9',  430, 540],
  ['16', 740, 540],
  ['15', 970, 470],
];

const sample = (x, y) => {
  const i = (y * width + x) * channels;
  return [raw[i], raw[i + 1], raw[i + 2]];
};

for (const [label, x, y] of probes) {
  // Sample a 5x5 block around the probe.
  const samples = [];
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    samples.push(sample(x + dx, y + dy));
  }
  const avg = samples.reduce((a, p) => [a[0]+p[0], a[1]+p[1], a[2]+p[2]], [0,0,0]).map((v) => Math.round(v / samples.length));
  console.log(`#${label.padEnd(2)} at (${x},${y})  →  rgb(${avg.join(', ')})`);
}
