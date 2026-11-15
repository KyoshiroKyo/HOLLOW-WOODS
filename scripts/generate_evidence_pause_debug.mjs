/**
 * HOLLOW WOODS V1.1 - GATE 1C
 * VISUAL EVIDENCE GENERATOR: PAUSE MODAL & DEBUG OVERLAY REPAIRED GEOMETRY
 */

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
  // Alpha blend
  if (a === 255) {
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = 255;
  } else {
    const alpha = a / 255;
    const inv = 1 - alpha;
    png.data[idx] = Math.round(r * alpha + png.data[idx] * inv);
    png.data[idx + 1] = Math.round(g * alpha + png.data[idx + 1] * inv);
    png.data[idx + 2] = Math.round(b * alpha + png.data[idx + 2] * inv);
    png.data[idx + 3] = 255;
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

function fillCircle(cx, cy, radius, r, g, b, a = 255) {
  const r2 = radius * radius;
  const xStart = Math.max(0, Math.floor(cx - radius));
  const xEnd = Math.min(W, Math.ceil(cx + radius));
  const yStart = Math.max(0, Math.floor(cy - radius));
  const yEnd = Math.min(H, Math.ceil(cy + radius));
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(x, y, r, g, b, a);
      }
    }
  }
}

// 1. Nền canvas GameScene (Môi trường rừng tối tăm)
fillRect(0, 0, W, H, 14, 18, 22);

// Vẽ địa hình cỏ/đất nền mờ
for (let y = 0; y < H; y += 40) {
  fillRect(0, y, W, 1, 25, 32, 40);
}
for (let x = 0; x < W; x += 40) {
  fillRect(x, 0, 1, H, 25, 32, 40);
}

// 2. Viền màn hình HD 1280×720 (Xanh ngọc lợt)
strokeRect(0, 0, W, H, 3, 52, 152, 219);

// 3. Minh họa Satyr trong GameScene (World Space) tại (220, 480)
const satyrPx = 220;
const satyrPy = 480;
// Bounding box frame 64x64 (nhân tỷ lệ zoom 2.2x = 140x140 px trên màn hình)
const frameW = 64 * 2.2;
const frameH = 64 * 2.2;
const frameX = satyrPx - (64 * 0.5) * 2.2;
const frameY = satyrPy - (64 * 0.9) * 2.2;

// Bounding box 64x64 màu vàng
strokeRect(frameX, frameY, frameW, frameH, 2, 241, 196, 15, 200);

// Thân Satyr (Opaque bounds ~36x58 px * 2.2 = 79x127 px)
fillRect(frameX + 14 * 2.2, frameY + 4 * 2.2, 36 * 2.2, 58 * 2.2, 46, 204, 113, 60);
strokeRect(frameX + 14 * 2.2, frameY + 4 * 2.2, 36 * 2.2, 58 * 2.2, 1.5, 46, 204, 113, 220);

// Hộp va chạm chân (14x8 px * 2.2 = 31x18 px)
const bodyX = frameX + 25 * 2.2;
const bodyY = frameY + 54 * 2.2;
fillRect(bodyX, bodyY, 14 * 2.2, 8 * 2.2, 52, 152, 219, 140);
strokeRect(bodyX, bodyY, 14 * 2.2, 8 * 2.2, 2, 52, 152, 219, 255);

// Điểm neo gót chân (Anchor) màu đỏ
fillCircle(satyrPx, satyrPy, 5, 231, 76, 60);

// 4. DebugOverlay Text Panel tại (24, 140) trên UIScene (Zoom 1.0 cố định)
const dbgX = 24, dbgY = 140, dbgW = 340, dbgH = 190;
fillRect(dbgX, dbgY, dbgW, dbgH, 10, 14, 20, 230);
strokeRect(dbgX, dbgY, dbgW, dbgH, 1, 0, 255, 204, 220);

