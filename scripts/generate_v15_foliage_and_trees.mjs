/**
 * Generator script for Bellhollow Medieval Trees & Ground Decals (V15-11)
 * Uses pngjs to author crisp, high-fidelity dark fantasy pixel art.
 */
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const TREE_DIR = path.resolve('public/assets/environment/trees');
const FOLIAGE_DIR = path.resolve('public/assets/environment/foliage');
const SPRITE_DIR = path.resolve('public/assets/environment/sprites');

for (const d of [TREE_DIR, FOLIAGE_DIR, SPRITE_DIR]) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function parseColor(hex, alpha = 255) {
  if (typeof hex !== 'string') return [0, 0, 0, 0];
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b, alpha];
}

class PixelCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.png = new PNG({ width, height });
    for (let i = 0; i < this.png.data.length; i += 4) {
      this.png.data[i] = 0;
      this.png.data[i + 1] = 0;
      this.png.data[i + 2] = 0;
      this.png.data[i + 3] = 0;
    }
  }

  setPixel(x, y, hex, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const [r, g, b, a] = parseColor(hex, alpha);
    const idx = (this.width * y + x) << 2;
    this.png.data[idx] = r;
    this.png.data[idx + 1] = g;
    this.png.data[idx + 2] = b;
    this.png.data[idx + 3] = a;
  }

  blendPixel(x, y, hex, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const [sr, sg, sb] = parseColor(hex);
    const sa = alpha / 255;
    const idx = (this.width * y + x) << 2;
    const dr = this.png.data[idx];
    const dg = this.png.data[idx + 1];
    const db = this.png.data[idx + 2];
    const da = this.png.data[idx + 3] / 255;

    const outA = sa + da * (1 - sa);
    if (outA <= 0) return;
    this.png.data[idx] = Math.round((sr * sa + dr * da * (1 - sa)) / outA);
    this.png.data[idx + 1] = Math.round((sg * sa + dg * da * (1 - sa)) / outA);
    this.png.data[idx + 2] = Math.round((sb * sa + db * da * (1 - sa)) / outA);
    this.png.data[idx + 3] = Math.round(outA * 255);
  }

  fillRect(x, y, w, h, hex, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.setPixel(x + dx, y + dy, hex, alpha);
      }
    }
  }

  fillRectBlend(x, y, w, h, hex, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.blendPixel(x + dx, y + dy, hex, alpha);
      }
    }
  }

  drawHLine(x1, x2, y, hex, alpha = 255) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      this.setPixel(x, y, hex, alpha);
    }
  }

  drawVLine(x, y1, y2, hex, alpha = 255) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      this.setPixel(x, y, hex, alpha);
    }
  }

  drawLine(x0, y0, x1, y1, hex, alpha = 255) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.setPixel(x0, y0, hex, alpha);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  fillCircle(cx, cy, radius, hex, alpha = 255) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    radius = Math.round(radius);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          this.setPixel(cx + dx, cy + dy, hex, alpha);
        }
      }
    }
  }

  fillCircleBlend(cx, cy, radius, hex, alpha = 255) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    radius = Math.round(radius);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distSq = dx * dx + dy * dy;
        if (distSq <= radius * radius) {
          const falloff = 1 - Math.sqrt(distSq) / radius;
          this.blendPixel(cx + dx, cy + dy, hex, Math.round(alpha * falloff));
        }
      }
    }
  }

  fillEllipse(cx, cy, rx, ry, hex, alpha = 255) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    rx = Math.round(rx);
    ry = Math.round(ry);
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) {
          this.setPixel(cx + dx, cy + dy, hex, alpha);
        }
      }
    }
  }

  fillEllipseBlend(cx, cy, rx, ry, hex, alpha = 255) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    rx = Math.round(rx);
    ry = Math.round(ry);
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const dist = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        if (dist <= 1.0) {
          const falloff = 1 - Math.sqrt(dist);
          this.blendPixel(cx + dx, cy + dy, hex, Math.round(alpha * falloff));
        }
      }
    }
  }

  drawTreeShadow(cx, cy, rx, ry) {
    this.fillEllipseBlend(cx, cy, rx, ry, '#050a06', 110);
    this.fillEllipseBlend(cx, cy, Math.round(rx * 0.7), Math.round(ry * 0.65), '#020402', 80);
  }

  async save(filePaths) {
    const list = Array.isArray(filePaths) ? filePaths : [filePaths];
    const buffer = PNG.sync.write(this.png);
    for (const f of list) {
      fs.writeFileSync(f, buffer);
    }
    return list[0];
  }
}

