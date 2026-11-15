/**
 * Script Kiểm Chứng Tự Động Chất Lượng Hoạt Ảnh & Hiển Thị Đèn Lồng Hổ Phách (C4-12-07 QA)
 * Dự án: HOLLOW WOODS V1.2 (The Fog That Remembers)
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] #${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] #${totalTests}: ${testName} - ${details}`);
  }
}

console.log('================================================================');
console.log('QA VERIFICATION SUITE — COMMAND C4-12-07');
console.log('HOÀN THIỆN HIỂN THỊ & HOẠT ẢNH ĐÈN LỒNG HỔ PHÁCH TRÊN NHÂN VẬT');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// NHÓM 1: HẰNG SỐ VÀ TỌA ĐỘ ĐÈN LỒNG (Constants.ts)
// -----------------------------------------------------------------------------
console.log('--- NHÓM 1: HẰNG SỐ & TỌA ĐỘ TƯƠNG ĐỐI (Constants.ts) ---');

const CONSTANTS_PATH = path.join(ROOT_DIR, 'src', 'config', 'Constants.ts');
const constantsContent = fs.readFileSync(CONSTANTS_PATH, 'utf-8');

assert(constantsContent.includes('export const LANTERN_OIL_DRAIN_RATE = 0.8;'), 'LANTERN_OIL_DRAIN_RATE = 0.8 tiêu hao dầu/s');
assert(constantsContent.includes('export const LANTERN_RADIUS_NORMAL = 120;'), 'LANTERN_RADIUS_NORMAL = 120 bán kính đèn bật');
assert(constantsContent.includes('export const LANTERN_RADIUS_DIM = 45;'), 'LANTERN_RADIUS_DIM = 45 bán kính đèn tắt');
assert(constantsContent.includes('export const LANTERN_OFFSET_DOWN = { x: 13, y: -20 };'), 'Tọa độ tương đối hướng DOWN (x: 13, y: -20)');
assert(constantsContent.includes('export const LANTERN_OFFSET_UP = { x: 12, y: -21 };'), 'Tọa độ tương đối hướng UP (x: 12, y: -21)');
assert(constantsContent.includes('export const LANTERN_OFFSET_LEFT = { x: -13, y: -20 };'), 'Tọa độ tương đối hướng LEFT (x: -13, y: -20)');
assert(constantsContent.includes('export const LANTERN_OFFSET_RIGHT = { x: 12, y: -20 };'), 'Tọa độ tương đối hướng RIGHT (x: 12, y: -20)');

// -----------------------------------------------------------------------------
// NHÓM 2: THỰC THỂ NGƯỜI CHƠI (SatyrPlayer.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 2: LỚP HIỂN THỊ ĐÈN TRÊN SatyrPlayer.ts ---');

const PLAYER_PATH = path.join(ROOT_DIR, 'src', 'entities', 'SatyrPlayer.ts');
const playerContent = fs.readFileSync(PLAYER_PATH, 'utf-8');

assert(playerContent.includes('private lanternOverlayGfx: Phaser.GameObjects.Graphics | null = null;'), 'Khai báo lanternOverlayGfx');
assert(playerContent.includes('this.lanternOverlayGfx = scene.add.graphics();'), 'Khởi tạo lanternOverlayGfx trong constructor');
assert(playerContent.includes('public getLanternWorldPosition(): { x: number; y: number; isVisible: boolean }'), 'Có hàm getLanternWorldPosition()');
assert(playerContent.includes('public updateLanternVisual(): void'), 'Có hàm updateLanternVisual()');
assert(playerContent.includes('this.updateLanternVisual();'), 'updateLanternVisual() được gọi trong update()');

// Kiểm tra chi tiết 4 hướng nhìn trong getLanternWorldPosition
assert(playerContent.includes("this.facing === 'up'") && playerContent.includes('LANTERN_OFFSET_UP'), 'Xử lý vị trí gậy & đèn hướng UP');
assert(playerContent.includes("this.facing === 'left'") && playerContent.includes('LANTERN_OFFSET_LEFT'), 'Xử lý vị trí gậy & đèn hướng LEFT');
assert(playerContent.includes("this.facing === 'right'") && playerContent.includes('LANTERN_OFFSET_RIGHT'), 'Xử lý vị trí gậy & đèn hướng RIGHT');
assert(playerContent.includes('LANTERN_OFFSET_DOWN'), 'Xử lý vị trí gậy & đèn hướng DOWN');

// Kiểm tra nhịp cử động theo hoạt ảnh (Bobbing Patterns)
assert(playerContent.includes('_walk_') && playerContent.includes('bobPattern'), 'Nhịp gậy nhấp nhô khi đi bộ (walk)');
assert(playerContent.includes('_run_') && playerContent.includes('animBobY'), 'Độ nảy và chúi gậy khi chạy (run)');
assert(playerContent.includes('_attack_'), 'Gậy vung phía trước khi tấn công (attack)');
assert(playerContent.includes('_gather_'), 'Hạ thấp gậy khi cúi người thu hoạch (gather)');

// Kiểm tra 2 trạng thái trực quan TẮT / BẬT
assert(playerContent.includes('TRẠNG THÁI 1: ĐÈN LỒNG TẮT (OFF / HẾT DẦU)'), 'Có khối xử lý trạng thái đèn TẮT');
assert(playerContent.includes('0x1a1512') && playerContent.includes('0x352317'), 'Vẽ nắp sắt và kính bồ hóng tối màu khi tắt');
assert(playerContent.includes('TRẠNG THÁI 2: ĐÈN LỒNG BẬT (ON)'), 'Có khối xử lý trạng thái đèn BẬT');
assert(playerContent.includes('flicker') && playerContent.includes('0xf39c12') && playerContent.includes('0xfefae0'), 'Vẽ tim đèn và lõi sáng bập bùng khi bật');
assert(playerContent.includes('this.lanternOverlayGfx.fillCircle(lx, ly + 0.5, 11);'), 'Quầng sáng dịu nhẹ nhỏ gọn (11px) không che mặt');

// Kiểm tra hủy đối tượng an toàn
assert(playerContent.includes('if (this.lanternOverlayGfx)') && playerContent.includes('this.lanternOverlayGfx.destroy();'), 'Giải phóng bộ nhớ lanternOverlayGfx khi hủy');

// -----------------------------------------------------------------------------
// NHÓM 3: HỆ THỐNG MẶT NẠ ÁNH SÁNG SƯƠNG MÙ (GameScene.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 3: MẶT NẠ ÁNH SÁNG LƯU ĐỆM (GameScene.ts) ---');

const GAME_SCENE_PATH = path.join(ROOT_DIR, 'src', 'scenes', 'GameScene.ts');
const gameSceneContent = fs.readFileSync(GAME_SCENE_PATH, 'utf-8');

assert(gameSceneContent.includes("cached_light_mask_normal"), 'Tạo texture lưu đệm cached_light_mask_normal (512x512)');
assert(gameSceneContent.includes("cached_light_mask_dim"), 'Tạo texture lưu đệm cached_light_mask_dim (256x256)');
assert(gameSceneContent.includes('private cachedLightMaskImage!: Phaser.GameObjects.Image;'), 'Khai báo cachedLightMaskImage');
assert(gameSceneContent.includes('this.fogOfWarLayer.erase(this.cachedLightMaskImage);'), 'Xóa sương mù bằng texture lưu đệm GPU');
assert(gameSceneContent.includes('const lanternWorld = this.player.getLanternWorldPosition();'), 'Lấy vị trí đèn thực tế từ getLanternWorldPosition()');
assert(gameSceneContent.includes('(isLanternOn && lanternWorld.isVisible) ? lanternWorld.x : this.player.x;'), 'Tâm sáng phát ra từ đèn khi BẬT và từ thân khi TẮT');

// -----------------------------------------------------------------------------
// NHÓM 4: GIAO DIỆN & PHÍM TẮT ĐIỀU KHIỂN (UIScene.ts)
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 4: GIAO DIỆN & PHÍM TẮT (UIScene.ts) ---');

const UI_SCENE_PATH = path.join(ROOT_DIR, 'src', 'scenes', 'UIScene.ts');
const uiSceneContent = fs.readFileSync(UI_SCENE_PATH, 'utf-8');

assert(uiSceneContent.includes("this.lanternStatusText.setText('ĐÈN: BẬT [F]');"), 'Cập nhật chữ ĐÈN: BẬT [F] màu vàng');
assert(uiSceneContent.includes("this.lanternStatusText.setText('ĐÈN: TẮT [F]');"), 'Cập nhật chữ ĐÈN: TẮT [F] màu xám');
assert(uiSceneContent.includes("{ key: '[F] Đèn Lồng', id: 'lantern' }"), 'Có ô phím tắt nhanh [F] Đèn Lồng');
assert(uiSceneContent.includes("this.events.emit('ui_toggle_lantern');"), 'Bấm vào ô [F] phát sự kiện ui_toggle_lantern');

// -----------------------------------------------------------------------------
// NHÓM 5: BẢO TOÀN LOGIC SINH TỒN & SAVE/LOAD
// -----------------------------------------------------------------------------
console.log('\n--- NHÓM 5: LOGIC SINH TỒN & SAVE/LOAD ---');

const SURVIVAL_PATH = path.join(ROOT_DIR, 'src', 'systems', 'SurvivalSystem.ts');
const survivalContent = fs.readFileSync(SURVIVAL_PATH, 'utf-8');
assert(survivalContent.includes('LANTERN_OIL_DRAIN_RATE * dt'), 'Tiêu hao dầu đèn khi bật theo thời gian delta');
assert(survivalContent.includes("this.playerState.emit('lantern_empty');"), 'Tự động tắt đèn và phát sự kiện lantern_empty khi hết dầu');

const SAVE_PATH = path.join(ROOT_DIR, 'src', 'systems', 'SaveManager.ts');
const saveContent = fs.readFileSync(SAVE_PATH, 'utf-8');
assert(saveContent.includes('lanternOil: state.stats.lanternOil,'), 'Lưu trữ lượng dầu đèn trong SaveGame');
assert(saveContent.includes('isLanternOn: state.stats.isLanternOn'), 'Lưu trữ trạng thái bật/tắt đèn trong SaveGame');
assert(saveContent.includes('state.stats.isLanternOn = data.stats.isLanternOn;'), 'Khôi phục trạng thái bật/tắt đèn khi tải game');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
if (failedTests === 0) {
  console.log('STATUS: ALL CHECKS PASSED (100% HOÀN TẤT TÍCH HỢP C4-12-07)');
} else {
  console.error(`STATUS: ${failedTests} CHECKS FAILED!`);
  process.exit(1);
}
console.log('================================================================');
