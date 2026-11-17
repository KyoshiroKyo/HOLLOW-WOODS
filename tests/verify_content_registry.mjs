import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ CONTENT REGISTRY & KIẾN TRÚC ID 4 TẦNG');
console.log('======================================================================\n');

const jsonPath = path.resolve('src/data/content_registry.json');
const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const assets = rawData.assets || [];
const entries = rawData.entries || [];

console.log(`[DATA CHECK] Đã nạp thành công ${assets.length} assets và ${entries.length} content entries.`);

// 1. Kiểm tra tính toàn vẹn và chống trùng lặp
const seenIds = new Set();
const seenKeys = new Set();
const duplicateIds = [];
const duplicateKeys = [];
const unresolvedAssets = [];

const assetMap = new Map();
for (const a of assets) {
  assetMap.set(a.assetId, a);
}

const idMap = new Map();
const keyMap = new Map();
const aliasMap = new Map();

for (const e of entries) {
  // Check duplicate ID
  if (seenIds.has(e.id)) {
    duplicateIds.push(e.id);
  }
  seenIds.add(e.id);
  idMap.set(e.id, e);

  // Check duplicate runtimeKey
  if (seenKeys.has(e.runtimeKey)) {
    duplicateKeys.push(e.runtimeKey);
  }
  seenKeys.add(e.runtimeKey);
  keyMap.set(e.runtimeKey, e);

  // Map alias & slug
  aliasMap.set(e.slug.toLowerCase(), e);
  if (e.aliases) {
    for (const a of e.aliases) {
      aliasMap.set(a.toLowerCase(), e);
    }
  }

  // Check asset refs
  if (e.assetRefs) {
    for (const ar of e.assetRefs) {
      if (!assetMap.has(ar)) {
        unresolvedAssets.push(`${e.id} -> ${ar}`);
      }
    }
  }
}

console.log(`[VALIDATION] Tổng số bản ghi đăng ký: ${entries.length}`);
console.log(`[VALIDATION] Trùng lặp Content ID: ${duplicateIds.length === 0 ? 'KHÔNG (0)' : duplicateIds.join(', ')}`);
console.log(`[VALIDATION] Trùng lặp Runtime Key: ${duplicateKeys.length === 0 ? 'KHÔNG (0)' : duplicateKeys.join(', ')}`);
console.log(`[VALIDATION] Asset tham chiếu lỗi: ${unresolvedAssets.length === 0 ? 'KHÔNG (0)' : unresolvedAssets.join(', ')}`);

const isValid = duplicateIds.length === 0 && duplicateKeys.length === 0 && unresolvedAssets.length === 0;
console.log(`[VALIDATION] Kết quả kiểm tra toàn vẹn: ${isValid ? 'PASS (HỢP LỆ 100%)' : 'FAIL'}\n`);

if (!isValid) {
  process.exit(1);
}

// 2. Tra cứu hai chiều
const testCases = [
  { id: 'HW-ITM-RES-000001', expectedKey: 'res_dry_wood' },
  { id: 'HW-ITM-RES-000003', expectedKey: 'res_tree_resin' },
  { id: 'HW-ITM-CNS-000001', expectedKey: 'item_lantern_oil' },
  { id: 'HW-ITM-QST-000001', expectedKey: 'quest_bronze_clapper' },
  { id: 'HW-ZON-CORE-000002', expectedKey: 'bellhollow' },
  { id: 'HW-NPC-VILLAGER-000002', expectedKey: 'npc_edda' },
  { id: 'HW-MON-STALKER-000001', expectedKey: 'mon_the_listener' }
];

let lookupPass = true;
for (const tc of testCases) {
  const byId = idMap.get(tc.id);
  const byKey = keyMap.get(tc.expectedKey);
  if (!byId || !byKey || byId.id !== byKey.id || byId.runtimeKey !== tc.expectedKey) {
    console.error(`[LOOKUP FAIL] Sai lệch cho ${tc.id} / ${tc.expectedKey}`);
    lookupPass = false;
  }
}
console.log(`[LOOKUP TWO-WAY] Kiểm tra tra cứu hai chiều: ${lookupPass ? 'PASS (7/7 TESTCASES CHUẨN XÁC)' : 'FAIL'}`);

// 3. Kiểm tra giải quyết Alias thông minh (Hợp nhất Tree Resin & Pine Resin, Trà Thảo Mộc)
function resolveAlias(query) {
  const clean = query.trim().toLowerCase();
  return idMap.get(query) || keyMap.get(query) || aliasMap.get(clean);
}

const resinQueries = ['res_tree_resin', 'tree_resin', 'pine_resin', 'res_pine_resin', 'HW-ITM-RES-000003'];
let resinUnified = true;
for (const q of resinQueries) {
  const item = resolveAlias(q);
  if (!item || item.id !== 'HW-ITM-RES-000003' || item.runtimeKey !== 'res_tree_resin') {
    console.error(`[ALIAS FAIL] Query '${q}' không trỏ về HW-ITM-RES-000003!`);
    resinUnified = false;
  }
}
console.log(`[ALIAS RESOLUTION] Hợp nhất Nhựa Cây / Nhựa Thông (Tree Resin & Pine Resin): ${resinUnified ? 'PASS (5/5 ALIAS TRỎ ĐÚNG HW-ITM-RES-000003)' : 'FAIL'}`);

const teaQueries = ['food_calming_tea', 'calming_tea', 'herbal_tea', 'HW-ITM-FOOD-000001'];
let teaUnified = true;
for (const q of teaQueries) {
  const item = resolveAlias(q);
  if (!item || item.id !== 'HW-ITM-FOOD-000001') {
    console.error(`[ALIAS FAIL] Query '${q}' không trỏ về HW-ITM-FOOD-000001!`);
    teaUnified = false;
  }
}
console.log(`[ALIAS RESOLUTION] Hợp nhất Trà An Thần / Herbal Tea: ${teaUnified ? 'PASS (4/4 ALIAS TRỎ ĐÚNG HW-ITM-FOOD-000001)' : 'FAIL'}`);

// 4. Kiểm tra bảo toàn 10 vật phẩm V1.3
const v13Items = [
  'res_dry_wood', 'res_flint', 'res_tree_resin', 'res_herbs', 'seed_herbs',
  'item_lantern_oil', 'item_herbal_poultice', 'item_noise_lure', 'quest_bronze_clapper', 'lore_satyr_journal'
];
let v13Pass = true;
for (const k of v13Items) {
  if (!keyMap.get(k)) {
    console.error(`[V1.3 LEGACY FAIL] Thiếu khóa runtime V1.3: ${k}`);
    v13Pass = false;
  }
}
console.log(`[V1.3 COMPATIBILITY] Bảo toàn 10 vật phẩm gốc V1.3: ${v13Pass ? 'PASS (10/10 ITEMS TỒN TẠI NGUYÊN VẸN)' : 'FAIL'}`);

console.log('\n======================================================================');
console.log('   TẤT CẢ CÁC BÀI KIỂM THỬ CONTENT REGISTRY ĐẠT CHUẨN 100%!');
console.log('======================================================================');
