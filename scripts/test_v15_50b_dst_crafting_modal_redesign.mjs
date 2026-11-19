/**
 * HOLLOW WOODS V1.5 - KIỂM THỬ XÁC MINH BƯỚC V15-50B
 * THIẾT KẾ LẠI BẢNG CHẾ TẠO MỞ RỘNG 4 TẦNG THEO PHONG CÁCH DON'T STARVE TOGETHER (DST EXPANDED CRAFTING MENU)
 */

import fs from 'fs';
import assert from 'assert';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.5 — KIỂM THỬ XÁC MINH BƯỚC V15-50B');
console.log('   (BẢNG CHẾ TẠO MỞ RỘNG 4 TẦNG DON\'T STARVE TOGETHER STYLE)');
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

const craftingModalTs = fs.readFileSync('src/ui/CraftingModal.ts', 'utf8');

// --- 1. KHUNG BẢNG CHÍNH VÀ BỐ CỤC 4 TẦNG TRUNG TÂM ---
console.log('--- 1. Bố cục 4 tầng chuẩn cho Bảng Chế Tạo Mở Rộng (~680x500 px) ---');

test('Kích thước khung bảng gỗ sẫm viền đồng chạm khắc ở chính giữa màn hình (680x500 px)', () => {
  assert(craftingModalTs.includes('MODAL_W: number = 680;') || craftingModalTs.includes('panelW = 680'), 'Chiều rộng bảng 680px');
  assert(craftingModalTs.includes('MODAL_H: number = 500;') || craftingModalTs.includes('panelH = 500'), 'Chiều cao bảng 500px');
  assert(craftingModalTs.includes('panelX = (1280 - panelW) / 2') || craftingModalTs.includes('panelX: number = 300'), 'Căn giữa trục ngang X = 300');
  assert(craftingModalTs.includes('panelY = (720 - panelH) / 2') || craftingModalTs.includes('panelY: number = 110'), 'Căn giữa trục dọc Y = 110');
  assert(craftingModalTs.includes('0x140e09') && craftingModalTs.includes('0x6e5233'), 'Bảng màu gỗ tối và viền đồng chạm khắc trung cổ');
});

test('Hỗ trợ bật/tắt mượt mà khi nhấn [I], [C] hoặc [ESC]', () => {
  assert(craftingModalTs.includes("scene.input.keyboard.on('keydown-C', () => this.toggle());"), 'Lắng nghe phím C để toggle');
  assert(craftingModalTs.includes("scene.input.keyboard.on('keydown-I', () => this.toggle());"), 'Lắng nghe phím I để toggle');
  assert(craftingModalTs.includes("scene.input.keyboard.on('keydown-ESC', () => {"), 'Lắng nghe phím ESC để đóng');
  assert(craftingModalTs.includes('public toggle(): void'), 'Cung cấp phương thức toggle()');
  assert(craftingModalTs.includes('public close(): void'), 'Cung cấp phương thức close()');
});

// --- 2. TẦNG 1 — THANH TRÊN CÙNG (TOP BAR) ---
console.log('\n--- 2. Tầng 1 — Thanh Trên Cùng (Top Bar) ---');

test('Nút lọc Yêu Thích / Đã Ghim [★] hỗ trợ lọc nhanh công thức ghim', () => {
  assert(craftingModalTs.includes('isFavoriteFilterActive'), 'Có cờ quản lý trạng thái lọc yêu thích');
  assert(craftingModalTs.includes('favoriteBtnText'), 'Có nhãn hiển thị nút yêu thích');
  assert(craftingModalTs.includes('togglePinRecipe'), 'Có hàm ghim/bỏ ghim công thức');
  assert(craftingModalTs.includes('isRecipePinned'), 'Có hàm kiểm tra công thức đã ghim');
});

test('Hộp tìm kiếm / lọc nhanh theo tên vật phẩm kèm nút xóa lọc [✕]', () => {
  assert(craftingModalTs.includes('searchQuery'), 'Có biến lưu trữ chuỗi tìm kiếm');
  assert(craftingModalTs.includes('searchInputText'), 'Có Text hiển thị nội dung tìm kiếm');
  assert(craftingModalTs.includes('🔍 Nhập tên tìm kiếm...'), 'Placeholder tìm kiếm trực quan');
  assert(craftingModalTs.includes('updateSearchDisplay'), 'Có hàm cập nhật hiển thị tìm kiếm');
  assert(craftingModalTs.includes('clearBtn'), 'Có nút xóa lọc tìm kiếm [✕]');
});

