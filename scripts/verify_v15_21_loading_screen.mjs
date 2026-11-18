import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

console.log('=== RUNNING VERIFICATION FOR STEP V15-21: ARTISTIC LOADING SCREEN IN PRELOADSCENE ===\n');

try {
  const preloadPath = path.resolve('src/scenes/PreloadScene.ts');
  const code = fs.readFileSync(preloadPath, 'utf8');
  assert(true, 'Đọc thành công src/scenes/PreloadScene.ts');

  // 1. Kiểm tra màu nền rừng sương thẫm #0b0e14
  assert(code.includes("setBackgroundColor('#0b0e14')"), 'Thiết lập màu nền rừng sương thẫm #0b0e14 trên Camera');
  assert(code.includes('0x06080d') && code.includes('0x0b0e14') && code.includes('0x081016'), 'Gradient rừng sương thẫm chuyển sắc điện ảnh');
  assert(code.includes('treePositions') && code.includes('treeHeights'), 'Vẽ bóng cây thông rừng sâu mờ ảo phía xa');

  // 2. Kiểm tra Biểu tượng Đèn Lồng Cổ (Ancient Brass Lantern)
  assert(code.includes('lanternContainer = this.add.container(640,'), 'Đèn Lồng Cổ đặt tại tâm trục X=640 phía trên thanh tải');
  assert(code.includes('auraGfx') && code.includes('0xf39c12') && code.includes('0xe67e22') && code.includes('0xfff9c4'), 'Quầng sáng hổ phách đa tầng tỏa rộng từ đèn');
  assert(code.includes('flameGfx') && code.includes('fillCircle(0, 14, 7)') && code.includes('0xffeb3b'), 'Ngọn lửa lập lòe lõi vàng bên trong buồng kính');
  assert(code.includes('0x5d4037') && code.includes('0x3e2723') && code.includes('0xd4af37'), 'Khung đồng cổ, xích treo và đinh tán đèn lồng');

  // 3. Kiểm tra Hoạt ảnh Đèn Lồng và Hạt Tàn Lửa (Embers)
  assert(code.includes('angle: { from: -3.5, to: 3.5 }'), 'Tween đèn lồng đung đưa tự nhiên (-3.5 đến +3.5 độ)');
  assert(code.includes('targets: flameGfx') && code.includes('scaleY: { from: 0.88, to: 1.15 }'), 'Tween ngọn lửa bập bùng sống động');
  assert(code.includes('targets: auraGfx') && code.includes('scale: { from: 0.94, to: 1.07 }'), 'Tween quầng sáng hổ phách co giãn nhịp thở');
  assert(code.includes('embers') && code.includes('Quad.easeOut'), 'Tạo và tween các hạt tàn lửa (Embers) bay lơ lửng lên trên');

  // 4. Kiểm tra Tiêu đề & Phụ đề Game
  assert(code.includes("'HOLLOW WOODS'") && code.includes("color: '#f39c12'"), 'Tiêu đề HOLLOW WOODS màu hổ phách vàng kim');
  assert(code.includes("'THE FOG THAT REMEMBERS'") && code.includes("fontStyle: 'italic'"), 'Phụ đề THE FOG THAT REMEMBERS in nghiêng');

  // 5. Kiểm tra Thanh tiến trình tải (Loading Bar)
  assert(code.includes('barWidth = 480') && code.includes('barHeight = 22'), 'Kích thước thanh tải chuẩn cân đối: 480×22 px');
  assert(code.includes('0x140e0a') && code.includes('0x8c6d36') && code.includes('0xd4af37'), 'Khung viền gỗ sồi tối nạm đồng cổ và 4 đinh tán góc');
  assert(code.includes('progressBar.fillStyle(0xd35400, 1)') && code.includes('progressBar.fillStyle(0xf39c12, 1)'), 'Lõi thanh tải chảy mượt màu vàng hổ phách ấm');
  assert(code.includes('progressBar.fillStyle(0xfff9c4, 0.65)'), 'Dải sáng óng ánh trên đỉnh lõi thanh tải');

  // 6. Kiểm tra Nhãn phần trăm và Trạng thái nạp
  assert(code.includes("percentText.setText(`${Math.floor(value * 100)}%`)"), 'Cập nhật con số phần trăm 0% -> 100%');
  assert(code.includes("assetStatusText.setText(`Đang nạp: ${displayName}`)"), 'Cập nhật tên tài nguyên đang nạp rõ nét từ fileprogress');
  assert(code.includes('Đang xuyên qua Màn Sương...'), 'Dòng trạng thái truyền thuyết phía trên thanh tải');

  // 7. Kiểm tra Khu vực Mẹo Sinh Tồn & Mảnh Truyền Thuyết
  assert(code.includes('LORE_TIPS: string[]') && code.includes('PreloadScene.LORE_TIPS.length'), 'Danh mục trích dẫn cốt truyện LORE_TIPS');
  assert(code.includes('❖ MẸO SINH TỒN & TRUYỀN THUYẾT ❖'), 'Tiêu đề hộp truyền thuyết chuẩn gothic');
  assert(code.includes('tipBox.fillRoundedRect') && code.includes('boxW = 680'), 'Hộp mẹo sinh tồn kích thước 680×88 px bo góc mềm mại');
  assert(code.includes('delay: 4500') && code.includes('loop: true'), 'Xoay tua ngẫu nhiên mẹo sinh tồn mỗi 4.5 giây');

  // 8. Kiểm tra Hiệu ứng Chuyển cảnh mượt mà Camera Fade Out 450ms
  assert(code.includes('this.cameras.main.fadeOut(450, 11, 14, 20)'), 'Hiệu ứng Camera Fade Out 450ms về màu nền #0b0e14');
  assert(code.includes('FADE_OUT_COMPLETE') && code.includes('this.scene.start(SCENE_MAIN_MENU)'), 'Chuyển cảnh an toàn sang MainMenuScene khi fade out xong');
  assert(code.includes('this.time.delayedCall(550, proceedToMenu)'), 'Dự phòng delayedCall 550ms chống kẹt chuyển cảnh');

  // 9. Bảo toàn các chức năng cốt lõi bắt buộc
  assert(code.includes("dummyGfx.generateTexture('dummy_transparent', 1, 1)"), 'Bảo toàn texture dummy_transparent');
  assert(code.includes('HUDIconGenerator.generateAllHUDIcons(this)'), 'Bảo toàn nạp HUD Icons');
  assert(code.includes('AtlasTextureResolver.syncTextures(this)'), 'Bảo toàn đồng bộ AtlasTextureResolver');
  assert(code.includes('AudioManager.getInstance().syncWithPhaserCache(this)'), 'Bảo toàn đồng bộ cache âm thanh AudioManager');

} catch (e) {
  assert(false, `Lỗi kiểm tra PreloadScene: ${e.message}`);
}

console.log('\n---------------------------------------------------------');
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('---------------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> V15-21 VERIFICATION COMPLETED WITH 100% SUCCESS <<<\n');
  process.exit(0);
}
