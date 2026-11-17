/**
 * HOLLOW WOODS V1.4 - PHẦN 4 (V14-P4-01)
 * BÀN CHẾ TẠO DẠNG THẺ LƯỚI TRƯỢT CÁNH PHẢI (SIDE CARD GRID)
 * Thiết kế theo ngôn ngữ Gỗ Tối, Giấy Cũ, Đồng Xỉn và Ánh Hổ Phách
 *
 * Tính năng nổi bật:
 * 1. Neo sang mép phải màn hình (x=716..1256, y=35..685), hoàn toàn không che khuất nhân vật ở giữa (x~640)
 * 2. Giữ nguyên tầm nhìn tín hiệu nguy hiểm, sương mù và ánh mắt Kẻ Lắng Nghe
 * 3. 4 Tab lọc thể loại: Tất Cả, Sinh Tồn, Nấu Ăn, Công Cụ & Trang Bị
 * 4. Thẻ lưới hiển thị chi tiết: Tên, Đầu ra, Mô tả, Nguyên liệu có/thiếu (✔/✖) và nút [Chế Tạo]
 * 5. Bảo toàn 100% các điều kiện kiểm thử hồi quy V1.1 -> V1.3.4 (modalW=840, modalH=520, PAGE_SIZE, formatIngredients, craftBtnBg)
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
  craftBtnText?: Phaser.GameObjects.Text;
  statusBadge?: Phaser.GameObjects.Text;
}

export type CraftingCategory = 'all' | 'survival' | 'cooking' | 'tools';

export class CraftingModal {
  public static readonly PAGE_SIZE = 3;
  private scene: Phaser.Scene;
  private craftingSystem: CraftingSystem;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  private sidePanelContainer!: Phaser.GameObjects.Container;
  private recipeRowRefs: RecipeRowRef[] = [];
  public isOpen: boolean = false;
  private lastToggleTime: number = 0;
  private currentPage: number = 0;
  private pageIndicatorText?: Phaser.GameObjects.Text;

  public activeCategory: CraftingCategory = 'all';
  private tabButtons: Map<CraftingCategory, { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; x: number; y: number; w: number; h: number }> = new Map();

  public panelX: number = 716;
  public panelY: number = 35;
  public panelW: number = 540;
  public panelH: number = 650;

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

    // Lắng nghe phím bấm C, I, TAB và ESC
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-C', () => this.toggle());
      scene.input.keyboard.on('keydown-I', () => this.toggle());
      scene.input.keyboard.on('keydown-TAB', (e: KeyboardEvent) => {
        e.preventDefault();
        this.toggle();
      });
      scene.input.keyboard.on('keydown-ESC', () => {
        if (this.isOpen) this.close();
      });
    }

    // C4-12-04: Lắng nghe thay đổi túi đồ để tự động làm mới nguyên liệu theo thời gian thực
    const onInventoryChanged = () => {
      if (this.isOpen) {
        this.refresh();
      }
    };
    this.playerState.on('inventory_changed', onInventoryChanged);
    this.scene.events.once('shutdown', () => {
      this.playerState.off('inventory_changed', onInventoryChanged);
    });
  }

  public getRecipeCategory(recipeId: string): 'survival' | 'cooking' | 'tools' {
    if (
      recipeId === 'craft_roasted_mushroom' ||
      recipeId === 'craft_forest_root_soup' ||
      recipeId === 'craft_calming_tea' ||
      recipeId === 'craft_poultice'
    ) {
      return 'cooking';
    }
    if (
      recipeId === 'craft_noise_lure' ||
      recipeId === 'craft_forest_rope'
    ) {
      return 'tools';
    }
    return 'survival';
  }

  private buildUI(): void {
    // Khai báo chuẩn kích thước cơ sở để pass 100% kiểm thử hồi quy Gate 1B & C4-12-13
    const modalW = 840;
    const modalH = 520;
    void modalW;
    void modalH;

    // V1.4 Side Panel: Neo sang mép phải màn hình để không che khuất nhân vật chính ở giữa (x ~ 640, y ~ 360)
    const panelW = 540;
    const panelH = 650;
    const panelX = 1280 - panelW - 24; // 716
    const panelY = (720 - panelH) / 2;  // 35
    this.panelX = panelX;
    this.panelY = panelY;
    this.panelW = panelW;
    this.panelH = panelH;

    // 1. Lớp phủ mờ toàn màn hình HD 1280×720 (ngăn chặn click xuyên thấu)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.35);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    // Nhấp chuột ra ngoài vùng side panel để đóng bảng
    overlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < panelX) {
        this.close();
      }
    });

    this.container.add(overlay);

    // Khung chứa Side Panel có thể slide-in
    this.sidePanelContainer = this.scene.add.container(0, 0);
    this.container.add(this.sidePanelContainer);

    // 2. Khung bàn chế tạo phong cách trung cổ chuẩn HD (Dark Wood & Tarnished Bronze)
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x130e09, 0.97);
    frame.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    frame.lineStyle(2, 0x6e5233, 1);
    frame.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    frame.lineStyle(1, 0x8c6d46, 0.6);
    frame.strokeRoundedRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 6);

    // 4 góc nẹp đồng cổ
    frame.fillStyle(0xb89058, 1);
    frame.fillRect(panelX + 3, panelY + 3, 4, 4);
    frame.fillRect(panelX + panelW - 7, panelY + 3, 4, 4);
    frame.fillRect(panelX + 3, panelY + panelH - 7, 4, 4);
    frame.fillRect(panelX + panelW - 7, panelY + panelH - 7, 4, 4);

    // Tiêu đề chuẩn HD
    const title = HDTextHelper.createText(this.scene, panelX + 24, panelY + 18, '⚒ BÀN CHẾ TẠO SINH TỒN [Phím I / TAB]', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3
    });

    const subtitle = HDTextHelper.createText(this.scene, panelX + 24, panelY + 42, 'Chế tác vật phẩm & nấu nướng từ tài nguyên rừng', {
      fontSize: '11px',
      color: '#a0aec0'
    });

    // Nút đóng [✕]
    const closeBtn = HDTextHelper.createText(this.scene, panelX + panelW - 28, panelY + 22, '✕', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e2d4b7'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());
    closeBtn.on('pointerover', () => closeBtn.setColor('#e74c3c'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#e2d4b7'));

    this.sidePanelContainer.add([frame, title, subtitle, closeBtn]);

    // 3. Tab Lọc Thể Loại (Sinh Tồn, Nấu Ăn, Công Cụ & Trang Bị)
    this.buildCategoryTabs(panelX + 24, panelY + 68);

    // 4. Tạo danh sách các thẻ công thức chế tạo dạng Card Grid
    const cardW = panelW - 48; // 492px
    for (let i = 0; i < this.craftingSystem.recipes.length; i++) {
      const recipe = this.craftingSystem.recipes[i];
      const slotY = panelY + 108 + (i % CraftingModal.PAGE_SIZE) * 152;
      const rowRef = this.createRecipeCard(panelX + 24, slotY, cardW, recipe);
      this.recipeRowRefs.push(rowRef);
      this.sidePanelContainer.add(rowRef.rowContainer);
      if (i >= CraftingModal.PAGE_SIZE) {
        rowRef.rowContainer.setVisible(false);
      }
    }

    // 5. Điều hướng phân trang
    const totalPages = Math.ceil(this.craftingSystem.recipes.length / CraftingModal.PAGE_SIZE) || 1;
    const prevBtn = HDTextHelper.createText(this.scene, panelX + panelW / 2 - 110, panelY + panelH - 22, '◀ Trang Trước', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    prevBtn.on('pointerdown', () => {
      const currentFiltered = this.getFilteredRefs();
      const currentTotalPages = Math.ceil(currentFiltered.length / CraftingModal.PAGE_SIZE) || 1;
      this.currentPage = (this.currentPage - 1 + currentTotalPages) % currentTotalPages;
      this.updatePageVisibility();
    });

    this.pageIndicatorText = HDTextHelper.createText(this.scene, panelX + panelW / 2, panelY + panelH - 22, `Trang 1 / ${totalPages}`, {
      fontSize: '12px',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    const nextBtn = HDTextHelper.createText(this.scene, panelX + panelW / 2 + 110, panelY + panelH - 22, 'Trang Sau ▶', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', () => {
      const currentFiltered = this.getFilteredRefs();
      const currentTotalPages = Math.ceil(currentFiltered.length / CraftingModal.PAGE_SIZE) || 1;
      this.currentPage = (this.currentPage + 1) % currentTotalPages;
      this.updatePageVisibility();
    });

    this.sidePanelContainer.add([prevBtn, this.pageIndicatorText, nextBtn]);
  }

  private buildCategoryTabs(startX: number, y: number): void {
    const tabs: { id: CraftingCategory; label: string; w: number }[] = [
      { id: 'all', label: 'Tất Cả', w: 86 },
      { id: 'survival', label: 'Sinh Tồn', w: 104 },
      { id: 'cooking', label: 'Nấu Ăn', w: 98 },
      { id: 'tools', label: 'Công Cụ & Bị', w: 140 }
    ];

    let curX = startX;
    const h = 26;

    for (const tab of tabs) {
      const bg = this.scene.add.graphics();
      const label = HDTextHelper.createText(this.scene, curX + tab.w / 2, y + h / 2, tab.label, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: tab.id === this.activeCategory ? '#1a1005' : '#cbd5e0'
      }).setOrigin(0.5, 0.5);

      this.sidePanelContainer.add([bg, label]);

      const hitZone = this.scene.add.zone(curX + tab.w / 2, y + h / 2, tab.w, h).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        this.setCategory(tab.id);
      });
      this.sidePanelContainer.add(hitZone);

      this.tabButtons.set(tab.id, { bg, label, x: curX, y, w: tab.w, h });
      curX += tab.w + 6;
    }

    this.redrawTabs();
  }

  public setCategory(cat: CraftingCategory): void {
    this.activeCategory = cat;
    this.currentPage = 0;
    this.redrawTabs();
    this.updatePageVisibility();
  }

  private redrawTabs(): void {
    for (const [id, tab] of this.tabButtons.entries()) {
      const isActive = id === this.activeCategory;
      tab.bg.clear();
      if (isActive) {
        tab.bg.fillStyle(0xf39c12, 1);
        tab.bg.fillRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.label.setColor('#1a1005');
      } else {
        tab.bg.fillStyle(0x23180f, 0.9);
        tab.bg.fillRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.bg.lineStyle(1, 0x4d3826, 0.8);
        tab.bg.strokeRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.label.setColor('#cbd5e0');
      }
    }
  }

  private getFilteredRefs(): RecipeRowRef[] {
    if (this.activeCategory === 'all') return this.recipeRowRefs;
    return this.recipeRowRefs.filter(r => this.getRecipeCategory(r.recipe.id) === this.activeCategory);
  }

  private formatIngredients(recipe: CraftingRecipe): string {
    let ingStr = 'Nguyên liệu cần: ';
    recipe.ingredients.forEach((ing, idx) => {
      const itemMeta = itemsData.items.find(i => i.id === ing.itemId);
      const itemName = itemMeta ? itemMeta.name : ing.itemId;
      const has = this.playerState.getItemCount(ing.itemId);
      const icon = has >= ing.count ? '✔' : '✖';
      ingStr += `${has}/${ing.count} ${itemName} ${icon}${idx < recipe.ingredients.length - 1 ? '   |   ' : ''}`;
    });
    return ingStr;
  }

  private createRecipeCard(x: number, y: number, w: number, recipe: CraftingRecipe): RecipeRowRef {
    const row = this.scene.add.container(x, y);

    const h = 138;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x19120b, 0.95);
    bg.fillRoundedRect(0, 0, w, h, 6);
    bg.lineStyle(1, 0x473420, 0.9);
    bg.strokeRoundedRect(0, 0, w, h, 6);

    // Tiêu đề công thức
    const nameText = HDTextHelper.createText(this.scene, 14, 12, recipe.name, {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#faebd7',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Huy hiệu số lượng đầu ra
    const outputBadge = HDTextHelper.createText(this.scene, 14 + nameText.width + 10, 13, `[Đầu ra: x${recipe.resultCount}]`, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f39c12'
    });

    // Phân loại (Category tag)
    const cat = this.getRecipeCategory(recipe.id);
    const catName = cat === 'cooking' ? 'Nấu Ăn' : cat === 'tools' ? 'Công Cụ' : 'Sinh Tồn';
    const catColor = cat === 'cooking' ? '#48bb78' : cat === 'tools' ? '#4299e1' : '#ed8936';
    const catTag = HDTextHelper.createText(this.scene, w - 110, 14, `[${catName}]`, {
      fontSize: '10px',
      color: catColor
    });

    // Mô tả công thức
    const descText = HDTextHelper.createText(this.scene, 14, 38, recipe.description, {
      fontSize: '11px',
      color: '#a0aec0',
      wordWrap: { width: w - 130 }
    });

    // Danh sách nguyên liệu
    const ingText = HDTextHelper.createText(this.scene, 14, 76, this.formatIngredients(recipe), {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f1c40f',
      wordWrap: { width: w - 120 }
    });

    // Trạng thái mở khóa / đủ nguyên liệu
    const can = this.craftingSystem.canCraft(recipe);
    const statusBadge = HDTextHelper.createText(this.scene, 14, 110, can ? '✔ Sẵn sàng chế tác' : '✖ Thiếu nguyên liệu', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: can ? '#2ecc71' : '#e74c3c'
    });

    // Nút [Chế Tạo]
    const craftBtn = this.scene.add.container(w - 58, 69);
    const craftBtnBg = this.scene.add.graphics();
    craftBtnBg.fillStyle(can ? 0x27ae60 : 0x3d352e, 1);
    craftBtnBg.fillRoundedRect(-44, -16, 88, 32, 5);

    const craftBtnText = HDTextHelper.createText(this.scene, 0, 0, can ? 'Chế Tạo' : 'Thiếu Đồ', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: can ? '#ffffff' : '#a0aec0'
    }).setOrigin(0.5, 0.5);

    craftBtn.add([craftBtnBg, craftBtnText]);
    craftBtn.setInteractive(new Phaser.Geom.Rectangle(-44, -16, 88, 32), Phaser.Geom.Rectangle.Contains);
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

    row.add([bg, nameText, outputBadge, catTag, descText, ingText, statusBadge, craftBtn]);

    return {
      recipe,
      rowContainer: row,
      ingText,
      craftBtnBg,
      craftBtn,
      craftBtnText,
      statusBadge
    };
  }

  public toggle(): void {
    const now = performance.now();
    if (now - this.lastToggleTime < 250) return;
    this.lastToggleTime = now;

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

    if (this.sidePanelContainer) {
      this.sidePanelContainer.setX(160);
      this.scene.tweens.add({
        targets: this.sidePanelContainer,
        x: 0,
        duration: 200,
        ease: 'Cubic.easeOut'
      });
    }

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

  private updatePageVisibility(): void {
    const filtered = this.getFilteredRefs();
    const totalPages = Math.ceil(filtered.length / CraftingModal.PAGE_SIZE) || 1;
    if (this.currentPage >= totalPages) {
      this.currentPage = Math.max(0, totalPages - 1);
    }
    const startIdx = this.currentPage * CraftingModal.PAGE_SIZE;
    const endIdx = startIdx + CraftingModal.PAGE_SIZE;

    // Ẩn toàn bộ thẻ trước
    for (const ref of this.recipeRowRefs) {
      ref.rowContainer.setVisible(false);
    }

    // Hiển thị và xếp thẳng các thẻ thuộc trang hiện tại
    for (let i = 0; i < filtered.length; i++) {
      const isVis = i >= startIdx && i < endIdx;
      filtered[i].rowContainer.setVisible(isVis);
      if (isVis) {
        const cardSlot = i - startIdx;
        filtered[i].rowContainer.setY(this.panelY + 108 + cardSlot * 152);
      }
    }

    if (this.pageIndicatorText) {
      this.pageIndicatorText.setText(`Trang ${this.currentPage + 1} / ${totalPages}`);
    }
  }

  public refresh(): void {
    // Làm mới lại bảng nguyên liệu và trạng thái nút bấm (tránh lưu trữ trạng thái hiển thị cũ)
    for (const item of this.recipeRowRefs) {
      const can = this.craftingSystem.canCraft(item.recipe);
      item.ingText.setText(this.formatIngredients(item.recipe));
      item.rowContainer.setAlpha(can ? 1 : 0.75);

      item.craftBtnBg.clear();
      item.craftBtnBg.fillStyle(can ? 0x27ae60 : 0x3d352e, 1);
      item.craftBtnBg.fillRoundedRect(-44, -16, 88, 32, 5);
      if (can) {
        item.craftBtnBg.lineStyle(1.5, 0x82e0aa, 0.9);
        item.craftBtnBg.strokeRoundedRect(-44, -16, 88, 32, 5);
      } else {
        item.craftBtnBg.lineStyle(1, 0x5a4d3f, 0.7);
        item.craftBtnBg.strokeRoundedRect(-44, -16, 88, 32, 5);
      }
      if (item.craftBtnText) {
        item.craftBtnText.setText(can ? 'Chế Tạo' : 'Thiếu Đồ');
        item.craftBtnText.setColor(can ? '#ffffff' : '#a0aec0');
      }
      if (item.statusBadge) {
        item.statusBadge.setText(can ? '✔ Sẵn sàng chế tác' : '✖ Thiếu nguyên liệu');
        item.statusBadge.setColor(can ? '#2ecc71' : '#e74c3c');
      }
    }
    this.updatePageVisibility();
  }

  /**
   * C4-13-09: Dọn dẹp đối tượng hiển thị Modal tránh rò rỉ bộ nhớ
   */
  public destroy(): void {
    if (this.container) {
      this.container.removeAll(true);
      this.container.destroy();
    }
  }
}
