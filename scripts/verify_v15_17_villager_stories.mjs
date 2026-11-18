import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('KIỂM TRA TỰ ĐỘNG BƯỚC V15-17: MỞ RỘNG TUYẾN TRUYỆN 5 DÂN LÀNG BELLHOLLOW');
console.log('================================================================\n');

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

// -------------------------------------------------------------
// TEST 1: Kiểm toán cú pháp các file JSON
// -------------------------------------------------------------
console.log('1. XÁC THỰC CÚ PHÁP JSON:');

const dialoguesRaw = fs.readFileSync('src/data/dialogues.json', 'utf8');
const loreRaw = fs.readFileSync('src/data/lore.json', 'utf8');
const itemsRaw = fs.readFileSync('src/data/items.json', 'utf8');

let dialogues, lore, items;
try {
  dialogues = JSON.parse(dialoguesRaw);
  assert(true, 'dialogues.json cú pháp JSON hợp lệ 100%');
} catch (e) {
  assert(false, `dialogues.json lỗi cú pháp: ${e.message}`);
}

try {
  lore = JSON.parse(loreRaw);
  assert(true, 'lore.json cú pháp JSON hợp lệ 100%');
} catch (e) {
  assert(false, `lore.json lỗi cú pháp: ${e.message}`);
}

try {
  items = JSON.parse(itemsRaw);
  assert(true, 'items.json cú pháp JSON hợp lệ 100%');
} catch (e) {
  assert(false, `items.json lỗi cú pháp: ${e.message}`);
}

const dMap = dialogues?.dialogues || {};

// -------------------------------------------------------------
// TEST 2: Tuyến truyện Garth – Người Canh Cổng
// -------------------------------------------------------------
console.log('\n2. TUYẾN TRUYỆN GARTH (NGƯỜI CANH CỔNG):');

assert(dMap.garth_east_gate_open !== undefined, 'Tồn tại thoại garth_east_gate_open');
const garthGateChoices = dMap.garth_east_gate_open?.choices || [];
assert(garthGateChoices.some(c => c.nextDialogueKey === 'garth_brother_story'), 'garth_east_gate_open có nhánh chuyển sang garth_brother_story');
assert(garthGateChoices.some(c => c.nextDialogueKey === 'garth_horseman_tactics'), 'garth_east_gate_open có nhánh chuyển sang garth_horseman_tactics');

assert(dMap.garth_brother_story !== undefined, 'Tồn tại thoại garth_brother_story (Kể về em trai Elian)');
assert(dMap.garth_brother_story?.nextQuestId === 'SQ09_BROKEN_LANTERN', 'garth_brother_story kích hoạt nhiệm vụ SQ09_BROKEN_LANTERN');

assert(dMap.garth_broken_lantern_complete !== undefined, 'Tồn tại thoại garth_broken_lantern_complete (Nhận lại kỷ vật đèn vỡ)');
assert(dMap.garth_broken_lantern_complete?.rewardItem === 'item_lantern_oil', 'garth_broken_lantern_complete trao thưởng dầu đèn');

assert(dMap.garth_horseman_tactics !== undefined, 'Tồn tại thoại garth_horseman_tactics (Chiến thuật đối phó Kỵ Binh Hắc Ám)');
assert(dMap.garth_horseman_tactics?.lines?.some(l => l.includes('Dread Horseman')), 'garth_horseman_tactics có nội dung về Dread Horseman');

// -------------------------------------------------------------
// TEST 3: Tuyến truyện Bà lão Edda – Người Giữ Chuông
// -------------------------------------------------------------
console.log('\n3. TUYẾN TRUYỆN BÀ LÃO EDDA (NGƯỜI GIỮ CHUÔNG):');

assert(dMap.edda_reminder_open !== undefined, 'Tồn tại thoại edda_reminder_open');
const eddaOpenChoices = dMap.edda_reminder_open?.choices || [];
assert(eddaOpenChoices.some(c => c.nextDialogueKey === 'edda_bell_shatter_secret'), 'edda_reminder_open có nhánh chuyển sang edda_bell_shatter_secret');
assert(eddaOpenChoices.some(c => c.nextDialogueKey === 'edda_rune_guide'), 'edda_reminder_open có nhánh chuyển sang edda_rune_guide');

