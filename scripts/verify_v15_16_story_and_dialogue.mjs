import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('KIỂM TRA TỰ ĐỘNG BƯỚC V15-16: KIỂM TOÁN CỐT TRUYỆN & DIALOGUE CHOICES');
console.log('================================================================\n');

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

// -------------------------------------------------------------
// TEST 1: Kiểm toán dữ liệu dialogues.json & lore.json
// -------------------------------------------------------------
console.log('1. KIỂM TOÁN DIALOGUES.JSON & LORE.JSON:');

const dialoguesPath = path.resolve('src/data/dialogues.json');
const lorePath = path.resolve('src/data/lore.json');

const dialoguesRaw = fs.readFileSync(dialoguesPath, 'utf8');
const loreRaw = fs.readFileSync(lorePath, 'utf8');

const dialogues = JSON.parse(dialoguesRaw);
const lore = JSON.parse(loreRaw);

assert(dialogues && typeof dialogues.dialogues === 'object', 'dialogues.json đọc và parse thành công');
assert(lore && Array.isArray(lore.questLog), 'lore.json đọc và parse thành công');

// Kiểm tra phương hướng Neris trong dialogues.json
const dLinesToCheck = [
  ...dialogues.dialogues.edda_reminder_locked.lines,
  ...dialogues.dialogues.edda_reminder.lines
];
let nerisWrongDir = false;
let nerisCorrectDir = false;
for (const line of dLinesToCheck) {
  if (line.includes('Neris') && line.includes('Đông Bắc')) nerisWrongDir = true;
  if (line.includes('Neris') && line.includes('Tây Nam')) nerisCorrectDir = true;
}
assert(!nerisWrongDir, 'dialogues.json không còn nhắc Neris ở phía Đông Bắc');
assert(nerisCorrectDir, 'dialogues.json đã cập nhật Neris ở phía Tây Nam làng');

// Kiểm tra phương hướng Neris trong lore.json (Q02_MEET_NERIS)
const q02 = lore.questLog.find(q => q.id === 'Q02_MEET_NERIS');
assert(q02 !== undefined, 'Tìm thấy nhiệm vụ Q02_MEET_NERIS trong lore.json');
const t1 = q02?.tasks.find(t => t.id === 't1');
assert(t1 && t1.text.includes('Tây Nam'), `Q02_MEET_NERIS task t1 đúng hướng Tây Nam: "${t1?.text}"`);
assert(t1 && !t1.text.includes('Đông Bắc'), 'Q02_MEET_NERIS task t1 không còn ghi Đông Bắc');

// -------------------------------------------------------------
// TEST 2: Kiểm tra Lựa Chọn Hội Thoại (Choices) cho 6 NPC cốt lõi
// -------------------------------------------------------------
console.log('\n2. KIỂM TRA LỰA CHỌN HỘI THOẠI (INTERACTIVE DIALOGUE CHOICES):');

const targetKeys = [
  'garth_warning',
  'edda_intro',
  'neris_intro',
  'campfire_knight_intro',
  'bram_chat',
  'finn_chat'
];

for (const key of targetKeys) {
  const dlg = dialogues.dialogues[key];
  assert(dlg !== undefined, `Tìm thấy đoạn thoại: "${key}"`);
  assert(Array.isArray(dlg.choices) && dlg.choices.length >= 2, `"${key}" có ít nhất 2 lựa chọn (thực tế: ${dlg.choices?.length})`);
  
  if (Array.isArray(dlg.choices)) {
    for (let i = 0; i < dlg.choices.length; i++) {
      const c = dlg.choices[i];
      assert(typeof c.text === 'string' && c.text.length > 5, `  - Lựa chọn [${i + 1}] có nội dung hợp lệ: "${c.text.substring(0, 35)}..."`);
      if (c.trustDelta !== undefined) {
        assert(typeof c.trustDelta === 'number' && Math.abs(c.trustDelta) <= 5, `    + trustDelta hợp lệ: ${c.trustDelta}`);
      }
      if (c.setFlag !== undefined) {
        assert(typeof c.setFlag === 'string' && c.setFlag.length > 0, `    + setFlag hợp lệ: "${c.setFlag}"`);
      }
    }
  }
}

// -------------------------------------------------------------
// TEST 3: Kiểm tra Logic Tương Thích Ngược của SaveManager
// -------------------------------------------------------------
console.log('\n3. KIỂM TRA SAVE MANAGER & TÍNH TƯƠNG THÍCH NGƯỢC:');

// Giả lập SaveManager.sanitizeAndMigrateSaveData logic để kiểm tra cấu trúc
function mockSanitize(rawObj) {
  const villageTrustScore = typeof rawObj.villageTrustScore === 'number' && !isNaN(rawObj.villageTrustScore)
    ? Math.max(0, Math.min(100, Math.round(rawObj.villageTrustScore)))
    : 50;

  const storyFlags = [];
  if (Array.isArray(rawObj.storyFlags)) {
    for (const sf of rawObj.storyFlags) {
      if (typeof sf === 'string' && sf.trim().length > 0 && !storyFlags.includes(sf.trim())) {
        storyFlags.push(sf.trim());
      }
    }
  }

  return {
    ...rawObj,
    villageTrustScore,
    storyFlags
  };
}

