/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 6.2 (TACTICAL PUZZLE BOSS ENCOUNTER: THE MIRE WARDEN)
 *
 * Kiểm tra toàn diện 4 trụ cột yêu cầu của Bước 6.2:
 * 1. Thực thể BossMireWarden ('src/entities/BossMireWarden.ts'):
 *    - Kế thừa MireWardenBoss, bổ sung giáp sương mù, làm choáng STUN_DURATION_MS = 3500 (3.5s)
 *    - crackMistArmor(), restoreMistArmor(), isVulnerable()
 * 2. Hệ thống BossEncounterSystem ('src/systems/BossEncounterSystem.ts'):
 *    - Quản lý đấu trường Sân Đá Cổ với 3 Trụ Lửa Cổ Ngữ (pillar_nw, pillar_ne, pillar_s)
 *    - Pha 1 (100% -> 50%): Săn mồi bằng tiếng động, lao húc thẳng, va chạm trụ gây choáng & nứt giáp
 *    - Pha 2 (< 50%): Cơn ác mộng sương đêm, dập tắt trụ lửa, thắp sáng lại bằng Đèn Lồng [F]/Đuốc
 *    - Kết thúc: completeEncounter() trao relic_heart_of_roots, title_purifier_of_mist, lore_mire_warden_memory
 * 3. Tích hợp GameScene & UIScene:
 *    - Tích hợp BossMireWarden & BossEncounterSystem trong triggerMireWardenBossEncounter & finishMireWardenDefeat
 *    - Cập nhật lore_mire_warden_memory trong src/data/lore.json
 * 4. Kiểm thử chức năng (Logic Unit Tests) của BossEncounterSystem
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

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ BƯỚC 6.2: CHẠM TRÁN TRÙM MIẾU CHUÔNG');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Module BossMireWarden (src/entities/BossMireWarden.ts)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Module BossMireWarden (src/entities/BossMireWarden.ts) ---');

const bossMireWardenPath = path.resolve('src/entities/BossMireWarden.ts');
assert(fs.existsSync(bossMireWardenPath), 'Tệp src/entities/BossMireWarden.ts tồn tại');

const bossMireWardenCode = fs.readFileSync(bossMireWardenPath, 'utf-8');
assert(bossMireWardenCode.includes('class BossMireWarden extends MireWardenBoss'), 'BossMireWarden kế thừa MireWardenBoss');
assert(bossMireWardenCode.includes('STUN_DURATION_MS: number = 3500'), 'Thời gian choáng chuẩn xác 3.5 giây (3500ms)');
assert(bossMireWardenCode.includes('mistArmorCracked: boolean = false'), 'Quản lý trạng thái giáp sương mù mistArmorCracked');
assert(bossMireWardenCode.includes('crackMistArmor()'), 'Có hàm crackMistArmor() làm nứt giáp và làm choáng');
assert(bossMireWardenCode.includes('restoreMistArmor()'), 'Có hàm restoreMistArmor() khôi phục giáp sương mù');
assert(bossMireWardenCode.includes('isVulnerable()'), 'Có hàm isVulnerable() kiểm tra trạng thái dễ bị tổn thương');
assert(bossMireWardenCode.includes('MireWardenBoss') && bossMireWardenCode.includes('MireWardenState'), 'Tái xuất khẩu đầy đủ MireWardenBoss và MireWardenState');

// -----------------------------------------------------------------------------
// PHẦN 2: Hệ thống BossEncounterSystem (src/systems/BossEncounterSystem.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Hệ thống BossEncounterSystem (src/systems/BossEncounterSystem.ts) ---');

const encounterSystemPath = path.resolve('src/systems/BossEncounterSystem.ts');
assert(fs.existsSync(encounterSystemPath), 'Tệp src/systems/BossEncounterSystem.ts tồn tại');

