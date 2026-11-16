import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { ZoneAtmosphere } from '../types';
import { HDTextHelper } from '../utils/HDTextHelper';
import { IDialogueView } from '../systems/DialogueSystem';
import { CraftingModal } from '../ui/CraftingModal';
import { JournalModal } from '../ui/JournalModal';
import { PauseModal } from '../ui/PauseModal';
import { GameOverModal } from '../ui/GameOverModal';
import { AudioManager } from '../audio/AudioManager';
import { HUDIconGenerator, HUD_ICON_HEALTH, HUD_ICON_STAMINA, HUD_ICON_OIL, HUD_ICON_COMPOSURE } from '../utils/HUDIconGenerator';

export interface QuickSlotRef {
  id: string;
  key: string;
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  x: number;
}

export class UIScene extends Phaser.Scene implements IDialogueView {
  private playerState!: PlayerState;

  // Khung nền chỉ số sinh tồn bán trong suốt (C4-13-07)
  private statCardBg!: Phaser.GameObjects.Graphics;

  // Tiêu đề nhân vật góc trên trái
  private playerNameText!: Phaser.GameObjects.Text;

  // Đồ họa 4 thanh chỉ số pixel và nhãn số lượng
  private statBarsGraphics!: Phaser.GameObjects.Graphics;
  private statIconsGraphics!: Phaser.GameObjects.Graphics;
  private statIconImages: Phaser.GameObjects.Image[] = [];
  private healthValText!: Phaser.GameObjects.Text;
  private staminaValText!: Phaser.GameObjects.Text;
  private oilValText!: Phaser.GameObjects.Text;
  private composureValText!: Phaser.GameObjects.Text;
  private lanternStatusBg!: Phaser.GameObjects.Graphics;
  private lanternStatusText!: Phaser.GameObjects.Text;

  // Banner phân khu
  private zoneBannerContainer!: Phaser.GameObjects.Container;
  private zoneTitleText!: Phaser.GameObjects.Text;
  private zoneSubtitleText!: Phaser.GameObjects.Text;
  // C4-13-19: Bộ đệm thời gian chống nháy banner phân khu
  private lastBannerShownTime: number = 0;
  private lastBannerZoneTitle: string = '';

  // Bảng nhiệm vụ góc trên phải
  private questBg!: Phaser.GameObjects.Graphics;
  private questHeaderText!: Phaser.GameObjects.Text;
  private questTitleText!: Phaser.GameObjects.Text;
  private questTrackerText!: Phaser.GameObjects.Text;

  // Thanh vật phẩm nhanh (Quick Slot)
  private quickSlotContainer!: Phaser.GameObjects.Container;
  private quickSlotRefs: QuickSlotRef[] = [];
  public selectedQuickSlotIndex: number = 0;
  private slotHighlightGraphics!: Phaser.GameObjects.Graphics;
  private poulticeCountBadge?: Phaser.GameObjects.Graphics;
  private poulticeCountText!: Phaser.GameObjects.Text;
  private oilCountBadge?: Phaser.GameObjects.Graphics;
  private oilCountText!: Phaser.GameObjects.Text;
  private lureCountBadge?: Phaser.GameObjects.Graphics;
  private lureCountText!: Phaser.GameObjects.Text;

  // Lời nhắc tương tác bán trong suốt (C4-13-07)
  private promptContainer!: Phaser.GameObjects.Container;
  private promptBg!: Phaser.GameObjects.Graphics;
  private promptText!: Phaser.GameObjects.Text;
  private promptWorldTarget: { x: number; y: number } | null = null;

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
  public gameOverModal!: GameOverModal;

  // Bộ nhớ đệm đồ họa chỉ số (Dirty Checking Cache - GATE 3B)
  private lastHealthW: number = -1;
  private lastStaminaW: number = -1;
  private lastOilW: number = -1;
  private lastComposureW: number = -1;
  private lastLanternState: boolean | null = null;

  // C4-13-09: Bộ nhớ đệm kiểm tra thay đổi nhãn văn bản (Text Canvas Dirty Checking)
  private lastCurH: number = -1;
  private lastMaxH: number = -1;
  private lastCurS: number = -1;
  private lastMaxS: number = -1;
  private lastCurO: number = -1;
  private lastMaxO: number = -1;
  private lastCurC: number = -1;
  private lastMaxC: number = -1;
  private lastQuestTitle: string = '';
  private lastQuestTaskText: string = '';
  private lastPoulticeCount: number = -1;
  private lastOilCount: number = -1;
  private lastLureCount: number = -1;

  // C4-13-09: Bộ nhớ đệm kiểm tra thay đổi lời nhắc tương tác (Interaction Prompt Dirty Checking)
  private lastPromptText: string | null = null;
  private lastPromptAlpha: number = -1;

  // Quản lý Popup duy nhất tránh tích tụ Tween và cấp phát rác (GATE 3B, C4-13-09)
  private activePopup?: Phaser.GameObjects.Text;
  private activePopupTween?: Phaser.Tweens.Tween;
  private pooledPopupText?: Phaser.GameObjects.Text;
  private lastPoulticeTime: number = 0;
  private lastOilTime: number = 0;

