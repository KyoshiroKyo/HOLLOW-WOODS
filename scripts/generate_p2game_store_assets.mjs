/**
 * GENERATE P2GAME STORE ASSETS (MILESTONE C4-13-22)
 * Tạo bộ ảnh cửa hàng P2Game chuẩn pixel art:
 * - public/store/icon.png (512x512)
 * - public/store/cover.png (1280x720)
 * - public/store/screenshot1.png (1280x720)
 * - public/store/screenshot2.png (1280x720)
 * - public/store/screenshot3.png (1280x720)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const STORE_DIR = path.resolve('public/store');
if (!fs.existsSync(STORE_DIR)) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

// 1. BITMAP FONT 3x5 (Hỗ trợ 0-9, A-Z, ký tự đặc biệt)
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
  'x': [0b101, 0b101, 0b010, 0b101, 0b101]
};

// 2. HELPER FUNCTIONS
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
  const abs = path.resolve(relPath);
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
    const a = Math.round(c1[3] * (1 - t) + c2[3] * t);
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
          factor = factor * factor; // smooth falloff
        }
        const a = Math.round(maxA * factor);
        if (a > 0) {
          setPixel(png, x, y, r, g, b, a);
        }
      }
    }
  }
}

function blit(src, dst, dstX, dstY, { scale = 1, srcX = 0, srcY = 0, srcW = null, srcH = null, alpha = 1.0, flipX = false } = {}) {
  if (!src) return;
  const sw = srcW !== null ? srcW : src.width;
  const sh = srcH !== null ? srcH : src.height;

  for (let dy = 0; dy < sh * scale; dy++) {
    const sy = Math.floor(dy / scale) + srcY;
    if (sy < 0 || sy >= src.height) continue;
    const targetY = dstY + dy;
    if (targetY < 0 || targetY >= dst.height) continue;

    for (let dx = 0; dx < sw * scale; dx++) {
      const sxStep = Math.floor(dx / scale);
      const sx = flipX ? (srcX + sw - 1 - sxStep) : (srcX + sxStep);
      if (sx < 0 || sx >= src.width) continue;
      const targetX = dstX + dx;
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
          Math.round(sa * 255)
        );
      }
    }
  }
}

function drawText(png, text, x, y, scale = 2, color = [255, 255, 255, 255], shadow = true) {
  const upper = text.toUpperCase();
  let curX = x;
  const charSpacing = scale;

  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    const bitmap = FONT_3X5[ch] || FONT_3X5[' '];

    if (shadow) {
      for (let r = 0; r < 5; r++) {
        const row = bitmap[r];
        for (let c = 0; c < 3; c++) {
          if ((row >> (2 - c)) & 1) {
            fillRect(png, curX + c * scale + 1, y + r * scale + 1, scale, scale, [0, 0, 0, 180]);
          }
        }
      }
    }

    for (let r = 0; r < 5; r++) {
      const row = bitmap[r];
      for (let c = 0; c < 3; c++) {
        if ((row >> (2 - c)) & 1) {
          fillRect(png, curX + c * scale, y + r * scale, scale, scale, color);
        }
      }
    }

    curX += 3 * scale + charSpacing;
  }
  return curX;
}

// 3. COMMON HUD RENDERER FOR GAMEPLAY SCREENSHOTS
function renderHUD(dst, { health = 85, stamina = 100, oil = 75, composure = 90, lanternOn = true, questTitle = 'HOI 1: LANG BELLHOLLOW', questTask = 'Gap ba Edda tai Thap Chuong', prompt = '' } = {}) {
  // Stat Card Backing
  fillRect(dst, 16, 16, 260, 96, [12, 16, 24, 190]);
  drawRectOutline(dst, 16, 16, 260, 96, [45, 55, 72, 220], 1);

  // Character Name
  drawText(dst, 'THE MOSSBOUND WAYFARER', 26, 24, 1, [243, 156, 18, 255]);

  // Bars: Sinh Lực (Health)
  fillRect(dst, 26, 38, 12, 10, [231, 76, 60, 255]); // Heart icon
  fillRect(dst, 44, 38, 140, 10, [30, 20, 20, 230]);
  fillRect(dst, 44, 38, Math.round(140 * (health / 100)), 10, [231, 76, 60, 255]);
  drawText(dst, `HP ${health}/100`, 190, 40, 1, [231, 76, 60, 255]);

  // Thể Lực (Stamina)
  fillRect(dst, 26, 52, 12, 10, [241, 196, 15, 255]); // Lightning
  fillRect(dst, 44, 52, 140, 10, [30, 30, 15, 230]);
  fillRect(dst, 44, 52, Math.round(140 * (stamina / 100)), 10, [241, 196, 15, 255]);
  drawText(dst, `STA ${stamina}/100`, 190, 54, 1, [241, 196, 15, 255]);

  // Dầu Đèn (Oil)
  fillRect(dst, 26, 66, 12, 10, [230, 126, 34, 255]); // Flame
  fillRect(dst, 44, 66, 140, 10, [35, 25, 15, 230]);
  fillRect(dst, 44, 66, Math.round(140 * (oil / 100)), 10, [230, 126, 34, 255]);
  drawText(dst, `OIL ${oil}/100`, 190, 68, 1, [230, 126, 34, 255]);

  // Bình Tâm (Composure)
  fillRect(dst, 26, 80, 12, 10, [155, 89, 182, 255]); // Eye
  fillRect(dst, 44, 80, 140, 10, [30, 20, 35, 230]);
  fillRect(dst, 44, 80, Math.round(140 * (composure / 100)), 10, [155, 89, 182, 255]);
  drawText(dst, `SAN ${composure}/100`, 190, 82, 1, [155, 89, 182, 255]);

  // Lantern Badge
  const badgeColor = lanternOn ? [243, 156, 18, 255] : [100, 110, 125, 255];
  const badgeText = lanternOn ? '[F] DEN: SANG' : '[F] DEN: TAT';
  fillRect(dst, 26, 96, 100, 12, [15, 20, 28, 220]);
  drawRectOutline(dst, 26, 96, 100, 12, badgeColor, 1);
  drawText(dst, badgeText, 32, 99, 1, badgeColor);

  // Quest Box Top-Right
  fillRect(dst, dst.width - 360, 16, 344, 68, [12, 16, 24, 190]);
  drawRectOutline(dst, dst.width - 360, 16, 344, 68, [241, 196, 15, 180], 1);
  drawText(dst, 'NHIEM VU HIEN TAI [J]:', dst.width - 348, 24, 1, [241, 196, 15, 255]);
  drawText(dst, questTitle, dst.width - 348, 40, 2, [255, 255, 255, 255]);
  drawText(dst, questTask, dst.width - 348, 62, 1, [149, 165, 166, 255]);

  // Quickslot Bar Bottom
  const slotW = 120;
  const slotH = 32;
  const startX = Math.round((dst.width - slotW * 6 - 50) / 2);
  const bottomY = dst.height - 48;
  const slots = [
    { key: '[1] THUOC DAP', active: false },
    { key: '[2] DAU DEN', active: false },
    { key: '[Q] MOI NEM', active: false },
    { key: '[F] DEN LONG', active: lanternOn },
    { key: '[I] CHE TAO', active: false },
    { key: '[J] SO TAY', active: false }
  ];

  slots.forEach((s, i) => {
    const sx = startX + i * (slotW + 10);
    fillRect(dst, sx, bottomY, slotW, slotH, [15, 20, 28, 210]);
    const border = s.active ? [241, 196, 15, 255] : [55, 65, 80, 200];
    drawRectOutline(dst, sx, bottomY, slotW, slotH, border, 1);
    drawText(dst, s.key, sx + 12, bottomY + 11, 1, s.active ? [241, 196, 15, 255] : [200, 210, 220, 255]);
  });

  // Prompt Capsule
  if (prompt) {
    const pw = prompt.length * 8 + 36;
    const px = Math.round((dst.width - pw) / 2);
    const py = dst.height - 100;
    fillRect(dst, px, py, pw, 26, [10, 15, 22, 210]);
    drawRectOutline(dst, px, py, pw, 26, [241, 196, 15, 220], 1);
    drawText(dst, prompt, px + 18, py + 8, 1, [255, 255, 255, 255]);
  }
}

// 4. MAIN GENERATION PIPELINE
async function generateAll() {
  console.log('================================================================');
  console.log('   HOLLOW WOODS V1.3 — GENERATING P2GAME STORE ASSETS');
  console.log('================================================================\n');

  // Load Sprites
  const wayfarerSheet = loadPNG('public/assets/characters/mossbound_wayfarer/wayfarer_idle.png');
  const wayfarerRun = loadPNG('public/assets/characters/mossbound_wayfarer/wayfarer_run.png');
  const wayfarerPortrait = loadPNG('public/assets/characters/mossbound_wayfarer/wayfarer_portrait.png');
  const bellTower = loadPNG('public/assets/environment/sprites/bell_tower.png');
  const houseEdda = loadPNG('public/assets/environment/sprites/house_edda.png');
  const houseNeris = loadPNG('public/assets/environment/sprites/house_neris.png');
  const villageWell = loadPNG('public/assets/environment/sprites/village_well.png');
  const craftingBench = loadPNG('public/assets/environment/sprites/crafting_bench.png');
  const treeOak1 = loadPNG('public/assets/environment/sprites/tree_oak_1.png');
  const treeOak2 = loadPNG('public/assets/environment/sprites/tree_oak_2.png');
  const treeDead = loadPNG('public/assets/environment/sprites/tree_dead.png');
  const hollowTree = loadPNG('public/assets/environment/sprites/hollow_tree.png');
  const brokenShrine = loadPNG('public/assets/environment/sprites/broken_shrine.png');
  const stoneAltar = loadPNG('public/assets/environment/sprites/stone_altar.png');
  const pillarMoon = loadPNG('public/assets/environment/sprites/pillar_moon.png');
  const pillarRoot = loadPNG('public/assets/environment/sprites/pillar_root.png');
  const pillarEye = loadPNG('public/assets/environment/sprites/pillar_eye.png');
  const theListener = loadPNG('public/assets/monsters/the_listener.png');
  const npcEdda = loadPNG('public/assets/characters/npcs/edda.png');
  const npcGarth = loadPNG('public/assets/characters/npcs/garth.png');
  const npcBram = loadPNG('public/assets/characters/villagers/npc_blacksmith.png');
  const fence = loadPNG('public/assets/environment/sprites/wooden_fence.png');

  // -------------------------------------------------------------
  // A. ICON (512x512 px)
  // -------------------------------------------------------------
  console.log('1. Rendering public/store/icon.png (512x512 px)...');
  const icon = createPNG(512, 512, [6, 12, 16, 255]);

  // Dark forest vignette
  fillGradientV(icon, 0, 0, 512, 512, [8, 18, 22, 255], [4, 8, 10, 255]);

  // Amber glow from lantern
  drawRadialGlow(icon, 330, 260, 40, 220, [243, 156, 18, 140]);
  drawRadialGlow(icon, 330, 260, 15, 90, [255, 230, 150, 220]);

  // Background subtle tree silhouettes
  if (treeOak1) blit(treeOak1, icon, -30, 60, { scale: 3, alpha: 0.15 });
  if (treeDead) blit(treeDead, icon, 310, 50, { scale: 3, alpha: 0.18, flipX: true });

  // Main Character Portrait 5.5x
  if (wayfarerSheet) {
    blit(wayfarerSheet, icon, 80, 80, { scale: 5, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Golden Gothic Double Border
  drawRectOutline(icon, 8, 8, 496, 496, [180, 140, 60, 255], 3);
  drawRectOutline(icon, 14, 14, 484, 484, [241, 196, 15, 180], 1);
  drawRectOutline(icon, 18, 18, 476, 476, [100, 80, 35, 220], 1);

  // Corner Accents
  const corners = [
    [10, 10], [486, 10], [10, 486], [486, 486]
  ];
  corners.forEach(([cx, cy]) => {
    fillRect(icon, cx, cy, 16, 16, [241, 196, 15, 255]);
    fillRect(icon, cx + 3, cy + 3, 10, 10, [15, 22, 30, 255]);
  });

  // Bottom Title Plate
  fillRect(icon, 56, 420, 400, 64, [10, 16, 24, 235]);
  drawRectOutline(icon, 56, 420, 400, 64, [241, 196, 15, 240], 2);
  drawText(icon, 'HOLLOW WOODS', 82, 436, 4, [241, 196, 15, 255]);
  drawText(icon, 'V1.3 • SURVIVAL HORROR', 160, 464, 1, [200, 215, 230, 220]);

  fs.writeFileSync(path.join(STORE_DIR, 'icon.png'), PNG.sync.write(icon));
  console.log('✔ public/store/icon.png created successfully (512x512).');

  // -------------------------------------------------------------
  // B. COVER (1280x720 px - 16:9)
  // -------------------------------------------------------------
  console.log('\n2. Rendering public/store/cover.png (1280x720 px)...');
  const cover = createPNG(1280, 720, [8, 14, 18, 255]);

  // Night forest sky gradient
  fillGradientV(cover, 0, 0, 1280, 460, [5, 10, 14, 255], [12, 24, 28, 255]);
  // Ground
  fillGradientV(cover, 0, 460, 1280, 260, [18, 28, 24, 255], [10, 16, 14, 255]);

  // Distant Village Buildings in fog
  if (bellTower) blit(bellTower, cover, 760, 190, { scale: 2.8, alpha: 0.75 });
  if (houseEdda) blit(houseEdda, cover, 180, 290, { scale: 2.2, alpha: 0.65 });
  if (houseNeris) blit(houseNeris, cover, 980, 280, { scale: 2.2, alpha: 0.60 });
  if (villageWell) blit(villageWell, cover, 420, 440, { scale: 2.2, alpha: 0.85 });

  // Forest Trees Framing Left & Right
  if (treeOak1) blit(treeOak1, cover, -40, 180, { scale: 3.2, alpha: 0.95 });
  if (treeOak2) blit(treeOak2, cover, 1040, 160, { scale: 3.4, alpha: 0.95, flipX: true });
  if (treeDead) blit(treeDead, cover, 320, 260, { scale: 2.4, alpha: 0.55 });

  // Wayfarer Center with Lantern
  const heroX = 560;
  const heroY = 380;
  // Dynamic Lantern Glow
  drawRadialGlow(cover, heroX + 110, heroY + 80, 50, 360, [243, 156, 18, 130]);
  drawRadialGlow(cover, heroX + 110, heroY + 80, 20, 120, [255, 245, 180, 220]);

  // Hero Sprite
  if (wayfarerSheet) {
    blit(wayfarerSheet, cover, heroX, heroY, { scale: 4.2, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Fences
  if (fence) {
    blit(fence, cover, 120, 500, { scale: 2.2, alpha: 0.8 });
    blit(fence, cover, 240, 500, { scale: 2.2, alpha: 0.8 });
    blit(fence, cover, 920, 500, { scale: 2.2, alpha: 0.8 });
  }

  // Vignette dark edges
  drawRectOutline(cover, 0, 0, 1280, 720, [0, 0, 0, 180], 8);

  // Big Title Banner at Upper Center
  fillRect(cover, 240, 50, 800, 130, [8, 12, 16, 200]);
  drawRectOutline(cover, 240, 50, 800, 130, [241, 196, 15, 230], 2);
  drawText(cover, 'HOLLOW WOODS', 300, 72, 8, [241, 196, 15, 255]);
  drawText(cover, 'THE FOG THAT REMEMBERS', 440, 134, 3, [230, 235, 240, 240]);

  // Bottom Tagline
  fillRect(cover, 440, 660, 400, 32, [10, 14, 20, 220]);
  drawRectOutline(cover, 440, 660, 400, 32, [100, 120, 140, 180], 1);
  drawText(cover, 'V1.3 • P2GAME.IO • 2D SURVIVAL HORROR', 472, 672, 1, [241, 196, 15, 255]);

  fs.writeFileSync(path.join(STORE_DIR, 'cover.png'), PNG.sync.write(cover));
  console.log('✔ public/store/cover.png created successfully (1280x720).');

  // -------------------------------------------------------------
  // C. SCREENSHOT 1: Làng Cổ Bellhollow & Sinh Tồn
  // -------------------------------------------------------------
  console.log('\n3. Rendering public/store/screenshot1.png (Bellhollow Village)...');
  const sc1 = createPNG(1280, 720, [15, 22, 20, 255]);

  // Ground: Cobblestone & grass
  fillGradientV(sc1, 0, 0, 1280, 360, [12, 20, 22, 255], [20, 30, 26, 255]);
  fillGradientV(sc1, 0, 360, 1280, 360, [26, 36, 30, 255], [18, 25, 22, 255]);

  // Buildings & props
  if (bellTower) blit(bellTower, sc1, 560, 140, { scale: 2.2 });
  if (houseEdda) blit(houseEdda, sc1, 160, 210, { scale: 2.2 });
  if (houseNeris) blit(houseNeris, sc1, 940, 210, { scale: 2.2 });
  if (craftingBench) blit(craftingBench, sc1, 840, 330, { scale: 2.2 });
  if (villageWell) blit(villageWell, sc1, 400, 350, { scale: 2.2 });
  if (treeOak1) blit(treeOak1, sc1, 20, 160, { scale: 2.2 });
  if (treeOak2) blit(treeOak2, sc1, 1080, 160, { scale: 2.2, flipX: true });

  // NPCs
  if (npcEdda) blit(npcEdda, sc1, 530, 370, { scale: 2.2 });
  if (npcGarth) blit(npcGarth, sc1, 280, 360, { scale: 2.2 });
  if (npcBram) blit(npcBram, sc1, 910, 360, { scale: 2.2 });

  // Player with Lantern
  const p1X = 640;
  const p1Y = 410;
  drawRadialGlow(sc1, p1X + 50, p1Y + 30, 30, 220, [243, 156, 18, 120]);
  if (wayfarerSheet) {
    blit(wayfarerSheet, sc1, p1X, p1Y, { scale: 2.2, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Full HUD
  renderHUD(sc1, {
    health: 90,
    stamina: 100,
    oil: 80,
    composure: 95,
    lanternOn: true,
    questTitle: 'HOI 1: LANG BELLHOLLOW',
    questTask: 'Tro chuyen voi Ba Lao Edda duoi Thap Chuong',
    prompt: '[E] TRO CHUYEN VOI EDDA (NGUOI GIU CHUONG)'
  });

  fs.writeFileSync(path.join(STORE_DIR, 'screenshot1.png'), PNG.sync.write(sc1));
  console.log('✔ public/store/screenshot1.png created successfully (1280x720).');

  // -------------------------------------------------------------
  // D. SCREENSHOT 2: Rừng Sâu & Ẩn Nấp Kẻ Lắng Nghe
  // -------------------------------------------------------------
  console.log('\n4. Rendering public/store/screenshot2.png (Deep Forest & Stealth)...');
  const sc2 = createPNG(1280, 720, [8, 12, 14, 255]);

  // Dark creepy forest background
  fillGradientV(sc2, 0, 0, 1280, 420, [5, 8, 10, 255], [10, 16, 16, 255]);
  fillGradientV(sc2, 0, 420, 1280, 300, [14, 20, 18, 255], [8, 12, 10, 255]);

  // Dense trees & fog
  if (treeDead) blit(treeDead, sc2, 100, 180, { scale: 2.5, alpha: 0.7 });
  if (treeOak1) blit(treeOak1, sc2, 260, 160, { scale: 2.4, alpha: 0.85 });
  if (treeOak2) blit(treeOak2, sc2, 700, 160, { scale: 2.5, alpha: 0.75, flipX: true });
  if (treeDead) blit(treeDead, sc2, 1020, 180, { scale: 2.6, alpha: 0.8 });

  // Hollow Tree in foreground for stealth
  if (hollowTree) blit(hollowTree, sc2, 440, 260, { scale: 2.4 });

  // The Listener lurking in distance with red eye/sense glow
  if (theListener) {
    drawRadialGlow(sc2, 880, 330, 20, 140, [192, 57, 43, 130]);
    blit(theListener, sc2, 850, 300, { scale: 2.4, srcX: 0, srcY: 0, srcW: 64, srcH: 64, alpha: 0.85 });
  }

  // Player crouched inside hollow tree
  if (wayfarerSheet) {
    blit(wayfarerSheet, sc2, 470, 410, { scale: 2.2, srcX: 0, srcY: 0, srcW: 64, srcH: 64, alpha: 0.95 });
  }

  // Red danger vignette on screen edges
  drawRectOutline(sc2, 0, 0, 1280, 720, [192, 57, 43, 60], 6);
  drawRectOutline(sc2, 6, 6, 1268, 708, [192, 57, 43, 30], 6);

  // HUD: Stealth & danger state
  renderHUD(sc2, {
    health: 70,
    stamina: 65,
    oil: 50,
    composure: 45,
    lanternOn: false,
    questTitle: 'HOI 3: DUONG MON QUANH CO',
    questTask: 'Nap vao Than Cay Rong, tranh ne Ke Lang Nghe',
    prompt: '[E] / [WASD] BUOC RA KHOI CHO TRON'
  });

  fs.writeFileSync(path.join(STORE_DIR, 'screenshot2.png'), PNG.sync.write(sc2));
  console.log('✔ public/store/screenshot2.png created successfully (1280x720).');

  // -------------------------------------------------------------
  // E. SCREENSHOT 3: Miếu Chuông Phế Tích & Cổ Ngữ
  // -------------------------------------------------------------
  console.log('\n5. Rendering public/store/screenshot3.png (Broken Bell Shrine)...');
  const sc3 = createPNG(1280, 720, [10, 16, 20, 255]);

  // Murky swamp water & stone courtyard
  fillGradientV(sc3, 0, 0, 1280, 340, [8, 14, 18, 255], [14, 24, 28, 255]);
  fillGradientV(sc3, 0, 340, 1280, 380, [18, 28, 30, 255], [10, 18, 20, 255]);

  // Boardwalk and stone courtyard
  fillRect(sc3, 340, 320, 600, 320, [35, 42, 48, 255]);
  drawRectOutline(sc3, 340, 320, 600, 320, [50, 62, 70, 255], 3);

  // Broken Shrine in center
  if (brokenShrine) blit(brokenShrine, sc3, 580, 200, { scale: 2.2 });
  // Stone Altar with turquoise glow
  drawRadialGlow(sc3, 640, 420, 30, 160, [52, 152, 219, 140]);
  if (stoneAltar) blit(stoneAltar, sc3, 610, 390, { scale: 2.2 });

  // 3 Runic Pillars with celestial beams
  if (pillarMoon) {
    drawRadialGlow(sc3, 400, 340, 15, 90, [46, 204, 113, 160]);
    blit(pillarMoon, sc3, 384, 300, { scale: 2.2 });
  }
  if (pillarRoot) {
    drawRadialGlow(sc3, 860, 340, 15, 90, [46, 204, 113, 160]);
    blit(pillarRoot, sc3, 844, 300, { scale: 2.2 });
  }
  if (pillarEye) {
    drawRadialGlow(sc3, 640, 520, 15, 90, [46, 204, 113, 160]);
    blit(pillarEye, sc3, 624, 480, { scale: 2.2 });
  }

  // Player at altar
  const p3X = 640;
  const p3Y = 430;
  drawRadialGlow(sc3, p3X + 45, p3Y + 30, 25, 180, [243, 156, 18, 120]);
  if (wayfarerSheet) {
    blit(wayfarerSheet, sc3, p3X, p3Y, { scale: 2.2, srcX: 0, srcY: 0, srcW: 64, srcH: 64 });
  }

  // Framing trees
  if (treeDead) blit(treeDead, sc3, 60, 200, { scale: 2.2, alpha: 0.75 });
  if (treeDead) blit(treeDead, sc3, 1060, 200, { scale: 2.2, alpha: 0.75, flipX: true });

  // HUD: Final chapter state
  renderHUD(sc3, {
    health: 85,
    stamina: 95,
    oil: 70,
    composure: 85,
    lanternOn: true,
    questTitle: 'HOI 5: MIEU CHUONG PHE TICH',
    questTask: 'Thu hoi Luoi Chuong Dong Co tren be da',
    prompt: '[E] THU HOI LUOI CHUONG DONG CO'
  });

  fs.writeFileSync(path.join(STORE_DIR, 'screenshot3.png'), PNG.sync.write(sc3));
  console.log('✔ public/store/screenshot3.png created successfully (1280x720).');

  console.log('\n================================================================');
  console.log('>>> HOÀN TẤT TẠO 5 TỆP ẢNH CỬA HÀNG P2GAME CHUẨN XÁC 100%! <<<');
  console.log('================================================================');
}

generateAll().catch(e => {
  console.error('Lỗi sinh ảnh store:', e);
  process.exit(1);
});
