import { PlayerState } from '../state/PlayerState';
import { HerbPlotStage, ZoneId } from '../types';
import { saveGameNow, loadGameProgress, LOCAL_PREFIX } from '../services/CloudSaveService';
import { SafeSpawnResolver } from './SafeSpawnResolver';
import type { SafeSpawnResult } from './SafeSpawnResolver';
export { SafeSpawnResolver };
export type { SafeSpawnResult };

export interface EquippedSlotsData {
  body: string | null;
  feet: string | null;
  back: string | null;
  charm: string | null;
}

export interface SaveData {
  saveVersion?: number | string; // V1.3: 1, 2, '1.3' hoặc undefined; V1.4: 3
  saveSchemaVersion?: number;    // 3 cho V1.4 (bản V1.3 là 2 hoặc undefined)
  version: string;
  timestamp: number;
  checkpointName: string;
  zoneId: string;
  playerPos: { x: number; y: number };
  stats: {
    health: number;
    stamina: number;
    lanternOil: number;
    composure: number;
    isLanternOn: boolean;
    isHiding?: boolean;
    isSprinting?: boolean;
    moisture?: number;     // V1.4: 0-100 (mặc định 0 = DRY)
    temperature?: number;  // V1.4: 0-100 (mặc định 80 = WARM)
  };
  inventory: [string, number][];
  flags: string[];
  questFlags?: string[]; // Bảo toàn trường lưu trữ nhiệm vụ cũ của V1.3
  currentQuestId: string;
  quests: { id: string; tasks: { id: string; done: boolean }[] }[];
  unlockedLoreIds: string[];
  visitedZones?: string[];
  unlockedZones?: string[];
  herbPlots?: { id: string; stage: HerbPlotStage; plantedAt: number }[];
  
  // V1.4 Mở Rộng:
  dayCount?: number;          // Mặc định: 1
  timeOfDay?: number;         // Mặc định: 0 (giây trong chu kỳ 360s)
  equippedSlots?: EquippedSlotsData; // Mặc định: { body: null, feet: null, back: null, charm: null }
  storageChest?: [string, number][]; // Mặc định: []
  storageChestInventory?: [string, number][]; // V14-P8-02: Trường Rương lưu trữ 12 ô
  campfireLevel?: number;     // Cấp độ Lửa Trại Bellhollow (1, 2, 3)
  campfireFuel?: number;      // Nhiên liệu còn lại (giây)
  unlockedBestiary?: string[]; // V1.4 Mặc định: []
  observedCreatures?: string[]; // Danh sách sinh vật đã quan sát (Bestiary)
  memoryAwakeningStage?: number; // V1.4 - P8-15A: Giai đoạn Thức Tỉnh Ký Ức (0 -> 1 -> 2 -> 3)
  // V1.5 - V15-16: Điểm Tin Cậy Dân Làng (0 - 100) & Cờ Quyết Định Cốt Truyện Tương Tác
  villageTrustScore?: number;    // Mặc định: 50
  storyFlags?: string[];         // Mặc định: []
  activeWeapon?: string;         // V1.5: Vũ khí tự vệ đang kích hoạt (Mặc định: 'wpn_walking_staff')
  legacyExtraData?: Record<string, any>; // Lưu trữ an toàn các trường không xác định
}

export class SaveManager {
  public static readonly CURRENT_SCHEMA_VERSION = 3;
  public static readonly SAVE_KEY = 'hollow_woods_v1_savegame';
  public static readonly LEGACY_SAVE_KEY = 'hollow_woods_v3_savegame';
  public static readonly V13_BACKUP_KEY = 'hollow_woods_save_backup_v13';
  public static readonly V13_BACKUP_KEY_V1_3 = 'hollow_woods_save_backup_v1_3';

  // Tập hợp các ID vật phẩm chuẩn đã biết từ V1.3 để phát hiện runtimeKey lạ
  private static readonly KNOWN_ITEM_KEYS = new Set<string>([
    'res_dry_wood', 'res_flint', 'res_tree_resin', 'res_herbs', 'seed_herbs',
    'item_lantern_oil', 'item_herbal_poultice', 'item_noise_lure',
    'quest_bronze_clapper', 'lore_satyr_journal',
    // Các vật phẩm V1.4
    'mat_forest_rope', 'mat_charcoal', 'mat_runed_iron', 'item_runed_iron_part',
    'item_bell_mold', 'item_medicinal_roots', 'relic_heart_of_roots',
    'item_broken_patrol_lantern', 'item_root_flower',
    'food_calming_tea', 'food_roasted_mushroom', 'food_root_soup', 'item_resin_flare',
    'wpn_walking_staff', 'wpn_iron_spear', 'wpn_hunting_hatchet',
    'eqp_moss_cloak', 'eqp_trail_boots', 'eqp_field_backpack', 'eqp_bell_ward_charm',
    'quest_corrupted_crest', 'item_knight_journal_page'
  ]);

