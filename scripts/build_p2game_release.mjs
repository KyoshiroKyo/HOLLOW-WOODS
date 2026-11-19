/**
 * scripts/build_p2game_release.mjs
 * ======================================================================
 * HOLLOW WOODS V1.5 — QUY TRÌNH TỰ ĐỘNG HÓA POST-BUILD & PHÁT HÀNH P2GAME
 * ======================================================================
 * Tự động kết xuất bộ nhận diện Pixel Art V1.5 chuẩn Nearest-Neighbor:
 *   1. media/avatar_512x512.png (512x512 px — The Mossbound Wayfarer)
 *   2. media/cover_banner_1280x720.png (1280x720 px — Bên bếp lửa cùng Sir Vaelen)
 *   3. media/screen_01_bellhollow_v15.png (1280x720 px — Làng Bellhollow V1.5 & DST HUD)
 *   4. media/screen_02_sir_vaelen_fire.png (1280x720 px — Trạm Lửa Rừng Tĩnh Lặng)
 *   5. media/screen_03_crafting_ui.png (1280x720 px — Bảng Chế Tạo 4 Tầng & Sổ Tay)
 *   6. media/screen_04_boss_shadow.png (1280x720 px — Đại chiến Boss SHADOW Series)
 *
 * Đồng bộ metadata p2game.json vào 3 nơi:
 *   - public/p2game.json
 *   - dist/p2game.json
 *   - release/p2game/p2game.json
 *
 * Tự động đóng gói bản phát hành Web ZIP:
 *   - release/p2game/hollow-woods-p2game-v1.5.0.zip
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
const PUBLIC_MEDIA_DIR = path.join(ROOT_DIR, 'public', 'media');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DIST_MEDIA_DIR = path.join(DIST_DIR, 'media');
const RELEASE_P2GAME_DIR = path.join(ROOT_DIR, 'release', 'p2game');
const RELEASE_MEDIA_DIR = path.join(RELEASE_P2GAME_DIR, 'media_v1.5');

console.log('='.repeat(72));
console.log('🚀 HOLLOW WOODS V1.5 — POST-BUILD AUTOMATION & P2GAME RELEASE PIPELINE');
console.log('='.repeat(72));

// Khởi tạo thư mục đích
fs.mkdirSync(PUBLIC_MEDIA_DIR, { recursive: true });
fs.mkdirSync(RELEASE_P2GAME_DIR, { recursive: true });
fs.mkdirSync(RELEASE_MEDIA_DIR, { recursive: true });
if (fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_MEDIA_DIR, { recursive: true });
}

// ----------------------------------------------------------------------
// 1. ENGINE ĐỒ HỌA PIXEL ART (NEAREST-NEIGHBOR BITMAP ENGINE)
// ----------------------------------------------------------------------

const FONT_3X5 = {
  ' ': [0b000, 0b000, 0b000, 0b000, 0b000],
  '0': [0b111, 0b101, 0b101, 0b101, 0b111],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b111, 0b001, 0b111, 0b100, 0b111],
  '3': [0b111, 0b001, 0b111, 0b001, 0b111],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b111, 0b001, 0b111],
  '6': [0b111, 0b100, 0b111, 0b101, 0b111],
  '7': [0b111, 0b001, 0b010, 0b010, 0b010],
  '8': [0b111, 0b101, 0b111, 0b101, 0b111],
  '9': [0b111, 0b101, 0b111, 0b001, 0b111],
  'A': [0b111, 0b101, 0b111, 0b101, 0b101],
  'B': [0b110, 0b101, 0b110, 0b101, 0b110],
  'C': [0b111, 0b100, 0b100, 0b100, 0b111],
  'D': [0b110, 0b101, 0b101, 0b101, 0b110],
  'E': [0b111, 0b100, 0b110, 0b100, 0b111],
  'F': [0b111, 0b100, 0b110, 0b100, 0b100],
  'G': [0b111, 0b100, 0b101, 0b101, 0b111],
  'H': [0b101, 0b101, 0b111, 0b101, 0b101],
  'I': [0b111, 0b010, 0b010, 0b010, 0b111],
  'J': [0b001, 0b001, 0b001, 0b101, 0b111],
  'K': [0b101, 0b110, 0b100, 0b110, 0b101],
  'L': [0b100, 0b100, 0b100, 0b100, 0b111],
  'M': [0b101, 0b111, 0b101, 0b101, 0b101],
  'N': [0b110, 0b101, 0b101, 0b101, 0b101],
  'O': [0b111, 0b101, 0b101, 0b101, 0b111],
  'P': [0b111, 0b101, 0b111, 0b100, 0b100],
  'Q': [0b111, 0b101, 0b101, 0b111, 0b001],
  'R': [0b110, 0b101, 0b110, 0b101, 0b101],
  'S': [0b111, 0b100, 0b111, 0b001, 0b111],
  'T': [0b111, 0b010, 0b010, 0b010, 0b010],
  'U': [0b101, 0b101, 0b101, 0b101, 0b111],
  'V': [0b101, 0b101, 0b101, 0b101, 0b010],
  'W': [0b101, 0b101, 0b101, 0b111, 0b101],
  'X': [0b101, 0b101, 0b010, 0b101, 0b101],
  'Y': [0b101, 0b101, 0b111, 0b010, 0b010],
  'Z': [0b111, 0b001, 0b010, 0b100, 0b111],
  ':': [0b000, 0b010, 0b000, 0b010, 0b000],
  '.': [0b000, 0b000, 0b000, 0b000, 0b010],
  ',': [0b000, 0b000, 0b000, 0b010, 0b100],
  '-': [0b000, 0b000, 0b111, 0b000, 0b000],
  '+': [0b000, 0b010, 0b111, 0b010, 0b000],
  '/': [0b001, 0b001, 0b010, 0b100, 0b100],
  '[': [0b110, 0b100, 0b100, 0b100, 0b110],
  ']': [0b011, 0b001, 0b001, 0b001, 0b011],
  '(': [0b010, 0b100, 0b100, 0b100, 0b010],
  ')': [0b010, 0b001, 0b001, 0b001, 0b010],
  '!': [0b010, 0b010, 0b010, 0b000, 0b010],
  '?': [0b111, 0b001, 0b010, 0b000, 0b010],
  '>': [0b100, 0b010, 0b001, 0b010, 0b100],
  '<': [0b001, 0b010, 0b100, 0b010, 0b001],
  '•': [0b000, 0b010, 0b111, 0b010, 0b000],
  '★': [0b010, 0b111, 0b010, 0b101, 0b000],
  '#': [0b101, 0b111, 0b101, 0b111, 0b101],
  '%': [0b101, 0b001, 0b010, 0b100, 0b101],
  '=': [0b000, 0b111, 0b000, 0b111, 0b000]
};

function createPNG(w, h, fill = [0, 0, 0, 255]) {
  const png = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (w * y + x) << 2;
      png.data[idx] = fill[0];
      png.data[idx + 1] = fill[1];
      png.data[idx + 2] = fill[2];
      png.data[idx + 3] = fill[3];
    }
  }
  return png;
}

function loadPNG(relPath) {
  const abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(abs)) return null;
  return PNG.sync.read(fs.readFileSync(abs));
}

function setPixel(png, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  const alpha = a / 255;
  if (alpha >= 1) {
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = 255;
  } else {
    png.data[idx] = Math.round(r * alpha + png.data[idx] * (1 - alpha));
    png.data[idx + 1] = Math.round(g * alpha + png.data[idx + 1] * (1 - alpha));
    png.data[idx + 2] = Math.round(b * alpha + png.data[idx + 2] * (1 - alpha));
    png.data[idx + 3] = Math.min(255, png.data[idx + 3] + a);
  }
}

function fillRect(png, x0, y0, w, h, [r, g, b, a = 255]) {
  const xEnd = Math.min(png.width, Math.max(0, x0 + w));
  const yEnd = Math.min(png.height, Math.max(0, y0 + h));
  const startX = Math.max(0, x0);
  const startY = Math.max(0, y0);
  for (let y = startY; y < yEnd; y++) {
    for (let x = startX; x < xEnd; x++) {
      setPixel(png, x, y, r, g, b, a);
    }
  }
}

function drawRectOutline(png, x, y, w, h, [r, g, b, a = 255], thickness = 1) {
  for (let t = 0; t < thickness; t++) {
    for (let ix = x + t; ix < x + w - t; ix++) {
      setPixel(png, ix, y + t, r, g, b, a);
      setPixel(png, ix, y + h - 1 - t, r, g, b, a);
    }
    for (let iy = y + t; iy < y + h - t; iy++) {
      setPixel(png, x + t, iy, r, g, b, a);
      setPixel(png, x + w - 1 - t, iy, r, g, b, a);
    }
  }
}

function fillGradientV(png, x0, y0, w, h, c1, c2) {
  for (let y = y0; y < y0 + h; y++) {
    const t = (y - y0) / Math.max(1, h);
    const r = Math.round(c1[0] * (1 - t) + c2[0] * t);
    const g = Math.round(c1[1] * (1 - t) + c2[1] * t);
    const b = Math.round(c1[2] * (1 - t) + c2[2] * t);
    const a = Math.round((c1[3] ?? 255) * (1 - t) + (c2[3] ?? 255) * t);
    for (let x = x0; x < x0 + w; x++) {
      setPixel(png, x, y, r, g, b, a);
    }
  }
}

function drawRadialGlow(png, cx, cy, innerR, outerR, [r, g, b, maxA = 255]) {
  const minX = Math.max(0, Math.floor(cx - outerR));
  const maxX = Math.min(png.width, Math.ceil(cx + outerR));
  const minY = Math.max(0, Math.floor(cy - outerR));
  const maxY = Math.min(png.height, Math.ceil(cy + outerR));

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= outerR) {
        let factor = 1;
        if (d > innerR) {
          factor = Math.max(0, 1 - (d - innerR) / (outerR - innerR));
          factor = factor * factor;
        }
        const a = Math.round(maxA * factor);
        if (a > 0) {
          setPixel(png, x, y, r, g, b, a);
        }
      }
    }
  }
}

/**
 * Blit ảnh chuẩn Nearest-Neighbor (scale nguyên hoặc hữu tỉ không nội suy làm nhòe)
 */
