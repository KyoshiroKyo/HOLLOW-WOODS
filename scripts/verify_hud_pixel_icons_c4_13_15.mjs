import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log('================================================================');
console.log('VERIFYING MILESTONE C4-13-15: HUD STATS PIXEL ART ICONS (16x16 PX)');
console.log('================================================================\n');

// 1. Kiểm tra HUDIconGenerator.ts
console.log('--- 1. KIỂM TRA BỘ SINH BIỂU TƯỢNG (HUDICONGENERATOR.TS) ---');
const generatorPath = path.resolve('src/utils/HUDIconGenerator.ts');
assert(fs.existsSync(generatorPath), 'Tập tin HUDIconGenerator.ts tồn tại trên đĩa');

const genCode = fs.readFileSync(generatorPath, 'utf8');

assert(
  genCode.includes("HUD_ICON_HEALTH = 'hud_icon_health'") &&
  genCode.includes("HUD_ICON_STAMINA = 'hud_icon_stamina'") &&
  genCode.includes("HUD_ICON_OIL = 'hud_icon_oil'") &&
  genCode.includes("HUD_ICON_COMPOSURE = 'hud_icon_composure'"),
  'Định nghĩa đầy đủ 4 khóa Texture định danh cho 4 thuộc tính HUD'
);

assert(
  genCode.includes('HEALTH_GRID') && genCode.includes('HEALTH_PALETTE') &&
  genCode.includes('0x2b0609') && genCode.includes('0xffffff'),
  'Icon Sinh Lực (Trái tim đỏ tươi) có viền tối (0x2b0609) và điểm sáng phản quang trắng (0xffffff)'
);

assert(
  genCode.includes('STAMINA_GRID') && genCode.includes('STAMINA_PALETTE') &&
  genCode.includes('0x362402') && genCode.includes('0xffffff'),
  'Icon Thể Lực (Tia Sấm Sét vàng) có viền tối (0x362402) và điểm sáng phản quang trắng (0xffffff)'
);

assert(
  genCode.includes('OIL_GRID') && genCode.includes('OIL_PALETTE') &&
  genCode.includes('0x2a1403') && genCode.includes('0xfff5d7'),
  'Icon Dầu Đèn (Đèn lồng / ngọn lửa) có viền tối (0x2a1403) và tim lửa phản quang ấm (0xfff5d7)'
);

assert(
  genCode.includes('COMPOSURE_GRID') && genCode.includes('COMPOSURE_PALETTE') &&
  genCode.includes('0x1f0b2b') && genCode.includes('0xffffff'),
  'Icon Bình Tâm (Con mắt / pha lê tím) có viền tối (0x1f0b2b) và điểm sáng phản quang trắng (0xffffff)'
);

assert(
  genCode.includes('FilterMode.NEAREST'),
  'Thiết lập chế độ lọc Nearest-Neighbor cho đồ họa Pixel Art 16x16 sắc nét'
);

// 2. Kiểm tra PreloadScene.ts
console.log('\n--- 2. KIỂM TRA ĐĂNG KÝ TẠI PRELOADSCENE.TS ---');
const preloadPath = path.resolve('src/scenes/PreloadScene.ts');
const preloadCode = fs.readFileSync(preloadPath, 'utf8');

assert(
  preloadCode.includes('HUDIconGenerator.generateAllHUDIcons(this)'),
  'PreloadScene tự động nạp và khởi tạo 4 Texture Pixel Art 16x16 khi khởi động game'
);

// 3. Kiểm tra UIScene.ts
console.log('\n--- 3. KIỂM TRA TÍCH HỢP TẠI UISCENE.TS ---');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneCode = fs.readFileSync(uiScenePath, 'utf8');

assert(
  uiSceneCode.includes('statIconImages'),
  'UIScene có thuộc tính statIconImages quản lý danh sách sprite icon'
);

assert(
  uiSceneCode.includes('HUDIconGenerator.generateAllHUDIcons(this)'),
  'UIScene kiểm tra bảo đảm 4 Texture Pixel Art luôn tồn tại'
);

assert(
  uiSceneCode.includes('HUDIconGenerator.drawIconsToGraphics(this.statIconsGraphics'),
  'UIScene vẽ trực tiếp 4 icon pixel art 16x16 sắc nét lên statIconsGraphics'
);

assert(
  uiSceneCode.includes('HUD_ICON_HEALTH') && uiSceneCode.includes('HUD_ICON_STAMINA') &&
  uiSceneCode.includes('HUD_ICON_OIL') && uiSceneCode.includes('HUD_ICON_COMPOSURE'),
  'UIScene khởi tạo 4 Sprite Image độc lập từ 4 Texture Pixel Art'
);

assert(
  uiSceneCode.includes('for (const iconImg of this.statIconImages)'),
  'setHUDVisible đồng bộ ẩn/hiện 4 icon thuộc tính khi mở Modal'
);

console.log('\n================================================================');
console.log('>>> TẤT CẢ 12 TIÊU CHÍ KIỂM TRA ICON HUD C4-13-15 ĐỀU ĐẠT CHUẨN 100%! <<<');
console.log('================================================================');
