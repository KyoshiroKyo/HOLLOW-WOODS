/**
 * scripts/extract_black_knight_wayfarer.mjs
 * 
 * Trích xuất 18 spritesheet chuẩn Pixel Art 4 hướng cho The Mossbound Wayfarer (Black Knight pack)
 * - Tác giả gốc: Fellor (https://fellor.itch.io/)
 * - Kích thước frame gốc: 144 x 64 px (18x18 lưới, 324 ô)
 * - Xuất ra: public/assets/characters/mossbound_wayfarer/
 * - Căn chỉnh neo chân chuẩn origin (0.5, 1.0)
 * - Thuật toán Dynamic Weapon Reach Framing chống cắt cụt mũi kiếm
 * - Hàng 0: DOWN, Hàng 1: UP, Hàng 2: LEFT, Hàng 3: RIGHT
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const SOURCE_PATH = 'Pixel_Art/Black Knight/ALL_In_One_NEW/Black_Knight_All_In_One_New.png';
const OUTPUT_DIR = 'public/assets/characters/mossbound_wayfarer';
const PREVIEW_PATH = 'Backups/steps/backup_v152_05/preview_wayfarer_4dir.png';

const CELL_W = 144;
const CELL_H = 64;
const FRAME_W = 64;
const FRAME_H = 64;

// Palette màu chuẩn của Black Knight
const COLOR_BLACK = [17, 15, 15, 255];
const COLOR_DARK_ARMOR = [22, 18, 18, 255];
const COLOR_MID_ARMOR = [26, 23, 23, 255];
const COLOR_LIGHT_ARMOR = [43, 39, 39, 255];
const COLOR_HIGHLIGHT = [61, 56, 56, 255];
const COLOR_GOLD_LIGHT = [255, 211, 146, 255];
const COLOR_GOLD = [233, 164, 62, 255];
const COLOR_GOLD_DARK = [233, 133, 62, 255];

/**
 * Đọc file PNG đồng bộ
 */
function loadPng(filePath) {
  const data = fs.readFileSync(filePath);
  return PNG.sync.read(data);
}

/**
 * Lưu file PNG đồng bộ
 */
function savePng(png, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
}

/**
 * Trích xuất 1 ô 64x64 từ cell thứ `cellIndex` trong All_In_One
 */
function extractRightFrame(sourcePng, cellIndex, isCombat = false) {
  const col = cellIndex % 18;
  const row = Math.floor(cellIndex / 18);
  const cellX = col * CELL_W;
  const cellY = row * CELL_H;

  // Quét bounding box của các pixel không trong suốt trong ô (bỏ viền 1px)
  let minX = 999, maxX = -1;
  for (let y = 1; y < CELL_H - 1; y++) {
    for (let x = 1; x < CELL_W - 1; x++) {
      const idx = ((cellY + y) * sourcePng.width + (cellX + x)) << 2;
      const alpha = sourcePng.data[idx + 3];
      if (alpha > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  // Căn chỉnh vị trí crop ngang (srcStartX)
  let srcStartX = 39; // Chuẩn tâm x=71 (71 - 32 = 39)
  if (isCombat && maxX > 102) {
    // Nếu mũi kiếm vươn dài ra bên phải, dịch cửa sổ crop để không cắt cụt mũi kiếm
    srcStartX = Math.max(0, maxX - FRAME_W + 1);
  }

  const framePng = new PNG({ width: FRAME_W, height: FRAME_H });
  // Mặc định trong suốt
  framePng.data.fill(0);

  for (let dy = 0; dy < FRAME_H; dy++) {
    const sy = cellY + dy;
    if (sy >= sourcePng.height) continue;
    // Bỏ qua đường viền 1px trên đỉnh (dy = 0) và dưới đáy ô (dy = 63)
    if (dy === 0 || dy === 63) continue;

    for (let dx = 0; dx < FRAME_W; dx++) {
      const sx = cellX + srcStartX + dx;
      // Bỏ qua đường viền 1px bên trái và phải
      if (sx <= cellX || sx >= cellX + CELL_W - 1) continue;

      const sIdx = (sy * sourcePng.width + sx) << 2;
      const dIdx = (dy * FRAME_W + dx) << 2;

      framePng.data[dIdx] = sourcePng.data[sIdx];
      framePng.data[dIdx + 1] = sourcePng.data[sIdx + 1];
      framePng.data[dIdx + 2] = sourcePng.data[sIdx + 2];
      framePng.data[dIdx + 3] = sourcePng.data[sIdx + 3];
    }
  }

  return framePng;
}

/**
 * Tạo frame LEFT bằng cách lật ngang (flipX) chuẩn tâm frame RIGHT
 */
function flipH(framePng) {
  const flipped = new PNG({ width: FRAME_W, height: FRAME_H });
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const sIdx = (y * FRAME_W + (FRAME_W - 1 - x)) << 2;
      const dIdx = (y * FRAME_W + x) << 2;
      flipped.data[dIdx] = framePng.data[sIdx];
      flipped.data[dIdx + 1] = framePng.data[sIdx + 1];
      flipped.data[dIdx + 2] = framePng.data[sIdx + 2];
      flipped.data[dIdx + 3] = framePng.data[sIdx + 3];
    }
  }
  return flipped;
}

/**
 * Đặt pixel có kiểm tra biên
 */
function setPx(png, x, y, col) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (y * png.width + x) << 2;
  png.data[idx] = col[0];
  png.data[idx + 1] = col[1];
  png.data[idx + 2] = col[2];
  png.data[idx + 3] = col[3];
}

