// One-off cleanup: apt-06/13/14/21/22 locator JPGs include leftover
// "Balkons / Kopā ..." text rows above the site plan, baked in when they were
// exported. We crop the text strip off the top and pad the bottom with the
// matching background gray so the image keeps the same 600x369 dimensions and
// the site plan visually matches the other locators.
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public', 'images', 'floor-plans');
const reference = 'apt-01-locator.jpg'; // known-good locator
const targets = [
  'apt-06-locator.jpg',
  'apt-13-locator.jpg',
  'apt-14-locator.jpg',
  'apt-21-locator.jpg',
  'apt-22-locator.jpg',
];

// The building footprint is filled with near-white cream (~R238/G237/B232).
// Text rows above the plan are grayer (R<200) so we tighten the filter to
// only the real beige and require a long contiguous run per row to avoid
// catching anti-aliased speckles inside text glyphs.
function isCream(r, g, b) {
  return r > 230 && g > 225 && b > 218 && b < 240 && r >= b;
}

async function topCreamRow(filePath) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const xStart = Math.floor(w * 0.20);
  const xEnd = Math.floor(w * 0.80);
  for (let y = 0; y < h; y++) {
    let run = 0, best = 0;
    for (let x = xStart; x < xEnd; x++) {
      const i = (y * w + x) * ch;
      if (isCream(data[i], data[i + 1], data[i + 2])) {
        run++;
        if (run > best) best = run;
      } else {
        run = 0;
      }
    }
    if (best >= 20) return y;
  }
  return -1;
}

async function bgColor(filePath) {
  // Top-right corner; the affected images keep this corner free of text.
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const idx = (5 * info.width + (info.width - 5)) * info.channels;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
}

// The "Kopā ..." / "Balkons ..." overlay sits hugging the LEFT and RIGHT
// edges of the image — the centered "Čiekuru iela" street label and the
// diagonal property line sit elsewhere. Scan only the outer 25% strips so
// we catch the overlay text without misidentifying the legitimate label.
async function lastTextRow(filePath, bg) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, ch = info.channels;
  const limit = Math.floor(info.height * 0.22);
  const leftEnd = Math.floor(w * 0.25);
  const rightStart = Math.floor(w * 0.75);
  const MIN_PER_STRIP = 10;
  let last = -1;
  for (let y = 0; y < limit; y++) {
    let left = 0, right = 0;
    for (let x = 0; x < leftEnd; x++) {
      const i = (y * w + x) * ch;
      const d = Math.abs(data[i] - bg.r) + Math.abs(data[i + 1] - bg.g) + Math.abs(data[i + 2] - bg.b);
      if (d > 30) left++;
    }
    for (let x = rightStart; x < w; x++) {
      const i = (y * w + x) * ch;
      const d = Math.abs(data[i] - bg.r) + Math.abs(data[i + 1] - bg.g) + Math.abs(data[i + 2] - bg.b);
      if (d > 30) right++;
    }
    if (left >= MIN_PER_STRIP || right >= MIN_PER_STRIP) last = y;
  }
  return last;
}

async function main() {
  const refPath = path.join(dir, reference);
  const refTop = await topCreamRow(refPath);
  console.log(`reference ${reference}: cream starts at y=${refTop}`);
  const fs = await import('node:fs/promises');

  for (const name of targets) {
    const p = path.join(dir, name);
    const bg = await bgColor(p);
    const top = await topCreamRow(p);
    const textBottom = await lastTextRow(p, bg);
    const shiftOffset = Math.max(0, top - refTop);
    const meta = await sharp(p).metadata();
    const w = meta.width, h = meta.height;

    // Two-stage fix:
    //   1) Always mask the text strip we found at the top with bg gray.
    //   2) If the site plan was pushed down (cream-row offset > 0), crop that
    //      offset off the top and pad the same amount at the bottom so the
    //      building visually aligns with the reference locator.
    const maskRows = textBottom >= 0 ? textBottom + 4 : 0; // small pad below text
    const ops = [];
    if (maskRows > 0) {
      // Overlay a bg-gray rectangle covering rows 0..maskRows.
      const mask = await sharp({
        create: { width: w, height: maskRows, channels: 3, background: { r: bg.r, g: bg.g, b: bg.b } },
      }).png().toBuffer();
      ops.push({ input: mask, top: 0, left: 0 });
    }
    let masked = ops.length
      ? await sharp(p).composite(ops).jpeg({ quality: 92 }).toBuffer()
      : await sharp(p).toBuffer();

    if (shiftOffset > 0) {
      const cropped = await sharp(masked).extract({ left: 0, top: shiftOffset, width: w, height: h - shiftOffset }).toBuffer();
      const padBuf = await sharp({
        create: { width: w, height: shiftOffset, channels: 3, background: { r: bg.r, g: bg.g, b: bg.b } },
      }).png().toBuffer();
      masked = await sharp({
        create: { width: w, height: h, channels: 3, background: { r: bg.r, g: bg.g, b: bg.b } },
      })
        .composite([
          { input: cropped, top: 0, left: 0 },
          { input: padBuf, top: h - shiftOffset, left: 0 },
        ])
        .jpeg({ quality: 92 })
        .toBuffer();
    }

    await fs.writeFile(p + '.tmp.jpg', masked);
    await fs.rename(p + '.tmp.jpg', p);
    console.log(`${name}: text rows 0..${maskRows} masked, crop=${shiftOffset}px`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
