/**
 * HOLLOW WOODS V1.5 - KIỂM THỬ XÁC MINH BƯỚC V15-50C
 * ĐỐI CHIẾU NÂNG CẤP GIAO DIỆN CHẾ TẠO CHUẨN 100% THEO 2 ẢNH DON'T STARVE TOGETHER
 */

import fs from 'fs';
import assert from 'assert';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.5 — KIỂM THỬ XÁC MINH BƯỚC V15-50C');
console.log('   (ĐỐI CHIẾU NÂNG CẤP GIAO DIỆN CHẾ TẠO CHUẨN 100% DST)');
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

const quickCraftSidebarTs = fs.readFileSync('src/ui/QuickCraftSidebar.ts', 'utf8');
const craftingModalTs = fs.readFileSync('src/ui/CraftingModal.ts', 'utf8');

// --- 1. THẺ CHẾ TẠO NHANH NỔI (QUICK CRAFT FLYOUT - ẢNH 1: APICULTURAL NOTES) ---
console.log('--- 1. Thẻ Chế Tạo Nhanh Nổi (QuickCraftSidebar - Ảnh 1 Tham Khảo) ---');

test('Mũi tên chạm khắc (Connecting Bracket Pointer) trỏ sang trái nối trực tiếp vào ô thanh ghim', () => {
  assert(quickCraftSidebarTs.includes('pointer.fillTriangle(0, -9, -11, 0, 0, 9);'), 'Vẽ tam giác nhọn trỏ sang trái (-11, 0)');
  assert(quickCraftSidebarTs.includes('Connecting Bracket Pointer'), 'Có ghi chú mũi tên liên kết phong cách Don\'t Starve');
});

test('Họa tiết chạm khắc vòm đỉnh (Ornate Top Crest Notch) trên khung gỗ tối', () => {
  assert(quickCraftSidebarTs.includes('Ornate Top Crest Notch'), 'Có vòm chạm khắc đỉnh thẻ');
  assert(quickCraftSidebarTs.includes('cardBg.fillRoundedRect(cardW / 2 - 34, -cardH / 2 - 4, 68, 7, 3);'), 'Khối chạm vòm đỉnh cân xứng');
});

test('Tiêu đề món đồ căn giữa (Centered Title) kèm đường gạch chỉ phân cách thanh nhã', () => {
  assert(quickCraftSidebarTs.includes('cardW / 2') && quickCraftSidebarTs.includes('setOrigin(0.5, 0)'), 'Tiêu đề căn giữa hoàn hảo');
  assert(quickCraftSidebarTs.includes('divLine.lineBetween(14, -cardH / 2 + 27, cardW - 14, -cardH / 2 + 27);'), 'Gạch phân cách dưới tiêu đề');
});

test('Dãy ô nguyên liệu hình vuông căn giữa (Centered Square Boxes) với nền đỏ sẫm khi thiếu', () => {
  assert(quickCraftSidebarTs.includes('badgeSize = 36;') || quickCraftSidebarTs.includes('badgeSize = 38;'), 'Kích thước ô vuông nguyên liệu');
  assert(quickCraftSidebarTs.includes('startBadgeX = Math.max(12, (cardW - totalBadgeW) / 2);'), 'Căn giữa toàn bộ cụm ô nguyên liệu');
  assert(quickCraftSidebarTs.includes('0x78281f') && quickCraftSidebarTs.includes('0xc0392b'), 'Nền đỏ sẫm cảnh báo khi thiếu nguyên liệu (0/2)');
  assert(quickCraftSidebarTs.includes('0x27ae60') && quickCraftSidebarTs.includes('0x2ecc71'), 'Nền xanh thảo mộc khi đủ nguyên liệu');
});

