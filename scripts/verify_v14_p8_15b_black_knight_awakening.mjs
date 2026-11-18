/**
 * HOLLOW WOODS V1.4 - STEP V14-P8-15B AUTOMATED VERIFICATION
 * Kích hoạt cao trào nhận diện thân phận thật ở Giai đoạn 2–3,
 * cập nhật danh hiệu HUD sang Hiệp Sĩ Đen và mở khóa lời thoại đặc biệt toàn làng Bellhollow
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== V14-P8-15B: KIỂM TRA TIẾN TRÌNH ĐẠI THỨC TỈNH HIỆP SĨ ĐEN ===\n');

// 1. Kiểm tra 4 Chương Ký Ức trong lore.json
console.log('--- 1. Kiểm tra 4 Chương Ký Ức trong lore.json ---');
const lorePath = path.resolve('src/data/lore.json');
assert(fs.existsSync(lorePath), 'src/data/lore.json tồn tại');
const loreData = JSON.parse(fs.readFileSync(lorePath, 'utf8'));

const requiredChapters = [
  { id: 'lore_memory_chapter_1', titleKw: 'HỒI ỨC I', contentKw: 'The Mossbound Wayfarer' },
  { id: 'lore_memory_chapter_2', titleKw: 'HỒI ỨC II', contentKw: 'Xưởng Chuông Cũ' },
  { id: 'lore_memory_chapter_3', titleKw: 'HỒI ỨC III', contentKw: 'The Echo' },
  { id: 'lore_memory_chapter_4', titleKw: 'HỒI ỨC IV', contentKw: 'Hiệp Sĩ Đen' }
];

for (const ch of requiredChapters) {
  const entry = loreData.loreEntries.find(e => e.id === ch.id);
  assert(entry !== undefined, `Tìm thấy chương hồi ức ${ch.id}`);
  if (entry) {
    assert(entry.title.includes(ch.titleKw), `Tiêu đề chứa từ khóa "${ch.titleKw}": ${entry.title}`);
    assert(entry.content.includes(ch.contentKw), `Nội dung chứa từ khóa "${ch.contentKw}"`);
    assert(entry.author && entry.author.length > 0, `Tác giả hợp lệ: ${entry.author}`);
  }
}

// 2. Kiểm tra lời thoại đặc biệt của toàn làng Bellhollow & Hiệp Sĩ Canh Lửa trong dialogues.json
console.log('\n--- 2. Kiểm tra lời thoại đặc biệt trong dialogues.json ---');
const dialoguesPath = path.resolve('src/data/dialogues.json');
assert(fs.existsSync(dialoguesPath), 'src/data/dialogues.json tồn tại');
const dJson = JSON.parse(fs.readFileSync(dialoguesPath, 'utf8'));
const dialogues = dJson.dialogues || dJson;

const villageReverenceNodes = [
  { key: 'garth_black_knight_reverence', speakerKw: 'Garth', textKw: 'Chỉ Huy Hiệp Sĩ Đen' },
  { key: 'edda_black_knight_reverence', speakerKw: 'Edda', textKw: 'Hiệp Sĩ Đen' },
  { key: 'neris_black_knight_reverence', speakerKw: 'Neris', textKw: 'Hiệp Sĩ Đen' },
  { key: 'bram_black_knight_reverence', speakerKw: 'Bram', textKw: 'Chỉ Huy' },
  { key: 'finn_black_knight_reverence', speakerKw: 'Finn', textKw: 'Ngài Hiệp Sĩ Đen' }
];

for (const vn of villageReverenceNodes) {
  const node = dialogues[vn.key];
  assert(node !== undefined, `Tìm thấy node hội thoại kính cẩn: ${vn.key}`);
  if (node) {
    assert(node.speaker.includes(vn.speakerKw), `Người nói hợp lệ: ${node.speaker}`);
    const fullText = node.lines.join(' ');
    assert(fullText.includes(vn.textKw), `Nội dung chứa từ khóa nhận diện "${vn.textKw}"`);
  }
}

// Kiểm tra campfire_knight_q3_complete & campfire_knight_idle_talk
const ckQ3 = dialogues['campfire_knight_q3_complete'];
assert(ckQ3 !== undefined, 'Node campfire_knight_q3_complete tồn tại');
if (ckQ3) {
  const q3Text = ckQ3.lines.join(' ');
  assert(q3Text.includes('Quân Huy Tổng Chỉ Huy') || q3Text.includes('Chỉ Huy Hiệp Sĩ Đen'), 'Q3 hoàn tất xác nhận thân phận Chỉ Huy Hiệp Sĩ Đen');
  assert(q3Text.includes('quỳ một gối') || q3Text.includes('phủ phục'), 'Hiệp sĩ canh lửa quỳ gối tôn kính');
}

const ckIdle = dialogues['campfire_knight_idle_talk'];
assert(ckIdle !== undefined, 'Node campfire_knight_idle_talk tồn tại');
if (ckIdle) {
  const idleText = ckIdle.lines.join(' ');
  assert(idleText.includes('Chỉ Huy Hiệp Sĩ Đen'), 'Idle talk tôn kính Chỉ Huy Hiệp Sĩ Đen');
  assert(idleText.includes('4 Chương Hồi Ức') || idleText.includes('Ký Ức'), 'Hướng dẫn đọc lại các chương ký ức trong Sổ Tay [J]');
}

// 3. Kiểm tra HUD Title & Amber Styling trong UIScene.ts
console.log('\n--- 3. Kiểm tra cập nhật HUD sang Hiệp Sĩ Đen trong UIScene.ts ---');
const uiSceneCode = fs.readFileSync(path.resolve('src/scenes/UIScene.ts'), 'utf8');
assert(uiSceneCode.includes('⚔️ Hiệp Sĩ Đen (Black Knight)'), 'UIScene có danh hiệu "⚔️ Hiệp Sĩ Đen (Black Knight)"');
assert(uiSceneCode.includes('#ffc048'), 'UIScene có ánh màu hổ phách #ffc048 cho danh hiệu Hiệp Sĩ Đen');
assert(uiSceneCode.includes('#3d1a04'), 'UIScene có viền đậm hổ phách/đồng #3d1a04');
assert(uiSceneCode.includes('memoryAwakeningStage >= 3'), 'Kiểm tra điều kiện memoryAwakeningStage >= 3 để đổi tên');
assert(uiSceneCode.includes('memory_awakening_changed'), 'UIScene lắng nghe sự kiện memory_awakening_changed');

// 4. Kiểm tra Sổ Tay Ký Ức trong JournalModal.ts
console.log('\n--- 4. Kiểm tra Sổ Tay Ký Ức (Lore Tab) trong JournalModal.ts ---');
const journalCode = fs.readFileSync(path.resolve('src/ui/JournalModal.ts'), 'utf8');
assert(journalCode.includes('lore_memory_chapter_'), 'JournalModal nhận diện các chương ký ức lore_memory_chapter_');
assert(journalCode.includes('⚔️ '), 'JournalModal hiển thị biểu tượng kiếm ⚔️ cho các chương hồi ức');
assert(journalCode.includes('itemsPerPage') || journalCode.includes('currentPage'), 'JournalModal hỗ trợ phân trang cho danh sách mảnh ký ức');
assert(journalCode.includes('#ffc048') || journalCode.includes('isEntryMemory'), 'JournalModal làm nổi bật tiêu đề chương hồi ức bên trang phải');

// 5. Kiểm tra Giai đoạn 2 trong HoodedKnightBoss (EvilKnights.ts)
console.log('\n--- 5. Kiểm tra Giai đoạn 2 (Chạm trán Hooded Knight Boss) ---');
const evilKnightsCode = fs.readFileSync(path.resolve('src/entities/EvilKnights.ts'), 'utf8');
assert(evilKnightsCode.includes('hasRecognizedCommander'), 'HoodedKnightBoss có cờ hasRecognizedCommander');
assert(evilKnightsCode.includes('Không thể nào... Hơi thở bóng tối trên bộ giáp đen ấy... Ngài chính là Chỉ Huy Hiệp Sĩ Đen?!'), 'Hooded Knight Boss có câu thoại bàng hoàng nhận diện Chỉ Huy');
assert(evilKnightsCode.includes('hooded_knight_stagger'), 'Boss khựng lại/stagger khi nhận ra Chỉ Huy');
assert(evilKnightsCode.includes('setMemoryAwakeningStage(2)') || evilKnightsCode.includes('memoryAwakeningStage = 2'), 'Boss nâng memoryAwakeningStage lên 2 khi chạm trán');
assert(evilKnightsCode.includes('boss_hooded_knight_defeated'), 'Boss bị hạ gục đánh dấu cờ boss_hooded_knight_defeated');

// 6. Kiểm tra The Echo & EchoSystem
console.log('\n--- 6. Kiểm tra The Echo & EchoSystem tương tác ký ức ---');
const echoSystemCode = fs.readFileSync(path.resolve('src/systems/EchoSystem.ts'), 'utf8');
assert(echoSystemCode.includes('setMemoryAwakeningStage(2)') || echoSystemCode.includes('memoryAwakeningStage = 2'), 'EchoSystem kích hoạt Giai đoạn 2 khi tan biến');

const echoAppCode = fs.readFileSync(path.resolve('src/entities/EchoApparition.ts'), 'utf8');
assert(echoAppCode.includes('Chỉ Huy Hiệp Sĩ Đen'), 'EchoApparition thì thầm gọi danh hiệu Chỉ Huy Hiệp Sĩ Đen');

// 7. Kiểm tra GameScene.ts routing hội thoại làng Bellhollow
console.log('\n--- 7. Kiểm tra GameScene.ts chuyển hướng hội thoại ---');
const gameSceneCode = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gameSceneCode.includes('garth_black_knight_reverence'), 'GameScene chuyển hướng Garth sang garth_black_knight_reverence');
assert(gameSceneCode.includes('edda_black_knight_reverence'), 'GameScene chuyển hướng Edda sang edda_black_knight_reverence');
assert(gameSceneCode.includes('neris_black_knight_reverence'), 'GameScene chuyển hướng Neris sang neris_black_knight_reverence');
assert(gameSceneCode.includes('bram_black_knight_reverence'), 'GameScene chuyển hướng Bram sang bram_black_knight_reverence');
assert(gameSceneCode.includes('finn_black_knight_reverence'), 'GameScene chuyển hướng Finn sang finn_black_knight_reverence');
assert(gameSceneCode.includes('setMemoryAwakeningStage(3)'), 'Hoàn tất Q3 nâng memoryAwakeningStage lên 3');

// 8. Kiểm tra PlayerState helper methods
console.log('\n--- 8. Kiểm tra PlayerState helper methods ---');
const playerStateCode = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf8');
assert(playerStateCode.includes('setMemoryAwakeningStage(stage: number)'), 'PlayerState có hàm setMemoryAwakeningStage');
assert(playerStateCode.includes('unlockAllMemoryChapters()'), 'PlayerState có hàm unlockAllMemoryChapters');

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM TRA: ${passed} PASS, ${failed} FAIL`);
if (failed === 0) {
  console.log('🎉 TẤT CẢ TIÊU CHÍ V14-P8-15B ĐỀU ĐẠT CHUẨN XUẤT SẮC!');
} else {
  console.error('⚠️ MỘT SỐ TIÊU CHÍ CHƯA ĐẠT, CẦN KIỂM TRA LẠI.');
  process.exit(1);
}