  // C4-13-18: Hiệu ứng viền tối/đỏ hoảng loạn khi cạn kiệt Bình Tâm
  private panicVignetteGraphics!: Phaser.GameObjects.Graphics;
  private isPanicVignetteActive: boolean = false;
  private lastPanicWarningTime: number = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  public create(): void {
    // Đảm bảo Camera UI luôn hiển thị ở tỉ lệ chuẩn zoom = 1.0 không bị phóng to
    this.cameras.main.setZoom(1.0);

    this.playerState = PlayerState.getInstance();

    // C4-13-18: Hiệu ứng viền tối/đỏ hoảng loạn khi Bình Tâm cạn kiệt (depth: 900)
    this.panicVignetteGraphics = this.add.graphics();
    this.panicVignetteGraphics.setDepth(900);
    this.panicVignetteGraphics.setScrollFactor(0);

    // 1. Khung chứa 4 thanh chỉ số sinh tồn tinh gọn, bán trong suốt (C4-13-07)
    this.statCardBg = this.add.graphics();
    this.statCardBg.fillStyle(0x080d14, 0.72);
    this.statCardBg.fillRoundedRect(12, 8, 308, 92, 6);
    this.statCardBg.lineStyle(1, 0x2c3e50, 0.6);
    this.statCardBg.strokeRoundedRect(12, 8, 308, 92, 6);

    // Tên nhân vật chính hiển thị góc trên trái
    this.playerNameText = HDTextHelper.createText(this, 22, 12, '🌲 The Mossbound Wayfarer', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.statBarsGraphics = this.add.graphics();
    this.statIconsGraphics = this.add.graphics();

    // 1b. Dựng 4 icon pixel cho 4 chỉ số (Góc trên trái chuẩn HD 1280×720)
    this.drawPixelIcons();

    // 1c. Bổ sung các nhãn số liệu rõ nét cho 4 thanh chỉ số sinh tồn
    this.healthValText = HDTextHelper.createText(this, 194, 31, 'Sinh Lực: 100/100', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#ff7675',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.staminaValText = HDTextHelper.createText(this, 194, 47, 'Thể Lực: 80/80', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#feca57',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.oilValText = HDTextHelper.createText(this, 194, 63, 'Dầu Đèn: 60/60', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#ff9f43',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.composureValText = HDTextHelper.createText(this, 194, 79, 'Bình Tâm: 40/40', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#a29bfe',
      stroke: '#000000',
      strokeThickness: 2
    });

    // 2. Chữ trạng thái Đèn lồng chuẩn HD đặt cạnh thanh Dầu Đèn với nền badge bán trong suốt
    this.lanternStatusBg = this.add.graphics();
    this.lanternStatusText = HDTextHelper.createText(this, 280, 68, 'ĐÈN: TẮT [F]', {
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: '#95a5a6',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // 3. Khung bảng theo dõi nhiệm vụ góc trên phải bán trong suốt (C4-13-07)
    const questBoxW = 340;
    const questBoxH = 78;
    const questBoxX = 1260 - questBoxW; // 920
    const questBoxY = 16;

    this.questBg = this.add.graphics();
    this.questBg.fillStyle(0x080d14, 0.75);
    this.questBg.fillRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 6);
    this.questBg.lineStyle(1, 0xd4af37, 0.6);
    this.questBg.strokeRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 6);
    // Vạch nhấn vàng kim dọc mép trái
    this.questBg.fillStyle(0xd4af37, 0.4);
    this.questBg.fillRect(questBoxX, questBoxY + 4, 3, questBoxH - 8);

    this.questHeaderText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 8, '📜 NHIỆM VỤ HIỆN TẠI [J]:', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.questTitleText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 26, '', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.questTrackerText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 45, '', {
      fontSize: '11.5px',
      color: '#ecf0f1',
      wordWrap: { width: questBoxW - 24 },
      lineSpacing: 2,
      stroke: '#000000',
      strokeThickness: 1
    });

    // 4. Banner tên phân khu có nền tối chống chìm chữ (Tâm tại 640, 85)
    this.zoneBannerContainer = this.add.container(640, 85);
    this.zoneBannerContainer.setDepth(8500);
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

    // 5. Thanh vật phẩm nhanh dưới đáy màn hình đặt tại (640, 684)
    this.buildQuickSlots();

    // 5b. Dựng khung hộp thoại HD 1280×720 tại (640, 590) (GATE 1A)
    this.buildDialogueUI();

    // 5c. Dựng Bàn Chế Tạo & Sổ Tay chuẩn HD 1280×720 tại UIScene Zoom 1.0 (GATE 1B)
    this.getCraftingModal();
    this.getJournalModal();

    // 6. Lời nhắc tương tác [E] chuẩn HD bán trong suốt (C4-13-07)
    this.promptContainer = this.add.container(640, 616);
    this.promptContainer.setDepth(8200);
    this.promptContainer.setAlpha(0);

    this.promptBg = this.add.graphics();
    this.promptContainer.add(this.promptBg);

    this.promptText = HDTextHelper.createText(this, 0, 0, '', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);
    this.promptContainer.add(this.promptText);