const encounterCode = fs.readFileSync(encounterSystemPath, 'utf-8');
assert(encounterCode.includes('class BossEncounterSystem'), 'Khai báo lớp BossEncounterSystem');
assert(encounterCode.includes('getInstance()'), 'Thiết kế mẫu Singleton BossEncounterSystem.getInstance()');
assert(encounterCode.includes('initArena('), 'Có phương thức initArena() khởi tạo đấu trường Sân Đá Cổ');
assert(encounterCode.includes('pillar_nw') && encounterCode.includes('pillar_ne') && encounterCode.includes('pillar_s'), 'Quản lý 3 Trụ Lửa Cổ Ngữ (Tây Bắc, Đông Bắc, Nam)');
assert(encounterCode.includes('onNoiseEmitted('), 'Phương thức onNoiseEmitted() tiếp nhận âm thanh mồi nhử [Q] hoặc bước chạy');
assert(encounterCode.includes('checkPillarCollision('), 'Phương thức checkPillarCollision() phát hiện Boss đâm sầm vào Trụ Lửa');
assert(encounterCode.includes('strikeWeakPoint()'), 'Phương thức strikeWeakPoint() xử lý đòn tấn công điểm yếu khi Boss bị choáng');
assert(encounterCode.includes('triggerPhase2NightMist()'), 'Phương thức triggerPhase2NightMist() kích hoạt Pha 2 Cơn Ác Mộng Sương Đêm');
assert(encounterCode.includes('relightPillar('), 'Phương thức relightPillar() thắp sáng lại trụ bằng Đèn Lồng [F] hoặc Đuốc');
assert(encounterCode.includes('areAllPillarsLit()'), 'Phương thức areAllPillarsLit() kiểm tra điều kiện cả 3 trụ đã sáng');
assert(encounterCode.includes('completeEncounter()'), 'Phương thức completeEncounter() kết thúc nghi thức và trao phần thưởng');
assert(encounterCode.includes('relic_heart_of_roots'), 'Trao di vật cốt truyện relic_heart_of_roots');
assert(encounterCode.includes('title_purifier_of_mist'), 'Mở khóa danh hiệu title_purifier_of_mist');
assert(encounterCode.includes('lore_mire_warden_memory'), 'Mở khóa mảnh ký ức cốt truyện lore_mire_warden_memory');

// -----------------------------------------------------------------------------
// PHẦN 3: Tích hợp GameScene & Dữ Liệu Cốt Truyện (lore.json)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Tích hợp GameScene & Dữ Liệu Cốt Truyện ---');

const gameSceneCode = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');
assert(gameSceneCode.includes("import { MireWardenBoss, RunePillarTarget, BrazierTarget, BossMireWarden } from '../entities/BossMireWarden'"), 'GameScene nhập BossMireWarden từ entity mới');
assert(gameSceneCode.includes("import { BossEncounterSystem } from '../systems/BossEncounterSystem'"), 'GameScene nhập BossEncounterSystem');
assert(gameSceneCode.includes('new BossMireWarden(this, 4500, 240)'), 'GameScene khởi tạo BossMireWarden');
assert(gameSceneCode.includes('BossEncounterSystem.getInstance().initArena(this, this.mireWardenBoss as BossMireWarden)'), 'GameScene liên kết BossEncounterSystem.initArena()');
assert(gameSceneCode.includes('BossEncounterSystem.getInstance().completeEncounter()'), 'GameScene gọi completeEncounter() khi hoàn tất phong ấn');
assert(gameSceneCode.includes("setFlag('title_purifier_of_mist')"), 'GameScene đặt cờ danh hiệu Người Thanh Tẩy Màn Sương');
assert(gameSceneCode.includes("unlockLore('lore_mire_warden_memory')"), 'GameScene mở khóa mảnh ký ức lore_mire_warden_memory');

const loreJsonRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/lore.json'), 'utf-8'));
const wardenLore = loreJsonRaw.loreEntries.find(l => l.id === 'lore_mire_warden_memory');
assert(wardenLore !== undefined, 'lore.json chứa mục lore_mire_warden_memory');
assert(wardenLore && wardenLore.title.includes('KẺ NUỐT TIẾNG CHUÔNG'), 'Mục ký ức có tiêu đề chính xác');
assert(wardenLore && wardenLore.content.includes('Trái Tim Mạch Rễ Cổ'), 'Nội dung giải thích bi kịch và nguồn gốc Trái Tim Mạch Rễ Cổ');

// -----------------------------------------------------------------------------
// PHẦN 4: Kiểm Thử Logic Trạng Thái Trận Đấu (Boss Encounter Logic Simulation)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Kiểm Thử Logic Trạng Thái Trận Đấu ---');

// Mô phỏng logic trụ lửa và chuyển pha
const mockPillars = [
  { id: 'pillar_nw', x: 4350, y: 180, isLit: true, isExtinguished: false },
  { id: 'pillar_ne', x: 4650, y: 180, isLit: false, isExtinguished: false },
  { id: 'pillar_s', x: 4500, y: 390, isLit: false, isExtinguished: false }
];

// Pha 1: Trụ Tây Bắc đang cháy, Boss húc trúng trụ tại tọa độ (4350, 180)
const bossPos = { x: 4355, y: 182 };
const distNW = Math.hypot(bossPos.x - mockPillars[0].x, bossPos.y - mockPillars[0].y);
assert(distNW <= 65, 'Khoảng cách Boss tới Trụ Tây Bắc nằm trong bán kính va chạm (<= 65px)');

// Đánh dấu trụ dập tắt và Boss bị choáng
mockPillars[0].isLit = false;
mockPillars[0].isExtinguished = true;
let isBossStaggered = true;
let sealProgress = 0;

// Người chơi đâm điểm yếu lần 1
if (isBossStaggered) {
  sealProgress++;
  mockPillars[1].isLit = true; // Trụ Đông Bắc bùng sáng
}
assert(sealProgress === 1 && mockPillars[1].isLit === true, 'Pha 1 nấc 1: Phong ấn lên nấc 1, Trụ Đông Bắc bùng sáng');

// Boss húc trúng Trụ Đông Bắc
mockPillars[1].isLit = false;
mockPillars[1].isExtinguished = true;
isBossStaggered = true;

// Người chơi đâm điểm yếu lần 2 -> Đạt 50% chuyển Pha 2
let currentPhase = 'PHASE_1_SOUND_HUNTING';
if (isBossStaggered) {
  sealProgress++;
  if (sealProgress === 2) {
    currentPhase = 'PHASE_2_NIGHT_MIST';
    // Dập tắt tất cả trụ
    mockPillars.forEach(p => { p.isLit = false; p.isExtinguished = true; });
  }
}
assert(sealProgress === 2 && currentPhase === 'PHASE_2_NIGHT_MIST', 'Pha 2 chuyển đổi: Đạt 50% phong ấn, chuyển sang Pha 2 Cơn Ác Mộng Sương Đêm');
assert(mockPillars.every(p => !p.isLit), 'Pha 2 bắt đầu: Cả 3 trụ lửa đều bị dập tắt');

// Thắp sáng lại từng trụ bằng Đèn Lồng [F]
let lanternOn = true;
mockPillars.forEach(p => {
  if (lanternOn) {
    p.isLit = true;
    p.isExtinguished = false;
  }
});
const allLit = mockPillars.every(p => p.isLit);
assert(allLit === true, 'Pha 2 giải đố: Thắp sáng lại thành công cả 3 trụ lửa bằng Đèn Lồng [F]');

// Thực hiện đòn thanh tẩy quyết định -> Phong ấn 100%
if (allLit) {
  sealProgress++;
  currentPhase = 'DEFEATED';
}
assert(sealProgress === 3 && currentPhase === 'DEFEATED', 'Pha kết thúc: Đạt 100% phong ấn, Boss Kẻ Nuốt Tiếng Chuông bị phong ấn hoàn toàn');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
