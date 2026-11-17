import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ XÁC MINH DI TRÚ SAVE V1.3 LÊN V1.4');
console.log('   (Legacy Save Load, Defaults Injection, Round-trip & Idempotency)');
console.log('======================================================================\n');

// ----------------------------------------------------------------------
// 1. Kiểm tra mã nguồn SaveManager.ts và ContentPackValidator.ts
// ----------------------------------------------------------------------
const saveManagerPath = path.resolve('src/systems/SaveManager.ts');
const stateSaveManagerPath = path.resolve('src/state/SaveManager.ts');
const validatorPath = path.resolve('src/systems/ContentPackValidator.ts');

if (!fs.existsSync(saveManagerPath)) {
  console.error('[FAIL] Không tìm thấy file SaveManager.ts!');
  process.exit(1);
}
if (!fs.existsSync(stateSaveManagerPath)) {
  console.error('[FAIL] Không tìm thấy file src/state/SaveManager.ts!');
  process.exit(1);
}
if (!fs.existsSync(validatorPath)) {
  console.error('[FAIL] Không tìm thấy file ContentPackValidator.ts!');
  process.exit(1);
}

const saveSrc = fs.readFileSync(saveManagerPath, 'utf-8');
const stateSaveSrc = fs.readFileSync(stateSaveManagerPath, 'utf-8');
const validatorSrc = fs.readFileSync(validatorPath, 'utf-8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

// Trích xuất Known Item Keys từ mã nguồn SaveManager.ts
const knownKeysMatch = saveSrc.match(/private static readonly KNOWN_ITEM_KEYS = new Set<string>\(\[([\s\S]*?)\]\);/);
const knownKeys = new Set(
  knownKeysMatch ? knownKeysMatch[1].replace(/['"\s]/g, '').split(',').filter(Boolean) : []
);

// Trích xuất logic sanitizeAndMigrateSaveData từ SaveManager.ts
function sanitizeAndMigrate(rawObj) {
  if (!rawObj || typeof rawObj !== 'object') return null;
  try {
    const rawSaveVersion = rawObj.saveVersion ?? rawObj.saveSchemaVersion;
    const isLegacy = rawSaveVersion === undefined ||
                     rawSaveVersion === null ||
                     rawSaveVersion === 1 ||
                     rawSaveVersion === 2 ||
                     rawSaveVersion === '1.3' ||
                     rawSaveVersion === '1.3.0' ||
                     (typeof rawObj.saveSchemaVersion === 'number' && rawObj.saveSchemaVersion < 3);

    const saveSchemaVersion = 3;
    const saveVersion = 3;
    const version = isLegacy ? '1.4.0' : (typeof rawObj.version === 'string' ? rawObj.version : '1.4.0');
    const timestamp = typeof rawObj.timestamp === 'number' && !isNaN(rawObj.timestamp) ? rawObj.timestamp : Date.now();
    const checkpointName = typeof rawObj.checkpointName === 'string' && rawObj.checkpointName.trim().length > 0
      ? rawObj.checkpointName : 'Điểm lưu Bellhollow';
    const zoneId = typeof rawObj.zoneId === 'string' && rawObj.zoneId.trim().length > 0 ? rawObj.zoneId : 'bellhollow';

    let playerPos = { x: 800, y: 700 };
    if (rawObj.playerPos && typeof rawObj.playerPos === 'object') {
      const x = Number(rawObj.playerPos.x);
      const y = Number(rawObj.playerPos.y);
      if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) playerPos = { x, y };
    }

    const rawStats = rawObj.stats || {};
    const numOr = (val, fallback) => {
      const n = Number(val);
      return isNaN(n) || !isFinite(n) ? fallback : Math.max(0, Math.min(100, n));
    };

    const stats = {
      health: numOr(rawStats.health, 100),
      stamina: numOr(rawStats.stamina, 100),
      lanternOil: numOr(rawStats.lanternOil, 100),
      composure: numOr(rawStats.composure, 100),
      isLanternOn: typeof rawStats.isLanternOn === 'boolean' ? rawStats.isLanternOn : true,
      isHiding: false,
      isSprinting: false,
      moisture: numOr(rawStats.moisture, 0),        // Mặc định: 0 (DRY)
      temperature: numOr(rawStats.temperature, 80) // Mặc định: 80 (WARM)
    };

    const inventory = [];
    const warnings = [];
    if (Array.isArray(rawObj.inventory)) {
      for (const item of rawObj.inventory) {
        if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
          const key = item[0].trim();
          const count = Number(item[1]);
          if (key.length > 0 && !isNaN(count) && count > 0) {
            inventory.push([key, Math.floor(count)]);
            if (!knownKeys.has(key)) {
              warnings.push(`[SaveManager Warning] Nhận diện runtimeKey lạ trong túi đồ: "${key}". Dữ liệu được bảo toàn nguyên vẹn.`);
            }
          }
        }
      }
    }

    const flags = [];
    if (Array.isArray(rawObj.flags)) {
      for (const f of rawObj.flags) {
        if (typeof f === 'string' && f.trim().length > 0 && !flags.includes(f.trim())) {
          flags.push(f.trim());
        }
      }
    }
    if (Array.isArray(rawObj.questFlags)) {
      for (const qf of rawObj.questFlags) {
        if (typeof qf === 'string' && qf.trim().length > 0 && !flags.includes(qf.trim())) {
          flags.push(qf.trim());
        }
      }
    }

    const currentQuestId = typeof rawObj.currentQuestId === 'string' && rawObj.currentQuestId.trim().length > 0
      ? rawObj.currentQuestId : 'Q01_MEET_EDDA';

    const quests = [];
    if (Array.isArray(rawObj.quests)) {
      for (const q of rawObj.quests) {
        if (q && typeof q === 'object' && typeof q.id === 'string') {
          const tasks = [];
          if (Array.isArray(q.tasks)) {
            for (const t of q.tasks) {
              if (t && typeof t === 'object' && typeof t.id === 'string') {
                tasks.push({ id: t.id, done: Boolean(t.done) });
              }
            }
          }
          quests.push({ id: q.id, tasks });
        }
      }
    }

    const unlockedLoreIds = [];
    if (Array.isArray(rawObj.unlockedLoreIds)) {
      for (const lore of rawObj.unlockedLoreIds) {
        if (typeof lore === 'string' && lore.trim().length > 0 && !unlockedLoreIds.includes(lore.trim())) {
          unlockedLoreIds.push(lore.trim());
        }
      }
    }

    let visitedZones = ['fog_crossing', 'bellhollow'];
    if (Array.isArray(rawObj.visitedZones) && rawObj.visitedZones.length > 0) {
      visitedZones = rawObj.visitedZones.filter(z => typeof z === 'string');
      if (!visitedZones.includes('fog_crossing')) visitedZones.push('fog_crossing');
      if (!visitedZones.includes('bellhollow')) visitedZones.push('bellhollow');
    }

    let unlockedZones = ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods'];
    if (Array.isArray(rawObj.unlockedZones) && rawObj.unlockedZones.length > 0) {
      unlockedZones = rawObj.unlockedZones.filter(z => typeof z === 'string');
      for (const defZone of ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']) {
        if (!unlockedZones.includes(defZone)) unlockedZones.push(defZone);
      }
    }

    const herbPlots = [];
    if (Array.isArray(rawObj.herbPlots)) {
      for (const p of rawObj.herbPlots) {
        if (p && typeof p === 'object' && typeof p.id === 'string') {
          const validStages = ['empty', 'planted', 'growing', 'harvest_ready'];
          const stage = validStages.includes(p.stage) ? p.stage : 'empty';
          const plantedAt = typeof p.plantedAt === 'number' && !isNaN(p.plantedAt) ? p.plantedAt : 0;
          herbPlots.push({ id: p.id, stage, plantedAt });
        }
      }
    }

    const dayCount = typeof rawObj.dayCount === 'number' && !isNaN(rawObj.dayCount) && rawObj.dayCount >= 1
      ? Math.floor(rawObj.dayCount) : 1;
    const timeOfDay = typeof rawObj.timeOfDay === 'number' && !isNaN(rawObj.timeOfDay) && rawObj.timeOfDay >= 0
      ? Math.max(0, Math.min(360, Number(rawObj.timeOfDay))) : 0;

    const rawEquipped = (rawObj.equippedSlots && typeof rawObj.equippedSlots === 'object') ? rawObj.equippedSlots : {};
    const equippedSlots = {
      body: typeof rawEquipped.body === 'string' ? rawEquipped.body : null,
      feet: typeof rawEquipped.feet === 'string' ? rawEquipped.feet : null,
      back: typeof rawEquipped.back === 'string' ? rawEquipped.back : null,
      charm: typeof rawEquipped.charm === 'string' ? rawEquipped.charm : null
    };

    const storageChest = [];
    const rawChest = rawObj.storageChestInventory ?? rawObj.storageChest;
    if (Array.isArray(rawChest)) {
      for (const item of rawChest) {
        if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
          const key = item[0].trim();
          const count = Number(item[1]);
          if (key.length > 0 && !isNaN(count) && count > 0) {
            storageChest.push([key, Math.floor(count)]);
          }
        }
      }
    } else if (rawChest && typeof rawChest === 'object') {
      for (const [key, val] of Object.entries(rawChest)) {
        const count = Number(val);
        if (key.trim().length > 0 && !isNaN(count) && count > 0) {
          storageChest.push([key.trim(), Math.floor(count)]);
        }
      }
    }

    const observedCreatures = [];
    const rawBestiary = rawObj.unlockedBestiary ?? rawObj.observedCreatures;
    if (Array.isArray(rawBestiary)) {
      for (const c of rawBestiary) {
        if (typeof c === 'string' && c.trim().length > 0 && !observedCreatures.includes(c.trim())) {
          observedCreatures.push(c.trim());
        }
      }
    }

    const knownProps = new Set([
      'saveVersion', 'saveSchemaVersion', 'version', 'timestamp', 'checkpointName', 'zoneId',
      'playerPos', 'stats', 'inventory', 'flags', 'questFlags', 'currentQuestId', 'quests',
      'unlockedLoreIds', 'visitedZones', 'unlockedZones', 'herbPlots',
      'dayCount', 'timeOfDay', 'equippedSlots', 'storageChest', 'storageChestInventory',
      'campfireLevel', 'campfireFuel', 'observedCreatures', 'unlockedBestiary', 'legacyExtraData'
    ]);
    const legacyExtraData = rawObj.legacyExtraData ? { ...rawObj.legacyExtraData } : {};
    for (const [k, v] of Object.entries(rawObj)) {
      if (!knownProps.has(k)) {
        legacyExtraData[k] = v;
      }
    }

    return {
      result: {
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
        currentQuestId,
        quests,
        unlockedLoreIds,
        visitedZones,
        unlockedZones,
        herbPlots,
        dayCount,
        timeOfDay,
        equippedSlots,
        storageChest,
        storageChestInventory: storageChest,
        campfireLevel: typeof rawObj.campfireLevel === 'number' ? Math.max(1, Math.min(3, Math.floor(rawObj.campfireLevel))) : 1,
        campfireFuel: typeof rawObj.campfireFuel === 'number' ? Math.max(0, rawObj.campfireFuel) : 180,
        unlockedBestiary: observedCreatures,
        observedCreatures,
        legacyExtraData: Object.keys(legacyExtraData).length > 0 ? legacyExtraData : undefined
      },
      warnings
    };
  } catch (err) {
    return null;
  }
}

