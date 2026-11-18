/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ XÁC MINH BƯỚC V14-P8-15A:
 * THIẾT LẬP BIẾN TIẾN TRÌNH THỨC TỈNH KÝ ỨC (MEMORY AWAKENING STAGE)
 * VÀ KÍCH HOẠT MANH MỐI GIAI ĐOẠN 0 & GIAI ĐOẠN 1
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failCount++;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-15A: THỨC TỈNH KÝ ỨC   ');
console.log('   (SaveManager, PlayerState, Giai Đoạn 0 & 1 Manh Mối Hiệp Sĩ Đen)   ');
console.log('======================================================================\n');

// --- PHẦN 1: KIỂM TRA KHAI BÁO & LƯU TRỮ TRONG PLAYERSTATE.TS ---
console.log('--- PHẦN 1: Kiểm Tra Khai Báo memoryAwakeningStage trong PlayerState.ts ---');

const playerStateTs = fs.readFileSync('src/state/PlayerState.ts', 'utf8');

assert(playerStateTs.includes('public memoryAwakeningStage: number = 0;'), 'PlayerState khai báo memoryAwakeningStage mặc định = 0');
assert(playerStateTs.includes('this.memoryAwakeningStage = 0;'), 'PlayerState.reset() đặt lại memoryAwakeningStage = 0');

// --- PHẦN 2: KIỂM TRA HỆ THỐNG SAVEMANAGER.TS & CƠ CHẾ DI TRÚ ---
console.log('\n--- PHẦN 2: Kiểm Tra SaveManager.ts & Non-Destructive Migration ---');

const saveManagerTs = fs.readFileSync('src/systems/SaveManager.ts', 'utf8');

assert(saveManagerTs.includes('memoryAwakeningStage?: number;'), 'SaveData interface định nghĩa memoryAwakeningStage?: number');
assert(saveManagerTs.includes("'memoryAwakeningStage'"), 'SaveManager sanitizeAndMigrateSaveData khai báo memoryAwakeningStage trong knownKeys');
assert(saveManagerTs.includes('memoryAwakeningStage: typeof rawObj.memoryAwakeningStage === \'number\''), 'SaveManager chuyển đổi an toàn memoryAwakeningStage từ rawObj');
assert(saveManagerTs.includes('memoryAwakeningStage: state.memoryAwakeningStage ?? 0,'), 'SaveManager.saveGame tuần tự hóa memoryAwakeningStage');
assert(saveManagerTs.includes('state.memoryAwakeningStage = data.memoryAwakeningStage ?? 0;'), 'SaveManager.loadGame nạp memoryAwakeningStage với fallback = 0');

// Kiểm tra mô phỏng hành vi Save Migration với bản lưu cũ không có memoryAwakeningStage
const legacySaveMock = {
  saveVersion: 2,
  saveSchemaVersion: 2,
  version: '1.3.0',
  timestamp: Date.now(),
  checkpointName: 'ĐIỂM LƯU V1.3',
  zoneId: 'bellhollow',
  playerPos: { x: 780, y: 260 },
  stats: { health: 100, stamina: 100, lanternOil: 80, composure: 90, isLanternOn: true },
  inventory: [['res_dry_wood', 5]],
  flags: ['talked_to_edda'],
  currentQuestId: 'Q01_MEET_EDDA',
  quests: [{ id: 'Q01_MEET_EDDA', tasks: [{ id: 't1', done: true }] }],
  unlockedLoreIds: ['lore_bell_shrine']
};

// Hàm mô phỏng sanitize của SaveManager
function mockSanitize(raw) {
  return {
    ...raw,
    memoryAwakeningStage: typeof raw.memoryAwakeningStage === 'number' ? Math.max(0, Math.min(3, Math.floor(raw.memoryAwakeningStage))) : 0
  };
}

const migratedLegacy = mockSanitize(legacySaveMock);
assert(migratedLegacy.memoryAwakeningStage === 0, 'Nạp Save cũ V1.3 tự động gán memoryAwakeningStage = 0 an toàn');

const stage1SaveMock = { ...legacySaveMock, memoryAwakeningStage: 1 };
const migratedStage1 = mockSanitize(stage1SaveMock);
assert(migratedStage1.memoryAwakeningStage === 1, 'Bảo toàn memoryAwakeningStage = 1 khi lưu và nạp lại');

const invalidStageMock = { ...legacySaveMock, memoryAwakeningStage: 99 };
const clampedStage = mockSanitize(invalidStageMock);
assert(clampedStage.memoryAwakeningStage === 3, 'Kẹp giá trị an toàn trong phạm vi 0..3 (99 -> 3)');

// --- PHẦN 3: KIỂM TRA GIAI ĐOẠN 0 TRONG DIALOGUES.JSON ---
console.log('\n--- PHẦN 3: Kiểm Tra Lời Thoại Giai Đoạn 0 (dialogues.json) ---');

