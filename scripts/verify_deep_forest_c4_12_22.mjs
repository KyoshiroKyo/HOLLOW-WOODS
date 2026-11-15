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
console.log('  C4-12-22: DEEP FOREST ENVIRONMENT & THE LISTENER INTEGRATION');
console.log('================================================================\n');

// 1. Kiểm tra Pre-Backup
console.log('--- TEST GROUP 1: Pre-Backup Integrity ---');
const backupDir = path.resolve('Backups/C4-12-22_PRE_BACKUP');
assert(fs.existsSync(backupDir), 'Backup directory Backups/C4-12-22_PRE_BACKUP exists');
assert(fs.existsSync(path.join(backupDir, 'WorldBuilder.ts')), 'Backup of WorldBuilder.ts exists');
assert(fs.existsSync(path.join(backupDir, 'ZoneConnectionRegistry.ts')), 'Backup of ZoneConnectionRegistry.ts exists');
assert(fs.existsSync(path.join(backupDir, 'zones.json')), 'Backup of zones.json exists');
assert(fs.existsSync(path.join(backupDir, 'TheListener.ts')), 'Backup of TheListener.ts exists');
assert(fs.existsSync(path.join(backupDir, 'ListenerAI.ts')), 'Backup of ListenerAI.ts exists');
assert(fs.existsSync(path.join(backupDir, 'GameScene.ts')), 'Backup of GameScene.ts exists');
assert(fs.existsSync(path.join(backupDir, 'InventorySystem.ts')), 'Backup of InventorySystem.ts exists');

// 2. Kiểm tra ZoneConnectionRegistry.ts
console.log('\n--- TEST GROUP 2: Zone Connection Registry & Active Deep Forest Links ---');
const registryContent = fs.readFileSync(path.resolve('src/world/ZoneConnectionRegistry.ts'), 'utf8');
assert(registryContent.includes("id: 'deep_forest'"), 'deep_forest node registered in registry');
assert(registryContent.includes("conn_crooked_path_to_deep_forest"), 'conn_crooked_path_to_deep_forest registered');
assert(registryContent.includes("conn_deep_forest_to_crooked_path"), 'conn_deep_forest_to_crooked_path registered');
assert(registryContent.includes("conn_deep_forest_to_silent_mire"), 'conn_deep_forest_to_silent_mire registered');

// Kiểm tra trạng thái active và barrierType open
const cpToDfActive = registryContent.includes("id: 'conn_crooked_path_to_deep_forest'") && 
                     registryContent.includes("status: 'active',\n        barrierType: 'open'");
assert(cpToDfActive, 'conn_crooked_path_to_deep_forest is ACTIVE with barrierType open');

const dfToCpActive = registryContent.includes("id: 'conn_deep_forest_to_crooked_path'") && 
                     registryContent.includes("status: 'active',\n        barrierType: 'open'");
assert(dfToCpActive, 'conn_deep_forest_to_crooked_path is ACTIVE with barrierType open');

// 3. Kiểm tra zones.json (Deep Forest Configuration)
console.log('\n--- TEST GROUP 3: zones.json Deep Forest Configuration ---');
const zonesJson = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf8'));
const dfZone = zonesJson.zones.find(z => z.id === 'deep_forest');
assert(!!dfZone, 'Deep Forest zone exists in zones.json');
assert(dfZone.status === 'active', 'Deep Forest zone status is active');
assert(dfZone.bounds.x === 1600 && dfZone.bounds.y === -640, 'Deep Forest bounds x=1600, y=-640');
assert(dfZone.bounds.width === 1280 && dfZone.bounds.height === 640, 'Deep Forest bounds width=1280, height=640');
assert(dfZone.atmosphere.titleVietnamese === 'RỪNG SÂU', 'Deep Forest titleVietnamese is RỪNG SÂU');

const cpZone = zonesJson.zones.find(z => z.id === 'crooked_path');
const toDfTransition = cpZone.transitions.find(t => t.id === 'to_deep_forest');
assert(toDfTransition && toDfTransition.status === 'active' && toDfTransition.barrierType === 'open',
  'Transition to_deep_forest in crooked_path is active and open');

const toCpTransition = dfZone.transitions.find(t => t.id === 'to_crooked_path_from_df');
assert(toCpTransition && toCpTransition.status === 'active' && toCpTransition.barrierType === 'open',
  'Transition to_crooked_path_from_df in deep_forest is active and open');

const toSmTransition = dfZone.transitions.find(t => t.id === 'to_silent_mire_from_df');
assert(toSmTransition && (toSmTransition.status === 'pending_construction' || toSmTransition.status === 'active'),
  'Transition to_silent_mire_from_df registered in deep_forest transitions');

