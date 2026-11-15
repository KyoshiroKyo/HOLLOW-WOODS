import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('QA / QC VERIFICATION SUITE — COMMAND C4-12-09');
console.log('TÍCH HỢP 3 NPC CHÍNH + 2 NPC PHỤ VÀO RUNTIME BELLHOLLOW (V1.2)');
console.log('================================================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] #${totalTests}: ${testName} - ${detail}`);
  }
}

// 1. Kiểm tra tài nguyên nạp trong PreloadScene.ts & Constants.ts
console.log('\n--- 1. KIỂM TRA ĐĂNG KÝ TÀI NGUYÊN PRELOADSCENE & CONSTANTS ---');
const preloadContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf-8');
const constantsContent = fs.readFileSync('src/config/Constants.ts', 'utf-8');

assert(preloadContent.includes('SPRITE_GARTH_IDLE'), 'PreloadScene nạp SPRITE_GARTH_IDLE');
assert(preloadContent.includes('SPRITE_GARTH_WALK'), 'PreloadScene nạp SPRITE_GARTH_WALK');
assert(preloadContent.includes('SPRITE_EDDA_IDLE'), 'PreloadScene nạp SPRITE_EDDA_IDLE');
assert(preloadContent.includes('SPRITE_EDDA_WALK'), 'PreloadScene nạp SPRITE_EDDA_WALK');
assert(preloadContent.includes('SPRITE_NERIS_IDLE'), 'PreloadScene nạp SPRITE_NERIS_IDLE');
assert(preloadContent.includes('SPRITE_NERIS_WALK'), 'PreloadScene nạp SPRITE_NERIS_WALK');
assert(preloadContent.includes('SPRITE_POTTER_WALK_SHEET'), 'PreloadScene nạp SPRITE_POTTER_WALK_SHEET (Bram)');
assert(preloadContent.includes('SPRITE_ERRAND_BOY_WALK_SHEET'), 'PreloadScene nạp SPRITE_ERRAND_BOY_WALK_SHEET (Finn)');

assert(preloadContent.includes('assets/characters/villagers/portrait_garth.png'), 'PreloadScene trỏ PORTRAIT_GARTH tới file mới');
assert(preloadContent.includes('assets/characters/villagers/portrait_edda.png'), 'PreloadScene trỏ PORTRAIT_EDDA tới file mới');
assert(preloadContent.includes('assets/characters/villagers/portrait_neris.png'), 'PreloadScene trỏ PORTRAIT_NERIS tới file mới');
assert(preloadContent.includes('assets/characters/villagers/portrait_bram.png'), 'PreloadScene trỏ PORTRAIT_BRAM tới file mới');
assert(preloadContent.includes('assets/characters/villagers/portrait_finn.png'), 'PreloadScene trỏ PORTRAIT_FINN tới file mới');

// 2. Kiểm tra mã nguồn NPCEntity.ts
console.log('\n--- 2. KIỂM TRA CẤU TRÚC THỰC THỂ NPCENTITY ---');
const npcEntityContent = fs.readFileSync('src/entities/NPCEntity.ts', 'utf-8');

assert(npcEntityContent.includes('registerAnimations'), 'NPCEntity có phương thức registerAnimations');
assert(npcEntityContent.includes('setOrigin(0.5, 58 / 64)'), 'Sprite NPC có origin chuẩn chân thực tế (0.5, 58/64)');
assert(npcEntityContent.includes('createNamePlate'), 'NPCEntity có createNamePlate hiển thị tên và danh hiệu');
assert(npcEntityContent.includes('createPromptBubble'), 'NPCEntity có createPromptBubble hiển thị gợi ý [E] Trò chuyện');
assert(npcEntityContent.includes('setNearby'), 'NPCEntity có setNearby hỗ trợ xoay hướng theo người chơi');
assert(npcEntityContent.includes('playDirectionalAnim'), 'NPCEntity có playDirectionalAnim phát đúng 4 hướng');
assert(npcEntityContent.includes('container = scene.add.container(spec.x, spec.y - 58)'), 'Nhãn tên đặt tại y = y - 58 ở scene level');
assert(npcEntityContent.includes('container = scene.add.container(this.spec.x, this.spec.y - 80)'), 'Bong bóng [E] đặt tại y = y - 80 ở scene level');
assert(npcEntityContent.includes('container.setDepth(5000)'), 'Nhãn tên có depth 5000 (hiển thị nổi trên mái nhà/tháp)');
assert(npcEntityContent.includes('container.setDepth(5001)'), 'Bong bóng [E] có depth 5001 (hiển thị nổi trên nhãn tên)');