// =========================================================================
// 1. GENERATE MIST PINE (112 x 160 px)
// =========================================================================
async function generateMistPine() {
  const c = new PixelCanvas(112, 160);
  const cx = 56;

  // Base shadow
  c.drawTreeShadow(cx, 153, 34, 7);

  // Pine Trunk (from y=50 to 153, tapering from 14px to 6px)
  for (let y = 50; y <= 153; y++) {
    const progress = (y - 50) / (153 - 50);
    const halfW = 3 + Math.round(4 * progress);
    for (let x = cx - halfW; x <= cx + halfW; x++) {
      const xRatio = (x - cx) / halfW;
      let col = '#3a271c';
      if (xRatio < -0.4) col = '#22160f'; // Dark shadow
      else if (xRatio > 0.4) col = '#573c2c'; // Light bark
      else col = '#422c1e';

      // Bark texture noise
      if (Math.sin(x * 12.3 + y * 7.1) > 0.5) col = '#291b13';
      c.setPixel(x, y, col);
    }
  }

  // Buttress root flares at base
  c.drawLine(cx - 6, 144, cx - 18, 154, '#241810');
  c.drawLine(cx - 5, 146, cx - 16, 154, '#382518');
  c.drawLine(cx + 6, 144, cx + 18, 154, '#241810');
  c.drawLine(cx + 5, 146, cx + 16, 154, '#473020');

  // Layered Pine Boughs (5 tiers from top to bottom)
  const tiers = [
    { topY: 8, bottomY: 42, width: 28 },
    { topY: 30, bottomY: 66, width: 48 },
    { topY: 52, bottomY: 92, width: 68 },
    { topY: 76, bottomY: 118, width: 88 },
    { topY: 100, bottomY: 142, width: 104 }
  ];

  for (const tier of tiers) {
    const tierH = tier.bottomY - tier.topY;
    for (let y = tier.topY; y <= tier.bottomY; y++) {
      const p = (y - tier.topY) / tierH;
      // Conical needle profile with jagged scalloped boughs
      const maxW = Math.round((tier.width / 2) * Math.pow(p, 0.75));

      for (let dx = -maxW; dx <= maxW; dx++) {
        const px = cx + dx;
        const normDx = Math.abs(dx) / (maxW || 1);
        const arcSag = Math.floor(Math.pow(normDx, 1.8) * 3);
        const py = y + arcSag;

        if (py >= 160) continue;

        // Needle color shading: bottom of tier is darkest, top edge catches frosty mist
        const isBottomEdge = (y >= tier.bottomY - 4);
        const isTopEdge = (y <= tier.topY + 3);

        let col = '#223c31';
        if (isBottomEdge) col = '#15251f';
        else if (isTopEdge || normDx > 0.85) col = '#52826e';
        else if (normDx > 0.5) col = '#38604f';
        else col = '#2c4d3f';

        // Frost / mist tips on outer needle ends
        if (normDx > 0.88 && Math.sin(px * 13.7 + py * 19.3) > 0.2) {
          col = '#84b5a0';
        }

        c.setPixel(px, py, col);
      }
    }

    // Drooping jagged branch tips
    const branchCount = 6;
    for (let b = 0; b <= branchCount; b++) {
      const bx = Math.round(cx - tier.width / 2 + (tier.width / branchCount) * b);
      const by = tier.bottomY + Math.floor(Math.abs(bx - cx) / (tier.width / 2) * 2.5);
      c.setPixel(bx, by, '#162820');
      c.setPixel(bx, by + 1, '#111e18');
      c.setPixel(bx, by - 1, '#457360');
    }
  }

  // Pine top needle tip
  c.setPixel(cx, 6, '#84b5a0');
  c.setPixel(cx, 7, '#52826e');

  const outFiles = [
    path.join(TREE_DIR, 'tree_mist_pine.png'),
    path.join(SPRITE_DIR, 'tree_mist_pine.png')
  ];
  await c.save(outFiles);
  console.log(`[V15-11] Generated: tree_mist_pine.png (112x160)`);
}

