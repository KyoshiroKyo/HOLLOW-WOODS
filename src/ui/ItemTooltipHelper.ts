/**
 * HOLLOW WOODS V1.5 — ITEM TOOLTIP HELPER (V15-26)
 * Hộp thông tin nổi hiển thị chi tiết vật phẩm và trang bị theo ngôn ngữ Dark Woodland Parchment
 * - Hiển thị tên tiếng Việt, phân loại, tác dụng hồi phục / đánh đổi chỉ số và nguồn thu thập
 * - Căn chỉnh vị trí thông minh (smart clamping) chống tràn mép màn hình HD 1280×720
 */

import * as Phaser from 'phaser';
import itemsData from '../data/items.json';
import { EquipmentSystem } from '../systems/EquipmentSystem';
import { HDTextHelper } from '../utils/HDTextHelper';

export interface ItemTooltipInfo {
  id: string;
  name: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  description: string;
  statEffects?: string[];
  source: string;
}

export class ItemTooltipHelper {
  private static instance: ItemTooltipHelper;
  private container?: Phaser.GameObjects.Container;

  // Bảng từ điển Nguồn Thu Thập & Vị Trí Tìm Kiếm của các vật phẩm trong game
  private static readonly ITEM_SOURCES: Record<string, string> = {
    res_dry_wood: 'Nhặt từ cành khô ven đường hoặc chém bụi rậm tại Rừng Ngoại Vi',
    res_flint: 'Khai thác từ các mỏ đá lửa tự nhiên ven rìa Rừng Ngoại Vi',
    res_tree_resin: 'Khai thác từ các thân thông già rỉ nhựa tại Outer Woods & Deep Forest',
    res_herbs: 'Thu hái tại các bụi thảo dược đất ẩm hoặc gieo trồng tại Sanctuary Farm',
    seed_herbs: 'Thu hoạch từ luống thảo dược chín hoặc nhận từ Thầy Thuốc Neris',
    item_lantern_oil: 'Chế tạo tại Bàn Chế Tạo [I] (1 Gỗ Khô + 1 Nhựa Thông)',
    item_herbal_poultice: 'Chế tạo tại Bàn Chế Tạo [I] (1 Thảo Dược Bạc + 1 Gỗ Khô)',
    item_noise_lure: 'Chế tạo tại Bàn Chế Tạo [I] (1 Gỗ Khô + 1 Đá Lửa)',
    quest_bronze_clapper: 'Đoạt lại từ Tàn Tích Miếu Chuông Vỡ sau khi giải mã Đầm Lầy Tĩnh Lặng',
    lore_satyr_journal: 'Kỷ vật ban đầu của Mossbound Wayfarer khi bước ra khỏi sương',
    mat_forest_rope: 'Bện từ 2 Cỏ Sợi Bện Dây tại Bàn Chế Tạo [I]',
    mat_charcoal: 'Thu được sau khi nung gỗ trong bếp Lửa Trại hoặc lò rèn',
    mat_runed_iron: 'Khai thác tại Tàn Tích Xưởng Rèn Cổ hoặc nhận từ Thợ Rèn Bram',
    food_calming_tea: 'Sắc từ Thảo Dược Bạc tại Nồi Nấu Dược Liệu của Neris hoặc Lửa Trại',
    food_roasted_mushroom: 'Nướng trực tiếp từ Nấm Rừng trên bếp Lửa Trại Sanctuary Camp',
    food_forest_root_soup: 'Nấu từ Rễ Rừng và Nước Giếng trong Nồi Nấu Thảo Mộc',
    res_forest_roots: 'Đào từ các gốc đại thụ đất ẩm hoặc Hầm Rễ Cổ Sanctuary Farm',
    res_forest_mushroom: 'Hái dưới bóng râm gốc cây mục tại Đường Mòn Quanh Co & Rừng Sâu',
    res_tough_fiber: 'Cắt từ các bụi cỏ gai rậm rạp ven bờ nước Sanctuary Farm',
    seed_roots: 'Thu hoạch từ củ rễ già hoặc nhận từ Thầy Thuốc Neris',
    seed_mushroom: 'Thu thập từ các cụm nấm phát sáng trong rừng đêm',
    seed_fiber: 'Gặt từ các bụi cỏ sợi hoa vàng tại nông trại',
    eqp_moss_cloak: 'Chế tạo tại Bàn Chế Tạo hoặc phần thưởng kết giao làng Bellhollow',
    eqp_trail_boots: 'Quà tặng quý giá từ Người Canh Cổng Garth sau khi soi chiếu Cột Bia',
    eqp_field_backpack: 'Chế tạo từ Dây Thừng Rừng tại Bàn Chế Tạo [I] (mở rộng túi đồ)',
    eqp_bell_ward_charm: 'Bà Lão Edda ban tặng khi người chơi thức tỉnh ký ức Đại Hồng Chung',
    wpn_walking_staff: 'Vũ khí tự vệ cơ bản ban đầu của Mossbound Wayfarer',
    wpn_iron_spear: 'Rèn đúc từ Gỗ Khô và Sắt Cổ Ngữ tại Lò Rèn Thợ Rèn Bram',
    wpn_hunting_hatchet: 'Tìm thấy cắm trên khúc gỗ mục tại Xưởng Chuông Bỏ Hoang',
    item_resin_flare: 'Chế tạo từ Nhựa Thông và Cành Củi Khô để cứu nạn khẩn cấp',
    item_bell_mold: 'Tìm thấy trong góc đổ nát tại Xưởng Chuông Bỏ Hoang',
    item_medicinal_roots: 'Khai thác sâu trong Hầm Rễ Cổ dưới nền Sanctuary Farm',
    relic_heart_of_roots: 'Thu được sau khi giải mã cơ quan Khóa Ánh Sáng trong Hầm Rễ',
    item_broken_patrol_lantern: 'Tìm thấy cạnh bờ vực Rừng Ngoại Vi (Kỷ vật người em trai Garth)',
    item_root_flower: 'Hái tại vùng trũng đầm lầy cạnh vòm rễ cổ thụ Silent Mire',
    mat_skull_fang: 'Rơi ra sau khi đẩy lùi Chó Săn Sọ (Skull Wolf) trong rừng sâu',
    mat_shadow_essence: 'Thu thập từ tàn tích của quái vật bóng tối bị ánh sáng thiêu đốt',
    quest_corrupted_crest: 'Chiến lợi phẩm đoạt được khi đánh bại Kỵ Sĩ Hắc Ám (Boss Hooded Knight) hoặc khảo sát Đầm Lầy',
    item_knight_journal_page: 'Trang nhật ký ướt sương cất giấu trong gốc cây cổ thụ Rừng Ngoài'
  };

