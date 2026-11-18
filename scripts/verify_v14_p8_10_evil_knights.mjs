/**
 * HOLLOW WOODS V1.4 — KIỂM THỬ TÍCH HỢP NHÓM HIỆP SĨ TÀ ÁC (EVIL KNIGHTS FACTION)
 * Bước V14-P8-10: Hiệp Sĩ Sa Ngã, Kỵ Binh Hắc Ám & Chỉ Huy Hiệp Sĩ Trùm Mũ
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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC V14-P8-10: HIỆP SĨ TÀ ÁC');
console.log('======================================================================\n');

// --- PHẦN 1: TÀI NGUYÊN ĐỒ HỌA CHUẨN HÓA (ASSET NORMALIZATION) ---
console.log('--- PHẦN 1: Kiểm Tra Tài Nguyên Đồ Họa Chuẩn Hóa ---');
const fallenSheetPath = path.resolve('public/assets/characters/enemies/fallen_knight_sheet.png');
const fallenPortPath = path.resolve('public/assets/characters/enemies/portrait_fallen_knight.png');
const dreadSheetPath = path.resolve('public/assets/characters/enemies/dread_horseman_sheet.png');
const dreadPortPath = path.resolve('public/assets/characters/enemies/portrait_dread_horseman.png');
const hoodedSheetPath = path.resolve('public/assets/characters/bosses/hooded_knight_sheet.png');
const hoodedPortPath = path.resolve('public/assets/characters/bosses/portrait_hooded_knight.png');

assert(fs.existsSync(fallenSheetPath), 'Tệp fallen_knight_sheet.png tồn tại');
if (fs.existsSync(fallenSheetPath)) {
  const buf = fs.readFileSync(fallenSheetPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 512 && h === 384, `Spritesheet Hiệp Sĩ Sa Ngã chuẩn 512x384 px (8x6 64x64 cells) [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(fallenPortPath), 'Tệp portrait_fallen_knight.png tồn tại');
if (fs.existsSync(fallenPortPath)) {
  const buf = fs.readFileSync(fallenPortPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 64 && h === 64, `Chân dung Hiệp Sĩ Sa Ngã chuẩn 64x64 px [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(dreadSheetPath), 'Tệp dread_horseman_sheet.png tồn tại');
if (fs.existsSync(dreadSheetPath)) {
  const buf = fs.readFileSync(dreadSheetPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 448 && h === 384, `Spritesheet Kỵ Binh Hắc Ám chuẩn 448x384 px (7x6 64x64 cells) [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(dreadPortPath), 'Tệp portrait_dread_horseman.png tồn tại');
if (fs.existsSync(dreadPortPath)) {
  const buf = fs.readFileSync(dreadPortPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 64 && h === 64, `Chân dung Kỵ Binh Hắc Ám chuẩn 64x64 px [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(hoodedSheetPath), 'Tệp hooded_knight_sheet.png tồn tại');
if (fs.existsSync(hoodedSheetPath)) {
  const buf = fs.readFileSync(hoodedSheetPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 3040 && h === 640, `Spritesheet Chỉ Huy Hiệp Sĩ Trùm Mũ chuẩn 3040x640 px (19x4 160x160 cells) [Thực tế: ${w}x${h}]`);
}

assert(fs.existsSync(hoodedPortPath), 'Tệp portrait_hooded_knight.png tồn tại');
if (fs.existsSync(hoodedPortPath)) {
  const buf = fs.readFileSync(hoodedPortPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  assert(w === 64 && h === 64, `Chân dung Chỉ Huy Hiệp Sĩ chuẩn 64x64 px [Thực tế: ${w}x${h}]`);
}

// --- PHẦN 2: CONTENT REGISTRY & ITEMS REGISTRATION ---
console.log('\n--- PHẦN 2: Kiểm Tra Đăng Ký ContentRegistry & Bảng Vật Phẩm ---');
const contentRegistryJson = JSON.parse(fs.readFileSync('src/data/content_registry.json', 'utf8'));
const registryDataTs = fs.readFileSync('src/registry/registryData.ts', 'utf8');
const itemsJson = JSON.parse(fs.readFileSync('src/data/items.json', 'utf8'));

// Kiểm tra Assets trong ContentRegistry
const assetIds = contentRegistryJson.assets.map(a => a.assetId);
assert(assetIds.includes('HW-AST-CHAR-FALLENKNIGHT'), 'Đã đăng ký HW-AST-CHAR-FALLENKNIGHT trong content_registry.json');
assert(assetIds.includes('HW-AST-PORT-FALLENKNIGHT'), 'Đã đăng ký HW-AST-PORT-FALLENKNIGHT trong content_registry.json');
assert(assetIds.includes('HW-AST-CHAR-DREADHORSE'), 'Đã đăng ký HW-AST-CHAR-DREADHORSE trong content_registry.json');
assert(assetIds.includes('HW-AST-PORT-DREADHORSE'), 'Đã đăng ký HW-AST-PORT-DREADHORSE trong content_registry.json');
assert(assetIds.includes('HW-AST-CHAR-HOODEDKNIGHT'), 'Đã đăng ký HW-AST-CHAR-HOODEDKNIGHT trong content_registry.json');
assert(assetIds.includes('HW-AST-PORT-HOODEDKNIGHT'), 'Đã đăng ký HW-AST-PORT-HOODEDKNIGHT trong content_registry.json');

// Kiểm tra Entries trong ContentRegistry
const entryIds = contentRegistryJson.entries.map(e => e.id);
assert(entryIds.includes('HW-MON-KNIGHT-000001'), 'Đã đăng ký Quái vật HW-MON-KNIGHT-000001 (Hiệp Sĩ Sa Ngã)');
assert(entryIds.includes('HW-MON-KNIGHT-000002'), 'Đã đăng ký Quái vật HW-MON-KNIGHT-000002 (Kỵ Binh Hắc Ám)');
assert(entryIds.includes('HW-MON-BOSS-000002'), 'Đã đăng ký Boss HW-MON-BOSS-000002 (Chỉ Huy Hiệp Sĩ Trùm Mũ)');
assert(entryIds.includes('HW-ITM-QST-000002'), 'Đã đăng ký Vật phẩm nhiệm vụ HW-ITM-QST-000002 (Huy Hiệu Hiệp Sĩ Tha Hóa)');

// Kiểm tra tính đồng bộ trong registryData.ts
assert(registryDataTs.includes('HW-MON-KNIGHT-000001'), 'registryData.ts đồng bộ HW-MON-KNIGHT-000001');
assert(registryDataTs.includes('HW-MON-KNIGHT-000002'), 'registryData.ts đồng bộ HW-MON-KNIGHT-000002');
assert(registryDataTs.includes('HW-MON-BOSS-000002'), 'registryData.ts đồng bộ HW-MON-BOSS-000002');
assert(registryDataTs.includes('HW-ITM-QST-000002'), 'registryData.ts đồng bộ HW-ITM-QST-000002');

// Kiểm tra items.json
const itemIds = itemsJson.items.map(i => i.id);
assert(itemIds.includes('quest_corrupted_crest'), 'items.json chứa vật phẩm quest_corrupted_crest');
const recipeIds = itemsJson.recipes.map(r => r.id);
assert(recipeIds.includes('craft_purified_crest_ward'), 'items.json chứa công thức craft_purified_crest_ward');

// --- PHẦN 3: TYPES & BESTIARY ECOSYSTEM ---
console.log('\n--- PHẦN 3: Kiểm Tra Hệ Thống Sinh Thái Sổ Tay Bestiary ---');
const typesTs = fs.readFileSync('src/types/index.ts', 'utf8');
const playerStateTs = fs.readFileSync('src/state/PlayerState.ts', 'utf8');

assert(typesTs.includes("'fallen_knight'"), "BestiarySpecies chứa 'fallen_knight'");
assert(typesTs.includes("'dread_horseman'"), "BestiarySpecies chứa 'dread_horseman'");
assert(typesTs.includes("'hooded_knight'"), "BestiarySpecies chứa 'hooded_knight'");

assert(playerStateTs.includes("this.bestiary.set('fallen_knight'"), "PlayerState đăng ký Bestiary cho 'fallen_knight'");
assert(playerStateTs.includes("this.bestiary.set('dread_horseman'"), "PlayerState đăng ký Bestiary cho 'dread_horseman'");
assert(playerStateTs.includes("this.bestiary.set('hooded_knight'"), "PlayerState đăng ký Bestiary cho 'hooded_knight'");

// --- PHẦN 4: HIỆU ỨNG ÂM THANH MÃ NGUỒN MỞ PROCEDURAL WEB AUDIO ---
console.log('\n--- PHẦN 4: Kiểm Tra Âm Thanh Procedural Web Audio ---');
const audioManagerTs = fs.readFileSync('src/audio/AudioManager.ts', 'utf8');

assert(audioManagerTs.includes('public playArmorClank()'), 'AudioManager có hàm playArmorClank()');
assert(audioManagerTs.includes('public playHorseCharge()'), 'AudioManager có hàm playHorseCharge()');
assert(audioManagerTs.includes('public playKnightSwordSlash()'), 'AudioManager có hàm playKnightSwordSlash()');
assert(audioManagerTs.includes('public playKnightPowerup()'), 'AudioManager có hàm playKnightPowerup()');
assert(audioManagerTs.includes('public playKnightDefeat()'), 'AudioManager có hàm playKnightDefeat()');

// --- PHẦN 5: ENTITY IMPLEMENTATION & AN TOÀN SAFE ZONE ---
console.log('\n--- PHẦN 5: Kiểm Tra Mã Thực Thể EvilKnights.ts & Safe Zone ---');
const evilKnightsTs = fs.readFileSync('src/entities/EvilKnights.ts', 'utf8');

assert(evilKnightsTs.includes('export class FallenKnightEntity'), 'Tồn tại FallenKnightEntity');
assert(evilKnightsTs.includes('export class DreadHorsemanEntity'), 'Tồn tại DreadHorsemanEntity');
assert(evilKnightsTs.includes('export class HoodedKnightBoss'), 'Tồn tại HoodedKnightBoss');

assert(evilKnightsTs.includes('isPlayerInSafeZone'), 'Thực thể kiểm tra điều kiện isPlayerInSafeZone');
assert(evilKnightsTs.includes('fallen_knight_pray'), 'FallenKnight có hoạt ảnh pray (cầu nguyện)');
assert(evilKnightsTs.includes('dread_horseman_rear'), 'DreadHorseman có hoạt ảnh rear (giương vó hí vang)');
assert(evilKnightsTs.includes('hooded_knight_powerup'), 'HoodedKnightBoss có hoạt ảnh powerup (tụ tà khí)');
assert(evilKnightsTs.includes('hooded_knight_stagger'), 'HoodedKnightBoss có hoạt ảnh stagger (choáng váng sơ hở)');
assert(evilKnightsTs.includes('interruptPowerup'), 'HoodedKnightBoss có cơ chế bị ngắt chiêu interruptPowerup()');

// --- PHẦN 6: WILDLIFESYSTEM & GAMESCENE HOOKS ---
console.log('\n--- PHẦN 6: Kiểm Tra Tích Hợp WildlifeSystem & GameScene ---');
const wildlifeSystemTs = fs.readFileSync('src/systems/WildlifeSystem.ts', 'utf8');
const gameSceneTs = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
const journalModalTs = fs.readFileSync('src/ui/JournalModal.ts', 'utf8');

assert(wildlifeSystemTs.includes('FALLEN_KNIGHT_HABITATS'), 'WildlifeSystem có cấu hình sinh cảnh FALLEN_KNIGHT_HABITATS');
assert(wildlifeSystemTs.includes('DREAD_HORSEMAN_HABITATS'), 'WildlifeSystem có cấu hình sinh cảnh DREAD_HORSEMAN_HABITATS');
assert(wildlifeSystemTs.includes('HOODED_KNIGHT_HABITATS'), 'WildlifeSystem có cấu hình sinh cảnh HOODED_KNIGHT_HABITATS');
assert(wildlifeSystemTs.includes('getFallenKnights()'), 'WildlifeSystem có getter getFallenKnights()');
assert(wildlifeSystemTs.includes('getDreadHorsemen()'), 'WildlifeSystem có getter getDreadHorsemen()');
assert(wildlifeSystemTs.includes('getHoodedKnight()'), 'WildlifeSystem có getter getHoodedKnight()');

assert(gameSceneTs.includes('fallen_knight_defeated'), 'GameScene lắng nghe sự kiện fallen_knight_defeated');
assert(gameSceneTs.includes('dread_horseman_defeated'), 'GameScene lắng nghe sự kiện dread_horseman_defeated');
assert(gameSceneTs.includes('hooded_knight_defeated'), 'GameScene lắng nghe sự kiện hooded_knight_defeated');
assert(gameSceneTs.includes('getFallenKnights()'), 'GameScene kiểm tra va chạm & tấn công FallenKnights');
assert(gameSceneTs.includes('getDreadHorsemen()'), 'GameScene kiểm tra va chạm & tấn công DreadHorsemen');
assert(gameSceneTs.includes('getHoodedKnight()'), 'GameScene kiểm tra va chạm & tấn công HoodedKnightBoss');

assert(journalModalTs.includes('PORTRAIT_FALLEN_KNIGHT'), 'JournalModal hỗ trợ vẽ chân dung PORTRAIT_FALLEN_KNIGHT');
assert(journalModalTs.includes('PORTRAIT_DREAD_HORSEMAN'), 'JournalModal hỗ trợ vẽ chân dung PORTRAIT_DREAD_HORSEMAN');
assert(journalModalTs.includes('PORTRAIT_HOODED_KNIGHT'), 'JournalModal hỗ trợ vẽ chân dung PORTRAIT_HOODED_KNIGHT');

console.log('\n======================================================================');
console.log(`   TỔNG KẾT: ${passed} / ${passed + failed} BÀI KIỂM THỬ ĐẠT (PASS)`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
}