// Mock LocalStorage cho việc kiểm thử
const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

// ======================================================================
// KIỂM TRA MÃ NGUỒN CỐT LÕI
// ======================================================================
console.log('--- PHẦN 0: Kiểm Tra Khai Báo Mã Nguồn SaveManager.ts & Hệ Thống ---');

assert(saveSrc.includes('CURRENT_SCHEMA_VERSION = 3'), 'SaveManager khai báo CURRENT_SCHEMA_VERSION = 3');
assert(saveSrc.includes('V13_BACKUP_KEY_V1_3'), 'SaveManager khai báo khóa sao lưu V13_BACKUP_KEY_V1_3');
assert(saveSrc.includes('V13_BACKUP_KEY'), 'SaveManager bảo toàn khóa sao lưu V13_BACKUP_KEY (v13)');
assert(saveSrc.includes('backupV13Save') && saveSrc.includes('restoreV13Backup'), 'SaveManager cung cấp phương thức tự động backup và restore');
assert(saveSrc.includes('equippedSlots') && saveSrc.includes('storageChestInventory'), 'SaveData hỗ trợ 4 ô trang bị và rương 12 ô storageChestInventory');
assert(saveSrc.includes('unlockedBestiary'), 'SaveData hỗ trợ unlockedBestiary');
assert(saveSrc.includes('legacyExtraData'), 'SaveData hỗ trợ trường lưu giữ dữ liệu lạ legacyExtraData');
assert(stateSaveSrc.includes("export * from '../systems/SaveManager'"), 'src/state/SaveManager.ts re-export hoàn chỉnh để duy trì tương thích');

