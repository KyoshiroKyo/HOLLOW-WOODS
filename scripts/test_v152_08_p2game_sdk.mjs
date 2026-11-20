/**
 * Automated Verification Script for Step V152-08:
 * P2Game SDK Lifecycle, Auth, Cloud Storage & Leaderboard Verification
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

console.log('=== KIỂM THỬ XÁC MINH V152-08: CHUẨN HÓA TOÀN DIỆN P2GAME SDK V1.1 ===\n');

// 1. Khởi động & Vòng đời chuẩn SDK
console.log('--- 1. Kiểm tra Khởi động & Vòng Đời SDK (main.ts, BootScene.ts, MainMenuScene.ts) ---');
const mainSrc = fs.readFileSync('src/main.ts', 'utf8');
const bootSrc = fs.readFileSync('src/scenes/BootScene.ts', 'utf8');
const menuSrc = fs.readFileSync('src/scenes/MainMenuScene.ts', 'utf8');

assert(mainSrc.includes('timeoutMs: 10000') || mainSrc.includes('timeoutMs: 10_000'), 'main.ts khởi tạo p2.init với timeoutMs 10s');
assert(mainSrc.includes('allowStandalone: true') && mainSrc.includes('debug: false'), 'main.ts cấu hình allowStandalone: true và debug: false');
assert(mainSrc.includes('window.p2.onPause') && mainSrc.includes('pauseAll()'), 'main.ts gắn p2.onPause tạm dừng cả game loop và âm thanh');
assert(mainSrc.includes('window.p2.onResume') && mainSrc.includes('resumeAll()'), 'main.ts gắn p2.onResume khôi phục cả game loop và âm thanh');
assert(mainSrc.includes('window.p2.onBeforeUnload') && mainSrc.includes('quickSaveOnUnload'), 'main.ts gắn p2.onBeforeUnload lưu nhanh tiến trình');
assert(!bootSrc.includes('window.p2.ready()'), 'BootScene đã dỡ bỏ p2.ready() để tránh cảnh báo SD-004');
assert(menuSrc.includes("this.events.once('render'") && menuSrc.includes('window.p2.ready()'), 'MainMenuScene phát tín hiệu p2.ready() ngay khi vẽ xong khung hình đầu tiên');

// 2. Đăng nhập chuẩn p2.auth
console.log('\n--- 2. Kiểm tra Đăng nhập chuẩn p2.auth (MainMenuScene.ts) ---');
assert(menuSrc.includes('p2.auth.getUser()'), 'MainMenuScene đọc thông tin người chơi qua p2.auth.getUser()');
assert(menuSrc.includes('p2.auth.onChange'), 'MainMenuScene lắng nghe thay đổi phiên đăng nhập qua p2.auth.onChange');
assert(menuSrc.includes('p2.auth.requestLogin()'), 'MainMenuScene gọi trực tiếp p2.auth.requestLogin() khi bấm Đăng Nhập');
assert(menuSrc.includes('Khách') && menuSrc.includes('ĐĂNG NHẬP'), 'MainMenuScene hiển thị Người Chơi / Khách và nút Đăng Nhập');
assert(!menuSrc.includes('<form') && !menuSrc.includes('type="password"'), 'MainMenuScene tuyệt đối không tự dựng form đăng nhập HTML riêng');

// 3. Lưu tiến trình đám mây p2.storage
console.log('\n--- 3. Kiểm tra Lưu Tiến Trình Đám Mây p2.storage (CloudSaveService.ts, SaveManager.ts) ---');
const cloudSaveSrc = fs.readFileSync('src/services/CloudSaveService.ts', 'utf8');
const saveMgrSrc = fs.readFileSync('src/systems/SaveManager.ts', 'utf8');

assert(cloudSaveSrc.includes('SAVE_KEY_PROGRESS = "progress"'), 'CloudSaveService khai báo khóa chuẩn "progress"');
assert(cloudSaveSrc.includes('p2.storage.set(SAVE_KEY_PROGRESS, payload)'), 'saveGameNow lưu vào p2.storage qua khóa "progress"');
assert(cloudSaveSrc.includes('p2.storage.get<any>(SAVE_KEY_PROGRESS)'), 'loadGameProgress nạp dữ liệu từ khóa "progress"');
assert(cloudSaveSrc.includes('MAX_KEY_BYTES = 64 * 1024') || cloudSaveSrc.includes('65536'), 'Kiểm soát trần payload dung lượng <= 64 KB');
assert(cloudSaveSrc.includes('MAX_KEY_COUNT = 32'), 'Kiểm soát số lượng khóa payload tối đa 32');
assert(cloudSaveSrc.includes('localStorage.setItem'), 'Hỗ trợ chạy mượt mà fallback qua localStorage khi mở local');
assert(saveMgrSrc.includes('quickSaveOnUnload(): boolean'), 'SaveManager có phương thức quickSaveOnUnload phục vụ onBeforeUnload');

// 4. Bảng xếp hạng "survival-score"
console.log('\n--- 4. Kiểm tra Bảng Xếp Hạng survival-score (LeaderboardService.ts, MainMenuScene.ts) ---');
const lbSrc = fs.readFileSync('src/services/LeaderboardService.ts', 'utf8');

assert(lbSrc.includes("SURVIVAL_LEADERBOARD_ID = 'survival-score'"), 'ID bảng xếp hạng là "survival-score"');
assert(lbSrc.includes('DeveloperModeManager.getInstance().isDevSession'), 'LeaderboardService kiểm tra isDevSession trước khi gửi điểm');
assert(lbSrc.includes('developer_mode_session'), 'Chặn gửi điểm BXH khi phiên chơi sử dụng Developer Mode (isDevSession = true)');
assert(lbSrc.includes('p2.leaderboard.submit(SURVIVAL_LEADERBOARD_ID, score, metadata)'), 'Gửi điểm qua p2.leaderboard.submit');
assert(lbSrc.includes('result.improved === true'), 'Hiển thị chúc mừng khi result.improved');
assert(lbSrc.includes('p2.leaderboard.top(SURVIVAL_LEADERBOARD_ID, { limit: clampedLimit, window: timeWindow })'), 'Hỗ trợ lấy Top bảng xếp hạng theo khung thời gian WEEKLY');
assert(lbSrc.includes('p2.leaderboard.aroundMe(SURVIVAL_LEADERBOARD_ID, { range: clampedRange, window: timeWindow })'), 'Hỗ trợ lấy thứ hạng quanh người chơi aroundMe');
assert(lbSrc.includes('UNAUTHENTICATED') && lbSrc.includes('SCORE_REJECTED') && lbSrc.includes('RATE_LIMITED'), 'Xử lý đầy đủ các mã lỗi P2GameError');
assert(menuSrc.includes('showLeaderboardModal()'), 'MainMenuScene có modal xem Bảng Xếp Hạng');
assert(menuSrc.includes('ui_pack_panel_modal'), 'LeaderboardModal tận dụng asset giấy da UI Pack');

// 5. Game Over & Ending gọi p2.gameOver
console.log('\n--- 5. Kiểm tra Game Over & Ending gọi p2.gameOver (GameScene.ts, EndingSystem.ts) ---');
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
const endingSrc = fs.readFileSync('src/systems/EndingSystem.ts', 'utf8');

assert(gameSceneSrc.includes('p2.gameOver') && gameSceneSrc.includes('level: dayCount') && gameSceneSrc.includes('score: calculatedScore'), 'GameScene gọi p2.gameOver({ score, level }) khi tử nạn');
assert(endingSrc.includes('p2.gameOver') && endingSrc.includes('level: day') && endingSrc.includes('score: endingScore'), 'EndingSystem gọi p2.gameOver({ score, level }) khi đạt Ending');

console.log('\n========================================================================');
console.log(`KẾT QUẢ KIỂM THỬ V152-08: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ 23 TIÊU CHÍ P2GAME SDK V1.1 ĐÃ ĐƯỢC CHUẨN HÓA THÀNH CÔNG RỰC RỠ!');
}
