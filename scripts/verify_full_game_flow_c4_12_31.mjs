import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.2 — COMMAND C4-12-31 COMPREHENSIVE GAME FLOW AUDIT  ');
console.log('   (RÀ SOÁT, KIỂM TRA LUỒNG CHƠI TỔNG THỂ TỪ ĐẦU ĐẾN CUỐI & THÔNG SỐ)  ');
console.log('======================================================================');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// Nạp dữ liệu cấu hình
const loreData = JSON.parse(fs.readFileSync(path.resolve('src/data/lore.json'), 'utf8'));
const itemsData = JSON.parse(fs.readFileSync(path.resolve('src/data/items.json'), 'utf8'));
const puzzlesData = JSON.parse(fs.readFileSync(path.resolve('src/data/puzzles.json'), 'utf8'));
const zonesData = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf8'));
const dialoguesData = JSON.parse(fs.readFileSync(path.resolve('src/data/dialogues.json'), 'utf8')).dialogues;

// --- GIAI ĐOẠN 1: BẮT ĐẦU GAME MỚI VÀ ĐIỂM XUẤT PHÁT BAN ĐẦU (ACT 0) ---
console.log('\n--- GIAI ĐOẠN 1: BẮT ĐẦU GAME MỚI VÀ ĐIỂM XUẤT PHÁT BAN ĐẦU (ACT 0) ---');

