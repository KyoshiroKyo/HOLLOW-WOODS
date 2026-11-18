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
console.log('   HOLLOW WOODS V1.5 — KIỂM THỬ XÁC MINH BƯỚC V15-24');
console.log('   (LÀM SẠCH THANH CÔNG CỤ ĐÁY & TÁI THIẾT KẾ TOÀN DIỆN HUD CHÍNH)');
console.log('======================================================================\n');

// 1. Kiểm tra dải HUD đáy và xóa bỏ nút trùng lặp (UIScene.ts)
console.log('--- 1. Kiểm tra Dải HUD Đáy & Loại bỏ Nút Trùng Lặp ---');
const uiSceneCode = fs.readFileSync('src/scenes/UIScene.ts', 'utf-8');

assert(
  uiSceneCode.includes("id: 'poultice'") &&
  uiSceneCode.includes("id: 'oil'") &&
  uiSceneCode.includes("id: 'emergency'") &&
  uiSceneCode.includes("id: 'lure'") &&
  uiSceneCode.includes("id: 'lantern'") &&
  uiSceneCode.includes("id: 'craft'") &&
  uiSceneCode.includes("id: 'journal'") &&
  uiSceneCode.includes("id: 'pause'"),
  'Dải HUD đáy quy hoạch chuẩn 8 slot duy nhất: [1] Thuốc Đắp, [2] Dầu Đèn, [3] Trà/Đuốc, [Q] Mồi Ném, [F] Đèn Lồng, [C] Chế Tạo, [J] Sổ Tay, [ESC] Tạm Dừng'
);

assert(
  !uiSceneCode.includes("id: 'interact'") &&
  !uiSceneCode.includes("key: '[I] Chế Tạo'"),
  'Đã loại bỏ hoàn toàn nút [E] Tương Tác thừa và nút lặp [I] Chế Tạo trong QuickSlots'
);

assert(
  !uiSceneCode.includes('craftX = 66') &&
  !uiSceneCode.includes('journalX = 164'),
  'Đã xóa bỏ hoàn toàn 2 nút trùng lặp góc dưới trái trong buildQuickActionButtons'
);

assert(
  uiSceneCode.includes('sepGfx') &&
  uiSceneCode.includes('lineBetween(102, -14, 102, 14)'),
  'Bố trí vạch ngăn cách kim loại đồng xỉn tinh tế phân định Cụm Sinh Tồn và Cụm Công Cụ'
);

assert(
  uiSceneCode.includes("keydown-C") &&
  uiSceneCode.includes("keydown-I") &&
  uiSceneCode.includes("this.toggleCrafting();"),
  'Hỗ trợ song song cả 2 phím tắt [C] và [I] để mở Bàn Chế Tạo'
);

assert(
  uiSceneCode.includes("keydown-J") &&
  uiSceneCode.includes("this.toggleJournal();"),
  'Hỗ trợ phím tắt [J] mở Sổ Tay'
);

assert(
  uiSceneCode.includes("keydown-ESC") &&
  uiSceneCode.includes("this.togglePause();"),
  'Hỗ trợ phím tắt [ESC] mở Menu Tạm Dừng'
);

// 2. Kiểm tra ô số [3] Trà/Đuốc Khẩn Cấp & Phím 3
console.log('\n--- 2. Kiểm tra Cơ chế Ô [3] Trà / Đuốc Khẩn Cấp ---');
assert(
  uiSceneCode.includes('public tryUseEmergencySurvivalItem(): boolean'),
  'UIScene khai báo phương thức tryUseEmergencySurvivalItem() xử lý ô khẩn cấp [3]'
);

assert(
  uiSceneCode.includes('food_calming_tea') &&
  uiSceneCode.includes('item_resin_flare'),
  'tryUseEmergencySurvivalItem kiểm tra cả Trà An Thần (food_calming_tea) và Đuốc Nhựa Thông (item_resin_flare)'
);

assert(
  uiSceneCode.includes('emergencyCountBadge') &&
  uiSceneCode.includes('emergencyCountText'),
  'Trang bị huy hiệu đếm số lượng vật phẩm khẩn cấp trên ô số [3]'
);

const satyrCode = fs.readFileSync('src/entities/SatyrPlayer.ts', 'utf-8');
assert(
  satyrCode.includes("'emergency'") &&
  satyrCode.includes("case 'Digit3'") || satyrCode.includes("code === 'Digit3'"),
  'SatyrPlayer tiếp nhận phím Digit3 kích hoạt action emergency'
);

assert(
  satyrCode.includes('public isEmergencyRequested(): boolean'),
  'SatyrPlayer cung cấp phương thức isEmergencyRequested()'
);

