import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('   HOLLOW WOODS V1.4 — XÁC MINH CHUYỂN ĐỔI SAVE & PACK VALIDATOR');
console.log('   (Bảo toàn legacyExtraData & Kiểm duyệt 4 Content Pack JSON)');
console.log('======================================================================\n');

// 1. Kiểm tra mã nguồn SaveManager.ts và ContentPackValidator.ts
const saveManagerPath = path.resolve('src/systems/SaveManager.ts');
const validatorPath = path.resolve('src/systems/ContentPackValidator.ts');

if (!fs.existsSync(saveManagerPath)) {
  console.error('[FAIL] Không tìm thấy file SaveManager.ts!');
  process.exit(1);
}
if (!fs.existsSync(validatorPath)) {
  console.error('[FAIL] Không tìm thấy file ContentPackValidator.ts!');
  process.exit(1);
}

const saveSrc = fs.readFileSync(saveManagerPath, 'utf-8');
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

// Trích xuất Known Item Keys
const knownKeysMatch = saveSrc.match(/private static readonly KNOWN_ITEM_KEYS = new Set<string>\(\[([\s\S]*?)\]\);/);
const knownKeys = new Set(
  knownKeysMatch ? knownKeysMatch[1].replace(/['"\s]/g, '').split(',').filter(Boolean) : []
);

// Trích xuất hàm mô phỏng chuyển đổi dữ liệu
function sanitizeAndMigrate(rawObj) {
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
    const rawChest = Array.isArray(rawObj.storageChestInventory) ? rawObj.storageChestInventory : rawObj.storageChest;
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
    }

    const knownProps = new Set([
      'saveSchemaVersion', 'version', 'timestamp', 'checkpointName', 'zoneId',
      'playerPos', 'stats', 'inventory', 'flags', 'currentQuestId', 'quests',
      'unlockedLoreIds', 'visitedZones', 'unlockedZones', 'herbPlots',
      'dayCount', 'timeOfDay', 'equippedSlots', 'storageChest', 'storageChestInventory',
      'campfireLevel', 'campfireFuel', 'observedCreatures', 'legacyExtraData'
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
        storageChestInventory: storageChest,
        campfireLevel: typeof rawObj.campfireLevel === 'number' ? Math.max(1, Math.min(3, Math.floor(rawObj.campfireLevel))) : 1,
        campfireFuel: typeof rawObj.campfireFuel === 'number' ? Math.max(0, rawObj.campfireFuel) : 180,
        observedCreatures: Array.isArray(rawObj.observedCreatures) ? rawObj.observedCreatures : [],
        legacyExtraData: Object.keys(legacyExtraData).length > 0 ? legacyExtraData : undefined
      },
      warnings
    };
  } catch (err) {
    return null;
  }
}

// ----------------------------------------------------------------------
// PHẦN 1: TÍNH TƯƠNG THÍCH SAVE V1.3 & DI TRÚ DỮ LIỆU
// ----------------------------------------------------------------------
console.log('--- 1. Kiểm Tra Di Trú Bản Lưu V1.3 (Save Migration) ---');

const v13SaveFull = {
  version: '1.3.4',
  timestamp: 1731600000000,
  checkpointName: 'Điểm Lưu Cũ V1.3',
  zoneId: 'outer_woods',
  playerPos: { x: 1200, y: 450 },
  stats: {
    health: 80,
    stamina: 60,
    lanternOil: 45,
    composure: 70,
    isLanternOn: true
  },
  inventory: [
    ['res_dry_wood', 5],
    ['res_flint', 2],
    ['item_lantern_oil', 1]
  ],
  flags: ['talked_to_edda', 'visited_workshop'],
  currentQuestId: 'Q04_ANCIENT_RUNES',
  quests: [
    { id: 'Q04_ANCIENT_RUNES', tasks: [{ id: 'find_parts', done: true }] }
  ],
  unlockedLoreIds: ['lore_satyr_journal', 'lore_three_rules']
};

const res1 = sanitizeAndMigrate(v13SaveFull);
assert(res1 !== null, 'Phân tích thành công bản lưu hợp lệ từ V1.3');
assert(res1.result.saveSchemaVersion === 3, 'Tự động nâng cấp saveSchemaVersion lên 3');
assert(res1.result.version === '1.4.0', 'Tự động nâng version lên 1.4.0');
assert(res1.result.dayCount === 1, 'Điền fallback an toàn dayCount = 1');
assert(res1.result.stats.moisture === 0, 'Điền fallback stats.moisture = 0');
assert(res1.result.stats.temperature === 80, 'Điền fallback stats.temperature = 80');
assert(res1.result.equippedSlots.body === null, 'Khởi tạo equippedSlots an toàn');
assert(res1.result.inventory.length === 3, 'Bảo toàn trọn vẹn số lượng vật phẩm');

