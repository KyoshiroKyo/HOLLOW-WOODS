/**
 * HOLLOW WOODS V1.3 - VERIFICATION SCRIPT FOR MILESTONE STEP C4-13-06
 * Kiểm tra toàn diện giải pháp:
 * 1. Chuẩn hóa sprite tảng đá Pixel Art (rock_large, rock_medium) thay thế khối elip xám giữ chỗ.
 * 2. Xóa bỏ quầng tròn xám và viền dày dưới mỏ tài nguyên (InventorySystem).
 * 3. Chuẩn hóa bóng đổ chân nhân vật, NPC và The Listener về dạng elip mờ mịn (alpha 0.25).
 * 4. Hệ thống sương mù đa tầng Parallax 3 lớp (Ground, Mid, High) kích hoạt ngay từ frame 0.
 * 5. Nâng cấp quầng sáng ấm áp nhiều tầng cho cột đèn đường và lửa trại.
 * 6. Khóa toàn bộ collider vô hình (alpha 0, visible false) chống hiện hộp xanh mặc định.
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const PROJECT_ROOT = process.cwd();

console.log('================================================================');
console.log('  HOLLOW WOODS V1.3 - VERIFICATION SUITE C4-13-06');
console.log('================================================================\n');

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

// 1. Kiểm tra tài nguyên ảnh sprite tảng đá Pixel Art
console.log('--- 1. KIỂM TRA TÀI NGUYÊN SPRITE TẢNG ĐÁ PIXEL ART ---');
const rockLargePath = path.join(PROJECT_ROOT, 'public/assets/environment/sprites/rock_large.png');
const rockMediumPath = path.join(PROJECT_ROOT, 'public/assets/environment/sprites/rock_medium.png');

assert(fs.existsSync(rockLargePath), 'File rock_large.png tồn tại trong public/assets/environment/sprites/');
assert(fs.existsSync(rockMediumPath), 'File rock_medium.png tồn tại trong public/assets/environment/sprites/');

if (fs.existsSync(rockLargePath)) {
  const png1 = PNG.sync.read(fs.readFileSync(rockLargePath));
  assert(png1.width === 64 && png1.height === 48, `rock_large.png có kích thước chuẩn pixel art 64x48 (thực tế: ${png1.width}x${png1.height})`);
}

if (fs.existsSync(rockMediumPath)) {
  const png2 = PNG.sync.read(fs.readFileSync(rockMediumPath));
  assert(png2.width === 48 && png2.height === 40, `rock_medium.png có kích thước chuẩn pixel art 48x40 (thực tế: ${png2.width}x${png2.height})`);
}

// 2. Kiểm tra Constants.ts
console.log('\n--- 2. KIỂM TRA KHÓA CONSTANTS TẢNG ĐÁ ---');
const constantsContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/config/Constants.ts'), 'utf-8');
assert(constantsContent.includes("export const SPRITE_ROCK_LARGE = 'rock_large';"), 'SPRITE_ROCK_LARGE được định nghĩa trong Constants.ts');
assert(constantsContent.includes("export const SPRITE_ROCK_MEDIUM = 'rock_medium';"), 'SPRITE_ROCK_MEDIUM được định nghĩa trong Constants.ts');

// 3. Kiểm tra PreloadScene.ts
console.log('\n--- 3. KIỂM TRA NẠP TÀI NGUYÊN & TEXTURE VÔ HÌNH TRONG PRELOADSCENE ---');
const preloadContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/scenes/PreloadScene.ts'), 'utf-8');
assert(preloadContent.includes('SPRITE_ROCK_LARGE,') && preloadContent.includes('SPRITE_ROCK_MEDIUM,'), 'PreloadScene import đúng hằng số rock sprites');
assert(preloadContent.includes("this.load.image(SPRITE_ROCK_LARGE, 'assets/environment/sprites/rock_large.png');"), 'PreloadScene nạp ảnh rock_large.png');
assert(preloadContent.includes("this.load.image(SPRITE_ROCK_MEDIUM, 'assets/environment/sprites/rock_medium.png');"), 'PreloadScene nạp ảnh rock_medium.png');
assert(preloadContent.includes("dummy_transparent"), 'PreloadScene tạo texture vô hình 1x1 dummy_transparent chống fallback __DEFAULT');

// 4. Kiểm tra WorldBuilder.ts
console.log('\n--- 4. KIỂM TRA CHUẨN HÓA WORLDBUILDER (CREATE ROCK & COLLIDERS) ---');
const worldBuilderContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/world/WorldBuilder.ts'), 'utf-8');
assert(!worldBuilderContent.includes('rock.fillStyle(0x424949, 1);'), 'Đã loại bỏ hoàn toàn lệnh vẽ khối elip xám 0x424949 giữ chỗ');
assert(worldBuilderContent.includes('SPRITE_ROCK_LARGE') && worldBuilderContent.includes('SPRITE_ROCK_MEDIUM'), 'createRock sử dụng sprite Pixel Art rock_large và rock_medium');
assert(worldBuilderContent.includes('shadow.fillStyle(0x000000, 0.25);'), 'createRock bổ sung bóng đổ mặt đất mờ mịn alpha 0.25');
assert(worldBuilderContent.includes('spr.setVisible(false);\n      spr.setAlpha(0);'), 'buildWorld đảm bảo toàn bộ colliderGroup có alpha 0 và setVisible false');

// 5. Kiểm tra InventorySystem.ts
console.log('\n--- 5. KIỂM TRA CHUẨN HÓA BÓNG ĐỔ VẬT PHẨM TÀI NGUYÊN ---');
const inventoryContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/systems/InventorySystem.ts'), 'utf-8');
assert(!inventoryContent.includes('baseGfx.strokeEllipse(0, 5, 20, 9);'), 'Đã loại bỏ vòng tròn viền màu strokeEllipse quá khổ dưới tài nguyên');
assert(inventoryContent.includes('baseGfx.fillStyle(0x000000, 0.25);') && inventoryContent.includes('baseGfx.fillEllipse(0, 5, 12, 4);'), 'Bóng đổ tài nguyên thu nhỏ về dạng elip đen mờ mịn 12x4 px (alpha 0.25)');

// 6. Kiểm tra Bóng Đổ Chân Nhân Vật, NPC và Monster
console.log('\n--- 6. KIỂM TRA BÓNG ĐỔ CHÂN NHÂN VẬT, NPC & MONSTER ---');
const theListenerContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/entities/TheListener.ts'), 'utf-8');
assert(theListenerContent.includes('g.fillStyle(0x000000, 0.25);') && theListenerContent.includes('g.fillEllipse(0, 0, 22, 6);'), 'The Listener có bóng chân elip đen mờ mịn 22x6 px (alpha 0.25)');

const npcContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/entities/NPCEntity.ts'), 'utf-8');
assert(npcContent.includes('shadow.fillStyle(0x000000, 0.25);') && npcContent.includes('shadow.fillEllipse(0, 0, 16, 5);'), 'NPCEntity có bóng chân elip đen mờ mịn 16x5 px (alpha 0.25)');

const playerContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/entities/SatyrPlayer.ts'), 'utf-8');
assert(playerContent.includes('this.footShadowGfx = scene.add.graphics();') && playerContent.includes('this.footShadowGfx.fillStyle(0x000000, 0.25);'), 'SatyrPlayer được trang bị bóng chân mờ mịn footShadowGfx (alpha 0.25)');

// 7. Kiểm tra VeilSystem.ts (Sương mù đa tầng Parallax)
console.log('\n--- 7. KIỂM TRA SƯƠNG MÙ ĐA TẦNG PARALLAX (VEILSYSTEM) ---');
const veilContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/systems/VeilSystem.ts'), 'utf-8');
assert(veilContent.includes('fogLayerGround') && veilContent.includes('fogLayerMid') && veilContent.includes('fogLayerHigh'), 'VeilSystem thiết lập đầy đủ 3 tầng sương mù: Ground, Mid, High');
assert(veilContent.includes('this.fogLayerGround.setDepth(-40);'), 'fogLayerGround đặt ở depth -40 (là là mặt đất, dưới nhân vật)');
assert(veilContent.includes('this.fogLayerMid.setDepth(450);'), 'fogLayerMid đặt ở depth 450 (lưng chừng thân cây)');
assert(veilContent.includes('this.fogLayerHigh.setDepth(2800);'), 'fogLayerHigh đặt ở depth 2800 (tán cây trên cao, dưới HUD/UI)');
assert(veilContent.includes('this.fogLayerGround.setAlpha(0.24);'), 'Sương mù được kích hoạt alpha ngay từ constructor (thấy sương từ frame 0)');
assert(veilContent.includes('camScrollX * 0.15') && veilContent.includes('camScrollX * 0.35') && veilContent.includes('camScrollX * 0.55'), 'Sương mù cuộn Parallax đồng bộ chuyển động camera với hệ số đa tầng');

// 8. Kiểm tra Nâng cấp Quầng Sáng Đèn Đường & Lửa Trại
console.log('\n--- 8. KIỂM TRA QUẦNG SÁNG ẤM CỘT ĐÈN & LỬA TRẠI ---');
assert(worldBuilderContent.includes('g.fillCircle(x + 6, y - 16, 28);') && worldBuilderContent.includes('g.fillCircle(x + 6, y - 16, 18);'), 'Cột đèn đường sở hữu quầng sáng ấm 3 tầng chuyển sắc tự nhiên');
assert(worldBuilderContent.includes('g.fillCircle(x + 18, y + 15, 38);') && worldBuilderContent.includes('g.fillCircle(x + 18, y + 15, 24);'), 'Lửa trại thợ săn sở hữu quầng sáng ấm 3 tầng chuyển sắc tự nhiên');

const gameSceneContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src/scenes/GameScene.ts'), 'utf-8');
assert(gameSceneContent.includes('radius * 0.82') && gameSceneContent.includes('radius * 0.50') && gameSceneContent.includes('radius * 0.24'), 'Đèn lồng nhân vật GameScene sở hữu hiệu ứng tỏa sáng ấm 3 tầng mịn màng');

// Tổng kết
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TOÁN: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✓ TẤT CẢ CÁC TIÊU CHÍ KIỂM TRA ĐỒ HỌA C4-13-06 ĐẠT CHUẨN 100%!');
}
