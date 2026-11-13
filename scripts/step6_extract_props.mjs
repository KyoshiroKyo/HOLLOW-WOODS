/**
 * HOLLOW WOODS V3.0 – SCRIPT TRÍCH XUẤT VẬT THỂ MÔI TRƯỜNG & CỘT ĐÁ RUNE (PASS T06)
 * Trích xuất từ:
 *   - public/assets/environment/tilesets/TX Props with Shadow.png (512×512)
 *   - forest_Decorations.png (nếu cần đối chiếu)
 * 
 * Xuất vào:
 *   - public/assets/environment/sprites/:
 *     1. pillar_moon.png    (Cột Đá Cổ Ngữ Mặt Trăng - Act 4 Puzzle)
 *     2. pillar_root.png    (Cột Đá Cổ Ngữ Rễ Cây - Act 4 Puzzle)
 *     3. pillar_eye.png     (Cột Đá Cổ Ngữ Con Mắt - Act 4 Puzzle)
 *     4. village_well.png   (Giếng nước đá làng Bellhollow)
 *     5. crafting_bench.png (Bàn chế tạo thợ thủ công)
 *     6. stone_altar.png    (Bệ thờ đá cổ kính)
 *     7. wooden_fence.png   (Hàng rào gỗ ranh giới làng)
 *     8. signpost.png       (Biển chỉ đường / Biển gỗ sương mù)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const PROJECT_ROOT = process.cwd();
const PROPS_PATH = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'tilesets', 'TX Props with Shadow.png');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'sprites');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

if (!fs.existsSync(PROPS_PATH)) {
  console.error(`[PASS T06 ERROR] Không tìm thấy file: ${PROPS_PATH}`);
  process.exit(1);
}

const propsBuf = fs.readFileSync(PROPS_PATH);
const propsPng = PNG.sync.read(propsBuf);
console.log(`[PASS T06] Đã nạp TX Props with Shadow (${propsPng.width}×${propsPng.height} px)`);

/**
 * Trích xuất một vùng chữ nhật từ propsPng ra PNG mới
 */
function extractRect(rect) {
  const target = new PNG({ width: rect.w, height: rect.h });
  target.data.fill(0);

  for (let y = 0; y < rect.h; y++) {
    for (let x = 0; x < rect.w; x++) {
      const srcIdx = ((rect.y + y) * propsPng.width + (rect.x + x)) << 2;
      const dstIdx = (y * rect.w + x) << 2;

      target.data[dstIdx] = propsPng.data[srcIdx];
      target.data[dstIdx + 1] = propsPng.data[srcIdx + 1];
      target.data[dstIdx + 2] = propsPng.data[srcIdx + 2];
      target.data[dstIdx + 3] = propsPng.data[srcIdx + 3];
    }
  }
  return target;
}

function setPixel(target, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= target.width || y < 0 || y >= target.height) return;
  const idx = (y * target.width + x) << 2;
  if (a >= 255) {
    target.data[idx] = r;
    target.data[idx + 1] = g;
    target.data[idx + 2] = b;
    target.data[idx + 3] = 255;
  } else if (a > 0) {
    const sa = a / 255;
    const da = target.data[idx + 3] / 255;
    const outA = sa + da * (1 - sa);
    target.data[idx] = Math.round((r * sa + target.data[idx] * da * (1 - sa)) / outA);
    target.data[idx + 1] = Math.round((g * sa + target.data[idx + 1] * da * (1 - sa)) / outA);
    target.data[idx + 2] = Math.round((b * sa + target.data[idx + 2] * da * (1 - sa)) / outA);
    target.data[idx + 3] = Math.round(outA * 255);
  }
}

function savePng(png, fileName, label) {
  const outPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`✓ [${label}] Xuất thành công: ${fileName} (${png.width}×${png.height} px) -> ${outPath}`);
}

console.log('[PASS T06] Bắt đầu trích xuất và hoàn thiện các vật thể môi trường...');

// =========================================================================
// 1. CỘT ĐÁ CỔ NGỮ MẶT TRĂNG (pillar_moon.png: 32×61 px)
// =========================================================================
const pillarMoon = extractRect({ x: 387, y: 2, w: 32, h: 61 });
// Khắc ấn ký Lưỡi Liềm Mặt Trăng phát sáng màu lam bạc (Moon Rune) tại tâm cột x: 12..20, y: 22..32
const moonRune = [
  '  #####  ',
  ' ####### ',
  '####     ',
  '###      ',
  '###      ',
  '###      ',
  '####     ',
  ' ####### ',
  '  #####  '
];
for (let r = 0; r < moonRune.length; r++) {
  for (let c = 0; c < moonRune[r].length; c++) {
    if (moonRune[r][c] === '#') {
      const px = 12 + c;
      const py = 22 + r;
      // Ánh sáng phát quang rực rỡ
      setPixel(pillarMoon, px, py, 140, 210, 255, 255);
      // Ánh hào quang tỏa nhẹ xung quanh
      setPixel(pillarMoon, px - 1, py, 90, 160, 230, 160);
      setPixel(pillarMoon, px + 1, py, 90, 160, 230, 160);
      setPixel(pillarMoon, px, py - 1, 90, 160, 230, 160);
      setPixel(pillarMoon, px, py + 1, 90, 160, 230, 160);
    }
  }
}
savePng(pillarMoon, 'pillar_moon.png', 'Cột Đá Cổ Ngữ Mặt Trăng');

