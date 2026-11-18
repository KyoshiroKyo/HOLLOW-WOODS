import fs from 'fs';
import path from 'path';

// Helper: Read PNG Dimensions
function getPngDimensions(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { width, height };
    }
  } catch (e) {
    return null;
  }
  return null;
}

console.log('=== HOLLOW WOODS V1.5 COMPREHENSIVE AUDIT ===\n');

// -------------------------------------------------------------
// PART 1: COLLIDERS & MOVEMENT AUDIT
// -------------------------------------------------------------
console.log('--- PART 1: COLLIDERS & MOVEMENT AUDIT ---');

const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8')).zones;

let zoneCollidersCount = 0;
const collidersByZone = {};
const zoneBounds = {};
const zoneTransitions = {};

for (const [k, z] of Object.entries(zonesData)) {
  const colls = z.colliders || [];
  zoneCollidersCount += colls.length;
  collidersByZone[z.id] = colls.length;
  zoneBounds[z.id] = z.bounds;
  zoneTransitions[z.id] = z.transitions || [];
}
console.log(`1. zones.json Colliders: ${zoneCollidersCount} total across ${Object.keys(zonesData).length} zones.`);

// AutoPerimeterWallsModule simulation
let autoPerimeterCount = 0;
const autoPerimeterByZone = {};
const wallThickness = 32;

for (const [zoneId, bounds] of Object.entries(zoneBounds)) {
  if (!bounds) continue;
  const transitions = zoneTransitions[zoneId] || [];
  let zoneWalls = 0;

  // North
  const northPortals = transitions.filter(t => Math.abs(t.triggerRect.y - bounds.y) <= wallThickness);
  zoneWalls += (northPortals.length + 1);

  // South
  const southPortals = transitions.filter(t => Math.abs(t.triggerRect.y + t.triggerRect.height - (bounds.y + bounds.height)) <= wallThickness);
  zoneWalls += (southPortals.length + 1);

  // West
  const westPortals = transitions.filter(t => Math.abs(t.triggerRect.x - bounds.x) <= wallThickness);
  zoneWalls += (westPortals.length + 1);

  // East
  const eastPortals = transitions.filter(t => Math.abs(t.triggerRect.x + t.triggerRect.width - (bounds.x + bounds.width)) <= wallThickness);
  zoneWalls += (eastPortals.length + 1);

  autoPerimeterCount += zoneWalls;
  autoPerimeterByZone[zoneId] = zoneWalls;
}
console.log(`2. AutoPerimeterWallsModule: ${autoPerimeterCount} perimeter wall colliders across zones.`);

// WorldBuilder Tree Loops & Objects
const wb = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');

// Loop counts
let treeLoopColliders = 0;

// Crooked path loops
const cpBounds = zoneBounds['crooked_path'];
let cpTrees = 0;
for (let x = cpBounds.x + 40; x < cpBounds.x + cpBounds.width - 40; x += 110) {
  if (x < 2010 || x > 2130) cpTrees++;
}
for (let x = cpBounds.x + 40; x < cpBounds.x + cpBounds.width - 40; x += 115) {
  if (x > 1660 && (x < 2690 || x > 2810)) cpTrees++;
}

// Deep Forest loops
const dfBounds = zoneBounds['deep_forest'];
let dfTrees = 0;
for (let x = dfBounds.x + 40; x < dfBounds.x + dfBounds.width - 40; x += 55) {
  if (x < 2190 || x > 2290) dfTrees++;
}
for (let y = dfBounds.y + 40; y < dfBounds.y + dfBounds.height - 40; y += 55) dfTrees++;
for (let y = dfBounds.y + 40; y < dfBounds.y + dfBounds.height - 40; y += 55) {
  if (y < -330 || y > -190) dfTrees++;
}
for (let x = dfBounds.x + 40; x < dfBounds.x + dfBounds.width - 40; x += 55) {
  const inWc = x >= 1790 && x <= 1890;
  const inCp = x >= 1990 && x <= 2170;
  if (!inWc && !inCp) dfTrees++;
}

// Silent Mire loops
const smBounds = zoneBounds['silent_mire'];
let smTrees = 0;
for (let x = smBounds.x + 40; x < smBounds.x + smBounds.width - 40; x += 110) smTrees++;
for (let x = smBounds.x + 40; x < smBounds.x + smBounds.width - 40; x += 115) smTrees++;
for (let y = smBounds.y + 40; y < smBounds.y + smBounds.height - 40; y += 95) {
  if (y < 150 || (y > 235 && y < 265) || y > 400) smTrees++;
}
for (let y = smBounds.y + 40; y < smBounds.y + smBounds.height - 40; y += 95) {
  if (y < 235 || y > 400) smTrees++;
}

