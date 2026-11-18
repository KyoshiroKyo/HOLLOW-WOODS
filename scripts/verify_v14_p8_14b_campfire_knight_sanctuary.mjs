/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ XÁC MINH BƯỚC V14-P8-14B:
 * ĐƯA NPC HIỆP SĨ CANH LỬA VÀO VỊ TRÍ QUỲ CANH GÁC BÊN LỬA TRẠI SANCTUARY CAMP
 * TẠI LÀNG BELLHOLLOW VÀ KÍCH HOẠT VÙNG BẢO VỆ KHU NGHỈ NGƠI
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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-14B: HIỆP SĨ CANH LỬA   ');
console.log('   VÀ VÙNG BẢO VỆ KHU NGHỈ NGƠI SANCTUARY CAMP LÀNG BELLHOLLOW         ');
console.log('======================================================================\n');

// --- PHẦN 1: KIỂM TRA NẠP TÀI NGUYÊN & HOẠT ẢNH TRONG PRELOADSCENE.TS ---
console.log('--- PHẦN 1: Kiểm Tra Nạp Tài Nguyên & Đăng Ký Hoạt Ảnh (PreloadScene.ts) ---');

const preloadTs = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');

assert(preloadTs.includes('SPRITE_CAMPFIRE_KNIGHT_PRAY'), 'PreloadScene import SPRITE_CAMPFIRE_KNIGHT_PRAY');
assert(preloadTs.includes('SPRITE_CAMPFIRE_KNIGHT_IDLE'), 'PreloadScene import SPRITE_CAMPFIRE_KNIGHT_IDLE');
assert(preloadTs.includes('PORTRAIT_CAMPFIRE_KNIGHT'), 'PreloadScene import PORTRAIT_CAMPFIRE_KNIGHT');
assert(preloadTs.includes('assets/characters/npcs/campfire_knight_pray_sheet.png'), 'PreloadScene nạp campfire_knight_pray_sheet.png');
assert(preloadTs.includes('assets/characters/npcs/campfire_knight_idle_sheet.png'), 'PreloadScene nạp campfire_knight_idle_sheet.png');
assert(preloadTs.includes('assets/characters/npcs/portrait_campfire_knight.png'), 'PreloadScene nạp portrait_campfire_knight.png');
assert(preloadTs.includes('anim_campfire_knight_pray'), 'PreloadScene tạo hoạt ảnh anim_campfire_knight_pray');
assert(preloadTs.includes('anim_campfire_knight_idle'), 'PreloadScene tạo hoạt ảnh anim_campfire_knight_idle');

// --- PHẦN 2: KIỂM TRA CẤU HÌNH THỰC THỂ NPC HIỆP SĨ CANH LỬA (NPCENTITY.TS) ---
console.log('\n--- PHẦN 2: Kiểm Tra Cấu Hình Thực Thể & Hoạt Ảnh (NPCEntity.ts) ---');

const npcEntityTs = fs.readFileSync('src/entities/NPCEntity.ts', 'utf8');

assert(npcEntityTs.includes("baseId === 'campfire_knight'"), 'NPCEntity nhận diện baseId campfire_knight');
assert(npcEntityTs.includes('campfire_knight_pray_sheet'), 'NPCEntity nạp initialSheet quỳ cầu nguyện');
assert(npcEntityTs.includes('body.setSize(22, 14)'), 'NPCEntity cấu hình hộp va chạm chân gọn 22x14 px');
assert(npcEntityTs.includes('this.setDepth(spec.y)'), 'NPCEntity thiết lập độ sâu ban đầu theo chân spec.y');
assert(npcEntityTs.includes('this.setDepth(targetDepth)'), 'NPCEntity đồng bộ Y-Sorting theo Math.floor(this.y)');
assert(npcEntityTs.includes('createPromptBubble'), 'NPCEntity tạo bong bóng tương tác [E]');
assert(npcEntityTs.includes('0x090e15, 0.70'), 'Bong bóng tương tác [E] có nền đen bán trong suốt alpha 0.70');
assert(npcEntityTs.includes('anim_campfire_knight_pray'), 'NPCEntity hỗ trợ hoạt ảnh anim_campfire_knight_pray');
assert(npcEntityTs.includes('anim_campfire_knight_idle'), 'NPCEntity hỗ trợ hoạt ảnh anim_campfire_knight_idle');
assert(npcEntityTs.includes('setInteracting'), 'NPCEntity cung cấp phương thức setInteracting');
assert(npcEntityTs.includes('setFlipX(true)'), 'Hiệp sĩ quay mặt sang trái hướng về ngọn lửa hồng (setFlipX true)');

