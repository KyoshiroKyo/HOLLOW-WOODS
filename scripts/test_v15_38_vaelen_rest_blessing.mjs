import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('⚔️ KIỂM THỬ TỰ ĐỘNG BƯỚC V15-38: LỜI CHÚC & NGHỈ NGƠI SIR VAELEN');
console.log('================================================================\n');

let passCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

// 1. Kiểm tra dialogues.json
const dialoguesRaw = fs.readFileSync('src/data/dialogues.json', 'utf8');
const dialoguesData = JSON.parse(dialoguesRaw).dialogues;

test('dialogues.json: campfire_knight_intro có lựa chọn Nghỉ ngơi bên đốm lửa', () => {
  const intro = dialoguesData.campfire_knight_intro;
  assert(intro && intro.choices, 'Thiếu choices trong campfire_knight_intro');
  const restChoice = intro.choices.find(c => c.text.includes('Đặt vũ khí xuống & Nghỉ ngơi bên đốm lửa'));
  assert(restChoice, 'Không tìm thấy lựa chọn Nghỉ ngơi bên đốm lửa');
  assert.strictEqual(restChoice.nextDialogueKey, 'campfire_knight_rest_blessing');
});

test('dialogues.json: campfire_knight_q1_reminder có lựa chọn Nghỉ ngơi bên đốm lửa', () => {
  const q1 = dialoguesData.campfire_knight_q1_reminder;
  assert(q1 && q1.choices, 'Thiếu choices trong campfire_knight_q1_reminder');
  const restChoice = q1.choices.find(c => c.text.includes('Đặt vũ khí xuống & Nghỉ ngơi bên đốm lửa'));
  assert(restChoice, 'Không tìm thấy lựa chọn');
});

test('dialogues.json: campfire_knight_q2_reminder có lựa chọn Nghỉ ngơi bên đốm lửa', () => {
  const q2 = dialoguesData.campfire_knight_q2_reminder;
  assert(q2 && q2.choices, 'Thiếu choices trong campfire_knight_q2_reminder');
  const restChoice = q2.choices.find(c => c.text.includes('Đặt vũ khí xuống & Nghỉ ngơi bên đốm lửa'));
  assert(restChoice, 'Không tìm thấy lựa chọn');
});

test('dialogues.json: campfire_knight_q3_reminder có lựa chọn Nghỉ ngơi bên đốm lửa', () => {
  const q3 = dialoguesData.campfire_knight_q3_reminder;
  assert(q3 && q3.choices, 'Thiếu choices trong campfire_knight_q3_reminder');
  const restChoice = q3.choices.find(c => c.text.includes('Đặt vũ khí xuống & Nghỉ ngơi bên đốm lửa'));
  assert(restChoice, 'Không tìm thấy lựa chọn');
});

test('dialogues.json: campfire_knight_idle_talk có lựa chọn Nghỉ ngơi bên đốm lửa', () => {
  const idle = dialoguesData.campfire_knight_idle_talk;
  assert(idle && idle.choices, 'Thiếu choices trong campfire_knight_idle_talk');
  const restChoice = idle.choices.find(c => c.text.includes('Đặt vũ khí xuống & Nghỉ ngơi bên đốm lửa'));
  assert(restChoice, 'Không tìm thấy lựa chọn');
});

test('dialogues.json: campfire_knight_rest_blessing_stage0_2 chứa đúng lời nhắn nhủ người lữ khách', () => {
  const blessing02 = dialoguesData.campfire_knight_rest_blessing_stage0_2;
  assert(blessing02, 'Thiếu node campfire_knight_rest_blessing_stage0_2');
  const fullText = blessing02.lines.join(' ');
  assert(fullText.includes('Hỡi kỵ sĩ, hãy đặt thanh kiếm của ngươi xuống bên đốm lửa'), 'Thiếu câu mở đầu');
  assert(fullText.includes('Cầu mong ánh sáng che chở trái tim ngươi đêm nay'), 'Thiếu câu cầu chúc ánh sáng');
  assert(fullText.includes('Nghỉ ngơi đi, người lữ khách... Audentes Fortuna Iuvat — Vận may luôn mỉm cười với kẻ quả cảm.'), 'Thiếu câu kết stage 0-2');
  assert.strictEqual(blessing02.onCompleteFlag, 'vaelen_blessing_stage0_2_received');
});

