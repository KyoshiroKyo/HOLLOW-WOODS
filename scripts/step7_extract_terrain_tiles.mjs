/**
 * HOLLOW WOODS V3.0 – SCRIPT TRÍCH XUẤT TILE MẶT ĐẤT TERRAIN (PASS T07)
 * Trích xuất từ:
 *   - forest_Tileset.png (128×240)
 *   - castle_cobble_road.png (16×16)
 *   - castle_stone_floor.png (16×16)
 * 
 * Xuất vào:
 *   - public/assets/environment/tiles/:
 *     1. tile_forest_grass.png  (32×32 px - Nền cỏ rừng sương mù)
 *     2. tile_dirt_trail.png    (32×32 px - Đường mòn đất)
 *     3. tile_swamp_mud.png     (32×32 px - Bùn rêu đầm lầy Silent Mire)
 *     4. tile_cobble_road.png   (16×16 px - Đường đá cuội làng Bellhollow)
 *     5. tile_stone_floor.png   (16×16 px - Sân đá Miếu Chuông cổ)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const PROJECT_ROOT = process.cwd();
const TILESET_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'tilesets');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'tiles');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 1. Nạp các tileset gốc
const forestPng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'forest_Tileset.png')));
const cobblePng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'castle_cobble_road.png')));
const stonePng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'castle_stone_floor.png')));

console.log('[PASS T07] Đã nạp thành công forest_Tileset, castle_cobble_road và castle_stone_floor!');

/**
 * Trích xuất một vùng từ sourcePng và lưu thành file png mới
 */
function extractRegion(sourcePng, rect, fileName, label) {
  const target = new PNG({ width: rect.w, height: rect.h });

  for (let y = 0; y < rect.h; y++) {
    for (let x = 0; x < rect.w; x++) {
      const srcIdx = ((rect.y + y) * sourcePng.width + (rect.x + x)) << 2;
      const dstIdx = (y * rect.w + x) << 2;

      target.data[dstIdx] = sourcePng.data[srcIdx];
      target.data[dstIdx + 1] = sourcePng.data[srcIdx + 1];
      target.data[dstIdx + 2] = sourcePng.data[srcIdx + 2];
      target.data[dstIdx + 3] = sourcePng.data[srcIdx + 3];
    }
  }

  const outPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outPath, PNG.sync.write(target));
  console.log(`✓ [${label}] Xuất thành công: ${fileName} (${rect.w}×${rect.h} px) -> ${outPath}`);
}

// 1. Tile cỏ rừng (Forest Grass 32×32 px - lấy 4 ô cỏ 16x16 ở góc trên trái forest_Tileset)
extractRegion(forestPng, { x: 0, y: 0, w: 32, h: 32 }, 'tile_forest_grass.png', 'Tile Nền Cỏ Rừng');

// 2. Tile đường mòn đất (Dirt Trail 32×32 px - lấy 4 ô đường đất ở cột 6..7 hàng 0..1)
extractRegion(forestPng, { x: 96, y: 0, w: 32, h: 32 }, 'tile_dirt_trail.png', 'Tile Đường Mòn Đất');

// 3. Tile bùn đầm lầy (Swamp Mud 32×32 px - lấy 4 ô rêu nước hàng 10..11)
extractRegion(forestPng, { x: 0, y: 160, w: 32, h: 32 }, 'tile_swamp_mud.png', 'Tile Bùn Đầm Lầy');

// 4. Tile đường đá cuội làng Bellhollow (16×16 px)
extractRegion(cobblePng, { x: 0, y: 0, w: 16, h: 16 }, 'tile_cobble_road.png', 'Tile Đường Đá Cuội Làng');

// 5. Tile sân gạch đá Miếu Chuông cổ (16×16 px)
extractRegion(stonePng, { x: 0, y: 0, w: 16, h: 16 }, 'tile_stone_floor.png', 'Tile Sân Gạch Đá Miếu Chuông');

console.log('[PASS T07] Hoàn thành trích xuất toàn bộ 5 tile địa hình mặt đất pixel art!');

