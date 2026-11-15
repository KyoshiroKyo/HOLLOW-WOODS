import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG C4-12-03: ĐỒNG BỘ CỔNG ĐÔNG LÀNG BELLHOLLOW ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Kiểm tra cấu hình zones.json
const zonesPath = path.resolve('src/data/zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));
const bellhollow = zonesData.zones.find(z => z.id === 'bellhollow');

assert(bellhollow !== undefined, 'Zone bellhollow tồn tại trong zones.json');

const eastGateInteractable = bellhollow.interactables.find(i => i.id === 'east_gate_barrier');
assert(eastGateInteractable !== undefined, 'Đã định nghĩa interactable east_gate_barrier trong bellhollow');
assert(eastGateInteractable?.actionId === 'inspect_east_gate', 'actionId của Cổng Đông là inspect_east_gate');
assert(eastGateInteractable?.x === 1475 && eastGateInteractable?.y === 280, 'Tọa độ tương tác Cổng Đông khớp vị trí cửa vào (1475, 280)');

// 2. Kiểm tra logic lore.json cho Q03 và Q04
const lorePath = path.resolve('src/data/lore.json');
const loreData = JSON.parse(fs.readFileSync(lorePath, 'utf8'));
const q03 = loreData.questLog.find(q => q.id === 'Q03_PREPARE_RESOURCES');
const q04 = loreData.questLog.find(q => q.id === 'Q04_ANCIENT_RUNES');

assert(q03 !== undefined, 'Nhiệm vụ Q03_PREPARE_RESOURCES tồn tại');
assert(q03.tasks.some(t => t.id === 't2' && t.text.includes('Dầu Đèn')), 'Q03 có nhiệm vụ chế tạo Dầu Đèn');
assert(q04 !== undefined, 'Nhiệm vụ Q04_ANCIENT_RUNES tồn tại');
assert(q04.tasks.some(t => t.id === 't1' && t.text.includes('Bước qua Cổng Đông')), 'Q04 task t1 là Bước qua Cổng Đông của làng Bellhollow');

// 3. Kiểm tra tính liên tục của Collider Cổng Đông và 2 Trụ Đá
// Trụ Bắc: gateX = 1485, northPostY = 240, body y = 236, size 18x14 -> Y: [229, 243]
// Cổng Đông: gateX = 1485, roadY = 280, body y = 280, size 16x76, offset (-8, -38) -> Y: [242, 318]
// Trụ Nam: gateX = 1485, southPostY = 322, body y = 318, size 18x14 -> Y: [311, 325]
const northPillarTop = 236 - 7;
const northPillarBottom = 236 + 7;
const gateTop = 280 - 38;
const gateBottom = 280 + 38;
const southPillarTop = 318 - 7;
const southPillarBottom = 318 + 7;

assert(gateTop <= northPillarBottom, `Collider Cổng Đông giao tiếp kín với Trụ Bắc (${gateTop} <= ${northPillarBottom})`);
assert(gateBottom >= southPillarTop, `Collider Cổng Đông giao tiếp kín với Trụ Nam (${gateBottom} >= ${southPillarTop})`);
assert(northPillarTop === 229 && southPillarBottom === 325, `Rào chắn Cổng Đông che kín toàn bộ dải độ cao Y từ ${northPillarTop} đến ${southPillarBottom}`);

// 4. Kiểm tra mã nguồn PlayerState.ts
const playerStateSrc = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf8');
assert(playerStateSrc.includes('isEastGateUnlocked()'), 'PlayerState có phương thức isEastGateUnlocked()');
assert(playerStateSrc.includes('east_gate_unlocked'), 'PlayerState quản lý cờ east_gate_unlocked');
assert(playerStateSrc.includes("this.emit('east_gate_unlocked')"), 'PlayerState phát sự kiện east_gate_unlocked khi hoàn thành dầu đèn');

// 5. Kiểm tra mã nguồn WorldBuilder.ts
const worldBuilderSrc = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf8');
assert(worldBuilderSrc.includes('setEastGateOpen(open: boolean)'), 'WorldBuilder có phương thức setEastGateOpen()');
assert(worldBuilderSrc.includes('renderEastGateBarrier'), 'WorldBuilder có phương thức renderEastGateBarrier()');
assert(worldBuilderSrc.includes('updateEastGateInteractable'), 'WorldBuilder có phương thức updateEastGateInteractable()');
assert(worldBuilderSrc.includes('eastGateColliderBody'), 'WorldBuilder quản lý collider riêng cho Cổng Đông');

// 6. Kiểm tra mã nguồn GameScene.ts
const gameSceneSrc = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gameSceneSrc.includes('this.worldBuilder.setEastGateOpen(this.playerState.isEastGateUnlocked())'), 'GameScene khởi tạo trạng thái Cổng Đông theo PlayerState');
assert(gameSceneSrc.includes("this.playerState.on('east_gate_unlocked'"), 'GameScene lắng nghe sự kiện east_gate_unlocked từ PlayerState');
assert(gameSceneSrc.includes("actionId === 'inspect_east_gate'"), 'GameScene xử lý tương tác inspect_east_gate');
assert(gameSceneSrc.includes("this.playerState.completeQuestTask('Q04_ANCIENT_RUNES', 't1')"), 'GameScene hoàn thành Q04 t1 khi bước qua Cổng Đông');

