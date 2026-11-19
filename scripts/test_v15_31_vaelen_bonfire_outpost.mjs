/**
 * HOLLOW WOODS V1.5 - BƯỚC V15-31 TEST SUITE
 * Kiểm tra xác minh:
 * 1. Phân biệt Asset chuẩn xác giữa Garth và Sir Vaelen.
 * 2. Gán đúng Sprite 2D_SL_Knight_v1.0_3 cho Sir Vaelen — Kỵ Sĩ Trầm Mặc.
 * 3. Di dời Sir Vaelen và Bếp Lửa Hồng ra Trạm Lửa Rừng Tĩnh Lặng (Outer Woods).
 * 4. Tích hợp vùng bảo hộ an toàn (Sanctuary 180px) và hồi phục Bình Tâm, Độ Ẩm.
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('=== BẮT ĐẦU KIỂM THỬ V15-31: SIR VAELEN & QUIET FOREST BONFIRE OUTPOST ===\n');

// 1. Kiểm tra tài nguyên sprite trên đĩa
console.log('1. Kiểm tra tập tin hình ảnh sprite của Sir Vaelen:');
const prayPath = path.resolve('public/assets/characters/npcs/campfire_knight_pray_sheet.png');
const idlePath = path.resolve('public/assets/characters/npcs/campfire_knight_idle_sheet.png');
const portraitPath = path.resolve('public/assets/characters/npcs/portrait_campfire_knight.png');
const garthPath = path.resolve('public/assets/characters/npcs/garth_walk_sheet.png');

assert(fs.existsSync(prayPath), 'Tập tin campfire_knight_pray_sheet.png tồn tại trong public/assets/characters/npcs');
assert(fs.existsSync(idlePath), 'Tập tin campfire_knight_idle_sheet.png tồn tại trong public/assets/characters/npcs');
assert(fs.existsSync(portraitPath), 'Tập tin portrait_campfire_knight.png tồn tại trong public/assets/characters/npcs');
assert(fs.existsSync(garthPath), 'Tập tin garth_walk_sheet.png của Người Giữ Làng Garth tồn tại riêng biệt');

// 2. Kiểm tra NPCEntity.ts
console.log('\n2. Kiểm tra logic phân loại và gán sprite trong NPCEntity.ts:');
const npcEntitySrc = fs.readFileSync(path.resolve('src/entities/NPCEntity.ts'), 'utf-8');

assert(
  npcEntitySrc.includes("lowerId.includes('knight') || lowerId.includes('vaelen')") &&
  npcEntitySrc.includes("this.baseId = 'campfire_knight'"),
  'NPCEntity nhận diện chính xác baseId = campfire_knight khi id/tên chứa knight hoặc vaelen'
);

assert(
  npcEntitySrc.includes("this.baseId === 'campfire_knight'") &&
  npcEntitySrc.includes("this.headOffsetY = 46"),
  'NPCEntity căn chuẩn độ cao nhãn tên headOffsetY = 46 cho dáng quỳ của campfire_knight'
);

assert(
  npcEntitySrc.includes("initialSheet = 'campfire_knight_pray_sheet'") &&
  npcEntitySrc.includes("initialSheet = 'campfire_knight_idle_sheet'"),
  'NPCEntity nạp đúng spritesheet riêng biệt từ gói 2D_SL_Knight, không bao giờ fallback về Garth'
);

assert(
  npcEntitySrc.includes("anim_campfire_knight_pray") &&
  npcEntitySrc.includes("anim_campfire_knight_idle"),
  'NPCEntity hỗ trợ chuyển đổi mượt mà giữa tư thế quỳ canh lửa (pray) và đứng đối thoại (idle)'
);

// 3. Kiểm tra PreloadScene.ts
console.log('\n3. Kiểm tra nạp tài nguyên và đăng ký hoạt ảnh trong PreloadScene.ts:');
const preloadSrc = fs.readFileSync(path.resolve('src/scenes/PreloadScene.ts'), 'utf-8');

assert(
  preloadSrc.includes("SPRITE_CAMPFIRE_KNIGHT_PRAY") &&
  preloadSrc.includes("SPRITE_CAMPFIRE_KNIGHT_IDLE") &&
  preloadSrc.includes("PORTRAIT_CAMPFIRE_KNIGHT"),
  'PreloadScene định nghĩa đầy đủ hằng số asset cho Sir Vaelen'
);

assert(
  preloadSrc.includes("this.load.spritesheet(SPRITE_CAMPFIRE_KNIGHT_PRAY") &&
  preloadSrc.includes("this.load.spritesheet('campfire_knight_pray_sheet.png'") &&
  preloadSrc.includes("this.load.spritesheet(SPRITE_CAMPFIRE_KNIGHT_IDLE") &&
  preloadSrc.includes("this.load.spritesheet('campfire_knight_idle_sheet.png'"),
  'PreloadScene nạp đủ các alias khóa sprite để chống lỗi không tìm thấy texture'
);

assert(
  preloadSrc.includes("key: 'anim_campfire_knight_pray'") &&
  preloadSrc.includes("key: 'anim_campfire_knight_idle'"),
  'PreloadScene khởi tạo cả 2 animation anim_campfire_knight_pray và anim_campfire_knight_idle'
);

// 4. Kiểm tra GameScene.ts
console.log('\n4. Kiểm tra thiết lập vị trí và tương tác trong GameScene.ts:');
const gameSceneSrc = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');

assert(
  gameSceneSrc.includes("name: 'Sir Vaelen — Kỵ Sĩ Trầm Mặc'") &&
  gameSceneSrc.includes("title: 'Lưỡi gươm chọn sự bình yên'") &&
  gameSceneSrc.includes("x: 1435") &&
  gameSceneSrc.includes("y: 710"),
  'GameScene khởi tạo Sir Vaelen tại Trạm Lửa Rừng Tĩnh Lặng (x: 1435, y: 710) với đúng tên và danh xưng'
);

assert(
  gameSceneSrc.includes("baseName = 'Trò chuyện với Kỵ Sĩ Vaelen'") &&
  gameSceneSrc.includes("promptText = isWithinInteractRange ? `[E] ${baseName}` : baseName;"),
  'GameScene hiển thị đúng gợi ý tương tác [E] Trò chuyện với Kỵ Sĩ Vaelen khi lại gần'
);

assert(
  gameSceneSrc.includes("actionId === 'warm_quiet_bonfire'") &&
  gameSceneSrc.includes("this.playerState.modifyComposure(15)") &&
  gameSceneSrc.includes("this.playerState.stats.moisture = Math.max(0, this.playerState.stats.moisture - 20)"),
  'GameScene xử lý tương tác sưởi ấm tại Bếp Lửa Hồng (+15 Bình Tâm, -20 Độ Ẩm, +15 Nhiệt Độ)'
);

// 5. Kiểm tra WorldBuilder.ts
console.log('\n5. Kiểm tra dựng cảnh Trạm Lửa Rừng Tĩnh Lặng trong WorldBuilder.ts:');
const worldBuilderSrc = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf-8');

assert(
  worldBuilderSrc.includes("this.createQuietForestBonfireOutpost(1470, 710)"),
  'WorldBuilder gọi dựng Trạm Lửa Rừng Tĩnh Lặng tại (1470, 710) trong Outer Woods'
);

assert(
  worldBuilderSrc.includes("createQuietForestBonfireOutpost") &&
  worldBuilderSrc.includes("id: 'quiet_forest_bonfire'") &&
  worldBuilderSrc.includes("actionId: 'warm_quiet_bonfire'"),
  'WorldBuilder tạo điểm tương tác quiet_forest_bonfire gắn với action warm_quiet_bonfire'
);

// 6. Kiểm tra CampSanctuarySystem.ts & SurvivalSystem.ts
console.log('\n6. Kiểm tra hệ thống vùng bảo hộ và nguồn nhiệt:');
const campSanctuarySrc = fs.readFileSync(path.resolve('src/systems/CampSanctuarySystem.ts'), 'utf-8');
const survivalSrc = fs.readFileSync(path.resolve('src/systems/SurvivalSystem.ts'), 'utf-8');

assert(
  campSanctuarySrc.includes("campfireX: number = 1470") &&
  campSanctuarySrc.includes("campfireY: number = 710") &&
  campSanctuarySrc.includes("knightX: number = 1435") &&
  campSanctuarySrc.includes("knightY: number = 710") &&
  campSanctuarySrc.includes("sanctuaryRadius: number = 180"),
  'CampSanctuarySystem cấu hình tọa độ tâm (1470, 710), kỵ sĩ (1435, 710) và bán kính 180px'
);

assert(
  campSanctuarySrc.includes("zoneId !== 'outer_woods'") &&
  campSanctuarySrc.includes("zoneId !== 'crooked_path'"),
  'CampSanctuarySystem kiểm tra vùng bảo hộ tại Outer Woods và Crooked Path'
);

assert(
  survivalSrc.includes("{ x: 1470, y: 710, radius: 180, name: 'Trạm Lửa Rừng Tĩnh Lặng' }"),
  'SurvivalSystem đăng ký Trạm Lửa Rừng Tĩnh Lặng vào warmSources'
);

assert(
  survivalSrc.includes("CampSanctuarySystem.getInstance().isPlayerInSanctuary"),
  'SurvivalSystem tích hợp CampSanctuarySystem để kích hoạt hồi phục khi đứng trong vòng an toàn'
);

// 7. Kiểm tra zones.json & dialogues.json
console.log('\n7. Kiểm tra dữ liệu vùng và hội thoại:');
const zones = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf-8'));
const dialogues = JSON.parse(fs.readFileSync(path.resolve('src/data/dialogues.json'), 'utf-8'));

const bellhollowZone = zones.zones.find(z => z.id === 'bellhollow');
const outerWoodsZone = zones.zones.find(z => z.id === 'outer_woods');

assert(
  bellhollowZone && !bellhollowZone.npcs?.some(n => n.id === 'npc_campfire_knight'),
  'Vùng Bellhollow không còn chứa npc_campfire_knight (đã di dời ra ngoài làng)'
);

assert(
  outerWoodsZone && outerWoodsZone.npcs?.some(n => n.id === 'npc_campfire_knight' && n.x === 1435 && n.y === 710),
  'Vùng Outer Woods chứa npc_campfire_knight tại đúng tọa độ (1435, 710)'
);

assert(
  outerWoodsZone && outerWoodsZone.interactables?.some(i => i.id === 'quiet_forest_bonfire' && i.actionId === 'warm_quiet_bonfire'),
  'Vùng Outer Woods chứa interactable quiet_forest_bonfire'
);

const knightIntro = dialogues.dialogues?.campfire_knight_intro;
assert(
  knightIntro &&
  knightIntro.speaker === 'Sir Vaelen — Kỵ Sĩ Trầm Mặc' &&
  knightIntro.portrait === 'portrait_campfire_knight',
  'Hội thoại campfire_knight_intro mang đúng tên người nói Sir Vaelen và portrait tương ứng'
);

console.log(`\n=== TỔNG KẾT KIỂM THỬ: ${passCount} PASS / ${failCount} FAIL ===`);
if (failCount > 0) {
  process.exit(1);
}