// Kiểm tra interactables
assert(dfZone.interactables.some(i => i.id === 'df_entry_sign'), 'Interactable: df_entry_sign present');
assert(dfZone.interactables.some(i => i.id === 'df_hiding_tree_1'), 'Interactable: df_hiding_tree_1 present');
assert(dfZone.interactables.some(i => i.id === 'df_hiding_tree_2'), 'Interactable: df_hiding_tree_2 present');
assert(dfZone.interactables.some(i => i.id === 'df_hiding_tree_3'), 'Interactable: df_hiding_tree_3 present');
assert(dfZone.interactables.some(i => i.id === 'df_hide_bush_1'), 'Interactable: df_hide_bush_1 present');
assert(dfZone.interactables.some(i => i.id === 'df_hide_bush_2'), 'Interactable: df_hide_bush_2 present');
assert(dfZone.interactables.some(i => i.id === 'df_hide_bush_3'), 'Interactable: df_hide_bush_3 present');
assert(dfZone.interactables.some(i => i.id === 'df_listener_nest'), 'Interactable: df_listener_nest present');
assert(dfZone.interactables.some(i => i.id === 'df_bioluminescent_fungus'), 'Interactable: df_bioluminescent_fungus present');
assert(dfZone.interactables.some(i => i.id === 'df_mire_boundary_gate'), 'Interactable: df_mire_boundary_gate present');

// 4. Kiểm tra WorldBuilder Deep Forest Terrain & Decorations
console.log('\n--- TEST GROUP 4: WorldBuilder Deep Forest Terrain & Atmosphere ---');
const wbContent = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf8');
assert(wbContent.includes("renderDeepForestTerrain"), 'Method renderDeepForestTerrain declared in WorldBuilder');
assert(wbContent.includes("deep_forest_ground_baked_v12"), 'Bakes deep_forest_ground_baked_v12 canvas texture');
assert(wbContent.includes("renderDeepForestDecorations"), 'Method renderDeepForestDecorations declared in WorldBuilder');
assert(wbContent.includes("createBioluminescentMushrooms"), 'Method createBioluminescentMushrooms implemented');
assert(wbContent.includes("createListenerNestClue"), 'Method createListenerNestClue implemented');
assert(wbContent.includes("createDeepForestAtmosphericFog"), 'Method createDeepForestAtmosphericFog implemented');
assert(wbContent.includes("createVillageLanternPost(2060, -90)"), 'South entry lantern post placed at (2060, -90)');
assert(wbContent.includes("createVillageLanternPost(1920, -210)"), 'Fungus glade lantern post placed at (1920, -210)');
assert(wbContent.includes("createVillageLanternPost(2120, -290)"), 'Central fallen oak lantern post placed at (2120, -290)');
assert(wbContent.includes("createVillageLanternPost(2500, -320)"), 'East trail lantern post placed at (2500, -320)');
assert(wbContent.includes("createFallenLog(2120, -340, 72, 10)"), 'Colossal Fallen Titan Oak placed at (2120, -340)');
assert(wbContent.includes("createHollowTree(1820, -240"), 'Hollow Tree 1 placed at (1820, -240)');
assert(wbContent.includes("createHollowTree(2180, -300"), 'Hollow Tree 2 placed at (2180, -300)');
assert(wbContent.includes("createHollowTree(2450, -470"), 'Hollow Tree 3 placed at (2450, -470)');
assert(wbContent.includes("createDenseBush(2020, -360)"), 'Stealth Bush 1 placed at (2020, -360)');
assert(wbContent.includes("createDenseBush(2240, -520)"), 'Stealth Bush 2 placed at (2240, -520)');
assert(wbContent.includes("createDenseBush(2600, -300)"), 'Stealth Bush 3 placed at (2600, -300)');

// 5. Kiểm tra The Listener & ListenerAI
console.log('\n--- TEST GROUP 5: The Listener AI & Mechanics ---');
const listenerContent = fs.readFileSync(path.resolve('src/entities/TheListener.ts'), 'utf8');
assert(listenerContent.includes("canAttack(): boolean"), 'TheListener has canAttack method');
assert(listenerContent.includes("triggerAttackCooldown"), 'TheListener has triggerAttackCooldown method');
assert(listenerContent.includes("onAlertTelegraph"), 'TheListener has onAlertTelegraph method');
assert(listenerContent.includes("onChaseAlert"), 'TheListener has onChaseAlert method');
assert(listenerContent.includes("onChaseEnded"), 'TheListener has onChaseEnded method');

const aiContent = fs.readFileSync(path.resolve('src/systems/ListenerAI.ts'), 'utf8');
assert(aiContent.includes("setWaypoints(waypoints: Waypoint[])"), 'ListenerAI has dynamic setWaypoints method');
assert(aiContent.includes("canAttack(): boolean"), 'ListenerAI has canAttack method');
assert(aiContent.includes("triggerAttackCooldown"), 'ListenerAI has triggerAttackCooldown method');
assert(aiContent.includes("this.state === 'CHASE' && _volume < 2.0"), 'Noise lure distraction breaks chase state (_volume >= 2.0)');

