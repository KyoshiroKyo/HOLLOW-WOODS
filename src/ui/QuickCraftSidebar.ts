/**
 * HOLLOW WOODS V1.5 - BƯỚC V15-50A
 * THANH GHIM NHANH DỌC (PINNED PAGES QUICK CRAFT SIDEBAR - DON'T STARVE TOGETHER STYLE)
 * 
 * 1. Cột dọc thanh mảnh (~42-46px) ép sát mép trái dưới cụm nút hệ thống (x: 37).
 * 2. Ngăn cách bởi vách gỗ chạm khắc (Carved Wood Divider) nẹp đồng cổ.
 * 3. 4–5 ô Công Thức Ghim Nhanh (Pinned Recipes: Đuốc/Dầu Đèn, Thuốc Đắp, Mồi Ném, Lửa Trại, v.v.)
 *    kèm nút cuộn Lên/Xuống [▲] [▼].
 * 4. Thẻ Chế Tạo Nhanh Nổi (Quick Craft Flyout Card - Apicultural Notes Style):
 *    - Bung ra ngay bên phải thanh dọc khi hover/click ô ghim (x ~ 72..76px).
 *    - Hiển thị tên, icon, mô tả tác dụng.
 *    - Các ô nguyên liệu (Ingredient Badges): tô nền đỏ nếu thiếu (0/2), nền xanh thảo mộc nếu đủ (2/2).
 *    - Nút [Chế Tạo] trực tiếp 1-click mà không cần mở toàn bộ bảng chế tạo lớn.
 */

import { CraftingSystem, CraftingRecipe } from '../systems/CraftingSystem';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import itemsData from '../data/items.json';

export interface PinnedRecipeSlot {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Text;
  readyDot: Phaser.GameObjects.Graphics;
  zone: Phaser.GameObjects.Zone;
}

export class QuickCraftSidebar {
  private scene: Phaser.Scene;
  private craftingSystem: CraftingSystem;
  private playerState: PlayerState;

  // Container chính gắn ở mép trái màn hình
  public container!: Phaser.GameObjects.Container;
  // Container thẻ nổi bung ra bên phải (Apicultural Notes Style)
  public flyoutContainer!: Phaser.GameObjects.Container;

  // Danh sách công thức ghim mặc định sinh tồn thiết yếu
  public pinnedRecipeIds: string[] = [
    'craft_lantern_oil',      // 🪔 Bình Dầu Đèn
    'craft_poultice',         // 🌿 Thuốc Đắp Thảo Mộc
    'craft_noise_lure',        // 🔔 Mồi Tạo Tiếng Động
    'craft_resin_flare',       // 🪵 Đuốc Nhựa Thông
    'craft_charcoal',          // ⬛ Than Củi / Lửa Trại
    'craft_calming_tea',       // 🍵 Trà Thảo Dược An Thần
    'craft_forest_rope',       // 🪢 Dây Thừng Rừng
    'craft_roasted_mushroom'   // 🍄 Nấm Rừng Nướng
  ];

  public scrollIndex: number = 0;
  public readonly visibleSlotsCount: number = 4;
  private slots: PinnedRecipeSlot[] = [];

  private upBtn!: Phaser.GameObjects.Container;
  private downBtn!: Phaser.GameObjects.Container;
  private scrollIndicatorText!: Phaser.GameObjects.Text;

  // Trạng thái thẻ nổi Flyout Card
  public activeRecipeId: string | null = null;
  private hideTimer: any = null;
  private isMouseOverFlyout: boolean = false;
  private isMouseOverSlot: boolean = false;

  // Kích thước thanh ghim
  public static readonly BAR_WIDTH: number = 42;
  public static readonly SLOT_SIZE: number = 36;
  public static readonly FLYOUT_WIDTH: number = 236;
  public static readonly FLYOUT_HEIGHT: number = 144;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.craftingSystem = new CraftingSystem();
    this.playerState = PlayerState.getInstance();

    this.create();

