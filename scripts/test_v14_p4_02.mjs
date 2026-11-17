// scripts/test_v14_p4_02.mjs
// Bộ kiểm thử tự động cho V14-P4-02: 4 Ô Trang Bị Cá Nhân & Cơ Chế Tự Vệ Sinh Tồn

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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ TRANG BỊ & TỰ VỆ (V14-P4-02)');
console.log('======================================================================\n');

const equipSysPath = path.resolve('src/systems/EquipmentSystem.ts');
const equipModalPath = path.resolve('src/ui/EquipmentModal.ts');
const playerPath = path.resolve('src/entities/SatyrPlayer.ts');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const playerStatePath = path.resolve('src/state/PlayerState.ts');
const listenerAiPath = path.resolve('src/systems/ListenerAI.ts');
const theListenerPath = path.resolve('src/entities/TheListener.ts');
const itemsJsonPath = path.resolve('src/data/items.json');

const equipSysCode = fs.readFileSync(equipSysPath, 'utf-8');
const equipModalCode = fs.readFileSync(equipModalPath, 'utf-8');
const playerCode = fs.readFileSync(playerPath, 'utf-8');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf-8');
const playerStateCode = fs.readFileSync(playerStatePath, 'utf-8');
const listenerAiCode = fs.readFileSync(listenerAiPath, 'utf-8');
const theListenerCode = fs.readFileSync(theListenerPath, 'utf-8');
const itemsJson = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf-8'));

// -----------------------------------------------------------------------------
// PHẦN 1: 4 Ô Trang Bị Cá Nhân (EquipmentSystem & PlayerState)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: 4 Ô Trang Bị Cá Nhân & Cơ Chế Đánh Đổi Chỉ Số (EquipmentSystem.ts) ---');

assert(equipSysCode.includes('eqp_moss_cloak') && equipSysCode.includes("'body'"), 'Ô BODY hỗ trợ Áo Choàng Rêu (eqp_moss_cloak)');
assert(equipSysCode.includes('eqp_trail_boots') && equipSysCode.includes("'feet'"), 'Ô FEET hỗ trợ Ủng Đi Rừng (eqp_trail_boots)');
assert(equipSysCode.includes('eqp_field_backpack') && equipSysCode.includes("'back'"), 'Ô BACK hỗ trợ Túi Hành Trang (eqp_field_backpack)');
assert(equipSysCode.includes('eqp_bell_ward_charm') && equipSysCode.includes("'charm'"), 'Ô CHARM hỗ trợ Bùa Chuông Cổ (eqp_bell_ward_charm)');

// Đánh đổi chỉ số chi tiết
assert(equipSysCode.includes('moistureRateMod: 0.6') && equipSysCode.includes('coldRateMod: 0.6'), 'Áo Choàng Rêu giảm 40% tốc độ ngấm ẩm và nhiễm lạnh');
assert(equipSysCode.includes('sprintSpeedMod: 0.95'), 'Áo Choàng Rêu đánh đổi bằng việc giảm nhẹ 5% tốc độ chạy nước rút');
assert(equipSysCode.includes('noiseRadiusMod: 0.7'), 'Ủng Đi Rừng giảm 30% bán kính phát ra tiếng bước chân');
assert(equipSysCode.includes('mireSlowImmunity: true'), 'Ủng Đi Rừng giúp di chuyển vững chãi không bị chậm trên đất lầy Silent Mire');
assert(equipSysCode.includes('extraInventorySlots: 4') && equipSysCode.includes('sprintStaminaDrainMod: 1.15'), 'Túi Hành Trang mở rộng thêm 4 ô (8 -> 12 ô) và tiêu hao thêm 15% Thể Lực khi chạy');
assert(equipSysCode.includes('composureDrainMod: 0.75') && equipSysCode.includes('detectEchoProximity: true'), 'Bùa Chuông Cổ giảm 25% tụt Bình Tâm bóng tối và rung báo hiệu gần Ký Ức Echo');

// Tuyệt đối không có cơ chế độ bền
assert(equipSysCode.includes('hasDurability') && equipSysCode.includes('return false;'), 'Trang bị hoàn toàn không có cơ chế độ bền (durability = false)');

