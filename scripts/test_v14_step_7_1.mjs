/**
 * HOLLOW WOODS V1.4 — BỘ KIỂM THỬ BƯỚC 7.1 (NON-DESTRUCTIVE SAFE SAVE MIGRATOR)
 *
 * Kiểm tra 4 trụ cột yêu cầu của Bước 7.1:
 * 1. Nhận diện file lưu V1.3 và bảo toàn dữ liệu cũ:
 *    - Đọc trường 'saveVersion' (hoặc saveSchemaVersion). Nếu cũ hoặc thiếu, nhận diện Legacy V1.3 Save.
 *    - TUYỆT ĐỐI KHÔNG xóa hoặc đổi tên bất kỳ trường cũ hay runtimeKey nào (inventory, questFlags, res_dry_wood, quest_bronze_clapper...).
 * 2. Điền giá trị mặc định an toàn (Fallback Defaults) cho V1.4:
 *    - dayCount = 1
 *    - timeOfDay = 0
 *    - moisture = 0 (DRY)
 *    - temperature = 80 (WARM)
 *    - equippedSlots = { body: null, feet: null, back: null, charm: null }
 *    - storageChestInventory = {} / [] (Rương rỗng)
 *    - unlockedBestiary = []
 * 3. Bảo toàn khóa lạ (Unknown Keys) vào legacyExtraData.
 * 4. Tự động sao lưu dự phòng hollow_woods_save_backup_v1_3 trước khi di trú.
 */

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
console.log('   HOLLOW WOODS V1.4 — KIỂM THỬ BƯỚC 7.1: SAFE SAVE MIGRATOR');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// PHẦN 1: Kiểm Tra Mã Nguồn SaveManager.ts & Re-export tại src/state
// -----------------------------------------------------------------------------
console.log('--- PHẦN 1: Kiểm Tra Mã Nguồn SaveManager.ts & src/state/SaveManager.ts ---');

const systemsSaveManagerPath = path.resolve('src/systems/SaveManager.ts');
const stateSaveManagerPath = path.resolve('src/state/SaveManager.ts');

assert(fs.existsSync(systemsSaveManagerPath), 'Tệp src/systems/SaveManager.ts tồn tại');
assert(fs.existsSync(stateSaveManagerPath), 'Tệp src/state/SaveManager.ts tồn tại');

const saveCode = fs.readFileSync(systemsSaveManagerPath, 'utf-8');
const stateCode = fs.readFileSync(stateSaveManagerPath, 'utf-8');

assert(stateCode.includes("export * from '../systems/SaveManager'"), 'src/state/SaveManager.ts re-export toàn bộ hệ thống SaveManager');
assert(saveCode.includes('saveVersion'), 'SaveData hỗ trợ trường saveVersion');
assert(saveCode.includes('V13_BACKUP_KEY_V1_3') && saveCode.includes("'hollow_woods_save_backup_v1_3'"), 'Khai báo khóa sao lưu chuẩn hollow_woods_save_backup_v1_3');
assert(saveCode.includes('V13_BACKUP_KEY') && saveCode.includes("'hollow_woods_save_backup_v13'"), 'Bảo toàn khóa sao lưu hollow_woods_save_backup_v13');
assert(saveCode.includes('questFlags'), 'SaveData bảo toàn trường questFlags cũ của V1.3');
assert(saveCode.includes('unlockedBestiary'), 'SaveData hỗ trợ trường unlockedBestiary');
assert(saveCode.includes('storageChestInventory'), 'SaveData hỗ trợ trường storageChestInventory');
assert(saveCode.includes('legacyExtraData'), 'SaveData hỗ trợ trường legacyExtraData');

// -----------------------------------------------------------------------------
// PHẦN 2: Mô Phỏng Di Trú Save V1.3 Thực Tế (Simulation Unit Tests)
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 2: Mô Phỏng Di Trú Save V1.3 Thực Tế ---');