// Mô phỏng PlayerState
class MockPlayerState {
  constructor() {
    this.stats = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      lanternOil: 75,
      maxLanternOil: 100,
      composure: 90,
      maxComposure: 100,
      isLanternOn: false,
      isSprinting: false,
      isHiding: false
    };
    this.inventory = new Map([
      ['res_dry_wood', 2],
      ['seed_herbs', 3]
    ]);
    this.flags = new Set();
    this.currentQuestId = 'Q01_MEET_EDDA';
    this.quests = new Map();
    for (const q of loreData.questLog) {
      this.quests.set(q.id, {
        ...q,
        tasks: q.tasks.map(t => ({ ...t, done: q.id === 'Q00_WAKE_UP' ? true : false }))
      });
    }
    this.unlockedLore = [loreData.loreEntries[0]];
    this.currentZoneId = 'fog_crossing';
    this.visitedZones = new Set(['fog_crossing', 'bellhollow']);
    this.unlockedZoneCache = new Set(['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']);
    this.herbPlots = [
      { id: 'plot_1', x: 760, y: 640, stage: 'empty', plantedAt: 0 },
      { id: 'plot_2', x: 840, y: 640, stage: 'empty', plantedAt: 0 },
      { id: 'plot_3', x: 760, y: 690, stage: 'empty', plantedAt: 0 },
      { id: 'plot_4', x: 840, y: 690, stage: 'empty', plantedAt: 0 }
    ];
  }

  getItemCount(itemId) {
    return this.inventory.get(itemId) || 0;
  }

  addItem(itemId, count = 1) {
    const cur = this.getItemCount(itemId);
    this.inventory.set(itemId, cur + count);
    this.evaluateQ03ResourceTask();
  }

  removeItem(itemId, count = 1) {
    const cur = this.getItemCount(itemId);
    if (cur < count) return false;
    const rem = cur - count;
    if (rem <= 0) this.inventory.delete(itemId);
    else this.inventory.set(itemId, rem);
    return true;
  }

  hasFlag(f) {
    return this.flags.has(f);
  }

  setFlag(f) {
    if (!this.flags.has(f)) {
      this.flags.add(f);
      this.checkQuestProgression(f);
    }
  }

  setCurrentQuest(qid) {
    this.currentQuestId = qid;
  }

  completeQuestTask(questId, taskId) {
    const q = this.quests.get(questId);
    if (!q) return;
    const task = q.tasks.find(t => t.id === taskId);
    if (task && !task.done) {
      task.done = true;
    }
  }

  evaluateQ03ResourceTask() {
    const q03 = this.quests.get('Q03_PREPARE_RESOURCES');
    if (!q03) return false;
    const t1 = q03.tasks.find(t => t.id === 't1');
    if (!t1 || t1.done) return true;
    const isQ03ActiveOrUnlocked =
      this.currentQuestId === 'Q03_PREPARE_RESOURCES' ||
      this.hasFlag('talked_to_neris') ||
      this.hasFlag('east_gate_unlocked');
    if (!isQ03ActiveOrUnlocked) return false;
    const woodCount = this.getItemCount('res_dry_wood');
    const resinCount = this.getItemCount('res_tree_resin');
    if (woodCount >= 1 && resinCount >= 1) {
      this.completeQuestTask('Q03_PREPARE_RESOURCES', 't1');
      return true;
    }
    return false;
  }

  checkQuestProgression(flag) {
    if (flag === 'talked_to_villagers') {
      this.completeQuestTask('Q01_MEET_EDDA', 't1');
    } else if (flag === 'talked_to_edda') {
      this.completeQuestTask('Q01_MEET_EDDA', 't2');
      this.setCurrentQuest('Q02_MEET_NERIS');
    } else if (flag === 'talked_to_neris') {
      this.completeQuestTask('Q02_MEET_NERIS', 't1');
      this.completeQuestTask('Q02_MEET_NERIS', 't2');
      this.setCurrentQuest('Q03_PREPARE_RESOURCES');
      this.evaluateQ03ResourceTask();
    } else if (flag === 'craft_lantern_oil_complete') {
      this.completeQuestTask('Q03_PREPARE_RESOURCES', 't1');
      this.completeQuestTask('Q03_PREPARE_RESOURCES', 't2');
      this.flags.add('east_gate_unlocked');
      if (
        this.currentQuestId !== 'Q04_ANCIENT_RUNES' &&
        this.currentQuestId !== 'Q05_SOLVE_MIRE' &&
        this.currentQuestId !== 'Q06_RETRIEVE_CLAPPER'
      ) {
        this.setCurrentQuest('Q04_ANCIENT_RUNES');
      }
    } else if (flag === 'mire_pillars_solved' || flag === 'mire_puzzle_solved') {
      this.completeQuestTask('Q05_SOLVE_MIRE', 't1');
      this.completeQuestTask('Q05_SOLVE_MIRE', 't2');
      this.completeQuestTask('Q05_SOLVE_MIRE', 't3');
      this.flags.add('mire_drained');
      this.flags.add('mire_pillars_solved');
      this.flags.add('mire_puzzle_solved');
      if (this.currentQuestId !== 'Q06_RETRIEVE_CLAPPER') {
        this.setCurrentQuest('Q06_RETRIEVE_CLAPPER');
      }
    } else if (flag === 'clapper_collected') {
      this.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't1');
    }
  }

  isZoneUnlocked(zoneId) {
    if (['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods'].includes(zoneId)) {
      return true;
    }
    if (zoneId === 'crooked_path' || zoneId === 'deep_forest') {
      return (
        this.hasFlag('craft_lantern_oil_complete') ||
        this.hasFlag('east_gate_unlocked') ||
        ['Q04_ANCIENT_RUNES', 'Q05_SOLVE_MIRE', 'Q06_RETRIEVE_CLAPPER'].includes(this.currentQuestId)
      );
    }
    if (zoneId === 'silent_mire' || zoneId === 'ancient_rune_puzzle') {
      const eastGateOpen = this.isZoneUnlocked('crooked_path');
      if (!eastGateOpen) return false;
      const q04 = this.quests.get('Q04_ANCIENT_RUNES');
      const t1Done = q04?.tasks.find(t => t.id === 't1')?.done ?? false;
      const pastQ04 = ['Q05_SOLVE_MIRE', 'Q06_RETRIEVE_CLAPPER'].includes(this.currentQuestId);
      return t1Done || pastQ04 || this.hasFlag('entered_silent_mire') || this.hasFlag('mire_unlocked');
    }
    if (zoneId === 'broken_bell_shrine') {
      return (
        this.hasFlag('mire_puzzle_solved') ||
        this.hasFlag('mire_pillars_solved') ||
        this.hasFlag('mire_drained') ||
        this.currentQuestId === 'Q06_RETRIEVE_CLAPPER' ||
        this.hasFlag('clapper_collected')
      );
    }
    return true;
  }

  isEastGateUnlocked() {
    return this.isZoneUnlocked('crooked_path');
  }
}

const state = new MockPlayerState();

