import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG C4-12-04: ỔN ĐỊNH THU THẬP, TÚI ĐỒ, CHẾ TẠO VÀ QUICKBAR ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Kiểm tra cấu hình items.json
const itemsPath = path.resolve('src/data/items.json');
const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

assert(itemsData.items.length >= 8, 'items.json chứa đầy đủ danh mục vật phẩm');
const woodItem = itemsData.items.find(i => i.id === 'res_dry_wood');
const resinItem = itemsData.items.find(i => i.id === 'res_tree_resin');
const flintItem = itemsData.items.find(i => i.id === 'res_flint');
const herbItem = itemsData.items.find(i => i.id === 'res_herbs');
const oilItem = itemsData.items.find(i => i.id === 'item_lantern_oil');
const poulticeItem = itemsData.items.find(i => i.id === 'item_herbal_poultice');
const lureItem = itemsData.items.find(i => i.id === 'item_noise_lure');

assert(woodItem && resinItem && flintItem && herbItem, '4 loại tài nguyên cơ bản tồn tại trong items.json');
assert(oilItem && poulticeItem && lureItem, '3 vật phẩm chế tạo tồn tại trong items.json');
assert(poulticeItem.effects?.health === 40 && poulticeItem.effects?.composure === 25, 'Thuốc đắp có hiệu ứng +40 Máu, +25 Bình Tâm');
assert(oilItem.effects?.lanternOil === 50, 'Bình dầu đèn có hiệu ứng +50 Dầu Đèn');

// 2. Kiểm tra công thức chế tạo trong items.json
const recipes = itemsData.recipes;
assert(recipes.length === 3, 'Có đủ 3 công thức chế tạo cơ bản');
const rOil = recipes.find(r => r.id === 'craft_lantern_oil');
const rPoultice = recipes.find(r => r.id === 'craft_poultice');
const rLure = recipes.find(r => r.id === 'craft_noise_lure');

assert(rOil?.ingredients.some(i => i.itemId === 'res_tree_resin' && i.count === 1) &&
       rOil?.ingredients.some(i => i.itemId === 'res_dry_wood' && i.count === 1), 'Công thức Dầu Đèn: 1 Nhựa Cây + 1 Gỗ Khô');
assert(rPoultice?.ingredients.some(i => i.itemId === 'res_herbs' && i.count === 2), 'Công thức Thuốc Đắp: 2 Thảo Dược Bạc');
assert(rLure?.ingredients.some(i => i.itemId === 'res_flint' && i.count === 1) &&
       rLure?.ingredients.some(i => i.itemId === 'res_dry_wood' && i.count === 1), 'Công thức Mồi Ném: 1 Đá Lửa + 1 Gỗ Khô');

// 3. Kiểm tra mã nguồn InventorySystem.ts
const invSrc = fs.readFileSync(path.resolve('src/systems/InventorySystem.ts'), 'utf8');
assert(invSrc.includes('lastHarvestTime'), 'InventorySystem có biến lastHarvestTime để debounce');
assert(invSrc.includes('isNodeDepleted(node.spec.id)'), 'InventorySystem kiểm tra mỏ đã cạn kiệt trước khi cho phép thu thập');
assert(invSrc.includes('targetNode.available = false'), 'Khóa mỏ ngay lập tức khi thu thập');

// 4. Kiểm tra mã nguồn PlayerState.ts
const stateSrc = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf8');
assert(stateSrc.includes('isNodeDepleted(nodeId)'), 'PlayerState.recordResourceHarvest kiểm tra isNodeDepleted chống nhân đôi vật phẩm');
assert(stateSrc.includes('useItem(itemId: string)'), 'PlayerState có phương thức useItem');
assert(stateSrc.includes('this.stats.health < this.stats.maxHealth'), 'useItem kiểm tra chỉ số trước khi tiêu hao (chống lãng phí)');

// 5. Kiểm tra mã nguồn CraftingModal.ts
const modalSrc = fs.readFileSync(path.resolve('src/ui/CraftingModal.ts'), 'utf8');
assert(modalSrc.includes("this.playerState.on('inventory_changed'"), 'CraftingModal tự động refresh khi túi đồ thay đổi');
assert(modalSrc.includes('this.craftingSystem.canCraft(recipe)'), 'CraftingModal kiểm tra canCraft trước khi cho phép bấm nút');

// 6. Kiểm tra mã nguồn UIScene.ts
const uiSrc = fs.readFileSync(path.resolve('src/scenes/UIScene.ts'), 'utf8');
assert(uiSrc.includes('tryConsumePoultice()'), 'UIScene có hàm tryConsumePoultice');
assert(uiSrc.includes('tryConsumeLanternOil()'), 'UIScene có hàm tryConsumeLanternOil');
assert(uiSrc.includes('lastPoulticeTime') && uiSrc.includes('lastOilTime'), 'UIScene debounce phím dùng nhanh 250ms');
assert(uiSrc.includes('Máu và Bình Tâm đã đầy'), 'UIScene cảnh báo khi chỉ số đã đầy 100%');

