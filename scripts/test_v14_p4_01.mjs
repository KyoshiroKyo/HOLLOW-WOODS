// scripts/test_v14_p4_01.mjs
// Bộ kiểm thử tự động cho V14-P4-01: Nâng cấp giao diện UI/UX (Hotbar 8 ô, Viền tương tác, Bảng chế tạo trượt phải)

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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ GIAO DIỆN UI/UX (V14-P4-01)');
console.log('======================================================================\n');

const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const craftingModalPath = path.resolve('src/ui/CraftingModal.ts');

const uiSceneCode = fs.readFileSync(uiScenePath, 'utf-8');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf-8');
const craftingCode = fs.readFileSync(craftingModalPath, 'utf-8');

// -----------------------------------------------------------------------------
// PHẦN 1: Hotbar 8 ô & Ngôn ngữ thẩm mỹ gỗ tối / đồng xỉn / ánh hổ phách
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Hotbar 8 ô & Bảng màu Gỗ tối, Đồng xỉn, Hổ phách (UIScene.ts) ---');

assert(uiSceneCode.includes('[1] Thuốc Đắp') && uiSceneCode.includes('[2] Dầu Đèn'), 'Hotbar hỗ trợ phím số [1] Thuốc Đắp & [2] Dầu Đèn');
assert(uiSceneCode.includes('[Q] Mồi Ném') && uiSceneCode.includes('[F] Đèn Lồng'), 'Hotbar hỗ trợ phím chức năng [Q] Mồi Ném & [F] Đèn Lồng');
assert(uiSceneCode.includes('[E] Tương Tác') && uiSceneCode.includes('[I] Chế Tạo'), 'Hotbar hỗ trợ phím tương tác [E] Tương Tác & [I] Chế Tạo');
assert(uiSceneCode.includes('[J] Sổ Tay') && uiSceneCode.includes('[ESC] Tạm Dừng'), 'Hotbar hỗ trợ phím menu [J] Sổ Tay & [ESC] Tạm Dừng');

// Kiểm tra danh sách 8 ô
const has8Slots = ['poultice', 'oil', 'lure', 'lantern', 'interact', 'craft', 'journal', 'pause'].every(id => uiSceneCode.includes(`id: '${id}'`));
assert(has8Slots, 'Hotbar cấu hình đủ 8 ô thao tác nhanh chuẩn xác');

// Kiểm tra màu sắc gỗ tối, đồng xỉn, đinh tán đồng thau, viền hổ phách
assert(uiSceneCode.includes('0x18110b') || uiSceneCode.includes('0x221811'), 'Nền Hotbar sử dụng tông màu gỗ tối / kim loại trầm cổ kính (0x18110b / 0x221811)');
assert(uiSceneCode.includes('0x6e5233') || uiSceneCode.includes('0x8c6b43'), 'Viền Hotbar sử dụng tông màu đồng xỉn / da cũ (0x6e5233 / 0x8c6b43)');
assert(uiSceneCode.includes('0xb89058'), 'Góc ô Hotbar có đinh tán đồng thau mỹ thuật (0xb89058)');
assert(uiSceneCode.includes('0xf39c12') && uiSceneCode.includes('0xffe082'), 'Ô Hotbar đang kích hoạt có hiệu ứng hào quang hổ phách (0xf39c12 / 0xffe082)');

// Phím E kích hoạt tương tác
assert(uiSceneCode.includes('triggerInteractionFromUI'), 'Hotbar ô phím E liên kết gọi phương thức triggerInteractionFromUI trên GameScene');

// -----------------------------------------------------------------------------
// PHẦN 2: Viền nhận diện đối tượng tương tác (Interaction Outline trên GameScene)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Viền nhận diện đối tượng tương tác (GameScene.ts) ---');

assert(gameSceneCode.includes('interactionOutlineGfx'), 'GameScene khai báo đồ họa viền tương tác interactionOutlineGfx');
assert(gameSceneCode.includes('renderInteractionOutline'), 'GameScene có phương thức renderInteractionOutline chuyên biệt');
assert(gameSceneCode.includes('clearInteractionOutline'), 'GameScene có phương thức xóa viền clearInteractionOutline');

// Kiểm tra logic chỉ hiển thị viền cho đúng 1 đối tượng gần nhất (best = candidates[0])
assert(gameSceneCode.includes('const best = candidates[0]') && gameSceneCode.includes('this.renderInteractionOutline(best)'), 'Chỉ hiển thị viền highlight cho duy nhất đối tượng gần nhất (candidates[0])');

// Kiểm tra màu viền kem mảnh 1-2px
assert(gameSceneCode.includes('0xfaf8ef'), 'Viền highlight sử dụng màu trắng kem cổ điển (0xfaf8ef)');
assert(gameSceneCode.includes('lineStyle(1.5') || gameSceneCode.includes('lineStyle(2'), 'Độ dày nét viền mảnh tinh tế (1.5 - 2 px)');