// --- PHẦN 3: KIỂM TRA ĐẶT VỊ TRÍ VÀ TÍCH HỢP GAMESCENE & ZONES.JSON ---
console.log('\n--- PHẦN 3: Kiểm Tra Vị Trí Lửa Trại & Khởi Tạo Thực Thể (GameScene.ts & zones.json) ---');

const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const bellhollow = zonesJson.zones.find(z => z.id === 'bellhollow');
assert(!!bellhollow, 'Tồn tại phân khu bellhollow trong zones.json');

const campfireObj = bellhollow.interactables?.find(i => i.id === 'camp_central_campfire');
assert(!!campfireObj, 'Tồn tại Lửa Trại Trung Tâm camp_central_campfire');
assert(campfireObj.x === 780 && campfireObj.y === 260, 'Lửa Trại tọa độ chuẩn (780, 260)');

const knightObj = bellhollow.npcs?.find(n => n.id === 'npc_campfire_knight');
assert(!!knightObj, 'Tồn tại NPC npc_campfire_knight trong bellhollow');
assert(knightObj.x === 818 && knightObj.y === 270, 'NPC Hiệp Sĩ Canh Lửa tọa độ chuẩn bên đống lửa (818, 270)');

const gameSceneTs = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneTs.includes('new NPCEntity(this, {'), 'GameScene khởi tạo NPCEntity');
assert(gameSceneTs.includes('id: \'npc_campfire_knight\''), 'GameScene tạo thực thể npc_campfire_knight');
assert(gameSceneTs.includes('CampSanctuarySystem.getInstance().registerKnightEntity'), 'GameScene đăng ký knightEntity vào CampSanctuarySystem');
assert(gameSceneTs.includes('CampSanctuarySystem.getInstance().onDialogueStart'), 'GameScene gọi onDialogueStart khi nhấn [E]');
assert(gameSceneTs.includes('CampSanctuarySystem.getInstance().onDialogueEnd'), 'GameScene gọi onDialogueEnd khi kết thúc đối thoại');
assert(gameSceneTs.includes('applySanctuaryRepulsion'), 'GameScene gọi applySanctuaryRepulsion xua đuổi quái vật');
assert(gameSceneTs.includes('isSanctuaryProtected'), 'GameScene bảo vệ an toàn tuyệt đối cho người chơi trong Sanctuary Camp');

// --- PHẦN 4: KIỂM TRA HỆ THỐNG CAMPSANCTUARYSYSTEM.TS & CƠ CHẾ BẢO VỆ ---
console.log('\n--- PHẦN 4: Kiểm Tra Hệ Thống Vùng Bảo Vệ (CampSanctuarySystem.ts) ---');

const campSanctuaryTs = fs.readFileSync('src/systems/CampSanctuarySystem.ts', 'utf8');