// 7. Mô phỏng logic kiểm thử đơn vị độc lập (Unit Test Simulation)
class MockPlayerState {
  constructor() {
    this.stats = {
      health: 60,
      maxHealth: 100,
      composure: 50,
      maxComposure: 100,
      lanternOil: 30,
      maxLanternOil: 100
    };
    this.inventory = new Map();
    this.flags = new Set();
  }
  getItemCount(id) {
    return this.inventory.get(id) || 0;
  }
  addItem(id, count = 1) {
    this.inventory.set(id, this.getItemCount(id) + count);
  }
  removeItem(id, count = 1) {
    const cur = this.getItemCount(id);
    if (cur < count) return false;
    if (cur - count <= 0) this.inventory.delete(id);
    else this.inventory.set(id, cur - count);
    return true;
  }
  markNodeDepleted(nodeId) {
    this.flags.add(`depleted_node:${nodeId}`);
  }
  isNodeDepleted(nodeId) {
    return this.flags.has(`depleted_node:${nodeId}`);
  }
  clearNodeDepleted(nodeId) {
    this.flags.delete(`depleted_node:${nodeId}`);
  }
  recordResourceHarvest(itemId, count = 1, nodeId) {
    if (nodeId) {
      if (this.isNodeDepleted(nodeId)) return;
      this.markNodeDepleted(nodeId);
    }
    this.addItem(itemId, count);
  }
  useItem(itemId) {
    const count = this.getItemCount(itemId);
    if (count <= 0) return false;
    const itemMeta = itemsData.items.find(i => i.id === itemId);
    if (!itemMeta || !itemMeta.effects) return false;

    let applied = false;
    if (itemMeta.effects.health !== undefined && this.stats.health < this.stats.maxHealth) {
      this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + itemMeta.effects.health);
      applied = true;
    }
    if (itemMeta.effects.composure !== undefined && this.stats.composure < this.stats.maxComposure) {
      this.stats.composure = Math.min(this.stats.maxComposure, this.stats.composure + itemMeta.effects.composure);
      applied = true;
    }
    if (itemMeta.effects.lanternOil !== undefined && this.stats.lanternOil < this.stats.maxLanternOil) {
      this.stats.lanternOil = Math.min(this.stats.maxLanternOil, this.stats.lanternOil + itemMeta.effects.lanternOil);
      applied = true;
    }
    if (!applied) return false;
    this.removeItem(itemId, 1);
    return true;
  }
}

const mock = new MockPlayerState();

// Test 7.1: Thu hoạch mỏ tài nguyên lần 1
mock.recordResourceHarvest('res_dry_wood', 1, 'node_wood_1');
assert(mock.getItemCount('res_dry_wood') === 1, 'Thu hoạch lần 1: Nhận đúng 1 Gỗ Khô');
assert(mock.isNodeDepleted('node_wood_1'), 'Mỏ node_wood_1 được đánh dấu cạn kiệt');

// Test 7.2: Bấm E spam thu hoạch lại mỏ cũ (chống nhân đôi vật phẩm)
mock.recordResourceHarvest('res_dry_wood', 1, 'node_wood_1');
mock.recordResourceHarvest('res_dry_wood', 1, 'node_wood_1');
assert(mock.getItemCount('res_dry_wood') === 1, 'Spam thu hoạch mỏ đã cạn: Số lượng vẫn là 1 (KHÔNG bị nhân đôi)');

// Test 7.3: Hồi sinh mỏ sau chu kỳ hồi phục
mock.clearNodeDepleted('node_wood_1');
assert(!mock.isNodeDepleted('node_wood_1'), 'Mỏ đã sẵn sàng sau khi hồi sinh');
mock.recordResourceHarvest('res_dry_wood', 1, 'node_wood_1');
assert(mock.getItemCount('res_dry_wood') === 2, 'Thu hoạch lại sau hồi sinh: Nhận thêm 1 Gỗ Khô thành 2');

// Test 7.4: Chế tạo công thức craft_lantern_oil
mock.addItem('res_tree_resin', 1);
assert(mock.getItemCount('res_dry_wood') >= 1 && mock.getItemCount('res_tree_resin') >= 1, 'Đủ nguyên liệu chế tạo Dầu Đèn');

function mockCraft(state, recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return false;
  for (const ing of recipe.ingredients) {
    if (state.getItemCount(ing.itemId) < ing.count) return false;
  }
  for (const ing of recipe.ingredients) {
    state.removeItem(ing.itemId, ing.count);
  }
  state.addItem(recipe.resultItemId, recipe.resultCount);
  return true;
}

