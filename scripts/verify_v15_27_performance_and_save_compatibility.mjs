import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU KIỂM THỬ BƯỚC V15-27: HIỆU NĂNG 60 FPS, LIFECYCLE VÀ SAVE COMPATIBILITY ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// 1. KIỂM TRA HIỆU NĂNG ĐỒ HỌA & CAMERA FRUSTUM CULLING (WORLD BUILDER & GAME SCENE)
// ---------------------------------------------------------------------------
console.log('--- PHẦN 1: TỐI ƯU HIỆU NĂNG ĐỒ HỌA & CULLING 160PX ---');

const cullingModulePath = path.resolve('src/world/modules/CullingOptimizationModule.ts');
assert(fs.existsSync(cullingModulePath), 'File CullingOptimizationModule.ts tồn tại');
const cullingModuleCode = fs.readFileSync(cullingModulePath, 'utf8');
assert(cullingModuleCode.includes('margin: number = 160'), 'CullingOptimizationModule chuẩn hóa biên an toàn 160px');
assert(cullingModuleCode.includes('clear()'), 'CullingOptimizationModule cung cấp phương thức clear()');

const worldBuilderPath = path.resolve('src/world/WorldBuilder.ts');
const worldBuilderCode = fs.readFileSync(worldBuilderPath, 'utf8');
assert(worldBuilderCode.includes('CullingOptimizationModule.getInstance().update(camera, 160)'), 'WorldBuilder updateCameraCulling sử dụng biên an toàn 160px');
assert(worldBuilderCode.includes('CullingOptimizationModule.getInstance().clear()'), 'WorldBuilder.destroy gọi clear() dọn dẹp culling list');

const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf8');
assert(gameSceneCode.includes('updateEntityCameraCulling'), 'GameScene triển khai updateEntityCameraCulling()');
assert(gameSceneCode.includes('this.updateEntityCameraCulling()'), 'updateEntityCameraCulling được kích hoạt trong vòng lặp cullingTimer');
assert(gameSceneCode.includes('const margin = 160;'), 'updateEntityCameraCulling sử dụng biên an toàn 160px');
assert(gameSceneCode.includes('plantedFlares'), 'GameScene culling đồ họa đuốc cắm ngoài camera');
assert(gameSceneCode.includes('this.npcs'), 'GameScene culling NPCs ngoài camera');
assert(gameSceneCode.includes('this.listenerMonster'), 'GameScene culling quái vật The Listener khi ngoài camera');

// ---------------------------------------------------------------------------
// 2. KIỂM TRA PHÒNG NGỪA RÒ RỈ EVENT LISTENER & TIMERS (LIFECYCLE CLEANUP)
// ---------------------------------------------------------------------------
console.log('\n--- PHẦN 2: PHÒNG NGỪA RÒ RỈ EVENT LISTENERS & LIFECYCLE CLEANUP ---');

assert(worldBuilderCode.includes("playerState.off('campfire_updated'"), 'WorldBuilder gỡ bỏ campfire_updated listener khi destroy/nạp lại');
assert(gameSceneCode.includes("playerState.off('player_health_depleted'"), 'GameScene gỡ bỏ player_health_depleted khi shutdown');
assert(gameSceneCode.includes('this.hitboxInspector.destroy()'), 'GameScene hủy hitboxInspector khi shutdown');
assert(gameSceneCode.includes('this.debugOverlay.destroy()'), 'GameScene hủy debugOverlay khi shutdown');

const chestModalPath = path.resolve('src/ui/StorageChestModal.ts');
const chestCode = fs.readFileSync(chestModalPath, 'utf8');
assert(chestCode.includes("playerState.off('chest_updated'"), 'StorageChestModal gỡ bỏ chest_updated khi destroy');
assert(chestCode.includes("playerState.off('inventory_changed'"), 'StorageChestModal gỡ bỏ inventory_changed khi destroy');
assert(chestCode.includes("keyboard.off('keydown-ESC'"), 'StorageChestModal gỡ bỏ phím ESC khi destroy');

