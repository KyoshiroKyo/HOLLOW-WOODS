import { PlayerState } from '../state/PlayerState';
import { HerbPlotStage, ZoneId } from '../types';

export interface EquippedSlotsData {
  body: string | null;
  feet: string | null;
  back: string | null;
  charm: string | null;
}

export interface SaveData {
  saveSchemaVersion?: number; // 3 cho V1.4 (bản V1.3 là 2 hoặc undefined)
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
  observedCreatures?: string[]; // Danh sách sinh vật đã quan sát (Bestiary)
  legacyExtraData?: Record<string, any>; // Lưu trữ an toàn các trường không xác định
}

export class SaveManager {
  public static readonly CURRENT_SCHEMA_VERSION = 3;
  public static readonly SAVE_KEY = 'hollow_woods_v1_savegame';
  public static readonly LEGACY_SAVE_KEY = 'hollow_woods_v3_savegame';
  public static readonly V13_BACKUP_KEY = 'hollow_woods_save_backup_v13';

  // Tập hợp các ID vật phẩm chuẩn đã biết từ V1.3 để phát hiện runtimeKey lạ
  private static readonly KNOWN_ITEM_KEYS = new Set<string>([
    'res_dry_wood', 'res_flint', 'res_tree_resin', 'res_herbs', 'seed_herbs',
    'item_lantern_oil', 'item_herbal_poultice', 'item_noise_lure',
    'quest_bronze_clapper', 'lore_satyr_journal',
    // Các vật phẩm V1.4
    'mat_forest_rope', 'mat_charcoal', 'mat_runed_iron', 'item_runed_iron_part',
    'item_bell_mold', 'item_medicinal_roots', 'relic_heart_of_roots',
    'food_calming_tea', 'food_roasted_mushroom', 'food_root_soup', 'item_resin_flare',
    'wpn_walking_staff', 'wpn_iron_spear', 'wpn_hunting_hatchet',
    'eqp_moss_cloak', 'eqp_trail_boots', 'eqp_field_backpack', 'eqp_bell_ward_charm'
  ]);

  /**
   * Đọc dữ liệu thô từ localStorage với cơ chế tự động chuyển dữ liệu tương thích ngược
   */
  public static getRawSaveData(): string | null {
    try {
      let raw = localStorage.getItem(SaveManager.SAVE_KEY);
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
      // Chỉ lưu nếu chưa có bản backup hoặc bản hiện tại là V1.3
      const existingBackup = localStorage.getItem(SaveManager.V13_BACKUP_KEY);
      if (!existingBackup) {
        localStorage.setItem(SaveManager.V13_BACKUP_KEY, rawString);
        console.log('[SaveManager] Đã tạo bản sao lưu an toàn V1.3 tại khóa:', SaveManager.V13_BACKUP_KEY);
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
      const backup = localStorage.getItem(SaveManager.V13_BACKUP_KEY);
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
      const isLegacy = typeof rawObj.saveSchemaVersion !== 'number' || rawObj.saveSchemaVersion < SaveManager.CURRENT_SCHEMA_VERSION;
      const saveSchemaVersion = SaveManager.CURRENT_SCHEMA_VERSION;
      const version = isLegacy ? '1.4.0' : (typeof rawObj.version === 'string' ? rawObj.version : '1.4.0');
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
            const key = item[0].trim();
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

      // 4. Cờ trạng thái (Flags)
      const flags: string[] = [];
      if (Array.isArray(rawObj.flags)) {
        for (const f of rawObj.flags) {
          if (typeof f === 'string' && f.trim().length > 0) {
            flags.push(f.trim());
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
        if (!visitedZones.includes('fog_crossing')) visitedZones.push('fog_crossing');
        if (!visitedZones.includes('bellhollow')) visitedZones.push('bellhollow');
      }

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

      // Rương lưu trữ 12 ô (storageChest / storageChestInventory)
      const storageChest: [string, number][] = [];
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

      // Giữ nguyên các trường không xác định vào legacyExtraData
      const knownKeys = new Set([
        'saveSchemaVersion', 'version', 'timestamp', 'checkpointName', 'zoneId',
        'playerPos', 'stats', 'inventory', 'flags', 'currentQuestId', 'quests',
        'unlockedLoreIds', 'visitedZones', 'unlockedZones', 'herbPlots',
        'dayCount', 'timeOfDay', 'equippedSlots', 'storageChest', 'storageChestInventory', 'campfireLevel', 'campfireFuel', 'observedCreatures', 'legacyExtraData'
      ]);
      const legacyExtraData: Record<string, any> = rawObj.legacyExtraData ? { ...rawObj.legacyExtraData } : {};
      for (const [k, v] of Object.entries(rawObj)) {
        if (!knownKeys.has(k)) {
          legacyExtraData[k] = v;
        }
      }

      const observedCreatures: string[] = [];
      if (Array.isArray(rawObj.observedCreatures)) {
        for (const c of rawObj.observedCreatures) {
          if (typeof c === 'string' && c.trim()) observedCreatures.push(c.trim());
        }
      }

      return {
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
        observedCreatures,
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
   * Lưu game với bước kiểm tra tính hợp lệ trước khi ghi đè
   */
  public static saveGame(checkpointName: string, zoneId: string, playerX: number, playerY: number): boolean {
    try {
      const state = PlayerState.getInstance();

      const questData = Array.from(state.quests.values()).map(q => ({
        id: q.id,
        tasks: q.tasks.map(t => ({ id: t.id, done: t.done }))
      }));

      // Snapshot stats
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

      const candidateSaveData: SaveData = {
        saveSchemaVersion: SaveManager.CURRENT_SCHEMA_VERSION,
        version: '1.4.0',
        timestamp: Date.now(),
        checkpointName,
        zoneId,
        playerPos: { x: playerX, y: playerY },
        stats: statsSnapshot,
        inventory: Array.from(state.inventory.entries()),
        flags: Array.from(state.flags),
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
        observedCreatures: Array.from(state.bestiary.values()).filter(b => b.observed).map(b => b.species),
        legacyExtraData: state.legacyExtraData ? { ...state.legacyExtraData } : undefined
      };

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

      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(validated));
      return true;
    } catch (e) {
      console.error('[SaveManager] Lỗi lưu game:', e);
      return false;
    }
  }

  /**
   * Tải game với quy trình chuyển đổi không phá hủy
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
      }
      state.campfireLevel = data.campfireLevel ?? 1;
      state.campfireFuel = data.campfireFuel ?? 180;

      // Phục hồi Sổ Tay Sinh Vật (Bestiary)
      if (data.observedCreatures && Array.isArray(data.observedCreatures)) {
        for (const sp of data.observedCreatures) {
          state.observeCreature(sp as any);
        }
      }

      // V1.4 - P8-04: Phục hồi vùng lưu dự phòng an toàn legacyExtraData
      state.legacyExtraData = data.legacyExtraData ? { ...data.legacyExtraData } : undefined;

      state.emit('stats_changed', state.stats);
      state.emit('inventory_changed', {});
      return data;
    } catch (e) {
      console.error('[SaveManager] Lỗi tải game:', e);
      return null;
    }
  }

  public static clearSave(): void {
    try {
      localStorage.removeItem(SaveManager.SAVE_KEY);
      localStorage.removeItem(SaveManager.LEGACY_SAVE_KEY);
    } catch {
      // Ignored
    }
  }
}
