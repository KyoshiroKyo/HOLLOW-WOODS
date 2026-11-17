/**
 * HOLLOW WOODS V1.4 - PHẦN 3: BƯỚC V14-P3-01
 * SANCTUARY CAMP HUB SYSTEM (LÀNG BELLHOLLOW)
 * 
 * Quản lý tập trung 4 thành phần thiết yếu của khu trại sinh tồn:
 * 1. Lửa Trại Trung Tâm 3 Cấp (Campfire 3-Tier with Fuel Timer)
 * 2. Rương Chứa Đồ 12 Ô (12-Slot Storage Chest)
 * 3. Nồi Thảo Dược Sắc Thuốc & Nấu Nướng (Herbal Cauldron)
 * 4. Lều Trú Ẩn Nghỉ Ngơi & Đổi Pha Thời Gian (Shelter Tent)
 */

import { PlayerState } from '../state/PlayerState';
import { TimeSystem } from './TimeSystem';
import itemsData from '../data/items.json';

export interface StorageSlot {
  key: string;
  name: string;
  count: number;
  description: string;
}

export interface CauldronRecipe {
  id: string;
  name: string;
  description: string;
  resultKey: string;
  resultCount: number;
  ingredients: Array<{ key: string; name: string; count: number }>;
}

export class CampSystem {
  private static instance: CampSystem | null = null;
  private playerState: PlayerState;

  // Lửa trại trung tâm Bellhollow
  public readonly campfireX: number = 780;
  public readonly campfireY: number = 260;

  // Giới hạn rương
  public readonly maxChestSlots: number = 12;

  // Công thức Nồi Thảo Dược (Herbal Cauldron Recipes)
  private cauldronRecipes: CauldronRecipe[] = [
    {
      id: 'brew_healing_poultice',
      name: 'Thuốc Đắp Thảo Dược',
      description: 'Nấu nhựa cây hòa cùng thảo dược bạc thành cao dán hồi phục sinh lực (+35 HP).',
      resultKey: 'item_healing_poultice',
      resultCount: 1,
      ingredients: [
        { key: 'res_herbs', name: 'Thảo Dược Bạc', count: 2 },
        { key: 'res_tree_resin', name: 'Nhựa Cây Rừng', count: 1 }
      ]
    },
    {
      id: 'brew_lantern_oil',
      name: 'Tinh Dầu Đèn Lồng',
      description: 'Chưng cất nhựa cây và cành củi khô thành dầu cháy sáng (+40 Dầu Đèn).',
      resultKey: 'item_lantern_oil',
      resultCount: 1,
      ingredients: [
        { key: 'res_tree_resin', name: 'Nhựa Cây Rừng', count: 2 },
        { key: 'res_dry_wood', name: 'Gỗ Khô', count: 1 }
      ]
    },
    {
      id: 'brew_calming_tea',
      name: 'Trà Thảo Mộc An Thần',
      description: 'Sắc thảo dược tươi giúp ổn định tinh thần, hồi phục ngay +40 Bình Tâm.',
      resultKey: 'item_herbal_brew',
      resultCount: 1,
      ingredients: [
        { key: 'res_herbs', name: 'Thảo Dược Bạc', count: 3 }
      ]
    }
  ];

  constructor() {
    this.playerState = PlayerState.getInstance();
    CampSystem.instance = this;
  }

  public static getInstance(): CampSystem {
    if (!CampSystem.instance) {
      CampSystem.instance = new CampSystem();
    }
    return CampSystem.instance;
  }

  // =========================================================================
  // 1. LỬA TRẠI TRUNG TÂM 3 CẤP (CAMPFIRE 3 TIERS)
  // =========================================================================

  public getCampfireLevel(): number {
    return this.playerState.campfireLevel || 1;
  }

  public getCampfireFuel(): number {
    return this.playerState.campfireFuel !== undefined ? this.playerState.campfireFuel : 180;
  }

  public isCampfireLit(): boolean {
    return this.getCampfireFuel() > 0;
  }