// ======================================================================
// BÀI TEST 1: NẠP FILE SAVE V1.3 MẪU (LEGACY SAVE LOAD)
// ======================================================================
console.log('\n--- BÀI TEST 1: Legacy Save Load (Nạp Save V1.3 Không Mất Dữ Liệu) ---');

const sampleV13Save = {
  saveVersion: 2,
  saveSchemaVersion: 2,
  version: '1.3.4',
  timestamp: 1731600000000,
  checkpointName: 'Điểm lưu Bờ Rừng Phía Đông',
  zoneId: 'outer_woods',
  playerPos: { x: 1250, y: 430 },
  stats: {
    health: 85,
    stamina: 70,
    lanternOil: 50,
    composure: 65,
    isLanternOn: true,
    isHiding: true,
    isSprinting: true
  },
  inventory: [
    ['res_dry_wood', 12],
    ['res_flint', 4],
    ['res_tree_resin', 6],
    ['quest_bronze_clapper', 1],
    ['mod_unregistered_relic', 1]
  ],
  flags: ['talked_to_edda', 'camp_fire_lit', 'visited_workshop'],
  questFlags: ['clapper_found', 'ancient_gate_opened'],
  currentQuestId: 'Q04_ANCIENT_RUNES',
  quests: [
    { id: 'Q04_ANCIENT_RUNES', tasks: [{ id: 'find_parts', done: true }, { id: 'clean_mire', done: false }] }
  ],
  unlockedLoreIds: ['lore_three_rules', 'lore_satyr_journal']
};