// =========================================================================
// 2. GENERATE ANCIENT MOSSY OAK (144 x 160 px)
// =========================================================================
async function generateAncientMossyOak() {
  const c = new PixelCanvas(144, 160);
  const cx = 72;

  // Broad soft shadow
  c.drawTreeShadow(cx, 154, 46, 8);

  // Massive Gnarled Oak Trunk (from y=65 to 154)
  for (let y = 65; y <= 154; y++) {
    const p = (y - 65) / (154 - 65);
    // Trunk expands near base and splits near top
    const halfW = Math.round(7 + 9 * Math.pow(p, 1.6));
    const trunkShift = Math.round(Math.sin(y * 0.08) * 3);

    for (let x = cx - halfW + trunkShift; x <= cx + halfW + trunkShift; x++) {
      const normX = (x - (cx + trunkShift)) / halfW;
      let col = '#3e2d21';
      if (normX < -0.45) col = '#22170f';
      else if (normX > 0.45) col = '#574132';
      else col = '#483526';

      // Oak bark vertical furrow texture
      if (Math.sin(x * 9.2 + y * 4.3) > 0.45) col = '#281c13';

      // Moss creep on the left/humid side of trunk
      if (normX < -0.2 && Math.sin(x * 7.1 + y * 8.3) > 0.35) {
        col = '#3b5434';
      }

      c.setPixel(x, y, col);
    }
  }

  // Massive Buttress Roots gripping the ground
  c.drawLine(cx - 8, 142, cx - 28, 155, '#241810');
  c.drawLine(cx - 7, 145, cx - 24, 155, '#3b291a');
  c.drawLine(cx - 20, 150, cx - 35, 156, '#241810');

  c.drawLine(cx + 8, 142, cx + 28, 155, '#241810');
  c.drawLine(cx + 7, 145, cx + 24, 155, '#4a3524');
  c.drawLine(cx + 20, 150, cx + 35, 156, '#241810');

  // Spreading Oak Boughs / Limbs
  c.drawLine(cx - 6, 85, cx - 42, 60, '#2b1d14');
  c.drawLine(cx - 5, 87, cx - 38, 62, '#3e2d21');
  c.drawLine(cx + 6, 85, cx + 44, 58, '#2b1d14');
  c.drawLine(cx + 5, 87, cx + 40, 60, '#4a3728');
  c.drawLine(cx, 75, cx - 18, 40, '#3e2d21');
  c.drawLine(cx, 75, cx + 20, 38, '#3e2d21');

  // 7 Organic Foliage Canopy Clouds (Vòm lá bồng bềnh phân tầng)
  const foliageClouds = [
    { x: cx - 36, y: 50, rx: 28, ry: 22 },
    { x: cx + 36, y: 48, rx: 28, ry: 22 },
    { x: cx - 20, y: 32, rx: 26, ry: 20 },
    { x: cx + 20, y: 30, rx: 26, ry: 20 },
    { x: cx, y: 18, rx: 24, ry: 18 },
    { x: cx - 48, y: 68, rx: 20, ry: 16 },
    { x: cx + 48, y: 66, rx: 20, ry: 16 }
  ];

  // Draw foliage clouds with organic stippling, depth shading & moss
  for (const fc of foliageClouds) {
    for (let dy = -fc.ry; dy <= fc.ry; dy++) {
      for (let dx = -fc.rx; dx <= fc.rx; dx++) {
        const dist = (dx * dx) / (fc.rx * fc.rx) + (dy * dy) / (fc.ry * fc.ry);
        if (dist <= 1.0) {
          const px = fc.x + dx;
          const py = fc.y + dy;
          const normY = dy / fc.ry;
          const noise = Math.sin(px * 11.3 + py * 17.1);

          let col = '#2e4c32';
          if (normY > 0.4) col = '#1a2e1d'; // Deep under-canopy shadow
          else if (normY < -0.35) col = '#5a8a5f'; // Sunlit leaf crown
          else if (noise > 0.3) col = '#416e47';
          else col = '#315436';

          // Mossy yellowish-green flecks
          if (noise > 0.65 && normY < 0.2) col = '#779952';

          c.setPixel(px, py, col);
        }
      }
    }
  }

  // Hanging Spanish Moss / Lichen Streamers from boughs
  const mossStreams = [
    { x: cx - 44, y: 68, len: 14 },
    { x: cx - 28, y: 72, len: 18 },
    { x: cx - 12, y: 76, len: 12 },
    { x: cx + 16, y: 74, len: 16 },
    { x: cx + 38, y: 70, len: 15 },
    { x: cx + 52, y: 64, len: 11 }
  ];
  for (const ms of mossStreams) {
    for (let my = 0; my < ms.len; my++) {
      const wave = Math.round(Math.sin((ms.y + my) * 0.7) * 1.5);
      c.setPixel(ms.x + wave, ms.y + my, '#446648');
      if (my % 2 === 0) c.setPixel(ms.x + wave + 1, ms.y + my, '#608564');
    }
  }

  const outFiles = [
    path.join(TREE_DIR, 'tree_mossy_oak_grand.png'),
    path.join(SPRITE_DIR, 'tree_mossy_oak_grand.png')
  ];
  await c.save(outFiles);
  console.log(`[V15-11] Generated: tree_mossy_oak_grand.png (144x160)`);
}