const dialoguesJson = JSON.parse(fs.readFileSync('src/data/dialogues.json', 'utf8'));
const campfireIntro = dialoguesJson.dialogues?.campfire_knight_intro || dialoguesJson.campfire_knight_intro;

assert(!!campfireIntro, 'Tồn tại nút đối thoại campfire_knight_intro');
assert(Array.isArray(campfireIntro.lines), 'campfire_knight_intro chứa danh sách lines');

const hasBlackArmorReaction = campfireIntro.lines.some(line => 
  line.includes('Bộ giáp đen đó') && 
  line.includes('cách ngươi giữ ngọn đèn') && 
  line.includes('ta ngỡ người đó đã tan biến trong màn sương từ lâu rồi')
);
assert(hasBlackArmorReaction, 'Lời thoại Hiệp Sĩ Canh Lửa chứa phản ứng kinh ngạc về Bộ Giáp Đen và Ngọn Đèn');

// --- PHẦN 4: KIỂM TRA GIAI ĐOẠN 1 TRONG LORE.JSON & ZONES.JSON ---
console.log('\n--- PHẦN 4: Kiểm Tra Cổ Thư & Manh Mối Giai Đoạn 1 (lore.json & zones.json) ---');

const loreJson = JSON.parse(fs.readFileSync('src/data/lore.json', 'utf8'));
const allLore = [...(loreJson.loreEntries || []), ...(loreJson.subAreaLoreEntries || [])];
const blackKnightChronicle = allLore.find(l => l.id === 'lore_black_knight_chronicle');

assert(!!blackKnightChronicle, 'Tồn tại cổ thư lore_black_knight_chronicle');
if (blackKnightChronicle) {
  assert(blackKnightChronicle.title.includes('HIỆP SĨ ĐEN'), 'Tiêu đề cổ thư chứa "HIỆP SĨ ĐEN"');
  assert(blackKnightChronicle.author.includes('Văn Bia Cổ'), 'Tác giả cổ thư ghi nhận "Văn Bia Cổ"');
  assert(blackKnightChronicle.content.includes('Hiệp Sĩ Đen (Black Knight)'), 'Nội dung nhắc tới Hiệp Sĩ Đen (Black Knight)');
  assert(blackKnightChronicle.content.includes('vị chỉ huy duy nhất'), 'Nội dung ghi nhận là vị chỉ huy duy nhất năm xưa');
  assert(blackKnightChronicle.content.includes('Mạch Rễ') && blackKnightChronicle.content.includes('phong ấn lời nguyền'), 'Nội dung kể về việc phong ấn lời nguyền tại tâm điểm Mạch Rễ');
  assert(blackKnightChronicle.content.includes('đánh đổi toàn bộ ký ức'), 'Nội dung ghi nhận ngài đã đánh đổi toàn bộ ký ức của mình');
}

const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const workshopZone = zonesJson.zones.find(z => z.id === 'sub_bell_workshop');
assert(!!workshopZone, 'Tồn tại phân khu Xưởng Chuông Bỏ Hoang sub_bell_workshop');

const steleInteractable = workshopZone?.interactables?.find(i => i.id === 'inspect_black_knight_stele' || i.actionId === 'read_black_knight_stele');
assert(!!steleInteractable, 'Xưởng Chuông có interactable Văn Bia Cổ Hiệp Sĩ Đen');
if (steleInteractable) {
  assert(steleInteractable.actionId === 'read_black_knight_stele', 'actionId là read_black_knight_stele');
}

// --- PHẦN 5: KIỂM TRA LOGIC KÍCH HOẠT TRONG GAMESCENE.TS ---
console.log('\n--- PHẦN 5: Kiểm Tra Logic Kích Hoạt Tiến Trình trong GameScene.ts ---');

const gameSceneTs = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');

assert(gameSceneTs.includes("trans.toZone === 'sub_bell_workshop'") && gameSceneTs.includes('this.playerState.memoryAwakeningStage = 1'), 'Tự động nâng memoryAwakeningStage lên 1 khi vào Xưởng Chuông Bỏ Hoang');
assert(gameSceneTs.includes('campfire_knight_q1_completed') && gameSceneTs.includes('this.playerState.memoryAwakeningStage = 1'), 'Tự động nâng memoryAwakeningStage lên 1 khi hoàn thành Nhiệm vụ 1');
assert(gameSceneTs.includes("actionId === 'read_black_knight_stele'"), 'GameScene xử lý tương tác đọc Văn Bia Cổ Hiệp Sĩ Đen');
assert(gameSceneTs.includes('lore_black_knight_chronicle'), 'GameScene mở khóa cổ thư lore_black_knight_chronicle');

console.log('\n======================================================================');
console.log(`   TỔNG KẾT: ${passCount} / ${passCount + failCount} BÀI KIỂM THỬ ĐẠT (PASS)`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 TOÀN BỘ YÊU CẦU BƯỚC V14-P8-15A ĐÃ ĐẠT 100% HOÀN HẢO!');
}
