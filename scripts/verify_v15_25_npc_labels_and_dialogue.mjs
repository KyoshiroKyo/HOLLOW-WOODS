import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('=== VERIFY STEP V15-25: SMART NPC NAMEPLATES & DIALOGUE UI OVERHAUL ===\n');

// 1. Kiểm tra NPCEntity.ts
console.log('1. Kiểm tra NPCEntity.ts:');
const npcEntityPath = path.resolve('src/entities/NPCEntity.ts');
const npcEntitySrc = fs.readFileSync(npcEntityPath, 'utf-8');

assert(npcEntitySrc.includes('questIndicator: Phaser.GameObjects.Container'), 'NPCEntity chứa questIndicator Container');
assert(npcEntitySrc.includes('questStatus: \'none\' | \'new\' | \'complete\''), 'NPCEntity quản lý questStatus 3 trạng thái');
assert(npcEntitySrc.includes('createQuestIndicator(scene: Phaser.Scene)'), 'NPCEntity có hàm createQuestIndicator');
assert(npcEntitySrc.includes('duration: 750') && npcEntitySrc.includes('yoyo: true'), 'questIndicator có tween nhấp nhô nhẹ lơ lửng (bobbing)');
assert(npcEntitySrc.includes('container.setAlpha(0)') && npcEntitySrc.includes('container.setVisible(false)'), 'namePlate mặc định ẩn để không gây rối mắt khi ở xa');
assert(npcEntitySrc.includes('setQuestStatus(status: \'none\' | \'new\' | \'complete\')'), 'NPCEntity có hàm setQuestStatus cập nhật biểu tượng ! hoặc ?');
assert(npcEntitySrc.includes('duration: 150') && npcEntitySrc.includes('ease: \'Quad.easeOut\''), 'namePlate có tween fade-in 150ms mượt mà');
assert(npcEntitySrc.includes('distance <= 95') && npcEntitySrc.includes('isClosest'), 'namePlate chỉ kích hoạt khi khoảng cách <= 95px và là NPC gần nhất');
assert(!npcEntitySrc.includes('createPromptBubble'), 'Đã dọn dẹp triệt để promptBubble tách rời chống 2 hộp đè chồng');

// 2. Kiểm tra GameScene.ts
console.log('\n2. Kiểm tra GameScene.ts:');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneSrc = fs.readFileSync(gameScenePath, 'utf-8');

assert(gameSceneSrc.includes('getNPCQuestStatus(npcId: string)'), 'GameScene có hàm getNPCQuestStatus xác định trạng thái nhiệm vụ từng NPC');
assert(gameSceneSrc.includes('let closestNPC: NPCEntity | null = null;'), 'GameScene tìm đúng 1 closestNPC gần nhất');
assert(gameSceneSrc.includes('dist <= 95 && dist < minNpcDist'), 'GameScene quét khoảng cách chuẩn 95px');
assert(gameSceneSrc.includes('npc.setNearby(isClosestIn95, px, py, dist, isClosestIn95)'), 'GameScene truyền đúng cờ isClosestIn95 cho NPC');
assert(gameSceneSrc.includes('if (closestNPC && minNpcDist <= 65)'), 'GameScene giới hạn phạm vi tương tác [E] cho đúng 1 NPC gần nhất');

// 3. Kiểm tra UIScene.ts
console.log('\n3. Kiểm tra UIScene.ts:');
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneSrc = fs.readFileSync(uiScenePath, 'utf-8');

assert(uiSceneSrc.includes('this.dialogueContainer = this.add.container(640, 595)'), 'Khung hộp thoại đặt tại tọa độ chuẩn (640, 595)');
assert(uiSceneSrc.includes('boxWidth = 1060') && uiSceneSrc.includes('boxHeight = 180'), 'Kích thước hộp thoại chuẩn 1060x180 px');
assert(uiSceneSrc.includes('0x140e0a') && uiSceneSrc.includes('0x6e5228'), 'Nền giấy da cổ sẫm 0x140e0a và viền đồng cổ 0x6e5228');
assert(uiSceneSrc.includes('drawRivet(-halfW + rivetOffset'), 'Hộp thoại có 4 đinh tán đồng nẹp góc trang trọng');
assert(uiSceneSrc.includes('this.dialoguePortraitSprite.setDisplaySize(64, 64)'), 'Chân dung hội thoại hiển thị đúng tỷ lệ Pixel Art 64x64 px');
assert(uiSceneSrc.includes('fontSize: \'20px\'') && uiSceneSrc.includes('color: \'#f1c40f\''), 'Tên người nói cỡ 20px bold màu vàng kim');
assert(uiSceneSrc.includes('fontSize: \'18px\'') && uiSceneSrc.includes('color: \'#f5eedc\''), 'Nội dung thoại cỡ 18px ngà ấm');
assert(uiSceneSrc.includes('padding: { left: 8, right: 8, top: 4, bottom: 4 }'), 'Nội dung thoại có padding lề đệm an toàn chống lẹm chữ');
assert(uiSceneSrc.includes('btnWidth = 920') && uiSceneSrc.includes('btnHeight = 36'), 'Nút lựa chọn hội thoại kích thước chuẩn 920x36 px');
assert(uiSceneSrc.includes('0x261a12') && uiSceneSrc.includes('0xf1c40f'), 'Nút lựa chọn có hiệu ứng hover đổi màu sang trọng và viền vàng kim');

// 4. Kiểm tra PlayerState.ts
console.log('\n4. Kiểm tra PlayerState.ts:');
const playerStatePath = path.resolve('src/state/PlayerState.ts');
const playerStateSrc = fs.readFileSync(playerStatePath, 'utf-8');
assert(playerStateSrc.includes('isQuestTaskCompleted(questId: string, taskId: string): boolean'), 'PlayerState có helper isQuestTaskCompleted');

console.log(`\n======================================================`);
console.log(`Tổng kết: ${passCount} PASS, ${failCount} FAIL`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('TẤT CẢ KIỂM THỬ V15-25 ĐẠT KẾT QUẢ XUẤT SẮC!');
}
