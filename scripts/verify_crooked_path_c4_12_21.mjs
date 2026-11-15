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
console.log('  C4-12-21: THE CROOKED PATH ENVIRONMENT & PROGRESSION TEST');
console.log('================================================================\n');

// 1. Kiểm tra Pre-Backup
console.log('--- TEST GROUP 1: Pre-Backup Integrity ---');
const backupDir = path.resolve('Backups/C4-12-21_PRE_BACKUP');
assert(fs.existsSync(backupDir), 'Backup directory Backups/C4-12-21_PRE_BACKUP exists');
assert(fs.existsSync(path.join(backupDir, 'WorldBuilder.ts')), 'Backup of WorldBuilder.ts exists');
assert(fs.existsSync(path.join(backupDir, 'ZoneConnectionRegistry.ts')), 'Backup of ZoneConnectionRegistry.ts exists');
assert(fs.existsSync(path.join(backupDir, 'zones.json')), 'Backup of zones.json exists');
assert(fs.existsSync(path.join(backupDir, 'InventorySystem.ts')), 'Backup of InventorySystem.ts exists');
assert(fs.existsSync(path.join(backupDir, 'GameScene.ts')), 'Backup of GameScene.ts exists');

// 2. Kiểm tra ZoneConnectionRegistry.ts & Liên thông hai chiều với Outer Woods
console.log('\n--- TEST GROUP 2: Zone Connection Registry & Active Two-Way Outer Woods Link ---');
const registryContent = fs.readFileSync(path.resolve('src/world/ZoneConnectionRegistry.ts'), 'utf8');
assert(registryContent.includes("id: 'conn_outer_woods_to_crooked_path'"), 'conn_outer_woods_to_crooked_path registered in registry');
assert(registryContent.includes("id: 'conn_crooked_path_to_outer_woods'"), 'conn_crooked_path_to_outer_woods registered in registry');

// Kiểm tra trạng thái active và barrierType open
const owToCpActive = registryContent.includes("id: 'conn_outer_woods_to_crooked_path',\n        fromZone: 'outer_woods',\n        toZone: 'crooked_path',\n        status: 'active',\n        barrierType: 'open'");
assert(owToCpActive || (registryContent.includes("id: 'conn_outer_woods_to_crooked_path'") && registryContent.includes("status: 'active'")), 
  'conn_outer_woods_to_crooked_path is ACTIVE with barrierType open');

const cpToOwActive = registryContent.includes("id: 'conn_crooked_path_to_outer_woods',\n        fromZone: 'crooked_path',\n        toZone: 'outer_woods',\n        status: 'active',\n        barrierType: 'open'");
assert(cpToOwActive || (registryContent.includes("id: 'conn_crooked_path_to_outer_woods'") && registryContent.includes("status: 'active'")), 
  'conn_crooked_path_to_outer_woods is ACTIVE with barrierType open');

assert(registryContent.includes("id: 'conn_bellhollow_to_crooked_path'"), 'Bellhollow East Gate connection registered');
assert(registryContent.includes("id: 'conn_crooked_path_to_deep_forest'"), 'Deep Forest connection registered with pending status');
assert(registryContent.includes("id: 'conn_crooked_path_to_silent_mire'"), 'Silent Mire connection registered');

// 3. Kiểm tra zones.json (Transitions & Interactables)
console.log('\n--- TEST GROUP 3: zones.json Crooked Path Configuration ---');
const zonesJson = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf8'));
const cpZone = zonesJson.zones.find(z => z.id === 'crooked_path');
assert(!!cpZone, 'The Crooked Path zone exists in zones.json');
assert(cpZone.bounds.x === 1600 && cpZone.bounds.y === 0, 'Crooked Path bounds x=1600, y=0');
assert(cpZone.bounds.width === 1280 && cpZone.bounds.height === 640, 'Crooked Path bounds width=1280, height=640');

const owTransition = cpZone.transitions.find(t => t.id === 'to_outer_woods_from_cp');
assert(!!owTransition, 'Transition to_outer_woods_from_cp exists in crooked_path');
assert(owTransition.status === 'active', 'to_outer_woods_from_cp is active');
assert(owTransition.barrierType === 'open', 'to_outer_woods_from_cp has open barrier');

const owZone = zonesJson.zones.find(z => z.id === 'outer_woods');
const cpTransition = owZone.transitions.find(t => t.id === 'to_crooked_path_from_ow');
assert(!!cpTransition, 'Transition to_crooked_path_from_ow exists in outer_woods');
assert(cpTransition.status === 'active', 'to_crooked_path_from_ow is active');
assert(cpTransition.barrierType === 'open', 'to_crooked_path_from_ow has open barrier');

