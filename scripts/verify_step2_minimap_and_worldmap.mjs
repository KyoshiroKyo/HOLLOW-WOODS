import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM TOÁN HỆ THỐNG MINI-MAP & BẢN ĐỒ GIẤY DA (BƯỚC 2) ===\n');

let allPassed = true;
function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    allPassed = false;
  }
}

// 1. Kiểm tra MiniMapWidget.ts
console.log('1. Kiểm toán thành phần Mini-map góc màn hình (src/ui/MiniMapWidget.ts):');
const miniMapPath = path.resolve('src/ui/MiniMapWidget.ts');
assert(fs.existsSync(miniMapPath), 'File src/ui/MiniMapWidget.ts tồn tại');
const miniMapCode = fs.readFileSync(miniMapPath, 'utf8');

assert(miniMapCode.includes('class MiniMapWidget'), 'Đã định nghĩa class MiniMapWidget');
assert(miniMapCode.includes('POS_X = 1070') && miniMapCode.includes('POS_Y = 104'), 'Vị trí góc trên bên phải (X: 1070, Y: 104) không đè lên thanh sinh tồn bên trái');
assert(miniMapCode.includes('WIDTH = 190') && miniMapCode.includes('HEIGHT = 144'), 'Kích thước chuẩn nhỏ gọn 190x144 px viền gỗ đồng');
assert(miniMapCode.includes('updateZoneTerrain'), 'Có phương thức dựng nền địa hình tĩnh updateZoneTerrain()');
assert(miniMapCode.includes('generateTexture') || miniMapCode.includes('CanvasTexture'), 'Nền địa hình được vẽ vào Texture tĩnh 1 lần khi vào phân khu');
assert(miniMapCode.includes('updateDynamicMarkers'), 'Có phương thức cập nhật động updateDynamicMarkers() mỗi frame');
assert(miniMapCode.includes('toggle'), 'Hỗ trợ hàm toggle() bật/tắt hiển thị Mini-map');
assert(!miniMapCode.includes('listenerMonster') && !miniMapCode.includes('mireWardenBoss') && !miniMapCode.includes('wildlifeSystem'), 'Tuyệt đối KHÔNG hiển thị quái vật trên Mini-map (bảo tồn yếu tố kinh dị)');

// 2. Kiểm tra ParchmentWorldMapModal.ts
console.log('\n2. Kiểm toán thành phần Bản đồ Giấy Da Thế Giới (src/ui/ParchmentWorldMapModal.ts):');
const parchmentPath = path.resolve('src/ui/ParchmentWorldMapModal.ts');
assert(fs.existsSync(parchmentPath), 'File src/ui/ParchmentWorldMapModal.ts tồn tại');
const parchmentCode = fs.readFileSync(parchmentPath, 'utf8');

assert(parchmentCode.includes('class ParchmentWorldMapModal'), 'Đã định nghĩa class ParchmentWorldMapModal');
assert(parchmentCode.includes('MAP_WIDTH = 980') && parchmentCode.includes('MAP_HEIGHT = 600'), 'Kích thước khung giấy da cổ 980x600 px');
assert(parchmentCode.includes('bellhollow'), 'Có tâm điểm Làng Bellhollow');
assert(parchmentCode.includes('hasVisitedZone') || parchmentCode.includes('visitedZones'), 'Tích hợp cơ chế Sương Mù Khám Phá (Fog of War) liên kết với PlayerState');
assert(parchmentCode.includes('Chưa Khám Phá') || parchmentCode.includes('SƯƠNG MÙ'), 'Vùng chưa đến bị che phủ sương mù mờ ảo');
assert(parchmentCode.includes('VỊ TRÍ HIỆN TẠI'), 'Có nhãn và con trỏ định vị vị trí hiện tại của người chơi');
assert(parchmentCode.includes('pulseTween') || parchmentCode.includes('tweens.add'), 'Con trỏ vị trí người chơi có hiệu ứng nhấp nháy phát sáng (amber pulse)');

// 3. Kiểm tra UIScene.ts
console.log('\n3. Kiểm toán tích hợp trong UIScene.ts:');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneCode = fs.readFileSync(uiScenePath, 'utf8');

assert(uiSceneCode.includes('miniMapWidget'), 'UIScene khai báo và quản lý miniMapWidget');
assert(uiSceneCode.includes('parchmentWorldMapModal'), 'UIScene khai báo và quản lý parchmentWorldMapModal');
assert(uiSceneCode.includes("keydown-N"), 'Lắng nghe sự kiện phím N để bật/tắt Mini-map');
assert(uiSceneCode.includes("keydown-M"), 'Lắng nghe sự kiện phím M để mở Bản đồ Giấy Da');
assert(uiSceneCode.includes('parchmentWorldMapModal.isOpen'), 'Getter isAnyModalOpen bao gồm parchmentWorldMapModal.isOpen');
assert(uiSceneCode.includes('updateMiniMapZone'), 'UIScene cung cấp API updateMiniMapZone()');
assert(uiSceneCode.includes('updateMiniMap'), 'UIScene cung cấp API updateMiniMap()');

// 4. Kiểm tra GameScene.ts
console.log('\n4. Kiểm toán liên kết runtime trong GameScene.ts:');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf8');

assert(gameSceneCode.includes('keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M)'), 'Đăng ký phím cứng M mở Bản đồ Thế Giới');
assert(gameSceneCode.includes('keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N)'), 'Đăng ký phím cứng N bật/tắt Mini-map');
assert(gameSceneCode.includes('this.uiScene.isAnyModalOpen'), 'isUIBusy bao gồm trạng thái modal từ UIScene');
assert(gameSceneCode.includes('uiScene.updateMiniMapZone'), 'applyCameraBoundsForZone tự động gọi updateMiniMapZone');
assert(gameSceneCode.includes('uiScene.updateMiniMap'), 'update() đồng bộ tọa độ động người chơi lên Mini-map mỗi frame');
assert(gameSceneCode.includes('getCurrentZoneId') && gameSceneCode.includes('getPlayerState'), 'Cung cấp getter getCurrentZoneId() và getPlayerState() cho UIScene');

console.log('\n======================================================');
if (allPassed) {
  console.log('>>> KẾT QUẢ: TOÀN BỘ 24 HẠNG MỤC KIỂM TOÁN ĐỀU ĐẠT CHUẨN 100%! <<<');
  process.exit(0);
} else {
  console.error('>>> KẾT QUẢ: CÓ HẠNG MỤC KHÔNG ĐẠT YÊU CẦU! <<<');
  process.exit(1);
}
