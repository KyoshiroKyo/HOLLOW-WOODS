/**
 * Generator script for Bellhollow Medieval Pixel Art Buildings (V15-10)
 * Uses pngjs to author crisp, atmospheric, high-fidelity dark medieval pixel art.
 */
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const OUT_DIR = path.resolve('public/assets/buildings');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Helper: parse hex color string to [r, g, b, a]
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
    // Initialize fully transparent
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

  save(filePath) {
    return new Promise((resolve, reject) => {
      const out = fs.createWriteStream(filePath);
      this.png.pack().pipe(out);
      out.on('finish', () => resolve(filePath));
      out.on('error', reject);
    });
  }

  // --- Specialized Medieval Pixel Art Builders ---

  /**
   * Draw fish-scale / scalloped slate shingle roof
   */
  drawFishScaleRoof(leftX, topY, rightX, bottomY, peakLeftX, peakRightX, options = {}) {
    const {
      roofShade = '#252d33',
      roofLight = '#424f59',
      roofDark = '#181e22',
      roofHighlight = '#566673',
      mossChance = 0.22,
      mossColor = '#345233',
      mossLight = '#4d754c'
    } = options;

    const rowHeight = 4;
    const scaleWidth = 8;
    const totalRows = Math.floor((bottomY - topY) / rowHeight);

    // Trapezoid fill from peak to bottom
    for (let r = 0; r <= totalRows; r++) {
      const progress = r / totalRows;
      const curLeft = Math.round(peakLeftX + (leftX - peakLeftX) * progress);
      const curRight = Math.round(peakRightX + (rightX - peakRightX) * progress);
      const rowY = topY + r * rowHeight;

      // Base shading of this row
      const isTopRow = r === 0;
      const isBottomRow = r === totalRows;

      for (let y = rowY; y < Math.min(rowY + rowHeight, bottomY); y++) {
        for (let x = curLeft; x <= curRight; x++) {
          this.setPixel(x, y, roofShade);
        }
      }

      // Draw individual scallop curves for this row
      const offset = (r % 2) * (scaleWidth / 2);
      for (let sx = curLeft - scaleWidth / 2 + offset; sx <= curRight; sx += scaleWidth) {
        const centerX = Math.round(sx + scaleWidth / 2);
        const bottomRowY = Math.min(rowY + rowHeight - 1, bottomY - 1);

        // Scallop bottom arc
        for (let dx = -scaleWidth / 2; dx <= scaleWidth / 2; dx++) {
          const px = Math.round(centerX + dx);
          if (px < curLeft || px > curRight) continue;

          // Arc shape: lower in center, higher on edges
          const arcDrop = Math.floor(Math.cos((dx / (scaleWidth / 2)) * (Math.PI / 2)) * 1.8);
          const py = bottomRowY + arcDrop;

          // Shadow under scallop
          this.setPixel(px, py, roofDark);
          // Highlight above bottom edge
          if (py - 1 >= rowY) {
            this.setPixel(px, py - 1, (dx < 0 ? roofHighlight : roofLight));
          }

          // Moss clumps
          if (Math.sin(px * 13.7 + py * 7.1) > (1 - mossChance * 2)) {
            this.setPixel(px, py - 1, mossColor);
            if (py - 2 >= rowY) this.setPixel(px, py - 2, mossLight);
          }
        }
      }

      // Left and right roof bargeboard outlines
      this.setPixel(curLeft, rowY, roofDark);
      this.setPixel(curLeft + 1, rowY, roofLight);
      this.setPixel(curRight, rowY, roofDark);
      this.setPixel(curRight - 1, rowY, roofDark);
    }

    // Top ridge beam (xà nóc mái)
    this.fillRect(peakLeftX - 2, topY - 2, (peakRightX - peakLeftX) + 4, 3, '#2b1d14');
    this.fillRect(peakLeftX - 1, topY - 1, (peakRightX - peakLeftX) + 2, 1, '#4a3325');
  }

  /**
   * Draw rustic fieldstone wall with varied stones, mortar, and moss
   */
  drawStoneWall(x, y, w, h, options = {}) {
    const {
      baseStone = '#3a4440',
      lightStone = '#54635d',
      darkStone = '#252d2a',
      mortar = '#1c211f',
      moss = '#324a35',
      mossLight = '#496b4e',
      stoneSize = 8
    } = options;

    // Mortar background
    this.fillRect(x, y, w, h, mortar);

    const stoneRows = Math.ceil(h / stoneSize);
    for (let r = 0; r < stoneRows; r++) {
      const stoneY = y + r * stoneSize;
      const rowH = Math.min(stoneSize - 1, y + h - stoneY);
      const isShifted = r % 2 === 1;
      const startX = x + (isShifted ? Math.floor(stoneSize * 0.6) : 2);

      let curX = x + 1;
      while (curX < x + w - 2) {
        // Pseudo-random width for each stone
        const hash = Math.sin(curX * 12.9898 + stoneY * 78.233) * 43758.5453;
        const curW = Math.max(5, Math.min(stoneSize * 2 - 2, Math.floor(stoneSize * (1 + (hash - Math.floor(hash))))));
        const actualW = Math.min(curW, x + w - 1 - curX);

        if (actualW > 2 && rowH > 2) {
          // Fill stone core
          const shadeHash = (hash * 3.7) % 1;
          const coreColor = shadeHash > 0.6 ? lightStone : (shadeHash > 0.25 ? baseStone : darkStone);
          this.fillRect(curX + 1, stoneY + 1, actualW - 2, rowH - 2, coreColor);

          // Stone highlights (top and left edge)
          this.drawHLine(curX + 1, curX + actualW - 2, stoneY + 1, lightStone);
          this.drawVLine(curX + 1, stoneY + 1, stoneY + rowH - 2, lightStone);

          // Stone shadows (bottom and right edge)
          this.drawHLine(curX + 1, curX + actualW - 2, stoneY + rowH - 2, darkStone);
          this.drawVLine(curX + actualW - 2, stoneY + 1, stoneY + rowH - 2, darkStone);

          // Moss on crevices
          if ((hash * 7.3) % 1 > 0.68) {
            this.setPixel(curX + 2, stoneY + rowH - 2, moss);
            this.setPixel(curX + 3, stoneY + rowH - 2, mossLight);
            this.setPixel(curX + 2, stoneY + rowH - 1, moss);
          }
        }
        curX += actualW + 1;
      }
    }
  }

  /**
   * Draw Half-timbered Tudor Framing (Khung xà gỗ sồi cổ)
   */
  drawTimberFraming(x, y, w, h, options = {}) {
    const {
      woodDark = '#1f150e',
      woodMid = '#3b281b',
      woodLight = '#573c28',
      plaster = '#696e6d',
      plasterLight = '#828786',
      plasterDark = '#515655',
      hasCrossBrace = true
    } = options;

    // Fill plaster background
    this.fillRect(x, y, w, h, plaster);
    // Texture on plaster
    for (let py = y + 1; py < y + h - 1; py += 2) {
      for (let px = x + 1; px < x + w - 1; px += 3) {
        if (Math.sin(px * 17.3 + py * 29.1) > 0.3) {
          this.setPixel(px, py, plasterLight);
        } else if (Math.sin(px * 17.3 + py * 29.1) < -0.3) {
          this.setPixel(px, py, plasterDark);
        }
      }
    }

    // Outer timber frame (width 3px)
    // Top beam
    this.fillRect(x, y, w, 3, woodDark);
    this.drawHLine(x + 1, x + w - 2, y + 1, woodMid);
    this.drawHLine(x + 1, x + w - 2, y + 2, woodLight);

    // Bottom beam
    this.fillRect(x, y + h - 3, w, 3, woodDark);
    this.drawHLine(x + 1, x + w - 2, y + h - 2, woodMid);

    // Left and right vertical posts
    this.fillRect(x, y, 3, h, woodDark);
    this.drawVLine(x + 1, y + 1, y + h - 2, woodMid);

    this.fillRect(x + w - 3, y, 3, h, woodDark);
    this.drawVLine(x + w - 2, y + 1, y + h - 2, woodMid);

    // Center vertical beam
    const midX = Math.round(x + w / 2);
    this.fillRect(midX - 1, y, 3, h, woodDark);
    this.drawVLine(midX, y + 1, y + h - 2, woodMid);

    // Diagonal cross braces (nẹp gỗ chữ X / chữ K)
    if (hasCrossBrace && w > 24) {
      this.drawLine(x + 3, y + 3, midX - 2, y + h - 4, woodDark);
      this.drawLine(x + 4, y + 3, midX - 1, y + h - 4, woodMid);

      this.drawLine(midX + 2, y + h - 4, x + w - 4, y + 3, woodDark);
      this.drawLine(midX + 3, y + h - 4, x + w - 3, y + 3, woodMid);
    }
  }

  /**
   * Draw glowing amber window with mullions and soft light emission
   */
  drawAmberWindow(x, y, w, h, options = {}) {
    const {
      isRoundTop = false,
      glowStrength = 1.0,
      glowColor = '#f39c12',
      frameColor = '#21150c'
    } = options;

    // Window frame outline
    this.fillRect(x - 1, y - 1, w + 2, h + 2, frameColor);

    // Warm glow interior
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        // Distance from center for radial intensity
        const cx = (dx - w / 2) / (w / 2);
        const cy = (dy - h / 2) / (h / 2);
        const dist = Math.sqrt(cx * cx + cy * cy);

        let col = '#f39c12';
        if (dist < 0.35) col = '#fffdf0'; // Center bright light
        else if (dist < 0.65) col = '#fce588'; // Warm yellow
        else if (dist < 0.95) col = '#f39c12'; // Rich amber
        else col = '#cf7105'; // Rim orange

        this.setPixel(x + dx, y + dy, col);
      }
    }

    // Wooden mullions (chấn song nan gỗ chữ thập)
    const midX = Math.round(x + w / 2);
    const midY = Math.round(y + h / 2);
    this.drawVLine(midX, y, y + h - 1, frameColor);
    this.drawHLine(x, x + w - 1, midY, frameColor);

    // Exterior soft ambient glow around the window
    const glowRadius = Math.round(Math.max(w, h) * 0.75 * glowStrength);
    this.fillCircleBlend(midX, midY, glowRadius + 4, glowColor, Math.round(45 * glowStrength));
    this.fillCircleBlend(midX, midY, glowRadius, '#fed360', Math.round(30 * glowStrength));
  }

  /**
   * Draw Ivy / Creeping Moss vines
   */
  drawIvyCluster(startX, startY, width, height, density = 0.5) {
    const darkGreen = '#1d361f';
    const midGreen = '#2e5431';
    const lightGreen = '#487d4d';
    const vineWood = '#2e2116';

    // Tendril stem
    let cx = startX;
    for (let cy = startY; cy < startY + height; cy++) {
      this.setPixel(cx, cy, vineWood);
      if (Math.sin(cy * 0.8) > 0.4) cx += 1;
      else if (Math.sin(cy * 0.8) < -0.4) cx -= 1;

      // Leaf clusters around stem
      for (let lx = -width / 2; lx <= width / 2; lx++) {
        const px = Math.round(cx + lx);
        const hash = Math.sin(px * 11.2 + cy * 7.9);
        if (hash > (1 - density)) {
          this.setPixel(px, cy, darkGreen);
          if (hash > (1 - density * 0.6)) this.setPixel(px, cy - 1, midGreen);
          if (hash > (1 - density * 0.3)) this.setPixel(px, cy, lightGreen);
        }
      }
    }
  }

  /**
   * Draw Hanging Iron Lantern with amber light
   */
  drawHangingLantern(x, y) {
    // Chain / bracket
    this.setPixel(x, y - 4, '#2d2d2d');
    this.setPixel(x, y - 3, '#1a1a1a');
    this.setPixel(x, y - 2, '#2d2d2d');
    this.setPixel(x, y - 1, '#1a1a1a');

    // Lantern cap (mái lồng đèn)
    this.fillRect(x - 3, y, 7, 2, '#222629');
    this.fillRect(x - 2, y - 1, 5, 1, '#3b4247');

    // Glass / glowing chamber
    this.fillRect(x - 2, y + 2, 5, 5, '#f39c12');
    this.fillRect(x - 1, y + 3, 3, 3, '#fff4cc');
    this.setPixel(x, y + 4, '#ffffff');

    // Cage bars
    this.drawVLine(x - 2, y + 2, y + 6, '#181b1d');
    this.drawVLine(x + 2, y + 2, y + 6, '#181b1d');
    this.drawVLine(x, y + 2, y + 6, '#2a3034');

    // Lantern base
    this.fillRect(x - 3, y + 7, 7, 2, '#222629');
    this.setPixel(x, y + 9, '#181b1d');

    // Amber lantern glow
    this.fillCircleBlend(x, y + 4, 18, '#f39c12', 45);
    this.fillCircleBlend(x, y + 4, 10, '#f9e79f', 60);
    this.fillCircleBlend(x, y + 4, 5, '#ffffff', 80);
  }

  /**
   * Draw Ground Soft Shadow along base
   */
  drawFootprintShadow(x, y, w, h) {
    for (let dy = 0; dy < h; dy++) {
      const alpha = Math.round(90 * (1 - dy / h));
      this.fillRectBlend(x + dy * 2, y + dy, w - dy * 4, 1, '#050a06', alpha);
    }
  }
}