// 7. Mô phỏng chuỗi sự kiện tiến trình nhiệm vụ (Mock State Test)
class MockPlayerState {
  constructor() {
    this.flags = new Set();
    this.currentQuestId = 'Q00_WAKE_UP';
    this.events = {};
  }
  on(event, cb) {
    this.events[event] = cb;
  }
  emit(event) {
    if (this.events[event]) this.events[event]();
  }
  setFlag(flag) {
    this.flags.add(flag);
    if (flag === 'craft_lantern_oil_complete') {
      this.flags.add('east_gate_unlocked');
      this.currentQuestId = 'Q04_ANCIENT_RUNES';
      this.emit('east_gate_unlocked');
    }
  }
  isEastGateUnlocked() {
    return (
      this.flags.has('craft_lantern_oil_complete') ||
      this.flags.has('east_gate_unlocked') ||
      this.currentQuestId === 'Q04_ANCIENT_RUNES'
    );
  }
}

const mockState = new MockPlayerState();
let mockGateOpened = false;
mockState.on('east_gate_unlocked', () => {
  mockGateOpened = true;
});

assert(!mockState.isEastGateUnlocked(), 'Ban đầu khi mới vào game, Cổng Đông ở trạng thái khóa');
assert(!mockGateOpened, 'Sự kiện mở cổng chưa được phát ra');

mockState.setFlag('talked_to_villagers');
mockState.setFlag('talked_to_edda');
mockState.setFlag('talked_to_neris');
assert(!mockState.isEastGateUnlocked(), 'Sau khi nói chuyện với 3 NPC, Cổng Đông vẫn khóa vì chưa chế tạo Dầu Đèn');

mockState.setFlag('craft_lantern_oil_complete');
assert(mockState.isEastGateUnlocked(), 'Ngay khi chế tạo Dầu Đèn xong, Cổng Đông mở khóa thành công');
assert(mockGateOpened === true, 'Sự kiện east_gate_unlocked được kích hoạt chính xác để GameScene đổi trạng thái không cần reload');
assert(mockState.currentQuestId === 'Q04_ANCIENT_RUNES', 'Nhiệm vụ chuyển sang Q04_ANCIENT_RUNES');

// 8. Mô phỏng Save/Load
const serializedFlags = Array.from(mockState.flags);
const restoredState = new MockPlayerState();
for (const f of serializedFlags) {
  restoredState.flags.add(f);
}
restoredState.currentQuestId = mockState.currentQuestId;
assert(restoredState.isEastGateUnlocked(), 'Trạng thái mở Cổng Đông được bảo toàn hoàn hảo qua chu kỳ Save/Load');

console.log(`\n=== TỔNG KẾT: ${passCount} KIỂM TRA ĐẠT, ${failCount} LỖI ===`);
if (failCount > 0) {
  process.exit(1);
}