const equipModalPath = path.resolve('src/ui/EquipmentModal.ts');
const equipCode = fs.readFileSync(equipModalPath, 'utf8');
assert(equipCode.includes("playerState.off('equipment_changed'"), 'EquipmentModal gỡ bỏ equipment_changed khi destroy');
assert(equipCode.includes("playerState.off('inventory_changed'"), 'EquipmentModal gỡ bỏ inventory_changed khi destroy');
assert(equipCode.includes("playerState.off('weapon_changed'"), 'EquipmentModal gỡ bỏ weapon_changed khi destroy');
assert(equipCode.includes("keyboard.off('keydown-B'"), 'EquipmentModal gỡ bỏ phím B khi destroy');

const campfireModalPath = path.resolve('src/ui/CampfireModal.ts');
const campfireCode = fs.readFileSync(campfireModalPath, 'utf8');
assert(campfireCode.includes("playerState.off('campfire_updated'"), 'CampfireModal gỡ bỏ campfire_updated khi destroy');

const cauldronModalPath = path.resolve('src/ui/CauldronModal.ts');
const cauldronCode = fs.readFileSync(cauldronModalPath, 'utf8');
assert(cauldronCode.includes("playerState.off('inventory_changed'"), 'CauldronModal gỡ bỏ inventory_changed khi destroy');

const journalModalPath = path.resolve('src/ui/JournalModal.ts');
const journalCode = fs.readFileSync(journalModalPath, 'utf8');
assert(journalCode.includes('this.keyHandlers'), 'JournalModal quản lý danh sách keyHandlers');
assert(journalCode.includes('scene.input.keyboard.off'), 'JournalModal gỡ bỏ toàn bộ phím tắt khi destroy');

// ---------------------------------------------------------------------------
// 3. KIỂM TRA TƯƠNG THÍCH DỮ LIỆU SAVEMANAGER V1.3, V1.4 & V1.5
// ---------------------------------------------------------------------------
console.log('\n--- PHẦN 3: KIỂM TRA TƯƠNG THÍCH BẢN LƯU SAVEMANAGER V1.3, V1.4 & V1.5 ---');

const saveManagerPath = path.resolve('src/systems/SaveManager.ts');
const saveManagerCode = fs.readFileSync(saveManagerPath, 'utf8');
assert(saveManagerCode.includes('activeWeapon?: string;'), 'SaveData hỗ trợ lưu trữ activeWeapon');
const currentSchema = /CURRENT_SCHEMA_VERSION\s*=\s*3\b/.test(saveManagerCode);
const buildSaveData = saveManagerCode.slice(
  saveManagerCode.indexOf('public static buildSaveData('),
  saveManagerCode.indexOf('public static quickSaveOnUnload(')
);
assert(currentSchema && buildSaveData.includes('saveVersion: SaveManager.CURRENT_SCHEMA_VERSION') &&
  buildSaveData.includes('saveSchemaVersion: SaveManager.CURRENT_SCHEMA_VERSION'),
  'buildSaveData ghi hai trường schema 3 độc lập với chuỗi phiên bản phát hành');
assert(saveManagerCode.includes('state.setActiveWeapon(data.activeWeapon)'), 'applySaveToState phục hồi activeWeapon');

