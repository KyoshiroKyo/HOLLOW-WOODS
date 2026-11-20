/**
 * Automated Verification Script for Step V15-03:
 * - NPC Hitbox offset non-negative (22x14 at 21, 50)
 * - Bellhollow architecture scale & foot-level wall colliders
 * - Composite fence colliders & elimination of 4px gaps
 * - Tree colliders & boundary decoration tree collider culling
 * - Corner sliding assist (CORNER_THRESHOLD=10, SLIDE_NUDGE=2.0) & tangent slide in handleMovement
 */
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== TEST STEP V15-03: PIXEL SCALE, VILLAGE ARCHITECTURE, NPC HITBOX & CORNER SLIDING ===\n');

// 1. Kiểm tra Hitbox NPC (NPCEntity.ts)
console.log('1. Kiểm tra Hitbox chân NPC (NPCEntity.ts):');
const npcTs = fs.readFileSync('src/entities/NPCEntity.ts', 'utf8');
assert(/body\.setSize\(22,\s*14\)/.test(npcTs), 'Kích thước hitbox NPC chuẩn 22x14 px');
assert(/body\.setOffset\(21,\s*50\)/.test(npcTs), 'Điểm tựa chân hitbox NPC đặt tại (21, 50) theo frame 64x64');
assert(!/setOffset\(-/.test(npcTs), 'Tuyệt đối không có offset âm trong NPCEntity');

// 2. Kiểm tra Hitbox nhân vật (Constants.ts)
console.log('\n2. Kiểm tra Hitbox nhân vật (Constants.ts):');
const constantsTs = fs.readFileSync('src/config/Constants.ts', 'utf8');
assert(/WAYFARER_BODY_WIDTH\s*=\s*18;/.test(constantsTs), 'WAYFARER_BODY_WIDTH = 18px');
assert(/WAYFARER_BODY_HEIGHT\s*=\s*12;/.test(constantsTs), 'WAYFARER_BODY_HEIGHT = 12px');
assert(/WAYFARER_BODY_OFFSET_X\s*=\s*23;/.test(constantsTs), 'WAYFARER_BODY_OFFSET_X = 23px');
assert(/WAYFARER_BODY_OFFSET_Y\s*=\s*46;/.test(constantsTs), 'WAYFARER_BODY_OFFSET_Y = 46px');

// 3. Kiểm tra Tỷ lệ Kiến trúc Nhà Dân & Tháp Chuông tại Làng Bellhollow (WorldBuilder.ts)
console.log('\n3. Kiểm tra Tỷ lệ Kiến trúc Làng Bellhollow (WorldBuilder.ts):');
const wbTs = fs.readFileSync('src/world/WorldBuilder.ts', 'utf8');
assert(wbTs.includes('1160, 130, 160, 144') && wbTs.includes('Nhà Edda'), 'Nhà Edda có kích thước 160x144 px (chiều cao > 128px)');
assert(wbTs.includes('570, 430, 152, 136') && wbTs.includes('Nhà Neris'), 'Nhà Neris có kích thước 152x136 px (chiều cao > 128px)');
assert(wbTs.includes('this.createBellTower'), 'Tháp Chuông trung tâm làng được dựng quy mô');
assert(wbTs.includes('const colW = isEdda ? 136 : 130;') && wbTs.includes('const colH = isEdda ? 32 : 30;'), 'Hitbox chân tường nhà dân bao phủ 30-32px đáy, chừa toàn bộ phần mái cho phép đi lướt sau nhà');

// 4. Kiểm tra Tinh gọn Collider & Hàng Rào Composite (WorldBuilder.ts)
console.log('\n4. Kiểm tra Tinh gọn Collider & Hàng rào composite:');
assert(wbTs.includes("'Hàng Rào Cổng Tây'") && wbTs.includes('92, 12'), 'Hàng Rào Cổng Tây gộp thành khối liền mạch 92x12 px');
assert(wbTs.includes("'Hàng Rào Bắc Làng'") && wbTs.includes('94, 12'), 'Hàng Rào Bắc Làng gộp thành khối liền mạch 94x12 px');
assert(wbTs.includes("'Hàng Rào Vườn Dược Tây Nam'") && wbTs.includes('94, 12'), 'Hàng Rào Vườn Dược Tây Nam gộp liền mạch 94x12 px');
assert(wbTs.includes("'Hàng Rào Cổng Đông'") && wbTs.includes('142, 12'), 'Hàng Rào Cổng Đông gộp liền mạch 142x12 px');
assert(wbTs.includes('this.createStaticBoxColliderCentered(x, y + 2, 20, 16,'), 'Hitbox gốc cây createTree chuẩn 20x16 px tại (x, y + 2)');
assert(wbTs.includes('withCollider: boolean = true'), 'createTree hỗ trợ cờ withCollider tắt va chạm cho cây viền biên');

// 5. Kiểm tra Thuật toán Trượt Mép Tường & Tangent Slide (SatyrPlayer.ts)
console.log('\n5. Kiểm tra Thuật toán Trượt Mép Tường (SatyrPlayer.ts):');
const playerTs = fs.readFileSync('src/entities/BlackKnightPlayer.ts', 'utf8');
assert(playerTs.includes('CORNER_THRESHOLD = 10;'), 'Ngưỡng góc sai số CORNER_THRESHOLD = 10px');
assert(playerTs.includes('SLIDE_NUDGE = 2.0;'), 'Lực trượt SLIDE_NUDGE = 2.0px/frame');
assert(playerTs.includes('isXBlocked && !isYBlocked'), 'Có thuật toán Tangent Slide: trượt dọc Y khi trục X bị chặn');
assert(playerTs.includes('isYBlocked && !isXBlocked'), 'Có thuật toán Tangent Slide: trượt ngang X khi trục Y bị chặn');
assert(playerTs.includes('public applyCornerAssistWith(obstacle: Phaser.Physics.Arcade.Sprite): void'), 'Phương thức applyCornerAssistWith hoàn chỉnh');

// 6. Kiểm tra GameScene liên kết va chạm với Corner Assist
console.log('\n6. Kiểm tra liên kết va chạm trong GameScene.ts:');
const gameSceneTs = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneTs.includes('this.player.applyCornerAssistWith(obstacleObj as Phaser.Physics.Arcade.Sprite)'), 'GameScene gọi player.applyCornerAssistWith cho colliderGroup');
assert(gameSceneTs.includes('this.player.applyCornerAssistWith(npcObj as Phaser.Physics.Arcade.Sprite)'), 'GameScene gọi player.applyCornerAssistWith cho NPCs');

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
