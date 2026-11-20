/**
 * HOLLOW WOODS V1.4 - CLOUD SAVE SERVICE (TYPESCRIPT)
 * Tích hợp hệ thống lưu tiến trình đám mây window.p2.storage kết hợp sao lưu cục bộ localStorage.
 * Tuân thủ nghiêm ngặt đặc tả P2Game SDK v1.1.
 * 
 * TIÊU CHUẨN KỸ THUẬT:
 * 1. Giới hạn dung lượng: Mỗi key luôn < 60 KB (trần an toàn dưới 64 KB/key, tối đa 32 keys).
 * 2. Phân chia key gọn nhẹ:
 *    - 'hw_save_slot_1': Toàn bộ tiến trình game chính (nhân vật, túi đồ, nhiệm vụ, bản đồ Fog of War).
 *    - 'hw_save_meta': Metadata siêu gọn (< 1 KB) phục vụ xem trước tiến trình và so sánh phiên bản.
 *    - 'hw_settings': Cấu hình người chơi (đồ họa, âm lượng) độc lập với save game.
 * 3. Tương thích ngược (Migration): Tự động chuyển đổi save V1.3 -> V1.4 không gây lỗi crash.
 * 4. Cơ chế lưu kép (Dual-Save): Luôn ghi localStorage trước, sau đó đồng bộ lên p2.storage.set().
 * 5. Bắt trọn lỗi SDK: UNAUTHENTICATED, RATE_LIMITED (tự động retry theo retryAfterMs), QUOTA_EXCEEDED, UNAVAILABLE.
 * 6. Hai chế độ lưu:
 *    - saveGameNow(): Lưu lập tức tại điểm Save, chuyển map, hạ Boss.
 *    - scheduleDebouncedSave(): Gom nhóm lưu sau 2.5s khi nhặt đồ, mở bản đồ Fog of War chống spam API.
 * 7. Tải game thông minh: loadGameProgress() đối chiếu updatedAt giữa Cloud và Local, nạp bản mới nhất.
 * 8. Vòng đời SDK: Gắn p2.onBeforeUnload() và p2.auth.onChange() chống mất tiến trình khi đóng tab hoặc mới đăng nhập.
 */

import { GRAPHICS_QUALITY_KEY, QA_BUILD, QA_SAVE_KEY, QA_SETTINGS_KEY } from '../debug/DevSessionPolicy';

export const SAVE_VERSION = "1.4";
export const MAX_KEY_BYTES = 64 * 1024; // 65,536 bytes - Giới hạn 64 KB theo đặc tả SDK v1.1
export const MAX_KEY_COUNT = 32;       // Tối đa 32 khóa trong payload
export const LOCAL_PREFIX = "hollow_woods_backup_";
export const SAVE_KEY_PROGRESS = "progress"; // V152-08: Khóa lưu chuẩn SDK
export const SAVE_KEY_SLOT_1 = "hw_save_slot_1";
export const SAVE_KEY_META = "hw_save_meta";
export const SAVE_KEY_SETTINGS = "hw_settings";

let saveDebounceTimer: any = null;
let latestPendingState: any = null;

export interface CloudSavePlayer {
  mapId: string;
  x: number;
  y: number;
  hp: number;
  stamina?: number;
  lanternOil?: number;
  sanity: number;
  isLanternOn?: boolean;
  moisture?: number;
  temperature?: number;
  daysSurvived: number;
  timeOfDay?: number;
  activeWeapon?: string;
  villageTrustScore?: number;
  storyFlags?: string[];
}

export interface CloudSavePayload {
  version: string;
  saveVersion?: number | string;
  saveSchemaVersion?: number;
  updatedAt: number;
  checkpointName?: string;
  player: CloudSavePlayer;
  inventory: any[];
  questFlags: Record<string, boolean> | string[];
  exploredZones: Record<string, boolean> | string[];
  unlockedShortcuts: string[];
  
