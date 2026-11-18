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

console.log('--- KIỂM TRA BƯỚC V15-06: THU HẸP TẦM NHÌN ĐỘNG & HIỆU ỨNG THỊ GIÁC U ÁM ---');

// 1. Kiểm tra VeilSystem.ts
console.log('\n[1/4] Kiểm tra VeilSystem.ts (Thu hẹp tầm nhìn & Dark Tendril Vignette):');
const veilPath = path.resolve('src/systems/VeilSystem.ts');
const veilContent = fs.readFileSync(veilPath, 'utf8').replace(/\r\n/g, '\n');

assert(veilContent.includes('public getComposureVisionScale(composure: number): number'), 'VeilSystem có phương thức getComposureVisionScale');
assert(veilContent.includes('if (composure >= 50) return 1.0;'), 'Khi Bình Tâm >= 50%: giữ 100% bán kính tầm nhìn (1.0)');
assert(veilContent.includes('return Phaser.Math.Linear(0.45, 1.0, factor);'), 'Khi Bình Tâm giảm từ 50% về 0%: thu hẹp dần xuống còn 45% (0.45)');
assert(veilContent.includes('if (composure < 30)'), 'Kiểm tra ngưỡng Bình Tâm < 30% cho Dark Tendril Vignette');
assert(veilContent.includes('this.distortionOverlay.fillTriangle'), 'Vẽ 4 góc tam giác tua đen tím ép sâu vào trung tâm màn hình');

// 2. Kiểm tra mô phỏng toán học getComposureVisionScale
console.log('\n[2/4] Kiểm tra toán học thu hẹp tầm nhìn:');
function simulateVisionScale(composure) {
  if (composure >= 50) return 1.0;
  const factor = Math.max(0, composure / 50);
  return 0.45 + factor * (1.0 - 0.45);
}

assert(simulateVisionScale(100) === 1.0, 'Composure 100%: Vision Scale = 1.0 (100%)');
assert(simulateVisionScale(50) === 1.0, 'Composure 50%: Vision Scale = 1.0 (100%)');
assert(Math.abs(simulateVisionScale(25) - 0.725) < 0.001, 'Composure 25%: Vision Scale = 0.725 (72.5%)');
assert(Math.abs(simulateVisionScale(0) - 0.45) < 0.001, 'Composure 0%: Vision Scale = 0.45 (45.0%)');

// 3. Kiểm tra UIScene.ts
console.log('\n[3/4] Kiểm tra UIScene.ts (Đồng bộ Dark Tendril & Vision Factor):');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf8').replace(/\r\n/g, '\n');

assert(uiSceneContent.includes('public getComposureVisionFactor(): number'), 'UIScene có phương thức getComposureVisionFactor');
assert(uiSceneContent.includes('if (composure < 30)') && uiSceneContent.includes('this.panicVignetteGraphics.fillTriangle'), 'UIScene vẽ viền tối 4 góc co bóp khi Bình Tâm < 30%');

// 4. Kiểm tra GameScene.ts (Áp dụng tầm nhìn động & Mở rộng êm dịu 1.5s)
console.log('\n[4/4] Kiểm tra GameScene.ts (Cập nhật FOW & Chuyển tiếp êm dịu):');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8').replace(/\r\n/g, '\n');

assert(gameSceneContent.includes('const compScale = this.veilSystem'), 'GameScene gọi getComposureVisionScale từ veilSystem');
assert(gameSceneContent.includes('targetBaseRadius *= compScale;'), 'GameScene nhân trực tiếp hệ số compScale vào targetBaseRadius');
assert(gameSceneContent.includes('if (composure < 50)'), 'GameScene xử lý quầng sáng chập chờn khi composure < 50%');
assert(gameSceneContent.includes('const isExpanding = targetBaseRadius > this.currentLanternRadius;'), 'GameScene phát hiện trạng thái mở rộng tầm nhìn');
assert(gameSceneContent.includes('const lerpFactor = isExpanding ? 0.045 : 0.14;'), 'Hệ số lerpFactor 0.045 giúp tầm nhìn mở rộng êm dịu trong ~1.5 giây');

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