    // 7. Lắng nghe sự kiện từ PlayerState (dọn dẹp listener khi tắt scene để chống rò rỉ)
    const onStatsChanged = () => this.redrawStats();
    const onQuestChanged = () => {
      this.updateQuestTracker();
      AudioManager.getInstance().playQuestUpdate();
    };
    const onQuestUpdated = () => {
      this.updateQuestTracker();
      AudioManager.getInstance().playQuestUpdate();
    };
    const onInventoryChanged = () => this.updateQuickSlotCounts();

    this.playerState.on('stats_changed', onStatsChanged);
    this.playerState.on('quest_changed', onQuestChanged);
    this.playerState.on('quest_updated', onQuestUpdated);
    this.playerState.on('inventory_changed', onInventoryChanged);

    this.events.once('shutdown', () => {
      this.playerState.off('stats_changed', onStatsChanged);
      this.playerState.off('quest_changed', onQuestChanged);
      this.playerState.off('quest_updated', onQuestUpdated);
      this.playerState.off('inventory_changed', onInventoryChanged);
      // C4-13-09: Dọn dẹp triệt để tweens, timer events và keyboard listeners khi tắt/chuyển scene
      this.tweens.killAll();
      this.time.removeAllEvents();
      if (this.input && this.input.keyboard) {
        this.input.keyboard.removeAllListeners();
      }
      if (this.craftingModal) this.craftingModal.destroy();
      if (this.journalModal) this.journalModal.destroy();
      if (this.pauseModal) this.pauseModal.destroy();
      if (this.gameOverModal) this.gameOverModal.destroy();
      if (this.pooledPopupText) this.pooledPopupText.destroy();
      if (this.panicVignetteGraphics) this.panicVignetteGraphics.clear();
    });

    // Cập nhật ban đầu
    this.redrawStats();
    this.updateQuestTracker();
    this.updateQuickSlotCounts();