  // Dual-compatibility mapping for existing HOLLOW WOODS V1.4 state
  zoneId?: string;
  playerPos?: { x: number; y: number };
  stats?: {
    health: number;
    stamina: number;
    lanternOil: number;
    composure: number;
    isLanternOn: boolean;
    isHiding?: boolean;
    isSprinting?: boolean;
    moisture?: number;
    temperature?: number;
  };
  flags?: string[];
  visitedZones?: string[];
  unlockedZones?: string[];
  currentQuestId?: string;
  quests?: any[];
  unlockedLoreIds?: string[];
  herbPlots?: any[];
  dayCount?: number;
  timeOfDay?: number;
  equippedSlots?: any;
  storageChest?: any[];
  storageChestInventory?: any[];
  campfireLevel?: number;
  campfireFuel?: number;
  unlockedBestiary?: string[];
  observedCreatures?: string[];
  memoryAwakeningStage?: number;
  timestamp?: number;
  legacyExtraData?: Record<string, any>;
}

export interface CloudSaveMeta {
  version: string;
  updatedAt: number;
  currentMap: string;
  daysSurvived: number;
  sanity: number;
  hp?: number;
  checkpoint?: string;
}

export interface CloudSaveResult {
  ok: boolean;
  source?: 'cloud' | 'local' | 'local_guest';
  reason?: 'QUOTA_EXCEEDED' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'INVALID_STATE';
  error?: any;
}

export interface GameSettingsData {
  updatedAt?: number;
  graphicsQuality?: string;
  masterVolume?: number;
  musicVolume?: number;
  sfxVolume?: number;
  isMuted?: boolean;
  [key: string]: any;
}

/**
 * Kiểm tra dung lượng byte thực tế của dữ liệu trước khi gửi lên p2.storage
 */
export function getByteSize(data: any): number {
  try {
    return new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data)).length;
  } catch {
    return 0;
  }
}

/**
 * Chuẩn hóa & nâng cấp dữ liệu Save từ V1.3 lên V1.4 nếu gặp file cũ
 */
