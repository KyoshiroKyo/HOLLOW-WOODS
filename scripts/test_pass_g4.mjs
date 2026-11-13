// Test Pass G4: Act 0 Fog Crossing, Act 5 Bell Shrine Escape, Act 6 The First Toll Finale & Save System
import fs from 'fs';
import path from 'path';

console.log('--- BẮT ĐẦU KIỂM THỬ PASS G4: HOLLOW WOODS V3.0 ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

// 1. Kiểm tra sự tồn tại của các file cốt lõi PASS G4
const root = process.cwd();
const saveManagerPath = path.join(root, 'src', 'systems', 'SaveManager.ts');
const endingSystemPath = path.join(root, 'src', 'systems', 'EndingSystem.ts');
const pauseModalPath = path.join(root, 'src', 'ui', 'PauseModal.ts');
const mainMenuPath = path.join(root, 'src', 'scenes', 'MainMenuScene.ts');
const gameScenePath = path.join(root, 'src', 'scenes', 'GameScene.ts');

assert(fs.existsSync(saveManagerPath), 'File SaveManager.ts tồn tại');
assert(fs.existsSync(endingSystemPath), 'File EndingSystem.ts tồn tại');
assert(fs.existsSync(pauseModalPath), 'File PauseModal.ts tồn tại');

// 2. Kiểm tra nội dung SaveManager
const saveManagerContent = fs.readFileSync(saveManagerPath, 'utf8');
assert(saveManagerContent.includes('hasSave'), 'SaveManager có phương thức hasSave');
assert(saveManagerContent.includes('saveGame'), 'SaveManager có phương thức saveGame');
assert(saveManagerContent.includes('loadGame'), 'SaveManager có phương thức loadGame');
assert(saveManagerContent.includes('checkpointName'), 'SaveManager lưu cấu trúc checkpointName');

// 3. Kiểm tra nội dung EndingSystem
const endingContent = fs.readFileSync(endingSystemPath, 'utf8');
assert(endingContent.includes('triggerTheFirstTollFinale'), 'EndingSystem có phương thức triggerTheFirstTollFinale');
assert(endingContent.includes('playTimeRiftCutscene'), 'EndingSystem có cutscene Time Rift (khe nứt thời gian hiện đại)');
assert(endingContent.includes('playFinalCreditsCutscene'), 'EndingSystem có cutscene sổ da Satyr & credits');

// 4. Kiểm tra nội dung PauseModal
const pauseModalContent = fs.readFileSync(pauseModalPath, 'utf8');
assert(pauseModalContent.includes('TẠM DỪNG HÀNH TRÌNH'), 'PauseModal có tiêu đề Tạm Dừng');
assert(pauseModalContent.includes('LƯU GAME THỦ CÔNG'), 'PauseModal có nút Lưu Game');
assert(pauseModalContent.includes('NẠP LẠI ĐIỂM LƯU GẦN NHẤT'), 'PauseModal có nút Tải Lại');

// 5. Kiểm tra MainMenuScene tích hợp tiếp tục
const mainMenuContent = fs.readFileSync(mainMenuPath, 'utf8');
assert(mainMenuContent.includes('TIẾP TỤC HÀNH TRÌNH'), 'MainMenuScene có nút Tiếp Tục');
assert(mainMenuContent.includes('BƯỚC VÀO MÀN SƯƠNG'), 'MainMenuScene có nút Bắt Đầu Mới');

// 6. Kiểm tra GameScene tích hợp Act 0, Act 5 Chase, Act 6 Finale
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');
assert(gameSceneContent.includes('startAct0Intro'), 'GameScene có mở đầu Act 0 Fog Crossing');
assert(gameSceneContent.includes('startAct5EscapeChase'), 'GameScene có cuộc truy đuổi Act 5 Climax Chase');
assert(gameSceneContent.includes('triggerTheFirstTollFinale'), 'GameScene có kích hoạt Finale The First Toll');
assert(gameSceneContent.includes('pauseModal'), 'GameScene có tích hợp PauseModal');

console.log(`\nTổng kết kết quả: ${passedTests}/${totalTests} bài test đạt yêu cầu.`);
if (passedTests === totalTests) {
  console.log('=== TẤT CẢ KIỂM THỬ PASS G4 THÀNH CÔNG RỰC RỠ ===');
  process.exit(0);
} else {
  console.error('=== CÓ BÀI TEST THẤT BẠI ===');
  process.exit(1);
}