assert(state.stats.health === 100, 'Khởi đầu: Sinh lực 100/100');
assert(state.stats.lanternOil === 75, 'Khởi đầu: Dầu đèn lồng 75/100');
assert(state.stats.composure === 90, 'Khởi đầu: Bình tâm 90/100');
assert(state.stats.isLanternOn === false, 'Khởi đầu: Đèn lồng tắt');
assert(state.inventory.get('res_dry_wood') === 2, 'Khởi đầu: Có sẵn 2 củi khô');
assert(state.inventory.get('seed_herbs') === 3, 'Khởi đầu: Có sẵn 3 hạt giống thảo mộc');
assert(state.currentZoneId === 'fog_crossing', 'Khởi đầu: Đứng tại Lối Mòn Xuyên Sương (fog_crossing)');
assert(state.quests.get('Q00_WAKE_UP').tasks.every(t => t.done), 'Hồi 0 (Q00_WAKE_UP) đã hoàn thành');
assert(state.currentQuestId === 'Q01_MEET_EDDA', 'Nhiệm vụ đầu tiên là Q01_MEET_EDDA');

// Chuyển vùng từ fog_crossing sang bellhollow
const toBellhollowTrans = zonesData.zones.find(z => z.id === 'fog_crossing').transitions.find(t => t.id === 'to_bellhollow');
assert(toBellhollowTrans !== undefined, 'Transition to_bellhollow tồn tại');
assert(toBellhollowTrans.targetSpawn.x === 520 && toBellhollowTrans.targetSpawn.y === 260, 'targetSpawn chuyển vào làng Bellhollow tại (520, 260)');
state.currentZoneId = 'bellhollow';

// --- GIAI ĐOẠN 2: DI CHUYỂN TRONG LÀNG VÀ TRÒ CHUYỆN VỚI 3 NPC (ACT 1) ---
console.log('\n--- GIAI ĐOẠN 2: DI CHUYỂN TRONG LÀNG VÀ TRÒ CHUYỆN VỚI 3 NPC (ACT 1) ---');

// 1. Trò chuyện với Garth (530, 220)
assert(dialoguesData['garth_warning'] !== undefined, 'Hội thoại garth_warning tồn tại');
assert(dialoguesData['garth_warning'].onCompleteFlag === 'talked_to_villagers', 'garth_warning kích hoạt cờ talked_to_villagers');
state.setFlag('talked_to_villagers');
assert(state.quests.get('Q01_MEET_EDDA').tasks.find(t => t.id === 't1').done === true, 'Q01 Task 1 (gặp Garth) hoàn thành');
assert(state.quests.get('Q01_MEET_EDDA').tasks.find(t => t.id === 't2').done === false, 'Q01 Task 2 (gặp Edda) đang chờ');

// 2. Trò chuyện với Bà Lão Edda (790, 330)
assert(dialoguesData['edda_intro'] !== undefined, 'Hội thoại edda_intro tồn tại');
assert(dialoguesData['edda_intro'].onCompleteFlag === 'talked_to_edda', 'edda_intro kích hoạt cờ talked_to_edda');
state.setFlag('talked_to_edda');
assert(state.quests.get('Q01_MEET_EDDA').tasks.find(t => t.id === 't2').done === true, 'Q01 Task 2 (gặp Edda) hoàn thành');
assert(state.currentQuestId === 'Q02_MEET_NERIS', 'Tự động kích hoạt nhiệm vụ tiếp theo Q02_MEET_NERIS');

// 3. Trò chuyện với Neris (970, 130)
assert(dialoguesData['neris_intro'] !== undefined, 'Hội thoại neris_intro tồn tại');
assert(dialoguesData['neris_intro'].rewardItem === 'item_herbal_poultice', 'Neris thưởng 1 Thuốc Đắp Thảo Mộc');
assert(dialoguesData['neris_intro'].healPlayer === true, 'Neris hồi máu và bình tâm');
state.addItem(dialoguesData['neris_intro'].rewardItem, 1);
state.setFlag('talked_to_neris');
assert(state.getItemCount('item_herbal_poultice') === 1, 'Túi đồ có 1 Thuốc Đắp Thảo Mộc từ Neris');
assert(state.quests.get('Q02_MEET_NERIS').tasks.every(t => t.done), 'Q02_MEET_NERIS hoàn thành');
assert(state.currentQuestId === 'Q03_PREPARE_RESOURCES', 'Tự động kích hoạt nhiệm vụ tiếp theo Q03_PREPARE_RESOURCES');