export function migrateSaveSchema(rawData: any): CloudSavePayload | null {
  if (!rawData || typeof rawData !== 'object') return null;

  // Trích xuất player thông qua cấu trúc mới (rawData.player) hoặc cấu trúc cũ (rawData.stats, rawData.playerPos)
  const p = rawData.player || {};
  const stats = rawData.stats || {};
  const playerPos = rawData.playerPos || {};

  const mapId: string = p.mapId || rawData.zoneId || "bellhollow";
  const x: number = Number(p.x ?? playerPos.x ?? 800);
  const y: number = Number(p.y ?? playerPos.y ?? 700);
  const hp: number = Math.max(0, Math.min(100, Number(p.hp ?? stats.health ?? 100)));
  const stamina: number = Math.max(0, Math.min(100, Number(p.stamina ?? stats.stamina ?? 100)));
  const lanternOil: number = Math.max(0, Math.min(100, Number(p.lanternOil ?? stats.lanternOil ?? 100)));
  const sanity: number = Math.max(0, Math.min(100, Number(p.sanity ?? stats.composure ?? 100)));
  const isLanternOn: boolean = typeof p.isLanternOn === 'boolean' ? p.isLanternOn : (typeof stats.isLanternOn === 'boolean' ? stats.isLanternOn : true);
  const moisture: number = Math.max(0, Math.min(100, Number(p.moisture ?? stats.moisture ?? 0)));
  const temperature: number = Math.max(0, Math.min(100, Number(p.temperature ?? stats.temperature ?? 80)));
  const daysSurvived: number = Math.max(1, Math.floor(Number(p.daysSurvived ?? rawData.dayCount ?? 1)));
  const timeOfDay: number = Math.max(0, Math.min(360, Number(p.timeOfDay ?? rawData.timeOfDay ?? 0)));

  // Inventory: đồng bộ mảng cặp [itemId, count]
  let inventory: [string, number][] = [];
  if (Array.isArray(rawData.inventory)) {
    for (const item of rawData.inventory) {
      if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
        const count = Number(item[1]);
        if (!isNaN(count) && count > 0) {
          inventory.push([item[0].trim(), Math.floor(count)]);
        }
      } else if (item && typeof item === 'object') {
        const key = item.id || item.itemId;
        const count = Number(item.count);
        if (key && !isNaN(count) && count > 0) {
          inventory.push([String(key).trim(), Math.floor(count)]);
        }
      }
    }
  }

  // Cờ sự kiện & nhiệm vụ (questFlags / flags)
  const questFlags: Record<string, boolean> = {};
  if (rawData.questFlags && typeof rawData.questFlags === 'object' && !Array.isArray(rawData.questFlags)) {
    for (const [k, v] of Object.entries(rawData.questFlags)) {
      if (v) questFlags[k] = true;
    }
  } else if (Array.isArray(rawData.questFlags)) {
    for (const f of rawData.questFlags) {
      if (typeof f === 'string' && f.trim()) questFlags[f.trim()] = true;
    }
  }
  if (Array.isArray(rawData.flags)) {
    for (const f of rawData.flags) {
      if (typeof f === 'string' && f.trim()) questFlags[f.trim()] = true;
    }
  }

  // Dữ liệu Fog of War của Mini-map (exploredZones / visitedZones)
  const exploredZones: Record<string, boolean> = {};
  if (rawData.exploredZones && typeof rawData.exploredZones === 'object' && !Array.isArray(rawData.exploredZones)) {
    for (const [k, v] of Object.entries(rawData.exploredZones)) {
      if (v) exploredZones[k] = true;
    }
  } else if (Array.isArray(rawData.exploredZones)) {
    for (const z of rawData.exploredZones) {
      if (typeof z === 'string' && z.trim()) exploredZones[z.trim()] = true;
    }
  }
  if (Array.isArray(rawData.visitedZones)) {
    for (const z of rawData.visitedZones) {
      if (typeof z === 'string' && z.trim()) exploredZones[z.trim()] = true;
    }
  }
  if (Object.keys(exploredZones).length === 0) {
    exploredZones['fog_crossing'] = true;
    exploredZones['bellhollow'] = true;
  }

  // Tuyến đường tắt & phân khu đã khai mở (unlockedShortcuts / unlockedZones)
  let unlockedShortcuts: string[] = [];
  if (Array.isArray(rawData.unlockedShortcuts) && rawData.unlockedShortcuts.length > 0) {
    unlockedShortcuts = rawData.unlockedShortcuts.filter((s: any) => typeof s === 'string' && s.trim());
  } else if (Array.isArray(rawData.unlockedZones) && rawData.unlockedZones.length > 0) {
    unlockedShortcuts = rawData.unlockedZones.filter((s: any) => typeof s === 'string' && s.trim());
  } else {
    unlockedShortcuts = ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods'];
  }

  // Khôi phục các hệ thống phụ trợ V1.4
  const equippedSlots = (rawData.equippedSlots && typeof rawData.equippedSlots === 'object') ? rawData.equippedSlots : { body: null, feet: null, back: null, charm: null };
  const storageChest: [string, number][] = [];
  const rawChest = rawData.storageChest ?? rawData.storageChestInventory;
  if (Array.isArray(rawChest)) {
    for (const item of rawChest) {
      if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
        const count = Number(item[1]);
        if (!isNaN(count) && count > 0) {
          storageChest.push([item[0].trim(), Math.floor(count)]);
        }
      }
    }
  }

  const campfireLevel = typeof rawData.campfireLevel === 'number' ? Math.max(1, Math.min(3, Math.floor(rawData.campfireLevel))) : 1;
  const campfireFuel = typeof rawData.campfireFuel === 'number' ? Math.max(0, rawData.campfireFuel) : 180;
  const rawBestiary = rawData.observedCreatures ?? rawData.unlockedBestiary;
  const observedCreatures: string[] = Array.isArray(rawBestiary) ? rawBestiary.filter((c: any) => typeof c === 'string' && c.trim()) : [];
  const memoryAwakeningStage = typeof rawData.memoryAwakeningStage === 'number' ? Math.max(0, Math.min(3, Math.floor(rawData.memoryAwakeningStage))) : 0;
  const quests = Array.isArray(rawData.quests) ? rawData.quests : [];
  const currentQuestId = typeof rawData.currentQuestId === 'string' && rawData.currentQuestId ? rawData.currentQuestId : "Q01_MEET_EDDA";
  const unlockedLoreIds = Array.isArray(rawData.unlockedLoreIds) ? rawData.unlockedLoreIds.filter((l: any) => typeof l === 'string') : [];
  const herbPlots = Array.isArray(rawData.herbPlots) ? rawData.herbPlots : [];
  const checkpointName = typeof rawData.checkpointName === 'string' && rawData.checkpointName ? rawData.checkpointName : "Điểm lưu Bellhollow";
  const updatedAt = typeof rawData.updatedAt === 'number' && !isNaN(rawData.updatedAt) ? rawData.updatedAt : (typeof rawData.timestamp === 'number' ? rawData.timestamp : Date.now());

  return {
    version: typeof rawData.version === 'string' && rawData.version ? rawData.version : SAVE_VERSION,
    saveVersion: typeof rawData.saveVersion === 'number' || typeof rawData.saveVersion === 'string'
      ? rawData.saveVersion
      : undefined,
    saveSchemaVersion: typeof rawData.saveSchemaVersion === 'number' ? rawData.saveSchemaVersion : undefined,
    updatedAt,
    checkpointName,
    player: {
      mapId,
      x,
      y,
      hp,
      stamina,
      lanternOil,
      sanity,
      isLanternOn,
      moisture,
      temperature,
      daysSurvived,
      timeOfDay,
      activeWeapon: rawData.activeWeapon ?? p.activeWeapon,
      villageTrustScore: rawData.villageTrustScore ?? p.villageTrustScore,
      storyFlags: rawData.storyFlags ?? p.storyFlags,
    },
    inventory,
    questFlags,
    exploredZones,
    unlockedShortcuts,
    // Đồng bộ ngược cho SaveManager / PlayerState
    zoneId: mapId,
    playerPos: { x, y },
    stats: {
      health: hp,
      stamina,
      lanternOil,
      composure: sanity,
      isLanternOn,
      isHiding: false,
      isSprinting: false,
      moisture,
      temperature,
    },
    flags: Object.keys(questFlags),
    visitedZones: Object.keys(exploredZones),
    unlockedZones: unlockedShortcuts,
    currentQuestId,
    quests,
    unlockedLoreIds,
    herbPlots,
    dayCount: daysSurvived,
    timeOfDay,
    equippedSlots,
    storageChest,
    storageChestInventory: storageChest,
    campfireLevel,
    campfireFuel,
    unlockedBestiary: observedCreatures,
    observedCreatures,
    memoryAwakeningStage,
    timestamp: updatedAt,
    legacyExtraData: rawData.legacyExtraData || {}
  };
}

