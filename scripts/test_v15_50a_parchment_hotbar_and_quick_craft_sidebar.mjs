/**
 * HOLLOW WOODS V1.5 - KIỂM THỬ XÁC MINH BƯỚC V15-50A
 * THANH TÚI ĐỒ 8 Ô NỀN GIẤY DA SÁNG ẤM + 4 Ô TRANG BỊ & THANH GHIM NHANH DỌC (PINNED PAGES QUICK CRAFT - DST STYLE)
 */

import fs from 'fs';
import assert from 'assert';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.5 — KIỂM THỬ XÁC MINH BƯỚC V15-50A');
console.log('   (THANH TÚI ĐỒ GIẤY DA SÁNG + TRANG BỊ & THANH GHIM NHANH DỌC DST)');
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
const quickCraftSidebarTs = fs.readFileSync('src/ui/QuickCraftSidebar.ts', 'utf8');

// --- 1. THANH TÚI ĐỒ 8 Ô NỀN GIẤY DA SÁNG ẤM & 4 Ô TRANG BỊ ĐÁY ---
console.log('--- 1. Thanh Túi Đồ 8 Ô Nền Giấy Da Sáng Ấm & 4 Ô Trang Bị Đáy (src/scenes/UIScene.ts) ---');

test('Khung gỗ tối viền đồng cổ chiều cao ~52px đặt gọn chính giữa đáy tại (640, 688)', () => {
  assert(uiSceneTs.includes('this.quickSlotContainer = this.add.container(640, 688);'), 'quickSlotContainer đặt tại (640, 688)');
  assert(uiSceneTs.includes('const totalW = 574;'), 'Chiều rộng chuẩn 574px');
  assert(uiSceneTs.includes('const totalH = 52;'), 'Chiều cao chuẩn 52px');
});

test('8 ô Túi Đồ vuông (42x42 px) có nền giấy da sáng ấm (Warm Parchment) bên trong', () => {
  assert(uiSceneTs.includes('const slotSize = 42;'), 'Kích thước ô vuông chuẩn 42x42 px');
  assert(uiSceneTs.includes('invStartX = -258;'), 'Khởi tạo từ invStartX = -258px');
  assert(uiSceneTs.includes('0xdfd3b6') || uiSceneTs.includes('0xede4d1'), 'Sử dụng màu giấy da sáng ấm (0xdfd3b6 / 0xede4d1) bên trong ô');
  assert(uiSceneTs.includes('slotSize - 4, slotSize - 4'), 'Ô giấy da sáng nằm gọn gàng bên trong khung viền gỗ');
});

test('Phím tắt [1]..[8] ở góc trên trái ô hiển thị sắc nét trên nền giấy sáng', () => {
  assert(uiSceneTs.includes("fontSize: '9px'") && uiSceneTs.includes('`[${i + 1}]`'), 'Phím tắt [1]..[8] hiển thị ở góc trên trái');
  assert(uiSceneTs.includes('this.inventorySlotKeyTexts'), 'Có mảng lưu trữ tham chiếu nhãn phím tắt');
});

test('Icon vật phẩm ở giữa và số lượng xếp chồng góc dưới phải không bao giờ đè viền', () => {
  assert(uiSceneTs.includes("fontSize: '18px'") && uiSceneTs.includes('this.inventorySlotIcons'), 'Icon trung tâm font size 18px');
  assert(uiSceneTs.includes('setOrigin(1, 1)'), 'Số lượng xếp chồng neo góc dưới phải (1, 1)');
  assert(uiSceneTs.includes('slotX + slotSize / 2 - 2, slotSize / 2 - 2'), 'Số lượng cách mép trong 2px, không bao giờ đè viền');
});

test('Viền sáng vàng hổ phách khi rê chuột hoặc chọn ô (Amber Gold Glow)', () => {
  assert(uiSceneTs.includes('0xf1c40f') || uiSceneTs.includes('0xf39c12'), 'Hiệu ứng viền vàng hổ phách sáng rõ khi hover/chọn');
  assert(uiSceneTs.includes('0xf7f0dd'), 'Nền giấy da phát sáng ấm khi hover/chọn');
});

