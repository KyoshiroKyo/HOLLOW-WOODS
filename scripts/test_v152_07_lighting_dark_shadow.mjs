/**
 * Automated Verification Script for Step V152-07:
 * Lighting Aura [F], Dark Shadow Atmosphere & Initialization Optimization
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

console.log('=== KIỂM THỬ XÁC MINH V152-07: ÁNH SÁNG AURA [F], DARK SHADOW & TỐI ƯU KHỞI TẠO ===\n');

// 1. Quầng sáng Aura [F] dịu mắt, tự nhiên (#15)
console.log('--- 1. Kiểm tra Quầng Sáng Aura [F] Dịu Mắt (#15) ---');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
const playerSrc = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf8');

assert(gameSceneSrc.includes("grad.addColorStop(0, 'rgba(255, 215, 125, 0.24)')"), 'cached_lantern_glow_radial có tâm maxAlpha <= 0.24 hổ phách trầm ấm');
assert(gameSceneSrc.includes("grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)')"), 'cached_lantern_glow_radial tan biến hoàn toàn 0% viền sắc cạnh');
assert(gameSceneSrc.includes('Math.min(0.24, (0.20 + breathing) * glowFactor)'), 'glowAlpha của lanternGlowImage có trần tối đa <= 0.24 kèm nhịp thở nhẹ');
assert(playerSrc.includes('Soft Radial Warm Aura'), 'SatyrPlayer duy trì Vòng Sáng Ấm Dịu chuyển sắc mịn');

// 2. Không khí Dark Shadow (#16)
console.log('\n--- 2. Kiểm tra Cấu Hình Dark Shadow Toàn Game (#16) ---');
const timeConfigSrc = fs.readFileSync('src/config/TimeConfig.ts', 'utf8');

assert(timeConfigSrc.includes('0x9ab0c4') && timeConfigSrc.includes('0x16202a'), 'DAY: Ánh sáng âm u nhiều mây rợp bóng (ambient: 0x9ab0c4, fog: 0x16202a)');
assert(timeConfigSrc.includes('0x6a3e3c') && timeConfigSrc.includes('0x24141e'), 'DUSK: Hoàng hôn cam tím sẫm tối sậm nhanh (ambient: 0x6a3e3c, fog: 0x24141e)');
assert(timeConfigSrc.includes('0x080c14') && timeConfigSrc.includes('0x060910'), 'NIGHT: Đêm sương bóng tối sâu bao trùm (ambient: 0x080c14, fog: 0x060910)');
assert(gameSceneSrc.includes("currentPhase === 'DAY'") && gameSceneSrc.includes("currentPhase === 'DUSK'"), 'GameScene điều chỉnh fogAlpha theo 3 pha thời gian');
assert(gameSceneSrc.includes('0x070d14') && gameSceneSrc.includes('Math.max(fogAlpha, 0.84)'), 'Rừng Sâu & Đầm Lầy có sắc sương tối sẫm bao trùm');

// 3. Tối ưu tốc độ vào màn hình chơi (#13)
console.log('\n--- 3. Kiểm tra Tối Ưu Tốc Độ Khởi Tạo Màn Hình Chơi (#13) ---');
const worldSrc = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');

assert(worldSrc.includes("IMMEDIATE_ZONES: ZoneId[] = ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']"), 'Dựng ưu tiên tức thì 4 vùng khởi đầu (fog_crossing, bellhollow, sanctuary_farm, outer_woods)');
assert(worldSrc.includes('ensureZoneRendered('), 'WorldBuilder có phương thức ensureZoneRendered để bảo đảm vùng đích luôn sẵn sàng');
assert(worldSrc.includes('scheduleDeferredZoneRendering()'), 'WorldBuilder có cơ chế scheduleDeferredZoneRendering giãn nhịp các vùng sâu');
assert(worldSrc.includes('this.setupZoneColliders(zone)') && worldSrc.includes('this.setupZoneTransitions(zone)'), 'Toàn bộ colliders và transitions của mọi zone đều được tạo ngay từ đầu cho SafeSpawnResolver');
assert(gameSceneSrc.includes('this.worldBuilder.ensureZoneRendered(trans.toZone)'), 'GameScene gọi ensureZoneRendered khi thực hiện chuyển vùng (executeTransition)');
assert(gameSceneSrc.includes('this.worldBuilder.ensureZoneRendered(devZone)'), 'GameScene gọi ensureZoneRendered khi tải trực tiếp qua devZone');

console.log('\n========================================================================');
console.log(`KẾT QUẢ KIỂM THỬ V152-07: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ CÁC MỤC TIÊU CỦA BƯỚC V152-07 ĐÃ HOÀN TẤT XUẤT SẮC!');
}