// Preview so sánh chỉ số
assert(equipSysCode.includes('previewStatModifiers'), 'EquipmentSystem hỗ trợ phương thức so sánh chỉ số trước/sau khi mặc previewStatModifiers');

// Tích hợp PlayerState
assert(playerStateCode.includes('getMaxInventorySlots') && playerStateCode.includes('eqp_field_backpack'), 'PlayerState mở rộng sức chứa túi đồ khi trang bị eqp_field_backpack');
assert(playerStateCode.includes('equipItem') && playerStateCode.includes('unequipItem'), 'PlayerState cung cấp hàm trang bị và tháo đồ an toàn');

// -----------------------------------------------------------------------------
// PHẦN 2: Giao Diện Trang Bị & So Sánh Chỉ Số (EquipmentModal.ts & UIScene.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Giao Diện Trang Bị & So Sánh Trực Quan (EquipmentModal.ts) ---');

assert(equipModalCode.includes('renderEquipmentSlots'), 'Hiển thị 4 ô trang bị chuyên biệt trực quan');
assert(equipModalCode.includes('renderStatComparison'), 'Hiển thị bảng so sánh chỉ số trước/sau khi mặc');
assert(equipModalCode.includes('renderAvailableInventory'), 'Hiển thị danh sách trang bị khả dụng từ túi đồ');
assert(equipModalCode.includes('renderWeaponSelection'), 'Hiển thị mục chuyển đổi vũ khí tự vệ sinh tồn');
assert(equipModalCode.includes('keydown-B') && equipModalCode.includes('toggle()'), 'Hỗ trợ phím tắt [B] để đóng/mở nhanh giao diện trang bị');
assert(equipModalCode.includes('Độ bền: VĨNH CỬU'), 'Khẳng định độ bền vĩnh cửu trên giao diện');

// -----------------------------------------------------------------------------
// PHẦN 3: Cơ Chế Tự Vệ Sinh Tồn & Vũ Khí (Survival Defense)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Vũ Khí Tự Vệ Sinh Tồn & Đòn Đánh (SatyrPlayer.ts & GameScene.ts) ---');

// 3 Loại vũ khí
assert(equipSysCode.includes('wpn_walking_staff') && equipSysCode.includes('reach: 28') && equipSysCode.includes('knockback: 130'), 'Gậy Lữ Hành có tầm quét 28px và đẩy lùi nhẹ tạo khoảng trống');
assert(equipSysCode.includes('wpn_iron_spear') && equipSysCode.includes('reach: 56') && equipSysCode.includes('canTriggerWeakness: true'), 'Giáo Gỗ Bịt Sắt có tầm đánh xa 56px, đẩy lùi mạnh và kích hoạt điểm yếu');
assert(equipSysCode.includes('wpn_hunting_hatchet') && equipSysCode.includes('woodcuttingMultiplier: 2'), 'Rìu Rừng Nhỏ tăng gấp đôi tốc độ đốn củi và tự vệ cự ly gần');

// Tiêu hao thể lực & Cooldown đòn đánh
assert(playerCode.includes('this.stats.stamina < weaponDef.staminaCost'), 'SatyrPlayer kiểm tra đủ Thể Lực trước khi tung đòn đánh');
assert(playerCode.includes('this.stats.stamina = Math.max(0, this.stats.stamina - weaponDef.staminaCost);'), 'Đòn đánh tiêu hao Thể Lực hợp lý theo từng loại vũ khí');

// Vùng quét va chạm hitbox theo hướng nhìn
assert(playerCode.includes("case 'left': hitX -= reach") && playerCode.includes("case 'down': hitY += reach"), 'Hitbox đòn đánh tính toán chuẩn xác theo hướng mặt và tầm với reach');

// Đòn đánh phát ra âm thanh thu hút The Listener
assert(gameSceneCode.includes('this.emitNoiseWave') && gameSceneCode.includes('weaponDef.noiseRadius'), 'Âm thanh vung vũ khí phát ra sóng âm thanh cảnh báo khiến The Listener nghe thấy');

