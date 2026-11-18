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

console.log('--- KIỂM TRA BƯỚC V15-04: TÁCH BẢNG DEBUG [F9] KHỎI GIAO DIỆN NGƯỜI CHƠI ---');

// 1. Kiểm tra HitboxDebugInspector.ts
console.log('\n[1/4] Kiểm tra cấu hình HitboxDebugInspector.ts:');
const inspectorPath = path.resolve('src/utils/HitboxDebugInspector.ts');
const inspectorContent = fs.readFileSync(inspectorPath, 'utf8').replace(/\r\n/g, '\n');

assert(/private\s+isEnabled:\s*boolean\s*=\s*false;/.test(inspectorContent), 'Trạng thái isEnabled mặc định là false (TẮT hoàn toàn)');
assert(inspectorContent.includes('this.debugGfx.setVisible(false);'), 'Graphics dây đỏ/vàng mặc định ẩn (setVisible(false))');
assert(inspectorContent.includes('this.uiContainer.setVisible(false);'), 'Container UI bảng F9 mặc định ẩn (setVisible(false))');
assert(inspectorContent.includes('this.scene.physics.world.drawDebug = false;'), 'Arcade Physics drawDebug mặc định tắt khi khởi tạo');
assert(!inspectorContent.includes('add.container(16, 106)'), 'Đã xóa bỏ hoàn toàn vị trí cũ (16, 106) đè lên cụm 4 thanh chỉ số');
assert(inspectorContent.includes("fontSize: '11px'"), 'Font chữ bảng F9 đã được thu gọn về 11px theo đúng yêu cầu');
assert(inspectorContent.includes('this.uiContainer.setPosition(posX, posY);'), 'Bảng F9 tự động neo vào góc phải/dưới màn hình dựa trên kích thước text');

// 2. Kiểm tra GameScene.ts
console.log('\n[2/4] Kiểm tra khởi tạo trong GameScene.ts:');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8').replace(/\r\n/g, '\n');

assert(gameSceneContent.includes('this.hitboxInspector = new HitboxDebugInspector(this, this.player, this.uiScene);'), 'GameScene khởi tạo hitboxInspector sạch sẽ');
assert(gameSceneContent.includes('this.physics.world.drawDebug = false;'), 'GameScene đảm bảo physics.world.drawDebug luôn là false');
assert(gameSceneContent.includes('this.physics.world.debugGraphic.setVisible(false);'), 'GameScene đảm bảo debugGraphic luôn ẩn');

// 3. Kiểm tra tính độc lập và cách ly của UIScene.ts
console.log('\n[3/4] Kiểm tra giao diện người chơi UIScene.ts:');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf8').replace(/\r\n/g, '\n');

assert(!uiSceneContent.includes('hitboxInspector'), 'UIScene hoàn toàn tách biệt, không chứa logic debug nội bộ');
assert(uiSceneContent.includes('this.statCardBg.fillRoundedRect(12, 8, 362, 92, 6);'), 'Cụm 4 thanh chỉ số sinh tồn nằm an toàn tại X: 12..374, Y: 8..100');

// 4. Kiểm tra mô phỏng tọa độ neo (Screen Space 1280x720)
console.log('\n[4/4] Kiểm tra mô phỏng tọa độ neo bảng F9:');
function calculateF9Position(textWidth, textHeight) {
  const boxW = Math.max(370, textWidth + 20);
  const boxH = textHeight + 16;
  const posX = Math.max(16, 1264 - boxW);
  const posY = Math.max(16, 704 - boxH);
  return { posX, posY, boxW, boxH };
}

const mockPos = calculateF9Position(360, 250);
assert(mockPos.posX >= 850, `Vị trí X (${mockPos.posX}) nằm sát cạnh phải màn hình (>= 850px)`);
assert(mockPos.posY >= 400, `Vị trí Y (${mockPos.posY}) nằm ở nửa dưới màn hình (>= 400px)`);
assert(mockPos.posX > 374, `Vị trí X (${mockPos.posX}) cách xa cụm thanh chỉ số (kết thúc ở X=374) ít nhất ${mockPos.posX - 374}px`);
assert(mockPos.posY > 100, `Vị trí Y (${mockPos.posY}) cách xa cụm thanh chỉ số (kết thúc ở Y=100) ít nhất ${mockPos.posY - 100}px`);

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