test('Vách gỗ chạm khắc (Carved Wood Divider) nẹp đồng nạm đinh phân cách Túi Đồ và Trang Bị', () => {
  assert(uiSceneTs.includes('sepGfx.lineBetween(92, -18, 92, 18);'), 'Vách ngăn phân cách tại x = 92');
  assert(uiSceneTs.includes('sepGfx.fillCircle(92, 0, 2.5);'), 'Đinh tán đồng thau tại tâm vách ngăn');
  assert(uiSceneTs.includes('sepGfx.fillRoundedRect(88, -20, 8, 40, 2);'), 'Khối gỗ chạm khắc nổi bật phân định 2 khu vực');
});

test('4 ô Trang Bị Cá Nhân (BODY, FEET, BACK, CHARM) có icon bóng mờ khi trống và viền vàng khi mặc', () => {
  assert(uiSceneTs.includes("{ slot: 'body', label: 'BODY', defaultIcon: '🧥' }"), 'Ô trang bị BODY');
  assert(uiSceneTs.includes("{ slot: 'feet', label: 'FEET', defaultIcon: '👢' }"), 'Ô trang bị FEET');
  assert(uiSceneTs.includes("{ slot: 'back', label: 'BACK', defaultIcon: '🎒' }"), 'Ô trang bị BACK');
  assert(uiSceneTs.includes("{ slot: 'charm', label: 'CHARM', defaultIcon: '🔔' }"), 'Ô trang bị CHARM');
  assert(uiSceneTs.includes('iconTxt.setAlpha(0.35);'), 'Bóng mờ alpha 0.35 khi trống');
  assert(uiSceneTs.includes('0xd4af37') && uiSceneTs.includes('iconTxt.setAlpha(1.0);'), 'Viền vàng kim và icon sáng rõ khi mặc đồ');
});

test('Hỗ trợ cả click chuột trực tiếp lẫn phím số 1–8 để chọn/dùng nhanh', () => {
  assert(uiSceneTs.includes('hitZone.on(\'pointerdown\', () => {'), 'Click chuột trực tiếp kích hoạt ô');
  assert(uiSceneTs.includes('this.useOrSelectSlot(i);'), 'Gọi hàm useOrSelectSlot');
  assert(uiSceneTs.includes('keydown-${numKeyNames[i]}'), 'Bắt phím số Digit 1–8');
});

// --- 2. THANH GHIM NHANH DỌC (PINNED PAGES BAR) THEO PHONG CÁCH DON\'T STARVE TOGETHER ---
console.log('\n--- 2. Thanh Ghim Nhanh Dọc theo phong cách Don\'t Starve Together (QuickCraftSidebar.ts) ---');

test('Cột dọc thanh mảnh (~42-46px) ép sát mép trái dưới cụm thanh máu', () => {
  assert(quickCraftSidebarTs.includes('BAR_WIDTH: number = 42;') || quickCraftSidebarTs.includes('BAR_WIDTH: number = 46;'), 'Chiều rộng thanh ghim chuẩn 42-46px');
  assert(quickCraftSidebarTs.includes('this.container = this.scene.add.container(37, 502);'), 'Gắn tại tọa độ x: 37 ép sát mép trái');
  assert(uiSceneTs.includes('this.quickCraftSidebar = new QuickCraftSidebar(this);'), 'Khởi tạo QuickCraftSidebar trong UIScene');
});

test('Phần trên gồm 6 nút biểu tượng chức năng cốt lõi [I/C], [J], [F], [N], [F8], [ESC]', () => {
  assert(uiSceneTs.includes("id: 'craft'") && uiSceneTs.includes("key: 'I'"), 'Mở Bảng Chế Tạo [I/C]');
  assert(uiSceneTs.includes("id: 'journal'") && uiSceneTs.includes("key: 'J'"), 'Sổ Tay Lữ Khách [J]');
  assert(uiSceneTs.includes("id: 'lantern'") && uiSceneTs.includes("key: 'F'"), 'Bật/Tắt Đèn Lồng [F]');
  assert(uiSceneTs.includes("id: 'map'") && uiSceneTs.includes("key: 'N'"), 'La Bàn & Bản Đồ [N]');
  assert(uiSceneTs.includes("id: 'unstuck'") && uiSceneTs.includes("key: 'F8'"), 'Thoát Kẹt An Toàn [F8]');
  assert(uiSceneTs.includes("id: 'pause'") && uiSceneTs.includes("key: 'ESC'"), 'Cài Đặt & Tạm Dừng [ESC]');
});

