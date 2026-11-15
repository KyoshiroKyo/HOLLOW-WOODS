import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();

const targetDirs = [
  path.join(ROOT_DIR, 'public', 'assets', 'characters', 'villagers'),
  path.join(ROOT_DIR, 'public', 'assets', 'characters', 'npcs')
];

const requiredPngs = [
  { name: 'garth_walk_sheet.png', w: 512, h: 256 },
  { name: 'npc_garth.png', w: 64, h: 64 },
  { name: 'portrait_garth.png', w: 64, h: 64 },
  { name: 'edda_idle_sheet.png', w: 576, h: 64 },
  { name: 'npc_edda.png', w: 64, h: 64 },
  { name: 'portrait_edda.png', w: 64, h: 64 },
  { name: 'portrait_edda_alt.png', w: 64, h: 64 },
  { name: 'neris_idle_sheet.png', w: 384, h: 64 },
  { name: 'npc_neris.png', w: 64, h: 64 },
  { name: 'portrait_neris.png', w: 64, h: 64 },
  { name: 'portrait_neris_alt3.png', w: 64, h: 64 },
  { name: 'portrait_neris_alt4.png', w: 64, h: 64 },
  { name: 'potter_walk_sheet.png', w: 512, h: 256 },
  { name: 'npc_bram.png', w: 64, h: 64 },
  { name: 'portrait_bram.png', w: 64, h: 64 },
  { name: 'errand_boy_walk_sheet.png', w: 512, h: 256 },
  { name: 'npc_finn.png', w: 64, h: 64 },
  { name: 'portrait_finn.png', w: 64, h: 64 },
  { name: 'villager_preview_sheet.png', w: 640, h: 320 }
];

console.log('========================================================================');
console.log('     C4-12-08 PART 2 COMPLETE ASSET QC VERIFICATION REPORT             ');
console.log('========================================================================\n');

let allPassed = true;

for (const dir of targetDirs) {
  const rel = path.relative(ROOT_DIR, dir).replace(/\\/g, '/');
  console.log(`Checking Directory: [${rel}]`);
  console.log('------------------------------------------------------------------------');

  // Check JSON manifest
  const manifestPath = path.join(dir, 'villager_animation_manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const npcCount = Object.keys(parsed.npcs || {}).length;
      console.log(`[PASS] villager_animation_manifest.json | Valid JSON (${npcCount} NPCs configured)`);
    } catch (e) {
      console.log(`[FAIL] villager_animation_manifest.json: JSON Parse Error (${e.message})`);
      allPassed = false;
    }
  } else {
    console.log(`[FAIL] villager_animation_manifest.json: Missing!`);
    allPassed = false;
  }

  // Check all PNGs
  for (const item of requiredPngs) {
    const fullPath = path.join(dir, item.name);
    if (!fs.existsSync(fullPath)) {
      console.log(`[FAIL] ${item.name}: Missing!`);
      allPassed = false;
      continue;
    }

    const stat = fs.statSync(fullPath);
    const buf = fs.readFileSync(fullPath);
    let png;
    try {
      png = PNG.sync.read(buf);
    } catch (e) {
      console.log(`[FAIL] ${item.name}: Corrupt PNG (${e.message})`);
      allPassed = false;
      continue;
    }

    const sizeOk = png.width === item.w && png.height === item.h;
    const hasAlpha = png.alpha === true;

    if (!sizeOk || !hasAlpha || stat.size === 0) {
      console.log(`[FAIL] ${item.name}: Size mismatch or missing alpha! Got ${png.width}x${png.height}`);
      allPassed = false;
    } else {
      console.log(`[PASS] ${item.name.padEnd(28)} | ${png.width.toString().padStart(4)}x${png.height.toString().padEnd(4)} px | RGBA:${hasAlpha} | Bytes: ${stat.size.toString().padStart(6)}`);
    }
  }
  console.log('');
}

// Check foot anchor standard (maxY=58) across all 5 standing NPCs
console.log('Checking Standing NPCs Foot Anchor Standard (maxY == 58):');
console.log('------------------------------------------------------------------------');
const vDir = targetDirs[0];
const standingNpcs = [
  { id: 'garth', file: 'npc_garth.png' },
  { id: 'edda', file: 'npc_edda.png' },
  { id: 'neris', file: 'npc_neris.png' },
  { id: 'bram', file: 'npc_bram.png' },
  { id: 'finn', file: 'npc_finn.png' }
];

for (const npc of standingNpcs) {
  const p = path.join(vDir, npc.file);
  const png = PNG.sync.read(fs.readFileSync(p));
  let minX = 64, maxX = -1, minY = 64, maxY = -1;
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      if (png.data[(y * 64 + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const anchorOk = (maxY === 58);
  if (!anchorOk) allPassed = false;
  const status = anchorOk ? '[PASS]' : '[FAIL]';
  const centerX = ((minX + maxX) / 2).toFixed(1);
  console.log(`  ${status} ${npc.file.padEnd(16)} | BBox [X:${minX}..${maxX}, Y:${minY}..${maxY}] | CenterX: ${centerX} (standard 32.0) | Foot maxY: ${maxY}`);
}

console.log('\n========================================================================');
console.log(`FINAL QC OUTCOME: ${allPassed ? 'ALL TESTS PASSED (100% OK)' : 'SOME TESTS FAILED'}`);
console.log('========================================================================');
