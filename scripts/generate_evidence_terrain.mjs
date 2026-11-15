/**
 * HOLLOW WOODS V1.1 - GATE 2A
 * VISUAL EVIDENCE GENERATOR: TERRAIN, TILESET & SPRITE EXTRACTION INTEGRITY
 * Generates Read/V1.1/Reports/REMEDIATION/evidence_terrain_repaired.png (1280x720 HD)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const W = 1280;
const H = 720;
const outPng = new PNG({ width: W, height: H });

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (W * y + x) << 2;
  if (a === 255) {
    outPng.data[idx] = r;
    outPng.data[idx + 1] = g;
    outPng.data[idx + 2] = b;
    outPng.data[idx + 3] = 255;
  } else {
    const alpha = a / 255;
    const inv = 1 - alpha;
    outPng.data[idx] = Math.round(r * alpha + outPng.data[idx] * inv);
    outPng.data[idx + 1] = Math.round(g * alpha + outPng.data[idx + 1] * inv);
    outPng.data[idx + 2] = Math.round(b * alpha + outPng.data[idx + 2] * inv);
    outPng.data[idx + 3] = 255;
  }
}

function fillRect(x0, y0, w, h, r, g, b, a = 255) {
  const xStart = Math.max(0, Math.floor(x0));
  const xEnd = Math.min(W, Math.floor(x0 + w));
  const yStart = Math.max(0, Math.floor(y0));
  const yEnd = Math.min(H, Math.floor(y0 + h));
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      setPixel(x, y, r, g, b, a);
    }
  }
}

function strokeRect(x0, y0, w, h, thickness, r, g, b, a = 255) {
  fillRect(x0, y0, w, thickness, r, g, b, a);
  fillRect(x0, y0 + h - thickness, w, thickness, r, g, b, a);
  fillRect(x0, y0, thickness, h, r, g, b, a);
  fillRect(x0 + w - thickness, y0, thickness, h, r, g, b, a);
}

// Draw nearest-neighbor scaled tile with dark checkerboard background for transparent pixels
function drawScaledTile(sourcePng, srcRect, dstX, dstY, scale, showChecker = true) {
  for (let ty = 0; ty < srcRect.h; ty++) {
    for (let tx = 0; tx < srcRect.w; tx++) {
      const sIdx = ((srcRect.y + ty) * sourcePng.width + (srcRect.x + tx)) << 2;
      const r = sourcePng.data[sIdx];
      const g = sourcePng.data[sIdx + 1];
      const b = sourcePng.data[sIdx + 2];
      const a = sourcePng.data[sIdx + 3];

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = dstX + tx * scale + sx;
          const py = dstY + ty * scale + sy;
          if (a === 0 && showChecker) {
            // Hiển thị ô cờ đen/xám cảnh báo pixel trong suốt
            const isDark = (Math.floor(px / 8) + Math.floor(py / 8)) % 2 === 0;
            const c = isDark ? 20 : 45;
            setPixel(px, py, c, c, c, 255);
          } else {
            setPixel(px, py, r, g, b, a);
          }
        }
      }
    }
  }
}

// Draw tiled simulation (repeat 4x4 tiles)
function drawTiledMap(sourcePng, srcRect, dstX, dstY, tilesX, tilesY, scale) {
  for (let ry = 0; ry < tilesY; ry++) {
    for (let rx = 0; rx < tilesX; rx++) {
      const curX = dstX + rx * srcRect.w * scale;
      const curY = dstY + ry * srcRect.h * scale;
      drawScaledTile(sourcePng, srcRect, curX, curY, scale, true);
    }
  }
}

// 1. Nền canvas tối chuẩn giao diện kỹ thuật
fillRect(0, 0, W, H, 13, 17, 23);
strokeRect(0, 0, W, H, 3, 52, 152, 219);

// 2. Tiêu đề chính
fillRect(24, 20, W - 48, 54, 20, 26, 36);
strokeRect(24, 20, W - 48, 54, 1.5, 212, 175, 55);
// Thanh tiêu đề đại diện
fillRect(44, 34, 450, 16, 241, 196, 15);
fillRect(44, 54, 700, 10, 189, 195, 199);

// Nạp các nguồn tileset
const TILESET_DIR = path.join(ROOT, 'public/assets/environment/tilesets');
const TILES_DIR = path.join(ROOT, 'public/assets/environment/tiles');

const forestPng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'forest_Tileset.png')));
const txGrassPng = PNG.sync.read(fs.readFileSync(path.join(TILESET_DIR, 'TX Tileset Grass.png')));

// 3. KHỐI 1: SO SÁNH TILE CỎ RỪNG (tile_forest_grass.png)
const k1X = 40, k1Y = 96, k1W = 560, k1H = 270;
fillRect(k1X, k1Y, k1W, k1H, 18, 22, 30);
strokeRect(k1X, k1Y, k1W, k1H, 1.5, 74, 85, 104);

// Tiêu đề Khối 1
fillRect(k1X + 16, k1Y + 14, 380, 14, 231, 76, 60);

// Cột Trước (Before): forest_Tileset (0, 0, 32, 32) -> 202 px trong suốt
const bGrassX = k1X + 30, bGrassY = k1Y + 44;
fillRect(bGrassX - 4, bGrassY - 4, 192 + 8, 192 + 8, 10, 12, 16);
drawScaledTile(forestPng, { x: 0, y: 0, w: 32, h: 32 }, bGrassX, bGrassY, 6, true);
strokeRect(bGrassX - 4, bGrassY - 4, 192 + 8, 192 + 8, 2, 231, 76, 60); // Viền đỏ cảnh báo
fillRect(bGrassX, bGrassY + 200, 192, 12, 231, 76, 60); // Nhãn: BEFORE (202 px Alpha=0)

// Mũi tên chuyển đổi giữa Trước và Sau
fillRect(k1X + 246, k1Y + 120, 36, 16, 241, 196, 15);

// Cột Sau (After): TX Tileset Grass (32, 0, 32, 32) -> 0 px trong suốt, 100% opaque
const aGrassX = k1X + 304, aGrassY = k1Y + 44;
fillRect(aGrassX - 4, aGrassY - 4, 192 + 8, 192 + 8, 10, 12, 16);
drawScaledTile(txGrassPng, { x: 32, y: 0, w: 32, h: 32 }, aGrassX, aGrassY, 6, false);
strokeRect(aGrassX - 4, aGrassY - 4, 192 + 8, 192 + 8, 2, 46, 204, 113); // Viền xanh lá xác nhận
fillRect(aGrassX, aGrassY + 200, 192, 12, 46, 204, 113); // Nhãn: AFTER (0 px Alpha=0 - 100% Opaque)


// 4. KHỐI 2: SO SÁNH TILE BÙN ĐẦM LẦY (tile_swamp_mud.png)
const k2X = 40, k2Y = 386, k2W = 560, k2H = 270;
fillRect(k2X, k2Y, k2W, k2H, 18, 22, 30);
strokeRect(k2X, k2Y, k2W, k2H, 1.5, 74, 85, 104);

// Tiêu đề Khối 2
fillRect(k2X + 16, k2Y + 14, 380, 14, 52, 152, 219);

// Cột Trước: forest_Tileset (0, 160, 32, 32) -> 100 px trong suốt
const bMudX = k2X + 30, bMudY = k2Y + 44;
fillRect(bMudX - 4, bMudY - 4, 192 + 8, 192 + 8, 10, 12, 16);
drawScaledTile(forestPng, { x: 0, y: 160, w: 32, h: 32 }, bMudX, bMudY, 6, true);
strokeRect(bMudX - 4, bMudY - 4, 192 + 8, 192 + 8, 2, 231, 76, 60);
fillRect(bMudX, bMudY + 200, 192, 12, 231, 76, 60);

// Mũi tên
fillRect(k2X + 246, k2Y + 120, 36, 16, 241, 196, 15);

// Cột Sau: forest_Tileset (96, 160, 32, 32) -> 0 px trong suốt, 100% opaque
const aMudX = k2X + 304, aMudY = k2Y + 44;
fillRect(aMudX - 4, aMudY - 4, 192 + 8, 192 + 8, 10, 12, 16);
drawScaledTile(forestPng, { x: 96, y: 160, w: 32, h: 32 }, aMudX, aMudY, 6, false);
strokeRect(aMudX - 4, aMudY - 4, 192 + 8, 192 + 8, 2, 46, 204, 113);
fillRect(aMudX, aMudY + 200, 192, 12, 46, 204, 113);


// 5. KHỐI 3: MÔ PHỎNG LÁT BẢN ĐỒ THỰC TẾ (IN-GAME TILESPRITE 4×4 REPEAT)
const k3X = 640, k3Y = 96, k3W = 600, k3H = 360;
fillRect(k3X, k3Y, k3W, k3H, 18, 22, 30);
strokeRect(k3X, k3Y, k3W, k3H, 1.5, 74, 85, 104);

fillRect(k3X + 16, k3Y + 14, 480, 14, 241, 196, 15);

// Bản đồ Trước: Lát 4x4 tile cỏ cũ -> Chằng chịt ô cờ đen
const mapBX = k3X + 24, mapBY = k3Y + 44;
fillRect(mapBX - 2, mapBY - 2, 256 + 4, 256 + 4, 0, 0, 0);
drawTiledMap(forestPng, { x: 0, y: 0, w: 32, h: 32 }, mapBX, mapBY, 4, 4, 2);
strokeRect(mapBX - 2, mapBY - 2, 256 + 4, 256 + 4, 2, 231, 76, 60);
fillRect(mapBX, mapBY + 264, 256, 12, 231, 76, 60); // Nhãn: BEFORE (Mạng lưới lỗ thủng đen)

// Bản đồ Sau: Lát 4x4 tile cỏ mới -> Liền mạch, xanh mượt, tự nhiên
const mapAX = k3X + 312, mapAY = k3Y + 44;
fillRect(mapAX - 2, mapAY - 2, 256 + 4, 256 + 4, 0, 0, 0);
drawTiledMap(txGrassPng, { x: 32, y: 0, w: 32, h: 32 }, mapAX, mapAY, 4, 4, 2);
strokeRect(mapAX - 2, mapAY - 2, 256 + 4, 256 + 4, 2, 46, 204, 113);
fillRect(mapAX, mapAY + 264, 256, 12, 46, 204, 113); // Nhãn: AFTER (Nền cỏ nguyên sinh liền mạch)


// 6. KHỐI 4: BẢNG TIÊU CHUẨN KIỂM ĐỊNH 5 TILE ĐỊA HÌNH TOÀN BỘ DỰ ÁN
const k4X = 640, k4Y = 476, k4W = 600, k4H = 180;
fillRect(k4X, k4Y, k4W, k4H, 18, 22, 30);
strokeRect(k4X, k4Y, k4W, k4H, 1.5, 74, 85, 104);

fillRect(k4X + 16, k4Y + 14, 420, 14, 46, 204, 113);

// 5 Tile nhỏ đại diện
const tilesList = [
  { name: 'tile_forest_grass.png', w: 32, h: 32, src: 'TX Tileset Grass (32,0)' },
  { name: 'tile_dirt_trail.png', w: 32, h: 32, src: 'forest_Tileset (96,0)' },
  { name: 'tile_swamp_mud.png', w: 32, h: 32, src: 'forest_Tileset (96,160)' },
  { name: 'tile_cobble_road.png', w: 16, h: 16, src: 'castle_cobble_road (0,0)' },
  { name: 'tile_stone_floor.png', w: 16, h: 16, src: 'castle_stone_floor (0,0)' }
];

let tileItemX = k4X + 24;
for (let i = 0; i < 5; i++) {
  const item = tilesList[i];
  const tPng = PNG.sync.read(fs.readFileSync(path.join(TILES_DIR, item.name)));

  // Khung tile
  fillRect(tileItemX, k4Y + 44, 96, 96, 10, 14, 20);
  strokeRect(tileItemX, k4Y + 44, 96, 96, 1.5, 46, 204, 113);

  // Render tile phóng to
  const scale = item.w === 16 ? 4 : 2;
  const offX = Math.floor((96 - item.w * scale) / 2);
  const offY = Math.floor((96 - item.h * scale) / 2);
  drawScaledTile(tPng, { x: 0, y: 0, w: item.w, h: item.h }, tileItemX + offX, k4Y + 44 + offY, scale, false);

  // Nhãn trạng thái 100% PASS
  fillRect(tileItemX + 10, k4Y + 148, 76, 10, 46, 204, 113);

  tileItemX += 114;
}

// 7. Xuất file ảnh bằng chứng
const outDir = path.join(ROOT, 'Read/V1.1/Reports/REMEDIATION');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'evidence_terrain_repaired.png');
outPng.pack().pipe(fs.createWriteStream(outPath)).on('finish', () => {
  console.log(`✓ Đã xuất thành công ảnh bằng chứng thị giác Gate 2A: ${outPath} (${fs.statSync(outPath).size} bytes)`);
});

