/**
 * HOLLOW WOODS V1.4 — PHẦN 4: BƯỚC V14-P4-02
 * HỆ THỐNG 4 Ô TRANG BỊ CÁ NHÂN & CƠ CHẾ TỰ VỆ SINH TỒN (SURVIVAL DEFENSE)
 * 
 * 1. 4 Ô Trang bị chuyên biệt: BODY, FEET, BACK, CHARM có cơ chế đánh đổi chỉ số hợp lý.
 * 2. TUYỆT ĐỐI KHÔNG CÓ ĐỘ BỀN (No Durability) — Trang bị bền bỉ theo thời gian.
 * 3. Tự vệ sinh tồn: 3 loại vũ khí (Gậy lữ hành, Giáo gỗ bịt sắt, Rìu rừng nhỏ) và Đuốc nhựa thông.
 * 4. Quy tắc sống còn: Đòn đánh phát ra âm thanh thu hút The Listener; vũ khí KHÔNG THỂ giết chết quái vật vĩnh viễn.
 */

import { PlayerState } from '../state/PlayerState';
import { EquipmentSlot, EquipmentItemDef, WeaponId, WeaponDef } from '../types';

export interface StatComparisonEntry {
  labelVi: string;
  currentVal: string;
  previewVal: string;
  diffType: 'buff' | 'nerf' | 'neutral';
  explanation: string;
}

export class EquipmentSystem {
  private static instance: EquipmentSystem;
  private playerState: PlayerState;

  // 1. Danh mục 4 trang bị chuyên biệt Canon Bellhollow
  public static readonly EQUIPMENT_REGISTRY: Record<string, EquipmentItemDef> = {
    eqp_moss_cloak: {
      id: 'eqp_moss_cloak',
      name: 'Áo Choàng Rêu Lót Lông',
      slot: 'body',
      description: 'Áo choàng may từ rêu rừng và sợi dai. Giảm 40% tích tụ Độ Ẩm và giữ ấm Thân Nhiệt, nhưng giảm 5% tốc độ chạy nước rút.',
      moistureRateMod: 0.60,
      coldRateMod: 0.60,
      sprintSpeedMod: 0.95
    },
    eqp_trail_boots: {
      id: 'eqp_trail_boots',
      name: 'Ủng Đi Rừng',
      slot: 'feet',
      description: 'Ủng da đế gỗ bọc rễ dẻo. Giảm 30% tiếng bước chân và di chuyển vững chãi không bị chậm trên bùn lầy Silent Mire.',
      noiseRadiusMod: 0.70,
      mireSlowImmunity: true,
      sprintSpeedMod: 1.0
    },
    eqp_field_backpack: {
      id: 'eqp_field_backpack',
      name: 'Túi Hành Trang',
      slot: 'back',
      description: 'Túi đeo lưng bện sợi mở rộng thêm 4 ô chứa đồ mang theo (8 -> 12 ô), nhưng tiêu hao thêm 15% Thể Lực khi chạy nhanh.',
      extraInventorySlots: 4,
      sprintStaminaDrainMod: 1.15
    },
    eqp_bell_ward_charm: {
      id: 'eqp_bell_ward_charm',
      name: 'Bùa Chuông Cổ',
      slot: 'charm',
      description: 'Bùa hộ mệnh chuông đồng ban tặng bởi Edda. Giảm 25% tốc độ tụt Bình Tâm trong bóng tối và rung báo hiệu khi gần Ký Ức.',
      composureDrainMod: 0.75,
      detectEchoProximity: true
    }
  };

