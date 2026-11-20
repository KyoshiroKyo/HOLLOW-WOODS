/**
 * Verification Script for Step V15-09:
 * Chuẩn hóa quy chuẩn kích thước Pixel Art, điểm neo và bảng màu cho toàn bộ Nhân vật, NPC và Quái vật
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

console.log('=== VERIFYING STEP V15-09: PIXEL ART ASSET STANDARDIZATION ===\n');

// 1. Inspect actual PNG file dimensions and bottom gaps
function checkPng(filePath, fw, fh) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const cols = Math.floor(png.width / fw);
  const rows = Math.floor(png.height / fh);

  let minY = fh, maxY = -1;
  let hasContent = false;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
          const px = c * fw + x;
          const py = r * fh + y;
          const idx = (py * png.width + px) * 4;
          if (png.data[idx + 3] > 15) {
            hasContent = true;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }
  }

  const height = maxY - minY + 1;
  const bottomGap = fh - 1 - maxY;
  return { hasContent, height, bottomGap };
}

// 1. Wayfarer height (42px - 48px)
const wayfarerMetrics = checkPng('public/assets/characters/mossbound_wayfarer/wayfarer_idle.png', 64, 64);
assert(
  wayfarerMetrics.height >= 42 && wayfarerMetrics.height <= 48 && wayfarerMetrics.bottomGap === 0,
  `Wayfarer Idle height is standardized: ${wayfarerMetrics.height}px (target 42-48px), bottomGap=${wayfarerMetrics.bottomGap}`
);

// 2. Adult NPCs (Garth, Edda, Neris, Bram, Campfire Knight: 42px - 48px)
const garthMetrics = checkPng('public/assets/characters/villagers/garth_walk_sheet.png', 64, 64);
assert(
  garthMetrics.height >= 42 && garthMetrics.height <= 48 && garthMetrics.bottomGap === 0,
  `Garth Walk Sheet height is standardized: ${garthMetrics.height}px (target 42-48px), bottomGap=${garthMetrics.bottomGap}`
);

const eddaMetrics = checkPng('public/assets/characters/villagers/edda_idle_sheet.png', 64, 64);
assert(
  eddaMetrics.height >= 42 && eddaMetrics.height <= 48 && eddaMetrics.bottomGap === 0,
  `Edda Idle Sheet height is standardized: ${eddaMetrics.height}px (target 42-48px), bottomGap=${eddaMetrics.bottomGap}`
);

const nerisMetrics = checkPng('public/assets/characters/villagers/neris_idle_sheet.png', 64, 64);
assert(
  nerisMetrics.height >= 42 && nerisMetrics.height <= 48 && nerisMetrics.bottomGap === 0,
  `Neris Idle Sheet height is standardized: ${nerisMetrics.height}px (target 42-48px), bottomGap=${nerisMetrics.bottomGap}`
);

const bramMetrics = checkPng('public/assets/characters/villagers/blacksmith_sheet.png', 64, 64);
assert(
  bramMetrics.height >= 42 && bramMetrics.height <= 48 && bramMetrics.bottomGap === 0,
  `Bram Blacksmith Sheet height is standardized: ${bramMetrics.height}px (target 42-48px), bottomGap=${bramMetrics.bottomGap}`
);

const campfireKnightMetrics = checkPng('public/assets/characters/npcs/campfire_knight_idle_sheet.png', 64, 64);
assert(
  campfireKnightMetrics.height >= 42 && campfireKnightMetrics.height <= 48 && campfireKnightMetrics.bottomGap === 0,
  `Campfire Knight Sheet height is standardized: ${campfireKnightMetrics.height}px (target 42-48px), bottomGap=${campfireKnightMetrics.bottomGap}`
);

// 3. Boy Finn (34px - 36px)
const finnMetrics = checkPng('public/assets/characters/villagers/errand_boy_walk_sheet.png', 64, 64);
assert(
  finnMetrics.height >= 34 && finnMetrics.height <= 36 && finnMetrics.bottomGap === 0,
  `Finn Errand Boy Sheet height is standardized: ${finnMetrics.height}px (target 34-36px), bottomGap=${finnMetrics.bottomGap}`
);

// 4. Source code checks
const constantsSrc = fs.readFileSync('src/config/Constants.ts', 'utf8');
const npcSrc = fs.readFileSync('src/entities/NPCEntity.ts', 'utf8');
const satyrSrc = fs.readFileSync('src/entities/BlackKnightPlayer.ts', 'utf8');
const evilKnightsSrc = fs.readFileSync('src/entities/EvilKnights.ts', 'utf8');
const skullWolfSrc = fs.readFileSync('src/entities/SkullWolfEntity.ts', 'utf8');
const theListenerSrc = fs.readFileSync('src/entities/TheListener.ts', 'utf8');

assert(
  constantsSrc.includes('WAYFARER_ORIGIN_Y = 1.0') &&
  constantsSrc.includes('WAYFARER_BODY_OFFSET_Y = 52'),
  'Constants.ts defines WAYFARER_ORIGIN_Y = 1.0 and offset Y = 52 at feet'
);

assert(
  npcSrc.includes('this.npcSprite.setOrigin(0.5, 1.0)') &&
  npcSrc.includes('body.setOffset(-bw / 2, -bh)'),
  'NPCEntity.ts sets npcSprite origin(0.5, 1.0) and centers container foot hitbox'
);

assert(
  npcSrc.includes('shadow.fillEllipse(0, 0, shadowW, shadowH)') &&
  npcSrc.includes("this.baseId === 'bram'") &&
  npcSrc.includes("this.baseId === 'finn'"),
  'NPCEntity.ts customizes foot shadow ellipse size per character shoulder width'
);

assert(
  satyrSrc.includes('this.footShadowGfx.fillEllipse(0, 0, 18, 6)'),
  'SatyrPlayer.ts synchronizes foot shadow ellipse to Wayfarer shoulder width (18px)'
);

assert(
  evilKnightsSrc.includes('this.setOrigin(0.5, 1.0)') &&
  evilKnightsSrc.includes('fillEllipse(0, 0, 24, 7.5)') &&
  evilKnightsSrc.includes('fillEllipse(0, 0, 48, 14)') &&
  evilKnightsSrc.includes('fillEllipse(0, 0, 52, 14)'),
  'EvilKnights.ts sets origin(0.5, 1.0) and calibrates shadows for Fallen, Horseman and Boss'
);

assert(
  skullWolfSrc.includes('this.setOrigin(0.5, 1.0)') &&
  skullWolfSrc.includes('fillEllipse(0, 0, 34, 10)'),
  'SkullWolfEntity.ts sets origin(0.5, 1.0) and calibrates body shadow (34x10)'
);

assert(
  theListenerSrc.includes('this.setOrigin(0.5, 1.0)') &&
  theListenerSrc.includes('fillEllipse(0, 0, 24, 7)'),
  'TheListener.ts sets origin(0.5, 1.0) and calibrates shadow (24x7)'
);

console.log(`\nResults: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All V15-09 verification criteria passed successfully!');
}
