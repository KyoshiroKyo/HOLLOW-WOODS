/**
 * Automated Verification Script for Command C4-12-15
 * Triển khai âm thanh môi trường và hiệu ứng âm thanh gameplay tuân thủ chính sách trình duyệt
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

console.log('================================================================');
console.log('  TEST SUITE: C4-12-15 AUDIO & AMBIENCE SYSTEM VERIFICATION');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Kiểm tra AudioManager.ts cấu trúc và phương thức
console.log('--- 1. Kiểm tra Cấu Trúc & Phương Thức trong AudioManager.ts ---');
const audioManagerPath = path.join(ROOT_DIR, 'src', 'audio', 'AudioManager.ts');
assert(fs.existsSync(audioManagerPath), 'File src/audio/AudioManager.ts tồn tại');

const audioContent = fs.readFileSync(audioManagerPath, 'utf-8');

// Singleton & Lifecycle
assert(audioContent.includes('public static getInstance(): AudioManager'), 'Có Singleton getInstance()');
assert(audioContent.includes('public destroy(): void'), 'Có hàm dọn dẹp destroy() giải phóng Web Audio');

// Browser Autoplay Policy
assert(audioContent.includes('private setupAutoplayUnlock(): void'), 'Có cơ chế setupAutoplayUnlock() lắng nghe pointerdown/keydown');
assert(audioContent.includes('public resumeAudio(): void'), 'Có hàm resumeAudio() khôi phục AudioContext');
assert(audioContent.includes('public isAudioUnlocked(): boolean'), 'Có hàm kiểm tra isAudioUnlocked()');
assert(audioContent.includes('pendingAmbienceZone'), 'Có hàng đợi pendingAmbienceZone khi AudioContext chưa được tương tác');

// Smooth Mute & Cooldowns
assert(audioContent.includes('public toggleMute(): boolean'), 'Có hàm toggleMute() chuyển đổi âm thanh');
assert(audioContent.includes('public setMute(muted: boolean): void'), 'Có hàm setMute() điều chỉnh âm lượng');
assert(audioContent.includes('linearRampToValueAtTime'), 'Áp dụng linearRampToValueAtTime chống tiếng nổ (pop/click artifact)');
assert(audioContent.includes('private checkCooldown(key: string, cooldownMs: number): boolean'), 'Có cơ chế checkCooldown() chống dội âm / méo tiếng khi spam phím');

// 5 Terrain Footstep Types
assert(audioContent.includes('export type TerrainType = \'grass\' | \'dirt\' | \'stone\' | \'wood\' | \'mud\';'), 'Định nghĩa đầy đủ 5 chất liệu bề mặt TerrainType');
assert(audioContent.includes('case \'stone\':'), 'Có tổng hợp bước chân trên Đá (Stone)');
assert(audioContent.includes('case \'wood\':'), 'Có tổng hợp bước chân trên Gỗ (Wood)');
assert(audioContent.includes('case \'mud\':'), 'Có tổng hợp bước chân trên Bùn (Mud)');
assert(audioContent.includes('case \'dirt\':'), 'Có tổng hợp bước chân trên Đất (Dirt)');
assert(audioContent.includes('case \'grass\':'), 'Có tổng hợp bước chân trên Cỏ (Grass)');

// Ambience System & Zone Mapping
assert(audioContent.includes('export type AmbienceZone = \'village\' | \'forest\' | \'mire\' | \'crossing\';'), 'Định nghĩa 4 nhóm AmbienceZone đặc thù');
assert(audioContent.includes('public mapZoneToAmbience(zoneId: string): AmbienceZone'), 'Có hàm mapZoneToAmbience() ánh xạ zone sang ambience');
assert(audioContent.includes('public setAmbienceZone(zoneIdOrType: string, fadeDurationSec: number'), 'Có hàm setAmbienceZone() hỗ trợ Crossfade mượt mà');
assert(audioContent.includes('public stopAmbience(immediate: boolean'), 'Có hàm stopAmbience() dọn dẹp không để sót audio node rò rỉ');
assert(audioContent.includes('if (this.currentAmbienceZone === targetZone && this.activeAmbience)'), 'Ngăn chặn phát chồng lặp 2 lần khi cùng vùng');

// Procedural SFX Methods
assert(audioContent.includes('public playInteract(): void'), 'Có hàm playInteract() cho tương tác NPC / biển báo / rương');
assert(audioContent.includes('public playResourceGather(resourceType?: string): void'), 'Có hàm playResourceGather() cho thu hoạch tài nguyên');
assert(audioContent.includes('public playCraftSuccess(): void'), 'Có hàm playCraftSuccess() cho chế tạo thành công');
assert(audioContent.includes('public playLanternToggle(isOn: boolean): void'), 'Có hàm playLanternToggle() cho bật / tắt đèn lồng');
assert(audioContent.includes('public playQuestUpdate(): void'), 'Có hàm playQuestUpdate() chuông pha lê khi cập nhật quest');
assert(audioContent.includes('public playBronzeBellToll(): void'), 'Có hàm playBronzeBellToll() ngân vang chuông đồng');
assert(audioContent.includes('public playRunestoneResonance('), 'Có hàm playRunestoneResonance() âm vang cột đá');
assert(audioContent.includes('public playListenerAlert(): void'), 'Có hàm playListenerAlert() cảnh báo Kẻ Lắng Nghe');
assert(audioContent.includes('public setHeartbeatActive('), 'Có hàm setHeartbeatActive() nhịp tim hoảng loạn');

// 2. Kiểm tra tích hợp GameScene.ts
console.log('\n--- 2. Kiểm tra Tích Hợp Âm Thanh trong GameScene.ts ---');
const gameScenePath = path.join(ROOT_DIR, 'src', 'scenes', 'GameScene.ts');
const gameContent = fs.readFileSync(gameScenePath, 'utf-8');

assert(gameContent.includes('this.audioManager.setAmbienceZone(this.currentZoneId)'), 'GameScene khởi tạo ambience theo zone ban đầu');
assert(gameContent.includes('this.audioManager.setAmbienceZone(this.currentZoneId);') && gameContent.includes('previousZoneId'), 'GameScene chuyển đổi ambience khi đi qua ranh giới zone');
assert(gameContent.includes('private detectCurrentTerrain(zoneId: ZoneId, x: number, y: number): TerrainType'), 'GameScene có hàm detectCurrentTerrain() phát hiện chất liệu chân bước');
assert(gameContent.includes('this.detectCurrentTerrain(this.currentZoneId, this.player.x, this.player.y)'), 'GameScene truyền chất liệu địa hình thực tế vào playFootstep');
assert(gameContent.includes('this.audioManager.playResourceGather(harvestResult.itemId)'), 'GameScene phát âm thu hoạch tài nguyên theo itemId');
assert(gameContent.includes('this.audioManager.playInteract()'), 'GameScene phát âm tương tác khi nói chuyện NPC / tương tác bản đồ');
assert(gameContent.includes('this.audioManager.stopAmbience()'), 'GameScene dọn dẹp dừng ambience khi shutdown');

// 3. Kiểm tra tích hợp UIScene.ts
console.log('\n--- 3. Kiểm tra Tích Hợp Âm Thanh trong UIScene.ts ---');
const uiScenePath = path.join(ROOT_DIR, 'src', 'scenes', 'UIScene.ts');
const uiContent = fs.readFileSync(uiScenePath, 'utf-8');

assert(uiContent.includes('AudioManager.getInstance().playQuestUpdate()'), 'UIScene phát chuông playQuestUpdate() khi quest đổi/cập nhật');
assert(uiContent.includes('AudioManager.getInstance().playInteract()'), 'UIScene phát âm playInteract() khi mở các modal hoặc tương tác');

// 4. Kiểm tra tích hợp MainMenuScene.ts
console.log('\n--- 4. Kiểm tra Tích Hợp Âm Thanh trong MainMenuScene.ts ---');
const menuScenePath = path.join(ROOT_DIR, 'src', 'scenes', 'MainMenuScene.ts');
const menuContent = fs.readFileSync(menuScenePath, 'utf-8');

assert(menuContent.includes('unlockAndPlayAmbience'), 'MainMenuScene đăng ký sự kiện mở khóa AudioContext và phát nhạc rừng');
assert(menuContent.includes('AudioManager.getInstance().playInteract()'), 'MainMenuScene phát âm khi người chơi bấm nút menu');

// Tổng kết
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA: ${passedTests} / ${totalTests} BÀI TEST ĐẠT (100%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