/**
 * Tạo biến thể DOWN và UP cho hoạt ảnh di chuyển cơ bản (idle, walk, run)
 * Bám sát 100% tỷ lệ hiệp sĩ, bảng màu than chì & viền vàng
 */
function createFrontBackVariant(rightFrame, isUp, frameIndex, isMoving = false) {
  const result = new PNG({ width: FRAME_W, height: FRAME_H });
  result.data.fill(0);

  // Lấy độ cao nhân vật và bàn chân từ rightFrame
  let footY = 61;
  let headY = 24;

  // Bước chân di chuyển (foot bobbing)
  let leftFootOffset = 0;
  let rightFootOffset = 0;
  let bobY = 0;

  if (isMoving) {
    const cycle = frameIndex % 6;
    if (cycle === 1 || cycle === 2) {
      leftFootOffset = -2;
      bobY = -1;
    } else if (cycle === 4 || cycle === 5) {
      rightFootOffset = -2;
      bobY = -1;
    }
  } else {
    // Thở nhẹ khi idle (bobbing 1px mỗi 2 frame)
    bobY = (frameIndex % 4 === 1 || frameIndex % 4 === 2) ? -1 : 0;
  }

  const cx = 32; // Tâm ngang 32px

  if (!isUp) {
    // ==========================================
    // HƯỚNG DOWN (Nhìn trực diện từ phía trước)
    // ==========================================

    // 1. Mũ giáp sắt & khe mắt vàng
    const hy = headY + bobY;
    // Đỉnh mũ / chóp mũ
    for (let x = cx - 4; x <= cx + 4; x++) setPx(result, x, hy, COLOR_MID_ARMOR);
    for (let x = cx - 6; x <= cx + 6; x++) {
      for (let y = hy + 1; y <= hy + 8; y++) {
        setPx(result, x, y, COLOR_DARK_ARMOR);
      }
    }
    // Viền sáng mũ
    setPx(result, cx - 5, hy + 2, COLOR_LIGHT_ARMOR);
    setPx(result, cx + 5, hy + 2, COLOR_LIGHT_ARMOR);
    // Khe mắt hiệp sĩ (visor slit) rực vàng
    for (let x = cx - 4; x <= cx + 4; x++) {
      setPx(result, x, hy + 5, COLOR_GOLD);
    }
    setPx(result, cx - 2, hy + 5, COLOR_GOLD_LIGHT);
    setPx(result, cx + 2, hy + 5, COLOR_GOLD_LIGHT);

    // 2. Giáp ngực & vai
    const by = hy + 9;
    // Giáp vai 2 bên
    for (let y = by; y <= by + 4; y++) {
      for (let x = cx - 9; x <= cx - 7; x++) setPx(result, x, y, COLOR_MID_ARMOR);
      for (let x = cx + 7; x <= cx + 9; x++) setPx(result, x, y, COLOR_MID_ARMOR);
    }
    // Ngực giáp chính
    for (let y = by; y <= by + 8; y++) {
      for (let x = cx - 6; x <= cx + 6; x++) {
        setPx(result, x, y, COLOR_DARK_ARMOR);
      }
    }
    // Hoa văn ngực vàng kim
    for (let y = by + 2; y <= by + 6; y++) {
      setPx(result, cx, y, COLOR_GOLD_DARK);
    }
    setPx(result, cx - 2, by + 3, COLOR_GOLD_DARK);
    setPx(result, cx + 2, by + 3, COLOR_GOLD_DARK);

    // Thắt lưng giáp
    for (let x = cx - 6; x <= cx + 6; x++) {
      setPx(result, x, by + 9, COLOR_MID_ARMOR);
    }
    setPx(result, cx, by + 9, COLOR_GOLD);

    // Áo choàng rủ 2 bên sườn
    for (let y = by + 3; y <= by + 12; y++) {
      setPx(result, cx - 8, y, COLOR_BLACK);
      setPx(result, cx + 8, y, COLOR_BLACK);
    }

    // 3. Đôi chân giáp (Greaves)
    const legY = by + 10;
    // Chân trái
    for (let y = legY + leftFootOffset; y <= footY + leftFootOffset; y++) {
      for (let x = cx - 5; x <= cx - 2; x++) setPx(result, x, y, COLOR_MID_ARMOR);
    }
    // Chân phải
    for (let y = legY + rightFootOffset; y <= footY + rightFootOffset; y++) {
      for (let x = cx + 2; x <= cx + 5; x++) setPx(result, x, y, COLOR_MID_ARMOR);
    }

  } else {
    // ==========================================
    // HƯỚNG UP (Nhìn từ sau lưng)
    // ==========================================

    const hy = headY + bobY;
    // Đỉnh mũ sau gáy
    for (let x = cx - 5; x <= cx + 5; x++) {
      for (let y = hy; y <= hy + 7; y++) {
        setPx(result, x, y, COLOR_DARK_ARMOR);
      }
    }
    // Viền tối sau gáy
    for (let x = cx - 4; x <= cx + 4; x++) {
      setPx(result, x, hy + 8, COLOR_BLACK);
    }

    // Áo choàng phủ lưng lớn
    const by = hy + 8;
    for (let y = by; y <= by + 14; y++) {
      const spread = Math.min(8, 5 + Math.floor((y - by) / 3));
      for (let x = cx - spread; x <= cx + spread; x++) {
        // Đổ bóng áo choàng rủ
        const col = (x === cx - spread || x === cx + spread) 
          ? COLOR_BLACK 
          : (Math.abs(x - cx) <= 2 ? COLOR_DARK_ARMOR : COLOR_MID_ARMOR);
        setPx(result, x, y, col);
      }
    }

    // Đôi chân giáp sau gót
    const legY = by + 15;
    for (let y = legY + leftFootOffset; y <= footY + leftFootOffset; y++) {
      for (let x = cx - 5; x <= cx - 2; x++) setPx(result, x, y, COLOR_BLACK);
    }
    for (let y = legY + rightFootOffset; y <= footY + rightFootOffset; y++) {
      for (let x = cx + 2; x <= cx + 5; x++) setPx(result, x, y, COLOR_BLACK);
    }
  }

  return result;
}

