#!/usr/bin/env node

/**
 * ============================================================================
 * HOLLOW WOODS V1.5 — DATA INTEGRITY VERIFIER (scripts/verify_data_integrity.mjs)
 * ============================================================================
 * Tự động quét và kiểm tra tính toàn vẹn 100% của toàn bộ dữ liệu game:
 * 1. items.json:
 *    - Toàn bộ resultItemId và ingredients[].itemId trong recipes đều tồn tại trong items.json.
 *    - Không có ID vật phẩm trùng lặp hay ID công thức trùng lặp.
 * 2. dialogues.json:
 *    - Toàn bộ rewardItem trong hội thoại đều tồn tại trong items.json.
 *    - Toàn bộ nextDialogueKey (ngoại trừ các khóa điều hướng động được khai báo hợp lệ trong DialogueSystem.ts) đều tồn tại.
 * 3. quests.json:
 *    - Toàn bộ requiredItem trong các chặng nhiệm vụ đều tồn tại trong items.json.
 * 4. content_registry.json & lore.json:
 *    - Không có ID trùng lặp.
 * 5. Cú pháp toàn bộ file JSON:
 *    - Không có khóa JSON thừa dấu cách, dấu hai chấm hoặc ký tự lỗi chính tả.
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');

console.log('========================================================================');
console.log('🔍 HOLLOW WOODS V1.5 — KIỂM TRA TOÀN VẸN DỮ LIỆU GAME (DATA INTEGRITY)');
console.log('========================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let errors = [];

function recordCheck(name, pass, errorMsg = '') {
  totalChecks++;
  if (pass) {
    passedChecks++;
    console.log(`  ✔ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name}: ${errorMsg}`);
    errors.push(`${name}: ${errorMsg}`);
  }
}

// Hàm đệ quy kiểm tra khóa JSON không chứa khoảng trắng ở đầu/cuối hoặc dấu hai chấm
function validateJsonKeys(obj, filename, currentPath = '') {
  let keyErrors = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        keyErrors.push(...validateJsonKeys(item, filename, `${currentPath}[${idx}]`));
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (/^[\s:]|[\s:]$/.test(key) || key.includes(': ')) {
        keyErrors.push(`Khóa dị thường "${key}" tại ${filename} -> ${currentPath}.${key}`);
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keyErrors.push(...validateJsonKeys(obj[key], filename, `${currentPath}.${key}`));
      }
    }
  }
  return keyErrors;
}

// ----------------------------------------------------------------------
// 1. KIỂM TRA CÚ PHÁP KHÓA JSON CHO TOÀN BỘ FILE TRONG SRC/DATA
// ----------------------------------------------------------------------
console.log('--- 1. Kiểm tra định dạng khóa JSON (Không thừa khoảng trắng / dấu hai chấm) ---');
const dataFiles = ['items.json', 'dialogues.json', 'quests.json', 'lore.json', 'content_registry.json'];

for (const file of dataFiles) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    recordCheck(`Tệp dữ liệu ${file} tồn tại`, false, 'Không tìm thấy tệp');
    continue;
  }
  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(rawContent);
    const keyErrors = validateJsonKeys(parsed, file);
    recordCheck(`Cú pháp khóa JSON tệp ${file}`, keyErrors.length === 0, keyErrors.join(' | '));
  } catch (err) {
    recordCheck(`Phân tích cú pháp tệp ${file}`, false, err.message);
  }
}

// ----------------------------------------------------------------------
// 2. KIỂM TRA ITEMS.JSON & RECIPES
// ----------------------------------------------------------------------
console.log('\n--- 2. Kiểm tra tính toàn vẹn danh mục Vật Phẩm & Chế Tạo (items.json) ---');
const itemsJsonPath = path.join(DATA_DIR, 'items.json');
const itemsData = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));

// 2.1 Kiểm tra trùng lặp ID item
const itemIds = new Set();
const duplicateItemIds = [];
for (const it of itemsData.items) {
  if (itemIds.has(it.id)) {
    duplicateItemIds.push(it.id);
  }
  itemIds.add(it.id);
}
recordCheck(`Không có ID vật phẩm trùng lặp trong items.json (Tổng số: ${itemIds.size} items)`, duplicateItemIds.length === 0, `ID trùng: ${duplicateItemIds.join(', ')}`);

// 2.2 Kiểm tra recipes
const recipeIds = new Set();
const duplicateRecipeIds = [];
const brokenRecipeResults = [];
const brokenRecipeIngredients = [];

for (const r of itemsData.recipes) {
  if (recipeIds.has(r.id)) {
    duplicateRecipeIds.push(r.id);
  }
  recipeIds.add(r.id);

  if (!itemIds.has(r.resultItemId)) {
    brokenRecipeResults.push(`Công thức [${r.id}] tạo ra resultItemId không tồn tại: "${r.resultItemId}"`);
  }

  if (Array.isArray(r.ingredients)) {
    for (const ing of r.ingredients) {
      if (!itemIds.has(ing.itemId)) {
        brokenRecipeIngredients.push(`Công thức [${r.id}] yêu cầu nguyên liệu không tồn tại: "${ing.itemId}"`);
      }
    }
  } else {
    brokenRecipeIngredients.push(`Công thức [${r.id}] thiếu mảng ingredients hợp lệ`);
  }
}

recordCheck(`Không có ID công thức chế tạo trùng lặp (Tổng số: ${recipeIds.size} recipes)`, duplicateRecipeIds.length === 0, `Công thức trùng: ${duplicateRecipeIds.join(', ')}`);
recordCheck(`100% resultItemId trong công thức đều tồn tại trong items.json`, brokenRecipeResults.length === 0, brokenRecipeResults.join(' | '));
recordCheck(`100% ingredients[].itemId trong công thức đều tồn tại trong items.json`, brokenRecipeIngredients.length === 0, brokenRecipeIngredients.join(' | '));

// ----------------------------------------------------------------------
// 3. KIỂM TRA DIALOGUES.JSON
// ----------------------------------------------------------------------
console.log('\n--- 3. Kiểm tra tính toàn vẹn Hội Thoại & Phần Thưởng (dialogues.json) ---');
const dialoguesJsonPath = path.join(DATA_DIR, 'dialogues.json');
const dialoguesData = JSON.parse(fs.readFileSync(dialoguesJsonPath, 'utf8'));
const dialogues = dialoguesData.dialogues || {};
const dialogueKeys = new Set(Object.keys(dialogues));

// Các khóa điều hướng động được xử lý đặc biệt trong DialogueSystem.ts
const DYNAMIC_NAVIGATION_KEYS = new Set([
  'campfire_knight_rest_blessing' // Được DialogueSystem.ts điều hướng sang campfire_knight_rest_blessing_stage3, campfire_knight_rest_blessing_stage0_2, campfire_knight_rest_cooldown
]);

// Đảm bảo các nhánh đích của khóa động thật sự tồn tại
const dynamicTargets = [
  'campfire_knight_rest_cooldown',
  'campfire_knight_rest_blessing_stage3',
  'campfire_knight_rest_blessing_stage0_2'
];
const missingDynamicTargets = dynamicTargets.filter(k => !dialogueKeys.has(k));
recordCheck(`Các nhánh đích động của Sir Vaelen đều tồn tại trong dialogues.json`, missingDynamicTargets.length === 0, `Thiếu nhánh: ${missingDynamicTargets.join(', ')}`);

const brokenRewards = [];
const brokenNextKeys = [];

for (const [dKey, dObj] of Object.entries(dialogues)) {
  // Kiểm tra rewardItem
  if (dObj.rewardItem) {
    if (!itemIds.has(dObj.rewardItem)) {
      brokenRewards.push(`Hội thoại [${dKey}] trao rewardItem không tồn tại: "${dObj.rewardItem}"`);
    }
  }

  // Kiểm tra nextDialogueKey trong choices
  if (Array.isArray(dObj.choices)) {
    for (const ch of dObj.choices) {
      if (ch.nextDialogueKey) {
        if (!dialogueKeys.has(ch.nextDialogueKey) && !DYNAMIC_NAVIGATION_KEYS.has(ch.nextDialogueKey)) {
          brokenNextKeys.push(`Hội thoại [${dKey}] có lựa chọn chuyển tới nextDialogueKey không tồn tại: "${ch.nextDialogueKey}"`);
        }
      }
    }
  }
}

recordCheck(`100% rewardItem trong dialogues.json đều tồn tại trong items.json`, brokenRewards.length === 0, brokenRewards.join(' | '));
recordCheck(`100% nextDialogueKey trong các lựa chọn đều tồn tại hợp lệ`, brokenNextKeys.length === 0, brokenNextKeys.join(' | '));

// ----------------------------------------------------------------------
// 4. KIỂM TRA QUESTS.JSON
// ----------------------------------------------------------------------
console.log('\n--- 4. Kiểm tra tính toàn vẹn Nhiệm Vụ 7 Chặng (quests.json) ---');
const questsJsonPath = path.join(DATA_DIR, 'quests.json');
const questsData = JSON.parse(fs.readFileSync(questsJsonPath, 'utf8'));
const brokenQuestItems = [];

if (Array.isArray(questsData.stages)) {
  for (const st of questsData.stages) {
    if (st.requiredItem) {
      if (!itemIds.has(st.requiredItem)) {
        brokenQuestItems.push(`Chặng [${st.stageId}] yêu cầu requiredItem không tồn tại: "${st.requiredItem}"`);
      }
    }
  }
}
recordCheck(`100% requiredItem trong quests.json đều tồn tại trong items.json`, brokenQuestItems.length === 0, brokenQuestItems.join(' | '));

// ----------------------------------------------------------------------
// 5. KIỂM TRA CONTENT_REGISTRY.JSON & LORE.JSON
// ----------------------------------------------------------------------
console.log('\n--- 5. Kiểm tra tính toàn vẹn Content Registry & Lore ---');
const crJsonPath = path.join(DATA_DIR, 'content_registry.json');
const crData = JSON.parse(fs.readFileSync(crJsonPath, 'utf8'));

const crIds = new Set();
const duplicateCrIds = [];
const crEntries = crData.entries || crData.items || [];
for (const entry of crEntries) {
  if (entry.id) {
    if (crIds.has(entry.id)) {
      duplicateCrIds.push(entry.id);
    }
    crIds.add(entry.id);
  }
}
recordCheck(`Không có ID trùng lặp trong content_registry.json (Tổng số: ${crIds.size} mục)`, duplicateCrIds.length === 0, `ID trùng: ${duplicateCrIds.join(', ')}`);

const loreJsonPath = path.join(DATA_DIR, 'lore.json');
const loreData = JSON.parse(fs.readFileSync(loreJsonPath, 'utf8'));
const loreIds = new Set();
const duplicateLoreIds = [];
const allLoreList = [
  ...(loreData.loreEntries || []),
  ...(loreData.subAreaLoreEntries || [])
];
for (const entry of allLoreList) {
  if (entry.id) {
    if (loreIds.has(entry.id)) {
      duplicateLoreIds.push(entry.id);
    }
    loreIds.add(entry.id);
  }
}
recordCheck(`Không có ID trùng lặp trong lore.json (Tổng số: ${loreIds.size} mục ghi chép)`, duplicateLoreIds.length === 0, `ID trùng: ${duplicateLoreIds.join(', ')}`);

// ----------------------------------------------------------------------
// TỔNG KẾT
// ----------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`📊 TỔNG KẾT KIỂM TRA TOÀN VẸN DỮ LIỆU: ${passedChecks}/${totalChecks} KIỂM TRA ĐẠT`);
console.log('========================================================================');

if (errors.length > 0) {
  console.error('\n❌ CÁC LỖI TOÀN VẸN CẦN XỬ LÝ:');
  errors.forEach(e => console.error(` - ${e}`));
  process.exit(1);
} else {
  console.log('\n🎉 TOÀN BỘ DỮ LIỆU GAME (ITEMS, RECIPES, DIALOGUES, QUESTS, REGISTRY, LORE) ĐẠT 100% CHUẨN TOÀN VẸN!\n');
  process.exit(0);
}
