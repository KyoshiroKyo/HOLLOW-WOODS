import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const SOURCE_PATH = 'Pixel_Art/Skullwolf/Massacre Sprite Sheet.png';
const OUT_DIR = 'public/assets/characters/monsters';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('Loading source sheet:', SOURCE_PATH);
const srcPng = PNG.sync.read(fs.readFileSync(SOURCE_PATH));
console.log(`Source sheet loaded: ${srcPng.width}x${srcPng.height}`);

// Soft foot shadow generator
function drawShadow(targetPng, targetX, targetY, frameW, frameH, alphaMult = 1.0) {
  const cx = 32;
  const cy = 58;
  const rx = 18;
  const ry = 4;
  const maxAlpha = 64 * alphaMult;

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

// 7 columns x 4 rows = 448 x 256 px
const outPng = new PNG({ width: 448, height: 256 });

// Number of valid frames in each row of the source
const rowFrameCounts = [6, 5, 4, 7];

for (let r = 0; r < 4; r++) {
  const validCount = rowFrameCounts[r];
  for (let c = 0; c < 7; c++) {
    const targetX = c * 64;
    const targetY = r * 64;

    // Use actual frame or clamp to last valid frame
    const srcC = Math.min(c, validCount - 1);

    // Fade shadow on death (row 3)
    let shadowAlpha = 1.0;
    if (r === 3) {
      shadowAlpha = Math.max(0.05, 1.0 - (c / 6) * 0.9);
    }
    drawShadow(outPng, targetX, targetY, 64, 64, shadowAlpha);

    // Copy character pixels with offset (destY = srcY - 5 to align feet at y=58)
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const srcIdx = ((r * 64 + y) * srcPng.width + (srcC * 64 + x)) * 4;
        const a = srcPng.data[srcIdx + 3];
        if (a > 20) {
          const destX = x;
          const destY = y - 5;
          if (destX >= 0 && destX < 64 && destY >= 0 && destY < 64) {
            const destIdx = ((targetY + destY) * outPng.width + (targetX + destX)) * 4;
            outPng.data[destIdx] = srcPng.data[srcIdx];
            outPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
            outPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
            outPng.data[destIdx + 3] = a;
          }
        }
      }
    }
  }
}

const sheetOutPath = path.join(OUT_DIR, 'skull_wolf_sheet.png');
fs.writeFileSync(sheetOutPath, PNG.sync.write(outPng));
console.log(`[PASS] Generated ${sheetOutPath} (448x256 px, 7x4 frames)`);

// Generate portrait_skull_wolf.png (64x64 px)
// Crop the skull head from Cell (0, 0): x=2..28, y=39..55 (26x16 px)
const portraitPng = new PNG({ width: 64, height: 64 });

// Fill background with dark gothic slate (21, 18, 15)
for (let y = 0; y < 64; y++) {
  for (let x = 0; x < 64; x++) {
    const idx = (y * 64 + x) * 4;
    portraitPng.data[idx] = 21;
    portraitPng.data[idx + 1] = 18;
    portraitPng.data[idx + 2] = 15;
    portraitPng.data[idx + 3] = 255;
  }
}

// Draw a subtle dark red / amber rim vignette
for (let y = 0; y < 64; y++) {
  for (let x = 0; x < 64; x++) {
    const dx = x - 32;
    const dy = y - 32;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 24) {
      const idx = (y * 64 + x) * 4;
      const factor = Math.min(1.0, (dist - 24) / 10);
      portraitPng.data[idx] = Math.round(portraitPng.data[idx] * (1 - factor * 0.4) + 60 * factor * 0.4);
      portraitPng.data[idx + 1] = Math.round(portraitPng.data[idx + 1] * (1 - factor * 0.4));
      portraitPng.data[idx + 2] = Math.round(portraitPng.data[idx + 2] * (1 - factor * 0.4));
    }
  }
}

// Scale skull head 2x Nearest-Neighbor and center it
// Skull head source bounds in srcPng: x=2..28, y=39..55
const headSrcX = 2;
const headSrcY = 39;
const headW = 27;
const headH = 17;
const headScale = 2;

const headTargetX = Math.round((64 - headW * headScale) / 2); // (64 - 54) / 2 = 5
const headTargetY = Math.round((64 - headH * headScale) / 2); // (64 - 34) / 2 = 15

for (let dy = 0; dy < headH * headScale; dy++) {
  for (let dx = 0; dx < headW * headScale; dx++) {
    const sx = headSrcX + Math.floor(dx / headScale);
    const sy = headSrcY + Math.floor(dy / headScale);
    const srcIdx = (sy * srcPng.width + sx) * 4;
    const a = srcPng.data[srcIdx + 3];
    if (a > 30) {
      const px = headTargetX + dx;
      const py = headTargetY + dy;
      if (px >= 0 && px < 64 && py >= 0 && py < 64) {
        const destIdx = (py * 64 + px) * 4;
        portraitPng.data[destIdx] = srcPng.data[srcIdx];
        portraitPng.data[destIdx + 1] = srcPng.data[srcIdx + 1];
        portraitPng.data[destIdx + 2] = srcPng.data[srcIdx + 2];
        portraitPng.data[destIdx + 3] = 255;
      }
    }
  }
}

const portraitOutPath = path.join(OUT_DIR, 'portrait_skull_wolf.png');
fs.writeFileSync(portraitOutPath, PNG.sync.write(portraitPng));
console.log(`[PASS] Generated ${portraitOutPath} (64x64 px)`);
console.log('Skull Wolf asset extraction and normalization complete!');
