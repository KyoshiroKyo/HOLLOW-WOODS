import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG BƯỚC V15-13: QUY HOẠCH BỐ CỤC LÀNG BELLHOLLOW ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failCount++;
  }
}

// 1. Kiểm tra zones.json
const zonesPath = path.resolve('src/data/zones.json');
const zonesJson = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));
const zonesList = zonesJson.zones || zonesJson;
const bellhollowZone = zonesList.find(z => z.id === 'bellhollow');

assert(!!bellhollowZone, 'Tìm thấy phân vùng bellhollow trong zones.json');

const npcs = bellhollowZone.npcs;
assert(npcs.length === 6, `Số lượng NPC trong làng Bellhollow là 6 (thực tế: ${npcs.length})`);

const npcMap = {};
for (const n of npcs) {
  npcMap[n.id] = n;
}

const garth = npcMap['npc_garth'];
const edda = npcMap['npc_edda'];
const neris = npcMap['npc_neris'];
const bram = npcMap['npc_bram'];
const finn = npcMap['npc_finn'];
const knight = npcMap['npc_campfire_knight'];

assert(!!garth && garth.x === 490 && garth.y === 210, `Tọa độ Garth: (490, 210) (thực tế: ${garth?.x}, ${garth?.y})`);
assert(!!edda && edda.x === 1160 && edda.y === 160, `Tọa độ Edda: (1160, 160) (thực tế: ${edda?.x}, ${edda?.y})`);
assert(!!neris && neris.x === 570 && neris.y === 460, `Tọa độ Neris: (570, 460) (thực tế: ${neris?.x}, ${neris?.y})`);
assert(!!bram && bram.x === 1230 && bram.y === 390, `Tọa độ Bram: (1230, 390) (thực tế: ${bram?.x}, ${bram?.y})`);
assert(!!finn && finn.x === 660 && finn.y === 265, `Tọa độ Finn: (660, 265) (thực tế: ${finn?.x}, ${finn?.y})`);
assert(!!knight && knight.x === 825 && knight.y === 310, `Tọa độ Hiệp Sĩ Canh Lửa: (825, 310) (thực tế: ${knight?.x}, ${knight?.y})`);

// 2. Kiểm tra khoảng cách tối thiểu giữa toàn bộ 15 cặp NPC (Khoảng cách Euclidean >= 160px)
console.log('\n--- KIỂM TRA MA TRẬN KHOẢNG CÁCH EUCLIDEAN GIỮA TẤT CẢ CẶP NPC (Yêu cầu >= 160px) ---');
const npcList = [
  { id: 'Garth', x: garth.x, y: garth.y, minX: garth.patrolMinX, maxX: garth.patrolMaxX },
  { id: 'Finn', x: finn.x, y: finn.y, minX: finn.patrolMinX, maxX: finn.patrolMaxX },
  { id: 'Hiệp Sĩ Canh Lửa', x: knight.x, y: knight.y, minX: knight.x, maxX: knight.x },
  { id: 'Edda', x: edda.x, y: edda.y, minX: edda.x, maxX: edda.x },
  { id: 'Bram', x: bram.x, y: bram.y, minX: bram.x, maxX: bram.x },
  { id: 'Neris', x: neris.x, y: neris.y, minX: neris.x, maxX: neris.x }
];

let allPairsPass = true;
let minDistanceObserved = 999999;
let closestPairStr = '';

for (let i = 0; i < npcList.length; i++) {
  for (let j = i + 1; j < npcList.length; j++) {
    const a = npcList[i];
    const b = npcList[j];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (dist < minDistanceObserved) {
      minDistanceObserved = dist;
      closestPairStr = `${a.id} <-> ${b.id}`;
    }
    const pairPass = dist >= 160;
    if (!pairPass) allPairsPass = false;
    console.log(`  * ${a.id} <-> ${b.id}: d = ${dist.toFixed(2)}px [${pairPass ? 'OK >= 160px' : 'FAIL < 160px'}]`);
  }
}