// =========================================================================
// 3. GENERATE SWAMP WEEPING WILLOW (128 x 152 px)
// =========================================================================
async function generateWeepingWillow() {
  const c = new PixelCanvas(128, 152);
  const cx = 64;

  // Murky swamp ground shadow
  c.drawTreeShadow(cx, 146, 40, 7);

  // Twisted Asymmetrical Swamp Trunk (from y=55 to 146)
  for (let y = 55; y <= 146; y++) {
    const p = (y - 55) / (146 - 55);
    const halfW = Math.round(6 + 8 * p);
    // Graceful organic lean
    const lean = Math.round(Math.sin((y - 55) * 0.05) * 6 - 3);

    for (let x = cx - halfW + lean; x <= cx + halfW + lean; x++) {
      const normX = (x - (cx + lean)) / halfW;
      let col = '#36302a';
      if (normX < -0.4) col = '#1d1916';
      else if (normX > 0.4) col = '#4c443b';
      else col = '#3d362f';

      // Bark grain & wet swamp lichen
      if (Math.sin(x * 8.3 + y * 6.7) > 0.4) col = '#2b4034';
      c.setPixel(x, y, col);
    }
  }

  // Swamp Mud Roots
  c.drawLine(cx - 10, 136, cx - 26, 147, '#1d1916');
  c.drawLine(cx - 8, 138, cx - 22, 147, '#332c25');
  c.drawLine(cx + 6, 136, cx + 24, 147, '#1d1916');
  c.drawLine(cx + 5, 138, cx + 20, 147, '#3f372e');

  // Canopy Crest (Vòm đỉnh liễu: y=12..55)
  c.fillEllipse(cx - 4, 34, 38, 24, '#243b2c');
  c.fillEllipse(cx - 2, 30, 32, 20, '#365440');
  c.fillEllipse(cx - 2, 26, 26, 15, '#4a6e54');

  // Weeping Cascades (Hàng trăm dải lá liễu rủ dài xuống đất)
  const strandCount = 28;
  for (let s = 0; s < strandCount; s++) {
    const strandX = 14 + s * 3.6;
    const startY = 24 + Math.round(Math.abs(strandX - cx) * 0.4);
    const endY = 100 + Math.round(Math.sin(s * 1.7) * 22);

    for (let y = startY; y <= endY; y++) {
      const sway = Math.round(Math.sin(y * 0.12 + s * 0.8) * 2);
      const px = Math.round(strandX + sway);
      const p = (y - startY) / (endY - startY);

      let col = '#35543e';
      if (p > 0.8) col = '#527a5d'; // Fine delicate tip
      else if (p < 0.25) col = '#223829'; // Dark upper root of strand
      else if (s % 3 === 0) col = '#669473';

      c.setPixel(px, y, col);
      if (s % 2 === 0 && y % 3 === 0) {
        c.setPixel(px + 1, y, '#42694e');
      }
    }
  }

  const outFiles = [
    path.join(TREE_DIR, 'tree_weeping_willow.png'),
    path.join(SPRITE_DIR, 'tree_weeping_willow.png')
  ];
  await c.save(outFiles);
  console.log(`[V15-11] Generated: tree_weeping_willow.png (128x152)`);
}

