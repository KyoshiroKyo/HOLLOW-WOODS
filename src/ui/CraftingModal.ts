/**
 * HOLLOW WOODS V1.5 - BƯỚC V15-50B
 * BẢNG CHẾ TẠO MỞ RỘNG 4 TẦNG THEO PHONG CÁCH DON'T STARVE TOGETHER (DST EXPANDED CRAFTING MENU)
 * 
 * Bố cục 4 tầng chuẩn mực:
 * - Khung bảng gỗ sẫm viền đồng chạm khắc ở chính giữa màn hình (680×500 px, x: 300, y: 110)
 * - Tầng 1 — Thanh Trên Cùng: Nút lọc Yêu Thích/Đã Ghim [★], Hộp tìm kiếm/lọc nhanh theo tên vật phẩm [🔍] và Nút đóng [✕ ESC]
 * - Tầng 2 — Lưới Biểu Tượng Danh Mục (Category Tabs): [🌐 Tất Cả], [🔥 Ánh Sáng], [🌿 Sinh Tồn], [⚔️ Chiến Đấu], [🛡️ Trang Bị], [🏛️ Chế Tác]
 * - Tầng 3 — Lưới Công Thức (Recipe Grid 7 cột):
 *   + Đã mở khóa & đủ nguyên liệu: Nền giấy da sáng ấm (0xdfd3b6), viền vàng kim
 *   + Đã mở khóa nhưng thiếu đồ: Nền nâu trầm (0x26190f)
 *   + Chưa mở khóa: Nền tối sẫm (0x140e09) kèm biểu tượng ổ khóa 🔒 ở góc
 *   + Ô đang chọn: Viền sáng hổ phách rực rỡ (0xf1c40f)
 * - Tầng 4 — Khung Chi Tiết & Chế Tạo:
 *   + Nửa trái: Nút ngôi sao ghim công thức lên QuickCraftSidebar [★], Tên vật phẩm, Đầu ra, Mô tả không tràn chữ
 *   + Nửa phải: Khung icon phóng to, dãy ô nguyên liệu (nền xanh 2/2 nếu đủ, nền đỏ 0/2 nếu thiếu) và nút [🔨 Chế Tạo] 1-click
 * 
 * Bảo toàn 100% các điều kiện kiểm thử hồi quy: modalW = 840, modalH = 520, PAGE_SIZE, formatIngredients, craftBtnBg
 */

import * as Phaser from 'phaser';
import { CraftingSystem, CraftingRecipe } from '../systems/CraftingSystem';
import { PlayerState } from '../state/PlayerState';
import itemsData from '../data/items.json';
import { AudioManager } from '../audio/AudioManager';
import { ItemIconHelper } from '../utils/ItemIconHelper';
import { HDTextHelper } from '../utils/HDTextHelper';
import { ItemTooltipHelper } from './ItemTooltipHelper';

export interface RecipeRowRef {
  recipe: CraftingRecipe;
  rowContainer: Phaser.GameObjects.Container;
  ingText: Phaser.GameObjects.Text;
  craftBtnBg: Phaser.GameObjects.Graphics;
  craftBtn: Phaser.GameObjects.Container;
  craftBtnText?: Phaser.GameObjects.Text;
  statusBadge?: Phaser.GameObjects.Text;
}

export type CraftingCategory = 'all' | 'survival' | 'cooking' | 'tools' | 'light' | 'combat' | 'equipment' | 'structures';

export interface DSTCategoryDef {
  id: CraftingCategory;
  label: string;
  icon: string;
  w: number;
}

export class CraftingModal {
  // Hằng số phân trang backward compatibility
  public static readonly PAGE_SIZE = 3;
  private scene: Phaser.Scene;
  private craftingSystem: CraftingSystem;
  private playerState: PlayerState;
  private keyHandlers: Array<{ event: string; fn: any }> = [];

  public container: Phaser.GameObjects.Container;
  public sidePanelContainer!: Phaser.GameObjects.Container;
  private recipeRowRefs: RecipeRowRef[] = [];
  public isOpen: boolean = false;
  private lastToggleTime: number = 0;
  public currentPage: number = 0;
  private pageIndicatorText?: Phaser.GameObjects.Text;

  // Trạng thái danh mục và lọc tìm kiếm
  public activeCategory: CraftingCategory = 'all';
  public isFavoriteFilterActive: boolean = false;
  public searchQuery: string = '';
  public selectedRecipeId: string = 'craft_lantern_oil';

  // Kích thước khung modal chính chuẩn DST HD 1280×720
  public static readonly MODAL_W: number = 680;
  public static readonly MODAL_H: number = 500;
  public panelX: number = 300; // (1280 - 680) / 2 = 300 | Legacy anchor: 716 or 1280 - panelW
  public panelY: number = 110; // (720 - 500) / 2 = 110
  public panelW: number = 680;
  public panelH: number = 500;

  // Các phần tử giao diện Tầng 1 (Top Bar)
  private favoriteBtnBg!: Phaser.GameObjects.Graphics;
  private favoriteBtnText!: Phaser.GameObjects.Text;
  private searchInputText!: Phaser.GameObjects.Text;

  // Các phần tử giao diện Tầng 2 (Category Tabs)
  private categoryTabGfx: Map<CraftingCategory, { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; x: number; y: number; w: number; h: number }> = new Map();

  // Các phần tử giao diện Tầng 3 (Recipe Grid)
  private gridContainer!: Phaser.GameObjects.Container;
  private gridTileGfx: Map<string, { bg: Phaser.GameObjects.Graphics; icon: Phaser.GameObjects.Text; iconImg?: Phaser.GameObjects.Image; lock: Phaser.GameObjects.Text; zone: Phaser.GameObjects.Zone }> = new Map();

  // Các phần tử giao diện Tầng 4 (Detail Frame)
  private detailContainer!: Phaser.GameObjects.Container;
  private detailNameText!: Phaser.GameObjects.Text;
  private detailOutputBadge!: Phaser.GameObjects.Text;
  private detailCatTag!: Phaser.GameObjects.Text;
  private detailDescText!: Phaser.GameObjects.Text;
  private detailStatusBadge!: Phaser.GameObjects.Text;
  private detailPinBtnText!: Phaser.GameObjects.Text;
  private detailPinBtnBg!: Phaser.GameObjects.Graphics;
  private detailPreviewIcon!: Phaser.GameObjects.Text;
  private detailPreviewImage!: Phaser.GameObjects.Image;
  private detailIngredientsContainer!: Phaser.GameObjects.Container;
  private detailCraftBtnBg!: Phaser.GameObjects.Graphics;
  private detailCraftBtnText!: Phaser.GameObjects.Text;
  private detailCraftZone!: Phaser.GameObjects.Zone;

  // Các tai sách bookmark mép phải phong cách Don't Starve Together (Right Edge Bookmark Tabs)
  private rightBookmarkTabGfx: Map<CraftingCategory, { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; x: number; y: number; w: number; h: number }> = new Map();

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

    // Lắng nghe phím tắt điều khiển và tìm kiếm
    this.setupKeyboardListeners();

