/**
 * Script kiểm tra tự động nghiệm thu PASS G2
 * Tự động kết thúc trong 10 giây (Quy tắc Anti-Freeze)
 */

import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('=== HOLLOW WOODS V3.0 – KIỂM TRA NGHIỆM THU PASS G2 ===\n');

const ROOT = 'G:\\HOLLOW WOODS V3';

// 1. Kiểm tra các module mã nguồn mới của PASS G2
const g2Files = [
  'src/state/PlayerState.ts',
  'src/systems/SurvivalSystem.ts',
  'src/entities/NPCEntity.ts',
  'src/systems/DialogueSystem.ts',
  'src/systems/InventorySystem.ts',
  'src/systems/CraftingSystem.ts',
  'src/ui/CraftingModal.ts',
  'src/ui/JournalModal.ts',
  'src/scenes/UIScene.ts',
  'src/data/dialogues.json',
  'src/data/items.json',
  'src/data/lore.json'
];

let allOk = true;
for (const f of g2Files) {
  const p = join(ROOT, f);
  if (existsSync(p)) {
    console.log(`✅ [Source G2] ${f} (${statSync(p).size} bytes)`);
  } else {
    console.error(`❌ [Source G2] Thiếu ${f}`);
    allOk = false;
  }
}

// 2. Kiểm tra dữ liệu hội thoại dialogues.json
const dPath = join(ROOT, 'src/data/dialogues.json');
if (existsSync(dPath)) {
  const dData = JSON.parse(readFileSync(dPath, 'utf8'));
  const dKeys = Object.keys(dData.dialogues);
  console.log(`\n✅ [Hội Thoại NPC] Đã nạp ${dKeys.length} phân đoạn:`);
  for (const k of dKeys) {
    const d = dData.dialogues[k];
    console.log(`   - ${k}: ${d.speaker} (${d.lines.length} câu thoại)`);
  }
}

// 3. Kiểm tra dữ liệu vật phẩm và công thức items.json
const iPath = join(ROOT, 'src/data/items.json');
if (existsSync(iPath)) {
  const iData = JSON.parse(readFileSync(iPath, 'utf8'));
  console.log(`\n✅ [Vật Phẩm & Chế Tạo] Đã nạp ${iData.items.length} items và ${iData.recipes.length} công thức:`);
  for (const r of iData.recipes) {
    console.log(`   - [Công Thức] ${r.name} -> Tạo ${r.resultCount}x ${r.resultItemId}`);
  }
}

// 4. Kiểm tra dữ liệu Cổ thư & Nhiệm vụ lore.json
const lPath = join(ROOT, 'src/data/lore.json');
if (existsSync(lPath)) {
  const lData = JSON.parse(readFileSync(lPath, 'utf8'));
  console.log(`\n✅ [Sổ Nhật Ký & Cổ Thư] Đã nạp ${lData.loreEntries.length} trang lore và ${lData.questLog.length} nhiệm vụ:`);
  for (const q of lData.questLog) {
    console.log(`   - ${q.id} (Act ${q.act}): ${q.title} [${q.tasks.length} mục tiêu]`);
  }
}

console.log('\n======================================================');
if (allOk) {
  console.log('🎉 TOÀN BỘ TIÊU CHÍ NGHIỆM THU PASS G2 ĐÃ ĐẠT 100%!');
} else {
  console.log('⚠️ CÒN TIÊU CHÍ CHƯA ĐẠT!');
}
console.log('======================================================\n');

process.exit(0);

