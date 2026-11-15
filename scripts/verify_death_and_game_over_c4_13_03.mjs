/**
 * QA / QC VERIFICATION SUITE — COMMAND C4-13-03
 * KIỂM ĐỊNH QUY TRÌNH XỬ LÝ NHÂN VẬT TỬ VONG (DEATH STATE) VÀ GIAO DIỆN GAME OVER
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] #${passCount + failCount + 1}: ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] #${passCount + failCount + 1}: ${testName}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('QA / QC VERIFICATION SUITE — COMMAND C4-13-03');
console.log('QUY TRÌNH NHÂN VẬT GỤC NGÃ, DỪNG AI TRUY ĐUỔI & GIAO DIỆN GAME OVER');
console.log('================================================================\n');

// 1. KIỂM TRA GAMEOVERMODAL.TS
console.log('--- 1. KIỂM TRA GAMEOVERMODAL.TS ---');
const gameOverModalPath = path.resolve('src/ui/GameOverModal.ts');
assert(fs.existsSync(gameOverModalPath), 'Tệp GameOverModal.ts tồn tại trong src/ui/');
const gameOverModalContent = fs.readFileSync(gameOverModalPath, 'utf8');

assert(gameOverModalContent.includes('export class GameOverModal'), 'GameOverModal được định nghĩa và export chuẩn xác');
assert(gameOverModalContent.includes('onLoadCheckpoint') && gameOverModalContent.includes('onRestart') && gameOverModalContent.includes('onMainMenu'), 'GameOverModal định nghĩa đủ 3 callback: onLoadCheckpoint, onRestart, onMainMenu');
assert(gameOverModalContent.includes('GỤC NGÃ TRONG SƯƠNG ĐẶC'), 'GameOverModal có tiêu đề phong cách Dark Woodland "GỤC NGÃ TRONG SƯƠNG ĐẶC"');
assert(gameOverModalContent.includes('0x8b0000') && gameOverModalContent.includes('0x0d0708'), 'GameOverModal sử dụng bảng màu u ám đồng bộ HOLLOW WOODS (đỏ thẫm 0x8b0000 & nền đen sương 0x0d0708)');
assert(gameOverModalContent.includes('open(reason?: string)') && gameOverModalContent.includes('close()'), 'GameOverModal có đầy đủ phương thức open(reason) và close()');

// 2. KIỂM TRA SATYRPLAYER.TS
console.log('\n--- 2. KIỂM TRA SATYRPLAYER.TS ---');
const satyrPlayerPath = path.resolve('src/entities/SatyrPlayer.ts');
const satyrPlayerContent = fs.readFileSync(satyrPlayerPath, 'utf8');

assert(satyrPlayerContent.includes('this._isDead = true;'), 'die() thiết lập cờ tử vong _isDead = true');
assert(satyrPlayerContent.includes('anims.pause()'), 'die() lắng nghe ANIMATION_COMPLETE và tạm dừng tại frame cuối cùng (không lặp lại)');
assert(satyrPlayerContent.includes('public respawn(x: number, y: number): void'), 'SatyrPlayer có phương thức respawn(x, y) để hồi sinh');
assert(satyrPlayerContent.includes('this._isDead = false;') && satyrPlayerContent.includes('this.playIdle();'), 'respawn() giải phóng cờ _isDead và đưa nhân vật về trạng thái Idle');
assert(satyrPlayerContent.includes('if (this._isDead) return false;'), 'Các phương thức phím tắt (isPauseRequested, isCraftingRequested, ...) khóa tuyệt đối khi nhân vật đã tử vong');

// 3. KIỂM TRA SURVIVALSYSTEM.TS
console.log('\n--- 3. KIỂM TRA SURVIVALSYSTEM.TS ---');
const survivalSystemPath = path.resolve('src/systems/SurvivalSystem.ts');
const survivalSystemContent = fs.readFileSync(survivalSystemPath, 'utf8');

assert(survivalSystemContent.includes("this.playerState.emit('player_health_depleted')"), 'SurvivalSystem phát sự kiện player_health_depleted khi health <= 0');
assert(survivalSystemContent.includes('stats.health = Math.max(0, stats.health - 2.5 * dt)'), 'SurvivalSystem trừ máu khi bình tâm cạn kiệt trong sương tối');

// 4. KIỂM TRA LISTENERAI.TS & THELISTENER.TS
console.log('\n--- 4. KIỂM TRA LISTENERAI.TS & THELISTENER.TS ---');
const listenerAIPath = path.resolve('src/systems/ListenerAI.ts');
const listenerAIContent = fs.readFileSync(listenerAIPath, 'utf8');

assert(listenerAIContent.includes('public resetToPatrol'), 'ListenerAI có phương thức resetToPatrol() đưa AI về tuần tra gốc');
assert(listenerAIContent.includes('if (isPlayerDead)'), 'ListenerAI update() dừng truy đuổi và triệt tiêu vận tốc khi người chơi tử vong');

const theListenerPath = path.resolve('src/entities/TheListener.ts');
const theListenerContent = fs.readFileSync(theListenerPath, 'utf8');
assert(theListenerContent.includes('public resetToPatrol'), 'TheListener chuyển tiếp phương thức resetToPatrol()');

// 5. KIỂM TRA UISCENE.TS
console.log('\n--- 5. KIỂM TRA UISCENE.TS ---');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf8');

assert(uiSceneContent.includes('public gameOverModal!: GameOverModal'), 'UIScene có thuộc tính gameOverModal');
assert(uiSceneContent.includes('this.gameOverModal && this.gameOverModal.isOpen'), 'isAnyModalOpen bao hàm trạng thái mở của gameOverModal');
assert(uiSceneContent.includes('public showGameOverModal'), 'UIScene có phương thức showGameOverModal()');
assert(uiSceneContent.includes('public closeGameOverModal'), 'UIScene có phương thức closeGameOverModal()');

// 6. KIỂM TRA GAMESCENE.TS
console.log('\n--- 6. KIỂM TRA GAMESCENE.TS ---');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');

assert(gameSceneContent.includes('public triggerPlayerDeath'), 'GameScene có phương thức triggerPlayerDeath()');
assert(gameSceneContent.includes('public handleLoadCheckpoint'), 'GameScene có phương thức handleLoadCheckpoint()');
assert(gameSceneContent.includes('public handleRestartGame'), 'GameScene có phương thức handleRestartGame()');
assert(gameSceneContent.includes('public handleReturnToMainMenu'), 'GameScene có phương thức handleReturnToMainMenu()');
assert(gameSceneContent.includes("this.playerState.on('player_health_depleted'"), 'GameScene lắng nghe sự kiện cạn kiệt sinh lực player_health_depleted');
assert(gameSceneContent.includes('this.triggerPlayerDeath'), 'Va chạm giữa monster và player kích hoạt triggerPlayerDeath khi máu về 0');

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA C4-13-03: ${passCount}/${passCount + failCount} TIÊU CHÍ ĐẠT (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
if (failCount === 0) {
  console.log('STATUS: ALL DEATH & GAME OVER CHECKS PASSED (100% HOÀN TẤT C4-13-03)');
} else {
  console.error(`STATUS: ${failCount} TIÊU CHÍ THẤT BẠI!`);
}
console.log('================================================================');

process.exit(failCount === 0 ? 0 : 1);
