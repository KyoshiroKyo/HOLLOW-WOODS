/**
 * Automated test script for Step V15-48:
 * - Web/iframe canvas focus & preventDefault
 * - Default spawn location & input lock safety
 * - HUD clock width & wrapping (timeBoxW=244, timeBoxX=668)
 * - Hotbar layout & elimination of duplicates
 * - JournalModal title & tab clearance
 */
import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

console.log('=== TEST STEP V15-48: IFRAME FOCUS, SPAWN POSITION & HUD LAYOUT ===\n');

// 1. Kiểm tra index.html
console.log('1. Kiểm tra index.html:');
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('<canvas id="game-canvas" tabindex="0"></canvas>'), 'Canvas có tabindex="0" để nhận tiêu điểm iframe');
assert(indexHtml.includes('outline: none;'), 'Canvas có outline: none;');
assert(/HOLLOW WOODS V1\.(5|6)/.test(indexHtml), 'Tiêu đề cập nhật V1.5/V1.6');

// 2. Kiểm tra src/main.ts
console.log('\n2. Kiểm tra src/main.ts:');
const mainTs = fs.readFileSync('src/main.ts', 'utf8');
assert(mainTs.includes('existingCanvas.tabIndex = 0'), 'Thiết lập existingCanvas.tabIndex = 0');
assert(!mainTs.includes('autoFocus: true') && mainTs.includes('autoFocus: false'), 'Cấu hình autoFocus: false tuân thủ Permissions Policy (RT-002)');
assert(mainTs.includes('const focusGameCanvas') && mainTs.includes('focusGameCanvasSafely'), 'Có hàm focusGameCanvas dùng focusGameCanvasSafely (chỉ focus khi có user activation)');
assert(mainTs.includes("focusCanvas?.addEventListener('pointerdown', focusGameCanvas") &&
  !mainTs.includes("window.addEventListener('pointerdown'"), 'Focus trên canvas, không lấy tiêu điểm của panel ngoài canvas');
assert(mainTs.includes('window.addEventListener(\'keydown\'') && mainTs.includes('e.preventDefault()'), 'Chặn cuộn trang iframe đối với các phím điều hướng & phím Space');
assert(mainTs.includes('(window as any).__FOCUS_GAME__'), 'Expose __FOCUS_GAME__ cho window');

// 3. Kiểm tra src/data/zones.json
console.log('\n3. Kiểm tra src/data/zones.json:');
const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const fogCrossing = zonesJson.zones.find(z => z.id === 'fog_crossing');
assert(fogCrossing !== undefined, 'Tìm thấy phân khu fog_crossing');
assert(fogCrossing.defaultSpawn.x === 120 && fogCrossing.defaultSpawn.y === 195, `defaultSpawn của fog_crossing là (120, 195) (Thực tế: ${fogCrossing.defaultSpawn.x}, ${fogCrossing.defaultSpawn.y})`);

// Kiểm tra khoảng cách tới rào cản phía Tây
const westBarrier = fogCrossing.interactables.find(i => i.id === 'fog_west_barrier');
assert(westBarrier !== undefined, 'Tìm thấy rào cản phía Tây fog_west_barrier');
const distToBarrier = Math.hypot(fogCrossing.defaultSpawn.x - westBarrier.x, fogCrossing.defaultSpawn.y - westBarrier.y);
assert(distToBarrier > 52, `Khoảng cách từ điểm xuất phát tới rào chắn > 52px (Thực tế: ${distToBarrier.toFixed(1)}px), không bị tự động kích hoạt prompt`);

// 4. Kiểm tra src/scenes/GameScene.ts
console.log('\n4. Kiểm tra src/scenes/GameScene.ts:');
const gameSceneTs = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneTs.includes('if (this.currentZoneId === \'fog_crossing\' && spawnX < 110)'), 'Có cơ chế kẹp an toàn spawnX >= 120 tại fog_crossing');
assert(gameSceneTs.includes('this.isGameOverPending = false'), 'Reset isGameOverPending = false');
assert(gameSceneTs.includes('this.isDebugBoxesVisible = false'), 'Khung debug mặc định tắt (false)');
assert(gameSceneTs.includes('this.player.resetAllActionAndMotionStates()'), 'Gọi player.resetAllActionAndMotionStates() khi khởi tạo');
assert(gameSceneTs.includes('focusGameCanvasSafely(this.game?.canvas)') && gameSceneTs.includes('this.input.on(\'pointerdown\''), 'Chỉ focus canvas khi có tương tác pointerdown trong GameScene (RT-002)');

// 5. Kiểm tra src/scenes/UIScene.ts
console.log('\n5. Kiểm tra src/scenes/UIScene.ts:');
const uiSceneTs = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');
assert(uiSceneTs.includes('const timeBoxW = 244;') || uiSceneTs.includes('timeBoxX + 122'), 'Đồng hồ giữ chiều rộng 244px (center offset 122px)');
assert(uiSceneTs.includes('const timeBoxX = 668;'), 'timeBoxX được đặt tại 668px (mép phải 912px, cách Quest box 8px)');
assert(uiSceneTs.includes('wordWrap: { width: 162 }'), 'timeDayText có wordWrap width 162px');
assert(uiSceneTs.includes('🔨 [I] Chế Tạo'), 'Thanh Hotbar sử dụng chuẩn 🔨 [I] Chế Tạo');
assert(uiSceneTs.includes('focusGameCanvas()'), 'UIScene có phương thức focusGameCanvas()');

// 6. Kiểm tra src/ui/JournalModal.ts
console.log('\n6. Kiểm tra src/ui/JournalModal.ts:');
const journalModalTs = fs.readFileSync('src/ui/JournalModal.ts', 'utf8');
assert(journalModalTs.includes('📖 SỔ TAY LỮ KHÁCH [J]'), 'Tiêu đề có nhãn phím [J]');
assert(journalModalTs.includes('modalX + 220') && journalModalTs.includes('[1. NHIỆM VỤ]'), 'Tab 1 [1. NHIỆM VỤ] đặt tại modalX + 220, cách tiêu đề >= 30px');
assert(journalModalTs.includes('modalX + 330') && journalModalTs.includes('[2. MẢNH KÝ ỨC]'), 'Tab 2 [2. MẢNH KÝ ỨC] đặt tại modalX + 330');
assert(journalModalTs.includes('modalX + 455') && journalModalTs.includes('[3. SINH VẬT RỪNG]'), 'Tab 3 [3. SINH VẬT RỪNG] đặt tại modalX + 455');
assert(journalModalTs.includes('modalX + 590') && journalModalTs.includes('[4. BẢN ĐỒ THẾ GIỚI]'), 'Tab 4 [4. BẢN ĐỒ THẾ GIỚI] đặt tại modalX + 590');

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