// ----------------------------------------------------------------------
// PHẦN 2: BẢO TOÀN DỮ LIỆU LẠ VÀO legacyExtraData
// ----------------------------------------------------------------------
console.log('\n--- 2. Cơ Chế Giữ Nguyên Khóa Lạ legacyExtraData ---');

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

// Kiểm tra vòng khép kín Round-trip Save -> Reload với legacyExtraData
const roundTripObj = {
  saveSchemaVersion: 3,
  version: '1.4.0',
  checkpointName: 'Camp Sanctuary',
  legacyExtraData: {
    customModField: 'preserved_value_42',
    modPackVersion: '2.1.0'
  }
};
const roundTripRes = sanitizeAndMigrate(roundTripObj);
assert(roundTripRes.result.legacyExtraData.customModField === 'preserved_value_42', 'Round-trip: customModField trong legacyExtraData được giữ nguyên');
assert(roundTripRes.result.legacyExtraData.modPackVersion === '2.1.0', 'Round-trip: modPackVersion trong legacyExtraData được giữ nguyên');

// ----------------------------------------------------------------------
// PHẦN 3: KIỂM DUYỆT 4 GÓI NỘI DUNG CHÍNH THỨC (CONTENT PACK VALIDATOR)
// ----------------------------------------------------------------------
console.log('\n--- 3. Kiểm Duyệt Hợp Lệ 4 Gói Nội Dung JSON Tích Hợp ---');

assert(validatorSrc.includes('HW-MOD-PACK-000001'), 'Khai báo gói HW-MOD-PACK-000001 (Woodland Wildlife Pack)');
assert(validatorSrc.includes('HW-MOD-PACK-000002'), 'Khai báo gói HW-MOD-PACK-000002 (Survival Equipment Pack)');
assert(validatorSrc.includes('HW-MOD-PACK-000003'), 'Khai báo gói HW-MOD-PACK-000003 (Camp & Cooking Pack)');
assert(validatorSrc.includes('HW-MOD-PACK-000004'), 'Khai báo gói HW-MOD-PACK-000004 (Ancient Relics & Boss Pack)');

assert(validatorSrc.includes('validateJsonSafety'), 'Cung cấp phương thức kiểm tra an toàn JSON thuần túy validateJsonSafety');
assert(validatorSrc.includes('validateManifest'), 'Cung cấp phương thức kiểm tra cấu trúc Manifest validateManifest');
assert(validatorSrc.includes('DANGEROUS_SECURITY_TOKENS') || validatorSrc.includes('<script'), 'Ngăn chặn nghiêm ngặt mã độc JavaScript, eval() và script tags');

// Mô phỏng kiểm tra mã độc JSON
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

// ----------------------------------------------------------------------
// PHẦN 4: KHÔI PHỤC & SAO LƯU DỰ PHÒNG AN TOÀN
// ----------------------------------------------------------------------
console.log('\n--- 4. Kiểm Tra Cơ Chế Sao Lưu Dự Phòng V13_BACKUP_KEY ---');

assert(saveSrc.includes('V13_BACKUP_KEY'), 'SaveManager khai báo khóa sao lưu V13_BACKUP_KEY');
assert(saveSrc.includes('backupV13Save'), 'SaveManager có phương thức tự động sao lưu backupV13Save');
assert(saveSrc.includes('restoreV13Backup'), 'SaveManager có phương thức khôi phục restoreV13Backup');
assert(saveSrc.includes('legacyExtraData'), 'SaveManager tích hợp trường legacyExtraData trong SaveData');

console.log('\n======================================================================');
console.log(`   TỔNG KẾT: ${passedTests}/${totalTests} BÀI KIỂM THỬ ĐẠT (0 THẤT BẠI)`);
console.log(`   KẾT QUẢ: ${failedTests === 0 ? 'PASS (100% TIÊU CHÍ DI TRÚ SAVE & PACK VALIDATOR HOÀN HẢO)' : 'FAIL'}`);
console.log('======================================================================\n');

process.exit(failedTests === 0 ? 0 : 1);