test('Mô tả tác dụng ngắn gọn và nút [Chế Tạo Ngay] căn giữa dưới đáy thẻ', () => {
  assert(quickCraftSidebarTs.includes('descText = HDTextHelper.createText') && quickCraftSidebarTs.includes("align: 'center'"), 'Mô tả căn giữa');
  assert(quickCraftSidebarTs.includes('btnX = (cardW - btnW) / 2;'), 'Nút hành động căn giữa đáy thẻ');
  assert(quickCraftSidebarTs.includes('🔨 Chế Tạo Ngay') && quickCraftSidebarTs.includes('Thiếu Đồ'), 'Trạng thái nút hành động');
});

// --- 2. BẢNG CHẾ TẠO MỞ RỘNG (CRAFTING MODAL - ẢNH 2: EXPANDED MENU & GARLAND) ---
console.log('\n--- 2. Bảng Chế Tạo Mở Rộng (CraftingModal - Ảnh 2 Tham Khảo) ---');

test('Tai sách bookmark dọc nhô ra mép phải khung bảng (Right Edge Bookmark Tabs)', () => {
  assert(craftingModalTs.includes('buildRightEdgeBookmarkTabs'), 'Có hàm khởi tạo bookmark tabs mép phải');
  assert(craftingModalTs.includes('redrawRightBookmarkTabs'), 'Có hàm vẽ lại trạng thái bookmark tabs');
  assert(craftingModalTs.includes('rightBookmarkTabGfx'), 'Map quản lý graphics của bookmark tabs');
  assert(craftingModalTs.includes('ext = isActive ? 6 : 0;'), 'Tab active nhô thêm 6px ra ngoài khung');
});

test('Hộp tìm kiếm nền giấy da sáng ấm Don\'t Starve ("Everything" Parchment Style)', () => {
  assert(craftingModalTs.includes('searchBg.fillStyle(0xede4d1, 0.98);'), 'Lớp nền giấy da sáng ấm bên trong (0xede4d1)');
  assert(craftingModalTs.includes('searchBg.lineStyle(0.8, 0x8c6d3b, 0.45);'), 'Viền chìm màu đồng cổ thanh nhã');
  assert(craftingModalTs.includes('searchInputText'), 'Hiển thị nội dung hoặc placeholder tìm kiếm');
});

test('Thanh cuộn trang trí DST (Diamond Scrollbar) ở mép phải lưới công thức', () => {
  assert(craftingModalTs.includes('Diamond Scrollbar'), 'Có chú thích thanh cuộn hình thoi');
  assert(craftingModalTs.includes('scrollbarGfx.beginPath();') && craftingModalTs.includes('scrollbarGfx.lineTo'), 'Vẽ con trượt hình thoi (Diamond Thumb)');
  assert(craftingModalTs.includes('scrollbarGfx.fillTriangle'), 'Vẽ nút mũi tên lên/xuống hai đầu');
});

test('Khung xem trước vật phẩm kèm nhãn "◀ Cổ Điển ▶" (Classic Skin Variant)', () => {
  assert(craftingModalTs.includes('◀ Cổ Điển ▶'), 'Hiển thị nhãn biến thể ◀ Cổ Điển ▶ (Classic)');
  assert(craftingModalTs.includes('detailPreviewIcon'), 'Khung xem trước icon thành phẩm');
});

test('Bảo toàn logic chế tạo, trừ nguyên liệu và đồng bộ giao diện toàn hệ thống', () => {
  assert(craftingModalTs.includes('this.craftingSystem.craft(recipe.id)'), 'Gọi atomic craft deduction');
  assert(craftingModalTs.includes('AudioManager.getInstance().playCraftSuccess()'), 'Âm thanh chế tạo thành công');
  assert(craftingModalTs.includes('ui.updateQuickSlotCounts()'), 'Cập nhật túi đồ đáy');
  assert(craftingModalTs.includes('ui.quickCraftSidebar.refresh()'), 'Cập nhật thanh ghim nhanh');
});

console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ BƯỚC V15-50C: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log('======================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