function blit(src, dst, dstX, dstY, { scale = 1, srcX = 0, srcY = 0, srcW = null, srcH = null, alpha = 1.0, flipX = false } = {}) {
  if (!src) return;
  const sw = srcW !== null ? srcW : src.width;
  const sh = srcH !== null ? srcH : src.height;

  for (let dy = 0; dy < sh * scale; dy++) {
    const sy = Math.floor(dy / scale) + srcY;
    if (sy < 0 || sy >= src.height) continue;
    const targetY = Math.floor(dstY + dy);
    if (targetY < 0 || targetY >= dst.height) continue;

    for (let dx = 0; dx < sw * scale; dx++) {
      const sxStep = Math.floor(dx / scale);
      const sx = flipX ? (srcX + sw - 1 - sxStep) : (srcX + sxStep);
      if (sx < 0 || sx >= src.width) continue;
      const targetX = Math.floor(dstX + dx);
      if (targetX < 0 || targetX >= dst.width) continue;

      const srcIdx = (src.width * sy + sx) << 2;
      const sa = (src.data[srcIdx + 3] / 255) * alpha;
      if (sa > 0.01) {
        setPixel(
          dst,
          targetX,
          targetY,
          src.data[srcIdx],
          src.data[srcIdx + 1],
          src.data[srcIdx + 2],
          Math.round(src.data[srcIdx + 3] * alpha)
        );
      }
    }
  }
}

function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function drawText(png, text, startX, startY, scale = 1, color = [255, 255, 255, 255]) {
  const clean = removeDiacritics(String(text)).toUpperCase();
  let curX = startX;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const glyph = FONT_3X5[ch] || FONT_3X5[' '];
    for (let row = 0; row < 5; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 3; col++) {
        if ((bits >> (2 - col)) & 1) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              setPixel(png, curX + col * scale + dx, startY + row * scale + dy, color[0], color[1], color[2], color[3]);
            }
          }
        }
      }
    }
    curX += (3 + 1) * scale;
  }
}

// ----------------------------------------------------------------------
// 2. CÁC THÀNH PHẦN HUD CHUẨN DON'T STARVE TOGETHER (V15-50 / 50A / 50B)
// ----------------------------------------------------------------------

function renderDSTHUD(png, { health = 100, stamina = 100, oil = 75, composure = 90, quest = 'HOI 1: LANG CHUONG BELLHOLLOW', task = 'Tro chuyen voi Garth tai cong lang' } = {}) {
  // A. Top-Left Status Bars: [20, 20]
  fillRect(png, 20, 20, 240, 76, [14, 18, 22, 230]);
  drawRectOutline(png, 20, 20, 240, 76, [140, 107, 67, 240], 2);
  drawText(png, 'THE MOSSBOUND WAYFARER', 28, 26, 1, [241, 196, 15, 255]);

  // Health
  fillRect(png, 28, 38, 140, 8, [30, 10, 10, 255]);
  fillRect(png, 28, 38, Math.round(140 * (health / 100)), 8, [231, 76, 60, 255]);
  drawText(png, `HP ${health}/100`, 174, 38, 1, [255, 200, 200, 255]);

  // Stamina
  fillRect(png, 28, 50, 140, 8, [10, 30, 15, 255]);
  fillRect(png, 28, 50, Math.round(140 * (stamina / 100)), 8, [46, 204, 113, 255]);
  drawText(png, `STA ${stamina}/100`, 174, 50, 1, [200, 255, 200, 255]);

  // Lantern Oil & Composure
  fillRect(png, 28, 62, 140, 6, [35, 25, 5, 255]);
  fillRect(png, 28, 62, Math.round(140 * (oil / 100)), 6, [243, 156, 18, 255]);
  drawText(png, `OIL ${oil}%`, 174, 62, 1, [255, 230, 160, 255]);

  fillRect(png, 28, 72, 140, 6, [20, 15, 35, 255]);
  fillRect(png, 28, 72, Math.round(140 * (composure / 100)), 6, [155, 89, 182, 255]);
  drawText(png, `SAN ${composure}%`, 174, 72, 1, [220, 200, 255, 255]);

  // B. Top-Center Clock & Quest Widget: [440, 16]
  fillRect(png, 440, 16, 400, 52, [14, 18, 22, 235]);
  drawRectOutline(png, 440, 16, 400, 52, [180, 140, 60, 230], 2);

  // Clock Disc
  drawRadialGlow(png, 466, 42, 6, 20, [241, 196, 15, 200]);
  drawRectOutline(png, 450, 26, 32, 32, [140, 107, 67, 255], 2);
  drawText(png, 'NGAY 1 - BAN NGAY', 492, 24, 1, [241, 196, 15, 255]);
  drawText(png, quest, 492, 36, 1, [255, 255, 255, 255]);
  drawText(png, task, 492, 48, 1, [180, 200, 210, 220]);

  // C. Left Vertical Taskbar (42px wide at x: 16): [16, 130, 42, 400]
  fillRect(png, 16, 130, 42, 400, [18, 14, 10, 240]);
  drawRectOutline(png, 16, 130, 42, 400, [110, 82, 51, 240], 2);
  const taskIcons = ['C', 'J', '1', '2', 'Q', 'F', 'E', 'I', 'ESC'];
  taskIcons.forEach((btn, idx) => {
    const by = 138 + idx * 43;
    fillRect(png, 20, by, 34, 36, [35, 24, 16, 255]);
    drawRectOutline(png, 20, by, 34, 36, [140, 107, 67, 220], 1);
    drawText(png, btn, 28, by + 13, 2, [241, 196, 15, 255]);
  });

  // D. Bottom Hotbar & Equipment Bar: [350, 654, 580, 56]
  // Khung gỗ viền đồng cổ
  fillRect(png, 350, 654, 580, 56, [16, 12, 9, 245]);
  drawRectOutline(png, 350, 654, 580, 56, [140, 107, 67, 255], 2);

  // 8 Ô Túi đồ nền giấy da sáng ấm (0xdfd3b6 = [223, 211, 182])
  for (let i = 0; i < 8; i++) {
    const slotX = 358 + i * 44;
    fillRect(png, slotX, 660, 40, 44, [223, 211, 182, 255]);
    drawRectOutline(png, slotX, 660, 40, 44, [140, 120, 83, 255], 1);
    drawText(png, String(i + 1), slotX + 4, 664, 1, [40, 30, 20, 255]);

    // Item demo icons
    if (i === 0) {
      // Salve (Thuốc đắp)
      fillRect(png, slotX + 12, 672, 16, 16, [46, 204, 113, 255]);
      drawText(png, 'x3', slotX + 22, 692, 1, [20, 20, 20, 255]);
    } else if (i === 1) {
      // Lantern Oil
      fillRect(png, slotX + 14, 672, 12, 16, [243, 156, 18, 255]);
      drawText(png, 'x2', slotX + 22, 692, 1, [20, 20, 20, 255]);
    } else if (i === 2) {
      // Bait (Mồi ném)
      fillRect(png, slotX + 12, 674, 16, 12, [155, 89, 182, 255]);
      drawText(png, 'x5', slotX + 22, 692, 1, [20, 20, 20, 255]);
    } else if (i === 3) {
      // Spear / Weapon
      fillRect(png, slotX + 18, 668, 4, 24, [127, 140, 141, 255]);
      fillRect(png, slotX + 16, 668, 8, 4, [189, 195, 199, 255]);
    }
  }

  // Vách ngăn gỗ chạm khắc nạm đinh
  fillRect(png, 714, 658, 8, 48, [40, 26, 16, 255]);
  drawRectOutline(png, 714, 658, 8, 48, [180, 140, 60, 255], 1);

  // 4 Ô Trang bị cá nhân (BODY, FEET, BACK, CHARM)
  const equipLabels = ['BDY', 'FET', 'BAK', 'CHM'];
  for (let j = 0; j < 4; j++) {
    const eqX = 728 + j * 48;
    fillRect(png, eqX, 660, 42, 44, [26, 20, 16, 255]);
    drawRectOutline(png, eqX, 660, 42, 44, [110, 85, 55, 255], 1);
    drawText(png, equipLabels[j], eqX + 8, 676, 1, [160, 140, 120, 200]);
  }
}