// =========================================================================
// 1. GENERATE HOUSE ELDER EDDA (160 x 144 px)
// =========================================================================
async function generateHouseElderEdda() {
  const c = new PixelCanvas(160, 144);

  // Soft ground shadow at base
  c.drawFootprintShadow(8, 136, 144, 8);

  // Chimney (Stone Masonry) on the left roof
  c.drawStoneWall(26, 8, 16, 48, { baseStone: '#434b46', stoneSize: 6 });
  // Chimney cap & soot
  c.fillRect(24, 6, 20, 3, '#2a2f2d');
  c.fillRect(26, 4, 16, 2, '#151716');
  // Smoke puffs
  c.fillCircleBlend(32, 2, 4, '#d8dcd9', 35);
  c.fillCircleBlend(36, -3, 6, '#bdc3bf', 25);

  // Main Stone Foundation / Ground Floor (y: 68 to 138, width: 136)
  c.drawStoneWall(14, 68, 132, 70, {
    baseStone: '#3d4741',
    lightStone: '#56635c',
    darkStone: '#272e2a',
    mortar: '#1b201d',
    stoneSize: 7
  });

  // Half-timbered Upper Gable Wall (Tường gác xép đầu hồi: y: 22 to 68)
  c.drawTimberFraming(24, 22, 112, 48, {
    woodDark: '#1c130d',
    woodMid: '#382517',
    woodLight: '#523723',
    plaster: '#727675',
    hasCrossBrace: true
  });

  // Loft Window in Upper Gable
  c.drawAmberWindow(72, 34, 16, 18, { isRoundTop: true, glowStrength: 1.1 });

  // Fish-scale Scalloped Slate Roof (y: 12 to 74)
  // Left: 8, Right: 152, Peak: 48..112
  c.drawFishScaleRoof(8, 14, 152, 72, 46, 114, {
    roofShade: '#273038',
    roofLight: '#43515c',
    roofDark: '#191f24',
    roofHighlight: '#5b6c7a',
    mossChance: 0.28
  });

  // Front Porch & Heavy Oak Door (Cửa gỗ sồi bà lão Edda)
  // Door frame
  c.fillRect(68, 92, 24, 46, '#18110b');
  // Oak planks
  c.fillRect(70, 94, 20, 44, '#3d291a');
  c.drawVLine(74, 95, 137, '#24170d');
  c.drawVLine(79, 95, 137, '#24170d');
  c.drawVLine(85, 95, 137, '#24170d');
  // Iron bands and studs on door
  c.drawHLine(70, 89, 104, '#1b2226');
  c.drawHLine(70, 89, 126, '#1b2226');
  c.setPixel(72, 104, '#85929e');
  c.setPixel(87, 104, '#85929e');
  c.setPixel(72, 126, '#85929e');
  c.setPixel(87, 126, '#85929e');
  // Iron door knocker / handle
  c.setPixel(86, 116, '#d4ac0d');
  c.setPixel(86, 117, '#f1c40f');

  // Porch Wooden Canopy (Mái hiên gỗ nhỏ che mưa trên cửa)
  c.fillRect(62, 86, 36, 6, '#281a11');
  c.drawFishScaleRoof(60, 84, 98, 90, 68, 92, { roofShade: '#1f272e', mossChance: 0.35 });
  // Wooden support struts (con sơn gỗ đỡ hiên)
  c.drawLine(64, 92, 69, 99, '#3a2517');
  c.drawLine(94, 92, 89, 99, '#3a2517');

  // Ground Floor Windows (2 large amber windows flanking the door)
  c.drawAmberWindow(30, 88, 20, 24, { glowStrength: 1.25 });
  c.drawAmberWindow(110, 88, 20, 24, { glowStrength: 1.25 });
  // Window sills (bậu cửa sổ đá)
  c.fillRect(28, 112, 24, 3, '#2a332f');
  c.fillRect(108, 112, 24, 3, '#2a332f');

  // Hanging Iron Lantern at the Porch (Đèn treo hiên nhà ấm áp)
  c.drawHangingLantern(101, 89);

  // Ivy climbing the right stone wall and creeping onto roof
  c.drawIvyCluster(136, 68, 14, 68, 0.65);
  c.drawIvyCluster(18, 90, 10, 48, 0.45);

  // Wooden log piles against left wall
  c.fillRect(16, 122, 12, 16, '#2e1c10');
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 2; k++) {
      c.fillCircle(19 + k * 5, 125 + r * 5, 2, '#6e472a');
      c.setPixel(19 + k * 5, 125 + r * 5, '#99633b');
    }
  }

  const file = path.join(OUT_DIR, 'house_elder_edda.png');
  await c.save(file);
  console.log(`[V15-10] Generated: ${file} (160x144)`);
}

