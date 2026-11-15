/**
 * HOLLOW WOODS V1.1 - GATE 1B
 * HD CRAFTING MODAL ARCHITECTURE
 * Khung chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360), kích thước 840×520 px
 */

import * as Phaser from 'phaser';
import { CraftingSystem, CraftingRecipe } from '../systems/CraftingSystem';
import { PlayerState } from '../state/PlayerState';
import itemsData from '../data/items.json';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';

interface RecipeRowRef {
  recipe: CraftingRecipe;
  rowContainer: Phaser.GameObjects.Container;
  ingText: Phaser.GameObjects.Text;
  craftBtnBg: Phaser.GameObjects.Graphics;
  craftBtn: Phaser.GameObjects.Container;
}

export class CraftingModal {
  private scene: Phaser.Scene;
  private craftingSystem: CraftingSystem;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  private recipeRowRefs: RecipeRowRef[] = [];
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

    // Lắng nghe phím bấm I, TAB và ESC
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

    // 1. Lớp phủ mờ toàn màn hình HD 1280×720 (ngăn chặn click xuyên thấu)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung bàn chế tạo phong cách trung cổ chuẩn HD (840×520 px)
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

    // 3. Tạo danh sách các công thức chế tạo
    let itemY = modalY + 70;
    const rowW = modalW - 56; // 784px
    for (const recipe of this.craftingSystem.recipes) {
      const rowRef = this.createRecipeRow(modalX + 28, itemY, rowW, recipe);
      this.recipeRowRefs.push(rowRef);
      this.container.add(rowRef.rowContainer);
      itemY += 135;
    }
  }

  private formatIngredients(recipe: CraftingRecipe): string {
    let ingStr = 'Nguyên liệu cần: ';
    recipe.ingredients.forEach((ing, idx) => {
      const itemMeta = itemsData.items.find(i => i.id === ing.itemId);
      const itemName = itemMeta ? itemMeta.name : ing.itemId;
      const has = this.playerState.getItemCount(ing.itemId);
      ingStr += `${has}/${ing.count} ${itemName}${idx < recipe.ingredients.length - 1 ? '   |   ' : ''}`;
    });
    return ingStr;
  }

  private createRecipeRow(x: number, y: number, w: number, recipe: CraftingRecipe): RecipeRowRef {
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

    const ingText = HDTextHelper.createText(this.scene, 20, 80, this.formatIngredients(recipe), {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f1c40f'
    });

    // Nút [Chế Tạo]
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
    if (craftBtn.input) {
      craftBtn.input.cursor = 'pointer';
    }

    craftBtn.on('pointerdown', () => {
      if (this.craftingSystem.canCraft(recipe)) {
        if (this.craftingSystem.craft(recipe.id)) {
          AudioManager.getInstance().playCraftSuccess();
          this.refresh();
          const ui = this.scene as any;
          if (ui && typeof ui.showPopupMessage === 'function') {
            ui.showPopupMessage(`✔ Đã chế tạo thành công: ${recipe.name}!`);
          }
        }
      } else {
        const ui = this.scene as any;
        if (ui && typeof ui.showPopupMessage === 'function') {
          ui.showPopupMessage('⚠️ Không đủ nguyên liệu để chế tạo vật phẩm này!');
        }
      }
    });

    row.add([bg, nameText, descText, ingText, craftBtn]);

    return {
      recipe,
      rowContainer: row,
      ingText,
      craftBtnBg,
      craftBtn
    };
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    const ui = this.scene as any;
    // Ngăn chặn mở khi đối thoại đang chạy (GATE 1B Mutual Exclusion)
    if (ui && ui.isDialogueActive) {
      return;
    }
    // Đóng Journal nếu đang mở
    if (ui && ui.journalModal && ui.journalModal.isOpen) {
      ui.journalModal.close();
    }

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
    // Làm mới lại bảng nguyên liệu và trạng thái nút bấm (tránh lưu trữ trạng thái hiển thị cũ)
    for (const item of this.recipeRowRefs) {
      const can = this.craftingSystem.canCraft(item.recipe);
      item.ingText.setText(this.formatIngredients(item.recipe));
      item.rowContainer.setAlpha(can ? 1 : 0.65);

      item.craftBtnBg.clear();
      item.craftBtnBg.fillStyle(can ? 0x27ae60 : 0x4a5568, 1);
      item.craftBtnBg.fillRoundedRect(-48, -18, 96, 36, 6);
    }
  }
}
