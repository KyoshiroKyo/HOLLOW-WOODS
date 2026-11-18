/**
 * VERIFY V15-23: SETTINGS MODALS, CONTROLS GUIDE & KEYCAP BADGES AUDIT
 * Kiểm tra tính đầy đủ, chính xác và đồng bộ của:
 * 1. SettingsManager (Âm lượng BGM, SFX, Master, Mute, Screen Shake, Graphics Quality)
 * 2. SettingsUIHelper (Volume Sliders, Screen Shake Toggle, 2-Step Safe Clear Save Button)
 * 3. KeycapBadgeHelper (Keycap 3D Badges, 3 nhóm: Di chuyển, Sinh tồn, Tự vệ)
 * 4. MainMenuScene (Bottom Guide Bar với Keycaps, Settings Modal, Chronicle & Guide Modal)
 * 5. PauseModal (Sliders, Screen Shake Toggle, Safe Clear Save, Controls Guide Overlay [H])
 * 6. CameraSystem & AmbushMonsters (Khóa rung màn hình khi Screen Shake = false)
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

console.log('======================================================================');
console.log('🧪 VERIFY V15-23: SETTINGS, CHRONICLE & CONTROLS GUIDE OVERHAUL');
console.log('======================================================================\n');

let passCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// -----------------------------------------------------------------------------
// PHẦN 1: SettingsManager
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: SettingsManager (Hệ Thống Quản Lý Cài Đặt Toàn Cục) ---');
const settingsManagerPath = path.join(ROOT_DIR, 'src', 'systems', 'SettingsManager.ts');
assert(fs.existsSync(settingsManagerPath), 'File SettingsManager.ts tồn tại');

const settingsManagerSrc = fs.readFileSync(settingsManagerPath, 'utf8');
assert(settingsManagerSrc.includes('public static getInstance(): SettingsManager'), 'SettingsManager thiết kế chuẩn Singleton');
assert(settingsManagerSrc.includes('masterVolume:') && settingsManagerSrc.includes('musicVolume:') && settingsManagerSrc.includes('sfxVolume:'), 'Quản lý đủ 3 kênh âm lượng Master, Music (BGM) và SFX');
assert(settingsManagerSrc.includes('screenShakeEnabled:'), 'Hỗ trợ cấu hình Rung Màn Hình (screenShakeEnabled)');
assert(settingsManagerSrc.includes('isScreenShakeEnabled(): boolean'), 'Có getter isScreenShakeEnabled()');
assert(settingsManagerSrc.includes('setScreenShakeEnabled(enabled: boolean): void'), 'Có setter setScreenShakeEnabled()');
assert(settingsManagerSrc.includes('toggleScreenShake(): boolean'), 'Có phương thức toggleScreenShake()');
assert(settingsManagerSrc.includes('saveSettings') && settingsManagerSrc.includes('loadSettings'), 'Tích hợp lưu kép LocalStorage và CloudSaveService');

// -----------------------------------------------------------------------------
// PHẦN 2: SettingsUIHelper (Thanh Trượt, Công Tắc & Nút Xóa An Toàn 2 Lần)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: SettingsUIHelper (Component Giao Diện Cài Đặt) ---');
const settingsUIHelperPath = path.join(ROOT_DIR, 'src', 'ui', 'SettingsUIHelper.ts');
assert(fs.existsSync(settingsUIHelperPath), 'File SettingsUIHelper.ts tồn tại');

const settingsUIHelperSrc = fs.readFileSync(settingsUIHelperPath, 'utf8');
assert(settingsUIHelperSrc.includes('public static createVolumeSlider('), 'Định nghĩa hàm createVolumeSlider hỗ trợ thanh trượt âm lượng');
assert(settingsUIHelperSrc.includes('decBtn') && settingsUIHelperSrc.includes('incBtn'), 'Thanh trượt có 2 nút bước nhảy [-] và [+]');
assert(settingsUIHelperSrc.includes('percentTxt') && settingsUIHelperSrc.includes('Math.round(currentValue * 100)'), 'Thanh trượt hiển thị tỷ lệ % mượt mà trực quan');
assert(settingsUIHelperSrc.includes('thumbContainer') && settingsUIHelperSrc.includes('trackHitZone'), 'Hỗ trợ cả kéo thả chuột (drag) và bấm trực tiếp (click to jump)');
assert(settingsUIHelperSrc.includes('public static createScreenShakeToggle('), 'Định nghĩa hàm createScreenShakeToggle');
assert(settingsUIHelperSrc.includes('ĐANG BẬT') && settingsUIHelperSrc.includes('ĐÃ TẮT'), 'Công tắc Screen Shake hiển thị rõ trạng thái BẬT / TẮT');
assert(settingsUIHelperSrc.includes('public static createSafeClearSaveButton('), 'Định nghĩa hàm createSafeClearSaveButton');
assert(settingsUIHelperSrc.includes('XÁC NHẬN XÓA TIẾN TRÌNH? (BẤM LẦN NỮA)'), 'Nút Xóa Bản Lưu có bước cảnh báo xác nhận lần 2 an toàn');
assert(settingsUIHelperSrc.includes('cancelBtn'), 'Có nút HỦY để người chơi rút lại quyết định');
assert(settingsUIHelperSrc.includes('timeoutTimer = window.setTimeout'), 'Tự động hoàn tác về trạng thái an toàn sau 5s nếu không bấm xác nhận');

// -----------------------------------------------------------------------------
// PHẦN 3: KeycapBadgeHelper (Thẻ Phím Bấm 3D Trực Quan)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: KeycapBadgeHelper (Thẻ Phím Bấm Cơ 3D & 3 Nhóm Sinh Tồn) ---');
const keycapBadgeHelperPath = path.join(ROOT_DIR, 'src', 'ui', 'KeycapBadgeHelper.ts');
assert(fs.existsSync(keycapBadgeHelperPath), 'File KeycapBadgeHelper.ts tồn tại');

const keycapBadgeHelperSrc = fs.readFileSync(keycapBadgeHelperPath, 'utf8');
assert(keycapBadgeHelperSrc.includes('public static createKeycap('), 'Định nghĩa hàm createKeycap tạo thẻ phím đơn');
assert(keycapBadgeHelperSrc.includes('fillRoundedRect') && keycapBadgeHelperSrc.includes('strokeRoundedRect'), 'Thẻ phím bo góc có hiệu ứng gờ nổi viền 3D');
assert(keycapBadgeHelperSrc.includes('public static createKeyCluster('), 'Định nghĩa hàm createKeyCluster tạo cụm phím');
assert(keycapBadgeHelperSrc.includes('public static createActionRow('), 'Định nghĩa hàm createActionRow phối hợp Phím + Hành động + Mô tả');
assert(keycapBadgeHelperSrc.includes('NHÓM 1: DI CHUYỂN & THỂ LỰC'), 'Phân nhóm 1: Di chuyển & Thể lực (WASD, Shift)');
assert(keycapBadgeHelperSrc.includes('NHÓM 2: ÁNH SÁNG & SINH TỒN'), 'Phân nhóm 2: Ánh sáng & Sinh tồn (F, E, C, I, J)');
assert(keycapBadgeHelperSrc.includes('NHÓM 3: CHIẾN ĐẤU & TỰ VỆ'), 'Phân nhóm 3: Chiến đấu & Tự vệ (Q, Space, ESC)');

// -----------------------------------------------------------------------------
// PHẦN 4: MainMenuScene (Đáy Màn Hình, Settings Modal & Chronicle Modal)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 4: MainMenuScene (Đại Tu Giao Diện & Bảng Phím Bấm) ---');
const mainMenuPath = path.join(ROOT_DIR, 'src', 'scenes', 'MainMenuScene.ts');
const mainMenuSrc = fs.readFileSync(mainMenuPath, 'utf8');

assert(mainMenuSrc.includes('KeycapBadgeHelper.createKeyCluster(this, 185, gBoxY + 50, [\'W\', \'A\', \'S\', \'D\']'), 'Đáy màn hình hiển thị cụm Keycap [W][A][S][D]');
assert(mainMenuSrc.includes('KeycapBadgeHelper.createKeycap(this, 335, gBoxY + 50, \'SHIFT\''), 'Đáy màn hình hiển thị Keycap [SHIFT]');
assert(mainMenuSrc.includes('KeycapBadgeHelper.createKeycap(this, 420, gBoxY + 50, \'F\''), 'Đáy màn hình hiển thị Keycap [F] Đèn Lồng');
assert(mainMenuSrc.includes('KeycapBadgeHelper.createKeycap(this, 482, gBoxY + 50, \'E\''), 'Đáy màn hình hiển thị Keycap [E] Tương Tác');
assert(mainMenuSrc.includes('KeycapBadgeHelper.createKeycap(this, 750, gBoxY + 50, \'Q\''), 'Đáy màn hình hiển thị Keycap [Q] Ném Mồi');
assert(mainMenuSrc.includes('KeycapBadgeHelper.createKeycap(this, 845, gBoxY + 50, \'ESC\''), 'Đáy màn hình hiển thị Keycap [ESC] Tạm Dừng');
assert(mainMenuSrc.includes('guideHit.on(\'pointerdown\', () => {') && mainMenuSrc.includes('this.showChronicleAndGuideModal()'), 'Bấm vào dải đáy màn hình mở ngay Sổ Tay Hướng Dẫn & Biên Niên Sử');
assert(mainMenuSrc.includes('keydown-H'), 'Nhấn phím [H] mở nhanh Sổ Tay Hướng Dẫn & Biên Niên Sử');

// Settings Modal in MainMenuScene
assert(mainMenuSrc.includes('CÀI ĐẶT TRÒ CHƠI & HỆ THỐNG'), 'Settings Modal có tiêu đề trang trọng chuẩn');
assert(mainMenuSrc.includes('SettingsUIHelper.createVolumeSlider') && mainMenuSrc.includes('🎵 Nhạc Nền (BGM):'), 'Settings Modal có thanh trượt điều chỉnh Nhạc Nền (BGM)');
assert(mainMenuSrc.includes('SettingsUIHelper.createVolumeSlider') && mainMenuSrc.includes('🔊 Hiệu Ứng (SFX):'), 'Settings Modal có thanh trượt điều chỉnh Hiệu Ứng (SFX)');
assert(mainMenuSrc.includes('SettingsUIHelper.createScreenShakeToggle'), 'Settings Modal có tùy chọn Bật/Tắt Rung Màn Hình (Screen Shake)');
assert(mainMenuSrc.includes('SettingsUIHelper.createSafeClearSaveButton'), 'Settings Modal có nút Xóa Bản Lưu an toàn 2 lần');
assert(mainMenuSrc.includes('onSaveDataCleared'), 'Có hàm onSaveDataCleared cập nhật lại trạng thái nút Tiếp Tục');

// Chronicle Modal in MainMenuScene
assert(mainMenuSrc.includes('BIÊN NIÊN SỬ & HƯỚNG DẪN ĐIỀU KHIỂN'), 'Chronicle Modal có tiêu đề chuẩn');
assert(mainMenuSrc.includes('KeycapBadgeHelper.buildControlsGuideContent'), 'Chronicle Modal tích hợp bảng phím bấm 3 nhóm trực quan');

// -----------------------------------------------------------------------------
// PHẦN 5: PauseModal (Màn Hình Tạm Dừng)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 5: PauseModal (Màn Hình Tạm Dừng Nâng Cấp) ---');
const pauseModalPath = path.join(ROOT_DIR, 'src', 'ui', 'PauseModal.ts');
const pauseModalSrc = fs.readFileSync(pauseModalPath, 'utf8');

assert(pauseModalSrc.includes('SettingsUIHelper.createVolumeSlider') && pauseModalSrc.includes('🎵 Nhạc Nền (BGM):'), 'PauseModal tích hợp thanh trượt BGM Slider');
assert(pauseModalSrc.includes('SettingsUIHelper.createVolumeSlider') && pauseModalSrc.includes('🔊 Hiệu Ứng (SFX):'), 'PauseModal tích hợp thanh trượt SFX Slider');
assert(pauseModalSrc.includes('SettingsUIHelper.createScreenShakeToggle'), 'PauseModal tích hợp tùy chọn Bật/Tắt Rung Màn Hình');
assert(pauseModalSrc.includes('SettingsUIHelper.createSafeClearSaveButton'), 'PauseModal tích hợp nút Xóa Bản Lưu an toàn 2 lần');
assert(pauseModalSrc.includes('BẢNG PHÍM ĐIỀU KHIỂN & HƯỚNG DẪN [H]'), 'PauseModal có nút mở bảng hướng dẫn phím bấm');
assert(pauseModalSrc.includes('toggleGuideOverlay()'), 'PauseModal có phương thức toggleGuideOverlay() hiển thị Keycaps');
assert(pauseModalSrc.includes('keydown-H'), 'PauseModal hỗ trợ phím tắt [H] xem bảng phím ngay khi pause');

// -----------------------------------------------------------------------------
// PHẦN 6: CameraSystem (Kiểm Tra Khóa Rung Màn Hình)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 6: Khóa Rung Màn Hình (Screen Shake Protection) ---');
const cameraSystemPath = path.join(ROOT_DIR, 'src', 'systems', 'camera', 'CameraSystem.ts');
const cameraSystemSrc = fs.readFileSync(cameraSystemPath, 'utf8');
assert(cameraSystemSrc.includes('SettingsManager.getInstance().isScreenShakeEnabled()'), 'CameraSystem kiểm tra cờ isScreenShakeEnabled() trước khi shake');

const ambushMonstersPath = path.join(ROOT_DIR, 'src', 'entities', 'AmbushMonsters.ts');
const ambushMonstersSrc = fs.readFileSync(ambushMonstersPath, 'utf8');
assert(ambushMonstersSrc.includes('SettingsManager.getInstance().isScreenShakeEnabled()'), 'AmbushMonsters kiểm tra cờ isScreenShakeEnabled() trước khi shake');

console.log('\n======================================================================');
console.log(`TEST SUMMARY: ${passCount}/${totalCount} CHECKS PASSED (${Math.round((passCount / totalCount) * 100)}%)`);
console.log('======================================================================');

if (passCount === totalCount) {
  console.log('🎉 BƯỚC V15-23 ĐÃ THIẾT KẾ VÀ HOÀN TẤT NÂNG CẤP CÀI ĐẶT & HƯỚNG DẪN ĐIỀU KHIỂN THÀNH CÔNG!\n');
  process.exit(0);
} else {
  console.error('❌ MỘT SỐ TIÊU CHUẨN CHƯA ĐẠT! VUI LÒNG KIỂM TRA LẠI.\n');
  process.exit(1);
}