assert(allPairsPass, `Tất cả 15 cặp NPC đều cách nhau >= 160px (cặp gần nhất: ${closestPairStr} = ${minDistanceObserved.toFixed(2)}px)`);

// 2b. Kiểm tra khoảng cách tuần tra động cực hạn giữa Garth và Finn
const dynamicClosestGarthFinn = Math.hypot(finn.patrolMinX - garth.patrolMaxX, finn.y - garth.y);
assert(dynamicClosestGarthFinn >= 160, `Khoảng cách tuần tra cực hạn giữa Garth và Finn >= 160px (thực tế: ${dynamicClosestGarthFinn.toFixed(2)}px)`);

// 3. Kiểm tra đồng bộ tọa độ Lửa Trại Trung Tâm trong CampSystem, CampSanctuarySystem, SurvivalSystem, zones.json
console.log('\n--- KIỂM TRA ĐỒNG BỘ TỌA ĐỘ LỬA TRẠI TRUNG TÂM (860, 310) ---');
const campSystemSrc = fs.readFileSync('src/systems/CampSystem.ts', 'utf8');
const campSanctuarySrc = fs.readFileSync('src/systems/CampSanctuarySystem.ts', 'utf8');
const survivalSrc = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf8');
const worldBuilderSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');

assert(campSystemSrc.includes('campfireX: number = 860') && campSystemSrc.includes('campfireY: number = 310'), 'CampSystem.ts đã cập nhật campfireX=860, campfireY=310');
assert(campSanctuarySrc.includes('campfireX: number = 860') && campSanctuarySrc.includes('campfireY: number = 310'), 'CampSanctuarySystem.ts đã cập nhật campfireX=860, campfireY=310');
assert(campSanctuarySrc.includes('knightX: number = 825') && campSanctuarySrc.includes('knightY: number = 310'), 'CampSanctuarySystem.ts đã cập nhật knightX=825, knightY=310');
assert(survivalSrc.includes('x: 860, y: 310, radius: 110, name: \'Lửa Trại Làng Bellhollow\''), 'SurvivalSystem.ts warmSources có Lửa Trại Làng Bellhollow tại (860, 310)');
assert(survivalSrc.includes('campfireX: number = 860') && survivalSrc.includes('campfireY: number = 310'), 'SurvivalSystem.ts campfireX=860, campfireY=310');

// 4. Kiểm tra dọn sạch lòng đường làng Bellhollow trong InventorySystem.ts
console.log('\n--- KIỂM TRA DỌN SẠCH LÒNG ĐƯỜNG TRONG INVENTORY SYSTEM ---');
const inventorySrc = fs.readFileSync('src/systems/InventorySystem.ts', 'utf8');
assert(!inventorySrc.includes("{ id: 'node_wood_bellhollow_1', itemId: 'res_dry_wood', x: 680, y: 220"), 'node_wood_bellhollow_1 không còn nằm giữa ngã ba lối vào (680, 220)');
assert(inventorySrc.includes("{ id: 'node_wood_bellhollow_1', itemId: 'res_dry_wood', x: 610, y: 145"), 'node_wood_bellhollow_1 đã chuyển sát góc kho củi Tây Bắc (610, 145)');
assert(inventorySrc.includes("{ id: 'node_resin_bellhollow_2', itemId: 'res_tree_resin', x: 730, y: 80"), 'node_resin_bellhollow_2 đã chuyển vào gốc cây cổ thụ phía Bắc (730, 80)');
assert(inventorySrc.includes("{ id: 'node_flint_1', itemId: 'res_flint', x: 510, y: 490"), 'node_flint_1 đã chuyển vào góc đá viền Tây Nam (510, 490)');
assert(inventorySrc.includes("{ id: 'node_wood_3', itemId: 'res_dry_wood', x: 1330, y: 410"), 'node_wood_3 đã chuyển ra đống gỗ xưởng rèn Bram (1330, 410)');