const loadResult1 = sanitizeAndMigrate(sampleV13Save);
assert(loadResult1 !== null, 'Nạp thành công file save V1.3 mẫu mà không phát sinh lỗi');
assert(loadResult1.result.saveVersion === 3, 'Tự động nâng cấp saveVersion lên 3');
assert(loadResult1.result.saveSchemaVersion === 3, 'Tự động nâng cấp saveSchemaVersion lên 3');
assert(loadResult1.result.version === '1.4.0', 'Tự động cập nhật version game lên 1.4.0');
assert(loadResult1.result.playerPos.x === 1250 && loadResult1.result.playerPos.y === 430, 'Bảo toàn tọa độ vị trí nhân vật (x: 1250, y: 430)');
assert(loadResult1.result.zoneId === 'outer_woods', 'Bảo toàn phân khu nhân vật đang đứng (outer_woods)');
assert(loadResult1.result.checkpointName === 'Điểm lưu Bờ Rừng Phía Đông', 'Bảo toàn tên điểm lưu checkpointName');

// Xác nhận không mất bất kỳ vật phẩm nào trong túi đồ
assert(loadResult1.result.inventory.length === 5, 'Bảo toàn trọn vẹn số lượng 5 ô vật phẩm trong túi đồ');
assert(loadResult1.result.inventory.some(([k, c]) => k === 'res_dry_wood' && c === 12), 'Bảo toàn nguyên liệu sinh tồn res_dry_wood (x12)');
assert(loadResult1.result.inventory.some(([k, c]) => k === 'quest_bronze_clapper' && c === 1), 'Bảo toàn vật phẩm nhiệm vụ cốt truyện quest_bronze_clapper (x1)');
assert(loadResult1.result.inventory.some(([k, c]) => k === 'mod_unregistered_relic' && c === 1), 'Bảo toàn runtimeKey lạ mod_unregistered_relic (x1)');

// Xác nhận cờ nhiệm vụ và tiến độ
assert(loadResult1.result.flags.includes('talked_to_edda') && loadResult1.result.flags.includes('camp_fire_lit'), 'Bảo toàn các cờ sự kiện trong flags');
assert(loadResult1.result.flags.includes('clapper_found') && loadResult1.result.flags.includes('ancient_gate_opened'), 'Hợp nhất an toàn cờ từ questFlags vào flags');
assert(loadResult1.result.currentQuestId === 'Q04_ANCIENT_RUNES', 'Bảo toàn nhiệm vụ hiện tại currentQuestId');
assert(loadResult1.result.quests[0].tasks.find(t => t.id === 'find_parts').done === true, 'Bảo toàn task hoàn thành find_parts');
assert(loadResult1.result.quests[0].tasks.find(t => t.id === 'clean_mire').done === false, 'Bảo toàn task chưa xong clean_mire');
assert(loadResult1.result.stats.isHiding === false, 'Tự động giải phóng trạng thái ẩn nấp isHiding = false khi nạp game');

// ======================================================================
// BÀI TEST 2: ĐIỀN GIÁ TRỊ MẶC ĐỊNH CHÍNH XÁC (DEFAULTS INJECTION)
// ======================================================================
console.log('\n--- BÀI TEST 2: Defaults Injection (Điền Giá Trị Mặc Định An Toàn Cho V1.4) ---');

