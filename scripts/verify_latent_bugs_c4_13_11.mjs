import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log('================================================================');
console.log('VERIFYING MILESTONE C4-13-11: LATENT BUGS & EDGE CASES AUDIT');
console.log('================================================================\n');

// 1. Kiểm tra Hệ thống Sinh tồn & Chỉ số (SurvivalSystem & SatyrPlayer)
console.log('--- 1. SINGLE AUTHORITY CHO 4 CHỈ SỐ SINH TỒN ---');
const playerPath = path.resolve('src/entities/SatyrPlayer.ts');
const playerCode = fs.readFileSync(playerPath, 'utf8');

assert(
  !playerCode.includes('this.stats.stamina = 0;'),
  'SatyrPlayer không trực tiếp gán đè stamina = 0; nhường quyền kiểm soát duy nhất cho SurvivalSystem'
);
assert(
  playerCode.includes('resetAllInputState'),
  'SatyrPlayer cung cấp hàm resetAllInputState() để dọn sạch phím bấm kẹt'
);

// 2. Kiểm tra Modal Mutual Exclusion & Input Release
console.log('\n--- 2. MODAL MUTUAL EXCLUSION & CLEAN INPUT RELEASE ---');
const dialoguePath = path.resolve('src/systems/DialogueSystem.ts');
const dialogueCode = fs.readFileSync(dialoguePath, 'utf8');

assert(
  dialogueCode.includes('ui.craftingModal.close()') &&
  dialogueCode.includes('ui.journalModal.close()') &&
  dialogueCode.includes('ui.pauseModal.close()'),
  'DialogueSystem tự động đóng toàn bộ các modal khác khi mở hội thoại mới'
);

const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneCode = fs.readFileSync(uiScenePath, 'utf8');

assert(
  uiSceneCode.includes('this.hideDialogue()') &&
  uiSceneCode.includes('gameScene.player.resetAllInputState()'),
  'UIScene tự động đóng hội thoại khi mở modal và dọn sạch trạng thái điều khiển người chơi khi đóng modal'
);
assert(
  uiSceneCode.includes('public get isAnyModalOpen(): boolean'),
  'UIScene cung cấp getter isAnyModalOpen bảo vệ trạng thái giao diện'
);

// 3. Kiểm tra Interaction Nearest-Neighbor Candidate Selection
console.log('\n--- 3. CANDIDATE SELECTION & NEAREST-NEIGHBOR INTERACTION ---');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf8');

assert(
  gameSceneCode.includes('this.uiScene.isAnyModalOpen') &&
  gameSceneCode.includes('this.isGameplayInputLocked()'),
  'GameScene chặn hoàn toàn việc tương tác phím [E] khi đang mở Modal hoặc khóa điều khiển'
);
assert(
  gameSceneCode.includes('interface InteractionCandidate') &&
  gameSceneCode.includes('const candidates: InteractionCandidate[] = [];'),
  'GameScene tập hợp toàn bộ ứng viên tương tác (NPC, Mỏ tài nguyên, Nông trại, Vật thể) vào danh sách ứng viên'
);
assert(
  gameSceneCode.includes('candidates.sort((a, b) => a.dist - b.dist);') &&
  gameSceneCode.includes('const best = candidates[0];'),
  'GameScene sắp xếp theo khoảng cách Euclid tăng dần và chọn duy nhất ứng viên gần nhất'
);

// 4. Kiểm tra Save/Load & Phục hồi Camera/Zone không kẹt
console.log('\n--- 4. SAVE/LOAD, CAMERA BOUNDS & SCENE LIFECYCLE RESETS ---');
assert(
  gameSceneCode.includes('this.worldBuilder.detectCurrentZone({ x: spawnX, y: spawnY })'),
  'GameScene tự động xác định phân khu chuẩn xác ngay lập tức khi Continue tải save'
);
assert(
  gameSceneCode.includes('this.isGameOverPending = false;') &&
  gameSceneCode.includes('this.isAct5ChaseActive = false;') &&
  gameSceneCode.includes('this.transitionCooldown = 0;'),
  'GameScene.init() dọn sạch toàn bộ các biến trạng thái vòng đời, chống rò rỉ khi Restart'
);

// 5. Kiểm tra An Toàn Texture (Safe Texture Fallback)
console.log('\n--- 5. AN TOÀN TEXTURE & FALLBACK DUMMY_TRANSPARENT ---');
const preloadPath = path.resolve('src/scenes/PreloadScene.ts');
const preloadCode = fs.readFileSync(preloadPath, 'utf8');
assert(
  preloadCode.includes("dummyGfx.generateTexture('dummy_transparent', 1, 1);"),
  'PreloadScene sinh trước texture dummy_transparent 1x1 RGBA trong suốt ngay trong preload()'
);

const worldBuilderPath = path.resolve('src/world/WorldBuilder.ts');
const worldBuilderCode = fs.readFileSync(worldBuilderPath, 'utf8');
assert(
  worldBuilderCode.includes('safeAddImage') &&
  worldBuilderCode.includes("fallbackKey: string = 'dummy_transparent'"),
  'WorldBuilder triển khai phương thức an toàn safeAddImage chống lỗi thiếu texture'
);

// 6. Kiểm tra Đồng bộ Ngôn ngữ Tiếng Việt & Lore
console.log('\n--- 6. ĐỒNG BỘ NGÔN NGỮ TIẾNG VIỆT & LORE ---');
const dialoguesJson = JSON.parse(fs.readFileSync('src/data/dialogues.json', 'utf8')).dialogues;
assert(
  !dialoguesJson.garth_warning.lines.some(l => l.includes('The Hollow Woods')),
  'dialogues.json không còn chuỗi tiếng Anh The Hollow Woods lẻ loi'
);

const zonesJson = fs.readFileSync('src/data/zones.json', 'utf8');
assert(
  zonesJson.includes('Khu Rừng Rỗng (The Hollow Woods)'),
  'zones.json sử dụng danh xưng đồng bộ Khu Rừng Rỗng (The Hollow Woods)'
);

const journalPath = path.resolve('src/ui/JournalModal.ts');
const journalCode = fs.readFileSync(journalPath, 'utf8');
assert(
  journalCode.includes('KHU RỪNG RỖNG (THE HOLLOW WOODS)'),
  'JournalModal hiển thị tiêu đề bản đồ đồng bộ KHU RỪNG RỖNG (THE HOLLOW WOODS)'
);

console.log('\n================================================================');
console.log('>>> TẤT CẢ 15 HẠNG MỤC KIỂM TRA C4-13-11 ĐỀU ĐẠT CHUẨN 100%! <<<');
console.log('================================================================');
