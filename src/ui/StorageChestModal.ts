/**
 * HOLLOW WOODS V1.4 - PHẦN 8: BƯỚC V14-P8-02
 * GIAO DIỆN RƯƠNG GỖ SPLIT-VIEW 12 Ô (STORAGE CHEST SPLIT-VIEW MODAL)
 * Thiết kế bảng đôi chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360)
 * - Nửa bên trái: Hành trang của nhân vật (Inventory)
 * - Nửa bên phải: Rương lưu trữ gồm 12 ô vuông (3 hàng x 4 cột)
 * - Hỗ trợ thao tác chuột và phím chuyển đổi nhanh, lưu dữ liệu vào storageChestInventory
 */

import * as Phaser from 'phaser';
import { CampSystem, StorageSlot } from '../systems/CampSystem';
import { PlayerState } from '../state/PlayerState';
import itemsData from '../data/items.json';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { SaveManager } from '../systems/SaveManager';
import { ItemTooltipHelper } from './ItemTooltipHelper';

export class StorageChestModal {
  private scene: Phaser.Scene;
  private campSystem: CampSystem;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  public isOpen: boolean = false;
  private lastToggleTime: number = 0;

  public onOpen?: () => void;
  public onClose?: () => void;

  // Split-View Containers
  private leftInventoryContainer!: Phaser.GameObjects.Container;
  private rightChestContainer!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;
  private chestSlotCountText!: Phaser.GameObjects.Text;
  private invCountText!: Phaser.GameObjects.Text;

  // Phân trang túi đồ nếu nhân vật mang nhiều hơn 12 loại vật phẩm
  private invPage: number = 0;
  private readonly itemsPerPage: number = 12;

