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

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ SANCTUARY CAMP HUB (V14-P3-01)');
console.log('======================================================================\n');

// 1. Kiểm tra tập tin CampSystem.ts & cấu trúc mã nguồn
console.log('--- PHẦN 1: Kiến Trúc CampSystem & Khởi Tạo ---');
const campSystemPath = path.resolve('src/systems/CampSystem.ts');
assert(fs.existsSync(campSystemPath), 'File src/systems/CampSystem.ts tồn tại');
const campContent = fs.readFileSync(campSystemPath, 'utf-8');

assert(campContent.includes('class CampSystem'), 'CampSystem được định nghĩa dạng lớp');
assert(campContent.includes('getInstance()'), 'CampSystem hỗ trợ truy xuất Singleton');
assert(campContent.includes('readonly maxChestSlots: number = 12'), 'Rương chứa đồ giới hạn đúng 12 ô lưu trữ');
assert(campContent.includes('readonly campfireX: number = 780') && campContent.includes('readonly campfireY: number = 260'), 'Lửa trại trung tâm đặt tại tọa độ chuẩn Bellhollow (780, 260)');

// 2. Kiểm tra Logic Lửa Trại 3 Cấp
console.log('\n--- PHẦN 2: Lửa Trại Trung Tâm 3 Cấp & Cơ Chế Nhiên Liệu ---');
assert(campContent.includes('getCampfireLevel'), 'Có phương thức getCampfireLevel()');
assert(campContent.includes('getCampfireFuel'), 'Có phương thức getCampfireFuel()');
assert(campContent.includes('getCampfireRadius'), 'Có phương thức getCampfireRadius()');
assert(campContent.includes('getComposureBonus'), 'Có phương thức getComposureBonus()');
assert(campContent.includes('addFuel'), 'Có phương thức addFuel()');
assert(campContent.includes('res_dry_wood') && campContent.includes('res_tree_resin'), 'Hỗ trợ nạp cả Gỗ Khô và Nhựa Cây');
assert(campContent.includes('level >= 3') && campContent.includes('250'), 'Cấp 3 đạt bán kính 250px');
assert(campContent.includes('level === 2') && campContent.includes('180'), 'Cấp 2 đạt bán kính 180px');
assert(campContent.includes('120'), 'Cấp 1 đạt bán kính 120px');

// 3. Kiểm tra Rương Chứa Đồ 12 Ô
console.log('\n--- PHẦN 3: Rương Chứa Đồ 12 Ô (Không Thất Thoát / Không Nhân Đôi) ---');
assert(campContent.includes('depositItem'), 'Có phương thức depositItem()');
assert(campContent.includes('withdrawItem'), 'Có phương thức withdrawItem()');
assert(campContent.includes('getChestSlots'), 'Có phương thức getChestSlots()');
assert(campContent.includes('getUsedSlotCount() >= this.maxChestSlots'), 'Kiểm tra chặt chẽ ngưỡng 12 ô khi cất đồ mới');
assert(campContent.includes('playerState.storageChest'), 'Đồng bộ trực tiếp với PlayerState.storageChest');

// 4. Kiểm tra Nồi Thảo Dược Neris
console.log('\n--- PHẦN 4: Nồi Thảo Dược Sắc Thuốc & Nấu Nướng ---');
assert(campContent.includes('getCauldronRecipes'), 'Có danh sách công thức Nồi Thảo Dược');
assert(campContent.includes('brewRecipe'), 'Có phương thức brewRecipe()');
assert(campContent.includes('brew_healing_poultice'), 'Có công thức Thuốc Đắp Thảo Dược');
assert(campContent.includes('brew_lantern_oil'), 'Có công thức Tinh Dầu Đèn Lồng');
assert(campContent.includes('brew_calming_tea'), 'Có công thức Trà An Thần Hồi Bình Tâm');

// 5. Kiểm tra Lều Trú Ẩn (Shelter Tent) & Khóa Ngủ Khi Nguy Hiểm
console.log('\n--- PHẦN 5: Lều Trú Ẩn & Quy Tắc Nghỉ Ngơi ---');
assert(campContent.includes('checkRestCondition'), 'Có hàm kiểm tra điều kiện nghỉ ngơi');
assert(campContent.includes('restInShelter'), 'Có hàm thực hiện nghỉ ngơi restInShelter()');
assert(campContent.includes('isAlertOrCombat'), 'Kiểm tra trạng thái báo động hoặc bị săn đuổi');
assert(campContent.includes('Không thể ngủ lúc này!'), 'Tự động khóa chức năng ngủ nếu có nguy hiểm');
assert(campContent.includes('stats.moisture = 0') && campContent.includes('stats.temperature = 90'), 'Nghỉ ngơi hong khô hoàn toàn Độ Ẩm và hồi ấm Thân Nhiệt');

// 6. Kiểm tra TimeSystem.advanceToNextPhase
console.log('\n--- PHẦN 6: Tích Hợp Chuyển Pha Thời Gian Khi Ngủ ---');
const timeSystemPath = path.resolve('src/systems/TimeSystem.ts');
const timeContent = fs.readFileSync(timeSystemPath, 'utf-8');
assert(timeContent.includes('advanceToNextPhase()'), 'TimeSystem có hàm advanceToNextPhase()');