// Test bản save cũ (không có villageTrustScore hay storyFlags)
const legacySave = {
  version: '1.4.0',
  timestamp: Date.now(),
  checkpointName: 'Sanctuary Camp',
  zoneId: 'bellhollow',
  playerPos: { x: 800, y: 700 },
  stats: { health: 100, stamina: 100, lanternOil: 75, composure: 90, isLanternOn: false },
  inventory: [['res_dry_wood', 2]],
  flags: ['talked_to_edda'],
  currentQuestId: 'Q02_MEET_NERIS',
  quests: []
};

const migratedLegacy = mockSanitize(legacySave);
assert(migratedLegacy.villageTrustScore === 50, 'Save cũ tự động gán villageTrustScore mặc định = 50');
assert(Array.isArray(migratedLegacy.storyFlags) && migratedLegacy.storyFlags.length === 0, 'Save cũ tự động gán storyFlags mặc định = []');

// Test bản save mới có storyFlags và villageTrustScore
const modernSave = {
  ...legacySave,
  villageTrustScore: 68,
  storyFlags: ['choice_garth_cooperative', 'choice_edda_promise_bell']
};
const migratedModern = mockSanitize(modernSave);
assert(migratedModern.villageTrustScore === 68, 'Save mới bảo toàn villageTrustScore = 68');
assert(migratedModern.storyFlags.length === 2 && migratedModern.storyFlags.includes('choice_garth_cooperative'), 'Save mới bảo toàn storyFlags nguyên vẹn');

// -------------------------------------------------------------
// TEST 4: Kiểm tra tính toàn vẹn của mã nguồn TypeScript
// -------------------------------------------------------------
console.log('\n4. KIỂM TRA MÃ NGUỒN TYPESCRIPT:');

const playerStateSource = fs.readFileSync('src/state/PlayerState.ts', 'utf8');
assert(playerStateSource.includes('public villageTrustScore: number = 50'), 'PlayerState có thuộc tính villageTrustScore = 50');
assert(playerStateSource.includes('public storyFlags: Set<string> = new Set()'), 'PlayerState có thuộc tính storyFlags: Set<string>');
assert(playerStateSource.includes('public setStoryFlag(flag: string): void'), 'PlayerState có method setStoryFlag');
assert(playerStateSource.includes('public addVillageTrust(delta: number): number'), 'PlayerState có method addVillageTrust');
assert(playerStateSource.includes('public restoreStoryFlags(flags?: string[]): void'), 'PlayerState có method restoreStoryFlags');

const saveManagerSource = fs.readFileSync('src/systems/SaveManager.ts', 'utf8');
assert(saveManagerSource.includes('villageTrustScore?: number;'), 'SaveManager interface SaveData có villageTrustScore');
assert(saveManagerSource.includes('storyFlags?: string[];'), 'SaveManager interface SaveData có storyFlags');
assert(saveManagerSource.includes("'villageTrustScore', 'storyFlags'"), 'SaveManager knownKeys chứa villageTrustScore và storyFlags');
assert(saveManagerSource.includes('state.setVillageTrustScore(data.villageTrustScore ?? 50);'), 'SaveManager applySaveToState khôi phục villageTrustScore');
assert(saveManagerSource.includes('state.restoreStoryFlags(data.storyFlags);'), 'SaveManager applySaveToState khôi phục storyFlags');

const dialogueSystemSource = fs.readFileSync('src/systems/DialogueSystem.ts', 'utf8');
assert(dialogueSystemSource.includes('export interface DialogueChoice'), 'DialogueSystem xuất interface DialogueChoice');
assert(dialogueSystemSource.includes('choices?: DialogueChoice[];'), 'DialoguePayload hỗ trợ choices');
assert(dialogueSystemSource.includes('showChoices?(choices: Array<{ text: string; index: number }>'), 'IDialogueView hỗ trợ showChoices');
assert(dialogueSystemSource.includes('selectChoice(choiceIndex: number): void'), 'DialogueSystem có phương thức selectChoice');
assert(dialogueSystemSource.includes('handleNumberKey(choiceIndex: number): void'), 'DialogueSystem có phương thức handleNumberKey');
assert(dialogueSystemSource.includes('keydown-ONE'), 'DialogueSystem bắt sự kiện phím số 1, 2, 3');

const uiSceneSource = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');
assert(uiSceneSource.includes('public showChoices(choices: Array<{ text: string; index: number }>'), 'UIScene có method showChoices');
assert(uiSceneSource.includes('public hideChoices(): void'), 'UIScene có method hideChoices');
assert(uiSceneSource.includes('dialogueChoicesContainer'), 'UIScene có dialogueChoicesContainer');

console.log('\n================================================================');
console.log(`TỔNG KẾT: ${passCount} KIỂM TRA ĐẠT (PASS), ${failCount} KIỂM TRA THẤT BẠI (FAIL)`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
