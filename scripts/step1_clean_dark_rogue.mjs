/**
 * PASS T01: EXTRACT DARK ROGUE PORTRAIT & CLEAN TRANSPARENT BACKGROUND
 * Đường dẫn: Read/V3.0/Scripts/step1_clean_dark_rogue.mjs
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('=== BẮT ĐẦU PASS T01: EXTRACT PORTRAIT & CLEAN SPRITESHEET ===\n');

const ROOT_DIR = process.cwd();
const DARK_ROGUE_DIR = path.join(ROOT_DIR, 'Pixel_Art', 'Dark Rogue');
const SCRIPT_DIR = path.join(ROOT_DIR, 'Read', 'V3.0', 'Scripts');

if (!fs.existsSync(SCRIPT_DIR)) {
  fs.mkdirSync(SCRIPT_DIR, { recursive: true });
}

// -----------------------------------------------------------------------------
// PHẦN 1: CẮT CHÂN DUNG 64×64 TỪ a_detailed_game_asset_reference_sprite_sheet_in_a.png
// -----------------------------------------------------------------------------
console.log('1. Đang xử lý chân dung từ Sprite Sheet gốc...');

const sheet1Path = path.join(DARK_ROGUE_DIR, 'a_detailed_game_asset_reference_sprite_sheet_in_a.png');
if (!fs.existsSync(sheet1Path)) {
  console.error(`Không tìm thấy file: ${sheet1Path}`);
  process.exit(1);
}

const rawSheet1 = fs.readFileSync(sheet1Path);
const sheet1 = PNG.sync.read(rawSheet1);

// Vùng ô chân dung góc trên bên trái (bỏ qua viền tím bao ngoài):
// Viền tím: X: 4..9 và 111..116, Y: 4..12 và 111..116
const cropX = 10;
const cropY = 13;
const cropW = 100;
const cropH = 98;

console.log(`   -> Vùng crop chân dung: X=${cropX}, Y=${cropY}, W=${cropW}, H=${cropH}`);

// Tạo buffer tạm cho vùng crop
const tempCrop = new PNG({ width: cropW, height: cropH });

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcX = cropX + x;
    const srcY = cropY + y;
    const srcIdx = (srcY * sheet1.width + srcX) * 4;
    const dstIdx = (y * cropW + x) * 4;

    const r = sheet1.data[srcIdx];
    const g = sheet1.data[srcIdx + 1];
    const b = sheet1.data[srcIdx + 2];

    // Kiểm tra và xóa viền tím nếu còn sót mép
    const isPurple = (r > 70 && b > 70 && g < 45) || (r - g > 35 && b - g > 35);
    const isDarkBg = (r < 24 && g < 15 && b < 24);

    if (isPurple) {
      // Thay viền tím bằng màu nền tối đồng nhất của ô chân dung
      tempCrop.data[dstIdx] = 16;
      tempCrop.data[dstIdx + 1] = 12;
      tempCrop.data[dstIdx + 2] = 20;
      tempCrop.data[dstIdx + 3] = 255;
    } else if (isDarkBg) {
      tempCrop.data[dstIdx] = 18;
      tempCrop.data[dstIdx + 1] = 14;
      tempCrop.data[dstIdx + 2] = 22;
      tempCrop.data[dstIdx + 3] = 255;
    } else {
      tempCrop.data[dstIdx] = r;
      tempCrop.data[dstIdx + 1] = g;
      tempCrop.data[dstIdx + 2] = b;
      tempCrop.data[dstIdx + 3] = 255;
    }
  }
}

// Resample chất lượng cao về đúng 64×64 px (Bilinear Interpolation)
const TARGET_PORTRAIT_SIZE = 64;
const portrait64 = new PNG({ width: TARGET_PORTRAIT_SIZE, height: TARGET_PORTRAIT_SIZE });

const scaleX = cropW / TARGET_PORTRAIT_SIZE;
const scaleY = cropH / TARGET_PORTRAIT_SIZE;

for (let dy = 0; dy < TARGET_PORTRAIT_SIZE; dy++) {
  for (let dx = 0; dx < TARGET_PORTRAIT_SIZE; dx++) {
    const srcRealX = dx * scaleX;
    const srcRealY = dy * scaleY;

    const x0 = Math.floor(srcRealX);
    const y0 = Math.floor(srcRealY);
    const x1 = Math.min(x0 + 1, cropW - 1);
    const y1 = Math.min(y0 + 1, cropH - 1);

    const xDiff = srcRealX - x0;
    const yDiff = srcRealY - y0;

    const i00 = (y0 * cropW + x0) * 4;
    const i10 = (y0 * cropW + x1) * 4;
    const i01 = (y1 * cropW + x0) * 4;
    const i11 = (y1 * cropW + x1) * 4;

    const dstIdx = (dy * TARGET_PORTRAIT_SIZE + dx) * 4;

    for (let c = 0; c < 4; c++) {
      const top = tempCrop.data[i00 + c] * (1 - xDiff) + tempCrop.data[i10 + c] * xDiff;
      const bottom = tempCrop.data[i01 + c] * (1 - xDiff) + tempCrop.data[i11 + c] * xDiff;
      portrait64.data[dstIdx + c] = Math.round(top * (1 - yDiff) + bottom * yDiff);
    }
  }
}

const portraitOutPath = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'satyr', 'satyr_portrait.png');
const portraitBuffer = PNG.sync.write(portrait64);
fs.writeFileSync(portraitOutPath, portraitBuffer);
console.log(`   ✔ Đã lưu chân dung 64×64 px vào: ${portraitOutPath}`);

// -----------------------------------------------------------------------------
// PHẦN 2: LỌC SẠCH PIXEL NỀN ĐEN NGOÀI RÌA TRONG DarkRogue_Transparent_SpriteSheet.png
// -----------------------------------------------------------------------------
console.log('\n2. Đang lọc sạch nền đen ngoài rìa trong DarkRogue_Transparent_SpriteSheet.png...');

const sheet2Path = path.join(DARK_ROGUE_DIR, 'DarkRogue_Transparent_SpriteSheet.png');
if (!fs.existsSync(sheet2Path)) {
  console.error(`Không tìm thấy file: ${sheet2Path}`);
  process.exit(1);
}

const rawSheet2 = fs.readFileSync(sheet2Path);
const sheet2 = PNG.sync.read(rawSheet2);
const w2 = sheet2.width;
const h2 = sheet2.height;

console.log(`   -> Kích thước Sprite Sheet: ${w2} × ${h2}`);

// Bước 1: Xóa toàn bộ noise bán trong suốt yếu (a <= 35) trên toàn bộ canvas
let weakAlphaCleaned = 0;
for (let i = 0; i < sheet2.data.length; i += 4) {
  const a = sheet2.data[i + 3];
  if (a > 0 && a <= 35) {
    sheet2.data[i] = 0;
    sheet2.data[i + 1] = 0;
    sheet2.data[i + 2] = 0;
    sheet2.data[i + 3] = 0;
    weakAlphaCleaned++;
  }
}
console.log(`   -> Đã dọn sạch ${weakAlphaCleaned} pixel semi-transparent noise (a <= 35).`);

// Bước 2: Flood-Fill từ các cạnh biên ảnh để xóa sạch nền đen ngoài rìa
const visited = new Uint8Array(w2 * h2);
const queue = [];

// Khởi tạo các pixel biên ngoài (rìa 4 cạnh)
for (let x = 0; x < w2; x++) {
  // Top row
  visited[x] = 1;
  queue.push(x, 0);
  // Bottom row
  const bPos = (h2 - 1) * w2 + x;
  visited[bPos] = 1;
  queue.push(x, h2 - 1);
}
for (let y = 1; y < h2 - 1; y++) {
  // Left col
  const lPos = y * w2;
  visited[lPos] = 1;
  queue.push(0, y);
  // Right col
  const rPos = y * w2 + (w2 - 1);
  visited[rPos] = 1;
  queue.push(w2 - 1, y);
}

// Thêm các pixel trong suốt sẵn có (a === 0) vào queue để lan tỏa
for (let y = 0; y < h2; y++) {
  for (let x = 0; x < w2; x++) {
    const pos = y * w2 + x;
    if (!visited[pos] && sheet2.data[pos * 4 + 3] === 0) {
      visited[pos] = 1;
      queue.push(x, y);
    }
  }
}

let floodCleaned = 0;
let head = 0;

while (head < queue.length) {
  const cx = queue[head++];
  const cy = queue[head++];

  const neighbors = [
    [cx + 1, cy],
    [cx - 1, cy],
    [cx, cy + 1],
    [cx, cy - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < w2 && ny >= 0 && ny < h2) {
      const nPos = ny * w2 + nx;
      if (!visited[nPos]) {
        const nIdx = nPos * 4;
        const r = sheet2.data[nIdx];
        const g = sheet2.data[nIdx + 1];
        const b = sheet2.data[nIdx + 2];
        const a = sheet2.data[nIdx + 3];

        // Điều kiện pixel nền đen ngoài rìa:
        // 1. Đã là trong suốt (a === 0) -> tiếp tục lan truyền
        // 2. Hoặc là pixel rất tối (r <= 22, g <= 22, b <= 22) kết nối với nền ngoài
        // 3. Hoặc alpha thấp (a < 120) và màu tối
        const isTransparent = (a === 0);
        const isDarkEdge = (r <= 22 && g <= 22 && b <= 22);
        const isDimNoise = (a < 120 && Math.max(r, g, b) < 45);

        if (isTransparent || isDarkEdge || isDimNoise) {
          visited[nPos] = 1;
          if (a > 0) {
            sheet2.data[nIdx] = 0;
            sheet2.data[nIdx + 1] = 0;
            sheet2.data[nIdx + 2] = 0;
            sheet2.data[nIdx + 3] = 0;
            floodCleaned++;
          }
          queue.push(nx, ny);
        }
      }
    }
  }
}
console.log(`   -> Đã dọn sạch ${floodCleaned} pixel nền đen ngoài rìa qua Flood-Fill.`);

// Bước 3: Dọn sạch các đốm pixel mồ côi (isolated noise)
let isolatedCleaned = 0;
for (let y = 1; y < h2 - 1; y++) {
  for (let x = 1; x < w2 - 1; x++) {
    const idx = (y * w2 + x) * 4;
    const a = sheet2.data[idx + 3];
    if (a > 0) {
      const r = sheet2.data[idx];
      const g = sheet2.data[idx + 1];
      const b = sheet2.data[idx + 2];

      // Nếu pixel rất tối và xung quanh hầu như là trong suốt
      if (Math.max(r, g, b) < 30) {
        let transparentNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * w2 + (x + dx)) * 4;
            if (sheet2.data[nIdx + 3] === 0) transparentNeighbors++;
          }
        }
        if (transparentNeighbors >= 6) {
          sheet2.data[idx] = 0;
          sheet2.data[idx + 1] = 0;
          sheet2.data[idx + 2] = 0;
          sheet2.data[idx + 3] = 0;
          isolatedCleaned++;
        }
      }
    }
  }
}
console.log(`   -> Đã dọn sạch ${isolatedCleaned} pixel đốm mồ côi (isolated noise).`);

// Ghi file kết quả trung gian
const cleanedOutPath = path.join(SCRIPT_DIR, 'dark_rogue_cleaned.png');
const cleanedBuffer = PNG.sync.write(sheet2);
fs.writeFileSync(cleanedOutPath, cleanedBuffer);
console.log(`   ✔ Đã lưu sprite sheet sạch vào: ${cleanedOutPath}`);

console.log('\n=== PASS T01 HOÀN TẤT THÀNH CÔNG RỰC RỠ ===');
process.exit(0);

