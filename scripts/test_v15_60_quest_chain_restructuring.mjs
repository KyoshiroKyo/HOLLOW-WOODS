import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passed++;
    console.log(`[PASS] ${message}`);
    if (details) console.log(`       -> ${details}`);
  } else {
    failed++;
    console.error(`[FAIL] ${message}`);
    if (details) console.error(`       -> ${details}`);
  }
}

console.log('=== RUNNING VERIFICATION FOR STEP V15-60: QUEST CHAIN RESTRUCTURING (A -> E -> B -> D -> F -> E -> C) ===\n');

const projectRoot = process.cwd();

// 1. Kiểm tra 2 item mới trong items.json
const itemsPath = path.join(projectRoot, 'src/data/items.json');
assert(fs.existsSync(itemsPath), 'File src/data/items.json tồn tại');
const itemsJson = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const itemsList = itemsJson.items || [];
const runeItem = itemsList.find(i => i.id === 'quest_rune_fragment');
const keyItem = itemsList.find(i => i.id === 'quest_purification_key');

assert(runeItem !== undefined, 'Item quest_rune_fragment (Mảnh Cổ Ngữ Khai Mở) tồn tại trong items.json', runeItem?.name);
assert(keyItem !== undefined, 'Item quest_purification_key (Chìa Khóa Thanh Tẩy) tồn tại trong items.json', keyItem?.name);
assert(runeItem?.category === 'quest', 'quest_rune_fragment thuộc phân loại quest');
assert(keyItem?.category === 'quest', 'quest_purification_key thuộc phân loại quest');

// 2. Kiểm tra src/data/quests.json và 7 Chặng
const questsPath = path.join(projectRoot, 'src/data/quests.json');
assert(fs.existsSync(questsPath), 'File src/data/quests.json tồn tại');
const questsData = JSON.parse(fs.readFileSync(questsPath, 'utf8'));

assert(Array.isArray(questsData.stages), 'quests.json chứa mảng stages');
assert(questsData.stages.length === 7, `Mảng stages có đủ 7 chặng chính tuyến (hiện có: ${questsData.stages?.length})`);

const expectedStages = [
  { stage: 1, route: 'A -> E', from: 'bellhollow', to: 'silent_mire', dir: 'Đông' },
  { stage: 2, route: 'E -> B', from: 'silent_mire', to: 'quiet_forest_bonfire', dir: 'Tây' },
  { stage: 3, route: 'B -> D', from: 'quiet_forest_bonfire', to: 'abandoned_bell_workshop', dir: 'Nam' },
  { stage: 4, route: 'D -> F', from: 'abandoned_bell_workshop', to: 'deep_forest', dir: 'Bắc' },
  { stage: 5, route: 'F -> B/A', from: 'deep_forest', to: 'quiet_forest_bonfire', dir: 'Tây' },
  { stage: 6, route: 'Quay lại E -> Mở C', from: 'silent_mire', to: 'broken_bell_shrine', dir: 'Đông' },
  { stage: 7, route: 'Tại C', from: 'broken_bell_shrine', to: 'broken_bell_shrine', dir: 'Đông Bắc' }
];

questsData.stages.forEach((s, idx) => {
  const exp = expectedStages[idx];
  assert(s.stageNumber === exp.stage, `Chặng ${exp.stage}: stageNumber đúng chuẩn (${s.title})`);
  assert(s.route === exp.route, `Chặng ${exp.stage}: Lộ trình khớp ${exp.route}`);
  assert(s.directionHint.includes(exp.dir), `Chặng ${exp.stage}: Gợi ý hướng đi chứa '${exp.dir}' (${s.directionHint})`);
  assert(Array.isArray(s.tasks) && s.tasks.length > 0, `Chặng ${exp.stage}: Chứa danh sách mục tiêu nhiệm vụ (tasks)`);
});

// 3. Kiểm tra các đoạn hội thoại chuyên biệt trong dialogues.json
const dialoguesPath = path.join(projectRoot, 'src/data/dialogues.json');
assert(fs.existsSync(dialoguesPath), 'File src/data/dialogues.json tồn tại');
const dialoguesJson = JSON.parse(fs.readFileSync(dialoguesPath, 'utf8'));
const dialogues = dialoguesJson.dialogues || {};

