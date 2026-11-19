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
// 1. REAL PIXEL ART TREES (V15-61: Đồng bộ 100% Sprite Pixel Art Thật)
// =========================================================================
async function generateMistPine() {
  const src = path.resolve('public/assets/environment/trees/tree_pine_tall_topdown.png');
  const buffer = fs.readFileSync(src);
  for (const f of [path.join(TREE_DIR, 'tree_mist_pine.png'), path.join(SPRITE_DIR, 'tree_mist_pine.png')]) {
    fs.writeFileSync(f, buffer);
  }
  console.log(`[V15-61] Preserved real pixel art: tree_mist_pine.png`);
}

async function generateAncientMossyOak() {
  const src = path.resolve('Pixel_Art/extracted/Updated-Trees/Oak.png');
  const buffer = fs.readFileSync(src);
  for (const f of [path.join(TREE_DIR, 'tree_mossy_oak_grand.png'), path.join(SPRITE_DIR, 'tree_mossy_oak_grand.png')]) {
    fs.writeFileSync(f, buffer);
  }
  console.log(`[V15-61] Preserved real pixel art: tree_mossy_oak_grand.png`);
}

async function generateWeepingWillow() {
  const src = path.resolve('Pixel_Art/extracted/Updated-Trees/Birch.png');
  const buffer = fs.readFileSync(src);
  for (const f of [path.join(TREE_DIR, 'tree_weeping_willow.png'), path.join(SPRITE_DIR, 'tree_weeping_willow.png')]) {
    fs.writeFileSync(f, buffer);
  }
  console.log(`[V15-61] Preserved real pixel art: tree_weeping_willow.png`);
}

async function generateWitheredDeadTree() {
  const src = path.resolve('public/assets/environment/v14/trees/tree_dead_withered_v14.png');
  const buffer = fs.readFileSync(src);
  for (const f of [path.join(TREE_DIR, 'tree_withered_gnarled.png'), path.join(SPRITE_DIR, 'tree_withered_gnarled.png')]) {
    fs.writeFileSync(f, buffer);
  }
  console.log(`[V15-61] Preserved real pixel art: tree_withered_gnarled.png`);
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