  // 2. Danh mục vũ khí tự vệ sinh tồn (V1.4 - Chuẩn hóa thông số hitbox & knockback)
  public static readonly WEAPONS_REGISTRY: Record<WeaponId, WeaponDef> = {
    wpn_walking_staff: {
      id: 'wpn_walking_staff',
      name: 'Gậy Gỗ',
      reach: 42, // Nâng cấp chuẩn hóa V1.4-P8-03 (cũ: reach: 28, knockback: 130)
      radius: 42,
      knockback: 20,
      knockbackDistance: 20,
      damage: 10,
      staggerDuration: 500,
      attackCooldown: 600,
      staminaCost: 14,
      noiseRadius: 120,
      attackDuration: 350,
      woodcuttingMultiplier: 1.0,
      canTriggerWeakness: false
    },
    wpn_iron_spear: {
      id: 'wpn_iron_spear',
      name: 'Giáo Gỗ Bịt Sắt',
      reach: 72, // Nâng cấp chuẩn hóa V1.4-P8-03 (cũ: reach: 56)
      radius: 54,
      knockback: 45,
      knockbackDistance: 45,
      damage: 25,
      staggerDuration: 850,
      attackCooldown: 900,
      staminaCost: 26,
      noiseRadius: 120,
      attackDuration: 500,
      woodcuttingMultiplier: 1.0,
      canTriggerWeakness: true
    },
    wpn_hunting_hatchet: {
      id: 'wpn_hunting_hatchet',
      name: 'Rìu Đi Rừng',
      reach: 36,
      radius: 38,
      knockback: 25,
      knockbackDistance: 25,
      damage: 18,
      staggerDuration: 600,
      attackCooldown: 550,
      staminaCost: 16,
      noiseRadius: 120,
      attackDuration: 380,
      woodcuttingMultiplier: 2.0,
      canTriggerWeakness: false
    }
  };

  constructor() {
    this.playerState = PlayerState.getInstance();
  }

  public static getInstance(): EquipmentSystem {
    if (!EquipmentSystem.instance) {
      EquipmentSystem.instance = new EquipmentSystem();
    }
    return EquipmentSystem.instance;
  }

  // --- TRA CỨU ĐỊNH NGHĨA TRANG BỊ & VŨ KHÍ ---

  public getEquipmentDef(itemId: string): EquipmentItemDef | undefined {
    return EquipmentSystem.EQUIPMENT_REGISTRY[itemId];
  }

  public getWeaponDef(weaponId?: string): WeaponDef {
    if (weaponId && weaponId in EquipmentSystem.WEAPONS_REGISTRY) {
      return EquipmentSystem.WEAPONS_REGISTRY[weaponId as WeaponId];
    }
    return EquipmentSystem.WEAPONS_REGISTRY.wpn_walking_staff;
  }

  public getActiveWeaponDef(): WeaponDef {
    return this.getWeaponDef(this.playerState.getActiveWeapon());
  }

  public hasDurability(): boolean {
    return false; // TUYỆT ĐỐI KHÔNG CÓ ĐỘ BỀN THEO THIẾT KẾ V1.4
  }

  // --- QUẢN LÝ Ô TRANG BỊ (EQUIP / UNEQUIP) ---

  public getEquipped(slot: EquipmentSlot): string | null {
    if (!this.playerState.equippedSlots) {
      this.playerState.equippedSlots = { body: null, feet: null, back: null, charm: null };
    }
    return this.playerState.equippedSlots[slot] ?? null;
  }

  public getAllEquipped(): Record<EquipmentSlot, string | null> {
    return {
      body: this.getEquipped('body'),
      feet: this.getEquipped('feet'),
      back: this.getEquipped('back'),
      charm: this.getEquipped('charm')
    };
  }

  public equip(slot: EquipmentSlot, itemId: string): boolean {
    const def = this.getEquipmentDef(itemId);
    if (!def || def.slot !== slot) return false;

    // Kiểm tra vật phẩm có trong túi đồ
    const count = this.playerState.getItemCount(itemId);
    if (count <= 0) return false;

    // Nếu slot đã có món đồ cũ, tháo trả lại vào túi đồ
    const oldItem = this.getEquipped(slot);
    if (oldItem) {
      this.playerState.addItem(oldItem, 1);
    }

    // Tiêu thụ 1 món mới khỏi túi đồ và gán vào ô trang bị
    this.playerState.removeItem(itemId, 1);
    this.playerState.equippedSlots[slot] = itemId;

    this.playerState.emit('equipment_changed', { slot, itemId, oldItem });
    return true;
  }

  public unequip(slot: EquipmentSlot): boolean {
    const current = this.getEquipped(slot);
    if (!current) return false;

    // Trả vật phẩm về túi đồ
    this.playerState.addItem(current, 1);
    this.playerState.equippedSlots[slot] = null;

    this.playerState.emit('equipment_changed', { slot, itemId: null, oldItem: current });
    return true;
  }

  // --- TÍNH TOÁN CÁC HỆ SỐ ĐÁNH ĐỔI CHỈ SỐ ---

