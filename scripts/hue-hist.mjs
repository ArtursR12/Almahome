import sharp from 'sharp';
import { resolve } from 'node:path';

const file = resolve(process.argv[2]);
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

const hueHist = new Array(36).fill(0);
let saturatedTotal = 0;
for (let i = 0; i < raw.length; i += channels) {
  const r = raw[i], g = raw[i + 1], b = raw[i + 2];
  const [h, s, l] = rgbToHsl(r, g, b);
  if (s >= 0.10 && l >= 0.5 && l <= 0.9) {
    hueHist[Math.floor(h / 10)]++;
    saturatedTotal++;
  }
}
console.log(`Saturated mid-light pixels: ${saturatedTotal}`);
hueHist.forEach((n, i) => {
  const pct = (n / saturatedTotal * 100).toFixed(1);
  console.log(`H ${String(i*10).padStart(3)}–${String(i*10+10).padStart(3)}°  ${String(n).padStart(6)}  ${'█'.repeat(Math.round(parseFloat(pct)/2))} ${pct}%`);
});
