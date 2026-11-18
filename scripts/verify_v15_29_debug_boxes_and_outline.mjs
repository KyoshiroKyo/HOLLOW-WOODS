/**
 * KIỂM THỬ TỰ ĐỘNG BƯỚC V15-29: CHẾ ĐỘ DEBUG ADMIN [F9] VÀ VIỀN SÁNG TƯƠNG TÁC
 */

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

console.log('=== BẮT ĐẦU KIỂM THỬ BƯỚC V15-29: DEBUG ADMIN [F9] & VIỀN SÁNG TƯƠNG TÁC ===\n');

// 1. Kiểm tra GameScene.ts
console.log('--- PHẦN 1: GAME SCENE (DEBUG ADMIN F9 & OUTLINE LOGIC) ---');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
assert(fs.existsSync(gameScenePath), 'File GameScene.ts tồn tại');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');

assert(gameSceneContent.includes('public isDebugBoxesVisible: boolean = false;'), 'Biến trạng thái isDebugBoxesVisible mặc định = false');
assert(gameSceneContent.includes('this.f9Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F9);'), 'Đăng ký phím tắt Quản trị viên F9');
assert(gameSceneContent.includes('toggleDebugInteractionBoxes()'), 'Cung cấp phương thức toggleDebugInteractionBoxes()');
assert(gameSceneContent.includes('Chế độ Debug Khung Tương Tác [F9]:'), 'Thông báo trạng thái toggle Debug F9 chuẩn xác');
assert(gameSceneContent.includes('this.interactionGlowSprite'), 'Khởi tạo lớp sprite phụ interactionGlowSprite');
assert(gameSceneContent.includes('isWithinOutlineRange = best.dist <= 52;'), 'Chuẩn hóa bán kính tương tác <= 52px');
assert(gameSceneContent.includes('setNamePlateSuppressed(true)'), 'Tạm ẩn bảng tên NPC khi hiện khung nhắc tương tác [E]');
assert(gameSceneContent.includes('strokeRoundedRect(left - 2, top - 2, w + 4, h + 4, 4);'), 'Bảo lưu trọn vẹn code vẽ khung chữ nhật trắng trong chế độ Admin Debug');
assert(gameSceneContent.includes('strokeEllipse(footX, footY, rx * 2, ry * 2);'), 'Vẽ vòng elip sáng mảnh dưới chân vật thể khi chơi bình thường');
assert(gameSceneContent.includes('Math.max(1, targetDepth - 1)'), 'Đặt depth viền sáng và sprite phụ ở ngay dưới depth của vật thể để không che mặt');

// 2. Kiểm tra NPCEntity.ts
console.log('\n--- PHẦN 2: NPC ENTITY (NAMEPLATE SUPPRESSION) ---');
const npcEntityPath = path.resolve('src/entities/NPCEntity.ts');
assert(fs.existsSync(npcEntityPath), 'File NPCEntity.ts tồn tại');
const npcContent = fs.readFileSync(npcEntityPath, 'utf8');

assert(npcContent.includes('setNamePlateSuppressed(suppressed: boolean)'), 'NPCEntity có phương thức setNamePlateSuppressed');
assert(npcContent.includes('!this.isNamePlateSuppressed'), 'Kiểm tra cờ isNamePlateSuppressed khi quyết định hiển thị bảng tên');
assert(npcContent.includes('this.namePlate.setVisible(false);'), 'Ẩn bảng tên ngay lập tức khi bị suppressed');

// 3. Kiểm tra UIScene.ts
console.log('\n--- PHẦN 3: UI SCENE (DEBUG TOAST GÓC MÀN HÌNH) ---');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
assert(fs.existsSync(uiScenePath), 'File UIScene.ts tồn tại');
const uiContent = fs.readFileSync(uiScenePath, 'utf8');

assert(uiContent.includes('public showDebugToast(msg: string): void'), 'UIScene có phương thức showDebugToast');
assert(uiContent.includes('1260 - toastW'), 'Neo thông báo nhỏ ở góc màn hình (X: 1260 - toastW, Y: 18)');
assert(uiContent.includes('0x00ffcc'), 'Màu sắc viền xanh ngọc neon Admin Debug tương phản');
assert(uiContent.includes('if (this.debugToastContainer) { this.debugToastContainer.destroy();'), 'Dọn dẹp debugToastContainer trong shutdown tránh rò rỉ bộ nhớ');

// 4. Kiểm tra HitboxDebugInspector.ts
console.log('\n--- PHẦN 4: HITBOX DEBUG INSPECTOR (ĐỒNG BỘ PHÍM F9) ---');
const hitboxInspectorPath = path.resolve('src/utils/HitboxDebugInspector.ts');
assert(fs.existsSync(hitboxInspectorPath), 'File HitboxDebugInspector.ts tồn tại');
const hitboxContent = fs.readFileSync(hitboxInspectorPath, 'utf8');

assert(hitboxContent.includes('toggleDebugInteractionBoxes'), 'HitboxDebugInspector đồng bộ gọi toggleDebugInteractionBoxes của GameScene');

console.log(`\n=== TỔNG KẾT: ${passCount}/${passCount + failCount} TESTS ĐẠT HOÀN HẢO ===`);
if (failCount > 0) {
  process.exit(1);
}
