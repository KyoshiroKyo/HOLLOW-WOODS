import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const SOURCE_SHEET_PATH = 'Pixel_Art/Black Knight/ALL_In_One_NEW/Black_Knight_All_In_One_New.png';
const SOURCE_PORTRAIT_PATH = 'Pixel_Art/Black Knight/WEB_Images/knight_no_text.png';
const OUTPUT_DIR = 'public/assets/characters/mossbound_wayfarer';

const CELL_W = 144;
const CELL_H = 64;

// Load source sprite sheet
console.log('Loading source sheet:', SOURCE_SHEET_PATH);
const srcSheet = PNG.sync.read(fs.readFileSync(SOURCE_SHEET_PATH));
console.log(`Source sheet loaded: ${srcSheet.width}x${srcSheet.height}`);

// Foot contact shadow painter
function drawShadow(targetPng, targetX, targetY, frameW, frameH, alphaMultiplier = 1.0) {
  const cx = 32;
  const cy = 58;
  const rx = 13;
  const ry = 4;
  const maxAlpha = 64 * alphaMultiplier;

  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const normX = dx / rx;
      const normY = dy / ry;
      const distSq = normX * normX + normY * normY;
      if (distSq <= 1.0) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < frameW && y >= 0 && y < frameH) {
          const alpha = Math.round(maxAlpha * (1.0 - distSq * 0.45));
          const idx = ((targetY + y) * targetPng.width + (targetX + x)) * 4;
          targetPng.data[idx] = 0;
          targetPng.data[idx + 1] = 0;
          targetPng.data[idx + 2] = 0;
          targetPng.data[idx + 3] = alpha;
        }
      }
    }
  }
}

// Extract a single 64x64 frame from cell (r, c)
function extractNormalizedFrame(r, c, anchorX = 68, anchorY = 62, isAttack = false) {
  const frame = new PNG({ width: 64, height: 64 });
  
  // Center: in 64x64, target anchor is (32, 58)
  const targetAnchorX = 32;
  const targetAnchorY = 58;
  
  // Effective anchor: for attack swings, shift anchor slightly so wide blade fits
  const effAnchorX = isAttack ? 72 : anchorX;
  const effAnchorY = anchorY;

  for (let y = 1; y < CELL_H - 1; y++) {
    for (let x = 1; x < CELL_W - 1; x++) {
      const srcIdx = ((r * CELL_H + y) * srcSheet.width + (c * CELL_W + x)) * 4;
      const a = srcSheet.data[srcIdx + 3];
      if (a > 20) {
        const destX = targetAnchorX + (x - effAnchorX);
        const destY = targetAnchorY + (y - effAnchorY);
        if (destX >= 0 && destX < 64 && destY >= 0 && destY < 64) {
          const destIdx = (destY * 64 + destX) * 4;
          frame.data[destIdx] = srcSheet.data[srcIdx];
          frame.data[destIdx + 1] = srcSheet.data[srcIdx + 1];
          frame.data[destIdx + 2] = srcSheet.data[srcIdx + 2];
          frame.data[destIdx + 3] = a;
        }
      }
    }
  }
  return frame;
}

// Build a 4-direction sprite sheet
// Row 0: DOWN, Row 1: UP, Row 2: LEFT (flipX), Row 3: RIGHT
function buildSheet(sourceCells, isAttack = false, isDeath = false) {
  const framesPerDir = sourceCells.length;
  const sheetW = framesPerDir * 64;
  const sheetH = 4 * 64; // 256 px
  const sheet = new PNG({ width: sheetW, height: sheetH });

  for (let f = 0; f < framesPerDir; f++) {
    const [r, c] = sourceCells[f];
    const frame = extractNormalizedFrame(r, c, 68, 62, isAttack);
    
    // Death shadow fades out across frames
    const shadowAlphaMult = isDeath ? Math.max(0.05, 1.0 - (f / (framesPerDir - 1)) * 0.9) : 1.0;

    for (let row = 0; row < 4; row++) {
      const targetX = f * 64;
      const targetY = row * 64;

      // 1. Draw soft contact shadow on base layer
      drawShadow(sheet, targetX, targetY, 64, 64, shadowAlphaMult);

      // 2. Draw character sprite
      // row 0: DOWN (normal right/forward)
      // row 1: UP (normal right/upward)
      // row 2: LEFT (flipX)
      // row 3: RIGHT (normal right)
      const isFlipped = (row === 2);

      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const srcFrameX = isFlipped ? (63 - x) : x;
          const srcIdx = (y * 64 + srcFrameX) * 4;
          const a = frame.data[srcIdx + 3];
          if (a > 20) {
            const destIdx = ((targetY + y) * sheetW + (targetX + x)) * 4;
            sheet.data[destIdx] = frame.data[srcIdx];
            sheet.data[destIdx + 1] = frame.data[srcIdx + 1];
            sheet.data[destIdx + 2] = frame.data[srcIdx + 2];
            sheet.data[destIdx + 3] = a;
          }
        }
      }
    }
  }

  return sheet;
}

