import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

console.log('=== RUNNING VERIFICATION FOR STEP V15-18: KNIGHT ORDER TRAGEDY & BLACK KNIGHT AWAKENING ===\n');

// 1. Kiểm tra JSON hợp lệ và dữ liệu trong lore.json
try {
  const lorePath = path.resolve('src/data/lore.json');
  const loreRaw = fs.readFileSync(lorePath, 'utf8');
  const loreData = JSON.parse(loreRaw);
  assert(true, 'src/data/lore.json cú pháp JSON hợp lệ 100%');

  const journal = loreData.loreEntries.find(e => e.id === 'lore_wayfarer_inner_journal');
  assert(!!journal, 'Tồn tại mảnh ký ức lore_wayfarer_inner_journal');
  assert(journal?.title.includes('NHẬT KÝ LỮ KHÁCH'), 'Tiêu đề ký ức chứa "NHẬT KÝ LỮ KHÁCH"');
  assert(journal?.author.includes('Hiệp Sĩ Đen'), 'Tác giả ký ức chứa "Hiệp Sĩ Đen"');
  assert(journal?.content.includes('Cổ Ngữ Algiz phong ấn') || journal?.content.includes('phong ấn'), 'Nội dung nhắc đến phong ấn ký ức');
  assert(journal?.content.includes('Đại Hồng Chung'), 'Nội dung nhắc đến sứ mệnh Đại Hồng Chung');
} catch (e) {
  assert(false, `Lỗi đọc src/data/lore.json: ${e.message}`);
}

// 2. Kiểm tra src/data/dialogues.json
try {
  const dlgPath = path.resolve('src/data/dialogues.json');
  const dlgRaw = fs.readFileSync(dlgPath, 'utf8');
  const dlgData = JSON.parse(dlgRaw);
  assert(true, 'src/data/dialogues.json cú pháp JSON hợp lệ 100%');

  const d = dlgData.dialogues;

  // campfire_knight_intro chứa nhánh hỏi về lời thề
  const knightIntro = d['campfire_knight_intro'];
  assert(!!knightIntro, 'Tồn tại campfire_knight_intro');
  const hasVowChoice = knightIntro?.choices?.some(c => c.nextDialogueKey === 'campfire_knight_comrade_bond');
  assert(hasVowChoice, 'campfire_knight_intro có lựa chọn dẫn đến campfire_knight_comrade_bond');

  // campfire_knight_comrade_bond
  const comradeBond = d['campfire_knight_comrade_bond'];
  assert(!!comradeBond, 'Tồn tại campfire_knight_comrade_bond');
  assert(comradeBond?.speaker.includes('Hiệp Sĩ Canh Lửa'), 'Speaker của comrade bond là Hiệp Sĩ Canh Lửa');
  assert(comradeBond?.choices?.length >= 2, 'comrade bond có ít nhất 2 nhánh lựa chọn tương tác');
  assert(comradeBond?.choices?.some(c => c.setFlag === 'choice_knight_empathy'), 'Có cờ choice_knight_empathy');
  assert(comradeBond?.choices?.some(c => c.setFlag === 'choice_knight_silent_understanding'), 'Có cờ choice_knight_silent_understanding');

  // campfire_knight_q3_complete
  const q3Complete = d['campfire_knight_q3_complete'];
  assert(!!q3Complete, 'Tồn tại campfire_knight_q3_complete');
  assert(q3Complete?.choices?.some(c => c.setFlag === 'choice_black_knight_vow'), 'q3 complete có cờ choice_black_knight_vow');
  assert(q3Complete?.choices?.some(c => c.setFlag === 'choice_black_knight_silent_bond'), 'q3 complete có cờ choice_black_knight_silent_bond');

  // hooded_knight_encounter_intro
  const bossIntro = d['hooded_knight_encounter_intro'];
  assert(!!bossIntro, 'Tồn tại hooded_knight_encounter_intro');
  assert(bossIntro?.speaker.includes('Hiệp Sĩ Trùm Mũ'), 'Speaker của boss intro là Hiệp Sĩ Trùm Mũ');
  assert(bossIntro?.choices?.some(c => c.setFlag === 'choice_hooded_knight_resolve'), 'Boss intro có cờ choice_hooded_knight_resolve');
  assert(bossIntro?.choices?.some(c => c.setFlag === 'choice_hooded_knight_plea'), 'Boss intro có cờ choice_hooded_knight_plea');

  // hooded_knight_encounter_defeat
  const bossDefeat = d['hooded_knight_encounter_defeat'];
  assert(!!bossDefeat, 'Tồn tại hooded_knight_encounter_defeat');
  assert(bossDefeat?.choices?.some(c => c.setFlag === 'choice_hooded_knight_farewell'), 'Boss defeat có cờ choice_hooded_knight_farewell');
  assert(bossDefeat?.onCompleteFlag === 'boss_hooded_knight_defeated', 'Boss defeat có onCompleteFlag = boss_hooded_knight_defeated');
  assert(bossDefeat?.rewardItem === 'quest_corrupted_crest', 'Boss defeat có rewardItem = quest_corrupted_crest');
} catch (e) {
  assert(false, `Lỗi đọc src/data/dialogues.json: ${e.message}`);
}

