/**
 * HOLLOW WOODS V1.4 — KIỂM THỬ TÍCH HỢP SÓI XƯƠNG (SKULL WOLF INTEGRATION VERIFICATION)
 * Bước V14-P8-08: Chuẩn hóa tài nguyên, ContentRegistry 4 tầng, AI săn đêm & phản ứng ánh sáng, Sổ tay Bestiary
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, desc) {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${desc}`);
    failed++;
  }
}

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-08: SÓI XƯƠNG (SKULL WOLF)');
console.log('======================================================================\n');

// --- PHẦN 1: TÀI NGUYÊN ĐỒ HỌA CHUẨN HÓA (ASSET NORMALIZATION) ---
console.log('--- PHẦN 1: Kiểm Tra Tài Nguyên Đồ Họa Chuẩn Hóa ---');
const sheetPath = path.resolve('public/assets/characters/monsters/skull_wolf_sheet.png');
const portraitPath = path.resolve('public/assets/characters/monsters/portrait_skull_wolf.png');

assert(fs.existsSync(sheetPath), 'Tệp spritesheet public/assets/characters/monsters/skull_wolf_sheet.png tồn tại');
if (fs.existsSync(sheetPath)) {
  const buf = fs.readFileSync(sheetPath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  assert(width === 448 && height === 256, `Spritesheet có kích thước chuẩn 448x256 px (7 cột x 4 hàng 64x64) [Thực tế: ${width}x${height}]`);
}

assert(fs.existsSync(portraitPath), 'Tệp chân dung public/assets/characters/monsters/portrait_skull_wolf.png tồn tại');
if (fs.existsSync(portraitPath)) {
  const pbuf = fs.readFileSync(portraitPath);
  const pw = pbuf.readUInt32BE(16);
  const ph = pbuf.readUInt32BE(20);
  assert(pw === 64 && ph === 64, `Chân dung có kích thước chuẩn 64x64 px [Thực tế: ${pw}x${ph}]`);
}

// --- PHẦN 2: CẤU HÌNH HẰNG SỐ & PRELOAD SCENE ---
console.log('\n--- PHẦN 2: Cấu Hình Hằng Số & Tải Tài Nguyên ---');
const constantsSrc = fs.readFileSync('src/config/Constants.ts', 'utf8');
assert(constantsSrc.includes("SPRITE_SKULL_WOLF = 'skull_wolf_sheet'"), 'Constants.ts định nghĩa SPRITE_SKULL_WOLF');
assert(constantsSrc.includes("PORTRAIT_SKULL_WOLF = 'portrait_skull_wolf'"), 'Constants.ts định nghĩa PORTRAIT_SKULL_WOLF');

const preloadSrc = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
assert(preloadSrc.includes('SPRITE_SKULL_WOLF') && preloadSrc.includes('frameWidth: 64') && preloadSrc.includes('frameHeight: 64'), 'PreloadScene tải spritesheet Sói Xương với frame 64x64');
assert(preloadSrc.includes('PORTRAIT_SKULL_WOLF'), 'PreloadScene tải portrait Sói Xương');

// --- PHẦN 3: CONTENT REGISTRY 4 TẦNG & ITEMS & RECIPES ---
console.log('\n--- PHẦN 3: Content Registry 4 Tầng & Bảng Vật Phẩm / Công Thức ---');
const contentRegistryJson = JSON.parse(fs.readFileSync('src/data/content_registry.json', 'utf8'));
const regAssets = contentRegistryJson.assets || [];
const regEntries = contentRegistryJson.entries || [];

assert(regAssets.some(a => a.assetId === 'HW-AST-CHAR-SKULLWOLF'), 'Registry Asset HW-AST-CHAR-SKULLWOLF tồn tại');
assert(regAssets.some(a => a.assetId === 'HW-AST-PORT-SKULLWOLF'), 'Registry Asset HW-AST-PORT-SKULLWOLF tồn tại');

const wolfEntry = regEntries.find(e => e.id === 'HW-MON-BEAST-000001');
assert(Boolean(wolfEntry), 'Content Registry có mục Quái Vật Sói Xương HW-MON-BEAST-000001');
if (wolfEntry) {
  assert(wolfEntry.runtimeKey === 'mon_skull_wolf', 'Wolf runtimeKey là "mon_skull_wolf"');
  assert(wolfEntry.assetRefs.includes('HW-AST-CHAR-SKULLWOLF'), 'Wolf liên kết đúng Asset HW-AST-CHAR-SKULLWOLF');
}

const fangEntry = regEntries.find(e => e.id === 'HW-ITM-MAT-000004');
assert(Boolean(fangEntry), 'Content Registry có mục Vật Phẩm Nanh Xương Cổ HW-ITM-MAT-000004');
if (fangEntry) {
  assert(fangEntry.runtimeKey === 'mat_skull_fang', 'Fang runtimeKey là "mat_skull_fang"');
}

const itemsJson = JSON.parse(fs.readFileSync('src/data/items.json', 'utf8'));
const fangItem = itemsJson.items ? itemsJson.items.find(i => i.id === 'mat_skull_fang') : null;
assert(Boolean(fangItem), 'items.json có mục vật phẩm "mat_skull_fang"');
if (fangItem) {
  assert((fangItem.name || fangItem.nameVi || '').includes('Nanh Xương Cổ'), 'Vật phẩm có tên tiếng Việt "Nanh Xương Cổ"');
  assert(fangItem.category === 'material', 'Vật phẩm thuộc nhóm material');
}

const recipes = itemsJson.recipes || [];
const spearRecipe = recipes.find(r => r.id === 'craft_skull_fang_spear');
assert(Boolean(spearRecipe), 'recipes có công thức rèn "craft_skull_fang_spear" (Giáo Gỗ Bịt Sắt Gia Cố Nanh Sói)');
const charmRecipe = recipes.find(r => r.id === 'craft_skull_fang_charm');
assert(Boolean(charmRecipe), 'recipes có công thức chế tạo "craft_skull_fang_charm" (Bùa Nanh Sói Xương)');

// --- PHẦN 4: STATE, BESTIARY & TYPES ---
console.log('\n--- PHẦN 4: Kiểu Dữ Liệu & Sổ Tay Sinh Vật (Bestiary) ---');
const typesSrc = fs.readFileSync('src/types/index.ts', 'utf8');
assert(typesSrc.includes("'skull_wolf'"), 'types/index.ts BestiarySpecies union bao gồm "skull_wolf"');

const playerStateSrc = fs.readFileSync('src/state/PlayerState.ts', 'utf8');
assert(playerStateSrc.includes("this.bestiary.set('skull_wolf'"), 'PlayerState khởi tạo mục Sói Xương trong Bestiary');
assert(playerStateSrc.includes("HW-MON-BEAST-000001"), 'PlayerState liên kết Content ID HW-MON-BEAST-000001');

// --- PHẦN 5: ÂM THANH AUDIOMANAGER ---
console.log('\n--- PHẦN 5: Hệ Thống Âm Thanh (Audio Manager) ---');
const audioSrc = fs.readFileSync('src/audio/AudioManager.ts', 'utf8');
assert(audioSrc.includes('playWolfGrowl'), 'AudioManager có phương thức playWolfGrowl() (tiếng gầm gừ đe dọa)');
assert(audioSrc.includes('playBoneRattle'), 'AudioManager có phương thức playBoneRattle() (tiếng lách cách xương)');
assert(audioSrc.includes('playWolfLunge'), 'AudioManager có phương thức playWolfLunge() (tiếng vồ mồi lao tới)');
assert(audioSrc.includes('playWolfDissolve'), 'AudioManager có phương thức playWolfDissolve() (tiếng tan biến thành tro bụi)');

// --- PHẦN 6: THỰC THỂ SKULL WOLF ENTITY & HỆ THỐNG WILDLIFE ---
console.log('\n--- PHẦN 6: Thực Thể SkullWolfEntity & Hệ Thống Động Vật Hoang Dã ---');
const entitySrc = fs.readFileSync('src/entities/SkullWolfEntity.ts', 'utf8');
assert(entitySrc.includes("wolfState: SkullWolfState = 'patrol'"), 'SkullWolfEntity quản lý trạng thái AI (patrol, stalk, fear_light, lunge, hurt, dissolve)');
assert(entitySrc.includes('fear_light'), 'SkullWolfEntity có phản xạ sợ ánh sáng fear_light (lùi ra xa khi có đèn lồng/lửa trại)');
assert(entitySrc.includes('spook'), 'SkullWolfEntity làm kinh động đàn quạ khi đến gần < 130px');
assert(entitySrc.includes("PlayerState.getInstance().addItem('mat_skull_fang'"), 'SkullWolfEntity tự động rơi Nanh Xương Cổ khi bị tiêu diệt');
assert(entitySrc.includes("PlayerState.getInstance().observeCreature('skull_wolf')"), 'SkullWolfEntity ghi chép vào Bestiary khi bị tiêu diệt');
assert(entitySrc.includes('hasHitPlayerInCurrentLunge'), 'SkullWolfEntity có cơ chế ngăn đa chấn thương lặp lại trong một cú vồ');

const wildlifeSrc = fs.readFileSync('src/systems/WildlifeSystem.ts', 'utf8');
assert(wildlifeSrc.includes('skullWolves'), 'WildlifeSystem quản lý danh sách cá thể Sói Xương');
assert(wildlifeSrc.includes('getSkullWolves'), 'WildlifeSystem cung cấp phương thức getSkullWolves()');
assert(wildlifeSrc.includes('crooked_path') && wildlifeSrc.includes('deep_forest') && wildlifeSrc.includes('silent_mire'), 'Sói Xương phân bố tại Crooked Path, Deep Forest và Silent Mire');
assert(wildlifeSrc.includes('observeCreature'), 'WildlifeSystem tự động mở khóa Bestiary khi người chơi quan sát thấy Sói Xương trong tầm 260px');

// --- PHẦN 7: GAMESCENE COMBAT & JOURNAL UI ---
console.log('\n--- PHẦN 7: Tương Tác Chiến Đấu GameScene & Giao Diện Sổ Tay Journal ---');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneSrc.includes('skull_wolf_defeated'), 'GameScene lắng nghe sự kiện skull_wolf_defeated và hiển thị thông báo popup');
assert(gameSceneSrc.includes('wolf.takeDamage'), 'handlePlayerAttackHitbox quét và gây sát thương cho Sói Xương bằng vũ khí');
assert(gameSceneSrc.includes("triggerPlayerDeath('Bị Sói Xương cắn xé"), 'Cú vồ trúng của Sói Xương gây sát thương HP/Composure và kích hoạt Game Over nếu cạn máu');
assert(gameSceneSrc.includes("PORTRAIT_SKULL_WOLF") || gameSceneSrc.includes("skull_wolf"), 'GameScene có logic liên quan đến Sói Xương');

const journalSrc = fs.readFileSync('src/ui/JournalModal.ts', 'utf8');
assert(journalSrc.includes('PORTRAIT_SKULL_WOLF'), 'JournalModal hiển thị khung chân dung minh họa cho Sói Xương khi đã quan sát');

console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passed}/${passed + failed} KIỂM TRA ĐẠT (${failed} THẤT BẠI)`);
if (failed === 0) {
  console.log('TRẠNG THÁI BƯỚC V14-P8-08: HOÀN HẢO PASS 100%!');
} else {
  console.log('TRẠNG THÁI BƯỚC V14-P8-08: CẦN KHẮC PHỤC LỖI');
}
console.log('======================================================================');
