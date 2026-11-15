import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('QA / QC VERIFICATION SUITE — COMMAND C4-12-11');
console.log('SỔ ĐĂNG KÝ KẾT NỐI PHÂN KHU DÙNG CHUNG (ZONE CONNECTION REGISTRY)');
console.log('================================================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] #${totalTests}: ${testName} - ${detail}`);
  }
}

// -----------------------------------------------------------------------------
// 1. KIỂM TRA ĐỊNH NGHĨA KIỂU DỮ LIỆU KẾT NỐI TRONG SRC/TYPES/INDEX.TS
// -----------------------------------------------------------------------------
console.log('\n--- 1. KIỂM TRA ĐỊNH NGHĨA KIỂU DỮ LIỆU KẾT NỐI (SRC/TYPES/INDEX.TS) ---');
const typesContent = fs.readFileSync('src/types/index.ts', 'utf8');

assert(typesContent.includes('ConnectionStatus'), 'Định nghĩa kiểu ConnectionStatus');
assert(typesContent.includes("'active' | 'pending_construction'"), 'ConnectionStatus hỗ trợ active và pending_construction');
assert(typesContent.includes('ConnectionBarrierType'), 'Định nghĩa kiểu ConnectionBarrierType');
assert(typesContent.includes("'open'"), 'ConnectionBarrierType hỗ trợ open');
assert(typesContent.includes("'gate'"), 'ConnectionBarrierType hỗ trợ gate');
assert(typesContent.includes("'barrier_scaffold'"), 'ConnectionBarrierType hỗ trợ barrier_scaffold');
assert(typesContent.includes("'dense_thorns'"), 'ConnectionBarrierType hỗ trợ dense_thorns');
assert(typesContent.includes("'rune_ward'"), 'ConnectionBarrierType hỗ trợ rune_ward');
assert(typesContent.includes('ZoneNeighborInfo'), 'Định nghĩa interface ZoneNeighborInfo');
assert(typesContent.includes('ZoneNodeMetadata'), 'Định nghĩa interface ZoneNodeMetadata');
assert(typesContent.includes('ZoneConnectionDescriptor'), 'Định nghĩa interface ZoneConnectionDescriptor');
assert(typesContent.includes('pendingNotice?: string'), 'TransitionZone và Descriptor hỗ trợ pendingNotice');
assert(typesContent.includes('returnPoint?: Point2D'), 'TransitionZone và Descriptor hỗ trợ returnPoint');

// -----------------------------------------------------------------------------
// 2. KIỂM TRA MÃ NGUỒN ZONE CONNECTION REGISTRY (SRC/WORLD/ZONECONNECTIONREGISTRY.TS)
// -----------------------------------------------------------------------------
console.log('\n--- 2. KIỂM TRA MÃ NGUỒN ZONE CONNECTION REGISTRY ---');
const registryContent = fs.readFileSync('src/world/ZoneConnectionRegistry.ts', 'utf8');

assert(registryContent.includes('export class ZoneConnectionRegistry'), 'Lớp ZoneConnectionRegistry được export');
assert(registryContent.includes('public static getInstance(): ZoneConnectionRegistry'), 'Áp dụng mẫu thiết kế Singleton');
assert(registryContent.includes('evaluateConnectionTraversal'), 'Cung cấp phương thức evaluateConnectionTraversal');
assert(registryContent.includes('getSafeSpawnPosition'), 'Cung cấp phương thức getSafeSpawnPosition');
assert(registryContent.includes('validateTopology'), 'Cung cấp phương thức validateTopology');

// Kiểm tra đăng ký 9 phân khu
const allExpectedZones = [
  'fog_crossing',
  'bellhollow',
  'sanctuary_farm',
  'outer_woods',
  'crooked_path',
  'deep_forest',
  'silent_mire',
  'ancient_rune_puzzle',
  'broken_bell_shrine'
];

for (const zId of allExpectedZones) {
  assert(registryContent.includes(`id: '${zId}'`), `Registry đăng ký node phân khu: ${zId}`);
}