// =========================================================================
// 4. GENERATE WITHERED GNARLED DEAD TREE (112 x 144 px)
// =========================================================================
async function generateWitheredDeadTree() {
  const c = new PixelCanvas(112, 144);
  const cx = 56;

  // Base shadow
  c.drawTreeShadow(cx, 138, 30, 6);

  // Gnarled Hollow Trunk (from y=50 to 138)
  for (let y = 50; y <= 138; y++) {
    const p = (y - 50) / (138 - 50);
    const halfW = Math.round(5 + 8 * p);
    const wobble = Math.round(Math.sin(y * 0.09) * 3);

    for (let x = cx - halfW + wobble; x <= cx + halfW + wobble; x++) {
      const normX = (x - (cx + wobble)) / halfW;
      let col = '#38322b';
      if (normX < -0.4) col = '#1b1714';
      else if (normX > 0.4) col = '#4f473e';
      else col = '#3e372f';

      // Weathered wood cracks
      if (Math.sin(x * 14.1 + y * 7.3) > 0.6) col = '#161311';
      c.setPixel(x, y, col);
    }
  }

  // Hollow Void in center of trunk (Hốc cây mục đen thẫm)
  c.fillEllipse(cx, 98, 4, 10, '#100e0c');
  c.drawHLine(cx - 3, cx + 3, 98, '#080706');

  // Claw-like roots digging into rock
  c.drawLine(cx - 6, 128, cx - 22, 139, '#1a1613');
  c.drawLine(cx - 5, 130, cx - 18, 139, '#302923');
  c.drawLine(cx - 15, 134, cx - 28, 140, '#1a1613');

  c.drawLine(cx + 6, 128, cx + 22, 139, '#1a1613');
  c.drawLine(cx + 5, 130, cx + 18, 139, '#3a322b');
  c.drawLine(cx + 15, 134, cx + 28, 140, '#1a1613');

  // Jagged Bare Dead Limbs branching out in creepy silhouettes
  // Left primary limb
  c.drawLine(cx - 4, 60, cx - 28, 38, '#2a241f');
  c.drawLine(cx - 5, 62, cx - 26, 40, '#38312a');
  c.drawLine(cx - 28, 38, cx - 44, 22, '#221d19');
  c.drawLine(cx - 28, 38, cx - 36, 14, '#1b1714');
  c.drawLine(cx - 20, 48, cx - 38, 52, '#221d19');

  // Right primary limb
  c.drawLine(cx + 4, 58, cx + 30, 36, '#2a241f');
  c.drawLine(cx + 3, 60, cx + 28, 38, '#423a32');
  c.drawLine(cx + 30, 36, cx + 46, 18, '#221d19');
  c.drawLine(cx + 30, 36, cx + 34, 10, '#1b1714');
  c.drawLine(cx + 22, 46, cx + 42, 48, '#221d19');

  // Center twisted spire limb
  c.drawLine(cx, 50, cx - 6, 26, '#2d2721');
  c.drawLine(cx - 6, 26, cx + 4, 8, '#1d1915');
  c.drawLine(cx - 6, 26, cx - 18, 12, '#1a1613');

  const outFiles = [
    path.join(TREE_DIR, 'tree_withered_gnarled.png'),
    path.join(SPRITE_DIR, 'tree_withered_gnarled.png')
  ];
  await c.save(outFiles);
  console.log(`[V15-11] Generated: tree_withered_gnarled.png (112x144)`);
}