function renderDSTCraftingModal(png) {
  // Modal Khung Gỗ Trung Tâm: 680x500 px tại [300, 110]
  const mx = 300;
  const my = 110;
  const mw = 680;
  const mh = 500;

  // Lớp tối mờ phủ toàn màn hình (Overlay)
  fillRect(png, 0, 0, png.width, png.height, [0, 0, 0, 175]);

  // Khung chính gỗ sẫm
  fillRect(png, mx, my, mw, mh, [24, 17, 12, 255]);
  drawRectOutline(png, mx, my, mw, mh, [140, 107, 67, 255], 3);
  drawRectOutline(png, mx + 4, my + 4, mw - 8, mh - 8, [241, 196, 15, 120], 1);

  // --- TẦNG 1: Thanh Trên Cùng (Top Bar) ---
  fillRect(png, mx + 16, my + 14, 100, 32, [45, 32, 20, 255]);
  drawRectOutline(png, mx + 16, my + 14, 100, 32, [241, 196, 15, 200], 1);
  drawText(png, '★ YEU THICH', mx + 24, my + 24, 1, [241, 196, 15, 255]);

  // Hộp tìm kiếm
  fillRect(png, mx + 126, my + 14, 380, 32, [18, 22, 26, 255]);
  drawRectOutline(png, mx + 126, my + 14, 380, 32, [100, 120, 140, 200], 1);
  drawText(png, 'TIM CONG THUC CHE TAO...', mx + 138, my + 24, 1, [160, 180, 190, 220]);
  drawText(png, '[X]', mx + 480, my + 24, 1, [231, 76, 60, 255]);

  // Nút đóng góc phải
  fillRect(png, mx + 516, my + 14, 148, 32, [55, 20, 20, 255]);
  drawRectOutline(png, mx + 516, my + 14, 148, 32, [231, 76, 60, 220], 1);
  drawText(png, '[X] [I/ESC] DONG', mx + 526, my + 24, 1, [255, 220, 220, 255]);

  // --- TẦNG 2: Hàng Biểu Tượng Danh Mục (Category Tabs) ---
  const catNames = ['TAT CA', 'ANH SANG', 'SINH TON', 'CHIEN DAU', 'TRANG BI', 'CHE TAC'];
  catNames.forEach((cat, idx) => {
    const cx = mx + 16 + idx * 108;
    const isSel = idx === 0;
    fillRect(png, cx, my + 54, 102, 28, isSel ? [223, 211, 182, 255] : [38, 26, 18, 255]);
    drawRectOutline(png, cx, my + 54, 102, 28, isSel ? [241, 196, 15, 255] : [110, 82, 51, 255], 1);
    drawText(png, cat, cx + 12, my + 63, 1, isSel ? [30, 20, 10, 255] : [200, 180, 160, 220]);
  });

  // --- TẦNG 3: Lưới Công Thức 7 Cột (Recipe Grid) ---
  const recipeW = 88;
  const recipeH = 46;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 7; c++) {
      const rx = mx + 16 + c * 92;
      const ry = my + 92 + r * 52;
      const isSelected = r === 0 && c === 0;
      const isLocked = r === 2 && c >= 3;
      const hasMats = (r + c) % 2 === 0;

      if (isLocked) {
        fillRect(png, rx, ry, recipeW, recipeH, [20, 14, 10, 255]);
        drawRectOutline(png, rx, ry, recipeW, recipeH, [60, 45, 30, 255], 1);
        drawText(png, '# KHOA', rx + 20, ry + 18, 1, [150, 80, 70, 200]);
      } else if (hasMats) {
        fillRect(png, rx, ry, recipeW, recipeH, [223, 211, 182, 255]);
        drawRectOutline(png, rx, ry, recipeW, recipeH, isSelected ? [241, 196, 15, 255] : [140, 120, 83, 255], isSelected ? 2 : 1);
        fillRect(png, rx + recipeW - 8, ry + 4, 4, 4, [46, 204, 113, 255]); // Sẵn sàng
        drawText(png, `ITEM ${r * 7 + c + 1}`, rx + 8, ry + 16, 1, [30, 20, 10, 255]);
      } else {
        fillRect(png, rx, ry, recipeW, recipeH, [38, 25, 15, 255]);
        drawRectOutline(png, rx, ry, recipeW, recipeH, [100, 75, 45, 255], 1);
        drawText(png, `ITEM ${r * 7 + c + 1}`, rx + 8, ry + 16, 1, [140, 120, 100, 200]);
      }
    }
  }

  // --- TẦNG 4: Khung Chi Tiết & Nút Chế Tạo Phía Dưới ---
  const bY = my + 260;
  fillRect(png, mx + 16, bY, mw - 32, 220, [18, 13, 9, 255]);
  drawRectOutline(png, mx + 16, bY, mw - 32, 220, [140, 107, 67, 255], 2);

  // Nửa Trái: Thông tin vật phẩm
  drawText(png, '★', mx + 32, bY + 18, 2, [241, 196, 15, 255]);
  drawText(png, 'DUOC DAU THAO MOC', mx + 60, bY + 18, 2, [241, 196, 15, 255]);
  drawText(png, '[DAU RA: X1]', mx + 60, bY + 38, 1, [46, 204, 113, 255]);
  drawText(png, 'Nguon sang di dong duy tri Binh Tam & xua duoi bong toi.', mx + 32, bY + 60, 1, [220, 210, 190, 240]);
  drawText(png, 'Thoi gian chay: 180 giay. Co the nap them Dau Den.', mx + 32, bY + 76, 1, [180, 170, 150, 200]);
  drawText(png, 'TRANG THAI: SAN SANG CHE TAC!', mx + 32, bY + 104, 1, [46, 204, 113, 255]);

  // Nửa Phải: Dãy Nguyên Liệu & Nút Chế Tạo
  const pX = mx + 340;
  // Icon Preview 48x48
  fillRect(png, pX, bY + 16, 56, 56, [35, 24, 16, 255]);
  drawRectOutline(png, pX, bY + 16, 56, 56, [241, 196, 15, 255], 2);
  drawText(png, 'LAMP', pX + 12, bY + 36, 1, [241, 196, 15, 255]);

  // Badge nguyên liệu 1: Gỗ khô (Đủ 2/2 -> xanh)
  fillRect(png, pX + 70, bY + 16, 104, 56, [39, 174, 96, 230]);
  drawRectOutline(png, pX + 70, bY + 16, 104, 56, [46, 204, 113, 255], 1);
  drawText(png, 'GO KHO', pX + 80, bY + 28, 1, [255, 255, 255, 255]);
  drawText(png, '2/2 (DU)', pX + 80, bY + 44, 1, [255, 255, 255, 255]);

  // Badge nguyên liệu 2: Nhựa thông (Đủ 1/1 -> xanh)
  fillRect(png, pX + 184, bY + 16, 104, 56, [39, 174, 96, 230]);
  drawRectOutline(png, pX + 184, bY + 16, 104, 56, [46, 204, 113, 255], 1);
  drawText(png, 'NHUA THONG', pX + 192, bY + 28, 1, [255, 255, 255, 255]);
  drawText(png, '1/1 (DU)', pX + 192, bY + 44, 1, [255, 255, 255, 255]);

  // Nút [🔨 CHẾ TẠO NGAY] (1-Click)
  fillRect(png, pX, bY + 96, 288, 48, [211, 84, 0, 255]);
  drawRectOutline(png, pX, bY + 96, 288, 48, [241, 196, 15, 255], 2);
  drawText(png, 'CHE TAO NGAY [ENTER]', pX + 44, bY + 112, 2, [255, 255, 255, 255]);
}