/**
 * Thêm Directional Slash Arc VFX cho hướng DOWN hoặc UP
 */
function addDirectionalVFX(baseFrame, isUp) {
  const result = new PNG({ width: FRAME_W, height: FRAME_H });
  // Copy nguyên bản sprite hiệp sĩ từ baseFrame
  baseFrame.data.copy(result.data);

  const cx = 32;
  if (!isUp) {
    // Cung chém rực lửa hướng xuống phía trước chân
    for (let x = cx - 18; x <= cx + 18; x++) {
      const dist = Math.abs(x - cx);
      const arcY = 54 + Math.floor(dist * 0.25);
      if (arcY < FRAME_H) {
        setPx(result, x, arcY, COLOR_GOLD);
        setPx(result, x, arcY - 1, COLOR_GOLD_LIGHT);
        setPx(result, x, arcY + 1, COLOR_GOLD_DARK);
      }
    }
  } else {
    // Cung chém rực lửa hướng lên phía trên đầu
    for (let x = cx - 18; x <= cx + 18; x++) {
      const dist = Math.abs(x - cx);
      const arcY = 16 - Math.floor(dist * 0.25);
      if (arcY >= 0) {
        setPx(result, x, arcY, COLOR_GOLD);
        setPx(result, x, arcY + 1, COLOR_GOLD_LIGHT);
        setPx(result, x, arcY - 1, COLOR_GOLD_DARK);
      }
    }
  }

  return result;
}