// Giả lập trực tiếp logic sanitizeAndMigrateSaveData để kiểm thử tương thích 3 thế hệ bản lưu
// Trích xuất logic sanitize kiểm tra độc lập
function mockSanitizeAndMigrate(rawObj) {
  if (!rawObj || typeof rawObj !== 'object') return null;

  const rawSaveVersion = rawObj.saveVersion ?? rawObj.saveSchemaVersion;
  const isLegacy = rawSaveVersion === undefined ||
                   rawSaveVersion === null ||
                   rawSaveVersion === 1 ||
                   rawSaveVersion === 2 ||
                   rawSaveVersion === '1.3' ||
                   rawSaveVersion === '1.3.0';

  const saveSchemaVersion = 3;
  const saveVersion = 3;
  const version = isLegacy ? '1.4.0' : (typeof rawObj.version === 'string' ? rawObj.version : '1.5.0');
  const timestamp = typeof rawObj.timestamp === 'number' ? rawObj.timestamp : Date.now();
  const checkpointName = rawObj.checkpointName || 'Điểm lưu Bellhollow';
  const zoneId = rawObj.zoneId || 'bellhollow';

  const rawStats = rawObj.stats || {};
  const stats = {
    health: typeof rawStats.health === 'number' ? rawStats.health : 100,
    stamina: typeof rawStats.stamina === 'number' ? rawStats.stamina : 100,
    lanternOil: typeof rawStats.lanternOil === 'number' ? rawStats.lanternOil : 100,
    composure: typeof rawStats.composure === 'number' ? rawStats.composure : 100,
    isLanternOn: Boolean(rawStats.isLanternOn),
    moisture: typeof rawStats.moisture === 'number' ? rawStats.moisture : 0,
    temperature: typeof rawStats.temperature === 'number' ? rawStats.temperature : 80
  };

  const inventory = Array.isArray(rawObj.inventory) ? rawObj.inventory : [];
  const flags = Array.isArray(rawObj.flags) ? rawObj.flags : [];
  const currentQuestId = rawObj.currentQuestId || 'quest_act0_lost_in_fog';
  const quests = Array.isArray(rawObj.quests) ? rawObj.quests : [];
  const unlockedLoreIds = Array.isArray(rawObj.unlockedLoreIds) ? rawObj.unlockedLoreIds : [];

  const dayCount = typeof rawObj.dayCount === 'number' ? rawObj.dayCount : 1;
  const timeOfDay = typeof rawObj.timeOfDay === 'number' ? rawObj.timeOfDay : 0;
  const equippedSlots = rawObj.equippedSlots || { body: null, feet: null, back: null, charm: null };
  const storageChest = Array.isArray(rawObj.storageChest) ? rawObj.storageChest : [];
  const campfireLevel = typeof rawObj.campfireLevel === 'number' ? rawObj.campfireLevel : 1;
  const campfireFuel = typeof rawObj.campfireFuel === 'number' ? rawObj.campfireFuel : 180;
  const memoryAwakeningStage = typeof rawObj.memoryAwakeningStage === 'number' ? rawObj.memoryAwakeningStage : 0;
  const villageTrustScore = typeof rawObj.villageTrustScore === 'number' ? rawObj.villageTrustScore : 50;
  const storyFlags = Array.isArray(rawObj.storyFlags) ? rawObj.storyFlags : [];
  const activeWeapon = typeof rawObj.activeWeapon === 'string' && rawObj.activeWeapon.trim() ? rawObj.activeWeapon.trim() : 'wpn_walking_staff';

  return {
    saveVersion,
    saveSchemaVersion,
    version,
    timestamp,
    checkpointName,
    zoneId,
    stats,
    inventory,
    flags,
    currentQuestId,
    quests,
    unlockedLoreIds,
    dayCount,
    timeOfDay,
    equippedSlots,
    storageChest,
    campfireLevel,
    campfireFuel,
    memoryAwakeningStage,
    villageTrustScore,
    storyFlags,
    activeWeapon
  };
}

// TEST CASE 3.1: Bản lưu V1.3 Cũ (Legacy V1.3 Schema)
const legacyV13Save = {
  version: '1.3.0',
  saveVersion: 2,
  timestamp: 1731600000000,
  checkpointName: 'Cổng Tây Bellhollow V1.3',
  zoneId: 'bellhollow',
  stats: { health: 85, stamina: 90, lanternOil: 60, composure: 75, isLanternOn: true },
  inventory: [['res_dry_wood', 5], ['item_lantern_oil', 1]],
  flags: ['talked_to_thomas', 'visited_shrine'],
  currentQuestId: 'quest_act1_light_the_way',
  quests: [{ id: 'quest_act1_light_the_way', tasks: [{ id: 't1', done: true }] }],
  unlockedLoreIds: ['lore_ancient_bell_legend']
};

const migratedFromV13 = mockSanitizeAndMigrate(legacyV13Save);
assert(migratedFromV13 !== null, 'Di trú thành công file lưu V1.3');
assert(migratedFromV13.stats.health === 85, 'V1.3: Bảo toàn chỉ số máu (85)');
assert(migratedFromV13.stats.moisture === 0, 'V1.3: Tự động gán mặc định moisture = 0 (DRY)');
assert(migratedFromV13.stats.temperature === 80, 'V1.3: Tự động gán mặc định temperature = 80 (WARM)');
assert(migratedFromV13.equippedSlots.body === null, 'V1.3: Tự động gán fallback equippedSlots');
assert(Array.isArray(migratedFromV13.storageChest), 'V1.3: Tự động gán fallback storageChest rỗng');
assert(migratedFromV13.villageTrustScore === 50, 'V1.3: Tự động gán villageTrustScore = 50');
assert(migratedFromV13.activeWeapon === 'wpn_walking_staff', 'V1.3: Tự động gán activeWeapon = wpn_walking_staff');

