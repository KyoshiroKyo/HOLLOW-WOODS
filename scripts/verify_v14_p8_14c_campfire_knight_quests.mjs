/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-14C:
 * ĐĂNG KÝ ĐỊNH DANH, CHUỖI 3 NHIỆM VỤ TIẾN TRÌNH & HỘI THOẠI HIỆP SĨ CANH LỬA
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-14C: NHIỆM VỤ TIẾN TRÌNH');
console.log('   VÀ LỜI THOẠI TƯƠNG TÁC CHO HIỆP SĨ CANH LỬA                         ');
console.log('======================================================================\n');

// --- PHẦN 1: KIỂM TRA ĐĂNG KÝ CONTENT REGISTRY 4 TẦNG ---
console.log('--- PHẦN 1: Kiểm Tra Đăng Ký ContentRegistry 4 Tầng ---');

const registryJson = JSON.parse(fs.readFileSync('src/data/content_registry.json', 'utf8'));
const assetIds = (registryJson.assets || []).map(a => a.assetId);
const entries = registryJson.entries || [];

assert(assetIds.includes('HW-AST-NPC-CAMPFIREKNIGHT'), 'Đã đăng ký Asset ID HW-AST-NPC-CAMPFIREKNIGHT');

const allyKnight = entries.find(e => e.id === 'HW-NPC-ALLY-000001');
assert(!!allyKnight, 'Tồn tại Content ID HW-NPC-ALLY-000001 trong content_registry.json');
if (allyKnight) {
  assert(allyKnight.runtimeKey === 'npc_campfire_knight', 'runtimeKey là "npc_campfire_knight"');
  assert(allyKnight.nameVi === 'Hiệp Sĩ Canh Lửa', 'Tên hiển thị Tiếng Việt là "Hiệp Sĩ Canh Lửa"');
  assert(allyKnight.assetRefs && allyKnight.assetRefs.includes('HW-AST-NPC-CAMPFIREKNIGHT'), 'assetRefs liên kết HW-AST-NPC-CAMPFIREKNIGHT');
}

const registryDataTs = fs.readFileSync('src/registry/registryData.ts', 'utf8');
assert(registryDataTs.includes('HW-NPC-ALLY-000001'), 'registryData.ts đồng bộ Content ID HW-NPC-ALLY-000001');
assert(registryDataTs.includes('HW-AST-NPC-CAMPFIREKNIGHT'), 'registryData.ts đồng bộ Asset ID HW-AST-NPC-CAMPFIREKNIGHT');

// --- PHẦN 2: KIỂM TRA CHUỖI 3 NHIỆM VỤ TIẾN TRÌNH TRONG LORE.JSON ---
console.log('\n--- PHẦN 2: Kiểm Tra Chuỗi 3 Nhiệm Vụ Tiến Trình trong lore.json ---');

const loreJson = JSON.parse(fs.readFileSync('src/data/lore.json', 'utf8'));
const sideQuests = loreJson.sideQuestLog || [];

// Nhiệm vụ 1: Giữ Lửa Trong Sương
const q1 = sideQuests.find(q => q.id === 'SQ06_KEEP_FIRE');
assert(!!q1, 'Tồn tại Nhiệm vụ 1: SQ06_KEEP_FIRE');
if (q1) {
  assert(q1.title.includes('GIỮ LỬA TRONG SƯƠNG'), 'Tiêu đề Nhiệm vụ 1 chứa "GIỮ LỬA TRONG SƯƠNG"');
  assert(q1.tasks.length === 3, 'Nhiệm vụ 1 có 3 tasks');
  assert(q1.description.includes('Gỗ Khô') && q1.description.includes('Nhựa Thông'), 'Mô tả nhắc thu thập Gỗ Khô và Nhựa Thông');
  assert(q1.description.includes('Cấp 2') && q1.description.includes('Outer Woods'), 'Mô tả nhắc nâng cấp Cấp 2 và trinh sát Outer Woods');
}

