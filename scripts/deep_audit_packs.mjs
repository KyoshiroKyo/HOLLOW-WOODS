import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const stagingDir = path.resolve('staging/env_audit');

function analyzeImage(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const totalPixels = png.width * png.height;
  let transparentCount = 0;
  let opaqueCount = 0;
  let rSum = 0, gSum = 0, bSum = 0;
  const colorMap = new Map();

  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = png.data[i + 3];

    if (a < 10) {
      transparentCount++;
    } else {
      opaqueCount++;
      rSum += r;
      gSum += g;
      bSum += b;
      // Quantize to 16-level buckets to find dominant colors
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      const key = `${qr},${qg},${qb}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
  }

  const avgR = opaqueCount > 0 ? Math.round(rSum / opaqueCount) : 0;
  const avgG = opaqueCount > 0 ? Math.round(gSum / opaqueCount) : 0;
  const avgB = opaqueCount > 0 ? Math.round(bSum / opaqueCount) : 0;

  // Get top 5 dominant colors
  const topColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([col, count]) => {
      const [r, g, b] = col.split(',').map(Number);
      const hex = '#' + [r, g, b].map(x => Math.min(255, x).toString(16).padStart(2, '0')).join('');
      const pct = ((count / opaqueCount) * 100).toFixed(1);
      return `${hex} (${pct}%)`;
    });

  return {
    width: png.width,
    height: png.height,
    totalPixels,
    opaqueCount,
    transparentCount,
    opaquePercent: ((opaqueCount / totalPixels) * 100).toFixed(1),
    avgR, avgG, avgB,
    avgHex: '#' + [avgR, avgG, avgB].map(x => x.toString(16).padStart(2, '0')).join(''),
    topColors
  };
}

console.log('=== PACK 1: RESURRECTED RPG ===');
for (const file of ['Grass.png', 'Grass 2 layer.png', 'Plants.png', 'Props.png', 'Wall.png', 'portal-Sheet.png']) {
  const p = path.join(stagingDir, '01_resurrected_rpg', file);
  if (fs.existsSync(p)) {
    const res = analyzeImage(p);
    console.log(`${file}: ${res.width}x${res.height}, Opaque: ${res.opaquePercent}%, Avg: ${res.avgHex}, Top: ${res.topColors.slice(0, 3).join(', ')}`);
  }
}

console.log('\n=== PACK 2: UPDATED TREES ===');
for (const file of ['Oak.png', 'Birch.png', 'Maple.png']) {
  const p = path.join(stagingDir, '02_updated_trees', file);
  if (fs.existsSync(p)) {
    const res = analyzeImage(p);
    console.log(`${file}: ${res.width}x${res.height}, Opaque: ${res.opaquePercent}%, Avg: ${res.avgHex}, Top: ${res.topColors.slice(0, 3).join(', ')}`);
  }
}

console.log('\n=== PACK 3: FOREST ASSET PACK ===');
for (const file of ['Forest-Asset-Pack-Sheet.png']) {
  const p = path.join(stagingDir, '03_forest_asset_pack', file);
  if (fs.existsSync(p)) {
    const res = analyzeImage(p);
    console.log(`${file}: ${res.width}x${res.height}, Opaque: ${res.opaquePercent}%, Avg: ${res.avgHex}, Top: ${res.topColors.slice(0, 3).join(', ')}`);
  }
}

console.log('\n=== PACK 4: PIXEL ART TOP DOWN BASIC ===');
for (const file of ['Texture/TX Tileset Grass.png', 'Texture/TX Tileset Stone Ground.png', 'Texture/TX Tileset Wall.png', 'Texture/TX Plant.png', 'Texture/TX Props.png', 'Texture/TX Struct.png']) {
  const p = path.join(stagingDir, '04_pixel_art_top_down_basic', file);
  if (fs.existsSync(p)) {
    const res = analyzeImage(p);
    console.log(`${path.basename(file)}: ${res.width}x${res.height}, Opaque: ${res.opaquePercent}%, Avg: ${res.avgHex}, Top: ${res.topColors.slice(0, 3).join(', ')}`);
  }
}

console.log('\n=== PACK 5: THE FANTASY TILESET ===');
const pack5Files = [
  'The Fan-tasy Tileset (Free)/Art/Ground Tileset/Tileset_Ground.png',
  'The Fan-tasy Tileset (Free)/Art/Ground Tileset/Tileset_Road.png',
  'The Fan-tasy Tileset (Free)/Art/Buildings/Atlas/Buildings.png',
  'The Fan-tasy Tileset (Free)/Art/Buildings/House_Hay_1.png',
  'The Fan-tasy Tileset (Free)/Art/Buildings/CityWall_Gate_1.png',
  'The Fan-tasy Tileset (Free)/Art/Props/Atlas/Props.png',
  'The Fan-tasy Tileset (Free)/Art/Props/Animation/Animation_Campfire.png'
];
for (const file of pack5Files) {
  const p = path.join(stagingDir, '05_the_fantasy_tileset', file);
  if (fs.existsSync(p)) {
    const res = analyzeImage(p);
    console.log(`${path.basename(file)}: ${res.width}x${res.height}, Opaque: ${res.opaquePercent}%, Avg: ${res.avgHex}, Top: ${res.topColors.slice(0, 3).join(', ')}`);
  }
}

console.log('\n=== PACK 6: SHADOW SERIES ===');
const pack6Files = [
  'SHADOW Series - The Free Assets/SHADOW Series - Pixel Tile Map Asset Pack 3/tile map.png',
  'SHADOW Series - Void Gate/SHADOW Series - Abyssal Gate.png',
  'SHADOW Series - The Free Assets/SHADOW Series - The Blind Huntress/Sprite Sheet/1. Idle 48 x 48.png',
  'SHADOW Series - The Free Assets/SHADOW Series - The Shadowed Wetlands Boss v1.1/Sprite Sheet/idle.png'
];
for (const file of pack6Files) {
  const p = path.join(stagingDir, '06_shadow_series', file);
  if (fs.existsSync(p)) {
    const res = analyzeImage(p);
    console.log(`${path.basename(file)}: ${res.width}x${res.height}, Opaque: ${res.opaquePercent}%, Avg: ${res.avgHex}, Top: ${res.topColors.slice(0, 3).join(', ')}`);
  }
}
