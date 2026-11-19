import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('=== KIỂM TRA TỰ ĐỘNG BƯỚC V15-44: MODAL TOGGLE & KEY SHORTCUTS ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // 1. Kiểm tra UIScene.ts
  const uiSceneCode = fs.readFileSync('src/scenes/UIScene.ts', 'utf8').replace(/\r\n/g, '\n');

  assert(
    !uiSceneCode.includes("keydown-C', () => {\n        if (this.isAnyModalOpen) return;"),
    'UIScene: Phím C không còn bị chặn mù bởi if (this.isAnyModalOpen) return;'
  );

  assert(
    !uiSceneCode.includes("keydown-I', () => {\n        if (this.isAnyModalOpen) return;"),
    'UIScene: Phím I không còn bị chặn mù bởi if (this.isAnyModalOpen) return;'
  );

  assert(
    !uiSceneCode.includes("keydown-J', () => {\n        if (this.isAnyModalOpen) return;"),
    'UIScene: Phím J không còn bị chặn mù bởi if (this.isAnyModalOpen) return;'
  );

  assert(
    !uiSceneCode.includes("keydown-ESC', () => {\n        if (this.isAnyModalOpen) return;"),
    'UIScene: Phím ESC không còn bị chặn mù bởi if (this.isAnyModalOpen) return;'
  );

  assert(
    uiSceneCode.includes('if (this.craftingModal && this.craftingModal.isOpen) {\n          this.craftingModal.close();\n          return;'),
    'UIScene: Phím C và I đóng ngay CraftingModal khi bảng đang mở'
  );

  assert(
    uiSceneCode.includes('if (this.journalModal && this.journalModal.isOpen) {\n          this.journalModal.close();\n          return;'),
    'UIScene: Phím J đóng ngay JournalModal khi bảng đang mở'
  );

  assert(
    uiSceneCode.includes('lastMiniMapToggleTime') && uiSceneCode.includes('lastWorldMapToggleTime'),
    'UIScene: Có cơ chế debounce cho Mini-map [N] và World Map [M]'
  );

  assert(
    uiSceneCode.includes('public get paperNoteModal(): TornPageModal | null'),
    'UIScene: Cung cấp getter paperNoteModal trỏ đến tornPageModal'
  );

  // 2. Kiểm tra GameScene.ts
  const gameSceneCode = fs.readFileSync('src/scenes/GameScene.ts', 'utf8').replace(/\r\n/g, '\n');

  assert(
    gameSceneCode.includes('const isPauseReq = this.player.isPauseRequested();') &&
    gameSceneCode.includes('const isCraftReq = this.player.isCraftingRequested();') &&
    gameSceneCode.includes('const isJournalReq = this.player.isJournalRequested();'),
    'GameScene: Lấy cờ phím tắt TRƯỚC KHI gọi resetAllInputState() trong nhánh else'
  );

  assert(
    gameSceneCode.includes('if (this.craftingModal && this.craftingModal.isOpen) {\n            this.craftingModal.close();\n            this.player.forceUnlockActionState();'),
    'GameScene: Phím tắt craft đóng ngay CraftingModal và giải phóng player'
  );

  assert(
    gameSceneCode.includes('if (this.uiScene && this.uiScene.tornPageModal && this.uiScene.tornPageModal.isOpen) {\n      this.uiScene.tornPageModal.close();'),
    'GameScene: Phím ESC ưu tiên đóng tornPageModal trước khi mở Pause Menu'
  );

  // 3. Kiểm tra CraftingModal.ts
  const craftingModalCode = fs.readFileSync('src/ui/CraftingModal.ts', 'utf8');

  assert(
    craftingModalCode.includes("✕ [I / ESC] Đóng"),
    'CraftingModal: Nhãn nút đóng hiển thị chuẩn ✕ [I / ESC] Đóng'
  );

  assert(
    craftingModalCode.includes("scene.input.keyboard.on('keydown-J', () => {"),
    'CraftingModal: Lắng nghe phím J để chuyển nhanh sang JournalModal'
  );

  assert(
    craftingModalCode.includes("forceUnlockActionState"),
    'CraftingModal: Gọi forceUnlockActionState() khi đóng bảng'
  );

  // 4. Kiểm tra JournalModal.ts
  const journalModalCode = fs.readFileSync('src/ui/JournalModal.ts', 'utf8');

  assert(
    journalModalCode.includes("✕ [J / ESC] Đóng"),
    'JournalModal: Nhãn nút đóng hiển thị chuẩn ✕ [J / ESC] Đóng'
  );

  assert(
    journalModalCode.includes("addKey('keydown-I', () => {") &&
    journalModalCode.includes("addKey('keydown-C', () => {"),
    'JournalModal: Lắng nghe phím I và C để chuyển nhanh sang CraftingModal'
  );

  assert(
    journalModalCode.includes("forceUnlockActionState"),
    'JournalModal: Gọi forceUnlockActionState() khi đóng bảng'
  );

  console.log(`\nKết quả: ${passed}/${total} bài kiểm tra đạt yêu cầu (${Math.round((passed / total) * 100)}%).`);
  if (passed === total) {
    console.log('>>> TẤT CẢ CÁC BÀI KIỂM TRA ĐỀU THÀNH CÔNG VƯỢT TRỘI! <<<');
    process.exit(0);
  } else {
    console.error('>>> CÓ BÀI KIỂM TRA THẤT BẠI! <<<');
    process.exit(1);
  }
}

runTests();
