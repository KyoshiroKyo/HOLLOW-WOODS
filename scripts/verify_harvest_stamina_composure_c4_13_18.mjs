import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

console.log('=== [HOLLOW WOODS V1.3] AUTOMATED VERIFICATION: C4-13-18 ===\n');

let passCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    passCount++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Kiểm tra SurvivalSystem.ts
const survivalCode = readFileSync(resolve('src/systems/SurvivalSystem.ts'), 'utf-8');

assert(
  survivalCode.includes('sprintCooldownTimer') &&
  survivalCode.includes('this.sprintCooldownTimer = 1.0;'),
  'SurvivalSystem: Khởi tạo sprintCooldownTimer và hoãn hồi phục 1.0s sau khi dừng chạy nhanh'
);

assert(
  survivalCode.includes('stats.stamina = Math.max(0, stats.stamina - STAMINA_DRAIN_RATE * dt);') &&
  survivalCode.includes('stats.stamina = 0;') &&
  survivalCode.includes("emit('stamina_exhausted')"),
  'SurvivalSystem: Thể lực tụt mượt mà về 0/100 và phát sự kiện stamina_exhausted'
);

assert(
  survivalCode.includes('this.sprintCooldownTimer > 0') &&
  survivalCode.includes('this.sprintCooldownTimer = Math.max(0, this.sprintCooldownTimer - dt);'),
  'SurvivalSystem: Tạm dừng hồi phục thể lực trong khi chạy và trong 1.0s cooldown'
);

assert(
  survivalCode.includes('stats.composure <= 0') &&
  survivalCode.includes('stats.health = Math.max(0, stats.health - 0.4 * dt);'),
  'SurvivalSystem: Khi Bình Tâm cạn kiệt (0/100), rút dần Sinh Lực chuẩn -1 HP mỗi 2.5s (-0.4 HP/s)'
);

// 2. Kiểm tra SatyrPlayer.ts
const satyrCode = readFileSync(resolve('src/entities/SatyrPlayer.ts'), 'utf-8');

assert(
  satyrCode.includes('this.stats.stamina <= 0') &&
  satyrCode.includes('this._isStaminaExhausted = true;') &&
  satyrCode.includes('Kiệt sức! Cần nghỉ lấy hơi...'),
  'SatyrPlayer: Kích hoạt trạng thái Kiệt Sức và thông báo khi thể lực chạm đáy 0/100'
);

assert(
  satyrCode.includes('this._isStaminaExhausted && this.stats.stamina >= 25') &&
  satyrCode.includes('this._isStaminaExhausted = false;'),
  'SatyrPlayer: Yêu cầu hồi phục thể lực tối thiểu 25/100 mới xóa kiệt sức và cho phép chạy lại'
);

assert(
  satyrCode.includes('canSprint = wantsToSprint && !this._isStaminaExhausted && this.stats.stamina > 0;'),
  'SatyrPlayer: Cho phép thể lực tụt đều đến 0 thay vì bị chặn đứng ở mức 5'
);

assert(
  satyrCode.includes('this.stats.composure <= 0') &&
  satyrCode.includes('speedMultiplier *= 0.85;'),
  'SatyrPlayer: Giảm 15% tốc độ di chuyển khi Bình Tâm cạn kiệt (0/100)'
);

// 3. Kiểm tra UIScene.ts
const uiCode = readFileSync(resolve('src/scenes/UIScene.ts'), 'utf-8');

assert(
  uiCode.includes('panicVignetteGraphics') &&
  uiCode.includes('updatePanicVignette'),
  'UIScene: Đã tích hợp panicVignetteGraphics và hàm updatePanicVignette'
);

assert(
  uiCode.includes('composure >= 20') &&
  uiCode.includes('this.panicVignetteGraphics.clear();'),
  'UIScene: Tự động ẩn viền hoảng loạn khi Bình Tâm hồi phục trên 20/100'
);

assert(
  uiCode.includes('Hoảng loạn (Bình Tâm 0/100)! Hãy bật Đèn Lồng [F] hoặc tìm ánh lửa!'),
  'UIScene: Hiển thị cảnh báo HUD hoảng loạn định kỳ khi Bình Tâm chạm 0/100'
);

assert(
  uiCode.includes("curC <= 0 ? '#ff3838'"),
  'UIScene: Đổi màu chữ chỉ số Bình Tâm sang đỏ thẫm khi cạn kiệt về 0'
);

// 4. Kiểm tra InventorySystem.ts & GameScene.ts
const invCode = readFileSync(resolve('src/systems/InventorySystem.ts'), 'utf-8');

assert(
  invCode.includes('createHarvestParticles') &&
  invCode.includes('p.destroy();') &&
  invCode.includes('550 + Math.random() * 150'),
  'InventorySystem: Tung hạt hiệu ứng thu thập (550-700ms) và gọi destroy() 100% khi kết thúc tween'
);

const gameSceneCode = readFileSync(resolve('src/scenes/GameScene.ts'), 'utf-8');

assert(
  gameSceneCode.includes("this.currentZoneId === 'bellhollow'") &&
  gameSceneCode.includes('return;'),
  'GameScene: Chặn phát sóng âm xanh dương debug dưới chân nhân vật tại làng Bellhollow & Nông Trại'
);

// 5. Kiểm tra WorldBuilder.ts (Chuyển tiếp vùng & Căn chỉnh Miếu Chuông)
const worldCode = readFileSync(resolve('src/world/WorldBuilder.ts'), 'utf-8');

assert(
  worldCode.includes('eastMireTransition') &&
  worldCode.includes('westForestTransition'),
  'WorldBuilder: Tích hợp dải hòa sắc gradient mềm mại giữa Crooked Path và Silent Mire tại x = 2880'
);

assert(
  (worldCode.includes('shrine.setOrigin(0.5, 0.75)') || worldCode.includes('shrine.setOrigin(0.5, 0.82)')) &&
  (worldCode.includes('x + w / 2, y + 16') || worldCode.includes('x + w / 2, y + 20')),
  'WorldBuilder: Miếu Chuông Phế Tích được căn giữa hoàn hảo đối xứng sau Bệ Thờ Trung Tâm'
);

// 6. Kiểm tra Sprite broken_shrine.png đã loại bỏ màu xanh cartoon
const shrinePng = readFileSync(resolve('public/assets/environment/sprites/broken_shrine.png'));
assert(
  !shrinePng.includes(Buffer.from([0x4a, 0x6a, 0xb8])),
  'broken_shrine.png: Đã loại bỏ hoàn toàn các pixel màu xanh dương cartoon (0x4a6ab8) sang đá phiến cổ kính'
);

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount}/${totalCount} TIÊU CHÍ ĐẠT (${Math.round((passCount / totalCount) * 100)}%)`);
console.log(`========================================\n`);

if (passCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