assert(dMap.edda_bell_shatter_secret !== undefined, 'Tồn tại thoại edda_bell_shatter_secret (Bí mật đêm Đại Hồng Chung nứt vỡ)');
assert(dMap.edda_bell_shatter_secret?.lines?.some(l => l.includes('7 hồi chuông')), 'edda_bell_shatter_secret ghi nhận 7 hồi chuông cực đại hy sinh cứu làng');

assert(dMap.edda_rune_guide !== undefined, 'Tồn tại thoại edda_rune_guide (Giải mã 3 Cổ Ngữ Runes)');
assert(dMap.edda_rune_guide?.rewardItem === 'eqp_bell_ward_charm', 'edda_rune_guide trao tặng Bùa Chuông Cổ (Bell Ward Charm)');
const eddaRuneFullText = (dMap.edda_rune_guide?.lines || []).join(' ');
assert(eddaRuneFullText.includes('Rad') && eddaRuneFullText.includes('Isa') && eddaRuneFullText.includes('Algiz'), 'edda_rune_guide giải nghĩa đúng 3 cổ ngữ Rad, Isa, Algiz');

// -------------------------------------------------------------
// TEST 4: Tuyến truyện Neris – Người Chữa Thảo Mộc
// -------------------------------------------------------------
console.log('\n4. TUYẾN TRUYỆN NERIS (NGƯỜI CHỮA THẢO MỘC):');

assert(dMap.neris_heal_open !== undefined, 'Tồn tại thoại neris_heal_open');
const nerisHealChoices = dMap.neris_heal_open?.choices || [];
assert(nerisHealChoices.some(c => c.nextDialogueKey === 'neris_fog_sickness_story'), 'neris_heal_open có nhánh chuyển sang neris_fog_sickness_story');
assert(nerisHealChoices.some(c => c.nextDialogueKey === 'neris_quest_root_flower'), 'neris_heal_open có nhánh chuyển sang neris_quest_root_flower');

assert(dMap.neris_fog_sickness_story !== undefined, 'Tồn tại thoại neris_fog_sickness_story (Nỗi trăn trở Hội Chứng Trắng Não)');
assert(dMap.neris_quest_root_flower !== undefined, 'Tồn tại thoại neris_quest_root_flower (Nhiệm vụ tìm Hoa Mạch Rễ)');
assert(dMap.neris_root_flower_complete !== undefined, 'Tồn tại thoại neris_root_flower_complete (Sắc thành công Trà An Thần)');
assert(dMap.neris_root_flower_complete?.rewardItem === 'food_calming_tea', 'neris_root_flower_complete trao thưởng Trà An Thần');

// -------------------------------------------------------------
// TEST 5: Tuyến truyện Bram – Thợ Rèn Làng
// -------------------------------------------------------------
console.log('\n5. TUYẾN TRUYỆN BRAM (THỢ RÈN LÀNG):');

assert(dMap.bram_chat !== undefined, 'Tồn tại thoại bram_chat');
const bramChatChoices = dMap.bram_chat?.choices || [];
assert(bramChatChoices.some(c => c.nextDialogueKey === 'bram_guilt_story'), 'bram_chat có nhánh chuyển sang bram_guilt_story');
assert(bramChatChoices.some(c => c.nextDialogueKey === 'bram_knight_weakness_guide'), 'bram_chat có nhánh chuyển sang bram_knight_weakness_guide');

assert(dMap.bram_guilt_story !== undefined, 'Tồn tại thoại bram_guilt_story (Nỗi tự trách rèn kiếm cho kỵ sĩ tha hóa)');
assert(dMap.bram_knight_weakness_guide !== undefined, 'Tồn tại thoại bram_knight_weakness_guide (Chỉ dẫn phá thế thủ của Fallen Knight)');
assert(dMap.bram_knight_weakness_guide?.lines?.some(l => l.includes('Fallen Knight') && l.includes('choáng váng')), 'bram_knight_weakness_guide hướng dẫn làm choáng kỵ sĩ');

