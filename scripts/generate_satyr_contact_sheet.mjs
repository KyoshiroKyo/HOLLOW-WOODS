/**
 * GENERATE NUMBERED 88-FRAME CONTACT SHEET FOR SATYR SPRITE SHEET
 * GATE 3A - VISUAL FRAME AUDIT
 */
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
const satyrSheetPath = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'satyr', 'satyr_sheet.png');

if (!fs.existsSync(satyrSheetPath)) {
  console.error(`Missing satyr_sheet.png at ${satyrSheetPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(satyrSheetPath);
const srcPNG = PNG.sync.read(rawData);

console.log(`Original satyr_sheet.png: ${srcPNG.width} × ${srcPNG.height} px`);

const COLS = 22;
const ROWS = 4;
const CELL_W = 64;
const CELL_H = 64;

// 3x5 Bitmap font for numbers and basic chars
const FONT_3X5 = {
  '0': [
    0b111,
    0b101,
    0b101,
    0b101,
    0b111
  ],
  '1': [
    0b010,
    0b110,
    0b010,
    0b010,
    0b111
  ],
  '2': [
    0b111,
    0b001,
    0b111,
    0b100,
    0b111
  ],
  '3': [
    0b111,
    0b001,
    0b111,
    0b001,
    0b111
  ],
  '4': [
    0b101,
    0b101,
    0b111,
    0b001,
    0b001
  ],
  '5': [
    0b111,
    0b100,
    0b111,
    0b001,
    0b111
  ],
  '6': [
    0b111,
    0b100,
    0b111,
    0b101,
    0b111
  ],
  '7': [
    0b111,
    0b001,
    0b010,
    0b010,
    0b010
  ],
  '8': [
    0b111,
    0b101,
    0b111,
    0b101,
    0b111
  ],
  '9': [
    0b111,
    0b101,
    0b111,
    0b001,
    0b111
  ],
  'F': [
    0b111,
    0b100,
    0b110,
    0b100,
    0b100
  ],
  'D': [
    0b110,
    0b101,
    0b101,
    0b101,
    0b110
  ],
  'O': [
    0b111,
    0b101,
    0b101,
    0b101,
    0b111
  ],
  'W': [
    0b101,
    0b101,
    0b101,
    0b111,
    0b101
  ],
  'N': [
    0b110,
    0b101,
    0b101,
    0b101,
    0b101
  ],
  'L': [
    0b100,
    0b100,
    0b100,
    0b100,
    0b111
  ],
  'E': [
    0b111,
    0b100,
    0b110,
    0b100,
    0b111
  ],
  'T': [
    0b111,
    0b010,
    0b010,
    0b010,
    0b010
  ],
  'R': [
    0b110,
    0b101,
    0b110,
    0b101,
    0b101
  ],
  'I': [
    0b111,
    0b010,
    0b010,
    0b010,
    0b111
  ],
  'G': [
    0b111,
    0b100,
    0b101,
    0b101,
    0b111
  ],
  'H': [
    0b101,
    0b101,
    0b111,
    0b101,
    0b101
  ],
  'U': [
    0b101,
    0b101,
    0b101,
    0b101,
    0b111
  ],
  'P': [
    0b111,
    0b101,
    0b111,
    0b100,
    0b100
  ],
  ':': [
    0b000,
    0b010,
    0b000,
    0b010,
    0b000
  ],
  '-': [
    0b000,
    0b000,
    0b111,
    0b000,
    0b000
  ],
  ' ': [
    0b000,
    0b000,
    0b000,
    0b000,
    0b000
  ]
};

function drawChar(png, startX, startY, char, r = 255, g = 255, b = 255, a = 255) {
  const glyph = FONT_3X5[char.toUpperCase()] || FONT_3X5[' '];
  for (let row = 0; row < 5; row++) {
    const bits = glyph[row];
    for (let col = 0; col < 3; col++) {
      if ((bits >> (2 - col)) & 1) {
        const px = startX + col;
        const py = startY + row;
        if (px >= 0 && px < png.width && py >= 0 && py < png.height) {
          const idx = (py * png.width + px) * 4;
          png.data[idx] = r;
          png.data[idx + 1] = g;
          png.data[idx + 2] = b;
          png.data[idx + 3] = a;
        }
      }
    }
  }
}

function drawText(png, startX, startY, text, r = 255, g = 255, b = 255, a = 255) {
  let currX = startX;
  for (let i = 0; i < text.length; i++) {
    drawChar(png, currX, startY, text[i], r, g, b, a);
    currX += 4; // 3 width + 1 spacing
  }
}

function fillRect(png, x0, y0, w, h, r, g, b, a = 255) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x >= 0 && x < png.width && y >= 0 && y < png.height) {
        const idx = (y * png.width + x) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

// -------------------------------------------------------------
// BẢN 1: Contact Sheet 22 cột × 4 hàng (kích thước đầy đủ)
// Thêm gutter lề trái (48px) cho tên hướng, gutter đỉnh (24px) cho nhóm hành động
// Grid scale: 1x (1408 + 48 = 1456 px, 256 + 24 = 280 px)
// -------------------------------------------------------------
const GUTTER_LEFT = 48;
const GUTTER_TOP = 24;
const OUT_W = srcPNG.width + GUTTER_LEFT;
const OUT_H = srcPNG.height + GUTTER_TOP;

const contactSheet = new PNG({ width: OUT_W, height: OUT_H });

// Tô nền xám đen tối (checkerboard nhẹ)
for (let y = 0; y < OUT_H; y++) {
  for (let x = 0; x < OUT_W; x++) {
    const isCheck = ((Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0);
    const bg = isCheck ? 22 : 16;
    fillRect(contactSheet, x, y, 1, 1, bg, bg, bg + 2, 255);
  }
}

// Vẽ header nhóm hành động
fillRect(contactSheet, 0, 0, OUT_W, GUTTER_TOP, 10, 12, 16, 255);
fillRect(contactSheet, 0, 0, GUTTER_LEFT, OUT_H, 10, 12, 16, 255);

// Nhãn nhóm hành động
// IDLE: cols 0..3 (x = GUTTER_LEFT + 0 * 64 đến GUTTER_LEFT + 4 * 64)
fillRect(contactSheet, GUTTER_LEFT + 0 * 64, 2, 4 * 64 - 2, 20, 26, 46, 68, 255);
drawText(contactSheet, GUTTER_LEFT + 0 * 64 + 70, 9, 'IDLE (0-3)', 120, 200, 255);

// WALK: cols 4..9 (6 cols)
fillRect(contactSheet, GUTTER_LEFT + 4 * 64, 2, 6 * 64 - 2, 20, 24, 60, 40, 255);
drawText(contactSheet, GUTTER_LEFT + 4 * 64 + 140, 9, 'WALK / RUN (4-9)', 120, 240, 150);

// ATTACK: cols 10..14 (5 cols)
fillRect(contactSheet, GUTTER_LEFT + 10 * 64, 2, 5 * 64 - 2, 20, 68, 30, 24, 255);
drawText(contactSheet, GUTTER_LEFT + 10 * 64 + 110, 9, 'ATTACK (10-14)', 255, 140, 100);

// HURT: cols 15..17 (3 cols)
fillRect(contactSheet, GUTTER_LEFT + 15 * 64, 2, 3 * 64 - 2, 20, 68, 55, 20, 255);
drawText(contactSheet, GUTTER_LEFT + 15 * 64 + 60, 9, 'HURT (15-17)', 255, 220, 100);

// DEATH: cols 18..21 (4 cols)
fillRect(contactSheet, GUTTER_LEFT + 18 * 64, 2, 4 * 64 - 2, 20, 50, 20, 50, 255);
drawText(contactSheet, GUTTER_LEFT + 18 * 64 + 80, 9, 'DEATH (18-21)', 240, 120, 240);

const rowLabels = ['DOWN', 'LEFT', 'RIGHT', 'UP'];

for (let r = 0; r < ROWS; r++) {
  const rowY = GUTTER_TOP + r * CELL_H;
  // Nhãn hàng bên trái
  drawText(contactSheet, 6, rowY + 28, rowLabels[r], 200, 200, 210);

  for (let c = 0; c < COLS; c++) {
    const colX = GUTTER_LEFT + c * CELL_W;
    const frameIdx = r * COLS + c;

    // Kẻ viền ô 64x64
    for (let bx = 0; bx < CELL_W; bx++) {
      fillRect(contactSheet, colX + bx, rowY, 1, 1, 40, 45, 55, 255);
      fillRect(contactSheet, colX + bx, rowY + CELL_H - 1, 1, 1, 40, 45, 55, 255);
    }
    for (let by = 0; by < CELL_H; by++) {
      fillRect(contactSheet, colX, rowY + by, 1, 1, 40, 45, 55, 255);
      fillRect(contactSheet, colX + CELL_W - 1, rowY + by, 1, 1, 40, 45, 55, 255);
    }

    // Sao chép pixel của frame nhân vật từ srcPNG
    for (let y = 0; y < CELL_H; y++) {
      for (let x = 0; x < CELL_W; x++) {
        const srcX = c * CELL_W + x;
        const srcY = r * CELL_H + y;
        const srcIdx = (srcY * srcPNG.width + srcX) * 4;
        const a = srcPNG.data[srcIdx + 3];
        if (a > 10) {
          const dstX = colX + x;
          const dstY = rowY + y;
          const dstIdx = (dstY * OUT_W + dstX) * 4;
          // Alpha blending lên background
          const alphaNorm = a / 255;
          contactSheet.data[dstIdx] = Math.round(srcPNG.data[srcIdx] * alphaNorm + contactSheet.data[dstIdx] * (1 - alphaNorm));
          contactSheet.data[dstIdx + 1] = Math.round(srcPNG.data[srcIdx + 1] * alphaNorm + contactSheet.data[dstIdx + 1] * (1 - alphaNorm));
          contactSheet.data[dstIdx + 2] = Math.round(srcPNG.data[srcIdx + 2] * alphaNorm + contactSheet.data[dstIdx + 2] * (1 - alphaNorm));
          contactSheet.data[dstIdx + 3] = 255;
        }
      }
    }

    // Vẽ nhãn số frame [Fxx] ở góc trên bên trái
    const numStr = frameIdx.toString();
    const badgeW = 4 + numStr.length * 4 + 2;
    fillRect(contactSheet, colX + 2, rowY + 2, badgeW, 9, 0, 0, 0, 200);
    drawText(contactSheet, colX + 4, rowY + 4, numStr, 255, 255, 100);
  }
}

// Lưu Contact Sheet 1x
const evidenceDir = path.join(ROOT_DIR, 'Read', 'V1.1', 'Reports', 'REMEDIATION');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

const outContactSheetPath = path.join(evidenceDir, 'satyr_contact_sheet_88_frames.png');
fs.writeFileSync(outContactSheetPath, PNG.sync.write(contactSheet));
console.log(`Saved contact sheet to ${outContactSheetPath} (${OUT_W} × ${OUT_H} px)`);

// -------------------------------------------------------------
// BẢN 2: Contact Sheet 2x Nearest Neighbor (dễ xem chi tiết pixel hơn)
// -------------------------------------------------------------
const SCALE = 2;
const OUT2_W = OUT_W * SCALE;
const OUT2_H = OUT_H * SCALE;
const contactSheet2x = new PNG({ width: OUT2_W, height: OUT2_H });

for (let y = 0; y < OUT2_H; y++) {
  const sy = Math.floor(y / SCALE);
  for (let x = 0; x < OUT2_W; x++) {
    const sx = Math.floor(x / SCALE);
    const sIdx = (sy * OUT_W + sx) * 4;
    const dIdx = (y * OUT2_W + x) * 4;
    contactSheet2x.data[dIdx] = contactSheet.data[sIdx];
    contactSheet2x.data[dIdx + 1] = contactSheet.data[sIdx + 1];
    contactSheet2x.data[dIdx + 2] = contactSheet.data[sIdx + 2];
    contactSheet2x.data[dIdx + 3] = contactSheet.data[sIdx + 3];
  }
}

const out2xPath = path.join(evidenceDir, 'satyr_contact_sheet_88_frames_2x.png');
fs.writeFileSync(out2xPath, PNG.sync.write(contactSheet2x));
console.log(`Saved 2x contact sheet to ${out2xPath} (${OUT2_W} × ${OUT2_H} px)`);