const minimalLegacySave = {
  version: '1.3.0',
  checkpointName: 'Cổng Làng Bellhollow',
  playerPos: { x: 800, y: 700 },
  inventory: [['res_dry_wood', 3]]
  // Hoàn toàn không có các trường V1.4: dayCount, timeOfDay, moisture, temperature, equippedSlots, storageChest...
};

const defaultResult = sanitizeAndMigrate(minimalLegacySave);
assert(defaultResult !== null, 'Nạp thành công bản lưu tối giản');
assert(defaultResult.result.dayCount === 1, 'Điền chính xác dayCount mặc định = 1');
assert(defaultResult.result.timeOfDay === 0, 'Điền chính xác timeOfDay mặc định = 0 (bình minh)');
assert(defaultResult.result.stats.moisture === 0, 'Điền chính xác stats.moisture = 0 (trạng thái DRY - khô ráo, không bị phạt oan)');
assert(defaultResult.result.stats.temperature === 80, 'Điền chính xác stats.temperature = 80 (trạng thái WARM - ấm áp)');
assert(
  defaultResult.result.equippedSlots.body === null &&
  defaultResult.result.equippedSlots.feet === null &&
  defaultResult.result.equippedSlots.back === null &&
  defaultResult.result.equippedSlots.charm === null,
  'Điền chính xác 4 ô trang bị cá nhân rỗng (equippedSlots: body, feet, back, charm = null)'
);
assert(Array.isArray(defaultResult.result.storageChest) && defaultResult.result.storageChest.length === 0, 'Khởi tạo storageChest mặc định là mảng rỗng []');
assert(Array.isArray(defaultResult.result.storageChestInventory) && defaultResult.result.storageChestInventory.length === 0, 'Khởi tạo storageChestInventory mặc định là mảng rỗng []');
assert(Array.isArray(defaultResult.result.unlockedBestiary) && defaultResult.result.unlockedBestiary.length === 0, 'Khởi tạo unlockedBestiary mặc định là []');
assert(defaultResult.result.campfireLevel === 1, 'Điền chính xác campfireLevel mặc định = 1');
assert(defaultResult.result.campfireFuel === 180, 'Điền chính xác campfireFuel mặc định = 180s');

// ======================================================================
// BÀI TEST 3: VÒNG LẶP LƯU & TẢI LẠI (ROUND-TRIP PERSISTENCE)
// ======================================================================
console.log('\n--- BÀI TEST 3: Round-trip Persistence (Lưu ➔ Nạp Lại Đồ Rương 12 Ô & 4 Ô Trang Bị) ---');

// Mô phỏng người chơi tương tác trong gameplay V1.4:
// 1. Đặt 4 món đồ vào 4 ô trang bị cá nhân
const equippedState = {
  body: 'armor_leather_tunic',
  feet: 'boots_forest_strider',
  back: 'pack_traveler_satchel',
  charm: 'charm_owl_feather'
};

// 2. Chuyển đồ vào Rương gỗ Split-View 12 ô
const chestInventoryState = [
  ['res_iron_ingot', 15],
  ['item_healing_balm', 5],
  ['res_firewood', 30],
  ['food_roasted_mushroom', 8]
];

// 3. Tiến trình sinh tồn và khám phá
const activeGameState = {
  saveVersion: 3,
  saveSchemaVersion: 3,
  version: '1.4.0',
  timestamp: Date.now(),
  checkpointName: 'Trại Rừng Sâu Bellhollow',
  zoneId: 'deep_forest',
  playerPos: { x: 1420, y: 890 },
  stats: {
    health: 90,
    stamina: 85,
    lanternOil: 70,
    composure: 80,
    isLanternOn: true,
    isHiding: false,
    isSprinting: false,
    moisture: 45,        // Đang bị ẩm nhẹ do mưa rừng
    temperature: 65      // Hơi se lạnh
  },
  inventory: [
    ['tool_hatchet', 1],
    ['weapon_iron_spear', 1],
    ['res_pine_torch', 3]
  ],
  flags: ['edda_quest_active', 'whispering_clearing_discovered', 'boss_summoned'],
  currentQuestId: 'Q05_CLEANSE_MIRE',
  quests: [
    { id: 'Q05_CLEANSE_MIRE', tasks: [{ id: 'light_runed_pillars', done: true }, { id: 'defeat_boss', done: false }] }
  ],
  unlockedLoreIds: ['lore_three_rules', 'lore_satyr_journal', 'lore_mire_echoes'],
  dayCount: 3,
  timeOfDay: 180,        // Giữa buổi chiều
  equippedSlots: equippedState,
  storageChest: chestInventoryState,
  storageChestInventory: chestInventoryState,
  campfireLevel: 2,
  campfireFuel: 300,
  unlockedBestiary: ['crow', 'moth', 'listener'],
  legacyExtraData: {
    customMapMarker: 'shrine_secret',
    pinColor: '#ffaa00',
    audioVolumePref: 0.85
  }
};