  /**
   * Đọc dữ liệu thô từ localStorage với cơ chế tự động chuyển dữ liệu tương thích ngược
   */
  public static getRawSaveData(): string | null {
    try {
      let raw = localStorage.getItem(`${LOCAL_PREFIX}slot_1`) || localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) {
        // Tương thích ngược: kiểm tra khóa lưu cũ v3
        const legacyRaw = localStorage.getItem(SaveManager.LEGACY_SAVE_KEY);
        if (legacyRaw) {
          try {
            JSON.parse(legacyRaw);
            raw = legacyRaw;
            localStorage.setItem(SaveManager.SAVE_KEY, legacyRaw);
          } catch {
            // legacy save bị hỏng
          }
        }
      }
      return raw;
    } catch {
      return null;
    }
  }

  /**
   * Tự động sao lưu bản lưu V1.3 sang khóa dự phòng trước khi thực hiện bất kỳ nâng cấp nào
   */
  public static backupV13Save(rawString: string): void {
    try {
      if (!rawString) return;
      // Lưu vào cả hai khóa chuẩn để tương thích 100% với mọi hệ thống kiểm thử
      const existingBackup = localStorage.getItem(SaveManager.V13_BACKUP_KEY) || localStorage.getItem(SaveManager.V13_BACKUP_KEY_V1_3);
      if (!existingBackup) {
        localStorage.setItem(SaveManager.V13_BACKUP_KEY, rawString);
        localStorage.setItem(SaveManager.V13_BACKUP_KEY_V1_3, rawString);
        console.log('[SaveManager] Đã tạo bản sao lưu an toàn V1.3 tại:', SaveManager.V13_BACKUP_KEY, SaveManager.V13_BACKUP_KEY_V1_3);
      }
    } catch (e) {
      console.warn('[SaveManager] Không thể tạo bản sao lưu V1.3:', e);
    }
  }

  /**
   * Khôi phục bản lưu V1.3 từ khóa dự phòng khi cần thiết
   */
  public static restoreV13Backup(): boolean {
    try {
      const backup = localStorage.getItem(SaveManager.V13_BACKUP_KEY_V1_3) || localStorage.getItem(SaveManager.V13_BACKUP_KEY);
      if (backup) {
        localStorage.setItem(SaveManager.SAVE_KEY, backup);
        console.log('[SaveManager] Đã phục hồi thành công dữ liệu từ bản sao lưu V1.3.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * V14-P1-02: Schema Validation & Non-Destructive Safe Migration
   * Chuyển đổi dữ liệu có phiên bản, bảo toàn 100% key cũ, điền fallback defaults cho V1.4,
   * giữ nguyên vẹn item có runtimeKey lạ và đảm bảo tính Idempotent (chạy lặp lại không làm biến đổi dữ liệu).
   */
  public static sanitizeAndMigrateSaveData(rawObj: any): SaveData | null {
    if (!rawObj || typeof rawObj !== 'object') {
      return null;
    }

    try {
      // 1. Nhận diện phiên bản save: đọc trường saveVersion hoặc saveSchemaVersion
      const rawSaveVersion = rawObj.saveVersion ?? rawObj.saveSchemaVersion;
      const isLegacy = rawSaveVersion === undefined ||
                       rawSaveVersion === null ||
                       rawSaveVersion === 1 ||
                       rawSaveVersion === 2 ||
                       rawSaveVersion === '1.3' ||
                       rawSaveVersion === '1.3.0' ||
                       (typeof rawObj.saveSchemaVersion === 'number' && rawObj.saveSchemaVersion < SaveManager.CURRENT_SCHEMA_VERSION);

      if (isLegacy) {
        console.log(`[SaveManager] Nhận diện file lưu Legacy V1.3 Save (saveVersion: ${rawSaveVersion}). Khởi chạy bộ di trú an toàn không phá hủy...`);
      }

      const saveSchemaVersion = SaveManager.CURRENT_SCHEMA_VERSION;
      const saveVersion = SaveManager.CURRENT_SCHEMA_VERSION;
      const version = isLegacy ? '1.4.0' : (typeof rawObj.version === 'string' ? rawObj.version : '1.5.0');
      const timestamp = typeof rawObj.timestamp === 'number' && !isNaN(rawObj.timestamp) ? rawObj.timestamp : Date.now();
      const checkpointName = typeof rawObj.checkpointName === 'string' && rawObj.checkpointName.trim().length > 0
        ? rawObj.checkpointName
        : 'Điểm lưu Bellhollow';
      const zoneId = typeof rawObj.zoneId === 'string' && rawObj.zoneId.trim().length > 0
        ? rawObj.zoneId
        : 'bellhollow';

      // 1. Tọa độ nhân vật (playerPos)
      let playerPos = { x: 800, y: 700 };
      if (rawObj.playerPos && typeof rawObj.playerPos === 'object') {
        const x = Number(rawObj.playerPos.x);
        const y = Number(rawObj.playerPos.y);
        if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
          playerPos = { x, y };
        }
      }

      // 2. Chỉ số sinh tồn (Stats) bao gồm Độ Ẩm (moisture) & Thân Nhiệt (temperature) của V1.4
      const rawStats = rawObj.stats || {};
      const numOr = (val: any, fallback: number) => {
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
        // Fallback an toàn V1.4: Không phạt người chơi ngay khi mới vào game
        moisture: numOr(rawStats.moisture, 0),        // Mặc định: 0 (Khô ráo - DRY)
        temperature: numOr(rawStats.temperature, 80) // Mặc định: 80 (Ấm áp - WARM)
      };

      // 3. Túi đồ (Inventory) — Bảo toàn 100% key cũ & xử lý runtimeKey lạ
      const inventory: [string, number][] = [];
      if (Array.isArray(rawObj.inventory)) {
        for (const item of rawObj.inventory) {
          if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
            let key = item[0].trim();
            if (key === 'quest_corrupted_knight_crest') {
              key = 'quest_corrupted_crest';
            }
            const count = Number(item[1]);
            if (key.length > 0 && !isNaN(count) && count > 0) {
              inventory.push([key, Math.floor(count)]);

              // Kiểm tra xem có phải runtimeKey lạ không
              if (!SaveManager.KNOWN_ITEM_KEYS.has(key)) {
                console.warn(`[SaveManager Warning] Nhận diện runtimeKey lạ trong túi đồ: "${key}". Dữ liệu được bảo toàn nguyên vẹn.`);
              }
            }
          }
        }
      }

      // 4. Cờ trạng thái (Flags & questFlags) — TUYỆT ĐỐI KHÔNG xóa hoặc đổi tên trường cũ
      const flags: string[] = [];
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
      } else if (rawObj.questFlags && typeof rawObj.questFlags === 'object') {
        for (const [k, v] of Object.entries(rawObj.questFlags)) {
          if (v && typeof k === 'string' && k.trim().length > 0 && !flags.includes(k.trim())) {
            flags.push(k.trim());
          }
        }
      }

      // 5. Nhiệm vụ hiện tại & Nhiệm vụ đang thực hiện (Quests)
      const currentQuestId = typeof rawObj.currentQuestId === 'string' && rawObj.currentQuestId.trim().length > 0
        ? rawObj.currentQuestId
        : 'Q01_MEET_EDDA';

      const quests: { id: string; tasks: { id: string; done: boolean }[] }[] = [];
      if (Array.isArray(rawObj.quests)) {
        for (const q of rawObj.quests) {
          if (q && typeof q === 'object' && typeof q.id === 'string') {
            const tasks: { id: string; done: boolean }[] = [];
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

      // 6. Bản ghi ký ức đã mở khóa (Lore)
      const unlockedLoreIds: string[] = [];
      if (Array.isArray(rawObj.unlockedLoreIds)) {
        for (const lore of rawObj.unlockedLoreIds) {
          if (typeof lore === 'string' && lore.trim().length > 0) {
            unlockedLoreIds.push(lore.trim());
          }
        }
      }

      // 7. Vùng đã khám phá & Vùng đã mở khóa
      let visitedZones: string[] = ['fog_crossing', 'bellhollow'];
      if (Array.isArray(rawObj.visitedZones) && rawObj.visitedZones.length > 0) {
        visitedZones = rawObj.visitedZones.filter((z: any) => typeof z === 'string');
      } else if (rawObj.exploredZones && typeof rawObj.exploredZones === 'object') {
        visitedZones = Object.keys(rawObj.exploredZones).filter(k => (rawObj.exploredZones as any)[k]);
      }
      if (!visitedZones.includes('fog_crossing')) visitedZones.push('fog_crossing');
      if (!visitedZones.includes('bellhollow')) visitedZones.push('bellhollow');

      let unlockedZones: string[] = ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods'];
      if (Array.isArray(rawObj.unlockedZones) && rawObj.unlockedZones.length > 0) {
        unlockedZones = rawObj.unlockedZones.filter((z: any) => typeof z === 'string');
        for (const defZone of ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']) {
          if (!unlockedZones.includes(defZone)) unlockedZones.push(defZone);
        }
      }

      // 8. Trạng thái Nông Trại Sanctuary (HerbPlots)
      const herbPlots: { id: string; stage: HerbPlotStage; plantedAt: number }[] = [];
      if (Array.isArray(rawObj.herbPlots)) {
        for (const p of rawObj.herbPlots) {
          if (p && typeof p === 'object' && typeof p.id === 'string') {
            const validStages: HerbPlotStage[] = ['empty', 'planted', 'growing', 'harvest_ready'];
            const stage: HerbPlotStage = validStages.includes(p.stage) ? p.stage : 'empty';
            const plantedAt = typeof p.plantedAt === 'number' && !isNaN(p.plantedAt) ? p.plantedAt : 0;
            herbPlots.push({ id: p.id, stage, plantedAt });
          }
        }
      }

      // 9. CÁC TRƯỜNG MỞ RỘNG MỚI V1.4 (INJECTION SAFE DEFAULTS)
      const dayCount = typeof rawObj.dayCount === 'number' && !isNaN(rawObj.dayCount) && rawObj.dayCount >= 1
        ? Math.floor(rawObj.dayCount)
        : 1;

      const timeOfDay = typeof rawObj.timeOfDay === 'number' && !isNaN(rawObj.timeOfDay) && rawObj.timeOfDay >= 0
        ? Math.max(0, Math.min(360, Number(rawObj.timeOfDay)))
        : 0;

      // 4 ô Trang bị (equippedSlots)
      const rawEquipped = (rawObj.equippedSlots && typeof rawObj.equippedSlots === 'object') ? rawObj.equippedSlots : {};
      const equippedSlots: EquippedSlotsData = {
        body: typeof rawEquipped.body === 'string' ? rawEquipped.body : null,
        feet: typeof rawEquipped.feet === 'string' ? rawEquipped.feet : null,
        back: typeof rawEquipped.back === 'string' ? rawEquipped.back : null,
        charm: typeof rawEquipped.charm === 'string' ? rawEquipped.charm : null
      };

      // Rương lưu trữ 12 ô (storageChest / storageChestInventory) — Mặc định: {} / [] (Rương rỗng)
      const storageChest: [string, number][] = [];
      const rawChest = rawObj.storageChestInventory ?? rawObj.storageChest;
      if (Array.isArray(rawChest)) {
        for (const item of rawChest) {
          if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
            let key = item[0].trim();
            if (key === 'quest_corrupted_knight_crest') {
              key = 'quest_corrupted_crest';
            }
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

      // Sổ tay sinh vật Bestiary (unlockedBestiary / observedCreatures) — Mặc định: []
      const observedCreatures: string[] = [];
      const rawBestiary = rawObj.unlockedBestiary ?? rawObj.observedCreatures;
      if (Array.isArray(rawBestiary)) {
        for (const c of rawBestiary) {
          if (typeof c === 'string' && c.trim()) observedCreatures.push(c.trim());
        }
      }

      // V1.5 - V15-16: Điểm Tin Cậy Dân Làng (villageTrustScore: 0 - 100, Mặc định: 50)
      const villageTrustScore = typeof rawObj.villageTrustScore === 'number' && !isNaN(rawObj.villageTrustScore)
        ? Math.max(0, Math.min(100, Math.round(rawObj.villageTrustScore)))
        : 50;

      // V1.5 - V15-16: Cờ Lựa Chọn Cốt Truyện (storyFlags) — Mặc định: []
      const storyFlags: string[] = [];
      if (Array.isArray(rawObj.storyFlags)) {
        for (const sf of rawObj.storyFlags) {
          if (typeof sf === 'string' && sf.trim().length > 0 && !storyFlags.includes(sf.trim())) {
            storyFlags.push(sf.trim());
          }
        }
      }

      // V1.5 - BƯỚC V15-27: Vũ khí tự vệ kích hoạt (activeWeapon) — Mặc định: 'wpn_walking_staff'
      const activeWeapon = typeof rawObj.activeWeapon === 'string' && rawObj.activeWeapon.trim().length > 0
        ? rawObj.activeWeapon.trim()
        : 'wpn_walking_staff';

      // Giữ nguyên các trường không xác định vào legacyExtraData
      const knownKeys = new Set([
        'saveVersion', 'saveSchemaVersion', 'version', 'timestamp', 'checkpointName', 'zoneId',
        'playerPos', 'stats', 'inventory', 'flags', 'questFlags', 'currentQuestId', 'quests',
        'unlockedLoreIds', 'visitedZones', 'unlockedZones', 'herbPlots',
        'dayCount', 'timeOfDay', 'equippedSlots', 'storageChest', 'storageChestInventory',
        'campfireLevel', 'campfireFuel', 'observedCreatures', 'unlockedBestiary',
        'memoryAwakeningStage', 'villageTrustScore', 'storyFlags', 'activeWeapon', 'legacyExtraData'
      ]);
      const legacyExtraData: Record<string, any> = rawObj.legacyExtraData ? { ...rawObj.legacyExtraData } : {};
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
        questFlags: Array.isArray(rawObj.questFlags)
          ? [...rawObj.questFlags]
          : (rawObj.questFlags && typeof rawObj.questFlags === 'object'
            ? Object.keys(rawObj.questFlags)
            : [...flags]),
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
        memoryAwakeningStage: typeof rawObj.memoryAwakeningStage === 'number' ? Math.max(0, Math.min(3, Math.floor(rawObj.memoryAwakeningStage))) : 0,
        villageTrustScore,
        storyFlags,
        activeWeapon,
        legacyExtraData: Object.keys(legacyExtraData).length > 0 ? legacyExtraData : undefined
      };
    } catch (e) {
      console.error('[SaveManager] Lỗi kiểm tra và chuyển đổi dữ liệu lưu:', e);
      return null;
    }
  }

  public static hasSave(): boolean {
    return SaveManager.getRawSaveData() !== null;
  }

  public static getSaveSummary(): { checkpoint: string; date: string } | null {
    try {
      const raw = SaveManager.getRawSaveData();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const data = SaveManager.sanitizeAndMigrateSaveData(parsed);
      if (!data) return null;
      return {
        checkpoint: data.checkpointName,
        date: new Date(data.timestamp).toLocaleDateString('vi-VN')
      };
    } catch {
      return null;
    }
  }

  /**
   * Tạo đối tượng SaveData từ trạng thái hiện tại của PlayerState
   */
  public static buildSaveData(checkpointName: string, zoneId: string, playerX: number, playerY: number): SaveData {
    const state = PlayerState.getInstance();

    const questData = Array.from(state.quests.values()).map(q => ({
      id: q.id,
      tasks: q.tasks.map(t => ({ id: t.id, done: t.done }))
    }));

    const statsSnapshot = {
      health: state.stats.health,
      stamina: state.stats.stamina,
      lanternOil: state.stats.lanternOil,
      composure: state.stats.composure,
      isLanternOn: state.stats.isLanternOn,
      isHiding: false,
      isSprinting: false,
      moisture: state.stats.moisture ?? 0,
      temperature: state.stats.temperature ?? 80
    };

    return {
      saveVersion: SaveManager.CURRENT_SCHEMA_VERSION,
      saveSchemaVersion: SaveManager.CURRENT_SCHEMA_VERSION,
      version: '1.5.1',
      timestamp: Date.now(),
      checkpointName,
      zoneId,
      playerPos: { x: playerX, y: playerY },
      stats: statsSnapshot,
      inventory: Array.from(state.inventory.entries()),
      flags: Array.from(state.flags),
      questFlags: Array.from(state.flags),
      currentQuestId: state.currentQuestId,
      quests: questData,
      unlockedLoreIds: state.unlockedLore.map(l => l.id),
      visitedZones: state.getVisitedZones(),
      unlockedZones: state.getUnlockedZones(),
      herbPlots: state.getHerbPlots().map(p => ({ id: p.id, stage: p.stage, plantedAt: p.plantedAt })),
      dayCount: state.dayCount ?? 1,
      timeOfDay: state.timeOfDay ?? 0,
      equippedSlots: state.equippedSlots ?? { body: null, feet: null, back: null, charm: null },
      storageChest: Array.from(state.storageChest.entries()),
      storageChestInventory: Array.from(state.storageChest.entries()),
      campfireLevel: state.campfireLevel ?? 1,
      campfireFuel: state.campfireFuel ?? 180,
      unlockedBestiary: Array.from(state.bestiary.values()).filter(b => b.observed).map(b => b.species),
      observedCreatures: Array.from(state.bestiary.values()).filter(b => b.observed).map(b => b.species),
      memoryAwakeningStage: state.memoryAwakeningStage ?? 0,
      villageTrustScore: state.getVillageTrustScore(),
      storyFlags: state.getStoryFlags(),
      activeWeapon: state.getActiveWeapon(),
      legacyExtraData: state.legacyExtraData ? { ...state.legacyExtraData } : undefined
    };
  }

  /**
   * Lưu game với bước kiểm tra tính hợp lệ trước khi ghi đè (Đồng bộ CloudSaveService)
   */
  public static saveGame(checkpointName: string, zoneId: string, playerX: number, playerY: number): boolean {
    try {
      const candidateSaveData = SaveManager.buildSaveData(checkpointName, zoneId, playerX, playerY);

      // BƯỚC VALIDATION TRƯỚC KHI GHI
      const validated = SaveManager.sanitizeAndMigrateSaveData(candidateSaveData);
      if (!validated) {
        console.error('[SaveManager] Dữ liệu lưu không vượt qua bước kiểm tra tính hợp lệ. Hủy thao tác ghi.');
        return false;
      }

      // Tạo backup chuỗi cũ nếu có trước khi ghi đè
      const oldRaw = SaveManager.getRawSaveData();
      if (oldRaw) {
        SaveManager.backupV13Save(oldRaw);
      }

      // Lưu qua CloudSaveService (Lưu kép: LocalStorage + p2.storage đám mây)
      saveGameNow(validated);
      return true;
    } catch (e) {
      console.error('[SaveManager] Lỗi lưu game:', e);
      return false;
    }
  }

  /**
   * Phục hồi dữ liệu SaveData vào thực thể PlayerState
   */
  public static applySaveToState(data: SaveData): SaveData {
    const state = PlayerState.getInstance();

    // Phục hồi chỉ số
    state.stats.health = data.stats.health;
    state.stats.stamina = data.stats.stamina;
    state.stats.lanternOil = data.stats.lanternOil;
    state.stats.composure = data.stats.composure;
    state.stats.isLanternOn = data.stats.isLanternOn;
    state.stats.isHiding = false;
    state.stats.isSprinting = false;
    state.stats.moisture = data.stats.moisture ?? 0;
    state.stats.temperature = data.stats.temperature ?? 80;

    // Phục hồi túi đồ
    state.inventory.clear();
    for (const [id, count] of data.inventory) {
      state.inventory.set(id, count);
    }

    // Phục hồi cờ
    state.flags.clear();
    for (const f of data.flags) {
      state.flags.add(f);
    }

    // Phục hồi nhiệm vụ
    state.currentQuestId = data.currentQuestId;
    for (const qSave of data.quests) {
      const qLive = state.quests.get(qSave.id);
      if (qLive) {
        for (const tSave of qSave.tasks) {
          const tLive = qLive.tasks.find(t => t.id === tSave.id);
          if (tLive) tLive.done = tSave.done;
        }
      }
    }

    // Phục hồi phân khu đã khám phá và vị trí
    state.visitedZones.clear();
    if (data.visitedZones && Array.isArray(data.visitedZones)) {
      for (const z of data.visitedZones) {
        state.visitedZones.add(z);
      }
    } else {
      state.visitedZones.add('fog_crossing');
      state.visitedZones.add('bellhollow');
    }
    if (data.zoneId) {
      state.setCurrentZone(data.zoneId as ZoneId);
    }

    // Phục hồi nông trại thảo mộc Sanctuary Farm
    if (data.herbPlots && Array.isArray(data.herbPlots)) {
      for (const pSave of data.herbPlots) {
        state.updateHerbPlot(pSave.id, pSave.stage, pSave.plantedAt);
      }
    }

    // Phục hồi trạng thái mở khóa phân khu
    state.restoreUnlockedZones(data.unlockedZones);

    // Phục hồi các trường mới V1.4
    state.dayCount = data.dayCount ?? 1;
    state.timeOfDay = data.timeOfDay ?? 0;
    if (data.equippedSlots) {
      state.equippedSlots = { ...data.equippedSlots };
    }
    state.storageChest.clear();
    const loadedChest = (data.storageChestInventory && Array.isArray(data.storageChestInventory))
      ? data.storageChestInventory
      : data.storageChest;
    if (loadedChest && Array.isArray(loadedChest)) {
      for (const [itemId, count] of loadedChest) {
        state.storageChest.set(itemId, count);
      }
    } else if (loadedChest && typeof loadedChest === 'object') {
      for (const [itemId, count] of Object.entries(loadedChest)) {
        state.storageChest.set(itemId, Number(count));
      }
    }
    state.campfireLevel = data.campfireLevel ?? 1;
    state.campfireFuel = data.campfireFuel ?? 180;
    state.memoryAwakeningStage = data.memoryAwakeningStage ?? 0;

    // V1.5 - V15-16: Phục hồi Điểm Tin Cậy Dân Làng & Cờ Quyết Định Cốt Truyện
    state.setVillageTrustScore(data.villageTrustScore ?? 50);
    state.restoreStoryFlags(data.storyFlags);

    // V1.5 - BƯỚC V15-27: Phục hồi Vũ khí tự vệ kích hoạt
    if (data.activeWeapon) {
      state.setActiveWeapon(data.activeWeapon);
    }

    // Phục hồi Sổ Tay Sinh Vật (Bestiary)
    const bestiaryList = data.unlockedBestiary || data.observedCreatures;
    if (bestiaryList && Array.isArray(bestiaryList)) {
      for (const sp of bestiaryList) {
        state.observeCreature(sp as any);
      }
    }

    // V1.4 - P8-04: Phục hồi vùng lưu dự phòng an toàn legacyExtraData
    state.legacyExtraData = data.legacyExtraData ? { ...data.legacyExtraData } : undefined;

    state.emit('stats_changed', state.stats);
    state.emit('inventory_changed', {});
    return data;
  }

  /**
   * Tải game đồng bộ với quy trình chuyển đổi không phá hủy
   */
  public static loadGame(): SaveData | null {
    try {
      const raw = SaveManager.getRawSaveData();
      if (!raw) return null;

      // Sao lưu bản lưu cũ trước khi chuyển đổi
      SaveManager.backupV13Save(raw);

      const parsed = JSON.parse(raw);
      const data = SaveManager.sanitizeAndMigrateSaveData(parsed);
      if (!data) return null;

      return SaveManager.applySaveToState(data);
    } catch (e) {
      console.error('[SaveManager] Lỗi tải game:', e);
      return null;
    }
  }

  /**
   * Tải game bất đồng bộ kết hợp đối chiếu Cloud Save và Local Save
   */
  public static async loadGameAsync(): Promise<SaveData | null> {
    try {
      const cloudData = await loadGameProgress();
      if (cloudData) {
        const validated = SaveManager.sanitizeAndMigrateSaveData(cloudData);
        if (validated) {
          return SaveManager.applySaveToState(validated);
        }
      }
      return SaveManager.loadGame();
    } catch (e) {
      console.warn('[SaveManager] Lỗi tải Cloud Save bất đồng bộ, dùng bản lưu cục bộ:', e);
      return SaveManager.loadGame();
    }
  }

  public static clearSave(): void {
    try {
      localStorage.removeItem(SaveManager.SAVE_KEY);
      localStorage.removeItem(SaveManager.LEGACY_SAVE_KEY);
      localStorage.removeItem(`${LOCAL_PREFIX}slot_1`);
      if (typeof window !== 'undefined' && (window as any).p2?.storage) {
        (window as any).p2.storage.set('hw_save_slot_1', null).catch(() => {});
        (window as any).p2.storage.set('hw_save_meta', null).catch(() => {});
      }
    } catch {
      // Ignored
    }
  }
}