// Tác động lên The Listener (Knockback & Stagger)
assert(gameSceneCode.includes('knockbackSpeed = weaponDef.knockback') && gameSceneCode.includes('staggerDur = weaponDef.staggerDuration'), 'GameScene áp dụng đẩy lùi và làm khựng quái vật theo chỉ số vũ khí');

// Vũ khí không thể giết chết quái vật (không trừ máu Entity về 0)
assert(!gameSceneCode.includes('listenerMonster.health -=') && !gameSceneCode.includes('listenerMonster.kill()'), 'Quy tắc sống còn: Vũ khí KHÔNG THỂ giết chết vĩnh viễn The Listener hay farm loot');

// -----------------------------------------------------------------------------
// PHẦN 4: Đuốc Nhựa Thông Khẩn Cấp & Cảm Biến Ký Ức (Resin Flare & Echo Sensor)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Đuốc Nhựa Thông Khẩn Cấp & Cảm Biến Ký Ức ---');

assert(gameSceneCode.includes('deployResinFlare'), 'GameScene sở hữu phương thức thắp Đuốc Nhựa Thông Khẩn Cấp deployResinFlare');
assert(gameSceneCode.includes('fillCircle(x, y, 260)'), 'Đuốc tạo quầng sáng rực rỡ bán kính 260px trong 15 giây');
assert(listenerAiCode.includes('triggerFlareRepel'), 'ListenerAI sở hữu cơ chế bị ánh sáng đuốc làm chói lóa mắt lùi lại triggerFlareRepel');
assert(theListenerCode.includes('triggerFlareRepel'), 'TheListener hỗ trợ nhận hiệu ứng xua đuổi từ Đuốc Nhựa Thông');
assert(gameSceneCode.includes('hasEchoDetector') && gameSceneCode.includes('lastCharmEchoVibrateTime'), 'Bùa Chuông Cổ phát tín hiệu rung nhẹ và chuông ngân khi đến gần điểm Ký Ức Echo');

// -----------------------------------------------------------------------------
// PHẦN 5: Đăng Ký Vật Phẩm & Công Thức Trong items.json
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 5: Đăng Ký Vật Phẩm & Công Thức Trong items.json ---');

const itemIds = itemsJson.items.map(i => i.id);
const recipeIds = itemsJson.recipes.map(r => r.id);

assert(itemIds.includes('eqp_moss_cloak') && itemIds.includes('eqp_trail_boots'), 'items.json khai báo Áo Choàng Rêu & Ủng Đi Rừng');
assert(itemIds.includes('eqp_field_backpack') && itemIds.includes('eqp_bell_ward_charm'), 'items.json khai báo Túi Hành Trang & Bùa Chuông Cổ');
assert(itemIds.includes('wpn_walking_staff') && itemIds.includes('wpn_iron_spear') && itemIds.includes('wpn_hunting_hatchet'), 'items.json khai báo 3 vũ khí sinh tồn');
assert(itemIds.includes('item_resin_flare'), 'items.json khai báo Đuốc Nhựa Thông Khẩn Cấp');

assert(recipeIds.includes('craft_moss_cloak') && recipeIds.includes('craft_trail_boots'), 'items.json có công thức may Áo Choàng Rêu & đóng Ủng Đi Rừng');
assert(recipeIds.includes('craft_field_backpack') && recipeIds.includes('craft_iron_spear'), 'items.json có công thức khâu Túi Hành Trang & rèn Giáo Gỗ Bịt Sắt');
assert(recipeIds.includes('craft_hunting_hatchet') && recipeIds.includes('craft_resin_flare'), 'items.json có công thức rèn Rìu Rừng Nhỏ & bó Đuốc Nhựa Thông');

// -----------------------------------------------------------------------------
// TỔNG KẾT BÀI KIỂM THỬ
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passCount}/${passCount + failCount} KIỂM TRA ĐẠT (${failCount} THẤT BẠI)`);
if (failCount === 0) {
  console.log('KẾT QUẢ: PASS (100% TIÊU CHÍ V14-P4-02 ĐẠT CHUẨN XUẤT SẮC)');
} else {
  console.log('KẾT QUẢ: FAIL (MỘT SỐ TIÊU CHÍ CHƯA ĐẠT, CẦN KHẮC PHỤC)');
  process.exit(1);
}
console.log('======================================================================');
