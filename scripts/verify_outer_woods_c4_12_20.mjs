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
console.log('  C4-12-20: OUTER WOODS ENVIRONMENT & PROGRESSION VERIFICATION');
console.log('================================================================\n');

// 1. Kiểm tra Pre-Backup
console.log('--- TEST GROUP 1: Pre-Backup Integrity ---');
const backupDir = path.resolve('Backups/C4-12-20_PRE_BACKUP');
assert(fs.existsSync(backupDir), 'Backup directory Backups/C4-12-20_PRE_BACKUP exists');
assert(fs.existsSync(path.join(backupDir, 'WorldBuilder.ts')), 'Backup of WorldBuilder.ts exists');
assert(fs.existsSync(path.join(backupDir, 'ZoneConnectionRegistry.ts')), 'Backup of ZoneConnectionRegistry.ts exists');
assert(fs.existsSync(path.join(backupDir, 'zones.json')), 'Backup of zones.json exists');
assert(fs.existsSync(path.join(backupDir, 'InventorySystem.ts')), 'Backup of InventorySystem.ts exists');
assert(fs.existsSync(path.join(backupDir, 'GameScene.ts')), 'Backup of GameScene.ts exists');

// 2. Kiểm tra ZoneConnectionRegistry.ts & Điểm nối Bellhollow
console.log('\n--- TEST GROUP 2: Zone Connection Registry & Transition Alignment ---');
const registryContent = fs.readFileSync(path.resolve('src/world/ZoneConnectionRegistry.ts'), 'utf8');
assert(registryContent.includes("id: 'conn_bellhollow_to_outer_woods'"), 'conn_bellhollow_to_outer_woods registered in registry');
assert(registryContent.includes("entryPoint: { x: 1210, y: 580, direction: 'down' }"), 'Bellhollow -> Outer Woods spawns at (1210, 580) facing down');
assert(registryContent.includes("returnPoint: { x: 1210, y: 510, direction: 'up' }"), 'Outer Woods -> Bellhollow return point at (1210, 510) facing up');
assert(registryContent.includes("id: 'conn_outer_woods_to_bellhollow'"), 'conn_outer_woods_to_bellhollow registered in registry');
assert(registryContent.includes("id: 'conn_farm_to_outer_woods'"), 'conn_farm_to_outer_woods registered in registry');
assert(registryContent.includes("id: 'conn_outer_woods_to_farm'"), 'conn_outer_woods_to_farm registered in registry');

const playerScript = fs.readFileSync(path.resolve('src/entities/SatyrPlayer.ts'), 'utf8');
assert(playerScript.includes('public setFacing(direction: FacingDirection): void'), 'SatyrPlayer has setFacing method to enforce spawn facing');

// 3. Kiểm tra Địa hình & 4 Khoảng Rừng Thưa (WorldBuilder.ts)
console.log('\n--- TEST GROUP 3: Outer Woods Terrain & 4 Forest Clearings ---');
const wbContent = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf8');
assert(wbContent.includes('outer_woods_ground_baked_v12'), 'Bakes outer_woods_ground_baked_v12 canvas texture');
assert(wbContent.includes('Bãi Cửa Rừng phía Bắc') || wbContent.includes('North Entrance Clearing'), 'North Entrance Clearing (wx 1210, wy 620) baked into terrain');
assert(wbContent.includes('Hunter\'s Camp Clearing') || wbContent.includes('Bãi Đất Trại Thợ Săn'), 'Hunter\'s Camp Clearing (wx 1330, wy 730) baked into terrain');
assert(wbContent.includes('East Brook Clearing') || wbContent.includes('Bãi Suối Rừng Phía Đông'), 'East Brook Clearing (wx 1460, wy 810) baked into terrain');
assert(wbContent.includes('South Willow Clearing') || wbContent.includes('Bãi Liễu Cổ Thụ Bí Ẩn'), 'South Willow Clearing (wx 1260, wy 920) baked into terrain');