  public getSprintSpeedMultiplier(): number {
    const body = this.getEquipped('body');
    if (body === 'eqp_moss_cloak') {
      return 0.95; // Giảm 5% tốc độ chạy nước rút (Đánh đổi)
    }
    return 1.0;
  }

  public getStaminaDrainMultiplier(): number {
    const back = this.getEquipped('back');
    if (back === 'eqp_field_backpack') {
      return 1.15; // Tiêu hao thêm 15% thể lực khi chạy (Đánh đổi mang nặng)
    }
    return 1.0;
  }

  public getNoiseRadiusMultiplier(): number {
    const feet = this.getEquipped('feet');
    if (feet === 'eqp_trail_boots') {
      return 0.70; // Giảm 30% tiếng bước chân (Lợi thế stealth)
    }
    return 1.0;
  }

  public hasMireSlowImmunity(): boolean {
    const feet = this.getEquipped('feet');
    return feet === 'eqp_trail_boots'; // Chống lún lầy tại Silent Mire
  }

  public getMoistureGainMultiplier(): number {
    const body = this.getEquipped('body');
    if (body === 'eqp_moss_cloak') {
      return 0.60; // Giảm 40% tốc độ tích tụ ẩm ướt
    }
    return 1.0;
  }

  public getColdGainMultiplier(): number {
    const body = this.getEquipped('body');
    if (body === 'eqp_moss_cloak') {
      return 0.60; // Giảm 40% tốc độ mất nhiệt / giữ ấm
    }
    return 1.0;
  }

  public getComposureDrainMultiplier(): number {
    const charm = this.getEquipped('charm');
    if (charm === 'eqp_bell_ward_charm') {
      return 0.75; // Giảm 25% tốc độ tụt bình tâm
    }
    return 1.0;
  }

  public hasEchoDetector(): boolean {
    const charm = this.getEquipped('charm');
    return charm === 'eqp_bell_ward_charm'; // Rung chuông ngân báo hiệu gần Echo
  }

  public getMaxInventorySlots(): number {
    const back = this.getEquipped('back');
    return back === 'eqp_field_backpack' ? 12 : 8; // Mở rộng 8 -> 12 ô
  }

  // --- SO SÁNH CHỈ SỐ TRƯỚC / SAU KHI TRANG BỊ CHO UI ---

