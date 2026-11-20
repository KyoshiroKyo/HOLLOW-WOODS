import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🔍 KIỂM THỬ XÁC MINH V152-06B: TÍCH HỢP UI PACK DARK WOODLAND PARCHMENT');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

const rootDir = process.cwd();
const uiDir = path.join(rootDir, 'public', 'assets', 'ui');

// 1. Kiểm tra 28 files PNG trong public/assets/ui/
assert(fs.existsSync(uiDir), 'Thư mục public/assets/ui/ tồn tại');

const expectedFiles = [
  'books/ui_pack_open_book.png',
  'books/ui_pack_open_book_desk.png',
  'scrolls/ui_pack_map_pin.png',
  'scrolls/ui_pack_scroll_compact.png',
  'scrolls/ui_pack_world_map_scroll.png',
  'panels/ui_pack_panel_cutout_modal.png',
  'panels/ui_pack_panel_dialogue.png',
  'panels/ui_pack_panel_hud.png',
  'panels/ui_pack_panel_modal.png',
  'panels/ui_pack_panel_quest.png',
  'panels/ui_pack_ribbon_header.png',
  'panels/ui_pack_ribbon_header_alt.png',
  'slots/ui_pack_hotbar_bg.png',
  'slots/ui_pack_slot_equip.png',
  'slots/ui_pack_slot_hover.png',
  'slots/ui_pack_slot_idle.png',
  'slots/ui_pack_slot_large.png',
  'slots/ui_pack_slot_selected.png',
  'icons/ui_pack_btn_wood.png',
  'icons/ui_pack_btn_wood_hover.png',
  'icons/ui_pack_tab_craft.png',
  'icons/ui_pack_tab_equip.png',
  'icons/ui_pack_tab_journal.png',
  'icons/ui_pack_tab_map.png',
  'icons/ui_pack_equip_back.png',
  'icons/ui_pack_equip_body.png',
  'icons/ui_pack_equip_charm.png',
  'icons/ui_pack_equip_feet.png'
];

let totalBytes = 0;
let allFilesExist = true;
for (const rel of expectedFiles) {
  const p = path.join(uiDir, rel);
  if (fs.existsSync(p)) {
    const s = fs.statSync(p).size;
    totalBytes += s;
  } else {
    allFilesExist = false;
    console.error(`Missing file: ${rel}`);
  }
}

assert(allFilesExist, `Tất cả 28 file PNG đều tồn tại trong public/assets/ui/ (${expectedFiles.length}/28)`);
assert(totalBytes < 1.5 * 1024 * 1024, `Tổng dung lượng asset (${(totalBytes / 1024).toFixed(2)} KB) đạt chuẩn tối ưu < 1.5 MB`);

// 2. Kiểm tra PreloadScene.ts nạp đủ 28 asset ui_pack_*
const preloadSrc = fs.readFileSync(path.join(rootDir, 'src', 'scenes', 'PreloadScene.ts'), 'utf8');
let loadedAll = true;
for (const rel of expectedFiles) {
  const basename = path.basename(rel, '.png');
  if (!preloadSrc.includes(`'${basename}'`)) {
    loadedAll = false;
    console.error(`PreloadScene missing key: ${basename}`);
  }
}
assert(loadedAll, 'PreloadScene.ts nạp đủ 28 khóa texture ui_pack_*');

// 3. Kiểm tra UIScene.ts
const uiSceneSrc = fs.readFileSync(path.join(rootDir, 'src', 'scenes', 'UIScene.ts'), 'utf8');
assert(uiSceneSrc.includes('ui_pack_panel_hud'), 'UIScene tích hợp ui_pack_panel_hud cho khung chỉ số sinh tồn');
assert(uiSceneSrc.includes('ui_pack_panel_quest'), 'UIScene tích hợp ui_pack_panel_quest cho khung nhiệm vụ');
assert(uiSceneSrc.includes('ui_pack_slot_idle') && uiSceneSrc.includes('ui_pack_slot_hover') && uiSceneSrc.includes('ui_pack_slot_selected'), 'UIScene tích hợp ui_pack_slot_* cho 8 ô Hotbar');
assert(uiSceneSrc.includes('ui_pack_slot_equip'), 'UIScene tích hợp ui_pack_slot_equip cho 4 ô trang bị đáy');
assert(uiSceneSrc.includes('ui_pack_equip_${eq.slot}') || uiSceneSrc.includes('ui_pack_equip_body'), 'UIScene tích hợp 4 icon pixel art ui_pack_equip_*');
assert(uiSceneSrc.includes('ui_pack_panel_dialogue') && uiSceneSrc.includes('ui_pack_ribbon_header'), 'UIScene tích hợp khung thoại ui_pack_panel_dialogue và ruy-băng tên NPC ui_pack_ribbon_header');