// =========================================================================
// 5. GENERATE 6 GROUND DETAIL DECALS (Lớp phủ mặt đất không va chạm)
// =========================================================================

// 5.1. Bụi Cỏ Dại Rừng Sương (Wild Grass Tufts: 32x24 px)
async function generateDecalWildGrass() {
  const c = new PixelCanvas(32, 24);
  // Ground dirt shade
  c.fillEllipseBlend(16, 20, 12, 3, '#080d09', 70);

  // Arching blades of wild grass
  const blades = [
    { x0: 10, y0: 21, x1: 5, y1: 10, col: '#345239', colTip: '#659c6d' },
    { x0: 12, y0: 21, x1: 9, y1: 6, col: '#3f6345', colTip: '#7fb888' },
    { x0: 14, y0: 22, x1: 13, y1: 4, col: '#4c7553', colTip: '#97d1a1' },
    { x0: 16, y0: 22, x1: 17, y1: 3, col: '#4c7553', colTip: '#a6e0b0' },
    { x0: 18, y0: 22, x1: 21, y1: 5, col: '#3f6345', colTip: '#8cc795' },
    { x0: 20, y0: 21, x1: 25, y1: 9, col: '#345239', colTip: '#6ca374' },
    { x0: 22, y0: 21, x1: 28, y1: 12, col: '#28422c', colTip: '#568a5f' }
  ];

  for (const b of blades) {
    c.drawLine(b.x0, b.y0, b.x1, b.y1, b.col);
    c.setPixel(b.x1, b.y1, b.colTip);
    c.setPixel(b.x1, b.y1 - 1, b.colTip);
  }

  // Dew drops
  c.setPixel(13, 5, '#e8f8ec');
  c.setPixel(21, 6, '#e8f8ec');

  const files = [
    path.join(FOLIAGE_DIR, 'decal_wild_grass.png'),
    path.join(SPRITE_DIR, 'decal_wild_grass.png')
  ];
  await c.save(files);
  console.log(`[V15-11] Generated: decal_wild_grass.png (32x24)`);
}

// 5.2. Cụm Dương Xỉ Rừng Sâu (Fern Cluster: 36x28 px)
async function generateDecalFernCluster() {
  const c = new PixelCanvas(36, 28);
  c.fillEllipseBlend(18, 24, 14, 3, '#060a07', 70);

  // 3 Spreading Fern Fronds
  const fronds = [
    { cx: 18, cy: 24, tipX: 6, tipY: 8, spread: -1 },
    { cx: 18, cy: 24, tipX: 18, tipY: 4, spread: 0 },
    { cx: 18, cy: 24, tipX: 30, tipY: 8, spread: 1 }
  ];

  for (const f of fronds) {
    // Stem
    c.drawLine(f.cx, f.cy, f.tipX, f.tipY, '#233d26');

    // Pinnae (leaflets) along stem
    for (let t = 0.2; t <= 0.9; t += 0.12) {
      const lx = Math.round(f.cx + (f.tipX - f.cx) * t);
      const ly = Math.round(f.cy + (f.tipY - f.cy) * t);
      const leafLen = Math.round(4 * (1 - t * 0.5));

      c.setPixel(lx - leafLen, ly - 1, '#3a613e');
      c.setPixel(lx - leafLen + 1, ly, '#508556');
      c.setPixel(lx + leafLen, ly - 1, '#3a613e');
      c.setPixel(lx + leafLen - 1, ly, '#508556');
    }
    c.setPixel(f.tipX, f.tipY, '#68a370');
  }

  const files = [
    path.join(FOLIAGE_DIR, 'decal_fern_cluster.png'),
    path.join(SPRITE_DIR, 'decal_fern_cluster.png')
  ];
  await c.save(files);
  console.log(`[V15-11] Generated: decal_fern_cluster.png (36x28)`);
}