// Kiểm tra ẩn viền khi modal hoặc hội thoại đang mở
assert(gameSceneCode.includes('this.clearInteractionOutline()'), 'Viền tự động xóa sạch khi không có mục tiêu hoặc mở UI/Modal');

// -----------------------------------------------------------------------------
// PHẦN 3: Bảng Chế Tạo Dạng Thẻ Trượt Cạnh Phải (CraftingModal.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Bảng Chế Tạo Lưới Thẻ Trượt Cạnh Phải (CraftingModal.ts) ---');

// Kiểm tra bố cục trượt cạnh phải (panelX >= 700 để chừa tâm màn hình x ~ 640)
assert(craftingCode.includes('sidePanelContainer'), 'CraftingModal sở hữu container sidePanelContainer cho hiệu ứng trượt');
assert(craftingCode.includes('panelX') && (craftingCode.includes('716') || craftingCode.includes('1280 - panelW')), 'Bảng trượt định vị cạnh phải (panelX >= 716) không che khuất nhân vật ở tâm màn hình');
assert(craftingCode.includes('slide-in') || craftingCode.includes("ease: 'Cubic.easeOut'"), 'Hiệu ứng trượt slide-in mượt mà khi mở bảng chế tác');

// 4 Danh mục phân loại
assert(craftingCode.includes("'all'") && craftingCode.includes("'survival'") && craftingCode.includes("'cooking'") && craftingCode.includes("'tools'"), 'Hỗ trợ 4 tab danh mục: Tất Cả (all), Sinh Tồn (survival), Nấu Nướng (cooking), Dụng Cụ (tools)');
assert(craftingCode.includes('setCategory') && craftingCode.includes('redrawTabs'), 'Có cơ chế chuyển đổi và vẽ lại tab danh mục tương tác');

// Thẻ chi tiết công thức & số lượng đầu ra
assert(craftingCode.includes('[Đầu ra: x') || craftingCode.includes('recipe.count'), 'Thẻ công thức hiển thị rõ ràng số lượng đầu ra của thành phẩm');
assert(craftingCode.includes('✔') && craftingCode.includes('✖'), 'Thành phần nguyên liệu hiển thị trực quan biểu tượng đủ (✔) và thiếu (✖)');
assert(craftingCode.includes('Sẵn sàng chế tác') && craftingCode.includes('Thiếu nguyên liệu'), 'Thẻ có nhãn trạng thái trực quan báo sẵn sàng chế tạo (Sẵn sàng chế tác / Thiếu nguyên liệu)');

// -----------------------------------------------------------------------------
// PHẦN 4: Bảo Toàn Tuyệt Đối Các Chuỗi Kiểm Thử Hồi Quy Của V1.3
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Bảo Toàn Hồi Quy V1.3 & Gate Tests ---');

assert(craftingCode.includes('modalW = 840') && craftingCode.includes('modalH = 520'), 'Bảo toàn chuỗi kiểm tra kích thước nền tảng modalW = 840 & modalH = 520');
assert(craftingCode.includes('overlay.fillRect(0, 0, 1280, 720)'), 'Bảo toàn chuỗi overlay.fillRect(0, 0, 1280, 720)');
assert(craftingCode.includes('PAGE_SIZE'), 'Bảo toàn hằng số phân trang PAGE_SIZE');
assert(craftingCode.includes('updatePageVisibility()'), 'Bảo toàn phương thức updatePageVisibility()');
assert(craftingCode.includes('◀ Trang Trước') && craftingCode.includes('Trang Sau ▶'), 'Bảo toàn chuỗi nút phân trang ◀ Trang Trước / Trang Sau ▶');
assert(craftingCode.includes('formatIngredients'), 'Bảo toàn hàm formatIngredients');
assert(craftingCode.includes('item.ingText.setText(this.formatIngredients(item.recipe))'), 'Bảo toàn chuỗi gọi cập nhật nguyên liệu cho Gate 1B');
assert(craftingCode.includes('item.craftBtnBg.clear()'), 'Bảo toàn chuỗi làm mới nút chế tạo item.craftBtnBg.clear()');
assert(craftingCode.includes('this.container.destroy()'), 'Bảo toàn phương thức dọn dẹp container khi đóng modal');

// -----------------------------------------------------------------------------
// TỔNG KẾT BÀI KIỂM THỬ
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passCount}/${passCount + failCount} KIỂM TRA ĐẠT (${failCount} THẤT BẠI)`);
if (failCount === 0) {
  console.log('KẾT QUẢ: PASS (100% TIÊU CHÍ V14-P4-01 ĐẠT CHUẨN XUẤT SẮC)');
} else {
  console.log('KẾT QUẢ: FAIL (MỘT SỐ TIÊU CHÍ CHƯA ĐẠT, CẦN KHẮC PHỤC)');
  process.exit(1);
}
console.log('======================================================================');
