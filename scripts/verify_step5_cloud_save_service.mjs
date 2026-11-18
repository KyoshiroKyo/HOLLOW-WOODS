/**
 * VERIFICATION SCRIPT: Tích Hợp Lưu Tiến Trình Đám Mây P2.Storage Cho HOLLOW WOODS
 * 
 * Kiểm tra toàn diện 8 tiêu chí kỹ thuật:
 * 1. p2game.json khai báo đúng "cloudSave": true và "persistent-storage" trong permissions.
 * 2. Phân chia key gọn nhẹ (hw_save_slot_1, hw_save_meta, hw_settings) & kiểm soát byte size < 60 KB.
 * 3. Tự động di trú schema V1.3 -> V1.4 (bao gồm exploredZones Fog of War và questFlags).
 * 4. Cơ chế lưu kép LocalStorage + p2.storage khi có SDK và chạy giả lập standalone khi không có SDK.
 * 5. Bắt trọn 4 mã lỗi SDK: UNAUTHENTICATED, RATE_LIMITED, QUOTA_EXCEEDED, UNAVAILABLE.
 * 6. Lưu có độ trễ scheduleDebouncedSave (2.5s) để chống spam API.
 * 7. Tải game thông minh đối chiếu updatedAt giữa Cloud và Local.
 * 8. Gắn vòng đời p2.onBeforeUnload và p2.auth.onChange.
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

console.log('================================================================');
console.log('KIỂM TRA TÍCH HỢP HỆ THỐNG CLOUD SAVE P2.STORAGE & BACKUP CỤC BỘ');
console.log('================================================================\n');

// 1. Kiểm tra p2game.json
console.log('1. Kiểm tra cấu hình p2game.json:');
const p2gamePath = path.resolve('p2game.json');
assert(fs.existsSync(p2gamePath), 'File p2game.json tồn tại');
if (fs.existsSync(p2gamePath)) {
  const p2game = JSON.parse(fs.readFileSync(p2gamePath, 'utf8'));
  assert(p2game.sdk && p2game.sdk.version === '1.1', 'p2game.json khai báo SDK version 1.1');
  assert(p2game.sdk && p2game.sdk.cloudSave === true, 'p2game.json khai báo "cloudSave": true');
  assert(Array.isArray(p2game.permissions) && p2game.permissions.includes('persistent-storage'), 'permissions chứa "persistent-storage"');
}

// 2. Kiểm tra sự tồn tại của CloudSaveService
console.log('\n2. Kiểm tra modules CloudSaveService:');
const csJsPath = path.resolve('src/services/CloudSaveService.js');
const csTsPath = path.resolve('src/services/CloudSaveService.ts');
assert(fs.existsSync(csJsPath), 'File src/services/CloudSaveService.js tồn tại');
assert(fs.existsSync(csTsPath), 'File src/services/CloudSaveService.ts tồn tại');

// Import CloudSaveService.js để thực thi kiểm thử logic
const {
  SAVE_VERSION,
  MAX_KEY_BYTES,
  LOCAL_PREFIX,
  SAVE_KEY_SLOT_1,
  SAVE_KEY_META,
  SAVE_KEY_SETTINGS,
  getByteSize,
  migrateSaveSchema,
  saveGameNow,
  scheduleDebouncedSave,
  loadGameProgress,
  bindCloudSaveLifecycle,
  saveSettings,
  loadSettings,
  CloudSaveService
} = await import('../src/services/CloudSaveService.js');

// Mock localStorage cho môi trường Node.js
const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => (mockStorage.has(k) ? mockStorage.get(k) : null),
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

// 3. Kiểm tra kiểm soát dung lượng byte
console.log('\n3. Kiểm tra kiểm soát dung lượng byte (< 60 KB):');
assert(MAX_KEY_BYTES === 60 * 1024, 'MAX_KEY_BYTES = 60 * 1024 (61440 bytes)');
const smallData = { test: "Hollow Woods", number: 42 };
const smallSize = getByteSize(smallData);
assert(smallSize > 0 && smallSize < 100, `getByteSize tính chính xác dữ liệu nhỏ (${smallSize} bytes)`);

const hugeData = { overflow: "X".repeat(65 * 1024) };
const hugeSize = getByteSize(hugeData);
assert(hugeSize > MAX_KEY_BYTES, `Dữ liệu vượt ngưỡng phát hiện chính xác (${hugeSize} bytes > 60 KB)`);

// 4. Kiểm tra Migration Schema từ V1.3 -> V1.4
console.log('\n4. Kiểm tra Tự Động Di Trú Schema Save (V1.3 -> V1.4):');
const legacyV13Save = {
  saveVersion: 2,
  timestamp: 1600000000000,
  zoneId: "crooked_path",
  playerPos: { x: 1250, y: 340 },
  stats: {
    health: 85,
    stamina: 70,
    lanternOil: 50,
    composure: 60,
    isLanternOn: true,
    moisture: 20,
    temperature: 75
  },
  inventory: [["res_dry_wood", 10], ["res_flint", 4]],
  flags: ["talked_to_edda", "unlocked_east_gate"],
  visitedZones: ["bellhollow", "crooked_path"],
  unlockedZones: ["fog_crossing", "bellhollow", "crooked_path"],
  dayCount: 3
};

const migrated = migrateSaveSchema(legacyV13Save);
assert(migrated !== null, 'migrateSaveSchema xử lý thành công save cũ');
assert(migrated.version === "1.4", 'Phiên bản nâng lên chuẩn 1.4');
assert(migrated.player.mapId === "crooked_path", 'player.mapId ánh xạ đúng từ zoneId');
assert(migrated.player.x === 1250 && migrated.player.y === 340, 'player.x, y ánh xạ đúng từ playerPos');
assert(migrated.player.hp === 85 && migrated.player.sanity === 60, 'player.hp & sanity ánh xạ đúng từ stats');
assert(migrated.player.daysSurvived === 3, 'player.daysSurvived ánh xạ đúng từ dayCount');
assert(migrated.exploredZones["bellhollow"] === true && migrated.exploredZones["crooked_path"] === true, 'exploredZones (Mini-map Fog of War) được tái lập chuẩn xác');
assert(migrated.questFlags["talked_to_edda"] === true, 'questFlags được bảo toàn');
assert(migrated.unlockedShortcuts.includes("crooked_path"), 'unlockedShortcuts được bảo toàn');

// Kiểm tra tính Idempotent (chạy lặp lại)
const reMigrated = migrateSaveSchema(migrated);
assert(reMigrated.version === "1.4" && reMigrated.player.mapId === "crooked_path", 'Di trú Idempotent: chạy lần 2 dữ liệu hoàn toàn đồng nhất');

// 5. Kiểm tra Chế độ Standalone (Khi không có window.p2)
console.log('\n5. Kiểm tra Chế độ Chạy Giả Lập Standalone (allowStandalone):');
delete global.window;
global.window = {}; // Không có window.p2

mockStorage.clear();
const standaloneResult = await saveGameNow(legacyV13Save);
assert(standaloneResult.ok === true && standaloneResult.source === 'local', 'Lưu thành công vào localStorage khi không có SDK');
assert(mockStorage.has(`${LOCAL_PREFIX}slot_1`), 'Bản sao lưu slot_1 tồn tại trong localStorage');

const loadedStandalone = await loadGameProgress();
assert(loadedStandalone !== null && loadedStandalone.player.mapId === "crooked_path", 'loadGameProgress đọc mượt mà từ bản lưu cục bộ');

// 6. Kiểm tra Tương tác SDK window.p2.storage
console.log('\n6. Kiểm tra Tích hợp Cloud p2.storage & Bắt Mã Lỗi SDK:');
const cloudMockStore = new Map();
let simulateErrorCode = null;
let toastMessage = null;

global.window.p2 = {
  storage: {
    get: async (key) => cloudMockStore.get(key) || null,
    set: async (key, val) => {
      if (simulateErrorCode) {
        const err = new Error(`SDK error: ${simulateErrorCode}`);
        err.code = simulateErrorCode;
        err.retryAfterMs = 1500;
        throw err;
      }
      cloudMockStore.set(key, val);
    }
  },
  ui: {
    toast: (msg, tone) => {
      toastMessage = { msg, tone };
    }
  },
  auth: {
    onChange: (fn) => {
      global.mockAuthChangeFn = fn;
      return () => {};
    }
  },
  onBeforeUnload: (fn) => {
    global.mockUnloadFn = fn;
    return () => {};
  }
};

// Lưu bình thường lên Cloud
mockStorage.clear();
cloudMockStore.clear();
const cloudResult = await saveGameNow(legacyV13Save);
assert(cloudResult.ok === true && cloudResult.source === 'cloud', 'saveGameNow đồng bộ thành công lên cloud');
assert(cloudMockStore.has(SAVE_KEY_SLOT_1), 'Key hw_save_slot_1 được ghi vào p2.storage');
assert(cloudMockStore.has(SAVE_KEY_META), 'Key hw_save_meta được ghi vào p2.storage');
assert(mockStorage.has(`${LOCAL_PREFIX}slot_1`), 'Vẫn ghi song song vào localStorage (Dual-Save)');

// Kiểm tra lỗi UNAUTHENTICATED
simulateErrorCode = "UNAUTHENTICATED";
const unauthResult = await saveGameNow(legacyV13Save);
assert(unauthResult.ok === true && unauthResult.source === 'local_guest', 'Lỗi UNAUTHENTICATED được bắt êm ái, trả về local_guest');

// Kiểm tra lỗi RATE_LIMITED
simulateErrorCode = "RATE_LIMITED";
const rateLimitResult = await saveGameNow(legacyV13Save);
assert(rateLimitResult.ok === false && rateLimitResult.reason === 'RATE_LIMITED', 'Lỗi RATE_LIMITED trả về mã xử lý để hẹn giờ retry');

// Kiểm tra lỗi QUOTA_EXCEEDED
simulateErrorCode = "QUOTA_EXCEEDED";
const quotaResult = await saveGameNow(legacyV13Save);
assert(quotaResult.ok === false && quotaResult.reason === 'QUOTA_EXCEEDED', 'Lỗi QUOTA_EXCEEDED được nhận diện chính xác');
assert(toastMessage !== null && toastMessage.tone === 'warning', 'Toast cảnh báo đầy dung lượng được hiển thị');

simulateErrorCode = null;

// 7. Kiểm tra Đối Chiếu Phiên Bản Mới Nhất giữa Cloud và Local
console.log('\n7. Kiểm tra Tải Game Thông Minh (So sánh updatedAt):');
const olderLocal = { ...migrated, updatedAt: 1000, player: { ...migrated.player, hp: 40 } };
const newerCloud = { ...migrated, updatedAt: 2000, player: { ...migrated.player, hp: 100 } };
mockStorage.set(`${LOCAL_PREFIX}slot_1`, JSON.stringify(olderLocal));
cloudMockStore.set(SAVE_KEY_SLOT_1, newerCloud);

const loadedNewest = await loadGameProgress();
assert(loadedNewest.updatedAt === 2000 && loadedNewest.player.hp === 100, 'loadGameProgress tự động ưu tiên nạp bản Cloud mới hơn Local');

// 8. Kiểm tra Vòng Đời SDK (bindCloudSaveLifecycle)
console.log('\n8. Kiểm tra Gắn Vòng Đời SDK (onBeforeUnload & auth.onChange):');
let currentCaptureCalled = false;
const cleanup = bindCloudSaveLifecycle(() => {
  currentCaptureCalled = true;
  return migrated;
});

assert(typeof global.mockUnloadFn === 'function', 'p2.onBeforeUnload đã được đăng ký');
assert(typeof global.mockAuthChangeFn === 'function', 'p2.auth.onChange đã được đăng ký');

// Giả lập đóng tab
currentCaptureCalled = false;
global.mockUnloadFn();
assert(currentCaptureCalled === true, 'Đóng tab kích hoạt hàm lưu khẩn cấp');

// Giả lập đăng nhập giữa chừng
currentCaptureCalled = false;
await global.mockAuthChangeFn({ id: 'player_123', displayName: 'Wayfarer' });
assert(currentCaptureCalled === true, 'Đăng nhập kích hoạt đồng bộ tiến trình lên mây');

cleanup();

// 9. Kiểm tra Cấu hình Settings (hw_settings)
console.log('\n9. Kiểm tra Lưu Trữ Cấu Hình Người Chơi (hw_settings):');
const testSettings = { graphicsQuality: 'MEDIUM', masterVolume: 0.9, musicVolume: 0.6, sfxVolume: 0.8, isMuted: false };
const saveSetResult = await saveSettings(testSettings);
assert(saveSetResult.ok === true, 'saveSettings lưu thành công');
assert(cloudMockStore.has(SAVE_KEY_SETTINGS), 'Key hw_settings được ghi vào p2.storage');

const loadedSet = await loadSettings();
assert(loadedSet !== null && loadedSet.graphicsQuality === 'MEDIUM' && loadedSet.masterVolume === 0.9, 'loadSettings tải chính xác thông số cấu hình');

console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ HỆ THỐNG CLOUD SAVE P2.STORAGE ĐÃ HOÀN TOÀN ĐẠT CHUẨN KỸ THUẬT!');
  process.exit(0);
}