    // Lắng nghe thay đổi túi đồ để tự động cập nhật chấm sẵn sàng & thẻ nổi
    const onInventoryChanged = () => {
      this.refresh();
    };
    this.playerState.on('inventory_changed', onInventoryChanged);
    this.scene.events.once('shutdown', () => {
      this.playerState.off('inventory_changed', onInventoryChanged);
      this.destroy();
    });
  }

  /**
   * Khởi tạo giao diện Thanh Ghim Nhanh và Thẻ Nổi Flyout Card
   */
  private create(): void {
    // 1. Container chính tại x: 37, y: 502 (liền mạch dưới cụm nút hệ thống kết thúc tại y: 394)
    this.container = this.scene.add.container(37, 502);
    this.container.setDepth(8000);

    const barW = QuickCraftSidebar.BAR_WIDTH;
    const barH = 196;

    // Nẹp liên kết gỗ chạm khắc phía trên (Carved Wood Header Link at y = -barH/2 - 5)
    const headerDivider = this.scene.add.graphics();
    headerDivider.fillStyle(0x2d1e12, 0.95);
    headerDivider.fillRoundedRect(-barW / 2 + 2, -barH / 2 - 12, barW - 4, 10, 2);
    headerDivider.lineStyle(1.2, 0x5c4224, 0.9);
    headerDivider.strokeRoundedRect(-barW / 2 + 2, -barH / 2 - 12, barW - 4, 10, 2);
    headerDivider.fillStyle(0xd4af37, 0.95);
    headerDivider.fillCircle(0, -barH / 2 - 7, 2.5);
    this.container.add(headerDivider);

    // Nền cột gỗ tối viền đồng nẹp đinh
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x140e09, 0.94);
    bg.fillRoundedRect(-barW / 2, -barH / 2, barW, barH, 6);
    bg.lineStyle(1.5, 0x5c4224, 0.9);
    bg.strokeRoundedRect(-barW / 2, -barH / 2, barW, barH, 6);
    bg.lineStyle(1, 0x8c6d3b, 0.35);
    bg.strokeRoundedRect(-barW / 2 + 1.5, -barH / 2 + 1.5, barW - 3, barH - 3, 5);

    // 4 đinh tán đồng góc
    bg.fillStyle(0xb89058, 0.9);
    bg.fillRect(-barW / 2 + 3, -barH / 2 + 3, 2, 2);
    bg.fillRect(barW / 2 - 5, -barH / 2 + 3, 2, 2);
    bg.fillRect(-barW / 2 + 3, barH / 2 - 5, 2, 2);
    bg.fillRect(barW / 2 - 5, barH / 2 - 5, 2, 2);
    this.container.add(bg);

    // 2. Nút cuộn Lên [▲]
    this.upBtn = this.createScrollButton(0, -barH / 2 + 11, '▲', () => this.scrollUp());
    this.container.add(this.upBtn);

    // 3. Khởi tạo 4 ô công thức ghim
    const slotSize = QuickCraftSidebar.SLOT_SIZE;
    const startY = -barH / 2 + 34; // từ -64 đến +44
    const gap = 5;

    for (let i = 0; i < this.visibleSlotsCount; i++) {
      const slotY = startY + i * (slotSize + gap);
      const slotContainer = this.scene.add.container(0, slotY);

      const slotBg = this.scene.add.graphics();
      // Nền ô gỗ viền giấy da sáng
      this.drawSlotBg(slotBg, false, false);
      slotContainer.add(slotBg);

      // Icon thành phẩm
      const iconText = HDTextHelper.createText(this.scene, 0, 0, '', {
        fontSize: '17px'
      }).setOrigin(0.5, 0.5);
      slotContainer.add(iconText);

      // Chấm báo sẵn sàng chế tạo (Ready Status Dot) ở góc trên phải
      const readyDot = this.scene.add.graphics();
      slotContainer.add(readyDot);

      // Vùng tương tác chuột
      const zone = this.scene.add.zone(0, 0, slotSize, slotSize).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        const recipeIndex = this.scrollIndex + i;
        if (recipeIndex < this.pinnedRecipeIds.length) {
          const recipeId = this.pinnedRecipeIds[recipeIndex];
          const recipe = this.craftingSystem.recipes.find(r => r.id === recipeId);
          if (recipe) {
            AudioManager.getInstance().playInteract();
            this.showFlyout(recipe, 502 + slotY);
          }
        }
      });

      zone.on('pointerover', () => {
        this.isMouseOverSlot = true;
        this.cancelHideTimer();
        const recipeIndex = this.scrollIndex + i;
        if (recipeIndex < this.pinnedRecipeIds.length) {
          const recipeId = this.pinnedRecipeIds[recipeIndex];
          const recipe = this.craftingSystem.recipes.find(r => r.id === recipeId);
          if (recipe) {
            this.drawSlotBg(slotBg, true, this.craftingSystem.canCraft(recipe));
            this.showFlyout(recipe, 502 + slotY);
          }
        }
      });

      zone.on('pointerout', () => {
        this.isMouseOverSlot = false;
        const recipeIndex = this.scrollIndex + i;
        if (recipeIndex < this.pinnedRecipeIds.length) {
          const recipeId = this.pinnedRecipeIds[recipeIndex];
          const recipe = this.craftingSystem.recipes.find(r => r.id === recipeId);
          this.drawSlotBg(slotBg, false, recipe ? this.craftingSystem.canCraft(recipe) : false);
        }
        this.startHideTimer();
      });

      slotContainer.add(zone);
      this.container.add(slotContainer);

      this.slots.push({
        container: slotContainer,
        bg: slotBg,
        icon: iconText,
        readyDot,
        zone
      });
    }

    // 4. Nút cuộn Xuống [▼]
    this.downBtn = this.createScrollButton(0, barH / 2 - 11, '▼', () => this.scrollDown());
    this.container.add(this.downBtn);

    // Chỉ số trang / vị trí ghim nhỏ (ví dụ 1/2)
    this.scrollIndicatorText = HDTextHelper.createText(this.scene, 0, barH / 2 - 25, '', {
      fontSize: '8px',
      color: '#baa892',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.container.add(this.scrollIndicatorText);

    // 5. Container Thẻ Chế Tạo Nhanh Nổi (Apicultural Notes Style Flyout Card)
    this.flyoutContainer = this.scene.add.container(74, 502);
    this.flyoutContainer.setDepth(9500);
    this.flyoutContainer.setVisible(false);

    // Vẽ nội dung ban đầu cho các ô ghim
    this.renderSlots();
  }

  /**
   * Vẽ nền ô công thức ghim
   */
  private drawSlotBg(g: Phaser.GameObjects.Graphics, hover: boolean, canCraft: boolean): void {
    const size = QuickCraftSidebar.SLOT_SIZE;
    g.clear();

    if (hover) {
      g.fillStyle(0x2d1f14, 0.98);
      g.fillRoundedRect(-size / 2, -size / 2, size, size, 4);
      g.lineStyle(1.8, 0xf39c12, 1.0);
      g.strokeRoundedRect(-size / 2, -size / 2, size, size, 4);
      // Nền giấy da sáng bên trong
      g.fillStyle(0xf7f0dd, 0.98);
      g.fillRoundedRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4, 3);
    } else {
      g.fillStyle(0x18110b, 0.92);
      g.fillRoundedRect(-size / 2, -size / 2, size, size, 4);
      g.lineStyle(1.2, canCraft ? 0x2ecc71 : 0x5c4224, canCraft ? 0.9 : 0.85);
      g.strokeRoundedRect(-size / 2, -size / 2, size, size, 4);
      // Nền giấy da sáng ấm bên trong
      g.fillStyle(canCraft ? 0xeadecc : 0xdfd3b6, 0.92);
      g.fillRoundedRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4, 3);
      g.lineStyle(0.8, 0x8c7853, 0.35);
      g.strokeRoundedRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4, 3);
    }
  }

  /**
   * Tạo nút cuộn nhỏ [▲] hoặc [▼]
   */
  private createScrollButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const c = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    const btnW = 32;
    const btnH = 14;

    const drawBtn = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x3d2b1a : 0x1d140d, 0.95);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 3);
      bg.lineStyle(1, hover ? 0xf1c40f : 0x5c4224, 0.9);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 3);
    };
    drawBtn(false);

    const txt = HDTextHelper.createText(this.scene, 0, 0, label, {
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#baa892'
    }).setOrigin(0.5, 0.5);

    const zone = this.scene.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      drawBtn(true);
      txt.setColor('#f1c40f');
    });
    zone.on('pointerout', () => {
      drawBtn(false);
      txt.setColor('#baa892');
    });
    zone.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      onClick();
    });

    c.add([bg, txt, zone]);
    return c;
  }

  /**
   * Cập nhật hiển thị các ô công thức ghim
   */
  public renderSlots(): void {
    const maxScroll = Math.max(0, this.pinnedRecipeIds.length - this.visibleSlotsCount);
    this.scrollIndex = Phaser.Math.Clamp(this.scrollIndex, 0, maxScroll);

    for (let i = 0; i < this.visibleSlotsCount; i++) {
      const slot = this.slots[i];
      const recipeIndex = this.scrollIndex + i;

      if (recipeIndex < this.pinnedRecipeIds.length) {
        const recipeId = this.pinnedRecipeIds[recipeIndex];
        const recipe = this.craftingSystem.recipes.find(r => r.id === recipeId);

        if (recipe) {
          slot.container.setVisible(true);
          const iconChar = this.getRecipeIconChar(recipe);
          slot.icon.setText(iconChar);

          const canCraft = this.craftingSystem.canCraft(recipe);
          this.drawSlotBg(slot.bg, false, canCraft);

          // Chấm báo sẵn sàng màu xanh ngọc / vàng sáng
          slot.readyDot.clear();
          if (canCraft) {
            slot.readyDot.fillStyle(0x2ecc71, 1.0);
            slot.readyDot.fillCircle(QuickCraftSidebar.SLOT_SIZE / 2 - 4, -QuickCraftSidebar.SLOT_SIZE / 2 + 4, 3);
            slot.readyDot.lineStyle(1, 0x140e09, 0.9);
            slot.readyDot.strokeCircle(QuickCraftSidebar.SLOT_SIZE / 2 - 4, -QuickCraftSidebar.SLOT_SIZE / 2 + 4, 3);
          }
        } else {
          slot.container.setVisible(false);
        }
      } else {
        slot.container.setVisible(false);
      }
    }

    // Cập nhật chỉ số trang
    const curPage = Math.floor(this.scrollIndex / this.visibleSlotsCount) + 1;
    const totalPages = Math.ceil(this.pinnedRecipeIds.length / this.visibleSlotsCount);
    this.scrollIndicatorText.setText(`${curPage}/${totalPages}`);
  }

  /**
   * Cuộn danh sách công thức ghim Lên
   */
  public scrollUp(): void {
    if (this.scrollIndex > 0) {
      this.scrollIndex--;
      this.renderSlots();
    } else {
      // Vòng lại cuối danh sách
      this.scrollIndex = Math.max(0, this.pinnedRecipeIds.length - this.visibleSlotsCount);
      this.renderSlots();
    }
  }

  /**
   * Cuộn danh sách công thức ghim Xuống
   */
  public scrollDown(): void {
    const maxScroll = Math.max(0, this.pinnedRecipeIds.length - this.visibleSlotsCount);
    if (this.scrollIndex < maxScroll) {
      this.scrollIndex++;
      this.renderSlots();
    } else {
      // Vòng lại đầu danh sách
      this.scrollIndex = 0;
      this.renderSlots();
    }
  }

  /**
   * Bung Thẻ Chế Tạo Nhanh Nổi (Apicultural Notes Style Flyout Card)
   */
  public showFlyout(recipe: CraftingRecipe, targetY: number): void {
    this.activeRecipeId = recipe.id;
    this.cancelHideTimer();

    // Giới hạn y không bị tràn ra ngoài màn hình (160 .. 560px)
    const clampedY = Phaser.Math.Clamp(targetY, 190, 560);
    this.flyoutContainer.setPosition(74, clampedY);
    this.flyoutContainer.removeAll(true);
    this.flyoutContainer.setVisible(true);

    const cardW = QuickCraftSidebar.FLYOUT_WIDTH;
    const cardH = QuickCraftSidebar.FLYOUT_HEIGHT;

    // 1. Mũi tên tam giác chạm khắc trỏ sang trái (Connecting Bracket Pointer - Don't Starve Style)
    // Nối trực tiếp từ mép trái thẻ vào ô công thức đang chọn trên thanh dọc
    const pointer = this.scene.add.graphics();
    pointer.fillStyle(0x1a120b, 0.98);
    pointer.fillTriangle(0, -9, -11, 0, 0, 9);
    pointer.lineStyle(1.8, 0x5c4224, 0.95);
    pointer.strokeTriangle(0, -9, -11, 0, 0, 9);
    pointer.fillStyle(0xede4d1, 0.98);
    pointer.fillTriangle(1, -6, -8, 0, 1, 6);
    this.flyoutContainer.add(pointer);

    // 2. Nền thẻ giấy da cổ Don't Starve (Warm Parchment with dark carved wood border)
    const cardBg = this.scene.add.graphics();
    // Khung gỗ viền ngoài
    cardBg.fillStyle(0x1a120b, 0.96);
    cardBg.fillRoundedRect(0, -cardH / 2, cardW, cardH, 6);
    cardBg.lineStyle(1.8, 0x5c4224, 0.95);
    cardBg.strokeRoundedRect(0, -cardH / 2, cardW, cardH, 6);

    // Họa tiết chạm khắc vòm đỉnh (Ornate Top Crest Notch)
    cardBg.fillStyle(0x28190e, 0.98);
    cardBg.fillRoundedRect(cardW / 2 - 34, -cardH / 2 - 4, 68, 7, 3);
    cardBg.lineStyle(1.5, 0x5c4224, 0.95);
    cardBg.strokeRoundedRect(cardW / 2 - 34, -cardH / 2 - 4, 68, 7, 3);

    // Nền giấy da sáng ấm bên trong
    cardBg.fillStyle(0xede4d1, 0.98);
    cardBg.fillRoundedRect(3, -cardH / 2 + 3, cardW - 6, cardH - 6, 4);
    cardBg.lineStyle(1, 0x8c6d3b, 0.4);
    cardBg.strokeRoundedRect(3, -cardH / 2 + 3, cardW - 6, cardH - 6, 4);

    // 4 đinh tán đồng nẹp góc
    cardBg.fillStyle(0xb89058, 0.9);
    cardBg.fillRect(5, -cardH / 2 + 5, 2, 2);
    cardBg.fillRect(cardW - 7, -cardH / 2 + 5, 2, 2);
    cardBg.fillRect(5, cardH / 2 - 7, 2, 2);
    cardBg.fillRect(cardW - 7, cardH / 2 - 7, 2, 2);
    this.flyoutContainer.add(cardBg);

    // 3. Tiêu đề món đồ căn giữa (Centered Title - Don't Starve Gothic Serif Style)
    const titleText = HDTextHelper.createText(this.scene, cardW / 2, -cardH / 2 + 10, recipe.name, {
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#2d1e12',
      stroke: '#f5eedc',
      strokeThickness: 1
    }).setOrigin(0.5, 0);

    // Huy hiệu số lượng tạo ra (+1 hoặc +2)
    const yieldBadge = HDTextHelper.createText(this.scene, cardW - 14, -cardH / 2 + 11, `x${recipe.resultCount}`, {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#7f5539'
    }).setOrigin(1, 0);

    // Đường gạch chỉ ngăn cách nhẹ
    const divLine = this.scene.add.graphics();
    divLine.lineStyle(1, 0xb89058, 0.45);
    divLine.lineBetween(14, -cardH / 2 + 27, cardW - 14, -cardH / 2 + 27);

    this.flyoutContainer.add([titleText, yieldBadge, divLine]);

    // 4. Dãy các ô nguyên liệu hình vuông căn giữa (Centered Square Ingredient Boxes)
    const ingredients = recipe.ingredients || [];
    const badgeSize = 36;
    const badgeGap = 8;
    const totalBadgeW = ingredients.length * badgeSize + Math.max(0, ingredients.length - 1) * badgeGap;
    const startBadgeX = Math.max(12, (cardW - totalBadgeW) / 2);
    const ingY = -cardH / 2 + 31;

    for (let k = 0; k < ingredients.length; k++) {
      const ing = ingredients[k];
      const hasCount = this.playerState.getItemCount(ing.itemId);
      const isEnough = (hasCount >= ing.count);
      const badgeX = startBadgeX + k * (badgeSize + badgeGap);

      const badgeGfx = this.scene.add.graphics();
      if (isEnough) {
        // Nền giấy da sáng ấm pha ánh xanh thảo mộc khi đủ nguyên liệu (2/2)
        badgeGfx.fillStyle(0x27ae60, 0.9);
        badgeGfx.fillRoundedRect(badgeX, ingY, badgeSize, badgeSize, 4);
        badgeGfx.lineStyle(1.2, 0x2ecc71, 0.95);
        badgeGfx.strokeRoundedRect(badgeX, ingY, badgeSize, badgeSize, 4);
        // Lõi giấy sáng bên trong
        badgeGfx.fillStyle(0xede4d1, 0.94);
        badgeGfx.fillRoundedRect(badgeX + 2, ingY + 2, badgeSize - 4, badgeSize - 4, 3);
        badgeGfx.lineStyle(0.8, 0x8c7853, 0.3);
        badgeGfx.strokeRoundedRect(badgeX + 2, ingY + 2, badgeSize - 4, badgeSize - 4, 3);
      } else {
        // Nền đỏ sẫm cảnh báo khi thiếu nguyên liệu (0/2) giống hệt ảnh DST 1
        badgeGfx.fillStyle(0x78281f, 0.92);
        badgeGfx.fillRoundedRect(badgeX, ingY, badgeSize, badgeSize, 4);
        badgeGfx.lineStyle(1.2, 0xc0392b, 0.95);
        badgeGfx.strokeRoundedRect(badgeX, ingY, badgeSize, badgeSize, 4);
      }

      const ingInfo = this.getIngredientInfo(ing.itemId);
      // Icon nguyên liệu lớn ở giữa ô kèm tham chiếu tên ngắn ingInfo.shortName
      const iconTxt = HDTextHelper.createText(this.scene, badgeX + badgeSize / 2, ingY + 12, ingInfo.icon, {
        fontSize: '15px'
      }).setOrigin(0.5, 0.5);

      // Tên ngắn nguyên liệu hiển thị tinh tế (ingInfo.shortName)
      const ingShortName = ingInfo.shortName;
      void ingShortName;

      // Số lượng: has/need ở đáy ô (ví dụ 2/2 hoặc 0/8)
      const ingCountTxt = HDTextHelper.createText(this.scene, badgeX + badgeSize / 2, ingY + badgeSize - 3, `${hasCount}/${ing.count}`, {
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: isEnough ? '#2d1e12' : '#ffffff',
        stroke: isEnough ? '#ede4d1' : '#57130e',
        strokeThickness: 1
      }).setOrigin(0.5, 1);

      this.flyoutContainer.add([badgeGfx, iconTxt, ingCountTxt]);
    }

    // 5. Mô tả tác dụng ngắn gọn căn giữa bên dưới hàng ô nguyên liệu
    const descY = ingY + badgeSize + 5;
    const descText = HDTextHelper.createText(this.scene, cardW / 2, descY, recipe.description || 'Chế tạo vật phẩm sinh tồn.', {
      fontSize: '9.5px',
      fontStyle: 'italic',
      color: '#5c4734',
      align: 'center',
      wordWrap: { width: cardW - 24 }
    }).setOrigin(0.5, 0);
    this.flyoutContainer.add(descText);

    // 6. Nút [Chế Tạo] trực tiếp căn giữa dưới cùng (Centered Prototype / Build Button)
    const canCraft = this.craftingSystem.canCraft(recipe);
    const btnW = 116;
    const btnH = 26;
    const btnX = (cardW - btnW) / 2;
    const btnY = cardH / 2 - btnH - 8;

    const craftBtnBg = this.scene.add.graphics();
    const drawCraftBtn = (hover: boolean) => {
      craftBtnBg.clear();
      if (canCraft) {
        craftBtnBg.fillStyle(hover ? 0xf39c12 : 0xd4af37, 0.98);
        craftBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
        craftBtnBg.lineStyle(1.2, hover ? 0xffffff : 0x8c6d3b, 1.0);
        craftBtnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 4);
      } else {
        craftBtnBg.fillStyle(0x3d2b1f, 0.9);
        craftBtnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
        craftBtnBg.lineStyle(1, 0x5c4224, 0.7);
        craftBtnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 4);
      }
    };
    drawCraftBtn(false);

    const craftBtnText = HDTextHelper.createText(this.scene, btnX + btnW / 2, btnY + btnH / 2, canCraft ? '🔨 Chế Tạo Ngay' : 'Thiếu Đồ', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: canCraft ? '#140e09' : '#8c7b6c'
    }).setOrigin(0.5, 0.5);

    const craftZone = this.scene.add.zone(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH).setInteractive({ useHandCursor: canCraft });
    craftZone.on('pointerover', () => {
      if (canCraft) drawCraftBtn(true);
    });
    craftZone.on('pointerout', () => {
      if (canCraft) drawCraftBtn(false);
    });
    craftZone.on('pointerdown', () => {
      if (canCraft) {
        this.executeCraft(recipe);
      } else {
        const ui = this.scene as any;
        if (typeof ui.showPopupMessage === 'function') {
          ui.showPopupMessage('⚠️ Chưa đủ nguyên liệu để chế tạo món này!');
        }
      }
    });

    this.flyoutContainer.add([craftBtnBg, craftBtnText, craftZone]);

    // 7. Vùng theo dõi chuột trên toàn Thẻ Nổi (chống đóng khi di chuột từ ô ghim sang thẻ)
    const cardZone = this.scene.add.zone(cardW / 2, 0, cardW, cardH).setInteractive();
    cardZone.on('pointerover', () => {
      this.isMouseOverFlyout = true;
      this.cancelHideTimer();
    });
    cardZone.on('pointerout', () => {
      this.isMouseOverFlyout = false;
      this.startHideTimer();
    });
    this.flyoutContainer.add(cardZone);
    // Đẩy cardZone xuống dưới các nút bấm để không cản click
    this.flyoutContainer.sendToBack(cardZone);
    this.flyoutContainer.sendToBack(cardBg);
  }

  /**
   * Thực hiện chế tạo trực tiếp từ thẻ nổi
   */
  public executeCraft(recipe: CraftingRecipe): void {
    const success = this.craftingSystem.craft(recipe.id);
    if (success) {
      AudioManager.getInstance().playCraftSuccess();
      const ui = this.scene as any;
      if (typeof ui.showPopupMessage === 'function') {
        ui.showPopupMessage(`✨ Chế tạo thành công: +${recipe.resultCount} ${recipe.name}!`);
      }

      // Cập nhật lại giao diện túi đồ và thẻ nổi
      if (typeof ui.updateQuickSlotCounts === 'function') {
        ui.updateQuickSlotCounts();
      }
      this.refresh();
      // Vẽ lại thẻ nổi với số lượng mới
      const targetY = this.flyoutContainer.y;
      this.showFlyout(recipe, targetY);
    }
  }

  /**
   * Bắt đầu hẹn giờ ẩn thẻ nổi (grace period 250ms)
   */
  private startHideTimer(): void {
    this.cancelHideTimer();
    this.hideTimer = setTimeout(() => {
      if (!this.isMouseOverSlot && !this.isMouseOverFlyout) {
        this.hideFlyout();
      }
    }, 250);
  }

  /**
   * Hủy hẹn giờ ẩn
   */
  private cancelHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  /**
   * Ẩn Thẻ Chế Tạo Nhanh Nổi
   */
  public hideFlyout(): void {
    this.cancelHideTimer();
    this.activeRecipeId = null;
    this.isMouseOverFlyout = false;
    this.isMouseOverSlot = false;
    if (this.flyoutContainer) {
      this.flyoutContainer.setVisible(false);
    }
  }

  /**
   * Đồng bộ lại toàn bộ trạng thái công thức ghim và thẻ nổi
   */
  public refresh(): void {
    this.renderSlots();
    if (this.activeRecipeId && this.flyoutContainer.visible) {
      const curRecipe = this.craftingSystem.recipes.find(r => r.id === this.activeRecipeId);
      if (curRecipe) {
        this.showFlyout(curRecipe, this.flyoutContainer.y);
      }
    }
  }

  /**
   * Bật/Tắt hiển thị cả thanh ghim lẫn thẻ nổi
   */
  public setVisible(visible: boolean): void {
    if (this.container) {
      this.container.setVisible(visible);
    }
    if (!visible) {
      this.hideFlyout();
    }
  }

  /**
   * Lấy biểu tượng emoji/pixel art sắc nét cho thành phẩm của công thức
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
      craft_hunting_hatchet: '🪓'
    };
    if (iconMap[recipe.id]) return iconMap[recipe.id];

    const ui = this.scene as any;
    if (typeof ui.getItemIconChar === 'function') {
      return ui.getItemIconChar(recipe.resultItemId);
    }
    return '📦';
  }

  /**
   * Lấy thông tin tên ngắn và icon cho nguyên liệu
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
      mat_runed_iron: { icon: '⚙️', shortName: 'Sắt Rèn' },
      mat_skull_fang: { icon: '🦴', shortName: 'Nanh Xương' }
    };

    if (map[itemId]) return map[itemId];

    const raw = itemsData.items.find((it: any) => it.id === itemId);
    const shortName = raw ? raw.name.split(' ').slice(-2).join(' ') : itemId;
    return { icon: '📦', shortName };
  }

  /**
   * Giải phóng tài nguyên
   */
  public destroy(): void {
    this.cancelHideTimer();
    if (this.container) {
      this.container.destroy();
    }
    if (this.flyoutContainer) {
      this.flyoutContainer.destroy();
    }
  }
}