test('Phần dưới gồm 4–5 ô Công Thức Ghim Nhanh (Pinned Recipes) kèm nút cuộn [▲] [▼]', () => {
  assert(quickCraftSidebarTs.includes('craft_lantern_oil'), 'Ghim công thức Dầu Đèn');
  assert(quickCraftSidebarTs.includes('craft_poultice'), 'Ghim công thức Thuốc Đắp');
  assert(quickCraftSidebarTs.includes('craft_noise_lure'), 'Ghim công thức Mồi Tiếng Động');
  assert(quickCraftSidebarTs.includes('craft_resin_flare'), 'Ghim công thức Đuốc Nhựa Thông');
  assert(quickCraftSidebarTs.includes('craft_charcoal'), 'Ghim công thức Than Củi / Lửa Trại');
  assert(quickCraftSidebarTs.includes('scrollUp()') && quickCraftSidebarTs.includes('scrollDown()'), 'Hỗ trợ cuộn lên/xuống danh sách ghim');
  assert(quickCraftSidebarTs.includes("createScrollButton(0, -barH / 2 + 11, '▲'"), 'Có nút cuộn Lên [▲]');
  assert(quickCraftSidebarTs.includes("createScrollButton(0, barH / 2 - 11, '▼'"), 'Có nút cuộn Xuống [▼]');
});

test('Thẻ Chế Tạo Nhanh Nổi (Apicultural Notes Style Flyout Card) bung ra bên phải thanh dọc', () => {
  assert(quickCraftSidebarTs.includes('this.flyoutContainer = this.scene.add.container(74, 502);'), 'Thẻ nổi đặt tại x ~ 74 bên phải thanh');
  assert(quickCraftSidebarTs.includes('FLYOUT_WIDTH: number = 236;'), 'Chiều rộng thẻ nổi chuẩn 236px');
  assert(quickCraftSidebarTs.includes('FLYOUT_HEIGHT: number = 144;'), 'Chiều cao thẻ nổi chuẩn 144px');
  assert(quickCraftSidebarTs.includes('0xede4d1') && quickCraftSidebarTs.includes('0x1a120b'), 'Phong cách giấy da cổ Don\'t Starve viền gỗ tối');
});

test('Hiển thị các ô nguyên liệu: tô nền đỏ nếu thiếu (0/2), nền xanh thảo mộc nếu đủ (2/2)', () => {
  assert(quickCraftSidebarTs.includes('0x78281f') && quickCraftSidebarTs.includes('0xc0392b'), 'Nền đỏ mềm viền đỏ khi thiếu nguyên liệu (0/2)');
  assert(quickCraftSidebarTs.includes('0x27ae60') && quickCraftSidebarTs.includes('0x2ecc71'), 'Nền xanh thảo mộc viền xanh khi đủ nguyên liệu (2/2)');
  assert(quickCraftSidebarTs.includes('hasCount >= ing.count') || quickCraftSidebarTs.includes('hasCount < ing.count'), 'Đánh giá chính xác điều kiện đủ/thiếu nguyên liệu');
  assert(quickCraftSidebarTs.includes('ingInfo.icon') && quickCraftSidebarTs.includes('ingInfo.shortName'), 'Hiển thị icon và tên ngắn từng nguyên liệu');
});

test('Nút [Chế Tạo] trực tiếp 1-click không che màn hình chơi, cập nhật real-time', () => {
  assert(quickCraftSidebarTs.includes('executeCraft(recipe: CraftingRecipe)'), 'Có hàm executeCraft');
  assert(quickCraftSidebarTs.includes('this.craftingSystem.craft(recipe.id)'), 'Gọi craftingSystem.craft atomic deduction');
  assert(quickCraftSidebarTs.includes('AudioManager.getInstance().playCraftSuccess()'), 'Phát âm thanh chế tạo thành công');
  assert(quickCraftSidebarTs.includes('updateQuickSlotCounts'), 'Cập nhật lại túi đồ đáy ngay sau khi chế tạo');
});

test('Đồng bộ ẩn/hiện thanh ghim và thẻ nổi khi mở Modal hoặc Hộp Thoại', () => {
  assert(uiSceneTs.includes('this.quickCraftSidebar.setVisible(shouldShowHUD);'), 'setDialogueActive đồng bộ thanh ghim');
  assert(uiSceneTs.includes('if (this.quickCraftSidebar) this.quickCraftSidebar.setVisible(visible);'), 'setHUDVisible đồng bộ thanh ghim');
  assert(uiSceneTs.includes('if (this.quickCraftSidebar) this.quickCraftSidebar.hideFlyout();'), 'handleModalOpened tự động đóng thẻ nổi');
});

console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ BƯỚC V15-50A: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log('======================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
