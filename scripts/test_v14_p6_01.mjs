/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ 3 TIỂU KHU KHÁM PHÁ, NHIỆM VỤ 5 NPC & BESTIARY (V14-P6-01)
 *
 * Kiểm tra 4 trụ cột nghiệp vụ:
 * 1. 3 Tiểu khu khám phá ưu tiên (Xưởng Chuông Bỏ Hoang, Hầm Rễ Cổ, Khoảng Trống Thì Thầm).
 * 2. Vật phẩm & Cổ thư tiểu khu, bảo toàn 100% tính tương thích ngược (SaveManager, Gate 1B).
 * 3. Chuỗi nhiệm vụ phụ liên kết 5 NPC làng Bellhollow (Bram, Edda, Neris, Garth, Finn).
 * 4. Sổ tay sinh vật (Bestiary 4 loài) & Bản đồ thế giới 13 vùng trong JournalModal.
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
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ KHÁM PHÁ, NHIỆM VỤ & BESTIARY (V14-P6-01)');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: 3 Tiểu khu khám phá ưu tiên (Sub-areas)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: 3 Tiểu khu khám phá ưu tiên (Sub-areas) ---');

const typesPath = path.resolve('src/types/index.ts');
const typesCode = fs.readFileSync(typesPath, 'utf-8');
const zonesJsonRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf-8'));
const zonesList = zonesJsonRaw.zones;
const contentRegistryRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/content_registry.json'), 'utf-8'));
const contentRegistryEntries = contentRegistryRaw.entries;
const worldGatingCode = fs.readFileSync(path.resolve('src/world/WorldGatingSystem.ts'), 'utf-8');
const worldBuilderCode = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf-8');

// 1.1 Kiểm tra ZoneId định nghĩa đủ 3 tiểu khu
assert(typesCode.includes("'sub_bell_workshop'"), 'types/index.ts chứa ZoneId sub_bell_workshop');
assert(typesCode.includes("'sub_root_cellar'"), 'types/index.ts chứa ZoneId sub_root_cellar');
assert(typesCode.includes("'sub_whispering_clearing'"), 'types/index.ts chứa ZoneId sub_whispering_clearing');

// 1.2 Kiểm tra Content Registry đăng ký Content ID chuẩn V1.4
const regBell = contentRegistryEntries.find(z => z.runtimeKey === 'sub_bell_workshop');
const regRoot = contentRegistryEntries.find(z => z.runtimeKey === 'sub_root_cellar');
const regEcho = contentRegistryEntries.find(z => z.runtimeKey === 'sub_whispering_clearing');
assert(regBell && regBell.id === 'HW-ZON-SUB-000001', 'ContentRegistry đăng ký sub_bell_workshop (HW-ZON-SUB-000001)');
assert(regRoot && regRoot.id === 'HW-ZON-SUB-000002', 'ContentRegistry đăng ký sub_root_cellar (HW-ZON-SUB-000002)');
assert(regEcho && regEcho.id === 'HW-ZON-SUB-000003', 'ContentRegistry đăng ký sub_whispering_clearing (HW-ZON-SUB-000003)');

// 1.3 Cấu trúc vùng dữ liệu zones.json
const subBell = zonesList.find(z => z.id === 'sub_bell_workshop');
const subRoot = zonesList.find(z => z.id === 'sub_root_cellar');
const subEcho = zonesList.find(z => z.id === 'sub_whispering_clearing');
assert(subBell && subBell.name.includes('Abandoned Bell Workshop'), 'zones.json chứa sub_bell_workshop ("Abandoned Bell Workshop")');
assert(subRoot && subRoot.name.includes('Root Cellar'), 'zones.json chứa sub_root_cellar ("Root Cellar")');
assert(subEcho && subEcho.name.includes('Whispering Clearing'), 'zones.json chứa sub_whispering_clearing ("Whispering Clearing")');

// 1.4 Lối chuyển tiếp 2 chiều (Bidirectional transitions)
const ow = zonesList.find(z => z.id === 'outer_woods');
const sf = zonesList.find(z => z.id === 'sanctuary_farm');
const df = zonesList.find(z => z.id === 'deep_forest');

const outerWoodsTrans = ow?.transitions?.find(t => t.toZone === 'sub_bell_workshop');
const farmTrans = sf?.transitions?.find(t => t.toZone === 'sub_root_cellar');
const deepForestTrans = df?.transitions?.find(t => t.toZone === 'sub_whispering_clearing');
assert(outerWoodsTrans, 'Outer Woods có điểm chuyển tiếp to_bell_workshop dẫn vào Xưởng Chuông');
assert(farmTrans, 'Sanctuary Farm có điểm chuyển tiếp to_root_cellar dẫn vào Hầm Rễ Cổ');
assert(deepForestTrans, 'Deep Forest có điểm chuyển tiếp to_whispering_clearing dẫn vào Khoảng Trống Thì Thầm');

