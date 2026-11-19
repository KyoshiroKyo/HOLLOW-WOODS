/**
 * Automated Verification Script for Step V15-54:
 * Light Aura & Sanity Overhaul (Hào Quang [F], Giảm Đèn Đường, Đổi tên thành "Tinh Thần")
 */

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

console.log('--- 1. Kiểm tra SatyrPlayer.ts: Vòng Sáng Ấm Dịu & Chi Phí 10 Thể Lực ---');
const playerSrc = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf8');
assert(playerSrc.includes('stats.stamina < 10'), 'toggleLantern kiểm tra Thể Lực < 10 trước khi bật sáng');
assert(playerSrc.includes('stats.stamina = Math.max(0, this.stats.stamina - 10)'), 'toggleLantern trừ 10 điểm Thể Lực khi bật sáng');
assert(playerSrc.includes('Không đủ Thể Lực để nhóm lửa hộ tâm! (Cần 10 Thể Lực)'), 'Có cảnh báo khi Thể Lực không đủ 10');
assert(!playerSrc.includes('fillCircle(lx, ly, 9)'), 'Đã xóa khối tròn đặc đèn lồng cứng cũ');
assert(playerSrc.includes('Soft Radial Warm Aura') || playerSrc.includes('0xf39c12, 0.02'), 'Có vòng sáng ấm dịu chuyển sắc mịn');

console.log('\n--- 2. Kiểm tra SurvivalSystem.ts: Tiêu Hao 1.2 Thể Lực/giây & Tự Tắt khi Cạn Kiệt ---');
const survivalSrc = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf8');
assert(survivalSrc.includes('1.2 * deltaSeconds') || survivalSrc.includes('1.2 *'), 'Có tiêu hao 1.2 Thể Lực/giây khi bật hào quang sáng');
assert(survivalSrc.includes('stats.stamina < 5') || survivalSrc.includes('stats.stamina < 5.0'), 'Tự động tắt khi Thể Lực < 5');
assert(survivalSrc.includes('lantern_exhausted'), 'Phát event lantern_exhausted khi cạn Thể Lực');

console.log('\n--- 3. Kiểm tra UIScene.ts: Khung 3 Thanh Chỉ Số Chuẩn & Hương Trầm Tinh Thần ---');
const uiSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');
assert(uiSrc.includes('fillRoundedRect(14, 10, 376, 80, 6)'), 'Khung chỉ số thu gọn còn 80px (3 thanh chuẩn)');
assert(uiSrc.includes('Tinh Thần:'), 'Nhãn chỉ số đổi sang Tinh Thần');
assert(uiSrc.includes('✨ [F] SÁNG: BẬT') && uiSrc.includes('🌑 [F] SÁNG: TẮT'), 'Nút trạng thái đổi sang Hào Quang Sáng Bật/Tắt');
assert(uiSrc.includes('Hương Trầm Tinh Thần') && uiSrc.includes('composure + 25'), 'tryConsumeLanternOil sử dụng Hương Trầm Tinh Thần (+25 Tinh Thần)');
assert(uiSrc.includes('bY = 98') && uiSrc.includes('tY = 98'), 'Hàng huy hiệu phụ cập nhật khớp y: 98px');

console.log('\n--- 4. Kiểm tra WorldBuilder.ts: Giảm 45% Đèn Đường & Giữ Đúng 3 Cột Đèn Trung Tâm Làng ---');
const worldSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
const lanternCalls = worldSrc.match(/this\.createVillageLanternPost\(/g) || [];
assert(lanternCalls.length === 3, `Số lượng cột đèn đường trong toàn bộ game đúng bằng 3 (thực tế: ${lanternCalls.length})`);
assert(worldSrc.includes('this.createVillageLanternPost(482, 195)'), 'Giữ cột đèn tại Cổng Tây (482, 195)');
assert(worldSrc.includes('this.createVillageLanternPost(780, 250)'), 'Giữ cột đèn Quảng Trường Trung Tâm (780, 250)');
assert(worldSrc.includes('this.createVillageLanternPost(900, 335)'), 'Giữ cột đèn Nam Quảng Trường (900, 335)');
assert(worldSrc.includes('0.028') && worldSrc.includes('0.050') && worldSrc.includes('0.088'), 'Giảm 45% alpha hào quang đèn đường');

console.log('\n--- 5. Kiểm tra items.json & dialogues.json: Sạch 100% "Bình Tâm" & "Dầu Đèn" ---');
const itemsJson = fs.readFileSync('src/data/items.json', 'utf8');
const dialoguesJson = fs.readFileSync('src/data/dialogues.json', 'utf8');
const itemsHasOld = itemsJson.includes('Bình Tâm') || itemsJson.includes('Dầu Đèn');
const dialoguesHasOld = dialoguesJson.includes('Bình Tâm') || dialoguesJson.includes('Dầu Đèn') || dialoguesJson.includes('bình tâm') || dialoguesJson.includes('dầu đèn');
assert(!itemsHasOld, 'items.json sạch 100% không còn "Bình Tâm" hay "Dầu Đèn"');
assert(!dialoguesHasOld, 'dialogues.json sạch 100% không còn "Bình Tâm" hay "Dầu Đèn"');

const parsedItems = JSON.parse(itemsJson);
const incenseItem = parsedItems.items.find(i => i.id === 'item_lantern_oil');
assert(incenseItem && incenseItem.name === 'Hương Trầm Tinh Thần', 'item_lantern_oil có tên là "Hương Trầm Tinh Thần"');
assert(incenseItem && incenseItem.effects && incenseItem.effects.composure === 25, 'Hương Trầm Tinh Thần hồi phục +25 Tinh Thần');

const incenseRecipe = parsedItems.recipes.find(r => r.id === 'craft_lantern_oil');
assert(incenseRecipe && incenseRecipe.name === 'Luyện Hương Trầm Tinh Thần', 'Công thức craft_lantern_oil là "Luyện Hương Trầm Tinh Thần"');

console.log('\n--- TỔNG KẾT KIỂM TOÁN TỰ ĐỘNG V15-54 ---');
console.log(`Passed: ${passed} | Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('>>> TẤT CẢ CÁC BƯỚC KIỂM TOÁN V15-54 THÀNH CÔNG RỰC RỠ! <<<');
}