  /**
   * Bán kính vùng ấm và ánh sáng an toàn theo cấp độ lửa trại:
   * Cấp 1: 120px (Lửa le lói)
   * Cấp 2: 180px (Lửa cháy đều)
   * Cấp 3: 250px (Lửa rực rỡ, đẩy lùi sương sâu)
   */
  public getCampfireRadius(): number {
    if (!this.isCampfireLit()) return 60; // Tàn tro le lói
    const level = this.getCampfireLevel();
    if (level >= 3) return 250;
    if (level === 2) return 180;
    return 120;
  }

  /**
   * Tốc độ hồi Bình Tâm mỗi giây khi đứng cạnh lửa trại
   */
  public getComposureBonus(): number {
    if (!this.isCampfireLit()) return 0.2;
    const level = this.getCampfireLevel();
    if (level >= 3) return 1.8;
    if (level === 2) return 1.0;
    return 0.5;
  }

  /**
   * Nạp nhiên liệu vào Lửa Trại:
   * - res_dry_wood (Gỗ khô): +90s nhiên liệu
   * - res_tree_resin (Nhựa cây): +150s nhiên liệu, kích nhiệt nâng cấp
   */
  public addFuel(itemKey: 'res_dry_wood' | 'res_tree_resin', count: number = 1): {
    success: boolean;
    message: string;
    level: number;
    fuel: number;
  } {
    const currentCount = this.playerState.getItemCount(itemKey);
    if (currentCount < count) {
      const itemName = itemKey === 'res_dry_wood' ? 'Gỗ Khô' : 'Nhựa Cây Rừng';
      return {
        success: false,
        message: `Bạn không đủ ${itemName} (cần ${count}, có ${currentCount}).`,
        level: this.getCampfireLevel(),
        fuel: this.getCampfireFuel()
      };
    }

    this.playerState.removeItem(itemKey, count);

    const fuelPerUnit = itemKey === 'res_dry_wood' ? 90 : 150;
    const addedFuel = fuelPerUnit * count;
    let newFuel = Math.min(600, this.getCampfireFuel() + addedFuel); // Tối đa 600s (10 phút)

    // Xác định cấp độ theo lượng nhiên liệu tích lũy
    let newLevel = 1;
    if (newFuel >= 360) {
      newLevel = 3;
    } else if (newFuel >= 180) {
      newLevel = 2;
    } else {
      newLevel = 1;
    }

    this.playerState.campfireFuel = newFuel;
    this.playerState.campfireLevel = newLevel;

    const itemName = itemKey === 'res_dry_wood' ? 'Gỗ Khô' : 'Nhựa Cây';
    const levelDesc = newLevel === 3 ? 'RỰC RỠ (Cấp 3)' : newLevel === 2 ? 'CHÁY ĐỀU (Cấp 2)' : 'DUY TRÌ (Cấp 1)';
    const message = `Đã nạp ${count}x ${itemName}! Lửa Trại nâng lên mức ${levelDesc}. Thời gian cháy: ${Math.round(newFuel)}s.`;

    this.playerState.emit('campfire_updated', { level: newLevel, fuel: newFuel });

    return {
      success: true,
      message,
      level: newLevel,
      fuel: newFuel
    };
  }

  public update(dt: number): void {
    if (dt <= 0) return;

    if (this.playerState.campfireFuel !== undefined && this.playerState.campfireFuel > 0) {
      this.playerState.campfireFuel = Math.max(0, this.playerState.campfireFuel - dt);

      // Cập nhật tụt cấp độ khi nhiên liệu cạn dần
      const fuel = this.playerState.campfireFuel;
      let targetLevel = 1;
      if (fuel >= 360) {
        targetLevel = 3;
      } else if (fuel >= 180) {
        targetLevel = 2;
      } else {
        targetLevel = 1;
      }

      if (targetLevel !== this.playerState.campfireLevel) {
        this.playerState.campfireLevel = targetLevel;
        this.playerState.emit('campfire_updated', { level: targetLevel, fuel });
      }
    }
  }

  // =========================================================================
  // 2. RƯƠNG CHỨA ĐỒ 12 Ô (12-SLOT STORAGE CHEST)
  // =========================================================================

