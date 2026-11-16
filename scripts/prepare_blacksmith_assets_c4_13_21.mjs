import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('=== PREPARING BLACKSMITH ASSETS C4-13-21 ===\n');

const srcPath = path.resolve('Pixel_Art/SmithNPC/SpriteSheet.png');
if (!fs.existsSync(srcPath)) {
  console.error('Source SpriteSheet.png not found at', srcPath);
  process.exit(1);
}

const srcBuffer = fs.readFileSync(srcPath);
const srcPng = PNG.sync.read(srcBuffer);
console.log(`Source SpriteSheet size: ${srcPng.width}x${srcPng.height}`);

const FRAME_W = 64;
const FRAME_H = 64;
const NUM_FRAMES = 6;
const SHEET_W = FRAME_W * NUM_FRAMES; // 384
const SHEET_H = FRAME_H; // 64

// 1. Tạo blacksmith_sheet.png (384x64)
const sheetPng = new PNG({ width: SHEET_W, height: SHEET_H });

for (let f = 0; f < NUM_FRAMES; f++) {
  const frameOffsetX = f * FRAME_W;

  // 1a. Thêm bóng đổ elip đen mờ alpha 0.25 (alpha = 64) dưới chân và đe sắt
  const drawEllipseShadow = (cx, cy, rx, ry, alphaVal = 64) => {
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const norm = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        if (norm <= 1.0) {
          const px = frameOffsetX + cx + dx;
          const py = cy + dy;
          if (px >= frameOffsetX && px < frameOffsetX + FRAME_W && py >= 0 && py < FRAME_H) {
            const idx = (py * SHEET_W + px) * 4;
            // Độ mờ giảm nhẹ ở rìa bóng
            const falloff = 1.0 - norm * 0.35;
            const a = Math.round(alphaVal * falloff);
            sheetPng.data[idx] = 0;     // R
            sheetPng.data[idx + 1] = 0; // G
            sheetPng.data[idx + 2] = 0; // B
            sheetPng.data[idx + 3] = a; // A
          }
        }
      }
    }
  };

  // Bóng đổ dưới chân thợ rèn (tâm x: 35, y: 62, bán kính 13x3)
  drawEllipseShadow(35, 62, 13, 3, 64);
  // Bóng đổ dưới chân đe sắt (tâm x: 15, y: 48, bán kính 9x2)
  drawEllipseShadow(15, 48, 9, 2, 56);

  // 1b. Sao chép pixel nhân vật (dịch y - 1 để khớp khung 64px, giữ nguyên Nearest-Neighbor)
  for (let y = 0; y < FRAME_H; y++) {
    const srcY = y + 1; // srcPng có height 65, hàng 0 rỗng
    if (srcY >= srcPng.height) continue;

    for (let x = 0; x < FRAME_W; x++) {
      const srcIdx = (srcY * srcPng.width + (frameOffsetX + x)) * 4;
      const srcA = srcPng.data[srcIdx + 3];

      if (srcA > 15) {
        const dstIdx = (y * SHEET_W + (frameOffsetX + x)) * 4;
        sheetPng.data[dstIdx] = srcPng.data[srcIdx];
        sheetPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
        sheetPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
        sheetPng.data[dstIdx + 3] = srcPng.data[srcIdx + 3];
      }
    }
  }
}

// 2. Tạo npc_blacksmith.png (64x64, lấy Frame 0)
const npcFrame0 = new PNG({ width: FRAME_W, height: FRAME_H });
for (let y = 0; y < FRAME_H; y++) {
  for (let x = 0; x < FRAME_W; x++) {
    const srcIdx = (y * SHEET_W + x) * 4;
    const dstIdx = (y * FRAME_W + x) * 4;
    for (let c = 0; c < 4; c++) {
      npcFrame0.data[dstIdx + c] = sheetPng.data[srcIdx + c];
    }
  }
}

// 3. Tạo portrait_blacksmith.png (64x64, bust crop phóng Nearest-Neighbor 2x)
// Vùng đầu - vai thợ rèn trong frame 0: x: 12..43, y: 1..32 (32x32 px)
const cropX = 12;
const cropY = 1;
const portraitPng = new PNG({ width: 64, height: 64 });
for (let y = 0; y < 64; y++) {
  const srcY = cropY + Math.floor(y / 2);
  for (let x = 0; x < 64; x++) {
    const srcX = cropX + Math.floor(x / 2);
    const srcIdx = (srcY * srcPng.width + srcX) * 4;
    const dstIdx = (y * 64 + x) * 4;
    for (let c = 0; c < 4; c++) {
      portraitPng.data[dstIdx + c] = srcPng.data[srcIdx + c];
    }
  }
}

// Lưu các tập tin đích
const targets = [
  { dir: 'public/assets/characters/villagers', sheet: true, npc: true, portrait: true },
  { dir: 'public/assets/characters/npcs', sheet: true, npc: true, portrait: true }
];

for (const t of targets) {
  const absDir = path.resolve(t.dir);
  if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

  if (t.sheet) {
    const p = path.join(absDir, 'blacksmith_sheet.png');
    fs.writeFileSync(p, PNG.sync.write(sheetPng));
    console.log(`Saved: ${p} (${sheetPng.width}x${sheetPng.height})`);
  }
  if (t.npc) {
    const p = path.join(absDir, 'npc_blacksmith.png');
    fs.writeFileSync(p, PNG.sync.write(npcFrame0));
    console.log(`Saved: ${p} (${npcFrame0.width}x${npcFrame0.height})`);
  }
  if (t.portrait) {
    const p = path.join(absDir, 'portrait_blacksmith.png');
    fs.writeFileSync(p, PNG.sync.write(portraitPng));
    console.log(`Saved: ${p} (${portraitPng.width}x${portraitPng.height})`);
  }
}

console.log('\nAll blacksmith sprites and portraits generated successfully!');
