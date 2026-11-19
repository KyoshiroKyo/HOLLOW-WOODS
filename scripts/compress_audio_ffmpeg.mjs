import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('========================================================================');
console.log('🎧 HOLLOW WOODS V1.5 — CÔNG CỤ NÉN ÂM THANH TỰ ĐỘNG BẰNG FFMPEG');
console.log('========================================================================\n');

// 1. Kiểm tra ffmpeg trong hệ thống
let hasFfmpeg = false;
try {
  const versionOut = execSync('ffmpeg -version', { stdio: 'pipe' }).toString();
  console.log(`✅ Đã tìm thấy ffmpeg: ${versionOut.split('\n')[0]}\n`);
  hasFfmpeg = true;
} catch {
  console.log('⚠️  CHƯA CÀI ĐẶT FFMPEG TRONG BIẾN MÔI TRƯỜNG PATH');
  console.log('------------------------------------------------------------------------');
  console.log('Để tối ưu giảm thêm dung lượng file vật lý từ ~65.4 MB xuống ~15 MB:');
  console.log('1. Mở PowerShell và chạy lệnh: winget install Gyan.FFmpeg');
  console.log('   (Hoặc tải ffmpeg từ https://www.gyan.dev/ffmpeg/builds/ và thêm vào PATH)');
  console.log('2. Mở lại terminal và chạy: node scripts/compress_audio_ffmpeg.mjs');
  console.log('------------------------------------------------------------------------\n');
}

if (!hasFfmpeg) {
  console.log('ℹ️  Hệ thống BGM Streaming & Lazy Loading đã hoàn tất sẵn sàng trong code!');
  console.log('Game hiện tại không cần nén vẫn chạy mượt mà không tốn RAM giải mã PCM.\n');
  process.exit(0);
}

const rootDir = process.cwd();
const bgmDir = path.join(rootDir, 'public', 'assets', 'audio', 'bgm');
const sfx14Dir = path.join(rootDir, 'public', 'assets', 'audio', 'sfx', 'v14');

// Nén BGM (MP3 112k stereo VBR/CBR chất âm sạch)
const bgmFiles = [
  'knights_quiet_fire.mp3',
  'embervale.mp3',
  'beyond_the_hills.mp3',
  'evergrove.mp3',
  'forgotten_orchard.mp3'
];

console.log('--- 1. Nén 5 bản nhạc nền BGM (Target: 112kbps MP3) ---');
for (const file of bgmFiles) {
  const filePath = path.join(bgmDir, file);
  if (!fs.existsSync(filePath)) continue;
  const tempPath = path.join(bgmDir, `temp_${file}`);
  const originalSize = fs.statSync(filePath).size;
  try {
    execSync(`ffmpeg -y -i "${filePath}" -b:a 112k -ar 44100 "${tempPath}"`, { stdio: 'ignore' });
    const newSize = fs.statSync(tempPath).size;
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    console.log(`  ✔ [NÉN THÀNH CÔNG] ${file}: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error(`  ❌ [LỖI NÉN] ${file}:`, err.message);
  }
}

// Nén các tệp WAV nặng trong sfx/v14/
const heavyWavs = [
  'behemoth_thud.wav',
  'boss_drone.wav',
  'bell_toll_low.wav',
  'rune_shift.wav',
  'footstep_wood_2.wav',
  'footstep_stone_2.wav',
  'scout_whistle.wav'
];

console.log('\n--- 2. Nén các tệp hiệu ứng âm thanh nặng trong sfx/v14/ ---');
for (const file of heavyWavs) {
  const filePath = path.join(sfx14Dir, file);
  if (!fs.existsSync(filePath)) continue;
  const tempPath = path.join(sfx14Dir, `temp_${file}`);
  const originalSize = fs.statSync(filePath).size;
  try {
    // Chuẩn hóa WAV 16-bit 22050Hz mono gọn nhẹ cho hiệu ứng âm thanh
    execSync(`ffmpeg -y -i "${filePath}" -ac 1 -ar 22050 "${tempPath}"`, { stdio: 'ignore' });
    const newSize = fs.statSync(tempPath).size;
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    console.log(`  ✔ [NÉN THÀNH CÔNG] ${file}: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error(`  ❌ [LỖI NÉN] ${file}:`, err.message);
  }
}

console.log('\n========================================================================');
console.log('🎉 HOÀN TẤT TIẾN TRÌNH NÉN TỐI ƯU DUNG LƯỢNG FILE ÂM THANH VẬT LÝ!');
console.log('========================================================================\n');