// =========================================================================
// 2. GENERATE HOUSE HERBALIST NERIS (152 x 136 px)
// =========================================================================
async function generateHouseHerbalistNeris() {
  const c = new PixelCanvas(152, 136);

  // Ground shadow
  c.drawFootprintShadow(6, 128, 140, 8);

  // Herb drying porch extension on the left (x: 10..52, y: 56..130)
  // Timber posts supporting porch
  c.fillRect(12, 56, 42, 6, '#281a11');
  c.fillRect(12, 58, 4, 72, '#1e130c');
  c.fillRect(32, 58, 4, 72, '#1e130c');
  c.fillRect(50, 58, 4, 72, '#1e130c');
  // Porch roof
  c.drawFishScaleRoof(8, 52, 56, 62, 14, 52, {
    roofShade: '#273c2a',
    mossChance: 0.45,
    mossColor: '#456e48'
  });

  // Hanging dried herbs from porch beam (Bó thảo dược sấy khô)
  // Bundle 1: Lavender (oải hương tím)
  c.drawVLine(18, 62, 67, '#8a6843'); // string
  c.fillCircle(18, 72, 4, '#6c5387');
  c.setPixel(18, 71, '#977db5');
  c.setPixel(17, 73, '#b39ed1');
  c.setPixel(19, 74, '#533c69');

  // Bundle 2: Chamomile (cúc vàng la mã)
  c.drawVLine(25, 62, 69, '#8a6843');
  c.fillCircle(25, 74, 4, '#b59223');
  c.setPixel(25, 73, '#d4b03b');
  c.setPixel(26, 75, '#f7e174');

  // Bundle 3: Sage & Mountain Mint (ngải cứu & bạc hà)
  c.drawVLine(38, 62, 66, '#8a6843');
  c.fillCircle(38, 71, 5, '#3b5c40');
  c.setPixel(37, 70, '#537d59');
  c.setPixel(39, 72, '#7ba882');

  // Bundle 4: Dried medicinal roots (rễ cây thuốc)
  c.drawVLine(45, 62, 70, '#8a6843');
  c.fillRect(44, 71, 3, 9, '#5e432a');
  c.setPixel(43, 76, '#85613e');
  c.setPixel(47, 78, '#422e1b');

  // Main Stone & Timber House (x: 48..144, y: 20..130)
  // Stone foundation
  c.drawStoneWall(52, 66, 92, 64, {
    baseStone: '#38433d',
    lightStone: '#4d5b54',
    darkStone: '#252e29',
    mortar: '#1b211d',
    moss: '#3b5e40',
    stoneSize: 7
  });

  // Timber framing upper floor
  c.drawTimberFraming(56, 26, 84, 42, {
    woodDark: '#1c130d',
    woodMid: '#382517',
    plaster: '#6e766e',
    hasCrossBrace: true
  });

  // Small brick chimney on right roof
  c.drawStoneWall(116, 6, 12, 34, { baseStone: '#4a3832', stoneSize: 5 });
  c.fillRect(114, 4, 16, 3, '#2a1f1b');

  // Main Slanted Roof (Mái ngói phủ đầy rêu xanh)
  c.drawFishScaleRoof(44, 14, 148, 68, 76, 132, {
    roofShade: '#243229',
    roofLight: '#394d3f',
    roofDark: '#16201a',
    mossChance: 0.42,
    mossColor: '#436b47',
    mossLight: '#5f9164'
  });

  // Apothecary Door
  c.fillRect(64, 88, 20, 42, '#21150c');
  c.fillRect(66, 90, 16, 40, '#422c1b');
  c.drawVLine(71, 91, 129, '#2a1b10');
  c.drawVLine(77, 91, 129, '#2a1b10');
  c.setPixel(80, 110, '#d4ac0d'); // Brass doorknob

  // Soft Turquoise / Warm Amber Apothecary Window (Cửa sổ tiệm thuốc)
  c.drawAmberWindow(98, 82, 24, 26, {
    glowColor: '#48c9b0',
    glowStrength: 1.1,
    frameColor: '#1a140f'
  });
  // Pot of flowering bell-herbs on window sill
  c.fillRect(100, 108, 20, 3, '#323c37');
  c.fillRect(104, 105, 5, 4, '#804f32'); // Clay pot
  c.fillCircle(106, 102, 3, '#4cd195'); // Green plant
  c.setPixel(106, 101, '#f5b041'); // Yellow blossom

  // Potted medicinal herbs & mortar on porch floor (Dưới hiên Neris)
  c.fillRect(14, 118, 8, 10, '#804f32');
  c.fillCircle(18, 116, 4, '#2d7a46');
  c.fillRect(24, 121, 6, 7, '#633d26');
  c.fillCircle(27, 119, 3, '#52be80');

  // Ivy & medicinal vines on wall
  c.drawIvyCluster(136, 60, 12, 70, 0.7);

  const file = path.join(OUT_DIR, 'house_herbalist_neris.png');
  await c.save(file);
  console.log(`[V15-10] Generated: ${file} (152x136)`);
}

