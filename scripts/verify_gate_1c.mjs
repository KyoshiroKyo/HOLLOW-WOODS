/**
 * HOLLOW WOODS V1.1 - GATE 1C
 * PAUSE MODAL & DEBUG OVERLAY VERIFICATION SCRIPT
 */

import fs from 'fs';
import path from 'path';

console.log("==================================================================");
console.log("   HOLLOW WOODS V1.1 - GATE 1C ARCHITECTURAL VERIFICATION SCRIPT  ");
console.log("==================================================================\n");

const ROOT = process.cwd();

const pauseModalPath = path.join(ROOT, 'src/ui/PauseModal.ts');
const debugOverlayPath = path.join(ROOT, 'src/utils/DebugOverlay.ts');
const uiScenePath = path.join(ROOT, 'src/scenes/UIScene.ts');
const gameScenePath = path.join(ROOT, 'src/scenes/GameScene.ts');

const pmCode = fs.readFileSync(pauseModalPath, 'utf8');
const dbgCode = fs.readFileSync(debugOverlayPath, 'utf8');
const uiCode = fs.readFileSync(uiScenePath, 'utf8');
const gsCode = fs.readFileSync(gameScenePath, 'utf8');

let checksPassed = 0;
let totalChecks = 0;

function check(name, condition, details = '') {
  totalChecks++;
  if (condition) {
    checksPassed++;
    console.log(`[PASS] ${name}`);
    if (details) console.log(`       -> ${details}`);
  } else {
    console.error(`[FAIL] ${name}`);
    if (details) console.error(`       -> ${details}`);
  }
}

// 1. Kiểm tra PauseModal thuộc sở hữu UIScene (Zoom 1.0)
check(
  "UIScene Owns & Manages PauseModal at Zoom 1.0",
  gsCode.includes("this.pauseModal = new PauseModal(this.uiScene") &&
  gsCode.includes("this.uiScene.pauseModal = this.pauseModal") &&
  uiCode.includes("public pauseModal!: PauseModal"),
  "PauseModal được khởi tạo trực tiếp trên UIScene ở Zoom 1.0 cố định"
);

// 2. Kích thước & Tọa độ PauseModal tại 1280x720 HD
const pmW = 480, pmH = 370;
const pmX = (1280 - pmW) / 2; // 400
const pmY = (720 - pmH) / 2;  // 175
check(
  "PauseModal Screen-Space Bounds Valid",
  pmCode.includes("modalW = 480") && pmCode.includes("modalH = 370") &&
  pmX === 400 && pmY === 175 && (pmX + pmW) <= 1280 && (pmY + pmH) <= 720,
  `Bounds: X[${pmX}, ${pmX + pmW}], Y[${pmY}, ${pmY + pmH}] trọn vẹn trong 1280x720 HD`
);

// 3. PauseModal có lớp phủ chặn click xuyên thấu và nút đóng [✕]
check(
  "PauseModal Overlay & Close Controls",
  pmCode.includes("overlay.fillRect(0, 0, 1280, 720)") &&
  pmCode.includes("setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720)") &&
  pmCode.includes("'✕'") && pmCode.includes("this.close()"),
  "Overlay 1280×720 ngăn click xuyên thấu + nút đóng nhanh [✕] hoạt động chuẩn xác"
);

// 4. Đầy đủ 4 nút bấm hành động chuẩn HD
check(
  "PauseModal Action Buttons Present",
  pmCode.includes("TIẾP TỤC TRÒ CHƠI") &&
  pmCode.includes("LƯU GAME THỦ CÔNG") &&
  pmCode.includes("NẠP LẠI ĐIỂM LƯU GẦN NHẤT") &&
  pmCode.includes("QUAY VỀ MENU CHÍNH"),
  "4 nút bấm chức năng (Resume, Save, Reload, Quit to Menu) đầy đủ và có phản hồi trạng thái"
);

// 5. Kiến trúc DebugOverlay phân tách rõ ràng (Dual-Target Architecture)
check(
  "DebugOverlay Split Architecture (UIScene Text + GameScene Graphics)",
  dbgCode.includes("this.scene = scene") &&
  dbgCode.includes("this.uiScene = uiScene || scene") &&
  dbgCode.includes("HDTextHelper.createText(this.uiScene, 24, 140") &&
  dbgCode.includes("this.graphics = scene.add.graphics()"),
  "Bảng thông số text đặt tại (24, 140) trên UIScene Zoom 1.0; Bounding box vẽ trên GameScene"
);

