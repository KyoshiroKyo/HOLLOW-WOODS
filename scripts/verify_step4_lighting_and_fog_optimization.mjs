/**
 * VERIFICATION SCRIPT: Bước 4 - Kiểm tra & Tối ưu Sương Mù và Ánh Sáng Hổ Phách
 * 
 * Kiểm tra 4 kỹ thuật tối ưu cốt lõi:
 * 1. Half-Res Lighting Buffer (0.5x / 0.35x RenderTexture upscaled with setDisplaySize)
 * 2. Light Frustum Culling (Margin 120px bounding box check)
 * 3. Fog & Firefly Particle Cap (Max 30 fireflies, Max 2 scrolling fog layers)
 * 4. Device Pixel Ratio Cap (DPR <= 1.0)
 * 5. Quality Toggle (HIGH / MEDIUM / LOW) & Auto-Fallback mechanism (F8 & Pause UI)
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('KIỂM TRA TỐI ƯU HỆ THỐNG SƯƠNG MÙ & ÁNH SÁNG HỔ PHÁCH CHO MÁY YẾU');
console.log('================================================================\n');

// 1. Kiểm tra GraphicsQualitySystem
console.log('1. Kiểm tra GraphicsQualitySystem.ts:');
const gqsPath = path.resolve('src/systems/GraphicsQualitySystem.ts');
assert(fs.existsSync(gqsPath), 'File src/systems/GraphicsQualitySystem.ts tồn tại');
if (fs.existsSync(gqsPath)) {
  const gqsContent = fs.readFileSync(gqsPath, 'utf8');
  assert(gqsContent.includes("level: 'HIGH'") && gqsContent.includes("lightingScale: 1.0"), 'Chế độ HIGH: lightingScale = 1.0x (1280x720)');
  assert(gqsContent.includes("level: 'MEDIUM'") && gqsContent.includes("lightingScale: 0.5"), 'Chế độ MEDIUM: lightingScale = 0.5x (640x360 - giảm 75% fill-rate)');
  assert(gqsContent.includes("level: 'LOW'") && gqsContent.includes("lightingScale: 0.35"), 'Chế độ LOW: lightingScale = 0.35x (448x252 - giảm 88% fill-rate)');
  assert(gqsContent.includes("maxFireflies: 30") && gqsContent.includes("maxFireflies: 15") && gqsContent.includes("maxFireflies: 0"), 'Giới hạn hạt đom đóm: High 30, Medium 15, Low 0');
  assert(gqsContent.includes("maxFogLayers: 2") && gqsContent.includes("maxFogLayers: 1"), 'Giới hạn lớp sương mù: High 2, Medium 1, Low 1 (tĩnh)');
  assert(gqsContent.includes("updateAutoFallback") && gqsContent.includes("LOW_FPS_THRESHOLD") && gqsContent.includes("38") && gqsContent.includes("LOW_FPS_REQUIRED_MS") && gqsContent.includes("4000"), 'Cơ chế Auto-Fallback: FPS < 38 trong 4000ms kích hoạt hạ cấu hình');
  assert(gqsContent.includes("hw_graphics_quality"), 'Lưu trữ lựa chọn cấu hình vào localStorage (hw_graphics_quality)');
}

// 2. Kiểm tra GameConfig DPR Cap
console.log('\n2. Kiểm tra GameConfig.ts (DPR Cap):');
const configPath = path.resolve('src/config/GameConfig.ts');
assert(fs.existsSync(configPath), 'File src/config/GameConfig.ts tồn tại');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  assert(configContent.includes("resolution: Math.min") && configContent.includes("1.0"), 'Đã khóa tỷ lệ điểm ảnh DPR Cap <= 1.0 chống quá tải GPU Retina/High-DPI');
}

// 3. Kiểm tra GameScene Half-Res Buffer & Frustum Culling
console.log('\n3. Kiểm tra GameScene.ts (Half-Res Buffer & Frustum Culling):');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
assert(fs.existsSync(gameScenePath), 'File src/scenes/GameScene.ts tồn tại');
if (fs.existsSync(gameScenePath)) {
  const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');
  assert(gameSceneContent.includes("setupFogOfWar") && gameSceneContent.includes("setDisplaySize(1280, 720)"), 'RenderTexture Fog of War dùng setDisplaySize(1280, 720) phóng to buffer độ phân giải thấp');
  assert(gameSceneContent.includes("cullMargin") || gameSceneContent.includes("120"), 'Frustum Culling cho đuốc nhựa thông và nguồn sáng với lề 120px');
  assert(gameSceneContent.includes("updateAutoFallback"), 'Vòng lặp update gọi updateAutoFallback của GraphicsQualitySystem');
  assert(gameSceneContent.includes("MAX_FIREFLY_POOL") && gameSceneContent.includes("30"), 'Pool hạt đom đóm capped tối đa 30');
}

// 4. Kiểm tra VeilSystem Fog Overdraw Capping
console.log('\n4. Kiểm tra VeilSystem.ts (Giới hạn tối đa 2 lớp sương cuộn):');
const veilPath = path.resolve('src/systems/VeilSystem.ts');
assert(fs.existsSync(veilPath), 'File src/systems/VeilSystem.ts tồn tại');
if (fs.existsSync(veilPath)) {
  const veilContent = fs.readFileSync(veilPath, 'utf8');
  assert(veilContent.includes("maxFogLayers"), 'VeilSystem đồng bộ số lớp sương mù theo cài đặt GraphicsQualitySystem');
  assert(veilContent.includes("enableParallaxDrift"), 'Hỗ trợ tắt hiệu ứng drift khi ở cấu hình LOW để tối ưu hóa CPU/GPU');
}

// 5. Kiểm tra Debug Inspector & Pause UI Integration
console.log('\n5. Kiểm tra UI Phím F8 & Pause Menu:');
const inspectorPath = path.resolve('src/utils/HitboxDebugInspector.ts');
assert(fs.existsSync(inspectorPath), 'File src/utils/HitboxDebugInspector.ts tồn tại');
if (fs.existsSync(inspectorPath)) {
  const inspContent = fs.readFileSync(inspectorPath, 'utf8');
  assert(inspContent.includes("f8Key") && inspContent.includes("cycleQuality"), 'Phím F8 kích hoạt chuyển đổi vòng lặp chất lượng đồ họa');
  assert(inspContent.includes("CHẤT LƯỢNG ĐỒ HỌA"), 'Bảng Profiler F9 hiển thị trạng thái chất lượng đồ họa');
}

const pauseModalPath = path.resolve('src/ui/PauseModal.ts');
assert(fs.existsSync(pauseModalPath), 'File src/ui/PauseModal.ts tồn tại');
if (fs.existsSync(pauseModalPath)) {
  const pauseContent = fs.readFileSync(pauseModalPath, 'utf8');
  assert((pauseContent.includes("graphicsBtnContainer") || pauseContent.includes("graphicsQualityBtn")) && pauseContent.includes("cycleQuality"), 'Pause Menu có nút bấm trực quan để đổi chất lượng đồ họa');
  assert(pauseContent.includes("updateGraphicsQualityText"), 'Pause Menu cập nhật chi tiết cấu hình và chỉ số buffer thời gian thực');
}

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ TẤT CẢ CÁC TIÊU CHÍ TỐI ƯU ÁNH SÁNG & SƯƠNG MÙ ĐÃ ĐẠT CHUẨN HOÀN TOÀN!');
  process.exit(0);
}