const cpInteractableIds = (cpZone.interactables || []).map(i => i.id);
assert(cpInteractableIds.includes('cp_frontier_sign'), 'Interactable: cp_frontier_sign present');
assert(cpInteractableIds.includes('cp_ancient_sentinel_rock'), 'Interactable: cp_ancient_sentinel_rock present');
assert(cpInteractableIds.includes('cp_hunter_cache'), 'Interactable: cp_hunter_cache present');
assert(cpInteractableIds.includes('crooked_path_deep_forest_sign'), 'Interactable: crooked_path_deep_forest_sign present');
assert(cpInteractableIds.includes('hide_bush_1'), 'Interactable: hide_bush_1 present');
assert(cpInteractableIds.includes('hide_bush_2'), 'Interactable: hide_bush_2 present');
assert(cpInteractableIds.includes('hide_bush_3'), 'Interactable: hide_bush_3 present');
assert(cpInteractableIds.includes('hide_tree_1'), 'Interactable: hide_tree_1 present');
assert(cpInteractableIds.includes('hide_tree_2'), 'Interactable: hide_tree_2 present');

// 4. Kiểm tra Địa hình & Tuyến đường mòn (WorldBuilder.ts)
console.log('\n--- TEST GROUP 4: WorldBuilder Crooked Path Terrain & Trails ---');
const wbContent = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf8');
assert(wbContent.includes('crooked_path_ground_baked_v12'), 'Bakes crooked_path_ground_baked_v12 canvas texture');
assert(wbContent.includes('drawClearing(1680, 320, 36, 24)'), 'Frontier Junction clearing baked at (1680, 320)');
assert(wbContent.includes('drawClearing(2650, 260, 30, 20)'), 'Lost hunter cache clearing baked at (2650, 260)');
assert(wbContent.includes('drawClearing(2100, 280, 48, 32)'), 'Sentinel Rock clearing baked at (2100, 280)');
assert(wbContent.includes('{ x: 1610, y: 500, r: 22 }'), 'Outer Woods connector trail baked down to (1610, 500)');
assert(wbContent.includes('{ x: 1600, y: 282, r: 22 }') && wbContent.includes('{ x: 2880, y: 300, r: 20 }'), 'Main trail spans seamlessly from East Gate (1600, 282) to Mire (2880, 300)');

// 5. Kiểm tra Đạo cụ cảnh quan & Nghệ thuật Rừng Biên Giới (WorldBuilder.ts)
console.log('\n--- TEST GROUP 5: Frontier Woodland Art & Environmental Storytelling ---');
assert(wbContent.includes('renderCrookedPathDecorations'), 'Method renderCrookedPathDecorations implemented');
assert(wbContent.includes('createStoneMarker'), 'Method createStoneMarker implemented');
assert(wbContent.includes('createTangledRoots'), 'Method createTangledRoots implemented');
assert(wbContent.includes('createHunterLostCache'), 'Method createHunterLostCache implemented');
assert(wbContent.includes('createCrookedPathAtmosphericFog'), 'Method createCrookedPathAtmosphericFog implemented');

assert(wbContent.includes('this.createStoneSign(1660, 320, \'LỐI MÒN QUANH CO\')'), 'Frontier signpost placed at (1660, 320)');
assert(wbContent.includes('this.createStoneSign(2100, 45, \'NGUY HIỂM: RỪNG SÂU\')'), 'Deep forest warning sign placed at (2100, 45)');
assert(wbContent.includes('this.createStoneMarker(2760, 240)'), 'North stone marker placed at Mire threshold (2760, 240)');
assert(wbContent.includes('this.createStoneMarker(2760, 360)'), 'South stone marker placed at Mire threshold (2760, 360)');

// Kiểm tra 6 cột đèn lồng dẫn hướng
assert(wbContent.includes('this.createVillageLanternPost(1680, 310)'), 'Lantern post 1 placed at Frontier Junction (1680, 310)');
assert(wbContent.includes('this.createVillageLanternPost(1860, 250)'), 'Lantern post 2 placed at Hollow Tree Clearing (1860, 250)');
assert(wbContent.includes('this.createVillageLanternPost(2030, 230)'), 'Lantern post 3 placed at Deep Forest Fork (2030, 230)');
assert(wbContent.includes('this.createVillageLanternPost(2170, 260)'), 'Lantern post 4 placed at Sentinel Rock (2170, 260)');
assert(wbContent.includes('this.createVillageLanternPost(2330, 360)'), 'Lantern post 5 placed at Twisted Roots Hollow (2330, 360)');
assert(wbContent.includes('this.createVillageLanternPost(2680, 310)'), 'Lantern post 6 placed at Mire Threshold (2680, 310)');

// Kiểm tra thân cây đổ & rễ cây xoắn
assert(wbContent.includes('this.createFallenLog(1740, 350'), 'Fallen log placed at (1740, 350)');
assert(wbContent.includes('this.createFallenLog(2280, 380'), 'Fallen log placed at (2280, 380)');
assert(wbContent.includes('this.createFallenLog(2580, 260'), 'Fallen log placed at (2580, 260)');
assert(wbContent.includes('this.createTangledRoots(1980, 210)'), 'Tangled roots placed at (1980, 210)');
assert(wbContent.includes('this.createTangledRoots(2420, 330)'), 'Tangled roots placed at (2420, 330)');