// 5.3. Cụm Nấm Phát Sáng Dạ Quang (Bioluminescent Mushrooms: 32x24 px)
async function generateDecalGlowingMushrooms() {
  const c = new PixelCanvas(32, 24);

  // Soft bioluminescent glow
  c.fillCircleBlend(16, 12, 10, '#1abc9c', 45);
  c.fillCircleBlend(16, 12, 5, '#58d68d', 60);

  // Mushroom 1 (Center Large Teal)
  // Stalk
  c.fillRect(15, 12, 3, 9, '#d1f2eb');
  c.setPixel(15, 20, '#a3e4d7');
  // Cap
  c.fillEllipse(16, 11, 7, 5, '#16a085');
  c.fillEllipse(16, 10, 5, 3, '#1abc9c');
  c.setPixel(16, 9, '#a3e4d7'); // Glowing crown
  c.setPixel(14, 11, '#ffffff');
  c.setPixel(18, 11, '#ffffff');

  // Mushroom 2 (Left Small Amber Shroom)
  c.fillCircleBlend(8, 14, 6, '#f39c12', 40);
  c.fillRect(7, 15, 2, 6, '#fdebd0');
  c.fillEllipse(8, 14, 4, 3, '#d35400');
  c.setPixel(8, 13, '#f39c12');
  c.setPixel(8, 12, '#fff4cc');

  // Mushroom 3 (Right Small Teal Shroom)
  c.fillRect(23, 16, 2, 5, '#d1f2eb');
  c.fillEllipse(24, 15, 4, 3, '#117864');
  c.setPixel(24, 14, '#48c9b0');

  const files = [
    path.join(FOLIAGE_DIR, 'decal_glowing_mushrooms.png'),
    path.join(SPRITE_DIR, 'decal_glowing_mushrooms.png')
  ];
  await c.save(files);
  console.log(`[V15-11] Generated: decal_glowing_mushrooms.png (32x24)`);
}

// 5.4. Vạt Lá Rụng Mùa Thu Sương Lạnh (Autumn Leaves Scatter: 36x24 px)
async function generateDecalAutumnLeaves() {
  const c = new PixelCanvas(36, 24);

  const leaves = [
    { x: 6, y: 14, w: 4, h: 3, col: '#ba4a00', tip: '#e59866' },
    { x: 12, y: 8, w: 5, h: 3, col: '#d35400', tip: '#f5b041' },
    { x: 16, y: 16, w: 4, h: 4, col: '#78281f', tip: '#c0392b' },
    { x: 22, y: 10, w: 5, h: 3, col: '#b9770e', tip: '#f4d03f' },
    { x: 27, y: 15, w: 4, h: 3, col: '#ba4a00', tip: '#e67e22' },
    { x: 18, y: 12, w: 3, h: 2, col: '#922b21', tip: '#cd6155' },
    { x: 30, y: 9, w: 3, h: 2, col: '#d35400', tip: '#edbb99' },
    { x: 9, y: 18, w: 3, h: 2, col: '#7e5109', tip: '#b7950b' }
  ];

  for (const l of leaves) {
    // Leaf shadow
    c.fillRectBlend(l.x, l.y + 1, l.w, l.h, '#080a08', 60);
    // Leaf body
    c.fillRect(l.x, l.y, l.w, l.h, l.col);
    c.setPixel(l.x + 1, l.y + 1, l.tip);
    // Stem
    c.setPixel(l.x - 1, l.y + 1, '#4a2810');
  }

  const files = [
    path.join(FOLIAGE_DIR, 'decal_autumn_leaves.png'),
    path.join(SPRITE_DIR, 'decal_autumn_leaves.png')
  ];
  await c.save(files);
  console.log(`[V15-11] Generated: decal_autumn_leaves.png (36x24)`);
}

