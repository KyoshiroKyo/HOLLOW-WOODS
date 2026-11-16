import { PlayerState } from '../state/PlayerState';
import { HerbPlotStage, ZoneId } from '../types';

export interface SaveData {
  saveSchemaVersion?: number;
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
  };
  inventory: [string, number][];
  flags: string[];
  currentQuestId: string;
  quests: { id: string; tasks: { id: string; done: boolean }[] }[];
  unlockedLoreIds: string[];
  visitedZones?: string[];
  unlockedZones?: string[];
  herbPlots?: { id: string; stage: HerbPlotStage; plantedAt: number }[];
}

export class SaveManager {
  private static readonly SAVE_KEY = 'hollow_woods_v1_savegame';
  private static readonly LEGACY_SAVE_KEY = 'hollow_woods_v3_savegame';

  /**
   * Đọc dữ liệu thô từ localStorage với cơ chế tự động chuyển dữ liệu (migration) tương thích ngược từ V3.0
   */
  private static getRawSaveData(): string | null {
    try {
      let raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) {
        // Tương thích ngược: kiểm tra khóa lưu cũ v3
        const legacyRaw = localStorage.getItem(SaveManager.LEGACY_SAVE_KEY);
        if (legacyRaw) {
          try {
            JSON.parse(legacyRaw);
            raw = legacyRaw;
            // Tự động chuyển dữ liệu sang khóa v1 mới
            localStorage.setItem(SaveManager.SAVE_KEY, legacyRaw);
          } catch {
            // legacy save bị hỏng, bỏ qua
          }
        }
      }
      return raw;
    } catch {
      return null;
    }
  }

  /**
   * C4-132-04: Schema Validation & Safe Migration khi đọc dữ liệu lưu từ localStorage.
   * Ngăn chặn hoàn toàn lỗi crash trắng trang khi dữ liệu bị thiếu trường hoặc chứa NaN/lỗi kiểu.
   */
  public static sanitizeAndMigrateSaveData(rawObj: any): SaveData | null {
    if (!rawObj || typeof rawObj !== 'object') {
      return null;
    }

    try {
      const version = typeof rawObj.version === 'string' ? rawObj.version : '1.3.2';
      const saveSchemaVersion = typeof rawObj.saveSchemaVersion === 'number' ? rawObj.saveSchemaVersion : 2;
      const timestamp = typeof rawObj.timestamp === 'number' && !isNaN(rawObj.timestamp) ? rawObj.timestamp : Date.now();
      const checkpointName = typeof rawObj.checkpointName === 'string' && rawObj.checkpointName.trim().length > 0
        ? rawObj.checkpointName
        : 'Điểm lưu Bellhollow';
      const zoneId = typeof rawObj.zoneId === 'string' && rawObj.zoneId.trim().length > 0
        ? rawObj.zoneId
        : 'bellhollow';

      // playerPos validation
      let playerPos = { x: 800, y: 700 };
      if (rawObj.playerPos && typeof rawObj.playerPos === 'object') {
        const x = Number(rawObj.playerPos.x);
        const y = Number(rawObj.playerPos.y);
        if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
          playerPos = { x, y };
        }
      }

      // stats validation
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
        isSprinting: false
      };

      // inventory validation: array of [string, number]
      const inventory: [string, number][] = [];
      if (Array.isArray(rawObj.inventory)) {
        for (const item of rawObj.inventory) {
          if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
            const count = Number(item[1]);
            if (!isNaN(count) && count > 0) {
              inventory.push([item[0], Math.floor(count)]);
            }
          }
        }
      }

      // flags validation: string[]
      const flags: string[] = [];
      if (Array.isArray(rawObj.flags)) {
        for (const f of rawObj.flags) {
          if (typeof f === 'string' && f.trim().length > 0) {
            flags.push(f.trim());
          }
        }
      }

      // currentQuestId validation
      const currentQuestId = typeof rawObj.currentQuestId === 'string' && rawObj.currentQuestId.trim().length > 0
        ? rawObj.currentQuestId
        : 'Q01_WAKE_UP';

      // quests validation
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

      // unlockedLoreIds
      const unlockedLoreIds: string[] = [];
      if (Array.isArray(rawObj.unlockedLoreIds)) {
        for (const lore of rawObj.unlockedLoreIds) {
          if (typeof lore === 'string') unlockedLoreIds.push(lore);
        }
      }

      // visitedZones
      let visitedZones: string[] = ['fog_crossing', 'bellhollow'];
      if (Array.isArray(rawObj.visitedZones) && rawObj.visitedZones.length > 0) {
        visitedZones = rawObj.visitedZones.filter((z: any) => typeof z === 'string');
        if (!visitedZones.includes('fog_crossing')) visitedZones.push('fog_crossing');
        if (!visitedZones.includes('bellhollow')) visitedZones.push('bellhollow');
      }

      // unlockedZones
      let unlockedZones: string[] = ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods'];
      if (Array.isArray(rawObj.unlockedZones) && rawObj.unlockedZones.length > 0) {
        unlockedZones = rawObj.unlockedZones.filter((z: any) => typeof z === 'string');
        for (const defZone of ['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']) {
          if (!unlockedZones.includes(defZone)) unlockedZones.push(defZone);
        }
      }

      // herbPlots
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
        herbPlots
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

  public static saveGame(checkpointName: string, zoneId: string, playerX: number, playerY: number): boolean {
    try {
      const state = PlayerState.getInstance();

      const questData = Array.from(state.quests.values()).map(q => ({
        id: q.id,
        tasks: q.tasks.map(t => ({ id: t.id, done: t.done }))
      }));

      // C4-132-04: Tạo snapshot an toàn tuyệt đối, KHÔNG mutate trực tiếp state.stats của nhân vật đang chơi
      const statsSnapshot = {
        health: state.stats.health,
        stamina: state.stats.stamina,
        lanternOil: state.stats.lanternOil,
        composure: state.stats.composure,
        isLanternOn: state.stats.isLanternOn,
        isHiding: false,
        isSprinting: false
      };

      const saveData: SaveData = {
        saveSchemaVersion: 2,
        version: '1.3.2',
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
        herbPlots: state.getHerbPlots().map(p => ({ id: p.id, stage: p.stage, plantedAt: p.plantedAt }))
      };

      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Lỗi lưu game:', e);
      return false;
    }
  }

  public static loadGame(): SaveData | null {
    try {
      const raw = SaveManager.getRawSaveData();
      if (!raw) return null;

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
      // C4-13-01 & C4-132-04: Tự động giải phóng trạng thái ẩn nấp và chạy nhanh khi tải lại điểm lưu
      state.stats.isHiding = false;
      state.stats.isSprinting = false;

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

      // Phục hồi các phân khu đã khám phá và vị trí hiện tại (C4-12-10 & C4-12-26)
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

      // Phục hồi trạng thái nông trại thảo mộc Sanctuary Farm (C4-12-16)
      if (data.herbPlots && Array.isArray(data.herbPlots)) {
        for (const pSave of data.herbPlots) {
          state.updateHerbPlot(pSave.id, pSave.stage, pSave.plantedAt);
        }
      }

      // C4-12-28: Phục hồi trạng thái mở khóa phân khu bền vững và tự động tương thích ngược
      state.restoreUnlockedZones(data.unlockedZones);

      state.emit('stats_changed', state.stats);
      state.emit('inventory_changed', {});
      return data;
    } catch (e) {
      console.error('Lỗi tải game:', e);
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