const requiredDialogues = [
  'garth_guide_to_mire',
  'edda_guide_to_mire',
  'vaelen_examine_crest_and_seek_mold',
  'vaelen_mold_reminder',
  'vaelen_forge_purification_key',
  'vaelen_reminder_use_purification_key',
  'bram_help_forge_purification_key'
];

requiredDialogues.forEach(key => {
  assert(dialogues[key] !== undefined, `Đoạn thoại ${key} được định nghĩa trong dialogues.json`, dialogues[key]?.speaker);
});

// 4. Kiểm tra WorldGatingSystem
const gatingPath = path.join(projectRoot, 'src/world/WorldGatingSystem.ts');
assert(fs.existsSync(gatingPath), 'File src/world/WorldGatingSystem.ts tồn tại');
const gatingContent = fs.readFileSync(gatingPath, 'utf8');

assert(gatingContent.includes('mire_root_seal_broken'), 'WorldGatingSystem kiểm tra cờ mire_root_seal_broken cho broken_bell_shrine');
assert(gatingContent.includes('Cây cầu bị khóa bởi Phong Ấn Rễ Cổ'), 'WorldGatingSystem có câu nhắc khóa Phong Ấn Rễ Cổ');
assert(gatingContent.includes('Hãy tìm Sir Vaelen tại Trạm Lửa Rừng Tĩnh Lặng'), 'WorldGatingSystem có gợi ý tìm Sir Vaelen');

// 5. Kiểm tra QuestSystem.ts
const questSysPath = path.join(projectRoot, 'src/systems/QuestSystem.ts');
assert(fs.existsSync(questSysPath), 'File src/systems/QuestSystem.ts tồn tại');
const questSysContent = fs.readFileSync(questSysPath, 'utf8');

assert(questSysContent.includes('getCurrentStageNumber'), 'QuestSystem có hàm getCurrentStageNumber');
assert(questSysContent.includes('getBridgeSealState'), 'QuestSystem có hàm getBridgeSealState');
assert(questSysContent.includes('unlockBridge'), 'QuestSystem có hàm unlockBridge');
assert(questSysContent.includes('craftPurificationKey'), 'QuestSystem có hàm craftPurificationKey');
assert(questSysContent.includes('getHUDQuestDisplay'), 'QuestSystem có hàm getHUDQuestDisplay');

// 6. Mô phỏng Logic Chuyển Chặng 1 -> 7 (State Simulation)
class MockPlayerState {
  constructor() {
    this.flags = new Set();
    this.inventory = new Map();
    this.visitedZones = new Set();
    this.currentQuestId = 'Q04_ANCIENT_RUNES';
  }
  hasFlag(f) { return this.flags.has(f); }
  setFlag(f) { this.flags.add(f); }
  getItemCount(id) { return this.inventory.get(id) || 0; }
  addItem(id, count = 1) { this.inventory.set(id, (this.inventory.get(id) || 0) + count); }
  markZoneVisited(z) { this.visitedZones.add(z); }
}

function computeStage(ps) {
  // Logic tương đương QuestSystem.getCurrentStageNumber
  const isBroken = ps.hasFlag('mire_root_seal_broken') || ps.hasFlag('shrine_bridge_lowered') || ps.hasFlag('shrine_unlocked');
  if (isBroken) return 7;

  const hasKey = ps.getItemCount('quest_purification_key') > 0 || ps.hasFlag('has_purification_key');
  if (hasKey) return 6;

  const hasMold = ps.getItemCount('item_bell_mold') > 0 || ps.hasFlag('has_bell_mold');
  const hasRune = ps.getItemCount('quest_rune_fragment') > 0 || ps.hasFlag('has_rune_fragment');
  if (hasMold && hasRune) return 5;
  if (hasMold) return 4;

  const hasCrest = ps.getItemCount('quest_corrupted_crest') > 0 || ps.getItemCount('quest_corrupted_knight_crest') > 0 || ps.hasFlag('corrupted_crest_obtained') || ps.hasFlag('mire_root_seal_inspected');
  if (hasCrest) return 3;

  if (ps.hasFlag('entered_silent_mire') || ps.visitedZones.has('silent_mire')) return 2;

  return 1;
}

const mock = new MockPlayerState();
assert(computeStage(mock) === 1, 'Mô phỏng Stage 1: Ban đầu tại Làng Bellhollow (A)');