// 5.5. Cụm Sỏi Đá Cuội Ven Đường (Pebbles & Stones: 32x20 px)
async function generateDecalPebblesStones() {
  const c = new PixelCanvas(32, 20);

  const stones = [
    { x: 6, y: 10, rx: 4, ry: 3, base: '#3d4743', light: '#677771', dark: '#202624' },
    { x: 15, y: 8, rx: 5, ry: 4, base: '#4a5752', light: '#788c84', dark: '#29302e' },
    { x: 24, y: 11, rx: 4, ry: 3, base: '#38423e', light: '#5e6e68', dark: '#1e2422' },
    { x: 11, y: 14, rx: 3, ry: 2, base: '#323b37', light: '#566660', dark: '#1c211f' },
    { x: 20, y: 14, rx: 3, ry: 2, base: '#434f4b', light: '#6f827b', dark: '#252b29' }
  ];

  for (const s of stones) {
    // Ground shadow
    c.fillEllipseBlend(s.x, s.y + s.ry, s.rx + 1, 2, '#060a08', 75);
    // Stone core
    c.fillEllipse(s.x, s.y, s.rx, s.ry, s.base);
    // Top highlight
    c.drawHLine(s.x - s.rx + 1, s.x + s.rx - 2, s.y - s.ry + 1, s.light);
    // Bottom dark rim
    c.drawHLine(s.x - s.rx + 1, s.x + s.rx - 1, s.y + s.ry - 1, s.dark);
    // Moss speck
    c.setPixel(s.x, s.y + s.ry - 1, '#345233');
  }

  const files = [
    path.join(FOLIAGE_DIR, 'decal_pebbles_stones.png'),
    path.join(SPRITE_DIR, 'decal_pebbles_stones.png')
  ];
  await c.save(files);
  console.log(`[V15-11] Generated: decal_pebbles_stones.png (32x20)`);
}

// 5.6. Vũng Nước Đầm Lầy Sương Mù (Swamp Puddle Decal: 48x28 px)
async function generateDecalSwampPuddle() {
  const c = new PixelCanvas(48, 28);
  const cx = 24;
  const cy = 14;

  // Wet dark mud perimeter
  c.fillEllipse(cx, cy, 22, 12, '#151f19');
  c.fillEllipse(cx, cy, 20, 10, '#1c2b23');

  // Murky water depth
  c.fillEllipse(cx, cy, 18, 8, '#10222a');
  c.fillEllipse(cx, cy, 15, 6, '#183642');

  // Moonlit mist reflection ripple
  c.drawHLine(cx - 10, cx + 8, cy - 2, '#2b5769');
  c.drawHLine(cx - 6, cx + 5, cy - 1, '#437d94');
  c.setPixel(cx - 2, cy - 1, '#82bccc'); // Glistening sparkle

  c.drawHLine(cx - 8, cx + 6, cy + 2, '#234654');

  // Tiny water reed sprig at mud edge
  c.drawLine(cx + 14, cy + 6, cx + 16, cy - 2, '#3f593b');
  c.drawLine(cx + 16, cy + 7, cx + 19, cy + 1, '#4e6e4a');

  const files = [
    path.join(FOLIAGE_DIR, 'decal_swamp_puddle.png'),
    path.join(SPRITE_DIR, 'decal_swamp_puddle.png')
  ];
  await c.save(files);
  console.log(`[V15-11] Generated: decal_swamp_puddle.png (48x28)`);
}

// =========================================================================
// RUN ALL GENERATORS
// =========================================================================
async function run() {
  console.log('--- Generating V15-11 Ancient Trees & Ground Decals ---');
  await generateMistPine();
  await generateAncientMossyOak();
  await generateWeepingWillow();
  await generateWitheredDeadTree();

  await generateDecalWildGrass();
  await generateDecalFernCluster();
  await generateDecalGlowingMushrooms();
  await generateDecalAutumnLeaves();
  await generateDecalPebblesStones();
  await generateDecalSwampPuddle();
  console.log('--- All 10 Environment Assets Generated Successfully! ---');
}

run().catch(err => {
  console.error('Error generating foliage & trees:', err);
  process.exit(1);
});