test('Nút đóng góc phải viền đồng sang trọng [✕ I / ESC] Đóng', () => {
  assert(craftingModalTs.includes('✕ [I / ESC] Đóng'), 'Nút đóng góc phải có nhãn ✕ [I / ESC] Đóng');
});

// --- 3. TẦNG 2 — LƯỚI BIỂU TƯỢNG DANH MỤC (CATEGORY TABS) ---
console.log('\n--- 3. Tầng 2 — Lưới Biểu Tượng Danh Mục (Category Tabs) ---');

test('Hàng các ô biểu tượng phân nhóm công thức theo phong cách Don\'t Starve Together', () => {
  assert(craftingModalTs.includes("'all'") && craftingModalTs.includes("'Tất Cả'"), 'Danh mục: Tất Cả');
  assert(craftingModalTs.includes("'light'") && craftingModalTs.includes("'Ánh Sáng'"), 'Danh mục: Ánh Sáng & Lửa');
  assert(craftingModalTs.includes("'survival'") && craftingModalTs.includes("'Sinh Tồn'"), 'Danh mục: Sinh Tồn & Y Tế');
  assert(craftingModalTs.includes("'combat'") && craftingModalTs.includes("'Chiến Đấu'"), 'Danh mục: Chiến Đấu & Bẫy');
  assert(craftingModalTs.includes("'equipment'") && craftingModalTs.includes("'Trang Bị'"), 'Danh mục: Trang Bị & Ba Lô');
  assert(craftingModalTs.includes("'structures'") && craftingModalTs.includes("'Chế Tác'"), 'Danh mục: Chế Tác');
});

test('Ô danh mục đang chọn nổi bật với nền giấy da sáng và viền vàng hổ phách', () => {
  assert(craftingModalTs.includes('0xdfd3b6'), 'Nền giấy da sáng ấm cho tab đang chọn (0xdfd3b6)');
  assert(craftingModalTs.includes('0xf1c40f'), 'Viền vàng hổ phách nổi bật (0xf1c40f)');
  assert(craftingModalTs.includes('redrawTabs()'), 'Có hàm vẽ lại tab khi chuyển đổi');
});

// --- 4. TẦNG 3 — LƯỚI CÔNG THỨC 7 CỘT (RECIPE GRID) ---
console.log('\n--- 4. Tầng 3 — Lưới Công Thức (Recipe Grid 7 Cột) ---');

test('Lưới công thức dạng các ô vuông 7 cột x 3 hàng hiển thị toàn bộ công thức', () => {
  assert(craftingModalTs.includes('cols = 7;'), 'Cấu hình lưới 7 cột');
  assert(craftingModalTs.includes('tileSize = 44;'), 'Kích thước ô vuông trên lưới');
  assert(craftingModalTs.includes('gridContainer'), 'Có container quản lý lưới công thức');
  assert(craftingModalTs.includes('refreshGrid()'), 'Có hàm làm mới lưới công thức');
});

test('Phân biệt 3 trạng thái: Đủ nguyên liệu, Thiếu nguyên liệu và Chưa mở khóa (có ổ khóa 🔒)', () => {
  assert(craftingModalTs.includes('isRecipeLocked'), 'Có hàm đánh giá công thức bị khóa');
  assert(craftingModalTs.includes("'🔒'"), 'Hiển thị biểu tượng ổ khóa nhỏ ở góc trên trái ô');
  assert(craftingModalTs.includes('0xdfd3b6'), 'Nền giấy da sáng ấm cho công thức đủ đồ');
  assert(craftingModalTs.includes('0x26190f'), 'Nền nâu trầm cho công thức thiếu đồ');
  assert(craftingModalTs.includes('0x140e09'), 'Nền tối sẫm cho công thức chưa mở khóa');
});

test('Ô công thức đang chọn nổi bật với viền sáng hổ phách rực rỡ', () => {
  assert(craftingModalTs.includes('0xfbf5e6') && craftingModalTs.includes('0xf1c40f'), 'Viền vàng hổ phách và nền giấy sáng rực khi được chọn');
  assert(craftingModalTs.includes('selectedRecipeId'), 'Quản lý ID công thức đang chọn');
});

// --- 5. TẦNG 4 — KHUNG CHI TIẾT & NÚT CHẾ TẠO PHÍA DƯỚI ---
console.log('\n--- 5. Tầng 4 — Khung Chi Tiết & Nút Chế Tạo Phía Dưới ---');

