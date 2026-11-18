/**
 * HOLLOW WOODS V1.4 - BƯỚC V14-P8-10
 * CHUẨN HÓA SPRITESHEET & CHÂN DUNG 3 ĐƠN VỊ HIỆP SĨ TÀ ÁC (EVIL KNIGHTS FACTION)
 * 1. Fallen Knight (Hiệp Sĩ Sa Ngã) -> public/assets/characters/enemies/fallen_knight_sheet.png & portrait
 * 2. Dread Horseman (Kỵ Binh Hắc Ám) -> public/assets/characters/enemies/dread_horseman_sheet.png & portrait
 * 3. Hooded Knight Boss (Chỉ Huy Hiệp Sĩ) -> public/assets/characters/bosses/hooded_knight_sheet.png & portrait
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

fs.mkdirSync('public/assets/characters/enemies', { recursive: true });
fs.mkdirSync('public/assets/characters/bosses', { recursive: true });

function blit(src, srcX, srcY, w, h, dst, dstX, dstY) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = srcX + x;
      const sy = srcY + y;
      if (sx < 0 || sx >= src.width || sy < 0 || sy >= src.height) continue;

      const dx = dstX + x;
      const dy = dstY + y;
      if (dx < 0 || dx >= dst.width || dy < 0 || dy >= dst.height) continue;

      const sIdx = (sy * src.width + sx) << 2;
      const dIdx = (dy * dst.width + dx) << 2;

      const sa = src.data[sIdx + 3] / 255;
      if (sa <= 0) continue;

      const da = dst.data[dIdx + 3] / 255;
      const outA = sa + da * (1 - sa);

      if (outA > 0) {
        const sr = src.data[sIdx];
        const sg = src.data[sIdx + 1];
        const sb = src.data[sIdx + 2];

        const dr = dst.data[dIdx];
        const dg = dst.data[dIdx + 1];
        const db = dst.data[dIdx + 2];

        dst.data[dIdx] = Math.round((sr * sa + dr * da * (1 - sa)) / outA);
        dst.data[dIdx + 1] = Math.round((sg * sa + dg * da * (1 - sa)) / outA);
        dst.data[dIdx + 2] = Math.round((sb * sa + db * da * (1 - sa)) / outA);
        dst.data[dIdx + 3] = Math.round(outA * 255);
      }
    }
  }
}

function makePortrait(sourceImg, cropX, cropY, cropSize, destPath, borderHex = 0xa08149) {
  const p = new PNG({ width: 64, height: 64 });
  // Background vignette
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const idx = (y * 64 + x) << 2;
      const dist = Math.hypot(x - 32, y - 32) / 32;
      p.data[idx] = Math.max(12, Math.round(24 - dist * 12));
      p.data[idx + 1] = Math.max(10, Math.round(20 - dist * 10));
      p.data[idx + 2] = Math.max(15, Math.round(30 - dist * 14));
      p.data[idx + 3] = 255;
    }
  }

  // 2x Nearest-Neighbor scaling
  const destOffsetX = Math.round((64 - cropSize * 2) / 2);
  const destOffsetY = Math.round((64 - cropSize * 2) / 2);

  for (let cy = 0; cy < cropSize; cy++) {
    for (let cx = 0; cx < cropSize; cx++) {
      const sx = cropX + cx;
      const sy = cropY + cy;
      if (sx < 0 || sx >= sourceImg.width || sy < 0 || sy >= sourceImg.height) continue;
      const sIdx = (sy * sourceImg.width + sx) << 2;
      const sa = sourceImg.data[sIdx + 3];
      if (sa > 20) {
        const sr = sourceImg.data[sIdx];
        const sg = sourceImg.data[sIdx + 1];
        const sb = sourceImg.data[sIdx + 2];

        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const px = destOffsetX + cx * 2 + dx;
            const py = destOffsetY + cy * 2 + dy;
            if (px >= 0 && px < 64 && py >= 0 && py < 64) {
              const dIdx = (py * 64 + px) << 2;
              p.data[dIdx] = sr;
              p.data[dIdx + 1] = sg;
              p.data[dIdx + 2] = sb;
              p.data[dIdx + 3] = 255;
            }
          }
        }
      }
    }
  }

  // Border
  const r = (borderHex >> 16) & 0xff;
  const g = (borderHex >> 8) & 0xff;
  const b = borderHex & 0xff;
  for (let i = 0; i < 64; i++) {
    for (const [bx, by] of [[i, 0], [i, 63], [0, i], [63, i]]) {
      const idx = (by * 64 + bx) << 2;
      p.data[idx] = r; p.data[idx+1] = g; p.data[idx+2] = b; p.data[idx+3] = 255;
    }
  }

  fs.writeFileSync(destPath, PNG.sync.write(p));
  console.log(`Saved portrait: ${destPath}`);
}

// =========================================================================
// 1. FALLEN KNIGHT (Hiệp Sĩ Sa Ngã) -> 512x384 (8 cols x 6 rows of 64x64)
// =========================================================================
console.log('--- 1. Processing Fallen Knight ---');
const slDir = 'Pixel_Art/2D_SL_Knight_v1.0_3';
const slIdle = PNG.sync.read(fs.readFileSync(`${slDir}/Idle.png`));
const slRun = PNG.sync.read(fs.readFileSync(`${slDir}/Run.png`));
const slAttacks = PNG.sync.read(fs.readFileSync(`${slDir}/Attacks.png`));
const slPray = PNG.sync.read(fs.readFileSync(`${slDir}/Pray.png`));
const slHurt = PNG.sync.read(fs.readFileSync(`${slDir}/Hurt.png`));
const slDeath = PNG.sync.read(fs.readFileSync(`${slDir}/Death.png`));

const fallenSheet = new PNG({ width: 512, height: 384 });
fallenSheet.data.fill(0);

// Row 0: Idle (8 frames from Idle.png 2 cols x 4 rows)
for (let f = 0; f < 8; f++) {
  const r = Math.floor(f / 2);
  const c = f % 2;
  // Each block is 128x64. Crop center 64px (x=32..96)
  blit(slIdle, c * 128 + 32, r * 64, 64, 64, fallenSheet, f * 64, 0 * 64);
}

// Row 1: Run (8 frames from Run.png 2 cols x 4 rows)
for (let f = 0; f < 8; f++) {
  const r = Math.floor(f / 2);
  const c = f % 2;
  blit(slRun, c * 128 + 32, r * 64, 64, 64, fallenSheet, f * 64, 1 * 64);
}

// Row 2: Attack 1 (8 frames from Attacks.png row 0)
for (let f = 0; f < 8; f++) {
  blit(slAttacks, f * 128 + 32, 0, 64, 64, fallenSheet, f * 64, 2 * 64);
}

// Row 3: Pray (8 frames from Pray.png)
for (let f = 0; f < 8; f++) {
  const r = Math.floor(f / 4);
  const c = f % 4;
  blit(slPray, c * 128 + 32, r * 64, 64, 64, fallenSheet, f * 64, 3 * 64);
}

// Row 4: Hurt (3 frames, padded to 8)
for (let f = 0; f < 8; f++) {
  const srcF = Math.min(f, 2);
  const r = Math.floor(srcF / 2);
  const c = srcF % 2;
  blit(slHurt, c * 128 + 32, r * 64, 64, 64, fallenSheet, f * 64, 4 * 64);
}

// Row 5: Death (4 frames, padded to 8)
for (let f = 0; f < 8; f++) {
  const srcF = Math.min(f, 3);
  const r = Math.floor(srcF / 2);
  const c = srcF % 2;
  blit(slDeath, c * 128 + 32, r * 64, 64, 64, fallenSheet, f * 64, 5 * 64);
}

const fallenOut = 'public/assets/characters/enemies/fallen_knight_sheet.png';
fs.writeFileSync(fallenOut, PNG.sync.write(fallenSheet));
console.log(`Saved: ${fallenOut} (512x384 px, 8x6 64x64 cells)`);

makePortrait(slIdle, 48, 17, 26, 'public/assets/characters/enemies/portrait_fallen_knight.png', 0x95a5a6);

// =========================================================================
// 2. DREAD HORSEMAN (Kỵ Binh Hắc Ám) -> 448x384 (7 cols x 6 rows of 64x64)
// =========================================================================
console.log('\n--- 2. Processing Dread Horseman ---');
const horseDir = 'Pixel_Art/PixelHorse_V1.0/PixelHorse_V1.0';
const horsePath = `${horseDir}/64x64_Atlas_HorseRider_II_Complete.png`;
const horseSrc = PNG.sync.read(fs.readFileSync(horsePath));

const horseOut = 'public/assets/characters/enemies/dread_horseman_sheet.png';
fs.writeFileSync(horseOut, PNG.sync.write(horseSrc));
console.log(`Saved: ${horseOut} (448x384 px, 7x6 64x64 cells)`);

makePortrait(horseSrc, 16, 12, 28, 'public/assets/characters/enemies/portrait_dread_horseman.png', 0x8e44ad);

// =========================================================================
// 3. HOODED KNIGHT BOSS (Chỉ Huy Hiệp Sĩ Trùm Mũ) -> 3040x640 (19x4 160x160)
// =========================================================================
console.log('\n--- 3. Processing Hooded Knight Boss ---');
const hkDir = 'Pixel_Art/Hooded Knight Sprites/Spritesheets';
const hkIdle = PNG.sync.read(fs.readFileSync(`${hkDir}/hooded knight idle.png`));
const hkPowerup = PNG.sync.read(fs.readFileSync(`${hkDir}/hooded knight powerup.png`));
const hkAttack = PNG.sync.read(fs.readFileSync(`${hkDir}/hooded knight attack.png`));
const hkTransition = PNG.sync.read(fs.readFileSync(`${hkDir}/run-idle transition.png`));

const bossSheet = new PNG({ width: 3040, height: 640 });
bossSheet.data.fill(0);

// Cell is 160x160 px.
// In idle.png (100x100), feet at y=90. To align feet to y=140 in 160 cell: dstY = 140 - 90 = 50. Centered dstX = (160-100)/2 = 30.
// In powerup.png (100x180), feet at y=168. To align feet to y=140 in 160 cell: dstY = 140 - 168 = -28. Centered dstX = 30.
// In attack.png (180x100), feet at y=90. To align feet to y=140: dstY = 50. Shift dstX = -10 (x goes from 10 to 171).
// In transition.png (100x125), feet at y=114. To align feet to y=140: dstY = 140 - 114 = 26. dstX = 30.

// Row 0: Idle (8 frames)
for (let f = 0; f < 8; f++) {
  blit(hkIdle, f * 100, 0, 100, 100, bossSheet, f * 160 + 30, 0 * 160 + 50);
}

// Row 1: Powerup (19 frames)
for (let f = 0; f < 19; f++) {
  blit(hkPowerup, f * 100, 0, 100, 180, bossSheet, f * 160 + 30, 1 * 160 - 28);
}

// Row 2: Attack (17 frames)
for (let f = 0; f < 17; f++) {
  blit(hkAttack, f * 180, 0, 180, 100, bossSheet, f * 160 - 10, 2 * 160 + 50);
}

// Row 3: Stagger / Transition (2 frames, padded)
for (let f = 0; f < 19; f++) {
  const srcF = Math.min(f, 1);
  blit(hkTransition, srcF * 100, 0, 100, 125, bossSheet, f * 160 + 30, 3 * 160 + 26);
}

const hkOut = 'public/assets/characters/bosses/hooded_knight_sheet.png';
fs.writeFileSync(hkOut, PNG.sync.write(bossSheet));
console.log(`Saved: ${hkOut} (3040x640 px, 19x4 160x160 cells)`);

makePortrait(hkIdle, 38, 20, 26, 'public/assets/characters/bosses/portrait_hooded_knight.png', 0xd4af37);

console.log('--- All 3 Evil Knights assets extracted successfully! ---');
