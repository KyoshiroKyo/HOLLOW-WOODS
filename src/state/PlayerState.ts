import * as Phaser from 'phaser';
import itemsData from '../data/items.json';
import loreData from '../data/lore.json';
import { PlayerStats, HerbPlotData, HerbPlotStage, CropType, ZoneId, BestiaryEntry, BestiarySpecies } from '../types';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';

const MAIN_QUEST_IDS = loreData.questLog.map(quest => quest.id);
const MAIN_QUEST_IDS_LATEST_FIRST = [...MAIN_QUEST_IDS].reverse();
const MAIN_QUEST_FLAG_PREFIX = 'main_quest_reached:';

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
  category?: 'main' | 'side';
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
  public bestiary: Map<BestiarySpecies, BestiaryEntry> = new Map();
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

  // V1.4 Mở rộng: Thuộc tính ngày đêm, trang bị và rương đồ Sanctuary
  public dayCount: number = 1;
  public timeOfDay: number = 0;
  public equippedSlots: { body: string | null; feet: string | null; back: string | null; charm: string | null } = {
    body: null,
    feet: null,
    back: null,
    charm: null
  };
  public storageChest: Map<string, number> = new Map();
  public campfireLevel: number = 1;
  public campfireFuel: number = 180;
  public activeWeapon: string = 'wpn_walking_staff';
  // V1.4 - P8-15A: Tiến trình Thức Tỉnh Ký Ức (0: Kẻ Lữ Hành Mất Trí -> 1: Manh Mối Xưởng Chuông -> 2: Tàn Tích Hiệp Sĩ -> 3: Đại Thức Tỉnh)
  public memoryAwakeningStage: number = 0;
  // V1.5 - V15-16: Điểm Tin Cậy Dân Làng (0 - 100, mặc định 50) & Cờ Quyết Định Cốt Truyện Tương Tác
  public villageTrustScore: number = 50;
  public storyFlags: Set<string> = new Set();
  // V1.4 - P8-04: Vùng lưu dự phòng an toàn cho các khóa dữ liệu mở rộng/lạ từ V1.3 hoặc Mod
  public legacyExtraData?: Record<string, any>;

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
      isHiding: false,
      moisture: 0,
      temperature: 80
    };

    // V1.4 Mở rộng: Trạng thái ngày đêm, trang bị và rương đồ
    this.dayCount = 1;
    this.timeOfDay = 0;
    this.equippedSlots = { body: null, feet: null, back: null, charm: null };
    this.storageChest = new Map();

    // 2. Khởi tạo túi đồ ban đầu (Đèn Lồng + 1 ít cành cây + Hạt giống thảo dược ban đầu)
    this.inventory.set('res_dry_wood', 2);
    this.inventory.set('seed_herbs', 3);

    // 3. Nạp danh sách nhiệm vụ từ lore.json (Nhiệm vụ chính + Nhiệm vụ phụ)
    for (const q of loreData.questLog as Quest[]) {
      this.quests.set(q.id, {
        ...q,
        category: 'main',
        tasks: q.tasks.map(t => ({ ...t }))
      });
    }
    const sideQuests = (loreData as any).sideQuestLog as Quest[] | undefined;
    if (sideQuests) {
      for (const sq of sideQuests) {
        this.quests.set(sq.id, {
          ...sq,
          category: 'side',
          tasks: sq.tasks.map(t => ({ ...t }))
        });
      }
    }

    // 4. Mở khóa trang nhật ký ban đầu
    this.unlockedLore.push(loreData.loreEntries[0] as LoreEntry);

    // 5. Khởi tạo Sổ Tay Sinh Vật (Bestiary)
    this.initDefaultBestiary();
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
      isHiding: false,
      moisture: 0,
      temperature: 80
    });

    this.dayCount = 1;
    this.timeOfDay = 0;
    this.equippedSlots = { body: null, feet: null, back: null, charm: null };
    this.storageChest.clear();
    this.campfireLevel = 1;
    this.campfireFuel = 180;
    this.activeWeapon = 'wpn_walking_staff';
    this.memoryAwakeningStage = 0;
    this.villageTrustScore = 50;
    this.storyFlags.clear();
    this.legacyExtraData = undefined;

    this.inventory.clear();
    this.inventory.set('res_dry_wood', 2);
    this.inventory.set('seed_herbs', 3);

    this.flags.clear();

    this.quests.clear();
    for (const q of loreData.questLog as Quest[]) {
      this.quests.set(q.id, {
        ...q,
        category: 'main',
        tasks: q.tasks.map(t => ({ ...t, done: q.id === 'Q00_WAKE_UP' ? true : false }))
      });
    }
    const sideQuests = (loreData as any).sideQuestLog as Quest[] | undefined;
    if (sideQuests) {
      for (const sq of sideQuests) {
        this.quests.set(sq.id, {
          ...sq,
          category: 'side',
          tasks: sq.tasks.map(t => ({ ...t, done: false }))
        });
      }
    }

    this.unlockedLore = [loreData.loreEntries[0] as LoreEntry];
    this.initDefaultBestiary();
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
   * V1.4: Bảo vệ toàn bộ vật phẩm nhiệm vụ (Quest) và nhật ký (Lore)
   * Không thể bị vứt bỏ, tiêu hao nhầm hoặc xóa khỏi túi đồ
   */
  public isProtectedItem(itemId: string): boolean {
    if (!itemId) return false;
    if (itemId.startsWith('quest_') || itemId.startsWith('lore_')) return true;
    const meta = itemsData.items.find(i => i.id === itemId);
    return meta ? (meta.category === 'quest' || meta.category === 'lore') : false;
  }

  // --- V1.4: QUẢN LÝ TRANG BỊ CÁ NHÂN & VŨ KHÍ ---

  public getMaxInventorySlots(): number {
    return this.equippedSlots?.back === 'eqp_field_backpack' ? 12 : 8;
  }

  public getEquipped(slot: 'body' | 'feet' | 'back' | 'charm'): string | null {
    if (!this.equippedSlots) {
      this.equippedSlots = { body: null, feet: null, back: null, charm: null };
    }
    return this.equippedSlots[slot] ?? null;
  }

  public equipItem(slot: 'body' | 'feet' | 'back' | 'charm', itemId: string): boolean {
    const count = this.getItemCount(itemId);
    if (count <= 0) return false;

    const oldItem = this.getEquipped(slot);
    if (oldItem) {
      this.addItem(oldItem, 1);
    }
    this.removeItem(itemId, 1);
    this.equippedSlots[slot] = itemId;
    this.emit('equipment_changed', { slot, itemId, oldItem });
    return true;
  }

  public unequipItem(slot: 'body' | 'feet' | 'back' | 'charm'): boolean {
    const current = this.getEquipped(slot);
    if (!current) return false;

    this.addItem(current, 1);
    this.equippedSlots[slot] = null;
    this.emit('equipment_changed', { slot, itemId: null, oldItem: current });
    return true;
  }

  public setActiveWeapon(weaponId: string): void {
    this.activeWeapon = weaponId;
    this.emit('weapon_changed', { weaponId });
  }

  public getActiveWeapon(): string {
    return this.activeWeapon || 'wpn_walking_staff';
  }

  /**
   * C4-12-04: Sử dụng vật phẩm tiêu hao (áp dụng hiệu ứng đúng 1 lần và giảm đúng 1 đơn vị)
   * Tránh lãng phí vật phẩm nếu các chỉ số tương ứng đã đạt tối đa (100%)
   */
  public useItem(itemId: string): boolean {
    if (this.isProtectedItem(itemId)) return false;

    const count = this.getItemCount(itemId);
    if (count <= 0) return false;

    // V1.4 - P8-03: Đuốc Nhựa Thông là vật phẩm tiêu hao chiến thuật cắm đất
    if (itemId === 'item_resin_flare') {
      this.removeItem(itemId, 1);
      this.emit('item_used', { itemId });
      return true;
    }

    const itemMeta = itemsData.items.find(i => i.id === itemId);
    if (!itemMeta || !itemMeta.effects) return false;

    let applied = false;
    if (itemMeta.effects.health !== undefined && this.stats.health < this.stats.maxHealth) {
      this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + itemMeta.effects.health);
      applied = true;
    }
    if (itemMeta.effects.stamina !== undefined && this.stats.stamina < this.stats.maxStamina) {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + itemMeta.effects.stamina);
      applied = true;
    }
    if (itemMeta.effects.composure !== undefined && this.stats.composure < this.stats.maxComposure) {
      this.stats.composure = Math.min(this.stats.maxComposure, this.stats.composure + itemMeta.effects.composure);
      applied = true;
    }
    if ((itemMeta.effects as any)?.lanternOil !== undefined && this.stats.lanternOil < this.stats.maxLanternOil) {
      this.stats.lanternOil = Math.min(this.stats.maxLanternOil, this.stats.lanternOil + (itemMeta.effects as any).lanternOil);
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

  // --- V1.5 - V15-16: QUẢN LÝ CỜ QUYẾT ĐỊNH CỐT TRUYỆN & ĐIỂM TIN CẬY DÂN LÀNG ---

  public setStoryFlag(flag: string): void {
    if (!this.storyFlags.has(flag)) {
      this.storyFlags.add(flag);
      // Đồng thời đồng bộ vào flags chung để tiện theo dõi
      this.setFlag(flag);
      this.emit('story_flag_set', flag);
    }
  }

  public hasStoryFlag(flag: string): boolean {
    return this.storyFlags.has(flag);
  }

  public getStoryFlags(): string[] {
    return Array.from(this.storyFlags);
  }

  public restoreStoryFlags(flags?: string[]): void {
    this.storyFlags.clear();
    if (Array.isArray(flags)) {
      for (const f of flags) {
        if (typeof f === 'string' && f.trim().length > 0) {
          this.storyFlags.add(f.trim());
          this.flags.add(f.trim());
        }
      }
    }
  }

  public getVillageTrustScore(): number {
    return this.villageTrustScore;
  }

  public setVillageTrustScore(score: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    if (this.villageTrustScore !== clamped) {
      this.villageTrustScore = clamped;
      this.emit('village_trust_changed', this.villageTrustScore);
    }
  }

  public addVillageTrust(delta: number): number {
    this.setVillageTrustScore(this.villageTrustScore + delta);
    return this.villageTrustScore;
  }

  /**
   * V1.4: Điều chỉnh chỉ số Bình Tâm an toàn trong giới hạn [0, maxComposure]
   */
  public modifyComposure(delta: number): number {
    this.stats.composure = Math.max(0, Math.min(this.stats.maxComposure, this.stats.composure + delta));
    this.emit('stats_changed', this.stats);
    return this.stats.composure;
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
      this.getStoryQuestId() === 'Q03_PREPARE_RESOURCES' ||
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
      this.advanceStoryQuest('Q06_RETRIEVE_CLAPPER');
      this.unlockLore('lore_runestones');
    } else if (
      flag === 'choice_knight_empathy' ||
      flag === 'choice_knight_silent_understanding' ||
      flag === 'choice_black_knight_vow' ||
      flag === 'choice_black_knight_silent_bond' ||
      flag === 'choice_hooded_knight_resolve' ||
      flag === 'choice_hooded_knight_plea' ||
      flag === 'choice_hooded_knight_farewell' ||
      flag === 'boss_hooded_knight_defeated' ||
      flag === 'campfire_knight_q3_completed'
    ) {
      this.unlockLore('lore_wayfarer_inner_journal');
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

  public isQuestTaskCompleted(questId: string, taskId: string): boolean {
    const q = this.quests.get(questId);
    if (!q) return false;
    const task = q.tasks.find(t => t.id === taskId);
    return task ? !!task.done : false;
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

  /** Recover the main story independently of which quest the player is tracking. */
  public getStoryQuestId(): string {
    const recorded = MAIN_QUEST_IDS_LATEST_FIRST.find(id => this.flags.has(MAIN_QUEST_FLAG_PREFIX + id));
    if (recorded) return recorded;
    if (MAIN_QUEST_IDS.includes(this.currentQuestId)) return this.currentQuestId;
    if (this.hasFlag('clapper_collected') || this.hasFlag('mire_pillars_solved')) return 'Q06_RETRIEVE_CLAPPER';
    if (this.hasFlag('entered_silent_mire')) return 'Q05_SOLVE_MIRE';
    if (this.isQuestTaskCompleted('Q04_ANCIENT_RUNES', 't1') || this.hasFlag('east_gate_unlocked')) return 'Q04_ANCIENT_RUNES';
    if (this.hasFlag('talked_to_neris')) return 'Q03_PREPARE_RESOURCES';
    if (this.hasFlag('talked_to_edda')) return 'Q02_MEET_NERIS';
    return 'Q01_MEET_EDDA';
  }

  public trackQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest || this.currentQuestId === questId) return;
    this.flags.add(MAIN_QUEST_FLAG_PREFIX + this.getStoryQuestId());
    this.currentQuestId = questId;
    this.emit('quest_changed', quest);
  }

  public advanceStoryQuest(questId: string): void {
    const previous = this.getStoryQuestId();
    if (MAIN_QUEST_IDS.indexOf(questId) <= MAIN_QUEST_IDS.indexOf(previous)) return;
    this.flags.add(MAIN_QUEST_FLAG_PREFIX + questId);
    if (this.currentQuestId === previous) this.trackQuest(questId);
    this.checkAndEmitUnlockEvents();
  }

  public setCurrentQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) return;
    if (quest.category === 'main') {
      const previous = this.getStoryQuestId();
      const next = MAIN_QUEST_IDS.indexOf(questId) > MAIN_QUEST_IDS.indexOf(previous) ? questId : previous;
      this.flags.add(MAIN_QUEST_FLAG_PREFIX + next);
    }
    if (this.currentQuestId === questId) this.emit('quest_changed', quest);
    else this.trackQuest(questId);
    if (questId === 'Q03_PREPARE_RESOURCES') this.evaluateQ03ResourceTask();
    this.checkAndEmitUnlockEvents();
  }

  public getCurrentQuest(): Quest | undefined {
    return this.quests.get(this.currentQuestId);
  }

  public getQuestsByCategory(category: 'main' | 'side'): Quest[] {
    return Array.from(this.quests.values()).filter(q => (q.category || 'main') === category);
  }

  public unlockLore(loreId: string, fallbackEntry?: Partial<LoreEntry>): void {
    if (this.unlockedLore.some(l => l.id === loreId)) return;
    const allLore = [
      ...loreData.loreEntries,
      ...(((loreData as any).subAreaLoreEntries as LoreEntry[]) || [])
    ];
    let lore = allLore.find(l => l.id === loreId);
    if (!lore && fallbackEntry && fallbackEntry.title && fallbackEntry.content) {
      lore = {
        id: loreId,
        act: fallbackEntry.act ?? 1,
        title: fallbackEntry.title,
        author: fallbackEntry.author ?? 'Vô danh',
        content: fallbackEntry.content
      } as LoreEntry;
    }
    if (lore) {
      this.unlockedLore.push(lore as LoreEntry);
      this.emit('lore_unlocked', lore);
    }
  }

  /**
   * HW-H4-08: Khôi phục danh sách bản ghi ký ức từ dữ liệu SaveData.
   */
  public restoreUnlockedLore(loreIds?: string[]): void {
    const validIds = Array.isArray(loreIds)
      ? loreIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      : [];
    if (validIds.length === 0) {
      this.unlockedLore = [loreData.loreEntries[0] as LoreEntry];
      return;
    }
    this.unlockedLore = [];
    for (const id of validIds) {
      this.unlockLore(id.trim());
    }
    if (this.unlockedLore.length === 0) {
      this.unlockedLore = [loreData.loreEntries[0] as LoreEntry];
    }
  }

  /**
   * V1.4 - P8-15B: Cập nhật tiến trình Thức Tỉnh Ký Ức và tự động giải phóng các chương hồi ức tương ứng
   */
  public setMemoryAwakeningStage(stage: number): void {
    const clamped = Math.max(0, Math.min(3, Math.floor(stage)));
    if (clamped <= this.memoryAwakeningStage) return;
    this.memoryAwakeningStage = clamped;

    if (clamped >= 1) {
      this.unlockLore('lore_memory_chapter_1');
      this.unlockLore('lore_memory_chapter_2');
      this.unlockLore('lore_black_knight_chronicle');
    }
    if (clamped >= 2) {
      this.unlockLore('lore_memory_chapter_3');
      this.unlockLore('lore_wayfarer_inner_journal');
    }
    if (clamped >= 3) {
      this.unlockLore('lore_memory_chapter_4');
      this.unlockLore('lore_wayfarer_inner_journal');
    }

    this.emit('memory_awakening_changed', clamped);
  }

  /**
   * Mở khóa trọn vẹn 4 Chương Hồi Ức trong Sổ Tay [J]
   */
  public unlockAllMemoryChapters(): void {
    this.unlockLore('lore_memory_chapter_1');
    this.unlockLore('lore_memory_chapter_2');
    this.unlockLore('lore_memory_chapter_3');
    this.unlockLore('lore_memory_chapter_4');
    this.unlockLore('lore_wayfarer_inner_journal');
  }

  // --- V1.4: Sổ Tay Sinh Vật (Bestiary Ecosystem) ---
  private initDefaultBestiary(): void {
    this.bestiary.clear();
    this.bestiary.set('crow', {
      species: 'crow',
      contentId: 'HW-ANI-AMBIENT-000001',
      runtimeKey: 'ani_crow',
      nameVi: 'Quạ Rừng',
      nameEn: 'Forest Crow',
      roleVi: 'Sinh vật cảnh báo tự nhiên',
      habitatVi: 'Outer Woods, Crooked Path, cành cây & hàng rào',
      behaviorVi: 'Đậu im lặng quan sát. Giật mình vỗ cánh bay lên phát ra tiếng quạ lớn khi người chơi chạy nhanh ([Shift]) hoặc khi The Listener tiến lại gần.',
      counterVi: 'Đi bộ chậm ([WASD]), cúi mình hoặc ẩn nấp khi nghe quạ kêu để không đánh động Kẻ Lắng Nghe.',
      observed: false
    });
    this.bestiary.set('lantern_moth', {
      species: 'lantern_moth',
      contentId: 'HW-ANI-AMBIENT-000002',
      runtimeKey: 'ani_lantern_moth',
      nameVi: 'Bướm Đêm Hổ Phách',
      nameEn: 'Amber Lantern Moth',
      roleVi: 'Sinh thái chỉ dẫn & tài nguyên sáng',
      habitatVi: 'Vườn Thảo Dược Sanctuary Farm, khóm hoa đêm ven Rừng Sâu',
      behaviorVi: 'Bị hấp dẫn bởi ánh sáng đèn lồng [F] và lửa trại. Khi bay lượn phát ra vệt bụi phấn ấm áp xua tan sương mù.',
      counterVi: 'Bật đèn lồng để thu hút bướm đêm tụ lại gần. Thu thập phấn bướm làm nguyên liệu chế tạo Dầu Đèn và Bó Đuốc.',
      observed: false
    });
    this.bestiary.set('echo', {
      species: 'echo',
      contentId: 'HW-MON-ECHO-000001',
      runtimeKey: 'mon_the_echo',
      nameVi: 'Hiện Tượng Ký Ức (The Echo)',
      nameEn: 'The Echo',
      roleVi: 'Ảo ảnh tâm lý & Dấu vết lịch sử',
      habitatVi: 'Khoảng Trống Thì Thầm, Rìa Rừng Ngoại Vi vào ban đêm/hoàng hôn',
      behaviorVi: 'Bóng mờ lững lờ phát ra tiếng thì thầm, tiếng bước chân giả đánh lừa giác quan. Tuyệt đối không gây sát thương vật lý.',
      counterVi: 'Bật đèn lồng [F] soi thẳng hoặc đến gần để bóng mờ tan biến. Lắng nghe tiếng gió hú để phân biệt bước chân giả với Kẻ Lắng Nghe thật.',
      observed: false
    });
    this.bestiary.set('listener', {
      species: 'listener',
      contentId: 'HW-MON-LISTENER-000001',
      runtimeKey: 'mon_the_listener',
      nameVi: 'Kẻ Lắng Nghe (The Listener)',
      nameEn: 'The Listener',
      roleVi: 'Thực thể săn đuổi thính giác',
      habitatVi: 'Rừng Sâu (Deep Forest), Đầm Lầy Tĩnh Lặng, Lối Mòn Quanh Co',
      behaviorVi: 'Mù hoàn toàn, phản ứng cực nhạy với tiếng bước chân chạy và âm thanh va đập. Có bộ nhớ chống lặp mồi nhử nếu ném liên tục vào cùng vị trí.',
      counterVi: 'Đi bộ nhẹ nhàng, nấp vào Thân Cây Rỗng [E], ném Mồi Tạo Tiếng Động [Q] cách xa hoặc cắm Bó Đuốc Nhựa Thông để làm choáng đẩy lùi.',
      observed: false
    });
    this.bestiary.set('mire_warden', {
      species: 'mire_warden',
      contentId: 'HW-BOS-WARDEN-000001',
      runtimeKey: 'bos_mire_warden',
      nameVi: 'Kẻ Nuốt Tiếng Chuông (The Mire Warden)',
      nameEn: 'The Mire Warden',
      roleVi: 'Thực thể Trùm Cổ Đại Miếu Chuông',
      habitatVi: 'Miếu Chuông Phế Tích (The Broken Bell Shrine), Sân Đá Cổ',
      behaviorVi: 'Thực thể khổng lồ mù hoàn toàn, định vị và lao húc cực nhanh theo nguồn âm thanh [Q]. Sở hữu giáp sương mù bất hoại trước đòn đánh trực diện. Pha 2 dập tắt trụ lửa và triệu hồi ảo ảnh The Echo.',
      counterVi: 'Dẫn dụ Boss húc đâm sầm vào Trụ Lửa Cổ Ngữ để làm choáng (Stun 3.5s) nứt giáp sương mù, sau đó tấn công điểm yếu bằng Giáo hoặc Gậy. Dùng Đèn Lồng [F] thắp lại 3 trụ lửa để phá giải sương đặc.',
      observed: false
    });
    this.bestiary.set('skull_wolf', {
      species: 'skull_wolf',
      contentId: 'HW-MON-BEAST-000001',
      runtimeKey: 'mon_skull_wolf',
      nameVi: 'Sói Xương (Skull Wolf)',
      nameEn: 'Skull Wolf',
      roleVi: 'Dã thú săn đêm & Kẻ rình rập',
      habitatVi: 'The Crooked Path, Deep Forest & Rìa Silent Mire vào ban đêm/hoàng hôn',
      behaviorVi: 'Dã thú lộ xương đầu hung dữ. Rình rập và đánh hơi tiếng chạy của con mồi. Sợ ánh lửa đèn lồng [F] và lửa trại; chỉ dám vồ mồi (Lunge) khi người chơi bước vào bóng tối hoặc hết dầu đèn.',
      counterVi: 'Bật Đèn Lồng [F], đứng gần Lửa Trại hoặc cắm Đuốc Nhựa Thông để buộc Sói Xương chùn bước. Dùng Giáo Gỗ Bịt Sắt hoặc Rìu Rừng phản công 2-3 đòn để đánh tan thành tro bụi, thu thập Nanh Xương Cổ.',
      observed: false
    });
    this.bestiary.set('shadow_crow', {
      species: 'shadow_crow',
      contentId: 'HW-MON-SHADOW-000001',
      runtimeKey: 'mon_shadow_crow',
      nameVi: 'Quạ Bóng Tối (Shadow Crow)',
      nameEn: 'Shadow Crow',
      roleVi: 'Chim quấy rối & Cảnh giới bóng đêm',
      habitatVi: 'Outer Woods & Deep Forest vào ban đêm',
      behaviorVi: 'Quạ đen hấp thụ tà khí bóng tối, đậu rình rập trên cành khô. Khi phát hiện người chơi chạy ồn hoặc đứng lâu trong bóng tối, chúng sà xuống mổ quấy rối và cất tiếng kêu sắc nhọn báo động The Listener.',
      counterVi: 'Bật Đèn Lồng [F] để xua đuổi. Dùng Gậy Gỗ hoặc Giáo đập trúng khi chúng sà xuống để đánh tan.',
      observed: false
    });
    this.bestiary.set('shadow_eyes', {
      species: 'shadow_eyes',
      contentId: 'HW-MON-SHADOW-000002',
      runtimeKey: 'mon_shadow_eyes',
      nameVi: 'Bóng Mắt Sương Mù (Mist Stalker)',
      nameEn: 'Mist Stalker Eyes',
      roleVi: 'Bóng ma theo dõi & Rút cạn tinh thần',
      habitatVi: 'Deep Forest & Silent Mire trong sương mù dày đặc',
      behaviorVi: 'Những cặp mắt quỷ dị lơ lửng ẩn hiện trong sương. Nhìn trực diện vào chúng trong bóng tối sẽ khiến Bình Tâm tụt dốc không phanh vì hoảng loạn.',
      counterVi: 'Rọi thẳng Đèn Lồng [F] vào chúng — ánh sáng thanh tẩy sẽ khiến cặp mắt lập tức tan biến vào hư không.',
      observed: false
    });
    this.bestiary.set('shadow_behemoth', {
      species: 'shadow_behemoth',
      contentId: 'HW-MON-BOSS-000003',
      runtimeKey: 'boss_shadow_behemoth',
      nameVi: 'Trùm Bóng Tối Khổng Lồ (Abyssal Shade Behemoth)',
      nameEn: 'Abyssal Shade Behemoth',
      roleVi: 'Chúa tể bóng tối vùng cấm & Thực thể khổng lồ',
      habitatVi: 'Silent Mire & Tàn tích Đền Cổ',
      behaviorVi: 'Quái vật khổng lồ mang thân xác bóng tối đặc quánh. Tung đòn vung tay và giẫm đất tạo sóng chấn động diện rộng (2a -> 2b -> 2c). Khi đánh trượt (miss), cơ thể sẽ bị khựng lại để lộ lõi yếu điểm.',
      counterVi: 'Né tránh cú đập khi mặt đất báo động đỏ. Tận dụng nhịp khựng lại của Boss để dùng Giáo Gỗ Bịt Sắt đâm vào lõi bóng tối, kết hợp ánh sáng đèn lồng để thanh tẩy, thu thập Mảnh Tinh Chất Bóng Tối.',
      observed: false
    });
    this.bestiary.set('fallen_knight', {
      species: 'fallen_knight',
      contentId: 'HW-MON-KNIGHT-000001',
      runtimeKey: 'mon_fallen_knight',
      nameVi: 'Hiệp Sĩ Sa Ngã (Fallen Knight)',
      nameEn: 'Fallen Knight',
      roleVi: 'Tàn quân hộ vệ & Chiến binh cận chiến',
      habitatVi: 'Đường Mòn Quanh Co (Crooked Path) & Rừng Sâu',
      behaviorVi: 'Quỳ cầu nguyện trong vô thức bên phế tích. Khi nghe tiếng bước chân chạy ồn hoặc ánh đèn lồng rọi vào, hắn lập tức đứng dậy tuốt kiếm truy đuổi và tung chuỗi đòn chém liên hoàn.',
      counterVi: 'Lợi dụng nhịp thở hồi phục sau chuỗi chém kiếm của hắn để phản công. Đòn đâm Giáo Gỗ Bịt Sắt hoặc rìu chém sẽ làm hắn loạng choạng sơ hở.',
      observed: false
    });
    this.bestiary.set('dread_horseman', {
      species: 'dread_horseman',
      contentId: 'HW-MON-KNIGHT-000002',
      runtimeKey: 'mon_dread_horseman',
      nameVi: 'Kỵ Binh Hắc Ám (Dread Horseman)',
      nameEn: 'Dread Horseman',
      roleVi: 'Kỵ binh tuần tra & Đột kích tốc độ cao',
      habitatVi: 'Đường Mòn Quanh Co & Bìa Rừng Ngoại Vi',
      behaviorVi: 'Cưỡi chiến mã đen tuyền tuần tra dọc các ngả đường mòn. Khi phát hiện mục tiêu, chiến mã hí vang giương vó rồi phóng nước đại càn quét thẳng hàng với tốc độ xé gió.',
      counterVi: 'Lập tức lăn xả né sang bụi rậm hai bên đường khi nghe tiếng ngựa hí báo hiệu. Cú lao thẳng không thể rẽ ngoặt, để lộ sườn cho người chơi dùng Giáo phản kích.',
      observed: false
    });
    this.bestiary.set('hooded_knight', {
      species: 'hooded_knight',
      contentId: 'HW-MON-BOSS-000002',
      runtimeKey: 'boss_hooded_knight',
      nameVi: 'Sir Mordric — Kỵ Sĩ Bóng Tối (Kỵ Sĩ Trùm Mũ)',
      nameEn: 'Sir Mordric — The Dark Knight',
      roleVi: 'Kỵ sĩ sa ngã & Trùm trấn giữ tàn tích Rừng Sâu',
      habitatVi: 'Ngưỡng cửa Rừng Sâu & Tàn tích Đền Cổ',
      behaviorVi: 'Chiến binh giáp đen sa ngã mang luồng khí hắc ám nặng nề. Hắn tích tụ bóng tối quanh thanh đại kiếm trước khi tung nhát chém cuồng nộ quét ngang phía trước.',
      counterVi: 'Áp sát bật Vòng Sáng Hộ Tâm [F] cường độ cao hoặc ném Đuốc Nhựa Thông để ngắt chiêu tích tụ tà khí, đẩy đối thủ vào trạng thái Choáng Váng (Stagger) nhận gấp đôi sát thương.',
      observed: false
    });
  }

  public observeCreature(species: BestiarySpecies): boolean {
    const entry = this.bestiary.get(species);
    if (!entry) return false;
    if (!entry.observed) {
      entry.observed = true;
      entry.discoveredAt = Date.now();
      this.emit('creature_observed', entry);
      return true;
    }
    return false;
  }

  public isCreatureObserved(species: BestiarySpecies): boolean {
    return this.bestiary.get(species)?.observed ?? false;
  }

  public getBestiaryEntries(): BestiaryEntry[] {
    return Array.from(this.bestiary.values());
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

  public updateHerbPlot(id: string, stage: HerbPlotStage, plantedAt: number, cropType?: CropType, isPrepared?: boolean): void {
    const plot = this.herbPlots.find(p => p.id === id);
    if (plot) {
      plot.stage = stage;
      plot.plantedAt = plantedAt;
      if (cropType !== undefined) plot.cropType = cropType;
      if (isPrepared !== undefined) plot.isPrepared = isPrepared;
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

  // --- V1.4 - P8-04: Quản lý vùng lưu dự phòng legacyExtraData ---
  public getLegacyExtraData(): Record<string, any> | undefined {
    return this.legacyExtraData;
  }

  public setLegacyExtraData(data?: Record<string, any>): void {
    this.legacyExtraData = data ? { ...data } : undefined;
  }

  public setLegacyExtraValue(key: string, value: any): void {
    if (!this.legacyExtraData) {
      this.legacyExtraData = {};
    }
    this.legacyExtraData[key] = value;
  }

  public getLegacyExtraValue(key: string): any {
    return this.legacyExtraData ? this.legacyExtraData[key] : undefined;
  }
}


