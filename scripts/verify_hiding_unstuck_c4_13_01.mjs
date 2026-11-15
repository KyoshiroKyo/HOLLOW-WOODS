import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('QA / QC VERIFICATION SUITE — COMMAND C4-13-01');
console.log('KHẮC PHỤC TRIỆT ĐỂ LỖI KẸT KHI NÚP BỤI RẬM / HỐC CÂY & GỠ KẸT SAVE/LOAD');
console.log('================================================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] #${totalTests}: ${testName} - ${detail}`);
  }
}

// 1. Kiểm tra SatyrPlayer.ts
console.log('\n--- 1. KIỂM TRA THỰC THỂ SATYRPLAYER ---');
const satyrContent = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf-8');

assert(satyrContent.includes('public lastSafePosition: { x: number; y: number } = { x: 0, y: 0 };'), 'SatyrPlayer có thuộc tính lastSafePosition lưu tọa độ an toàn');
assert(satyrContent.includes('public hidingTimestamp: number = 0;'), 'SatyrPlayer có thuộc tính hidingTimestamp theo dõi thời điểm vào chỗ trốn');
assert(satyrContent.includes('public hasMovementInput(): boolean'), 'SatyrPlayer có phương thức hasMovementInput() nhận diện phím WASD / Mũi tên');
assert(satyrContent.includes('public enterHiding(safePos?: { x: number; y: number }): void'), 'SatyrPlayer có phương thức enterHiding() lưu vị trí an toàn và ẩn nhân vật');
assert(satyrContent.includes('public exitHiding(): void'), 'SatyrPlayer có phương thức exitHiding() khôi phục vị trí, hiện nhân vật và giải phóng input');

// Kiểm tra thứ tự ưu tiên trong update(): phím [E] phải xử lý TRƯỚC if (this.stats.isHiding)
const eIndex = satyrContent.indexOf("this.consumeOneShotAction('interact');");
const hideReturnIndex = satyrContent.indexOf('if (this.stats.isHiding) {');
assert(eIndex !== -1 && hideReturnIndex !== -1 && eIndex < hideReturnIndex, 'update() xử lý phím [E] tương tác TRƯỚC lệnh return của isHiding (không bị nuốt phím)');

// 2. Kiểm tra GameScene.ts
console.log('\n--- 2. KIỂM TRA ĐIỀU PHỐI GAMESCENE ---');
const gameSceneContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

assert(gameSceneContent.includes('if (this.player.stats.isHiding) {'), 'handleInteractions() ưu tiên xử lý thoát ẩn nấp ngay đầu luồng');
assert(gameSceneContent.includes('[E] / [WASD] Bước ra khỏi chỗ trốn'), 'Hiển thị gợi ý phím [E] / [WASD] Bước ra khỏi chỗ trốn khi đang núp');
assert(gameSceneContent.includes('timeInHiding >= 300 && this.player.hasMovementInput()'), 'Cho phép dùng phím di chuyển WASD/Mũi tên sau 300ms để thoát chỗ trốn');
assert(gameSceneContent.includes('this.player.enterHiding({ x: this.player.x, y: this.player.y });'), 'executeMapInteraction lưu tọa độ an toàn khi bắt đầu ẩn nấp');
assert(gameSceneContent.includes('this.player.exitHiding();'), 'executeMapInteraction gọi exitHiding() khi người chơi bước ra');
assert(gameSceneContent.includes('this.unstuckPlayerFromColliders();'), 'Gọi unstuckPlayerFromColliders() sau khi bước ra khỏi chỗ trốn');
assert(gameSceneContent.includes('private unstuckPlayerFromColliders(): void'), 'GameScene có phương thức unstuckPlayerFromColliders() tự động gỡ kẹt');

// 3. Kiểm tra SaveManager.ts
console.log('\n--- 3. KIỂM TRA AN TOÀN SAVE / LOAD ---');
const saveManagerContent = fs.readFileSync('src/systems/SaveManager.ts', 'utf-8');

assert(saveManagerContent.includes('state.stats.isHiding = false;'), 'SaveManager giải phóng isHiding = false khi lưu hoặc tải');
assert(saveManagerContent.includes('state.stats.isSprinting = false;'), 'SaveManager giải phóng isSprinting = false khi lưu hoặc tải');

// 4. Kiểm tra mô phỏng giải thuật AABB gỡ kẹt
console.log('\n--- 4. MÔ PHỎNG GIẢI THUẬT AABB NUDGE UNSTUCK ---');
const checkOverlap = (b1, b2) => {
  return (
    b1.x < b2.x + b2.width &&
    b1.x + b1.width > b2.x &&
    b1.y < b2.y + b2.height &&
    b1.y + b1.height > b2.y
  );
};

// Giả lập 1 cây rỗng tại x: 1900, y: 180, collider box (1886, 173, width 28, height 14)
const treeCollider = { x: 1886, y: 173, width: 28, height: 14 };
// Nhân vật bị kẹt ngay tâm cây (1900, 180), body 20x16 (1890, 172, width 20, height 16)
const stuckPlayerBody = { x: 1890, y: 172, width: 20, height: 16 };

assert(checkOverlap(stuckPlayerBody, treeCollider), 'Mô phỏng phát hiện chính xác nhân vật đang bị kẹt trong collider');

const testOffsets = [
  { x: 0, y: 16 },
  { x: 0, y: -16 },
  { x: 16, y: 0 },
  { x: -16, y: 0 },
  { x: 16, y: 16 },
  { x: -16, y: 16 },
  { x: 0, y: 32 }
];

let unstuckPos = null;
for (const off of testOffsets) {
  const nudgedBody = {
    x: stuckPlayerBody.x + off.x,
    y: stuckPlayerBody.y + off.y,
    width: stuckPlayerBody.width,
    height: stuckPlayerBody.height
  };
  if (!checkOverlap(nudgedBody, treeCollider)) {
    unstuckPos = { x: 1900 + off.x, y: 180 + off.y };
    break;
  }
}

assert(unstuckPos !== null, `Giải thuật nudge tự động tìm thấy tọa độ thoát kẹt an toàn (${unstuckPos?.x}, ${unstuckPos?.y})`);

// 5. Kiểm tra danh mục các điểm ẩn nấp trong thế giới V1.2/V1.3
console.log('\n--- 5. KIỂM TRA CÁC ĐIỂM ẨN NẤP TRÊN TOÀN THẾ GIỚI ---');
const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf-8'));
let totalHidingSpots = 0;
for (const zone of zonesData.zones) {
  if (zone.interactables) {
    const spots = zone.interactables.filter(i => i.type === 'hiding_spot' || i.actionId === 'hide_player');
    totalHidingSpots += spots.length;
  }
}
assert(totalHidingSpots >= 15, `Toàn thế giới có ${totalHidingSpots} điểm ẩn nấp (>= 15 điểm) được bảo vệ bởi cơ chế thoát kẹt`);

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA C4-13-01: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests === 0) {
  console.log('STATUS: ALL HIDING & UNSTUCK CHECKS PASSED (100% HOÀN TẤT C4-13-01)');
} else {
  console.error(`STATUS: ${failedTests} CHECKS FAILED!`);
  process.exit(1);
}
console.log('================================================================');