// Kiểm tra đăng ký 18 kết nối (connections)
const allExpectedConnections = [
  'conn_fog_to_bellhollow',
  'conn_bellhollow_to_fog',
  'conn_bellhollow_to_farm',
  'conn_farm_to_bellhollow',
  'conn_bellhollow_to_outer_woods',
  'conn_outer_woods_to_bellhollow',
  'conn_bellhollow_to_crooked_path',
  'conn_crooked_path_to_bellhollow',
  'conn_outer_woods_to_crooked_path',
  'conn_crooked_path_to_outer_woods',
  'conn_crooked_path_to_deep_forest',
  'conn_deep_forest_to_crooked_path',
  'conn_crooked_path_to_silent_mire',
  'conn_silent_mire_to_crooked_path',
  'conn_silent_mire_to_rune_puzzle',
  'conn_rune_puzzle_to_silent_mire',
  'conn_silent_mire_to_shrine',
  'conn_shrine_to_silent_mire'
];

for (const cId of allExpectedConnections) {
  assert(registryContent.includes(`id: '${cId}'`), `Registry đăng ký kết nối: ${cId}`);
}

// Kiểm tra cơ chế fallback an toàn (tránh rơi vào void)
assert(registryContent.includes('isSafePending: true'), 'Cơ chế phát hiện an toàn isSafePending');
assert(registryContent.includes('spawnPoint: conn.returnPoint'), 'Đặt spawnPoint quay về returnPoint khi phân khu pending');

// -----------------------------------------------------------------------------
// 3. KIỂM TRA ĐỒNG BỘ DỮ LIỆU ZONES.JSON
// -----------------------------------------------------------------------------
console.log('\n--- 3. KIỂM TRA ĐỒNG BỘ DỮ LIỆU ZONES.JSON ---');
const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));

assert(zonesData.zones.length === 9, `zones.json chứa đủ 9 phân khu (Hiện tại: ${zonesData.zones.length})`);

let totalJsonTransitions = 0;
let activeJsonTransitions = 0;
let pendingJsonTransitions = 0;

for (const z of zonesData.zones) {
  totalJsonTransitions += z.transitions.length;
  for (const t of z.transitions) {
    if (t.status === 'active') activeJsonTransitions++;
    if (t.status === 'pending_construction') pendingJsonTransitions++;

    // Xác thực fromZone, toZone hợp lệ
    assert(allExpectedZones.includes(t.fromZone), `Transition [${t.id}] fromZone [${t.fromZone}] hợp lệ`);
    assert(allExpectedZones.includes(t.toZone), `Transition [${t.id}] toZone [${t.toZone}] hợp lệ`);

    // Xác thực tọa độ số dương
    assert(typeof t.triggerRect.x === 'number' && typeof t.triggerRect.y === 'number', `Transition [${t.id}] triggerRect có tọa độ x, y`);
    assert(t.triggerRect.width > 0 && t.triggerRect.height > 0, `Transition [${t.id}] triggerRect có kích thước > 0`);
    assert(typeof t.targetSpawn.x === 'number' && typeof t.targetSpawn.y === 'number', `Transition [${t.id}] targetSpawn có tọa độ`);
    assert(typeof t.returnPoint.x === 'number' && typeof t.returnPoint.y === 'number', `Transition [${t.id}] returnPoint có tọa độ`);
  }
}

assert(totalJsonTransitions === 18, `zones.json có đủ 18 transitions (Hiện tại: ${totalJsonTransitions})`);
assert(activeJsonTransitions === 10, `zones.json có 10 active transitions (Hiện tại: ${activeJsonTransitions})`);
assert(pendingJsonTransitions === 8, `zones.json có 8 pending transitions (Hiện tại: ${pendingJsonTransitions})`);

// Kiểm tra các biển chỉ dẫn an toàn tại ranh giới
const bellhollowZone = zonesData.zones.find(z => z.id === 'bellhollow');
assert(bellhollowZone.interactables.some(i => i.id === 'bellhollow_farm_gate_sign'), 'Bellhollow có biển chỉ dẫn Lối Nam Nông Trại');
assert(bellhollowZone.interactables.some(i => i.id === 'bellhollow_outer_woods_gate_sign'), 'Bellhollow có biển chỉ dẫn Rừng Ngoại Vi');