    // Lắng nghe phím số [1]..[2], [Q], [F], [I], [J], [ESC] để chọn ô và thực thi nhanh
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ONE', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(0);
        this.tryConsumePoultice();
      });
      this.input.keyboard.on('keydown-TWO', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(1);
        this.tryConsumeLanternOil();
      });
      this.input.keyboard.on('keydown-Q', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(2);
      });
      this.input.keyboard.on('keydown-F', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(3);
      });
      this.input.keyboard.on('keydown-I', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(4);
      });
      this.input.keyboard.on('keydown-J', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(5);
      });
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(6);
      });
    }
  }

  private drawPixelIcons(): void {
    // C4-13-15: Đảm bảo 4 texture Pixel Art 16×16 px chuẩn Nearest-Neighbor đã được tạo
    HUDIconGenerator.generateAllHUDIcons(this);

    // Vẽ trực tiếp 4 biểu tượng Pixel Art sắc nét có viền tối và điểm sáng phản quang lên Graphics
    HUDIconGenerator.drawIconsToGraphics(this.statIconsGraphics, 18, [28, 44, 60, 76]);

    // Khởi tạo/cập nhật 4 Sprite Image độc lập từ các Texture Pixel Art 16×16 px
    if (this.statIconImages.length === 0) {
      const heartIcon = this.add.image(26, 36, HUD_ICON_HEALTH).setDisplaySize(16, 16).setOrigin(0.5, 0.5);
      const staminaIcon = this.add.image(26, 52, HUD_ICON_STAMINA).setDisplaySize(16, 16).setOrigin(0.5, 0.5);
      const oilIcon = this.add.image(26, 68, HUD_ICON_OIL).setDisplaySize(16, 16).setOrigin(0.5, 0.5);
      const composureIcon = this.add.image(26, 84, HUD_ICON_COMPOSURE).setDisplaySize(16, 16).setOrigin(0.5, 0.5);

      this.statIconImages = [heartIcon, staminaIcon, oilIcon, composureIcon];
    }
  }

  public redrawStats(): void {
    const stats = this.playerState.stats;
    const barX = 38;
    const barWidth = 145;

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

      // 1. Thanh Máu (Đỏ 3D, Cao 10px)
      this.drawThickBar(g, barX, 31, barWidth, 10, stats.health, stats.maxHealth, 0x962d22, 0xe74c3c);

      // 2. Thanh Thể Lực (Vàng 3D, Cao 9px)
      this.drawThickBar(g, barX, 47, barWidth, 9, stats.stamina, stats.maxStamina, 0xb7950b, 0xf1c40f);

      // 3. Thanh Dầu Đèn (Cam 3D, Cao 9px)
      this.drawThickBar(g, barX, 63, barWidth, 9, stats.lanternOil, stats.maxLanternOil, 0xa04000, 0xe67e22);

      // 4. Thanh Bình Tâm (Tím 3D, Cao 9px)
      this.drawThickBar(g, barX, 79, barWidth, 9, stats.composure, stats.maxComposure, 0x5b2c6f, 0x9b59b6);
    }

    // C4-13-09: Tối ưu Dirty-Checking cho các chỉ số HUD - chỉ set text và màu khi giá trị số thay đổi
    const curH = Math.round(stats.health);
    const maxH = Math.round(stats.maxHealth);
    if (this.healthValText && (this.lastCurH !== curH || this.lastMaxH !== maxH)) {
      this.lastCurH = curH;
      this.lastMaxH = maxH;
      this.healthValText.setText(`Sinh Lực: ${curH}/${maxH}`);
      this.healthValText.setColor(curH <= maxH * 0.3 ? '#ff4757' : '#ff7675');
    }

    const curS = Math.round(stats.stamina);
    const maxS = Math.round(stats.maxStamina);
    if (this.staminaValText && (this.lastCurS !== curS || this.lastMaxS !== maxS)) {
      this.lastCurS = curS;
      this.lastMaxS = maxS;
      this.staminaValText.setText(`Thể Lực: ${curS}/${maxS}`);
    }

    const curO = Math.round(stats.lanternOil);
    const maxO = Math.round(stats.maxLanternOil);
    if (this.oilValText && (this.lastCurO !== curO || this.lastMaxO !== maxO)) {
      this.lastCurO = curO;
      this.lastMaxO = maxO;
      this.oilValText.setText(`Dầu Đèn: ${curO}/${maxO}`);
      this.oilValText.setColor(curO <= maxO * 0.2 ? '#e74c3c' : '#ff9f43');
    }

    const curC = Math.round(stats.composure);
    const maxC = Math.round(stats.maxComposure);
    if (this.composureValText && (this.lastCurC !== curC || this.lastMaxC !== maxC)) {
      this.lastCurC = curC;
      this.lastMaxC = maxC;
      this.composureValText.setText(`Bình Tâm: ${curC}/${maxC}`);
      this.composureValText.setColor(curC <= 0 ? '#ff3838' : curC <= maxC * 0.3 ? '#fd79a8' : '#a29bfe');
    }

    // Cập nhật trạng thái đèn lồng
    if (this.lastLanternState !== stats.isLanternOn) {
      this.lastLanternState = stats.isLanternOn;
      if (this.lanternStatusBg && this.lanternStatusText) {
        this.lanternStatusBg.clear();
        if (stats.isLanternOn) {
          this.lanternStatusBg.fillStyle(0x3d2800, 0.85);
          this.lanternStatusBg.fillRoundedRect(252, 59, 58, 18, 4);
          this.lanternStatusBg.lineStyle(1, 0xf39c12, 0.9);
          this.lanternStatusBg.strokeRoundedRect(252, 59, 58, 18, 4);
          this.lanternStatusText.setText('🔥 [F] BẬT');
          this.lanternStatusText.setColor('#f1c40f');
        } else {
          this.lanternStatusBg.fillStyle(0x0e1118, 0.75);
          this.lanternStatusBg.fillRoundedRect(252, 59, 58, 18, 4);
          this.lanternStatusBg.lineStyle(1, 0x4a5568, 0.7);
          this.lanternStatusBg.strokeRoundedRect(252, 59, 58, 18, 4);
          this.lanternStatusText.setText('[F] TẮT');
          this.lanternStatusText.setColor('#7f8c8d');
        }
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
    // Đặt Thanh Phím Tắt Đáy tại (x: 640, y: 684) cân đối chuẩn HD 1280×720 với depth 8000
    this.quickSlotContainer = this.add.container(640, 684);
    this.quickSlotContainer.setDepth(8000);
    this.slotHighlightGraphics = this.add.graphics();
    this.quickSlotContainer.add(this.slotHighlightGraphics);

    const slotNames = [
      { key: '[1] Thuốc Đắp', id: 'poultice' },
      { key: '[2] Dầu Đèn', id: 'oil' },
      { key: '[Q] Mồi Ném', id: 'lure' },
      { key: '[F] Đèn Lồng', id: 'lantern' },
      { key: '[I] Chế Tạo', id: 'craft' },
      { key: '[J] Sổ Tay', id: 'journal' },
      { key: '[ESC] Tạm Dừng', id: 'pause' }
    ];

    let startX = -348;
    const btnW = 108;
    const btnH = 34;

    this.quickSlotRefs = [];

    for (let i = 0; i < slotNames.length; i++) {
      const slot = slotNames[i];
      const slotX = startX;

      const g = this.add.graphics();
      g.fillStyle(0x090e15, 0.78);
      g.fillRoundedRect(slotX - btnW / 2, -btnH / 2, btnW, btnH, 6);
      g.lineStyle(1, 0x3d4a5d, 0.7);
      g.strokeRoundedRect(slotX - btnW / 2, -btnH / 2, btnW, btnH, 6);

      const label = HDTextHelper.createText(this, slotX, 0, slot.key, {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ecf0f1'
      }).setOrigin(0.5, 0.5);

      this.quickSlotContainer.add([g, label]);

      const slotRef: QuickSlotRef = {
        id: slot.id,
        key: slot.key,
        bg: g,
        label,
        x: slotX
      };
      this.quickSlotRefs.push(slotRef);

      // Vùng bấm chuột cho từng nút phím tắt
      const hitZone = this.add.zone(slotX, 0, btnW, btnH).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        this.selectQuickSlot(i);
        if (slot.id === 'craft') {
          this.toggleCrafting();
        } else if (slot.id === 'journal') {
          this.toggleJournal();
        } else if (slot.id === 'pause') {
          this.togglePause();
        } else if (slot.id === 'poultice') {
          this.tryConsumePoultice();
        } else if (slot.id === 'oil') {
          this.tryConsumeLanternOil();
        } else if (slot.id === 'lantern') {
          this.events.emit('ui_toggle_lantern');
        } else if (slot.id === 'lure') {
          this.events.emit('ui_throw_lure');
        }
      });
      this.quickSlotContainer.add(hitZone);

      if (slot.id === 'poultice') {
        this.poulticeCountBadge = this.add.graphics();
        this.poulticeCountText = HDTextHelper.createText(this, slotX + btnW / 2 - 6, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#2ecc71',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add([this.poulticeCountBadge, this.poulticeCountText]);
      } else if (slot.id === 'oil') {
        this.oilCountBadge = this.add.graphics();
        this.oilCountText = HDTextHelper.createText(this, slotX + btnW / 2 - 6, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#f39c12',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add([this.oilCountBadge, this.oilCountText]);
      } else if (slot.id === 'lure') {
        this.lureCountBadge = this.add.graphics();
        this.lureCountText = HDTextHelper.createText(this, slotX + btnW / 2 - 6, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#e67e22',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add([this.lureCountBadge, this.lureCountText]);
      }

      startX += 116;
    }

    this.redrawQuickSlotHighlights();
  }

  public selectQuickSlot(index: number): void {
    if (index < 0 || index >= this.quickSlotRefs.length) return;
    this.selectedQuickSlotIndex = index;
    this.redrawQuickSlotHighlights();
  }

  public redrawQuickSlotHighlights(): void {
    if (!this.slotHighlightGraphics || this.quickSlotRefs.length === 0) return;
    const g = this.slotHighlightGraphics;
    g.clear();
    const activeSlot = this.quickSlotRefs[this.selectedQuickSlotIndex];
    if (!activeSlot) return;

    const btnW = 108;
    const btnH = 34;
    const x = activeSlot.x;

    // Viền kép vàng hổ phách nổi bật ô đang được chọn
    g.lineStyle(2, 0xf1c40f, 1);
    g.strokeRoundedRect(x - btnW / 2 - 2, -btnH / 2 - 2, btnW + 4, btnH + 4, 7);
    g.lineStyle(1, 0xffffff, 0.7);
    g.strokeRoundedRect(x - btnW / 2, -btnH / 2, btnW, btnH, 6);

    // Ánh sáng nổi hổ phách mờ
    g.fillStyle(0xf39c12, 0.18);
    g.fillRoundedRect(x - btnW / 2, -btnH / 2, btnW, btnH, 6);
  }

  public update(time: number = 0, _delta: number = 0): void {
    if (this.promptWorldTarget && this.promptContainer && this.promptContainer.alpha > 0) {
      this.updatePromptPosition();
    }
    this.updatePanicVignette(time);
  }

  /**
   * C4-13-18: Cập nhật hiệu ứng viền tối/rung nhấp nháy hoảng loạn khi Bình Tâm < 20 và chạm 0/100
   */
  private updatePanicVignette(time: number = 0): void {
    if (!this.panicVignetteGraphics || !this.playerState) return;

    const composure = this.playerState.stats.composure;
    if (composure >= 20) {
      if (this.isPanicVignetteActive) {
        this.panicVignetteGraphics.clear();
        this.isPanicVignetteActive = false;
      }
      return;
    }

    this.isPanicVignetteActive = true;
    this.panicVignetteGraphics.clear();

    const isDepleted = composure <= 0;
    const freq = isDepleted ? 0.007 : 0.0035;
    const baseAlpha = isDepleted ? 0.38 : 0.16;
    const pulse = baseAlpha + (isDepleted ? 0.20 : 0.10) * Math.sin(time * freq);

    const w = 1280;
    const h = 720;
    const thick = isDepleted ? 52 : 30;

    // Viền đen/tím/đỏ thẫm rung nhấp nháy ở 4 góc màn hình
    const color = isDepleted ? 0x3d0b16 : 0x24112e;
    this.panicVignetteGraphics.fillStyle(color, Math.max(0.06, pulse));
    this.panicVignetteGraphics.fillRect(0, 0, w, thick);
    this.panicVignetteGraphics.fillRect(0, h - thick, w, thick);
    this.panicVignetteGraphics.fillRect(0, thick, thick, h - thick * 2);
    this.panicVignetteGraphics.fillRect(w - thick, thick, thick, h - thick * 2);

    // Cảnh báo HUD khi chạm đáy 0/100 (định kỳ mỗi 8 giây)
    if (isDepleted) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - this.lastPanicWarningTime > 8000) {
        this.lastPanicWarningTime = now;
        this.showPopupMessage('⚠️ Hoảng loạn (Bình Tâm 0/100)! Hãy bật Đèn Lồng [F] hoặc tìm ánh lửa!');
      }
    }
  }

  private updatePromptPosition(): void {
    if (!this.promptWorldTarget || !this.promptContainer) return;
    const gameScene = this.scene.get('GameScene') as any;
    if (gameScene && gameScene.cameras && gameScene.cameras.main) {
      const cam = gameScene.cameras.main;
      const sx = (this.promptWorldTarget.x - cam.worldView.x) * cam.zoom;
      const sy = (this.promptWorldTarget.y - cam.worldView.y) * cam.zoom - 36;
      // C4-12-30: Khoảng cách an toàn tránh mép màn hình, thanh chỉ số HUD trên cùng và Quickslots đáy
      this.promptContainer.setPosition(
        Phaser.Math.Clamp(sx, 180, 1100),
        Phaser.Math.Clamp(sy, 60, 620)
      );
      if (this.promptText) {
        this.promptText.setPosition(0, 0);
      }
    }
  }

  public tryConsumePoultice(): boolean {
    const now = performance.now();
    if (now - this.lastPoulticeTime < 250) return false;
    this.lastPoulticeTime = now;

    if (this.playerState.getItemCount('item_herbal_poultice') <= 0) {
      this.showPopupMessage('⚠️ Chưa có Thuốc Đắp Thảo Mộc! Hãy giã thêm bằng [Phím I].');
      return false;
    }
    // C4-12-04: Kiểm tra nếu Máu và Bình Tâm đã đầy 100% thì không tiêu hao lãng phí
    if (
      this.playerState.stats.health >= this.playerState.stats.maxHealth &&
      this.playerState.stats.composure >= this.playerState.stats.maxComposure
    ) {
      this.showPopupMessage('💚 Máu và Bình Tâm đã đầy (100%), không cần dùng Thuốc Đắp!');
      return false;
    }
    if (this.playerState.useItem('item_herbal_poultice')) {
      this.showPopupMessage('✔ Đã dùng Thuốc Đắp (+40 Máu, +25 Bình Tâm)');
      const gameScene = this.scene.get('GameScene') as any;
      if (gameScene && gameScene.player && typeof gameScene.player.playUseItem === 'function') {
        gameScene.player.playUseItem();
      }
      return true;
    }
    return false;
  }

  public tryConsumeLanternOil(): boolean {
    const now = performance.now();
    if (now - this.lastOilTime < 250) return false;
    this.lastOilTime = now;

    if (this.playerState.getItemCount('item_lantern_oil') <= 0) {
      this.showPopupMessage('⚠️ Chưa có Bình Dầu Đèn! Hãy chế tạo bằng [Phím I] hoặc tại Bàn Chế Tạo.');
      return false;
    }
    // C4-12-04: Kiểm tra nếu Dầu Đèn đã đầy 100% thì không tiêu hao lãng phí
    if (this.playerState.stats.lanternOil >= this.playerState.stats.maxLanternOil) {
      this.showPopupMessage('🔥 Bình dầu đèn đã đầy (100%), không cần nạp thêm!');
      return false;
    }
    if (this.playerState.useItem('item_lantern_oil')) {
      const nowOil = Math.round(this.playerState.stats.lanternOil);
      this.showPopupMessage(`✔ Đã nạp Bình Dầu Đèn (+50 Dầu • Hiện tại: ${nowOil}%)`);
      const gameScene = this.scene.get('GameScene') as any;
      if (gameScene && gameScene.player && typeof gameScene.player.playUseItem === 'function') {
        gameScene.player.playUseItem();
      }
      return true;
    }
    return false;
  }

  public updateQuickSlotCounts(): void {
    const poulticeCount = this.playerState.getItemCount('item_herbal_poultice');
    const oilCount = this.playerState.getItemCount('item_lantern_oil');
    const lureCount = this.playerState.getItemCount('item_noise_lure');

    if (this.poulticeCountText && this.lastPoulticeCount !== poulticeCount) {
      this.lastPoulticeCount = poulticeCount;
      this.poulticeCountText.setText(`x${poulticeCount}`);
      this.poulticeCountText.setColor(poulticeCount > 0 ? '#2ecc71' : '#7f8c8d');
    }
    if (this.oilCountText && this.lastOilCount !== oilCount) {
      this.lastOilCount = oilCount;
      this.oilCountText.setText(`x${oilCount}`);
      this.oilCountText.setColor(oilCount > 0 ? '#f39c12' : '#7f8c8d');
    }
    if (this.lureCountText && this.lastLureCount !== lureCount) {
      this.lastLureCount = lureCount;
      this.lureCountText.setText(`x${lureCount}`);
      this.lureCountText.setColor(lureCount > 0 ? '#e67e22' : '#7f8c8d');
    }
  }

  public updateQuestTracker(): void {
    const q = this.playerState.getCurrentQuest();
    if (q) {
      if (this.questTitleText && this.lastQuestTitle !== q.title) {
        this.lastQuestTitle = q.title;
        this.questTitleText.setText(q.title);
      }
      const activeTask = q.tasks.find(t => !t.done);
      if (this.questTrackerText) {
        const taskText = activeTask ? `☐ ${activeTask.text}` : '✔ Phân đoạn đã xong. Mở Sổ Tay [J].';
        const taskColor = activeTask ? '#ecf0f1' : '#2ecc71';
        if (this.lastQuestTaskText !== taskText) {
          this.lastQuestTaskText = taskText;
          this.questTrackerText.setText(taskText);
          this.questTrackerText.setColor(taskColor);
        }
      }
    } else {
      if (this.questTitleText && this.lastQuestTitle !== 'Chưa có nhiệm vụ mới') {
        this.lastQuestTitle = 'Chưa có nhiệm vụ mới';
        this.questTitleText.setText('Chưa có nhiệm vụ mới');
      }
      if (this.questTrackerText && this.lastQuestTaskText !== 'Tự do khám phá vùng Bellhollow...') {
        this.lastQuestTaskText = 'Tự do khám phá vùng Bellhollow...';
        this.questTrackerText.setText('Tự do khám phá vùng Bellhollow...');
        this.questTrackerText.setColor('#ecf0f1');
      }
    }
  }

  public showZoneBanner(atmosphere: ZoneAtmosphere, force: boolean = false): void {
    const now = performance.now();
    if (!force && now - this.lastBannerShownTime < 4000 && this.lastBannerZoneTitle === atmosphere.titleVietnamese) {
      return;
    }
    this.lastBannerShownTime = now;
    this.lastBannerZoneTitle = atmosphere.titleVietnamese;

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

  public setInteractionPrompt(prompt: string | null, worldX?: number, worldY?: number, proximityAlpha: number = 1.0): void {
    if (this.isAnyModalOpen || !prompt) {
      if (this.lastPromptText !== null || (this.promptContainer && this.promptContainer.alpha > 0)) {
        this.promptWorldTarget = null;
        this.lastPromptText = null;
        this.lastPromptAlpha = 0;
        if (this.promptContainer) this.promptContainer.setAlpha(0);
        if (this.promptText) {
          this.promptText.setText('');
          this.promptText.setAlpha(0);
        }
      }
      return;
    }

    if (this.promptText && this.promptContainer && this.promptBg) {
      const clampedAlpha = Phaser.Math.Clamp(proximityAlpha, 0, 1);

      // C4-13-09: Dirty Checking - Chỉ setText và vẽ lại Graphics khi chuỗi prompt thay đổi
      if (this.lastPromptText !== prompt) {
        this.lastPromptText = prompt;
        this.promptText.setText(prompt);
        const textW = this.promptText.width;
        const textH = this.promptText.height;
        const padX = 14;
        const padY = 6;
        const pillW = textW + padX * 2;
        const pillH = textH + padY * 2;

        this.promptBg.clear();
        // Nền bán trong suốt tinh tế (alpha ~0.72) viền vàng hổ phách mảnh
        this.promptBg.fillStyle(0x090e15, 0.72);
        this.promptBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 6);
        this.promptBg.lineStyle(1, 0xd4af37, 0.65);
        this.promptBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 6);
      }

      // Chỉ cập nhật alpha khi có chênh lệch đáng kể tránh ghi đè liên tục
      if (Math.abs(this.lastPromptAlpha - clampedAlpha) > 0.015) {
        this.lastPromptAlpha = clampedAlpha;
        this.promptContainer.setAlpha(clampedAlpha);
        this.promptText.setAlpha(clampedAlpha);
      }

      if (worldX !== undefined && worldY !== undefined) {
        this.promptWorldTarget = { x: worldX, y: worldY };
        this.updatePromptPosition();
      } else {
        this.promptWorldTarget = null;
        this.promptContainer.setPosition(640, 616);
      }
    }
  }

  /**
   * Ẩn/Hiện thanh phím tắt, nhãn tương tác và HUD khi hộp thoại hoặc Modal mở/đóng (PASS T13, GATE 1B, C4-13-07)
   */
  public setDialogueActive(active: boolean): void {
    const shouldShowHUD = !active && !this.isAnyModalOpen;
    this.setHUDVisible(shouldShowHUD);
    if (this.quickSlotContainer) {
      this.quickSlotContainer.setVisible(shouldShowHUD);
    }
    if (active || this.isAnyModalOpen) {
      this.setInteractionPrompt(null);
      if (this.zoneBannerContainer) {
        this.zoneBannerContainer.setAlpha(0);
      }
    } else {
      this.redrawStats();
      this.updateQuestTracker();
      this.updateQuickSlotCounts();
    }
  }

  public get isDialogueActive(): boolean {
    return !!(this.dialogueContainer && this.dialogueContainer.visible);
  }

  public get isAnyModalOpen(): boolean {
    return this.isDialogueActive ||
      (!!this.craftingModal && this.craftingModal.isOpen) ||
      (!!this.journalModal && this.journalModal.isOpen) ||
      (!!this.pauseModal && this.pauseModal.isOpen) ||
      (!!this.gameOverModal && this.gameOverModal.isOpen);
  }

  /**
   * C4-13-03: Kích hoạt giao diện Game Over trên UIScene, ẩn toàn bộ prompt và đóng các modal khác
   */
  public showGameOverModal(reason?: string): void {
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    this.hideDialogue();
    this.handleModalOpened();
    this.setInteractionPrompt(null);
    if (this.gameOverModal) {
      this.gameOverModal.open(reason);
    }
  }

  public closeGameOverModal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) {
      this.gameOverModal.close();
    }
    this.handleModalClosed();
  }

  /**
   * Ẩn/Hiện toàn bộ các thành phần HUD (Stat card, Stat bars, Icons, Lantern status, Quest Tracker, Quickslots, Prompt)
   * Sử dụng khi mở Modal / Hộp thoại hoặc Cutscene để triệt tiêu đè chữ (C4-13-07)
   */
  public setHUDVisible(visible: boolean): void {
    if (this.statCardBg) this.statCardBg.setVisible(visible);
    if (this.playerNameText) this.playerNameText.setVisible(visible);
    if (this.statBarsGraphics) this.statBarsGraphics.setVisible(visible);
    if (this.statIconsGraphics) this.statIconsGraphics.setVisible(visible);
    for (const iconImg of this.statIconImages) {
      if (iconImg) iconImg.setVisible(visible);
    }
    if (this.healthValText) this.healthValText.setVisible(visible);
    if (this.staminaValText) this.staminaValText.setVisible(visible);
    if (this.oilValText) this.oilValText.setVisible(visible);
    if (this.composureValText) this.composureValText.setVisible(visible);
    if (this.lanternStatusBg) this.lanternStatusBg.setVisible(visible);
    if (this.lanternStatusText) this.lanternStatusText.setVisible(visible);
    if (this.questBg) this.questBg.setVisible(visible);
    if (this.questHeaderText) this.questHeaderText.setVisible(visible);
    if (this.questTitleText) this.questTitleText.setVisible(visible);
    if (this.questTrackerText) this.questTrackerText.setVisible(visible);
    if (this.quickSlotContainer) this.quickSlotContainer.setVisible(visible);
    if (this.promptContainer) this.promptContainer.setVisible(visible);
    if (this.promptText) this.promptText.setVisible(visible);
    if (this.zoneBannerContainer) this.zoneBannerContainer.setVisible(visible);
    if (this.activePopup) this.activePopup.setVisible(visible);
  }

  public handleModalOpened(): void {
    this.setHUDVisible(false);
    this.setDialogueActive(true);
  }

  public handleModalClosed(): void {
    if (!this.isAnyModalOpen) {
      this.setDialogueActive(false);
      this.setHUDVisible(true);
      this.redrawStats();
      this.updateQuestTracker();
      this.updateQuickSlotCounts();
      // C4-13-11: Luôn trả lại quyền điều khiển nhân vật sạch sẽ khi đóng bảng
      const gameScene = this.scene.get('GameScene') as any;
      if (gameScene && gameScene.player && typeof gameScene.player.resetAllInputState === 'function') {
        gameScene.player.resetAllInputState();
      }
    }
  }

  public toggleCrafting(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
    }
    const modal = this.getCraftingModal();
    modal.toggle();
  }

  public openCraftingBench(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
    }
    const modal = this.getCraftingModal();
    if (!modal.isOpen) {
      modal.open();
    }
  }

  public toggleJournal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
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

  public openWorldMap(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
    }
    const modal = this.getJournalModal();
    modal.openMap();
  }

  public togglePause(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
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

    // C4-13-09: Tái sử dụng Text pooled duy nhất thay vì cấp phát mới và hủy liên tục
    if (!this.pooledPopupText) {
      this.pooledPopupText = HDTextHelper.createText(this, 640, 140, '', {
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#2ecc71',
        backgroundColor: '#0b0e14ee',
        padding: { x: 16, y: 8 },
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5).setDepth(10000);
    }

    const popup = this.pooledPopupText;
    popup.setText(msg);
    popup.setPosition(640, 140);
    popup.setAlpha(1);
    popup.setVisible(true);

    this.activePopup = popup;

    this.activePopupTween = this.tweens.add({
      targets: popup,
      y: 110,
      alpha: 0,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => {
        popup.setVisible(false);
        if (this.activePopup === popup) {
          this.activePopup = undefined;
          this.activePopupTween = undefined;
        }
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

    // Tên người nói chuẩn HD Tiếng Việt (Cỡ 24px, dịch phải 18px & padding 12px chống cắt lẹm nét chữ C4-13-14)
    this.dialogueSpeakerText = HDTextHelper.createText(this, -halfW + 202, -halfH + 20, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    });

    // Nội dung câu thoại chuẩn HD Tiếng Việt (Cỡ đúng chuẩn 20px, dịch phải 18px, padding 12px, wrap 810 px)
    this.dialogueContentText = HDTextHelper.createText(this, -halfW + 202, -halfH + 60, '', {
      fontSize: '20px',
      color: '#f8f9fa',
      wordWrap: { width: boxWidth - 250 },
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 1,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
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
        else if (speaker.includes('Bram') || speaker.includes('Thợ Rèn') || speaker.includes('Blacksmith')) {
          key = this.textures.exists('portrait_blacksmith') ? 'portrait_blacksmith' : 'portrait_bram';
        }
        else if (speaker.includes('Finn')) key = 'portrait_finn';
        else if (this.textures.exists('wayfarer_portrait')) key = 'wayfarer_portrait';
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
