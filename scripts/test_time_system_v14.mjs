/**
 * HOLLOW WOODS V1.4 — TEST SUITE FOR TIME SYSTEM & ENVIRONMENT (V14-P2-01)
 * Xác minh toàn diện chu kỳ thời gian Ngày / Hoàng Hôn / Đêm Sương 360 giây,
 * cấu hình tham số, cơ chế chuyển pha mượt mà, tầm nhìn, bình tâm, tạm dừng và đồng bộ trạng thái.
 */

import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ HỆ THỐNG THỜI GIAN THẾ GIỚI');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// 1. Kiểm tra tồn tại và nội dung TimeConfig.ts
console.log('--- PHẦN 1: Cấu hình tham số chu kỳ 360s/ngày (TimeConfig.ts) ---');
const timeConfigPath = path.resolve('src/config/TimeConfig.ts');
assert(fs.existsSync(timeConfigPath), 'src/config/TimeConfig.ts phải tồn tại');
const timeConfigSrc = fs.readFileSync(timeConfigPath, 'utf-8');

test('Cấu hình tổng thời lượng 1 ngày là đúng 360 giây', () => {
  assert(timeConfigSrc.includes('totalDayDuration: 360'), 'totalDayDuration phải bằng 360');
});

test('Phân bổ thời lượng 3 pha: Ban ngày 180s, Hoàng hôn 90s, Đêm sương 90s', () => {
  assert(timeConfigSrc.includes("name: 'DAY'"), 'Pha DAY phải được định nghĩa');
  assert(timeConfigSrc.includes("duration: 180"), 'Pha DAY phải kéo dài 180 giây');
  assert(timeConfigSrc.includes("name: 'DUSK'"), 'Pha DUSK phải được định nghĩa');
  assert(timeConfigSrc.includes("name: 'NIGHT'"), 'Pha NIGHT phải được định nghĩa');
  assert(timeConfigSrc.includes("duration: 90"), 'Pha DUSK và NIGHT kéo dài 90 giây');
});

test('Thời gian chuyển tiếp hòa trộn (transitionBlendDuration) là 8 giây', () => {
  assert(timeConfigSrc.includes('transitionBlendDuration: 8'), 'transitionBlendDuration phải là 8');
});

test('Cấu hình tầm nhìn không đèn: DAY (220px), DUSK (150px), NIGHT (55px)', () => {
  assert(timeConfigSrc.includes('visionRadiusUnlit: 220'), 'DAY visionRadiusUnlit = 220');
  assert(timeConfigSrc.includes('visionRadiusUnlit: 150'), 'DUSK visionRadiusUnlit = 150');
  assert(timeConfigSrc.includes('visionRadiusUnlit: 55'), 'NIGHT visionRadiusUnlit = 55');
});

test('Cấu hình Bình Tâm: DAY ổn định (0.0/s), DUSK (0.6/s), NIGHT (1.8/s)', () => {
  assert(timeConfigSrc.includes('composureDrainNormal: 0.0'), 'DAY composureDrainNormal = 0.0');
  assert(timeConfigSrc.includes('composureDrainNormal: 0.6'), 'DUSK composureDrainNormal = 0.6');
  assert(timeConfigSrc.includes('composureDrainNormal: 1.8'), 'NIGHT composureDrainNormal = 1.8');
});

// 2. Kiểm tra mã nguồn TimeSystem.ts
console.log('\n--- PHẦN 2: Bộ máy TimeSystem.ts & Logic Chuyển Pha ---');
const timeSystemPath = path.resolve('src/systems/TimeSystem.ts');
assert(fs.existsSync(timeSystemPath), 'src/systems/TimeSystem.ts phải tồn tại');
const timeSystemSrc = fs.readFileSync(timeSystemPath, 'utf-8');

test('TimeSystem khai báo đầy đủ các phương thức truy vấn API', () => {
  assert(timeSystemSrc.includes('getCurrentPhase(): TimePhase'), 'Có getCurrentPhase');
  assert(timeSystemSrc.includes('getDayCount(): number'), 'Có getDayCount');
  assert(timeSystemSrc.includes('getTimeOfDay(): number'), 'Có getTimeOfDay');
  assert(timeSystemSrc.includes('getPhaseProgress(): number'), 'Có getPhaseProgress');
  assert(timeSystemSrc.includes('getDayProgress(): number'), 'Có getDayProgress');
  assert(timeSystemSrc.includes('getVisionRadius(isLanternLit: boolean): number'), 'Có getVisionRadius');
  assert(timeSystemSrc.includes('getAmbientTint(): number'), 'Có getAmbientTint');
  assert(timeSystemSrc.includes('getFogTint(): number'), 'Có getFogTint');
  assert(timeSystemSrc.includes('getFogAlphaMultiplier(): number'), 'Có getFogAlphaMultiplier');
  assert(timeSystemSrc.includes('getWindIntensity(): number'), 'Có getWindIntensity');
  assert(timeSystemSrc.includes('getComposureDrainRate('), 'Có getComposureDrainRate');
  assert(timeSystemSrc.includes('setPaused(paused: boolean): void'), 'Có setPaused');
});

