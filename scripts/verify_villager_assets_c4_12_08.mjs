import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();

const targetDirs = [
  path.join(ROOT_DIR, 'public', 'assets', 'characters', 'villagers'),
  path.join(ROOT_DIR, 'public', 'assets', 'characters', 'npcs')
];

const requiredFiles = [
  { name: 'edda_idle_sheet.png', expectedW: 576, expectedH: 64, frames: 9 },
  { name: 'npc_edda.png', expectedW: 64, expectedH: 64, frames: 1 },
  { name: 'portrait_edda.png', expectedW: 64, expectedH: 64, frames: 1 },
  { name: 'portrait_edda_alt.png', expectedW: 64, expectedH: 64, frames: 1 },
  { name: 'neris_idle_sheet.png', expectedW: 384, expectedH: 64, frames: 6 },
  { name: 'npc_neris.png', expectedW: 64, expectedH: 64, frames: 1 },
  { name: 'portrait_neris.png', expectedW: 64, expectedH: 64, frames: 1 },
  { name: 'portrait_neris_alt3.png', expectedW: 64, expectedH: 64, frames: 1 },
  { name: 'portrait_neris_alt4.png', expectedW: 64, expectedH: 64, frames: 1 }
];

console.log('========================================================================');
console.log('    C4-12-08 PART 1 ASSET STANDARDIZATION VERIFICATION REPORT           ');
console.log('========================================================================\n');

let allPass = true;

for (const dir of targetDirs) {
  const dirName = path.relative(ROOT_DIR, dir).replace(/\\/g, '/');
  console.log(`Checking Directory: [${dirName}]`);
  console.log('------------------------------------------------------------------------');

  for (const req of requiredFiles) {
    const fullPath = path.join(dir, req.name);
    if (!fs.existsSync(fullPath)) {
      console.log(`[FAIL] ${req.name}: File does not exist!`);
      allPass = false;
      continue;
    }

    const stat = fs.statSync(fullPath);
    const data = fs.readFileSync(fullPath);
    let png;
    try {
      png = PNG.sync.read(data);
    } catch (err) {
      console.log(`[FAIL] ${req.name}: Corrupt PNG file (${err.message})`);
      allPass = false;
      continue;
    }

    const sizeMatch = png.width === req.expectedW && png.height === req.expectedH;
    const hasAlpha = png.alpha === true;

    // Calculate bounding box and non-transparent pixels
    let minX = png.width, maxX = -1, minY = png.height, maxY = -1;
    let nonTransparentCount = 0;
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        if (png.data[idx + 3] > 0) {
          nonTransparentCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const pass = sizeMatch && hasAlpha && nonTransparentCount > 0;
    if (!pass) allPass = false;

    const statusStr = pass ? '[PASS]' : '[FAIL]';
    console.log(`${statusStr} ${req.name.padEnd(24)} | ${png.width}x${png.height} px | RGBA:${hasAlpha} | Bytes: ${stat.size.toString().padStart(6)} | BBox: [${minX},${minY}]->[${maxX},${maxY}]`);
  }
  console.log('');
}

// Check detailed frame anchors for spritesheets
console.log('Checking Frame Anchor Standards (Foot Anchor row 57-58, maxY=58):');
console.log('------------------------------------------------------------------------');

const VILLAGERS_DIR = targetDirs[0];
const eddaSheetPath = path.join(VILLAGERS_DIR, 'edda_idle_sheet.png');
const eddaPng = PNG.sync.read(fs.readFileSync(eddaSheetPath));
for (let f = 0; f < 9; f++) {
  let fMinX = 64, fMaxX = -1, fMinY = 64, fMaxY = -1;
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const idx = (y * 576 + (f * 64 + x)) * 4;
      if (eddaPng.data[idx + 3] > 0) {
        if (x < fMinX) fMinX = x;
        if (x > fMaxX) fMaxX = x;
        if (y < fMinY) fMinY = y;
        if (y > fMaxY) fMaxY = y;
      }
    }
  }
  console.log(`  Edda Frame ${f}: BBox [X:${fMinX}..${fMaxX}, Y:${fMinY}..${fMaxY}], Width:${fMaxX - fMinX + 1}, Height:${fMaxY - fMinY + 1}, Foot maxY: ${fMaxY}`);
}

const nerisSheetPath = path.join(VILLAGERS_DIR, 'neris_idle_sheet.png');
const nerisPng = PNG.sync.read(fs.readFileSync(nerisSheetPath));
for (let f = 0; f < 6; f++) {
  let fMinX = 64, fMaxX = -1, fMinY = 64, fMaxY = -1;
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const idx = (y * 384 + (f * 64 + x)) * 4;
      if (nerisPng.data[idx + 3] > 0) {
        if (x < fMinX) fMinX = x;
        if (x > fMaxX) fMaxX = x;
        if (y < fMinY) fMinY = y;
        if (y > fMaxY) fMaxY = y;
      }
    }
  }
  console.log(`  Neris Frame ${f}: BBox [X:${fMinX}..${fMaxX}, Y:${fMinY}..${fMaxY}], Width:${fMaxX - fMinX + 1}, Height:${fMaxY - fMinY + 1}, Foot maxY: ${fMaxY}`);
}

console.log('\n========================================================================');
console.log(`VERIFICATION RESULT: ${allPass ? 'ALL TESTS PASSED (100% OK)' : 'SOME TESTS FAILED'}`);
console.log('========================================================================');
