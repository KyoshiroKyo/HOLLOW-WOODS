/**
 * HOLLOW WOODS V1.4 — PHẦN 4: BƯỚC V14-P4-02
 * GIAO DIỆN 4 Ô TRANG BỊ CÁ NHÂN & SO SÁNH CHỈ SỐ (EQUIPMENT MODAL)
 * Thiết kế chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360)
 * 
 * 4 Ô Chuyên Biệt:
 *   [BODY]  — Áo Choàng Rêu (Moss Cloak)
 *   [FEET]  — Ủng Đi Rừng (Trail Boots)
 *   [BACK]  — Túi Hành Trang (Field Backpack)
 *   [CHARM] — Bùa Chuông Cổ (Bell Ward Charm)
 * 
 * TUYỆT ĐỐI KHÔNG CÓ ĐỘ BỀN (No Durability)
 * Hiển thị so sánh trực quan chỉ số trước / sau khi mặc.
 */

import * as Phaser from 'phaser';
import { EquipmentSystem, StatComparisonEntry } from '../systems/EquipmentSystem';
import { PlayerState } from '../state/PlayerState';
import { EquipmentSlot, WeaponId, EquipmentItemDef } from '../types';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { ItemTooltipHelper } from './ItemTooltipHelper';
import { ItemIconHelper } from '../utils/ItemIconHelper';

export class EquipmentModal {
  private scene: Phaser.Scene;
  private equipSystem: EquipmentSystem;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  public isOpen: boolean = false;
  private lastToggleTime: number = 0;

  public onOpen?: () => void;
  public onClose?: () => void;

  private slotsContainer!: Phaser.GameObjects.Container;
  private previewContainer!: Phaser.GameObjects.Container;
  private inventoryListContainer!: Phaser.GameObjects.Container;
  private weaponsContainer!: Phaser.GameObjects.Container;

  private selectedSlot: EquipmentSlot = 'body';
  private selectedInventoryItem: string | null = null;