test('dialogues.json: campfire_knight_rest_blessing_stage3 chứa đúng lời nhắn nhủ người anh em', () => {
  const blessing3 = dialoguesData.campfire_knight_rest_blessing_stage3;
  assert(blessing3, 'Thiếu node campfire_knight_rest_blessing_stage3');
  const fullText = blessing3.lines.join(' ');
  assert(fullText.includes('Nghỉ ngơi đi, người anh em. Ngày mai, chúng ta lại đứng dậy... Audentes Fortuna Iuvat — Vận may luôn mỉm cười với kẻ quả cảm.'), 'Thiếu câu kết stage 3');
  assert.strictEqual(blessing3.onCompleteFlag, 'vaelen_blessing_stage3_received');
});

test('dialogues.json: campfire_knight_rest_cooldown có câu nhắc nhở hồi chiêu trong ngày', () => {
  const cd = dialoguesData.campfire_knight_rest_cooldown;
  assert(cd && cd.lines && cd.lines.length > 0, 'Thiếu node campfire_knight_rest_cooldown');
  assert(cd.lines[0].includes('Ngọn lửa vẫn còn lưu giữ hơi ấm lời chúc trong tâm trí ngươi hôm nay rồi'), 'Thiếu nội dung hồi chiêu');
});

// 2. Kiểm tra lore.json
const loreRaw = fs.readFileSync('src/data/lore.json', 'utf8');
const loreData = JSON.parse(loreRaw).loreEntries;

test('lore.json: lore_campfire_knight_vow chứa câu châm ngôn Audentes Fortuna Iuvat', () => {
  const vow = loreData.find(l => l.id === 'lore_campfire_knight_vow');
  assert(vow, 'Không tìm thấy lore_campfire_knight_vow');
  assert(vow.content.includes('Audentes Fortuna Iuvat'), 'Thiếu châm ngôn Audentes Fortuna Iuvat');
  assert(vow.content.includes('Vận may luôn mỉm cười với kẻ quả cảm'), 'Thiếu giải nghĩa tiếng Việt');
  assert(vow.content.includes('Ngày mai, chúng ta lại đứng dậy'), 'Thiếu câu kết kỵ sĩ');
});

// 3. Kiểm tra mã nguồn TypeScript
const campSysCode = fs.readFileSync('src/systems/CampSanctuarySystem.ts', 'utf8');
test('CampSanctuarySystem.ts: Có các phương thức quản lý hồi chiêu và Lời Chúc Bên Đốm Lửa', () => {
  assert(campSysCode.includes('canReceiveBlessing'), 'Thiếu canReceiveBlessing');
  assert(campSysCode.includes('recordBlessingReceived'), 'Thiếu recordBlessingReceived');
  assert(campSysCode.includes('applyCampfireBlessing'), 'Thiếu applyCampfireBlessing');
  assert(campSysCode.includes('getBlessingDrainMultiplier'), 'Thiếu getBlessingDrainMultiplier');
  assert(campSysCode.includes('0.80'), 'Thiếu hệ số giảm 20% (-20% => 0.80)');
});

const survivalSysCode = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf8');
test('SurvivalSystem.ts: Tích hợp getBlessingDrainMultiplier và CampSanctuarySystem.update(dt)', () => {
  assert(survivalSysCode.includes('CampSanctuarySystem.getInstance().update(dt)'), 'Thiếu gọi update timer');
  assert(survivalSysCode.includes('getBlessingDrainMultiplier()'), 'Thiếu áp dụng hệ số Lời Chúc');
});

const dialogueSysCode = fs.readFileSync('src/systems/DialogueSystem.ts', 'utf8');
test('DialogueSystem.ts: Điều hướng campfire_knight_rest_blessing và kích hoạt hồi 35 Tinh Thần, hong khô Độ Ẩm', () => {
  assert(dialogueSysCode.includes("dialogueKey === 'campfire_knight_rest_blessing'"), 'Thiếu điều hướng rest blessing');
  assert(dialogueSysCode.includes("audioMgr.playBGM('bgm_knights_quiet_fire'"), 'Thiếu phát BGM knights_quiet_fire');
  assert(dialogueSysCode.includes('campSys.applyCampfireBlessing(120)'), 'Thiếu gọi applyCampfireBlessing(120)');
  assert(dialogueSysCode.includes('state.stats.composure + 35'), 'Thiếu hồi phục 35 Tinh Thần');
  assert(dialogueSysCode.includes('state.stats.moisture = 0'), 'Thiếu hong khô hoàn toàn Độ Ẩm');
  assert(dialogueSysCode.includes("state.unlockLore('lore_campfire_knight_vow')"), 'Thiếu mở khóa trang kỷ niệm Sir Vaelen ở Stage 3');
});

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM THỬ V15-38: ${passCount}/${totalCount} BÀI KIỂM TRA ĐẠT (${Math.round((passCount/totalCount)*100)}%)`);
console.log('================================================================\n');

if (passCount !== totalCount) {
  process.exit(1);
}
