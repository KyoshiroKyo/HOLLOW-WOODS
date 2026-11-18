import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM THỬ BƯỚC V15-26: ĐỒNG BỘ THẨM MỸ MODALS & TOOLTIPS ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Kiểm tra ItemTooltipHelper.ts
const tooltipHelperPath = path.resolve('src/ui/ItemTooltipHelper.ts');
assert(fs.existsSync(tooltipHelperPath), 'File src/ui/ItemTooltipHelper.ts tồn tại');
const tooltipHelperCode = fs.readFileSync(tooltipHelperPath, 'utf8');

assert(tooltipHelperCode.includes('class ItemTooltipHelper'), 'ItemTooltipHelper khai báo đúng class');
assert(tooltipHelperCode.includes('public static getInstance()'), 'Hỗ trợ Singleton pattern');
assert(tooltipHelperCode.includes('setDepth(9999)'), 'Tooltip có depth cao nhất (9999)');
assert(tooltipHelperCode.includes('show(') && tooltipHelperCode.includes('hide('), 'Cung cấp API show() và hide()');
assert(tooltipHelperCode.includes('getItemInfo('), 'Tra cứu từ điển dữ liệu vật phẩm');
assert(tooltipHelperCode.includes('eqp_moss_cloak') && tooltipHelperCode.includes('wpn_iron_spear'), 'Đầy đủ từ điển cho trang bị và vũ khí');

// 2. Kiểm tra CraftingModal.ts
const craftingModalPath = path.resolve('src/ui/CraftingModal.ts');
const craftingCode = fs.readFileSync(craftingModalPath, 'utf8');
assert(craftingCode.includes('0x000000, 0.68'), 'CraftingModal có Dim Overlay mờ tối 0.68');
assert(craftingCode.includes('✕ ESC'), 'CraftingModal có nút đóng thống nhất [✕ ESC]');
assert(craftingCode.includes('ItemTooltipHelper.getInstance().show'), 'CraftingModal tích hợp Tooltip khi hover');
assert(craftingCode.includes('ItemTooltipHelper.getInstance().hide()'), 'CraftingModal ẩn Tooltip khi thoát');

// 3. Kiểm tra StorageChestModal.ts
const chestModalPath = path.resolve('src/ui/StorageChestModal.ts');
const chestCode = fs.readFileSync(chestModalPath, 'utf8');
assert(chestCode.includes('0x000000, 0.75'), 'StorageChestModal có Dim Overlay mờ tối 0.75');
assert(chestCode.includes('✕ ESC'), 'StorageChestModal có nút đóng thống nhất [✕ ESC]');
assert(chestCode.includes('ItemTooltipHelper.getInstance().show'), 'StorageChestModal tích hợp Tooltip khi hover đồ');
assert(chestCode.includes('ItemTooltipHelper.getInstance().hide()'), 'StorageChestModal ẩn Tooltip khi đóng/tương tác');

// 4. Kiểm tra EquipmentModal.ts
const equipModalPath = path.resolve('src/ui/EquipmentModal.ts');
const equipCode = fs.readFileSync(equipModalPath, 'utf8');
assert(equipCode.includes('0x000000, 0.70'), 'EquipmentModal có Dim Overlay mờ tối 0.70');
assert(equipCode.includes('✕ ESC'), 'EquipmentModal có nút đóng thống nhất [✕ ESC]');
assert(equipCode.includes('ItemTooltipHelper.getInstance().show'), 'EquipmentModal tích hợp Tooltip cho trang bị & vũ khí');
assert(equipCode.includes('ItemTooltipHelper.getInstance().hide()'), 'EquipmentModal ẩn Tooltip khi đóng');

// 5. Kiểm tra JournalModal.ts
const journalModalPath = path.resolve('src/ui/JournalModal.ts');
const journalCode = fs.readFileSync(journalModalPath, 'utf8');
assert(journalCode.includes('0x000000, 0.75'), 'JournalModal có Dim Overlay mờ tối 0.75');
assert(journalCode.includes('✕ ESC'), 'JournalModal có nút đóng thống nhất [✕ ESC]');
assert(journalCode.includes('[1. NHIỆM VỤ]'), 'Tab 1: [1. NHIỆM VỤ]');
assert(journalCode.includes('[2. KÝ ỨC HIỆP SĨ ĐEN]'), 'Tab 2: [2. KÝ ỨC HIỆP SĨ ĐEN]');
assert(journalCode.includes('[3. SỔ TAY SINH VẬT]'), 'Tab 3: [3. SỔ TAY SINH VẬT]');
assert(journalCode.includes('[4. SƠ ĐỒ BELLHOLLOW]'), 'Tab 4: [4. SƠ ĐỒ BELLHOLLOW]');
assert(journalCode.includes('BIÊN NIÊN KÝ ỨC HIỆP SĨ ĐEN & CỔ THƯ:'), 'Tiêu đề nội dung Tab 2 chuẩn mực');
assert(journalCode.includes('SƠ ĐỒ VÙNG BELLHOLLOW & KHU RỪNG RỖNG'), 'Tiêu đề nội dung Tab 4 chuẩn mực');
assert(journalCode.includes('ItemTooltipHelper.getInstance().hide()'), 'JournalModal ẩn Tooltip khi đóng');
assert(journalCode.includes('wordWrap'), 'JournalModal thiết lập wordWrap chống tràn chữ');

console.log(`\n=== TỔNG KẾT: ${passedTests}/${totalTests} TESTS ĐẠT HOÀN HẢO ===`);
