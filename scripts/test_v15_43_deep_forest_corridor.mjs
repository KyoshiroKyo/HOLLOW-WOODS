/**
 * HOLLOW WOODS V1.5 - KIỂM TRA THÁO DỠ TƯỜNG BIÊN & GIẢI PHÓNG HỐC KẸT DEEP FOREST (V15-43)
 * File: scripts/test_v15_43_deep_forest_corridor.mjs
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
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

console.log('=== TEST V15-43: DEEP FOREST BOUNDARY REMOVAL & CORRIDOR UNSTUCK ===\n');

// 1. Kiểm tra AutoPerimeterWallsModule.ts
console.log('1. Kiểm tra cấu hình Tường Chu Vi Tự Động (AutoPerimeterWallsModule.ts):');
const autoPerimeterPath = path.join(projectRoot, 'src/world/modules/AutoPerimeterWallsModule.ts');
const autoPerimeterContent = fs.readFileSync(autoPerimeterPath, 'utf8');
assert(autoPerimeterContent.includes("zoneId === 'deep_forest'"), 'AutoPerimeter loại trừ deep_forest');
assert(autoPerimeterContent.includes("zoneId === 'sub_whispering_clearing'"), 'AutoPerimeter loại trừ sub_whispering_clearing');
assert(autoPerimeterContent.includes("zoneId === 'crooked_path'"), 'AutoPerimeter loại trừ crooked_path');

// 2. Kiểm tra WorldBuilder.ts
console.log('\n2. Kiểm tra Rỡ bỏ Tường Hộp Cũ & Dời Vật Thể trong WorldBuilder.ts:');
const wbPath = path.join(projectRoot, 'src/world/WorldBuilder.ts');
const wbContent = fs.readFileSync(wbPath, 'utf8');
assert(!wbContent.includes('Rặng Cây Viền Nam Tây Deep Forest'), 'Đã xóa khối collider Rặng Cây Viền Nam Tây Deep Forest');
assert(!wbContent.includes('Rặng Cây Viền Nam Giữa Deep Forest'), 'Đã xóa khối collider Rặng Cây Viền Nam Giữa Deep Forest');
assert(!wbContent.includes('Rặng Cây Viền Nam Đông Deep Forest'), 'Đã xóa khối collider Rặng Cây Viền Nam Đông Deep Forest');
assert(wbContent.includes('this.createStoneSign(1974, -70'), 'Biển báo Rừng Sâu đã lùi sang trái 36px (x=1974)');
assert(wbContent.includes('this.createChestPropWithBaseHitbox(1984, -80)'), 'Rương gỗ Rừng Sâu đã lùi sang trái 36px (x=1984) với hitbox gọn đáy');
assert(wbContent.includes('createChestPropWithBaseHitbox'), 'Có hàm createChestPropWithBaseHitbox');

// 3. Kiểm tra InventorySystem.ts
console.log('\n3. Kiểm tra Điểm Tài Nguyên trong InventorySystem.ts:');
const invPath = path.join(projectRoot, 'src/systems/InventorySystem.ts');
const invContent = fs.readFileSync(invPath, 'utf8');
assert(invContent.includes("id: 'node_wood_df_1'") && invContent.includes('x: 1994, y: -90'), 'Node gỗ khô node_wood_df_1 đã lùi sang trái 36px (x=1994, y=-90)');

// 4. Kiểm tra zones.json & map files
console.log('\n4. Kiểm tra Dữ Liệu Bản Đồ (zones.json & maps):');
const zonesPath = path.join(projectRoot, 'src/data/zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));

const dfZone = zonesData.zones.find(z => z.id === 'deep_forest');
const cpZone = zonesData.zones.find(z => z.id === 'crooked_path');
const swcZone = zonesData.zones.find(z => z.id === 'sub_whispering_clearing');

const hasDfBottom = (dfZone.colliders || []).some(c => c.id.startsWith('df_bound_bottom'));
const hasCpTop = (cpZone.colliders || []).some(c => c.id.startsWith('cp_bound_top'));
const hasWcRight = (swcZone.colliders || []).some(c => c.id === 'wc_bound_right');
const hasWcBottom = (swcZone.colliders || []).some(c => c.id.startsWith('wc_bound_bottom'));

assert(!hasDfBottom, 'zones.json: Đã xóa toàn bộ df_bound_bottom_* trong deep_forest');
assert(!hasCpTop, 'zones.json: Đã xóa toàn bộ cp_bound_top_* trong crooked_path');
assert(!hasWcRight, 'zones.json: Đã xóa tường dọc wc_bound_right trong sub_whispering_clearing');
assert(!hasWcBottom, 'zones.json: Đã xóa tường ngang wc_bound_bottom_* trong sub_whispering_clearing');
assert(swcZone.bounds.width === 370, 'zones.json: sub_whispering_clearing bounds width thu gọn về 370px');

// 5. Kiểm tra GameScene.ts
console.log('\n5. Kiểm tra GameScene.ts:');
const gameScenePath = path.join(projectRoot, 'src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');
assert(gameSceneContent.includes("'crooked_path:deep_forest'"), 'GameScene có seamless transition crooked_path -> deep_forest');
assert(gameSceneContent.includes("'deep_forest:crooked_path'"), 'GameScene có seamless transition deep_forest -> crooked_path');
assert(gameSceneContent.includes("'deep_forest:sub_whispering_clearing'"), 'GameScene có seamless transition deep_forest -> sub_whispering_clearing');
assert(gameSceneContent.includes("actionId === 'open_deep_forest_chest'"), 'GameScene có xử lý tương tác mở rương open_deep_forest_chest');

// 6. Kiểm tra SatyrPlayer.ts (Corner Sliding & WayfarerPlayer export)
console.log('\n6. Kiểm tra SatyrPlayer.ts:');
const playerPath = path.join(projectRoot, 'src/entities/SatyrPlayer.ts');
const playerContent = fs.readFileSync(playerPath, 'utf8');
assert(playerContent.includes('CORNER_THRESHOLD = 8'), 'SatyrPlayer đặt ngưỡng trượt góc CORNER_THRESHOLD = 8px');
assert(playerContent.includes('SLIDE_NUDGE = 2.5'), 'SatyrPlayer đặt SLIDE_NUDGE = 2.5px');
assert(playerContent.includes('pBody.velocity.x += nudgeX * 35'), 'SatyrPlayer áp dụng gia tốc quán tính khi trượt góc X');
assert(playerContent.includes('pBody.velocity.y += nudgeY * 35'), 'SatyrPlayer áp dụng gia tốc quán tính khi trượt góc Y');
assert(playerContent.includes('export const WayfarerPlayer = SatyrPlayer;'), 'SatyrPlayer xuất khẩu alias WayfarerPlayer');

console.log(`\n==================================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('TẤT CẢ CÁC ĐIỀU KIỆN V15-43 ĐÃ ĐẠT CHUẨN 100%!');
  process.exit(0);
}