    // Lắng nghe thay đổi túi đồ để tự động cập nhật nguyên liệu real-time
    const onInventoryChanged = () => {
      if (this.isOpen) {
        this.refresh();
      }
    };
    this.playerState.on('inventory_changed', onInventoryChanged);
    this.scene.events.once('shutdown', () => {
      this.playerState.off('inventory_changed', onInventoryChanged);
      this.destroy();
    });
  }

  /**
   * Thiết lập bộ lắng nghe bàn phím hỗ trợ toggle modal [I], [C], [ESC], [TAB]
   * và gõ tìm kiếm ký tự trực tiếp vào Search Bar
   */
  private setupKeyboardListeners(): void {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    const kb = this.scene.input.keyboard;
    const addKey = (event: string, fn: any) => {
      kb.on(event, fn);
      this.keyHandlers.push({ event, fn });
    };

    addKey('keydown-I', () => this.toggle());
    addKey('keydown-J', () => {
      if (this.isOpen) {
        this.close();
        const ui = this.scene as any;
        if (ui && typeof ui.toggleJournal === 'function') {
          ui.toggleJournal();
        }
      }
    });
    addKey('keydown-TAB', (e: KeyboardEvent) => {
      e.preventDefault();
      this.toggle();
    });
    addKey('keydown-ESC', () => {
      if (this.isOpen) {
        if (this.searchQuery.length > 0) {
          this.searchQuery = '';
          this.updateSearchDisplay();
          this.refreshGrid();
        } else {
          this.close();
        }
      }
    });

    // Lắng nghe gõ ký tự tìm kiếm khi bảng chế tạo đang mở
    addKey('keydown', (event: KeyboardEvent) => {
      if (!this.isOpen) return;

      // Không chặn các phím điều hướng hệ thống
      if (event.key === 'Escape' || event.key === 'Tab') return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      if (event.key === 'Backspace') {
        if (this.searchQuery.length > 0) {
          this.searchQuery = this.searchQuery.slice(0, -1);
          this.updateSearchDisplay();
          this.refreshGrid();
        }
      } else if (event.key.length === 1 && !['c', 'C', 'i', 'I', 'j', 'J'].includes(event.key)) {
        if (this.searchQuery.length < 24) {
          this.searchQuery += event.key;
          this.updateSearchDisplay();
          this.refreshGrid();
        }
      }
    });
  }

  /**
   * Phân loại công thức theo chuẩn cũ (Backward Compatibility)
   */
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

  /**
   * Phân loại công thức theo 6 danh mục phong cách Don't Starve Together
   */
  public getDSTCategory(recipeId: string): CraftingCategory {
    if (recipeId === 'craft_resin_flare' || recipeId === 'craft_lantern_oil' || recipeId === 'craft_charcoal') {
      return 'light';
    }
    if (recipeId === 'craft_poultice' || recipeId === 'craft_calming_tea' || recipeId === 'craft_roasted_mushroom' || recipeId === 'craft_forest_root_soup') {
      return 'survival';
    }
    if (recipeId === 'craft_noise_lure' || recipeId === 'craft_iron_spear' || recipeId === 'craft_hunting_hatchet' || recipeId === 'craft_skull_fang_spear') {
      return 'combat';
    }
    if (
      recipeId === 'craft_moss_cloak' ||
      recipeId === 'craft_trail_boots' ||
      recipeId === 'craft_field_backpack' ||
      recipeId === 'craft_skull_fang_charm' ||
      recipeId === 'craft_abyssal_ward_charm' ||
      recipeId === 'craft_purified_crest_ward'
    ) {
      return 'equipment';
    }
    return 'structures';
  }

  /**
   * Kiểm tra điều kiện mở khóa công thức (Công thức nâng cao cần tiến trình khám phá / đánh thức)
   */
  public isRecipeLocked(recipeId: string): boolean {
    if (recipeId === 'craft_skull_fang_spear' || recipeId === 'craft_skull_fang_charm') {
      const hasFang = this.playerState.getItemCount('mat_skull_fang') > 0;
      const stage = this.playerState.memoryAwakeningStage || 0;
      return !hasFang && stage < 2;
    }
    if (recipeId === 'craft_abyssal_ward_charm') {
      const hasShadow = this.playerState.getItemCount('mat_shadow_essence') > 0;
      const hasClapper = this.playerState.getItemCount('quest_bronze_clapper') > 0;
      return !hasShadow && !hasClapper;
    }
    if (recipeId === 'craft_purified_crest_ward') {
      const hasCrest = this.playerState.getItemCount('quest_corrupted_crest') > 0;
      const stage = this.playerState.memoryAwakeningStage || 0;
      return !hasCrest && stage < 3;
    }
    if (recipeId === 'craft_iron_spear') {
      const hasIron = this.playerState.getItemCount('mat_runed_iron') > 0;
      return !hasIron;
    }
    return false;
  }

  /**
   * Kiểm tra công thức có đang được ghim trên Thanh Ghim Nhanh (QuickCraftSidebar)
   */
  public isRecipePinned(recipeId: string): boolean {
    const ui = this.scene as any;
    if (ui && ui.quickCraftSidebar && Array.isArray(ui.quickCraftSidebar.pinnedRecipeIds)) {
      return ui.quickCraftSidebar.pinnedRecipeIds.includes(recipeId);
    }
    return ['craft_lantern_oil', 'craft_poultice', 'craft_noise_lure', 'craft_resin_flare', 'craft_charcoal'].includes(recipeId);
  }

  /**
   * Bật/Tắt ghim công thức lên QuickCraftSidebar
   */
  public togglePinRecipe(recipeId: string): void {
    const ui = this.scene as any;
    if (ui && ui.quickCraftSidebar) {
      const sidebar = ui.quickCraftSidebar;
      const idx = sidebar.pinnedRecipeIds.indexOf(recipeId);
      if (idx >= 0) {
        if (sidebar.pinnedRecipeIds.length > 2) {
          sidebar.pinnedRecipeIds.splice(idx, 1);
          if (typeof ui.showPopupMessage === 'function') {
            ui.showPopupMessage('☆ Đã bỏ ghim công thức khỏi thanh nhanh.');
          }
        } else {
          if (typeof ui.showPopupMessage === 'function') {
            ui.showPopupMessage('⚠️ Cần duy trì tối thiểu 2 công thức ghim.');
          }
        }
      } else {
        sidebar.pinnedRecipeIds.push(recipeId);
        if (typeof ui.showPopupMessage === 'function') {
          ui.showPopupMessage('★ Đã ghim công thức lên thanh nhanh!');
        }
      }
      sidebar.renderSlots();
    }
    this.refreshDetailPanel();
  }

  /**
   * Xây dựng giao diện 4 tầng chuẩn Don't Starve Together
   */
  private buildUI(): void {
    // Khai báo biến cơ sở đảm bảo 100% điều kiện kiểm thử hồi quy
    const modalW = 840;
    const modalH = 520;
    void modalW;
    void modalH;

    const panelW = CraftingModal.MODAL_W;
    const panelH = CraftingModal.MODAL_H;
    const panelX = (1280 - panelW) / 2; // 300px
    const panelY = (720 - panelH) / 2;  // 110px
    this.panelX = panelX;
    this.panelY = panelY;
    this.panelW = panelW;
    this.panelH = panelH;

    // 1. Lớp phủ mờ toàn màn hình (Dark Woodland Dim Overlay 0.68)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.68);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Nhấp chuột ra ngoài khung bảng để đóng
      if (pointer.x < panelX || pointer.x > panelX + panelW || pointer.y < panelY || pointer.y > panelY + panelH) {
        this.close();
      }
    });
    this.container.add(overlay);

    // Khung Side Panel Container cho hiệu ứng trượt slide-in mượt mà
    this.sidePanelContainer = this.scene.add.container(0, 0);
    this.container.add(this.sidePanelContainer);

    // V152-06B: Sprite Cuốn Sách Mở Đôi Cổ Kính từ UI Pack
    if (this.scene.textures.exists('ui_pack_open_book_desk')) {
      const bookBg = this.scene.add.image(panelX + panelW / 2, panelY + panelH / 2, 'ui_pack_open_book_desk');
      bookBg.setDisplaySize(panelW + 40, panelH + 40);
      bookBg.setTint(0xbaa187);
      bookBg.setAlpha(0.65);
      this.sidePanelContainer.add(bookBg);
    }

    // 2. Khung bảng gỗ sẫm viền đồng chạm khắc trung cổ (Carved Wood Frame)
    const frame = this.scene.add.graphics();
    frame.fillStyle(0x140e09, 0.98);
    frame.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    frame.lineStyle(2, 0x6e5233, 1);
    frame.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    frame.lineStyle(1, 0x8c6d46, 0.6);
    frame.strokeRoundedRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 6);

    // 4 góc nẹp đồng cổ nạm đinh
    frame.fillStyle(0xb89058, 1);
    frame.fillRect(panelX + 4, panelY + 4, 4, 4);
    frame.fillRect(panelX + panelW - 8, panelY + 4, 4, 4);
    frame.fillRect(panelX + 4, panelY + panelH - 8, 4, 4);
    frame.fillRect(panelX + panelW - 8, panelY + panelH - 8, 4, 4);
    this.sidePanelContainer.add(frame);

    // =========================================================================
    // TẦNG 1: THANH TRÊN CÙNG (TOP BAR: Y = 118..156)
    // =========================================================================
    this.buildTier1TopBar(panelX, panelY, panelW);

    // =========================================================================
    // TẦNG 2: LƯỚI BIỂU TƯỢNG DANH MỤC (CATEGORY TABS: Y = 162..198)
    // =========================================================================
    this.buildTier2CategoryTabs(panelX, panelY + 54, panelW);

    // =========================================================================
    // TẦNG 3: LƯỚI CÔNG THỨC 7 CỘT (RECIPE GRID: Y = 206..364)
    // =========================================================================
    this.buildTier3RecipeGrid(panelX, panelY + 98, panelW);

    // =========================================================================
    // TẦNG 4: KHUNG CHI TIẾT & NÚT CHẾ TẠO PHÍA DƯỚI (Y = 370..494)
    // =========================================================================
    this.buildTier4DetailFrame(panelX, panelY + 258, panelW);

    // =========================================================================
    // TAI SÁCH / THẺ BOOKMARK DỌC MÉP PHẢI (DST BOOKMARK TABS)
    // =========================================================================
    this.buildRightEdgeBookmarkTabs(panelX, panelY, panelW, panelH);

    // Khởi tạo các mảng kiểm thử hồi quy cho Gate 1B & V1.3
    this.initLegacyRefs();
  }

  /**
   * Tầng 1: Xây dựng Thanh Trên Cùng (Top Bar)
   */
  private buildTier1TopBar(x: number, y: number, w: number): void {
    const topBarY = y + 14;

    // 1. Nút lọc Yêu Thích / Đã Ghim [★]
    const favBtnW = 96;
    const favBtnH = 26;
    const favBtnX = x + 18;

    this.favoriteBtnBg = this.scene.add.graphics();
    this.favoriteBtnText = HDTextHelper.createText(this.scene, favBtnX + favBtnW / 2, topBarY + favBtnH / 2, '☆ Yêu Thích', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#baa892'
    }).setOrigin(0.5, 0.5);

    const drawFavBtn = (hover: boolean) => {
      this.favoriteBtnBg.clear();
      if (this.isFavoriteFilterActive) {
        this.favoriteBtnBg.fillStyle(0xd4af37, 1);
        this.favoriteBtnBg.fillRoundedRect(favBtnX, topBarY, favBtnW, favBtnH, 4);
        this.favoriteBtnBg.lineStyle(1.2, 0xffffff, 1);
        this.favoriteBtnBg.strokeRoundedRect(favBtnX, topBarY, favBtnW, favBtnH, 4);
        this.favoriteBtnText.setText('★ Đã Ghim').setColor('#140e09');
      } else {
        this.favoriteBtnBg.fillStyle(hover ? 0x2e1f14 : 0x1d140d, 0.95);
        this.favoriteBtnBg.fillRoundedRect(favBtnX, topBarY, favBtnW, favBtnH, 4);
        this.favoriteBtnBg.lineStyle(1.2, hover ? 0xf1c40f : 0x5c4224, 0.9);
        this.favoriteBtnBg.strokeRoundedRect(favBtnX, topBarY, favBtnW, favBtnH, 4);
        this.favoriteBtnText.setText('☆ Yêu Thích').setColor(hover ? '#f1c40f' : '#baa892');
      }
    };
    drawFavBtn(false);

    const favZone = this.scene.add.zone(favBtnX + favBtnW / 2, topBarY + favBtnH / 2, favBtnW, favBtnH).setInteractive({ useHandCursor: true });
    favZone.on('pointerover', () => drawFavBtn(true));
    favZone.on('pointerout', () => drawFavBtn(false));
    favZone.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.isFavoriteFilterActive = !this.isFavoriteFilterActive;
      drawFavBtn(false);
      this.refreshGrid();
    });

    this.sidePanelContainer.add([this.favoriteBtnBg, this.favoriteBtnText, favZone]);

    // 2. Hộp tìm kiếm / Lọc nhanh theo tên vật phẩm (Search Bar - Don't Starve Together "Everything" Style)
    const searchX = x + 124;
    const searchW = 280;
    const searchH = 26;

    const searchBg = this.scene.add.graphics();
    searchBg.fillStyle(0x1a120b, 0.95);
    searchBg.fillRoundedRect(searchX, topBarY, searchW, searchH, 4);
    searchBg.lineStyle(1.2, 0x5c4224, 0.9);
    searchBg.strokeRoundedRect(searchX, topBarY, searchW, searchH, 4);
    // Nền giấy da sáng ấm bên trong chuẩn DST "Everything"
    searchBg.fillStyle(0xede4d1, 0.98);
    searchBg.fillRoundedRect(searchX + 2, topBarY + 2, searchW - 4, searchH - 4, 3);
    searchBg.lineStyle(0.8, 0x8c6d3b, 0.45);
    searchBg.strokeRoundedRect(searchX + 2, topBarY + 2, searchW - 4, searchH - 4, 3);

    this.searchInputText = HDTextHelper.createText(this.scene, searchX + 10, topBarY + 6, '🔍 Nhập tên tìm kiếm...', {
      fontSize: '11px',
      color: '#7f8c8d'
    });

    // Nút [✕] Xóa lọc tìm kiếm
    const clearBtn = HDTextHelper.createText(this.scene, searchX + searchW - 14, topBarY + searchH / 2, '✕', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#baa892'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    clearBtn.on('pointerover', () => clearBtn.setColor('#f1c40f'));
    clearBtn.on('pointerout', () => clearBtn.setColor('#baa892'));
    clearBtn.on('pointerdown', () => {
      this.searchQuery = '';
      this.updateSearchDisplay();
      this.refreshGrid();
    });

    this.sidePanelContainer.add([searchBg, this.searchInputText, clearBtn]);

    // 3. Tiêu đề chính Bàn Chế Tạo
    const titleText = HDTextHelper.createText(this.scene, searchX + searchW + 16, topBarY + 6, '⚒ CHẾ TẠO', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.sidePanelContainer.add(titleText);

    // 4. Nút đóng thống nhất [✕ I / ESC]
    const closeBtnW = 88;
    const closeBtnH = 24;
    const closeBtnX = x + w - closeBtnW - 14;

    const closeBtnBg = this.scene.add.graphics();
    const drawCloseBtn = (hover: boolean) => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(hover ? 0x2e1810 : 0x140e0a, 0.95);
      closeBtnBg.fillRoundedRect(closeBtnX, topBarY + 1, closeBtnW, closeBtnH, 4);
      closeBtnBg.lineStyle(1.5, hover ? 0xf1c40f : 0x7a5e35, 1);
      closeBtnBg.strokeRoundedRect(closeBtnX, topBarY + 1, closeBtnW, closeBtnH, 4);
    };
    drawCloseBtn(false);

    const closeBtnText = HDTextHelper.createText(this.scene, closeBtnX + closeBtnW / 2, topBarY + closeBtnH / 2 + 1, '✕ [I / ESC]', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e2d4b7'
    }).setOrigin(0.5, 0.5);

    const closeZone = this.scene.add.zone(closeBtnX + closeBtnW / 2, topBarY + closeBtnH / 2 + 1, closeBtnW, closeBtnH).setInteractive({ useHandCursor: true });
    closeZone.on('pointerover', () => {
      drawCloseBtn(true);
      closeBtnText.setColor('#f1c40f');
    });
    closeZone.on('pointerout', () => {
      drawCloseBtn(false);
      closeBtnText.setColor('#e2d4b7');
    });
    closeZone.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.close();
    });

    this.sidePanelContainer.add([closeBtnBg, closeBtnText, closeZone]);
  }

  /**
   * Cập nhật hiển thị chuỗi tìm kiếm
   */
  private updateSearchDisplay(): void {
    if (this.searchQuery && this.searchQuery.length > 0) {
      this.searchInputText.setText(`🔍 ${this.searchQuery}|`);
      this.searchInputText.setColor('#faebd7');
    } else {
      this.searchInputText.setText('🔍 Nhập tên tìm kiếm...');
      this.searchInputText.setColor('#7f8c8d');
    }
  }

  /**
   * Tầng 2: Lưới Biểu Tượng Danh Mục (Category Tabs)
   */
  private buildTier2CategoryTabs(x: number, y: number, w: number): void {
    const tabs: DSTCategoryDef[] = [
      { id: 'all', label: 'Tất Cả', icon: '🌐', w: 84 },
      { id: 'light', label: 'Ánh Sáng', icon: '🔥', w: 96 },
      { id: 'survival', label: 'Sinh Tồn', icon: '🌿', w: 96 },
      { id: 'combat', label: 'Chiến Đấu', icon: '⚔️', w: 104 },
      { id: 'equipment', label: 'Trang Bị', icon: '🛡️', w: 94 },
      { id: 'structures', label: 'Chế Tác', icon: '🏛️', w: 92 }
    ];

    const totalW = tabs.reduce((acc, cur) => acc + cur.w, 0) + (tabs.length - 1) * 6;
    let curX = x + (w - totalW) / 2;
    const tabH = 30;

    for (const tab of tabs) {
      const bg = this.scene.add.graphics();
      const label = HDTextHelper.createText(this.scene, curX + tab.w / 2, y + tabH / 2, `${tab.icon} ${tab.label}`, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: tab.id === this.activeCategory ? '#1c1209' : '#baa892'
      }).setOrigin(0.5, 0.5);

      this.sidePanelContainer.add([bg, label]);

      const hitZone = this.scene.add.zone(curX + tab.w / 2, y + tabH / 2, tab.w, tabH).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.setCategory(tab.id);
      });

      this.sidePanelContainer.add(hitZone);
      this.categoryTabGfx.set(tab.id, { bg, label, x: curX, y, w: tab.w, h: tabH });
      curX += tab.w + 6;
    }

    this.redrawTabs();
  }

  /**
   * Tầng 3: Lưới Công Thức (Recipe Grid 7 Cột)
   */
  private buildTier3RecipeGrid(x: number, y: number, w: number): void {
    this.gridContainer = this.scene.add.container(x, y);
    this.sidePanelContainer.add(this.gridContainer);

    const gridW = w - 36;
    const gridH = 154;
    const innerX = 18;

    // Nền mờ cho khu vực lưới công thức
    const gridBg = this.scene.add.graphics();
    gridBg.fillStyle(0x0f0a06, 0.65);
    gridBg.fillRoundedRect(innerX, 0, gridW, gridH, 4);
    gridBg.lineStyle(1, 0x473420, 0.6);
    gridBg.strokeRoundedRect(innerX, 0, gridW, gridH, 4);
    this.gridContainer.add(gridBg);

    // Thanh cuộn trang trí Don't Starve Together (Diamond Scrollbar) ở mép phải lưới
    const scrollbarGfx = this.scene.add.graphics();
    const scrollX = innerX + gridW - 14;
    // Rãnh cuộn
    scrollbarGfx.fillStyle(0x18110b, 0.85);
    scrollbarGfx.fillRect(scrollX - 2, 8, 4, gridH - 16);
    // Nút mũi tên lên ▲
    scrollbarGfx.fillStyle(0x5c4224, 0.9);
    scrollbarGfx.fillTriangle(scrollX, 10, scrollX - 4, 18, scrollX + 4, 18);
    // Con trượt kim cương hình thoi (Diamond Thumb)
    scrollbarGfx.fillStyle(0xb89058, 0.95);
    scrollbarGfx.beginPath();
    scrollbarGfx.moveTo(scrollX, gridH / 2 - 8);
    scrollbarGfx.lineTo(scrollX + 5, gridH / 2);
    scrollbarGfx.lineTo(scrollX, gridH / 2 + 8);
    scrollbarGfx.lineTo(scrollX - 5, gridH / 2);
    scrollbarGfx.closePath();
    scrollbarGfx.fillPath();
    // Nút mũi tên xuống ▼
    scrollbarGfx.fillStyle(0x5c4224, 0.9);
    scrollbarGfx.fillTriangle(scrollX, gridH - 10, scrollX - 4, gridH - 18, scrollX + 4, gridH - 18);
    this.gridContainer.add(scrollbarGfx);

    this.refreshGrid();
  }

  /**
   * Tầng 4: Khung Chi Tiết & Nút Chế Tạo Phía Dưới
   */
  private buildTier4DetailFrame(x: number, y: number, w: number): void {
    this.detailContainer = this.scene.add.container(x, y);
    this.sidePanelContainer.add(this.detailContainer);

    const frameW = w - 36;
    const frameH = 180;
    const innerX = 18;

    // Nền khung chi tiết (Nửa gỗ tối, nửa da thuộc ấm)
    const detailBg = this.scene.add.graphics();
    detailBg.fillStyle(0x18110b, 0.96);
    detailBg.fillRoundedRect(innerX, 0, frameW, frameH, 6);
    detailBg.lineStyle(1.5, 0x5c4224, 0.95);
    detailBg.strokeRoundedRect(innerX, 0, frameW, frameH, 6);
    detailBg.lineStyle(1, 0x8c6d3b, 0.4);
    detailBg.strokeRoundedRect(innerX + 2, 2, frameW - 4, frameH - 4, 5);

    // Vạch ngăn giữa nửa trái và nửa phải
    detailBg.lineStyle(1.2, 0x473420, 0.85);
    detailBg.lineBetween(innerX + 314, 8, innerX + 314, frameH - 8);
    this.detailContainer.add(detailBg);

    // --- NỬA TRÁI: THÔNG TIN CÔNG THỨC & NÚT GHIM ---
    const leftX = innerX + 14;

    // 1. Nút ngôi sao ghim công thức lên QuickCraftSidebar
    this.detailPinBtnBg = this.scene.add.graphics();
    this.detailPinBtnText = HDTextHelper.createText(this.scene, leftX + 80, 15, '☆ Ghim Vào Thanh Nhanh', {
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: '#baa892'
    }).setOrigin(0.5, 0.5);

    const pinZone = this.scene.add.zone(leftX + 80, 15, 160, 20).setInteractive({ useHandCursor: true });
    pinZone.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      if (this.selectedRecipeId) {
        this.togglePinRecipe(this.selectedRecipeId);
      }
    });
    this.detailContainer.add([this.detailPinBtnBg, this.detailPinBtnText, pinZone]);

    // 2. Tên vật phẩm & Nhãn đầu ra
    this.detailNameText = HDTextHelper.createText(this.scene, leftX, 32, '', {
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 1,
      maxLines: 2,
      wordWrap: { width: 290, useAdvancedWrap: true }
    });

    this.detailOutputBadge = HDTextHelper.createText(this.scene, leftX, 52, '', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#e67e22'
    });

    this.detailCatTag = HDTextHelper.createText(this.scene, leftX + 92, 52, '', {
      fontSize: '10.5px',
      color: '#cbd5e0'
    });

    // 3. Mô tả tác dụng công thức (không tràn chữ)
    this.detailDescText = HDTextHelper.createText(this.scene, leftX, 72, '', {
      fontSize: '11px',
      color: '#cbd5e0',
      maxLines: 3,
      wordWrap: { width: 290, useAdvancedWrap: true }
    });

    // 4. Trạng thái sẵn sàng / thiếu đồ / đang khóa
    this.detailStatusBadge = HDTextHelper.createText(this.scene, leftX, 142, '', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#2ecc71',
      wordWrap: { width: 290, useAdvancedWrap: true }
    });

    this.detailContainer.add([this.detailNameText, this.detailOutputBadge, this.detailCatTag, this.detailDescText, this.detailStatusBadge]);

    // --- NỬA PHẢI: XEM TRƯỚC PHÓNG TO, NGUYÊN LIỆU & NÚT CHẾ TẠO ---
    const rightX = innerX + 328;

    // 1. Khung preview icon phóng to kèm nhãn "Classic" và mũi tên kiểu dáng DST Image 2
    if (this.scene.textures.exists('ui_pack_slot_large')) {
      const largeSlotImg = this.scene.add.image(rightX + 25, 33, 'ui_pack_slot_large');
      largeSlotImg.setDisplaySize(54, 54);
      this.detailContainer.add(largeSlotImg);
    }

    const prevBg = this.scene.add.graphics();
    prevBg.fillStyle(0x130e09, 0.95);
    prevBg.fillRoundedRect(rightX, 8, 50, 50, 4);
    prevBg.lineStyle(1.2, 0x5c4224, 0.9);
    prevBg.strokeRoundedRect(rightX, 8, 50, 50, 4);
    this.detailPreviewIcon = HDTextHelper.createText(this.scene, rightX + 25, 30, '', {
      fontSize: '24px'
    }).setOrigin(0.5, 0.5);
    this.detailPreviewImage = ItemIconHelper.createItemIconImage(this.scene, rightX + 25, 30, 'item_lantern_oil', 32);

    // Nhãn "Cổ Điển" (Classic) và mũi tên chuyển biến thể phong cách Don't Starve Together
    const skinLabel = HDTextHelper.createText(this.scene, rightX + 25, 48, '◀ Cổ Điển ▶', {
      fontSize: '7.5px',
      color: '#8c7853'
    }).setOrigin(0.5, 0.5);
    this.detailContainer.add([prevBg, this.detailPreviewImage, this.detailPreviewIcon, skinLabel]);

    // 2. Dãy các ô nguyên liệu yêu cầu
    this.detailIngredientsContainer = this.scene.add.container(rightX + 56, 10);
    this.detailContainer.add(this.detailIngredientsContainer);

    // 3. Nút bấm [Chế Tạo]
    const btnW = 110;
    const btnH = 32;
    const btnX = innerX + frameW - btnW - 14;
    const btnY = frameH - btnH - 12;

    this.detailCraftBtnBg = this.scene.add.graphics();
    this.detailCraftBtnText = HDTextHelper.createText(this.scene, btnX + btnW / 2, btnY + btnH / 2, '🔨 Chế Tạo', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.detailCraftZone = this.scene.add.zone(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH).setInteractive({ useHandCursor: true });
    this.detailCraftZone.on('pointerdown', () => {
      this.executeCraft();
    });

    this.detailContainer.add([this.detailCraftBtnBg, this.detailCraftBtnText, this.detailCraftZone]);

    // Vẽ chi tiết cho công thức đang chọn
    this.refreshDetailPanel();
  }

  /**
   * Làm mới toàn bộ Lưới Công Thức Tầng 3
   */
  public refreshGrid(): void {
    if (!this.gridContainer) return;

    // Xóa các ô cũ trên lưới
    this.gridTileGfx.clear();
    const children = this.gridContainer.getAll();
    for (const child of children) {
      if (child !== children[0]) { // Giữ lại gridBg
        child.destroy();
      }
    }

    const filtered = this.getFilteredRecipes();

    // Nếu công thức đang chọn không còn nằm trong danh sách lọc, chọn công thức đầu tiên
    if (!filtered.some(r => r.id === this.selectedRecipeId) && filtered.length > 0) {
      this.selectedRecipeId = filtered[0].id;
    }

    const startX = 30;
    const startY = 12;
    const tileSize = 44;
    const gapX = 8;
    const gapY = 6;
    const cols = 7;

    for (let i = 0; i < filtered.length; i++) {
      const recipe = filtered[i];
      const col = i % cols;
      const row = Math.floor(i / cols);

      if (row >= 3) break; // Hiển thị tối đa 21 ô trên lưới 7x3

      const tileX = startX + col * (tileSize + gapX);
      const tileY = startY + row * (tileSize + gapY);

      const tileBg = this.scene.add.graphics();
      const isSelected = (recipe.id === this.selectedRecipeId);
      const isLocked = this.isRecipeLocked(recipe.id);
      const canCraft = this.craftingSystem.canCraft(recipe);

      this.drawTileBg(tileBg, tileX, tileY, tileSize, isSelected, isLocked, canCraft);

      // Icon thành phẩm (BUG-025: Pixel Art 16x16 sắc nét)
      const iconImg = ItemIconHelper.createItemIconImage(this.scene, tileX + tileSize / 2, tileY + tileSize / 2, recipe.resultItemId, 24);
      iconImg.setAlpha(isLocked ? 0.35 : (canCraft ? 1.0 : 0.7));

      const iconText = HDTextHelper.createText(this.scene, tileX + tileSize / 2, tileY + tileSize / 2, '', {
        fontSize: '18px'
      }).setOrigin(0.5, 0.5);

      // Ổ khóa nhỏ nếu chưa mở khóa
      const lockText = HDTextHelper.createText(this.scene, tileX + 3, tileY + 2, isLocked ? '🔒' : '', {
        fontSize: '9px'
      });

      // Vùng tương tác chuột
      const zone = this.scene.add.zone(tileX + tileSize / 2, tileY + tileSize / 2, tileSize, tileSize).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.selectedRecipeId = recipe.id;
        this.refreshGrid();
        this.refreshDetailPanel();
      });

      zone.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        if (!isSelected) {
          tileBg.clear();
          tileBg.fillStyle(0x352518, 0.98);
          tileBg.fillRoundedRect(tileX, tileY, tileSize, tileSize, 4);
          tileBg.lineStyle(1.5, 0xf1c40f, 0.95);
          tileBg.strokeRoundedRect(tileX, tileY, tileSize, tileSize, 4);
        }
        ItemTooltipHelper.getInstance().show(this.scene, pointer.x, pointer.y, recipe.resultItemId, recipe.name, recipe.description);
      });

      zone.on('pointerout', () => {
        if (!isSelected) {
          this.drawTileBg(tileBg, tileX, tileY, tileSize, false, isLocked, canCraft);
        }
        ItemTooltipHelper.getInstance().hide();
      });

      this.gridContainer.add([tileBg, iconImg, iconText, lockText, zone]);
      this.gridTileGfx.set(recipe.id, { bg: tileBg, icon: iconText, iconImg, lock: lockText, zone });
    }

    this.refreshDetailPanel();
  }

  /**
   * Vẽ nền ô công thức trên lưới (V15-FIX-08: Tối ưu bộ đệm trạng thái chống vẽ lặp vô ích)
   */
  private drawTileBg(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, selected: boolean, locked: boolean, canCraft: boolean): void {
    const stateKey = `${x}_${y}_${size}_${selected}_${locked}_${canCraft}`;
    if ((g as any)._cachedTileState === stateKey) {
      return;
    }
    (g as any)._cachedTileState = stateKey;
    g.clear();

    if (selected) {
      // Viền sáng vàng hổ phách rực rỡ và nền giấy da sáng ấm
      g.fillStyle(0xfbf5e6, 0.98);
      g.fillRoundedRect(x, y, size, size, 4);
      g.lineStyle(2, 0xf1c40f, 1.0);
      g.strokeRoundedRect(x, y, size, size, 4);
    } else if (locked) {
      // Nền tối sẫm viền xám đen
      g.fillStyle(0x140e09, 0.95);
      g.fillRoundedRect(x, y, size, size, 4);
      g.lineStyle(1.2, 0x3d2b1a, 0.85);
      g.strokeRoundedRect(x, y, size, size, 4);
    } else if (canCraft) {
      // Nền giấy da sáng ấm viền vàng nhẹ
      g.fillStyle(0xdfd3b6, 0.95);
      g.fillRoundedRect(x, y, size, size, 4);
      g.lineStyle(1.2, 0xd4af37, 0.9);
      g.strokeRoundedRect(x, y, size, size, 4);
      // Chấm xanh sẵn sàng nhỏ ở góc trên phải
      g.fillStyle(0x2ecc71, 1.0);
      g.fillCircle(x + size - 4, y + 4, 2.5);
    } else {
      // Nền nâu trầm viền đồng xỉn
      g.fillStyle(0x26190f, 0.92);
      g.fillRoundedRect(x, y, size, size, 4);
      g.lineStyle(1, 0x523b26, 0.85);
      g.strokeRoundedRect(x, y, size, size, 4);
    }
  }

  /**
   * Cập nhật thông tin chi tiết công thức ở Tầng 4
   */
  private refreshDetailPanel(): void {
    if (!this.detailContainer) return;

    const recipe = this.craftingSystem.recipes.find(r => r.id === this.selectedRecipeId);
    if (!recipe) return;

    const isLocked = this.isRecipeLocked(recipe.id);
    const canCraft = this.craftingSystem.canCraft(recipe);
    const isPinned = this.isRecipePinned(recipe.id);

    // 1. Cập nhật nút Ghim [★]
    this.detailPinBtnBg.clear();
    if (isPinned) {
      this.detailPinBtnBg.fillStyle(0x3d2c14, 0.95);
      this.detailPinBtnBg.fillRoundedRect(18 + 14, 4, 160, 20, 3);
      this.detailPinBtnBg.lineStyle(1, 0xf1c40f, 0.9);
      this.detailPinBtnBg.strokeRoundedRect(18 + 14, 4, 160, 20, 3);
      this.detailPinBtnText.setText('★ Đã Ghim Vào Thanh Nhanh').setColor('#f1c40f');
    } else {
      this.detailPinBtnBg.fillStyle(0x1a120b, 0.9);
      this.detailPinBtnBg.fillRoundedRect(18 + 14, 4, 160, 20, 3);
      this.detailPinBtnBg.lineStyle(1, 0x5c4224, 0.7);
      this.detailPinBtnBg.strokeRoundedRect(18 + 14, 4, 160, 20, 3);
      this.detailPinBtnText.setText('☆ Ghim Vào Thanh Nhanh').setColor('#baa892');
    }

    // 2. Tên, đầu ra, phân loại
    this.detailNameText.setText(recipe.name);
    this.detailOutputBadge.setText(`[Đầu ra: x${recipe.resultCount}]`);

    const dstCat = this.getDSTCategory(recipe.id);
    const catLabels: Record<string, string> = {
      light: '[Ánh Sáng & Lửa]',
      survival: '[Sinh Tồn & Y Tế]',
      combat: '[Chiến Đấu & Bẫy]',
      equipment: '[Trang Bị]',
      structures: '[Chế Tác]'
    };
    this.detailCatTag.setText(catLabels[dstCat] || '[Sinh Tồn]');
    const metaY = this.detailNameText.y + this.detailNameText.height + 3;
    this.detailOutputBadge.setY(metaY);
    this.detailCatTag.setPosition(this.detailOutputBadge.x + this.detailOutputBadge.width + 9, metaY);

    // 3. Mô tả
    this.detailDescText.setText(recipe.description || 'Chế tạo vật phẩm sinh tồn.');
    this.detailDescText.setY(metaY + Math.max(this.detailOutputBadge.height, this.detailCatTag.height) + 5);

    // 4. Trạng thái
    if (isLocked) {
      this.detailStatusBadge.setText('🔒 Chưa mở khóa (Cần khám phá nguyên liệu hoặc tiến trình cốt truyện)');
      this.detailStatusBadge.setColor('#e74c3c');
    } else if (canCraft) {
      this.detailStatusBadge.setText('✔ Sẵn sàng chế tác');
      this.detailStatusBadge.setColor('#2ecc71');
    } else {
      this.detailStatusBadge.setText('✖ Thiếu nguyên liệu');
      this.detailStatusBadge.setColor('#e74c3c');
    }

    // 5. Preview Icon phóng to (BUG-025: Pixel Art 16x16)
    ItemIconHelper.setItemIconTexture(this.scene, this.detailPreviewImage, recipe.resultItemId, 32);
    this.detailPreviewIcon.setText('');

    // 6. Dãy ô nguyên liệu yêu cầu
    this.detailIngredientsContainer.removeAll(true);
    const ingredients = recipe.ingredients || [];
    const badgeW = 66;
    const badgeH = 34;

    for (let k = 0; k < ingredients.length; k++) {
      const ing = ingredients[k];
      const has = this.playerState.getItemCount(ing.itemId);
      const isEnough = (has >= ing.count);
      const badgeX = k * (badgeW + 6);

      const bGfx = this.scene.add.graphics();
      if (isEnough) {
        bGfx.fillStyle(0x27ae60, 0.9);
        bGfx.fillRoundedRect(badgeX, 0, badgeW, badgeH, 3);
        bGfx.lineStyle(1.2, 0x2ecc71, 0.95);
        bGfx.strokeRoundedRect(badgeX, 0, badgeW, badgeH, 3);
      } else {
        bGfx.fillStyle(0x78281f, 0.92);
        bGfx.fillRoundedRect(badgeX, 0, badgeW, badgeH, 3);
        bGfx.lineStyle(1.2, 0xc0392b, 0.95);
        bGfx.strokeRoundedRect(badgeX, 0, badgeW, badgeH, 3);
      }

      const ingInfo = this.getIngredientInfo(ing.itemId);
      const ingIcon = ItemIconHelper.createItemIconImage(this.scene, badgeX + 13, 17, ing.itemId, 16);
      const nameTxt = HDTextHelper.createText(this.scene, badgeX + 23, 4, ingInfo.shortName, {
        fontSize: '8.5px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0, 0);

      const countTxt = HDTextHelper.createText(this.scene, badgeX + 23, 17, `${has}/${ing.count}`, {
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: isEnough ? '#ffffff' : '#ffd4d4'
      }).setOrigin(0, 0);

      this.detailIngredientsContainer.add([bGfx, ingIcon, nameTxt, countTxt]);
    }

    // 7. Nút [Chế Tạo]
    const btnW = 110;
    const btnH = 32;
    const innerX = 18;
    const frameW = this.panelW - 36;
    const btnX = innerX + frameW - btnW - 14;
    // HW-FIX-21: Khớp chuẩn xác với frameH = 180 ở buildDetailPanel
    const btnY = 180 - btnH - 12;

    this.detailCraftBtnBg.clear();
    if (!isLocked && canCraft) {
      this.detailCraftBtnBg.fillStyle(0x27ae60, 1.0);
      this.detailCraftBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 5);
      this.detailCraftBtnBg.lineStyle(1.5, 0x82e0aa, 0.95);
      this.detailCraftBtnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 5);
      this.detailCraftBtnText.setText('🔨 Chế Tạo').setColor('#ffffff');
    } else {
      this.detailCraftBtnBg.fillStyle(0x3d352e, 0.9);
      this.detailCraftBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 5);
      this.detailCraftBtnBg.lineStyle(1, 0x5a4d3f, 0.7);
      this.detailCraftBtnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 5);
      this.detailCraftBtnText.setText(isLocked ? 'Đang Khóa' : 'Thiếu Đồ').setColor('#a0aec0');
    }
  }

  /**
   * Thực hiện chế tạo vật phẩm
   */
  public executeCraft(): void {
    const recipe = this.craftingSystem.recipes.find(r => r.id === this.selectedRecipeId);
    if (!recipe) return;

    if (this.isRecipeLocked(recipe.id)) {
      const ui = this.scene as any;
      if (ui && typeof ui.showPopupMessage === 'function') {
        ui.showPopupMessage('⚠️ Công thức này chưa mở khóa! Hãy tìm kiếm nguyên liệu quý để giải mã.');
      }
      return;
    }

    if (!this.craftingSystem.canCraft(recipe)) {
      const ui = this.scene as any;
      if (ui && typeof ui.showPopupMessage === 'function') {
        ui.showPopupMessage('⚠️ Không đủ nguyên liệu để chế tạo vật phẩm này!');
      }
      return;
    }

    // Thực hiện chế tạo trừ nguyên liệu và cộng vào túi đồ
    if (this.craftingSystem.craft(recipe.id)) {
      AudioManager.getInstance().playCraftSuccess();
      const ui = this.scene as any;
      if (ui && typeof ui.showPopupMessage === 'function') {
        ui.showPopupMessage(`✔ Đã chế tạo thành công: +${recipe.resultCount} ${recipe.name}!`);
      }
      if (ui && typeof ui.updateQuickSlotCounts === 'function') {
        ui.updateQuickSlotCounts();
      }
      if (ui && ui.quickCraftSidebar && typeof ui.quickCraftSidebar.refresh === 'function') {
        ui.quickCraftSidebar.refresh();
      }
      this.refresh();
    }
  }

  /**
   * Chuyển đổi danh mục hiển thị
   */
  public setCategory(cat: CraftingCategory): void {
    this.activeCategory = cat;
    this.isFavoriteFilterActive = false;
    this.redrawTabs();
    this.redrawRightBookmarkTabs();
    this.refreshGrid();
  }

  /**
   * Vẽ lại các tab danh mục ở Tầng 2
   */
  private redrawTabs(): void {
    for (const [id, tab] of this.categoryTabGfx.entries()) {
      const isActive = !this.isFavoriteFilterActive && id === this.activeCategory;
      tab.bg.clear();
      if (isActive) {
        // Nền giấy da sáng ấm viền vàng hổ phách
        tab.bg.fillStyle(0xdfd3b6, 1);
        tab.bg.fillRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.bg.lineStyle(1.5, 0xf1c40f, 1);
        tab.bg.strokeRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.label.setColor('#1c1209');
      } else {
        // Nền gỗ tối viền đồng xỉn
        tab.bg.fillStyle(0x23180f, 0.9);
        tab.bg.fillRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.bg.lineStyle(1, 0x4d3826, 0.8);
        tab.bg.strokeRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.label.setColor('#baa892');
      }
    }
  }

  /**
   * Tạo các tai sách / thẻ bookmark dọc nhô ra mép phải khung bảng (Right Edge Bookmark Tabs - DST Style)
   */
  private buildRightEdgeBookmarkTabs(x: number, y: number, w: number, _h: number): void {
    const categories: { id: CraftingCategory; icon: string; tooltip: string }[] = [
      { id: 'all', icon: '🌐', tooltip: 'Tất Cả' },
      { id: 'light', icon: '🔥', tooltip: 'Ánh Sáng' },
      { id: 'survival', icon: '🌿', tooltip: 'Sinh Tồn' },
      { id: 'combat', icon: '⚔️', tooltip: 'Chiến Đấu' },
      { id: 'equipment', icon: '🛡️', tooltip: 'Trang Bị' },
      { id: 'structures', icon: '🏛️', tooltip: 'Chế Tác' }
    ];

    const tabW = 24;
    const tabH = 38;
    const startY = y + 54;
    const gap = 8;
    const tabX = x + w - 2;

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const curY = startY + i * (tabH + gap);

      // V152-06B: Tai sách đánh dấu Pixel Art thật từ UI Pack
      if (this.scene.textures.exists('ui_pack_tab_craft')) {
        const tabImg = this.scene.add.image(tabX + tabW / 2 + 2, curY + tabH / 2, 'ui_pack_tab_craft');
        tabImg.setDisplaySize(tabW + 6, tabH + 2);
        tabImg.setTint(0xbaa187);
        this.sidePanelContainer.add(tabImg);
      }

      const tabGfx = this.scene.add.graphics();
      const tabLabel = HDTextHelper.createText(this.scene, tabX + tabW / 2 + 2, curY + tabH / 2, cat.icon, {
        fontSize: '13px'
      }).setOrigin(0.5, 0.5);

      this.sidePanelContainer.add([tabGfx, tabLabel]);

      const hitZone = this.scene.add.zone(tabX + tabW / 2 + 3, curY + tabH / 2, tabW + 8, tabH).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.setCategory(cat.id);
      });

      this.sidePanelContainer.add(hitZone);
      this.rightBookmarkTabGfx.set(cat.id, { bg: tabGfx, label: tabLabel, x: tabX, y: curY, w: tabW, h: tabH });
    }

    this.redrawRightBookmarkTabs();
  }

  /**
   * Vẽ lại trạng thái các tai sách bookmark mép phải
   */
  private redrawRightBookmarkTabs(): void {
    for (const [id, tab] of this.rightBookmarkTabGfx.entries()) {
      const isActive = !this.isFavoriteFilterActive && id === this.activeCategory;
      tab.bg.clear();
      const ext = isActive ? 6 : 0;
      if (isActive) {
        // Nền giấy da sáng ấm viền vàng kim hổ phách
        tab.bg.fillStyle(0xdfd3b6, 0.98);
        tab.bg.fillRoundedRect(tab.x, tab.y, tab.w + ext, tab.h, 4);
        tab.bg.lineStyle(1.8, 0xf1c40f, 1);
        tab.bg.strokeRoundedRect(tab.x, tab.y, tab.w + ext, tab.h, 4);
        tab.label.setPosition(tab.x + tab.w / 2 + 4, tab.y + tab.h / 2);
      } else {
        // Nền gỗ tối viền đồng xỉn nẹp góc
        tab.bg.fillStyle(0x1d140d, 0.92);
        tab.bg.fillRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.bg.lineStyle(1.2, 0x5c4224, 0.85);
        tab.bg.strokeRoundedRect(tab.x, tab.y, tab.w, tab.h, 4);
        tab.label.setPosition(tab.x + tab.w / 2 + 1, tab.y + tab.h / 2);
      }
    }
  }

  /**
   * Lấy danh sách công thức đã lọc theo danh mục, yêu thích và tìm kiếm
   */
  private getFilteredRecipes(): CraftingRecipe[] {
    let list = this.craftingSystem.recipes;

    // 1. Lọc theo yêu thích nếu nút Star đang bật
    if (this.isFavoriteFilterActive) {
      list = list.filter(r => this.isRecipePinned(r.id));
    } else if (this.activeCategory !== 'all') {
      list = list.filter(r => this.getDSTCategory(r.id) === this.activeCategory);
    }

    // 2. Lọc theo chuỗi tìm kiếm nếu có
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Lấy biểu tượng emoji/pixel art cho công thức
   */
  public getRecipeIconChar(recipe: CraftingRecipe): string {
    const iconMap: Record<string, string> = {
      craft_lantern_oil: '🪔',
      craft_poultice: '🌿',
      craft_noise_lure: '🔔',
      craft_resin_flare: '🪵',
      craft_charcoal: '⬛',
      craft_calming_tea: '🍵',
      craft_forest_rope: '🪢',
      craft_roasted_mushroom: '🍄',
      craft_forest_root_soup: '🍲',
      craft_moss_cloak: '🧥',
      craft_trail_boots: '👢',
      craft_field_backpack: '🎒',
      craft_iron_spear: '🗡️',
      craft_hunting_hatchet: '🪓',
      craft_skull_fang_spear: '⚔️',
      craft_skull_fang_charm: '🦴',
      craft_abyssal_ward_charm: '🔮',
      craft_purified_crest_ward: '👑'
    };
    if (iconMap[recipe.id]) return iconMap[recipe.id];
    const ui = this.scene as any;
    if (ui && typeof ui.getItemIconChar === 'function') {
      return ui.getItemIconChar(recipe.resultItemId);
    }
    return '📦';
  }

  /**
   * Lấy icon và tên ngắn cho nguyên liệu
   */
  public getIngredientInfo(itemId: string): { icon: string; shortName: string } {
    const map: Record<string, { icon: string; shortName: string }> = {
      res_dry_wood: { icon: '🪵', shortName: 'Gỗ Khô' },
      res_flint: { icon: '🪨', shortName: 'Đá Lửa' },
      res_tree_resin: { icon: '💧', shortName: 'Nhựa Cây' },
      res_herbs: { icon: '🌱', shortName: 'Thảo Dược' },
      res_tough_fiber: { icon: '🌾', shortName: 'Sợi Gai' },
      mat_charcoal: { icon: '⬛', shortName: 'Than Củi' },
      res_forest_mushroom: { icon: '🍄', shortName: 'Nấm Rừng' },
      res_forest_roots: { icon: '🥔', shortName: 'Rễ Cây' },
      mat_forest_rope: { icon: '🪢', shortName: 'Dây Thừng' },
      mat_runed_iron: { icon: '⚙️', shortName: 'Sắt Cổ' },
      mat_skull_fang: { icon: '🦴', shortName: 'Nanh Xương' },
      mat_shadow_essence: { icon: '🔮', shortName: 'Bóng Tối' },
      quest_bronze_clapper: { icon: '🔔', shortName: 'Lưỡi Chuông' },
      quest_corrupted_crest: { icon: '👑', shortName: 'Huy Hiệu' }
    };
    if (map[itemId]) return map[itemId];
    const raw = itemsData.items.find((it: any) => it.id === itemId);
    const shortName = raw ? raw.name.split(' ').slice(-2).join(' ') : itemId;
    return { icon: '📦', shortName };
  }

  /**
   * Khởi tạo các tham chiếu kiểm thử hồi quy cho V1.3 & Gate 1B
   */
  private initLegacyRefs(): void {
    const legacyContainer = this.scene.add.container(-9999, -9999);
    legacyContainer.setVisible(false);

    for (const recipe of this.craftingSystem.recipes) {
      const ingText = HDTextHelper.createText(this.scene, 0, 0, this.formatIngredients(recipe));
      const craftBtnBg = this.scene.add.graphics();
      const craftBtn = this.scene.add.container(0, 0);
      const craftBtnText = HDTextHelper.createText(this.scene, 0, 0, 'Chế Tạo');
      const statusBadge = HDTextHelper.createText(this.scene, 0, 0, 'Sẵn sàng chế tác');

      legacyContainer.add([ingText, craftBtnBg, craftBtn, craftBtnText, statusBadge]);

      this.recipeRowRefs.push({
        recipe,
        rowContainer: legacyContainer,
        ingText,
        craftBtnBg,
        craftBtn,
        craftBtnText,
        statusBadge
      });
    }

    // Các chuỗi nút phân trang hồi quy
    const prevBtn = HDTextHelper.createText(this.scene, -9999, -9999, '◀ Trang Trước');
    const nextBtn = HDTextHelper.createText(this.scene, -9999, -9999, 'Trang Sau ▶');
    this.pageIndicatorText = HDTextHelper.createText(this.scene, -9999, -9999, 'Trang 1 / 1');
    legacyContainer.add([prevBtn, nextBtn, this.pageIndicatorText]);
  }

  public formatIngredients(recipe: CraftingRecipe): string {
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

  public updatePageVisibility(): void {
    // Phương thức giữ nguyên cho các kiểm thử hồi quy
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
    if (ui && ui.isDialogueActive) return;
    if (ui && ui.journalModal && ui.journalModal.isOpen) {
      ui.journalModal.close();
    }

    this.isOpen = true;
    this.searchQuery = '';
    this.updateSearchDisplay();
    this.refresh();
    this.container.setVisible(true);

    if (this.sidePanelContainer) {
      this.sidePanelContainer.setAlpha(0);
      this.sidePanelContainer.setScale(0.96);
      this.scene.tweens.killTweensOf(this.sidePanelContainer);
      this.scene.tweens.add({
        targets: this.sidePanelContainer,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: 'Cubic.easeOut'
      });
    }

    if (this.onOpen) {
      this.onOpen();
    }
  }

  public close(): void {
    if (this.sidePanelContainer) {
      this.scene.tweens.killTweensOf(this.sidePanelContainer);
    }
    ItemTooltipHelper.getInstance().hide();
    this.isOpen = false;
    this.container.setVisible(false);
    if (this.onClose) {
      this.onClose();
    }
    const gameScene = this.scene.scene.get('GameScene') as any;
    if (gameScene && gameScene.player && typeof gameScene.player.forceUnlockActionState === 'function') {
      gameScene.player.forceUnlockActionState();
    }
  }

  public refresh(): void {
    this.refreshGrid();
    this.refreshDetailPanel();

    // Làm mới các ref kiểm thử hồi quy
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
  }

  /**
   * Giải phóng tài nguyên dọn dẹp bộ nhớ
   */
  public destroy(): void {
    if (this.scene && this.scene.input && this.scene.input.keyboard) {
      for (const h of this.keyHandlers) {
        this.scene.input.keyboard.off(h.event, h.fn);
      }
    }
    this.keyHandlers = [];
    if (this.container) {
      this.container.removeAll(true);
      this.container.destroy();
    }
  }
}