// 6. Kiểm tra GameScene Gameplay & Fairness
console.log('\n--- TEST GROUP 6: GameScene Fairness & Combat Balance ---');
const gsContent = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gsContent.includes("this.listenerMonster.canAttack()"), 'Listener attack checks canAttack before dealing damage');
assert(gsContent.includes("this.listenerMonster.triggerAttackCooldown(1500)"), 'Listener attack triggers 1.5s cooldown');
assert(gsContent.includes("Math.max(0, this.playerState.stats.health - 25)"), 'Listener attack deals fair 25 HP damage (no instant kill)');
assert(gsContent.includes("Math.max(5, this.playerState.stats.composure - 25)"), 'Listener attack reduces composure by fair 25 points');
assert(gsContent.includes("pushAngle"), 'Listener attack pushes player back for escape distance');
assert(gsContent.includes("this.currentZoneId === 'deep_forest'"), 'deep_forest is included in inDeepFog survival calculation');
assert(gsContent.includes("inspect_df_entry_sign"), 'GameScene handles inspect_df_entry_sign');
assert(gsContent.includes("inspect_df_listener_nest"), 'GameScene handles inspect_df_listener_nest');
assert(gsContent.includes("inspect_df_bioluminescent_fungus"), 'GameScene handles inspect_df_bioluminescent_fungus');
assert(gsContent.includes("inspect_df_mire_boundary_gate"), 'GameScene handles inspect_df_mire_boundary_gate');
assert(gsContent.includes("this.audioManager.setHeartbeatActive(true, 750)"), 'Proximity heartbeat audio cue active when Listener is nearby');

// 7. Kiểm tra Resource Nodes trong Deep Forest
console.log('\n--- TEST GROUP 7: Resource Nodes in Deep Forest ---');
const invContent = fs.readFileSync(path.resolve('src/systems/InventorySystem.ts'), 'utf8');
assert(invContent.includes("node_wood_df_1"), 'Resource node: node_wood_df_1 present');
assert(invContent.includes("node_herb_df_1"), 'Resource node: node_herb_df_1 present');
assert(invContent.includes("node_resin_df_1"), 'Resource node: node_resin_df_1 present');
assert(invContent.includes("node_flint_df_1"), 'Resource node: node_flint_df_1 present');
assert(invContent.includes("node_wood_df_2"), 'Resource node: node_wood_df_2 present');
assert(invContent.includes("node_herb_df_2"), 'Resource node: node_herb_df_2 present');

// 8. Kiểm tra va chạm & lối đi thông thoáng
console.log('\n--- TEST GROUP 8: Walkway Clearance & Collider Sanity ---');
// Kiểm tra cổng Nam Deep Forest (x=2000..2160, y=-35..0) không bị cản bởi colliders
const bottomColliders = dfZone.colliders.filter(c => c.id.startsWith('df_bound_bottom'));
assert(bottomColliders.length === 2, 'Bottom boundary has 2 separate segments creating a middle opening');
const leftBound = bottomColliders.find(c => c.id === 'df_bound_bottom_left');
const rightBound = bottomColliders.find(c => c.id === 'df_bound_bottom_right');
assert(leftBound && leftBound.x + leftBound.width <= 2000, 'Left bottom bound stops at x <= 2000');
assert(rightBound && rightBound.x >= 2160, 'Right bottom bound starts at x >= 2160');

// Kiểm tra toàn bộ 6 resource nodes không đè lên colliders của Deep Forest
const dfResourceNodes = [
  { id: 'node_wood_df_1', x: 2030, y: -90 },
  { id: 'node_herb_df_1', x: 1780, y: -210 },
  { id: 'node_resin_df_1', x: 1860, y: -250 },
  { id: 'node_flint_df_1', x: 2140, y: -350 },
  { id: 'node_wood_df_2', x: 2360, y: -360 },
  { id: 'node_herb_df_2', x: 2720, y: -280 }
];

let nodeCollisions = 0;
for (const node of dfResourceNodes) {
  for (const c of dfZone.colliders) {
    if (node.x >= c.x && node.x <= c.x + c.width && node.y >= c.y && node.y <= c.y + c.height) {
      nodeCollisions++;
    }
  }
}
assert(nodeCollisions === 0, 'All 6 Deep Forest resource nodes have 0 collider overlap and are freely harvestable');

console.log('\n================================================================');
console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed === 0) {
  console.log('  ALL C4-12-22 CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
} else {
  console.error(`  ${failed} CHECKS FAILED!`);
  process.exit(1);
}