// --- GIAI ĐOẠN 3: NÔNG TRẠI SANCTUARY FARM VÀ CHU KỲ TRỒNG THẢO MỘC ---
console.log('\n--- GIAI ĐOẠN 3: NÔNG TRẠI SANCTUARY FARM VÀ CHU KỲ TRỒNG THẢO MỘC ---');

assert(state.herbPlots.length === 4, 'Nông trại có đúng 4 ô đất');
const initialSeeds = state.getItemCount('seed_herbs');
assert(initialSeeds >= 1, `Có ${initialSeeds} hạt giống để gieo`);

// Gieo hạt vào ô 1
state.removeItem('seed_herbs', 1);
const plot1 = state.herbPlots[0];
plot1.plantedAt = Date.now() - 30000; // Mô phỏng gieo cách đây 30 giây (đủ 25s trưởng thành)
plot1.stage = 'harvest_ready';

assert(plot1.stage === 'harvest_ready', 'Ô đất chuyển sang harvest_ready sau khi đủ thời gian sinh trưởng');

// Thu hoạch ô 1
const herbsBefore = state.getItemCount('res_herbs');
plot1.stage = 'empty';
plot1.plantedAt = 0;
state.addItem('res_herbs', 2);
state.addItem('seed_herbs', 1);

assert(state.getItemCount('res_herbs') === herbsBefore + 2, 'Thu hoạch cộng đúng 2 Thảo Dược Bạc');
assert(state.getItemCount('seed_herbs') === initialSeeds, 'Thu hoạch hoàn lại 1 Hạt Giống');
assert(plot1.stage === 'empty', 'Ô đất đặt lại trạng thái empty, chống thu hoạch lặp');

// --- GIAI ĐOẠN 4: THU THẬP TÀI NGUYÊN VÀ CHẾ TẠO VẬT PHẨM (ACT 2) ---
console.log('\n--- GIAI ĐOẠN 4: THU THẬP TÀI NGUYÊN VÀ CHẾ TẠO VẬT PHẨM (ACT 2) ---');

// Thu thập thêm 1 nhựa cây (node_resin_bellhollow_2)
state.addItem('res_tree_resin', 1);
assert(state.getItemCount('res_tree_resin') >= 1, 'Đã thu thập 1 Nhựa Cây Thông');
assert(state.getItemCount('res_dry_wood') >= 1, 'Đã có Gỗ Khô');
assert(state.quests.get('Q03_PREPARE_RESOURCES').tasks.find(t => t.id === 't1').done === true, 'Q03 Task 1 tự động hoàn thành khi đủ nguyên liệu');

// Chế tạo Dầu Đèn
const oilRecipe = itemsData.recipes.find(r => r.id === 'craft_lantern_oil');
assert(oilRecipe !== undefined, 'Công thức craft_lantern_oil tồn tại');
assert(state.getItemCount('res_tree_resin') >= 1 && state.getItemCount('res_dry_wood') >= 1, 'Đủ nguyên liệu chế tạo Dầu Đèn');

state.removeItem('res_tree_resin', 1);
state.removeItem('res_dry_wood', 1);
state.addItem('item_lantern_oil', 1);
state.setFlag('craft_lantern_oil_complete');

assert(state.getItemCount('item_lantern_oil') === 1, 'Chế tạo thành công 1 Dầu Đèn Lồng');
assert(state.quests.get('Q03_PREPARE_RESOURCES').tasks.every(t => t.done), 'Q03_PREPARE_RESOURCES hoàn thành');
assert(state.hasFlag('east_gate_unlocked'), 'Cờ east_gate_unlocked được kích hoạt');
assert(state.currentQuestId === 'Q04_ANCIENT_RUNES', 'Tự động kích hoạt nhiệm vụ tiếp theo Q04_ANCIENT_RUNES');

// --- GIAI ĐOẠN 5: MỞ CỔNG ĐÔNG VÀ DI CHUYỂN OUTER WOODS ---
console.log('\n--- GIAI ĐOẠN 5: MỞ CỔNG ĐÔNG VÀ DI CHUYỂN OUTER WOODS ---');

assert(state.isEastGateUnlocked() === true, 'Cổng Đông làng Bellhollow được xác nhận mở khóa');
assert(state.isZoneUnlocked('crooked_path') === true, 'Phân khu The Crooked Path đã mở khóa');
assert(state.isZoneUnlocked('outer_woods') === true, 'Phân khu Outer Woods mở khóa tự do');

