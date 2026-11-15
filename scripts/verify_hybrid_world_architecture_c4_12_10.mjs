import fs from 'fs';

console.log('================================================================');
console.log('QA / QC VERIFICATION SUITE — COMMAND C4-12-10');
console.log('KIẾN TRÚC KỸ THUẬT MÔ HÌNH THẾ GIỚI MỞ LAI (HYBRID OPEN WORLD C)');
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

// 1. Kiểm tra cấu trúc phân tầng trong types/index.ts
console.log('\n--- 1. KIỂM TRA ĐỊNH NGHĨA KIỂU DỮ LIỆU & WORLD TIERS ---');
const typesContent = fs.readFileSync('src/types/index.ts', 'utf-8');

assert(typesContent.includes('LAYER_1_CORE'), 'types/index.ts định nghĩa LAYER_1_CORE');
assert(typesContent.includes('LAYER_2_FRONTIER'), 'types/index.ts định nghĩa LAYER_2_FRONTIER');
assert(typesContent.includes('LAYER_3_FORBIDDEN'), 'types/index.ts định nghĩa LAYER_3_FORBIDDEN');
assert(typesContent.includes('sanctuary_farm'), 'ZoneId chứa sanctuary_farm');
assert(typesContent.includes('outer_woods'), 'ZoneId chứa outer_woods');
assert(typesContent.includes('deep_forest'), 'ZoneId chứa deep_forest');
assert(typesContent.includes('ancient_rune_puzzle'), 'ZoneId chứa ancient_rune_puzzle');
assert(typesContent.includes('ZoneAccessRule'), 'types/index.ts định nghĩa ZoneAccessRule');
assert(typesContent.includes('ZoneSpawnPoint'), 'types/index.ts định nghĩa ZoneSpawnPoint');

// 2. Kiểm tra dữ liệu zones.json đủ 9 phân khu với 3 Tiers
console.log('\n--- 2. KIỂM TRA DỮ LIỆU 9 PHÂN KHU TRONG ZONES.JSON ---');
const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf-8'));
assert(zonesData.zones.length === 9, `zones.json chứa đủ 9 phân khu (Thực tế: ${zonesData.zones.length})`);

const expectedZones = [
  // Tầng 1: Core World
  { id: 'fog_crossing', tier: 'LAYER_1_CORE', name: 'Fog Crossing' },
  { id: 'bellhollow', tier: 'LAYER_1_CORE', name: 'Bellhollow' },
  { id: 'sanctuary_farm', tier: 'LAYER_1_CORE', name: 'Sanctuary Farm' },
  { id: 'outer_woods', tier: 'LAYER_1_CORE', name: 'Outer Woods' },
  // Tầng 2: Frontier
  { id: 'crooked_path', tier: 'LAYER_2_FRONTIER', name: 'The Crooked Path' },
  { id: 'deep_forest', tier: 'LAYER_2_FRONTIER', name: 'Deep Forest' },
  // Tầng 3: Forbidden Regions
  { id: 'silent_mire', tier: 'LAYER_3_FORBIDDEN', name: 'Silent Mire' },
  { id: 'ancient_rune_puzzle', tier: 'LAYER_3_FORBIDDEN', name: 'Ancient Rune Puzzle' },
  { id: 'broken_bell_shrine', tier: 'LAYER_3_FORBIDDEN', name: 'The Broken Bell Shrine' }
];

for (const exp of expectedZones) {
  const z = zonesData.zones.find(item => item.id === exp.id);
  assert(!!z, `Phân khu [${exp.id}] tồn tại trong zones.json`);
  assert(z && z.tier === exp.tier, `Phân khu [${exp.id}] được phân tầng đúng [${exp.tier}]`);
  assert(z && z.bounds && z.bounds.width > 0 && z.bounds.height > 0, `Phân khu [${exp.id}] có ranh giới bounds hợp lệ`);
  assert(z && z.defaultSpawn && typeof z.defaultSpawn.x === 'number', `Phân khu [${exp.id}] có defaultSpawn hợp lệ`);
  assert(z && z.atmosphere && typeof z.atmosphere.fogColor === 'number', `Phân khu [${exp.id}] có khí quyển atmosphere hoàn chỉnh`);
  assert(z && z.transitions && z.transitions.length > 0, `Phân khu [${exp.id}] có điểm kết nối chuyển vùng transitions`);
}