// 4. Kiểm tra QuickCraftSidebar.ts
const quickCraftSrc = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'QuickCraftSidebar.ts'), 'utf8');
assert(quickCraftSrc.includes('ui_pack_slot_idle') && quickCraftSrc.includes('ui_pack_slot_hover'), 'QuickCraftSidebar tích hợp ui_pack_slot_* cho các ô ghim nhanh');

// 5. Kiểm tra ParchmentWorldMapModal.ts
const mapModalSrc = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'ParchmentWorldMapModal.ts'), 'utf8');
assert(mapModalSrc.includes('ui_pack_world_map_scroll'), 'ParchmentWorldMapModal tích hợp cuộn bản đồ ui_pack_world_map_scroll');
assert(mapModalSrc.includes('ui_pack_map_pin'), 'ParchmentWorldMapModal tích hợp chốt vị trí ui_pack_map_pin');

// 6. Kiểm tra JournalModal.ts
const journalSrc = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'JournalModal.ts'), 'utf8');
assert(journalSrc.includes('ui_pack_open_book_desk'), 'JournalModal tích hợp sách mở đôi ui_pack_open_book_desk');
assert(journalSrc.includes('ui_pack_btn_wood'), 'JournalModal tích hợp nút gỗ ui_pack_btn_wood');

// 7. Kiểm tra CraftingModal.ts
const craftSrc = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'CraftingModal.ts'), 'utf8');
assert(craftSrc.includes('ui_pack_open_book_desk'), 'CraftingModal tích hợp sách mở đôi ui_pack_open_book_desk');
assert(craftSrc.includes('ui_pack_slot_large'), 'CraftingModal tích hợp ô xem trước lớn ui_pack_slot_large');
assert(craftSrc.includes('ui_pack_tab_craft'), 'CraftingModal tích hợp tai sách đánh dấu ui_pack_tab_craft');

// 8. Kiểm tra PauseModal.ts
const pauseSrc = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'PauseModal.ts'), 'utf8');
assert(pauseSrc.includes('ui_pack_panel_modal'), 'PauseModal tích hợp khung ui_pack_panel_modal');
assert(pauseSrc.includes('ui_pack_btn_wood'), 'PauseModal tích hợp nút gỗ ui_pack_btn_wood');

// 9. Kiểm tra EquipmentModal.ts & StorageChestModal.ts
const equipSrc = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'EquipmentModal.ts'), 'utf8');
assert(equipSrc.includes('ui_pack_panel_modal'), 'EquipmentModal tích hợp khung ui_pack_panel_modal');
assert(equipSrc.includes('ui_pack_equip_'), 'EquipmentModal tích hợp icon trang bị ui_pack_equip_*');

const chestSrc = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'StorageChestModal.ts'), 'utf8');
assert(chestSrc.includes('ui_pack_panel_modal'), 'StorageChestModal tích hợp khung ui_pack_panel_modal');
assert(chestSrc.includes('ui_pack_btn_wood'), 'StorageChestModal tích hợp nút gỗ ui_pack_btn_wood');

// 10. Kiểm tra ASSETS_MANIFEST.json
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'ASSETS_MANIFEST.json'), 'utf8'));
const uiAssets = manifest.categories.ui;
assert(
  Array.isArray(uiAssets) && uiAssets.filter(({ path: assetPath }) => path.basename(assetPath).startsWith('ui_pack_')).length === 28,
  'ASSETS_MANIFEST.json chứa đầy đủ 28 file UI Pack'
);

console.log(`\n========================================================================`);
console.log(`KẾT QUẢ: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`========================================================================\n`);

if (failCount > 0) process.exit(1);