  public previewStatModifiers(slot: EquipmentSlot, newItemId: string | null): StatComparisonEntry[] {
    const results: StatComparisonEntry[] = [];
    const currentItem = this.getEquipped(slot);

    // 1. Độ Bền (Durability)
    results.push({
      labelVi: 'Độ Bền Trang Bị',
      currentVal: 'Vĩnh Cửu',
      previewVal: 'Vĩnh Cửu',
      diffType: 'neutral',
      explanation: 'Trang bị hoàn toàn không bị gãy vỡ hay hao mòn theo thời gian.'
    });

    if (slot === 'body') {
      const curMoist = currentItem === 'eqp_moss_cloak' ? '-40%' : 'Chuẩn (0%)';
      const prevMoist = newItemId === 'eqp_moss_cloak' ? '-40%' : 'Chuẩn (0%)';
      results.push({
        labelVi: 'Tốc độ ngấm Độ Ẩm',
        currentVal: curMoist,
        previewVal: prevMoist,
        diffType: newItemId === 'eqp_moss_cloak' ? 'buff' : (currentItem ? 'nerf' : 'neutral'),
        explanation: 'Giảm tốc độ ẩm ướt khi đi mưa sương hoặc lội nước.'
      });

      const curCold = currentItem === 'eqp_moss_cloak' ? '+40% Giữ Ấm' : 'Chuẩn (0%)';
      const prevCold = newItemId === 'eqp_moss_cloak' ? '+40% Giữ Ấm' : 'Chuẩn (0%)';
      results.push({
        labelVi: 'Giữ Ấm Thân Nhiệt',
        currentVal: curCold,
        previewVal: prevCold,
        diffType: newItemId === 'eqp_moss_cloak' ? 'buff' : (currentItem ? 'nerf' : 'neutral'),
        explanation: 'Chống chịu giá lạnh ban đêm và sương giá rừng sâu.'
      });

      const curSpeed = currentItem === 'eqp_moss_cloak' ? '95% (-5%)' : '100%';
      const prevSpeed = newItemId === 'eqp_moss_cloak' ? '95% (-5%)' : '100%';
      results.push({
        labelVi: 'Tốc độ chạy nước rút',
        currentVal: curSpeed,
        previewVal: prevSpeed,
        diffType: newItemId === 'eqp_moss_cloak' ? 'nerf' : (currentItem ? 'buff' : 'neutral'),
        explanation: 'Áo choàng dày làm giảm nhẹ tốc độ bứt tốc khi tháo chạy.'
      });
    } else if (slot === 'feet') {
      const curNoise = currentItem === 'eqp_trail_boots' ? '-30% Bán kính' : 'Chuẩn';
      const prevNoise = newItemId === 'eqp_trail_boots' ? '-30% Bán kính' : 'Chuẩn';
      results.push({
        labelVi: 'Tiếng ồn bước chân',
        currentVal: curNoise,
        previewVal: prevNoise,
        diffType: newItemId === 'eqp_trail_boots' ? 'buff' : (currentItem ? 'nerf' : 'neutral'),
        explanation: 'Bước đi êm ái hơn, Kẻ Lắng Nghe khó phát hiện từ xa.'
      });

      const curMire = currentItem === 'eqp_trail_boots' ? 'Miễn nhiễm lún' : 'Bị làm chậm';
      const prevMire = newItemId === 'eqp_trail_boots' ? 'Miễn nhiễm lún' : 'Bị làm chậm';
      results.push({
        labelVi: 'Địa hình Đầm Lầy (Mire)',
        currentVal: curMire,
        previewVal: prevMire,
        diffType: newItemId === 'eqp_trail_boots' ? 'buff' : (currentItem ? 'nerf' : 'neutral'),
        explanation: 'Di chuyển thanh thoát trên mặt bùn ngập lầy.'
      });
    } else if (slot === 'back') {
      const curSlots = currentItem === 'eqp_field_backpack' ? '12 Ô' : '8 Ô';
      const prevSlots = newItemId === 'eqp_field_backpack' ? '12 Ô (+4)' : '8 Ô';
      results.push({
        labelVi: 'Sức chứa túi đồ',
        currentVal: curSlots,
        previewVal: prevSlots,
        diffType: newItemId === 'eqp_field_backpack' ? 'buff' : (currentItem ? 'nerf' : 'neutral'),
        explanation: 'Mở rộng thêm 4 ô chứa đồ mang theo trong mỗi chuyến thám hiểm.'
      });

      const curDrain = currentItem === 'eqp_field_backpack' ? '+15%' : 'Chuẩn';
      const prevDrain = newItemId === 'eqp_field_backpack' ? '+15%' : 'Chuẩn';
      results.push({
        labelVi: 'Hao Thể Lực khi chạy',
        currentVal: curDrain,
        previewVal: prevDrain,
        diffType: newItemId === 'eqp_field_backpack' ? 'nerf' : (currentItem ? 'buff' : 'neutral'),
        explanation: 'Trọng lượng túi đeo lưng làm cơ thể mệt mỏi nhanh hơn.'
      });
    } else if (slot === 'charm') {
      const curDrain = currentItem === 'eqp_bell_ward_charm' ? '-25%' : 'Chuẩn';
      const prevDrain = newItemId === 'eqp_bell_ward_charm' ? '-25%' : 'Chuẩn';
      results.push({
        labelVi: 'Tụt Bình Tâm bóng tối',
        currentVal: curDrain,
        previewVal: prevDrain,
        diffType: newItemId === 'eqp_bell_ward_charm' ? 'buff' : (currentItem ? 'nerf' : 'neutral'),
        explanation: 'Tiếng chuông hộ mệnh xoa dịu tâm trí trước sự ám ảnh của Màn Sương.'
      });

      const curEcho = currentItem === 'eqp_bell_ward_charm' ? 'Kích hoạt' : 'Tắt';
      const prevEcho = newItemId === 'eqp_bell_ward_charm' ? 'Kích hoạt' : 'Tắt';
      results.push({
        labelVi: 'Cảm biến Ký Ức (Echo)',
        currentVal: curEcho,
        previewVal: prevEcho,
        diffType: newItemId === 'eqp_bell_ward_charm' ? 'buff' : (currentItem ? 'nerf' : 'neutral'),
        explanation: 'Rung nhẹ báo hiệu khi tiếp cận khu vực có tàn dư ký ức cổ.'
      });
    }

    return results;
  }
}
