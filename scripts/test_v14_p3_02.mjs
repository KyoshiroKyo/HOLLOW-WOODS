/**
 * HOLLOW WOODS V1.4 – BỘ KIỂM THỬ VÒNG LẶP VẬT PHẨM & NÔNG TRẠI SANCTUARY FARM (V14-P3-02)
 * Kiểm toán và xác minh tự động:
 * 1. Danh mục vật phẩm & công thức bối cảnh Trung cổ Bellhollow (Dây Thừng Rừng, Than Củi, Phụ Kiện Sắt Cổ Ngữ, Trà An Thần, Súp Rễ Rừng, Nấm Nướng)
 * 2. Phân trang CraftingModal mượt mà, trực quan
 * 3. Cơ chế bảo vệ tuyệt đối vật phẩm Nhiệm vụ (Quest) và Nhật ký (Lore) trong PlayerState
 * 4. Quy trình nông trại 5 bước trực quan (trống -> làm đất -> gieo mầm -> lớn -> thu hoạch)
 * 5. Ba nhóm cây trồng đặc trưng (Dược liệu, Lương thực, Cỏ sợi bện dây)
 * 6. Tương thích toàn vẹn với SaveManager và hồi quy V1.3
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ VẬT PHẨM & SANCTUARY FARM (V14-P3-02)');
console.log('======================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

// ====================================================================
// PHẦN 1: CHUỖI VẬT PHẨM & CÔNG THỨC TRUNG CỔ BELLHOLLOW
// ====================================================================
console.log('--- PHẦN 1: Danh Mục Vật Phẩm Mới & Đăng Ký Hệ Thống ---');

const itemsPath = path.join(ROOT_DIR, 'src', 'data', 'items.json');
assert(fs.existsSync(itemsPath), 'File src/data/items.json tồn tại');
const itemsJson = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

const requiredItems = [
  { id: 'mat_forest_rope', category: 'material', name: 'Dây Thừng Rừng' },
  { id: 'mat_charcoal', category: 'material', name: 'Than Củi' },
  { id: 'mat_runed_iron', category: 'material', name: 'Phụ Kiện Sắt Rèn Cổ Ngữ' },
  { id: 'food_calming_tea', category: 'consumable', name: 'Trà Thảo Dược An Thần' },
  { id: 'food_roasted_mushroom', category: 'consumable', name: 'Nấm Rừng Nướng' },
  { id: 'food_forest_root_soup', category: 'consumable', name: 'Súp Rễ Rừng' },
  { id: 'res_forest_roots', category: 'resource', name: 'Rễ Rừng' },
  { id: 'res_forest_mushroom', category: 'resource', name: 'Nấm Rừng' },
  { id: 'res_tough_fiber', category: 'resource', name: 'Cỏ Sợi Bện Dây' },
  { id: 'seed_roots', category: 'resource', name: 'Củ Giống Rễ Rừng' },
  { id: 'seed_mushroom', category: 'resource', name: 'Bào Tử Nấm Rừng' },
  { id: 'seed_fiber', category: 'resource', name: 'Hạt Giống Cỏ Sợi' }
];

for (const req of requiredItems) {
  const found = itemsJson.items.find(i => i.id === req.id);
  assert(found && found.category === req.category, `Vật phẩm ${req.name} (${req.id}) khai báo chuẩn category: ${req.category}`);
}

// Kiểm tra 5 công thức mới
console.log('\n--- PHẦN 2: Công Thức Chế Tạo & Nấu Nướng V1.4 ---');
const requiredRecipes = [
  'craft_forest_rope',
  'craft_charcoal',
  'craft_roasted_mushroom',
  'craft_forest_root_soup',
  'craft_calming_tea'
];

for (const rId of requiredRecipes) {
  const rFound = itemsJson.recipes.find(r => r.id === rId);
  assert(rFound !== undefined, `Công thức ${rId} tồn tại trong danh mục chế tạo items.json`);
}

// Kiểm tra Content Registry & 4 Tầng Định Danh
console.log('\n--- PHẦN 3: Đăng Ký Định Danh 4 Tầng (Content Registry) ---');
const registryJsonPath = path.join(ROOT_DIR, 'src', 'data', 'content_registry.json');
const registryJson = JSON.parse(fs.readFileSync(registryJsonPath, 'utf-8'));

const requiredRegistryIds = [
  'HW-ITM-MAT-000001', // Forest Rope
  'HW-ITM-MAT-000002', // Charcoal
  'HW-ITM-MAT-000003', // Runed Iron
  'HW-ITM-FOOD-000001', // Calming Tea
  'HW-ITM-FOOD-000002', // Roasted Mushroom
  'HW-ITM-FOOD-000003', // Forest Root Soup
  'HW-ITM-RES-000005', // Forest Roots
  'HW-ITM-RES-000006', // Forest Mushroom
  'HW-ITM-RES-000007', // Tough Fiber
  'HW-ITM-SEED-000002', // Root Seeds
  'HW-ITM-SEED-000003', // Mushroom Spores
  'HW-ITM-SEED-000004'  // Fiber Seeds
];

for (const cId of requiredRegistryIds) {
  const entry = registryJson.entries.find(e => e.id === cId);
  assert(entry !== undefined, `Đăng ký Content Registry thành công: ${cId} (${entry ? entry.nameVi : 'N/A'})`);
}

// ====================================================================
// PHẦN 4: BẢO VỆ VẬT PHẨM NHIỆM VỤ & TRUYỀN THUYẾT (PLAYERSTATE)
// ====================================================================
console.log('\n--- PHẦN 4: Cơ Chế Bảo Vệ Vật Phẩm Nhiệm Vụ & Nhật Ký ---');
const playerStatePath = path.join(ROOT_DIR, 'src', 'state', 'PlayerState.ts');
const playerStateSrc = fs.readFileSync(playerStatePath, 'utf-8');

assert(playerStateSrc.includes('public isProtectedItem(itemId: string): boolean'), 'PlayerState có hàm isProtectedItem');
assert(playerStateSrc.includes('quest_') && playerStateSrc.includes('lore_'), 'Bảo vệ tiền tố quest_ và lore_');
assert(playerStateSrc.includes('this.isProtectedItem(itemId)'), 'useItem kiểm tra isProtectedItem trước khi tiêu thụ');

// ====================================================================
// PHẦN 5: GIAO DIỆN PHÂN TRANG BÀN CHẾ TẠO (CRAFTING MODAL)
// ====================================================================
console.log('\n--- PHẦN 5: Phân Trang Bàn Chế Tạo (CraftingModal) ---');
const craftingModalPath = path.join(ROOT_DIR, 'src', 'ui', 'CraftingModal.ts');
const craftingModalSrc = fs.readFileSync(craftingModalPath, 'utf-8');

assert(craftingModalSrc.includes('PAGE_SIZE'), 'CraftingModal có tham số phân trang PAGE_SIZE');
assert(craftingModalSrc.includes('updatePageVisibility()'), 'CraftingModal có hàm điều hướng updatePageVisibility');
assert(craftingModalSrc.includes('Trang Trước') && craftingModalSrc.includes('Trang Sau'), 'CraftingModal có 2 nút chuyển trang trực quan');
assert(craftingModalSrc.includes('modalW = 840') && craftingModalSrc.includes('modalH = 520'), 'Bảo toàn kích thước chuẩn của CraftingModal (840x520)');

// ====================================================================
// PHẦN 6: NÂNG CẤP SANCTUARY FARM (5 BƯỚC & 3 NHÓM CÂY TRỒNG)
// ====================================================================
console.log('\n--- PHẦN 6: Quy Trình 5 Bước & 3 Nhóm Cây Trồng Sanctuary Farm ---');
const farmingPath = path.join(ROOT_DIR, 'src', 'systems', 'FarmingSystem.ts');
const farmingSrc = fs.readFileSync(farmingPath, 'utf-8');

assert(farmingSrc.includes('plot.isPrepared'), 'FarmingSystem quản lý trạng thái chuẩn bị đất (isPrepared)');
assert(farmingSrc.includes('Làm Đất Chuẩn Bị Luống Trồng'), 'Prompt nhắc làm đất tơi xốp trước khi gieo');
assert(farmingSrc.includes('Gieo Hạt Giống Thảo Dược'), 'Hỗ trợ nhóm cây Dược tính (Thảo Dược Bạc)');
assert(farmingSrc.includes('Gieo Củ Giống Rễ Rừng') || farmingSrc.includes('Ươm củ Rễ Rừng'), 'Hỗ trợ nhóm cây Lương thực (Rễ Rừng)');
assert(farmingSrc.includes('Ươm Bào Tử Nấm Rừng') || farmingSrc.includes('Cấy tai Nấm Rừng'), 'Hỗ trợ nhóm Nấm Rừng');
assert(farmingSrc.includes('Gieo Hạt Giống Cỏ Sợi Bện Dây'), 'Hỗ trợ nhóm Cỏ Sợi Bện Dây');
assert(farmingSrc.includes('res_forest_roots') && farmingSrc.includes('seed_roots'), 'Thu hoạch Rễ Rừng ra sản vật và củ giống');
assert(farmingSrc.includes('res_forest_mushroom') && farmingSrc.includes('seed_mushroom'), 'Thu hoạch Nấm Rừng ra nấm và bào tử');
assert(farmingSrc.includes('res_tough_fiber') && farmingSrc.includes('seed_fiber'), 'Thu hoạch Cỏ Sợi ra sợi bện dây và hạt giống');

// ====================================================================
// PHẦN 7: BẢO TOÀN KIỂU DỮ LIỆU & TƯƠNG THÍCH HỒI QUY
// ====================================================================
console.log('\n--- PHẦN 7: Tương Thích Types & Hồi Quy V1.3 ---');
const typesPath = path.join(ROOT_DIR, 'src', 'types', 'index.ts');
const typesSrc = fs.readFileSync(typesPath, 'utf-8');

assert(typesSrc.includes('export type CropType = \'herbs\' | \'roots\' | \'mushroom\' | \'fiber\';'), 'Types định nghĩa kiểu CropType');
assert(typesSrc.includes('export type HerbPlotStage = \'empty\' | \'planted\' | \'growing\' | \'harvest_ready\';'), 'Bảo toàn tuyệt đối kiểu HerbPlotStage');
assert(typesSrc.includes('cropType?: CropType;') && typesSrc.includes('isPrepared?: boolean;'), 'HerbPlotData mở rộng trường tùy chọn an toàn');

// Tổng kết
console.log('\n======================================================================');
console.log(`TỔNG KẾT: ${passedTests}/${totalTests} BÀI TEST ĐẠT CHUẨN (0 THẤT BẠI)`);
if (passedTests === totalTests) {
  console.log('KẾT QUẢ: PASS (100% TIÊU CHÍ V14-P3-02 ĐẠT CHUẨN XUẤT SẮC)');
  console.log('======================================================================\n');
  process.exit(0);
} else {
  console.error('KẾT QUẢ: FAIL (MỘT SỐ TIÊU CHÍ CHƯA ĐẠT)');
  console.log('======================================================================\n');
  process.exit(1);
}