// Tuyến đường chính & lối rẽ phụ
assert(wbContent.includes('{ x: 1210, y: 560, r: 20 }') && wbContent.includes('{ x: 1270, y: 740, r: 22 }'), 'Main trail leads from North Gate (1210, 560) to Camp Fork (1270, 740)');
assert(wbContent.includes('{ x: 1330, y: 730, r: 24 }') && wbContent.includes('{ x: 1460, y: 810, r: 19 }'), 'Main trail continues from Camp to East Brook (1460, 810)');
assert(wbContent.includes('{ x: 1270, y: 740, r: 21 }') && wbContent.includes('{ x: 1260, y: 910, r: 22 }'), 'Sub-trail branches south down to South Willow Clearing (1260, 920)');
assert(wbContent.includes('{ x: 1555, y: 780, r: 16 }'), 'Sub-trail branches east towards Crooked Path frontier');
assert(wbContent.includes('Stepping Stones') || wbContent.includes('Đá bước qua suối'), 'River stepping stones baked across the east brook');

// 4. Kiểm tra Đạo cụ cảnh quan & Nghệ thuật Dark Woodland
console.log('\n--- TEST GROUP 4: Storytelling Props & Woodland Art ---');
assert(wbContent.includes('createHunterLeanToShelter'), 'Method createHunterLeanToShelter implemented');
assert(wbContent.includes('createHunterPeltRack'), 'Method createHunterPeltRack implemented');
assert(wbContent.includes('createFallenLog'), 'Method createFallenLog implemented');
assert(wbContent.includes('createOuterWoodsBoundaryFog'), 'Method createOuterWoodsBoundaryFog implemented');

assert(wbContent.includes('this.createHunterCampfire(1320, 720)'), 'Hunter Campfire placed at (1320, 720)');
assert(wbContent.includes('this.createHunterLeanToShelter(1350, 690)'), 'Hunter Lean-To Shelter placed at (1350, 690)');
assert(wbContent.includes('this.createHunterPeltRack(1285, 730)'), 'Pelt drying rack placed at (1285, 730)');
assert(wbContent.includes('this.createFallenLog(1190, 670'), 'Fallen log placed near North Clearing (1190, 670)');
assert(wbContent.includes('this.createFallenLog(1475, 795'), 'Fallen log placed along East Brook (1475, 795)');
assert(wbContent.includes('this.createFallenLog(1220, 955'), 'Ancient fallen log placed in South Willow Clearing (1220, 955)');
assert(wbContent.includes('this.createTree(1260, 890, \'Cây Liễu Đại Ngàn Phía Nam\')'), 'Ancient willow tree placed at (1260, 890)');
assert(wbContent.includes('this.createOuterWoodsBoundaryFog()'), 'Boundary fog dispatched in renderOuterWoodsDecorations');

// 5. Kiểm tra Điểm thu thập tài nguyên đầu game (InventorySystem.ts)
console.log('\n--- TEST GROUP 5: Early-Game Resource Nodes in Outer Woods ---');
const invContent = fs.readFileSync(path.resolve('src/systems/InventorySystem.ts'), 'utf8');
assert(invContent.includes('node_wood_ow_1'), 'Resource node: node_wood_ow_1 (res_dry_wood) present');
assert(invContent.includes('node_wood_ow_2'), 'Resource node: node_wood_ow_2 (res_dry_wood) present');
assert(invContent.includes('node_wood_ow_3'), 'Resource node: node_wood_ow_3 (res_dry_wood) present');
assert(invContent.includes('node_flint_ow_1'), 'Resource node: node_flint_ow_1 (res_flint) present');
assert(invContent.includes('node_flint_ow_2'), 'Resource node: node_flint_ow_2 (res_flint) present');
assert(invContent.includes('node_resin_ow_1'), 'Resource node: node_resin_ow_1 (res_tree_resin) present');
assert(invContent.includes('node_resin_ow_2'), 'Resource node: node_resin_ow_2 (res_tree_resin) present');
assert(invContent.includes('node_herb_ow_1'), 'Resource node: node_herb_ow_1 (res_herbs) present');
assert(invContent.includes('node_herb_ow_2'), 'Resource node: node_herb_ow_2 (res_herbs) present');