  private constructor() {}

  public static getInstance(): ItemTooltipHelper {
    if (!ItemTooltipHelper.instance) {
      ItemTooltipHelper.instance = new ItemTooltipHelper();
    }
    return ItemTooltipHelper.instance;
  }

  /**
   * Tra cứu thông tin chi tiết đầy đủ của một vật phẩm hoặc trang bị
   */
  public getItemInfo(itemId: string, customTitle?: string, customDesc?: string): ItemTooltipInfo {
    // 1. Kiểm tra trong danh mục Trang bị chuyên biệt
    const equipDef = EquipmentSystem.getInstance().getEquipmentDef(itemId);
    if (equipDef) {
      const statEffects: string[] = [];
      if (equipDef.moistureRateMod !== undefined) {
        const val = Math.round((1 - equipDef.moistureRateMod) * 100);
        statEffects.push(`• Giảm ${val}% tốc độ tích tụ Độ Ẩm`);
      }
      if (equipDef.coldRateMod !== undefined) {
        const val = Math.round((1 - equipDef.coldRateMod) * 100);
        statEffects.push(`• Giảm ${val}% tốc độ nhiễm Lạnh`);
      }
      if (equipDef.sprintSpeedMod !== undefined && equipDef.sprintSpeedMod < 1) {
        const val = Math.round((1 - equipDef.sprintSpeedMod) * 100);
        statEffects.push(`• Đánh đổi: -${val}% Tốc độ chạy nước rút`);
      }
      if (equipDef.noiseRadiusMod !== undefined) {
        const val = Math.round((1 - equipDef.noiseRadiusMod) * 100);
        statEffects.push(`• Giảm ${val}% bán kính tiếng động bước chân`);
      }
      if (equipDef.mireSlowImmunity) {
        statEffects.push(`• Kháng 100% làm chậm trên Bùn Lầy Silent Mire`);
      }
      if (equipDef.extraInventorySlots) {
        statEffects.push(`• Mở rộng thêm +${equipDef.extraInventorySlots} ô chứa túi đồ`);
      }
      if (equipDef.sprintStaminaDrainMod && equipDef.sprintStaminaDrainMod > 1) {
        const val = Math.round((equipDef.sprintStaminaDrainMod - 1) * 100);
        statEffects.push(`• Đánh đổi: Tiêu hao thêm +${val}% Thể Lực khi chạy`);
      }
      if (equipDef.composureDrainMod !== undefined) {
        const val = Math.round((1 - equipDef.composureDrainMod) * 100);
        statEffects.push(`• Giảm ${val}% tốc độ tụt Tinh Thần trong bóng tối`);
      }
      if (equipDef.detectEchoProximity) {
        statEffects.push(`• Rung chuông cảnh báo khi lại gần Tiếng Vọng Ký Ức`);
      }

      let slotName = 'Trang Bị Cá Nhân';
      let slotIcon = '🛡️';
      if (equipDef.slot === 'body') { slotName = 'Trang Bị Thân'; slotIcon = '🧥'; }
      else if (equipDef.slot === 'feet') { slotName = 'Trang Bị Chân'; slotIcon = '👞'; }
      else if (equipDef.slot === 'back') { slotName = 'Trang Bị Lưng'; slotIcon = '🎒'; }
      else if (equipDef.slot === 'charm') { slotName = 'Bùa Hộ Mệnh'; slotIcon = '🔔'; }

      return {
        id: itemId,
        name: equipDef.name,
        categoryName: slotName,
        categoryColor: '#f1c40f',
        categoryIcon: slotIcon,
        description: equipDef.description,
        statEffects,
        source: ItemTooltipHelper.ITEM_SOURCES[itemId] || 'Trang bị quý nhận qua tiến trình nhiệm vụ cốt truyện'
      };
    }

    // 2. Kiểm tra trong danh mục Vũ khí
    const weaponDef = EquipmentSystem.getInstance().getWeaponDef(itemId);
    if (weaponDef && weaponDef.id === itemId) {
      const statEffects: string[] = [
        `• Sát thương tự vệ: ${weaponDef.damage} điểm`,
        `• Tầm với hitbox: ${weaponDef.reach}px`,
        `• Tiêu hao thể lực: ${weaponDef.staminaCost} điểm/đòn`,
        `• Lực đẩy lùi: ${weaponDef.knockbackDistance}px (Choáng ${weaponDef.staggerDuration}ms)`
      ];
      if (weaponDef.woodcuttingMultiplier && weaponDef.woodcuttingMultiplier > 1) {
        statEffects.push(`• Chặt cành khô & dọn bụi rậm nhanh gấp ${weaponDef.woodcuttingMultiplier} lần`);
      }
      if (weaponDef.canTriggerWeakness) {
        statEffects.push(`• Có khả năng đâm xuyên điểm yếu của quái vật có giáp`);
      }

      return {
        id: itemId,
        name: weaponDef.name,
        categoryName: 'Vũ Khí Tự Vệ',
        categoryColor: '#e74c3c',
        categoryIcon: '⚔️',
        description: 'Vũ khí cận chiến dùng để tự vệ và phòng thân trước sinh vật sương mù.',
        statEffects,
        source: ItemTooltipHelper.ITEM_SOURCES[itemId] || 'Chế tạo tại Lò Rèn hoặc tìm thấy trong rừng'
      };
    }

    // 3. Tra cứu trong cơ sở dữ liệu items.json
    const raw = itemsData.items.find(i => i.id === itemId);
    const name = customTitle || raw?.name || itemId;
    const desc = customDesc || raw?.description || 'Vật phẩm bí ẩn được tìm thấy trong Khu Rừng Rỗng.';
    const cat = raw?.category || 'resource';

    let catName = 'Nguyên Liệu Rừng';
    let catColor = '#a0aec0';
    let catIcon = '📦';
    const statEffects: string[] = [];

    if (cat === 'consumable' || cat === 'food') {
      catName = 'Dược Liệu Sinh Tồn';
      catColor = '#2ecc71';
      catIcon = '🌿';
      const effects = (raw as any)?.effects;
      if (effects) {
        if (effects.health) statEffects.push(`• Hồi phục: +${effects.health} Sinh Lực (Máu)`);
        if (effects.composure) statEffects.push(`• Trấn an: +${effects.composure} Tinh Thần`);
        if (effects.stamina) statEffects.push(`• Hồi phục: +${effects.stamina} Thể Lực`);
      }
    } else if (cat === 'resource') {
      catName = 'Nguyên Liệu Tự Nhiên';
      catColor = '#e67e22';
      catIcon = '🪵';
    } else if (cat === 'tool') {
      catName = 'Công Cụ Sinh Tồn';
      catColor = '#3498db';
      catIcon = '🔧';
    } else if (cat === 'quest') {
      catName = 'Kỷ Vật Cốt Truyện';
      catColor = '#d4af37';
      catIcon = '👑';
    } else if (cat === 'lore') {
      catName = 'Cổ Thư & Manh Mối';
      catColor = '#9b59b6';
      catIcon = '📜';
    }

    const source = ItemTooltipHelper.ITEM_SOURCES[itemId] ||
      (cat === 'resource' ? 'Khai thác từ môi trường quanh làng Bellhollow và Rừng Sâu' :
       cat === 'quest' ? 'Vật phẩm then chốt trong chuỗi nhiệm vụ cốt truyện' :
       'Chế tạo tại Bàn Chế Tạo hoặc nhận từ dân làng Bellhollow');

    return {
      id: itemId,
      name,
      categoryName: catName,
      categoryColor: catColor,
      categoryIcon: catIcon,
      description: desc,
      statEffects: statEffects.length > 0 ? statEffects : undefined,
      source
    };
  }