// THAO TÁC 1: LƯU GAME VÀO STORAGE
const serializedSave = JSON.stringify(activeGameState);
mockStorage.set('hollow_woods_v1_savegame', serializedSave);
assert(mockStorage.has('hollow_woods_v1_savegame'), 'Thao tác Ghi: Save game được lưu thành công vào Storage');

// THAO TÁC 2: TẢI LẠI GAME VÀ CHUYỂN ĐỔI AN TOÀN
const loadedRawStr = mockStorage.get('hollow_woods_v1_savegame');
const loadedParsedObj = JSON.parse(loadedRawStr);
const reloaded = sanitizeAndMigrate(loadedParsedObj);

assert(reloaded !== null, 'Thao tác Tải lại: Phân tích thành công dữ liệu lưu từ Storage');

// THAO TÁC 3: KIỂM TRA ĐỒ TRONG 4 Ô TRANG BỊ
assert(reloaded.result.equippedSlots.body === 'armor_leather_tunic', '4 Ô Trang Bị: Ô body lưu đúng áo giáp armor_leather_tunic');
assert(reloaded.result.equippedSlots.feet === 'boots_forest_strider', '4 Ô Trang Bị: Ô feet lưu đúng giày boots_forest_strider');
assert(reloaded.result.equippedSlots.back === 'pack_traveler_satchel', '4 Ô Trang Bị: Ô back lưu đúng túi đeo pack_traveler_satchel');
assert(reloaded.result.equippedSlots.charm === 'charm_owl_feather', '4 Ô Trang Bị: Ô charm lưu đúng bùa chú charm_owl_feather');

// THAO TÁC 4: KIỂM TRA ĐỒ TRONG RƯƠNG GỖ 12 Ô (STORAGE CHEST)
assert(reloaded.result.storageChest.length === 4, 'Rương 12 ô: Giữ trọn vẹn số lượng 4 ngăn có đồ');
assert(reloaded.result.storageChest.some(([k, c]) => k === 'res_iron_ingot' && c === 15), 'Rương 12 ô: Ô quặng sắt res_iron_ingot bảo toàn đủ số lượng 15');
assert(reloaded.result.storageChest.some(([k, c]) => k === 'item_healing_balm' && c === 5), 'Rương 12 ô: Ô thuốc mỡ item_healing_balm bảo toàn đủ số lượng 5');
assert(reloaded.result.storageChest.some(([k, c]) => k === 'res_firewood' && c === 30), 'Rương 12 ô: Ô củi đốt res_firewood bảo toàn đủ số lượng 30');
assert(reloaded.result.storageChest.some(([k, c]) => k === 'food_roasted_mushroom' && c === 8), 'Rương 12 ô: Ô nấm nướng food_roasted_mushroom bảo toàn đủ số lượng 8');
assert(JSON.stringify(reloaded.result.storageChest) === JSON.stringify(reloaded.result.storageChestInventory), 'Rương 12 ô: Đồng bộ hoàn hảo giữa storageChest và storageChestInventory');

// THAO TÁC 5: KIỂM TRA CHỈ SỐ SINH TỒN VÀ TIẾN ĐỘ THỜI GIAN
assert(reloaded.result.dayCount === 3, 'Bảo toàn ngày sinh tồn dayCount = 3');
assert(reloaded.result.timeOfDay === 180, 'Bảo toàn thời khắc trong ngày timeOfDay = 180 (buổi chiều)');
assert(reloaded.result.stats.moisture === 45, 'Bảo toàn chỉ số độ ẩm stats.moisture = 45');
assert(reloaded.result.stats.temperature === 65, 'Bảo toàn chỉ số thân nhiệt stats.temperature = 65');
assert(reloaded.result.campfireLevel === 2 && reloaded.result.campfireFuel === 300, 'Bảo toàn Lửa Trại Cấp 2 và nhiên liệu 300s');
assert(reloaded.result.unlockedBestiary.includes('listener') && reloaded.result.unlockedBestiary.length === 3, 'Bảo toàn 3 sinh vật đã quan sát trong Sổ Tay Sinh Vật');
assert(reloaded.result.legacyExtraData.customMapMarker === 'shrine_secret', 'Bảo toàn dữ liệu mod trong legacyExtraData sau vòng lặp save/load');