// =========================================================================
// 3. GENERATE SMITHY WORKSHOP BRAM (176 x 148 px)
// =========================================================================
async function generateSmithyWorkshopBram() {
  const c = new PixelCanvas(176, 148);

  // Ground shadow
  c.drawFootprintShadow(8, 140, 160, 8);

  // Great Stone Forge (Lò rèn đá khổng lồ bên trái: x: 16..72, y: 38..140)
  // Large stone chimney
  c.drawStoneWall(28, 4, 24, 46, { baseStone: '#2d3336', stoneSize: 6 });
  c.fillRect(26, 2, 28, 4, '#171a1c');
  // Smoke & embers
  c.fillCircleBlend(40, -2, 6, '#4f5b61', 40);
  c.fillCircleBlend(44, -8, 8, '#32393d', 30);
  c.setPixel(38, 1, '#f39c12');
  c.setPixel(43, -1, '#e74c3c');

  // Forge Hearth Wall & Base
  c.drawStoneWall(16, 48, 56, 92, {
    baseStone: '#2b3133',
    lightStone: '#3d4447',
    darkStone: '#1a1d1e',
    mortar: '#121414',
    stoneSize: 7
  });

  // Fiery Forge Hearth Cavity (Vòm lò rực lửa hồng: x: 26..62, y: 88..132)
  c.fillRect(26, 88, 36, 44, '#180a06');
  // Stone arch over hearth
  c.drawHLine(24, 63, 87, '#3e484d');
  c.drawHLine(26, 61, 88, '#56646b');

  // Glowing coals & fire inside hearth
  c.fillRect(28, 110, 32, 20, '#781910'); // Dark red embers
  c.fillRect(30, 114, 28, 14, '#ba2d13'); // Mid red fire
  c.fillRect(33, 118, 22, 9, '#e66817'); // Orange heat
  c.fillRect(36, 121, 16, 5, '#f5b041'); // Bright yellow core
  c.fillRect(39, 123, 10, 3, '#fffbe6'); // White heat peak

  // Fire glow reflecting on stone hearth and workshop floor
  c.fillCircleBlend(44, 118, 28, '#e65100', 70);
  c.fillCircleBlend(44, 118, 16, '#ff9800', 60);
  c.fillCircleBlend(44, 118, 8, '#fff3b0', 90);

  // Wooden Pavilion & Back Wall (Khu vực nhà xưởng: x: 68..166, y: 36..140)
  // Sturdy Timber Wall & Posts
  c.drawTimberFraming(70, 48, 94, 52, {
    woodDark: '#1c130d',
    woodMid: '#362316',
    plaster: '#4f5557',
    hasCrossBrace: false
  });

  // Workshop Roof (Mái ngói đá đen chịu nhiệt có muội than)
  c.drawFishScaleRoof(10, 26, 170, 56, 38, 150, {
    roofShade: '#1f2429',
    roofLight: '#323a42',
    roofDark: '#13161a',
    mossChance: 0.12
  });

  // Heavy Masterwork Anvil (Đe sắt lớn đặt trên gốc cây sồi: x: 88..116, y: 98..138)
  // Oak stump base
  c.fillRect(94, 114, 18, 26, '#3a2618');
  c.fillRect(96, 116, 14, 24, '#5c3d26');
  c.drawVLine(100, 116, 138, '#2b1b10');
  c.drawVLine(106, 116, 138, '#2b1b10');
  // Iron anvil body
  c.fillRect(90, 102, 26, 12, '#2c3e50'); // Body
  c.fillRect(86, 100, 34, 5, '#34495e'); // Horn & Face
  c.drawHLine(86, 119, 100, '#7f8c8d'); // Steel face highlight
  c.drawHLine(88, 117, 99, '#bdc3c7'); // Bright steel shine
  c.setPixel(85, 102, '#95a5a6'); // Anvil tip
  // Heavy Blacksmith Hammer resting on anvil
  c.drawLine(108, 96, 116, 104, '#875b36'); // Wooden handle
  c.fillRect(105, 94, 6, 4, '#1c2833'); // Hammer head
  c.drawHLine(105, 110, 94, '#5d6d7e');

  // Quenching Water Barrel (Thùng nước tôi thép: x: 122..140, y: 106..138)
  c.fillRect(122, 108, 18, 30, '#422c1b');
  c.drawHLine(122, 139, 112, '#17202a'); // Iron band 1
  c.drawHLine(122, 139, 122, '#17202a'); // Iron band 2
  c.drawHLine(122, 139, 134, '#17202a'); // Iron band 3
  // Water surface reflecting cool steel blue
  c.fillRect(124, 108, 14, 4, '#1b4f72');
  c.drawHLine(125, 136, 109, '#5dade2');
  // Steam rising from water barrel
  c.fillCircleBlend(131, 103, 4, '#d4e6f1', 35);
  c.fillCircleBlend(133, 97, 6, '#aed6f1', 25);

  // Weapon & Shield Rack on Right Wall (Giá vũ khí & khiên)
  c.fillRect(146, 76, 20, 56, '#281a10');
  // Broadsword hanging
  c.drawVLine(150, 78, 122, '#7f8c8d');
  c.drawVLine(150, 80, 118, '#bdc3c7');
  c.drawHLine(148, 152, 84, '#d4ac0d'); // Crossguard
  // Iron round shield hanging
  c.fillCircle(158, 88, 9, '#2c3e50');
  c.fillCircle(158, 88, 8, '#566573');
  c.fillCircle(158, 88, 3, '#d4ac0d'); // Boss
  // Fire tongs & poker near forge
  c.drawLine(70, 112, 72, 136, '#2c3e50');
  c.drawLine(73, 112, 75, 136, '#2c3e50');

  const file = path.join(OUT_DIR, 'smithy_workshop_bram.png');
  await c.save(file);
  console.log(`[V15-10] Generated: ${file} (176x148)`);
}

