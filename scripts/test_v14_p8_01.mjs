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

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ XÁC MINH BƯỚC V14-P8-01');
console.log('======================================================================\n');

// 1. Kiểm tra GameScene.ts
console.log('--- 1. Cấu hình Ánh Sáng Đèn Lồng & Fog of War (GameScene.ts) ---');
const gameSceneContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');

assert(
  gameSceneContent.includes('this.fogOfWarLayer.setOrigin(0, 0);'),
  'fogOfWarLayer được cấu hình origin(0, 0) bao phủ trọn vẹn màn hình 1280x720'
);

assert(
  gameSceneContent.includes('cached_lantern_glow_radial'),
  'Texture radial gradient mượt mà cached_lantern_glow_radial được khởi tạo'
);

assert(
  gameSceneContent.includes('this.cachedLightMaskImage.setOrigin(0.5, 0.5);'),
  'cachedLightMaskImage được thiết lập origin(0.5, 0.5) chuẩn tâm mặt nạ đục sương'
);

assert(
  gameSceneContent.includes('this.lanternGlowImage.setOrigin(0.5, 0.5);'),
  'lanternGlowImage được thiết lập origin(0.5, 0.5) chuẩn tâm quầng sáng'
);

assert(
  gameSceneContent.includes('this.lanternGlowImage.setBlendMode(Phaser.BlendModes.ADD);'),
  'lanternGlowImage sử dụng chế độ hòa trộn quang học ADD blend mode'
);

assert(
  gameSceneContent.includes('camCenterX + (lightWorldX - camWorldCenterX) * cam.zoom'),
  'Đồng bộ hệ tọa độ thế giới sang màn hình với Camera Scroll, Center và Camera Zoom'
);

assert(
  gameSceneContent.includes('this.lanternGlowImage.destroy();'),
  'lanternGlowImage được giải phóng an toàn khi shutdown/chuyển cảnh'
);

// 2. Kiểm tra SatyrPlayer.ts
console.log('\n--- 2. Tọa độ Đầu Đèn Lồng 4 Hướng của Nhân Vật (SatyrPlayer.ts) ---');
const satyrContent = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf-8');

assert(
  satyrContent.includes('LANTERN_OFFSET_DOWN') &&
  satyrContent.includes('LANTERN_OFFSET_UP') &&
  satyrContent.includes('LANTERN_OFFSET_LEFT') &&
  satyrContent.includes('LANTERN_OFFSET_RIGHT'),
  'SatyrPlayer tính toán vị trí nguồn sáng bám sát đầu gậy đèn lồng theo đủ 4 hướng'
);

assert(
  satyrContent.includes('public getLanternWorldPosition()'),
  'SatyrPlayer cung cấp hàm getLanternWorldPosition() chuẩn hóa tọa độ thế giới'
);

// 3. Kiểm tra UIScene.ts
console.log('\n--- 3. Bố cục Giao diện HUD & Tránh Đè Chữ Dầu Đèn (UIScene.ts) ---');
const uiSceneContent = fs.readFileSync('src/scenes/UIScene.ts', 'utf-8');

assert(
  uiSceneContent.includes('createText(this, 308, 68, \'ĐÈN: TẮT [F]\''),
  'Chữ trạng thái ĐÈN [F] được dời tâm sang x=308 (+28px)'
);

assert(
  uiSceneContent.includes('fillRoundedRect(280, 59, 58, 18, 4);') &&
  uiSceneContent.includes('strokeRoundedRect(280, 59, 58, 18, 4);'),
  'Khung nền trạng thái [F] BẬT / TẮT bắt đầu tại x=280 (+28px) không đè lên chữ Dầu Đèn'
);

// 4. Kiểm tra Chuỗi Tương Tác Không Lặp Từ
console.log('\n--- 4. Chuỗi Tương Tác Tấm Biển & Lời Nhắc (GameScene.ts & zones.json) ---');
const zonesContent = fs.readFileSync('src/data/zones.json', 'utf-8');

assert(
  zonesContent.includes('"promptText": "[E] Xem Tấm Biển Mục"'),
  'zones.json: Tấm Biển Cũ tại Fog Crossing có promptText là "[E] Xem Tấm Biển Mục"'
);

assert(
  zonesContent.includes('"promptText": "[E] Kiểm tra Lối Mòn Phía Sau"'),
  'zones.json: Rào chắn phía Tây có promptText là "[E] Kiểm tra Lối Mòn Phía Sau"'
);

assert(
  gameSceneContent.includes('replace(/^(nhấn\\s+)?\\[e\\]\\s*/i, \'\')'),
  'GameScene.ts: Bộ lọc chuỗi tương tác loại bỏ triệt để tiền tố lặp từ "[E] Nhấn [E]"'
);

// 5. Kiểm tra VeilSystem.ts
console.log('\n--- 5. Hệ thống Sương Mù Parallax (VeilSystem.ts) ---');
const veilContent = fs.readFileSync('src/systems/VeilSystem.ts', 'utf-8');

assert(
  veilContent.includes('getLanternDissipationFactor'),
  'VeilSystem cung cấp hàm getLanternDissipationFactor() phục vụ đồng bộ hóa sương'
);

console.log('\n======================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
}