test('Nửa bên trái: Nút ngôi sao ghim công thức, Tên in đậm, nhãn đầu ra và mô tả không tràn chữ', () => {
  assert(craftingModalTs.includes('detailPinBtnBg') && craftingModalTs.includes('detailPinBtnText'), 'Có nút ngôi sao ghim công thức');
  assert(craftingModalTs.includes('detailNameText'), 'Có Text hiển thị tên món đồ in đậm');
  assert(craftingModalTs.includes('[Đầu ra: x'), 'Hiển thị nhãn số lượng đầu ra [Đầu ra: x...]');
  assert(craftingModalTs.includes('wordWrap: { width: 290 }'), 'Mô tả có wordWrap chống tràn chữ');
});

test('Nửa bên phải: Khung hiển thị phóng to icon vật phẩm và dãy các ô nguyên liệu yêu cầu', () => {
  assert(craftingModalTs.includes('detailPreviewIcon'), 'Khung preview icon phóng to kích thước lớn');
  assert(craftingModalTs.includes('detailIngredientsContainer'), 'Container quản lý hàng ô nguyên liệu yêu cầu');
  assert(craftingModalTs.includes('0x27ae60') && craftingModalTs.includes('0x2ecc71'), 'Tô nền xanh thảo mộc viền xanh khi đủ nguyên liệu (2/2)');
  assert(craftingModalTs.includes('0x78281f') && craftingModalTs.includes('0xc0392b'), 'Tô nền đỏ cảnh báo viền đỏ khi thiếu nguyên liệu (0/2)');
});

test('Nút bấm [Chế Tạo]: Sáng nổi bật khi đủ đồ, mờ đi khi thiếu hoặc khóa', () => {
  assert(craftingModalTs.includes('executeCraft()'), 'Có hàm executeCraft thực hiện chế tạo');
  assert(craftingModalTs.includes('detailCraftBtnBg'), 'Graphics nền nút chế tạo');
  assert(craftingModalTs.includes('detailCraftBtnText'), 'Text nút chế tạo');
  assert(craftingModalTs.includes('🔨 Chế Tạo'), 'Nhãn nút bấm sáng 🔨 Chế Tạo');
  assert(craftingModalTs.includes('Thiếu Đồ') || craftingModalTs.includes('Đang Khóa'), 'Nhãn khi thiếu nguyên liệu hoặc khóa');
});

test('Đồng bộ dữ liệu: trừ đúng nguyên liệu, phát âm thanh, cập nhật túi đồ đáy và thanh ghim', () => {
  assert(craftingModalTs.includes('this.craftingSystem.craft(recipe.id)'), 'Gọi atomic deduction của CraftingSystem');
  assert(craftingModalTs.includes('AudioManager.getInstance().playCraftSuccess()'), 'Phát âm thanh chế tạo thành công');
  assert(craftingModalTs.includes('ui.updateQuickSlotCounts()'), 'Cập nhật lại túi đồ đáy màn hình');
  assert(craftingModalTs.includes('ui.quickCraftSidebar.refresh()'), 'Cập nhật lại thanh ghim nhanh bên trái');
});

// --- 6. BẢO TOÀN KIỂM THỬ HỒI QUY V1.3 & V1.4 ---
console.log('\n--- 6. Bảo Toàn Hồi Quy V1.3 & V1.4 ---');

test('Bảo toàn 100% các chuỗi kiểm thử hồi quy', () => {
  assert(craftingModalTs.includes('modalW = 840') && craftingModalTs.includes('modalH = 520'), 'Kích thước nền tảng 840x520');
  assert(craftingModalTs.includes('overlay.fillRect(0, 0, 1280, 720)'), 'Lớp phủ overlay toàn màn hình');
  assert(craftingModalTs.includes('PAGE_SIZE'), 'Hằng số phân trang PAGE_SIZE');
  assert(craftingModalTs.includes('updatePageVisibility()'), 'Phương thức updatePageVisibility');
  assert(craftingModalTs.includes('◀ Trang Trước') && craftingModalTs.includes('Trang Sau ▶'), 'Nút phân trang hồi quy');
  assert(craftingModalTs.includes('formatIngredients'), 'Hàm formatIngredients');
  assert(craftingModalTs.includes('item.craftBtnBg.clear()'), 'Làm mới nút craftBtnBg');
  assert(craftingModalTs.includes('this.container.destroy()'), 'Dọn dẹp container khi destroy');
});

console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ BƯỚC V15-50B: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log('======================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