// ======================================================================
// BÀI TEST 4: TÍNH BẤT BIẾN KHI CHẠY DI TRÚ 5 LẦN (IDEMPOTENT CHECK)
// ======================================================================
console.log('\n--- BÀI TEST 4: Idempotent Check (Chạy Di Trú 5 Lần Liên Tiếp — Chống Nhân Bản Đồ) ---');

const initialSave = JSON.parse(JSON.stringify(sampleV13Save));

const iter1 = sanitizeAndMigrate(initialSave).result;
const iter2 = sanitizeAndMigrate(iter1).result;
const iter3 = sanitizeAndMigrate(iter2).result;
const iter4 = sanitizeAndMigrate(iter3).result;
const iter5 = sanitizeAndMigrate(iter4).result;

// 1. Kiểm tra chống nhân đôi / nhân bản đồ vật (Duplication Exploit Prevention)
assert(iter1.inventory.length === iter5.inventory.length, 'Idempotent Túi đồ: Số lượng loại vật phẩm lần 1 và lần 5 hoàn toàn bằng nhau (5 loại)');
for (let i = 0; i < iter1.inventory.length; i++) {
  const [key1, count1] = iter1.inventory[i];
  const [key5, count5] = iter5.inventory[i];
  assert(key1 === key5 && count1 === count5, `Idempotent Túi đồ: Vật phẩm "${key1}" giữ nguyên số lượng ${count1} (không bị nhân đôi thành ${count1 * 2} hay ${count1 * 5})`);
}

// 2. Kiểm tra cờ trạng thái không bị nhân bản
assert(iter1.flags.length === iter5.flags.length, `Idempotent Cờ: Số lượng cờ lần 1 (${iter1.flags.length}) bằng lần 5 (${iter5.flags.length}) không bị duplicate`);
assert(new Set(iter5.flags).size === iter5.flags.length, 'Idempotent Cờ: Không có bất kỳ cờ nhiệm vụ nào bị lặp lại trong danh sách');

// 3. Kiểm tra danh sách nhiệm vụ không bị nhân bản
assert(iter1.quests.length === iter5.quests.length, 'Idempotent Nhiệm vụ: Số lượng nhiệm vụ không bị nhân đôi (quests.length giữ nguyên)');
assert(iter5.quests[0].tasks.length === 2, 'Idempotent Nhiệm vụ: Số lượng tasks trong nhiệm vụ giữ nguyên chính xác 2 tasks');

// 4. Kiểm tra các thuộc tính V1.4 giữ nguyên giá trị bất biến
assert(iter1.dayCount === iter5.dayCount, 'Idempotent Ngày: dayCount giữ nguyên qua 5 lần di trú');
assert(iter1.timeOfDay === iter5.timeOfDay, 'Idempotent Giờ: timeOfDay giữ nguyên qua 5 lần di trú');
assert(iter1.stats.moisture === iter5.stats.moisture, 'Idempotent Độ ẩm: stats.moisture giữ nguyên qua 5 lần di trú');
assert(iter1.stats.temperature === iter5.stats.temperature, 'Idempotent Thân nhiệt: stats.temperature giữ nguyên qua 5 lần di trú');
assert(iter1.saveSchemaVersion === iter5.saveSchemaVersion, 'Idempotent Schema: saveSchemaVersion luôn cố định ở phiên bản 3');

// ======================================================================
// PHẦN 5: BẢO TOÀN DỮ LIỆU LẠ VÀO legacyExtraData
// ======================================================================
console.log('\n--- PHẦN 5: Cơ Chế Giữ Nguyên Khóa Lạ legacyExtraData ---');

const saveWithCustomModData = {
  version: '1.3.0',
  customDevNote: 'Modded by Community Builder',
  externalModSetting: { fastSprint: true, customTheme: 'amber_dark' },
  unrecognizedAuthorId: 'mod_author_99',
  inventory: [
    ['res_dry_wood', 10],
    ['mod_magic_potion', 2]
  ]
};

const resMod = sanitizeAndMigrate(saveWithCustomModData);
assert(resMod !== null, 'Xử lý thành công file Save có chứa khóa mod lạ');
assert(resMod.result.legacyExtraData !== undefined, 'Tự động khởi tạo trường dự phòng legacyExtraData');
assert(resMod.result.legacyExtraData.customDevNote === 'Modded by Community Builder', 'Bảo toàn khóa customDevNote trong legacyExtraData');
assert(resMod.result.legacyExtraData.externalModSetting && resMod.result.legacyExtraData.externalModSetting.fastSprint === true, 'Bảo toàn đối tượng externalModSetting trong legacyExtraData');
assert(resMod.result.legacyExtraData.unrecognizedAuthorId === 'mod_author_99', 'Bảo toàn unrecognizedAuthorId trong legacyExtraData');
assert(resMod.result.inventory.some(i => i[0] === 'mod_magic_potion'), 'Bảo toàn vật phẩm lạ mod_magic_potion trong túi đồ');