  private onEquipmentChangedHandler?: () => void;
  private onInventoryChangedHandler?: () => void;
  private onWeaponChangedHandler?: () => void;
  private onEscKeyHandler?: () => void;
  private onBKeyHandler?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.equipSystem = EquipmentSystem.getInstance();
    this.playerState = PlayerState.getInstance();

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9650);

    this.buildUI();
    this.container.setVisible(false);

    // Toggle [B] & [ESC] được định tuyến tập trung 1 lần tại UIScene để tránh double-toggle.

    // Lắng nghe sự kiện thay đổi trang bị hoặc túi đồ (V15-27: có handler để gỡ khi destroy)
    this.onEquipmentChangedHandler = () => {
      if (this.isOpen) this.refreshView();
    };
    this.onInventoryChangedHandler = () => {
      if (this.isOpen) this.refreshView();
    };
    this.onWeaponChangedHandler = () => {
      if (this.isOpen) this.refreshView();
    };
    this.playerState.on('equipment_changed', this.onEquipmentChangedHandler);
    this.playerState.on('inventory_changed', this.onInventoryChangedHandler);
    this.playerState.on('weapon_changed', this.onWeaponChangedHandler);
  }

  private buildUI(): void {
    const cx = 640;
    const cy = 360;
    const modalW = 860;
    const modalH = 540;
    const modalX = cx - modalW / 2; // 210
    const modalY = cy - modalH / 2; // 90

    // 1. Lớp phủ mờ chống click xuyên thấu (Dark Woodland Dim Overlay)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.70);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < modalX || pointer.x > modalX + modalW || pointer.y < modalY || pointer.y > modalY + modalH) {
        this.close();
      }
    });

    // 2. Khung gỗ mun viền đồng cổ kính
    let panelImg: Phaser.GameObjects.Image | undefined;
    if (this.scene.textures.exists('ui_pack_panel_modal')) {
      panelImg = this.scene.add.image(cx, cy, 'ui_pack_panel_modal');
      panelImg.setDisplaySize(modalW + 24, modalH + 24);
      panelImg.setTint(0xbaa187);
      panelImg.setAlpha(0.65);
    }

    const frame = this.scene.add.graphics();
    frame.fillStyle(0x18110b, 0.96);
    frame.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    frame.lineStyle(2, 0x6e5233, 0.95);
    frame.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);
    frame.lineStyle(1, 0x9c774b, 0.45);
    frame.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 8);

    // 4 Đinh tán đồng thau ở góc
    frame.fillStyle(0xb89058, 0.95);
    frame.fillRect(modalX + 5, modalY + 5, 5, 5);
    frame.fillRect(modalX + modalW - 10, modalY + 5, 5, 5);
    frame.fillRect(modalX + 5, modalY + modalH - 10, 5, 5);
    frame.fillRect(modalX + modalW - 10, modalY + modalH - 10, 5, 5);

    // Đường gân chia 2 cột chính
    frame.lineStyle(1, 0x3d3024, 0.7);
    frame.lineBetween(modalX + 370, modalY + 60, modalX + 370, modalY + modalH - 20);

    // 3. Tiêu đề chính
    const title = HDTextHelper.createText(this.scene, modalX + 30, modalY + 22, '🛡️ TRANG BỊ CÁ NHÂN & CƠ CHẾ TỰ VỆ [Phím B]', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f5eedc',
      stroke: '#0c0805',
      strokeThickness: 3
    });

    const subtitle = HDTextHelper.createText(this.scene, modalX + 32, modalY + 46, 'Đánh đổi chiến thuật sinh tồn • Độ bền: Vĩnh cửu (Không hao mòn)', {
      fontSize: '11px',
      color: '#a0aec0'
    });

    // Nút đóng thống nhất [✕ ESC] viền đồng sang trọng (V15-26)
    const closeBtnContainer = this.scene.add.container(modalX + modalW - 54, modalY + 22);
    const closeBtnBg = this.scene.add.graphics();
    const drawCloseBtn = (isHover: boolean) => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(isHover ? 0x2e1810 : 0x140e0a, 0.95);
      closeBtnBg.fillRoundedRect(-32, -12, 64, 24, 4);
      closeBtnBg.lineStyle(1.5, isHover ? 0xf1c40f : 0x7a5e35, 1);
      closeBtnBg.strokeRoundedRect(-32, -12, 64, 24, 4);
    };
    drawCloseBtn(false);

    const closeBtnText = HDTextHelper.createText(this.scene, 0, 0, '✕ ESC', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#e2d4b7'
    }).setOrigin(0.5, 0.5);

    closeBtnContainer.add([closeBtnBg, closeBtnText]);
    closeBtnContainer.setSize(64, 24);
    closeBtnContainer.setInteractive({ useHandCursor: true });
    closeBtnContainer.on('pointerover', () => {
      drawCloseBtn(true);
      closeBtnText.setColor('#f39c12');
    });
    closeBtnContainer.on('pointerout', () => {
      drawCloseBtn(false);
      closeBtnText.setColor('#e2d4b7');
    });
    closeBtnContainer.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.close();
    });

    // Các Container con
    this.slotsContainer = this.scene.add.container(0, 0);
    this.inventoryListContainer = this.scene.add.container(0, 0);
    this.previewContainer = this.scene.add.container(0, 0);
    this.weaponsContainer = this.scene.add.container(0, 0);

    const equipElements: Phaser.GameObjects.GameObject[] = [
      overlay,
      ...(panelImg ? [panelImg] : []),
      frame,
      title,
      subtitle,
      closeBtnContainer,
      this.slotsContainer,
      this.inventoryListContainer,
      this.previewContainer,
      this.weaponsContainer
    ];
    this.container.add(equipElements);
  }

  public open(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    this.container.setVisible(true);
    this.refreshView();
    AudioManager.getInstance().playInteract();
    if (this.onOpen) this.onOpen();
  }

  public close(): void {
    ItemTooltipHelper.getInstance().hide();
    if (!this.isOpen) return;

    this.isOpen = false;
    this.container.setVisible(false);
    AudioManager.getInstance().playInteract();
    if (this.onClose) this.onClose();
  }

  public toggle(): void {
    const now = Date.now();
    if (now - this.lastToggleTime < 200) return;
    this.lastToggleTime = now;

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public refreshView(): void {
    this.renderEquipmentSlots();
    this.renderAvailableInventory();
    this.renderStatComparison();
    this.renderWeaponSelection();
  }

  // --- 1. RENDER 4 Ô TRANG BỊ CHUYÊN BIỆT (CỘT TRÁI) ---

  private renderEquipmentSlots(): void {
    this.slotsContainer.removeAll(true);
    const startX = 240;
    const startY = 170;
    const slotW = 310;
    const slotH = 72;
    const gap = 12;

    const slots: { slot: EquipmentSlot; label: string; icon: string }[] = [
      { slot: 'body', label: 'Ô THÂN (BODY)', icon: '🧥' },
      { slot: 'feet', label: 'Ô CHÂN (FEET)', icon: '👢' },
      { slot: 'back', label: 'Ô LƯNG (BACK)', icon: '🎒' },
      { slot: 'charm', label: 'Ô PHỤ KIỆN (CHARM)', icon: '🔔' }
    ];

    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const slotY = startY + i * (slotH + gap);
      const isSelected = this.selectedSlot === s.slot;
      const equippedItemId = this.equipSystem.getEquipped(s.slot);
      const equippedDef = equippedItemId ? this.equipSystem.getEquipmentDef(equippedItemId) : undefined;

      const bg = this.scene.add.graphics();
      bg.fillStyle(isSelected ? 0x221811 : 0x140e08, 0.95);
      bg.fillRoundedRect(startX, slotY, slotW, slotH, 6);
      bg.lineStyle(1.5, isSelected ? 0xf39c12 : 0x4a3722, 0.9);
      bg.strokeRoundedRect(startX, slotY, slotW, slotH, 6);

      const slotTitle = HDTextHelper.createText(this.scene, startX + 12, slotY + 10, `${s.icon} ${s.label}`, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: isSelected ? '#f39c12' : '#a0aec0'
      });

      const itemNameText = HDTextHelper.createText(
        this.scene,
        startX + 12,
        slotY + 30,
        equippedDef ? equippedDef.name : '[ Ô ĐANG TRỐNG ]',
        {
          fontSize: '12px',
          fontStyle: 'bold',
          color: equippedDef ? '#2ecc71' : '#7f8c8d'
        }
      );

      const durText = HDTextHelper.createText(this.scene, startX + 12, slotY + 50, 'Độ bền: VĨNH CỬU', {
        fontSize: '9px',
        color: '#e0c878'
      });

      // BUG-025: Icon trang bị Pixel Art thật từ ItemIconHelper / UI Pack
      let slotIcon: Phaser.GameObjects.Image | undefined;
      if (equippedItemId) {
        slotIcon = ItemIconHelper.createItemIconImage(this.scene, startX + slotW - 32, slotY + 22, equippedItemId, 24);
      } else if (this.scene.textures.exists(`ui_pack_equip_${s.slot}`)) {
        slotIcon = this.scene.add.image(startX + slotW - 32, slotY + 22, `ui_pack_equip_${s.slot}`);
        slotIcon.setDisplaySize(22, 22);
        slotIcon.setAlpha(0.4);
      }

      this.slotsContainer.add([bg, slotTitle, itemNameText, durText, ...(slotIcon ? [slotIcon] : [])]);

      // Nút Tháo Trang Bị nếu đang có đồ
      if (equippedDef) {
        const unequipBtn = this.scene.add.container(startX + slotW - 55, slotY + 36);
        const uBg = this.scene.add.graphics();
        uBg.fillStyle(0x7f1d1d, 0.9);
        uBg.fillRoundedRect(-40, -14, 80, 28, 4);
        uBg.lineStyle(1, 0xef4444, 0.8);
        uBg.strokeRoundedRect(-40, -14, 80, 28, 4);

        const uText = HDTextHelper.createText(this.scene, 0, 0, 'Tháo Ra', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        unequipBtn.add([uBg, uText]);
        unequipBtn.setInteractive(new Phaser.Geom.Rectangle(-40, -14, 80, 28), Phaser.Geom.Rectangle.Contains);
        unequipBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          pointer.event.stopPropagation();
          this.equipSystem.unequip(s.slot);
          this.refreshView();
        });
        this.slotsContainer.add(unequipBtn);
      }

      // Vùng click chọn slot & xem Tooltip
      const hit = this.scene.add.zone(startX + slotW / 2, slotY + slotH / 2, slotW, slotH).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        ItemTooltipHelper.getInstance().hide();
        this.selectedSlot = s.slot;
        this.selectedInventoryItem = null;
        this.refreshView();
      });
      hit.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        if (equippedItemId) {
          ItemTooltipHelper.getInstance().show(this.scene, pointer.x, pointer.y, equippedItemId);
        }
      });
      hit.on('pointerout', () => {
        ItemTooltipHelper.getInstance().hide();
      });
      this.slotsContainer.add(hit);
    }
  }

  // --- 2. RENDER TRANG BỊ KHẢ DỤNG TRONG TÚI ĐỒ (CỘT PHẢI - PHÍA TRÊN) ---

  private renderAvailableInventory(): void {
    this.inventoryListContainer.removeAll(true);
    const startX = 590;
    const startY = 161;
    const w = 450;

    const header = HDTextHelper.createText(this.scene, startX, startY, `VẬT PHẨM KHẢ DỤNG CHO: ${this.selectedSlot.toUpperCase()}`, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f5eedc'
    });
    this.inventoryListContainer.add(header);

    // Lọc các món đồ trong túi hợp lệ với slot hiện tại
    const candidates: { id: string; count: number; def: EquipmentItemDef }[] = [];
    for (const [id, count] of this.playerState.inventory.entries()) {
      const def = this.equipSystem.getEquipmentDef(id);
      if (def && def.slot === this.selectedSlot && count > 0) {
        candidates.push({ id, count, def });
      }
    }

    if (candidates.length === 0) {
      const boxH = 54;
      const emptyBg = this.scene.add.graphics();
      emptyBg.fillStyle(0x16120d, 0.85);
      emptyBg.fillRoundedRect(startX, startY + 26, w, boxH, 5);
      emptyBg.lineStyle(1, 0x4a3722, 0.75);
      emptyBg.strokeRoundedRect(startX, startY + 26, w, boxH, 5);

      const emptyTitle = HDTextHelper.createText(this.scene, startX + 14, startY + 36, 'Chưa có trang bị phù hợp', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#E8DFC8',
        wordWrap: { width: w - 28, useAdvancedWrap: true }
      });

      const emptyKey = HDTextHelper.createText(this.scene, startX + 14, startY + 56, '[I / C]', {
        fontSize: '11.5px',
        fontStyle: 'bold',
        color: '#E09F3E'
      });

      const emptyHint = HDTextHelper.createText(this.scene, startX + 14 + emptyKey.width + 6, startY + 56, 'Mở menu chế tạo', {
        fontSize: '11.5px',
        color: '#C8CFC2',
        wordWrap: { width: w - 40 - emptyKey.width, useAdvancedWrap: true }
      });

      this.inventoryListContainer.add([emptyBg, emptyTitle, emptyKey, emptyHint]);
      return;
    }

    let itemY = startY + 28;
    for (const item of candidates) {
      const isSelected = this.selectedInventoryItem === item.id;
      const g = this.scene.add.graphics();
      g.fillStyle(isSelected ? 0x2e2418 : 0x18110b, 0.9);
      g.fillRoundedRect(startX, itemY, w, 44, 5);
      g.lineStyle(1.2, isSelected ? 0xf39c12 : 0x4a3722, 0.85);
      g.strokeRoundedRect(startX, itemY, w, 44, 5);

      // BUG-025: Biểu tượng Pixel Art của trang bị khả dụng
      const iconImg = ItemIconHelper.createItemIconImage(this.scene, startX + 22, itemY + 22, item.id, 24);

      const label = HDTextHelper.createText(this.scene, startX + 42, itemY + 8, `${item.def.name} (x${item.count})`, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff'
      });

      const sub = HDTextHelper.createText(this.scene, startX + 42, itemY + 24, item.def.description, {
        fontSize: '9px',
        color: '#a0aec0',
        wordWrap: { width: 300 }
      });

      // Nút Trang Bị
      const equipBtn = this.scene.add.container(startX + w - 50, itemY + 22);
      const eBg = this.scene.add.graphics();
      eBg.fillStyle(0x166534, 0.95);
      eBg.fillRoundedRect(-38, -14, 76, 28, 4);
      eBg.lineStyle(1, 0x22c55e, 0.85);
      eBg.strokeRoundedRect(-38, -14, 76, 28, 4);

      const eText = HDTextHelper.createText(this.scene, 0, 0, 'Trang Bị', {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5, 0.5);

      equipBtn.add([eBg, eText]);
      equipBtn.setInteractive(new Phaser.Geom.Rectangle(-38, -14, 76, 28), Phaser.Geom.Rectangle.Contains);
      equipBtn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.equipSystem.equip(this.selectedSlot, item.id);
        this.selectedInventoryItem = null;
        this.refreshView();
      });

      this.inventoryListContainer.add([g, iconImg, label, sub, equipBtn]);

      const hit = this.scene.add.zone(startX + w / 2, itemY + 22, w, 44).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        ItemTooltipHelper.getInstance().hide();
        this.selectedInventoryItem = item.id;
        this.refreshView();
      });
      hit.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        ItemTooltipHelper.getInstance().show(this.scene, pointer.x, pointer.y, item.id);
      });
      hit.on('pointerout', () => {
        ItemTooltipHelper.getInstance().hide();
      });
      this.inventoryListContainer.add(hit);

      itemY += 50;
    }
  }

  // --- 3. RENDER BẢNG SO SÁNH CHỈ SỐ TRƯỚC / SAU KHI MẶC (STAT COMPARISON PREVIEW) ---

  private renderStatComparison(): void {
    this.previewContainer.removeAll(true);
    const startX = 590;
    const startY = 245;
    const w = 450;
    const h = 185;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f0b07, 0.95);
    bg.fillRoundedRect(startX, startY, w, h, 6);
    bg.lineStyle(1, 0x4a3722, 0.8);
    bg.strokeRoundedRect(startX, startY, w, h, 6);

    const title = HDTextHelper.createText(this.scene, startX + 12, startY + 10, '📊 SO SÁNH CHỈ SỐ (TRƯỚC / SAU KHI MẶC):', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f39c12'
    });
    this.previewContainer.add([bg, title]);

    const targetItem = this.selectedInventoryItem || this.equipSystem.getEquipped(this.selectedSlot);
    const diffs: StatComparisonEntry[] = this.equipSystem.previewStatModifiers(this.selectedSlot, targetItem);

    let rowY = startY + 32;
    for (const d of diffs) {
      let color = '#f5eedc';
      if (d.diffType === 'buff') color = '#2ecc71';
      else if (d.diffType === 'nerf') color = '#e67e22';

      const labelText = HDTextHelper.createText(this.scene, startX + 14, rowY, `• ${d.labelVi}:`, {
        fontSize: '10px',
        color: '#a0aec0'
      });

      const valText = HDTextHelper.createText(this.scene, startX + 175, rowY, `${d.currentVal}  ➔  ${d.previewVal}`, {
        fontSize: '10px',
        fontStyle: 'bold',
        color
      });

      const noteText = HDTextHelper.createText(this.scene, startX + 14, rowY + 14, `  ↳ ${d.explanation}`, {
        fontSize: '9px',
        color: '#718096'
      });

      this.previewContainer.add([labelText, valText, noteText]);
      rowY += 28;
    }
  }

  // --- 4. RENDER DANH MỤC VŨ KHÍ TỰ VỆ SINH TỒN (PHÍA DƯỚI) ---

  private renderWeaponSelection(): void {
    this.weaponsContainer.removeAll(true);
    const startX = 240;
    const startY = 515;

    const activeWpnId = this.playerState.getActiveWeapon();
    const weapons: { id: WeaponId; name: string; reach: string; knockback: string; note: string }[] = [
      { id: 'wpn_walking_staff', name: 'Gậy Lữ Hành', reach: '28px', knockback: 'Nhẹ', note: 'Đẩy lùi tạo khoảng trống' },
      { id: 'wpn_iron_spear', name: 'Giáo Gỗ Bịt Sắt', reach: '56px', knockback: 'Mạnh', note: 'Kích hoạt điểm yếu / Boss' },
      { id: 'wpn_hunting_hatchet', name: 'Rìu Rừng Nhỏ', reach: '24px', knockback: 'Vừa', note: 'Tăng x2 tốc độ đốn củi' }
    ];

    const title = HDTextHelper.createText(this.scene, startX, startY - 18, '⚔️ VŨ KHÍ TỰ VỆ SINH TỒN (NHẤN SPACE ĐỂ VUNG VŨ KHÍ):', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f5eedc'
    });
    this.weaponsContainer.add(title);

    const btnW = 255;
    const btnH = 57;
    for (let i = 0; i < weapons.length; i++) {
      const wpn = weapons[i];
      const btnX = startX + i * (btnW + 16);
      const isSelected = activeWpnId === wpn.id;
      const count = (wpn.id === 'wpn_walking_staff') ? 1 : this.playerState.getItemCount(wpn.id);

      const g = this.scene.add.graphics();
      g.fillStyle(isSelected ? 0x221811 : 0x140e08, 0.95);
      g.fillRoundedRect(btnX, startY, btnW, btnH, 5);
      g.lineStyle(1.5, isSelected ? 0xf39c12 : 0x3d2c18, 0.9);
      g.strokeRoundedRect(btnX, startY, btnW, btnH, 5);

      const label = HDTextHelper.createText(this.scene, btnX + 32, startY + 6, `${wpn.name} ${count > 0 ? '✔' : '(Chưa có)'}`, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: isSelected ? '#f39c12' : (count > 0 ? '#ffffff' : '#7f8c8d')
      });

      // BUG-025: Biểu tượng Pixel Art vũ khí
      const wpnIcon = ItemIconHelper.createItemIconImage(this.scene, btnX + 18, startY + 16, wpn.id, 20);
      wpnIcon.setAlpha(count > 0 ? 1.0 : 0.4);

      const details = HDTextHelper.createText(this.scene, btnX + 10, startY + 26, `Tầm: ${wpn.reach} • Đẩy: ${wpn.knockback} • ${wpn.note}`, {
        fontSize: '10px',
        color: '#C8CFC2',
        wordWrap: { width: btnW - 20, useAdvancedWrap: true }
      });

      this.weaponsContainer.add([g, wpnIcon, label, details]);

      if (count > 0) {
        const hit = this.scene.add.zone(btnX + btnW / 2, startY + btnH / 2, btnW, btnH).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          ItemTooltipHelper.getInstance().hide();
          this.playerState.setActiveWeapon(wpn.id);
          this.refreshView();
        });
        hit.on('pointerover', (pointer: Phaser.Input.Pointer) => {
          ItemTooltipHelper.getInstance().show(this.scene, pointer.x, pointer.y, wpn.id);
        });
        hit.on('pointerout', () => {
          ItemTooltipHelper.getInstance().hide();
        });
        this.weaponsContainer.add(hit);
      }
    }
  }

  public destroy(): void {
    if (this.onEquipmentChangedHandler) {
      this.playerState.off('equipment_changed', this.onEquipmentChangedHandler);
      this.onEquipmentChangedHandler = undefined;
    }
    if (this.onInventoryChangedHandler) {
      this.playerState.off('inventory_changed', this.onInventoryChangedHandler);
      this.onInventoryChangedHandler = undefined;
    }
    if (this.onWeaponChangedHandler) {
      this.playerState.off('weapon_changed', this.onWeaponChangedHandler);
      this.onWeaponChangedHandler = undefined;
    }
    if (this.scene.input && this.scene.input.keyboard) {
      if (this.onEscKeyHandler) {
        this.scene.input.keyboard.off('keydown-ESC', this.onEscKeyHandler);
        this.onEscKeyHandler = undefined;
      }
      if (this.onBKeyHandler) {
        this.scene.input.keyboard.off('keydown-B', this.onBKeyHandler);
        this.onBKeyHandler = undefined;
      }
    }
    if (this.container) {
      this.container.destroy();
    }
  }
}
