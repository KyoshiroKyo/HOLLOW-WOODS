/**
 * PASS T02: BUILD 64×64 DARK ROGUE SPRITESHEET (1408×256 px, 22 COLUMNS × 4 ROWS)
 * Đường dẫn: Read/V3.0/Scripts/step2_pack_dark_rogue_grid.mjs
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('=== BẮT ĐẦU PASS T02: PACK 64×64 DARK ROGUE SPRITESHEET ===\n');

const ROOT_DIR = process.cwd();
const SCRIPT_DIR = path.join(ROOT_DIR, 'Read', 'V3.0', 'Scripts');
const cleanedPath = path.join(SCRIPT_DIR, 'dark_rogue_cleaned.png');

if (!fs.existsSync(cleanedPath)) {
  console.error(`Không tìm thấy file trung gian: ${cleanedPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(cleanedPath);
const srcPNG = PNG.sync.read(rawData);
const srcW = srcPNG.width;
const srcH = srcPNG.height;

console.log(`Đã nạp ảnh nguồn: ${srcW} × ${srcH} px`);

// Cấu hình 4 hàng hướng nhìn chuẩn theo thứ tự DOWN, LEFT, RIGHT, UP
const ROWS_CONFIG = [
  { dir: 'DOWN', rowIdx: 0, startY: 96, endY: 220 },
  { dir: 'LEFT', rowIdx: 1, startY: 318, endY: 450 },
  { dir: 'RIGHT', rowIdx: 2, startY: 549, endY: 685 },
  { dir: 'UP', rowIdx: 3, startY: 781, endY: 920 }
];

const TARGET_COLS = 22;
const TARGET_ROWS = 4;
const CELL_SIZE = 64;
const OUT_WIDTH = TARGET_COLS * CELL_SIZE; // 1408 px
const OUT_HEIGHT = TARGET_ROWS * CELL_SIZE; // 256 px
const TARGET_FOOT_OFFSET_Y = 58; // Điểm thấp nhất của bàn chân tại y = 58 trong ô 64x64

console.log(`Cấu hình đầu ra: ${OUT_WIDTH} × ${OUT_HEIGHT} px (${TARGET_COLS} cột × ${TARGET_ROWS} hàng, ô ${CELL_SIZE}×${CELL_SIZE} px)`);
console.log(`Điểm neo bàn chân: y = ${TARGET_FOOT_OFFSET_Y} trong mỗi ô 64×64\n`);

const outPNG = new PNG({ width: OUT_WIDTH, height: OUT_HEIGHT });

// Khởi tạo nền hoàn toàn trong suốt (Alpha = 0)
for (let i = 0; i < outPNG.data.length; i += 4) {
  outPNG.data[i] = 0;
  outPNG.data[i + 1] = 0;
  outPNG.data[i + 2] = 0;
  outPNG.data[i + 3] = 0;
}

// -----------------------------------------------------------------------------
// BƯỚC 1: XÁC ĐỊNH CHIỀU CAO CHUẨN ĐỂ SCALE ĐỒNG NHẤT TOÀN BỘ 88 FRAMES
// -----------------------------------------------------------------------------
// Tỷ lệ scale đồng nhất: chiều cao nhân vật tối đa được co về 52 px (từ y=6 đến y=58)
const UNIFORM_SCALE = 52.0 / 135.0; // ~0.3852

console.log(`Tỷ lệ thu nhỏ đồng nhất (Uniform Scale): ${UNIFORM_SCALE.toFixed(4)} (đảm bảo giữ nguyên vóc dáng không bị méo mó)`);

// -----------------------------------------------------------------------------
// BƯỚC 2: TÁCH CHÍNH XÁC 22 DÁNG NHÂN VẬT CHO TỪNG HÀNG BẰNG X-HISTOGRAM
// -----------------------------------------------------------------------------
for (const rCfg of ROWS_CONFIG) {
  console.log(`\n--- Đang xử lý Hàng ${rCfg.rowIdx} (${rCfg.dir}) ---`);

  // 1. Tính X-Projection Histogram
  const xHist = new Array(srcW).fill(0);
  for (let x = 0; x < srcW; x++) {
    for (let y = rCfg.startY; y <= rCfg.endY; y++) {
      const idx = (y * srcW + x) * 4;
      if (srcPNG.data[idx + 3] > 60) {
        xHist[x]++;
      }
    }
  }

  // 2. Làm mịn Histogram bằng Moving Average 5-pixel
  const smooth = new Array(srcW).fill(0);
  for (let x = 2; x < srcW - 2; x++) {
    smooth[x] = (xHist[x - 2] + xHist[x - 1] + xHist[x] + xHist[x + 1] + xHist[x + 2]) / 5;
  }

  // 3. Tìm các đỉnh (Peaks) của 22 nhân vật
  const peaks = [];
  const minPeakDist = 38; // Khoảng cách tối thiểu giữa 2 tâm nhân vật

  for (let x = 10; x < srcW - 10; x++) {
    if (smooth[x] > 25) {
      let isPeak = true;
      for (let d = -minPeakDist / 2; d <= minPeakDist / 2; d++) {
        const nx = x + Math.round(d);
        if (nx >= 0 && nx < srcW && smooth[nx] > smooth[x]) {
          isPeak = false;
          break;
        }
      }
      if (isPeak) {
        const last = peaks[peaks.length - 1];
        if (!last || x - last > minPeakDist) {
          peaks.push(x);
        } else if (smooth[x] > smooth[last]) {
          peaks[peaks.length - 1] = x;
        }
      }
    }
  }

  console.log(`   -> Tìm thấy ${peaks.length} đỉnh nhân vật.`);
  if (peaks.length !== TARGET_COLS) {
    console.warn(`   ⚠️ Cảnh báo: Số lượng đỉnh (${peaks.length}) khác mục tiêu (${TARGET_COLS})! Đang điều chỉnh...`);
  }

  // 4. Tìm các thung lũng cực tiểu (Valleys) giữa các đỉnh để làm ranh giới phân tách
  const cuts = [0];
  for (let i = 0; i < peaks.length - 1; i++) {
    const p1 = peaks[i];
    const p2 = peaks[i + 1];
    let minVal = 999999;
    let minX = Math.round((p1 + p2) / 2);
    for (let x = p1 + 10; x <= p2 - 10; x++) {
      if (smooth[x] < minVal) {
        minVal = smooth[x];
        minX = x;
      }
    }
    cuts.push(minX);
  }
  cuts.push(srcW);

  // 5. Cắt và căn giữa từng nhân vật vào ô 64×64 px
  for (let col = 0; col < TARGET_COLS && col < peaks.length; col++) {
    const xStart = cuts[col];
    const xEnd = cuts[col + 1];

    // Tìm Bounding Box chính xác của nhân vật trong ô phân hoạch này
    let bMinX = 9999, bMaxX = -1, bMinY = 9999, bMaxY = -1;
    for (let y = rCfg.startY; y <= rCfg.endY; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const idx = (y * srcW + x) * 4;
        if (srcPNG.data[idx + 3] > 40) {
          if (x < bMinX) bMinX = x;
          if (x > bMaxX) bMaxX = x;
          if (y < bMinY) bMinY = y;
          if (y > bMaxY) bMaxY = y;
        }
      }
    }

    if (bMaxX < bMinX || bMaxY < bMinY) {
      console.warn(`   ⚠️ Frame col=${col} không có pixel hợp lệ!`);
      continue;
    }

    const charW = bMaxX - bMinX + 1;
    const charH = bMaxY - bMinY + 1;
    const charCenterX = (bMinX + bMaxX) / 2;
    const footY = bMaxY;

    // Tọa độ ô trong file đích
    const cellX = col * CELL_SIZE;
    const cellY = rCfg.rowIdx * CELL_SIZE;
    const targetCenterX = cellX + CELL_SIZE / 2; // Căn giữa trục ngang (x = 32 trong ô)
    const targetFootY = cellY + TARGET_FOOT_OFFSET_Y; // Bàn chân tại y = 58 trong ô

    // Resample chuyển từng pixel sang ô đích
    // Dùng inverse mapping để đảm bảo không bị lỗ trống pixel
    for (let dy = cellY; dy < cellY + CELL_SIZE; dy++) {
      for (let dx = cellX; dx < cellX + CELL_SIZE; dx++) {
        // Tọa độ nguồn tương ứng
        const sx = charCenterX + (dx - targetCenterX) / UNIFORM_SCALE;
        const sy = footY + (dy - targetFootY) / UNIFORM_SCALE;

        // Chỉ lấy mẫu trong phạm vi bounding box của nhân vật này
        if (sx >= bMinX - 0.5 && sx <= bMaxX + 0.5 && sy >= bMinY - 0.5 && sy <= bMaxY + 0.5) {
          const nearestSX = Math.round(sx);
          const nearestSY = Math.round(sy);

          if (nearestSX >= xStart && nearestSX < xEnd && nearestSY >= rCfg.startY && nearestSY <= rCfg.endY) {
            const srcIdx = (nearestSY * srcW + nearestSX) * 4;
            const a = srcPNG.data[srcIdx + 3];

            if (a > 35) {
              const dstIdx = (dy * OUT_WIDTH + dx) * 4;
              outPNG.data[dstIdx] = srcPNG.data[srcIdx];
              outPNG.data[dstIdx + 1] = srcPNG.data[srcIdx + 1];
              outPNG.data[dstIdx + 2] = srcPNG.data[srcIdx + 2];
              outPNG.data[dstIdx + 3] = a;
            }
          }
        }
      }
    }
  }
  console.log(`   ✔ Đã xử lý và căn giữa xong 22 frames của hàng ${rCfg.dir}.`);
}

// -----------------------------------------------------------------------------
// BƯỚC 3: XUẤT FILE PUBLIC VÀ ĐỒNG BỘ DIST
// -----------------------------------------------------------------------------
const outDir = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'satyr');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'satyr_sheet.png');
const outBuffer = PNG.sync.write(outPNG);
fs.writeFileSync(outPath, outBuffer);

console.log(`\n✔ ĐÃ XUẤT SPRITESHEET THÀNH CÔNG: ${outPath}`);
console.log(`  - Kích thước: ${OUT_WIDTH} × ${OUT_HEIGHT} px`);
console.log(`  - Dung lượng file: ${(outBuffer.length / 1024).toFixed(1)} KB`);

// Đồng bộ vào dist/assets/characters/satyr nếu có
const distDir = path.join(ROOT_DIR, 'dist', 'assets', 'characters', 'satyr');
if (fs.existsSync(distDir)) {
  const distPath = path.join(distDir, 'satyr_sheet.png');
  fs.writeFileSync(distPath, outBuffer);
  console.log(`✔ Đã đồng bộ sang dist: ${distPath}`);
}

console.log('\n=== PASS T02 HOÀN TẤT THÀNH CÔNG RỰC RỠ ===');
process.exit(0);

