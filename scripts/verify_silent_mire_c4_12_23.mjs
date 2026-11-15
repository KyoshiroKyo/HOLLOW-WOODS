import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('  C4-12-23: SILENT MIRE FORBIDDEN REGION VERIFICATION');
console.log('================================================================\n');

// 1. Kiểm tra Pre-Backup
console.log('--- TEST GROUP 1: Pre-Backup Integrity ---');
const backupDir = path.resolve('Backups/C4-12-23_PRE_BACKUP');
assert(fs.existsSync(backupDir), 'Backup directory Backups/C4-12-23_PRE_BACKUP exists');
assert(fs.existsSync(path.join(backupDir, 'WorldBuilder.ts')), 'Backup of WorldBuilder.ts exists');
assert(fs.existsSync(path.join(backupDir, 'ZoneConnectionRegistry.ts')), 'Backup of ZoneConnectionRegistry.ts exists');
assert(fs.existsSync(path.join(backupDir, 'zones.json')), 'Backup of zones.json exists');
assert(fs.existsSync(path.join(backupDir, 'GameScene.ts')), 'Backup of GameScene.ts exists');
assert(fs.existsSync(path.join(backupDir, 'InventorySystem.ts')), 'Backup of InventorySystem.ts exists');
assert(fs.existsSync(path.join(backupDir, 'WorldGatingSystem.ts')), 'Backup of WorldGatingSystem.ts exists');

// 2. Kiểm tra Zone Connection Registry & Gating Conditions
console.log('\n--- TEST GROUP 2: Zone Connection Registry & Gating Conditions ---');
const registryContent = fs.readFileSync(path.resolve('src/world/ZoneConnectionRegistry.ts'), 'utf8');
assert(registryContent.includes("id: 'silent_mire'"), 'silent_mire node registered in registry');
assert(registryContent.includes("tier: 'LAYER_3_FORBIDDEN'"), 'silent_mire assigned to LAYER_3_FORBIDDEN');
assert(registryContent.includes("conn_crooked_path_to_silent_mire"), 'conn_crooked_path_to_silent_mire registered');
assert(registryContent.includes("conn_silent_mire_to_crooked_path"), 'conn_silent_mire_to_crooked_path registered');
assert(registryContent.includes("conn_deep_forest_to_silent_mire"), 'conn_deep_forest_to_silent_mire registered');
assert(registryContent.includes("conn_silent_mire_to_deep_forest"), 'conn_silent_mire_to_deep_forest registered');
assert(registryContent.includes("conn_silent_mire_to_shrine"), 'conn_silent_mire_to_shrine registered');

// Gating condition check
assert(registryContent.includes("gatingCondition: 'Q04_ANCIENT_RUNES:t1'"), 
  'conn_crooked_path_to_silent_mire gated by Q04_ANCIENT_RUNES:t1');
assert(registryContent.includes("gatingCondition: 'mire_puzzle_solved'"), 
  'conn_silent_mire_to_shrine gated by mire_puzzle_solved');

const gatingContent = fs.readFileSync(path.resolve('src/world/WorldGatingSystem.ts'), 'utf8');
assert(gatingContent.includes("zoneId: 'silent_mire'"), 'silent_mire access rule registered in WorldGatingSystem');
assert(gatingContent.includes("requiredQuestId: 'Q04_ANCIENT_RUNES'"), 'silent_mire requires Q04_ANCIENT_RUNES in WorldGatingSystem');

// 3. Kiểm tra zones.json (Silent Mire Configuration)
console.log('\n--- TEST GROUP 3: zones.json Silent Mire Configuration ---');
const zonesJson = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf8'));
const smZone = zonesJson.zones.find(z => z.id === 'silent_mire');
assert(!!smZone, 'Silent Mire zone exists in zones.json');
assert(smZone.status === 'active', 'Silent Mire zone status is active');
assert(smZone.bounds.x === 2880 && smZone.bounds.y === 100, 'Silent Mire bounds x=2880, y=100');
assert(smZone.bounds.width === 1120 && smZone.bounds.height === 640, 'Silent Mire bounds width=1120, height=640');
assert(smZone.atmosphere.titleVietnamese === 'ĐẦM LẦY TĨNH LẶNG', 'Silent Mire titleVietnamese is ĐẦM LẦY TĨNH LẶNG');

// Transitions in zones.json
const toCpTransition = smZone.transitions.find(t => t.id === 'to_crooked_path_from_sm');
assert(toCpTransition && toCpTransition.status === 'active' && toCpTransition.barrierType === 'open',
  'Transition to_crooked_path_from_sm is active and open');

const toDfTransition = smZone.transitions.find(t => t.id === 'to_deep_forest_from_sm');
assert(toDfTransition && toDfTransition.status === 'active' && toDfTransition.barrierType === 'open',
  'Transition to_deep_forest_from_sm is active and open');