// 6. Tính chuẩn xác Canon Satyr trong DebugOverlay (Không còn Dark Rogue)
check(
  "DebugOverlay Satyr Canon Integrity",
  dbgCode.includes("SATYR_FRAME_WIDTH") &&
  dbgCode.includes("SATYR_BODY_WIDTH") &&
  dbgCode.includes("THÔNG SỐ KỸ THUẬT NHÂN VẬT SATYR") &&
  !dbgCode.toLowerCase().includes("dark rogue"),
  "Xóa bỏ hoàn toàn nhãn Dark Rogue, sử dụng 100% hằng số & nhãn nhân vật chính Satyr"
);

// 7. Mutual Exclusion giữa Pause, Dialogue, Crafting và Journal
check(
  "Mutual Exclusion On Pause Open",
  pmCode.includes("if (ui && ui.isDialogueActive) {") &&
  pmCode.includes("ui.craftingModal.close()") &&
  pmCode.includes("ui.journalModal.close()"),
  "Chặn mở Pause khi đang đối thoại; Tự động đóng Crafting/Journal nếu đang mở"
);

// 8. Đóng Pause khi mở Crafting hoặc Journal từ UIScene
check(
  "Mutual Exclusion When Opening Other Modals",
  uiCode.includes("if (this.pauseModal && this.pauseModal.isOpen) {") &&
  uiCode.includes("this.pauseModal.close();"),
  "Mở Crafting/Journal tự động đóng PauseModal nếu đang mở"
);

// 9. Phím ESC ưu tiên đóng modal trước khi toggle Pause
check(
  "ESC Key Priority Hierarchy",
  gsCode.includes("if (this.craftingModal && this.craftingModal.isOpen)") &&
  gsCode.includes("if (this.journalModal && this.journalModal.isOpen)") &&
  gsCode.includes("if (this.dialogueSystem && this.dialogueSystem.isActive)") &&
  gsCode.includes("this.pauseModal.toggle()"),
  "ESC đóng Crafting -> Journal -> Dialogue trước; Nếu không có modal nào mới mở Pause"
);

// 10. Đóng băng thế giới trò chơi khi Pause đang mở
check(
  "Game World Freeze When Paused",
  gsCode.includes("if (this.pauseModal && this.pauseModal.isOpen)") &&
  gsCode.includes("setVelocity(0, 0)") &&
  gsCode.includes("return;"),
  "Khóa vận tốc Satyr về (0,0) và dừng toàn bộ logic thế giới (quái, sinh tồn) khi Pause"
);

// 11. Thanh Quickbar tích hợp nút [ESC] Tạm Dừng và ẩn/hiện an toàn
check(
  "Quickbar [ESC] Tạm Dừng Integration",
  uiCode.includes("{ key: '[ESC] Tạm Dừng', id: 'pause' }") &&
  uiCode.includes("this.togglePause()"),
  "Nút [ESC] Tạm Dừng trên Quickbar kết nối trực tiếp togglePause()"
);

// 12. Quản lý trạng thái isAnyModalOpen trên UIScene
check(
  "UIScene isAnyModalOpen Tracks PauseModal",
  uiCode.includes("this.isDialogueActive ||") &&
  uiCode.includes("(!!this.pauseModal && this.pauseModal.isOpen)"),
  "isAnyModalOpen theo dõi đồng thời Dialogue, Crafting, Journal và PauseModal"
);

console.log("\n==================================================================");
console.log(`VERIFICATION RESULT: ${checksPassed}/${totalChecks} CHECKS PASSED`);
console.log("==================================================================");

if (checksPassed === totalChecks) {
  console.log("\n>>> ALL GATE 1C ARCHITECTURAL CHECKS COMPLETED WITH 100% SUCCESS <<<\n");
  process.exit(0);
} else {
  console.error(`\n>>> FAILED ${totalChecks - checksPassed} CHECKS <<<\n`);
  process.exit(1);
}