const backBell = subBell?.transitions?.find(t => t.toZone === 'outer_woods');
const backRoot = subRoot?.transitions?.find(t => t.toZone === 'sanctuary_farm');
const backEcho = subEcho?.transitions?.find(t => t.toZone === 'deep_forest');
assert(backBell, 'Xưởng Chuông có lối trở về Outer Woods');
assert(backRoot, 'Hầm Rễ Cổ có lối trở về Sanctuary Farm');
assert(backEcho, 'Khoảng Trống Thì Thầm có lối trở về Deep Forest');

// 1.5 Kiểm tra WorldGatingSystem
assert(worldGatingCode.includes("zoneId: 'sub_bell_workshop'") && worldGatingCode.includes("'LAYER_1_CORE'"), 'WorldGatingSystem cấu hình sub_bell_workshop thuộc LAYER_1_CORE');
assert(worldGatingCode.includes("zoneId: 'sub_root_cellar'") && worldGatingCode.includes("'LAYER_1_CORE'"), 'WorldGatingSystem cấu hình sub_root_cellar thuộc LAYER_1_CORE');
assert(worldGatingCode.includes("zoneId: 'sub_whispering_clearing'") && worldGatingCode.includes("'LAYER_2_FRONTIER'"), 'WorldGatingSystem cấu hình sub_whispering_clearing thuộc LAYER_2_FRONTIER');

// 1.6 Kiểm tra WorldBuilder rendering hooks
assert(worldBuilderCode.includes('renderSubBellWorkshopTerrain') && worldBuilderCode.includes('renderSubBellWorkshopDecorations'), 'WorldBuilder có hàm vẽ địa hình và chi tiết Xưởng Chuông');
assert(worldBuilderCode.includes('renderSubRootCellarTerrain') && worldBuilderCode.includes('renderSubRootCellarDecorations'), 'WorldBuilder có hàm vẽ địa hình và chi tiết Hầm Rễ Cổ');
assert(worldBuilderCode.includes('renderSubWhisperingClearingTerrain') && worldBuilderCode.includes('renderSubWhisperingClearingDecorations'), 'WorldBuilder có hàm vẽ địa hình và chi tiết Khoảng Trống Thì Thầm');


// -----------------------------------------------------------------------------
// PHẦN 2: Vật phẩm, Cổ thư & Bảo toàn Save (Items, Lore & Backward Compatibility)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Vật phẩm, Cổ thư & Bảo toàn Save ---');

const itemsJsonRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/items.json'), 'utf-8'));
const itemsList = itemsJsonRaw.items;
const loreJson = JSON.parse(fs.readFileSync(path.resolve('src/data/lore.json'), 'utf-8'));
const saveManagerCode = fs.readFileSync(path.resolve('src/systems/SaveManager.ts'), 'utf-8');

// 2.1 Vật phẩm mới trong items.json
const bellMold = itemsList.find(i => i.id === 'item_bell_mold');
const medicinalRoots = itemsList.find(i => i.id === 'item_medicinal_roots');
assert(bellMold && bellMold.category === 'quest', 'items.json chứa item_bell_mold (Quest Item)');
assert(medicinalRoots && medicinalRoots.category === 'material', 'items.json chứa item_medicinal_roots (Material Item)');

// 2.2 Cổ thư tiểu khu và Gate 1B protection
assert(loreJson.loreEntries.length === 4, 'Gate 1B: loreEntries chuẩn đúng chính xác 4 mục kinh điển');
assert(loreJson.questLog.length === 7, 'Gate 1B: questLog chuẩn đúng chính xác 7 mục kinh điển');
assert(Array.isArray(loreJson.subAreaLoreEntries) && loreJson.subAreaLoreEntries.length >= 2, 'lore.json bổ sung subAreaLoreEntries cho các tiểu khu mới');
assert(loreJson.subAreaLoreEntries.some(l => l.id === 'lore_blacksmith_journal'), 'subAreaLoreEntries chứa Nhật ký Thợ rèn (lore_blacksmith_journal)');
assert(loreJson.subAreaLoreEntries.some(l => l.id === 'lore_fog_origin'), 'subAreaLoreEntries chứa Bích họa Nguồn gốc Màn Sương (lore_fog_origin)');

// 2.3 SaveManager bảo toàn KNOWN_ITEM_KEYS
assert(saveManagerCode.includes("'item_bell_mold'") && saveManagerCode.includes("'item_medicinal_roots'"), 'SaveManager KNOWN_ITEM_KEYS chứa item_bell_mold và item_medicinal_roots');
assert(saveManagerCode.includes('observedCreatures: Array.from(state.bestiary.values())'), 'SaveManager serialize observedCreatures khi lưu game');
assert(saveManagerCode.includes('state.observeCreature(sp as any)'), 'SaveManager khôi phục observedCreatures khi tải game');