// =========================================================================
// 4. GENERATE GATEHOUSE GARTH (128 x 136 px)
// =========================================================================
async function generateGatehouseGarth() {
  const c = new PixelCanvas(128, 136);

  // Ground shadow
  c.drawFootprintShadow(10, 128, 108, 8);

  // Lower Stone Watchpost Bastion (Bệ đá kiên cố tầng 1: x: 18..110, y: 64..132)
  c.drawStoneWall(18, 64, 92, 68, {
    baseStone: '#37413d',
    lightStone: '#4d5b55',
    darkStone: '#222926',
    mortar: '#161a18',
    stoneSize: 7
  });

  // Sturdy Reinforced Timber Upper Observation Deck (Tầng quan sát gỗ sồi lim: x: 14..114, y: 24..66)
  c.drawTimberFraming(14, 24, 100, 42, {
    woodDark: '#19110b',
    woodMid: '#342216',
    woodLight: '#4d3322',
    plaster: '#585e5b',
    hasCrossBrace: true
  });

  // Watchpost Hipped Slate Roof (Mái chòi canh nhô rộng 4 góc)
  c.drawFishScaleRoof(8, 10, 120, 36, 42, 86, {
    roofShade: '#222a30',
    roofLight: '#394650',
    roofDark: '#151a1e',
    mossChance: 0.25
  });

  // Observation Window with warm guard lantern glow
  c.drawAmberWindow(52, 34, 24, 18, {
    glowStrength: 1.2,
    frameColor: '#170f0a'
  });

  // Heavy Gatehouse Entrance Door (Cửa vòm đá dẫn vào trạm gác)
  c.fillRect(48, 86, 26, 46, '#141716'); // Stone arch alcove
  c.fillRect(50, 88, 22, 44, '#2d1d12'); // Heavy oak door
  c.drawVLine(55, 89, 131, '#1b110a');
  c.drawVLine(61, 89, 131, '#1b110a');
  c.drawVLine(67, 89, 131, '#1b110a');
  // Iron reinforcement bands
  c.drawHLine(50, 71, 98, '#212f3d');
  c.drawHLine(50, 71, 120, '#212f3d');

  // Garth's Watch Guard Gear (Vũ khí canh gác)
  // Spear rack leaning on left stone wall
  c.drawLine(24, 80, 28, 132, '#5d4037'); // Spear shaft 1
  c.fillRect(23, 76, 3, 6, '#7f8c8d'); // Spear tip
  c.drawLine(30, 80, 34, 132, '#5d4037'); // Spear shaft 2
  c.fillRect(29, 76, 3, 6, '#7f8c8d');

  // Bellhollow Wooden Shield hanging on facade
  c.fillCircle(90, 86, 11, '#2c3e50');
  c.fillCircle(90, 86, 10, '#1a5276');
  c.drawHLine(82, 98, 86, '#d4ac0d'); // Gold cross
  c.drawVLine(90, 78, 94, '#d4ac0d');

  // Hanging Iron Lantern by the entrance
  c.drawHangingLantern(80, 78);

  // Weathering ivy on stones
  c.drawIvyCluster(102, 70, 10, 60, 0.6);

  const file = path.join(OUT_DIR, 'gatehouse_garth.png');
  await c.save(file);
  console.log(`[V15-10] Generated: ${file} (128x136)`);
}