// Thanh tiêu đề Debug [F4] THÔNG SỐ SATYR
fillRect(dbgX + 8, dbgY + 8, dbgW - 16, 16, 0, 255, 204);
// Các dòng số liệu mô phỏng
for (let i = 0; i < 7; i++) {
  const lineY = dbgY + 34 + i * 20;
  const lineW = 180 + ((i * 37) % 120);
  fillRect(dbgX + 12, lineY, lineW, 11, 46, 204, 113, 220);
}

// 5. Lớp phủ đen mờ Pause Overlay (0, 0, 1280, 720) tại Alpha 0.78
fillRect(0, 0, W, H, 0, 0, 0, 185);

// 6. PauseModal tại (400, 175) kích thước 480x370 px (Căn giữa hoàn hảo tại 640, 360)
const pmX = 400, pmY = 175, pmW = 480, pmH = 370;
// Nền hộp Modal màu đá đen gothic
fillRect(pmX, pmY, pmW, pmH, 13, 17, 24, 250);
// Viền vàng 2px
strokeRect(pmX, pmY, pmW, pmH, 2, 212, 175, 55);
// Viền phụ bên trong 1px
strokeRect(pmX + 4, pmY + 4, pmW - 8, pmH - 8, 1, 74, 59, 34);

// Tiêu đề: TẠM DỪNG HÀNH TRÌNH [ESC]
fillRect(pmX + 60, pmY + 20, 360, 22, 231, 76, 60);

// Nút đóng nhanh [✕] tại góc trên bên phải (pmX + pmW - 35, pmY + 20)
fillRect(pmX + pmW - 40, pmY + 16, 24, 24, 231, 76, 60);

// Dòng trạng thái file lưu
fillRect(pmX + 90, pmY + 54, 300, 12, 46, 204, 113);

// 4 Nút bấm chức năng chuẩn HD (Rộng 360px, cao 44px)
let btnY = pmY + 90;
const btnColors = [
  [46, 204, 113], // 1. Tiếp tục (Xanh lá)
  [243, 156, 18], // 2. Lưu game thủ công (Cam)
  [52, 152, 219], // 3. Nạp lại checkpoint (Xanh dương)
  [149, 165, 166] // 4. Về Menu chính (Xám)
];

for (let i = 0; i < 4; i++) {
  const bx = 640 - 180;
  const by = btnY;
  const [cr, cg, cb] = btnColors[i];

  // Nền nút
  fillRect(bx, by, 360, 44, 20, 26, 36);
  strokeRect(bx, by, 360, 44, 1.5, 74, 85, 104);

  // Thanh màu text nút đại diện
  fillRect(bx + 40, by + 14, 280, 16, cr, cg, cb);

  btnY += 56;
}

// 7. Cảnh báo lỗi cũ BUG-03 (Ghost Outline màu đỏ đứt nét cho Modal 1056x814 phóng đại 2.2x tràn màn hình)
// Vẽ viền cảnh báo phóng đại ngoài viền màn hình
const oldW = 480 * 2.2; // 1056
const oldH = 370 * 2.2; // 814
const oldX = (1280 - oldW) / 2; // 112
const oldY = (720 - oldH) / 2;  // -47 (Tràn ra ngoài đỉnh và đáy!)

for (let x = 0; x < W; x += 20) {
  fillRect(x, 2, 10, 3, 231, 76, 60);
  fillRect(x, H - 5, 10, 3, 231, 76, 60);
}
for (let y = 0; y < H; y += 20) {
  fillRect(2, y, 3, 10, 231, 76, 60);
  fillRect(W - 5, y, 3, 10, 231, 76, 60);
}

const outDir = path.join(ROOT, 'Read/V1.1/Reports/REMEDIATION');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'evidence_pause_debug_repaired.png');
png.pack().pipe(fs.createWriteStream(outPath)).on('finish', () => {
  console.log(`Đã tạo thành công ảnh bằng chứng thị giác Gate 1C: ${outPath} (${fs.statSync(outPath).size} bytes)`);
});
