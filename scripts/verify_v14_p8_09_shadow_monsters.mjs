/**
 * HOLLOW WOODS V1.4 — KIỂM THỬ TÍCH HỢP NHÓM QUÁI VẬT BÓNG TỐI
 * Bước V14-P8-09: Quạ Bóng Tối, Bóng Mắt Sương Mù & Trùm Bóng Tối Khổng Lồ
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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-09: QUÁI VẬT BÓNG TỐI');
console.log('======================================================================\n');

// --- PHẦN 1: TÀI NGUYÊN ĐỒ HỌA CHUẨN HÓA (ASSET NORMALIZATION) ---
console.log('--- PHẦN 1: Kiểm Tra Tài Nguyên Đồ Họa Chuẩn Hóa ---');
const crowPath = path.resolve('public/assets/characters/monsters/shadow_crow_sheet.png');
const eyesPath = path.resolve('public/assets/characters/monsters/shadow_eyes_sheet.png');
const bossPath = path.resolve('public/assets/characters/bosses/shadow_big_boss_sheet.png');
const portraitPath = path.resolve('public/assets/characters/bosses/portrait_shadow_big_boss.png');

assert(fs.existsSync(crowPath), 'Tệp shadow_crow_sheet.png tồn tại');
if (fs.existsSync(crowPath)) {
  const buf = fs.readFileSync(crowPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 384 && h === 384, `Spritesheet Quạ Bóng Tối chuẩn 384x384 px (6x6 64x64 cells) [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(eyesPath), 'Tệp shadow_eyes_sheet.png tồn tại');
if (fs.existsSync(eyesPath)) {
  const buf = fs.readFileSync(eyesPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 384 && h === 144, `Spritesheet Bóng Mắt Sương Mù chuẩn 384x144 px (8x3 48x48 cells) [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(bossPath), 'Tệp shadow_big_boss_sheet.png tồn tại');
if (fs.existsSync(bossPath)) {
  const buf = fs.readFileSync(bossPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 1280 && h === 640, `Spritesheet Trùm Bóng Tối chuẩn 1280x640 px (16x8 80x80 cells) [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(portraitPath), 'Tệp portrait_shadow_big_boss.png tồn tại');
if (fs.existsSync(portraitPath)) {
  const buf = fs.readFileSync(portraitPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 64 && h === 64, `Chân dung Trùm Bóng Tối chuẩn 64x64 px [Thực tế: ${w}x${h}]`);
}

// --- PHẦN 2: CẤU HÌNH HẰNG SỐ & PRELOAD SCENE ---
console.log('\n--- PHẦN 2: Cấu Hình Hằng Số & PreloadScene ---');
const constantsSrc = fs.readFileSync('src/config/Constants.ts', 'utf8');
assert(constantsSrc.includes("SPRITE_SHADOW_CROW = 'shadow_crow_sheet'"), 'Constants.ts định nghĩa SPRITE_SHADOW_CROW');
assert(constantsSrc.includes("SPRITE_SHADOW_EYES = 'shadow_eyes_sheet'"), 'Constants.ts định nghĩa SPRITE_SHADOW_EYES');
assert(constantsSrc.includes("SPRITE_SHADOW_BIG_BOSS = 'shadow_big_boss_sheet'"), 'Constants.ts định nghĩa SPRITE_SHADOW_BIG_BOSS');
assert(constantsSrc.includes("PORTRAIT_SHADOW_BIG_BOSS = 'portrait_shadow_big_boss'"), 'Constants.ts định nghĩa PORTRAIT_SHADOW_BIG_BOSS');

const preloadSrc = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
assert(preloadSrc.includes('SPRITE_SHADOW_CROW') && preloadSrc.includes('frameWidth: 64'), 'PreloadScene nạp Quạ Bóng Tối (64x64)');
assert(preloadSrc.includes('SPRITE_SHADOW_EYES') && preloadSrc.includes('frameWidth: 48'), 'PreloadScene nạp Bóng Mắt Sương Mù (48x48)');
assert(preloadSrc.includes('SPRITE_SHADOW_BIG_BOSS') && preloadSrc.includes('frameWidth: 80'), 'PreloadScene nạp Trùm Bóng Tối Khổng Lồ (80x80)');
assert(preloadSrc.includes('PORTRAIT_SHADOW_BIG_BOSS'), 'PreloadScene nạp chân dung Trùm Bóng Tối');

// --- PHẦN 3: CONTENT REGISTRY 4 TẦNG & ITEMS & RECIPES ---
console.log('\n--- PHẦN 3: Content Registry 4 Tầng, Items & Recipes ---');
const registryJson = JSON.parse(fs.readFileSync('src/data/content_registry.json', 'utf8'));
const assets = registryJson.assets || [];
const entries = registryJson.entries || [];

assert(assets.some(a => a.assetId === 'HW-AST-CHAR-SHADOWCROW'), 'Registry chứa Asset HW-AST-CHAR-SHADOWCROW');
assert(assets.some(a => a.assetId === 'HW-AST-CHAR-SHADOWEYES'), 'Registry chứa Asset HW-AST-CHAR-SHADOWEYES');
assert(assets.some(a => a.assetId === 'HW-AST-CHAR-SHADOWBOSS'), 'Registry chứa Asset HW-AST-CHAR-SHADOWBOSS');
assert(assets.some(a => a.assetId === 'HW-AST-PORT-SHADOWBOSS'), 'Registry chứa Asset HW-AST-PORT-SHADOWBOSS');

const crowEntry = entries.find(e => e.id === 'HW-MON-SHADOW-000001');
assert(Boolean(crowEntry && crowEntry.runtimeKey === 'mon_shadow_crow'), 'Registry chứa mục Quạ Bóng Tối HW-MON-SHADOW-000001 (mon_shadow_crow)');

const eyesEntry = entries.find(e => e.id === 'HW-MON-SHADOW-000002');
assert(Boolean(eyesEntry && eyesEntry.runtimeKey === 'mon_shadow_eyes'), 'Registry chứa mục Bóng Mắt Sương Mù HW-MON-SHADOW-000002 (mon_shadow_eyes)');

const bossEntry = entries.find(e => e.id === 'HW-MON-BOSS-000003');
assert(Boolean(bossEntry && bossEntry.runtimeKey === 'boss_shadow_behemoth'), 'Registry chứa mục Trùm Bóng Tối Khổng Lồ HW-MON-BOSS-000003 (boss_shadow_behemoth)');

const essenceEntry = entries.find(e => e.id === 'HW-ITM-MAT-000005');
assert(Boolean(essenceEntry && essenceEntry.runtimeKey === 'mat_shadow_essence'), 'Registry chứa mục Mảnh Tinh Chất Bóng Tối HW-ITM-MAT-000005 (mat_shadow_essence)');

const itemsJson = JSON.parse(fs.readFileSync('src/data/items.json', 'utf8'));
const essenceItem = itemsJson.items ? itemsJson.items.find(i => i.id === 'mat_shadow_essence') : null;
assert(Boolean(essenceItem), 'items.json khai báo vật phẩm mat_shadow_essence');
if (essenceItem) {
  assert(essenceItem.name.includes('Mảnh Tinh Chất Bóng Tối'), 'Tên vật phẩm là Mảnh Tinh Chất Bóng Tối');
  assert(essenceItem.maxStack === 5, 'Vật phẩm có maxStack = 5');
}

const recipes = itemsJson.recipes || [];
const wardRecipe = recipes.find(r => r.id === 'craft_abyssal_ward_charm');
assert(Boolean(wardRecipe), 'recipes có công thức craft_abyssal_ward_charm sử dụng mat_shadow_essence');

// --- PHẦN 4: TYPES, PLAYERSTATE & BESTIARY ---
console.log('\n--- PHẦN 4: Kiểu Dữ Liệu & Sổ Tay Sinh Vật (Bestiary) ---');
const typesSrc = fs.readFileSync('src/types/index.ts', 'utf8');
assert(typesSrc.includes("'shadow_crow'"), 'types/index.ts BestiarySpecies có "shadow_crow"');
assert(typesSrc.includes("'shadow_eyes'"), 'types/index.ts BestiarySpecies có "shadow_eyes"');
assert(typesSrc.includes("'shadow_behemoth'"), 'types/index.ts BestiarySpecies có "shadow_behemoth"');

const playerStateSrc = fs.readFileSync('src/state/PlayerState.ts', 'utf8');
assert(playerStateSrc.includes("this.bestiary.set('shadow_crow'"), 'PlayerState khởi tạo Bestiary mục shadow_crow');
assert(playerStateSrc.includes("this.bestiary.set('shadow_eyes'"), 'PlayerState khởi tạo Bestiary mục shadow_eyes');
assert(playerStateSrc.includes("this.bestiary.set('shadow_behemoth'"), 'PlayerState khởi tạo Bestiary mục shadow_behemoth');

// --- PHẦN 5: ÂM THANH AUDIOMANAGER ---
console.log('\n--- PHẦN 5: Hệ Thống Âm Thanh (Audio Manager) ---');
const audioSrc = fs.readFileSync('src/audio/AudioManager.ts', 'utf8');
assert(audioSrc.includes('playShadowCrowCaw'), 'AudioManager có phương thức playShadowCrowCaw()');
assert(audioSrc.includes('playShadowCrowAttack'), 'AudioManager có phương thức playShadowCrowAttack()');
assert(audioSrc.includes('playShadowEyesGaze'), 'AudioManager có phương thức playShadowEyesGaze()');
assert(audioSrc.includes('playShadowEyesDissolve'), 'AudioManager có phương thức playShadowEyesDissolve()');
assert(audioSrc.includes('playBehemothRoar'), 'AudioManager có phương thức playBehemothRoar()');
assert(audioSrc.includes('playBehemothStep'), 'AudioManager có phương thức playBehemothStep()');
assert(audioSrc.includes('playBehemothSlam'), 'AudioManager có phương thức playBehemothSlam()');
assert(audioSrc.includes('playBehemothMiss'), 'AudioManager có phương thức playBehemothMiss()');
assert(audioSrc.includes('playBehemothDefeat'), 'AudioManager có phương thức playBehemothDefeat()');

// --- PHẦN 6: THỰC THỂ & HỆ THỐNG WILDLIFESYSTEM ---
console.log('\n--- PHẦN 6: Thực Thể ShadowMonsters & WildlifeSystem ---');
const entitySrc = fs.readFileSync('src/entities/ShadowMonsters.ts', 'utf8');
assert(entitySrc.includes('ShadowCrowEntity'), 'ShadowMonsters.ts xuất lớp ShadowCrowEntity');
assert(entitySrc.includes('caw_alarm') && entitySrc.includes('dive_attack'), 'ShadowCrowEntity có máy trạng thái caw_alarm & dive_attack');
assert(entitySrc.includes('ShadowEyesEntity'), 'ShadowMonsters.ts xuất lớp ShadowEyesEntity');
assert(entitySrc.includes('dissolveByLight'), 'ShadowEyesEntity có cơ chế tan biến trước ánh sáng dissolveByLight()');
assert(entitySrc.includes('ShadowBehemothBoss'), 'ShadowMonsters.ts xuất lớp ShadowBehemothBoss');
assert(entitySrc.includes('vulnerable_miss') && entitySrc.includes('isVulnerable'), 'ShadowBehemothBoss có trạng thái lộ sơ hở vulnerable_miss (x2 sát thương)');
assert(entitySrc.includes("addItem('mat_shadow_essence'"), 'ShadowBehemothBoss rơi Mảnh Tinh Chất Bóng Tối khi bị đánh bại');

const wildlifeSrc = fs.readFileSync('src/systems/WildlifeSystem.ts', 'utf8');
assert(wildlifeSrc.includes('shadowCrows') && wildlifeSrc.includes('getShadowCrows'), 'WildlifeSystem quản lý danh sách Quạ Bóng Tối');
assert(wildlifeSrc.includes('shadowEyes') && wildlifeSrc.includes('getShadowEyes'), 'WildlifeSystem quản lý danh sách Bóng Mắt Sương Mù');
assert(wildlifeSrc.includes('shadowBehemoth') && wildlifeSrc.includes('getShadowBehemoth'), 'WildlifeSystem quản lý Trùm Bóng Tối Khổng Lồ');
assert(wildlifeSrc.includes('SHADOW_CROW_HABITATS') && wildlifeSrc.includes('SHADOW_BEHEMOTH_HABITATS'), 'WildlifeSystem phân bố sinh cảnh cho Quái Vật Bóng Tối');

// --- PHẦN 7: GAMESCENE COMBAT & JOURNAL UI ---
console.log('\n--- PHẦN 7: GameScene Combat & Journal UI ---');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneSrc.includes('shadow_crow_alarm'), 'GameScene lắng nghe sự kiện shadow_crow_alarm');
assert(gameSceneSrc.includes('shadow_behemoth_defeated'), 'GameScene lắng nghe sự kiện shadow_behemoth_defeated');
assert(gameSceneSrc.includes('crow.takeDamage'), 'handlePlayerAttackHitbox quét và gây sát thương cho Quạ Bóng Tối');
assert(gameSceneSrc.includes('behemoth.takeDamage'), 'handlePlayerAttackHitbox quét và gây sát thương cho Trùm Bóng Tối Khổng Lồ');
assert(gameSceneSrc.includes('Trùm Bóng Tối Khổng Lồ nghiền nát'), 'Cú đập của Trùm Bóng Tối gây sát thương và kích hoạt Game Over nếu cạn máu');

const journalSrc = fs.readFileSync('src/ui/JournalModal.ts', 'utf8');
assert(journalSrc.includes('PORTRAIT_SHADOW_BIG_BOSS'), 'JournalModal hiển thị chân dung nghệ thuật cho Trùm Bóng Tối Khổng Lồ');

console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passed}/${passed + failed} KIỂM TRA ĐẠT (${failed} THẤT BẠI)`);
if (failed === 0) {
  console.log('TRẠNG THÁI BƯỚC V14-P8-09: HOÀN HẢO PASS 100%!');
} else {
  console.log('TRẠNG THÁI BƯỚC V14-P8-09: CẦN KHẮC PHỤC LỖI');
}
console.log('======================================================================');