const toShrineTransition = smZone.transitions.find(t => t.id === 'to_shrine');
assert(toShrineTransition && toShrineTransition.status === 'active' && toShrineTransition.barrierType === 'rune_ward',
  'Transition to_shrine is active with rune_ward barrier');

// Interactables in zones.json
assert(smZone.interactables.some(i => i.id === 'sm_entry_sign'), 'Interactable: sm_entry_sign present');
assert(smZone.interactables.some(i => i.id === 'sm_boardwalk_pier'), 'Interactable: sm_boardwalk_pier present');
assert(smZone.interactables.some(i => i.id === 'sm_sunken_ruins'), 'Interactable: sm_sunken_ruins present');
assert(smZone.interactables.some(i => i.id === 'sm_dead_titan_willow'), 'Interactable: sm_dead_titan_willow present');
assert(smZone.interactables.some(i => i.id === 'sm_shrine_gate_ward'), 'Interactable: sm_shrine_gate_ward present');
assert(smZone.interactables.some(i => i.id === 'sm_hiding_tree_1'), 'Interactable: sm_hiding_tree_1 present');
assert(smZone.interactables.some(i => i.id === 'sm_hide_bush_1'), 'Interactable: sm_hide_bush_1 present');
assert(smZone.interactables.some(i => i.id === 'sm_hide_bush_2'), 'Interactable: sm_hide_bush_2 present');
assert(smZone.interactables.some(i => i.id === 'rune_pillar_1'), 'Interactable: rune_pillar_1 (Moon) present');
assert(smZone.interactables.some(i => i.id === 'rune_pillar_2'), 'Interactable: rune_pillar_2 (Root) present');
assert(smZone.interactables.some(i => i.id === 'rune_pillar_3'), 'Interactable: rune_pillar_3 (Eye) present');

// 4. Kiểm tra WorldBuilder Terrain & Decorations
console.log('\n--- TEST GROUP 4: WorldBuilder Terrain & Atmospheric Decorations ---');
const wbContent = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf8');
assert(wbContent.includes("renderSilentMireTerrain"), 'Method renderSilentMireTerrain declared in WorldBuilder');
assert(wbContent.includes("silent_mire_ground_baked_v12"), 'Bakes silent_mire_ground_baked_v12 canvas texture');
assert(wbContent.includes("renderSilentMireDecorations"), 'Method renderSilentMireDecorations declared in WorldBuilder');
assert(wbContent.includes("createBoardwalkPier"), 'Method createBoardwalkPier implemented');
assert(wbContent.includes("createSunkenMonolithRuins"), 'Method createSunkenMonolithRuins implemented');
assert(wbContent.includes("createDeadTitanWillow"), 'Method createDeadTitanWillow implemented');
assert(wbContent.includes("createCattailsCluster"), 'Method createCattailsCluster implemented');
assert(wbContent.includes("createShrineGateWard"), 'Method createShrineGateWard implemented');
assert(wbContent.includes("createSilentMireAtmosphericFog"), 'Method createSilentMireAtmosphericFog implemented');

// Check 4 lantern posts
assert(wbContent.includes("createVillageLanternPost(2940, 290)"), 'Lantern 1: West entry placed at (2940, 290)');
assert(wbContent.includes("createVillageLanternPost(3120, 310)"), 'Lantern 2: Boardwalk pier placed at (3120, 310)');
assert(wbContent.includes("createVillageLanternPost(3520, 260)"), 'Lantern 3: Rune dais placed at (3520, 260)');
assert(wbContent.includes("createVillageLanternPost(3920, 290)"), 'Lantern 4: East gate to shrine placed at (3920, 290)');

// Check 3 pillars placement
assert(wbContent.includes("createRunestonePillar(3400, 220, 'Trăng Khuyết'"), 'Pillar Moon placed at (3400, 220)');
assert(wbContent.includes("createRunestonePillar(3520, 360, 'Rễ Rừng'"), 'Pillar Root placed at (3520, 360)');
assert(wbContent.includes("createRunestonePillar(3640, 220, 'Con Mắt'"), 'Pillar Eye placed at (3640, 220)');

// Check 4 water pools
assert(wbContent.includes("createMireWater(3200, 250, 180, 90)"), 'Central sinkhole placed at (3200, 250)');
assert(wbContent.includes("createMireWater(3020, 380, 220, 110)"), 'South-West pool placed at (3020, 380)');
assert(wbContent.includes("createMireWater(3180, 140, 200, 85)"), 'North pool placed at (3180, 140)');
assert(wbContent.includes("createMireWater(3600, 430, 240, 120)"), 'South-East lake placed at (3600, 430)');

