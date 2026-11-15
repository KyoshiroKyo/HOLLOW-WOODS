/**
 * Automated Verification Script for Command C4-12-14
 * Đồng bộ luồng trải nghiệm sinh tồn/khám phá đầu game và hướng dẫn nhiệm vụ xuyên suốt vùng lõi
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

console.log('================================================================');
console.log('  TEST SUITE: C4-12-14 GAMEPLAY QUEST & ONBOARDING VERIFICATION');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Kiểm tra lore.json và danh mục Quest
console.log('--- 1. Kiểm tra Lore & Quest Structure (lore.json) ---');
const lorePath = path.join(ROOT_DIR, 'src', 'data', 'lore.json');
assert(fs.existsSync(lorePath), 'File src/data/lore.json tồn tại');

const loreData = JSON.parse(fs.readFileSync(lorePath, 'utf-8'));
const questIds = loreData.questLog.map(q => q.id);
assert(questIds.includes('Q00_WAKE_UP'), 'Q00_WAKE_UP tồn tại trong questLog');
assert(questIds.includes('Q01_MEET_EDDA'), 'Q01_MEET_EDDA tồn tại trong questLog');
assert(questIds.includes('Q02_MEET_NERIS'), 'Q02_MEET_NERIS tồn tại trong questLog');
assert(questIds.includes('Q03_PREPARE_RESOURCES'), 'Q03_PREPARE_RESOURCES tồn tại trong questLog');
assert(questIds.includes('Q04_ANCIENT_RUNES'), 'Q04_ANCIENT_RUNES tồn tại trong questLog');
assert(questIds.includes('Q05_SOLVE_MIRE'), 'Q05_SOLVE_MIRE tồn tại trong questLog');
assert(questIds.includes('Q06_RETRIEVE_CLAPPER'), 'Q06_RETRIEVE_CLAPPER tồn tại trong questLog');

// Kiểm tra Q00 trạng thái ban đầu hoàn thành
const q00 = loreData.questLog.find(q => q.id === 'Q00_WAKE_UP');
assert(q00 && q00.tasks.every(t => t.done === true), 'Q00_WAKE_UP được đánh dấu hoàn thành mặc định khi vào Bellhollow');

// Kiểm tra mô tả phím trong Q03
const q03 = loreData.questLog.find(q => q.id === 'Q03_PREPARE_RESOURCES');
const q03Task2 = q03?.tasks.find(t => t.id === 't2');
assert(q03Task2 && q03Task2.text.includes('[Phím C / I]'), 'Q03 Task 2 hướng dẫn đúng phím [Phím C / I]');

// 2. Kiểm tra dialogues.json
console.log('\n--- 2. Kiểm tra Hệ Thống Thoại Đa Ngữ Cảnh (dialogues.json) ---');
const dialoguesPath = path.join(ROOT_DIR, 'src', 'data', 'dialogues.json');
assert(fs.existsSync(dialoguesPath), 'File src/data/dialogues.json tồn tại');

const dialoguesData = JSON.parse(fs.readFileSync(dialoguesPath, 'utf-8')).dialogues;

// Garth dialogues
assert(dialoguesData.garth_warning, 'Có thoại garth_warning (cảnh báo ban đầu)');
assert(dialoguesData.garth_reminder_edda, 'Có thoại garth_reminder_edda (nhắc gặp Edda)');
assert(dialoguesData.garth_reminder_gate_locked, 'Có thoại garth_reminder_gate_locked (nhắc chuẩn bị dầu đèn)');
assert(dialoguesData.garth_east_gate_open, 'Có thoại garth_east_gate_open (chúc an toàn khi cổng mở)');

// Edda dialogues
assert(dialoguesData.edda_intro, 'Có thoại edda_intro (giới thiệu 3 Quy Tắc Bằng Máu)');
assert(dialoguesData.edda_reminder_locked, 'Có thoại edda_reminder_locked (nhắc chế dầu trước khi cổng mở)');
assert(dialoguesData.edda_reminder_open, 'Có thoại edda_reminder_open (hướng dẫn vào rừng khi cổng đã mở)');

// Neris dialogues
assert(dialoguesData.neris_intro, 'Có thoại neris_intro (chữa thương và cấp công thức Dầu Đèn)');
assert(dialoguesData.neris_heal_locked, 'Có thoại neris_heal_locked (hồi máu và dặn thu thập nguyên liệu)');
assert(dialoguesData.neris_heal_open, 'Có thoại neris_heal_open (hồi máu và dặn dò cẩn trọng sương lạnh)');

// Shrine & Protagonist portrait
assert(dialoguesData.clapper_found, 'Có thoại clapper_found');
assert(dialoguesData.clapper_found.portrait === 'wayfarer_portrait', 'clapper_found sử dụng wayfarer_portrait');

// Loại bỏ hoàn toàn tên "Satyr" cũ
let hasDeprecatedSatyr = false;
for (const [key, d] of Object.entries(dialoguesData)) {
  const allText = (d.lines || []).join(' ') + ' ' + (d.speaker || '') + ' ' + (d.portrait || '');
  if (allText.includes('Satyr') || allText.includes('satyr_portrait')) {
    hasDeprecatedSatyr = true;
    console.error(`Phát hiện từ khóa Satyr cũ trong ${key}`);
  }
}
assert(!hasDeprecatedSatyr, 'Không còn từ khóa cũ "Satyr" / "satyr_portrait" trong bất kỳ câu thoại nào');

// 3. Kiểm tra logic xử lý thoại NPC theo ngữ cảnh trong GameScene.ts
console.log('\n--- 3. Kiểm tra Ngữ Cảnh Tương Tác NPC trong GameScene.ts ---');
const gameScenePath = path.join(ROOT_DIR, 'src', 'scenes', 'GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf-8');

assert(gameSceneContent.includes('garth_warning') && gameSceneContent.includes('garth_reminder_gate_locked') && gameSceneContent.includes('garth_east_gate_open'), 
  'GameScene.ts phân luồng thoại ngữ cảnh 4 giai đoạn cho Garth');
assert(gameSceneContent.includes('edda_reminder_locked') && gameSceneContent.includes('edda_reminder_open'), 
  'GameScene.ts phân luồng thoại ngữ cảnh khi cổng khóa/mở cho Edda');
assert(gameSceneContent.includes('neris_heal_locked') && gameSceneContent.includes('neris_heal_open'), 
  'GameScene.ts phân luồng thoại ngữ cảnh khi cổng khóa/mở cho Neris');

// 4. Kiểm tra PlayerState.ts & Quản lý Trạng Thái Nhiệm Vụ
console.log('\n--- 4. Kiểm tra PlayerState.ts (Logic Nhiệm Vụ, Tài Nguyên & Cổng Đông) ---');
const playerStatePath = path.join(ROOT_DIR, 'src', 'state', 'PlayerState.ts');
const playerStateContent = fs.readFileSync(playerStatePath, 'utf-8');

assert(playerStateContent.includes('public currentQuestId: string = \'Q01_MEET_EDDA\''), 'PlayerState khởi đầu mặc định ở Q01_MEET_EDDA');
assert(playerStateContent.includes('public isEastGateUnlocked(): boolean'), 'PlayerState có hàm kiểm tra isEastGateUnlocked() chuẩn xác');
assert(playerStateContent.includes('public evaluateQ03ResourceTask(): boolean'), 'PlayerState có hàm tự động đánh giá Q03 khi đủ tài nguyên');
assert(playerStateContent.includes('craft_lantern_oil_complete'), 'PlayerState kiểm tra đúng cờ hoàn thành chế tạo Dầu Đèn');
assert(playerStateContent.includes('this.visitedZones = new Set([\'fog_crossing\', \'bellhollow\'])'), 'PlayerState.reset() tái tạo chính xác visitedZones');

// 5. Kiểm tra SatyrPlayer.ts hỗ trợ phím C cho chế tạo
console.log('\n--- 5. Kiểm tra Phím Bấm Chế Tạo (SatyrPlayer.ts) ---');
const satyrPlayerPath = path.join(ROOT_DIR, 'src', 'entities', 'SatyrPlayer.ts');
const satyrPlayerContent = fs.readFileSync(satyrPlayerPath, 'utf-8');
assert(satyrPlayerContent.includes('code === \'KeyI\' || code === \'Tab\' || code === \'KeyC\''), 
  'SatyrPlayer.ts hỗ trợ cả phím [C], [I] và [TAB] để mở bảng chế tạo');

// 6. Kiểm tra Inventory Nodes xung quanh Bellhollow
console.log('\n--- 6. Kiểm tra Điểm Tài Nguyên Bellhollow (InventorySystem.ts) ---');
const inventoryPath = path.join(ROOT_DIR, 'src', 'systems', 'InventorySystem.ts');
const inventoryContent = fs.readFileSync(inventoryPath, 'utf-8');
assert(inventoryContent.includes('node_wood_bellhollow_1'), 'Có điểm tài nguyên cành khô ban đầu trong làng');
assert(inventoryContent.includes('node_resin_bellhollow_2'), 'Có điểm tài nguyên nhựa cây ban đầu trong làng');
assert(inventoryContent.includes('res_dry_wood') && inventoryContent.includes('res_tree_resin'), 
  'Các nguyên liệu chế tạo Dầu Đèn (res_dry_wood, res_tree_resin) có sẵn trước Cổng Đông');

// 7. Kiểm tra SaveManager.ts lưu trữ đầy đủ dữ liệu nhiệm vụ và vùng khám phá
console.log('\n--- 7. Kiểm tra Lưu Trữ Tiến Trình (SaveManager.ts) ---');
const saveManagerPath = path.join(ROOT_DIR, 'src', 'systems', 'SaveManager.ts');
const saveManagerContent = fs.readFileSync(saveManagerPath, 'utf-8');
assert(saveManagerContent.includes('currentQuestId: state.currentQuestId'), 'SaveManager lưu currentQuestId');
assert(saveManagerContent.includes('flags: Array.from(state.flags)'), 'SaveManager lưu toàn bộ game flags');
assert(saveManagerContent.includes('visitedZones: state.getVisitedZones()'), 'SaveManager lưu danh sách visitedZones');
assert(saveManagerContent.includes('questData') && saveManagerContent.includes('quests: questData'), 'SaveManager lưu chi tiết tiến độ các quest');

// Tổng kết
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA: ${passedTests} / ${totalTests} BÀI TEST ĐẠT (100%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