  public getChestSlots(): StorageSlot[] {
    const slots: StorageSlot[] = [];
    for (const [key, count] of this.playerState.storageChest.entries()) {
      if (count > 0) {
        const def = (itemsData as Record<string, any>)[key] || { name: key, description: '' };
        slots.push({
          key,
          name: def.name || key,
          count,
          description: def.description || ''
        });
      }
    }
    return slots;
  }

  public getUsedSlotCount(): number {
    let count = 0;
    for (const [, qty] of this.playerState.storageChest.entries()) {
      if (qty > 0) count++;
    }
    return count;
  }

  /**
   * Cất vật phẩm từ túi đồ người chơi vào Rương Trú Ẩn
   */
  public depositItem(itemKey: string, amount: number = 1): {
    success: boolean;
    deposited: number;
    message: string;
  } {
    const playerHas = this.playerState.getItemCount(itemKey);
    if (playerHas <= 0) {
      return { success: false, deposited: 0, message: 'Bạn không có vật phẩm này trong túi.' };
    }

    const toDeposit = Math.min(playerHas, amount);
    const inChest = this.playerState.storageChest.get(itemKey) || 0;

    // Nếu món này chưa có trong rương và rương đã đủ 12 ô
    if (inChest === 0 && this.getUsedSlotCount() >= this.maxChestSlots) {
      return { success: false, deposited: 0, message: 'Rương chứa đồ đã đầy (tối đa 12 ô).' };
    }

    this.playerState.removeItem(itemKey, toDeposit);
    this.playerState.storageChest.set(itemKey, inChest + toDeposit);

    const def = (itemsData as Record<string, any>)[itemKey] || { name: itemKey };
    const itemName = def.name || itemKey;

    this.playerState.emit('chest_updated');

    return {
      success: true,
      deposited: toDeposit,
      message: `Đã cất ${toDeposit}x ${itemName} vào Rương Trú Ẩn.`
    };
  }

  /**
   * Lấy vật phẩm từ Rương Trú Ẩn vào túi đồ người chơi
   */
  public withdrawItem(itemKey: string, amount: number = 1): {
    success: boolean;
    withdrawn: number;
    message: string;
  } {
    const inChest = this.playerState.storageChest.get(itemKey) || 0;
    if (inChest <= 0) {
      return { success: false, withdrawn: 0, message: 'Vật phẩm không có trong rương.' };
    }

    const toWithdraw = Math.min(inChest, amount);
    const newChestQty = inChest - toWithdraw;

    if (newChestQty <= 0) {
      this.playerState.storageChest.delete(itemKey);
    } else {
      this.playerState.storageChest.set(itemKey, newChestQty);
    }

    this.playerState.addItem(itemKey, toWithdraw);

    const def = (itemsData as Record<string, any>)[itemKey] || { name: itemKey };
    const itemName = def.name || itemKey;

    this.playerState.emit('chest_updated');

    return {
      success: true,
      withdrawn: toWithdraw,
      message: `Đã lấy ${toWithdraw}x ${itemName} từ Rương Trú Ẩn.`
    };
  }

  // =========================================================================
  // 3. NỒI THẢO DƯỢC (HERBAL CAULDRON)
  // =========================================================================

  public getCauldronRecipes(): CauldronRecipe[] {
    return this.cauldronRecipes;
  }

  public canBrewRecipe(recipeId: string): { canBrew: boolean; missingIngredients: string[] } {
    const recipe = this.cauldronRecipes.find(r => r.id === recipeId);
    if (!recipe) return { canBrew: false, missingIngredients: ['Không tìm thấy công thức'] };

    const missing: string[] = [];
    for (const ing of recipe.ingredients) {
      const count = this.playerState.getItemCount(ing.key);
      if (count < ing.count) {
        missing.push(`${ing.name} (cần ${ing.count}, có ${count})`);
      }
    }

    return {
      canBrew: missing.length === 0,
      missingIngredients: missing
    };
  }

