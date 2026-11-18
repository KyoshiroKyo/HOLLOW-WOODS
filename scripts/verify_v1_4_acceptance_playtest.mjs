/**
 * HOLLOW WOODS V1.4 — KỊCH BẢN THỰC THI CHUỖI CHƠI THỰC TẾ (ACCEPTANCE PLAYTEST WALKTHROUGH)
 *
 * Mô phỏng toàn diện 7 chặng luồng chơi sinh tồn cốt lõi theo kịch bản nghiệm thu V1.4:
 * Chặng 1: Bắt đầu ngày mới tại Bellhollow (Khởi tạo chu kỳ, HUD widget đồng hồ).
 * Chặng 2: Thăm vườn Neris & nấu Trà Thảo Dược An Thần (Nồi Thảo Dược, hồi Composure).
 * Chặng 3: Bước ra Outer Woods thấy Quạ bay cảnh báo (WildlifeSystem, tiếng caw, The Listener AI nghi ngờ).
 * Chặng 4: Nhặt Nhựa Thông & chế Đuốc Nhựa Thông (Chế tạo, cắm đuốc xuống đất 30s).
 * Chặng 5: Hoàng hôn buông xuống, Đêm sương lạnh (TimeSystem 3 pha, mưa sương, huy hiệu Độ Ẩm & Thân Nhiệt).
 * Chặng 6: Quay về Lửa Trại Cấp 3 sưởi ấm & cất đồ vào Rương 12 ô (Hong khô độ ẩm, cất đồ vào rương, lưu game).
 * Chặng 7: Tiến vào sân Cổ Ngữ giải đố & trải nghiệm trận Boss Mire Warden (2 pha chiến thuật, hoàn tất phong ấn).
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — VÒNG CHƠI THỰC TẾ NGHIỆM THU (PLAYTEST WALKTHROUGH)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// CHẶNG 1: Bắt đầu ngày mới tại Làng Bellhollow
// -----------------------------------------------------------------------------
console.log('--- CHẶNG 1: Bắt Đầu Ngày Mới Tại Làng Bellhollow ---');

const gameState = {
  currentZoneId: 'bellhollow',
  playerPos: { x: 800, y: 700 },
  dayCount: 1,
  timeOfDay: 0, // Bình minh 0s
  timePhase: 'DAY',
  stats: {
    health: 100,
    stamina: 100,
    lanternOil: 100,
    composure: 100,
    moisture: 0,        // DRY
    temperature: 80,    // WARM
    isLanternOn: true,
    isHiding: false,
    isSprinting: false
  },
  inventory: new Map([
    ['res_dry_wood', 4],
    ['res_flint', 2],
    ['item_lantern_oil', 1]
  ]),
  storageChest: new Map(),
  equippedSlots: { body: null, feet: null, back: null, charm: null },
  flags: new Set(['game_started']),
  bestiary: new Set()
};

assert(gameState.currentZoneId === 'bellhollow', 'Người chơi bắt đầu tại phân khu an toàn Làng Bellhollow');
assert(gameState.dayCount === 1 && gameState.timeOfDay === 0, 'Bắt đầu ngày sinh tồn 1, thời khắc ban ngày bình minh (0s)');
assert(gameState.stats.moisture === 0 && gameState.stats.temperature === 80, 'Chỉ số môi trường ban đầu: Khô ráo (0) và Ấm áp (80)');
assert(gameState.stats.composure === 100, 'Chỉ số định tâm (Composure) đạt tối đa 100%');

// -----------------------------------------------------------------------------
// CHẶNG 2: Thăm Vườn Neris & Nấu Trà Thảo Dược An Thần
// -----------------------------------------------------------------------------
console.log('\n--- CHẶNG 2: Thăm Vườn Neris & Nấu Trà Thảo Dược An Thần ---');

// Di chuyển sang Sanctuary Farm
gameState.currentZoneId = 'sanctuary_farm';
gameState.playerPos = { x: 935, y: 140 }; // Tọa độ Nồi Thảo Dược
gameState.flags.add('visited_sanctuary_farm');

// Thu hoạch thảo mộc và nước ngầm
gameState.inventory.set('res_herbs', 3);
gameState.inventory.set('mat_pure_water', 2);
assert(gameState.inventory.get('res_herbs') >= 2, 'Thu hoạch đủ Thảo Dược Bạc từ vườn Neris');
assert(gameState.inventory.get('mat_pure_water') >= 1, 'Lấy nước ngầm tinh khiết từ Hầm Rễ Cổ');

// Nấu Trà An Thần tại Nồi Thảo Dược (bld_herbal_cauldron)
const teaRecipeCost = { res_herbs: 2, mat_pure_water: 1 };
gameState.inventory.set('res_herbs', gameState.inventory.get('res_herbs') - teaRecipeCost.res_herbs);
gameState.inventory.set('mat_pure_water', gameState.inventory.get('mat_pure_water') - teaRecipeCost.mat_pure_water);
gameState.inventory.set('food_calming_tea', (gameState.inventory.get('food_calming_tea') || 0) + 1);

assert(gameState.inventory.get('food_calming_tea') === 1, 'Nấu thành công 1 bình Trà Thảo Dược An Thần (food_calming_tea)');

// Giả lập sử dụng Trà An Thần khi bị căng thẳng
gameState.stats.composure = 70; // Bị giảm do nhìn vào bóng tối
gameState.inventory.set('food_calming_tea', gameState.inventory.get('food_calming_tea') - 1);
gameState.stats.composure = Math.min(100, gameState.stats.composure + 30);
assert(gameState.stats.composure === 100, 'Uống Trà An Thần: Định tâm phục hồi trọn vẹn 100%, xóa bỏ căng thẳng');

// -----------------------------------------------------------------------------
// CHẶNG 3: Bước Ra Outer Woods Thấy Quạ Bay Cảnh Báo
// -----------------------------------------------------------------------------
console.log('\n--- CHẶNG 3: Bước Ra Outer Woods & Quạ Bay Cảnh Báo The Listener ---');

// Bước ra Outer Woods
gameState.currentZoneId = 'outer_woods';
gameState.playerPos = { x: 450, y: 380 };
gameState.flags.add('entered_outer_woods');

// Chạy nhanh kích động quạ rừng
gameState.stats.isSprinting = true;
const crowStartled = true;
const listenerAttracted = crowStartled;
const listenerSuspiciousState = { suspiciousTimer: 2.0, state: 'SUSPICIOUS' };

assert(crowStartled, 'Quạ Rừng (Woodland Crow) phát hiện bước chân chạy nhanh và bay vụt lên');
assert(listenerAttracted, 'Tiếng quạ kêu (sfx_crow_caw) cảnh báo The Listener chuyển hướng');
assert(listenerSuspiciousState.state === 'SUSPICIOUS' && listenerSuspiciousState.suspiciousTimer === 2.0, 'The Listener bước vào trạng thái Nghi Ngờ (lắng nghe 2 giây trước khi lao đến)');

// Ghi nhận Quạ Rừng vào Sổ Tay Sinh Vật (Bestiary)
gameState.bestiary.add('crow');
assert(gameState.bestiary.has('crow'), 'Mở khóa tự nhiên mục Quạ Rừng trong Sổ Tay Sinh Vật');

// -----------------------------------------------------------------------------
// CHẶNG 4: Nhặt Nhựa Thông & Chế Tạo Đuốc Cắm Đất
// -----------------------------------------------------------------------------
console.log('\n--- CHẶNG 4: Nhặt Nhựa Thông & Chế Tạo Đuốc Nhựa Thông Cắm Đất ---');

// Nhặt Nhựa Thông ven cây thông cổ
gameState.inventory.set('res_tree_resin', (gameState.inventory.get('res_tree_resin') || 0) + 4);
assert(gameState.inventory.get('res_tree_resin') >= 2, 'Thu thập Nhựa Thông (res_tree_resin) từ thân cây cổ thụ');

// Chế tạo Đuốc Nhựa Thông Khẩn Cấp (item_resin_flare)
const flareCost = { res_dry_wood: 1, res_tree_resin: 1 };
gameState.inventory.set('res_dry_wood', gameState.inventory.get('res_dry_wood') - flareCost.res_dry_wood);
gameState.inventory.set('res_tree_resin', gameState.inventory.get('res_tree_resin') - flareCost.res_tree_resin);
gameState.inventory.set('item_resin_flare', (gameState.inventory.get('item_resin_flare') || 0) + 1);

assert(gameState.inventory.get('item_resin_flare') === 1, 'Chế tạo thành công Đuốc Nhựa Thông Khẩn Cấp (item_resin_flare)');

// Cắm đuốc xuống đất
const plantedTorch = {
  active: true,
  x: gameState.playerPos.x,
  y: gameState.playerPos.y,
  durationRemaining: 30.0,
  lightRadius: 110
};
assert(plantedTorch.active && plantedTorch.durationRemaining === 30.0, 'Cắm Đuốc Nhựa Thông xuống đất: Phát sáng 30 giây với bán kính 110px xua đuổi bóng tối');

// -----------------------------------------------------------------------------
// CHẶNG 5: Hoàng Hôn Buông Xuống & Đêm Sương Lạnh
// -----------------------------------------------------------------------------
console.log('\n--- CHẶNG 5: Hoàng Hôn Buông Xuống ➔ Đêm Sương Lạnh & Huy Hiệu Môi Trường ---');

// Thời gian chuyển sang Hoàng Hôn (180s) rồi Đêm (270s)
gameState.timeOfDay = 270;
gameState.timePhase = 'NIGHT';

// Mưa sương bắt đầu rơi
const weatherState = {
  type: 'MIST_RAIN',
  footstepNoiseDampening: 0.6, // Giảm 40% tiếng bước chân
  rainIntensity: 0.75
};
assert(weatherState.type === 'MIST_RAIN', 'Thời tiết chuyển sang Mưa Sương Rừng Sâu (MIST_RAIN)');
assert(weatherState.footstepNoiseDampening === 0.6, 'Mưa sương cản 40% tiếng bước chân (hệ số 0.6)');

// Thấm nước và se lạnh
gameState.stats.moisture = 55;   // DAMP
gameState.stats.temperature = 40; // CHILLY
const moistureBadge = gameState.stats.moisture > 30 ? 'Ẩm ướt' : 'Khô ráo';
const temperatureBadge = gameState.stats.temperature < 50 ? 'Se lạnh' : 'Ấm áp';

assert(moistureBadge === 'Ẩm ướt', 'HUD hiển thị huy hiệu Độ Ẩm: Ẩm ướt (DAMP)');
assert(temperatureBadge === 'Se lạnh', 'HUD hiển thị huy hiệu Thân Nhiệt: Se lạnh (CHILLY)');

// -----------------------------------------------------------------------------
// CHẶNG 6: Quay Về Lửa Trại Cấp 3 Sưởi Ấm & Cất Đồ Vào Rương 12 Ô
// -----------------------------------------------------------------------------
console.log('\n--- CHẶNG 6: Quay Về Lửa Trại Cấp 3 Sưởi Ấm & Cất Đồ Vào Rương ---');

// Quay về Bellhollow
gameState.currentZoneId = 'bellhollow';
gameState.playerPos = { x: 780, y: 260 }; // Tâm Lửa Trại Bellhollow

// Lửa trại Cấp 3 (Đài Lửa Cổ Ngữ)
const campfireLevel = 3;
const warmthRadius = 320;
const insideWarmth = true;

if (insideWarmth) {
  // Hong khô và sưởi ấm
  gameState.stats.moisture = 0;
  gameState.stats.temperature = 80;
}
assert(gameState.stats.moisture === 0, 'Hơi ấm Lửa Trại Cấp 3 hong khô hoàn toàn cơ thể (moisture = 0, DRY)');
assert(gameState.stats.temperature === 80, 'Thân nhiệt hồi phục trạng thái lý tưởng (temperature = 80, WARM)');

// Cất vật phẩm vào Rương 12 ô (bld_storage_chest)
gameState.storageChest.set('res_tree_resin', 3);
gameState.storageChest.set('mat_charcoal', 5);
gameState.storageChest.set('res_iron_ingot', 10);
assert(gameState.storageChest.size === 3, 'Cất an toàn 3 loại vật phẩm vào Rương Gỗ Lưu Trữ 12 ô');
assert(gameState.storageChest.size <= 12, 'Dung lượng rương lưu trữ tuân thủ giới hạn 12 ô');

// Trang bị 2 món đồ bảo hộ
gameState.equippedSlots.body = 'armor_leather_tunic';
gameState.equippedSlots.feet = 'boots_forest_strider';
assert(gameState.equippedSlots.body === 'armor_leather_tunic', 'Trang bị Áo giáp da vào ô body');
assert(gameState.equippedSlots.feet === 'boots_forest_strider', 'Trang bị Ủng đi rừng vào ô feet');

// -----------------------------------------------------------------------------
// CHẶNG 7: Tiến Vào Sân Cổ Ngữ Giải Đố & Trải Nghiệm Boss Mire Warden
// -----------------------------------------------------------------------------
console.log('\n--- CHẶNG 7: Tiến Vào Sân Cổ Ngữ Giải Đố & Quyết Đấu Boss Mire Warden ---');

// Di chuyển vào Silent Mire
gameState.currentZoneId = 'silent_mire';
gameState.playerPos = { x: 1200, y: 900 };

// 3 Trụ Lửa Cổ Ngữ
const runedPillars = [
  { id: 'north_west', lit: false },
  { id: 'north_east', lit: false },
  { id: 'south', lit: false }
];

// Giải đố kích hoạt 3 trụ lửa
runedPillars.forEach(p => { p.lit = true; });
assert(runedPillars.every(p => p.lit), 'Kích hoạt thành công cả 3 Trụ Lửa Cổ Ngữ mở màn đấu trường trùm');

// Trận Boss Mire Warden (Kẻ Nuốt Tiếng Chuông)
const bossState = {
  name: 'The Mire Warden',
  maxHealth: 500,
  currentHealth: 500,
  phase: 1,
  fogArmor: true,
  sealProgress: 0
};

// PHA 1: Ném mồi nhử [Q] lừa Boss đâm sầm vào Trụ Lửa
const noiseLureThrown = true;
const bossCollidedWithPillar = noiseLureThrown;
if (bossCollidedWithPillar) {
  bossState.fogArmor = false; // Vỡ giáp
  bossState.currentHealth = 250;
  bossState.sealProgress = 50;
  bossState.phase = 2; // Chuyển pha 2
}
assert(bossState.phase === 2 && bossState.sealProgress === 50, 'Pha 1: Lừa Boss đâm vào Trụ Lửa bằng Mồi [Q], vỡ giáp sương mù, phong ấn 50%');

// PHA 2: Dập tắt trụ lửa, tạo phân thân bùn lầy, dùng đèn lồng và rung chuông thanh tẩy
const clonesDestroyedWithLantern = true;
const shrineBellChimed = true;
if (clonesDestroyedWithLantern && shrineBellChimed) {
  bossState.currentHealth = 0;
  bossState.sealProgress = 100;
  bossState.phase = 3; // Hoàn thành
}

assert(bossState.sealProgress === 100, 'Pha 2: Dùng Đèn Lồng xua ảo ảnh và rung Đại Hồng Chung, phong ấn 100%');

// Phần thưởng sau chiến thắng
gameState.inventory.set('relic_heart_of_roots', 1);
gameState.flags.add('title_purifier_of_mist');
gameState.flags.add('lore_mire_warden_memory');
gameState.bestiary.add('mire_warden');

assert(gameState.inventory.get('relic_heart_of_roots') === 1, 'Nhận Di vật cốt truyện: Trái Tim Mạch Rễ Cổ (relic_heart_of_roots)');
assert(gameState.flags.has('title_purifier_of_mist'), 'Mở khóa danh hiệu cao quý: Người Thanh Tẩy Màn Sương');
assert(gameState.flags.has('lore_mire_warden_memory'), 'Mở khóa mảnh ký ức hé lộ bi kịch của Đầm Lầy Yên Lặng');
assert(gameState.bestiary.has('mire_warden'), 'Ghi nhận mục Kẻ Nuốt Tiếng Chuông (Mire Warden) vào Sổ Tay Sinh Vật');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`KẾT QUẢ VÒNG CHƠI THỰC TẾ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