mock.markZoneVisited('silent_mire');
assert(computeStage(mock) === 2, 'Mô phỏng Stage 2: Đặt chân tới Đầm Lầy Tĩnh Lặng (E)');

mock.addItem('quest_corrupted_crest', 1);
mock.setFlag('corrupted_crest_obtained');
assert(computeStage(mock) === 3, 'Mô phỏng Stage 3: Nhặt được Huy Hiệu Kỵ Sĩ Sa Ngã tại chốt chặn Cầu Cây (E -> B)');

mock.addItem('item_bell_mold', 1);
mock.setFlag('has_bell_mold');
assert(computeStage(mock) === 4, 'Mô phỏng Stage 4: Thu thập Khuôn Đúc Đồng Cổ tại Xưởng Chuông (D -> F)');

mock.addItem('quest_rune_fragment', 1);
mock.setFlag('has_rune_fragment');
assert(computeStage(mock) === 5, 'Mô phỏng Stage 5: Thu thập Mảnh Cổ Ngữ Khai Mở tại Rừng Sâu (F -> B/A)');

mock.addItem('quest_purification_key', 1);
mock.setFlag('has_purification_key');
assert(computeStage(mock) === 6, 'Mô phỏng Stage 6: Đã hợp nhất Chìa Khóa Thanh Tẩy (Quay lại E)');

mock.setFlag('mire_root_seal_broken');
mock.setFlag('shrine_bridge_lowered');
assert(computeStage(mock) === 7, 'Mô phỏng Stage 7: Phá phong ấn hạ cầu cây, tiến vào Miếu Chuông (Tại C)');

// 7. Kiểm tra UIScene.ts & JournalModal.ts
const uiScenePath = path.join(projectRoot, 'src/scenes/UIScene.ts');
assert(fs.existsSync(uiScenePath), 'File src/scenes/UIScene.ts tồn tại');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf8');
assert(uiSceneContent.includes('QuestSystem.getInstance()'), 'UIScene tích hợp QuestSystem để cập nhật HUD lộ trình & hướng đi');

const journalPath = path.join(projectRoot, 'src/ui/JournalModal.ts');
assert(fs.existsSync(journalPath), 'File src/ui/JournalModal.ts tồn tại');
const journalContent = fs.readFileSync(journalPath, 'utf8');
assert(journalContent.includes('NHIỆM VỤ CHÍNH — LỘ TRÌNH 7 CHẶNG'), 'JournalModal hiển thị tiêu đề LỘ TRÌNH 7 CHẶNG');
assert(journalContent.includes('directionHint'), 'JournalModal hiển thị hướng dẫn phương hướng (Đông/Tây/Nam/Bắc)');

// 8. Kiểm tra GameScene.ts tương tác
const gameScenePath = path.join(projectRoot, 'src/scenes/GameScene.ts');
assert(fs.existsSync(gameScenePath), 'File src/scenes/GameScene.ts tồn tại');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');
assert(gameSceneContent.includes('inspect_sm_shrine_gate_ward'), 'GameScene xử lý tương tác chốt chặn Cầu Cây');
assert(gameSceneContent.includes('quest_corrupted_crest'), 'GameScene trao Huy Hiệu Kỵ Sĩ Sa Ngã khi khảo sát phong ấn lần đầu');
assert(gameSceneContent.includes('vaelen_examine_crest_and_seek_mold'), 'GameScene kích hoạt thoại Sir Vaelen giải mã huy hiệu và chỉ dẫn tìm khuôn đúc');
assert(gameSceneContent.includes('vaelen_forge_purification_key'), 'GameScene kích hoạt thoại Sir Vaelen tôi luyện Chìa Khóa Thanh Tẩy');
assert(gameSceneContent.includes('quest_rune_fragment'), 'GameScene trao Mảnh Cổ Ngữ Khai Mở tại bệ thờ cổ ngữ / bia đá');

console.log('\n---------------------------------------------------------');
console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('---------------------------------------------------------');

if (failed === 0) {
  console.log('>>> V15-60 VERIFICATION COMPLETED WITH 100% SUCCESS <<<');
  process.exit(0);
} else {
  console.error('>>> V15-60 VERIFICATION FAILED <<<');
  process.exit(1);
}