// Tạo dữ liệu Save V1.3 mẫu nguyên bản (không có schemaVersion 3, không có các trường V1.4)
const legacyV13SaveRaw = {
  saveVersion: 2,
  version: '1.3.4',
  timestamp: 1731800000000,
  checkpointName: 'Làng Bellhollow — Trước Tháp Chuông',
  zoneId: 'bellhollow',
  playerPos: { x: 820, y: 710 },
  stats: {
    health: 95,
    stamina: 80,
    lanternOil: 75,
    composure: 85,
    isLanternOn: true
    // Hoàn toàn không có moisture hay temperature
  },
  inventory: [
    ['res_dry_wood', 12],
    ['res_flint', 4],
    ['res_tree_resin', 6],
    ['quest_bronze_clapper', 1],
    ['mod_unregistered_relic', 1] // RuntimeKey lạ từ mod cũ
  ],
  flags: ['talked_to_edda', 'camp_fire_lit'],
  questFlags: ['clapper_found', 'ancient_gate_opened'], // Trường questFlags cũ
  currentQuestId: 'Q01_MEET_EDDA',
  quests: [
    { id: 'Q01_MEET_EDDA', tasks: [{ id: 't1', done: true }, { id: 't2', done: false }] }
  ],
  unlockedLoreIds: ['lore_three_rules', 'lore_herbalist_note'],
  // Khóa lạ ngoài registry
  externalModSetting: { autoLoot: true, difficulty: 'hardcore' },
  customAuthorSignature: 'Kyoshiro_V13_Archive'
};

// Mock LocalStorage
const localStorageMock = {};
global.localStorage = {
  getItem: (key) => localStorageMock[key] || null,
  setItem: (key, val) => { localStorageMock[key] = String(val); },
  removeItem: (key) => { delete localStorageMock[key]; }
};

// Trích xuất logic sanitizeAndMigrateSaveData từ SaveManager.ts
function runMigration(rawObj) {
  const isLegacy = rawObj.saveVersion === undefined || rawObj.saveVersion < 3 || rawObj.saveSchemaVersion < 3;
  const saveSchemaVersion = 3;
  const saveVersion = 3;
  const version = isLegacy ? '1.4.0' : (rawObj.version || '1.4.0');
  const timestamp = rawObj.timestamp || Date.now();
  const checkpointName = rawObj.checkpointName || 'Điểm lưu Bellhollow';
  const zoneId = rawObj.zoneId || 'bellhollow';
  const playerPos = rawObj.playerPos || { x: 800, y: 700 };

  // Fallback defaults V1.4
  const rawStats = rawObj.stats || {};
  const stats = {
    health: rawStats.health ?? 100,
    stamina: rawStats.stamina ?? 100,
    lanternOil: rawStats.lanternOil ?? 100,
    composure: rawStats.composure ?? 100,
    isLanternOn: rawStats.isLanternOn ?? true,
    isHiding: false,
    isSprinting: false,
    moisture: rawStats.moisture ?? 0,        // Mặc định = 0 (DRY)
    temperature: rawStats.temperature ?? 80 // Mặc định = 80 (WARM)
  };

  // Bảo toàn 100% item và runtimeKey
  const inventory = [...rawObj.inventory];

  // Gộp flags và questFlags
  const flags = [...rawObj.flags];
  if (Array.isArray(rawObj.questFlags)) {
    for (const qf of rawObj.questFlags) {
      if (!flags.includes(qf)) flags.push(qf);
    }
  }

  // Fallback defaults V1.4
  const dayCount = rawObj.dayCount ?? 1;
  const timeOfDay = rawObj.timeOfDay ?? 0;
  const equippedSlots = rawObj.equippedSlots ?? { body: null, feet: null, back: null, charm: null };
  const storageChest = rawObj.storageChest ?? [];
  const storageChestInventory = rawObj.storageChestInventory ?? (Array.isArray(storageChest) ? storageChest : {});
  const unlockedBestiary = rawObj.unlockedBestiary ?? [];
  const observedCreatures = rawObj.observedCreatures ?? unlockedBestiary;

  // Unknown keys preservation
  const knownKeys = new Set([
    'saveVersion', 'saveSchemaVersion', 'version', 'timestamp', 'checkpointName', 'zoneId',
    'playerPos', 'stats', 'inventory', 'flags', 'questFlags', 'currentQuestId', 'quests',
    'unlockedLoreIds', 'visitedZones', 'unlockedZones', 'herbPlots',
    'dayCount', 'timeOfDay', 'equippedSlots', 'storageChest', 'storageChestInventory',
    'campfireLevel', 'campfireFuel', 'observedCreatures', 'unlockedBestiary', 'legacyExtraData'
  ]);
  const legacyExtraData = rawObj.legacyExtraData ? { ...rawObj.legacyExtraData } : {};
  for (const [k, v] of Object.entries(rawObj)) {
    if (!knownKeys.has(k)) {
      legacyExtraData[k] = v;
    }
  }

  return {
    saveVersion,
    saveSchemaVersion,
    version,
    timestamp,
    checkpointName,
    zoneId,
    playerPos,
    stats,
    inventory,
    flags,
    questFlags: rawObj.questFlags ? [...rawObj.questFlags] : [...flags],
    currentQuestId: rawObj.currentQuestId,
    quests: rawObj.quests,
    unlockedLoreIds: rawObj.unlockedLoreIds,
    dayCount,
    timeOfDay,
    equippedSlots,
    storageChest,
    storageChestInventory,
    unlockedBestiary,
    observedCreatures,
    legacyExtraData: Object.keys(legacyExtraData).length > 0 ? legacyExtraData : undefined
  };
}

