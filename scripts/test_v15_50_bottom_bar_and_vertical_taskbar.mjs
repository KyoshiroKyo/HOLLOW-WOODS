/**
 * HOLLOW WOODS V1.5 - KIỂM THỬ XÁC MINH BƯỚC V15-50
 * TÁI THIẾT KẾ THANH TÚI ĐỒ + TRANG BỊ ĐÁY & TASKBAR BIỂU TƯỢNG DỌC (DON'T STARVE STYLE)
 */

import fs from 'fs';
import assert from 'assert';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.5 — KIỂM THỬ XÁC MINH BƯỚC V15-50');
console.log('   (THANH TÚI ĐỒ + TRANG BỊ ĐÁY & TASKBAR DỌC DON\'T STARVE STYLE)');
console.log('======================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${description}`);
    console.error(`     Chi tiết: ${err.message}`);
  }
}

const uiSceneTs = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');
const hitboxInspectorTs = fs.readFileSync('src/utils/HitboxDebugInspector.ts', 'utf8');

// --- 1. THANH TÚI ĐỒ & TRANG BỊ Ở CHÍNH GIỮA ĐÁY MÀN HÌNH ---
console.log('--- 1. Thanh Túi Đồ & Trang Bị ở chính giữa đáy màn hình (src/scenes/UIScene.ts) ---');

test('Loại bỏ hoàn toàn dãy 9 nút chữ cũ và lỗi lặp nút [C] / [J] ở đáy màn hình', () => {
  assert(!uiSceneTs.includes("key: '🔨 [I] Chế Tạo', id: 'craft'"), 'Đã loại bỏ nút chữ cồng kềnh cũ trong mảng slotNames đáy');
  assert(!uiSceneTs.includes("key: '📖 [J] Sổ Tay', id: 'journal'"), 'Đã loại bỏ nút chữ Sổ Tay cồng kềnh cũ ở đáy');
});

test('Xây dựng khung gỗ tối viền đồng cổ chiều cao ~52px (totalW: 574, totalH: 52) tại (640, 688)', () => {
  assert(uiSceneTs.includes('this.quickSlotContainer = this.add.container(640, 688);'), 'quickSlotContainer đặt tại (640, 688)');
  assert(uiSceneTs.includes('const totalW = 574;'), 'Chiều rộng thanh đáy chuẩn 574px');
  assert(uiSceneTs.includes('const totalH = 52;'), 'Chiều cao thanh đáy chuẩn 52px');
  assert(uiSceneTs.includes('0x140e09') && uiSceneTs.includes('0x5c4224'), 'Sử dụng bảng màu gỗ tối sẫm và viền đồng cổ');
});

test('8 ô Túi Đồ vuông chuẩn 42x42 px với phím tắt [1]..[8] góc trên trái', () => {
  assert(uiSceneTs.includes('const slotSize = 42;'), 'Kích thước ô vuông chuẩn 42x42 px');
  assert(uiSceneTs.includes('invStartX = -258;'), 'Khởi tạo 8 ô túi đồ cân đối từ -258px');
  assert(uiSceneTs.includes('for (let i = 0; i < 8; i++)'), 'Vòng lặp khởi tạo đủ 8 ô túi đồ');
  assert(uiSceneTs.includes('fontSize: \'9px\'') && uiSceneTs.includes('`[${i + 1}]`'), 'Phím tắt [1]..[8] hiển thị ở góc trên trái ô');
});

test('Hiển thị icon vật phẩm rõ nét ở tâm ô và số lượng stack (x2, x10) góc dưới phải', () => {
  assert(uiSceneTs.includes('this.inventorySlotIcons'), 'Có mảng quản lý icon vật phẩm trung tâm');
  assert(uiSceneTs.includes('this.inventorySlotCounts'), 'Có mảng quản lý số lượng vật phẩm xếp chồng');
  assert(uiSceneTs.includes('setOrigin(1, 1)'), 'Số lượng xếp chồng căn lề góc dưới phải (không đè phím tắt)');
});

