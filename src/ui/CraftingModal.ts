/**
 * HOLLOW WOODS V3.0 - PASS T15
 * HD OVERHAUL FOR CRAFTING MODAL
 * Khung chuẩn HD 1280×720, căn giữa (640, 360), kích thước 840×520 px
 */

import * as Phaser from 'phaser';
import { CraftingSystem, CraftingRecipe } from '../systems/CraftingSystem';
import { PlayerState } from '../state/PlayerState';
import itemsData from '../data/items.json';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';

export class CraftingModal {
  private scene: Phaser.Scene;
  private craftingSystem: CraftingSystem;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  private recipeButtons: { recipe: CraftingRecipe; btn: Phaser.GameObjects.Container }[] = [];
  public isOpen: boolean = false;

  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.craftingSystem = new CraftingSystem();
    this.playerState = PlayerState.getInstance();

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9500);

    this.buildUI();
    this.container.setVisible(false);

    // Lắng nghe phím bấm I và TAB để mở/đóng túi chế tạo
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-I', () => this.toggle());
      scene.input.keyboard.on('keydown-TAB', (e: KeyboardEvent) => {
        e.preventDefault();
        this.toggle();
      });
      scene.input.keyboard.on('keydown-ESC', () => {
        if (this.isOpen) this.close();
      });
    }
  }

  private buildUI(): void {
    const modalW = 840;
    const modalH = 520;
    const modalX = (1280 - modalW) / 2; // 220
    const modalY = (720 - modalH) / 2;  // 100

    // 1. Lớp phủ mờ toàn màn hình HD 1280×720
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung sổ chế tạo phong cách trung cổ chuẩn HD (840×520 px)
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x0c1017, 0.98);
    frame.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    frame.lineStyle(2, 0xd4af37, 1);
    frame.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);
    frame.lineStyle(1, 0x4a3b22, 0.8);
    frame.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 8);

    // Tiêu đề chuẩn HD
    const title = HDTextHelper.createText(this.scene, modalX + 30, modalY + 22, '⚒ BÀN CHẾ TẠO SINH TỒN [Phím I / TAB]', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Nút đóng [✕]
    const closeBtn = HDTextHelper.createText(this.scene, modalX + modalW - 35, modalY + 22, '✕', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());

    this.container.add([overlay, frame, title, closeBtn]);

    // 3. Tạo danh sách các công thức chế tạo thoáng đãng chuẩn HD
    let itemY = modalY + 70;
    const rowW = modalW - 56; // 784px
    for (const recipe of this.craftingSystem.recipes) {
      const row = this.createRecipeRow(modalX + 28, itemY, rowW, recipe);
      this.recipeButtons.push({ recipe, btn: row });
      this.container.add(row);
      itemY += 135;
    }
  }

  private createRecipeRow(x: number, y: number, w: number, recipe: CraftingRecipe): Phaser.GameObjects.Container {
    const row = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x141a24, 0.95);
    bg.fillRoundedRect(0, 0, w, 118, 6);
    bg.lineStyle(1, 0x3d4a5d, 0.9);
    bg.strokeRoundedRect(0, 0, w, 118, 6);

    const nameText = HDTextHelper.createText(this.scene, 20, 14, recipe.name, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });

    const descText = HDTextHelper.createText(this.scene, 20, 44, recipe.description, {
      fontSize: '13px',
      color: '#bdc3c7',
      wordWrap: { width: w - 170 }
    });

    // Liệt kê nguyên liệu
    let ingStr = 'Nguyên liệu cần: ';
    recipe.ingredients.forEach((ing, idx) => {
      const itemMeta = itemsData.items.find(i => i.id === ing.itemId);
      const itemName = itemMeta ? itemMeta.name : ing.itemId;
      const has = this.playerState.getItemCount(ing.itemId);
      ingStr += `${has}/${ing.count} ${itemName}${idx < recipe.ingredients.length - 1 ? '   |   ' : ''}`;
    });

    const ingText = HDTextHelper.createText(this.scene, 20, 80, ingStr, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f1c40f'
    });

    // Nút [Chế Tạo] chuẩn HD
    const craftBtn = this.scene.add.container(w - 90, 59);
    const craftBtnBg = this.scene.add.graphics();
    craftBtnBg.fillStyle(0x27ae60, 1);
    craftBtnBg.fillRoundedRect(-48, -18, 96, 36, 6);

    const craftBtnText = HDTextHelper.createText(this.scene, 0, 0, 'Chế Tạo', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    craftBtn.add([craftBtnBg, craftBtnText]);
    craftBtn.setInteractive(new Phaser.Geom.Rectangle(-48, -18, 96, 36), Phaser.Geom.Rectangle.Contains);
    craftBtn.on('pointerdown', () => {
      if (this.craftingSystem.craft(recipe.id)) {
        AudioManager.getInstance().playCraftSuccess();
        this.refresh();
      }
    });

    row.add([bg, nameText, descText, ingText, craftBtn]);
    return row;
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    this.isOpen = true;
    this.refresh();
    this.container.setVisible(true);
    if (this.onOpen) {
      this.onOpen();
    }
  }

  public close(): void {
    this.isOpen = false;
    this.container.setVisible(false);
    if (this.onClose) {
      this.onClose();
    }
  }

  public refresh(): void {
    // Làm mới lại bảng nguyên liệu và trạng thái nút bấm
    for (const item of this.recipeButtons) {
      const can = this.craftingSystem.canCraft(item.recipe);
      item.btn.setAlpha(can ? 1 : 0.65);
    }
  }
}