// 3. Kiểm tra mã nguồn src/entities/EvilKnights.ts
try {
  const ekPath = path.resolve('src/entities/EvilKnights.ts');
  const ekContent = fs.readFileSync(ekPath, 'utf8');

  assert(ekContent.includes('hooded_knight_encounter_intro'), 'HoodedKnightBoss gọi hooded_knight_encounter_intro');
  assert(ekContent.includes('hooded_knight_encounter_defeat'), 'HoodedKnightBoss gọi hooded_knight_encounter_defeat');
  assert(ekContent.includes('lore_wayfarer_inner_journal'), 'HoodedKnightBoss mở khóa lore_wayfarer_inner_journal khi bị hạ gục');
  assert(ekContent.includes('gameScene.dialogueSystem?.isActive'), 'HoodedKnightBoss tôn trọng trạng thái hoạt động của dialogueSystem');
  assert(ekContent.includes('dialogue_completed'), 'HoodedKnightBoss lắng nghe sự kiện dialogue_completed để biến mất thanh thản');
} catch (e) {
  assert(false, `Lỗi đọc src/entities/EvilKnights.ts: ${e.message}`);
}

// 4. Kiểm tra src/state/PlayerState.ts
try {
  const psPath = path.resolve('src/state/PlayerState.ts');
  const psContent = fs.readFileSync(psPath, 'utf8');

  assert(psContent.includes("flag === 'choice_knight_empathy'"), 'PlayerState xử lý choice_knight_empathy để mở khóa nhật ký');
  assert(psContent.includes("flag === 'choice_black_knight_vow'"), 'PlayerState xử lý choice_black_knight_vow để mở khóa nhật ký');
  assert(psContent.includes("flag === 'choice_hooded_knight_farewell'"), 'PlayerState xử lý choice_hooded_knight_farewell để mở khóa nhật ký');
  assert(psContent.includes("this.unlockLore('lore_wayfarer_inner_journal')"), 'PlayerState gọi unlockLore(lore_wayfarer_inner_journal)');
} catch (e) {
  assert(false, `Lỗi đọc src/state/PlayerState.ts: ${e.message}`);
}

// 5. Kiểm tra src/systems/DialogueSystem.ts
try {
  const dsPath = path.resolve('src/systems/DialogueSystem.ts');
  const dsContent = fs.readFileSync(dsPath, 'utf8');

  assert(dsContent.includes('portrait_campfire_knight'), 'DialogueSystem tự động map portrait_campfire_knight');
  assert(dsContent.includes('portrait_hooded_knight'), 'DialogueSystem tự động map portrait_hooded_knight');
  assert(dsContent.includes("this.scene.events.emit('dialogue_completed'"), 'DialogueSystem emit dialogue_completed khi kết thúc thoại');
  assert(dsContent.includes("payload.rewardItem.startsWith('quest_')"), 'DialogueSystem ngăn trùng lặp quest item');
} catch (e) {
  assert(false, `Lỗi đọc src/systems/DialogueSystem.ts: ${e.message}`);
}

// 6. Kiểm tra src/scenes/GameScene.ts
try {
  const gsPath = path.resolve('src/scenes/GameScene.ts');
  const gsContent = fs.readFileSync(gsPath, 'utf8');

  assert(gsContent.includes('public dialogueSystem!: DialogueSystem;'), 'GameScene khai báo public dialogueSystem');
  assert(gsContent.includes("this.playerState.unlockLore('lore_wayfarer_inner_journal')"), 'GameScene mở khóa lore_wayfarer_inner_journal trong Q3 complete');
} catch (e) {
  assert(false, `Lỗi đọc src/scenes/GameScene.ts: ${e.message}`);
}

// 7. Kiểm tra src/ui/JournalModal.ts
try {
  const jmPath = path.resolve('src/ui/JournalModal.ts');
  const jmContent = fs.readFileSync(jmPath, 'utf8');

  assert(jmContent.includes("item.id === 'lore_wayfarer_inner_journal'"), 'JournalModal gắn badge ký ức hoàng kim cho lore_wayfarer_inner_journal');
} catch (e) {
  assert(false, `Lỗi đọc src/ui/JournalModal.ts: ${e.message}`);
}

console.log(`\n======================================================`);
console.log(`KẾT QUẢ KIỂM THỬ V15-18: PASS=${passCount}, FAIL=${failCount}`);
console.log(`======================================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