// 5. Kiểm tra Puzzle Mechanics & Flag Synchronization
console.log('\n--- TEST GROUP 5: Puzzle Mechanics & Flag Synchronization ---');
const puzzleContent = fs.readFileSync(path.resolve('src/systems/PuzzleSystem.ts'), 'utf8');
assert(puzzleContent.includes("silent_mire_pillars"), 'Puzzle silent_mire_pillars referenced in PuzzleSystem');
assert(puzzleContent.includes("this.playerState.setFlag('mire_pillars_solved')"), 'Puzzle completion sets mire_pillars_solved');
assert(puzzleContent.includes("this.playerState.setFlag('mire_puzzle_solved')"), 'Puzzle completion sets mire_puzzle_solved');

// 6. Kiểm tra GameScene Action Handlers
console.log('\n--- TEST GROUP 6: GameScene Environmental Clues & Interactivity ---');
const gsContent = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gsContent.includes("read_sm_entry_sign"), 'GameScene handles read_sm_entry_sign');
assert(gsContent.includes("inspect_sm_boardwalk_pier"), 'GameScene handles inspect_sm_boardwalk_pier');
assert(gsContent.includes("inspect_sm_sunken_ruins"), 'GameScene handles inspect_sm_sunken_ruins');
assert(gsContent.includes("inspect_sm_dead_willow"), 'GameScene handles inspect_sm_dead_willow');
assert(gsContent.includes("inspect_sm_shrine_gate_ward"), 'GameScene handles inspect_sm_shrine_gate_ward');
assert(gsContent.includes("handlePillarInteraction"), 'GameScene has handlePillarInteraction');

// 7. Kiểm tra Resource Nodes trong Silent Mire
console.log('\n--- TEST GROUP 7: Resource Nodes in Silent Mire ---');
const invContent = fs.readFileSync(path.resolve('src/systems/InventorySystem.ts'), 'utf8');
assert(invContent.includes("node_herb_4"), 'Resource node: node_herb_4 present');
assert(invContent.includes("node_wood_sm_1"), 'Resource node: node_wood_sm_1 present');
assert(invContent.includes("node_herb_5"), 'Resource node: node_herb_5 present');
assert(invContent.includes("node_resin_3"), 'Resource node: node_resin_3 present');
assert(invContent.includes("node_flint_sm_1"), 'Resource node: node_flint_sm_1 present');

// 8. Kiểm tra Va Chạm & Lối Đi Thông Thoáng
console.log('\n--- TEST GROUP 8: Walkway Clearance & Collider Sanity ---');
const smResourceNodes = [
  { id: 'node_herb_4', x: 3050, y: 280 },
  { id: 'node_wood_sm_1', x: 3180, y: 310 },
  { id: 'node_herb_5', x: 3350, y: 380 },
  { id: 'node_resin_3', x: 3700, y: 180 },
  { id: 'node_flint_sm_1', x: 3780, y: 320 }
];

let nodeCollisions = 0;
for (const node of smResourceNodes) {
  for (const c of smZone.colliders) {
    if (node.x >= c.x && node.x <= c.x + c.width && node.y >= c.y && node.y <= c.y + c.height) {
      console.warn(`    Overlap detected: ${node.id} (${node.x}, ${node.y}) with ${c.id}`);
      nodeCollisions++;
    }
  }
}
assert(nodeCollisions === 0, 'All 5 Silent Mire resource nodes have 0 collider overlap and are freely harvestable');

// Check entry portal clearance (West portal x=2880, y=260..400)
const westColliders = smZone.colliders.filter(c => c.id.startsWith('sm_bound_left'));
assert(westColliders.length === 2, 'West boundary has 2 separate segments creating a portal opening');
const leftTop = westColliders.find(c => c.id === 'sm_bound_left_top');
const leftBottom = westColliders.find(c => c.id === 'sm_bound_left_bottom');
assert(leftTop && leftTop.y + leftTop.height <= 260, 'Left top bound ends at y <= 260');
assert(leftBottom && leftBottom.y >= 400, 'Left bottom bound starts at y >= 400');

// Check exit portal clearance (East portal x=3970..4000, y=240..400)
const eastColliders = smZone.colliders.filter(c => c.id.startsWith('sm_bound_right'));
assert(eastColliders.length === 2, 'East boundary has 2 separate segments creating a portal opening to Shrine');
const rightTop = eastColliders.find(c => c.id === 'sm_bound_right_top');
const rightBottom = eastColliders.find(c => c.id === 'sm_bound_right_bottom');
assert(rightTop && rightTop.y + rightTop.height <= 240, 'Right top bound ends at y <= 240');
assert(rightBottom && rightBottom.y >= 400, 'Right bottom bound starts at y >= 400');

console.log('\n================================================================');
console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed === 0) {
  console.log('  ALL C4-12-23 SILENT MIRE CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
} else {
  console.error(`  ${failed} CHECKS FAILED!`);
  process.exit(1);
}