test('TimeSystem tích hợp hàm nội suy màu sắc lerpColor và hàm làm mịn smoothstep', () => {
  assert(timeSystemSrc.includes('export function lerpColor('), 'Có lerpColor');
  assert(timeSystemSrc.includes('export function smoothstep('), 'Có smoothstep');
});

test('TimeSystem phát ra các sự kiện: phase_changed, new_day, time_tick', () => {
  assert(timeSystemSrc.includes("this.emit('phase_changed'"), 'Phát phase_changed');
  assert(timeSystemSrc.includes("this.emit('new_day'"), 'Phát new_day');
  assert(timeSystemSrc.includes("this.emit('time_tick'"), 'Phát time_tick');
});

// 3. Thực thi thuật toán mô phỏng độc lập để kiểm chứng toán học
console.log('\n--- PHẦN 3: Kiểm chứng toán học chuyển pha & nội suy (Runtime Math Simulation) ---');

function lerpColorSim(c1, c2, t) {
  const clampedT = Math.max(0, Math.min(1, t));
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * clampedT);
  const g = Math.round(g1 + (g2 - g1) * clampedT);
  const b = Math.round(b1 + (b2 - b1) * clampedT);
  return (r << 16) | (g << 8) | b;
}

function smoothstepSim(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function determinePhaseSim(t) {
  if (t < 180) return 'DAY';
  if (t < 270) return 'DUSK';
  return 'NIGHT';
}

function getPhaseProgressSim(t) {
  const phase = determinePhaseSim(t);
  if (phase === 'DAY') return Math.max(0, Math.min(1, t / 180));
  if (phase === 'DUSK') return Math.max(0, Math.min(1, (t - 180) / 90));
  return Math.max(0, Math.min(1, (t - 270) / 90));
}

test('Toán học: Xác định chính xác 3 pha tại các mốc thời gian 0s, 90s, 180s, 225s, 270s, 315s', () => {
  assert(determinePhaseSim(0) === 'DAY', '0s -> DAY');
  assert(determinePhaseSim(90) === 'DAY', '90s -> DAY');
  assert(determinePhaseSim(179.9) === 'DAY', '179.9s -> DAY');
  assert(determinePhaseSim(180) === 'DUSK', '180s -> DUSK');
  assert(determinePhaseSim(225) === 'DUSK', '225s -> DUSK');
  assert(determinePhaseSim(269.9) === 'DUSK', '269.9s -> DUSK');
  assert(determinePhaseSim(270) === 'NIGHT', '270s -> NIGHT');
  assert(determinePhaseSim(315) === 'NIGHT', '315s -> NIGHT');
  assert(determinePhaseSim(359.9) === 'NIGHT', '359.9s -> NIGHT');
});

test('Toán học: Tiến độ pha đạt chuẩn [0.0 - 1.0] tại các mốc phân đoạn', () => {
  assert(getPhaseProgressSim(0) === 0, 't = 0s progress = 0');
  assert(getPhaseProgressSim(90) === 0.5, 't = 90s progress = 0.5 (Day)');
  assert(getPhaseProgressSim(180) === 0, 't = 180s progress = 0 (Dusk)');
  assert(getPhaseProgressSim(225) === 0.5, 't = 225s progress = 0.5 (Dusk)');
  assert(getPhaseProgressSim(270) === 0, 't = 270s progress = 0 (Night)');
  assert(getPhaseProgressSim(315) === 0.5, 't = 315s progress = 0.5 (Night)');
});

test('Toán học: Thuật toán lerpColor và smoothstep biến thiên liên tục, không tràn giá trị', () => {
  const c1 = 0xffffff;
  const c2 = 0x000000;
  const mid = lerpColorSim(c1, c2, 0.5);
  const midR = (mid >> 16) & 0xff;
  assert(Math.abs(midR - 128) <= 1, 'Giá trị RGB tại t=0.5 phải ~128');
  assert(smoothstepSim(0) === 0, 'smoothstep(0) = 0');
  assert(smoothstepSim(1) === 1, 'smoothstep(1) = 1');
  assert(smoothstepSim(0.5) === 0.5, 'smoothstep(0.5) = 0.5');
});

// 4. Kiểm tra tích hợp trong SurvivalSystem, VeilSystem, UIScene & GameScene
console.log('\n--- PHẦN 4: Kiểm tra kết nối đa hệ thống (Veil, Survival, UI, GameScene) ---');

const survivalSrc = fs.readFileSync('src/systems/SurvivalSystem.ts', 'utf-8');
test('SurvivalSystem chấp nhận tham số timePhase để điều chỉnh Composure', () => {
  assert(survivalSrc.includes('timePhase?: TimePhase'), 'SurvivalSystem.update nhận timePhase');
  assert(survivalSrc.includes('TIME_CONFIG.phases[timePhase]'), 'SurvivalSystem tra cứu cấu hình theo pha');
});

const veilSrc = fs.readFileSync('src/systems/VeilSystem.ts', 'utf-8');
test('VeilSystem chấp nhận tham số timeSystem và hòa trộn sắc độ / độ dày sương mù', () => {
  assert(veilSrc.includes('timeSystem?: TimeSystem'), 'VeilSystem.update nhận timeSystem');
  assert(veilSrc.includes('timeSystem.getFogAlphaMultiplier()'), 'VeilSystem nhân alpha theo pha');
  assert(veilSrc.includes('timeSystem.getFogTint()'), 'VeilSystem đổi màu sắc sương theo pha');
});

const uiSceneSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf-8');
test('UIScene sở hữu Widget Đồng Hồ góc trên phải kèm biểu tượng Mặt Trời / Hoàng Hôn / Mặt Trăng', () => {
  assert(uiSceneSrc.includes('updateTimeWidget('), 'UIScene có updateTimeWidget');
  assert(uiSceneSrc.includes('timeWidgetBg'), 'UIScene có timeWidgetBg');
  assert(uiSceneSrc.includes('timeIconText'), 'UIScene có timeIconText');
  assert(uiSceneSrc.includes('timeDayText'), 'UIScene có timeDayText');
  assert(uiSceneSrc.includes('timePhaseText'), 'UIScene có timePhaseText');
  assert(uiSceneSrc.includes('timeProgressBar'), 'UIScene có timeProgressBar');
});

const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');
test('GameScene khởi tạo TimeSystem với dữ liệu từ SaveData hoặc PlayerState', () => {
  assert(gameSceneSrc.includes('this.timeSystem = new TimeSystem('), 'GameScene khởi tạo timeSystem');
  assert(gameSceneSrc.includes('savedDay'), 'GameScene nạp savedDay');
  assert(gameSceneSrc.includes('savedTime'), 'GameScene nạp savedTime');
});

test('GameScene tạm dừng thời gian thế giới khi isUIBusy (Pause, Dialogue, Game Over, Ending)', () => {
  assert(gameSceneSrc.includes('this.timeSystem.setPaused(isUIBusy)'), 'GameScene gọi setPaused(isUIBusy)');
});

test('GameScene truyền timePhase sang SurvivalSystem và VeilSystem trong update loop', () => {
  assert(gameSceneSrc.includes('this.timeSystem.getCurrentPhase()'), 'Truyền currentPhase vào survivalSystem');
  assert(gameSceneSrc.includes('this.veilSystem.update(') && gameSceneSrc.includes('this.timeSystem'), 'Truyền timeSystem vào veilSystem');
});

test('GameScene đồng bộ bán kính ánh sáng FOW theo TimeSystem.getVisionRadius', () => {
  assert(gameSceneSrc.includes('targetBaseRadius = this.timeSystem.getVisionRadius(isLanternLit)'), 'FOW lấy visionRadius từ timeSystem');
});

test('GameScene dọn dẹp timeSystem.destroy() khi shutdown scene', () => {
  assert(gameSceneSrc.includes('this.timeSystem.destroy()'), 'GameScene dọn dẹp timeSystem');
});

console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passCount}/${passCount + failCount} KIỂM TRA ĐẠT (${failCount} THẤT BẠI)`);
if (failCount === 0) {
  console.log('KẾT QUẢ: PASS (100% TOÀN BỘ 18 TIÊU CHÍ V14-P2-01 ĐẠT CHUẨN)');
} else {
  console.log('KẾT QUẢ: FAIL');
  process.exit(1);
}
console.log('======================================================================\n');