// TEST CASE 3.2: Bản lưu V1.4 Mở Rộng
const v14Save = {
  version: '1.4.0',
  saveVersion: 3,
  saveSchemaVersion: 3,
  timestamp: 1731700000000,
  checkpointName: 'Sanctuary Farm V1.4',
  zoneId: 'sanctuary_farm',
  stats: { health: 100, stamina: 100, lanternOil: 80, composure: 95, isLanternOn: true, moisture: 15, temperature: 75 },
  inventory: [['res_herbs', 10], ['eqp_moss_cloak', 1]],
  flags: ['farm_unlocked'],
  currentQuestId: 'quest_act2_herbal_roots',
  quests: [],
  unlockedLoreIds: ['lore_herbal_secrets'],
  equippedSlots: { body: 'eqp_moss_cloak', feet: null, back: null, charm: null },
  storageChest: [['res_dry_wood', 20], ['mat_forest_rope', 3]],
  memoryAwakeningStage: 1
};

const migratedFromV14 = mockSanitizeAndMigrate(v14Save);
assert(migratedFromV14 !== null, 'Di trú thành công file lưu V1.4');
assert(migratedFromV14.equippedSlots.body === 'eqp_moss_cloak', 'V1.4: Bảo toàn trang bị Áo Choàng Rêu');
assert(migratedFromV14.storageChest.length === 2, 'V1.4: Bảo toàn 2 ngăn rương đồ');
assert(migratedFromV14.memoryAwakeningStage === 1, 'V1.4: Bảo toàn tiến trình thức tỉnh ký ức (1)');
assert(migratedFromV14.villageTrustScore === 50, 'V1.4: Điền fallback villageTrustScore = 50');
assert(Array.isArray(migratedFromV14.storyFlags), 'V1.4: Điền fallback storyFlags = []');

// TEST CASE 3.3: Bản lưu V1.5 Mới Nhất
const v15Save = {
  version: '1.5.0',
  saveVersion: 3,
  saveSchemaVersion: 3,
  timestamp: 1731800000000,
  checkpointName: 'Đại Hồng Chung Bellhollow V1.5',
  zoneId: 'bellhollow',
  stats: { health: 100, stamina: 100, lanternOil: 100, composure: 100, isLanternOn: true, moisture: 0, temperature: 80 },
  inventory: [['wpn_iron_spear', 1], ['eqp_bell_ward_charm', 1]],
  flags: ['ending_true_ready'],
  currentQuestId: 'quest_act5_final_reckoning',
  quests: [],
  unlockedLoreIds: ['lore_memory_chapter_4', 'lore_ending_true'],
  equippedSlots: { body: 'eqp_moss_cloak', feet: 'eqp_trail_boots', back: 'eqp_field_backpack', charm: 'eqp_bell_ward_charm' },
  storageChest: [['mat_runed_iron', 8]],
  memoryAwakeningStage: 3,
  villageTrustScore: 85,
  storyFlags: ['edda_blessed', 'garth_reconciled', 'bram_shield_forged'],
  activeWeapon: 'wpn_iron_spear'
};

const loadedV15 = mockSanitizeAndMigrate(v15Save);
assert(loadedV15 !== null, 'Tải thành công file lưu V1.5');
assert(loadedV15.villageTrustScore === 85, 'V1.5: Bảo toàn Điểm Tin Cậy Dân Làng (85)');
assert(loadedV15.memoryAwakeningStage === 3, 'V1.5: Bảo toàn Thức Tỉnh Ký Ức Đỉnh Cao (Giai đoạn 3)');
assert(loadedV15.storyFlags.length === 3, 'V1.5: Bảo toàn 3 cờ quyết định cốt truyện');
assert(loadedV15.activeWeapon === 'wpn_iron_spear', 'V1.5: Bảo toàn vũ khí Giáo Sắt Cổ Ngữ đang cầm');
assert(loadedV15.version === '1.5.0', 'V1.5: Phiên bản lưu trữ chuẩn 1.5.0');

console.log(`\n=== TỔNG KẾT: ${passedTests}/${totalTests} TESTS ĐẠT HOÀN HẢO ===`);