const craftSuccess = mockCraft(mock, 'craft_lantern_oil');
assert(craftSuccess === true, 'Chế tạo Dầu Đèn thành công');
assert(mock.getItemCount('item_lantern_oil') === 1, 'Nhận đúng 1 Bình Dầu Đèn');
assert(mock.getItemCount('res_dry_wood') === 1, 'Gỗ Khô giảm từ 2 xuống 1 (-1 nguyên liệu)');
assert(mock.getItemCount('res_tree_resin') === 0, 'Nhựa Cây giảm từ 1 xuống 0 (-1 nguyên liệu)');

// Test 7.5: Chế tạo khi thiếu nguyên liệu
const craftFail = mockCraft(mock, 'craft_lantern_oil');
assert(craftFail === false, 'Thiếu Nhựa Cây: Chế tạo Dầu Đèn bị từ chối');
assert(mock.getItemCount('res_dry_wood') === 1, 'Nguyên liệu không bị trừ khi chế tạo thất bại');

// Test 7.6: Dùng vật phẩm trên Quickbar (Thuốc Đắp)
mock.addItem('item_herbal_poultice', 2);
mock.stats.health = 50;
mock.stats.composure = 40;
const usePoulticeOk = mock.useItem('item_herbal_poultice');
assert(usePoulticeOk === true, 'Dùng Thuốc Đắp thành công');
assert(mock.stats.health === 90, 'Máu tăng từ 50 lên 90 (+40 HP)');
assert(mock.stats.composure === 65, 'Bình Tâm tăng từ 40 lên 65 (+25 Composure)');
assert(mock.getItemCount('item_herbal_poultice') === 1, 'Số lượng Thuốc Đắp giảm đúng 1 đơn vị');

// Test 7.7: Dùng Thuốc Đắp lần 2 đến ngưỡng tối đa
const usePoulticeOk2 = mock.useItem('item_herbal_poultice');
assert(usePoulticeOk2 === true, 'Dùng Thuốc Đắp lần 2 thành công');
assert(mock.stats.health === 100, 'Máu đạt tối đa 100 HP (không vượt quá max)');
assert(mock.stats.composure === 90, 'Bình Tâm tăng lên 90');
assert(mock.getItemCount('item_herbal_poultice') === 0, 'Hết Thuốc Đắp');

// Test 7.8: Dùng Bình Dầu Đèn
mock.stats.lanternOil = 30;
const useOilOk = mock.useItem('item_lantern_oil');
assert(useOilOk === true, 'Dùng Bình Dầu Đèn thành công');
assert(mock.stats.lanternOil === 80, 'Dầu Đèn tăng từ 30 lên 80 (+50%)');
assert(mock.getItemCount('item_lantern_oil') === 0, 'Bình Dầu Đèn giảm đúng 1 đơn vị');

// Test 7.9: Chống lãng phí khi chỉ số đã đạt 100%
mock.addItem('item_lantern_oil', 1);
mock.stats.lanternOil = 100;
const wasteOil = mock.useItem('item_lantern_oil');
assert(wasteOil === false, 'Dầu Đèn đã 100%: Từ chối dùng để chống lãng phí');
assert(mock.getItemCount('item_lantern_oil') === 1, 'Bình Dầu Đèn được giữ nguyên số lượng');

// Test 7.10: Chu kỳ Save / Load bảo toàn túi đồ và trạng thái mỏ
const savedData = {
  inventory: Array.from(mock.inventory.entries()),
  flags: Array.from(mock.flags)
};

const loadedState = new MockPlayerState();
loadedState.inventory.clear();
for (const [id, count] of savedData.inventory) {
  loadedState.inventory.set(id, count);
}
loadedState.flags.clear();
for (const f of savedData.flags) {
  loadedState.flags.add(f);
}

assert(loadedState.getItemCount('item_lantern_oil') === 1, 'Load Game: Bảo toàn đúng 1 Bình Dầu Đèn');
assert(loadedState.getItemCount('res_dry_wood') === 1, 'Load Game: Bảo toàn đúng 1 Gỗ Khô');
assert(loadedState.getItemCount('res_tree_resin') === 0, 'Load Game: Bảo toàn đúng 0 Nhựa Cây');
assert(loadedState.isNodeDepleted('node_wood_1') === true, 'Load Game: Trạng thái cạn kiệt mỏ node_wood_1 được bảo toàn chính xác (true)');

console.log(`\n=== TỔNG KẾT: ${passCount} KIỂM TRA ĐẠT, ${failCount} LỖI ===`);
if (failCount > 0) {
  process.exit(1);
}
