import * as Phaser from 'phaser';
import itemsData from '../data/items.json';
import loreData from '../data/lore.json';
import { PlayerStats, HerbPlotData, HerbPlotStage, ZoneId } from '../types';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';

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
  public currentZoneId: ZoneId = 'fog_crossing';
  public visitedZones: Set<string> = new Set(['fog_crossing', 'bellhollow']);
  // C4-12-28: Cache theo dõi danh sách phân khu đã mở khóa để phát hiện sự kiện thay đổi
  private unlockedZoneCache: Set<ZoneId> = new Set(['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']);
  public herbPlots: HerbPlotData[] = [
    { id: 'plot_1', x: 760, y: 640, stage: 'empty', plantedAt: 0 },
    { id: 'plot_2', x: 840, y: 640, stage: 'empty', plantedAt: 0 },
    { id: 'plot_3', x: 760, y: 690, stage: 'empty', plantedAt: 0 },
    { id: 'plot_4', x: 840, y: 690, stage: 'empty', plantedAt: 0 }
  ];

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

    // 2. Khởi tạo túi đồ ban đầu (Đèn Lồng + 1 ít cành cây + Hạt giống thảo dược ban đầu)
    this.inventory.set('res_dry_wood', 2);
    this.inventory.set('seed_herbs', 3);

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
    Object.assign(this.stats, {
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
    });

    this.inventory.clear();
    this.inventory.set('res_dry_wood', 2);
    this.inventory.set('seed_herbs', 3);

    this.flags.clear();

    this.quests.clear();
    for (const q of loreData.questLog as Quest[]) {
      this.quests.set(q.id, {
        ...q,
        tasks: q.tasks.map(t => ({ ...t, done: q.id === 'Q00_WAKE_UP' ? true : false }))
      });
    }

    this.unlockedLore = [loreData.loreEntries[0] as LoreEntry];
    this.currentZoneId = 'fog_crossing';
    this.visitedZones = new Set(['fog_crossing', 'bellhollow']);
    this.unlockedZoneCache = new Set(['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']);
    this.herbPlots = [
      { id: 'plot_1', x: 760, y: 640, stage: 'empty', plantedAt: 0 },
      { id: 'plot_2', x: 840, y: 640, stage: 'empty', plantedAt: 0 },
      { id: 'plot_3', x: 760, y: 690, stage: 'empty', plantedAt: 0 },
      { id: 'plot_4', x: 840, y: 690, stage: 'empty', plantedAt: 0 }
    ];
    this.currentQuestId = 'Q01_MEET_EDDA';

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

  // --- QUẢN LÝ TRẠNG THÁI MỎ TÀI NGUYÊN (RESOURCE NODE DEPLETION) ---

  public markNodeDepleted(nodeId: string): void {
    if (!nodeId) return;
    this.flags.add(`depleted_node:${nodeId}`);
  }

  public clearNodeDepleted(nodeId: string): void {
    if (!nodeId) return;
    this.flags.delete(`depleted_node:${nodeId}`);
  }

  public isNodeDepleted(nodeId: string): boolean {
    if (!nodeId) return false;
    return this.flags.has(`depleted_node:${nodeId}`);
  }

  // --- QUẢN LÝ TÚI ĐỒ (INVENTORY) ---

  public addItem(itemId: string, count: number = 1): void {
    if (count <= 0) return;

    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + count);

    if (itemId === 'res_dry_wood') {
      this.flags.add('harvested_res_dry_wood');
    } else if (itemId === 'res_tree_resin') {
      this.flags.add('harvested_res_tree_resin');
    }

    this.emit('inventory_changed', { itemId, count: this.inventory.get(itemId) });
    this.evaluateQ03ResourceTask();
  }

  public recordResourceHarvest(itemId: string, count: number = 1, nodeId?: string): void {
    if (count <= 0) return;
    if (nodeId) {
      // C4-12-04: Ngăn chặn nhân đôi vật phẩm nếu điểm tài nguyên đã bị thu hoạch trong chu kỳ hiện tại
      if (this.isNodeDepleted(nodeId)) {
        return;
      }
      this.markNodeDepleted(nodeId);
    }
    this.addItem(itemId, count);
  }

  public removeItem(itemId: string, count: number = 1): boolean {
    if (count <= 0) return false;
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

  /**
   * C4-12-04: Sử dụng vật phẩm tiêu hao (áp dụng hiệu ứng đúng 1 lần và giảm đúng 1 đơn vị)
   * Tránh lãng phí vật phẩm nếu các chỉ số tương ứng đã đạt tối đa (100%)
   */
  public useItem(itemId: string): boolean {
    const count = this.getItemCount(itemId);
    if (count <= 0) return false;

    const itemMeta = itemsData.items.find(i => i.id === itemId);
    if (!itemMeta || !itemMeta.effects) return false;

    let applied = false;
    if (itemMeta.effects.health !== undefined && this.stats.health < this.stats.maxHealth) {
      this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + itemMeta.effects.health);
      applied = true;
    }
    if (itemMeta.effects.composure !== undefined && this.stats.composure < this.stats.maxComposure) {
      this.stats.composure = Math.min(this.stats.maxComposure, this.stats.composure + itemMeta.effects.composure);
      applied = true;
    }
    if (itemMeta.effects.lanternOil !== undefined && this.stats.lanternOil < this.stats.maxLanternOil) {
      this.stats.lanternOil = Math.min(this.stats.maxLanternOil, this.stats.lanternOil + itemMeta.effects.lanternOil);
      applied = true;
    }

    // Nếu không có chỉ số nào được cải thiện (đã đầy), từ chối tiêu hao
    if (!applied) {
      return false;
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
      this.checkAndEmitUnlockEvents();
    }
  }

  public hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  /**
   * C4-12-28: Kiểm tra trạng thái mở khóa của một phân khu bất kỳ qua WorldGatingSystem
   */
  public isZoneUnlocked(zoneId: ZoneId): boolean {
    return WorldGatingSystem.getInstance().isZoneUnlocked(zoneId, this);
  }

  /**
   * C4-12-03 & C4-12-28: Kiểm tra điều kiện mở Cổng Đông làng Bellhollow (dẫn sang The Crooked Path)
   * Sử dụng hàm tập trung của WorldGatingSystem
   */
  public isEastGateUnlocked(): boolean {
    return this.isZoneUnlocked('crooked_path');
  }

  /**
   * C4-12-28: Kiểm tra ranh giới dẫn vào Đầm Lầy Tĩnh Lặng (Silent Mire)
   */
  public isSilentMireUnlocked(): boolean {
    return this.isZoneUnlocked('silent_mire');
  }

  /**
   * C4-12-28: Kiểm tra kết giới dẫn vào Miếu Chuông Phế Tích (Broken Bell Shrine)
   */
  public isShrineUnlocked(): boolean {
    return this.isZoneUnlocked('broken_bell_shrine');
  }

  /**
   * C4-12-28: Lấy danh sách toàn bộ phân khu đang mở khóa
   */
  public getUnlockedZones(): ZoneId[] {
    return WorldGatingSystem.getInstance().getAllUnlockedZones(this);
  }

  /**
   * C4-12-28: Kiểm tra và phát tán sự kiện mở khóa phân khu khi điều kiện cốt truyện thay đổi
   */
  public checkAndEmitUnlockEvents(): ZoneId[] {
    const currentUnlocked = this.getUnlockedZones();
    const newlyUnlocked: ZoneId[] = [];

    for (const z of currentUnlocked) {
      if (!this.unlockedZoneCache.has(z)) {
        this.unlockedZoneCache.add(z);
        newlyUnlocked.push(z);
        const node = ZoneConnectionRegistry.getInstance().getZoneNode(z);
        this.emit('zone_unlocked', {
          zoneId: z,
          titleVietnamese: node?.titleVietnamese || z,
          tier: node?.tier || 'LAYER_1_CORE'
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      this.emit('world_unlock_changed', {
        unlockedZones: currentUnlocked,
        newlyUnlocked
      });
      if (newlyUnlocked.includes('crooked_path')) {
        this.emit('east_gate_unlocked');
      }
      if (newlyUnlocked.includes('broken_bell_shrine')) {
        this.emit('shrine_ward_unlocked');
      }
    }

    return newlyUnlocked;
  }

  /**
   * C4-12-28: Phục hồi trạng thái mở khóa vùng và tự động tương thích với các bản lưu cũ
   */
  public restoreUnlockedZones(savedUnlocked?: string[]): void {
    this.unlockedZoneCache = new Set(['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']);
    if (savedUnlocked && Array.isArray(savedUnlocked)) {
      for (const z of savedUnlocked) {
        this.unlockedZoneCache.add(z as ZoneId);
      }
    }
    const current = this.getUnlockedZones();
    for (const z of current) {
      this.unlockedZoneCache.add(z);
    }
    this.checkAndEmitUnlockEvents();
  }

  public evaluateQ03ResourceTask(): boolean {
    const q03 = this.quests.get('Q03_PREPARE_RESOURCES');
    if (!q03) return false;

    const t1 = q03.tasks.find(t => t.id === 't1');
    if (!t1) return false;
    if (t1.done) return true;

    const isQ03ActiveOrUnlocked =
      this.currentQuestId === 'Q03_PREPARE_RESOURCES' ||
      this.flags.has('talked_to_neris');

    if (!isQ03ActiveOrUnlocked) return false;

    const hasHarvestedWood = this.flags.has('harvested_res_dry_wood');
    const hasHarvestedResin = this.flags.has('harvested_res_tree_resin');
    const hasRequiredStock =
      this.getItemCount('res_dry_wood') >= 1 &&
      this.getItemCount('res_tree_resin') >= 1;

    if (hasHarvestedWood && hasHarvestedResin && hasRequiredStock) {
      this.completeQuestTask('Q03_PREPARE_RESOURCES', 't1');
      if (!this.flags.has('q03_t1_notified')) {
        this.flags.add('q03_t1_notified');
        this.emit('q03_resources_ready');
      }
      return true;
    }

    return false;
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
      this.evaluateQ03ResourceTask();
    } else if (flag === 'craft_lantern_oil_complete') {
      this.completeQuestTask('Q03_PREPARE_RESOURCES', 't1');
      this.completeQuestTask('Q03_PREPARE_RESOURCES', 't2');
      this.flags.add('east_gate_unlocked');
      if (
        this.currentQuestId !== 'Q04_ANCIENT_RUNES' &&
        this.currentQuestId !== 'Q05_SOLVE_MIRE' &&
        this.currentQuestId !== 'Q06_RETRIEVE_CLAPPER'
      ) {
        this.setCurrentQuest('Q04_ANCIENT_RUNES');
      }
      this.emit('east_gate_unlocked');
    } else if (flag === 'east_gate_unlocked') {
      this.emit('east_gate_unlocked');
    } else if (flag === 'clapper_collected') {
      this.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't1');
      this.unlockLore('lore_clapper_curse');
    } else if (flag === 'mire_pillars_solved' || flag === 'mire_puzzle_solved') {
      // C4-12-24: Tự động hoàn thành nhiệm vụ Q05 và mở khóa Q06 khi giải đố Ba Cột Đá thành công
      this.completeQuestTask('Q05_SOLVE_MIRE', 't1');
      this.completeQuestTask('Q05_SOLVE_MIRE', 't2');
      this.completeQuestTask('Q05_SOLVE_MIRE', 't3');
      this.flags.add('mire_drained');
      this.flags.add('mire_pillars_solved');
      this.flags.add('mire_puzzle_solved');
      if (this.currentQuestId !== 'Q06_RETRIEVE_CLAPPER') {
        this.setCurrentQuest('Q06_RETRIEVE_CLAPPER');
      }
      this.unlockLore('lore_runestones');
    }
  }

  public completeQuestTask(questId: string, taskId: string): void {
    const q = this.quests.get(questId);
    if (!q) return;

    const task = q.tasks.find(t => t.id === taskId);
    if (task && !task.done) {
      task.done = true;
      this.emit('quest_updated', q);
      this.checkAndEmitUnlockEvents();
    }
  }

  /**
   * C4-12-24: Đặt lại toàn bộ tasks của một nhiệm vụ khi thực hiện sai chuỗi câu đố.
   */
  public resetQuestTasks(questId: string): void {
    const q = this.quests.get(questId);
    if (!q) return;
    let changed = false;
    for (const t of q.tasks) {
      if (t.done) {
        t.done = false;
        changed = true;
      }
    }
    if (changed) {
      this.emit('quest_updated', q);
    }
  }

  public setCurrentQuest(questId: string): void {
    if (!this.quests.has(questId)) return;
    this.currentQuestId = questId;
    const q = this.quests.get(questId);
    if (q) {
      this.emit('quest_changed', q);
      if (questId === 'Q03_PREPARE_RESOURCES') {
        this.evaluateQ03ResourceTask();
      }
      this.checkAndEmitUnlockEvents();
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

  // --- C4-12-10 & C4-12-26: Quản lý vị trí hiện tại và vết tích khám phá 3 Tầng Thế Giới ---
  public setCurrentZone(zoneId: ZoneId): void {
    const changed = this.currentZoneId !== zoneId;
    this.currentZoneId = zoneId;
    this.markZoneVisited(zoneId);
    if (changed) {
      this.emit('zone_changed', zoneId);
    }
  }

  public getCurrentZone(): ZoneId {
    return this.currentZoneId;
  }

  public markZoneVisited(zoneId: string): void {
    if (!this.visitedZones.has(zoneId)) {
      this.visitedZones.add(zoneId);
      this.emit('zone_visited', zoneId);
    }
  }

  public hasVisitedZone(zoneId: string): boolean {
    return this.visitedZones.has(zoneId);
  }

  public getVisitedZones(): string[] {
    return Array.from(this.visitedZones);
  }

  // --- C4-12-16: Quản lý 4 ô đất canh tác thảo dược tại Sanctuary Farm ---
  public getHerbPlots(): HerbPlotData[] {
    return this.herbPlots;
  }

  public getHerbPlot(id: string): HerbPlotData | undefined {
    return this.herbPlots.find(p => p.id === id);
  }

  public updateHerbPlot(id: string, stage: HerbPlotStage, plantedAt: number): void {
    const plot = this.herbPlots.find(p => p.id === id);
    if (plot) {
      plot.stage = stage;
      plot.plantedAt = plantedAt;
      this.emit('herb_plots_changed', this.herbPlots);
    }
  }

  public setHerbPlots(plots: HerbPlotData[]): void {
    this.herbPlots = plots.map(p => {
      // Tự động nâng cấp tọa độ nếu dữ liệu lưu từ phiên bản cũ ở Bellhollow
      if (p.x === 1045 && p.y === 430) return { ...p, x: 760, y: 640 };
      if (p.x === 1095 && p.y === 430) return { ...p, x: 840, y: 640 };
      if (p.x === 1045 && p.y === 456) return { ...p, x: 760, y: 690 };
      if (p.x === 1095 && p.y === 456) return { ...p, x: 840, y: 690 };
      return { ...p };
    });
    this.emit('herb_plots_changed', this.herbPlots);
  }
}