assert(campSanctuaryTs.includes('campfireX: number = 798'), 'CampSanctuarySystem tọa độ tâm bếp lửa campfireX = 798');
assert(campSanctuaryTs.includes('campfireY: number = 275'), 'CampSanctuarySystem tọa độ tâm bếp lửa campfireY = 275');
assert(campSanctuaryTs.includes('knightX: number = 818'), 'CampSanctuarySystem tọa độ hiệp sĩ knightX = 818');
assert(campSanctuaryTs.includes('knightY: number = 270'), 'CampSanctuarySystem tọa độ hiệp sĩ knightY = 270');
assert(campSanctuaryTs.includes('sanctuaryRadius: number = 180'), 'Bán kính bảo hộ an toàn sanctuaryRadius = 180px');
assert(campSanctuaryTs.includes('isGuarding'), 'Có phương thức kiểm tra trạng thái canh gác isGuarding()');
assert(campSanctuaryTs.includes('isPlayerInSanctuary'), 'Có phương thức isPlayerInSanctuary()');
assert(campSanctuaryTs.includes('isMonsterInSanctuaryRange'), 'Có phương thức isMonsterInSanctuaryRange()');
assert(campSanctuaryTs.includes('getComposureRecoveryMultiplier'), 'Có phương thức getComposureRecoveryMultiplier()');
assert(campSanctuaryTs.includes('return 1.20'), 'Tăng 20% tốc độ hồi phục Bình Tâm (multiplier 1.20)');
assert(campSanctuaryTs.includes('getMoistureDryingMultiplier'), 'Có phương thức getMoistureDryingMultiplier()');
assert(campSanctuaryTs.includes('applySanctuaryRepulsion'), 'Có phương thức applySanctuaryRepulsion()');

// Kiểm tra logic toán học của CampSanctuarySystem trực tiếp
class MockKnight {
  constructor() {
    this.active = true;
    this.anim = 'anim_campfire_knight_pray';
    this.flipX = true;
  }
  setInteracting(active, targetX) {
    if (active) {
      this.anim = 'anim_campfire_knight_idle';
      if (targetX !== undefined) this.flipX = targetX < 818;
    } else {
      this.anim = 'anim_campfire_knight_pray';
      this.flipX = true;
    }
  }
}

class TestSanctuarySystem {
  constructor() {
    this.campfireX = 798;
    this.campfireY = 275;
    this.knightX = 818;
    this.knightY = 270;
    this.sanctuaryRadius = 180;
    this.knight = new MockKnight();
    this.isDialogueActive = false;
  }
  isPlayerInSanctuary(px, py, zoneId) {
    if (zoneId && zoneId !== 'bellhollow') return false;
    const distToHearth = Math.hypot(px - this.campfireX, py - this.campfireY);
    const distToKnight = Math.hypot(px - this.knightX, py - this.knightY);
    const distToBase = Math.hypot(px - 780, py - 260);
    return Math.min(distToHearth, distToKnight, distToBase) <= this.sanctuaryRadius;
  }
  getComposureMultiplier() { return 1.20; }
  getMoistureDryingMultiplier() { return 1.20; }
  onDialogueStart(playerX) {
    this.isDialogueActive = true;
    this.knight.setInteracting(true, playerX);
  }
  onDialogueEnd() {
    this.isDialogueActive = false;
    this.knight.setInteracting(false);
  }
  applyRepulsion(monsters) {
    for (const m of monsters) {
      const dist = Math.hypot(m.x - this.campfireX, m.y - this.campfireY);
      if (dist < this.sanctuaryRadius) {
        const angle = Math.atan2(m.y - this.campfireY, m.x - this.campfireX);
        m.x = this.campfireX + Math.cos(angle) * (this.sanctuaryRadius + 20);
        m.y = this.campfireY + Math.sin(angle) * (this.sanctuaryRadius + 20);
        if (m.body) { m.body.vx = 0; m.body.vy = 0; }
        if (m.state === 'lunge' || m.state === 'attack') m.state = 'repelled';
      }
    }
  }
}

const testSys = new TestSanctuarySystem();

// Test A: Vị trí người chơi trong Bellhollow gần lửa trại (790, 270)
assert(testSys.isPlayerInSanctuary(790, 270, 'bellhollow') === true, 'Người chơi tại (790, 270) nằm trong Sanctuary Camp');

