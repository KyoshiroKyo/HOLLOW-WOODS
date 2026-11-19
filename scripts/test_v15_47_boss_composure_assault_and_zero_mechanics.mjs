/**
 * HOLLOW WOODS - Step V15-47 Automated Test
 * Test: Boss Composure Assault, Low Composure Vision Shrink & Drain, Zero Composure Direct Damage & Red Vignette Alert
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== TEST V15-47: BOSS COMPOSURE ASSAULT & ZERO MECHANICS ===\n');

// 1. Kiểm tra SurvivalSystem.ts
const survivalPath = path.resolve('src/systems/SurvivalSystem.ts');
assert(fs.existsSync(survivalPath), 'SurvivalSystem.ts tồn tại');
const survivalContent = fs.readFileSync(survivalPath, 'utf-8');

assert(survivalContent.includes('public isBossFightActive: boolean = false;'), 'SurvivalSystem có cờ isBossFightActive');
assert(survivalContent.includes('public setBossFightActive(active: boolean): void'), 'SurvivalSystem có setBossFightActive');
assert(survivalContent.includes("isBossArena = (zoneId === 'broken_bell_shrine') && this.isBossFightActive"), 'Xác định vùng đấu trường Boss broken_bell_shrine');
assert(survivalContent.includes('const drainHp = (3.5 / 1.5) * dt;'), 'Rút 3.5 Sinh Lực mỗi 1.5s (~2.333 HP/s) khi Bình Tâm < 50 trong phòng Boss');

// 2. Kiểm tra MireWardenBoss.ts
const bossPath = path.resolve('src/entities/MireWardenBoss.ts');
assert(fs.existsSync(bossPath), 'MireWardenBoss.ts tồn tại');
const bossContent = fs.readFileSync(bossPath, 'utf-8');

assert(bossContent.includes('public darkResonanceRadius: number = 110;'), 'Boss có darkResonanceRadius = 110px');
assert(bossContent.includes('public triggerDarkResonancePulse(): void'), 'Boss có triggerDarkResonancePulse');
assert(bossContent.includes('this.auraGfx.fillStyle(0x3a0d45, pulse);'), 'Vùng hào quang Dark Resonance Aura được vẽ quanh Boss');

// 3. Kiểm tra UIScene.ts
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
assert(fs.existsSync(uiScenePath), 'UIScene.ts tồn tại');
const uiContent = fs.readFileSync(uiScenePath, 'utf-8');

assert(uiContent.includes('public triggerRedDangerVignetteFlash(): void'), 'UIScene có triggerRedDangerVignetteFlash');
assert(uiContent.includes("isBossFight = gameScene?.isBossFightActive && gameScene?.currentZoneId === 'broken_bell_shrine'"), 'UIScene kiểm tra điều kiện trận Boss');
assert(uiContent.includes('composure <= 0 ? 0x6e0813 : 0x3d0b16'), 'Chuyển màu đỏ thẫm rực cháy khi Bình Tâm chạm 0/100');

// 4. Kiểm tra GameScene.ts
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
assert(fs.existsSync(gameScenePath), 'GameScene.ts tồn tại');
const sceneContent = fs.readFileSync(gameScenePath, 'utf-8');

// Bộ đếm thời gian
assert(sceneContent.includes('public bossResonanceTimer: number = 0;'), 'GameScene có bossResonanceTimer');
assert(sceneContent.includes('public bossContactCooldownTimer: number = 0;'), 'GameScene có bossContactCooldownTimer');

// Kích hoạt & hoàn tất trận đấu
assert(sceneContent.includes('this.survivalSystem.setBossFightActive(true);'), 'triggerMireWardenBossEncounter kích hoạt setBossFightActive(true)');
assert(sceneContent.includes('this.survivalSystem.setBossFightActive(false);'), 'finishMireWardenDefeat tắt setBossFightActive(false)');

// Sóng Chuông Trầm (Sonic Dread Pulse)
assert(sceneContent.includes('this.playerState.stats.composure = Math.max(0, this.playerState.stats.composure - 20);'), 'Đòn sóng âm trừ 20 Bình Tâm khi Bình Tâm > 0');
assert(sceneContent.includes('this.audioManager.playBronzeBellToll();'), 'Phát tiếng chuông đồng rền vang khi trúng sóng âm');

// Vùng cộng hưởng bóng tối
assert(sceneContent.includes('if (distToBoss <= this.mireWardenBoss.darkResonanceRadius)'), 'Kiểm tra người chơi đứng trong vùng darkResonanceRadius');
assert(sceneContent.includes('this.bossResonanceTimer >= 1800'), 'Đứng trong vùng cộng hưởng 1.8s trừ 20 Bình Tâm');

// Sát thương xé toạc khi Bình Tâm chạm 0
assert(sceneContent.includes('CẢNH BÁO: Tinh thần sụp đổ! Đòn đánh của Boss đang xé toạc Sinh Lực!'), 'Hiển thị cảnh báo sụp đổ tinh thần trên HUD');
assert(sceneContent.includes('this.uiScene.triggerRedDangerVignetteFlash();'), 'Kích hoạt viền nháy đỏ toàn màn hình khi trúng đòn lúc Bình Tâm = 0');
assert(sceneContent.includes('this.playerState.stats.health = Math.max(0, this.playerState.stats.health - dmg);'), 'Trừ sát thương vật lý trực tiếp cực mạnh khi Bình Tâm = 0');

// Thu hẹp tầm nhìn & sương mù ép sát
assert(sceneContent.includes('const bossVisionScale = Phaser.Math.Linear(0.35, 1.0, bossPanicRatio);'), 'Tầm nhìn tự động thu hẹp sâu từ 1.0x xuống 0.35x khi Bình Tâm < 50');
assert(sceneContent.includes('fogAlpha = Math.min(0.96, fogAlpha + (1 - bossPanicRatio) * 0.12);'), 'Sương mù dày đặc áp sát tỷ lệ nghịch với Bình Tâm');

// Nhịp tim dồn dập
assert(sceneContent.includes('this.audioManager.setHeartbeatActive(true, 380);'), 'Nhịp tim đập cực nhanh (380ms) khi Bình Tâm chạm 0');

console.log(`\nTổng kết: ${passed} PASS, ${failed} FAIL`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('>>> TẤT CẢ CÁC ĐIỀU KIỆN V15-47 ĐỀU ĐẠT CHUẨN! <<<\n');
}