/**
 * Lưu tiến trình ngay lập tức (dùng tại điểm Save, chuyển map, hoặc p2.onBeforeUnload)
 */
export async function saveGameNow(gameState: any): Promise<CloudSaveResult> {
  const p2 = typeof window !== 'undefined' ? window.p2 : undefined;
  const payload = migrateSaveSchema({
    ...gameState,
    updatedAt: Date.now(),
  });

  if (!payload) {
    return { ok: false, reason: 'INVALID_STATE' };
  }

  if (QA_BUILD) {
    cancelPendingGameSave();
    try {
      localStorage.setItem(QA_SAVE_KEY, JSON.stringify(payload));
      return { ok: true, source: 'local' };
    } catch {
      return { ok: false, reason: 'UNAVAILABLE' };
    }
  }

  // 1. Luôn lưu bản sao cục bộ trước để đảm bảo không bao giờ mất dữ liệu
  try {
    const jsonStr = JSON.stringify(payload);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${LOCAL_PREFIX}slot_1`, jsonStr);
      // Giữ đồng bộ cả khóa lưu truyền thống của SaveManager
      localStorage.setItem('hollow_woods_v1_savegame', jsonStr);
    }
  } catch (e) {
    console.warn("[CloudSaveService] LocalStorage backup warning:", e);
  }

  if (!p2 || !p2.storage) {
    return { ok: true, source: "local" };
  }

  // 2. Kiểm tra giới hạn payload <= 64 KB và tối đa 32 khóa
  const byteSize = getByteSize(payload);
  if (byteSize > MAX_KEY_BYTES) {
    console.error(`[CloudSaveService] Save payload quá lớn (${byteSize} bytes), vượt ngưỡng an toàn 64 KB.`);
    return { ok: false, reason: "QUOTA_EXCEEDED" };
  }

  const payloadKeyCount = Object.keys(payload).length;
  if (payloadKeyCount > MAX_KEY_COUNT) {
    console.warn(`[CloudSaveService] Cảnh báo: payload có ${payloadKeyCount} khóa (vượt ngưỡng 32 khóa).`);
  }

  const metaPayload: CloudSaveMeta = {
    version: SAVE_VERSION,
    updatedAt: payload.updatedAt,
    currentMap: payload.player.mapId,
    daysSurvived: payload.player.daysSurvived,
    sanity: payload.player.sanity,
    hp: payload.player.hp,
    checkpoint: payload.checkpointName,
  };

  try {
    // V152-08: Đồng bộ lưu qua "progress" theo đặc tả SDK v1.1
    await Promise.all([
      p2.storage.set(SAVE_KEY_PROGRESS, payload),
      p2.storage.set(SAVE_KEY_SLOT_1, payload),
      p2.storage.set(SAVE_KEY_META, metaPayload),
    ]);
    latestPendingState = null;
    return { ok: true, source: "cloud" };
  } catch (err: any) {
    const code = err?.code || 'UNAVAILABLE';
    switch (code) {
      case "UNAUTHENTICATED":
        // Khách chưa đăng nhập: giữ ở localStorage, sẽ tự đồng bộ khi họ đăng nhập
        return { ok: true, source: "local_guest" };
      case "RATE_LIMITED":
        // Bị giới hạn tần suất: hẹn giờ lưu lại đúng theo retryAfterMs
        scheduleDebouncedSave(payload, err?.retryAfterMs || 3000);
        return { ok: false, reason: "RATE_LIMITED" };
      case "QUOTA_EXCEEDED":
        p2.ui?.toast?.("Dung lượng lưu đám mây đã đầy!", "warning");
        return { ok: false, reason: "QUOTA_EXCEEDED" };
      default:
        console.warn("[CloudSaveService] Cloud save tạm thời gián đoạn, đã giữ bản lưu cục bộ:", err?.message || err);
        return { ok: false, reason: "UNAVAILABLE" };
    }
  }
}

/**
 * Lưu có độ trễ (Debounce) cho các sự kiện nhỏ (nhặt đồ, mở sương mù) để tránh spam API
 */
export function cancelPendingGameSave(): void {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = null;
  latestPendingState = null;
}

export function scheduleDebouncedSave(gameState: any, delayMs: number = 2500): void {
  latestPendingState = gameState;
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    if (latestPendingState) {
      saveGameNow(latestPendingState);
    }
  }, delayMs);
}

/**
 * Tải tiến trình: Tự động so sánh bản Cloud và bản Local, lấy bản mới nhất
 */
export async function loadGameProgress(): Promise<CloudSavePayload | null> {
  if (QA_BUILD) {
    try {
      const raw = localStorage.getItem(QA_SAVE_KEY);
      return raw ? migrateSaveSchema(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  const p2 = typeof window !== 'undefined' ? window.p2 : undefined;
  let localSave: CloudSavePayload | null = null;
  let cloudSave: CloudSavePayload | null = null;

  try {
    if (typeof localStorage !== 'undefined') {
      const rawLocal = localStorage.getItem(`${LOCAL_PREFIX}slot_1`) || localStorage.getItem("hollow_woods_v1_savegame");
      if (rawLocal) localSave = migrateSaveSchema(JSON.parse(rawLocal));
    }
  } catch (e) {
    console.warn("[CloudSaveService] Lỗi đọc local backup:", e);
  }

  if (p2 && p2.storage) {
    try {
      // V152-08: Thử tải qua khóa chuẩn "progress", fallback sang slot 1
      let rawCloud = await p2.storage.get<any>(SAVE_KEY_PROGRESS);
      if (!rawCloud) {
        rawCloud = await p2.storage.get<any>(SAVE_KEY_SLOT_1);
      }
      if (rawCloud) cloudSave = migrateSaveSchema(rawCloud);
    } catch (err: any) {
      console.warn("[CloudSaveService] Không thể tải Cloud Save, dùng bản lưu cục bộ:", err?.message || err);
    }
  }

  if (cloudSave && localSave) {
    const chosen = (cloudSave.updatedAt || 0) >= (localSave.updatedAt || 0) ? cloudSave : localSave;
    if (chosen === cloudSave && typeof localStorage !== 'undefined') {
      try {
        const jsonStr = JSON.stringify(cloudSave);
        localStorage.setItem(`${LOCAL_PREFIX}slot_1`, jsonStr);
        localStorage.setItem("hollow_woods_v1_savegame", jsonStr);
      } catch {}
    }
    return chosen;
  }
  const result = cloudSave || localSave || null;
  if (result && typeof localStorage !== 'undefined') {
    try {
      const jsonStr = JSON.stringify(result);
      localStorage.setItem(`${LOCAL_PREFIX}slot_1`, jsonStr);
      localStorage.setItem("hollow_woods_v1_savegame", jsonStr);
    } catch {}
  }
  return result;
}

/**
 * Đăng ký các sự kiện vòng đời SDK để chống mất dữ liệu khi đóng tab hoặc mới đăng nhập
 */
export function bindCloudSaveLifecycle(getCurrentGameStateFn: () => any): () => void {
  if (QA_BUILD) return cancelPendingGameSave;
  const p2 = typeof window !== 'undefined' ? window.p2 : undefined;
  if (!p2) return () => {};

  // 1. Cơ hội lưu cuối cùng khi người chơi đóng tab hoặc rời trang
  let cleanupUnload: (() => void) | null = null;
  if (typeof p2.onBeforeUnload === 'function') {
    cleanupUnload = p2.onBeforeUnload(() => {
      const state = (typeof getCurrentGameStateFn === 'function' ? getCurrentGameStateFn() : null) || latestPendingState;
      if (state) {
        saveGameNow(state);
      }
    });
  }

  // 2. Khi khách bấm đăng nhập giữa chừng, đẩy ngay tiến trình đang chơi lên đám mây
  let cleanupAuth: (() => void) | null = null;
  if (p2.auth && typeof p2.auth.onChange === 'function') {
    cleanupAuth = p2.auth.onChange(async (player) => {
      if (player) {
        const currentState = getCurrentGameStateFn?.();
        if (currentState) {
          const res = await saveGameNow(currentState);
          if (res.ok) {
            p2.ui?.toast?.("Đã đồng bộ tiến trình lên đám mây!", "success");
          }
        }
      }
    });
  }

  return () => {
    if (cleanupUnload) cleanupUnload();
    if (cleanupAuth) cleanupAuth();
  };
}

/**
 * Lưu cấu hình người chơi vào key hw_settings
 */
export async function saveSettings(settings: GameSettingsData): Promise<CloudSaveResult> {
  const p2 = !QA_BUILD && typeof window !== 'undefined' ? window.p2 : undefined;
  const payload: GameSettingsData = {
    updatedAt: Date.now(),
    graphicsQuality: settings.graphicsQuality || (typeof localStorage !== 'undefined' ? localStorage.getItem(GRAPHICS_QUALITY_KEY) || 'HIGH' : 'HIGH'),
    masterVolume: settings.masterVolume ?? 0.8,
    musicVolume: settings.musicVolume ?? 0.7,
    sfxVolume: settings.sfxVolume ?? 0.8,
    isMuted: settings.isMuted ?? false,
    ...settings
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(QA_BUILD ? QA_SETTINGS_KEY : `${LOCAL_PREFIX}settings`, JSON.stringify(payload));
    }
  } catch (e) {
    console.warn('[CloudSaveService] LocalStorage settings warning:', e);
  }

  if (!p2 || !p2.storage) {
    return { ok: true, source: 'local' };
  }

  const byteSize = getByteSize(payload);
  if (byteSize > MAX_KEY_BYTES) {
    return { ok: false, reason: 'QUOTA_EXCEEDED' };
  }

  try {
    await p2.storage.set(SAVE_KEY_SETTINGS, payload);
    return { ok: true, source: 'cloud' };
  } catch (err: any) {
    const code = err?.code || 'UNAVAILABLE';
    return { ok: false, reason: code };
  }
}

/**
 * Tải cấu hình người chơi từ Cloud / Local
 */
export async function loadSettings(): Promise<GameSettingsData | null> {
  const p2 = !QA_BUILD && typeof window !== 'undefined' ? window.p2 : undefined;
  let localSettings: GameSettingsData | null = null;
  let cloudSettings: GameSettingsData | null = null;

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(QA_BUILD ? QA_SETTINGS_KEY : `${LOCAL_PREFIX}settings`);
      if (raw) localSettings = JSON.parse(raw);
    }
  } catch {}

  if (p2 && p2.storage) {
    try {
      cloudSettings = await p2.storage.get<GameSettingsData>(SAVE_KEY_SETTINGS);
    } catch {}
  }

  if (cloudSettings && localSettings) {
    return (cloudSettings.updatedAt || 0) >= (localSettings.updatedAt || 0) ? cloudSettings : localSettings;
  }
  return cloudSettings || localSettings || null;
}

/**
 * Singleton service class
 */
export class CloudSaveService {
  private static instance: CloudSaveService | null = null;

  public static getInstance(): CloudSaveService {
    if (!CloudSaveService.instance) {
      CloudSaveService.instance = new CloudSaveService();
    }
    return CloudSaveService.instance;
  }

  public getByteSize(data: any): number {
    return getByteSize(data);
  }

  public migrateSaveSchema(rawData: any): CloudSavePayload | null {
    return migrateSaveSchema(rawData);
  }

  public async saveGameNow(gameState: any): Promise<CloudSaveResult> {
    return saveGameNow(gameState);
  }

  public scheduleDebouncedSave(gameState: any, delayMs: number = 2500): void {
    scheduleDebouncedSave(gameState, delayMs);
  }

  public async loadGameProgress(): Promise<CloudSavePayload | null> {
    return loadGameProgress();
  }

  public bindCloudSaveLifecycle(getCurrentGameStateFn: () => any): () => void {
    return bindCloudSaveLifecycle(getCurrentGameStateFn);
  }

  public async saveSettings(settings: GameSettingsData): Promise<CloudSaveResult> {
    return saveSettings(settings);
  }

  public async loadSettings(): Promise<GameSettingsData | null> {
    return loadSettings();
  }
}
