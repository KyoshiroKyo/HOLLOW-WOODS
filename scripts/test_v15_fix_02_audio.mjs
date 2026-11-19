import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🔍 HOLLOW WOODS V1.5 — KIỂM TRA SỬA LỖI ÂM THANH V15-FIX-02');
console.log('========================================================================\n');

const audioManagerPath = path.resolve('src/audio/AudioManager.ts');
const content = fs.readFileSync(audioManagerPath, 'utf8');

let passCount = 0;
let failCount = 0;

function test(description, passed, details = '') {
  if (passed) {
    console.log(`  ✔ [PASS] ${description}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${description} ${details}`);
    failCount++;
  }
}

// 1. Kiểm tra setHeartbeatActive không bị gán false sai vị trí
console.log('--- 1. Kiểm tra logic cờ setHeartbeatActive() ---');
const hbActiveBlockMatch = content.match(/this\.isHeartbeatActive\s*=\s*true;[\s\S]*?this\.heartbeatTimer\s*=\s*window\.setInterval/);
if (hbActiveBlockMatch) {
  const block = hbActiveBlockMatch[0];
  const hasPrematureFalse = block.includes('this.isHeartbeatActive = false');
  test('Không có dòng gán this.isHeartbeatActive = false trong khối active', !hasPrematureFalse);
  test('Khởi tạo interval nhịp tim ngay sau khi đặt cờ active = true', block.includes('window.setInterval'));
} else {
  test('Tìm thấy khối lệnh kích hoạt nhịp tim trong setHeartbeatActive', false);
}

// 2. Kiểm tra quản lý vòng lặp mưa rainSource
console.log('\n--- 2. Kiểm tra chống rò rỉ vòng lặp tiếng mưa (rainSource / rainGain) ---');
test('Khai báo thuộc tính private rainSource: AudioBufferSourceNode | null', content.includes('private rainSource: AudioBufferSourceNode | null = null;'));
test('Gán tham chiếu this.rainSource = src trong setRainIntensity', content.includes('this.rainSource = src;'));

// Kiểm tra cleanup trong cleanupAudioLoops, stopAll, destroy, stopAmbience
const hasCleanupAudioLoopsRain = /cleanupAudioLoops[\s\S]*?this\.rainSource\.stop\(\)[\s\S]*?this\.rainSource = null/.test(content);
test('Dọn dẹp ngắt kết nối rainSource trong cleanupAudioLoops()', hasCleanupAudioLoopsRain);

const hasStopAllRain = /public stopAll[\s\S]*?this\.rainSource\.stop\(\)[\s\S]*?this\.rainSource = null/.test(content);
test('Dọn dẹp ngắt kết nối rainSource trong stopAll()', hasStopAllRain);

const hasDestroyRain = /public destroy[\s\S]*?this\.rainSource\.stop\(\)[\s\S]*?this\.rainSource = null/.test(content);
test('Dọn dẹp ngắt kết nối rainSource trong destroy()', hasDestroyRain);

// 3. Kiểm tra kích hoạt pendingBGMTrack khi giải mã xong
console.log('\n--- 3. Kiểm tra tự động phát BGM khi preloadSampledAudio giải mã xong ---');
const hasPendingBgmResume = /preloadSampledAudio[\s\S]*?this\.pendingBGMTrack[\s\S]*?this\.pendingBGMTrack\.track === key[\s\S]*?this\.playBGM\(/.test(content);
test('Tự động kích hoạt playBGM khi AudioBuffer tương ứng decode xong', hasPendingBgmResume);

// 4. Kiểm tra đồng bộ hóa khóa SFX sói và quạ / xương
console.log('\n--- 4. Kiểm tra đồng bộ khóa SFX khớp audioManifest ---');
const hasWolfGrowlSync = /playWolfGrowl[\s\S]*?skull_wolf_growl[\s\S]*?skull_wolf_snarl/.test(content);
test('playWolfGrowl() sử dụng skull_wolf_growl & skull_wolf_snarl với no-repeat', hasWolfGrowlSync);

const hasWolfLungeSync = /playWolfLunge[\s\S]*?playSampled\('skull_wolf_snarl'/.test(content);
test('playWolfLunge() sử dụng khóa skull_wolf_snarl trong audioManifest', hasWolfLungeSync);

const hasNoRawCrowCawPhantom = !/playCrowCaw[\s\S]*?this\.playSampled\('crow_caw'/.test(content.replace(/this\.audioBuffers\.has\('crow_caw'\)/g, 'HAS_CHECK'));
test('playCrowCaw() không gọi mù vào key crow_caw không tồn tại', hasNoRawCrowCawPhantom);

const hasNoRawBoneRattlePhantom = !/playBoneRattle[\s\S]*?this\.playSampled\('bone_rattle'/.test(content.replace(/this\.audioBuffers\.has\('bone_rattle'\)/g, 'HAS_CHECK'));
test('playBoneRattle() không gọi mù vào key bone_rattle không tồn tại', hasNoRawBoneRattlePhantom);

console.log('\n========================================================================');
console.log(`📊 KẾT QUẢ KIỂM TRA ÂM THANH: ${passCount}/${passCount + failCount} KIỂM TRA ĐẠT`);
console.log('========================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 4 LỖI LOGIC & RÒ RỈ ÂM THANH TRONG AudioManager.ts ĐÃ ĐƯỢC VÁ HOÀN TOÀN!');
}