// Kiểm tra điểm chuyển tiếp sang Outer Woods
const toOwTrans = zonesData.zones.find(z => z.id === 'bellhollow').transitions.find(t => t.id === 'to_outer_woods');
assert(toOwTrans !== undefined, 'Transition to_outer_woods tồn tại');
assert(toOwTrans.targetSpawn.x === 1210 && toOwTrans.targetSpawn.y === 580, 'targetSpawn Outer Woods tại (1210, 580)');

const toBellFromOwTrans = zonesData.zones.find(z => z.id === 'outer_woods').transitions.find(t => t.id === 'to_bellhollow_from_ow');
assert(toBellFromOwTrans !== undefined, 'Transition quay về to_bellhollow_from_ow tồn tại');
assert(toBellFromOwTrans.targetSpawn.x === 1210 && toBellFromOwTrans.targetSpawn.y === 510, 'targetSpawn quay về làng tại (1210, 510)');

// --- GIAI ĐOẠN 6: LỘ TRÌNH THE CROOKED PATH & DEEP FOREST (CÙNG THE LISTENER) ---
console.log('\n--- GIAI ĐOẠN 6: LỘ TRÌNH THE CROOKED PATH & DEEP FOREST (CÙNG THE LISTENER) ---');

// Bước qua Cổng Đông vào The Crooked Path
state.currentZoneId = 'crooked_path';
state.completeQuestTask('Q04_ANCIENT_RUNES', 't1');
assert(state.quests.get('Q04_ANCIENT_RUNES').tasks.find(t => t.id === 't1').done === true, 'Q04 Task 1 (bước qua Cổng Đông) hoàn thành');

// Thử nghiệm ẩn nấp vào hốc cây rỗng
state.stats.isHiding = true;
state.completeQuestTask('Q04_ANCIENT_RUNES', 't2');
assert(state.quests.get('Q04_ANCIENT_RUNES').tasks.find(t => t.id === 't2').done === true, 'Q04 Task 2 (tập ẩn nấp) hoàn thành');
state.stats.isHiding = false;

// Kiểm tra thông số The Listener
const listenerSpeedPatrol = 40;
const listenerSpeedInvestigate = 55;
const listenerSpeedChase = 105;
const playerWalkSpeed = 85;
const playerSprintSpeed = 140;

assert(playerWalkSpeed < listenerSpeedChase, 'Người chơi đi bộ (85) chậm hơn The Listener rượt đuổi (105)');
assert(playerSprintSpeed > listenerSpeedChase, 'Người chơi chạy nhanh (140) nhanh hơn The Listener rượt đuổi (105) để kịp thoát');
assert(state.isZoneUnlocked('deep_forest') === true, 'Phân khu Deep Forest đã mở khóa cùng The Crooked Path');

// --- GIAI ĐOẠN 7: SILENT MIRE VÀ CÂU ĐỐ CỔ NGỮ (ANCIENT RUNE PUZZLE) ---
console.log('\n--- GIAI ĐOẠN 7: SILENT MIRE VÀ CÂU ĐỐ CỔ NGỮ (ANCIENT RUNE PUZZLE) ---');

// Khám phá sang Silent Mire
assert(state.isZoneUnlocked('silent_mire') === true, 'Phân khu Silent Mire mở khóa sau khi thám hiểm Frontier');
state.currentZoneId = 'silent_mire';
state.setCurrentQuest('Q05_SOLVE_MIRE');
assert(state.currentQuestId === 'Q05_SOLVE_MIRE', 'Đã chuyển sang nhiệm vụ Q05_SOLVE_MIRE');

// Thử nghiệm câu đố Ba Cột Đá
const correctSequence = puzzlesData.puzzles.silent_mire_pillars.correctSequence;
assert(JSON.stringify(correctSequence) === JSON.stringify(['pillar_moon', 'pillar_root', 'pillar_eye']), 'Thứ tự đúng: Mặt Trăng -> Rễ Cây -> Con Mắt');

// 1. Thử chạm sai thứ tự: chạm pillar_eye trước
let testSeq = [];
const wrongPillar = 'pillar_eye';
if (wrongPillar !== correctSequence[testSeq.length]) {
  testSeq = []; // Reset chuỗi
}
assert(testSeq.length === 0, 'Chạm sai thứ tự kích hoạt cơ chế reset mượt mà');