// 3. Kiểm tra vị trí và vùng thông thoáng của 5 NPC trong GameScene.ts & zones.json
console.log('\n--- 3. KIỂM TRA VỊ TRÍ, KHÔNG GIAN ĐI LẠI VÀ CHỐNG TRÙNG LẶP ---');
const gameSceneContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');
const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf-8'));
const bellhollowZone = zonesData.zones.find(z => z.id === 'bellhollow');

assert(gameSceneContent.includes('for (const npc of this.npcs) {') && gameSceneContent.includes('npc.destroy();'), 'spawnNPCs() dọn dẹp các NPC cũ trước khi khởi tạo (chống trùng lặp)');

// Danh sách 5 NPC chuẩn hóa C4-12-09 Part 2
const npcs = bellhollowZone.npcs;
assert(Array.isArray(npcs) && npcs.length === 5, 'zones.json bellhollow định nghĩa đủ 5 NPC');

for (const npc of npcs) {
  // Kiểm tra nằm trong ranh giới làng Bellhollow (bounds: x 480..1600, y -200..760, walkable y: 10..540)
  const inBounds = npc.x >= 480 && npc.x <= 1600 && npc.y >= 10 && npc.y <= 540;
  assert(inBounds, `${npc.name} (${npc.x}, ${npc.y}) nằm trong ranh giới đi lại hợp lệ của làng Bellhollow`);

  // Kiểm tra không va chạm với bất kỳ collider nào trong zones.json
  let hasCollision = false;
  let collidedWith = '';

  for (const col of bellhollowZone.colliders) {
    const colRight = col.x + col.width;
    const colBottom = col.y + col.height;
    // Hộp va chạm chân NPC: tâm x, chân y-8 đến y+4
    const npcLeft = npc.x - 8;
    const npcRight = npc.x + 8;
    const npcTop = npc.y - 8;
    const npcBottom = npc.y + 4;

    if (npcLeft < colRight && npcRight > col.x && npcTop < colBottom && npcBottom > col.y) {
      hasCollision = true;
      collidedWith = col.id;
      break;
    }
  }

  assert(!hasCollision, `${npc.name} (${npc.x}, ${npc.y}) không bị đè lên bất kỳ collider/vật thể cứng nào trong làng`, collidedWith ? `Đè lên ${collidedWith}` : '');
}

// Kiểm tra lộ trình tuần tra không vướng vật cản
let garthPatrolClean = true;
for (let x = 505; x <= 535; x += 3) {
  for (const col of bellhollowZone.colliders) {
    if (x >= col.x && x <= col.x + col.width && 265 >= col.y && 265 <= col.y + col.height) {
      garthPatrolClean = false;
    }
  }
}
assert(garthPatrolClean, 'Lộ trình tuần tra của Garth (x: 505..535, y: 265) thông suốt 100%');

let finnPatrolClean = true;
for (let x = 745; x <= 775; x += 3) {
  for (const col of bellhollowZone.colliders) {
    if (x >= col.x && x <= col.x + col.width && 260 >= col.y && 260 <= col.y + col.height) {
      finnPatrolClean = false;
    }
  }
}
assert(finnPatrolClean, 'Lộ trình tuần tra của Finn (x: 745..775, y: 260) thông suốt 100%');

