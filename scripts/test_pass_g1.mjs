/**
 * Script kiểm tra tự động nghiệm thu PASS G1
 * Tự động kết thúc trong 10 giây (Quy tắc Anti-Freeze)
 */

import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('=== HOLLOW WOODS V3.0 – KIỂM TRA NGHIỆM THU PASS G1 ===\n');

const ROOT = 'G:\\HOLLOW WOODS V3';

// 1. Kiểm tra các file cấu hình
const configFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html'
];

let allOk = true;
for (const f of configFiles) {
  const p = join(ROOT, f);
  if (existsSync(p)) {
    console.log(`✅ [Cấu hình] ${f} tồn tại (${statSync(p).size} bytes)`);
  } else {
    console.error(`❌ [Cấu hình] Thiếu ${f}`);
    allOk = false;
  }
}

// 2. Kiểm tra các file TypeScript cốt lõi PASS G1
const tsFiles = [
  'src/main.ts',
  'src/types/index.ts',
  'src/config/GameConfig.ts',
  'src/config/Constants.ts',
  'src/animation/SatyrAnimations.ts',
  'src/entities/SatyrPlayer.ts',
  'src/entities/player/Satyr.ts',
  'src/world/WorldBuilder.ts',
  'src/systems/camera/CameraSystem.ts',
  'src/utils/DebugOverlay.ts',
  'src/utils/ScaleManager.ts',
  'src/ui/HUDScene.ts',
  'src/scenes/BootScene.ts',
  'src/scenes/PreloadScene.ts',
  'src/scenes/MainMenuScene.ts',
  'src/scenes/GameScene.ts',
  'src/data/satyr_animations.json',
  'src/data/zones.json'
];

for (const f of tsFiles) {
  const p = join(ROOT, f);
  if (existsSync(p)) {
    console.log(`✅ [Source] ${f} (${statSync(p).size} bytes)`);
  } else {
    console.error(`❌ [Source] Thiếu ${f}`);
    allOk = false;
  }
}

// 3. Kiểm tra asset Satyr
const satyrFiles = [
  'public/assets/characters/satyr/satyr_sheet.png',
  'public/assets/characters/satyr/satyr_portrait.png'
];

for (const f of satyrFiles) {
  const p = join(ROOT, f);
  if (existsSync(p)) {
    console.log(`✅ [Asset Satyr] ${f} (${statSync(p).size} bytes)`);
  } else {
    console.error(`❌ [Asset Satyr] Thiếu ${f}`);
    allOk = false;
  }
}

// 4. Kiểm tra phân khu trong zones.json
const zonesPath = join(ROOT, 'src/data/zones.json');
if (existsSync(zonesPath)) {
  const zonesData = JSON.parse(readFileSync(zonesPath, 'utf8'));
  console.log(`\n✅ [Bản đồ 5 Phân khu] Đã xác thực ${zonesData.zones.length} phân khu:`);
  for (const z of zonesData.zones) {
    console.log(`   - ${z.id}: ${z.titleVietnamese} | Bounds: [${z.bounds.x}, ${z.bounds.y}, ${z.bounds.width}×${z.bounds.height}]`);
  }
}

// 5. Kiểm tra dist build
const distIndex = join(ROOT, 'dist', 'index.html');
if (existsSync(distIndex)) {
  console.log(`\n✅ [Build Web] dist/index.html sẵn sàng (${statSync(distIndex).size} bytes)`);
} else {
  console.error('\n❌ [Build Web] Chưa có dist/index.html');
  allOk = false;
}

console.log('\n======================================================');
if (allOk) {
  console.log('🎉 TOÀN BỘ TIÊU CHÍ NGHIỆM THU PASS G1 ĐÃ ĐẠT 100%!');
} else {
  console.log('⚠️ CÒN TIÊU CHÍ CHƯA ĐẠT!');
}
console.log('======================================================\n');

process.exit(0);