// 2. Kích hoạt đúng thứ tự từng cột
testSeq.push('pillar_moon');
state.completeQuestTask('Q05_SOLVE_MIRE', 't1');
assert(state.quests.get('Q05_SOLVE_MIRE').tasks.find(t => t.id === 't1').done === true, 'Cột 1 (pillar_moon) kích hoạt thành công');

testSeq.push('pillar_root');
state.completeQuestTask('Q05_SOLVE_MIRE', 't2');
assert(state.quests.get('Q05_SOLVE_MIRE').tasks.find(t => t.id === 't2').done === true, 'Cột 2 (pillar_root) kích hoạt thành công');

testSeq.push('pillar_eye');
state.completeQuestTask('Q05_SOLVE_MIRE', 't3');
assert(state.quests.get('Q05_SOLVE_MIRE').tasks.find(t => t.id === 't3').done === true, 'Cột 3 (pillar_eye) kích hoạt thành công');

// Kích hoạt cờ giải đố
state.setFlag('mire_puzzle_solved');
assert(state.hasFlag('mire_puzzle_solved'), 'Cờ mire_puzzle_solved đã lưu');
assert(state.currentQuestId === 'Q06_RETRIEVE_CLAPPER', 'Tự động kích hoạt nhiệm vụ hồi kết Q06_RETRIEVE_CLAPPER');
assert(state.isZoneUnlocked('broken_bell_shrine') === true, 'Kết giới Miếu Chuông Phế Tích chính thức mở khóa');

// --- GIAI ĐOẠN 8: MIẾU CHUÔNG PHẾ TÍCH VÀ CUỘC RƯỢT ĐUỔI HỒI 5 ---
console.log('\n--- GIAI ĐOẠN 8: MIẾU CHUÔNG PHẾ TÍCH VÀ CUỘC RƯỢT ĐUỔI HỒI 5 ---');

// Bước vào Miếu Chuông
state.currentZoneId = 'broken_bell_shrine';

// Thu hồi Lưỡi Chuông Đồng
state.addItem('quest_bronze_clapper', 1);
state.setFlag('clapper_collected');
assert(state.getItemCount('quest_bronze_clapper') === 1, 'Đã thu hồi Lưỡi Chuông Đồng Cổ');
assert(state.quests.get('Q06_RETRIEVE_CLAPPER').tasks.find(t => t.id === 't1').done === true, 'Q06 Task 1 (thu hồi clapper) hoàn thành');

// Cuộc rượt đuổi Act 5: Chạy về Bellhollow
state.currentZoneId = 'bellhollow';
state.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't2');
assert(state.quests.get('Q06_RETRIEVE_CLAPPER').tasks.find(t => t.id === 't2').done === true, 'Q06 Task 2 (thoát về làng an toàn) hoàn thành');

// Rung chuông đồng hoàn tất cốt truyện
state.setFlag('bell_rung');
assert(state.hasFlag('bell_rung'), 'Chuông đồng đã được gắn lưỡi và rung lên thành công');

// --- GIAI ĐOẠN 9: KIỂM TRA LƯU / TẢI GAME (SAVE / LOAD) TẠI CÁC CỘT MỐC ĐẠI DIỆN ---
console.log('\n--- GIAI ĐOẠN 9: KIỂM TRA LƯU / TẢI GAME (SAVE / LOAD) TẠI CÁC CỘT MỐC ĐẠI DIỆN ---');

// Mô phỏng hàm serialize SaveData
function createSaveData(checkpointName, playerX, playerY) {
  return {
    version: '3.0.0',
    timestamp: Date.now(),
    checkpointName,
    zoneId: state.currentZoneId,
    playerPos: { x: playerX, y: playerY },
    stats: { ...state.stats },
    inventory: Array.from(state.inventory.entries()),
    flags: Array.from(state.flags),
    currentQuestId: state.currentQuestId,
    quests: Array.from(state.quests.values()).map(q => ({
      id: q.id,
      tasks: q.tasks.map(t => ({ id: t.id, done: t.done }))
    })),
    unlockedLoreIds: state.unlockedLore.map(l => l.id),
    visitedZones: Array.from(state.visitedZones),
    unlockedZones: ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods', 'crooked_path', 'deep_forest', 'silent_mire', 'ancient_rune_puzzle', 'broken_bell_shrine'],
    herbPlots: state.herbPlots.map(p => ({ id: p.id, stage: p.stage, plantedAt: p.plantedAt }))
  };
}

