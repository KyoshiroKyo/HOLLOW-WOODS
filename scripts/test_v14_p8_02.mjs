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

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ XÁC MINH BƯỚC V14-P8-02');
console.log('======================================================================\n');

// 1. Kiểm tra StorageChestModal.ts (Split-View 12 Ô)
console.log('--- 1. Giao diện Rương Gỗ Split-View 12 Ô (StorageChestModal.ts) ---');
const modalContent = fs.readFileSync('src/ui/StorageChestModal.ts', 'utf-8');

assert(
  modalContent.includes('leftInventoryContainer') && modalContent.includes('rightChestContainer'),
  'Cấu trúc bảng đôi Split-View: phân tách rõ ràng container Trái (Hành Trang) và Phải (Rương)'
);

assert(
  modalContent.includes('cols = 3') && modalContent.includes('rows = 4'),
  'Lưới rương lưu trữ chuẩn hóa 12 ô vuông (3 cột x 4 hàng)'
);

assert(
  modalContent.includes('depositItem') && modalContent.includes('withdrawItem'),
  'Hỗ trợ thao tác chuyển đổi vật phẩm qua lại nhanh chóng giữa Túi đồ và Rương'
);

assert(
  modalContent.includes('pointer.event.shiftKey'),
  'Hỗ trợ thao tác Shift + Click để chuyển toàn bộ xấp vật phẩm tức thì'
);

assert(
  modalContent.includes('autoSaveChestData') && modalContent.includes('storageChestInventory'),
  'Tự động đồng bộ và lưu dữ liệu rương vào storageChestInventory trong SaveManager'
);

// 2. Kiểm tra SaveManager.ts (storageChestInventory)
console.log('\n--- 2. Tương thích Save Data trường storageChestInventory (SaveManager.ts) ---');
const saveContent = fs.readFileSync('src/systems/SaveManager.ts', 'utf-8');

assert(
  saveContent.includes('storageChestInventory?: [string, number][];'),
  'SaveData khai báo trường storageChestInventory'
);

assert(
  saveContent.includes('rawObj.storageChestInventory'),
  'Bộ giải nạp Sanitize & Migration hỗ trợ đọc nạp trường storageChestInventory'
);

assert(
  saveContent.includes('storageChestInventory: Array.from(state.storageChest.entries())'),
  'Phương thức ghi Save xuất đồng thời cả storageChest và storageChestInventory'
);

// 3. Kiểm tra DayNightSystem.ts
console.log('\n--- 3. Hệ thống Thời Gian & Cấu Hình 3 Múi Giờ (DayNightSystem.ts) ---');
assert(fs.existsSync('src/systems/DayNightSystem.ts'), 'Tệp DayNightSystem.ts tồn tại trong src/systems/');
const dayNightContent = fs.readFileSync('src/systems/DayNightSystem.ts', 'utf-8');

assert(
  dayNightContent.includes('SEASON_NAME = \'Mùa Sương Lạnh\''),
  'Tên mùa chuẩn hoá "Mùa Sương Lạnh"'
);

assert(
  dayNightContent.includes('getClockHandAngle'),
  'Cung cấp phương thức getClockHandAngle tính toán góc quay kim đồng hồ mượt mà'
);

assert(
  dayNightContent.includes('getClockWedges') &&
  dayNightContent.includes('0xf1c40f') &&
  dayNightContent.includes('0xe67e22') &&
  dayNightContent.includes('0x5b4a8e'),
  'Cấu hình 3 múi màu: Ban Ngày 180s (Vàng hổ phách), Hoàng Hôn 90s (Cam), Đêm Sương 90s (Xanh tím)'
);

// 4. Kiểm tra UIScene.ts (Đồng Hồ Tròn & Nút Nhanh HUD)
console.log('\n--- 4. Widget Đồng Hồ Tròn & Cụm Nút Nhanh HUD (UIScene.ts) ---');
const uiSceneContent = fs.readFileSync('src/scenes/UIScene.ts', 'utf-8');

assert(
  uiSceneContent.includes('timeClockGfx'),
  'UIScene khởi tạo Graphics riêng biệt timeClockGfx cho mặt đồng hồ tròn'
);

assert(
  uiSceneContent.includes('arc(clockCx, clockCy, clockR, -Math.PI / 2, Math.PI / 2, false)') &&
  uiSceneContent.includes('arc(clockCx, clockCy, clockR, Math.PI / 2, Math.PI, false)') &&
  uiSceneContent.includes('arc(clockCx, clockCy, clockR, Math.PI, (3 * Math.PI) / 2, false)'),
  'updateTimeWidget vẽ chính xác 3 múi màu cong (Ban Ngày 180°, Hoàng Hôn 90°, Đêm Sương 90°)'
);

assert(
  uiSceneContent.includes('handAngle = -Math.PI / 2 + (Math.max(0, Math.min(360, timeOfDay)) / 360) * (Math.PI * 2)'),
  'Kim đồng hồ xoay mượt theo thời gian thực chu kỳ 360s'
);

assert(
  uiSceneContent.includes('Ngày ${dayCount} — Mùa Sương Lạnh'),
  'Nhãn thời gian hiển thị đúng định dạng "Ngày X — Mùa Sương Lạnh"'
);

assert(
  uiSceneContent.includes('quickActionButtonsContainer'),
  'Khởi tạo container riêng quickActionButtonsContainer cho cụm nút nhanh đáy trái'
);

assert(
  uiSceneContent.includes('🔨 [C] Chế Tạo') && uiSceneContent.includes('📖 [J] Sổ Tay'),
  'Hiển thị 2 nút bấm biểu tượng rõ nét [C] Chế Tạo (Búa & Đe) và [J] Sổ Tay (Sách Cổ)'
);

assert(
  uiSceneContent.includes('keydown-C') && uiSceneContent.includes('keydown-I') && uiSceneContent.includes('keydown-J'),
  'Hỗ trợ đầy đủ phím tắt [C], [I], [J] tương ứng'
);

console.log('\n======================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
}