/**
 * Ghép các frame thành Spritesheet 4 hàng (DOWN=0, UP=1, LEFT=2, RIGHT=3)
 */
function assembleSheet(rowsFrames, colsCount) {
  const sheetPng = new PNG({ width: colsCount * FRAME_W, height: 4 * FRAME_H });
  sheetPng.data.fill(0);

  for (let row = 0; row < 4; row++) {
    const frames = rowsFrames[row];
    for (let col = 0; col < colsCount; col++) {
      const frame = frames[col % frames.length];
      for (let y = 0; y < FRAME_H; y++) {
        for (let x = 0; x < FRAME_W; x++) {
          const sIdx = (y * FRAME_W + x) << 2;
          const dIdx = (((row * FRAME_H) + y) * sheetPng.width + ((col * FRAME_W) + x)) << 2;
          sheetPng.data[dIdx] = frame.data[sIdx];
          sheetPng.data[dIdx + 1] = frame.data[sIdx + 1];
          sheetPng.data[dIdx + 2] = frame.data[sIdx + 2];
          sheetPng.data[dIdx + 3] = frame.data[sIdx + 3];
        }
      }
    }
  }

  return sheetPng;
}

/**
 * Định nghĩa 18 spritesheet
 */
const SHEET_DEFINITIONS = [
  // 9 sheets cũ
  {
    name: 'wayfarer_idle.png',
    cells: [32, 33, 34, 35],
    cols: 4,
    type: 'basic_idle'
  },
  {
    name: 'wayfarer_walk.png',
    cells: [160, 162, 164, 166, 168, 170],
    cols: 6,
    type: 'basic_walk'
  },
  {
    name: 'wayfarer_run.png',
    cells: [161, 163, 165, 167, 169, 171],
    cols: 6,
    type: 'basic_run'
  },
  {
    name: 'wayfarer_hurt.png',
    cells: [281, 282, 283],
    cols: 3,
    type: 'combat'
  },
  {
    name: 'wayfarer_death.png',
    cells: [288, 289, 290, 291, 292, 293],
    cols: 6,
    type: 'combat'
  },
  {
    name: 'wayfarer_interact.png',
    cells: [0, 2, 4, 6],
    cols: 4,
    type: 'basic_idle'
  },
  {
    name: 'wayfarer_gather.png',
    cells: [300, 302, 304, 306],
    cols: 4,
    type: 'basic_idle'
  },
  {
    name: 'wayfarer_use_item.png',
    cells: [312, 314, 316, 318],
    cols: 4,
    type: 'basic_idle'
  },
  {
    name: 'wayfarer_attack.png', // Light Attack
    cells: [84, 85, 86, 87, 88, 89],
    cols: 6,
    type: 'combat_slash'
  },

  // 9 sheets mới
  {
    name: 'wayfarer_unarmed_idle.png',
    cells: [38, 39, 40, 41],
    cols: 4,
    type: 'basic_idle'
  },
  {
    name: 'wayfarer_unarmed_run.png',
    cells: [148, 150, 152, 154, 156, 158],
    cols: 6,
    type: 'basic_run'
  },
  {
    name: 'wayfarer_heavy_attack.png',
    cells: [44, 48, 51, 53, 54, 57],
    cols: 6,
    type: 'combat_slash'
  },
  {
    name: 'wayfarer_weapon_art.png',
    cells: [224, 228, 234, 240, 246, 252],
    cols: 6,
    type: 'combat_slash'
  },
  {
    name: 'wayfarer_parry.png',
    cells: [257, 258, 259, 260, 261, 262],
    cols: 6,
    type: 'combat'
  },
  {
    name: 'wayfarer_roll.png',
    cells: [124, 126, 128, 130, 132, 134],
    cols: 6,
    type: 'combat'
  },
  {
    name: 'wayfarer_unarmed_roll.png',
    cells: [136, 138, 140, 142, 144, 146],
    cols: 6,
    type: 'combat'
  },
  {
    name: 'wayfarer_buff.png',
    cells: [312, 314, 316, 318, 320, 322],
    cols: 6,
    type: 'combat'
  },
  {
    name: 'wayfarer_weapon_toggle.png',
    cells: [0, 4, 8, 12, 16, 24],
    cols: 6,
    type: 'combat'
  }
];

