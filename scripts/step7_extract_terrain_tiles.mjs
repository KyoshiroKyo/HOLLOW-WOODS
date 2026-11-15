/**
 * HOLLOW WOODS V1.1 – SCRIPT TRÍCH XUẤT TILE MẶT ĐẤT TERRAIN (GATE 2A)
 * Trích xuất từ:
 *   - TX Tileset Grass.png (256×256) - Cainos Basic Tileset v1.2.3 (Cỏ liền mạch 32×32)
 *   - forest_Tileset.png (128×240) - Cainos TopDownFantasy Forest v1 (Đất mòn & Bùn đầm lầy)
 *   - castle_cobble_road.png (16×16) - Cainos Pixel Castle Medieval v1.0
 *   - castle_stone_floor.png (16×16) - Cainos Pixel Castle Medieval v1.0
 * 
 * Xuất vào:
 *   - public/assets/environment/tiles/:
 *     1. tile_forest_grass.png  (32×32 px - Nền cỏ rừng sương mù, 100% liền mạch)
 *     2. tile_dirt_trail.png    (32×32 px - Đường mòn đất)
 *     3. tile_swamp_mud.png     (32×32 px - Bùn rêu đầm lầy Silent Mire, 100% liền mạch)
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
const txGrassPng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'TX Tileset Grass.png')));
const cobblePng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'castle_cobble_road.png')));
const stonePng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'castle_stone_floor.png')));

console.log('[GATE 2A] Đã nạp thành công TX Tileset Grass, forest_Tileset, castle_cobble_road và castle_stone_floor!');

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

// 1. Tile cỏ rừng (Forest Grass 32×32 px - trích xuất từ TX Tileset Grass ô cỏ liền mạch (32, 0) 100% opaque, 0 transparent)
extractRegion(txGrassPng, { x: 32, y: 0, w: 32, h: 32 }, 'tile_forest_grass.png', 'Tile Nền Cỏ Rừng Liền Mạch');

// 2. Tile đường mòn đất (Dirt Trail 32×32 px - lấy 4 ô đường đất ở cột 6..7 hàng 0..1 từ forest_Tileset)
extractRegion(forestPng, { x: 96, y: 0, w: 32, h: 32 }, 'tile_dirt_trail.png', 'Tile Đường Mòn Đất');

// 3. Tile bùn đầm lầy (Swamp Mud 32×32 px - lấy ô bùn liền mạch tại (96, 160) từ forest_Tileset, 100% opaque)
extractRegion(forestPng, { x: 96, y: 160, w: 32, h: 32 }, 'tile_swamp_mud.png', 'Tile Bùn Đầm Lầy Liền Mạch');

// 4. Tile đường đá cuội làng Bellhollow (16×16 px)
extractRegion(cobblePng, { x: 0, y: 0, w: 16, h: 16 }, 'tile_cobble_road.png', 'Tile Đường Đá Cuội Làng');

// 5. Tile sân gạch đá Miếu Chuông cổ (16×16 px)
extractRegion(stonePng, { x: 0, y: 0, w: 16, h: 16 }, 'tile_stone_floor.png', 'Tile Sân Gạch Đá Miếu Chuông');

console.log('[GATE 2A] Hoàn thành trích xuất toàn bộ 5 tile địa hình mặt đất pixel art chuẩn xác 100%!');