// ----------------------------------------------------------------------
// 3. KẾT XUẤT 6 HÌNH ẢNH NHẬN DIỆN PIXEL ART V1.5
// ----------------------------------------------------------------------

async function generateMediaAssets() {
  console.log('\n--- 1. Bắt đầu kết xuất bộ 6 hình ảnh Pixel Art V1.5 (Nearest-Neighbor) ---');

  // Load tài nguyên thật
  const wayfarerSheet = loadPNG('public/assets/characters/mossbound_wayfarer/wayfarer_idle.png');
  const wayfarerAttack = loadPNG('public/assets/characters/mossbound_wayfarer/wayfarer_attack.png');
  const knightIdle = loadPNG('public/assets/characters/npcs/campfire_knight_idle_sheet.png');
  const knightPray = loadPNG('public/assets/characters/npcs/campfire_knight_pray_sheet.png');
  const bellTower = loadPNG('public/assets/buildings/bell_tower_grand.png');
  const houseEdda = loadPNG('public/assets/buildings/house_elder_edda.png');
  const smithyBram = loadPNG('public/assets/buildings/smithy_workshop_bram.png');
  const well = loadPNG('public/assets/buildings/village_well_detailed.png');
  const campfire = loadPNG('public/assets/environment/sprites/campfire_tier2.png');
  const lanternPost = loadPNG('public/assets/environment/props/prop_lantern_post.png');
  const treeOak = loadPNG('public/assets/environment/sprites/tree_oak_1.png');
  const treePine = loadPNG('public/assets/environment/sprites/tree_mist_pine.png');
  const treeDead = loadPNG('public/assets/environment/sprites/tree_dead.png');
  const brokenShrine = loadPNG('public/assets/environment/sprites/broken_shrine.png');
  const stoneAltar = loadPNG('public/assets/environment/sprites/stone_altar.png');
  const pillar = loadPNG('public/assets/environment/sprites/pillar_root.png');
  const bossSheet = loadPNG('public/assets/characters/bosses/shadow_big_boss_sheet.png');
  const edda = loadPNG('public/assets/characters/npcs/edda.png');
  const garth = loadPNG('public/assets/characters/npcs/garth.png');

  // ====================================================================
  // 1. avatar_512x512.png (512x512 px)
  // ====================================================================
  console.log('Rendering media/avatar_512x512.png (Wayfarer with Lantern)...');
  const av = createPNG(512, 512, [8, 14, 18, 255]);
  fillGradientV(av, 0, 0, 512, 512, [6, 12, 16, 255], [3, 6, 8, 255]);

  // Hào quang đèn lồng
  drawRadialGlow(av, 330, 240, 30, 240, [243, 156, 18, 130]);
  drawRadialGlow(av, 330, 240, 10, 80, [255, 235, 160, 210]);

  // Cây mờ nền
  if (treePine) blit(treePine, av, -30, 60, { scale: 2.8, alpha: 0.25 });
  if (treeOak) blit(treeOak, av, 300, 50, { scale: 2.8, alpha: 0.22, flipX: true });

  // Nhân vật chính 5x
  if (wayfarerSheet) {
    blit(wayfarerSheet, av, 86, 70, { scale: 5.2, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Khung viền Gothic nạm đinh
  drawRectOutline(av, 8, 8, 496, 496, [180, 140, 60, 255], 3);
  drawRectOutline(av, 14, 14, 484, 484, [241, 196, 15, 180], 1);
  drawRectOutline(av, 18, 18, 476, 476, [100, 80, 35, 220], 1);

  // 4 Góc kim loại
  [[10, 10], [486, 10], [10, 486], [486, 486]].forEach(([cx, cy]) => {
    fillRect(av, cx, cy, 16, 16, [241, 196, 15, 255]);
    fillRect(av, cx + 3, cy + 3, 10, 10, [15, 22, 30, 255]);
  });

  // Tấm biển đề tên
  fillRect(av, 48, 416, 416, 72, [12, 16, 22, 245]);
  drawRectOutline(av, 48, 416, 416, 72, [241, 196, 15, 240], 2);
  drawText(av, 'HOLLOW WOODS', 84, 432, 4, [241, 196, 15, 255]);
  drawText(av, 'V1.5 • THE MOSSBOUND WAYFARER', 114, 464, 1, [210, 225, 240, 240]);

  // ====================================================================
  // 2. cover_banner_1280x720.png (1280x720 px)
  // ====================================================================
  console.log('Rendering media/cover_banner_1280x720.png (Campfire with Sir Vaelen)...');
  const cov = createPNG(1280, 720, [8, 12, 16, 255]);
  fillGradientV(cov, 0, 0, 1280, 460, [5, 8, 12, 255], [12, 20, 26, 255]);
  fillGradientV(cov, 0, 460, 1280, 260, [18, 26, 22, 255], [8, 14, 12, 255]);

  // Hàng cây rừng sương mù
  if (treePine) blit(treePine, cov, 40, 140, { scale: 3.2, alpha: 0.85 });
  if (treePine) blit(treePine, cov, 180, 120, { scale: 3.6, alpha: 0.70 });
  if (treeOak) blit(treeOak, cov, 940, 110, { scale: 3.4, alpha: 0.85, flipX: true });
  if (treePine) blit(treePine, cov, 1100, 130, { scale: 3.5, alpha: 0.80, flipX: true });

  // Đèn lồng treo
  if (lanternPost) blit(lanternPost, cov, 380, 360, { scale: 2.5 });
  drawRadialGlow(cov, 420, 380, 20, 140, [243, 156, 18, 110]);

  // Bếp lửa trại trung tâm
  const fX = 640;
  const fY = 460;
  drawRadialGlow(cov, fX + 36, fY + 30, 50, 340, [230, 126, 34, 160]);
  drawRadialGlow(cov, fX + 36, fY + 30, 20, 120, [255, 240, 180, 240]);
  if (campfire) blit(campfire, cov, fX, fY, { scale: 3.2 });

  // Sir Vaelen — Kỵ Sĩ Trầm Mặc ngồi cầu nguyện/nghỉ ngơi bên trái bếp lửa
  if (knightPray) {
    blit(knightPray, cov, 490, 420, { scale: 3.4, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  } else if (knightIdle) {
    blit(knightIdle, cov, 490, 420, { scale: 3.4, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // The Mossbound Wayfarer đứng bên phải bếp lửa
  if (wayfarerSheet) {
    blit(wayfarerSheet, cov, 780, 420, { scale: 3.4, srcX: 0, srcY: 0, srcW: 64, srcH: 64, flipX: true });
  }

  // Viền tối màn sương (Vignette)
  drawRectOutline(cov, 0, 0, 1280, 720, [0, 0, 0, 200], 8);

  // Khung tiêu đề hoành tráng
  fillRect(cov, 240, 48, 800, 120, [10, 14, 18, 220]);
  drawRectOutline(cov, 240, 48, 800, 120, [241, 196, 15, 230], 2);
  drawText(cov, 'HOLLOW WOODS', 300, 68, 8, [241, 196, 15, 255]);
  drawText(cov, 'THE FOG THAT REMEMBERS - V1.5 PRODUCTION RELEASE', 340, 128, 2, [220, 230, 240, 240]);

  // Thanh chú thích đáy
  fillRect(cov, 420, 664, 440, 36, [10, 14, 20, 230]);
  drawRectOutline(cov, 420, 664, 440, 36, [140, 107, 67, 200], 1);
  drawText(cov, 'P2GAME.IO • DON\'T STARVE TOGETHER STYLE HUD • 60 FPS', 438, 678, 1, [241, 196, 15, 255]);

  // ====================================================================
  // 3. screen_01_bellhollow_v15.png (1280x720 px)
  // ====================================================================
  console.log('Rendering media/screen_01_bellhollow_v15.png (Bellhollow Village V1.5)...');
  const sc1 = createPNG(1280, 720, [15, 22, 20, 255]);
  fillGradientV(sc1, 0, 0, 1280, 360, [12, 18, 20, 255], [20, 30, 26, 255]);
  fillGradientV(sc1, 0, 360, 1280, 360, [26, 36, 30, 255], [16, 24, 20, 255]);

  // Các công trình làng Bellhollow
  if (bellTower) blit(bellTower, sc1, 560, 140, { scale: 2.2 });
  if (houseEdda) blit(houseEdda, sc1, 160, 200, { scale: 2.2 });
  if (smithyBram) blit(smithyBram, sc1, 930, 200, { scale: 2.1 });
  if (well) blit(well, sc1, 410, 360, { scale: 2.2 });
  if (treeOak) blit(treeOak, sc1, 40, 160, { scale: 2.2 });
  if (treeOak) blit(treeOak, sc1, 1090, 150, { scale: 2.2, flipX: true });

  // Dân làng
  if (edda) blit(edda, sc1, 520, 380, { scale: 2.2 });
  if (garth) blit(garth, sc1, 290, 360, { scale: 2.2 });

  // Nhân vật chính với đèn lồng
  drawRadialGlow(sc1, 680, 440, 25, 200, [243, 156, 18, 130]);
  if (wayfarerSheet) {
    blit(wayfarerSheet, sc1, 640, 400, { scale: 2.3, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Toàn bộ HUD Don't Starve
  renderDSTHUD(sc1, {
    health: 95,
    stamina: 100,
    oil: 85,
    composure: 90,
    quest: 'HOI 1: LANG CHUONG BELLHOLLOW',
    task: 'Tro chuyen voi Garth tai cong lang'
  });

  // ====================================================================
  // 4. screen_02_sir_vaelen_fire.png (1280x720 px)
  // ====================================================================
  console.log('Rendering media/screen_02_sir_vaelen_fire.png (Silent Forest Bonfire Outpost)...');
  const sc2 = createPNG(1280, 720, [8, 12, 14, 255]);
  fillGradientV(sc2, 0, 0, 1280, 400, [5, 8, 10, 255], [12, 18, 18, 255]);
  fillGradientV(sc2, 0, 400, 1280, 320, [15, 22, 20, 255], [8, 12, 10, 255]);

  // Cây rừng tĩnh lặng
  if (treePine) blit(treePine, sc2, 120, 150, { scale: 2.6, alpha: 0.85 });
  if (treePine) blit(treePine, sc2, 300, 130, { scale: 2.8, alpha: 0.70 });
  if (treePine) blit(treePine, sc2, 850, 130, { scale: 2.8, alpha: 0.75, flipX: true });
  if (treeOak) blit(treeOak, sc2, 1040, 150, { scale: 2.6, alpha: 0.90, flipX: true });

  // Bếp lửa trạm lửa
  const bfX = 620;
  const bfY = 400;
  drawRadialGlow(sc2, bfX + 24, bfY + 20, 40, 280, [230, 126, 34, 170]);
  drawRadialGlow(sc2, bfX + 24, bfY + 20, 15, 100, [255, 235, 160, 240]);
  if (campfire) blit(campfire, sc2, bfX, bfY, { scale: 2.6 });

  // Sir Vaelen — Kỵ Sĩ Trầm Mặc
  if (knightIdle) {
    blit(knightIdle, sc2, 510, 370, { scale: 2.6, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Wayfarer đang tiến lại gần
  if (wayfarerSheet) {
    drawRadialGlow(sc2, 770, 410, 20, 140, [243, 156, 18, 120]);
    blit(wayfarerSheet, sc2, 730, 370, { scale: 2.6, srcX: 0, srcY: 0, srcW: 64, srcH: 64, flipX: true });
  }

  // Khung hội thoại đặc trưng bên đốm lửa
  fillRect(sc2, 320, 520, 640, 70, [15, 20, 26, 240]);
  drawRectOutline(sc2, 320, 520, 640, 70, [180, 140, 60, 240], 2);
  drawText(sc2, '[E] SIR VAELEN - KY SI TRAM MAC', 336, 532, 1, [241, 196, 15, 255]);
  drawText(sc2, '"Khu rung nay khong bao gio ngu, lu khach a... Hay suoi am truoc khi"', 336, 550, 1, [230, 235, 240, 240]);
  drawText(sc2, '"man suong nuot chung toan bo ky uc con lai cua nguoi."', 336, 568, 1, [230, 235, 240, 240]);

  renderDSTHUD(sc2, {
    health: 80,
    stamina: 85,
    oil: 60,
    composure: 75,
    quest: 'HOI 2: TRAM LUA RUNG TINH LANG',
    task: 'Ngoi ben dom lua cung Sir Vaelen'
  });

  // ====================================================================
  // 5. screen_03_crafting_ui.png (1280x720 px)
  // ====================================================================
  console.log('Rendering media/screen_03_crafting_ui.png (DST Crafting Modal & Journal)...');
  const sc3 = createPNG(1280, 720, [15, 22, 20, 255]);
  fillGradientV(sc3, 0, 0, 1280, 360, [12, 18, 20, 255], [20, 30, 26, 255]);
  fillGradientV(sc3, 0, 360, 1280, 360, [26, 36, 30, 255], [16, 24, 20, 255]);

  // Nền làng mờ nhẹ
  if (bellTower) blit(bellTower, sc3, 560, 140, { scale: 2.2, alpha: 0.6 });
  if (houseEdda) blit(houseEdda, sc3, 160, 200, { scale: 2.2, alpha: 0.5 });
  if (treeOak) blit(treeOak, sc3, 40, 160, { scale: 2.2, alpha: 0.5 });
  if (treeOak) blit(treeOak, sc3, 1090, 150, { scale: 2.2, alpha: 0.5, flipX: true });

  // Vẽ Bảng Chế Tạo DST 4 Tầng trung tâm
  renderDSTCraftingModal(sc3);

  // ====================================================================
  // 6. screen_04_boss_shadow.png (1280x720 px)
  // ====================================================================
  console.log('Rendering media/screen_04_boss_shadow.png (Broken Bell Shrine Boss Battle)...');
  const sc4 = createPNG(1280, 720, [10, 14, 18, 255]);
  fillGradientV(sc4, 0, 0, 1280, 360, [8, 10, 16, 255], [14, 18, 26, 255]);
  fillGradientV(sc4, 0, 360, 1280, 360, [18, 22, 30, 255], [10, 12, 18, 255]);

  // Quảng trường đá cổ
  fillRect(sc4, 320, 300, 640, 340, [32, 36, 44, 255]);
  drawRectOutline(sc4, 320, 300, 640, 340, [55, 65, 78, 255], 3);

  // Miếu chuông & Bệ đá
  if (brokenShrine) blit(brokenShrine, sc4, 580, 180, { scale: 2.2 });
  if (stoneAltar) blit(stoneAltar, sc4, 610, 380, { scale: 2.2 });

  // 3 Trụ phong ấn phát sáng thiên thanh (Rune Glow)
  if (pillar) {
    drawRadialGlow(sc4, 395, 340, 15, 90, [46, 204, 113, 160]);
    blit(pillar, sc4, 380, 300, { scale: 2.2 });

    drawRadialGlow(sc4, 875, 340, 15, 90, [46, 204, 113, 160]);
    blit(pillar, sc4, 860, 300, { scale: 2.2, flipX: true });

    drawRadialGlow(sc4, 635, 520, 15, 90, [52, 152, 219, 160]);
    blit(pillar, sc4, 620, 480, { scale: 2.2 });
  }

  // Boss Kẻ Nuốt Tiếng Chuông (SHADOW Big Boss) khổng lồ ở trung tâm
  if (bossSheet) {
    drawRadialGlow(sc4, 640, 300, 40, 260, [142, 68, 173, 160]);
    blit(bossSheet, sc4, 540, 210, { scale: 2.6, srcX: 0, srcY: 0, srcW: 80, srcH: 80 });
  }

  // Sóng chuông trầm & Xung kích tâm linh
  drawRectOutline(sc4, 480, 240, 320, 200, [155, 89, 182, 160], 2);
  drawRectOutline(sc4, 420, 200, 440, 280, [155, 89, 182, 90], 1);

  // Wayfarer đang né đòn và tấn công với ngọn giáo
  if (wayfarerAttack) {
    drawRadialGlow(sc4, 460, 440, 25, 160, [243, 156, 18, 140]);
    blit(wayfarerAttack, sc4, 420, 400, { scale: 2.3, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Viền cảnh báo đỏ Hoảng Loạn
  drawRectOutline(sc4, 0, 0, 1280, 720, [192, 57, 43, 140], 6);

  // Thanh máu Boss & Cảnh báo tâm linh ở đỉnh màn hình
  fillRect(sc4, 380, 18, 520, 52, [18, 10, 12, 240]);
  drawRectOutline(sc4, 380, 18, 520, 52, [192, 57, 43, 240], 2);
  drawText(sc4, 'KE NUOT TIENG CHUONG - THE BELL SWALLOWER', 416, 26, 1, [241, 196, 15, 255]);

  // Thanh máu Boss
  fillRect(sc4, 400, 38, 480, 10, [40, 15, 20, 255]);
  fillRect(sc4, 400, 38, 360, 10, [192, 57, 43, 255]);
  // Lớp giáp phong ấn cổ
  fillRect(sc4, 400, 50, 240, 6, [52, 152, 219, 255]);

  drawText(sc4, 'CANH BAO: AP LUC BINH TAM (COMPOSURE 0%) - HOANG LOAN TOT DO!', 388, 76, 1, [231, 76, 60, 255]);

  renderDSTHUD(sc4, {
    health: 65,
    stamina: 50,
    oil: 40,
    composure: 15,
    quest: 'HOI 5: MIEU CHUONG PHE TICH',
    task: 'Pha giai 3 Tru Phong An truoc khi danh Boss'
  });

  // Lưu toàn bộ 6 file hình ảnh ra các thư mục chỉ định (kèm bí danh screen_03_crafting_journal.png)
  const files = [
    { name: 'avatar_512x512.png', png: av },
    { name: 'cover_banner_1280x720.png', png: cov },
    { name: 'screen_01_bellhollow_v15.png', png: sc1 },
    { name: 'screen_02_sir_vaelen_fire.png', png: sc2 },
    { name: 'screen_03_crafting_ui.png', png: sc3 },
    { name: 'screen_03_crafting_journal.png', png: sc3 },
    { name: 'screen_04_boss_shadow.png', png: sc4 }
  ];

  for (const { name, png } of files) {
    const buf = PNG.sync.write(png);
    // 1. public/media/
    fs.writeFileSync(path.join(PUBLIC_MEDIA_DIR, name), buf);
    // 2. release/p2game/media_v1.5/
    fs.writeFileSync(path.join(RELEASE_MEDIA_DIR, name), buf);
    // 3. dist/media/ (nếu dist đã tồn tại)
    if (fs.existsSync(DIST_DIR)) {
      fs.writeFileSync(path.join(DIST_MEDIA_DIR, name), buf);
    }
    console.log(`  ✔ [SAVED] ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
  }

  // Xuất file thông tin giới thiệu P2GAME_STORE_INFO_V1.5.txt
  const storeInfoText = `========================================================================
HOLLOW WOODS V1.5 – THE FOG THAT REMEMBERS (P2GAME STORE METADATA)
========================================================================

[THÔNG TIN TỔNG QUAN]
- Tựa game: HOLLOW WOODS: The Fog That Remembers
- Phiên bản: V1.5.0 Production Release
- Thể loại: 2D Atmospheric Psychological Survival Horror (Kinh Dị Sinh Tồn Tâm Lý & Giải Đố)
- Nhà phát triển: Kyoshiro
- Nền tảng: Web / P2Game.io (Phaser 3.80+ Native Canvas HD 1280x720, 60 FPS)

[GIỚI THIỆU TRÒ CHƠI]
Bước vào thế giới u tịch của HOLLOW WOODS: The Fog That Remembers, bạn thức tỉnh trong hình tượng Hiệp Sĩ The Mossbound Wayfarer trên con đường độc đạo dẫn tới ngôi làng cổ Bellhollow – nơi Màn Sương Ký Ức đang dần nuốt chửng mọi thanh âm.

Cùng với những cư dân còn bám trụ (Người gác cổng Garth, Bà lão Edda, Thợ rèn Bram, Y sư Neris, Cậu bé đưa tin Finn) và Kỵ Sĩ Trầm Mặc Sir Vaelen bên đốm lửa ấm tại Trạm Lửa Rừng Tĩnh Lặng, bạn sẽ dấn thân vào hành trình khám phá đa nhánh: thu hồi Huy Hiệu Gãy, tìm Khuôn Đúc Cổ tại Xưởng Chuông Bỏ Hoang, đoạt Mảnh Cổ Ngữ tại Quảng Trường Cổ Ngữ, tôi luyện Chìa Khóa Thanh Tẩy, hóa giải Phong Ấn Rễ Cổ tại Đầm Lầy Tĩnh Lặng và đối mặt với Kẻ Nuốt Tiếng Chuông (SHADOW Series) tại Miếu Chuông Phế Tích.

[TÍNH NĂNG ĐỘT PHÁ PHIÊN BẢN V1.5]
1. VÒNG SÁNG HỘ TÂM [F] & NGHỊCH LÝ ÁNH SÁNG:
   - Loại bỏ đèn lồng cầm tay; thay bằng hào quang ấm áp tỏa ra từ linh hồn tiêu hao Thể Lực để bảo vệ Tinh Thần.
   - Khi bật sáng: xua tan bóng tối nhưng quái vật bóng tối phát hiện bạn xa hơn +30%. Khi tắt sáng: lén lút dễ hơn nhưng Tinh Thần bị bóng đêm gặm nhấm liên tục.

2. CHIỀU SÂU KINH DỊ TÂM LÝ:
   - Ảo giác thính giác & bóng ma lướt rìa tầm nhìn khi Tinh Thần < 55/100.
   - Ảo ảnh Hiệp Sĩ Sa Ngã u uất đứng trong sương (< 30/100 Tinh Thần), tan biến thành khói đen khi bị rọi sáng hoặc chém trúng.
   - Bẫy "Tiếng Gọi Trong Sương" (Quy Tắc Máu số 1): Đốm sáng mồi nhử mời gọi lữ khách rời đường mòn; tương tác sẽ giật tối màn hình, trừ 15 Tinh Thần và kéo quái vật ùa tới.
   - Nhịp tim Web Audio động (75..135 BPM) dồn dập, tự động hạ nhỏ BGM (Ducking 0.45x) và Viền Ám Ảnh (Horror Vignette) co bóp 4 góc màn hình theo nhịp hoảng loạn.

3. MẠCH NHIỆM VỤ PHI TUYẾN TÍNH & 3 KẾT THÚC:
   - Chuỗi 7 chặng liên hoàn: Làng Bellhollow -> Đầm Lầy Tĩnh Lặng -> Trạm Lửa Sir Vaelen -> Xưởng Chuông Bỏ Hoang -> Quảng Trường Cổ Ngữ -> Mở Phong Ấn Đầm Lầy -> Miếu Chuông Phế Tích.
   - Màn Hình Kết Thúc chuyên biệt chống kẹt màn hình đen, fail-safe 1.5s và 3 nhánh kết thúc: True Ending Bình Minh Của Tiếng Chuông, Sacrifice Ending Hiệp Sĩ Ở Lại và Bad Ending Vòng Lặp Sương Mù.

4. GIAO DIỆN TÚI ĐỒ & CHẾ TẠO DON'T STARVE TOGETHER:
   - Thanh Hotbar đáy 8 ô túi đồ + 4 ô Trang Bị cá nhân (Body, Feet, Back, Charm) nền giấy da nẹp đồng.
   - Thanh Ghim Nhanh Dọc (QuickCraftSidebar) bên trái với mũi tên chạm khắc nối liền.
   - Bảng Chế Tạo 2 tầng mở rộng [I/C] có tai sách Bookmark Tabs, hộp tìm kiếm Everything, thanh cuộn hình thoi và khung xem trước cổ điển.

5. ĐỒ HỌA PIXEL ART 100% & THẾ GIỚI THÔNG THOÁNG:
   - 100% Sprite Pixel Art thật từ Updated-Trees và TopDown Fantasy Forest.
   - Dọn sạch cây cối che khuất mặt tiền Làng Bellhollow, lò rèn Bram và giải phóng tim đường Fog Crossing.

[BẢNG PHÍM ĐIỀU KHIỂN]
- WASD / Phím Mũi Tên: Di chuyển nhân vật (hỗ trợ trượt góc Corner-Slide 45°)
- Giữ Shift: Chạy nhanh (tiêu hao Thể Lực)
- [F]: Bật / Tắt Vòng Sáng Hộ Tâm (tiêu hao Thể Lực)
- Chuột Trái / Space: Vung kiếm tấn công cận chiến
- [E]: Tương tác, nói chuyện NPC, ẩn nấp thân cây rỗng/bụi rậm, nhặt đồ, đẩy cầu cây
- [Q]: Ném Mồi Tiếng Động (Noise Lure) đánh lạc hướng The Listener
- [1] .. [8]: Sử dụng nhanh vật phẩm trên Thanh Túi Đồ
- [I] / [C]: Mở / Đóng Bảng Chế Tạo Dã Ngoại DST 2 tầng
- [J]: Mở / Đóng Sổ Tay Lữ Khách (Nhiệm vụ 7 chặng, Ký ức, Bestiary)
- [N]: Bật / Tắt La Bàn Mở Rộng / Bản Đồ Mini
- [M]: Bật / Tắt âm thanh (Mute/Unmute)
- [ESC]: Tạm dừng trò chơi & mở Bảng Tùy Chọn
- [F8]: Gỡ Kẹt Khẩn Cấp (Emergency Unstuck) về điểm an toàn
========================================================================
`;
  fs.writeFileSync(path.join(RELEASE_MEDIA_DIR, 'P2GAME_STORE_INFO_V1.5.txt'), storeInfoText, 'utf8');
  console.log(`  ✔ [SAVED] P2GAME_STORE_INFO_V1.5.txt`);

  console.log('✔ Hoàn tất kết xuất và lưu trữ 6 tài nguyên hình ảnh Pixel Art V1.5!');
}

// ----------------------------------------------------------------------
// 4. TỰ ĐỘNG ĐỌC VERSION VÀ SINH TỆP P2GAME.JSON
// ----------------------------------------------------------------------

function generateP2GameJson() {
  console.log('\n--- 2. Tự động đọc phiên bản & sinh tệp metadata p2game.json ---');

  // Đọc version từ package.json
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version || '1.5.0';
  const today = new Date().toISOString().split('T')[0];

  const p2gameManifest = {
    schemaVersion: 1,
    id: "hollow-woods",
    name: "HOLLOW WOODS",
    version: version,
    sdk: {
      version: "1.1",
      cloudSave: true
    },
    leaderboards: [
      {
        id: "survival-score",
        name: "Điểm Sinh Tồn",
        description: "Bảng xếp hạng điểm sinh tồn tính theo số ngày sống sót, bình tâm và bí mật khám phá.",
        sort: "DESC",
        maxScore: 1000000,
        minSessionSeconds: 30
      }
    ],
    description: "HOLLOW WOODS: The Fog That Remembers (Bản Cập Nhật V1.5 Production Release) là tựa game sinh tồn kinh dị 2D Pixel Art đỉnh cao kết hợp giải đố môi trường, đưa bạn vào hành trình cứu rỗi ngôi làng cổ Bellhollow khi Màn Sương Ký Ức trỗi dậy nuốt chửng vạn vật.\n\nBối Cảnh & Cốt Truyện V1.5\nTrong vai lữ khách Hiệp Sĩ The Mossbound Wayfarer, bạn thức tỉnh trên con đường độc đạo dẫn vào Bellhollow. Cùng với cư dân làng (Garth gác cổng, Bà lão Edda, Thợ rèn Bram, Y sư Neris, Cậu bé đưa tin Finn) và Kỵ Sĩ Trầm Mặc Sir Vaelen tại Trạm Lửa Rừng Tĩnh Lặng, bạn sẽ vén màn bi kịch Đoàn Kỵ Sĩ Cổ Xưa, tôi luyện Chìa Khóa Thanh Tẩy, hóa giải Phong Ấn Rễ Cổ tại Đầm Lầy và đối mặt với Kẻ Nuốt Tiếng Chuông (SHADOW Series) tại Miếu Chuông Phế Tích.\n\nCơ Chế Gameplay & Sinh Tồn Don't Starve Together Style\n- Quản lý 3 chỉ số sinh tồn cốt lõi: Sinh Lực (HP), Thể Lực (Stamina) và Tinh Thần (Sanity/Composure).\n- Vòng Sáng Hộ Tâm [F] & Nghịch Lý Ánh Sáng: Tiêu hao Thể Lực để nhóm vòng sáng ấm dịu bảo vệ Tinh Thần; tuy nhiên khi bật sáng, quái vật bóng tối sẽ phát hiện bạn xa hơn +30%.\n- Chiều sâu Kinh Dị Tâm Lý: Ảo giác Hiệp Sĩ Sa Ngã (<30%), bẫy mồi nhử Tiếng Gọi Trong Sương, nhịp tim Web Audio động (75..135 BPM) và 4 góc màn hình co bóp theo mức hoảng loạn.\n- Giao diện Túi Đồ & Chế Tạo Don't Starve: Thanh 8 ô túi đồ + 4 ô trang bị cá nhân (Body, Feet, Back, Charm), thanh ghim nhanh dọc và Bảng Chế Tạo 2 tầng mở rộng [I]/[C] có tìm kiếm, danh mục và bookmark tabs.\n- Đấu trí thính giác với The Listener và Boss SHADOW Series: Ẩn nấp trong bụi rậm, ném mồi đánh lạc hướng và phá 3 Trụ Rễ Ma Quái để giải trừ phong ấn.",
    shortDescription: "Game sinh tồn kinh dị & giải đố 2D Pixel Art V1.5. Vòng sáng [F] tốn Thể Lực, quản lý Tinh Thần, bẫy ảo giác, chế tác DST và giải mã Miếu Chuông Phế Tích.",
    entry: "index.html",
    engine: "webgl",
    engineInfo: "Phaser 3.80.1",
    orientation: "landscape",
    minViewport: {
      width: 960,
      height: 540
    },
    category: "action",
    tags: [
      "survival",
      "horror",
      "pixel-art",
      "exploration",
      "puzzle",
      "stealth",
      "crafting",
      "top-down",
      "adventure",
      "atmospheric"
    ],
    ageRating: "T",
    languages: [
      "vi"
    ],
    controls: {
      keyboard: "WASD: Di chuyển | Shift: Chạy | [F]: Vòng Sáng | Space: Đánh | [E]: Tương tác/Nấp | [Q]: Mồi ném | [1]..[8]: Túi đồ | [I/C]: Chế tạo | [J]: Sổ tay | [N]: La bàn | [F8]: Gỡ kẹt | [ESC]: Tạm dừng"
    },
    assets: {
      avatar: "media/avatar_512x512.png",
      icon: "media/avatar_512x512.png",
      cover: "media/cover_banner_1280x720.png",
      background: "media/cover_banner_1280x720.png",
      screenshots: [
        "media/screen_01_bellhollow_v15.png",
        "media/screen_02_sir_vaelen_fire.png",
        "media/screen_03_crafting_ui.png",
        "media/screen_04_boss_shadow.png"
      ]
    },
    permissions: [
      "fullscreen",
      "audio",
      "persistent-storage"
    ],
    attestation: {
      ownsRights: true,
      noThirdPartyTracking: true,
      containsAds: false,
      containsIap: false
    }
  };

  const jsonStr = JSON.stringify(p2gameManifest, null, 2);

  // Ghi vào 3 nơi:
  // 1. public/p2game.json
  const pubP2Game = path.join(ROOT_DIR, 'public', 'p2game.json');
  fs.writeFileSync(pubP2Game, jsonStr, 'utf8');
  console.log(`  ✔ [SAVED] ${pubP2Game}`);

  // 2. release/p2game/p2game.json
  const relP2Game = path.join(RELEASE_P2GAME_DIR, 'p2game.json');
  fs.writeFileSync(relP2Game, jsonStr, 'utf8');
  console.log(`  ✔ [SAVED] ${relP2Game}`);

  // 3. dist/p2game.json (nằm ngay thư mục gốc bên trong file ZIP)
  if (fs.existsSync(DIST_DIR)) {
    const distP2Game = path.join(DIST_DIR, 'p2game.json');
    fs.writeFileSync(distP2Game, jsonStr, 'utf8');
    console.log(`  ✔ [SAVED] ${distP2Game}`);
  }

  // Đồng thời cập nhật file gốc p2game.json ở root project
  const rootP2Game = path.join(ROOT_DIR, 'p2game.json');
  fs.writeFileSync(rootP2Game, jsonStr, 'utf8');
  console.log(`  ✔ [SAVED] ${rootP2Game}`);

  console.log(`✔ Đã đồng bộ p2game.json phiên bản ${version} thành công!`);
}

// ----------------------------------------------------------------------
// 5. NÉN TOÀN BỘ DIST/ THÀNH GÓI ZIP RELEASE HOÀN HẢO
// ----------------------------------------------------------------------

function packageZipRelease() {
  console.log('\n--- 3. Đóng gói file release/p2game/hollow-woods-p2game-v1.5.0.zip ---');

  if (!fs.existsSync(DIST_DIR)) {
    console.log('Thư mục dist/ chưa tồn tại. Đang tiến hành build tự động...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Đảm bảo toàn bộ media và p2game.json đều có mặt trong dist
  fs.mkdirSync(DIST_MEDIA_DIR, { recursive: true });
  const mediaFiles = fs.readdirSync(PUBLIC_MEDIA_DIR);
  for (const f of mediaFiles) {
    fs.copyFileSync(path.join(PUBLIC_MEDIA_DIR, f), path.join(DIST_MEDIA_DIR, f));
  }

  const pubP2Game = path.join(ROOT_DIR, 'public', 'p2game.json');
  const distP2Game = path.join(DIST_DIR, 'p2game.json');
  if (fs.existsSync(pubP2Game)) {
    fs.copyFileSync(pubP2Game, distP2Game);
  }

  const p2gameZipOut = path.join(RELEASE_P2GAME_DIR, 'hollow-woods-p2game-v1.5.0.zip');
  if (fs.existsSync(p2gameZipOut)) {
    fs.unlinkSync(p2gameZipOut);
  }

  // Sử dụng Python zipfile để nén mức 9 tuyệt đối sạch
  const pyScript = `
import zipfile
import os

dist_dir = r'''${DIST_DIR}'''
zip_path = r'''${p2gameZipOut}'''

with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, dirs, files in os.walk(dist_dir):
        dirs.sort()
        files.sort()
        for file in files:
            full = os.path.join(root, file)
            arc = os.path.relpath(full, dist_dir).replace('\\\\', '/')
            # Loại bỏ các file rác nếu có
            if arc.endswith('.bak') or arc.endswith('.tmp'):
                continue
            zf.write(full, arc)

# Kiểm tra lại các file bắt buộc trong ZIP
with zipfile.ZipFile(zip_path, 'r') as zf:
    namelist = zf.namelist()
    assert 'index.html' in namelist, 'index.html missing'
    assert 'p2game.json' in namelist, 'p2game.json missing'
    assert 'media/avatar_512x512.png' in namelist, 'avatar missing'
    assert 'media/cover_banner_1280x720.png' in namelist, 'cover missing'
    assert 'media/screen_01_bellhollow_v15.png' in namelist, 'screen 1 missing'
    assert 'media/screen_02_sir_vaelen_fire.png' in namelist, 'screen 2 missing'
    assert 'media/screen_03_crafting_ui.png' in namelist, 'screen 3 missing'
    assert 'media/screen_04_boss_shadow.png' in namelist, 'screen 4 missing'
    print(f"VERIFY_OK: Total {len(namelist)} entries in ZIP.")
`;

  const tmpPy = path.join(ROOT_DIR, 'scripts', `_temp_p2game_zip_${Date.now()}.py`);
  fs.writeFileSync(tmpPy, pyScript.trim(), 'utf8');
  try {
    execSync(`python "${tmpPy}"`, { stdio: 'inherit' });
  } finally {
    if (fs.existsSync(tmpPy)) fs.unlinkSync(tmpPy);
  }

  const zipStat = fs.statSync(p2gameZipOut);
  console.log(`✅ Đã xuất gói P2Game: ${p2gameZipOut}`);
  console.log(`📦 Dung lượng P2Game ZIP: ${(zipStat.size / (1024 * 1024)).toFixed(2)} MB (${zipStat.size.toLocaleString()} bytes)`);

  console.log('\n' + '='.repeat(72));
  console.log('🎉 QUY TRÌNH POST-BUILD P2GAME HOÀN TẤT THÀNH CÔNG VƯỢT TRỘI!');
  console.log('='.repeat(72));
}

// ----------------------------------------------------------------------
// 6. THỰC THI TOÀN BỘ QUY TRÌNH
// ----------------------------------------------------------------------

async function main() {
  await generateMediaAssets();
  generateP2GameJson();
  packageZipRelease();
}

main().catch(err => {
  console.error('❌ Lỗi quy trình build P2Game release:', err);
  process.exit(1);
});
