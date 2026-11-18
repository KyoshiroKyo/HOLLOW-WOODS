/**
 * HOLLOW WOODS V1.4 — BƯỚC V14-P8-14A
 * CHUẨN HÓA SPRITESHEET & CHÂN DUNG NPC HIỆP SĨ CANH LỬA (CAMPFIRE KNIGHT)
 * Nguồn: Pixel_Art/2D_SL_Knight_v1.0_3 (Pray.png, Idle.png)
 * 
 * 1. public/assets/characters/npcs/campfire_knight_pray_sheet.png (768x64 px, 12 frames)
 * 2. public/assets/characters/npcs/campfire_knight_idle_sheet.png (512x64 px, 8 frames)
 * 3. public/assets/characters/npcs/portrait_campfire_knight.png (64x64 px)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const SL_DIR = 'Pixel_Art/2D_SL_Knight_v1.0_3';
const NPCS_DIR = 'public/assets/characters/npcs';
const VILLAGERS_DIR = 'public/assets/characters/villagers';

fs.mkdirSync(NPCS_DIR, { recursive: true });
fs.mkdirSync(VILLAGERS_DIR, { recursive: true });

// Hàm vẽ bóng đổ elip mềm dưới chân (alpha tối đa 0.25)
function drawSoftGroundShadow(targetPng, targetX, targetY, frameW = 64, frameH = 64) {
  const cx = 32;
  const cy = 60; // Gần cạnh đáy y=63 nơi bàn chân chạm đất
  const rx = 14;
  const ry = 4;
  const maxAlpha = 64; // 64 / 255 = 0.251 (~0.25 alpha)

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
          targetPng.data[idx] = 0;     // R
          targetPng.data[idx + 1] = 0; // G
          targetPng.data[idx + 2] = 0; // B
          targetPng.data[idx + 3] = alpha;
        }
      }
    }
  }
}

// Hàm blit pixel với hòa trộn kênh alpha
function blitWithAlpha(src, srcX, srcY, w, h, dst, dstX, dstY) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = srcX + x;
      const sy = srcY + y;
      if (sx < 0 || sx >= src.width || sy < 0 || sy >= src.height) continue;

      const dx = dstX + x;
      const dy = dstY + y;
      if (dx < 0 || dx >= dst.width || dy < 0 || dy >= dst.height) continue;

      const sIdx = (sy * src.width + sx) * 4;
      const dIdx = (dy * dst.width + dx) * 4;

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

function saveDual(png, relPathInNpcs) {
  const buf = PNG.sync.write(png);
  const p1 = path.join(NPCS_DIR, relPathInNpcs);
  const p2 = path.join(VILLAGERS_DIR, relPathInNpcs);
  fs.writeFileSync(p1, buf);
  fs.writeFileSync(p2, buf);
  console.log(`Saved: ${p1} & ${p2} (${png.width}x${png.height})`);
}

// =========================================================================
// 1. HOẠT ẢNH QUỲ CHỐNG KIẾM CANH LỬA (campfire_knight_pray_sheet.png)
// 12 frames từ Pray.png (4 cols x 3 rows của ô block 128x64) -> 768x64 px
// =========================================================================
console.log('=== 1. Processing Campfire Knight Pray Spritesheet ===');
const praySrcPath = path.join(SL_DIR, 'Pray.png');
const praySrc = PNG.sync.read(fs.readFileSync(praySrcPath));

const praySheet = new PNG({ width: 768, height: 64 });
praySheet.data.fill(0); // Nền RGBA trong suốt

const prayCols = 4;
const prayRows = 3;
const totalPrayFrames = 12;

for (let f = 0; f < totalPrayFrames; f++) {
  const col = f % prayCols;
  const row = Math.floor(f / prayCols);

  // Ô block gốc: 128x64. Lấy vùng chính giữa 64px: x = 32..95, y = 0..63
  const srcX = col * 128 + 32;
  const srcY = row * 64;
  const dstX = f * 64;
  const dstY = 0;

  // 1. Vẽ bóng đổ elip mềm dưới chân bàn chân (alpha 0.25)
  drawSoftGroundShadow(praySheet, dstX, dstY, 64, 64);

  // 2. Ghép sprite nhân vật chuẩn Nearest-Neighbor lên trên bóng đổ
  blitWithAlpha(praySrc, srcX, srcY, 64, 64, praySheet, dstX, dstY);
}

saveDual(praySheet, 'campfire_knight_pray_sheet.png');

// =========================================================================
// 2. HOẠT ẢNH ĐỨNG TRÒ CHUYỆN (campfire_knight_idle_sheet.png)
// 8 frames từ Idle.png (2 cols x 4 rows của ô block 128x64) -> 512x64 px
// =========================================================================
console.log('=== 2. Processing Campfire Knight Idle Spritesheet ===');
const idleSrcPath = path.join(SL_DIR, 'Idle.png');
const idleSrc = PNG.sync.read(fs.readFileSync(idleSrcPath));

const idleSheet = new PNG({ width: 512, height: 64 });
idleSheet.data.fill(0); // Nền RGBA trong suốt

const idleCols = 2;
const idleRows = 4;
const totalIdleFrames = 8;

for (let f = 0; f < totalIdleFrames; f++) {
  const col = f % idleCols;
  const row = Math.floor(f / idleCols);

  // Ô block gốc: 128x64. Lấy vùng giữa 64px: x = 32..95, y = 0..63
  const srcX = col * 128 + 32;
  const srcY = row * 64;
  const dstX = f * 64;
  const dstY = 0;

  // 1. Vẽ bóng đổ elip mềm dưới chân (alpha 0.25)
  drawSoftGroundShadow(idleSheet, dstX, dstY, 64, 64);

  // 2. Ghép sprite nhân vật chuẩn Nearest-Neighbor lên trên bóng đổ
  blitWithAlpha(idleSrc, srcX, srcY, 64, 64, idleSheet, dstX, dstY);
}

saveDual(idleSheet, 'campfire_knight_idle_sheet.png');

// =========================================================================
// 3. CHÂN DUNG NPC HIỆP SĨ CANH LỬA (portrait_campfire_knight.png)
// Cắt vùng đầu vai từ frame 0 của Idle.png và phóng to Nearest-Neighbor lên 64x64 px
// =========================================================================
console.log('=== 3. Processing Campfire Knight Portrait ===');
// Frame 0 của Idle.png: x=[48..79], y=[16..47] (vùng 32x32 bao trọn nón giáp bạc, khe mắt, cổ và giáp vai)
const cropX = 48;
const cropY = 16;
const cropSize = 32;

const portrait = new PNG({ width: 64, height: 64 });
portrait.data.fill(0); // Nền RGBA trong suốt

for (let y = 0; y < 64; y++) {
  for (let x = 0; x < 64; x++) {
    const sx = cropX + Math.floor(x * cropSize / 64);
    const sy = cropY + Math.floor(y * cropSize / 64);
    const sIdx = (sy * idleSrc.width + sx) * 4;
    const dIdx = (y * 64 + x) * 4;

    for (let c = 0; c < 4; c++) {
      portrait.data[dIdx + c] = idleSrc.data[sIdx + c];
    }
  }
}

saveDual(portrait, 'portrait_campfire_knight.png');

console.log('=== All Campfire Knight assets standardized successfully! ===');