// -----------------------------------------------------------------------------
// PHẦN 3: Chuỗi Nhiệm Vụ 5 NPC Làng Bellhollow (Side Quests)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Chuỗi Nhiệm Vụ 5 NPC Làng Bellhollow ---');

const dialoguesJsonRaw = JSON.parse(fs.readFileSync(path.resolve('src/data/dialogues.json'), 'utf-8'));
const dialoguesMap = dialoguesJsonRaw.dialogues;
const playerStateCode = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf-8');
const gameSceneCode = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');

// 3.1 Side quests trong lore.json
assert(Array.isArray(loreJson.sideQuestLog) && loreJson.sideQuestLog.length === 5, 'lore.json chứa đủ 5 nhiệm vụ phụ trong sideQuestLog');
const sqBram = loreJson.sideQuestLog.find(q => q.id === 'SQ01_RUNED_IRON');
const sqEdda = loreJson.sideQuestLog.find(q => q.id === 'SQ02_BELL_MEMORY');
const sqNeris = loreJson.sideQuestLog.find(q => q.id === 'SQ03_CELLAR_TEA');
const sqGarth = loreJson.sideQuestLog.find(q => q.id === 'SQ04_CLEARING_PATROL');
const sqFinn = loreJson.sideQuestLog.find(q => q.id === 'SQ05_FINN_INTEL');

assert(sqBram && sqBram.description.includes('Bram') && sqBram.category === 'side', 'Nhiệm vụ SQ01_RUNED_IRON gắn với Bram');
assert(sqEdda && sqEdda.description.includes('Edda') && sqEdda.category === 'side', 'Nhiệm vụ SQ02_BELL_MEMORY gắn với Edda');
assert(sqNeris && (sqNeris.description.includes('Neris') || sqNeris.title.includes('DƯỢC LIỆU')) && sqNeris.category === 'side', 'Nhiệm vụ SQ03_CELLAR_TEA gắn với Neris và Dược Liệu Hầm Rễ');
assert(sqGarth && sqGarth.title.includes('THÌ THẦM') && sqGarth.category === 'side', 'Nhiệm vụ SQ04_CLEARING_PATROL gắn với Garth');
assert(sqFinn && sqFinn.description.includes('Finn') && sqFinn.category === 'side', 'Nhiệm vụ SQ05_FINN_INTEL gắn với Finn');

// 3.2 Thoại NPC mới trong dialogues.json
assert(dialoguesMap.bram_quest_runed_iron, 'dialogues.json chứa hội thoại bram_quest_runed_iron');
assert(dialoguesMap.edda_quest_bell_memory, 'dialogues.json chứa hội thoại edda_quest_bell_memory');
assert(dialoguesMap.neris_quest_cellar_tea, 'dialogues.json chứa hội thoại neris_quest_cellar_tea');
assert(dialoguesMap.garth_quest_clearing_patrol, 'dialogues.json chứa hội thoại garth_quest_clearing_patrol');
assert(dialoguesMap.finn_rumors, 'dialogues.json chứa hội thoại finn_rumors');

// 3.3 Tích hợp kích hoạt hội thoại và hoàn thành quest trong GameScene
assert(gameSceneCode.includes('bram_quest_runed_iron') && gameSceneCode.includes('SQ01_RUNED_IRON'), 'GameScene tích hợp hội thoại và hoàn thành SQ01 cho Bram');
assert(gameSceneCode.includes('edda_quest_bell_memory') && gameSceneCode.includes('SQ02_BELL_MEMORY'), 'GameScene tích hợp hội thoại và hoàn thành SQ02 cho Edda');
assert(gameSceneCode.includes('neris_quest_cellar_tea') && gameSceneCode.includes('SQ03_CELLAR_TEA'), 'GameScene tích hợp hội thoại và nấu trà hoàn thành SQ03 cho Neris');
assert(gameSceneCode.includes('garth_quest_clearing_patrol') && gameSceneCode.includes('eqp_trail_boots'), 'GameScene thưởng Ủng Đi Rừng (eqp_trail_boots) khi xong nhiệm vụ Garth');
assert(gameSceneCode.includes('finn_rumors') && gameSceneCode.includes('SQ05_FINN_INTEL'), 'GameScene tích hợp lời đồn thám thính và mở SQ05 cho Finn');

// 3.4 PlayerState hỗ trợ lọc nhiệm vụ Chính / Phụ
assert(playerStateCode.includes('getQuestsByCategory(category:'), 'PlayerState có phương thức getQuestsByCategory');


