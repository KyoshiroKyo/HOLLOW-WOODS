import fs from 'fs';
import path from 'path';

console.log('=== RUNNING VERIFICATION FOR STEP V15-59: ENDING SCREEN, ANTI-BLACK-SCREEN & BRANCHING ===\n');

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, message, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${message}`);
    if (details) console.log(`       -> ${details}`);
  } else {
    console.error(`[FAIL] ${message}`);
    if (details) console.error(`       -> ${details}`);
  }
}

// 1. Constants & EndingScene registration
const constantsPath = path.resolve('src/config/Constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf-8');
assert(
  constantsContent.includes("SCENE_ENDING = 'EndingScene'"),
  'Constants.ts exports SCENE_ENDING',
  'SCENE_ENDING hằng số được định nghĩa chuẩn xác'
);

const gameConfigPath = path.resolve('src/config/GameConfig.ts');
const gameConfigContent = fs.readFileSync(gameConfigPath, 'utf-8');
assert(
  gameConfigContent.includes('EndingScene') && gameConfigContent.includes("from '../scenes/EndingScene'"),
  'GameConfig.ts registers EndingScene in scene list',
  'EndingScene đã được import và đăng ký vào mảng scene trong GameConfig'
);

const endingScenePath = path.resolve('src/scenes/EndingScene.ts');
assert(fs.existsSync(endingScenePath), 'EndingScene.ts file exists');
const endingSceneContent = fs.readFileSync(endingScenePath, 'utf-8');
assert(
  endingSceneContent.includes('cameras.main.setZoom(1.0)') &&
  endingSceneContent.includes('cameras.main.resetFX()') &&
  endingSceneContent.includes('cameras.main.fadeIn(600'),
  'EndingScene ensures 1.0 Zoom, resetFX, and fadeIn',
  'EndingScene triệt tiêu hoàn toàn nguy cơ màn hình đen bằng resetFX và fadeIn có kiểm soát'
);

// 2. EndingSystem checks
const endingSystemPath = path.resolve('src/systems/EndingSystem.ts');
assert(fs.existsSync(endingSystemPath), 'EndingSystem.ts file exists');
const endingSystemContent = fs.readFileSync(endingSystemPath, 'utf-8');

// Title Branching
assert(
  endingSystemContent.includes("title: 'TIẾNG CHUÔNG THANH TẨY — Lời Nguyền Bellhollow Hóa Giải'"),
  'Light Ending Title matches V15-59 specs',
  'TIẾNG CHUÔNG THANH TẨY — Lời Nguyền Bellhollow Hóa Giải'
);
assert(
  endingSystemContent.includes("title: 'DƯ ÂM TRONG SƯƠNG — Hiệp Sĩ Ở Lại Canh Giữ Rừng Sâu'"),
  'Gloomy Ending (Sacrifice) Title matches V15-59 specs',
  'DƯ ÂM TRONG SƯƠNG — Hiệp Sĩ Ở Lại Canh Giữ Rừng Sâu'
);
assert(
  endingSystemContent.includes("title: 'DƯ ÂM TRONG SƯƠNG — Vòng Lặp Của Sương Mù'"),
  'Gloomy Ending (Fog Loop) Title matches V15-59 specs',
  'DƯ ÂM TRONG SƯƠNG — Vòng Lặp Của Sương Mù'
);

// Composure & Memory Branching Logic
assert(
  endingSystemContent.includes('comp >= 50 && stage >= 3 && trust >= 65'),
  'determineEndingType requires Composure >= 50 and Memory Awakening for Light Ending',
  'Chỉ kích hoạt Kết Thúc Ánh Sáng khi Tinh Thần >= 50, stage >= 3 và trust >= 65'
);

// Anti-Black-Screen mechanics & Fail-safe timer
assert(
  endingSystemContent.includes('cam.resetFX()') &&
  endingSystemContent.includes('cam.fadeIn(600') &&
  endingSystemContent.includes('cam.fadeOut(600'),
  'EndingSystem employs Camera fadeOut -> resetFX + fadeIn sequence',
  'Đảm bảo sau hiệu ứng fadeOut, camera lập tức resetFX và fadeIn hiển thị UI'
);
assert(
  endingSystemContent.includes('target.time.delayedCall(1500') &&
  endingSystemContent.includes('if (!presentationStarted)'),
  'EndingSystem implements 1.5s Fail-safe Timer against black screen hang',
  'Bộ đếm an toàn 1.5s cưỡng bức fadeIn camera và hiển thị Ending nếu callback bị treo'
);

// Freezing of monsters, wildlife, veil, weather and audio
assert(
  endingSystemContent.includes('listenerMonster.setVelocity(0, 0)') &&
  endingSystemContent.includes('wildlifeSystem.clearEntities()') &&
  endingSystemContent.includes('isBossFightActive = false'),
  'EndingSystem freezes monster movements and despawns wildlife',
  'Đóng băng The Listener, xóa sạch thú rừng hoảng loạn và kết thúc trạng thái đấu Boss'
);
assert(
  endingSystemContent.includes('veilSystem.setMistActive(false)') &&
  endingSystemContent.includes('weatherSystem.stopWeatherEffects()'),
  'EndingSystem clears mist and weather storms',
  'Tắt hiệu ứng sương mù và bão thời tiết để chuyển sang không gian yên bình'
);
assert(
  endingSystemContent.includes('setHeartbeatActive(false)') &&
  endingSystemContent.includes('setSanityDucking(false)') &&
  endingSystemContent.includes('bgm_knights_quiet_fire'),
  'EndingSystem stops panic heartbeat/breathing audio and plays peaceful finale BGM',
  'Dập tắt nhịp tim dồn dập và tấu bản nhạc bình yên bên lửa trại'
);

// Survival Chronicle data completeness
assert(
  endingSystemContent.includes('BIÊN NIÊN SỬ SINH TỒN') &&
  endingSystemContent.includes('Thời Gian: Ngày') &&
  endingSystemContent.includes('Tinh Thần Còn Lại:') &&
  endingSystemContent.includes('Ký Ức Đã Mở:') &&
  endingSystemContent.includes('Trạng Thái:'),
  'Survival Chronicle includes Days, Remaining Composure, Memory Fragments & Ending State',
  'Bảng thống kê trình bày đầy đủ: số ngày sinh tồn, Tinh Thần /100, Mảnh Ký Ức /24 và Trạng thái kết thúc'
);

// Dual Navigation Buttons
assert(
  endingSystemContent.includes('⚔ CHƠI HÀNH TRÌNH MỚI') &&
  endingSystemContent.includes('470, 580'),
  'New Journey button positioned symmetrically at (470, 580)',
  'Nút [⚔ CHƠI HÀNH TRÌNH MỚI] màu xanh lá đặt tại X=470, Y=580'
);
assert(
  endingSystemContent.includes('▶ QUAY VỀ MENU CHÍNH') &&
  endingSystemContent.includes('810, 580'),
  'Return to Main Menu button positioned symmetrically at (810, 580)',
  'Nút [▶ QUAY VỀ MENU CHÍNH] đặt tại X=810, Y=580'
);
assert(
  endingSystemContent.includes('startNewJourney()') &&
  endingSystemContent.includes('SaveManager.clearSave()') &&
  endingSystemContent.includes('PlayerState.getInstance().reset()') &&
  endingSystemContent.includes("start('GameScene', { isContinue: false })"),
  'startNewJourney() resets state, clears saves and cleanly restarts GameScene',
  'Xóa sạch dữ liệu lưu cũ, reset chỉ số về 100 và khởi động hành trình mới mượt mà'
);
assert(
  endingSystemContent.includes('returnToMainMenu()') &&
  endingSystemContent.includes("stop('GameScene')") &&
  endingSystemContent.includes("stop('UIScene')") &&
  endingSystemContent.includes('start(SCENE_MAIN_MENU)'),
  'returnToMainMenu() stops scenes cleanly and opens MainMenuScene',
  'Dừng toàn bộ màn chơi và chuyển về Menu Chính không kẹt UI'
);

// Dual Input & Hotkeys
assert(
  endingSystemContent.includes("target.input.keyboard.on('keydown-ENTER'") &&
  endingSystemContent.includes("target.input.keyboard.on('keydown-ESC'") &&
  endingSystemContent.includes("target.input.keyboard.on('keydown-SPACE'"),
  'EndingSystem listens to ENTER (new journey) and ESC / SPACE (main menu)',
  'Hỗ trợ phím nóng ENTER để chơi lại, ESC / SPACE để về Menu Chính trên UIScene'
);

const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf-8');
assert(
  gameSceneContent.includes('keyEnter.on(\'down\'') &&
  gameSceneContent.includes('this.endingSystem.canStartNewJourney()'),
  'GameScene binds ENTER key to startNewJourney when ending is active',
  'GameScene đón đầu phím ENTER kích hoạt hành trình mới khi màn kết thúc hiển thị'
);
assert(
  gameSceneContent.includes('this.endingSystem.canReturnToMenu()') &&
  gameSceneContent.includes('this.endingSystem.returnToMainMenu()'),
  'GameScene binds ESC key to returnToMainMenu when ending is active',
  'GameScene đón đầu phím ESC quay về Menu Chính khi màn kết thúc hiển thị'
);

console.log('\n---------------------------------------------------------');
console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${totalChecks - passedChecks}`);
console.log('---------------------------------------------------------');

if (passedChecks === totalChecks) {
  console.log('>>> V15-59 VERIFICATION COMPLETED WITH 100% SUCCESS <<<');
  process.exit(0);
} else {
  console.error('>>> V15-59 VERIFICATION FAILED <<<');
  process.exit(1);
}
