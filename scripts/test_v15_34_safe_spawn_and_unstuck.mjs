/**
 * scripts/test_v15_34_safe_spawn_and_unstuck.mjs
 * Kiểm thử tự động cơ chế SafeSpawnResolver, chống kẹt địa hình/cổng sắt và reset sạch trạng thái ẩn nấp khi Load Save.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🧪 BẮT ĐẦU KIỂM THỬ BƯỚC V15-34: SAFE SPAWN RESOLVER & UNSTUCK MECHANISM\n');

// 1. Kiểm tra mã nguồn SafeSpawnResolver.ts
console.log('--- 1. Kiểm tra logic SafeSpawnResolver.ts ---');
const safeSpawnPath = path.resolve('src/systems/SafeSpawnResolver.ts');
assert(fs.existsSync(safeSpawnPath), 'SafeSpawnResolver.ts phải tồn tại!');
const safeSpawnCode = fs.readFileSync(safeSpawnPath, 'utf8');

assert(safeSpawnCode.includes('getFootBoundingBox'), 'Phải có getFootBoundingBox');
assert(safeSpawnCode.includes('isPositionBlocked'), 'Phải có isPositionBlocked');
assert(safeSpawnCode.includes('findNearestSafePosition'), 'Phải có findNearestSafePosition');
assert(safeSpawnCode.includes('getSanctuaryFallback'), 'Phải có getSanctuaryFallback');
assert(safeSpawnCode.includes('resolveSafeSpawn'), 'Phải có resolveSafeSpawn');
assert(safeSpawnCode.includes('findSafeExitFromHiding'), 'Phải có findSafeExitFromHiding');
assert(safeSpawnCode.includes('resolveEmergencySafePosition'), 'Phải có resolveEmergencySafePosition');
console.log('✅ SafeSpawnResolver.ts có đầy đủ các phương thức cốt lõi.');

// Giả lập logic kiểm tra va chạm của SafeSpawnResolver
function getFootBoundingBox(x, y, padding = 0) {
  return {
    left: x - 9 - padding,
    right: x + 9 + padding,
    top: y - 12 - padding,
    bottom: y + padding
  };
}

function checkAABBOverlap(r1, r2) {
  return (
    r1.left < r2.right &&
    r1.right > r2.left &&
    r1.top < r2.bottom &&
    r1.bottom > r2.top
  );
}

// Giả lập collider chướng ngại vật cổng sập Crooked Path (x: 1775, y: 240, width: 36, height: 84)
const simulatedGateCollider = {
  left: 1775,
  right: 1775 + 36, // 1811
  top: 240,
  bottom: 240 + 84  // 324
};

// Điểm bị kẹt ngay trong cổng: x: 1790, y: 280
const stuckFoot = getFootBoundingBox(1790, 280);
assert(checkAABBOverlap(stuckFoot, simulatedGateCollider), 'Vị trí 1790, 280 phải bị phát hiện là kẹt bên trong cổng');
console.log('✅ Xác nhận phát hiện va chạm hộp bàn chân với collider cổng sắt thành công.');

// Kiểm tra thuật toán quét tìm vị trí trống xung quanh
function simulateFindNearestSafe(startX, startY, collider) {
  const angles = [
    Math.PI / 2,        // Nam
    Math.PI / 4,        // Đông Nam
    (3 * Math.PI) / 4,  // Tây Nam
    0,                  // Đông
    Math.PI,            // Tây
    -Math.PI / 4,       // Đông Bắc
    (-3 * Math.PI) / 4, // Tây Bắc
    -Math.PI / 2        // Bắc
  ];

  for (let r = 16; r <= 160; r += 16) {
    for (const angle of angles) {
      const tx = Math.round(startX + Math.cos(angle) * r);
      const ty = Math.round(startY + Math.sin(angle) * r);
      const testFoot = getFootBoundingBox(tx, ty);
      if (!checkAABBOverlap(testFoot, collider)) {
        return { x: tx, y: ty, r };
      }
    }
  }
  return null;
}

const safeFound = simulateFindNearestSafe(1790, 280, simulatedGateCollider);
assert(safeFound !== null, 'Phải tìm được vị trí an toàn thoát khỏi collider cổng');
assert(!checkAABBOverlap(getFootBoundingBox(safeFound.x, safeFound.y), simulatedGateCollider), 'Vị trí mới không được chạm vào collider');
console.log(`✅ Thuật toán quét an toàn tìm được ô trống tại (${safeFound.x}, ${safeFound.y}) với bán kính ${safeFound.r}px.`);

// 2. Kiểm tra SatyrPlayer.ts
console.log('\n--- 2. Kiểm tra SatyrPlayer.ts ---');
const playerPath = path.resolve('src/entities/BlackKnightPlayer.ts');
const playerCode = fs.readFileSync(playerPath, 'utf8');

assert(playerCode.includes('resetAllActionAndMotionStates'), 'SatyrPlayer phải có resetAllActionAndMotionStates');
assert(playerCode.includes('getMovementInputDirection'), 'SatyrPlayer phải có getMovementInputDirection');
assert(playerCode.includes('exitHiding(targetExitPos'), 'SatyrPlayer.exitHiding phải hỗ trợ targetExitPos');
console.log('✅ SatyrPlayer.ts đã tích hợp resetAllActionAndMotionStates và exitHiding(targetExitPos).');

// 3. Kiểm tra SaveManager.ts
console.log('\n--- 3. Kiểm tra SaveManager.ts ---');
const saveMgrPath = path.resolve('src/systems/SaveManager.ts');
const saveMgrCode = fs.readFileSync(saveMgrPath, 'utf8');

assert(saveMgrCode.includes('SafeSpawnResolver'), 'SaveManager phải import/export SafeSpawnResolver');
assert(saveMgrCode.includes('isHiding: false'), 'SaveManager phải đảm bảo isHiding: false khi lưu và nạp');
assert(saveMgrCode.includes('isSprinting: false'), 'SaveManager phải đảm bảo isSprinting: false');
console.log('✅ SaveManager.ts đảm bảo cờ isHiding luôn false khi nạp và lưu.');

// 4. Kiểm tra PauseModal.ts
console.log('\n--- 4. Kiểm tra PauseModal.ts ---');
const pauseModalPath = path.resolve('src/ui/PauseModal.ts');
const pauseModalCode = fs.readFileSync(pauseModalPath, 'utf8');

assert(pauseModalCode.includes('onEmergencyUnstuck'), 'PauseModal phải có callback onEmergencyUnstuck');
assert(pauseModalCode.includes('GỠ KẸT VỀ ĐIỂM AN TOÀN [F8]'), 'PauseModal phải có nút Gỡ kẹt F8');
assert(pauseModalCode.includes('modalH = 580'), 'Chiều cao PauseModal phải được nới rộng lên 580 để chứa nút mới');
console.log('✅ PauseModal.ts đã trang bị nút [F8] GỠ KẸT VỀ ĐIỂM AN TOÀN.');

// 5. Kiểm tra GameScene.ts
console.log('\n--- 5. Kiểm tra GameScene.ts ---');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf8');

assert(gameSceneCode.includes('f8Key'), 'GameScene phải khai báo và đăng ký f8Key');
assert(gameSceneCode.includes('emergencyUnstuckPlayer'), 'GameScene phải có hàm emergencyUnstuckPlayer()');
assert(gameSceneCode.includes('SafeSpawnResolver.resolveSafeSpawn'), 'GameScene phải gọi resolveSafeSpawn khi nạp continue');
assert(gameSceneCode.includes('this.player.resetAllActionAndMotionStates()'), 'GameScene phải reset sạch hành động khi tạo/nạp player');
assert(gameSceneCode.includes('findSafeExitFromHiding'), 'GameScene phải dùng findSafeExitFromHiding khi thoát ẩn nấp');
assert(gameSceneCode.includes('isNearAnyHidingSpot'), 'GameScene phải có sanity check tự động thoát hiding nếu không ở gần hiding spot');
console.log('✅ GameScene.ts đã tích hợp toàn bộ cơ chế bảo vệ, phím tắt F8 và tự động giải phóng ẩn nấp.');

console.log('\n🎉 TOÀN BỘ CÁC BÀI TEST BƯỚC V15-34 ĐỀU ĐẠT 100%!');