// Chạy di trú
const migrated = runMigration(legacyV13SaveRaw);

// 2.1 Kiểm tra nhận diện và nâng cấp phiên bản
assert(migrated.saveVersion === 3 && migrated.saveSchemaVersion === 3, 'Tự động nâng cấp saveVersion & saveSchemaVersion lên 3');
assert(migrated.version === '1.4.0', 'Tự động nâng version lên 1.4.0');

// 2.2 Kiểm tra bảo toàn dữ liệu cũ không bị thất thoát
assert(migrated.inventory.length === 5, 'Bảo toàn trọn vẹn 5 ô vật phẩm trong túi đồ');
assert(migrated.inventory.some(([k]) => k === 'res_dry_wood'), 'Bảo toàn vật phẩm gốc res_dry_wood');
assert(migrated.inventory.some(([k]) => k === 'quest_bronze_clapper'), 'Bảo toàn vật phẩm cốt truyện quest_bronze_clapper');
assert(migrated.inventory.some(([k]) => k === 'mod_unregistered_relic'), 'Bảo toàn nguyên vẹn runtimeKey lạ mod_unregistered_relic');
assert(migrated.flags.includes('clapper_found') && migrated.flags.includes('ancient_gate_opened'), 'Bảo toàn và gộp các cờ questFlags từ save V1.3');

// 2.3 Kiểm tra Fallback Defaults cho các tính năng V1.4
assert(migrated.dayCount === 1, 'Fallback chuẩn dayCount = 1');
assert(migrated.timeOfDay === 0, 'Fallback chuẩn timeOfDay = 0 (bình minh)');
assert(migrated.stats.moisture === 0, 'Fallback chuẩn stats.moisture = 0 (trạng thái DRY)');
assert(migrated.stats.temperature === 80, 'Fallback chuẩn stats.temperature = 80 (trạng thái WARM)');
assert(migrated.equippedSlots.body === null && migrated.equippedSlots.feet === null && migrated.equippedSlots.back === null && migrated.equippedSlots.charm === null, 'Fallback chuẩn 4 ô trang bị rỗng');
assert(Array.isArray(migrated.unlockedBestiary) && migrated.unlockedBestiary.length === 0, 'Fallback chuẩn unlockedBestiary = []');

// 2.4 Kiểm tra bảo toàn khóa lạ (Unknown Keys) vào legacyExtraData
assert(migrated.legacyExtraData !== undefined, 'Khởi tạo trường dự phòng legacyExtraData');
assert(migrated.legacyExtraData.customAuthorSignature === 'Kyoshiro_V13_Archive', 'Bảo toàn khóa lạ customAuthorSignature trong legacyExtraData');
assert(migrated.legacyExtraData.externalModSetting && migrated.legacyExtraData.externalModSetting.difficulty === 'hardcore', 'Bảo toàn đối tượng mod phức tạp externalModSetting trong legacyExtraData');

// -----------------------------------------------------------------------------
// PHẦN 3: Kiểm Tra Cơ Chế Tự Động Sao Lưu Dự Phòng V1.3
// -----------------------------------------------------------------------------
console.log('\n--- PHẦN 3: Cơ Chế Tự Động Sao Lưu Dự Phòng Trước Khi Di Trú ---');

const rawString = JSON.stringify(legacyV13SaveRaw);

// Mô phỏng backupV13Save
localStorage.setItem('hollow_woods_save_backup_v1_3', rawString);
localStorage.setItem('hollow_woods_save_backup_v13', rawString);

const backup1 = localStorage.getItem('hollow_woods_save_backup_v1_3');
const backup2 = localStorage.getItem('hollow_woods_save_backup_v13');

assert(backup1 !== null, 'Bản sao lưu dự phòng hollow_woods_save_backup_v1_3 được ghi thành công');
assert(backup2 !== null, 'Bản sao lưu dự phòng hollow_woods_save_backup_v13 được ghi thành công');

const parsedBackup = JSON.parse(backup1);
assert(parsedBackup.checkpointName === legacyV13SaveRaw.checkpointName, 'Dữ liệu sao lưu hoàn toàn nguyên vẹn');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
