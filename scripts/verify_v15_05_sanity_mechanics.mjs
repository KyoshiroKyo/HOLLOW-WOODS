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

console.log('--- KIỂM TRA BƯỚC V15-05: CƠ CHẾ BÌNH TÂM RÚT MÁU LŨY TIẾN & KHU AN TOÀN ---');

// 1. Kiểm tra SurvivalSystem.ts
console.log('\n[1/5] Kiểm tra logic Ban Ngày & Khu An Toàn (SurvivalSystem.ts):');
const survivalPath = path.resolve('src/systems/SurvivalSystem.ts');
const survivalContent = fs.readFileSync(survivalPath, 'utf8').replace(/\r\n/g, '\n');

assert(survivalContent.includes("const isDaytime = timePhase === 'DAY';"), 'Nhận diện chính xác pha BAN NGÀY (DAY)');
assert(survivalContent.includes('const isProtected = isDaytime || isBellhollowSafe;'), 'Bảo vệ kép: Ban Ngày hoặc Làng Bellhollow an toàn');
assert(survivalContent.includes('stats.composure = Math.min(stats.maxComposure, stats.composure + 1.5 * dt);'), 'Hồi phục tự nhiên +1.5 Composure/giây khi được bảo vệ');
assert(survivalContent.includes('stats.composure = Math.min(stats.maxComposure, stats.composure + (4.0 * composureMult) * dt);'), 'Hồi phục +4.0 Composure/giây khi đứng cạnh lửa trại');

// 2. Kiểm tra 3 Cấp độ Tác động lên Máu (SurvivalSystem.ts)
console.log('\n[2/5] Kiểm tra 3 Cấp độ rút Sinh Lực lũy tiến (SurvivalSystem.ts):');
assert(survivalContent.includes('if (!nearCampfire && !isProtected && !stats.isLanternOn)'), 'Chỉ rút máu ngoài vùng an toàn / ban đêm và khi tắt đèn lồng');
assert(survivalContent.includes('const drainHp = (3.5 / 1.5) * dt;') && survivalContent.includes('stats.health = Math.max(0, stats.health - drainHp);'), 'Ngưỡng Hoảng Loạn Cực Độ (<10): Rút Sinh Lực -3.5 HP mỗi 1.5s (-2.333 HP/s)');
assert(survivalContent.includes('const drainHp = (1.5 / 2.0) * dt;') && survivalContent.includes('stats.health = Math.max(0, stats.health - drainHp);'), 'Ngưỡng Sợ Hãi (10..24): Rút Sinh Lực -1.5 HP mỗi 2s (-0.75 HP/s)');
assert(survivalContent.includes('if (stats.composure <= 40)') && survivalContent.includes('recoveryRate *= 0.85;'), 'Ngưỡng Bất An (<= 40): Giảm 15% tốc độ hồi Thể Lực (recoveryRate *= 0.85)');

// 3. Kiểm tra Tốc độ Di chuyển (SatyrPlayer.ts)
console.log('\n[3/5] Kiểm tra tốc độ di chuyển theo cấp độ Bình Tâm (SatyrPlayer.ts):');
const playerPath = path.resolve('src/entities/BlackKnightPlayer.ts');
const playerContent = fs.readFileSync(playerPath, 'utf8').replace(/\r\n/g, '\n');

assert(playerContent.includes('if (this.stats.composure < 10)'), 'Kiểm tra ngưỡng Hoảng Loạn Cực Độ (<10)');
assert(playerContent.includes('speedMultiplier *= 0.80;'), 'Hoảng Loạn Cực Độ giảm 20% tốc độ di chuyển');
assert(playerContent.includes('else if (this.stats.composure < 25)'), 'Kiểm tra ngưỡng Sợ Hãi (10..24)');
assert(playerContent.includes('speedMultiplier *= 0.90;'), 'Ngưỡng Sợ Hãi giảm 10% tốc độ di chuyển');

// 4. Kiểm tra Sửa lỗi cảnh báo sai ban ngày (UIScene.ts)
console.log('\n[4/5] Kiểm tra tự động tắt biểu ngữ cảnh báo và xóa viền đỏ (UIScene.ts):');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf8').replace(/\r\n/g, '\n');

assert(uiSceneContent.includes("isDaytime = gameScene?.timeSystem?.getCurrentPhase() === 'DAY'"), 'UIScene nhận diện trạng thái BAN NGÀY');
assert(uiSceneContent.includes('if (isProtectedZone || isLanternOn || composure >= 40)'), 'Tự động tắt cảnh báo khi Ban Ngày, Khu An Toàn hoặc Bình Tâm >= 40');
assert(uiSceneContent.includes('this.panicVignetteGraphics.clear();') && uiSceneContent.includes('this.isPanicVignetteActive = false;'), 'Xóa sạch viền đỏ hoảng loạn ngay khi vượt ngưỡng nguy hiểm');

// 5. Kiểm tra AudioManager & GameScene (Âm thanh & Rung camera)
console.log('\n[5/5] Kiểm tra tiếng thở nhẹ và hiệu ứng camera GameScene.ts:');
const audioPath = path.resolve('src/audio/AudioManager.ts');
const audioContent = fs.readFileSync(audioPath, 'utf8').replace(/\r\n/g, '\n');
assert(audioContent.includes('public playUneasyBreathing(): void'), 'AudioManager có hàm phát tiếng thở nhẹ cảnh báo playUneasyBreathing');

const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8').replace(/\r\n/g, '\n');
assert(gameSceneContent.includes('this.audioManager.setHeartbeatActive(true, 480);'), 'Hoảng loạn cực độ kích hoạt nhịp tim dồn dập (480ms)');
assert(gameSceneContent.includes('this.cameraSystem.shake(160, 0.0035);'), 'Hoảng loạn cực độ kích hoạt rung camera theo nhịp tim');
assert(gameSceneContent.includes('this.audioManager.playUneasyBreathing();'), 'Ngưỡng Bất An định kỳ phát tiếng thở nhẹ cảnh báo');

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
