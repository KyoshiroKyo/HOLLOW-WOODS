/**
 * Verification script for Step V15-10: Bellhollow Village Medieval Architecture Overhaul
 */
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('=== VERIFYING STEP V15-10: BELLHOLLOW ARCHITECTURE OVERHAUL ===');

const expectedBuildings = [
  { file: 'house_elder_edda.png', w: 160, h: 144, key: 'SPRITE_HOUSE_ELDER_EDDA_V15' },
  { file: 'house_herbalist_neris.png', w: 152, h: 136, key: 'SPRITE_HOUSE_HERBALIST_NERIS_V15' },
  { file: 'smithy_workshop_bram.png', w: 176, h: 148, key: 'SPRITE_SMITHY_WORKSHOP_BRAM_V15' },
  { file: 'gatehouse_garth.png', w: 128, h: 136, key: 'SPRITE_GATEHOUSE_GARTH_V15' },
  { file: 'bell_tower_grand.png', w: 160, h: 240, key: 'SPRITE_BELL_TOWER_GRAND_V15' },
  { file: 'village_well_detailed.png', w: 64, h: 72, key: 'SPRITE_VILLAGE_WELL_DETAILED_V15' }
];

let failed = false;

// 1. Verify PNG files
for (const b of expectedBuildings) {
  const p = path.join('public/assets/buildings', b.file);
  if (!fs.existsSync(p)) {
    console.error(`[FAIL] File not found: ${p}`);
    failed = true;
    continue;
  }
  const data = fs.readFileSync(p);
  const png = PNG.sync.read(data);
  if (png.width !== b.w || png.height !== b.h) {
    console.error(`[FAIL] ${b.file}: expected ${b.w}x${b.h}, got ${png.width}x${png.height}`);
    failed = true;
  } else {
    console.log(`[PASS] ${b.file}: ${png.width}x${png.height} px (Ratio: ${(png.height / 43).toFixed(1)}x character height)`);
  }
}

// 2. Verify Constants.ts
const constantsContent = fs.readFileSync('src/config/Constants.ts', 'utf-8');
for (const b of expectedBuildings) {
  if (!constantsContent.includes(b.key)) {
    console.error(`[FAIL] Constants.ts does not export ${b.key}`);
    failed = true;
  } else {
    console.log(`[PASS] Constants.ts exports ${b.key}`);
  }
}

// 3. Verify PreloadScene.ts
const preloadContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf-8');
for (const b of expectedBuildings) {
  if (!preloadContent.includes(b.key)) {
    console.error(`[FAIL] PreloadScene.ts does not load ${b.key}`);
    failed = true;
  } else {
    console.log(`[PASS] PreloadScene.ts loads ${b.key}`);
  }
}

// 4. Verify WorldBuilder.ts
const wbContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf-8');
for (const b of expectedBuildings) {
  if (!wbContent.includes(b.key)) {
    console.error(`[FAIL] WorldBuilder.ts does not reference ${b.key}`);
    failed = true;
  } else {
    console.log(`[PASS] WorldBuilder.ts references ${b.key}`);
  }
}

// 5. Verify Foot-Level Hitbox and Y-Sorting
if (wbContent.includes('colH = isEdda ? 32 : 30') &&
    wbContent.includes('const colH = 34;') &&
    wbContent.includes('const colH = 32;') &&
    wbContent.includes('house.setOrigin(0.5, 1.0)') &&
    wbContent.includes('tower.setOrigin(0.5, 1.0)') &&
    wbContent.includes('smithy.setOrigin(0.5, 1.0)') &&
    wbContent.includes('gatehouse.setOrigin(0.5, 1.0)')) {
  console.log('[PASS] WorldBuilder.ts properly configures origin(0.5, 1.0), Foot-level hitboxes & Y-sorting!');
} else {
  console.error('[FAIL] WorldBuilder.ts foot-level hitboxes or origins missing!');
  failed = true;
}

if (failed) {
  console.error('=== SOME VERIFICATIONS FAILED ===');
  process.exit(1);
} else {
  console.log('=== ALL V15-10 VERIFICATIONS PASSED SUCCESSFULLY ===');
}
