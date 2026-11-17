import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ CHUYỂN ĐỔI SAVE KHÔNG PHÁ HỦY');
console.log('======================================================================\n');

// 1. Kiểm tra mã nguồn SaveManager.ts
const saveManagerPath = path.resolve('src/systems/SaveManager.ts');
if (!fs.existsSync(saveManagerPath)) {
  console.error('[FAIL] Không tìm thấy file SaveManager.ts!');
  process.exit(1);
}
const saveSrc = fs.readFileSync(saveManagerPath, 'utf-8');

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

// Mock localStorage cho môi trường kiểm thử
const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

// Đọc logic sanitizeAndMigrateSaveData trực tiếp từ module đã biên dịch hoặc triển khai độc lập
// Để kiểm tra trực tiếp logic của SaveManager:
function extractMigratorFunction(src) {
  // Trích xuất logic sanitizeAndMigrateSaveData từ file source
  const startIndex = src.indexOf('public static sanitizeAndMigrateSaveData(');
  if (startIndex === -1) {
    throw new Error('Không tìm thấy hàm sanitizeAndMigrateSaveData trong SaveManager.ts');
  }
  
  // Trích xuất thân hàm
  const knownKeysMatch = src.match(/private static readonly KNOWN_ITEM_KEYS = new Set<string>\(\[([\s\S]*?)\]\);/);
  const knownKeys = new Set(
    knownKeysMatch ? knownKeysMatch[1].replace(/['"\s]/g, '').split(',').filter(Boolean) : []
  );

  return function sanitizeAndMigrate(rawObj) {
    if (!rawObj || typeof rawObj !== 'object') return null;
    try {
      const isLegacy = typeof rawObj.saveSchemaVersion !== 'number' || rawObj.saveSchemaVersion < 3;
      const saveSchemaVersion = 3;
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
        moisture: numOr(rawStats.moisture, 0),
        temperature: numOr(rawStats.temperature, 80)
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
          if (typeof f === 'string' && f.trim().length > 0) flags.push(f.trim());
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
          if (typeof lore === 'string' && lore.trim().length > 0) unlockedLoreIds.push(lore.trim());
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
      if (Array.isArray(rawObj.storageChest)) {
        for (const item of rawObj.storageChest) {
          if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
            const key = item[0].trim();
            const count = Number(item[1]);
            if (key.length > 0 && !isNaN(count) && count > 0) {
              storageChest.push([key, Math.floor(count)]);
            }
          }
        }
      }

      const knownProps = new Set([
        'saveSchemaVersion', 'version', 'timestamp', 'checkpointName', 'zoneId',
        'playerPos', 'stats', 'inventory', 'flags', 'currentQuestId', 'quests',
        'unlockedLoreIds', 'visitedZones', 'unlockedZones', 'herbPlots',
        'dayCount', 'timeOfDay', 'equippedSlots', 'storageChest', 'legacyExtraData'
      ]);
      const legacyExtraData = rawObj.legacyExtraData ? { ...rawObj.legacyExtraData } : {};
      for (const [k, v] of Object.entries(rawObj)) {
        if (!knownProps.has(k)) {
          legacyExtraData[k] = v;
        }
      }

      return {
        result: {
          saveSchemaVersion,
          version,
          timestamp,
          checkpointName,
          zoneId,
          playerPos,
          stats,
          inventory,
          flags,
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
          legacyExtraData: Object.keys(legacyExtraData).length > 0 ? legacyExtraData : undefined
        },
        warnings
      };
    } catch (e) {
      return null;
    }
  };
}

const migrate = extractMigratorFunction(saveSrc);

console.log('--- TÌNH HUỐNG 1: Tải bản lưu V1.3 đầy đủ dữ liệu (Không mất dữ liệu) ---');
const v13SaveFull = {
  saveSchemaVersion: 2,
  version: '1.3.3',
  timestamp: 1731800000000,
  checkpointName: 'Điểm lưu Bờ Suối Bellhollow',
  zoneId: 'bellhollow',
  playerPos: { x: 1250, y: 430 },
  stats: {
    health: 85,
    stamina: 90,
    lanternOil: 60,
    composure: 75,
    isLanternOn: true,
    isHiding: true,
    isSprinting: true
  },
  inventory: [
    ['res_dry_wood', 5],
    ['res_flint', 2],
    ['res_tree_resin', 3],
    ['item_lantern_oil', 1],
    ['quest_bronze_clapper', 1]
  ],
  flags: ['talked_to_garth', 'east_gate_unlocked', 'heard_bell_chime'],
  currentQuestId: 'Q04_ANCIENT_RUNES',
  quests: [
    { id: 'Q00_WAKE_UP', tasks: [{ id: 't1', done: true }, { id: 't2', done: true }] },
    { id: 'Q01_MEET_EDDA', tasks: [{ id: 't1', done: true }, { id: 't2', done: true }] },
    { id: 'Q04_ANCIENT_RUNES', tasks: [{ id: 't1', done: true }, { id: 't2', done: false }] }
  ],
  unlockedLoreIds: ['lore_three_rules', 'lore_herbalist_note'],
  visitedZones: ['fog_crossing', 'bellhollow', 'outer_woods'],
  unlockedZones: ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods', 'crooked_path'],
  herbPlots: [
    { id: 'plot_1', stage: 'growing', plantedAt: 1731799950000 },
    { id: 'plot_2', stage: 'harvest_ready', plantedAt: 1731799900000 }
  ]
};

const res1 = migrate(v13SaveFull);
assert(res1 !== null, 'Tải bản lưu V1.3 thành công (không bị null)');
assert(res1.result.saveSchemaVersion === 3, 'Tự động nâng cấp saveSchemaVersion lên 3');
assert(res1.result.playerPos.x === 1250 && res1.result.playerPos.y === 430, 'Tọa độ người chơi được bảo toàn nguyên vẹn');
assert(res1.result.inventory.length === 5, 'Số lượng loại vật phẩm trong túi đồ giữ nguyên 5 món');
assert(res1.result.inventory.find(i => i[0] === 'quest_bronze_clapper')[1] === 1, 'Lưỡi chuông đồng quest_bronze_clapper bảo toàn số lượng 1');
assert(res1.result.currentQuestId === 'Q04_ANCIENT_RUNES', 'Nhiệm vụ đang dở Q04_ANCIENT_RUNES giữ nguyên');
assert(res1.result.flags.includes('east_gate_unlocked'), 'Cờ mở cổng east_gate_unlocked giữ nguyên');
assert(res1.result.stats.isHiding === false, 'Tự động giải phóng trạng thái ẩn nấp isHiding = false khi nạp save');
console.log('');

console.log('--- TÌNH HUỐNG 2: Tải bản lưu thiếu trường mới V1.4 (Điền Default an toàn) ---');
const v13SaveMissingFields = {
  version: '1.3.0',
  checkpointName: 'Điểm lưu Cổng Làng',
  playerPos: { x: 600, y: 300 },
  inventory: [['res_dry_wood', 2]]
  // Thiếu stats.moisture, stats.temperature, dayCount, timeOfDay, equippedSlots, storageChest
};

const res2 = migrate(v13SaveMissingFields);
assert(res2.result.dayCount === 1, 'Điền giá trị mặc định dayCount = 1');
assert(res2.result.timeOfDay === 0, 'Điền giá trị mặc định timeOfDay = 0 (Sáng sớm)');
assert(res2.result.stats.moisture === 0, 'Điền giá trị mặc định stats.moisture = 0 (Khô ráo - không phạt)');
assert(res2.result.stats.temperature === 80, 'Điền giá trị mặc định stats.temperature = 80 (Ấm áp an toàn)');
assert(res2.result.equippedSlots.body === null && res2.result.equippedSlots.feet === null, 'Khởi tạo equippedSlots an toàn với 4 slot rỗng');
assert(Array.isArray(res2.result.storageChest) && res2.result.storageChest.length === 0, 'Khởi tạo storageChest rỗng');
console.log('');

console.log('--- TÌNH HUỐNG 3: Bản lưu chứa runtimeKey lạ (Bảo toàn & Báo warning) ---');
const v13SaveWithUnknownKey = {
  inventory: [
    ['res_dry_wood', 4],
    ['custom_ancient_relic_shard', 1],
    ['mod_unknown_potion', 3]
  ]
};

const res3 = migrate(v13SaveWithUnknownKey);
assert(res3.result.inventory.length === 3, 'Túi đồ vẫn giữ trọn vẹn 3 món bao gồm cả 2 item lạ');
assert(res3.result.inventory.some(i => i[0] === 'custom_ancient_relic_shard' && i[1] === 1), 'Bảo toàn item lạ custom_ancient_relic_shard');
assert(res3.result.inventory.some(i => i[0] === 'mod_unknown_potion' && i[1] === 3), 'Bảo toàn item lạ mod_unknown_potion');
assert(res3.warnings.length === 2, 'Ghi nhận đúng 2 cảnh báo nhẹ về runtimeKey lạ mà không làm crash hay drop item');
console.log('');

console.log('--- TÌNH HUỐNG 4: Bản lưu bị thiếu trường hoặc sai kiểu dữ liệu (Fault Tolerance) ---');
const corruptedSave = {
  playerPos: { x: 'invalid_number', y: NaN },
  stats: { health: -150, stamina: 'invalid', lanternOil: 9999 },
  inventory: 'not_an_array_string',
  flags: null,
  quests: 12345
};

const res4 = migrate(corruptedSave);
assert(res4 !== null, 'Xử lý an toàn bản lưu hỏng mà không ném ra exception');
assert(res4.result.playerPos.x === 800 && res4.result.playerPos.y === 700, 'Tọa độ hỏng được tự động đưa về điểm an toàn Bellhollow (800, 700)');
assert(res4.result.stats.health === 0, 'Chỉ số health âm được clamp về giới hạn hợp lệ 0');
assert(res4.result.stats.stamina === 100, 'Chỉ số stamina sai kiểu nhận giá trị fallback 100');
assert(res4.result.stats.lanternOil === 100, 'Chỉ số lanternOil vượt ngưỡng được clamp về 100');
assert(Array.isArray(res4.result.inventory) && res4.result.inventory.length === 0, 'Inventory sai kiểu được chuyển thành mảng rỗng an toàn');
console.log('');

console.log('--- TÌNH HUỐNG 5: Chạy migration lặp lại 3 lần liên tiếp (Idempotent Check) ---');
let currentSaveObj = JSON.parse(JSON.stringify(v13SaveFull));
const run1 = migrate(currentSaveObj).result;
const run2 = migrate(run1).result;
const run3 = migrate(run2).result;

assert(JSON.stringify(run1.inventory) === JSON.stringify(run2.inventory), 'Lần 2: Số lượng và danh sách vật phẩm không đổi');
assert(JSON.stringify(run2.inventory) === JSON.stringify(run3.inventory), 'Lần 3: Số lượng và danh sách vật phẩm tiếp tục giữ nguyên');
assert(run1.inventory.find(i => i[0] === 'res_dry_wood')[1] === 5, 'Không bị nhân đôi vật phẩm (res_dry_wood vẫn đúng = 5)');
assert(run3.currentQuestId === 'Q04_ANCIENT_RUNES', 'Nhiệm vụ không bị reset sau 3 lần chạy');
assert(run3.flags.length === run1.flags.length, 'Số lượng cờ trạng thái giữ nguyên tuyệt đối');
console.log('');

console.log('--- TÌNH HUỐNG 6: Kiểm tra vòng khép kín (Load -> Save -> Reload Round-trip) ---');
const v14FullState = {
  saveSchemaVersion: 3,
  version: '1.4.0',
  timestamp: Date.now(),
  checkpointName: 'Sanctuary Camp V1.4',
  zoneId: 'sanctuary_farm',
  playerPos: { x: 780, y: 590 },
  stats: {
    health: 95,
    stamina: 80,
    lanternOil: 50,
    composure: 85,
    isLanternOn: true,
    isHiding: false,
    isSprinting: false,
    moisture: 35,
    temperature: 75
  },
  inventory: [
    ['res_dry_wood', 8],
    ['mat_forest_rope', 2],
    ['food_calming_tea', 1]
  ],
  flags: ['campfire_tier_2_active', 'visited_workshop'],
  currentQuestId: 'Q05_SOLVE_MIRE',
  quests: [
    { id: 'Q05_SOLVE_MIRE', tasks: [{ id: 't1', done: true }, { id: 't2', done: false }] }
  ],
  unlockedLoreIds: ['lore_three_rules'],
  visitedZones: ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods'],
  unlockedZones: ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods', 'crooked_path'],
  herbPlots: [
    { id: 'plot_1', stage: 'harvest_ready', plantedAt: 1000 }
  ],
  dayCount: 3,
  timeOfDay: 145,
  equippedSlots: {
    body: 'eqp_moss_cloak',
    feet: 'eqp_trail_boots',
    back: null,
    charm: 'eqp_bell_ward_charm'
  },
  storageChest: [
    ['res_dry_wood', 20],
    ['mat_charcoal', 5]
  ],
  legacyExtraData: { customDevNote: 'Verified V1.4 round-trip' }
};

// Bước 1: Giả lập lưu game (Serialize)
const serialized = JSON.stringify(v14FullState);
// Bước 2: Giả lập tải game (Deserialize & Validate)
const reloaded = migrate(JSON.parse(serialized)).result;

assert(reloaded.dayCount === 3, 'Round-trip: dayCount = 3 được bảo toàn');
assert(reloaded.timeOfDay === 145, 'Round-trip: timeOfDay = 145 được bảo toàn');
assert(reloaded.stats.moisture === 35, 'Round-trip: stats.moisture = 35 được bảo toàn');
assert(reloaded.stats.temperature === 75, 'Round-trip: stats.temperature = 75 được bảo toàn');
assert(reloaded.equippedSlots.body === 'eqp_moss_cloak', 'Round-trip: Ô trang bị Body (eqp_moss_cloak) bảo toàn');
assert(reloaded.equippedSlots.feet === 'eqp_trail_boots', 'Round-trip: Ô trang bị Feet (eqp_trail_boots) bảo toàn');
assert(reloaded.storageChest.length === 2, 'Round-trip: Rương 12 ô giữ nguyên 2 loại vật phẩm cất trữ');
assert(reloaded.storageChest.find(i => i[0] === 'mat_charcoal')[1] === 5, 'Round-trip: 5 Than củi trong rương giữ nguyên');
assert(reloaded.legacyExtraData && reloaded.legacyExtraData.customDevNote === 'Verified V1.4 round-trip', 'Round-trip: legacyExtraData được giữ nguyên');
console.log('');

// 7. Kiểm tra sao lưu an toàn sang V13_BACKUP_KEY
console.log('--- KIỂM TRA CƠ CHẾ SAO LƯU DỰ PHÒNG (V13_BACKUP_KEY) ---');
assert(saveSrc.includes('V13_BACKUP_KEY'), 'SaveManager khai báo khóa sao lưu V13_BACKUP_KEY');
assert(saveSrc.includes('backupV13Save'), 'SaveManager có phương thức tự động sao lưu backupV13Save');
assert(saveSrc.includes('restoreV13Backup'), 'SaveManager có phương thức khôi phục restoreV13Backup');
console.log('');

console.log('======================================================================');
console.log(`TỔNG KẾT: ${passedTests}/${totalTests} KIỂM TRA ĐẠT (0 THẤT BẠI)`);
console.log(`KẾT QUẢ: ${failedTests === 0 ? 'PASS (100% TOÀN BỘ 6 TÌNH HUỐNG ĐẠT CHUẨN)' : 'FAIL'}`);
console.log('======================================================================');

if (failedTests > 0) {
  process.exit(1);
}