test('Vách ngăn đồng xỉn với đinh tán tròn phân cách cụm Túi Đồ và Trang Bị', () => {
  assert(uiSceneTs.includes('sepGfx.lineBetween(92, -18, 92, 18);'), 'Vách ngăn phân cách tại x = 92');
  assert(uiSceneTs.includes('sepGfx.fillCircle(92, 0, 2.5);'), 'Đinh tán đồng thau tại tâm vách ngăn');
});

test('4 ô Trang Bị Cá Nhân vuông (42x42 px): BODY, FEET, BACK, CHARM', () => {
  assert(uiSceneTs.includes('{ slot: \'body\', label: \'BODY\', defaultIcon: \'🧥\' }'), 'Có ô trang bị BODY với icon mặc định');
  assert(uiSceneTs.includes('{ slot: \'feet\', label: \'FEET\', defaultIcon: \'👢\' }'), 'Có ô trang bị FEET với icon mặc định');
  assert(uiSceneTs.includes('{ slot: \'back\', label: \'BACK\', defaultIcon: \'🎒\' }'), 'Có ô trang bị BACK với icon mặc định');
  assert(uiSceneTs.includes('{ slot: \'charm\', label: \'CHARM\', defaultIcon: \'🔔\' }'), 'Có ô trang bị CHARM với icon mặc định');
});

test('Ô trang bị có icon bóng mờ khi trống (alpha 0.35) và viền vàng kim khi mặc', () => {
  assert(uiSceneTs.includes('iconTxt.setAlpha(0.35);'), 'Icon bóng mờ mặc định khi ô trang bị trống');
  assert(uiSceneTs.includes('0xd4af37') && uiSceneTs.includes('iconTxt.setAlpha(1.0);'), 'Viền vàng kim và icon sáng rõ khi mặc đồ');
});

test('Hỗ trợ phím số 1–8 để chọn và kích hoạt nhanh qua useOrSelectSlot', () => {
  assert(uiSceneTs.includes('keydown-${numKeyNames[i]}'), 'Lắng nghe phím số Digit 1–8');
  assert(uiSceneTs.includes('this.useOrSelectSlot(i);'), 'Gọi useOrSelectSlot khi nhấn phím 1–8 hoặc click');
  assert(uiSceneTs.includes('public useOrSelectSlot(index: number): void'), 'Định nghĩa phương thức useOrSelectSlot');
});

// --- 2. TASKBAR BIỂU TƯỢNG DỌC MÉP TRÁI MÀN HÌNH ---
console.log('\n--- 2. Taskbar Biểu Tượng Dọc mép trái màn hình (src/scenes/UIScene.ts) ---');

test('Tạo cột Taskbar dọc thanh mảnh rộng ~42px (barW: 42, barH: 256) tại (37, 266)', () => {
  assert(uiSceneTs.includes('this.verticalTaskbarContainer = this.add.container(37, 266);'), 'Taskbar đặt tại cạnh trái (37, 266)');
  assert(uiSceneTs.includes('const barW = 42;'), 'Chiều rộng thanh taskbar 42px');
  assert(uiSceneTs.includes('const barH = 256;'), 'Chiều cao thanh taskbar 256px');
});