// -----------------------------------------------------------------------------
// PHẦN 4: Sổ Tay Sinh Vật (Bestiary) & Bản Đồ Thế Giới (JournalModal.ts)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Sổ Tay Sinh Vật (Bestiary) & Bản Đồ Thế Giới ---');

const journalModalCode = fs.readFileSync(path.resolve('src/ui/JournalModal.ts'), 'utf-8');

// 4.1 Định nghĩa Bestiary trong types/index.ts & PlayerState
assert(typesCode.includes("export type BestiarySpecies = 'crow' | 'lantern_moth' | 'echo' | 'listener'"), 'Định nghĩa 4 loài BestiarySpecies: crow, lantern_moth, echo, listener');
assert(typesCode.includes('export interface BestiaryEntry'), 'Định nghĩa BestiaryEntry');
assert(playerStateCode.includes('private initDefaultBestiary()'), 'PlayerState khởi tạo sổ tay mặc định với 4 loài');
assert(playerStateCode.includes('public observeCreature(species: BestiarySpecies)'), 'PlayerState có phương thức observeCreature()');
assert(playerStateCode.includes('public isCreatureObserved(species: BestiarySpecies): boolean'), 'PlayerState có phương thức isCreatureObserved()');

// 4.2 Tự động quan sát sinh vật theo vùng trong GameScene
assert(gameSceneCode.includes('public triggerCreatureObservationsForZone(zoneId: string)'), 'GameScene có triggerCreatureObservationsForZone');
assert(gameSceneCode.includes("observeCreature('crow')"), 'Tự động mở khóa Crow khi vào Outer Woods / Crooked Path');
assert(gameSceneCode.includes("observeCreature('lantern_moth')"), 'Tự động mở khóa Lantern Moth khi vào Deep Forest / Silent Mire');
assert(gameSceneCode.includes("observeCreature('echo')"), 'Tự động mở khóa Echo khi vào Whispering Clearing');
assert(gameSceneCode.includes("observeCreature('listener')"), 'Tự động mở khóa The Listener khi vào Lãnh địa rừng');

// 4.3 Tab 1 Nhiệm Vụ trong JournalModal: lọc Chính / Phụ và chọn chi tiết
assert(journalModalCode.includes("'[TẤT CẢ]'") && journalModalCode.includes("'[CHÍNH]'") && journalModalCode.includes("'[PHỤ]'"), 'JournalModal Tab 1 có đủ 3 nút lọc [TẤT CẢ], [CHÍNH], [PHỤ]');
assert(journalModalCode.includes("questFilter: 'all' | 'main' | 'side'"), 'JournalModal quản lý trạng thái lọc questFilter');
assert(journalModalCode.includes('selectedQuestId: string | null = null'), 'JournalModal hỗ trợ click chọn nhiệm vụ để xem mục tiêu chi tiết');

// 4.4 Tab 2 Cổ Thư & Manh Mối: Cổ thư modulo pagination & Sổ tay sinh vật
assert(journalModalCode.includes('[📜 CỔ THƯ & MANH MỐI]') && journalModalCode.includes('[🐾 SỔ TAY SINH VẬT'), 'JournalModal Tab 2 có 2 chế độ hiển thị con Cổ Thư và Sổ Tay Sinh Vật');
assert(journalModalCode.includes('(this.currentLoreIndex - 1 + list.length) % list.length') && journalModalCode.includes('(this.currentLoreIndex + 1) % list.length'), 'JournalModal bảo toàn thuật toán phân trang Modulo chính xác cho Gate 1B');
assert(journalModalCode.includes('renderBestiaryView'), 'JournalModal có hàm renderBestiaryView hiển thị thông tin 4 loài');
assert(journalModalCode.includes('ĐÃ GHI CHÉP VÀO SỔ TAY') && journalModalCode.includes('CHƯA QUAN SÁT TRỰC TIẾP'), 'Sổ tay hiển thị rõ ràng nhãn quan sát');

// 4.5 Tab 3 Bản Đồ Thế Giới: Hiển thị 10 vùng canon + 3 tiểu khu mới
assert(journalModalCode.includes("'sub_bell_workshop'") && journalModalCode.includes("'sub_root_cellar'") && journalModalCode.includes("'sub_whispering_clearing'"), 'Bản đồ thế giới hiển thị 3 tiểu khu mới trên đồ thị tọa độ');
assert(journalModalCode.includes('getShortZoneName'), 'JournalModal có phương thức rút gọn tên vùng cho các tiểu khu mới');
assert(journalModalCode.includes("'Xưởng Chuông'") && journalModalCode.includes("'Hầm Rễ'") && journalModalCode.includes("'Thì Thầm'"), 'Bản đồ hiển thị tên viết tắt tiếng Việt chuẩn đẹp');

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