// =========================================================================
// 5. GENERATE BELL TOWER GRAND (160 x 240 px)
// =========================================================================
async function generateBellTowerGrand() {
  const c = new PixelCanvas(160, 240);

  // Massive ground shadow
  c.drawFootprintShadow(10, 230, 140, 10);

  // Lower Stone Bastion & Foundation (Chân tháp đá khổng lồ: x: 18..142, y: 154..234)
  c.drawStoneWall(18, 154, 124, 80, {
    baseStone: '#333c37',
    lightStone: '#4c5a53',
    darkStone: '#1e2421',
    mortar: '#141715',
    stoneSize: 8,
    moss: '#29432d'
  });

  // Mid Stone Shaft (Thân tháp đá thuôn dần: x: 28..132, y: 92..154)
  c.drawStoneWall(28, 92, 104, 64, {
    baseStone: '#38433d',
    lightStone: '#505f57',
    darkStone: '#222925',
    mortar: '#151917',
    stoneSize: 7
  });

  // Stone Buttresses & Trim Beams (Gờ đá trang trí tầng tháp)
  c.fillRect(16, 150, 128, 6, '#202623');
  c.fillRect(26, 88, 108, 6, '#202623');
  c.drawHLine(16, 143, 150, '#56665e');
  c.drawHLine(26, 133, 88, '#56665e');

  // Gothic Lancet Arch Doorway at the base (Cổng vòm đá tháp chuông)
  c.fillRect(66, 184, 28, 50, '#101312'); // Arch cavity
  c.fillCircle(80, 184, 14, '#101312'); // Rounded arch top
  // Iron gate grille
  for (let gx = 70; gx <= 90; gx += 5) {
    c.drawVLine(gx, 174, 233, '#2c3539');
  }
  c.drawHLine(67, 93, 196, '#2c3539');
  c.drawHLine(67, 93, 214, '#2c3539');

  // Mid Lancet Windows (Khe đón gió Gothic tầng giữa)
  c.fillRect(52, 112, 12, 26, '#131715');
  c.fillCircle(58, 112, 6, '#131715');
  c.fillRect(96, 112, 12, 26, '#131715');
  c.fillCircle(102, 112, 6, '#131715');

  // Open Timber Belfry (Gác Chuông Gỗ Mở: x: 34..126, y: 46..90)
  // Belfry stone floor
  c.fillRect(32, 86, 96, 4, '#2d3531');
  // 4 Heavy carved oak pillars
  c.fillRect(36, 46, 6, 42, '#21160e');
  c.fillRect(58, 46, 5, 42, '#21160e');
  c.fillRect(97, 46, 5, 42, '#21160e');
  c.fillRect(118, 46, 6, 42, '#21160e');
  // Oak beam lintel over belfry
  c.fillRect(34, 44, 92, 5, '#3b2718');
  c.drawHLine(34, 125, 44, '#573a24');

  // THE ANCIENT BRONZE BELL (Quả Chuông Đồng Cổ Khổng Lồ: x: 68..92, y: 52..80)
  // Heavy iron bell yoke (giá treo chuông bằng gỗ sồi & sắt)
  c.fillRect(72, 48, 16, 5, '#1c1f21');
  c.fillRect(75, 47, 10, 2, '#4d3321');

  // Bell Body (Đồng cổ ánh kim rực rỡ xen kẽ gỉ xanh Patina)
  // Crown
  c.fillRect(76, 53, 8, 4, '#966c1b');
  // Waist (thân chuông cong)
  c.fillRect(73, 57, 14, 8, '#b58428');
  c.fillRect(70, 65, 20, 8, '#c8962c');
  // Sound ring & Lip (vành chuông loe rộng)
  c.fillRect(66, 73, 28, 5, '#dca738');
  c.drawHLine(65, 94, 77, '#fed46d'); // Highlight rim
  c.drawHLine(67, 92, 78, '#5c4112'); // Underside shadow

  // Ancient Runes & Verdigris Patina on the Bell
  c.setPixel(74, 61, '#1e564d'); // Patina stain
  c.setPixel(75, 62, '#2d7a6e');
  c.setPixel(84, 66, '#1e564d');
  c.setPixel(85, 67, '#44ab9b');
  // Clapper (quả lắc chuông)
  c.fillCircle(80, 81, 3, '#1c1f21');
  // Bell pull rope hanging down into darkness
  c.drawVLine(84, 80, 150, '#a0782b');

  // High Spire Roof (Mái chóp nhọn cao vút Gothic: y: 4 to 46)
  c.drawFishScaleRoof(26, 8, 134, 46, 76, 84, {
    roofShade: '#212a32',
    roofLight: '#384652',
    roofDark: '#13191e',
    mossChance: 0.35,
    mossColor: '#305234'
  });

  // Ancient Weather Vane / Iron Finial at peak
  c.drawVLine(80, 0, 8, '#566573');
  c.drawHLine(76, 84, 3, '#7f8c8d');
  c.setPixel(80, 0, '#d4ac0d');

  // Overgrown Creeping Ivy climbing from base to mid tower
  c.drawIvyCluster(22, 140, 16, 90, 0.75);
  c.drawIvyCluster(128, 120, 14, 110, 0.7);
  c.drawIvyCluster(70, 110, 12, 40, 0.5);

  const file = path.join(OUT_DIR, 'bell_tower_grand.png');
  await c.save(file);
  console.log(`[V15-10] Generated: ${file} (160x240)`);
}

