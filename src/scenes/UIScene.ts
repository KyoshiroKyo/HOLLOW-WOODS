import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { ZoneAtmosphere } from '../types';
import { HDTextHelper } from '../utils/HDTextHelper';
import { IDialogueView } from '../systems/DialogueSystem';
import { CraftingModal } from '../ui/CraftingModal';
import { JournalModal } from '../ui/JournalModal';
import { PauseModal } from '../ui/PauseModal';

export class UIScene extends Phaser.Scene implements IDialogueView {
  private playerState!: PlayerState;

  // Đồ họa 4 thanh chỉ số pixel
  private statBarsGraphics!: Phaser.GameObjects.Graphics;
  private statIconsGraphics!: Phaser.GameObjects.Graphics;
  private lanternStatusText!: Phaser.GameObjects.Text;

  // Banner phân khu
  private zoneBannerContainer!: Phaser.GameObjects.Container;
  private zoneTitleText!: Phaser.GameObjects.Text;
  private zoneSubtitleText!: Phaser.GameObjects.Text;

  // Bảng nhiệm vụ góc trên phải
  private questBg!: Phaser.GameObjects.Graphics;
  private questHeaderText!: Phaser.GameObjects.Text;
  private questTrackerText!: Phaser.GameObjects.Text;

  // Thanh vật phẩm nhanh (Quick Slot)
  private quickSlotContainer!: Phaser.GameObjects.Container;
  private poulticeCountText!: Phaser.GameObjects.Text;
  private lureCountText!: Phaser.GameObjects.Text;

  // Lời nhắc tương tác
  private promptText!: Phaser.GameObjects.Text;

  // Khung hộp thoại chuẩn HD 1280×720 (GATE 1A - Presentation in UIScene at Zoom 1.0)
  private dialogueContainer!: Phaser.GameObjects.Container;
  private dialogueSpeakerText!: Phaser.GameObjects.Text;
  private dialogueContentText!: Phaser.GameObjects.Text;
  private dialogueContinuePrompt!: Phaser.GameObjects.Text;
  private dialoguePortraitSprite!: Phaser.GameObjects.Image;
  private dialogueAdvanceHandler?: () => void;

  // Quản lý Modal tập trung (GATE 1B & 1C - Screen Space at Zoom 1.0)
  public craftingModal!: CraftingModal;
  public journalModal!: JournalModal;
  public pauseModal!: PauseModal;

  // Bộ nhớ đệm đồ họa chỉ số (Dirty Checking Cache - GATE 3B)
  private lastHealthW: number = -1;
  private lastStaminaW: number = -1;
  private lastOilW: number = -1;
  private lastComposureW: number = -1;
  private lastLanternState: boolean | null = null;

  // Quản lý Popup duy nhất tránh tích tụ Tween (GATE 3B)
  private activePopup?: Phaser.GameObjects.Text;
  private activePopupTween?: Phaser.Tweens.Tween;

  constructor() {
    super({ key: 'UIScene' });
  }

  public create(): void {
    // Đảm bảo Camera UI luôn hiển thị ở tỉ lệ chuẩn zoom = 1.0 không bị phóng to
    this.cameras.main.setZoom(1.0);

    this.playerState = PlayerState.getInstance();

    this.statBarsGraphics = this.add.graphics();
    this.statIconsGraphics = this.add.graphics();

    // 1. Dựng 4 icon pixel cho 4 chỉ số (Góc trên trái chuẩn HD 1280×720)
    this.drawPixelIcons();

    // 2. Chữ trạng thái Đèn lồng chuẩn HD đặt cạnh thanh Dầu Đèn
    this.lanternStatusText = HDTextHelper.createText(this, 274, 57, 'ĐÈN: TẮT [F]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#95a5a6',
      stroke: '#000000',
      strokeThickness: 2
    });

    // 3. Khung bảng theo dõi nhiệm vụ góc trên phải (x: 1250, y: 24, rộng 360px, cao 84px)
    const questBoxW = 360;
    const questBoxH = 84;
    const questBoxX = 1250 - questBoxW; // 890
    const questBoxY = 24;