// 6. Kiểm tra Đối tượng tương tác trong zones.json & GameScene.ts
console.log('\n--- TEST GROUP 6: Interactables & GameScene Handling ---');
const zonesJson = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf8'));
const owZone = zonesJson.zones.find(z => z.id === 'outer_woods');
assert(!!owZone, 'Outer Woods zone exists in zones.json');

const owInteractableIds = (owZone.interactables || []).map(i => i.id);
assert(owInteractableIds.includes('ow_signpost'), 'Interactable: ow_signpost present');
assert(owInteractableIds.includes('ow_hunter_camp'), 'Interactable: ow_hunter_camp present');
assert(owInteractableIds.includes('ow_fallen_tree'), 'Interactable: ow_fallen_tree present');
assert(owInteractableIds.includes('ow_ancient_willow'), 'Interactable: ow_ancient_willow present');

const gsContent = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gsContent.includes('read_ow_sign'), 'GameScene handles read_ow_sign');
assert(gsContent.includes('inspect_ow_campfire'), 'GameScene handles inspect_ow_campfire');
assert(gsContent.includes('inspect_ow_fallen_tree'), 'GameScene handles inspect_ow_fallen_tree');
assert(gsContent.includes('inspect_ow_willow'), 'GameScene handles inspect_ow_willow');
assert(gsContent.includes('Tàn tro than đã nguội lạnh'), 'Campfire inspection feedback text present');
assert(gsContent.includes('Một cây sồi đại ngàn bị quật ngã'), 'Fallen tree inspection feedback text present');
assert(gsContent.includes('Cây Liễu Cổ Thụ: Tán lá rủ dài'), 'Ancient willow inspection feedback text present');

// 7. Kiểm tra Không Gian Đi Lại & Không Bị Kẹt Va Chạm
console.log('\n--- TEST GROUP 7: Walkway Clearance & Zero Node Overlaps ---');
const owColliders = owZone.colliders || [];
const owNodes = [
  { id: 'node_wood_ow_1', x: 1190, y: 650 },
  { id: 'node_resin_ow_1', x: 1360, y: 620 },
  { id: 'node_flint_ow_1', x: 1300, y: 755 },
  { id: 'node_wood_ow_2', x: 1380, y: 720 },
  { id: 'node_herb_ow_1', x: 1440, y: 770 },
  { id: 'node_flint_ow_2', x: 1485, y: 830 },
  { id: 'node_wood_ow_3', x: 1230, y: 940 },
  { id: 'node_resin_ow_2', x: 1320, y: 910 },
  { id: 'node_herb_ow_2', x: 1280, y: 950 }
];

let nodeOverlapFound = false;
for (const n of owNodes) {
  for (const c of owColliders) {
    if (n.x >= c.x && n.x <= c.x + c.w && n.y >= c.y && n.y <= c.y + c.h) {
      nodeOverlapFound = true;
      console.error(`Collider ${c.id} directly overlaps resource node ${n.id} at (${n.x}, ${n.y})!`);
    }
  }
}
assert(!nodeOverlapFound, 'All 9 Outer Woods resource nodes have 0 collider overlap and are freely harvestable');

// Lối vào phía Bắc (nối Bellhollow): x: 1150..1270, y: 560
assert(owColliders.every(c => !(c.x < 1270 && c.x + c.w > 1150 && c.y <= 580 && c.y + c.h >= 560)),
  'North entrance from Bellhollow (1150..1270, 560) is wide open without blocking colliders');

// Lối vào phía Tây (nối Sanctuary Farm): x: 1120, y: 680..820
assert(owColliders.every(c => !(c.x <= 1120 && c.x + c.w >= 1120 && c.y < 820 && c.y + c.h > 680)),
  'West entrance from Sanctuary Farm (1120, 680..820) is wide open without blocking colliders');

console.log('\n================================================================');
console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  ALL C4-12-20 CHECKS PASSED PERFECTLY!\n');
}