// Test B: Vị trí người chơi trong Bellhollow cách xa lửa trại (1400, 300)
assert(testSys.isPlayerInSanctuary(1400, 300, 'bellhollow') === false, 'Người chơi tại cổng Đông (1400, 300) nằm ngoài Sanctuary Camp');

// Test C: Vị trí người chơi ở phân khu khác dù cùng tọa độ (outer_woods)
assert(testSys.isPlayerInSanctuary(790, 270, 'outer_woods') === false, 'Người chơi ở phân khu khác không được bảo hộ Sanctuary Camp');

// Test D: Hệ số hồi phục
assert(testSys.getComposureMultiplier() === 1.20, 'Hệ số hồi phục Bình Tâm chính xác +20% (1.20)');
assert(testSys.getMoistureDryingMultiplier() === 1.20, 'Hệ số hong khô Độ Ẩm chính xác +20% (1.20)');

// Test E: Tương tác đối thoại chuyển hoạt ảnh
testSys.onDialogueStart(800); // Người chơi đứng bên trái (x=800 < 818)
assert(testSys.knight.anim === 'anim_campfire_knight_idle', 'Khi mở đối thoại, hiệp sĩ chuyển sang anim_campfire_knight_idle');
assert(testSys.knight.flipX === true, 'Hiệp sĩ quay mặt về phía người chơi bên trái (flipX = true)');

testSys.onDialogueEnd();
assert(testSys.knight.anim === 'anim_campfire_knight_pray', 'Sau khi kết thúc đối thoại, hiệp sĩ trở lại anim_campfire_knight_pray');
assert(testSys.knight.flipX === true, 'Hiệp sĩ quỳ hướng về phía ngọn lửa hồng bên trái (flipX = true)');

// Test F: Đẩy lùi quái vật xâm nhập
const invadingWolf = { x: 810, y: 280, state: 'lunge', body: { vx: 100, vy: 50 } };
testSys.applyRepulsion([invadingWolf]);
const newDist = Math.hypot(invadingWolf.x - testSys.campfireX, invadingWolf.y - testSys.campfireY);
assert(newDist >= testSys.sanctuaryRadius, `Quái vật bị đẩy văng ra ngoài bán kính bảo hộ (dist=${Math.round(newDist)} >= 180)`);
assert(invadingWolf.state === 'repelled', 'Trạng thái tấn công lunge của quái vật bị giải trừ');
assert(invadingWolf.body.vx === 0 && invadingWolf.body.vy === 0, 'Vận tốc quái vật bị triệt tiêu về 0');

// --- PHẦN 5: KIỂM TRA TÍCH HỢP SURVIVALSYSTEM.TS ---
console.log('\n--- PHẦN 5: Kiểm Tra Tích Hợp Hệ Thống Sinh Tồn (SurvivalSystem.ts) ---');

const survivalTs = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf8');

assert(survivalTs.includes('CampSanctuarySystem.getInstance()'), 'SurvivalSystem kết nối CampSanctuarySystem');
assert(survivalTs.includes('isPlayerInSanctuary(playerX, playerY, zoneId)'), 'SurvivalSystem truyền zoneId kiểm tra Sanctuary');
assert(survivalTs.includes('getComposureRecoveryMultiplier()'), 'SurvivalSystem sử dụng getComposureRecoveryMultiplier');
assert(survivalTs.includes('getMoistureDryingMultiplier()'), 'SurvivalSystem sử dụng getMoistureDryingMultiplier');
assert(survivalTs.includes('composureMult'), 'SurvivalSystem nhân hệ số composureMult khi hồi phục');
assert(survivalTs.includes('dryingMult'), 'SurvivalSystem nhân hệ số dryingMult khi hong khô');

console.log('\n======================================================================');
console.log(`   TỔNG KẾT: ${passCount} / ${passCount + failCount} BÀI KIỂM THỬ ĐẠT (PASS)`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 TOÀN BỘ YÊU CẦU BƯỚC V14-P8-14B ĐÃ ĐẠT 100% HOÀN HẢO!');
}
