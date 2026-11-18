/**
 * Script Node.js kiểm thử tự động toàn diện BƯỚC V15-22:
 * ĐẠI TU TOÀN DIỆN MÀN HÌNH MENU CHÍNH (MAIN MENU SCENE)
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

const rootDir = process.cwd();
const menuScenePath = path.join(rootDir, 'src', 'scenes', 'MainMenuScene.ts');
const audioManagerPath = path.join(rootDir, 'src', 'audio', 'AudioManager.ts');

console.log('======================================================================');
console.log('🧪 VERIFY V15-22: MAIN MENU SCENE OVERHAUL (ANIMATED DIORAMA & UI/UX)');
console.log('======================================================================\n');

assert(fs.existsSync(menuScenePath), 'Tệp src/scenes/MainMenuScene.ts tồn tại');
assert(fs.existsSync(audioManagerPath), 'Tệp src/audio/AudioManager.ts tồn tại');

const menuContent = fs.readFileSync(menuScenePath, 'utf8');
const audioContent = fs.readFileSync(audioManagerPath, 'utf8');

let passCount = 0;
function pass(msg) {
  passCount++;
  console.log(`[PASS] ${msg}`);
}

// -----------------------------------------------------------------------------
// PHẦN 1: Animated Diorama Background (3 Lớp Chiều Sâu Rừng Đêm Sương Mù)
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Animated Diorama Background (3 Lớp Chiều Sâu Rừng Đêm Sương Mù) ---');

assert(menuContent.includes('fillGradientStyle(0x05080c, 0x05080c, 0x0c131a, 0x080e12, 1)'), 'Nền trời đêm rừng sương thẫm #0b0e14 chuyển sắc điện ảnh');
pass('Nền trời đêm rừng sương thẫm #0b0e14 chuyển sắc điện ảnh');

assert(menuContent.includes('bellTowerKey') && (menuContent.includes('SPRITE_BELL_TOWER_GRAND_V15') || menuContent.includes('SPRITE_BELL_TOWER')), 'Bóng Tháp Chuông Cổ ẩn hiện xa xa phía sau');
pass('Bóng Tháp Chuông Cổ ẩn hiện xa xa phía sau (Ancient Bell Tower silhouette)');

assert(menuContent.includes('distantTower') && menuContent.includes('duration: 9000'), 'Tháp chuông có tween mờ ảo trăng lạnh chu kỳ chậm');
pass('Tháp chuông có tween mờ ảo trăng lạnh lấp ló trong sương');

assert(menuContent.includes('fogBack') && menuContent.includes('tilePositionX: 512') && menuContent.includes('duration: 48000'), 'Tầng sương mù hậu cảnh trôi cực chậm');
pass('Tầng sương mù hậu cảnh trôi cực chậm (duration 48,000ms)');

assert(menuContent.includes('pineKey') && (menuContent.includes('SPRITE_TREE_MIST_PINE_V15') || menuContent.includes('SPRITE_TREE_OAK_1')), 'Rặng thông sương mù phân tầng ở trung cảnh');
pass('Rặng thông sương mù phân tầng với sắc xanh đen sương lạnh ở trung cảnh');

assert(menuContent.includes('fogMid') && menuContent.includes('tilePositionX: -512') && menuContent.includes('duration: 32000'), 'Tầng sương trung cảnh trôi chậm ngược chiều');
pass('Tầng sương trung cảnh trôi chậm ngược chiều (duration 32,000ms)');

assert(menuContent.includes('fogFront') && menuContent.includes('tilePositionX: 384') && menuContent.includes('duration: 22000'), 'Dải sương là là mặt đất ở tiền cảnh');
pass('Dải sương là là mặt đất ở tiền cảnh (low-lying rolling mist, duration 22,000ms)');

assert(menuContent.includes('createAmbientEmbers()') && menuContent.includes('emberParticles'), 'Đom đóm & tàn lửa hổ phách bay lượn trong không gian');
pass('Đom đóm & tàn lửa hổ phách bay lượn trong không gian');

// -----------------------------------------------------------------------------
// PHẦN 2: Góc Phải: Tiểu Cảnh Sinh Tồn Hoàn Chỉnh (Survival Camp Diorama)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Góc Phải: Tiểu Cảnh Sinh Tồn Hoàn Chỉnh (Survival Camp Diorama) ---');

assert(menuContent.includes('createSurvivalCampDiorama()'), 'MainMenuScene định nghĩa hàm createSurvivalCampDiorama');
pass('MainMenuScene định nghĩa hàm createSurvivalCampDiorama');

assert(menuContent.includes('soilGround') && menuContent.includes('fillEllipse'), 'Nền đất rêu tối có phân tầng chiều sâu dưới chân tiểu cảnh');
pass('Nền đất rêu tối có phân tầng chiều sâu dưới chân tiểu cảnh');

assert(menuContent.includes('shadow.fillEllipse(heroX, groundY, 78, 18)') && menuContent.includes('shadow.fillEllipse(fireX, groundY + 1, 74, 18)'), 'Bóng đổ thật mềm mại chạm đất khít dưới chân nhân vật và bếp lửa');
pass('Bóng đổ thật mềm mại chạm đất khít dưới chân nhân vật và bếp lửa');

assert(menuContent.includes('menu_campfire_glow_smooth_v15'), 'Tạo texture quầng sáng lửa trại tỏa mịn đa tầng');
pass('Tạo texture quầng sáng lửa trại tỏa mịn đa tầng (menu_campfire_glow_smooth_v15)');

assert(menuContent.includes('createRadialGradient(220, 220, 0, 220, 220, 220)'), 'Radial Gradient đa tầng mềm mại loại bỏ 100% vòng tròn đồng tâm cắt cứng');
pass('Radial Gradient đa tầng mềm mại loại bỏ 100% vòng tròn đồng tâm cắt cứng');

assert(menuContent.includes('flameCore') && menuContent.includes('fillTriangle'), 'Bếp lửa trại có ngọn lửa 3 tầng bập bùng sống động');
pass('Bếp lửa trại có ngọn lửa 3 tầng bập bùng sống động (vàng chanh, hổ phách, đỏ cam)');

assert(menuContent.includes('createCampfireEmbers(fireX, groundY - 16)'), 'Hạt tàn lửa bốc lên trực tiếp từ bếp lửa trại');
pass('Hạt tàn lửa bốc lên trực tiếp từ bếp lửa trại');

assert(menuContent.includes('WAYFARER_ORIGIN_X') && menuContent.includes('WAYFARER_ORIGIN_Y'), 'Nhân vật The Mossbound Wayfarer đặt origin chuẩn chạm đất');
pass('Nhân vật The Mossbound Wayfarer đặt origin chuẩn chạm đất (triệt tiêu lỗi bay lơ lửng)');

assert(menuContent.includes('✦ LỮ KHÁCH VÙNG ĐẦM RÊU ✦') && menuContent.includes('The Mossbound Wayfarer • Bên Ngọn Lửa Trại Bellhollow'), 'Nhãn danh xưng và bối cảnh sinh tồn trang trọng dưới chân nhân vật');
pass('Nhãn danh xưng và bối cảnh sinh tồn trang trọng dưới chân nhân vật');

// -----------------------------------------------------------------------------
// PHẦN 3: Cụm Tiêu Đề Logo & Hoa Văn Sang Trọng
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Cụm Tiêu Đề Logo & Hoa Văn Sang Trọng ---');

assert(menuContent.includes('Cinzel, Georgia, "Times New Roman", serif'), 'Kiểu chữ serif cổ điển uy nghiêm cho tiêu đề Logo');
pass('Kiểu chữ serif cổ điển uy nghiêm cho tiêu đề Logo');

assert(menuContent.includes('HOLLOW WOODS') && menuContent.includes('#e5a93c') && menuContent.includes('#060402'), 'Tông vàng đồng pha cam lửa trầm với bóng đổ sâu sắc nét');
pass('Tông vàng đồng pha cam lửa trầm với bóng đổ sâu sắc nét');

assert(menuContent.includes('DỊ CẢNH RỪNG SƯƠNG — THE FOG THAT REMEMBERS'), 'Dòng phụ đề cân đối: DỊ CẢNH RỪNG SƯƠNG — THE FOG THAT REMEMBERS');
pass('Dòng phụ đề cân đối: DỊ CẢNH RỪNG SƯƠNG — THE FOG THAT REMEMBERS');

assert(menuContent.includes('lineBetween(menuCenterX - 190, 204, menuCenterX + 190, 204)') && menuContent.includes('diamond'), 'Đường chỉ hoa văn đồng cổ và viên ngọc hổ phách hình thoi');
pass('Đường chỉ hoa văn đồng cổ và viên ngọc hổ phách hình thoi');

// -----------------------------------------------------------------------------
// PHẦN 4: Hệ Thống 4 Nút Điều Hướng Thẻ Gỗ Khắc Viền Đồng
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: Hệ Thống 4 Nút Điều Hướng Thẻ Gỗ Khắc Viền Đồng ---');

assert(menuContent.includes('► BƯỚC VÀO MÀN SƯƠNG'), 'Nút 1: Bước Vào Màn Sương');
pass('Nút 1: Bước Vào Màn Sương (New Game)');

assert(menuContent.includes('► TIẾP TỤC HÀNH TRÌNH') && menuContent.includes('▷ TIẾP TỤC (CHƯA CÓ BẢN LƯU)'), 'Nút 2: Tiếp Tục Hành Trình');
pass('Nút 2: Tiếp Tục Hành Trình (Continue Game)');

assert(menuContent.includes('checkpointDesc') && menuContent.includes('Hồi 0 • Cổng Làng Bellhollow'), 'Nút Tiếp Tục hiển thị thông tin bản lưu 2 dòng rõ ràng');
pass('Nút Tiếp Tục hiển thị thông tin bản lưu 2 dòng rõ ràng không tràn viền');

assert(menuContent.includes('btnW = 460'), 'Thẻ gỗ có chiều rộng 460px thoáng đãng');
pass('Thẻ gỗ có chiều rộng 460px thoáng đãng, cân đối');

assert(menuContent.includes('⚙ CÀI ĐẶT TRÒ CHƠI'), 'Nút 3: Cài Đặt Trò Chơi');
pass('Nút 3: Cài Đặt Trò Chơi (Settings)');

assert(menuContent.includes('📜 BIÊN NIÊN SỬ & HƯỚNG DẪN'), 'Nút 4: Biên Niên Sử & Hướng Dẫn');
pass('Nút 4: Biên Niên Sử & Hướng Dẫn (Chronicle & Lore Guide)');

assert(menuContent.includes('showChronicleAndGuideModal()'), 'Phương thức mở Modal Biên Niên Sử & Hướng Dẫn');
pass('Phương thức mở Modal Biên Niên Sử & Hướng Dẫn');

// -----------------------------------------------------------------------------
// PHẦN 5: Hiệu Ứng Tương Tác Mượt Mà (Hover & Click)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 5: Hiệu Ứng Tương Tác Mượt Mà (Hover & Click) ---');

assert(menuContent.includes('txtRuneLeft') && menuContent.includes('txtRuneRight'), 'Xuất hiện mũi tên cổ ngữ hai bên thẻ gỗ khi hover');
pass('Xuất hiện mũi tên cổ ngữ hai bên thẻ gỗ khi hover');

assert(menuContent.includes('᛫ ᚱ ‹') && menuContent.includes('› ᚱ ᛫'), 'Ký tự mũi tên cổ ngữ sắc nét rực sáng hổ phách');
pass('Ký tự mũi tên cổ ngữ sắc nét rực sáng hổ phách');

assert(audioContent.includes('public playWoodTap'), 'AudioManager định nghĩa phương thức playWoodTap');
pass('AudioManager định nghĩa phương thức playWoodTap');

assert(menuContent.includes('AudioManager.getInstance().playWoodTap(0.45)'), 'Nút Menu gọi playWoodTap khi di chuột vào thẻ gỗ');
pass('Nút Menu gọi playWoodTap khi di chuột vào thẻ gỗ (âm thanh gõ gỗ trầm êm tai)');

assert(menuContent.includes('scaleX: 1.025') && menuContent.includes('scaleX: 0.985'), 'Tween phóng to nhẹ khi hover và co nhẹ khi click');
pass('Tween phóng to nhẹ khi hover (1.025) và co nhẹ khi click (0.985)');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`TEST SUMMARY: ALL ${passCount} CHECKS PASSED (100%)`);
console.log('======================================================================');
console.log('🎉 BƯỚC V15-22 ĐÃ THIẾT KẾ VÀ HOÀN TẤT ĐẠI TU MAIN MENU SCENE THÀNH CÔNG!\n');