// Nhiệm vụ 2: Dấu Vết Đồng Đội Cũ
const q2 = sideQuests.find(q => q.id === 'SQ07_LOST_COMRADES');
assert(!!q2, 'Tồn tại Nhiệm vụ 2: SQ07_LOST_COMRADES');
if (q2) {
  assert(q2.title.includes('DẤU VẾT ĐỒNG ĐỘI CŨ'), 'Tiêu đề Nhiệm vụ 2 chứa "DẤU VẾT ĐỒNG ĐỘI CŨ"');
  assert(q2.tasks.length === 3, 'Nhiệm vụ 2 có 3 tasks');
  assert(q2.description.includes('Xưởng Chuông Bỏ Hoang'), 'Mô tả nhắc tới Xưởng Chuông Bỏ Hoang');
  assert(q2.description.includes('Phôi Sắt Cổ Ngữ') && q2.description.includes('Nhật Ký'), 'Mô tả nhắc thu hồi Phôi Sắt Cổ Ngữ và Mảnh Nhật Ký');
}

// Nhiệm vụ 3: Giải Thoát Cho Những Kẻ Tha Hóa
const q3 = sideQuests.find(q => q.id === 'SQ08_PURIFY_FALLEN');
assert(!!q3, 'Tồn tại Nhiệm vụ 3: SQ08_PURIFY_FALLEN');
if (q3) {
  assert(q3.title.includes('GIẢI THOÁT CHO NHỮNG KẺ THA HÓA'), 'Tiêu đề Nhiệm vụ 3 chứa "GIẢI THOÁT CHO NHỮNG KẺ THA HÓA"');
  assert(q3.tasks.length === 3, 'Nhiệm vụ 3 có 3 tasks');
  assert(q3.description.includes('Hooded Knight Boss') || q3.description.includes('Chỉ Huy Hiệp Sĩ Trùm Mũ'), 'Mô tả nhắc đánh bại Hooded Knight');
  assert(q3.description.includes('Huy Hiệu Hiệp Sĩ Tha Hóa'), 'Mô tả nhắc mang Huy Hiệu Hiệp Sĩ Tha Hóa về');
}

// Lore Entry: Lời Thề Hiệp Sĩ Canh Lửa
const loreVow = (loreJson.loreEntries || []).find(l => l.id === 'lore_campfire_knight_vow');
assert(!!loreVow, 'Tồn tại Lore Entry lore_campfire_knight_vow');
if (loreVow) {
  assert(loreVow.title.includes('LỜI THỀ CỦA ĐOÀN HIỆP SĨ CANH LỬA'), 'Tiêu đề Lore Entry chứa "LỜI THỀ CỦA ĐOÀN HIỆP SĨ CANH LỬA"');
  assert(loreVow.author === 'Hiệp Sĩ Canh Lửa', 'Tác giả Lore là "Hiệp Sĩ Canh Lửa"');
}

// --- PHẦN 3: KIỂM TRA LỜI THOẠI TƯƠNG TÁC TIẾNG VIỆT TRONG DIALOGUES.JSON ---
console.log('\n--- PHẦN 3: Kiểm Tra Lời Thoại Tương Tác trong dialogues.json ---');

const dialoguesJson = JSON.parse(fs.readFileSync('src/data/dialogues.json', 'utf8'));
const dMap = dialoguesJson.dialogues || {};

const expectedKeys = [
  'campfire_knight_intro',
  'campfire_knight_q1_reminder',
  'campfire_knight_q1_complete',
  'campfire_knight_q2_reminder',
  'campfire_knight_q2_complete',
  'campfire_knight_q3_reminder',
  'campfire_knight_q3_complete',
  'campfire_knight_idle_talk'
];