// =========================================================================
// 6. GENERATE VILLAGE WELL DETAILED (64 x 72 px)
// =========================================================================
async function generateVillageWellDetailed() {
  const c = new PixelCanvas(64, 72);

  // Ground shadow
  c.drawFootprintShadow(4, 64, 56, 8);

  // Circular Stone Well Wall (Thành giếng đá tròn rêu phong: x: 10..54, y: 38..66)
  c.drawStoneWall(10, 42, 44, 24, {
    baseStone: '#3d4843',
    lightStone: '#57675f',
    darkStone: '#232a26',
    mortar: '#171c19',
    moss: '#3b5f3f',
    stoneSize: 6
  });

  // Top rim of stone well (vành miệng giếng đá)
  c.fillRect(8, 38, 48, 6, '#2c3530');
  c.fillRect(9, 39, 46, 4, '#48554e');
  c.drawHLine(9, 54, 39, '#63746c');

  // Deep Well Interior & Glistening Water (Lòng giếng sâu & mặt nước)
  c.fillRect(16, 42, 32, 10, '#0a1012'); // Dark cavity
  c.fillRect(18, 45, 28, 6, '#102830'); // Deep water
  c.drawHLine(20, 42, 46, '#1e4e5e');
  c.setPixel(24, 46, '#48cae4'); // Reflection sparkle
  c.setPixel(36, 47, '#90e0ef');

  // Two Upright Carved Oak Support Posts (2 Cột gỗ sồi đỡ mái giếng)
  c.fillRect(12, 18, 4, 24, '#24170e');
  c.drawVLine(13, 19, 41, '#3d2819');
  c.fillRect(48, 18, 4, 24, '#24170e');
  c.drawVLine(49, 19, 41, '#3d2819');

  // Cross Beam (Xà ngang gỗ)
  c.fillRect(12, 18, 40, 4, '#362316');
  c.drawHLine(12, 51, 18, '#523723');

  // Windlass Axle & Crank Handle (Trục quay & tay quay sắt)
  c.fillRect(16, 25, 32, 4, '#4a3321');
  // Coiled hemp rope around windlass
  c.fillRect(26, 24, 12, 6, '#9e7834');
  c.drawVLine(28, 24, 29, '#c49a4a');
  c.drawVLine(31, 24, 29, '#c49a4a');
  c.drawVLine(34, 24, 29, '#c49a4a');
  // Crank handle on right post
  c.fillRect(52, 26, 4, 2, '#566573');
  c.drawVLine(55, 27, 33, '#566573');
  c.fillRect(53, 33, 3, 2, '#2c3e50');

  // Hanging Rope and Wooden Water Bucket (Xô gỗ múc nước)
  c.drawVLine(30, 30, 44, '#9e7834');
  // Wooden bucket
  c.fillRect(26, 42, 10, 10, '#4a3320');
  c.drawHLine(26, 35, 45, '#1c2833'); // Iron hoop
  c.drawHLine(26, 35, 50, '#1c2833');
  c.drawLine(27, 41, 30, 39, '#566573'); // Handle
  c.drawLine(35, 41, 32, 39, '#566573');

  // Slanted Shingle Roof Over Well (Mái ngói che giếng nước)
  c.drawFishScaleRoof(4, 6, 60, 20, 26, 38, {
    roofShade: '#27343b',
    roofLight: '#41525c',
    roofDark: '#172025',
    mossChance: 0.35,
    mossColor: '#36593a'
  });

  // Green moss creeping up the well base
  c.drawIvyCluster(12, 48, 8, 18, 0.65);
  c.drawIvyCluster(44, 46, 8, 20, 0.6);

  const file = path.join(OUT_DIR, 'village_well_detailed.png');
  await c.save(file);
  console.log(`[V15-10] Generated: ${file} (64x72)`);
}

// =========================================================================
// RUN ALL GENERATORS
// =========================================================================
async function run() {
  console.log('--- Generating Bellhollow Medieval Pixel Art Buildings (V15-10) ---');
  await generateHouseElderEdda();
  await generateHouseHerbalistNeris();
  await generateSmithyWorkshopBram();
  await generateGatehouseGarth();
  await generateBellTowerGrand();
  await generateVillageWellDetailed();
  console.log('--- All 6 Building Sprites Generated Successfully! ---');
}

run().catch(err => {
  console.error('Error generating buildings:', err);
  process.exit(1);
});
