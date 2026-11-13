import { PlayerState } from '../state/PlayerState';

export interface SaveData {
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
  };
  inventory: [string, number][];
  flags: string[];
  currentQuestId: string;
  quests: { id: string; tasks: { id: string; done: boolean }[] }[];
  unlockedLoreIds: string[];
}

export class SaveManager {
  private static readonly SAVE_KEY = 'hollow_woods_v3_savegame';

  public static hasSave(): boolean {
    try {
      return localStorage.getItem(SaveManager.SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  public static getSaveSummary(): { checkpoint: string; date: string } | null {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) return null;
      const data: SaveData = JSON.parse(raw);
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

      const saveData: SaveData = {
        version: '3.0.0',
        timestamp: Date.now(),
        checkpointName,
        zoneId,
        playerPos: { x: playerX, y: playerY },
        stats: {
          health: state.stats.health,
          stamina: state.stats.stamina,
          lanternOil: state.stats.lanternOil,
          composure: state.stats.composure,
          isLanternOn: state.stats.isLanternOn
        },
        inventory: Array.from(state.inventory.entries()),
        flags: Array.from(state.flags),
        currentQuestId: state.currentQuestId,
        quests: questData,
        unlockedLoreIds: state.unlockedLore.map(l => l.id)
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
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) return null;

      const data: SaveData = JSON.parse(raw);
      const state = PlayerState.getInstance();

      // Phục hồi chỉ số
      state.stats.health = data.stats.health;
      state.stats.stamina = data.stats.stamina;
      state.stats.lanternOil = data.stats.lanternOil;
      state.stats.composure = data.stats.composure;
      state.stats.isLanternOn = data.stats.isLanternOn;

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
    } catch {
      // Ignored
    }
  }
}