  /**
   * Hiển thị Tooltip nổi tại tọa độ màn hình (screenX, screenY)
   */
  public show(
    scene: Phaser.Scene,
    screenX: number,
    screenY: number,
    itemId: string,
    customTitle?: string,
    customDesc?: string
  ): void {
    this.hide();

    const info = this.getItemInfo(itemId, customTitle, customDesc);

    const tooltipW = 260;
    const pad = 12;

    // Khởi tạo container
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9999);

    // Chuẩn bị nội dung Text trước để tính toán chiều cao tự động
    const titleText = HDTextHelper.createText(scene, pad, pad, `${info.categoryIcon} ${info.name}`, {
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: tooltipW - pad * 2 }
    });

    const categoryText = HDTextHelper.createText(scene, pad, pad + titleText.height + 2, info.categoryName, {
      fontSize: '10.5px',
      fontStyle: 'italic',
      color: info.categoryColor
    });

    let curY = pad + titleText.height + categoryText.height + 8;

    // Vạch ngăn cách 1
    const div1Y = curY;
    curY += 7;

    const descText = HDTextHelper.createText(scene, pad, curY, info.description, {
      fontSize: '11px',
      color: '#e2d4b7',
      wordWrap: { width: tooltipW - pad * 2 },
      lineSpacing: 3
    });
    curY += descText.height + 8;

    // Danh sách hiệu ứng chỉ số nếu có
    let statText: Phaser.GameObjects.Text | undefined;
    if (info.statEffects && info.statEffects.length > 0) {
      statText = HDTextHelper.createText(scene, pad, curY, info.statEffects.join('\n'), {
        fontSize: '10.5px',
        color: '#2ecc71',
        wordWrap: { width: tooltipW - pad * 2 },
        lineSpacing: 3
      });
      curY += statText.height + 8;
    }

    // Vạch ngăn cách 2
    const div2Y = curY;
    curY += 7;

    const sourceHeader = HDTextHelper.createText(scene, pad, curY, '📍 NGUỒN THU THẬP:', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#d4af37'
    });
    curY += sourceHeader.height + 3;

    const sourceText = HDTextHelper.createText(scene, pad, curY, info.source, {
      fontSize: '10.5px',
      fontStyle: 'italic',
      color: '#a0aec0',
      wordWrap: { width: tooltipW - pad * 2 },
      lineSpacing: 2
    });
    curY += sourceText.height + pad;

    const tooltipH = curY;

    // Căn chỉnh vị trí thông minh (smart clamp) chống tràn màn hình 1280x720
    let posX = screenX + 16;
    let posY = screenY + 16;

    if (posX + tooltipW > 1260) {
      posX = screenX - tooltipW - 12;
    }
    if (posX < 10) posX = 10;

    if (posY + tooltipH > 705) {
      posY = screenY - tooltipH - 8;
    }
    if (posY < 10) posY = 10;

    this.container.setPosition(posX, posY);

    // Vẽ nền giấy da đen cổ nạm đồng
    const bg = scene.add.graphics();
    bg.fillStyle(0x100c08, 0.97);
    bg.fillRoundedRect(0, 0, tooltipW, tooltipH, 6);

    // Viền đồng kép
    bg.lineStyle(1.5, 0x8c6d3b, 0.95);
    bg.strokeRoundedRect(0, 0, tooltipW, tooltipH, 6);
    bg.lineStyle(0.5, 0xd4af37, 0.5);
    bg.strokeRoundedRect(2, 2, tooltipW - 4, tooltipH - 4, 5);

    // Đinh tán đồng nhỏ ở 4 góc
    bg.fillStyle(0xb89058, 0.9);
    bg.fillCircle(5, 5, 1.8);
    bg.fillCircle(tooltipW - 5, 5, 1.8);
    bg.fillCircle(5, tooltipH - 5, 1.8);
    bg.fillCircle(tooltipW - 5, tooltipH - 5, 1.8);

    // Vẽ các vạch ngăn kim loại
    bg.lineStyle(1, 0x5c4224, 0.65);
    bg.lineBetween(pad, div1Y, tooltipW - pad, div1Y);
    bg.lineBetween(pad, div2Y, tooltipW - pad, div2Y);

    this.container.add(bg);
    this.container.add([titleText, categoryText, descText]);
    if (statText) {
      this.container.add(statText);
    }
    this.container.add([sourceHeader, sourceText]);
  }

  /**
   * Ẩn và dọn dẹp Tooltip
   */
  public hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }
}