    this.questBg = this.add.graphics();
    this.questBg.fillStyle(0x0b0e14, 0.90);
    this.questBg.fillRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 8);
    this.questBg.lineStyle(2, 0x8a6d3b, 1);
    this.questBg.strokeRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 8);
    this.questBg.lineStyle(1, 0xd4af37, 0.6);
    this.questBg.strokeRoundedRect(questBoxX + 3, questBoxY + 3, questBoxW - 6, questBoxH - 6, 6);

    this.questHeaderText = HDTextHelper.createText(this, questBoxX + 16, questBoxY + 12, 'MỤC TIÊU HIỆN TẠI [J]:', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.questTrackerText = HDTextHelper.createText(this, questBoxX + 16, questBoxY + 34, '', {
      fontSize: '13px',
      color: '#f8f9fa',
      wordWrap: { width: questBoxW - 32 },
      lineSpacing: 5
    });

    // 4. Banner tên phân khu có nền tối chống chìm chữ (Tâm tại 640, 85)
    this.zoneBannerContainer = this.add.container(640, 85);
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x000000, 0.85);
    bannerBg.fillRoundedRect(-240, -28, 480, 56, 8);
    bannerBg.lineStyle(2, 0xd4af37, 0.9);
    bannerBg.strokeRoundedRect(-240, -28, 480, 56, 8);

    this.zoneTitleText = HDTextHelper.createText(this, 0, -10, '', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.zoneSubtitleText = HDTextHelper.createText(this, 0, 12, '', {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#bdc3c7'
    }).setOrigin(0.5, 0.5);

    this.zoneBannerContainer.add([bannerBg, this.zoneTitleText, this.zoneSubtitleText]);
    this.zoneBannerContainer.setAlpha(0);

    // 5. Thanh vật phẩm nhanh dưới đáy màn hình đặt tại (640, 685)
    this.buildQuickSlots();

    // 5b. Dựng khung hộp thoại HD 1280×720 tại (640, 590) (GATE 1A)
    this.buildDialogueUI();

    // 5c. Dựng Bàn Chế Tạo & Sổ Tay chuẩn HD 1280×720 tại UIScene Zoom 1.0 (GATE 1B)
    this.getCraftingModal();
    this.getJournalModal();

    // 6. Lời nhắc tương tác [E] chuẩn HD đặt tại (640, 630)
    this.promptText = HDTextHelper.createText(this, 640, 630, '', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f1c40f',
      backgroundColor: '#0a0d14ee',
      padding: { x: 14, y: 6 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0);

    // 7. Lắng nghe sự kiện từ PlayerState
    this.playerState.on('stats_changed', () => this.redrawStats());
    this.playerState.on('quest_changed', () => this.updateQuestTracker());
    this.playerState.on('quest_updated', () => this.updateQuestTracker());
    this.playerState.on('inventory_changed', () => this.updateQuickSlotCounts());

    // Cập nhật ban đầu
    this.redrawStats();
    this.updateQuestTracker();
    this.updateQuickSlotCounts();

    // Lắng nghe phím số 1 để dùng Thuốc Đắp
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ONE', () => {
        if (this.playerState.useItem('item_herbal_poultice')) {
          this.showPopupMessage('Đã dùng Thuốc Đắp (+40 Máu, +25 Bình Tâm)');
        }
      });
    }
  }

  private drawPixelIcons(): void {
    const g = this.statIconsGraphics;
    g.clear();

    // 1. Icon Máu: Trái tim đỏ HD (X: 16, Y: 18)
    g.fillStyle(0xe74c3c, 1);
    g.fillRect(16, 20, 18, 12);
    g.fillRect(18, 18, 5, 3);
    g.fillRect(27, 18, 5, 3);

    // 2. Icon Thể lực: Sấm sét vàng HD (X: 16, Y: 38)
    g.fillStyle(0xf1c40f, 1);
    g.fillRect(23, 37, 6, 4);
    g.fillRect(19, 41, 10, 4);
    g.fillRect(22, 45, 5, 5);

    // 3. Icon Dầu đèn: Ngọn lửa cam HD (X: 16, Y: 56)
    g.fillStyle(0xe67e22, 1);
    g.fillRect(22, 55, 6, 4);
    g.fillRect(19, 59, 12, 6);
    g.fillRect(22, 65, 6, 3);

    // 4. Icon Bình tâm: Mắt tím HD (X: 16, Y: 74)
    g.fillStyle(0x9b59b6, 1);
    g.fillRect(18, 75, 14, 9);
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(22, 77, 6, 5);
  }

  public redrawStats(): void {
    const stats = this.playerState.stats;
    const barX = 42;
    const barWidth = 220;

    const healthW = Math.round(Math.max(0, Math.min(barWidth, (stats.health / stats.maxHealth) * barWidth)));
    const staminaW = Math.round(Math.max(0, Math.min(barWidth, (stats.stamina / stats.maxStamina) * barWidth)));
    const oilW = Math.round(Math.max(0, Math.min(barWidth, (stats.lanternOil / stats.maxLanternOil) * barWidth)));
    const composureW = Math.round(Math.max(0, Math.min(barWidth, (stats.composure / stats.maxComposure) * barWidth)));

    const isBarsDirty =
      healthW !== this.lastHealthW ||
      staminaW !== this.lastStaminaW ||
      oilW !== this.lastOilW ||
      composureW !== this.lastComposureW;

    if (isBarsDirty) {
      this.lastHealthW = healthW;
      this.lastStaminaW = staminaW;
      this.lastOilW = oilW;
      this.lastComposureW = composureW;

      const g = this.statBarsGraphics;
      g.clear();

      // 1. Thanh Máu (Đỏ 3D, Cao 14px)
      this.drawThickBar(g, barX, 18, barWidth, 14, stats.health, stats.maxHealth, 0x962d22, 0xe74c3c);

      // 2. Thanh Thể Lực (Vàng 3D, Cao 11px)
      this.drawThickBar(g, barX, 37, barWidth, 11, stats.stamina, stats.maxStamina, 0xb7950b, 0xf1c40f);

      // 3. Thanh Dầu Đèn (Cam 3D, Cao 11px)
      this.drawThickBar(g, barX, 55, barWidth, 11, stats.lanternOil, stats.maxLanternOil, 0xa04000, 0xe67e22);

      // 4. Thanh Bình Tâm (Tím 3D, Cao 11px)
      this.drawThickBar(g, barX, 73, barWidth, 11, stats.composure, stats.maxComposure, 0x5b2c6f, 0x9b59b6);
    }

    // Cập nhật trạng thái chữ đèn CHỈ KHI trạng thái thay đổi
    if (this.lastLanternState !== stats.isLanternOn) {
      this.lastLanternState = stats.isLanternOn;
      if (stats.isLanternOn) {
        this.lanternStatusText.setText('ĐÈN: BẬT [F]');
        this.lanternStatusText.setColor('#f1c40f');
      } else {
        this.lanternStatusText.setText('ĐÈN: TẮT [F]');
        this.lanternStatusText.setColor('#7f8c8d');
      }
    }
  }

  private drawThickBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, val: number, max: number, darkColor: number, lightColor: number): void {
    // Nền rãnh thanh chuẩn HD
    g.fillStyle(0x0e1118, 0.95);
    g.fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 3);
    g.lineStyle(1, 0x3d4a5d, 0.9);
    g.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 3);

    const fillW = Math.max(0, Math.min(w, (val / max) * w));
    if (fillW > 0) {
      // Thân thanh
      g.fillStyle(darkColor, 1);
      g.fillRoundedRect(x, y, fillW, h, 2);
      // Ánh sáng nổi 3D ở mép trên
      g.fillStyle(lightColor, 0.9);
      g.fillRect(x + 1, y, fillW - 2, Math.max(2, Math.floor(h * 0.35)));
    }
  }

  private buildQuickSlots(): void {
    // Đặt Thanh Phím Tắt Đáy tại (x: 640, y: 685) với khoảng cách nút thoáng đãng chuẩn HD
    this.quickSlotContainer = this.add.container(640, 685);

    const slotNames = [
      { key: '[1] Thuốc Đắp', id: 'poultice' },
      { key: '[Q] Mồi Ném', id: 'lure' },
      { key: '[F] Đèn Lồng', id: 'lantern' },
      { key: '[I] Chế Tạo', id: 'craft' },
      { key: '[J] Sổ Tay', id: 'journal' },
      { key: '[ESC] Tạm Dừng', id: 'pause' }
    ];

    let startX = -320;
    const btnW = 116;
    const btnH = 32;

    for (const slot of slotNames) {
      const g = this.add.graphics();
      g.fillStyle(0x0b0e14, 0.90);
      g.fillRoundedRect(startX - btnW / 2, -btnH / 2, btnW, btnH, 6);
      g.lineStyle(1, 0x4a5568, 0.85);
      g.strokeRoundedRect(startX - btnW / 2, -btnH / 2, btnW, btnH, 6);

      const label = HDTextHelper.createText(this, startX, 0, slot.key, {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ecf0f1'
      }).setOrigin(0.5, 0.5);

      this.quickSlotContainer.add([g, label]);

      // Vùng bấm chuột cho từng nút phím tắt
      const hitZone = this.add.zone(startX, 0, btnW, btnH).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        if (slot.id === 'craft') {
          this.toggleCrafting();
        } else if (slot.id === 'journal') {
          this.toggleJournal();
        } else if (slot.id === 'pause') {
          this.togglePause();
        } else if (slot.id === 'poultice') {
          if (this.playerState.useItem('item_herbal_poultice')) {
            this.showPopupMessage('Đã dùng Thuốc Đắp (+40 Máu, +25 Bình Tâm)');
          }
        }
      });
      this.quickSlotContainer.add(hitZone);

      if (slot.id === 'poultice') {
        this.poulticeCountText = HDTextHelper.createText(this, startX + btnW / 2 - 8, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#2ecc71',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add(this.poulticeCountText);
      } else if (slot.id === 'lure') {
        this.lureCountText = HDTextHelper.createText(this, startX + btnW / 2 - 8, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#e67e22',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add(this.lureCountText);
      }

      startX += 128;
    }
  }

  public updateQuickSlotCounts(): void {
    const poulticeCount = this.playerState.getItemCount('item_herbal_poultice');
    const lureCount = this.playerState.getItemCount('item_noise_lure');

    if (this.poulticeCountText) this.poulticeCountText.setText(`x${poulticeCount}`);
    if (this.lureCountText) this.lureCountText.setText(`x${lureCount}`);
  }

  public updateQuestTracker(): void {
    const q = this.playerState.getCurrentQuest();
    if (q) {
      const activeTask = q.tasks.find(t => !t.done);
      const taskStr = activeTask ? activeTask.text : 'Đã hoàn thành phân đoạn này';
      this.questTrackerText.setText(`${q.title}\n▶ ${taskStr}`);
    }
  }

  public showZoneBanner(atmosphere: ZoneAtmosphere): void {
    this.zoneTitleText.setText(atmosphere.titleVietnamese);
    this.zoneSubtitleText.setText(atmosphere.subTitleVietnamese);

    this.tweens.killTweensOf(this.zoneBannerContainer);
    this.zoneBannerContainer.setAlpha(0);

    this.tweens.add({
      targets: this.zoneBannerContainer,
      alpha: 1,
      duration: 600,
      hold: 2500,
      yoyo: true,
      ease: 'Power2'
    });
  }

  public setInteractionPrompt(prompt: string | null): void {
    if (prompt) {
      this.promptText.setText(prompt);
      this.promptText.setAlpha(1);
    } else {
      this.promptText.setAlpha(0);
    }
  }

  /**
   * Ẩn/Hiện thanh phím tắt và nhãn tương tác khi hộp thoại hoặc Modal mở/đóng (PASS T13, GATE 1B)
   */
  public setDialogueActive(active: boolean): void {
    if (this.quickSlotContainer) {
      // Chỉ hiện lại quickSlotContainer khi KHÔNG còn bất kỳ modal nào mở
      const shouldShow = !active && !this.isAnyModalOpen;
      this.quickSlotContainer.setVisible(shouldShow);
    }
    if (active || this.isAnyModalOpen) {
      this.setInteractionPrompt(null);
    }
  }

  public get isDialogueActive(): boolean {
    return !!(this.dialogueContainer && this.dialogueContainer.visible);
  }

  public get isAnyModalOpen(): boolean {
    return this.isDialogueActive ||
      (!!this.craftingModal && this.craftingModal.isOpen) ||
      (!!this.journalModal && this.journalModal.isOpen) ||
      (!!this.pauseModal && this.pauseModal.isOpen);
  }

  /**
   * Ẩn/Hiện toàn bộ các thành phần HUD (Stat bars, Icons, Lantern status, Quest Tracker, Quickslots, Prompt)
   * Sử dụng khi chạy Cutscene kết thúc (Ending Finale) để chống đè và chống chìm hình ảnh (GATE 3C)
   */
  public setHUDVisible(visible: boolean): void {
    if (this.statBarsGraphics) this.statBarsGraphics.setVisible(visible);
    if (this.statIconsGraphics) this.statIconsGraphics.setVisible(visible);
    if (this.lanternStatusText) this.lanternStatusText.setVisible(visible);
    if (this.questBg) this.questBg.setVisible(visible);
    if (this.questHeaderText) this.questHeaderText.setVisible(visible);
    if (this.questTrackerText) this.questTrackerText.setVisible(visible);
    if (this.quickSlotContainer) this.quickSlotContainer.setVisible(visible);
    if (this.promptText) this.promptText.setVisible(visible);
    if (this.zoneBannerContainer) this.zoneBannerContainer.setVisible(visible);
    if (this.activePopup) this.activePopup.setVisible(visible);
  }

  public handleModalOpened(): void {
    this.setDialogueActive(true);
  }

  public handleModalClosed(): void {
    if (!this.isAnyModalOpen) {
      this.setDialogueActive(false);
    }
  }

  public toggleCrafting(): void {
    if (this.isDialogueActive) return;
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
    }
    if (this.craftingModal) {
      this.craftingModal.toggle();
    }
  }

  public toggleJournal(): void {
    if (this.isDialogueActive) return;
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
    }
    if (this.journalModal) {
      this.journalModal.toggle();
    }
  }

  public togglePause(): void {
    if (this.isDialogueActive) return;
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
      return;
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
      return;
    }
    if (this.pauseModal) {
      this.pauseModal.toggle();
    }
  }

  public getCraftingModal(): CraftingModal {
    if (!this.craftingModal) {
      this.craftingModal = new CraftingModal(this);
      this.craftingModal.onOpen = () => this.handleModalOpened();
      this.craftingModal.onClose = () => this.handleModalClosed();
    }
    return this.craftingModal;
  }

  public getJournalModal(): JournalModal {
    if (!this.journalModal) {
      this.journalModal = new JournalModal(this);
      this.journalModal.onOpen = () => this.handleModalOpened();
      this.journalModal.onClose = () => this.handleModalClosed();
    }
    return this.journalModal;
  }

  public showPopupMessage(msg: string): void {
    if (this.activePopupTween) {
      this.activePopupTween.stop();
      this.activePopupTween = undefined;
    }
    if (this.activePopup) {
      this.activePopup.destroy();
      this.activePopup = undefined;
    }

    const popup = HDTextHelper.createText(this, 640, 140, msg, {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#2ecc71',
      backgroundColor: '#0b0e14ee',
      padding: { x: 16, y: 8 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(10000);

    this.activePopup = popup;

    this.activePopupTween = this.tweens.add({
      targets: popup,
      y: 110,
      alpha: 0,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => {
        if (this.activePopup === popup) {
          this.activePopup = undefined;
          this.activePopupTween = undefined;
        }
        popup.destroy();
      }
    });
  }

  /**
   * Dựng khung hộp thoại chuẩn HD 1280×720 đặt tại (640, 590) kích thước 1060×185 px (GATE 1A)
   */
  private buildDialogueUI(): void {
    if (this.dialogueContainer) return;

    const boxWidth = 1060;
    const boxHeight = 185;
    const halfW = boxWidth / 2;
    const halfH = boxHeight / 2;

    this.dialogueContainer = this.add.container(640, 590);
    this.dialogueContainer.setDepth(9000);

    // Nền hộp thoại màu đá đen trung cổ viền vàng mộc sang trọng
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0e14, 0.96);
    bg.fillRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);
    bg.lineStyle(2, 0xd4af37, 1);
    bg.strokeRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);

    // Viền lót bên trong tăng chiều sâu mỹ thuật
    bg.lineStyle(1, 0x4a3b22, 0.7);
    bg.strokeRoundedRect(-halfW + 4, -halfH + 4, boxWidth - 8, boxHeight - 8, 8);

    // Hỗ trợ click chuột trực tiếp lên hộp thoại để tiếp tục
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-halfW, -halfH, boxWidth, boxHeight),
      Phaser.Geom.Rectangle.Contains
    );
    if (bg.input) {
      bg.input.cursor = 'pointer';
    }
    bg.on('pointerdown', () => {
      if (this.dialogueAdvanceHandler) {
        this.dialogueAdvanceHandler();
      }
    });

    // Khung chân dung bên trái (140×140 px, căn giữa theo trục Y: -70 đến +70)
    const portraitBg = this.add.graphics();
    portraitBg.fillStyle(0x151b24, 1);
    portraitBg.fillRoundedRect(-halfW + 24, -70, 140, 140, 8);
    portraitBg.lineStyle(2, 0xb8860b, 1);
    portraitBg.strokeRoundedRect(-halfW + 24, -70, 140, 140, 8);

    // Chân dung người nói (Tâm tại x = -halfW + 94, y = 0, kích thước hiển thị 124×124 px)
    this.dialoguePortraitSprite = this.add.image(-halfW + 94, 0, 'satyr_portrait');
    this.dialoguePortraitSprite.setDisplaySize(124, 124);

    // Tên người nói chuẩn HD Tiếng Việt (Cỡ 24px)
    this.dialogueSpeakerText = HDTextHelper.createText(this, -halfW + 184, -halfH + 20, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Nội dung câu thoại chuẩn HD Tiếng Việt (Cỡ đúng chuẩn 20px, wrap 845 px)
    this.dialogueContentText = HDTextHelper.createText(this, -halfW + 184, -halfH + 60, '', {
      fontSize: '20px',
      color: '#f8f9fa',
      wordWrap: { width: boxWidth - 215 },
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 1
    });

    // Lời nhắc tiếp tục chuẩn HD Tiếng Việt
    this.dialogueContinuePrompt = HDTextHelper.createText(this, halfW - 25, halfH - 25, '▶ [E / SPACE]', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#bdc3c7'
    }).setOrigin(1, 0.5);

    this.dialogueContainer.add([
      bg,
      portraitBg,
      this.dialoguePortraitSprite,
      this.dialogueSpeakerText,
      this.dialogueContentText,
      this.dialogueContinuePrompt
    ]);

    this.dialogueContainer.setVisible(false);

    // Hiệu ứng nhấp nháy chữ Tiếp tục
    this.tweens.add({
      targets: this.dialogueContinuePrompt,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  public showDialogue(speaker: string, portraitKey: string): void {
    if (!this.dialogueContainer) {
      this.buildDialogueUI();
    }

    if (this.dialogueSpeakerText) {
      this.dialogueSpeakerText.setText(speaker);
    }

    if (this.dialoguePortraitSprite) {
      let key = portraitKey;
      if (!key || !this.textures.exists(key)) {
        if (speaker.includes('Edda')) key = 'portrait_edda';
        else if (speaker.includes('Garth')) key = 'portrait_garth';
        else if (speaker.includes('Neris')) key = 'portrait_neris';
        else key = 'satyr_portrait';
      }
      if (this.textures.exists(key)) {
        this.dialoguePortraitSprite.setTexture(key);
        this.dialoguePortraitSprite.setDisplaySize(124, 124);
        this.dialoguePortraitSprite.setVisible(true);
      } else {
        this.dialoguePortraitSprite.setVisible(false);
      }
    }

    if (this.dialogueContentText) {
      this.dialogueContentText.setText('');
    }

    this.setDialogueActive(true);
    if (this.dialogueContainer) {
      this.dialogueContainer.setVisible(true);
    }
  }

  public updateDialogueText(text: string): void {
    if (this.dialogueContentText) {
      this.dialogueContentText.setText(text);
    }
  }

  public hideDialogue(): void {
    if (this.dialogueContainer) {
      this.dialogueContainer.setVisible(false);
    }
    this.setDialogueActive(false);
  }

  public setAdvanceHandler(handler: () => void): void {
    this.dialogueAdvanceHandler = handler;
  }
}