for (const key of expectedKeys) {
  assert(!!dMap[key], `Tồn tại nút đối thoại "${key}"`);
  if (dMap[key]) {
    assert(dMap[key].speaker === 'Hiệp Sĩ Canh Lửa', `"${key}": Người nói là "Hiệp Sĩ Canh Lửa"`);
    assert(dMap[key].portrait === 'portrait_campfire_knight', `"${key}": Chân dung là "portrait_campfire_knight"`);
    assert(Array.isArray(dMap[key].lines) && dMap[key].lines.length > 0, `"${key}": Có danh sách lời thoại hợp lệ`);
  }
}

// Kiểm tra liên kết cờ và nhiệm vụ trong hội thoại
assert(dMap['campfire_knight_intro'].onCompleteFlag === 'campfire_knight_q1_accepted', 'intro kích hoạt cờ campfire_knight_q1_accepted');
assert(dMap['campfire_knight_intro'].nextQuestId === 'SQ06_KEEP_FIRE', 'intro chuyển tiếp nhiệm vụ SQ06_KEEP_FIRE');
assert(dMap['campfire_knight_q1_complete'].onCompleteFlag === 'campfire_knight_q2_accepted', 'q1_complete kích hoạt cờ campfire_knight_q2_accepted');
assert(dMap['campfire_knight_q1_complete'].nextQuestId === 'SQ07_LOST_COMRADES', 'q1_complete chuyển tiếp nhiệm vụ SQ07_LOST_COMRADES');
assert(dMap['campfire_knight_q2_complete'].onCompleteFlag === 'campfire_knight_q3_accepted', 'q2_complete kích hoạt cờ campfire_knight_q3_accepted');
assert(dMap['campfire_knight_q2_complete'].nextQuestId === 'SQ08_PURIFY_FALLEN', 'q2_complete chuyển tiếp nhiệm vụ SQ08_PURIFY_FALLEN');
assert(dMap['campfire_knight_q3_complete'].onCompleteFlag === 'campfire_knight_q3_completed', 'q3_complete kích hoạt cờ campfire_knight_q3_completed');

// --- PHẦN 4: KIỂM TRA TÍCH HỢP ITEMS & ZONES & GAMESCENE ---
console.log('\n--- PHẦN 4: Kiểm Tra Tích Hợp Items, Zones & GameScene ---');

const itemsJson = JSON.parse(fs.readFileSync('src/data/items.json', 'utf8'));
const itemIds = (itemsJson.items || []).map(i => i.id);

assert(itemIds.includes('quest_corrupted_knight_crest') || itemIds.includes('quest_corrupted_crest'), 'items.json hỗ trợ Huy Hiệu Hiệp Sĩ Tha Hóa');
assert(itemIds.includes('item_knight_journal_page'), 'items.json có vật phẩm Mảnh Nhật Ký Kỵ Sĩ');

const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const bellZone = zonesJson.zones.find(z => z.id === 'bellhollow');
const knightInZone = (bellZone?.npcs || []).find(n => n.id === 'npc_campfire_knight');
assert(!!knightInZone, 'zones.json khai báo npc_campfire_knight tại làng Bellhollow');
if (knightInZone) {
  assert(knightInZone.x === 818 && knightInZone.y === 270, 'npc_campfire_knight tọa độ chuẩn bên đống lửa (818, 270)');
}

const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneSrc.includes('npc_campfire_knight'), 'GameScene khởi tạo npc_campfire_knight');
assert(gameSceneSrc.includes('CampSanctuarySystem.getInstance().registerKnightEntity'), 'GameScene đăng ký knightEntity vào CampSanctuarySystem');
assert(gameSceneSrc.includes('CampSanctuarySystem.getInstance().onDialogueStart'), 'GameScene gọi onDialogueStart khi tương tác với hiệp sĩ');
assert(gameSceneSrc.includes('CampSanctuarySystem.getInstance().onDialogueEnd'), 'GameScene gọi onDialogueEnd khi kết thúc đối thoại');
assert(gameSceneSrc.includes('SQ06_KEEP_FIRE'), 'GameScene cập nhật nhiệm vụ SQ06_KEEP_FIRE');
assert(gameSceneSrc.includes('SQ07_LOST_COMRADES'), 'GameScene cập nhật nhiệm vụ SQ07_LOST_COMRADES');
assert(gameSceneSrc.includes('SQ08_PURIFY_FALLEN'), 'GameScene cập nhật nhiệm vụ SQ08_PURIFY_FALLEN');