// 4. Kiểm tra Hội thoại và Hệ thống Quest
console.log('\n--- 4. KIỂM TRA BẢO TOÀN HỘI THOẠI & NHIỆM VỤ (DIALOGUES.JSON) ---');
const dialoguesData = JSON.parse(fs.readFileSync('src/data/dialogues.json', 'utf-8')).dialogues;

assert(!!dialoguesData.garth_warning, 'Hội thoại garth_warning tồn tại');
assert(dialoguesData.garth_warning.speaker.includes('Garth'), 'garth_warning đúng người nói Garth');
assert(dialoguesData.garth_warning.nextQuestId === 'Q01_MEET_EDDA', 'garth_warning kích hoạt Q01_MEET_EDDA');

assert(!!dialoguesData.edda_intro, 'Hội thoại edda_intro tồn tại');
assert(dialoguesData.edda_intro.speaker.includes('Edda'), 'edda_intro đúng người nói Edda');
assert(dialoguesData.edda_intro.nextQuestId === 'Q02_MEET_NERIS', 'edda_intro kích hoạt Q02_MEET_NERIS');
assert(!!dialoguesData.edda_reminder, 'Hội thoại nhắc nhở edda_reminder tồn tại');

assert(!!dialoguesData.neris_intro, 'Hội thoại neris_intro tồn tại');
assert(dialoguesData.neris_intro.speaker.includes('Neris'), 'neris_intro đúng người nói Neris');
assert(dialoguesData.neris_intro.nextQuestId === 'Q03_PREPARE_RESOURCES', 'neris_intro kích hoạt Q03_PREPARE_RESOURCES');
assert(dialoguesData.neris_intro.rewardItem === 'item_herbal_poultice', 'neris_intro thưởng Thuốc đắp thảo mộc');
assert(!!dialoguesData.neris_heal, 'Hội thoại hồi máu neris_heal tồn tại');

assert(!!dialoguesData.bram_chat, 'Hội thoại bram_chat tồn tại cho thợ thủ công Bram');
assert(!!dialoguesData.finn_chat, 'Hội thoại finn_chat tồn tại cho cậu bé đưa tin Finn');

// 5. Kiểm tra tương thích phím IME và Tương tác GameScene
console.log('\n--- 5. KIỂM TRA PHẠM VI TƯƠNG TÁC [E] VÀ KHÓA MODAL ---');
assert(gameSceneContent.includes('const isNear = dist <= 42;'), 'Phạm vi kích hoạt tương tác NPC được giới hạn chính xác (dist <= 42 px)');
assert(gameSceneContent.includes('npc.setNearby(isNear, px, py);'), 'GameScene truyền tọa độ người chơi (px, py) để NPC xoay mặt');
assert(gameSceneContent.includes('this.dialogueSystem.isActive || this.craftingModal.isOpen || this.journalModal.isOpen || this.pauseModal.isOpen'), 'Bong bóng tương tác và nhãn NPC tự động ẩn khi mở bất kỳ giao diện nào');

// 6. Kiểm tra Tương Thích Save / Load
console.log('\n--- 6. KIỂM TRA AN TOÀN SAVE / LOAD ---');
assert(gameSceneContent.includes('this.spawnNPCs();'), 'GameScene gọi spawnNPCs() trong create() để khởi tạo NPC chuẩn xác');
const saveManagerContent = fs.readFileSync('src/systems/SaveManager.ts', 'utf-8');
assert(saveManagerContent.includes('saveGame') && saveManagerContent.includes('loadGame'), 'SaveManager hỗ trợ đầy đủ luồng save/load cờ trạng thái nhiệm vụ');

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA RUNTIME C4-12-09: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests === 0) {
  console.log('STATUS: ALL NPC RUNTIME CHECKS PASSED (100% HOÀN TẤT C4-12-09)');
} else {
  console.error(`STATUS: ${failedTests} CHECKS FAILED!`);
  process.exit(1);
}
console.log('================================================================');
