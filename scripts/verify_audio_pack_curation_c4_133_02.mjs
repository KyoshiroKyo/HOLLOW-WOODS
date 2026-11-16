import fs from 'fs';
import path from 'path';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('  VERIFYING C4-133-02: CURATED AUDIO PACK & INTEGRATION AUDIT');
console.log('================================================================\n');

// 1. Kiểm tra kích thước thư mục public/assets/audio/
const audioDir = path.resolve('public/assets/audio');
assert(fs.existsSync(audioDir), 'Thư mục public/assets/audio/ tồn tại');

function getDirSize(dir) {
  let size = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}

const totalAudioBytes = getDirSize(audioDir);
const totalAudioMB = totalAudioBytes / (1024 * 1024);
console.log(`  [INFO] Tổng dung lượng audio: ${totalAudioMB.toFixed(2)} MB (${totalAudioBytes} bytes)`);
assert(totalAudioMB < 5.0, `Tổng dung lượng âm thanh (${totalAudioMB.toFixed(2)} MB) nghiêm ngặt dưới 5.0 MB`);

// 2. Kiểm tra cấu trúc các thư mục phân loại sfx, ambience, dialogue
const sfxDir = path.join(audioDir, 'sfx');
const ambienceDir = path.join(audioDir, 'ambience');
const dialogueDir = path.join(audioDir, 'dialogue');

assert(fs.existsSync(sfxDir), 'Thư mục public/assets/audio/sfx/ tồn tại');
assert(fs.existsSync(ambienceDir), 'Thư mục public/assets/audio/ambience/ tồn tại');
assert(fs.existsSync(dialogueDir), 'Thư mục public/assets/audio/dialogue/ tồn tại');

// 3. Kiểm tra file âm thanh làng Bellhollow (Old House 4 - không còn tiếng ré chói tai 62KB)
const villageAmbiencePath = path.join(ambienceDir, 'ambience_village.mp3');
assert(fs.existsSync(villageAmbiencePath), 'File ambience_village.mp3 tồn tại');
const villageSize = fs.statSync(villageAmbiencePath).size;
assert(villageSize > 30000 && villageSize < 45000, `File ambience_village.mp3 là bản Old House 4 trầm ấm dịu êm (~35KB, thực tế: ${villageSize} bytes), không phải bản ré chói tai (62KB)`);

// 4. Kiểm tra các file lời thoại NPC (Super Dialogue Audio Pack)
const npcs = ['garth', 'edda', 'neris', 'bram', 'finn'];
for (const npc of npcs) {
  const filePath = path.join(dialogueDir, `dialogue_${npc}.wav`);
  assert(fs.existsSync(filePath), `Giọng thoại NPC ${npc} (dialogue_${npc}.wav) tồn tại trong dialogue/`);
}
assert(fs.existsSync(path.join(dialogueDir, 'dialogue_text_blip.wav')), 'File typewriter blip (dialogue_text_blip.wav) tồn tại');

// 5. Kiểm tra PreloadScene.ts
const preloadPath = path.resolve('src/scenes/PreloadScene.ts');
const preloadCode = fs.readFileSync(preloadPath, 'utf8');
assert(preloadCode.includes("this.load.audio('ambience_village', 'assets/audio/ambience/ambience_village.mp3')"), 'PreloadScene nạp ambience_village qua đường dẫn tương đối chuẩn');
assert(preloadCode.includes("this.load.audio('dialogue_garth', 'assets/audio/dialogue/dialogue_garth.wav')"), 'PreloadScene nạp dialogue_garth');
assert(preloadCode.includes("this.load.audio('attack_swing', 'assets/audio/sfx/attack_swing.mp3')"), 'PreloadScene nạp attack_swing');
assert(preloadCode.includes('AudioManager.getInstance().syncWithPhaserCache(this)'), 'PreloadScene đồng bộ cache âm thanh sang AudioManager trong create()');

// 6. Kiểm tra AudioManager.ts
const audioManagerPath = path.resolve('src/audio/AudioManager.ts');
const audioManagerCode = fs.readFileSync(audioManagerPath, 'utf8');
assert(audioManagerCode.includes('public syncWithPhaserCache('), 'AudioManager có hàm syncWithPhaserCache');
assert(audioManagerCode.includes('public playNPCSpeech('), 'AudioManager có hàm playNPCSpeech');
assert(audioManagerCode.includes('public playDialogueBlip('), 'AudioManager có hàm playDialogueBlip');
assert(audioManagerCode.includes('public playUISelect('), 'AudioManager có hàm playUISelect');
assert(audioManagerCode.includes('public playUIConfirm('), 'AudioManager có hàm playUIConfirm');
assert(audioManagerCode.includes('public playUICancel('), 'AudioManager có hàm playUICancel');
assert(audioManagerCode.includes('public playPoulticeHeal('), 'AudioManager có hàm playPoulticeHeal');
assert(audioManagerCode.includes('public playOilRefill('), 'AudioManager có hàm playOilRefill');

// 7. Kiểm tra DialogueSystem.ts
const dialoguePath = path.resolve('src/systems/DialogueSystem.ts');
const dialogueCode = fs.readFileSync(dialoguePath, 'utf8');
assert(dialogueCode.includes('AudioManager.getInstance().playNPCSpeech('), 'DialogueSystem kích hoạt playNPCSpeech khi bắt đầu hội thoại');
assert(dialogueCode.includes('AudioManager.getInstance().playDialogueBlip()'), 'DialogueSystem phát âm typewriter khi chạy chữ');

console.log('\n================================================================');
console.log(`TỔNG KẾT: ${passedTests}/${totalTests} KIỂM TRA ĐẠT (${failedTests} THẤT BẠI)`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