const crookedPathZone = zonesData.zones.find(z => z.id === 'crooked_path');
assert(crookedPathZone.interactables.some(i => i.id === 'crooked_path_deep_forest_sign'), 'Crooked Path có biển cảnh báo Rừng Sâu');

// -----------------------------------------------------------------------------
// 4. KIỂM TRA TÍCH HỢP WORLDBUILDER VÀ GAMESCENE
// -----------------------------------------------------------------------------
console.log('\n--- 4. KIỂM TRA TÍCH HỢP WORLDBUILDER & GAMESCENE ---');
const wbContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
assert(wbContent.includes('ZoneConnectionRegistry'), 'WorldBuilder import ZoneConnectionRegistry');
assert(wbContent.includes('getConnectionRegistry'), 'WorldBuilder cung cấp getConnectionRegistry()');

const gsContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gsContent.includes('ZoneConnectionRegistry'), 'GameScene import ZoneConnectionRegistry');
assert(gsContent.includes('inspect_farm_gate'), 'GameScene xử lý tương tác inspect_farm_gate');
assert(gsContent.includes('inspect_outer_woods_gate'), 'GameScene xử lý tương tác inspect_outer_woods_gate');
assert(gsContent.includes('inspect_deep_forest_gate'), 'GameScene xử lý tương tác inspect_deep_forest_gate');
assert(gsContent.includes("evaluateConnectionTraversal('conn_bellhollow_to_crooked_path'"), 'GameScene đánh giá Cổng Đông qua ZoneConnectionRegistry');

// -----------------------------------------------------------------------------
// 5. MÔ PHỎNG LOGIC TRAVERSAL VÀ AN TOÀN TRÁNH VOID FALL
// -----------------------------------------------------------------------------
console.log('\n--- 5. MÔ PHỎNG VÀ KIỂM TRA LOGIC AN TOÀN CHỐNG VOID ---');

// Mô phỏng traversal cho 3 tình huống quan trọng:
// Tình huống A: Player cố gắng đi vào Nông Trại (chưa hoàn thiện - pending)
const farmTrans = bellhollowZone.transitions.find(t => t.toZone === 'sanctuary_farm');
assert(farmTrans.status === 'pending_construction', 'Lối vào Nông Trại được đánh dấu pending_construction');
assert(farmTrans.returnPoint.x === 600 && farmTrans.returnPoint.y === 510, 'Lối vào Nông Trại có returnPoint an toàn bên trong Bellhollow (600, 510)');

// Tình huống B: Player cố gắng đi vào Rừng Sâu (chưa hoàn thiện - pending)
const deepForestTrans = crookedPathZone.transitions.find(t => t.toZone === 'deep_forest');
assert(deepForestTrans.status === 'pending_construction', 'Lối vào Rừng Sâu được đánh dấu pending_construction');
assert(deepForestTrans.returnPoint.x === 2100 && deepForestTrans.returnPoint.y === 40, 'Lối vào Rừng Sâu có returnPoint an toàn bên trong Crooked Path (2100, 40)');

// Tình huống C: Player đi qua Cổng Đông (active, yêu cầu nhiệm vụ)
const eastGateTrans = bellhollowZone.transitions.find(t => t.toZone === 'crooked_path');
assert(eastGateTrans.status === 'active', 'Cổng Đông ở trạng thái active');
assert(eastGateTrans.targetSpawn.x === 1640 && eastGateTrans.targetSpawn.y === 280, 'Cổng Đông có targetSpawn chính xác bên trong Crooked Path (1640, 280)');
assert(eastGateTrans.returnPoint.x === 1540 && eastGateTrans.returnPoint.y === 280, 'Cổng Đông có returnPoint chính xác trước Cổng Đông Bellhollow (1540, 280)');

// -----------------------------------------------------------------------------
// TỔNG KẾT KẾT QUẢ
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TỔNG KẾT KIỂM THỬ C4-12-11:`);
console.log(`- Tổng số tiêu chí kiểm tra: ${totalTests}`);
console.log(`- Tiêu chí ĐẠT (PASS):       ${passedTests} / ${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`- Tiêu chí THẤT BẠI (FAIL):  ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✔ TẤT CẢ CÁC TIÊU CHÍ QC CỦA C4-12-11 ĐÃ ĐẠT 100%!');
  process.exit(0);
}