  public brewRecipe(recipeId: string): { success: boolean; message: string; resultKey?: string } {
    const check = this.canBrewRecipe(recipeId);
    if (!check.canBrew) {
      return {
        success: false,
        message: `Thiếu nguyên liệu: ${check.missingIngredients.join(', ')}.`
      };
    }

    const recipe = this.cauldronRecipes.find(r => r.id === recipeId)!;
    for (const ing of recipe.ingredients) {
      this.playerState.removeItem(ing.key, ing.count);
    }

    // Nếu sắc dầu đèn lồng thì nạp trực tiếp vào bình dầu hoặc thêm item
    if (recipe.resultKey === 'item_lantern_oil') {
      const stats = this.playerState.stats;
      stats.lanternOil = Math.min(stats.maxLanternOil, stats.lanternOil + 40);
      this.playerState.emit('stats_changed', stats);
    } else if (recipe.resultKey === 'item_herbal_brew') {
      const stats = this.playerState.stats;
      stats.composure = Math.min(stats.maxComposure, stats.composure + 40);
      this.playerState.emit('stats_changed', stats);
    } else {
      this.playerState.addItem(recipe.resultKey, recipe.resultCount);
    }

    return {
      success: true,
      message: `Đã sắc thành công ${recipe.name}!`,
      resultKey: recipe.resultKey
    };
  }

  // =========================================================================
  // 4. LỀU TRÚ ẨN (SHELTER TENT) & NGHỈ NGƠI
  // =========================================================================

  /**
   * Kiểm tra điều kiện nghỉ ngơi tại Lều Trú Ẩn:
   * Tự động khóa chức năng ngủ nếu đang có cảnh báo khẩn cấp hoặc quái vật săn đuổi
   */
  public checkRestCondition(isAlertOrCombat: boolean = false): {
    canRest: boolean;
    reason?: string;
    costItem?: string;
    costName?: string;
  } {
    if (isAlertOrCombat) {
      return {
        canRest: false,
        reason: 'Không thể ngủ lúc này! Có hiểm nguy đang rình rập quanh làng.'
      };
    }

    // Yêu cầu tiêu hao 1 củi khô để giữ ấm lều hoặc 1 than củi
    const hasWood = this.playerState.getItemCount('res_dry_wood') >= 1;
    const isFireLit = this.isCampfireLit();

    if (!hasWood && !isFireLit) {
      return {
        canRest: false,
        reason: 'Lều quá lạnh buốt! Cần 1 Gỗ Khô hoặc ngọn Lửa Trại đang cháy để sưởi ấm.'
      };
    }

    return {
      canRest: true,
      costItem: hasWood ? 'res_dry_wood' : undefined,
      costName: hasWood ? '1x Gỗ Khô' : 'Hơi ấm Lửa Trại'
    };
  }

  /**
   * Thực hiện nghỉ ngơi: hồi phục sức lực và chuyển sang pha thời gian tiếp theo
   */
  public restInShelter(timeSystem?: TimeSystem, isAlertOrCombat: boolean = false): {
    success: boolean;
    message: string;
  } {
    const condition = this.checkRestCondition(isAlertOrCombat);
    if (!condition.canRest) {
      return { success: false, message: condition.reason || 'Không thể nghỉ ngơi lúc này.' };
    }

    // Tiêu hao củi nếu có
    if (condition.costItem) {
      this.playerState.removeItem(condition.costItem, 1);
    }

    // 1. Hồi phục trọn vẹn chỉ số sinh tồn
    const stats = this.playerState.stats;
    stats.health = stats.maxHealth;
    stats.stamina = stats.maxStamina;
    stats.composure = stats.maxComposure;
    stats.moisture = 0;       // Hong khô hoàn toàn
    stats.temperature = 90;   // Ấm áp sảng khoái

    this.playerState.emit('stats_changed', stats);

    // 2. Chuyển sang pha thời gian tiếp theo
    if (timeSystem) {
      const currentPhase = timeSystem.getCurrentPhase();
      if (currentPhase === 'NIGHT' || currentPhase === 'DUSK') {
        // Nghỉ qua đêm tới sáng sớm hôm sau (DAY lúc 0s)
        timeSystem.advanceToNextPhase();
      } else {
        // Nghỉ trưa tới hoàng hôn
        timeSystem.advanceToNextPhase();
      }
    }

    return {
      success: true,
      message: '🏕️ Bạn đã có giấc ngủ ấm áp trong Lều Trú Ẩn. Sinh lực và tinh thần được hồi phục trọn vẹn.'
    };
  }
}
