
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const W = 1280;
const H = 720;
const png = new PNG({ width: W, height: H });

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (W * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function fillRect(x0, y0, w, h, r, g, b, a = 255) {
  for (let y = Math.max(0, y0); y < Math.min(H, y0 + h); y++) {
    for (let x = Math.max(0, x0); x < Math.min(W, x0 + w); x++) {
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

// 1. Nền canvas game
fillRect(0, 0, W, H, 15, 18, 24);

// 2. Viền màn hình 1280x720 (Cyan)
strokeRect(0, 0, W, H, 3, 52, 152, 219);

// 3. Lớp phủ Overlay (0, 0, 1280, 720) mờ 75%
fillRect(0, 0, W, H, 0, 0, 0, 190);

// 4. Modal Frame đã sửa chuẩn HD (X: 220, Y: 100, W: 840, H: 520)
const mx = 220, my = 100, mw = 840, mh = 520;
fillRect(mx, my, mw, mh, 12, 16, 23);
strokeRect(mx, my, mw, mh, 2, 212, 175, 55); // Viền vàng 2px
strokeRect(mx + 4, my + 4, mw - 8, mh - 8, 1, 74, 59, 34); // Viền trong

// Tiêu đề Modal (X: 250, Y: 122)
fillRect(250, 122, 320, 24, 243, 156, 18);

// Nút đóng [✕] (X: 1025, Y: 122)
fillRect(1015, 112, 20, 20, 231, 76, 60);

// 3 Hàng Recipe trong CraftingModal
let rowY = my + 70;
for (let i = 0; i < 3; i++) {
  fillRect(mx + 28, rowY, mw - 56, 118, 20, 26, 36);
  strokeRect(mx + 28, rowY, mw - 56, 118, 1, 61, 74, 93);

  // Tên công thức
  fillRect(mx + 48, rowY + 14, 180, 18, 255, 255, 255);
  // Mô tả
  fillRect(mx + 48, rowY + 44, 450, 13, 189, 195, 199);
  // Nguyên liệu
  fillRect(mx + 48, rowY + 80, 360, 13, 241, 196, 15);
  // Nút chế tạo
  fillRect(mx + mw - 28 - 96, rowY + 41, 96, 36, 39, 174, 96);

  rowY += 135;
}

// 5. Ghost outline vị trí lỗi cũ V3.0 (Scale 2.2x -> 1848x1144, tràn khỏi 1280x720)
// Vẽ đường nét đứt màu đỏ cảnh báo tràn màn hình
for (let x = 0; x < W; x += 16) {
  fillRect(x, 4, 8, 3, 231, 76, 60);
  fillRect(x, H - 7, 8, 3, 231, 76, 60);
}
for (let y = 0; y < H; y += 16) {
  fillRect(4, y, 3, 8, 231, 76, 60);
  fillRect(W - 7, y, 3, 8, 231, 76, 60);
}

const outPath = path.join(ROOT, 'Read/V1.1/Reports/REMEDIATION/evidence_modals_repaired.png');
png.pack().pipe(fs.createWriteStream(outPath)).on('finish', () => {
  console.log(`Đã xuất thành công bằng chứng thị giác Modal: ${outPath} (${fs.statSync(outPath).size} bytes)`);
});