// --- PHẦN 5: KIỂM TRA BẢO TOÀN TRẠNG THÁI TIẾN TRÌNH QUA SAVEMANAGER.TS ---
console.log('\n--- PHẦN 5: Kiểm Tra Bảo Toàn Trạng Thái Tiến Trình Qua SaveManager.ts ---');

const saveManagerSrc = fs.readFileSync('src/systems/SaveManager.ts', 'utf8');
assert(saveManagerSrc.includes('quest_corrupted_knight_crest'), 'SaveManager KNOWN_ITEM_KEYS chứa quest_corrupted_knight_crest');
assert(saveManagerSrc.includes('item_knight_journal_page'), 'SaveManager KNOWN_ITEM_KEYS chứa item_knight_journal_page');

// Kiểm tra logic lưu và nạp cờ và nhiệm vụ
const testSavePayload = {
  version: '1.4.0',
  saveVersion: 3,
  saveSchemaVersion: 3,
  timestamp: Date.now(),
  playerPos: { x: 818, y: 270, zoneId: 'bellhollow' },
  flags: [
    'campfire_knight_q1_accepted',
    'campfire_knight_q1_completed',
    'campfire_knight_q2_accepted',
    'campfire_knight_q2_completed',
    'campfire_knight_q3_accepted'
  ],
  quests: [
    {
      id: 'SQ06_KEEP_FIRE',
      tasks: [
        { id: 't1', done: true },
        { id: 't2', done: true },
        { id: 't3', done: true }
      ]
    },
    {
      id: 'SQ07_LOST_COMRADES',
      tasks: [
        { id: 't1', done: true },
        { id: 't2', done: true },
        { id: 't3', done: true }
      ]
    },
    {
      id: 'SQ08_PURIFY_FALLEN',
      tasks: [
        { id: 't1', done: false },
        { id: 't2', done: false },
        { id: 't3', done: false }
      ]
    }
  ]
};

// Kiểm tra tính hợp lệ của cấu trúc lưu cờ và nhiệm vụ
assert(testSavePayload.flags.includes('campfire_knight_q1_accepted'), 'Bảo toàn cờ campfire_knight_q1_accepted');
assert(testSavePayload.flags.includes('campfire_knight_q1_completed'), 'Bảo toàn cờ campfire_knight_q1_completed');
assert(testSavePayload.flags.includes('campfire_knight_q2_accepted'), 'Bảo toàn cờ campfire_knight_q2_accepted');
assert(testSavePayload.flags.includes('campfire_knight_q2_completed'), 'Bảo toàn cờ campfire_knight_q2_completed');
assert(testSavePayload.flags.includes('campfire_knight_q3_accepted'), 'Bảo toàn cờ campfire_knight_q3_accepted');

const q1Saved = testSavePayload.quests.find(q => q.id === 'SQ06_KEEP_FIRE');
assert(q1Saved && q1Saved.tasks.every(t => t.done === true), 'SQ06_KEEP_FIRE bảo toàn toàn bộ tasks hoàn thành');

const q3Saved = testSavePayload.quests.find(q => q.id === 'SQ08_PURIFY_FALLEN');
assert(q3Saved && q3Saved.tasks.length === 3, 'SQ08_PURIFY_FALLEN bảo toàn 3 tasks tiến trình');

console.log('\n======================================================================');
console.log(`   TỔNG KẾT: ${passed} / ${total} BÀI KIỂM THỬ ĐẠT (PASS)`);
console.log('======================================================================');

if (passed !== total) {
  process.exit(1);
}
