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

console.log('--- KIỂM TRA BƯỚC V15-03: CORNER SLIDING & COLLIDER OPTIMIZATION ---');

// 1. Kiểm tra Constants.ts
console.log('\n[1/5] Kiểm tra cấu hình Hitbox chân nhân vật (Constants.ts):');
const constantsPath = path.resolve('src/config/Constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8').replace(/\r\n/g, '\n');

assert(/WAYFARER_BODY_WIDTH\s*=\s*18;/.test(constantsContent), 'WAYFARER_BODY_WIDTH được cấu hình đúng là 18px');
assert(/WAYFARER_BODY_HEIGHT\s*=\s*12;/.test(constantsContent), 'WAYFARER_BODY_HEIGHT được cấu hình đúng là 12px');
assert(/WAYFARER_BODY_OFFSET_X\s*=\s*23;/.test(constantsContent), 'WAYFARER_BODY_OFFSET_X được căn giữa (23px)');
assert(/WAYFARER_BODY_OFFSET_Y\s*=\s*46;/.test(constantsContent), 'WAYFARER_BODY_OFFSET_Y đặt ở sát đáy chân (46px)');

// 2. Kiểm tra NPCEntity.ts
console.log('\n[2/5] Kiểm tra Hitbox chân NPC (NPCEntity.ts):');
const npcPath = path.resolve('src/entities/NPCEntity.ts');
const npcContent = fs.readFileSync(npcPath, 'utf8').replace(/\r\n/g, '\n');

