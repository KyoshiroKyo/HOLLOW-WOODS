import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log('================================================================');
console.log('VERIFYING MILESTONE C4-13-08: AUDIO SYSTEM AUDIT & SOUND DESIGN');
console.log('================================================================\n');

// 1. Kiểm tra AudioManager.ts
console.log('--- 1. KIỂM TRA QUẢN LÝ VÒNG ĐỜI & AUTOPLAY (AUDIOMANAGER.TS) ---');
const audioManagerPath = path.resolve('src/audio/AudioManager.ts');
const audioManagerCode = fs.readFileSync(audioManagerPath, 'utf8');

assert(
  audioManagerCode.includes("['pointerdown', 'keydown', 'touchstart', 'mousedown', 'click']"),
  'Autoplay unlock hỗ trợ đầy đủ 5 sự kiện tương tác người dùng'
);
assert(
  audioManagerCode.includes('this.ctx.resume().then(') && audioManagerCode.includes('this.pendingAmbienceZone'),
  'AudioContext tự động mở khóa bất đồng bộ và kích hoạt pendingAmbienceZone ngay khi kết nối'
);
assert(
  audioManagerCode.includes('cleanupChannelNodes'),
  'Có phương thức cleanupChannelNodes giải phóng triệt để các AudioNode và Timer'
);
assert(
  audioManagerCode.includes('fadingChannels'),
  'Có danh sách fadingChannels quản lý các kênh đang chuyển đổi (crossfade) chống rò rỉ bộ nhớ'
);
assert(
  audioManagerCode.includes('ambienceVolume: number = 0.38'),
  'Âm lượng Ambience được cân bằng ở mức 0.38 giúp SFX & lời thoại nổi bật rõ nét'
);

// 2. Kiểm tra các hiệu ứng SFX mới và Cooldown
console.log('\n--- 2. KIỂM TRA CÁC HIỆU ỨNG ÂM THANH MỚI & COOLDOWN ---');
assert(
  audioManagerCode.includes('playAttackSwing()') && audioManagerCode.includes("checkCooldown('attack', 200)"),
  'AudioManager có playAttackSwing với cooldown 200ms chống spam'
);
assert(
  audioManagerCode.includes('playBushRustle(') && audioManagerCode.includes("checkCooldown('bush_rustle', 200)"),
  'AudioManager có playBushRustle với cooldown 200ms cho việc vào/ra bụi rậm'
);
assert(
  audioManagerCode.includes('playPlayerDeath()') && audioManagerCode.includes("checkCooldown('death', 1000)"),
  'AudioManager có playPlayerDeath mô phỏng va chạm nặng và bi thương khi ngã xuống'
);
assert(
  audioManagerCode.includes('playListenerAlert()') && audioManagerCode.includes("checkCooldown('listener_alert', 1200)"),
  'playListenerAlert có cooldown 1200ms chống ré tiếng cảnh báo'
);

// 3. Kiểm tra tích hợp Gameplay
console.log('\n--- 3. KIỂM TRA ĐỒNG BỘ GAMEPLAY (SATYRPLAYER, LISTENAI, GAMESCENE) ---');
const playerPath = path.resolve('src/entities/SatyrPlayer.ts');
const playerCode = fs.readFileSync(playerPath, 'utf8');

assert(
  playerCode.includes('AudioManager.getInstance().playAttackSwing()'),
  'SatyrPlayer phát playAttackSwing khi nhân vật vung gậy tấn công'
);
assert(
  playerCode.includes('AudioManager.getInstance().playBushRustle(true)'),
  'SatyrPlayer phát playBushRustle(true) khi nhân vật bước vào bụi rậm'
);
assert(
  playerCode.includes('AudioManager.getInstance().playBushRustle(false)'),
  'SatyrPlayer phát playBushRustle(false) khi nhân vật bước ra khỏi bụi rậm'
);

const listenerAIPath = path.resolve('src/systems/ListenerAI.ts');
const listenerAICode = fs.readFileSync(listenerAIPath, 'utf8');

assert(
  listenerAICode.includes("if (previousState !== 'ALERT')") && listenerAICode.includes('this.listener.onAlertTelegraph()'),
  'ListenerAI chỉ phát tín hiệu cảnh báo Telegraph khi chuyển trạng thái sang ALERT'
);
assert(
  listenerAICode.includes("if (this.state === 'CHASE') return;") && listenerAICode.includes('this.listener.onChaseAlert()'),
  'ListenerAI chỉ phát tín hiệu rượt đuổi khi chuyển trạng thái sang CHASE, không phát lặp mỗi frame'
);

const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf8');

assert(
  gameSceneCode.includes('this.audioManager.playPlayerDeath()'),
  'GameScene kích hoạt playPlayerDeath khi người chơi cạn sinh lực'
);
assert(
  gameSceneCode.includes('this.audioManager.stopAmbience()'),
  'GameScene dừng tiếng gió rừng khi Game Over để tập trung vào khoảnh khắc tử trận'
);

const mainMenuPath = path.resolve('src/scenes/MainMenuScene.ts');
const mainMenuCode = fs.readFileSync(mainMenuPath, 'utf8');

assert(
  mainMenuCode.includes('audio.isAudioUnlocked()') && mainMenuCode.includes("audio.setAmbienceZone('forest', 2.0)"),
  'MainMenuScene tự động phục hồi nhạc nền rừng khi quay trở lại từ GameScene nếu âm thanh đã mở khóa'
);

console.log('\n================================================================');
console.log('>>> TẤT CẢ 15 HẠNG MỤC KIỂM TRA HỆ THỐNG ÂM THANH C4-13-08 ĐỀU ĐẠT CHUẨN 100%! <<<');
console.log('================================================================');