// Kiểm tra khối đá canh gác & bọc hành trang
assert(wbContent.includes('this.createRock(2100, 280, 58, 36)'), 'Great Sentinel Rock placed at (2100, 280)');
assert(wbContent.includes('this.createHunterLostCache(2650, 260)'), 'Hunter lost cache placed at (2650, 260)');
assert(wbContent.includes('this.createCrookedPathAtmosphericFog()'), 'Atmospheric fog dispatched in decorations');

// 6. Kiểm tra Tài nguyên thu thập (InventorySystem.ts)
console.log('\n--- TEST GROUP 6: Resource Nodes in The Crooked Path ---');
const invContent = fs.readFileSync(path.resolve('src/systems/InventorySystem.ts'), 'utf8');
assert(invContent.includes('node_wood_cp_1'), 'Resource node: node_wood_cp_1 (res_dry_wood) present');
assert(invContent.includes('node_resin_2'), 'Resource node: node_resin_2 (res_tree_resin) present');
assert(invContent.includes('node_wood_4'), 'Resource node: node_wood_4 (res_dry_wood) present');
assert(invContent.includes('node_flint_2'), 'Resource node: node_flint_2 (res_flint) present');
assert(invContent.includes('node_flint_cp_1'), 'Resource node: node_flint_cp_1 (res_flint) present');
assert(invContent.includes('node_herb_3'), 'Resource node: node_herb_3 (res_herbs) present');
assert(invContent.includes('node_herb_cp_2'), 'Resource node: node_herb_cp_2 (res_herbs) present');

// 7. Kiểm tra Tương tác & Phản hồi trong GameScene.ts
console.log('\n--- TEST GROUP 7: GameScene Storytelling & Interaction Handlers ---');
const gsContent = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gsContent.includes('read_cp_frontier_sign'), 'GameScene handles read_cp_frontier_sign');
assert(gsContent.includes('inspect_cp_sentinel_rock'), 'GameScene handles inspect_cp_sentinel_rock');
assert(gsContent.includes('inspect_cp_hunter_cache'), 'GameScene handles inspect_cp_hunter_cache');
assert(gsContent.includes('Cột Mốc Tiền Tuyến: "LỐI MÒN QUANH CO'), 'Frontier sign feedback text present');
assert(gsContent.includes('Vết cào móng vuốt sâu hoắm của Kẻ Lắng Nghe'), 'Sentinel rock feedback text present');
assert(gsContent.includes('Bọc da của một thợ rừng đã rách nát'), 'Hunter cache feedback text present');

// 8. Kiểm tra Không gian Di chuyển & Không Kẹt Va Chạm
console.log('\n--- TEST GROUP 8: Walkway Clearance & Zero Node Overlaps ---');
const cpColliders = cpZone.colliders || [];
const cpNodes = [
  { id: 'node_wood_cp_1', x: 1690, y: 430 },
  { id: 'node_resin_2', x: 1780, y: 190 },
  { id: 'node_wood_4', x: 2050, y: 360 },
  { id: 'node_flint_2', x: 2220, y: 210 },
  { id: 'node_flint_cp_1', x: 2140, y: 320 },
  { id: 'node_herb_3', x: 2450, y: 260 },
  { id: 'node_herb_cp_2', x: 2700, y: 340 }
];

let nodeOverlapFound = false;
for (const n of cpNodes) {
  for (const c of cpColliders) {
    if (n.x >= c.x && n.x <= c.x + c.w && n.y >= c.y && n.y <= c.y + c.h) {
      nodeOverlapFound = true;
      console.error(`Collider ${c.id} directly overlaps resource node ${n.id} at (${n.x}, ${n.y})!`);
    }
  }
}
assert(!nodeOverlapFound, 'All 7 Crooked Path resource nodes have 0 collider overlap and are freely harvestable');

// Lối vào phía Tây từ Bellhollow: x: 1600, y: 220..360
assert(cpColliders.every(c => !(c.x <= 1600 && c.x + c.w > 1600 && c.y < 360 && c.y + c.h > 220)),
  'West entrance from Bellhollow (1600, 220..360) is open without blocking colliders');

// Lối rẽ sang Outer Woods: x: 1600..1640, y: 440..560
assert(cpColliders.every(c => !(c.x <= 1640 && c.x + c.w >= 1600 && c.y < 560 && c.y + c.h > 440)),
  'Outer Woods connection corridor (1600..1640, 440..560) is open without blocking colliders');

console.log('\n================================================================');
console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  ALL C4-12-21 CHECKS PASSED PERFECTLY!\n');
}