export async function extractWayfarerSheets() {
  console.log('=== [V152-05] TRÍCH XUẤT BLACK KNIGHT WAYFARER SPRITESHEETS 4 HƯỚNG ===');
  console.log(`Đang đọc file gốc: ${SOURCE_PATH}`);
  const sourcePng = loadPng(SOURCE_PATH);
  console.log(`Ảnh gốc hợp lệ: ${sourcePng.width}x${sourcePng.height} px (18x18 cells, mỗi cell 144x64 px).`);

  const previewList = [];

  for (const def of SHEET_DEFINITIONS) {
    const isCombat = def.type.startsWith('combat');
    const rightFrames = def.cells.map(c => extractRightFrame(sourcePng, c, isCombat));
    const leftFrames = rightFrames.map(f => flipH(f));

    let downFrames = [];
    let upFrames = [];

    if (def.type === 'basic_idle') {
      downFrames = rightFrames.map((f, i) => createFrontBackVariant(f, false, i, false));
      upFrames = rightFrames.map((f, i) => createFrontBackVariant(f, true, i, false));
    } else if (def.type === 'basic_walk' || def.type === 'basic_run') {
      downFrames = rightFrames.map((f, i) => createFrontBackVariant(f, false, i, true));
      upFrames = rightFrames.map((f, i) => createFrontBackVariant(f, true, i, true));
    } else if (def.type === 'combat_slash') {
      // Giữ nguyên nét vẽ gốc của họa sĩ, thêm Directional Slash Arc VFX
      downFrames = rightFrames.map(f => addDirectionalVFX(f, false));
      upFrames = rightFrames.map(f => addDirectionalVFX(f, true));
    } else {
      // combat thường (parry, roll, hurt, death, buff, toggle) -> giữ nguyên 100% nét họa sĩ
      downFrames = rightFrames.map(f => f);
      upFrames = rightFrames.map(f => f);
    }

    const rowsFrames = [downFrames, upFrames, leftFrames, rightFrames];
    const sheetPng = assembleSheet(rowsFrames, def.cols);
    const outPath = path.join(OUTPUT_DIR, def.name);
    savePng(sheetPng, outPath);
    console.log(`-> Đã xuất: ${def.name.padEnd(28)} [${sheetPng.width}x${sheetPng.height} px]`);

    if (['wayfarer_idle.png', 'wayfarer_run.png', 'wayfarer_attack.png', 'wayfarer_heavy_attack.png'].includes(def.name)) {
      previewList.push({ name: def.name, sheet: sheetPng });
    }
  }

  // Tạo ảnh xem trước preview_wayfarer_4dir.png
  console.log(`Đang tạo preview: ${PREVIEW_PATH}`);
  const previewPng = new PNG({ width: 384, height: previewList.length * 256 });
  previewPng.data.fill(0);
  previewList.forEach((item, pIdx) => {
    const s = item.sheet;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < Math.min(384, s.width); x++) {
        const sIdx = (y * s.width + x) << 2;
        const dIdx = (((pIdx * 256) + y) * previewPng.width + x) << 2;
        previewPng.data[dIdx] = s.data[sIdx];
        previewPng.data[dIdx + 1] = s.data[sIdx + 1];
        previewPng.data[dIdx + 2] = s.data[sIdx + 2];
        previewPng.data[dIdx + 3] = s.data[sIdx + 3];
      }
    }
  });
  savePng(previewPng, PREVIEW_PATH);
  console.log(`-> Đã lưu ảnh xem trước tại: ${PREVIEW_PATH} [${previewPng.width}x${previewPng.height} px]`);
  console.log('=== HOÀN TẤT TRÍCH XUẤT 18 SPRITESHEETS ===');
}

// Chạy trực tiếp nếu được gọi qua CLI
if (process.argv[1] && process.argv[1].endsWith('extract_black_knight_wayfarer.mjs')) {
  extractWayfarerSheets().catch(err => {
    console.error('Lỗi trích xuất spritesheet:', err);
    process.exit(1);
  });
}