// 5. Kiểm tra bố cục công trình và quảng trường trong WorldBuilder.ts
console.log('\n--- KIỂM TRA BỐ CỤC KIẾN TRÚC TRONG WORLDBUILDER.TS ---');
assert(worldBuilderSrc.includes('this.createWestWatchpost(510, 175)'), 'Trạm gác Cổng Tây đặt tại (510, 175)');
assert(worldBuilderSrc.includes('this.createAnomalyNoticeBoard(650, 240)'), 'Bảng Tin Dị Thường đặt tại (650, 240)');
assert(worldBuilderSrc.includes('this.createBellTower(900, 130, 160, 240)'), 'Tháp Chuông Cổ Đại đặt tại Bắc (900, 130)');
assert(worldBuilderSrc.includes("this.createBuilding(1160, 130, 160, 144, 0x5a3d28, 0x8a6338, 'Nhà Edda – Người Giữ Chuông')"), 'Nhà Edda đặt tại Đông Bắc (1160, 130)');
assert(worldBuilderSrc.includes('this.createCraftingWorkshopPavilion(1270, 360)'), 'Xưởng Rèn Bram đặt tại Đông Nam (1270, 360)');
assert(worldBuilderSrc.includes('this.createCraftingBench(1220, 370)'), 'Bàn chế tạo đặt tại (1220, 370)');
assert(worldBuilderSrc.includes("this.createBuilding(570, 430, 152, 136, 0x4a4335, 0x6e7845, 'Nhà Neris – Thảo Mộc')"), 'Nhà Neris đặt tại Tây Nam (570, 430)');
assert(worldBuilderSrc.includes('this.createSanctuaryHerbGarden(655, 480)'), 'Vườn Thảo Dược Sanctuary đặt tại Tây Nam (655, 480)');
assert(worldBuilderSrc.includes('drawCobbleCourtyard(810, 320, 145, 85, \'rounded_rect\')'), 'Mở rộng Quảng Trường Trung Tâm (145x85)');

// 6. Kiểm tra GameScene.ts spawnNPCs đồng bộ
console.log('\n--- KIỂM TRA ĐỒNG BỘ GAMESCENE.TS ---');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneSrc.includes("id: 'npc_garth'") && gameSceneSrc.includes('x: 490') && gameSceneSrc.includes('y: 210'), 'GameScene spawn Garth tại (490, 210)');
assert(gameSceneSrc.includes("id: 'npc_edda'") && gameSceneSrc.includes('x: 1160') && gameSceneSrc.includes('y: 160'), 'GameScene spawn Edda tại (1160, 160)');
assert(gameSceneSrc.includes("id: 'npc_neris'") && gameSceneSrc.includes('x: 570') && gameSceneSrc.includes('y: 460'), 'GameScene spawn Neris tại (570, 460)');
assert(gameSceneSrc.includes("id: 'npc_bram'") && gameSceneSrc.includes('x: 1230') && gameSceneSrc.includes('y: 390'), 'GameScene spawn Bram tại (1230, 390)');
assert(gameSceneSrc.includes("id: 'npc_finn'") && gameSceneSrc.includes('x: 660') && gameSceneSrc.includes('y: 265'), 'GameScene spawn Finn tại (660, 265)');
assert(gameSceneSrc.includes("id: 'npc_campfire_knight'") && gameSceneSrc.includes('x: 825') && gameSceneSrc.includes('y: 310'), 'GameScene spawn Hiệp Sĩ Canh Lửa tại (825, 310)');

console.log(`\n================================================================`);
console.log(`TỔNG KẾT KIỂM THỬ: ${passCount} PASS / ${failCount} FAIL`);
console.log(`================================================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> TẤT CẢ TIÊU CHÍ BƯỚC V15-13 ĐÃ ĐẠT CHUẨN XUẤT SẮC! <<<');
  process.exit(0);
}