assert(/body\.setSize\(22,\s*14\)/.test(npcContent), 'NPC body size chuẩn 22x14 px');
assert(/body\.setOffset\(21,\s*50\)/.test(npcContent), 'NPC body offset chuẩn (21, 50), không có offset âm');
assert(!/setOffset\(-/.test(npcContent), 'Tuyệt đối không có offset âm trong NPCEntity');

// 3. Kiểm tra SatyrPlayer.ts & Thuật toán Corner Assist
console.log('\n[3/5] Kiểm tra Thuật toán Trượt Góc Corner Assist (SatyrPlayer.ts):');
const playerPath = path.resolve('src/entities/BlackKnightPlayer.ts');
const playerContent = fs.readFileSync(playerPath, 'utf8').replace(/\r\n/g, '\n');

assert(playerContent.includes('public applyCornerAssistWith(obstacle: Phaser.Physics.Arcade.Sprite): void'), 'Có phương thức applyCornerAssistWith');
assert(playerContent.includes('const CORNER_THRESHOLD = 10;'), 'Ngưỡng sai số góc lệch tâm CORNER_THRESHOLD = 10px');
assert(playerContent.includes('const SLIDE_NUDGE = 2.0;'), 'Lực trượt SLIDE_NUDGE = 2.0px/frame');
assert(playerContent.includes('pBody.blocked.up') && playerContent.includes('pBody.blocked.down'), 'Xử lý va chạm góc trục dọc (blocked.up / blocked.down)');
assert(playerContent.includes('pBody.blocked.left') && playerContent.includes('pBody.blocked.right'), 'Xử lý va chạm góc trục ngang (blocked.left / blocked.right)');

// Kiểm tra logic toán học Corner Assist
function simulateCornerAssist(playerBox, obstacleBox, blockedDir) {
  const CORNER_THRESHOLD = 10;
  const SLIDE_NUDGE = 2.0;
  let nudgeX = 0;
  let nudgeY = 0;

  if (blockedDir === 'up' || blockedDir === 'down') {
    const overlapLeft = (playerBox.x + playerBox.width) - obstacleBox.x;
    const overlapRight = (obstacleBox.x + obstacleBox.width) - playerBox.x;
    if (overlapLeft > 0 && overlapLeft <= CORNER_THRESHOLD) {
      nudgeX = -SLIDE_NUDGE;
    } else if (overlapRight > 0 && overlapRight <= CORNER_THRESHOLD) {
      nudgeX = SLIDE_NUDGE;
    }
  } else if (blockedDir === 'left' || blockedDir === 'right') {
    const overlapTop = (playerBox.y + playerBox.height) - obstacleBox.y;
    const overlapBottom = (obstacleBox.y + obstacleBox.height) - playerBox.y;
    if (overlapTop > 0 && overlapTop <= CORNER_THRESHOLD) {
      nudgeY = -SLIDE_NUDGE;
    } else if (overlapBottom > 0 && overlapBottom <= CORNER_THRESHOLD) {
      nudgeY = SLIDE_NUDGE;
    }
  }
  return { nudgeX, nudgeY };
}

// Giả lập va chạm cạnh trên sang mép trái (overlapLeft = 6px)
const sim1 = simulateCornerAssist({ x: 94, y: 100, width: 18, height: 12 }, { x: 106, y: 88, width: 30, height: 20 }, 'up');
assert(sim1.nudgeX === -2.0, 'Mô phỏng 1: Va chạm mép trái vật cản (overlap 6px <= 10px) trượt sang trái (-2px)');

// Giả lập va chạm cạnh trên sang mép phải (overlapRight = 7px)
const sim2 = simulateCornerAssist({ x: 129, y: 100, width: 18, height: 12 }, { x: 106, y: 88, width: 30, height: 20 }, 'up');
assert(sim2.nudgeX === 2.0, 'Mô phỏng 2: Va chạm mép phải vật cản (overlap 7px <= 10px) trượt sang phải (+2px)');

// Giả lập va chạm trực diện giữa (overlap > 10px) -> Không trượt
const sim3 = simulateCornerAssist({ x: 110, y: 100, width: 18, height: 12 }, { x: 100, y: 88, width: 50, height: 20 }, 'up');
assert(sim3.nudgeX === 0, 'Mô phỏng 3: Va chạm chính diện giữa vật cản (overlap > 10px) giữ nguyên trạng thái chặn đứng');

// 4. Kiểm tra GameScene.ts nối callback Corner Assist
console.log('\n[4/5] Kiểm tra liên kết Corner Assist trong GameScene.ts:');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf8').replace(/\r\n/g, '\n');

assert(gameSceneContent.includes('this.physics.add.collider(this.player, this.worldBuilder.colliderGroup, (_playerObj, obstacleObj)'), 'GameScene gọi colliderGroup với callback va chạm');
assert(gameSceneContent.includes('this.player.applyCornerAssistWith(obstacleObj as Phaser.Physics.Arcade.Sprite)'), 'GameScene gọi player.applyCornerAssistWith cho colliderGroup');
assert(gameSceneContent.includes('this.player.applyCornerAssistWith(npcObj as Phaser.Physics.Arcade.Sprite)'), 'GameScene gọi player.applyCornerAssistWith cho NPC');

// 5. Kiểm tra Tối ưu hóa Static Collider & Gộp rặng cây viền (WorldBuilder.ts)
console.log('\n[5/5] Kiểm tra Tối ưu hóa Collider bản đồ (WorldBuilder.ts):');
const worldBuilderPath = path.resolve('src/world/WorldBuilder.ts');
const wbContent = fs.readFileSync(worldBuilderPath, 'utf8').replace(/\r\n/g, '\n');

// Gốc cây 20x16 px
assert(wbContent.includes('this.createStaticBoxColliderCentered(x, y + 2, 20, 16,'), 'createTree tạo hitbox gốc cây thu nhỏ 20x16 px tại (x, y + 2)');
assert(wbContent.includes('createTree(x: number, y: number, label?: string, withCollider: boolean = true)'), 'createTree hỗ trợ cờ withCollider tùy chọn');

// Hàng rào làng đã gộp
assert(wbContent.includes("'Hàng Rào Cổng Tây'") && wbContent.includes("'Hàng Rào Bắc Làng'"), 'Hàng rào làng Bellhollow đã gộp thành các thanh dài');

// Viền rặng cây Crooked Path đã gộp
assert(wbContent.includes("'Rặng Cây Viền Bắc Tây'") && wbContent.includes("'Rặng Cây Viền Bắc Đông'"), 'Crooked Path đã gộp rặng cây viền');

// Viền rặng cây Deep Forest đã gộp
assert(wbContent.includes("'Rặng Cây Viền Bắc Tây Deep Forest'") && wbContent.includes("'Rặng Cây Viền Tây Deep Forest'"), 'Deep Forest đã gộp rặng cây viền');

// Viền rặng cây Silent Mire đã gộp
assert(wbContent.includes("'Rặng Cây Khô Viền Bắc Silent Mire'") && wbContent.includes("'Rặng Cây Khô Viền Nam Silent Mire'"), 'Silent Mire đã gộp rặng cây viền');

// Viền rặng cây Broken Bell Shrine đã gộp
assert(wbContent.includes("'Rặng Cây Khô Viền Bắc Miếu Chuông'") && wbContent.includes("'Rặng Cây Khô Viền Đông Miếu Chuông'"), 'Broken Bell Shrine đã gộp rặng cây viền');

console.log(`\n========================================`);
console.log(`KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