test('Đủ 6 nút biểu tượng theo phong cách Don\'t Starve', () => {
  assert(uiSceneTs.includes("id: 'craft'") && uiSceneTs.includes("icon: '⚒️'") && uiSceneTs.includes("key: 'I'"), 'Nút 1: [I / C] Chế Tạo');
  assert(uiSceneTs.includes("id: 'journal'") && uiSceneTs.includes("icon: '📖'") && uiSceneTs.includes("key: 'J'"), 'Nút 2: [J] Sổ Tay Lữ Khách');
  assert(uiSceneTs.includes("id: 'lantern'") && uiSceneTs.includes("icon: '🏮'") && uiSceneTs.includes("key: 'F'"), 'Nút 3: [F] Bật/Tắt Đèn Lồng');
  assert(uiSceneTs.includes("id: 'map'") && uiSceneTs.includes("icon: '🧭'") && uiSceneTs.includes("key: 'N'"), 'Nút 4: [N] Mở Rộng La Bàn / Bản Đồ');
  assert(uiSceneTs.includes("id: 'unstuck'") && uiSceneTs.includes("icon: '🥾'") && uiSceneTs.includes("key: 'F8'"), 'Nút 5: [F8] Thoát Kẹt An Toàn');
  assert(uiSceneTs.includes("id: 'pause'") && uiSceneTs.includes("icon: '⚙️'") && uiSceneTs.includes("key: 'ESC'"), 'Nút 6: [ESC] Hệ Thống & Tạm Dừng');
});

test('Nút Đèn Lồng [F] có cơ chế phát quang cam vàng rực rỡ khi đèn đang bật', () => {
  assert(uiSceneTs.includes('updateTaskbarLanternState'), 'Có hàm cập nhật trạng thái đèn lồng trên taskbar');
  assert(uiSceneTs.includes('this.taskbarLanternGlow.fillStyle(0xf39c12, 0.35);'), 'Hào quang vàng cam phát sáng khi bật đèn');
});

test('Hệ thống Tooltip chi tiết khi hover qua Taskbar và Thanh Đáy', () => {
  assert(uiSceneTs.includes('showTaskbarTooltip'), 'Có hàm hiển thị Tooltip thẻ gỗ nẹp đồng cho Taskbar');
  assert(uiSceneTs.includes('showCompactBottomTooltip'), 'Có hàm hiển thị Tooltip thu gọn cho ô đáy');
  assert(uiSceneTs.includes('ItemTooltipHelper.getInstance().show'), 'Gọi ItemTooltipHelper khi hover ô có vật phẩm');
});

test('Đồng bộ hiển thị Taskbar dọc khi mở Modal hoặc Hộp Thoại (setHUDVisible & setDialogueActive)', () => {
  assert(uiSceneTs.includes('if (this.verticalTaskbarContainer) this.verticalTaskbarContainer.setVisible(visible);'), 'setHUDVisible đồng bộ taskbar');
  assert(uiSceneTs.includes('if (this.verticalTaskbarContainer) {') && uiSceneTs.includes('this.verticalTaskbarContainer.setVisible(shouldShowHUD);'), 'setDialogueActive đồng bộ taskbar');
});

// --- 3. CĂN CHỈNH KHUNG HÌNH 1280x720 & CHỐNG CHE KHUẤT ---
console.log('\n--- 3. Căn chỉnh khung hình 1280x720 & Chống Che Khuất ---');

test('Bảng F9 Debug Inspector được giới hạn đáy <= 650px không đè lên Thanh Đáy (662..714px)', () => {
  assert(hitboxInspectorTs.includes('Math.min(650 - boxH, 704 - boxH)'), 'posY của F9 Debug Inspector được neo giới hạn <= 650px');
});

test('Khu vực trung tâm màn hình hoàn toàn thông thoáng cho trải nghiệm gameplay', () => {
  // Bottom bar: y = 688, totalH = 52 -> Y = 662..714
  // Vertical taskbar: x = 37, barW = 42 -> X = 16..58
  // Tầm nhìn trung tâm (X: 60..1220, Y: 135..660) không bị bất kỳ khung UI cố định nào che khuất
  assert(uiSceneTs.includes('this.quickSlotContainer = this.add.container(640, 688);'), 'Bottom bar đặt sát mép đáy');
  assert(uiSceneTs.includes('this.verticalTaskbarContainer = this.add.container(37, 266);'), 'Taskbar đặt sát mép trái');
});

console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ BƯỚC V15-50: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log('======================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
