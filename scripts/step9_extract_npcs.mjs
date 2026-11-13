/**
 * HOLLOW WOODS V3.0 – SCRIPT TRÍCH XUẤT SPRITES & CHÂN DUNG 3 NPC PIXEL ART (PASS T09)
 * Trích xuất từ:
 *   - public/assets/environment/tilesets/TX Player.png (128×128)
 *   - Pixel_Art/AnimationSheet_Character.png (256×288)
 * 
 * Xuất vào:
 *   - public/assets/characters/npcs/ & public/assets/characters/:
 *     1. npc_garth.png       & portrait_garth.png  (64×64 px)
 *     2. npc_edda.png        & portrait_edda.png   (64×64 px)
 *     3. npc_neris.png       & portrait_neris.png  (64×64 px)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const PROJECT_ROOT = process.cwd();
const TX_PLAYER_PATH = path.join(PROJECT_ROOT, 'public', 'assets', 'environment', 'tilesets', 'TX Player.png');
const ANIM_CHAR_PATH = path.join(PROJECT_ROOT, 'Pixel_Art', 'AnimationSheet_Character.png');

const OUT_DIR_NPCS = path.join(PROJECT_ROOT, 'public', 'assets', 'characters', 'npcs');
const OUT_DIR_CHARS = path.join(PROJECT_ROOT, 'public', 'assets', 'characters');

if (!fs.existsSync(OUT_DIR_NPCS)) {
  fs.mkdirSync(OUT_DIR_NPCS, { recursive: true });
}

const txPng = PNG.sync.read(fs.readFileSync(TX_PLAYER_PATH));
const animPng = PNG.sync.read(fs.readFileSync(ANIM_CHAR_PATH));

console.log(`[PASS T09] Đã nạp TX Player (${txPng.width}×${txPng.height}) và AnimationSheet_Character (${animPng.width}×${animPng.height})`);

function createBlank(w, h) {
  const p = new PNG({ width: w, height: h });
  p.data.fill(0);
  return p;
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

function drawShadow(target, cx, cy, rx, ry) {
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const dist = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (dist <= 1.0) {
        const alpha = Math.round((1.0 - dist * 0.5) * 110);
        setPixel(target, cx + dx, cy + dy, 10, 12, 16, alpha);
      }
    }
  }
}

function drawPortraitFrame(target) {
  const W = target.width;
  const H = target.height;
  // Nền hộp chân dung màu tối cổ xưa
  for (let y = 3; y < H - 3; y++) {
    for (let x = 3; x < W - 3; x++) {
      setPixel(target, x, y, 16, 20, 26, 255);
    }
  }
  // Viền vàng đồng trung cổ 2 lớp
  for (let x = 2; x < W - 2; x++) {
    setPixel(target, x, 2, 184, 134, 11, 255);
    setPixel(target, x, H - 3, 138, 109, 59, 255);
    setPixel(target, x, 3, 218, 165, 32, 220);
    setPixel(target, x, H - 4, 90, 70, 35, 220);
  }
  for (let y = 2; y < H - 2; y++) {
    setPixel(target, 2, y, 184, 134, 11, 255);
    setPixel(target, W - 3, y, 138, 109, 59, 255);
    setPixel(target, 3, y, 218, 165, 32, 220);
    setPixel(target, W - 4, y, 90, 70, 35, 220);
  }
  // Góc đinh tán kim loại
  const corners = [[3,3], [W-4,3], [3,H-4], [W-4,H-4]];
  for (const [cx, cy] of corners) {
    setPixel(target, cx, cy, 255, 215, 0, 255);
  }
}

function saveInBothDirs(png, fileName, label) {
  const p1 = path.join(OUT_DIR_NPCS, fileName);
  fs.writeFileSync(p1, PNG.sync.write(png));
  const p2 = path.join(OUT_DIR_CHARS, fileName);
  fs.writeFileSync(p2, PNG.sync.write(png));
  console.log(`✓ [${label}] Đã lưu: ${fileName} (${png.width}×${png.height} px)`);
}

// =========================================================================
// 1. GARTH - DÂN LÀNG / NGƯỜI DẪN ĐƯỜNG PHONG TRẦN
// =========================================================================
function buildGarth() {
  // A. Sprite trong game 64×64 px
  const sprite = createBlank(64, 64);
  drawShadow(sprite, 32, 58, 10, 4);

  // Cắt Garth từ TX Player Col 0: x: 4..27 (w=24), y: 12..58 (h=47)
  const srcX = 4;
  const srcY = 12;
  const W = 24;
  const H = 47;
  const dstX = 32 - Math.floor(W / 2); // 20
  const dstY = 58 - H;                // 11

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sIdx = ((srcY + y) * txPng.width + (srcX + x)) << 2;
      const a = txPng.data[sIdx + 3];
      if (a > 20) {
        setPixel(sprite, dstX + x, dstY + y, txPng.data[sIdx], txPng.data[sIdx + 1], txPng.data[sIdx + 2], a);
      }
    }
  }
  saveInBothDirs(sprite, 'npc_garth.png', 'Sprite Dân Làng Garth');

  // B. Chân dung hội thoại 64×64 px
  const portrait = createBlank(64, 64);
  drawPortraitFrame(portrait);

  // Đầu & vai Garth từ TX Player: x: 5..26 (w=22), y: 12..35 (h=24)
  // Scale 2× lên 44×48 px, căn giữa tại x = 10, y = 8
  const pW = 22;
  const pH = 24;
  const scale = 2;
  const pDstX = 10;
  const pDstY = 8;

  for (let y = 0; y < pH; y++) {
    for (let x = 0; x < pW; x++) {
      const sIdx = ((12 + y) * txPng.width + (5 + x)) << 2;
      const a = txPng.data[sIdx + 3];
      if (a > 20) {
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            setPixel(portrait, pDstX + x * scale + sx, pDstY + y * scale + sy,
              txPng.data[sIdx], txPng.data[sIdx + 1], txPng.data[sIdx + 2], a);
          }
        }
      }
    }
  }
  saveInBothDirs(portrait, 'portrait_garth.png', 'Chân Dung Dân Làng Garth');
}

// =========================================================================
// 2. EDDA - NGƯỜI GIỮ CHUÔNG (ÁO CHOÀNG ĐỎ TÍA THẪM UY NGHIÊM)
// =========================================================================
function buildEdda() {
  // A. Sprite trong game 64×64 px
  const sprite = createBlank(64, 64);
  drawShadow(sprite, 32, 58, 11, 4);

  // Trích xuất Edda từ AnimationSheet_Character Row 0: x: 4..27 (w=24), y: 3..31 (h=29)
  // Scale 1.5× lên khoảng 36×44 px
  const srcX = 4;
  const srcY = 3;
  const W = 24;
  const H = 29;
  const scale = 1.5;
  const outW = Math.round(W * scale);
  const outH = Math.round(H * scale);
  const dstX = 32 - Math.floor(outW / 2);
  const dstY = 58 - outH;

  for (let y = 0; y < outH; y++) {
    const origY = Math.min(H - 1, Math.floor(y / scale));
    for (let x = 0; x < outW; x++) {
      const origX = Math.min(W - 1, Math.floor(x / scale));
      const sIdx = ((srcY + origY) * animPng.width + (srcX + origX)) << 2;
      const a = animPng.data[sIdx + 3];
      if (a > 20) {
        setPixel(sprite, dstX + x, dstY + y, animPng.data[sIdx], animPng.data[sIdx + 1], animPng.data[sIdx + 2], a);
      }
    }
  }
  saveInBothDirs(sprite, 'npc_edda.png', 'Sprite Người Giữ Chuông Edda');

  // B. Chân dung hội thoại 64×64 px
  const portrait = createBlank(64, 64);
  drawPortraitFrame(portrait);

  // Cắt đầu & khăn trùm đỏ tía của Edda: x: 5..26 (w=22), y: 3..24 (h=22)
  // Scale 2× lên 44×44 px, căn giữa tại x = 10, y = 10
  const pW = 22;
  const pH = 22;
  const pScale = 2;
  const pDstX = 10;
  const pDstY = 10;

  for (let y = 0; y < pH; y++) {
    for (let x = 0; x < pW; x++) {
      const sIdx = ((3 + y) * animPng.width + (5 + x)) << 2;
      const a = animPng.data[sIdx + 3];
      if (a > 20) {
        for (let sy = 0; sy < pScale; sy++) {
          for (let sx = 0; sx < pScale; sx++) {
            setPixel(portrait, pDstX + x * pScale + sx, pDstY + y * pScale + sy,
              animPng.data[sIdx], animPng.data[sIdx + 1], animPng.data[sIdx + 2], a);
          }
        }
      }
    }
  }
  saveInBothDirs(portrait, 'portrait_edda.png', 'Chân Dung Người Giữ Chuông Edda');
}

// =========================================================================
// 3. NERIS - THẢO DƯỢC SĨ (TRANG PHỤC XANH RÊU THẢO MỘC)
// =========================================================================
function buildNeris() {
  // A. Sprite trong game 64×64 px
  const sprite = createBlank(64, 64);
  drawShadow(sprite, 32, 58, 9, 4);

  // Trích xuất Neris từ TX Player Col 1: x: 36..59 (w=24), y: 10..58 (h=49)
  const srcX = 36;
  const srcY = 10;
  const W = 24;
  const H = 49;
  const dstX = 32 - Math.floor(W / 2);
  const dstY = 58 - H;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sIdx = ((srcY + y) * txPng.width + (srcX + x)) << 2;
      const a = txPng.data[sIdx + 3];
      if (a > 20) {
        let r = txPng.data[sIdx];
        let g = txPng.data[sIdx + 1];
        let b = txPng.data[sIdx + 2];

        // Nếu là phần áo/khăn choàng (màu nâu cát sẫm), chuyển sang sắc xanh rêu thảo mộc
        if (y > 14 && y < 42 && r > 80 && g > 60 && b < 130) {
          r = Math.round(r * 0.45);
          g = Math.min(255, Math.round(g * 1.35));
          b = Math.round(b * 0.65);
        }

        setPixel(sprite, dstX + x, dstY + y, r, g, b, a);
      }
    }
  }
  saveInBothDirs(sprite, 'npc_neris.png', 'Sprite Thảo Dược Sĩ Neris');

  // B. Chân dung hội thoại 64×64 px
  const portrait = createBlank(64, 64);
  drawPortraitFrame(portrait);

  // Đầu & vai Neris từ TX Player: x: 37..58 (w=22), y: 10..33 (h=24)
  // Scale 2× lên 44×48 px, căn giữa tại x = 10, y = 8
  const pW = 22;
  const pH = 24;
  const pScale = 2;
  const pDstX = 10;
  const pDstY = 8;

  for (let y = 0; y < pH; y++) {
    for (let x = 0; x < pW; x++) {
      const sIdx = ((10 + y) * txPng.width + (37 + x)) << 2;
      const a = txPng.data[sIdx + 3];
      if (a > 20) {
        let r = txPng.data[sIdx];
        let g = txPng.data[sIdx + 1];
        let b = txPng.data[sIdx + 2];

        if (y > 10 && r > 70 && g > 50 && b < 130) {
          r = Math.round(r * 0.45);
          g = Math.min(255, Math.round(g * 1.35));
          b = Math.round(b * 0.65);
        }

        for (let sy = 0; sy < pScale; sy++) {
          for (let sx = 0; sx < pScale; sx++) {
            setPixel(portrait, pDstX + x * pScale + sx, pDstY + y * pScale + sy, r, g, b, a);
          }
        }
      }
    }
  }
  saveInBothDirs(portrait, 'portrait_neris.png', 'Chân Dung Thảo Dược Sĩ Neris');
}

console.log('[PASS T09] Bắt đầu xử lý và xuất toàn bộ 3 NPC & 3 chân dung pixel art...');
buildGarth();
buildEdda();
buildNeris();
console.log('[PASS T09] Hoàn thành trích xuất xuất sắc toàn bộ 6 file NPC!');