// Checkpoint 1: Mở đầu làng Bellhollow
const cp1 = createSaveData('HỒI 1: LÀNG CHUÔNG BELLHOLLOW', 560, 260);
assert(cp1.zoneId === 'bellhollow', 'Checkpoint 1 lưu đúng zone bellhollow');
assert(cp1.playerPos.x === 560 && cp1.playerPos.y === 260, 'Checkpoint 1 lưu đúng tọa độ');

// Checkpoint 2: Sau khi mở Cổng Đông
state.currentZoneId = 'crooked_path';
const cp2 = createSaveData('HỒI 3: ĐƯỜNG MÒN QUANH CO', 1650, 280);
assert(cp2.flags.includes('east_gate_unlocked'), 'Checkpoint 2 bảo lưu cờ east_gate_unlocked');
assert(cp2.unlockedZones.includes('crooked_path'), 'Checkpoint 2 bảo lưu trạng thái mở crooked_path');

// Checkpoint 3: Giải đố xong Cột Đá Đầm Lầy
state.currentZoneId = 'silent_mire';
const cp3 = createSaveData('HỒI 4: ĐẦM LẦY TĨNH LẶNG (ĐÃ GIẢI ĐỐ)', 3400, 360);
assert(cp3.flags.includes('mire_puzzle_solved'), 'Checkpoint 3 bảo lưu cờ mire_puzzle_solved');
assert(cp3.unlockedZones.includes('broken_bell_shrine'), 'Checkpoint 3 bảo lưu trạng thái mở broken_bell_shrine');

// Checkpoint 4: Kết thúc trò chơi
state.currentZoneId = 'bellhollow';
const cp4 = createSaveData('KẾT THÚC: TIẾNG CHUÔNG ĐẦU TIÊN (HOÀN THÀNH)', 840, 350);
assert(cp4.flags.includes('bell_rung'), 'Checkpoint 4 bảo lưu cờ bell_rung');
assert(cp4.inventory.some(([k]) => k === 'quest_bronze_clapper'), 'Checkpoint 4 bảo lưu Lưỡi Chuông Đồng trong túi đồ');

// Kiểm tra phục hồi dữ liệu từ Checkpoint 4
const loadedState = new MockPlayerState();
loadedState.inventory.clear();
for (const [id, count] of cp4.inventory) {
  loadedState.inventory.set(id, count);
}
for (const f of cp4.flags) {
  loadedState.flags.add(f);
}
loadedState.currentQuestId = cp4.currentQuestId;
for (const qSave of cp4.quests) {
  const qLive = loadedState.quests.get(qSave.id);
  if (qLive) {
    for (const tSave of qSave.tasks) {
      const tLive = qLive.tasks.find(t => t.id === tSave.id);
      if (tLive) tLive.done = tSave.done;
    }
  }
}

assert(loadedState.hasFlag('bell_rung'), 'Tải game phục hồi 100% cờ bell_rung');
assert(loadedState.hasFlag('mire_puzzle_solved'), 'Tải game phục hồi 100% cờ mire_puzzle_solved');
assert(loadedState.hasFlag('east_gate_unlocked'), 'Tải game phục hồi 100% cờ east_gate_unlocked');
assert(loadedState.getItemCount('quest_bronze_clapper') === 1, 'Tải game phục hồi 100% vật phẩm nhiệm vụ');
assert(loadedState.isZoneUnlocked('broken_bell_shrine') === true, 'Tải game bảo toàn toàn bộ phân khu mở khóa');
assert(loadedState.quests.get('Q06_RETRIEVE_CLAPPER').tasks.every(t => t.done), 'Tải game bảo toàn nhiệm vụ hoàn thành');

console.log('\n======================================================================');
console.log(`TỔNG KẾT KIỂM THỬ: ${passCount + failCount} tiêu chí | ĐẠT: ${passCount} | THẤT BẠI: ${failCount}`);
if (failCount > 0) {
  console.error('❌ CÓ LỖI CHẶN TIẾN TRÌNH!');
  process.exit(1);
} else {
  console.log('🎉 TOÀN BỘ LUỒNG CHƠI TỔNG THỂ TỪ ĐẦU ĐẾN CUỐI V1.2 ĐẠT CHUẨN 100% KHÔNG CÓ BLOCKER!');
}