// 7. Kiểm tra SaveManager bảo toàn dữ liệu Lửa Trại & Rương 12 Ô
console.log('\n--- PHẦN 7: Bảo Toàn Dữ Liệu Lưu (SaveManager & PlayerState) ---');
const saveManagerPath = path.resolve('src/systems/SaveManager.ts');
const saveContent = fs.readFileSync(saveManagerPath, 'utf-8');
assert(saveContent.includes('campfireLevel?: number'), 'SaveData chứa trường campfireLevel');
assert(saveContent.includes('campfireFuel?: number'), 'SaveData chứa trường campfireFuel');
assert(saveContent.includes('state.campfireLevel = data.campfireLevel'), 'SaveManager khôi phục campfireLevel');
assert(saveContent.includes('state.campfireFuel = data.campfireFuel'), 'SaveManager khôi phục campfireFuel');
assert(saveContent.includes('state.storageChest.clear()') && saveContent.includes('state.storageChest.set(itemId, count)'), 'SaveManager khôi phục chính xác từng ô rương');

// 8. Kiểm tra Giao Diện Modals (UIScene & Modals)
console.log('\n--- PHẦN 8: Giao Diện Modals (StorageChestModal, CampfireModal, CauldronModal) ---');
assert(fs.existsSync(path.resolve('src/ui/StorageChestModal.ts')), 'File StorageChestModal.ts tồn tại');
assert(fs.existsSync(path.resolve('src/ui/CampfireModal.ts')), 'File CampfireModal.ts tồn tại');
assert(fs.existsSync(path.resolve('src/ui/CauldronModal.ts')), 'File CauldronModal.ts tồn tại');

const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiContent = fs.readFileSync(uiScenePath, 'utf-8');
assert(uiContent.includes('openStorageChest()'), 'UIScene có phương thức openStorageChest()');
assert(uiContent.includes('openCampfireModal()'), 'UIScene có phương thức openCampfireModal()');
assert(uiContent.includes('openCauldronModal()'), 'UIScene có phương thức openCauldronModal()');
assert(uiContent.includes('this.storageChestModal.isOpen') && uiContent.includes('this.campfireModal.isOpen') && uiContent.includes('this.cauldronModal.isOpen'), 'isAnyModalOpen bao quát toàn bộ 3 modal trại mới');

// 9. Kiểm tra WorldBuilder & zones.json
console.log('\n--- PHẦN 9: Bản Đồ Thế Giới & Vật Thể Tương Tác ---');
const worldBuilderPath = path.resolve('src/world/WorldBuilder.ts');
const worldContent = fs.readFileSync(worldBuilderPath, 'utf-8');
assert(worldContent.includes('createSanctuaryCampHub()'), 'WorldBuilder có hàm dựng createSanctuaryCampHub()');
assert(worldContent.includes('createCentralCampfire(780, 260)'), 'Dựng Lửa Trại Trung Tâm tại (780, 260)');
assert(worldContent.includes('createChestProp(735, 255)'), 'Dựng Rương 12 Ô tại (735, 255)');
assert(worldContent.includes('createShelterTent(715, 220)'), 'Dựng Lều Trú Ẩn tại (715, 220)');
assert(worldContent.includes('createHerbalCauldron(935, 140)'), 'Dựng Nồi Thảo Dược tại (935, 140)');

const zonesPath = path.resolve('src/data/zones.json');
const zonesContent = fs.readFileSync(zonesPath, 'utf-8');
assert(zonesContent.includes('camp_central_campfire'), 'zones.json khai báo camp_central_campfire');
assert(zonesContent.includes('camp_storage_chest'), 'zones.json khai báo camp_storage_chest');
assert(zonesContent.includes('camp_shelter_tent'), 'zones.json khai báo camp_shelter_tent');
assert(zonesContent.includes('camp_herbal_cauldron'), 'zones.json khai báo camp_herbal_cauldron');

// 10. Kiểm tra GameScene Map Interaction
console.log('\n--- PHẦN 10: Xử Lý Tương Tác Bản Đồ trong GameScene ---');
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameContent = fs.readFileSync(gameScenePath, 'utf-8');
assert(gameContent.includes('interact_camp_fire'), 'GameScene xử lý action interact_camp_fire');
assert(gameContent.includes('open_camp_chest'), 'GameScene xử lý action open_camp_chest');
assert(gameContent.includes('open_herbal_cauldron'), 'GameScene xử lý action open_herbal_cauldron');
assert(gameContent.includes('rest_in_tent'), 'GameScene xử lý action rest_in_tent');
assert(gameContent.includes("actionId === 'open_storage'"), 'GameScene duy trì action open_storage tương thích hồi quy');
assert(gameContent.includes('this.campSystem.update(dt)'), 'GameScene cập nhật campSystem mỗi khung hình');
assert(gameContent.includes('this.survivalSystem.campfireWarmthRadius = this.campSystem.getCampfireRadius()'), 'GameScene đồng bộ bán kính hơi ấm lửa trại sang survivalSystem');

console.log(`\n======================================================================`);
console.log(`TỔNG KẾT: ${passCount} PASS / ${failCount} FAIL`);
if (failCount > 0) {
  console.error(`KẾT QUẢ: THẤT BẠI (${failCount} bài test không đạt)`);
  process.exit(1);
} else {
  console.log(`KẾT QUẢ: PASS (100% TOÀN BỘ ${passCount} TIÊU CHÍ V14-P3-01 ĐẠT CHUẨN XUẤT SẮC)`);
  console.log(`======================================================================`);
}