  private onChestUpdatedHandler?: () => void;
  private onInventoryChangedHandler?: () => void;
  private onEscKeyHandler?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.campSystem = CampSystem.getInstance();
    this.playerState = PlayerState.getInstance();

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9600);

    this.buildUI();
    this.container.setVisible(false);

    // Lắng nghe phím ESC để đóng
    if (scene.input && scene.input.keyboard) {
      this.onEscKeyHandler = () => {
        if (this.isOpen) this.close();
      };
      scene.input.keyboard.on('keydown-ESC', this.onEscKeyHandler);
    }

    // Lắng nghe cập nhật rương và túi đồ (V15-27: có handler để gỡ khi destroy)
    this.onChestUpdatedHandler = () => {
      if (this.isOpen) this.refreshView();
    };
    this.onInventoryChangedHandler = () => {
      if (this.isOpen) this.refreshView();
    };
    this.playerState.on('chest_updated', this.onChestUpdatedHandler);
    this.playerState.on('inventory_changed', this.onInventoryChangedHandler);
  }

  private buildUI(): void {
    const cx = 640;
    const cy = 360;
    const w = 980;
    const h = 580;

    // 1. Lớp phủ đen mờ che mờ thế giới game bên dưới
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const lx = p.x;
      const ly = p.y;
      if (lx < cx - w / 2 || lx > cx + w / 2 || ly < cy - h / 2 || ly > cy + h / 2) {
        this.close();
      }
    });
    this.container.add(overlay);

    // 2. Khung gỗ sẫm cổ điển viền đồng
    const panel = this.scene.add.graphics();
    // Nền gỗ sẫm
    panel.fillStyle(0x131a16, 0.96);
    panel.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);

    // Viền kép đồng cổ
    panel.lineStyle(2.5, 0x8a6d3b, 0.95);
    panel.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    panel.lineStyle(1, 0x4a3b20, 0.65);
    panel.strokeRoundedRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8, 6);

    // Đinh tán đồng tại 4 góc
    panel.fillStyle(0xd4af37, 0.9);
    panel.fillRect(cx - w / 2 + 8, cy - h / 2 + 8, 4, 4);
    panel.fillRect(cx + w / 2 - 12, cy - h / 2 + 8, 4, 4);
    panel.fillRect(cx - w / 2 + 8, cy + h / 2 - 12, 4, 4);
    panel.fillRect(cx + w / 2 - 12, cy + h / 2 - 12, 4, 4);

    // 3. Đường chia dọc Split-View giữa Hành Trang (Trái) và Rương Lưu Trữ (Phải)
    panel.lineStyle(1.5, 0x4a5568, 0.7);
    panel.lineBetween(cx, cy - h / 2 + 55, cx, cy + h / 2 - 45);
    panel.lineStyle(1, 0x8a6d3b, 0.4);
    panel.lineBetween(cx - 1, cy - h / 2 + 55, cx - 1, cy + h / 2 - 45);

    this.container.add(panel);

    // 4. Tiêu đề chính của Modal
    const title = HDTextHelper.createText(
      this.scene,
      cx,
      cy - h / 2 + 25,
      '📦 RƯƠNG TRÚ ẨN SANCTUARY (SPLIT-VIEW)',
      {
        fontSize: '18px',
        color: '#f1c40f',
        fontStyle: 'bold',
        fontFamily: 'serif'
      }
    ).setOrigin(0.5);

    const subTitle = HDTextHelper.createText(
      this.scene,
      cx,
      cy - h / 2 + 44,
      'Bấm chuột để chuyển đổi vật phẩm qua lại giữa Túi Đồ và Rương Lưu Trữ',
      {
        fontSize: '11px',
        color: '#a0aec0',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
    this.container.add([title, subTitle]);

    // 5. Nút Đóng [✕ ESC] ở góc trên bên phải đồng bộ Dark Woodland Brass (V15-26)
    const closeBtnContainer = this.scene.add.container(cx + w / 2 - 50, cy - h / 2 + 25);
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
    this.container.add(closeBtnContainer);

    // 6. Tiêu đề Phân Khu Trái: HÀNH TRANG
    const leftHeader = HDTextHelper.createText(
      this.scene,
      cx - w / 2 + 35,
      cy - h / 2 + 66,
      '🎒 HÀNH TRANG (Nhấn để cất vào rương)',
      {
        fontSize: '13px',
        color: '#68d391',
        fontStyle: 'bold'
      }
    );
    this.container.add(leftHeader);

    this.invCountText = HDTextHelper.createText(
      this.scene,
      cx - 25,
      cy - h / 2 + 66,
      '0 Món',
      {
        fontSize: '12px',
        color: '#a0aec0',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 0);
    this.container.add(this.invCountText);

    // 7. Tiêu đề Phân Khu Phải: RƯƠNG LƯU TRỮ (12 Ô)
    const rightHeader = HDTextHelper.createText(
      this.scene,
      cx + 25,
      cy - h / 2 + 66,
      '📦 RƯƠNG LƯU TRỮ (Nhấn để lấy vào túi)',
      {
        fontSize: '13px',
        color: '#d4af37',
        fontStyle: 'bold'
      }
    );
    this.container.add(rightHeader);

    this.chestSlotCountText = HDTextHelper.createText(
      this.scene,
      cx + w / 2 - 35,
      cy - h / 2 + 66,
      '0/12 Ô',
      {
        fontSize: '13px',
        color: '#f6ad55',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 0);
    this.container.add(this.chestSlotCountText);

    // 8. Container con cho Lưới Hành Trang (Trái) và Lưới Rương (Phải)
    this.leftInventoryContainer = this.scene.add.container(cx - w / 2 + 30, cy - h / 2 + 95);
    this.rightChestContainer = this.scene.add.container(cx + 20, cy - h / 2 + 95);
    this.container.add([this.leftInventoryContainer, this.rightChestContainer]);

    // 9. Dòng thông báo trạng thái thao tác tại chân modal
    this.statusText = HDTextHelper.createText(
      this.scene,
      cx,
      cy + h / 2 - 32,
      'Chọn vật phẩm để cất hoặc lấy. Rương chứa tối đa 12 loại tài nguyên.',
      {
        fontSize: '12.5px',
        color: '#a0aec0',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);

    const helpText = HDTextHelper.createText(
      this.scene,
      cx,
      cy + h / 2 - 14,
      '[ESC] Đóng rương  •  [Shift + Click] Chuyển toàn bộ xấp vật phẩm',
      {
        fontSize: '11px',
        color: '#718096'
      }
    ).setOrigin(0.5);

    this.container.add([this.statusText, helpText]);
  }

  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.lastToggleTime = Date.now();
    this.invPage = 0;
    this.container.setVisible(true);
    this.refreshView();
    if (this.onOpen) this.onOpen();
    AudioManager.getInstance().playInteract();
  }

  public close(): void {
    ItemTooltipHelper.getInstance().hide();
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.setVisible(false);
    if (this.onClose) this.onClose();
    AudioManager.getInstance().playInteract();

    // Tự động lưu tiến trình game khi đóng rương
    this.autoSaveChestData();
  }

  public toggle(): void {
    if (Date.now() - this.lastToggleTime < 250) return;
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Lưu dữ liệu rương vào storageChestInventory trong SaveManager
   */
  private autoSaveChestData(): void {
    try {
      const gameScene = this.scene.scene.get('GameScene') as any;
      const px = (gameScene && gameScene.player) ? gameScene.player.x : 450;
      const py = (gameScene && gameScene.player) ? gameScene.player.y : 280;
      const zoneId = (gameScene && gameScene.currentZoneId) ? gameScene.currentZoneId : 'sanctuary_farm';
      SaveManager.saveGame('CẬP NHẬT RƯƠNG TRÚ ẨN SANCTUARY', zoneId, px, py);
    } catch (e) {
      console.warn('[StorageChestModal] Không thể tự động lưu rương:', e);
    }
  }

  public refreshView(): void {
    if (!this.isOpen) return;

    // 1. Cập nhật số ô rương đang dùng
    const usedSlots = this.campSystem.getUsedSlotCount();
    this.chestSlotCountText.setText(`${usedSlots}/12 Ô`);

    // 2. Thu thập danh sách vật phẩm trong túi đồ của người chơi
    const invItems: Array<{ key: string; name: string; count: number }> = [];
    for (const [key, count] of this.playerState.inventory.entries()) {
      if (count > 0) {
        const def = (itemsData as Record<string, any>)[key] || { name: key };
        invItems.push({ key, name: def.name || key, count });
      }
    }
    this.invCountText.setText(`${invItems.length} Món`);

    // Quy cách kích thước lưới: 3 cột x 4 hàng = 12 ô
    const cols = 3;
    const rows = 4;
    const totalGridSlots = cols * rows;
    const slotW = 138;
    const slotH = 82;
    const padX = 12;
    const padY = 10;

    // =========================================================================
    // NỬA BÊN TRÁI: HÀNH TRANG NHÂN VẬT (INVENTORY)
    // =========================================================================
    this.leftInventoryContainer.removeAll(true);

    const startIdx = this.invPage * this.itemsPerPage;
    const pageItems = invItems.slice(startIdx, startIdx + this.itemsPerPage);

    for (let i = 0; i < totalGridSlots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = col * (slotW + padX);
      const sy = row * (slotH + padY);

      const hasItem = i < pageItems.length;
      const slotGfx = this.scene.add.graphics();

      if (hasItem) {
        slotGfx.fillStyle(0x18261e, 0.95);
        slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
        slotGfx.lineStyle(1.5, 0x319795, 0.75);
        slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
      } else {
        slotGfx.fillStyle(0x111713, 0.55);
        slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
        slotGfx.lineStyle(1, 0x243228, 0.4);
        slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
      }
      this.leftInventoryContainer.add(slotGfx);

      if (hasItem) {
        const item = pageItems[i];

        // Tên vật phẩm
        const nameText = HDTextHelper.createText(this.scene, sx + 8, sy + 7, item.name, {
          fontSize: '11px',
          color: '#e2e8f0',
          fontStyle: 'bold',
          wordWrap: { width: slotW - 16 }
        });

        // Số lượng xếp chồng góc dưới phải
        const countText = HDTextHelper.createText(this.scene, sx + slotW - 8, sy + slotH - 18, `x${item.count}`, {
          fontSize: '13px',
          color: '#4fd1c5',
          fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Nút hướng dẫn cất đồ
        const actionHint = HDTextHelper.createText(this.scene, sx + 8, sy + slotH - 17, '→ Cất', {
          fontSize: '10px',
          color: '#81e6d9',
          fontStyle: 'bold'
        });

        this.leftInventoryContainer.add([nameText, countText, actionHint]);

        // Hitbox tương tác
        const hitZone = this.scene.add.zone(sx + slotW / 2, sy + slotH / 2, slotW, slotH)
          .setInteractive({ useHandCursor: true });

        hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          ItemTooltipHelper.getInstance().hide();
          const shiftKey = pointer.event ? pointer.event.shiftKey : false;
          const depositAmount = shiftKey ? item.count : 1;

          const res = this.campSystem.depositItem(item.key, depositAmount);
          this.statusText.setText(res.message);
          this.statusText.setColor(res.success ? '#68d391' : '#fc8181');
          AudioManager.getInstance().playInteract();
          this.refreshView();
          this.autoSaveChestData();
        });

        hitZone.on('pointerover', (pointer: Phaser.Input.Pointer) => {
          slotGfx.clear();
          slotGfx.fillStyle(0x22372b, 1.0);
          slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
          slotGfx.lineStyle(1.5, 0x48bb78, 1.0);
          slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
          ItemTooltipHelper.getInstance().show(this.scene, pointer.x, pointer.y, item.key, item.name);
        });

        hitZone.on('pointerout', () => {
          slotGfx.clear();
          slotGfx.fillStyle(0x18261e, 0.95);
          slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
          slotGfx.lineStyle(1.5, 0x319795, 0.75);
          slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
          ItemTooltipHelper.getInstance().hide();
        });

        this.leftInventoryContainer.add(hitZone);
      } else {
        const emptyLabel = HDTextHelper.createText(
          this.scene,
          sx + slotW / 2,
          sy + slotH / 2,
          invItems.length === 0 && i === 4 ? 'Túi rỗng' : '—',
          { fontSize: '11px', color: '#4a5568' }
        ).setOrigin(0.5);
        this.leftInventoryContainer.add(emptyLabel);
      }
    }

    // Điều hướng phân trang nếu túi đồ có nhiều hơn 12 loại vật phẩm
    if (invItems.length > this.itemsPerPage) {
      const maxPages = Math.ceil(invItems.length / this.itemsPerPage);
      const navY = 4 * (slotH + padY) + 5;

      const prevBtn = HDTextHelper.createText(this.scene, 40, navY, '◀ Trang trước', {
        fontSize: '11px',
        color: this.invPage > 0 ? '#68d391' : '#4a5568',
        fontStyle: 'bold'
      }).setInteractive({ useHandCursor: this.invPage > 0 });

      prevBtn.on('pointerdown', () => {
        if (this.invPage > 0) {
          this.invPage--;
          this.refreshView();
        }
      });

      const pageIndicator = HDTextHelper.createText(
        this.scene,
        (slotW * 3 + padX * 2) / 2,
        navY,
        `Trang ${this.invPage + 1}/${maxPages}`,
        { fontSize: '11px', color: '#a0aec0' }
      ).setOrigin(0.5, 0);

      const nextBtn = HDTextHelper.createText(
        this.scene,
        slotW * 3 + padX * 2 - 40,
        navY,
        'Trang sau ▶',
        {
          fontSize: '11px',
          color: this.invPage < maxPages - 1 ? '#68d391' : '#4a5568',
          fontStyle: 'bold'
        }
      ).setOrigin(1, 0).setInteractive({ useHandCursor: this.invPage < maxPages - 1 });

      nextBtn.on('pointerdown', () => {
        if (this.invPage < maxPages - 1) {
          this.invPage++;
          this.refreshView();
        }
      });

      this.leftInventoryContainer.add([prevBtn, pageIndicator, nextBtn]);
    }

    // =========================================================================
    // NỬA BÊN PHẢI: RƯƠNG LƯU TRỮ 12 Ô (3 HÀNG x 4 CỘT)
    // =========================================================================
    this.rightChestContainer.removeAll(true);
    const chestItems: StorageSlot[] = this.campSystem.getChestSlots();

    for (let i = 0; i < totalGridSlots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = col * (slotW + padX);
      const sy = row * (slotH + padY);

      const hasItem = i < chestItems.length;
      const slotGfx = this.scene.add.graphics();

      if (hasItem) {
        slotGfx.fillStyle(0x2b2216, 0.95);
        slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
        slotGfx.lineStyle(1.5, 0xd4af37, 0.85);
        slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
      } else {
        slotGfx.fillStyle(0x16130e, 0.6);
        slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
        slotGfx.lineStyle(1, 0x3d3121, 0.45);
        slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
      }
      this.rightChestContainer.add(slotGfx);

      if (hasItem) {
        const item = chestItems[i];

        // Tên vật phẩm trong rương
        const nameText = HDTextHelper.createText(this.scene, sx + 8, sy + 7, item.name, {
          fontSize: '11px',
          color: '#fffaf0',
          fontStyle: 'bold',
          wordWrap: { width: slotW - 16 }
        });

        // Số lượng xếp chồng trong rương
        const countText = HDTextHelper.createText(this.scene, sx + slotW - 8, sy + slotH - 18, `x${item.count}`, {
          fontSize: '13px',
          color: '#f6ad55',
          fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Nút hướng dẫn lấy đồ
        const actionHint = HDTextHelper.createText(this.scene, sx + 8, sy + slotH - 17, 'Lấy ←', {
          fontSize: '10px',
          color: '#ecc94b',
          fontStyle: 'bold'
        });

        this.rightChestContainer.add([nameText, countText, actionHint]);

        // Hitbox tương tác
        const hitZone = this.scene.add.zone(sx + slotW / 2, sy + slotH / 2, slotW, slotH)
          .setInteractive({ useHandCursor: true });

        hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          ItemTooltipHelper.getInstance().hide();
          const shiftKey = pointer.event ? pointer.event.shiftKey : false;
          const withdrawAmount = shiftKey ? item.count : 1;

          const res = this.campSystem.withdrawItem(item.key, withdrawAmount);
          this.statusText.setText(res.message);
          this.statusText.setColor(res.success ? '#68d391' : '#fc8181');
          AudioManager.getInstance().playInteract();
          this.refreshView();
          this.autoSaveChestData();
        });

        hitZone.on('pointerover', (pointer: Phaser.Input.Pointer) => {
          slotGfx.clear();
          slotGfx.fillStyle(0x382d1c, 1.0);
          slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
          slotGfx.lineStyle(1.5, 0xf1c40f, 1.0);
          slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
          ItemTooltipHelper.getInstance().show(this.scene, pointer.x, pointer.y, item.key, item.name);
        });

        hitZone.on('pointerout', () => {
          slotGfx.clear();
          slotGfx.fillStyle(0x2b2216, 0.95);
          slotGfx.fillRoundedRect(sx, sy, slotW, slotH, 5);
          slotGfx.lineStyle(1.5, 0xd4af37, 0.85);
          slotGfx.strokeRoundedRect(sx, sy, slotW, slotH, 5);
          ItemTooltipHelper.getInstance().hide();
        });

        this.rightChestContainer.add(hitZone);
      } else {
        const slotNumText = HDTextHelper.createText(
          this.scene,
          sx + slotW / 2,
          sy + slotH / 2,
          `Ô ${i + 1}`,
          { fontSize: '11px', color: '#68563c' }
        ).setOrigin(0.5);
        this.rightChestContainer.add(slotNumText);
      }
    }
  }

  public destroy(): void {
    if (this.onChestUpdatedHandler) {
      this.playerState.off('chest_updated', this.onChestUpdatedHandler);
      this.onChestUpdatedHandler = undefined;
    }
    if (this.onInventoryChangedHandler) {
      this.playerState.off('inventory_changed', this.onInventoryChangedHandler);
      this.onInventoryChangedHandler = undefined;
    }
    if (this.onEscKeyHandler && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown-ESC', this.onEscKeyHandler);
      this.onEscKeyHandler = undefined;
    }
    if (this.container) {
      this.container.destroy();
    }
  }
}
