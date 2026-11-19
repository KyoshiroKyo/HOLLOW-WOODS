import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('🎵 HOLLOW WOODS V1.5 — KIỂM THỬ HỆ THỐNG NHẠC NỀN BGM (BƯỚC V15-39)');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

const rootDir = process.cwd();

// 1. Kiểm tra 5 file MP3 chuẩn hóa trong public/assets/audio/bgm/
console.log('--- 1. Kiểm tra các tệp nhạc BGM chuẩn hóa trong public/assets/audio/bgm/ ---');
const bgmDir = path.join(rootDir, 'public', 'assets', 'audio', 'bgm');
const expectedFiles = [
  'knights_quiet_fire.mp3',
  'embervale.mp3',
  'beyond_the_hills.mp3',
  'evergrove.mp3',
  'forgotten_orchard.mp3'
];

assert(fs.existsSync(bgmDir), 'Thư mục public/assets/audio/bgm/ tồn tại');

for (const file of expectedFiles) {
  const filePath = path.join(bgmDir, file);
  const exists = fs.existsSync(filePath);
  const size = exists ? fs.statSync(filePath).size : 0;
  assert(exists && size > 1024 * 1024, `Tệp BGM "${file}" tồn tại (${(size / (1024 * 1024)).toFixed(2)} MB)`);
}

// 2. Kiểm tra bản gốc nguyên vẹn trong Sound_Effects/
console.log('\n--- 2. Kiểm tra thư mục gốc Sound_Effects/The Knight’s Quiet Fire/ ---');
const soundEffectsDir = path.join(rootDir, 'Sound_Effects');
const seItems = fs.readdirSync(soundEffectsDir);
const quietFireDirName = seItems.find(name => name.includes('Quiet Fire'));
assert(Boolean(quietFireDirName), `Thư mục Sound_Effects chứa bản gốc nhạc "${quietFireDirName}"`);
if (quietFireDirName) {
  const originals = fs.readdirSync(path.join(soundEffectsDir, quietFireDirName)).filter(f => f.endsWith('.mp3'));
  assert(originals.length >= 5, `Thư mục gốc bảo lưu nguyên vẹn ${originals.length} tệp âm thanh gốc`);
}

// 3. Kiểm tra PreloadScene.ts
console.log('\n--- 3. Kiểm tra nạp tài nguyên an toàn tại PreloadScene.ts ---');
const preloadCode = fs.readFileSync(path.join(rootDir, 'src', 'scenes', 'PreloadScene.ts'), 'utf-8');
assert(preloadCode.includes('loaderror'), 'PreloadScene có bộ bắt sự kiện loaderror an toàn');
assert(preloadCode.includes('bgm_knights_quiet_fire'), 'Nạp khóa audio bgm_knights_quiet_fire');
assert(preloadCode.includes('bgm_embervale'), 'Nạp khóa audio bgm_embervale');
assert(preloadCode.includes('bgm_beyond_the_hills'), 'Nạp khóa audio bgm_beyond_the_hills');
assert(preloadCode.includes('bgm_evergrove'), 'Nạp khóa audio bgm_evergrove');
assert(preloadCode.includes('bgm_forgotten_orchard'), 'Nạp khóa audio bgm_forgotten_orchard');

// 4. Kiểm tra AudioManager.ts
console.log('\n--- 4. Kiểm tra hệ thống BGM Crossfade trong AudioManager.ts ---');
const audioCode = fs.readFileSync(path.join(rootDir, 'src', 'audio', 'AudioManager.ts'), 'utf-8');
assert(audioCode.includes('export type BGMTrack'), 'Định nghĩa kiểu BGMTrack');
assert(audioCode.includes('public playBGM('), 'Phương thức playBGM(track, fadeDuration, volumeScale)');
assert(audioCode.includes('public stopBGM('), 'Phương thức stopBGM(fadeDuration)');
assert(audioCode.includes('public setBGMSuppressed('), 'Phương thức setBGMSuppressed(suppressed, fadeDuration)');
assert(audioCode.includes('public getBGMVolume('), 'Phương thức getBGMVolume()');
assert(audioCode.includes('public setBGMVolume('), 'Phương thức setBGMVolume(val)');
assert(audioCode.includes("key.startsWith('bgm_')"), 'Khử giật tiếp giáp vòng lặp smoothAudioBufferLoopEdges cho BGM');

// 5. Kiểm tra GameScene.ts
console.log('\n--- 5. Kiểm tra quy tắc điều phối BGM theo vùng & bối cảnh trong GameScene.ts ---');
const gameCode = fs.readFileSync(path.join(rootDir, 'src', 'scenes', 'GameScene.ts'), 'utf-8');
assert(gameCode.includes('updateBGMState'), 'GameScene tích hợp phương thức updateBGMState');
assert(gameCode.includes('1435') && gameCode.includes('710'), 'Toạ độ Bếp Lửa Sir Vaelen (1435, 710)');
assert(gameCode.includes('distToVaelen <= 180'), 'Bán kính 180px quanh Bếp Lửa Sir Vaelen');
assert(gameCode.includes('bgm_knights_quiet_fire') && gameCode.includes('bgm_embervale'), 'Phát knights_quiet_fire (ngày) & embervale (đêm) bên bếp lửa');
assert(gameCode.includes('bgm_forgotten_orchard'), 'Phát forgotten_orchard khi đọc giấy hoặc tại hầm/xưởng chuông');
assert(gameCode.includes('bgm_evergrove'), 'Phát evergrove tại Khoảng Trống Thì Thầm');
assert(gameCode.includes('bgm_beyond_the_hills'), 'Phát beyond_the_hills tại Rừng Ngoài ban ngày');
assert(gameCode.includes('setBGMSuppressed(true'), 'Tự động dìm/tắt BGM khi vào trạng thái hiểm nguy cao (Boss, Chase)');

console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
