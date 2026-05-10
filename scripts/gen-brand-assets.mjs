// Generate brand raster assets from the SVG mark + an existing exterior photo:
//   public/favicon-32x32.png
//   public/favicon-16x16.png
//   public/apple-touch-icon.png  (180×180, iOS Home Screen)
//   public/og-image.jpg          (1200×630, used in <meta property="og:image">)

import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const markSvg = readFileSync('public/favicon.svg');

// 1. Favicons + apple-touch-icon — render SVG at the right sizes.
await sharp(markSvg).resize(32, 32).png().toFile('public/favicon-32x32.png');
await sharp(markSvg).resize(16, 16).png().toFile('public/favicon-16x16.png');
await sharp(markSvg)
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');

// 2. OG image: 1200×630, base photo darkened, brand wordmark + headline overlay.
const headline = 'Jauns projekts Mores ielā, Rīga';
const subtitle = '24 dzīvokļi · A+ klase · pieejami no €76 200';

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#3D1419" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#3D1419" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#3D1419" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g font-family="Inter, system-ui, sans-serif" fill="#F5EFE6">
    <text x="80" y="120" font-size="22" letter-spacing="6" font-weight="500" opacity="0.85">MORES IELA 15 · RĪGA</text>
  </g>
  <g font-family="Cormorant Garamond, Georgia, serif" fill="#F5EFE6">
    <text x="80" y="240" font-size="100" letter-spacing="14" font-weight="500">ALMA <tspan font-weight="300">HOME</tspan></text>
  </g>
  <line x1="80" y1="290" x2="240" y2="290" stroke="#F5EFE6" stroke-opacity="0.5" stroke-width="2"/>
  <g font-family="Cormorant Garamond, Georgia, serif" fill="#F5EFE6">
    <text x="80" y="395" font-size="46" font-weight="500">${headline}</text>
  </g>
  <g font-family="Inter, system-ui, sans-serif" fill="#F5EFE6">
    <text x="80" y="450" font-size="22" opacity="0.85">${subtitle}</text>
  </g>
  <g font-family="Inter, system-ui, sans-serif" fill="#F5EFE6">
    <text x="80" y="565" font-size="18" letter-spacing="3" opacity="0.7">ALMAHOME.LV</text>
  </g>
</svg>`;

await sharp('public/images/exterior/hero.jpg')
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile('public/og-image.jpg');

console.log('Wrote favicon-{16,32}.png, apple-touch-icon.png, og-image.jpg');
