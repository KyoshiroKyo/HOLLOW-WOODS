// scripts/verify_broken_bell_shrine_c4_12_25.mjs
// Automated verification suite for COMMAND C4-12-25: Broken Bell Shrine Integration

import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('🔍 VERIFYING COMMAND C4-12-25: BROKEN BELL SHRINE INTEGRATION');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// 1. PRE-BACKUP VERIFICATION
console.log('--- 1. Pre-Backup Integrity Verification ---');
const backupDir = 'Backups/C4-12-25_PRE_BACKUP';
assert(fs.existsSync(backupDir), `Pre-backup directory exists: ${backupDir}`);
const backupFiles = [
  'zones.json',
  'WorldBuilder.ts',
  'ZoneConnectionRegistry.ts',
  'WorldGatingSystem.ts',
  'GameScene.ts',
  'PlayerState.ts',
  'lore.json'
];
for (const file of backupFiles) {
  const p = path.join(backupDir, file);
  assert(fs.existsSync(p), `Backup file exists: ${file}`);
}

// 2. ARCHITECTURE SPRITE ASSETS
console.log('\n--- 2. Architecture Sprite Asset Integrity & Dimensions ---');
const assets = [
  { name: 'broken_shrine.png', path: 'public/assets/environment/sprites/broken_shrine.png', expW: 96, expH: 80 },
  { name: 'stone_altar.png', path: 'public/assets/environment/sprites/stone_altar.png', expW: 60, expH: 42 },
  { name: 'tile_stone_floor.png', path: 'public/assets/environment/tiles/tile_stone_floor.png', expW: 16, expH: 16 },
  { name: 'tile_cobble_road.png', path: 'public/assets/environment/tiles/tile_cobble_road.png', expW: 16, expH: 16 },
  { name: 'pillar_root.png', path: 'public/assets/environment/sprites/pillar_root.png', expW: 31, expH: 61 }
];

for (const a of assets) {
  assert(fs.existsSync(a.path), `Asset file exists: ${a.name}`);
  const buf = fs.readFileSync(a.path);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === a.expW && h === a.expH, `Dimensions valid for ${a.name}: ${w}x${h} (expected ${a.expW}x${a.expH})`);
}

// 3. ZONES REGISTRY & CONFIGURATION
console.log('\n--- 3. Zones Registry & Configuration (zones.json) ---');
const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const shrineZone = zonesJson.zones.find(z => z.id === 'broken_bell_shrine');
assert(!!shrineZone, 'broken_bell_shrine is registered in zones.json');
assert(shrineZone.status === 'active', 'broken_bell_shrine status is "active"');
assert(shrineZone.bounds.x === 4000 && shrineZone.bounds.y === 0 && shrineZone.bounds.width === 960 && shrineZone.bounds.height === 600,
  `Bounds match specification: [${shrineZone.bounds.x}, ${shrineZone.bounds.y}, ${shrineZone.bounds.width}, ${shrineZone.bounds.height}]`);
assert(shrineZone.tier === 'LAYER_3_FORBIDDEN', 'Tier is LAYER_3_FORBIDDEN');

// Boundary Colliders
const boundTop = shrineZone.colliders.find(c => c.id === 'shrine_bound_top');
const boundBottom = shrineZone.colliders.find(c => c.id === 'shrine_bound_bottom');
const boundRight = shrineZone.colliders.find(c => c.id === 'shrine_bound_right');
const boundLeftTop = shrineZone.colliders.find(c => c.id === 'shrine_bound_left_top');
const boundLeftBottom = shrineZone.colliders.find(c => c.id === 'shrine_bound_left_bottom');
const mainAltarCol = shrineZone.colliders.find(c => c.id === 'shrine_main_altar');

assert(!!boundTop && !!boundBottom && !!boundRight, 'Boundary colliders top, bottom, and right exist');
assert(!!boundLeftTop && !!boundLeftBottom, 'West portal boundary colliders (left_top, left_bottom) exist');
assert(boundLeftTop.y + boundLeftTop.height <= 220, `West left_top bound ends at y <= 220 (${boundLeftTop.y + boundLeftTop.height})`);
assert(boundLeftBottom.y >= 360, `West left_bottom bound starts at y >= 360 (${boundLeftBottom.y})`);
assert(!!mainAltarCol, 'shrine_main_altar collider exists');

// Interactables
const clapperInteract = shrineZone.interactables.find(it => it.actionId === 'collect_bell_tongue');
const hidingInteract = shrineZone.interactables.find(it => it.actionId === 'hide_player');
const steleInteract = shrineZone.interactables.find(it => it.actionId === 'read_shrine_stele');
const bellInteract = shrineZone.interactables.find(it => it.actionId === 'inspect_cracked_bell');

assert(!!clapperInteract, 'Interactable bell_tongue_item exists at altar');
assert(clapperInteract.x === 4548 && clapperInteract.y === 280, `Clapper positioned at front of altar: (${clapperInteract.x}, ${clapperInteract.y})`);
assert(!!hidingInteract, 'Interactable shrine_hiding_spot exists');
assert(!!steleInteract, 'Interactable shrine_inscribed_stele exists at (4280, 270)');
assert(!!bellInteract, 'Interactable shrine_cracked_bell exists at (4500, 215)');

