/**
 * HOLLOW WOODS V3.0 – SCRIPT TRÍCH XUẤT SPRITES CÂY CỐI & MÔI TRƯỜNG PIXEL ART (PASS T04)
 * Trích xuất từ:
 *   - public/assets/environment/tilesets/TX Plant with Shadow.png (512×512)
 *   - public/assets/environment/tilesets/forest_Decorations.png (256×256)
 * Xuất vào:
 *   - public/assets/environment/sprites/
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const PROJECT_ROOT = process.cwd();
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'sprites');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`[PASS T04] Đã tạo thư mục: ${OUT_DIR}`);
}

const PLANT_PATH = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'tilesets', 'TX Plant with Shadow.png');
const DECO_PATH = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'tilesets', 'forest_Decorations.png');

if (!fs.existsSync(PLANT_PATH)) {
  console.error(`[PASS T04 ERROR] Không tìm thấy: ${PLANT_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(DECO_PATH)) {
  console.error(`[PASS T04 ERROR] Không tìm thấy: ${DECO_PATH}`);
  process.exit(1);
}

const plantBuf = fs.readFileSync(PLANT_PATH);
const plantPng = PNG.sync.read(plantBuf);

const decoBuf = fs.readFileSync(DECO_PATH);
const decoPng = PNG.sync.read(decoBuf);

console.log(`[PASS T04] Đã nạp TX Plant with Shadow (${plantPng.width}x${plantPng.height}) và forest_Decorations (${decoPng.width}x${decoPng.height})`);

/**
 * Hàm cắt vùng ảnh hình chữ nhật từ sourcePng và lưu thành file png mới
 */
function extractSprite(sourcePng, rect, fileName, label) {
  const target = new PNG({ width: rect.w, height: rect.h });

  for (let y = 0; y < rect.h; y++) {
    for (let x = 0; x < rect.w; x++) {
      const srcIdx = ((rect.y + y) * sourcePng.width + (rect.x + x)) << 2;
      const dstIdx = (y * rect.w + x) << 2;

      target.data[dstIdx] = sourcePng.data[srcIdx];         // R
      target.data[dstIdx + 1] = sourcePng.data[srcIdx + 1]; // G
      target.data[dstIdx + 2] = sourcePng.data[srcIdx + 2]; // B
      target.data[dstIdx + 3] = sourcePng.data[srcIdx + 3]; // A
    }
  }

  const outPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outPath, PNG.sync.write(target));
  console.log(`✓ [${label}] Xuất thành công: ${fileName} (${rect.w}×${rect.h} px) -> ${outPath}`);
}

// 1. Cắt 3 cây cổ thụ sồi lớn ở nửa trên TX Plant with Shadow.png
extractSprite(plantPng, { x: 24, y: 14, w: 113, h: 139 }, 'tree_oak_1.png', 'Cây cổ thụ sồi 1');
extractSprite(plantPng, { x: 161, y: 17, w: 95, h: 136 }, 'tree_oak_2.png', 'Cây cổ thụ sồi 2');
extractSprite(plantPng, { x: 295, y: 31, w: 83, h: 120 }, 'tree_oak_3.png', 'Cây cổ thụ sồi 3');

// 2. Cắt các bụi rậm rậm rạp ở nửa dưới TX Plant with Shadow.png
extractSprite(plantPng, { x: 216, y: 185, w: 50, h: 44 }, 'bush_dense_1.png', 'Bụi rậm dày đặc 1');
extractSprite(plantPng, { x: 282, y: 186, w: 41, h: 47 }, 'bush_dense_2.png', 'Bụi rậm dày đặc 2');

// 3. Cắt gốc cây rỗng và cây khô từ forest_Decorations.png
extractSprite(decoPng, { x: 75, y: 0, w: 40, h: 32 }, 'hollow_tree.png', 'Gốc cây rỗng cổ thụ');
extractSprite(decoPng, { x: 68, y: 67, w: 24, h: 27 }, 'tree_dead.png', 'Cây khô sương mù');

console.log('[PASS T04] Hoàn thành trích xuất toàn bộ 7 sprites môi trường pixel art!');

