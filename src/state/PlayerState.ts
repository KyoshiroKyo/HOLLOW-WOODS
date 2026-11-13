import * as Phaser from 'phaser';
import itemsData from '../data/items.json';
import loreData from '../data/lore.json';
import { PlayerStats } from '../types';

export interface InventoryItem {
  itemId: string;
  count: number;
}

export interface QuestTask {
  id: string;
  text: string;
  done: boolean;
}

export interface Quest {
  id: string;
  act: number;
  title: string;
  description: string;
  tasks: QuestTask[];
}

export interface LoreEntry {
  id: string;
  act: number;
  title: string;
  author: string;
  content: string;
}

export class PlayerState extends Phaser.Events.EventEmitter {
  private static instance: PlayerState | null = null;

  public stats: PlayerStats;
  public inventory: Map<string, number> = new Map();
  public flags: Set<string> = new Set();
  
  public currentQuestId: string = 'Q01_MEET_EDDA';
  public quests: Map<string, Quest> = new Map();
  public unlockedLore: LoreEntry[] = [];

  private constructor() {
    super();

    // 1. Khởi tạo 4 chỉ số chuẩn Canon V3.0 (thang 0–100)
    this.stats = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      lanternOil: 75, // Bắt đầu với 75% dầu
      maxLanternOil: 100,
      composure: 90, // Bắt đầu ở mức 90% tỉnh táo
      maxComposure: 100,
      isLanternOn: false,
      isSprinting: false,
      isHiding: false
    };

    // 2. Khởi tạo túi đồ ban đầu (Đèn Lồng + 1 ít cành cây ban đầu)
    this.inventory.set('res_dry_wood', 2);

    // 3. Nạp danh sách nhiệm vụ từ lore.json
    for (const q of loreData.questLog as Quest[]) {
      this.quests.set(q.id, {
        ...q,
        tasks: q.tasks.map(t => ({ ...t }))
      });
    }

    // 4. Mở khóa trang nhật ký ban đầu
    this.unlockedLore.push(loreData.loreEntries[0] as LoreEntry);
  }

  public reset(): void {
    this.stats = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      lanternOil: 75,
      maxLanternOil: 100,
      composure: 90,
      maxComposure: 100,
      isLanternOn: false,
      isSprinting: false,
      isHiding: false
    };

    this.inventory.clear();
    this.inventory.set('res_dry_wood', 2);

    this.flags.clear();

    this.quests.clear();
    for (const q of loreData.questLog as Quest[]) {
      this.quests.set(q.id, {
        ...q,
        tasks: q.tasks.map(t => ({ ...t, done: false }))
      });
    }

    this.unlockedLore = [loreData.loreEntries[0] as LoreEntry];
    this.currentQuestId = 'Q00_WAKE_UP';

    this.emit('stats_changed', this.stats);
    this.emit('inventory_changed', {});
    this.emit('quest_changed', this.quests.get(this.currentQuestId));
  }

  public static getInstance(): PlayerState {
    if (!PlayerState.instance) {
      PlayerState.instance = new PlayerState();
    }
    return PlayerState.instance;
  }

  // --- QUẢN LÝ TÚI ĐỒ (INVENTORY) ---

  public addItem(itemId: string, count: number = 1): void {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + count);
    this.emit('inventory_changed', { itemId, count: this.inventory.get(itemId) });
  }

  public removeItem(itemId: string, count: number = 1): boolean {
    const current = this.inventory.get(itemId) || 0;
    if (current < count) return false;

    if (current - count <= 0) {
      this.inventory.delete(itemId);
    } else {
      this.inventory.set(itemId, current - count);
    }
    this.emit('inventory_changed', { itemId, count: this.inventory.get(itemId) || 0 });
    return true;
  }

  public getItemCount(itemId: string): number {
    return this.inventory.get(itemId) || 0;
  }

  public useItem(itemId: string): boolean {
    const count = this.getItemCount(itemId);
    if (count <= 0) return false;

    const itemMeta = itemsData.items.find(i => i.id === itemId);
    if (!itemMeta || !itemMeta.effects) return false;

    if (itemMeta.effects.health) {
      this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + itemMeta.effects.health);
    }
    if (itemMeta.effects.composure) {
      this.stats.composure = Math.min(this.stats.maxComposure, this.stats.composure + itemMeta.effects.composure);
    }
    if (itemMeta.effects.lanternOil) {
      this.stats.lanternOil = Math.min(this.stats.maxLanternOil, this.stats.lanternOil + itemMeta.effects.lanternOil);
    }

    this.removeItem(itemId, 1);
    this.emit('stats_changed', this.stats);
    return true;
  }

  // --- QUẢN LÝ CỜ NHIỆM VỤ & TIẾN TRÌNH (QUEST FLAGS) ---

  public setFlag(flag: string): void {
    if (!this.flags.has(flag)) {
      this.flags.add(flag);
      this.emit('flag_set', flag);
      this.checkQuestProgression(flag);
    }
  }

  public hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  private checkQuestProgression(flag: string): void {
    if (flag === 'talked_to_villagers') {
      this.completeQuestTask('Q01_MEET_EDDA', 't1');
    } else if (flag === 'talked_to_edda') {
      this.completeQuestTask('Q01_MEET_EDDA', 't2');
      this.setCurrentQuest('Q02_MEET_NERIS');
      this.unlockLore('lore_three_rules');
    } else if (flag === 'talked_to_neris') {
      this.completeQuestTask('Q02_MEET_NERIS', 't1');
      this.completeQuestTask('Q02_MEET_NERIS', 't2');
      this.setCurrentQuest('Q03_PREPARE_RESOURCES');
      this.unlockLore('lore_herbalist_note');
    } else if (flag === 'craft_complete') {
      this.completeQuestTask('Q03_PREPARE_RESOURCES', 't2');
      this.setCurrentQuest('Q04_ANCIENT_RUNES');
    } else if (flag === 'clapper_collected') {
      this.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't1');
      this.unlockLore('lore_clapper_curse');
    }
  }

  public completeQuestTask(questId: string, taskId: string): void {
    const q = this.quests.get(questId);
    if (!q) return;

    const task = q.tasks.find(t => t.id === taskId);
    if (task && !task.done) {
      task.done = true;
      this.emit('quest_updated', q);
    }
  }

  public setCurrentQuest(questId: string): void {
    this.currentQuestId = questId;
    const q = this.quests.get(questId);
    if (q) {
      this.emit('quest_changed', q);
    }
  }

  public getCurrentQuest(): Quest | undefined {
    return this.quests.get(this.currentQuestId);
  }

  public unlockLore(loreId: string): void {
    if (this.unlockedLore.some(l => l.id === loreId)) return;
    const lore = loreData.loreEntries.find(l => l.id === loreId);
    if (lore) {
      this.unlockedLore.push(lore as LoreEntry);
      this.emit('lore_unlocked', lore);
    }
  }
}

