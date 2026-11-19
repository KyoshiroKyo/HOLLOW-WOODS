/**
 * HOLLOW WOODS V1.5 - BƯỚC V15-32 TEST SUITE
 * Kiểm tra nghiệm thu khóa sổ:
 * 1. Lời thoại bình yên bên đốm lửa của Sir Vaelen — Kỵ Sĩ Trầm Mặc.
 * 2. Đồng bộ chuỗi 3 nhiệm vụ tiến trình (SQ06, SQ07, SQ08).
 * 3. Đồng bộ tiến trình Thức Tỉnh Ký Ức Hiệp Sĩ Đen (Black Knight Awakening).
 * 4. Đồng bộ vật phẩm và sự kiện liên quan.
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

console.log('=== BẮT ĐẦU KIỂM THỬ V15-32: PEACEFUL DIALOGUE, KNIGHT QUESTS & BLACK KNIGHT AWAKENING ===\n');

// 1. Kiểm tra lời thoại mở đầu trong dialogues.json
console.log('1. Kiểm tra lời thoại mở đầu bình yên trong dialogues.json:');
const dialogues = JSON.parse(fs.readFileSync(path.resolve('src/data/dialogues.json'), 'utf-8'));
const intro = dialogues.dialogues?.campfire_knight_intro;

assert(intro !== undefined, 'Hội thoại campfire_knight_intro tồn tại trong dialogues.json');
assert(intro?.speaker === 'Sir Vaelen — Kỵ Sĩ Trầm Mặc', 'Người nói là "Sir Vaelen — Kỵ Sĩ Trầm Mặc"');
assert(intro?.portrait === 'portrait_campfire_knight', 'Chân dung hội thoại là portrait_campfire_knight');

const expectedGreeting = "Chào mừng, lữ khách. Hãy dừng chân nghỉ ngơi bên đốm lửa này một lát... Bạn đang ở một nơi an toàn rồi. Không ai phán xét một kẻ lữ hành mệt mỏi cần chút hơi ấm giữa khu rừng sương lạnh này đâu.";
assert(intro?.lines?.[0] === expectedGreeting, 'Lời chào mở đầu chính xác từng ký tự theo yêu cầu V15-32 mang lại cảm giác bình yên, an toàn');

// 2. Kiểm tra chuỗi 3 nhiệm vụ tiến trình trong lore.json
console.log('\n2. Kiểm tra chuỗi 3 nhiệm vụ tiến trình trong lore.json:');
const lore = JSON.parse(fs.readFileSync(path.resolve('src/data/lore.json'), 'utf-8'));
const sq06 = lore.sideQuestLog?.find(q => q.id === 'SQ06_KEEP_FIRE');
const sq07 = lore.sideQuestLog?.find(q => q.id === 'SQ07_LOST_COMRADES');
const sq08 = lore.sideQuestLog?.find(q => q.id === 'SQ08_PURIFY_FALLEN');

assert(sq06 && sq06.description.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'SQ06 (Giữ Lửa Trong Sương) nhắc đúng tên Sir Vaelen — Kỵ Sĩ Trầm Mặc trong mô tả');
assert(sq06 && sq06.description.includes('Trạm Lửa Rừng Tĩnh Lặng'), 'SQ06 nhắc đúng Trạm Lửa Rừng Tĩnh Lặng tại Outer Woods');
assert(sq06 && sq06.tasks?.some(t => t.text.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc')), 'SQ06 task t3 yêu cầu báo cáo với Sir Vaelen — Kỵ Sĩ Trầm Mặc');

assert(sq07 && sq07.description.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'SQ07 (Dấu Vết Đồng Đội Cũ) nhắc đúng tên Sir Vaelen — Kỵ Sĩ Trầm Mặc trong mô tả');
assert(sq07 && sq07.tasks?.some(t => t.text.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc')), 'SQ07 task t3 yêu cầu mang kỷ vật trao cho Sir Vaelen — Kỵ Sĩ Trầm Mặc');

assert(sq08 && sq08.description.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'SQ08 (Giải Thoát Cho Những Kẻ Tha Hóa) nhắc đúng tên Sir Vaelen — Kỵ Sĩ Trầm Mặc trong mô tả');
assert(sq08 && sq08.tasks?.some(t => t.text.includes('Sir Vaelen')), 'SQ08 task t3 yêu cầu mang huy hiệu về cho Sir Vaelen thanh tẩy');

// 3. Kiểm tra các mục Lore & Hồi ức Thức Tỉnh Ký Ức
console.log('\n3. Kiểm tra các mục Lore & Hồi ức Thức Tỉnh Ký Ức trong lore.json:');
const vowLore = lore.loreEntries?.find(l => l.id === 'lore_campfire_knight_vow');
const memory2 = lore.loreEntries?.find(l => l.id === 'lore_memory_chapter_2');
const memory4 = lore.loreEntries?.find(l => l.id === 'lore_memory_chapter_4');
const innerJournal = lore.loreEntries?.find(l => l.id === 'lore_wayfarer_inner_journal');

assert(vowLore && vowLore.author === 'Sir Vaelen — Kỵ Sĩ Trầm Mặc', 'lore_campfire_knight_vow có tác giả là Sir Vaelen — Kỵ Sĩ Trầm Mặc');
assert(vowLore && vowLore.content.includes('Trạm Lửa Rừng Tĩnh Lặng'), 'lore_campfire_knight_vow nhắc đến Trạm Lửa Rừng Tĩnh Lặng');

assert(memory2 && memory2.content.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'Hồi ức II nhắc đúng chỉ dẫn của Sir Vaelen — Kỵ Sĩ Trầm Mặc');
assert(memory4 && memory4.content.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'Hồi ức IV nhắc đúng Sir Vaelen — Kỵ Sĩ Trầm Mặc phủ phục bái kiến Chỉ Huy Hiệp Sĩ Đen');
assert(innerJournal && innerJournal.content.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'Nhật ký lữ khách nhắc đúng ngọn lửa của Sir Vaelen — Kỵ Sĩ Trầm Mặc');

// 4. Kiểm tra các đoạn hội thoại liên quan trong dialogues.json
console.log('\n4. Kiểm tra các đoạn hội thoại Thức Tỉnh Ký Ức trong dialogues.json:');
const comradeBond = dialogues.dialogues?.campfire_knight_comrade_bond;
const q3Complete = dialogues.dialogues?.campfire_knight_q3_complete;
const idleTalk = dialogues.dialogues?.campfire_knight_idle_talk;

assert(comradeBond && comradeBond.lines?.[0].includes('Sir Vaelen'), 'campfire_knight_comrade_bond hiển thị Sir Vaelen ném cành củi');
assert(q3Complete && q3Complete.lines?.[1].includes('Sir Vaelen'), 'campfire_knight_q3_complete hiển thị Sir Vaelen chăm chú nhìn huy hiệu');
assert(q3Complete && q3Complete.lines?.[3].includes('Sir Vaelen'), 'campfire_knight_q3_complete hiển thị Sir Vaelen buông gươm quỳ phục trước Chỉ Huy Hiệp Sĩ Đen');
assert(idleTalk && idleTalk.lines?.[0].includes('Trạm Lửa Rừng Tĩnh Lặng'), 'campfire_knight_idle_talk phục vụ ngọn lửa Trạm Lửa Rừng Tĩnh Lặng');

// 5. Kiểm tra GameScene.ts
console.log('\n5. Kiểm tra thông báo UI trong GameScene.ts:');
const gameSceneSrc = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');

assert(gameSceneSrc.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc đã nhận lại kỷ vật đồng đội'), 'GameScene popup SQ07 nhắc đúng Sir Vaelen — Kỵ Sĩ Trầm Mặc');
assert(gameSceneSrc.includes('Bếp Lửa Hồng nâng lên Cấp 2'), 'GameScene popup SQ06 nhắc đúng Bếp Lửa Hồng nâng lên Cấp 2');
assert(gameSceneSrc.includes('Kỷ vật tình bạn giữa Sir Vaelen và Hooded Knight'), 'GameScene bàn cờ đá nhắc đúng tình bạn giữa Sir Vaelen và Hooded Knight');

// 6. Kiểm tra items.json
console.log('\n6. Kiểm tra mô tả vật phẩm trong items.json:');
const items = JSON.parse(fs.readFileSync(path.resolve('src/data/items.json'), 'utf-8'));
const crest1 = items.items?.find(i => i.id === 'quest_corrupted_crest');
const crest2 = items.items?.find(i => i.id === 'quest_corrupted_knight_crest');

assert(crest1 && crest1.description.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'Vật phẩm quest_corrupted_crest nhắc đúng giao nộp cho Sir Vaelen — Kỵ Sĩ Trầm Mặc');
assert(crest2 && crest2.description.includes('Sir Vaelen — Kỵ Sĩ Trầm Mặc'), 'Vật phẩm quest_corrupted_knight_crest nhắc đúng mang về cho Sir Vaelen — Kỵ Sĩ Trầm Mặc');

console.log(`\n=== TỔNG KẾT KIỂM THỬ: ${passCount} PASS / ${failCount} FAIL ===`);
if (failCount > 0) {
  process.exit(1);
}
