/**
 * HOLLOW WOODS V1.4 - BƯỚC V14-P8-09
 * CHUẨN HÓA SPRITESHEET & CHÂN DUNG 3 LOÀI QUÁI VẬT BÓNG TỐI
 * 1. Shadow Crow (Quạ Bóng Tối) -> shadow_crow_sheet.png (6x6 frames 64x64)
 * 2. Shadow Eyes (Bóng Mắt Sương Mù) -> shadow_eyes_sheet.png (8x3 frames 48x48)
 * 3. Abyssal Shade Behemoth (Trùm Bóng Tối Khổng Lồ) -> shadow_big_boss_sheet.png (16x8 frames 80x80) & portrait_shadow_big_boss.png (64x64)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// Đảm bảo thư mục đích tồn tại
fs.mkdirSync('public/assets/characters/monsters', { recursive: true });
fs.mkdirSync('public/assets/characters/bosses', { recursive: true });

function blit(src, srcX, srcY, w, h, dst, dstX, dstY) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = ((srcY + y) * src.width + (srcX + x)) << 2;
      const dstIdx = ((dstY + y) * dst.width + (dstX + x)) << 2;

      const sa = src.data[srcIdx + 3] / 255;
      if (sa <= 0) continue;

      const da = dst.data[dstIdx + 3] / 255;
      const outA = sa + da * (1 - sa);

      if (outA > 0) {
        const sr = src.data[srcIdx];
        const sg = src.data[srcIdx + 1];
        const sb = src.data[srcIdx + 2];

        const dr = dst.data[dstIdx];
        const dg = dst.data[dstIdx + 1];
        const db = dst.data[dstIdx + 2];

        dst.data[dstIdx] = Math.round((sr * sa + dr * da * (1 - sa)) / outA);
        dst.data[dstIdx + 1] = Math.round((sg * sa + dg * da * (1 - sa)) / outA);
        dst.data[dstIdx + 2] = Math.round((sb * sa + db * da * (1 - sa)) / outA);
        dst.data[dstIdx + 3] = Math.round(outA * 255);
      }
    }
  }
}

// -------------------------------------------------------------
// 1. SHADOW CROW (Quạ Bóng Tối) -> 6x6 frames of 64x64 = 384x384
// -------------------------------------------------------------
console.log('--- 1. Processing Shadow Crow Spritesheet ---');
const crowDir = 'Pixel_Art/Crow Animations/Crow Animations';
const crowRows = [
  { file: 'crow_idle.png', frames: 4 },
  { file: 'crow_walk.png', frames: 4 },
  { file: 'crow_jump.png', frames: 6 },
  { file: 'crow_attack.png', frames: 5 },
  { file: 'crow_damage.png', frames: 3 },
  { file: 'crow_death2.png', frames: 6 }
];

const crowSheet = new PNG({ width: 384, height: 384 });
// Initialize fully transparent
crowSheet.data.fill(0);

crowRows.forEach((rowDef, rowIdx) => {
  const filePath = path.join(crowDir, rowDef.file);
  const src = PNG.sync.read(fs.readFileSync(filePath));
  for (let f = 0; f < rowDef.frames; f++) {
    blit(src, f * 64, 0, 64, 64, crowSheet, f * 64, rowIdx * 64);
  }
});

const crowOutPath = 'public/assets/characters/monsters/shadow_crow_sheet.png';
fs.writeFileSync(crowOutPath, PNG.sync.write(crowSheet));
console.log(`Saved: ${crowOutPath} (384x384 px, 6x6 64x64 cells)`);

// -------------------------------------------------------------
// 2. SHADOW EYES (Bóng Mắt Sương Mù) -> 8x3 frames of 48x48 = 384x144
// -------------------------------------------------------------
console.log('\n--- 2. Processing Shadow Eyes Spritesheet ---');
const eyesSrcPath = 'Pixel_Art/monster_pack_1_free/monster001eyes.png';
const eyesSrc = PNG.sync.read(fs.readFileSync(eyesSrcPath));

const eyesSheet = new PNG({ width: 384, height: 144 });
eyesSheet.data.fill(0);

// Row 0: Idle stare (from source row 0, 8 frames of 48x48)
for (let f = 0; f < 8; f++) {
  blit(eyesSrc, f * 48, 0 * 48, 48, 48, eyesSheet, f * 48, 0 * 48);
}
// Row 1: Darting gaze / twitch (from source row 1, 8 frames of 48x48)
for (let f = 0; f < 8; f++) {
  blit(eyesSrc, f * 48, 1 * 48, 48, 48, eyesSheet, f * 48, 1 * 48);
}
// Row 2: Dissolving / evaporation into mist (from source row 6, 8 frames of 48x48)
for (let f = 0; f < 8; f++) {
  blit(eyesSrc, f * 48, 6 * 48, 48, 48, eyesSheet, f * 48, 2 * 48);
}

const eyesOutPath = 'public/assets/characters/monsters/shadow_eyes_sheet.png';
fs.writeFileSync(eyesOutPath, PNG.sync.write(eyesSheet));
console.log(`Saved: ${eyesOutPath} (384x144 px, 8x3 48x48 cells)`);

// -------------------------------------------------------------
// 3. ABYSSAL SHADE BEHEMOTH (Trùm Bóng Tối Khổng Lồ)
// -> 16 cols x 8 rows of 80x80 = 1280x640 px
// -------------------------------------------------------------
console.log('\n--- 3. Processing Dark Fantasy Big Boss Spritesheet ---');
const bossDir = 'Pixel_Art/2023.10.6 dark fantasy big boss free';
const bossSheet = new PNG({ width: 1280, height: 640 });
bossSheet.data.fill(0);

const idlePng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss idle.png')));
const walkPng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss walk.png')));
const a2Png = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss attack 2.png')));
const a2aPng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss attack 2a.png')));
const a2bPng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss attack 2b.png')));
const a2cPng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss attack 2c.png')));
const missPng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss attack 2 miss.png')));
const hitPng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss hit.png')));
const deathPng = PNG.sync.read(fs.readFileSync(path.join(bossDir, 'dark fantasy big boss death.png')));

// Y offsets:
// Body is 80x64. In 80x80 cell, placing body at dstY = 12 sets feet at local 55 + 12 = 67.
// Shockwave is 48x48. Centered at dstX = 16 (16+48=64). Bottom at local 47. Placed at dstY = 20 sets bottom at 20 + 47 = 67!
const BODY_Y = 12;
const FX_X = 16;
const FX_Y = 20;

// Row 0: Idle (16 frames)
for (let f = 0; f < 16; f++) {
  blit(idlePng, f * 80, 0, 80, 64, bossSheet, f * 80, 0 * 80 + BODY_Y);
}

// Row 1: Walk (16 frames)
for (let f = 0; f < 16; f++) {
  blit(walkPng, f * 80, 0, 80, 64, bossSheet, f * 80, 1 * 80 + BODY_Y);
}

// Row 2: Attack 2a (Combo Phase 1: Wind-up & initial ring)
for (let f = 0; f < 16; f++) {
  // Shockwave under body or on ground
  blit(a2aPng, f * 48, 0, 48, 48, bossSheet, f * 80 + FX_X, 2 * 80 + FX_Y);
  blit(a2Png, f * 80, 0, 80, 64, bossSheet, f * 80, 2 * 80 + BODY_Y);
}

// Row 3: Attack 2b (Combo Phase 2: Heavy slam & spreading shockwave)
for (let f = 0; f < 16; f++) {
  blit(a2bPng, f * 48, 0, 48, 48, bossSheet, f * 80 + FX_X, 3 * 80 + FX_Y);
  blit(a2Png, f * 80, 0, 80, 64, bossSheet, f * 80, 3 * 80 + BODY_Y);
}

// Row 4: Attack 2c (Combo Phase 3: Giant fissure eruption)
for (let f = 0; f < 16; f++) {
  blit(a2cPng, f * 48, 0, 48, 48, bossSheet, f * 80 + FX_X, 4 * 80 + FX_Y);
  blit(a2Png, f * 80, 0, 80, 64, bossSheet, f * 80, 4 * 80 + BODY_Y);
}

// Row 5: Attack 2 Miss (Vulnerable miss recovery)
for (let f = 0; f < 16; f++) {
  blit(missPng, f * 48, 0, 48, 48, bossSheet, f * 80 + FX_X, 5 * 80 + FX_Y);
  blit(a2Png, f * 80, 0, 80, 64, bossSheet, f * 80, 5 * 80 + BODY_Y);
}

// Row 6: Hit / Stagger (3 frames, repeating last frame to fill 16 frames)
for (let f = 0; f < 16; f++) {
  const srcF = Math.min(f, 2);
  blit(hitPng, srcF * 80, 0, 80, 64, bossSheet, f * 80, 6 * 80 + BODY_Y);
}

// Row 7: Death (16 frames)
for (let f = 0; f < 16; f++) {
  blit(deathPng, f * 80, 0, 80, 64, bossSheet, f * 80, 7 * 80 + BODY_Y);
}

const bossOutPath = 'public/assets/characters/bosses/shadow_big_boss_sheet.png';
fs.writeFileSync(bossOutPath, PNG.sync.write(bossSheet));
console.log(`Saved: ${bossOutPath} (1280x640 px, 16x8 80x80 cells)`);

// -------------------------------------------------------------
// 4. PORTRAIT SHADOW BIG BOSS (64x64 px)
// -------------------------------------------------------------
console.log('\n--- 4. Generating Boss Portrait (64x64 px) ---');
const portrait = new PNG({ width: 64, height: 64 });

// Background gothic slate vignette
for (let y = 0; y < 64; y++) {
  for (let x = 0; x < 64; x++) {
    const idx = (y * 64 + x) << 2;
    const distCenter = Math.hypot(x - 32, y - 32) / 32;
    const bgR = Math.max(10, Math.round(20 - distCenter * 10));
    const bgG = Math.max(8, Math.round(16 - distCenter * 8));
    const bgB = Math.max(14, Math.round(26 - distCenter * 12));
    portrait.data[idx] = bgR;
    portrait.data[idx + 1] = bgG;
    portrait.data[idx + 2] = bgB;
    portrait.data[idx + 3] = 255;
  }
}

// Crop Boss Head from idle frame 0 (around x=24..50, y=18..44 -> 26x26)
// Scale 2x with nearest neighbor into center (from x=6, y=6 to 58, 58)
const srcCropX = 24;
const srcCropY = 18;
const cropSize = 26;
const destOffsetX = 6;
const destOffsetY = 6;

for (let cy = 0; cy < cropSize; cy++) {
  for (let cx = 0; cx < cropSize; cx++) {
    const sIdx = ((srcCropY + cy) * idlePng.width + (srcCropX + cx)) << 2;
    const sa = idlePng.data[sIdx + 3];
    if (sa > 20) {
      const sr = idlePng.data[sIdx];
      const sg = idlePng.data[sIdx + 1];
      const sb = idlePng.data[sIdx + 2];

      // 2x scale
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const px = destOffsetX + cx * 2 + dx;
          const py = destOffsetY + cy * 2 + dy;
          if (px < 64 && py < 64) {
            const dIdx = (py * 64 + px) << 2;
            portrait.data[dIdx] = sr;
            portrait.data[dIdx + 1] = sg;
            portrait.data[dIdx + 2] = sb;
            portrait.data[dIdx + 3] = 255;
          }
        }
      }
    }
  }
}

// Outer subtle gold/abyssal border (1px)
for (let i = 0; i < 64; i++) {
  // Top/bottom
  const tIdx = (0 * 64 + i) << 2;
  const bIdx = (63 * 64 + i) << 2;
  portrait.data[tIdx] = 160; portrait.data[tIdx+1] = 130; portrait.data[tIdx+2] = 50; portrait.data[tIdx+3] = 255;
  portrait.data[bIdx] = 160; portrait.data[bIdx+1] = 130; portrait.data[bIdx+2] = 50; portrait.data[bIdx+3] = 255;

  // Left/right
  const lIdx = (i * 64 + 0) << 2;
  const rIdx = (i * 64 + 63) << 2;
  portrait.data[lIdx] = 160; portrait.data[lIdx+1] = 130; portrait.data[lIdx+2] = 50; portrait.data[lIdx+3] = 255;
  portrait.data[rIdx] = 160; portrait.data[rIdx+1] = 130; portrait.data[rIdx+2] = 50; portrait.data[rIdx+3] = 255;
}

const portraitOutPath = 'public/assets/characters/bosses/portrait_shadow_big_boss.png';
fs.writeFileSync(portraitOutPath, PNG.sync.write(portrait));
console.log(`Saved: ${portraitOutPath} (64x64 px)`);
console.log('--- All assets extracted and normalized successfully! ---');
