// Crop the source PDF-export pages into two assets per apartment:
//   public/images/floor-plans/apt-NN.jpg          — room scheme only
//   public/images/floor-plans/apt-NN-locator.jpg  — small site-map locator
//
// Source pages are 4961×3508 px (A3 landscape @ 300 dpi). Each floor's pages
// 1..8 map to apartments [(floor-1)*8 + 1 .. (floor-1)*8 + 8].
//
// Usage:
//   node scripts/crop-apt-plans.mjs            # all floors that have a folder
//   node scripts/crop-apt-plans.mjs 2          # just floor 2

import sharp from 'sharp';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const FLOOR_SOURCES = {
  1: 'C:/Users/artur/Downloads/ilovepdf_pages-to-jpg',
  2: 'C:/Users/artur/Downloads/ilovepdf_pages-to-jpg-2stavs',
  3: 'C:/Users/artur/Downloads/ilovepdf_pages-to-jpg(1)-3stavs',
};

const FLOOR_PREFIX = {
  1: '1_STAVS_DZIVOKLI_03_outlined_page',
  2: '2_STAVS_DZIVOKLI_03_outlined_page',
  3: '3_STAVS_DZIVOKLI_03_outlined_page',
};

const DST_DIR = 'public/images/floor-plans';

const ROOM_LEFT   = 1690;
const ROOM_TOP    = 150;
const ROOM_RIGHT  = 4900;
const ROOM_BOTTOM = 2950;

const LOCATOR_LEFT   = 110;
const LOCATOR_TOP    = 2200;
const LOCATOR_WIDTH  = 1430;
const LOCATOR_HEIGHT = 880;

const argFloor = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const floors = argFloor ? [argFloor] : [1, 2, 3];

for (const floor of floors) {
  const srcDir = FLOOR_SOURCES[floor];
  if (!srcDir || !existsSync(srcDir)) {
    console.log(`floor ${floor}: source folder missing (${srcDir}) — skipping`);
    continue;
  }
  const aptOffset = (floor - 1) * 8;

  for (let page = 1; page <= 8; page++) {
    const pageStr = String(page).padStart(4, '0');
    const aptNum  = aptOffset + page;
    const nn = String(aptNum).padStart(2, '0');
    const src = resolve(`${srcDir}/${FLOOR_PREFIX[floor]}-${pageStr}.jpg`);
    if (!existsSync(src)) {
      console.log(`  page ${pageStr}: missing — skipping`);
      continue;
    }
    const dstRoom    = resolve(`${DST_DIR}/apt-${nn}.jpg`);
    const dstLocator = resolve(`${DST_DIR}/apt-${nn}-locator.jpg`);

    await sharp(src)
      .extract({
        left: ROOM_LEFT,
        top: ROOM_TOP,
        width: ROOM_RIGHT - ROOM_LEFT,
        height: ROOM_BOTTOM - ROOM_TOP,
      })
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 88, progressive: true })
      .toFile(dstRoom);

    await sharp(src)
      .extract({ left: LOCATOR_LEFT, top: LOCATOR_TOP, width: LOCATOR_WIDTH, height: LOCATOR_HEIGHT })
      .resize({ width: 600, withoutEnlargement: true })
      .jpeg({ quality: 88, progressive: true })
      .toFile(dstLocator);

    console.log(`floor ${floor}  page ${pageStr} → apt-${nn} (room + locator)`);
  }
}
