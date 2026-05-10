// Save a debug image showing where the rose-mask pixels are.
import sharp from 'sharp';
import { resolve } from 'node:path';

const file = resolve(process.argv[2]);
const out = process.argv[3] ?? 'public/images/floor-plans/_debug-mask.png';
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

// Output: 3-channel RGB. Mask pixels = magenta, others = greyscale of original.
const out3 = Buffer.alloc(width * height * 3);
let masked = 0;
for (let i = 0, p = 0; i < raw.length; i += channels, p++) {
  const r = raw[i], g = raw[i + 1], b = raw[i + 2];
  const [h, s, l] = rgbToHsl(r, g, b);
  // Try widest threshold first.
  const ok = h >= 8 && h <= 28 && s >= 0.12 && s <= 0.45 && l >= 0.65 && l <= 0.92;
  if (ok) {
    out3[p*3] = 255; out3[p*3+1] = 0; out3[p*3+2] = 255;
    masked++;
  } else {
    const grey = Math.round(0.299*r + 0.587*g + 0.114*b);
    out3[p*3] = grey; out3[p*3+1] = grey; out3[p*3+2] = grey;
  }
}
await sharp(out3, { raw: { width, height, channels: 3 } }).png().toFile(out);
console.log(`mask pixels: ${masked} / ${width*height}; saved ${out}`);