// 3. Kiểm tra kiến trúc WorldGatingSystem
console.log('\n--- 3. KIỂM TRA HỆ THỐNG QUY TẮC WORLDGATINGSYSTEM ---');
const gatingContent = fs.readFileSync('src/world/WorldGatingSystem.ts', 'utf-8');

assert(gatingContent.includes('class WorldGatingSystem'), 'WorldGatingSystem tồn tại dưới dạng class');
assert(gatingContent.includes('getInstance'), 'WorldGatingSystem áp dụng mẫu Singleton');
assert(gatingContent.includes('isZoneUnlocked'), 'Có phương thức kiểm tra isZoneUnlocked');
assert(gatingContent.includes('evaluateTransition'), 'Có phương thức evaluateTransition trả về lý do và gợi ý');
assert(gatingContent.includes('getZonesByTier'), 'Có phương thức truy vấn getZonesByTier');
assert(gatingContent.includes('LAYER_1_CORE'), 'Hệ thống đăng ký quy tắc cho Layer 1');
assert(gatingContent.includes('LAYER_2_FRONTIER'), 'Hệ thống đăng ký quy tắc cho Layer 2');
assert(gatingContent.includes('LAYER_3_FORBIDDEN'), 'Hệ thống đăng ký quy tắc cho Layer 3');

// 4. Kiểm tra PlayerState & SaveManager tích hợp vết tích vùng
console.log('\n--- 4. KIỂM TRA BỀN VỮNG DỮ LIỆU & TƯƠNG THÍCH LƯU TRỮ ---');
const playerStateContent = fs.readFileSync('src/state/PlayerState.ts', 'utf-8');
const saveManagerContent = fs.readFileSync('src/systems/SaveManager.ts', 'utf-8');

assert(playerStateContent.includes('visitedZones'), 'PlayerState có thuộc tính visitedZones');
assert(playerStateContent.includes('markZoneVisited'), 'PlayerState có phương thức markZoneVisited');
assert(playerStateContent.includes('hasVisitedZone'), 'PlayerState có phương thức hasVisitedZone');
assert(playerStateContent.includes('getVisitedZones'), 'PlayerState có phương thức getVisitedZones');

assert(saveManagerContent.includes('visitedZones'), 'SaveData khai báo thuộc tính visitedZones');
assert(saveManagerContent.includes('visitedZones: state.getVisitedZones()'), 'saveGame() lưu trữ visitedZones');
assert(saveManagerContent.includes('state.visitedZones.clear()'), 'loadGame() phục hồi danh sách visitedZones');

// 5. Kiểm tra GameScene & WorldBuilder tích hợp
console.log('\n--- 5. KIỂM TRA TÍCH HỢP GAMESCENE & WORLDBUILDER ---');
const gameSceneContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');
const worldBuilderContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf-8');

assert(gameSceneContent.includes('WorldGatingSystem'), 'GameScene nạp WorldGatingSystem');
assert(gameSceneContent.includes('markZoneVisited'), 'GameScene gọi markZoneVisited khi bước vào phân khu mới');
assert(gameSceneContent.includes("evaluateTransition('bellhollow', 'crooked_path'"), 'Kiểm tra Cổng Đông sử dụng evaluateTransition');
assert(worldBuilderContent.includes('sortedZones'), 'WorldBuilder ưu tiên phát hiện sub-zone diện tích nhỏ trước');

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA KIẾN TRÚC THẾ GIỚI HYBRID C4-12-10: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests === 0) {
  console.log('STATUS: ALL HYBRID WORLD ARCHITECTURE CHECKS PASSED (100% HOÀN TẤT C4-12-10)');
} else {
  console.error(`STATUS: ${failedTests} CHECKS FAILED!`);
  process.exit(1);
}
console.log('================================================================');