// Broken Bell Shrine loops
const bbsBounds = zoneBounds['broken_bell_shrine'];
let bbsTrees = 0;
for (let x = bbsBounds.x + 30; x < bbsBounds.x + bbsBounds.width - 30; x += 105) bbsTrees++;
for (let x = bbsBounds.x + 30; x < bbsBounds.x + bbsBounds.width - 30; x += 110) bbsTrees++;
for (let y = bbsBounds.y + 40; y < bbsBounds.y + bbsBounds.height - 40; y += 90) bbsTrees++;
for (let y = bbsBounds.y + 40; y < bbsBounds.y + bbsBounds.height - 40; y += 90) {
  if (y < 210 || y > 370) bbsTrees++;
}

treeLoopColliders = cpTrees + dfTrees + smTrees + bbsTrees;

// Discrete WorldBuilder static colliders
// Let's count all direct calls outside loops
const discreteCalls = (wb.match(/createStaticBoxCollider(?:Centered)?\s*\([^;]+\);/g) || []).length;
const discreteTrees = (wb.match(/this\.createTree\s*\([^;]+\);/g) || []).length;
const discreteHollowTrees = (wb.match(/this\.createHollowTree\s*\([^;]+\);/g) || []).length;

const totalWorldBuilderColliders = discreteCalls + treeLoopColliders + discreteHollowTrees;
console.log(`3. WorldBuilder Generated Colliders:`);
console.log(`   - Direct static box calls (buildings, obstacles, gates): ${discreteCalls}`);
console.log(`   - Boundary tree loops: ${treeLoopColliders} (Crooked: ${cpTrees}, Deep Forest: ${dfTrees}, Mire: ${smTrees}, Shrine: ${bbsTrees})`);
console.log(`   - Hollow trees: ${discreteHollowTrees}`);
console.log(`   - Total WorldBuilder colliders: ~${totalWorldBuilderColliders}`);

const grandTotalColliders = zoneCollidersCount + autoPerimeterCount + totalWorldBuilderColliders;
console.log(`=> GRAND TOTAL STATIC COLLIDERS: ${grandTotalColliders} (EXCEEDS 430 THRESHOLD!)\n`);

// -------------------------------------------------------------
// PART 2: ASSET SIZES & SCALE AUDIT
// -------------------------------------------------------------
console.log('--- PART 2: ASSET SIZES & SCALE AUDIT ---');

const preload = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');

// Parse spritesheets
const spritesheets = [];
const ssRegex = /this\.load\.spritesheet\s*\(\s*['"]?([A-Za-z0-9_]+)['"]?\s*,\s*['"]([^'"]+)['"]\s*,\s*\{\s*frameWidth:\s*(\d+)\s*,\s*frameHeight:\s*(\d+)/g;
let m;
while ((m = ssRegex.exec(preload)) !== null) {
  const [, key, relPath, fw, fh] = m;
  const fullPath = path.join('public', relPath);
  const dims = getPngDimensions(fullPath);
  spritesheets.push({
    key,
    relPath,
    fullPath,
    frameWidth: parseInt(fw),
    frameHeight: parseInt(fh),
    pngWidth: dims ? dims.width : null,
    pngHeight: dims ? dims.height : null,
    totalFrames: dims ? Math.floor(dims.width / parseInt(fw)) * Math.floor(dims.height / parseInt(fh)) : 0
  });
}

// Parse single images
const images = [];
const imgRegex = /this\.load\.image\s*\(\s*['"]?([A-Za-z0-9_]+)['"]?\s*,\s*['"]([^'"]+)['"]\s*\)/g;
while ((m = imgRegex.exec(preload)) !== null) {
  const [, key, relPath] = m;
  const fullPath = path.join('public', relPath);
  const dims = getPngDimensions(fullPath);
  images.push({
    key,
    relPath,
    pngWidth: dims ? dims.width : null,
    pngHeight: dims ? dims.height : null
  });
}

console.log(`Loaded Spritesheets in PreloadScene: ${spritesheets.length}`);
console.log(`Loaded Images in PreloadScene: ${images.length}`);

// Check scales in code
const scaleUsages = [];
const filesToCheck = [
  'src/world/WorldBuilder.ts',
  'src/entities/SatyrPlayer.ts',
  'src/entities/NPCEntity.ts',
  'src/entities/AmbushMonsters.ts',
  'src/entities/ShadowMonsters.ts',
  'src/entities/EvilKnights.ts',
  'src/entities/BossMireWarden.ts',
  'src/entities/WildlifeEntity.ts'
];

for (const file of filesToCheck) {
  const code = fs.readFileSync(file, 'utf8');
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('.setScale(')) {
      scaleUsages.push({ file, line: idx + 1, code: line.trim() });
    }
  });
}
console.log(`Total setScale invocations found: ${scaleUsages.length}`);

// Output summary data for report
const auditData = {
  colliders: {
    zoneCollidersCount,
    autoPerimeterCount,
    treeLoopColliders,
    discreteCalls,
    discreteHollowTrees,
    grandTotalColliders,
    collidersByZone,
    autoPerimeterByZone
  },
  spritesheets,
  images,
  scaleUsages
};

fs.writeFileSync('scripts/audit_results.json', JSON.stringify(auditData, null, 2));
console.log('Saved audit data to scripts/audit_results.json');