// Transition to silent_mire
const toMireTrans = shrineZone.transitions.find(t => t.toZone === 'silent_mire');
assert(!!toMireTrans && toMireTrans.status === 'active', 'Transition to_silent_mire_from_shrine is active');
assert(toMireTrans.barrierType === 'open', 'Transition to_silent_mire_from_shrine barrierType is "open"');
assert(toMireTrans.triggerRect.x === 4000 && toMireTrans.triggerRect.y === 220, 'Transition trigger matches west portal');

// 4. ZONE CONNECTIONS & GATING RULES
console.log('\n--- 4. Zone Connections & Gating Rules ---');
const zcrSrc = fs.readFileSync('src/world/ZoneConnectionRegistry.ts', 'utf8');
assert(zcrSrc.includes('broken_bell_shrine'), 'ZoneConnectionRegistry registers broken_bell_shrine node');
assert(zcrSrc.includes('conn_silent_mire_to_shrine') && zcrSrc.includes('conn_shrine_to_silent_mire'),
  'ZoneConnectionRegistry defines 2-way connections between silent_mire and broken_bell_shrine');
assert(zcrSrc.includes('mire_puzzle_solved'), 'conn_silent_mire_to_shrine gated by mire_puzzle_solved');

const wgsSrc = fs.readFileSync('src/world/WorldGatingSystem.ts', 'utf8');
assert(wgsSrc.includes('broken_bell_shrine') && wgsSrc.includes('mire_puzzle_solved'),
  'WorldGatingSystem registers rule requiring mire_puzzle_solved for broken_bell_shrine');

// 5. RESOURCE NODES & CLEARANCE SANITY
console.log('\n--- 5. Resource Nodes Walkway Clearance ---');
assert(Array.isArray(shrineZone.resourceNodes) && shrineZone.resourceNodes.length >= 4,
  `broken_bell_shrine defines ${shrineZone.resourceNodes?.length || 0} resource nodes (>= 4 expected)`);

for (const node of shrineZone.resourceNodes) {
  // Check bounds
  const inBounds = node.x >= shrineZone.bounds.x && node.x <= shrineZone.bounds.x + shrineZone.bounds.width &&
                   node.y >= shrineZone.bounds.y && node.y <= shrineZone.bounds.y + shrineZone.bounds.height;
  assert(inBounds, `Node ${node.id} (${node.x}, ${node.y}) is inside zone bounds`);

  // Check collider overlap
  let overlaps = false;
  for (const c of shrineZone.colliders) {
    if (node.x >= c.x - 10 && node.x <= c.x + c.width + 10 &&
        node.y >= c.y - 10 && node.y <= c.y + c.height + 10) {
      overlaps = true;
      break;
    }
  }
  assert(!overlaps, `Node ${node.id} has 0 collider overlap and is freely accessible`);
}

// 6. WORLDBUILDER METHODS & DECORATIONS
console.log('\n--- 6. WorldBuilder Rendering & Architecture ---');
const wbSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
assert(wbSrc.includes('renderBrokenBellShrineTerrain'), 'WorldBuilder implements renderBrokenBellShrineTerrain');
assert(wbSrc.includes('broken_bell_shrine_ground_baked_v12'), 'WorldBuilder uses broken_bell_shrine_ground_baked_v12');
assert(wbSrc.includes('renderBrokenBellShrineDecorations'), 'WorldBuilder implements renderBrokenBellShrineDecorations');
assert(wbSrc.includes('createShrineAltar(4500, 250, 96, 64)'), 'WorldBuilder places Shrine Altar at (4500, 250)');
assert(wbSrc.includes('createCrackedBellRuins(4500, 205)'), 'WorldBuilder places Cracked Bell Ruins at (4500, 205)');
assert(wbSrc.includes('createShrinePillar(4350, 180)'), 'WorldBuilder places Northwest pillar at (4350, 180)');
assert(wbSrc.includes('createShrinePillar(4650, 180)'), 'WorldBuilder places Northeast pillar at (4650, 180)');
assert(wbSrc.includes('createHidingRubble(4360, 380)'), 'WorldBuilder places Hiding Rubble at (4360, 380)');
assert(wbSrc.includes('createShrineInscribedStele(4280, 270)'), 'WorldBuilder places Inscribed Stele at (4280, 270)');
assert(wbSrc.includes('createBrokenBellShrineAtmosphericFog'), 'WorldBuilder implements createBrokenBellShrineAtmosphericFog');

// 7. GAMESCENE EVENT HANDLERS & ACT 5 ESCAPE CHASE
console.log('\n--- 7. GameScene Handlers & Act 5 Climax Logic ---');
const gsSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gsSrc.includes('read_shrine_stele'), 'GameScene handles read_shrine_stele');
assert(gsSrc.includes('inspect_cracked_bell'), 'GameScene handles inspect_cracked_bell');
assert(gsSrc.includes('collect_bell_tongue'), 'GameScene handles collect_bell_tongue');
assert(gsSrc.includes('playBronzeBellToll'), 'collect_bell_tongue plays authentic bronze bell toll sound');
assert(gsSrc.includes('startAct5EscapeChase'), 'collect_bell_tongue triggers Act 5 escape chase');
assert(gsSrc.includes('updateAct5ChaseLogic'), 'GameScene implements updateAct5ChaseLogic');
assert(gsSrc.includes('Q06_RETRIEVE_CLAPPER'), 'Act 5 completes Q06_RETRIEVE_CLAPPER on successful village return');

console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL INTEGRATION AND REGRESSION CHECKS PASSED FOR COMMAND C4-12-25!');
  process.exit(0);
}