// Animation configurations matching wayfarer_animation_manifest.json
const SHEETS_CONFIG = [
  {
    file: 'wayfarer_idle.png',
    cells: [[1, 2], [1, 3], [1, 4], [1, 5]], // BK_weapon_idle (4 frames)
    isAttack: false,
    isDeath: false
  },
  {
    file: 'wayfarer_walk.png',
    cells: [[8, 4], [8, 6], [8, 8], [8, 10], [8, 12], [8, 14]], // BK_weapon_run subsampled (6 frames)
    isAttack: false,
    isDeath: false
  },
  {
    file: 'wayfarer_run.png',
    cells: [[8, 4], [8, 5], [8, 7], [8, 9], [8, 11], [8, 13]], // BK_weapon_run keyframes (6 frames)
    isAttack: false,
    isDeath: false
  },
  {
    file: 'wayfarer_attack.png',
    cells: [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]], // BK_light_attack (6 frames)
    isAttack: true,
    isDeath: false
  },
  {
    file: 'wayfarer_hurt.png',
    cells: [[7, 0], [7, 1], [7, 2]], // BK_hurt (3 frames)
    isAttack: false,
    isDeath: false
  },
  {
    file: 'wayfarer_death.png',
    cells: [[16, 4], [16, 5], [16, 6], [16, 7], [16, 8], [16, 9]], // Death disintegration (6 frames)
    isAttack: false,
    isDeath: true
  },
  {
    file: 'wayfarer_interact.png',
    cells: [[14, 5], [14, 6], [14, 7], [14, 8]], // BK_weapon_on-off (4 frames)
    isAttack: false,
    isDeath: false
  },
  {
    file: 'wayfarer_gather.png',
    cells: [[10, 5], [10, 6], [10, 7], [10, 8]], // Kneeling gather (4 frames)
    isAttack: false,
    isDeath: false
  },
  {
    file: 'wayfarer_use_item.png',
    cells: [[14, 6], [14, 7], [14, 8], [14, 9]], // Raising item / potion (4 frames)
    isAttack: false,
    isDeath: false
  }
];

// Generate 9 spritesheets
console.log('\n--- Generating 9 Spritesheets ---');
for (const cfg of SHEETS_CONFIG) {
  const sheetPng = buildSheet(cfg.cells, cfg.isAttack, cfg.isDeath);
  const outPath = path.join(OUTPUT_DIR, cfg.file);
  fs.writeFileSync(outPath, PNG.sync.write(sheetPng));
  console.log(`[PASS] Generated ${cfg.file} (${sheetPng.width}x${sheetPng.height}) -> ${outPath}`);
}

// Generate wayfarer_portrait.png from knight_no_text.png
console.log('\n--- Generating wayfarer_portrait.png ---');
const srcPortrait = PNG.sync.read(fs.readFileSync(SOURCE_PORTRAIT_PATH));
const portraitPng = new PNG({ width: 64, height: 64 });
const cropX = 200;
const cropY = 280;
const cropScale = 512 / 64; // 8x scale

for (let y = 0; y < 64; y++) {
  for (let x = 0; x < 64; x++) {
    const srcX = Math.min(srcPortrait.width - 1, Math.floor(cropX + x * cropScale));
    const srcY = Math.min(srcPortrait.height - 1, Math.floor(cropY + y * cropScale));
    const srcIdx = (srcY * srcPortrait.width + srcX) * 4;
    const destIdx = (y * 64 + x) * 4;
    portraitPng.data[destIdx] = srcPortrait.data[srcIdx];
    portraitPng.data[destIdx + 1] = srcPortrait.data[srcIdx + 1];
    portraitPng.data[destIdx + 2] = srcPortrait.data[srcIdx + 2];
    portraitPng.data[destIdx + 3] = srcPortrait.data[srcIdx + 3];
  }
}
const portraitOutPath = path.join(OUTPUT_DIR, 'wayfarer_portrait.png');
fs.writeFileSync(portraitOutPath, PNG.sync.write(portraitPng));
console.log(`[PASS] Generated wayfarer_portrait.png (64x64) -> ${portraitOutPath}`);

console.log('\nAll assets successfully generated!');