// -------------------------------------------------------------
// TEST 6: Tuyến truyện Cậu bé Finn – Đứa Trẻ Nghe Tiếng Vọng
// -------------------------------------------------------------
console.log('\n6. TUYẾN TRUYỆN FINN (ĐỨA TRẺ NGHE TIẾNG VỌNG):');

assert(dMap.finn_chat !== undefined, 'Tồn tại thoại finn_chat');
const finnChatChoices = dMap.finn_chat?.choices || [];
assert(finnChatChoices.some(c => c.nextDialogueKey === 'finn_whispers_well'), 'finn_chat có nhánh chuyển sang finn_whispers_well');
assert(finnChatChoices.some(c => c.nextDialogueKey === 'finn_secret_caches'), 'finn_chat có nhánh chuyển sang finn_secret_caches');

assert(dMap.finn_whispers_well !== undefined, 'Tồn tại thoại finn_whispers_well (Tiếng thì thầm dưới giếng làng)');
assert(dMap.finn_whispers_well?.lines?.some(l => l.includes('Trái Tim Mạch Rễ')), 'finn_whispers_well nói về nhịp đập Mạch Rễ');

assert(dMap.finn_secret_caches !== undefined, 'Tồn tại thoại finn_secret_caches (Gợi ý vị trí kho báu ẩn và điểm bí mật)');
const finnCachesFullText = (dMap.finn_secret_caches?.lines || []).join(' ');
assert(finnCachesFullText.includes('Hầm Rễ Cổ') && finnCachesFullText.includes('The Echo'), 'finn_secret_caches chỉ dẫn Hầm Rễ và phân biệt The Echo');

// -------------------------------------------------------------
// TEST 7: Kiểm tra Vật phẩm & Side Quest mới
// -------------------------------------------------------------
console.log('\n7. KIỂM TRA VẬT PHẨM & NHIỆM VỤ PHỤ:');

const sq09 = (lore?.sideQuestLog || []).find(q => q.id === 'SQ09_BROKEN_LANTERN');
assert(sq09 !== undefined, 'Tìm thấy nhiệm vụ phụ SQ09_BROKEN_LANTERN trong lore.json');
assert(sq09?.tasks?.length === 3, `SQ09_BROKEN_LANTERN có đúng 3 tasks (thực tế: ${sq09?.tasks?.length})`);

const itemList = items?.items || [];
const brokenLanternItem = itemList.find(i => i.id === 'item_broken_patrol_lantern');
assert(brokenLanternItem !== undefined, 'Tìm thấy vật phẩm item_broken_patrol_lantern trong items.json');

const rootFlowerItem = itemList.find(i => i.id === 'item_root_flower');
assert(rootFlowerItem !== undefined, 'Tìm thấy vật phẩm item_root_flower trong items.json');

const saveManagerSource = fs.readFileSync('src/systems/SaveManager.ts', 'utf8');
assert(saveManagerSource.includes("'item_broken_patrol_lantern'"), 'SaveManager KNOWN_ITEM_KEYS chứa item_broken_patrol_lantern');
assert(saveManagerSource.includes("'item_root_flower'"), 'SaveManager KNOWN_ITEM_KEYS chứa item_root_flower');

const gameSceneSource = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneSource.includes('garth_broken_lantern_complete'), 'GameScene có logic kích hoạt garth_broken_lantern_complete');
assert(gameSceneSource.includes('neris_root_flower_complete'), 'GameScene có logic kích hoạt neris_root_flower_complete');

console.log('\n================================================================');
console.log(`TỔNG KẾT: ${passCount} KIỂM TRA ĐẠT (PASS), ${failCount} KIỂM TRA THẤT BẠI (FAIL)`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
