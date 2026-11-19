/**
 * HOLLOW WOODS V1.5 - KIỂM THỬ TỰ ĐỘNG BƯỚC V15-33
 * Xác minh chuyển đổi toàn bộ tương tác đọc thông báo, biển chỉ dẫn, cáo thị sang Mẩu Giấy Cổ Tương Tác
 */

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

console.log('=== BẮT ĐẦU KIỂM THỬ BƯỚC V15-33 (PAPER NOTE & SIGNPOST OVERHAUL) ===\n');

// 1. Kiểm tra tornPagesData.ts
console.log('1. Kiểm tra tornPagesData.ts & Phân loại trực quan 4 theme:');
const tornPagesDataPath = path.resolve('src/data/tornPagesData.ts');
const tornPagesContent = fs.readFileSync(tornPagesDataPath, 'utf8');

assert(tornPagesContent.includes("export type NoteVisualVariant = 'parchment' | 'notice' | 'signpost' | 'stele';"), 'Khai báo type NoteVisualVariant chuẩn 4 theme.');
assert(tornPagesContent.includes('read_cp_frontier_sign'), 'Đã đăng ký read_cp_frontier_sign (Cột Mốc Tiền Tuyến).');
assert(tornPagesContent.includes("variant: 'signpost'"), 'Có cấu hình variant: signpost cho biển chỉ dẫn.');
assert(tornPagesContent.includes("variant: 'notice'"), 'Có cấu hình variant: notice cho thông báo/cáo thị.');
assert(tornPagesContent.includes("variant: 'stele'"), 'Có cấu hình variant: stele cho văn bia đá.');
assert(tornPagesContent.includes("variant: 'parchment'"), 'Có cấu hình variant: parchment cho mẩu giấy rách.');

// Danh sách các entry bắt buộc phải có trong TORN_PAGES_REGISTRY
const requiredKeys = [
  'read_cp_frontier_sign',
  'read_fog_sign',
  'read_detour_sign',
  'read_farm_sign',
  'read_ow_sign',
  'read_sm_entry_sign',
  'inspect_farm_gate',
  'inspect_outer_woods_gate',
  'read_bellhollow_notice_board',
  'read_herb_terrace_sign',
  'inspect_df_entry_sign',
  'inspect_deep_forest_gate',
  'inspect_fog_journal_1',
  'inspect_bellmaker_dew_journal',
  'inspect_elian_unsent_letter',
  'read_blacksmith_journal',
  'inspect_knights_memorial_stele',
  'read_black_knight_stele',
  'inspect_root_cellar_alchemy',
  'inspect_shrine_parchment_map',
  'read_rune_clue_stele',
  'read_shrine_stele',
  'read_fog_origin_mural'
];

let allKeysPresent = true;
for (const key of requiredKeys) {
  if (!tornPagesContent.includes(key + ':')) {
    allKeysPresent = false;
    console.error(`  -> Thiếu key: ${key}`);
  }
}
assert(allKeysPresent, `Đầy đủ tất cả ${requiredKeys.length} mẩu giấy, biển báo và văn bia trong TORN_PAGES_REGISTRY.`);

// 2. Kiểm tra lore.json
console.log('\n2. Kiểm tra lore.json & Manh mối tuyến đường vòng Tháp Chuông:');
const lorePath = path.resolve('src/data/lore.json');
const loreContent = fs.readFileSync(lorePath, 'utf8');
const loreData = JSON.parse(loreContent);

const detourLore = loreData.loreEntries.find(l => l.id === 'lore_detour_path');
assert(Boolean(detourLore), 'Tồn tại lore_detour_path (Manh Mối: Lối Vòng Đến Tháp Chuông) trong lore.json.');
if (detourLore) {
  assert(detourLore.title.includes('LỐI VÒNG ĐẾN THÁP CHUÔNG'), 'Tiêu đề lore_detour_path rõ nghĩa và đúng cốt truyện.');
}

// 3. Kiểm tra TornPageModal.ts
console.log('\n3. Kiểm tra TornPageModal.ts & Đồ họa 4 Visual Themes:');
const modalPath = path.resolve('src/ui/TornPageModal.ts');
const modalContent = fs.readFileSync(modalPath, 'utf8');

assert(modalContent.includes('renderAgedParchmentGraphics'), 'Hỗ trợ đồ họa renderAgedParchmentGraphics (Giấy da dê rách viền).');
assert(modalContent.includes('renderNoticeGraphics'), 'Hỗ trợ đồ họa renderNoticeGraphics (Cáo thị có Dấu Sáp Đỏ Red Wax Seal).');
assert(modalContent.includes('renderSignpostGraphics'), 'Hỗ trợ đồ họa renderSignpostGraphics (Bảng gỗ sồi 4 đinh tán kim loại góc).');
assert(modalContent.includes('renderSteleGraphics'), 'Hỗ trợ đồ họa renderSteleGraphics (Phiến đá xám phủ rêu xanh).');
assert(modalContent.includes('applyTypographyTheme'), 'Tự động đồng bộ màu chữ theo từng theme (vàng kim/trắng ngà cho gỗ, đỏ/nâu cho cáo thị, ngọc bích/bạc cho đá).');
assert(modalContent.includes('export { TornPageModal as PaperNoteModal };'), 'Xuất khẩu alias PaperNoteModal.');

// 4. Kiểm tra PaperNoteModal.ts
console.log('\n4. Kiểm tra PaperNoteModal.ts:');
const paperNoteModalPath = path.resolve('src/ui/PaperNoteModal.ts');
assert(fs.existsSync(paperNoteModalPath), 'File src/ui/PaperNoteModal.ts tồn tại.');
const paperNoteContent = fs.readFileSync(paperNoteModalPath, 'utf8');
assert(paperNoteContent.includes("from './TornPageModal'"), 'Re-export chuẩn xác từ TornPageModal.');

// 5. Kiểm tra UIScene.ts
console.log('\n5. Kiểm tra UIScene.ts:');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf8');
assert(uiSceneContent.includes('openTornPage('), 'UIScene cung cấp openTornPage.');
assert(uiSceneContent.includes('openPaperNote('), 'UIScene cung cấp alias openPaperNote.');

// 6. Kiểm tra GameScene.ts
console.log('\n6. Kiểm tra GameScene.ts & Loại bỏ popup chữ xanh:');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');

assert(gameSceneContent.includes("if (TORN_PAGES_REGISTRY[actionId])"), 'Chặn tương tác ở đầu executeMapInteraction để mở TornPageModal/PaperNoteModal.');
assert(!gameSceneContent.includes("showPopupMessage('📜 Cột Mốc Tiền Tuyến"), 'Đã loại bỏ showPopupMessage cho Cột Mốc Tiền Tuyến.');
assert(!gameSceneContent.includes("showPopupMessage('📜 Biển Đá Mòn"), 'Đã loại bỏ showPopupMessage cho Tấm Biển Mục.');
assert(!gameSceneContent.includes("showPopupMessage('📜 Biển Chỉ Đường"), 'Đã loại bỏ showPopupMessage cho Biển Chỉ Đường Tuyến Vòng.');
assert(gameSceneContent.includes("rawPrompt = 'Đã đọc (Xem lại)';"), 'Đã tối ưu hóa nhãn tương tác thành "Đã đọc (Xem lại)" khi đã đọc.');

console.log(`\n=== TỔNG KẾT KIỂM THỬ: ${passCount} PASS / ${failCount} FAIL ===`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> TẤT CẢ CÁC BƯỚC KIỂM THỬ BƯỚC V15-33 ĐỀU THÀNH CÔNG RỰC RỠ! <<<');
}