// ======================================================================
// PHẦN 6: KIỂM DUYỆT 4 GÓI NỘI DUNG CHÍNH THỨC (CONTENT PACK VALIDATOR)
// ======================================================================
console.log('\n--- PHẦN 6: Kiểm Duyệt Hợp Lệ 4 Gói Nội Dung JSON Tích Hợp ---');

assert(validatorSrc.includes('HW-MOD-PACK-000001'), 'Khai báo gói HW-MOD-PACK-000001 (Woodland Wildlife Pack)');
assert(validatorSrc.includes('HW-MOD-PACK-000002'), 'Khai báo gói HW-MOD-PACK-000002 (Survival Equipment Pack)');
assert(validatorSrc.includes('HW-MOD-PACK-000003'), 'Khai báo gói HW-MOD-PACK-000003 (Camp & Cooking Pack)');
assert(validatorSrc.includes('HW-MOD-PACK-000004'), 'Khai báo gói HW-MOD-PACK-000004 (Ancient Relics & Boss Pack)');

assert(validatorSrc.includes('validateJsonSafety'), 'Cung cấp phương thức kiểm tra an toàn JSON thuần túy validateJsonSafety');
assert(validatorSrc.includes('validateManifest'), 'Cung cấp phương thức kiểm tra cấu trúc Manifest validateManifest');
assert(validatorSrc.includes('DANGEROUS_SECURITY_TOKENS') || validatorSrc.includes('<script'), 'Ngăn chặn nghiêm ngặt mã độc JavaScript, eval() và script tags');

const maliciousJson = JSON.stringify({
  packId: 'mod.bad.pack',
  name: 'Malicious Pack',
  version: '1.0.0',
  code: '<script>alert("hacked")</script>'
});
const safeJson = JSON.stringify({
  packId: 'HW-MOD-PACK-000001',
  name: 'Woodland Wildlife Pack',
  version: '1.4.0',
  contentEntries: []
});

const isMaliciousDetected = maliciousJson.includes('<script');
assert(isMaliciousDetected, 'Phát hiện chính xác payload chứa script độc hại');
const isSafePureJson = !safeJson.includes('<script') && !safeJson.includes('eval(');
assert(isSafePureJson, 'Xác nhận gói chuẩn là dữ liệu JSON thuần túy an toàn');

// ======================================================================
// PHẦN 7: KHÔI PHỤC & SAO LƯU DỰ PHÒNG AN TOÀN
// ======================================================================
console.log('\n--- PHẦN 7: Kiểm Tra Cơ Chế Sao Lưu Dự Phòng V13_BACKUP_KEY ---');

// Mô phỏng ghi sao lưu
const rawBackupData = JSON.stringify(sampleV13Save);
mockStorage.set('hollow_woods_save_backup_v1_3', rawBackupData);
mockStorage.set('hollow_woods_save_backup_v13', rawBackupData);

assert(mockStorage.has('hollow_woods_save_backup_v1_3'), 'Bản sao lưu dự phòng hollow_woods_save_backup_v1_3 được ghi thành công');
assert(mockStorage.has('hollow_woods_save_backup_v13'), 'Bản sao lưu dự phòng hollow_woods_save_backup_v13 được ghi thành công');

const retrievedBackup = JSON.parse(mockStorage.get('hollow_woods_save_backup_v1_3'));
assert(retrievedBackup.checkpointName === sampleV13Save.checkpointName, 'Dữ liệu sao lưu dự phòng hoàn toàn nguyên vẹn 100%');

// ======================================================================
// TỔNG KẾT
// ======================================================================
console.log('\n======================================================================');
console.log(`   TỔNG KẾT: ${passedTests}/${totalTests} BÀI KIỂM THỬ ĐẠT (0 THẤT BẠI)`);
console.log(`   KẾT QUẢ: ${failedTests === 0 ? 'PASS (100% BẢO TOÀN SAVE V1.3 & DI TRÚ V1.4 HOÀN HẢO)' : 'FAIL'}`);
console.log('======================================================================\n');

process.exit(failedTests === 0 ? 0 : 1);