const gameSceneCode = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');
assert(
  gameSceneCode.includes('this.player.isEmergencyRequested()') &&
  gameSceneCode.includes('this.uiScene.tryUseEmergencySurvivalItem()'),
  'GameScene xử lý yêu cầu khẩn cấp từ phím [3] và gọi uiScene.tryUseEmergencySurvivalItem()'
);

// 3. Kiểm tra Cụm Chỉ Số Sinh Tồn góc trên trái & Hàng phụ bên dưới
console.log('\n--- 3. Kiểm tra Cụm Chỉ Số Sinh Tồn Góc Trên Trái & Hàng Phụ ---');
assert(
  uiSceneCode.includes('fillRoundedRect(14, 10, 376, 96, 6)'),
  'Khung chính góc trên trái mở rộng kích thước 376x96 px (x: 14, y: 10) sang trọng, viền đồng'
);

assert(
  uiSceneCode.includes('const barX = 42;') &&
  uiSceneCode.includes('const barWidth = 175;'),
  '4 Thanh chỉ số sinh tồn đạt độ rộng chuẩn 175px (x: 42), thẳng hàng tăm tắp'
);

assert(
  uiSceneCode.includes('this.healthValText = HDTextHelper.createText(this, 228, 32') &&
  uiSceneCode.includes('this.staminaValText = HDTextHelper.createText(this, 228, 48') &&
  uiSceneCode.includes('this.oilValText = HDTextHelper.createText(this, 228, 64') &&
  uiSceneCode.includes('this.composureValText = HDTextHelper.createText(this, 228, 80'),
  '4 Nhãn số liệu (Sinh Lực, Thể Lực, Dầu Đèn, Bình Tâm) căn lề tăm tắp tại x: 228, y: 32/48/64/80'
);

assert(
  uiSceneCode.includes('hRatio <= 0.25') &&
  uiSceneCode.includes('sRatio <= 0.3') &&
  uiSceneCode.includes('oRatio <= 0.2') &&
  uiSceneCode.includes('cRatio <= 0.2'),
  'Hiệu ứng chuyển màu mượt mà trên 4 thanh đo theo ngưỡng tỉ lệ máu, thể lực, dầu đèn, bình tâm'
);

assert(
  uiSceneCode.includes('badgeX = 14') &&
  uiSceneCode.includes('badgeY = 112') &&
  uiSceneCode.includes('badgeW = 96') &&
  uiSceneCode.includes('badgeH = 22'),
  'Nhãn trạng thái đèn lồng [F] chuyển xuống hàng phụ bên dưới (x: 14, y: 112, w: 96, h: 22)'
);

assert(
  uiSceneCode.includes('const bX = 116;') &&
  uiSceneCode.includes('const bY = 112;') &&
  uiSceneCode.includes('const bW = 126;') &&
  uiSceneCode.includes('const tX = 248;') &&
  uiSceneCode.includes('const tY = 112;') &&
  uiSceneCode.includes('const tW = 142;'),
  '2 Huy hiệu Độ Ẩm (116..242) và Thân Nhiệt (248..390) xếp hàng phụ ngay bên dưới, khớp hoàn hảo 376px khung chính'
);

// 4. Kiểm tra Đồng Hồ góc trên phải & Khung Nhiệm Vụ thu gọn/mở rộng
console.log('\n--- 4. Kiểm tra Đồng Hồ Tròn 3 Múi & Khung Nhiệm Vụ Thu Gọn ---');
assert(
  uiSceneCode.includes('timeBoxX = 704') &&
  uiSceneCode.includes('timeBoxY = 16'),
  'Đồng hồ tròn đặt tại x: 704, y: 16, giải phóng toàn bộ hành lang di chuyển phía Bắc (x: 390..704)'
);

assert(
  uiSceneCode.includes('public isQuestCollapsed: boolean = false;') &&
  uiSceneCode.includes('public toggleQuestCollapse(): void') &&
  uiSceneCode.includes('public redrawQuestBox(): void'),
  'Hỗ trợ cơ chế thu gọn/mở rộng nhẹ nhàng cho Khung Nhiệm Vụ (toggleQuestCollapse & redrawQuestBox)'
);

assert(
  uiSceneCode.includes('questToggleBtn') &&
  uiSceneCode.includes('questToggleZone'),
  'Trang bị nút bấm ▲/▼ và vùng tương tác zone cho bảng nhiệm vụ'
);

assert(
  uiSceneCode.includes('this.questToggleBtn.setVisible(visible)'),
  'setHUDVisible đồng bộ ẩn/hiện nút thu gọn nhiệm vụ khi mở modal hoặc hội thoại'
);

console.log('\n======================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ V15-24: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
}