// =========================================================================
// 2. CỘT ĐÁ CỔ NGỮ RỄ CÂY (pillar_root.png: 31×61 px)
// =========================================================================
const pillarRoot = extractRect({ x: 387, y: 98, w: 31, h: 61 });
// Khắc ấn ký Rễ Cây Thần phát sáng màu xanh ngọc bích (Root Rune) tại x: 11..19, y: 22..32
const rootRune = [
  '   ###   ',
  '  #####  ',
  '   ###   ',
  ' #  #  # ',
  ' ## # ## ',
  '  #####  ',
  '   ###   ',
  '  ## ##  ',
  ' ##   ## '
];
for (let r = 0; r < rootRune.length; r++) {
  for (let c = 0; c < rootRune[r].length; c++) {
    if (rootRune[r][c] === '#') {
      const px = 11 + c;
      const py = 22 + r;
      setPixel(pillarRoot, px, py, 90, 240, 140, 255);
      setPixel(pillarRoot, px - 1, py, 60, 180, 100, 160);
      setPixel(pillarRoot, px + 1, py, 60, 180, 100, 160);
      setPixel(pillarRoot, px, py - 1, 60, 180, 100, 160);
      setPixel(pillarRoot, px, py + 1, 60, 180, 100, 160);
    }
  }
}
savePng(pillarRoot, 'pillar_root.png', 'Cột Đá Cổ Ngữ Rễ Cây');

// =========================================================================
// 3. CỘT ĐÁ CỔ NGỮ CON MẮT (pillar_eye.png: 32×52 px)
// =========================================================================
const pillarEye = extractRect({ x: 227, y: 9, w: 32, h: 52 });
// Khắc ấn ký Con Mắt Màn Sương phát sáng màu tím thạch anh (Eye Rune) tại x: 12..20, y: 18..28
const eyeRune = [
  '  #####  ',
  ' ####### ',
  '### # ###',
  '## ### ##',
  '# ##### #',
  '## ### ##',
  '### # ###',
  ' ####### ',
  '  #####  '
];
for (let r = 0; r < eyeRune.length; r++) {
  for (let c = 0; c < eyeRune[r].length; c++) {
    if (eyeRune[r][c] === '#') {
      const px = 12 + c;
      const py = 18 + r;
      setPixel(pillarEye, px, py, 210, 120, 255, 255);
      setPixel(pillarEye, px - 1, py, 160, 80, 220, 160);
      setPixel(pillarEye, px + 1, py, 160, 80, 220, 160);
      setPixel(pillarEye, px, py - 1, 160, 80, 220, 160);
      setPixel(pillarEye, px, py + 1, 160, 80, 220, 160);
    }
  }
}
savePng(pillarEye, 'pillar_eye.png', 'Cột Đá Cổ Ngữ Con Mắt');

// =========================================================================
// 4. GIẾNG NƯỚC ĐÁ LÀNG BELLHOLLOW (village_well.png: 39×46 px)
// =========================================================================
const villageWell = extractRect({ x: 32, y: 18, w: 39, h: 46 });
savePng(villageWell, 'village_well.png', 'Giếng Nước Cổ Làng Bellhollow');

// =========================================================================
// 5. BÀN CHẾ TẠO THỢ THỦ CÔNG (crafting_bench.png: 67×36 px)
// =========================================================================
const craftingBench = extractRect({ x: 288, y: 87, w: 67, h: 36 });
savePng(craftingBench, 'crafting_bench.png', 'Bàn Chế Tạo Dụng Cụ');

// =========================================================================
// 6. BỆ THỜ ĐÁ CỔ KÍNH (stone_altar.png: 60×42 px)
// =========================================================================
const stoneAltar = extractRect({ x: 3, y: 430, w: 60, h: 42 });
savePng(stoneAltar, 'stone_altar.png', 'Bệ Thờ Đá Cổ Kính');

// =========================================================================
// 7. HÀNG RÀO GỖ RANH GIỚI LÀNG (wooden_fence.png: 47×53 px)
// =========================================================================
const woodenFence = extractRect({ x: 29, y: 166, w: 47, h: 53 });
// Nối 2 thanh gỗ giằng ngang giữa 2 cọc rào ở x: 14..32 để thành đoạn rào gỗ chắc chắn
for (let x = 14; x <= 32; x++) {
  // Thanh ngang trên (y = 20..23)
  setPixel(woodenFence, x, 20, 75, 52, 35, 255);
  setPixel(woodenFence, x, 21, 115, 85, 55, 255);
  setPixel(woodenFence, x, 22, 95, 68, 45, 255);
  setPixel(woodenFence, x, 23, 60, 42, 28, 255);

  // Thanh ngang dưới (y = 35..38)
  setPixel(woodenFence, x, 35, 75, 52, 35, 255);
  setPixel(woodenFence, x, 36, 115, 85, 55, 255);
  setPixel(woodenFence, x, 37, 95, 68, 45, 255);
  setPixel(woodenFence, x, 38, 60, 42, 28, 255);
}
savePng(woodenFence, 'wooden_fence.png', 'Hàng Rào Gỗ');

// =========================================================================
// 8. BIỂN CHỈ ĐƯỜNG / BIỂN GỖ SƯƠNG MÙ (signpost.png: 29×32 px)
// =========================================================================
const signpost = extractRect({ x: 99, y: 160, w: 29, h: 32 });
savePng(signpost, 'signpost.png', 'Biển Gỗ Chỉ Đường');

console.log('[PASS T06] Hoàn thành trích xuất xuất sắc toàn bộ 8 vật thể môi trường!');

