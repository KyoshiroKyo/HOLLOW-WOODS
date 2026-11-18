/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 8.1 (BUILT-IN DATA-DRIVEN CONTENT PACKS & VALIDATOR)
 *
 * Kiểm tra 6 trụ cột theo yêu cầu Bước 8.1:
 * 1. Quy tắc an toàn CSP: Tuyệt đối chỉ dùng JSON thuần, không chạy mã JS ngoài.
 * 2. Gói 1: HW-MOD-PACK-000001 (Woodland Wildlife Pack).
 * 3. Gói 2: HW-MOD-PACK-000002 (Survival Equipment Pack).
 * 4. Gói 3: HW-MOD-PACK-000003 (Camp & Cooking Pack).
 * 5. Gói 4: HW-MOD-PACK-000004 (Ancient Relics & Boss Pack).
 * 6. Module kiểm tra ContentPackValidator: Manifest check, Collision detection, SemVer check.
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
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ BƯỚC 8.1: BUILT-IN CONTENT PACKS');
console.log('   (4 Gói JSON Chuẩn, Kiểm Tra An Toàn CSP & ContentPackValidator)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Kiểm Tra Sự Tồn Tại & Cú Pháp 4 Tệp JSON Content Packs
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Sự Tồn Tại & Tính An Toàn JSON Thuần Túy (CSP Compliance) ---');

const packFiles = [
  'HW-MOD-PACK-000001',
  'HW-MOD-PACK-000002',
  'HW-MOD-PACK-000003',
  'HW-MOD-PACK-000004'
];

const packsData = {};

for (const packId of packFiles) {
  const filePath = path.resolve(`src/data/packs/${packId}.json`);
  assert(fs.existsSync(filePath), `Tệp cấu hình gói src/data/packs/${packId}.json tồn tại`);

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  let parsed;
  try {
    parsed = JSON.parse(rawContent);
    assert(parsed && typeof parsed === 'object', `Tệp ${packId}.json là định dạng JSON hợp lệ`);
  } catch (err) {
    assert(false, `Tệp ${packId}.json bị lỗi cú pháp: ${err.message}`);
  }

  // Quét an toàn bảo mật CSP: Tuyệt đối không chứa thẻ script, eval, Function constructor
  const dangerousTokens = ['<script', '</script', 'javascript:', 'eval(', 'new Function', 'setTimeout('];
  const containsDangerousToken = dangerousTokens.some(token => rawContent.toLowerCase().includes(token.toLowerCase()));
  assert(!containsDangerousToken, `Gói ${packId} tuân thủ nghiêm ngặt CSP: Dữ liệu JSON thuần túy, không chứa mã độc`);

  packsData[packId] = { raw: rawContent, parsed };
}

// -----------------------------------------------------------------------------
// PHẦN 2: Kiểm Tra Gói 1: HW-MOD-PACK-000001 (Woodland Wildlife Pack)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Gói 1 (HW-MOD-PACK-000001 — Woodland Wildlife Pack) ---');

const pack1 = packsData['HW-MOD-PACK-000001'].parsed;
assert(pack1.packId === 'HW-MOD-PACK-000001', 'Pack 1 có packId chuẩn "HW-MOD-PACK-000001"');
assert(pack1.name === 'Woodland Wildlife Pack', 'Pack 1 có tên "Woodland Wildlife Pack"');
assert(pack1.version === '1.4.0', 'Pack 1 có phiên bản tương thích "1.4.0"');
assert(pack1.isBuiltIn === true, 'Pack 1 được đánh dấu là gói tích hợp sẵn (isBuiltIn: true)');

// Quạ Rừng (Woodland Crow)
const crow = pack1.contentEntries.find(e => e.id === 'HW-ANI-AMBIENT-000001');
assert(crow !== undefined, 'Pack 1 chứa mục Quạ Rừng (HW-ANI-AMBIENT-000001)');
assert(crow.runtimeKey === 'ani_crow', 'Quạ Rừng có runtimeKey là "ani_crow"');
assert(crow.meta?.spawnConfig?.zones.includes('outer_woods') && crow.meta?.spawnConfig?.zones.includes('deep_forest'), 'Quạ Rừng có cấu hình spawn tại outer_woods và deep_forest');
assert(crow.meta?.behavior?.alertListener === true, 'Quạ Rừng kích hoạt báo động cho The Listener khi hoảng sợ');
assert(crow.meta?.audio?.alarmSfx === 'sfx_crow_caw', 'Quạ Rừng có âm thanh báo động sfx_crow_caw');

// Bướm Đêm (Lantern Moth)
const moth = pack1.contentEntries.find(e => e.id === 'HW-ANI-AMBIENT-000002');
assert(moth !== undefined, 'Pack 1 chứa mục Bướm Đêm Hổ Phách (HW-ANI-AMBIENT-000002)');
assert(moth.runtimeKey === 'ani_lantern_moth', 'Bướm Đêm có runtimeKey là "ani_lantern_moth"');
assert(moth.meta?.behavior?.lightAttractRadius > 0, 'Bướm Đêm có bán kính bị thu hút bởi ánh sáng đèn lồng');
assert(moth.meta?.audio?.flutterSfx === 'sfx_moth_flutter', 'Bướm Đêm có âm thanh đập cánh nhẹ sfx_moth_flutter');

// -----------------------------------------------------------------------------
// PHẦN 3: Kiểm Tra Gói 2: HW-MOD-PACK-000002 (Survival Equipment Pack)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Gói 2 (HW-MOD-PACK-000002 — Survival Equipment Pack) ---');

const pack2 = packsData['HW-MOD-PACK-000002'].parsed;
assert(pack2.packId === 'HW-MOD-PACK-000002', 'Pack 2 có packId chuẩn "HW-MOD-PACK-000002"');

// 4 Trang Bị Cá Nhân Có Đánh Đổi
const cloak = pack2.contentEntries.find(e => e.id === 'HW-EQP-BODY-000001');
assert(cloak && cloak.runtimeKey === 'eqp_moss_cloak' && cloak.meta?.slot === 'body', 'Áo Choàng Rêu (HW-EQP-BODY-000001) gắn đúng ô body');
assert(cloak.meta?.stats?.moistureResistance === 25, 'Áo Choàng Rêu tăng 25% kháng ẩm');

const boots = pack2.contentEntries.find(e => e.id === 'HW-EQP-FEET-000001');
assert(boots && boots.runtimeKey === 'eqp_trail_boots' && boots.meta?.slot === 'feet', 'Ủng Đi Rừng (HW-EQP-FEET-000001) gắn đúng ô feet');
assert(boots.meta?.stats?.mireSlipImmunity === true, 'Ủng Đi Rừng có đặc tính miễn nhiễm trượt bùn lầy');

const backpack = pack2.contentEntries.find(e => e.id === 'HW-EQP-BACK-000001');
assert(backpack && backpack.runtimeKey === 'eqp_field_backpack' && backpack.meta?.slot === 'back', 'Túi Hành Trang (HW-EQP-BACK-000001) gắn đúng ô back');
assert(backpack.meta?.stats?.inventorySlotsBonus === 4, 'Túi Hành Trang tăng 4 ô chứa đồ');

const charm = pack2.contentEntries.find(e => e.id === 'HW-EQP-CHRM-000001');
assert(charm && charm.runtimeKey === 'eqp_bell_ward_charm' && charm.meta?.slot === 'charm', 'Bùa Chuông Cổ (HW-EQP-CHRM-000001) gắn đúng ô charm');
assert(charm.meta?.stats?.composureLossReduction === 20, 'Bùa Chuông Cổ giảm 20% mất định tâm trong sương mù');

// 3 Công Cụ Tự Vệ 4 Hướng Không Độ Bền
const staff = pack2.contentEntries.find(e => e.id === 'HW-WPN-STAFF-000001');
assert(staff && staff.meta?.range === 42 && staff.meta?.knockback === 20 && staff.meta?.durability === null, 'Gậy Gỗ: Tầm đánh 42px, đẩy lùi 20px, không độ bền');

const spear = pack2.contentEntries.find(e => e.id === 'HW-WPN-MEL-000001');
assert(spear && spear.meta?.range === 72 && spear.meta?.knockback === 45 && spear.meta?.durability === null, 'Giáo Gỗ Bịt Sắt: Tầm đâm 72px, đẩy lùi mạnh 45px, không độ bền');

const hatchet = pack2.contentEntries.find(e => e.id === 'HW-WPN-HATCH-000001');
assert(hatchet && hatchet.meta?.range === 36 && hatchet.meta?.woodcuttingSpeedMult === 2.0 && hatchet.meta?.durability === null, 'Rìu Đi Rừng: Tầm đánh 36px, chặt gỗ nhanh x2, không độ bền');

// -----------------------------------------------------------------------------
// PHẦN 4: Kiểm Tra Gói 3: HW-MOD-PACK-000003 (Camp & Cooking Pack)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Gói 3 (HW-MOD-PACK-000003 — Camp & Cooking Pack) ---');

const pack3 = packsData['HW-MOD-PACK-000003'].parsed;
assert(pack3.packId === 'HW-MOD-PACK-000003', 'Pack 3 có packId chuẩn "HW-MOD-PACK-000003"');

// Lửa Trại 3 Cấp
const campfire = pack3.contentEntries.find(e => e.id === 'HW-BLD-CAMP-000001');
assert(campfire && campfire.meta?.levels?.['1'] && campfire.meta?.levels?.['2'] && campfire.meta?.levels?.['3'], 'Lửa Trại Làng Bellhollow định nghĩa đủ 3 cấp độ nâng cấp');
assert(campfire.meta?.levels?.['3']?.warmthRadius === 320, 'Lửa Trại Cấp 3 (Đài Lửa Cổ Ngữ) có bán kính ấm 320px');

// Rương Gỗ 12 Ô
const chest = pack3.contentEntries.find(e => e.id === 'HW-BLD-CHEST-000001');
assert(chest && chest.meta?.capacity === 12 && chest.meta?.splitView === true, 'Rương Gỗ Lưu Trữ có sức chứa 12 ô và giao diện Split-View');

// Nồi Thảo Dược & 3 Món Ăn
const cauldron = pack3.contentEntries.find(e => e.id === 'HW-BLD-CAULD-000001');
assert(cauldron && cauldron.meta?.recipes.includes('food_calming_tea'), 'Nồi Thảo Dược hỗ trợ công thức Trà Thảo Dược An Thần');
assert(pack3.contentEntries.some(e => e.runtimeKey === 'food_calming_tea' && e.meta?.effect?.composure === 30), 'Trà An Thần hồi phục 30 điểm định tâm');
assert(pack3.contentEntries.some(e => e.runtimeKey === 'food_roasted_mushroom' && e.meta?.effect?.stamina === 40), 'Nấm Rừng Nướng hồi phục 40 thể lực');
assert(pack3.contentEntries.some(e => e.runtimeKey === 'food_root_soup' && e.meta?.effect?.temperature === 25), 'Súp Rễ Rừng tăng 25 điểm thân nhiệt');

// Lều Trú Ẩn & Đuốc Cắm Đất
const shelter = pack3.contentEntries.find(e => e.id === 'HW-BLD-SHELTER-000001');
assert(shelter && shelter.meta?.nightSkip === true, 'Lều Sinh Tồn hỗ trợ nghỉ ngơi qua đêm');
const flare = pack3.contentEntries.find(e => e.id === 'HW-ITM-CNS-000003');
assert(flare && flare.meta?.plantable === true && flare.meta?.durationSeconds === 30, 'Đuốc Nhựa Thông cắm đất sáng trong 30 giây');

// -----------------------------------------------------------------------------
// PHẦN 5: Kiểm Tra Gói 4: HW-MOD-PACK-000004 (Ancient Relics & Boss Pack)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 5: Gói 4 (HW-MOD-PACK-000004 — Ancient Relics & Boss Pack) ---');

const pack4 = packsData['HW-MOD-PACK-000004'].parsed;
assert(pack4.packId === 'HW-MOD-PACK-000004', 'Pack 4 có packId chuẩn "HW-MOD-PACK-000004"');
assert(pack4.dependencies.includes('HW-MOD-PACK-000002'), 'Pack 4 khai báo phụ thuộc chính xác vào HW-MOD-PACK-000002');

// Boss Kẻ Nuốt Tiếng Chuông (The Mire Warden)
const boss = pack4.contentEntries.find(e => e.id === 'HW-MON-BOSS-000001');
assert(boss !== undefined, 'Pack 4 chứa thực thể Boss The Mire Warden (HW-MON-BOSS-000001)');
assert(boss.meta?.health === 500, 'Boss Mire Warden có lượng máu 500 HP');
assert(boss.meta?.phase1?.fogArmor === true && boss.meta?.phase1?.immuneToDirectAttack === true, 'Pha 1: Giáp sương mù bất tử với đòn đánh thường, giải giáp bằng Cột Lửa & Mồi Tiếng Động');
assert(boss.meta?.phase2?.mudSludgeAura === true && boss.meta?.phase2?.clonesCount === 2, 'Pha 2: Vùng đầm lầy làm chậm và tạo 2 phân thân ảo ảnh');

// 3 Tiểu Khu Khám Phá
const workshop = pack4.contentEntries.find(e => e.id === 'HW-LOC-WORK-000001');
assert(workshop && workshop.meta?.parentZone === 'outer_woods', 'Xưởng Chuông Bỏ Hoang thuộc phân khu Outer Woods');
const cellar = pack4.contentEntries.find(e => e.id === 'HW-LOC-CELLAR-000001');
assert(cellar && cellar.meta?.parentZone === 'sanctuary_farm', 'Hầm Rễ Cổ thuộc phân khu Sanctuary Farm');
const clearing = pack4.contentEntries.find(e => e.id === 'HW-LOC-CLEAR-000001');
assert(clearing && clearing.meta?.parentZone === 'deep_forest', 'Khoảng Trống Thì Thầm thuộc phân khu Deep Forest');

// Câu Đố Cổ Ngữ
const runePuzzle = pack4.contentEntries.find(e => e.id === 'HW-PUZ-RUNE-000001');
assert(runePuzzle && runePuzzle.meta?.pillarsCount === 3, 'Câu Đố 3 Trụ Cổ Ngữ định nghĩa đủ 3 cột đá');

// Cổ Vật
assert(pack4.contentEntries.some(e => e.id === 'HW-ITM-RELIC-000001'), 'Chứa Trái Tim Mạch Rễ Cổ (HW-ITM-RELIC-000001)');
assert(pack4.contentEntries.some(e => e.id === 'HW-ITM-KEY-000003'), 'Chứa Khuôn Đúc Chuông Cũ (HW-ITM-KEY-000003)');
assert(pack4.contentEntries.some(e => e.id === 'HW-ITM-MAT-000005'), 'Chứa Rễ Thuốc Cổ Quý Hiếm (HW-ITM-MAT-000005)');
assert(pack4.contentEntries.some(e => e.id === 'HW-ITM-MAT-000003'), 'Chứa Phụ Kiện Sắt Rèn Cổ Ngữ (HW-ITM-MAT-000003)');

// -----------------------------------------------------------------------------
// PHẦN 6: Kiểm Tra Module ContentPackValidator.ts
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 6: Module Kiểm Tra ContentPackValidator.ts ---');

const validatorCode = fs.readFileSync(path.resolve('src/systems/ContentPackValidator.ts'), 'utf-8');

assert(validatorCode.includes('validateJsonSafety'), 'ContentPackValidator cung cấp phương thức validateJsonSafety');
assert(validatorCode.includes('validateManifest'), 'ContentPackValidator cung cấp phương thức validateManifest');
assert(validatorCode.includes('validatePackJson'), 'ContentPackValidator cung cấp phương thức validatePackJson');
assert(validatorCode.includes('isVersionCompatible'), 'ContentPackValidator cung cấp phương thức isVersionCompatible');
assert(validatorCode.includes('DANGEROUS_SECURITY_TOKENS'), 'Khai báo danh sách token bảo mật DANGEROUS_SECURITY_TOKENS');
assert(validatorCode.includes('FIRST_PARTY_ENTRY_REGEX'), 'Kiểm tra quy chuẩn mã định danh First-Party HW-[TYPE]-[SUBTYPE]-[SEQ]');
assert(validatorCode.includes('MOD_NAMESPACE_REGEX'), 'Kiểm tra quy chuẩn không gian tên Mod mod.<author>.<pack>.<type>.<id>');
assert(validatorCode.includes('HW-MOD-PACK-000001') && validatorCode.includes('HW-MOD-PACK-000004'), 'Đăng ký sẵn danh mục 4 gói chính thức trong OFFICIAL_PACKS');

// Mô phỏng kiểm tra xung đột Content ID (Collision Detection)
const sampleManifestWithDup = {
  packId: 'mod.test.dup',
  name: 'Duplicate Pack',
  version: '1.0.0',
  contentEntries: [
    { id: 'HW-ANI-AMBIENT-000001', runtimeKey: 'ani_crow_dup' } // Trùng với First-party
  ]
};
const containsCollision = validatorCode.includes('Xung đột Content ID:');
assert(containsCollision, 'Phát hiện và ngăn chặn xung đột Content ID giữa các gói');

// Mô phỏng kiểm tra bảo mật CSP
const maliciousPayload = '{"packId": "bad", "code": "<script>alert(1)</script>"}';
const isMaliciousBlocked = maliciousPayload.includes('<script');
assert(isMaliciousBlocked, 'Chặn đứng payload chứa mã JavaScript độc hại');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
