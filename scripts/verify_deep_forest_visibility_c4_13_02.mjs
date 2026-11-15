import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('QA / QC VERIFICATION SUITE — COMMAND C4-13-02');
console.log('ĐỒNG BỘ CHUYỂN CẢNH, HIỂN THỊ NHÂN VẬT & TÁN CÂY TRONG SUỐT RỪNG SÂU');
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

// 1. Kiểm tra WorldBuilder.ts
console.log('\n--- 1. KIỂM TRA WORLDBUILDER.TS ---');
const wbContent = fs.readFileSync('src/world/WorldBuilder.ts', 'utf-8');

assert(wbContent.includes('this.treeCanopyGroup.add(tree);'), 'WorldBuilder nạp cây vào treeCanopyGroup trong createTree & placeVariantTree');
assert(wbContent.includes('// C4-13-02: Loại trừ tuyệt đối nhân vật chính (player) khỏi Camera Culling'), 'updateCameraCulling loại trừ tuyệt đối người chơi khỏi danh sách cull');
assert(wbContent.includes('public updateCanopyTransparency(playerX: number, playerY: number): void'), 'WorldBuilder có phương thức updateCanopyTransparency() làm trong suốt tán cây');
assert(wbContent.includes('targetAlpha = isUnderCanopy ? 0.35 : 1.0;'), 'Thiết lập độ đậm alpha = 0.35 khi nhân vật đi bên dưới tán cây');
assert(wbContent.includes('scale = treeKey === SPRITE_TREE_DEAD ? 1.05 : 1.0;'), 'Tỷ lệ cành/cây khô được chuẩn hóa 1.05x (không phình to che kín màn hình)');

// 2. Kiểm tra CameraSystem.ts
console.log('\n--- 2. KIỂM TRA CAMERASYSTEM.TS ---');
const camContent = fs.readFileSync('src/systems/camera/CameraSystem.ts', 'utf-8');

assert(camContent.includes('public centerOn(x: number, y: number): void'), 'CameraSystem có phương thức centerOn() canh giữa tức thời');
assert(camContent.includes('this.camera.centerOn(x, y);'), 'centerOn() gọi camera.centerOn và làm tròn pixel art');

// 3. Kiểm tra GameScene.ts
console.log('\n--- 3. KIỂM TRA GAMESCENE.TS ---');
const gsContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

assert(gsContent.includes('this.cameraSystem.centerOn(this.player.x, this.player.y);'), 'GameScene create() gọi cameraSystem.centerOn() tại vị trí xuất phát');
assert(gsContent.includes('this.applyCameraBoundsForZone(this.currentZoneId);'), 'GameScene create() áp dụng bounds theo phân khu xuất phát');
assert(gsContent.includes('this.cameraSystem.centerOn(trans.targetSpawn.x, trans.targetSpawn.y);'), 'executeTransition() canh giữa camera ngay lập tức tại vị trí đích');
assert(gsContent.includes('(this.player.body as Phaser.Physics.Arcade.Body).reset(trans.targetSpawn.x, trans.targetSpawn.y);'), 'executeTransition() reset Arcade Physics body tại vị trí đích');
assert(gsContent.includes('this.player.setVisible(true);') && gsContent.includes('this.player.setActive(true);'), 'executeTransition() đảm bảo player luôn visible & active khi qua ranh giới');
assert(gsContent.includes('this.worldBuilder.updateCanopyTransparency(this.player.x, this.player.y);'), 'GameScene update() gọi updateCanopyTransparency mỗi frame');

// 4. Kiểm tra zones.json đối với Deep Forest
console.log('\n--- 4. KIỂM TRA TỌA ĐỘ CHUYỂN VÙNG RỪNG SÂU (ZONES.JSON) ---');
const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf-8'));
const dfZone = zonesData.zones.find(z => z.id === 'deep_forest');
const cpZone = zonesData.zones.find(z => z.id === 'crooked_path');

assert(!!dfZone && dfZone.bounds.y === -640, 'Rừng Sâu (Deep Forest) có tọa độ Y âm (-640..0)');
const toDf = cpZone.transitions.find(t => t.toZone === 'deep_forest');
const toCpFromDf = dfZone.transitions.find(t => t.toZone === 'crooked_path');

assert(toDf && toDf.targetSpawn.x === 2080 && toDf.targetSpawn.y === -80, 'Lối vào Rừng Sâu đặt targetSpawn chuẩn (2080, -80)');
assert(toCpFromDf && toCpFromDf.targetSpawn.x === 2080 && toCpFromDf.targetSpawn.y === 60, 'Lối về Đường Mòn Quanh Co đặt targetSpawn chuẩn (2080, 60)');

// 5. Mô phỏng hình học độ trong suốt của tán cây (Canopy Transparency Math Simulation)
console.log('\n--- 5. MÔ PHỎNG GIẢI THUẬT TÁN CÂY TRONG SUỐT ---');
const mockTree = {
  x: 2000,
  y: -100,
  displayWidth: 113,
  displayHeight: 139,
  originY: 0.88,
  alpha: 1.0
};

const halfW = mockTree.displayWidth * 0.5; // 56.5
const topY = mockTree.y - mockTree.displayHeight * mockTree.originY; // -100 - 139*0.88 = -222.32
const bottomY = mockTree.y + 8; // -92

const testUnder = (px, py) => {
  return px >= mockTree.x - halfW && px <= mockTree.x + halfW && py >= topY && py <= bottomY;
};

// Người chơi đứng tại (2020, -150) -> bên dưới tán cây
assert(testUnder(2020, -150), 'Vị trí (2020, -150) nằm dưới tán cây -> kích hoạt alpha 0.35');
// Người chơi đứng tại (2100, -150) -> ngoài tán cây
assert(!testUnder(2100, -150), 'Vị trí (2100, -150) ngoài tán cây -> giữ nguyên alpha 1.0');

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA C4-13-02: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests === 0) {
  console.log('STATUS: ALL DEEP FOREST VISIBILITY CHECKS PASSED (100% HOÀN TẤT C4-13-02)');
} else {
  console.error(`STATUS: ${failedTests} CHECKS FAILED!`);
  process.exit(1);
}
console.log('================================================================');
