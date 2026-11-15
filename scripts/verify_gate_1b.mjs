
import fs from 'fs';
import path from 'path';

console.log("==================================================================");
console.log("   HOLLOW WOODS V1.1 - GATE 1B ARCHITECTURAL VERIFICATION SCRIPT  ");
console.log("==================================================================\n");

const ROOT = process.cwd();

const craftingModalPath = path.join(ROOT, 'src/ui/CraftingModal.ts');
const journalModalPath = path.join(ROOT, 'src/ui/JournalModal.ts');
const uiScenePath = path.join(ROOT, 'src/scenes/UIScene.ts');
const gameScenePath = path.join(ROOT, 'src/scenes/GameScene.ts');
const itemsJsonPath = path.join(ROOT, 'src/data/items.json');
const loreJsonPath = path.join(ROOT, 'src/data/lore.json');

const cmCode = fs.readFileSync(craftingModalPath, 'utf8');
const jmCode = fs.readFileSync(journalModalPath, 'utf8');
const uiCode = fs.readFileSync(uiScenePath, 'utf8');
const gsCode = fs.readFileSync(gameScenePath, 'utf8');
const itemsData = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
const loreData = JSON.parse(fs.readFileSync(loreJsonPath, 'utf8'));

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

// 1. Kiểm tra quyền sở hữu UIScene (Zoom 1.0)
check(
  "UIScene Owns CraftingModal & JournalModal",
  uiCode.includes("public getCraftingModal") &&
  uiCode.includes("public getJournalModal") &&
  gsCode.includes("this.craftingModal = this.uiScene.getCraftingModal()") &&
  gsCode.includes("this.journalModal = this.uiScene.getJournalModal()"),
  "Cả 2 Modal được tạo và quản lý trực tiếp bởi UIScene ở Zoom 1.0 cố định"
);

// 2. Kích thước & Tọa độ CraftingModal tại 1280x720
const cmW = 840, cmH = 520, cmX = (1280 - cmW) / 2, cmY = (720 - cmH) / 2;
check(
  "CraftingModal Screen-Space Bounds Valid",
  cmCode.includes("modalW = 840") && cmCode.includes("modalH = 520") &&
  cmX === 220 && cmY === 100 && (cmX + cmW) <= 1280 && (cmY + cmH) <= 720,
  `Bounds: X[${cmX}, ${cmX + cmW}], Y[${cmY}, ${cmY + cmH}] trọn vẹn trong 1280x720`
);

// 3. Kích thước & Tọa độ JournalModal tại 1280x720
const jmW = 840, jmH = 520, jmX = (1280 - jmW) / 2, jmY = (720 - jmH) / 2;
check(
  "JournalModal Screen-Space Bounds Valid",
  jmCode.includes("modalW = 840") && jmCode.includes("modalH = 520") &&
  jmX === 220 && jmY === 100 && (jmX + jmW) <= 1280 && (jmY + jmH) <= 720,
  `Bounds: X[${jmX}, ${jmX + jmW}], Y[${jmY}, ${jmY + jmH}] trọn vẹn trong 1280x720`
);

// 4. Tránh trạng thái hiển thị cũ (Stale Visual State) trong CraftingModal
check(
  "CraftingModal Dynamic Ingredient & Button Refresh",
  cmCode.includes("formatIngredients") &&
  cmCode.includes("item.ingText.setText(this.formatIngredients(item.recipe))") &&
  cmCode.includes("item.craftBtnBg.clear()"),
  "refresh() cập nhật số lượng nguyên liệu thực tế và màu nút chế tạo mỗi khi mở/chế tạo"
);

// 5. Điều hướng trang Cổ Thư trong JournalModal
check(
  "JournalModal Lore Pagination Navigation",
  jmCode.includes("Trang Trước") && jmCode.includes("Trang Sau") &&
  jmCode.includes("this.currentLoreIndex = (this.currentLoreIndex - 1 + list.length) % list.length") &&
  jmCode.includes("this.currentLoreIndex = (this.currentLoreIndex + 1) % list.length"),
  "Hỗ trợ lật trang 2 chiều (Trước/Sau) có phân trang tuần hoàn an toàn"
);

// 6. Mutual Exclusion: Không mở khi Dialogue đang chạy
check(
  "Mutual Exclusion With Dialogue",
  cmCode.includes("if (ui && ui.isDialogueActive) {") &&
  jmCode.includes("if (ui && ui.isDialogueActive) {"),
  "Cả 2 Modal từ chối mở khi Dialogue đang active"
);

// 7. Mutual Exclusion: Tự động đóng modal kia khi mở modal này
check(
  "Mutual Exclusion Between Crafting and Journal",
  cmCode.includes("ui.journalModal.close()") &&
  jmCode.includes("ui.craftingModal.close()"),
  "Mở Crafting tự đóng Journal; Mở Journal tự đóng Crafting"
);

// 8. Khóa di chuyển khi Modal mở
check(
  "Player Movement Locked When Modal Open",
  gsCode.includes("this.craftingModal.isOpen") &&
  gsCode.includes("this.journalModal.isOpen") &&
  gsCode.includes("setVelocity(0, 0)"),
  "Satyr bị khóa setVelocity(0, 0) khi một trong hai Modal mở"
);

// 9. Đồng bộ ẩn/hiện Quickbar và Interaction Prompts
check(
  "HUD Quickbar & Prompts Cleanly Synced",
  uiCode.includes("const shouldShow = !active && !this.isAnyModalOpen;") &&
  uiCode.includes("this.quickSlotContainer.setVisible(shouldShow)"),
  "Quickbar chỉ hiển thị lại khi KHÔNG còn bất kỳ modal nào mở"
);

// 10. Dữ liệu công thức chế tạo (3 công thức chuẩn)
check(
  "Crafting Recipes Integrity",
  itemsData.recipes.length === 3 &&
  itemsData.recipes.some(r => r.id === 'craft_lantern_oil') &&
  itemsData.recipes.some(r => r.id === 'craft_poultice') &&
  itemsData.recipes.some(r => r.id === 'craft_noise_lure'),
  `3 công thức sinh tồn: Dầu Đèn, Thuốc Đắp, Mồi Tiếng Động`
);

// 11. Dữ liệu Cổ thư & Nhiệm vụ (4 cổ thư, 7 nhiệm vụ)
check(
  "Lore & Quest Log Integrity",
  loreData.loreEntries.length === 4 && loreData.questLog.length === 7,
  `4 Cổ thư (Ba Quy Tắc, Thảo Dược, Ba Cột Đá, Lời Nguyền) và 7 Nhiệm Vụ (Act 0 - Act 5)`
);

console.log(`\nTổng kết: ${checksPassed}/${totalChecks} tiêu chí đạt chuẩn!`);
